import {data} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, useNavigation} from 'react-router';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {
  WITHDRAWAL_HONEYPOT_FIELD,
  getWithdrawalProductLabel,
  validateWithdrawalFormData,
} from '~/lib/withdrawal';

const PFAD = '/widerruf/bestaetigen';
const TITEL = 'Widerruf bestätigen | Qi Blanco';
const BESCHREIBUNG = 'Bestätigungsseite für den Online-Widerruf bei Qi Blanco.';

/**
 * Teilbild und strukturierte Daten (Job 20260912-sieben-indexierbare-seiten-
 * ohne-sitemap-und-ohne-auszeichnung-prio22). Der Canonical stand schon hier.
 *
 * OFFENE FRAGE, DIE DIESER JOB BEWUSST NICHT ENTSCHEIDET: diese Seite ist eine
 * Formular-Bestaetigung, also nach dem Aufnahme-Kriterium in app/lib/seo.js
 * ("Klickziel, kein Suchziel") ein Kandidat für `noindex` -- dort stehen
 * bereits fünf `*-anmeldung-erfolgreich`-Handles mit genau dieser Begründung.
 * Der Unterschied ist, dass jene Shopify-Handles sind und diese eine eigene
 * Code-Route ist, die der Katchall nie erreicht. Die Entscheidung ist eine
 * Index-Hygiene-Frage mit Sitemap-Seite und gehört nicht in einen Auftrag
 * über Auszeichnung; sie ist als eigener Befund gemeldet. Solange die Seite
 * indexierbar ist und einen Canonical trägt, ist die Auszeichnung die
 * konsistente Antwort -- eine halb ausgezeichnete indexierbare Seite wäre in
 * keiner der beiden Welten richtig. *
 * DIESE ROUTE LIEGT AB HIER IN DER IMPORT-CLOSURE VON app/lib/seiten-seo.js.
 * Der Kopf jener Datei sagt, sie werde "ausschließlich von den /pages-Routen"
 * importiert -- das gilt seit diesem Commit nicht mehr, und das ist keine
 * Nebenbemerkung: hb-deploy Gate 12 loest eine geaenderte geteilte Datei über
 * ihre Import-Closure auf. Wer seiten-seo.js aendert, braucht ab jetzt auch
 * für diese Seite einen gueltigen Formate-Nachweis. Der Satz dort wird bewusst
 * NICHT nachgezogen: eine Kommentar-Aenderung an seiten-seo.js zieht ihrerseits
 * alle 31 /pages-Routen in dieselbe Prüfung, also genau den Preis, vor dem der
 * Satz warnt. Der Hinweis steht deshalb hier, beim neuen Importeur.
 */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  ...seitenSignale({pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG}),
];

export function loader() {
  return {};
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({phase: 'error', error: 'Methode nicht erlaubt.'}, {status: 405});
  }

  const env = context.env || {};
  const formData = await request.formData();
  const intent = String(formData.get('intent') || 'review');
  const parsed = validateWithdrawalFormData(formData);

  if (parsed.spam) {
    return data({phase: 'success', ok: true});
  }

  if (!parsed.ok) {
    return data(
      {
        phase: 'input-error',
        error: 'Bitte prüfe deine Angaben und versuche es erneut.',
        errors: parsed.errors,
      },
      {status: 400},
    );
  }

  if (intent !== 'submit') {
    return data({phase: 'confirm', values: parsed.values});
  }

  const {
    checkWithdrawalRateLimit,
    submitWithdrawalToFreshdesk,
    WithdrawalSubmissionError,
  } = await import('~/lib/withdrawal.server');

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'unknown';

  const allowed = await checkWithdrawalRateLimit(env.CONTACT_RATE_LIMIT, ip);
  if (!allowed) {
    return data(
      {
        phase: 'confirm',
        values: parsed.values,
        error: 'Zu viele Anfragen. Bitte versuche es später erneut.',
      },
      {status: 429},
    );
  }

  try {
    const result = await submitWithdrawalToFreshdesk({
      env,
      values: parsed.values,
      ip,
      userAgent: request.headers.get('User-Agent') || '',
    });

    return data({
      phase: 'success',
      ok: true,
      values: parsed.values,
      ticketId: result.ticketId,
      receivedAtDisplay: result.receivedAtDisplay,
      receivedAtIso: result.receivedAtIso,
    });
  } catch (error) {
    console.error('Withdrawal submission failed', error);
    const status =
      error instanceof WithdrawalSubmissionError ? error.status : 502;
    return data(
      {
        phase: 'confirm',
        values: parsed.values,
        error:
          error instanceof WithdrawalSubmissionError
            ? error.message
            : 'Der Widerruf konnte nicht verarbeitet werden. Bitte versuche es später erneut.',
      },
      {status},
    );
  }
}

export default function WithdrawalConfirmPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';

  if (!actionData) {
    return (
      <main className="withdrawal-page">
        <section className="withdrawal-panel">
          <h1>Widerruf bestätigen</h1>
          <p>
            Bitte fülle zuerst das Widerrufsformular aus. Danach kannst du den
            Widerruf hier verbindlich bestätigen.
          </p>
          <Link className="withdrawal-button withdrawal-button--secondary" to="/widerruf">
            Zum Formular
          </Link>
        </section>
      </main>
    );
  }

  if (actionData.phase === 'success') {
    return <SuccessState data={actionData} />;
  }

  if (actionData.phase === 'input-error') {
    return (
      <main className="withdrawal-page">
        <section className="withdrawal-panel">
          <h1>Angaben prüfen</h1>
          <Alert message={actionData.error} />
          {actionData.errors ? (
            <ul className="withdrawal-error-list">
              {Object.entries(actionData.errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          ) : null}
          <Link className="withdrawal-button withdrawal-button--secondary" to="/widerruf">
            Zurück zum Formular
          </Link>
        </section>
      </main>
    );
  }

  const values = actionData.values;
  const productLabel = getWithdrawalProductLabel(values.product);

  return (
    <main className="withdrawal-page">
      <section className="withdrawal-panel" aria-labelledby="confirm-title">
        <p className="withdrawal-kicker">Schritt 2 von 2</p>
        <h1 id="confirm-title">Widerruf bestätigen</h1>
        <p>
          Bitte prüfe deine Angaben. Mit dem nächsten Klick sendest du den
          Widerruf verbindlich ab.
        </p>

        {actionData.error ? <Alert message={actionData.error} /> : null}

        <dl className="withdrawal-summary">
          <div>
            <dt>Bestellnummer</dt>
            <dd>{values.orderNumber}</dd>
          </div>
          <div>
            <dt>Name</dt>
            <dd>{values.name}</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>{values.email}</dd>
          </div>
          <div>
            <dt>Produkt / Vertrag</dt>
            <dd>{productLabel}</dd>
          </div>
        </dl>

        <Form className="withdrawal-actions" method="post" noValidate>
          <input name="intent" type="hidden" value="submit" />
          <input name="orderNumber" type="hidden" value={values.orderNumber} />
          <input name="name" type="hidden" value={values.name} />
          <input name="email" type="hidden" value={values.email} />
          <input name="product" type="hidden" value={values.product} />
          <input
            aria-hidden="true"
            autoComplete="off"
            className="withdrawal-honeypot"
            name={WITHDRAWAL_HONEYPOT_FIELD}
            tabIndex={-1}
            type="text"
          />

          <button
            className="withdrawal-button"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Wird gesendet...' : 'Widerruf bestätigen'}
          </button>
          <Link className="withdrawal-text-link" to="/widerruf">
            Angaben ändern
          </Link>
        </Form>
      </section>
    </main>
  );
}

function SuccessState({data}) {
  const productLabel = data.values
    ? getWithdrawalProductLabel(data.values.product)
    : null;

  return (
    <main className="withdrawal-page">
      <section className="withdrawal-panel withdrawal-panel--success">
        <p className="withdrawal-kicker">Eingang bestätigt</p>
        <h1>Dein Widerruf ist eingegangen</h1>
        <p>
          Wir haben deinen Widerruf erhalten und dir eine Eingangsbestätigung
          per E-Mail gesendet.
        </p>

        <dl className="withdrawal-summary">
          {data.receivedAtDisplay ? (
            <div>
              <dt>Eingang</dt>
              <dd>{data.receivedAtDisplay}</dd>
            </div>
          ) : null}
          {data.values?.orderNumber ? (
            <div>
              <dt>Bestellnummer</dt>
              <dd>{data.values.orderNumber}</dd>
            </div>
          ) : null}
          {productLabel ? (
            <div>
              <dt>Widerrufsinhalt</dt>
              <dd>{productLabel}</dd>
            </div>
          ) : null}
          {data.ticketId ? (
            <div>
              <dt>Referenz</dt>
              <dd>Freshdesk Ticket #{data.ticketId}</dd>
            </div>
          ) : null}
        </dl>

        <Link className="withdrawal-button withdrawal-button--secondary" to="/">
          Zur Startseite
        </Link>
      </section>
    </main>
  );
}

function Alert({message}) {
  return (
    <div className="withdrawal-alert" role="alert">
      {message}
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
