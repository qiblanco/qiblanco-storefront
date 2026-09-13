import {data} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, useNavigation} from 'react-router';
import {noindexMeta, noindexHeader} from '~/lib/seo';
import {
  WITHDRAWAL_HONEYPOT_FIELD,
  getWithdrawalProductLabel,
  validateWithdrawalFormData,
} from '~/lib/withdrawal';

const TITEL = 'Widerruf bestätigen | Qi Blanco';
const BESCHREIBUNG = 'Bestätigungsseite für den Online-Widerruf bei Qi Blanco.';

/**
 * DIESE SEITE GEHÖRT NICHT IN DEN INDEX — die Frage, die der Vorgängerjob
 * ausdrücklich offen gelassen hat, ist hier entschieden (Job 20260913-
 * auffindbarkeits-wache-dach-rest-og-h1-und-die-noindex-frage-prio30).
 *
 * ENTSCHIEDEN WURDE AN EINER MESSUNG, NICHT AN EINER MEINUNG. Ein GET auf
 * diese URL liefert live den Satz „Bitte fülle zuerst das Widerrufsformular
 * aus. Danach kannst du den Widerruf hier bestätigen." Die Seite ist ein
 * reines POST-Ziel; wer sie aus einem Suchergebnis betritt, bekommt keine
 * Antwort auf seine Suche, sondern eine Sackgasse mit Rückverweis. Genau
 * diesen Fall nennt das Aufnahme-Kriterium in app/lib/seo.js wörtlich:
 * „Funnel-Bestätigungsseiten sind der Grenzfall, der trotzdem hierher
 * gehört: Kunden SEHEN sie (nach dem Absenden eines Formulars), aber niemand
 * SUCHT nach ihnen — sie sind Ziel eines Klicks, nie eines Treffers."
 *
 * DER CANONICAL IST WEG, UND ZWAR ZWINGEND: noindex und canonical sind
 * widersprüchliche Signale (Regel im Kopf von app/lib/seo.js). Ein Bot, der
 * einem Canonical folgt, kann das noindex der Zielseite zuordnen. Deshalb
 * steht hier ab jetzt das eine und nicht mehr das andere.
 *
 * DIE AUSZEICHNUNG DES VORGÄNGERJOBS WIRD DAMIT GEGENSTANDSLOS, NICHT
 * FALSCH: `seitenSignale()` hing hier, um eine indexierbare Seite nicht halb
 * ausgezeichnet zu lassen — die richtige Antwort, solange die Index-Frage
 * offen war. Mit der Entscheidung entfällt ihre Voraussetzung. Der Import
 * geht mit, und das ist der eigentliche Gewinn: die Import-Closure von
 * app/lib/seiten-seo.js schrumpft wieder auf die /pages-Routen, für die sie
 * gebaut ist. Der Warnsatz, den der Vorgängerjob hier hinterlassen hat
 * („wer seiten-seo.js ändert, braucht ab jetzt auch für diese Seite einen
 * gültigen Formate-Nachweis"), ist damit erledigt und fällt mit ihm weg.
 *
 * WARUM DIE LISTE NICHT_INDEXIERBARE_SEITEN_DEF NICHT DER ORT IST: sie wirkt,
 * weil GENAU EINE Route (pages.$handle.jsx) alle ihre Mitglieder rendert —
 * sie ist ein Verteiler. Eine Code-Route hat keinen Verteiler, sie ist ein
 * eigenes Blatt. Ein Pfad in jener Liste änderte hier nichts, solange diese
 * Datei die Liste nicht selbst liest; der nächste Funnel-Bestätiger bräuchte
 * so oder so seine eine Zeile in seiner eigenen Datei. Der Bestand löst es
 * genauso: pages.anmeldung-erfolgreich-pre-access.jsx ist ebenfalls eine
 * Code-Route und setzt ihr robots-meta route-lokal.
 *
 * KEIN SITEMAP-EINTRAG ZU ENTFERNEN, gemessen am 2026-09-13: diese URL steht
 * in keiner der fünf ausgelieferten Sitemaps. Der Zustand „noindex UND in der
 * Sitemap", vor dem app/lib/seo.js warnt und den
 * pruefungen/probe_sitemap_noindex_naht.py bewacht, entsteht hier nicht.
 *
 * WER SIE WIEDER ÖFFNET, geht den Weg rückwärts: noindexMeta/noindexHeader
 * raus, canonicalLink('/widerruf/bestaetigen') rein, und dann auch die Auszeichnung wieder dazu
 * — eine indexierbare Seite ohne og:image und ohne strukturierte Daten wäre
 * der halbe Zustand, den der Vorgängerjob zu Recht vermieden hat.
 *
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  noindexMeta(),
];

/**
 * Die zweite, vom HTML unabhängige Sperre desselben Signals („Gurt und
 * Hosenträger", Hausmuster D-006): sie greift auch bei einem Bot, der den
 * head nicht parst. Wortgleich zu search.jsx und pages.wirkt-das.jsx, weil
 * alle drei ihn aus `noindexHeader()` beziehen.
 */
export const headers = () => noindexHeader();

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
