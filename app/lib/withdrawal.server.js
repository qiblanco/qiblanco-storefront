import {
  buildServerTimestamp,
  getWithdrawalProductLabel,
  sanitizePlainText,
} from './withdrawal.js';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const memoryRateLimit = new Map();

export async function checkWithdrawalRateLimit(kv, ip) {
  const key = `withdrawal:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  if (kv) {
    const raw = await kv.get(key);
    const count = raw ? Number(raw) : 0;
    if (count >= RATE_LIMIT_MAX) return false;
    await kv.put(key, String(count + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });
    return true;
  }

  const entry = memoryRateLimit.get(key);
  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count += 1;
    return true;
  }

  memoryRateLimit.set(key, {
    count: 1,
    resetAt: now + RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

export async function submitWithdrawalToFreshdesk({env, values, ip, userAgent}) {
  const freshdeskApiKey = env.FRESHDESK_API_KEY;
  const freshdeskDomain = normalizeFreshdeskDomain(
    env.FRESHDESK_DOMAIN || 'qiblanco.freshdesk.com',
  );

  if (!freshdeskApiKey) {
    throw new WithdrawalSubmissionError(
      'missing_config',
      'Der Widerruf kann aktuell nicht automatisch verarbeitet werden. Bitte schreibe direkt an service@qiblanco.com.',
      503,
    );
  }

  const receivedAt = new Date();
  const timestamp = buildServerTimestamp(receivedAt);
  const authHeader = `Basic ${btoa(`${freshdeskApiKey}:X`)}`;
  const productLabel = getWithdrawalProductLabel(values.product);
  const subject = buildConfirmationSubject(values);
  const ticketDescription = buildTicketDescription({
    values,
    productLabel,
    timestamp,
    ip,
    userAgent,
  });

  const ticketPayload = {
    description: ticketDescription,
    email: values.email,
    name: values.name,
    priority: 1,
    source: 2,
    status: 2,
    subject,
    tags: ['storefront-withdrawal', 'widerruf'],
  };

  const configuredTicketType = sanitizePlainText(
    env.FRESHDESK_WITHDRAWAL_TICKET_TYPE || '',
    80,
  );
  if (configuredTicketType) {
    ticketPayload.type = configuredTicketType;
  }

  const customFields = buildFreshdeskCustomFields(env, {
    values,
    productLabel,
    timestamp,
  });
  if (Object.keys(customFields).length > 0) {
    ticketPayload.custom_fields = customFields;
  }

  const ticket = await postFreshdeskJson({
    domain: freshdeskDomain,
    path: '/api/v2/tickets',
    authHeader,
    payload: ticketPayload,
    errorCode: 'ticket_failed',
  });

  await postFreshdeskJson({
    domain: freshdeskDomain,
    path: `/api/v2/tickets/${ticket.id}/reply`,
    authHeader,
    payload: buildReplyPayload(
      env,
      buildConfirmationBody({
        values,
        productLabel,
        ticketId: ticket.id,
        timestamp,
      }),
    ),
    errorCode: 'confirmation_failed',
  });

  await addFreshdeskAuditNote({
    domain: freshdeskDomain,
    ticketId: ticket.id,
    authHeader,
    body: buildAuditNote({values, productLabel, timestamp, ip, userAgent}),
  });

  await recordWithdrawalAudit(env, {
    ticketId: ticket.id,
    orderNumber: values.orderNumber,
    email: values.email,
    product: productLabel,
    receivedAtIso: timestamp.iso,
    receivedAtDisplay: timestamp.display,
  });

  return {
    ticketId: ticket.id,
    receivedAtDisplay: timestamp.display,
    receivedAtIso: timestamp.iso,
  };
}

export class WithdrawalSubmissionError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = 'WithdrawalSubmissionError';
    this.code = code;
    this.status = status;
  }
}

function buildReplyPayload(env, body) {
  const payload = {body};
  const fromEmail = sanitizePlainText(
    env.FRESHDESK_WITHDRAWAL_FROM_EMAIL || 'info@qiblanco.com',
    254,
  );
  if (fromEmail) {
    payload.from_email = fromEmail;
  }
  return payload;
}

async function postFreshdeskJson({
  domain,
  path,
  authHeader,
  payload,
  errorCode,
}) {
  let response;
  try {
    response = await fetch(`https://${domain}${path}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Freshdesk request error', error);
    throw new WithdrawalSubmissionError(
      errorCode,
      'Der Widerruf konnte nicht an Freshdesk übermittelt werden. Bitte versuche es später erneut.',
      502,
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error('Freshdesk request failed', response.status, detail);
    throw new WithdrawalSubmissionError(
      errorCode,
      'Der Widerruf konnte nicht an Freshdesk übermittelt werden. Bitte versuche es später erneut.',
      502,
    );
  }

  if (response.status === 204) return {};
  return response.json();
}

async function addFreshdeskAuditNote({domain, ticketId, authHeader, body}) {
  try {
    await postFreshdeskJson({
      domain,
      path: `/api/v2/tickets/${ticketId}/notes`,
      authHeader,
      payload: {body, private: true},
      errorCode: 'audit_note_failed',
    });
  } catch (error) {
    console.error('Freshdesk audit note failed', error);
  }
}

async function recordWithdrawalAudit(env, auditEntry) {
  if (!env.WITHDRAWAL_AUDIT_LOG) return;

  try {
    const id = `withdrawal:${auditEntry.receivedAtIso}:${crypto.randomUUID()}`;
    await env.WITHDRAWAL_AUDIT_LOG.put(id, JSON.stringify(auditEntry));
  } catch (error) {
    console.error('Withdrawal audit log failed', error);
  }
}

function buildFreshdeskCustomFields(env, {values, productLabel, timestamp}) {
  return Object.fromEntries(
    [
      [env.FRESHDESK_WITHDRAWAL_FIELD_ORDER_NUMBER, values.orderNumber],
      [env.FRESHDESK_WITHDRAWAL_FIELD_PRODUCT, productLabel],
      [env.FRESHDESK_WITHDRAWAL_FIELD_EMAIL, values.email],
      [env.FRESHDESK_WITHDRAWAL_FIELD_RECEIVED_AT, timestamp.iso],
    ].filter(
      ([key, value]) =>
        typeof key === 'string' && key.trim().length > 0 && Boolean(value),
    ),
  );
}

function buildConfirmationSubject(values) {
  return `Eingangsbestätigung Ihres Widerrufs – Bestellung ${values.orderNumber}`;
}

function buildTicketDescription({values, productLabel, timestamp, ip, userAgent}) {
  return [
    '<p><strong>Widerruf über qiblanco.com eingegangen.</strong></p>',
    '<table>',
    row('Eingang', `${timestamp.display} (${timestamp.iso})`),
    row('Bestellnummer', values.orderNumber),
    row('Name', values.name),
    row('E-Mail', values.email),
    row('Produkt / Vertrag', productLabel),
    row('Quelle', 'qiblanco.com/widerruf'),
    row('IP', ip),
    row('User Agent', userAgent || 'Nicht verfügbar'),
    '</table>',
    '<p>Der Kunde hat den Widerruf in Schritt 2 ausdrücklich bestätigt.</p>',
  ].join('');
}

function buildConfirmationBody({values, productLabel, ticketId, timestamp}) {
  const firstName = getFirstName(values.name);

  return [
    `<p>Hallo${firstName ? ` ${escapeHtml(firstName)}` : ''},</p>`,
    '<p>vielen Dank für deine Nachricht. Wir bestätigen hiermit den Eingang deines Widerrufs.</p>',
    '<table>',
    row('Eingang', timestamp.display),
    row('Bestellnummer', values.orderNumber),
    row('Widerrufsinhalt', productLabel),
    row('Referenz', `Freshdesk Ticket #${ticketId}`),
    '</table>',
    '<p><strong>So geht es weiter:</strong></p>',
    '<ol>',
    '<li>Wir prüfen deinen Widerruf und melden uns innerhalb von 1-2 Werktagen mit den Rücksendeinformationen.</li>',
    '<li>Bitte sende die Ware innerhalb von 14 Tagen nach Erhalt unserer Rücksendeanweisung an uns zurück. Anweisungen hierzu erhältst du separat.</li>',
    '<li>Nach Eingang der Ware erstatten wir dir den Kaufpreis gemäß den gesetzlichen Vorgaben.</li>',
    '</ol>',
    '<p>Bei Fragen erreichst du uns jederzeit unter:<br>',
    '<a href="mailto:service@qiblanco.com">service@qiblanco.com</a><br>',
    '<a href="https://www.qiblanco.com/">www.qiblanco.com</a></p>',
    '<p>Viele Grüße<br>Dein Qi Blanco Team</p>',
    '<hr>',
    '<p><strong>Technischer Zeitstempel (für deine Unterlagen):</strong><br>',
    `${escapeHtml(timestamp.iso)}</p>`,
    '<hr>',
    '<p>Qi Blanco UG (haftungsbeschränkt)<br>',
    'Geschäftsführer: Christian Bernd Bauer<br>',
    'Brunnrangenstr. 25<br>',
    '97711 Maßbach<br>',
    'Deutschland</p>',
    '<table>',
    row('Registergericht', 'Amtsgericht Schweinfurt'),
    row('Registernummer', 'HRB 7306'),
    row('USt-IdNr.', 'DE306530406'),
    row('E-Mail', 'info@qiblanco.com'),
    row('Tel', '09735-5819883'),
    '</table>',
    '<p>Diese E-Mail dient als Eingangsbestätigung deines Widerrufs gemäß § 356a Abs. 4 BGB.</p>',
  ].join('');
}

function buildAuditNote({values, productLabel, timestamp, ip, userAgent}) {
  return [
    '<p><strong>Audit-Log Widerruf</strong></p>',
    '<table>',
    row('Serverzeit', `${timestamp.display} (${timestamp.iso})`),
    row('Bestellnummer', values.orderNumber),
    row('Name', values.name),
    row('E-Mail', values.email),
    row('Produkt / Vertrag', productLabel),
    row('IP', ip),
    row('User Agent', userAgent || 'Nicht verfügbar'),
    '</table>',
  ].join('');
}

function getFirstName(name) {
  return sanitizePlainText(name, 120).split(/\s+/).filter(Boolean)[0] || '';
}

function row(label, value) {
  return `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(
    value,
  )}</td></tr>`;
}

function normalizeFreshdeskDomain(rawDomain) {
  return rawDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
