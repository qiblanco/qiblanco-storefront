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
  const subject = `Widerruf Bestellung ${values.orderNumber}`;
  const ticketDescription = buildTicketDescription({
    values,
    productLabel,
    timestamp,
    ip,
    userAgent,
  });
  const confirmationBody = buildConfirmationBody({
    values,
    productLabel,
    timestamp,
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
    payload: buildReplyPayload(env, confirmationBody),
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
    env.FRESHDESK_WITHDRAWAL_FROM_EMAIL || '',
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

function buildConfirmationBody({values, productLabel, timestamp}) {
  return [
    '<p>Hallo,</p>',
    '<p>wir bestätigen den Eingang deines Widerrufs.</p>',
    '<table>',
    row('Eingang', `${timestamp.display} (${timestamp.iso})`),
    row('Bestellnummer', values.orderNumber),
    row('Widerrufsinhalt', productLabel),
    '</table>',
    '<p>Wir bearbeiten deinen Widerruf nun über unseren Kundenservice.</p>',
    '<p>Viele Grüße<br>Dein Qi Blanco Team</p>',
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
