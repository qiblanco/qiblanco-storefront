import {ProduktberatungSeite} from '~/components/campaign/ProduktberatungSeite';
import produktberatungStyles from '~/styles/produktberatung.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {ORG_ID} from '~/lib/entity-schema';
import {buyerIpAusRequest} from '~/lib/interner-verkehr';

const PFAD = '/pages/produktberatung';

/**
 * /pages/produktberatung — 20 Minuten Produktberatung mit Christian per Zoom.
 *
 * Gebaut vom Grossjob 20260928-GROSSJOB-produktberatung-live-mit-christian-
 * buchen, Segment s02 (Christian 28.09.2026: „Seite konzipieren, bauen und live
 * schalten und mergen", Konzept produktberatung/konzept/KONZEPT.md, Abschnitt 5).
 *
 * DER KALENDER IST NICHT HIER. Die Termine, die Sperre gegen Doppelbuchung, das
 * Zoom-Meeting und die Mails leben im Buchungs-Endpunkt auf unserem Server
 * (shared-state/produktberatung, Vertrag im Kopf von src/server.py). Diese
 * Route ist nur die Tür: der Loader liest die freien Termine, die Action reicht
 * Buchen, Absagen und Umbuchen durch. Anna und das Dashboard buchen über
 * denselben Endpunkt; einen zweiten Kalender gibt es nicht.
 *
 * FUNKTIONIERT OHNE JAVASCRIPT: Termine und Formular kommen serverseitig, das
 * Formular ist ein normaler POST. JavaScript ergänzt nur die Zeitzone der
 * Kundin (verstecktes Feld + „bei dir …"-Zeit).
 *
 * FÄLLT DER ENDPUNKT AUS, RENDERT DIE SEITE TROTZDEM — mit dem Satz, dass die
 * Termine gerade nicht laden, und der Service-Adresse. Kein 500.
 *
 * SICHTBARKEIT (Christian: „live, aber nicht per …" = nicht verlinkt):
 *   (1) CANONICAL statt noindex — `canonicalLink()`.
 *   (2) ROBOTS — kein Disallow für diesen Pfad.
 *   (3) SITEMAP über `NUR_ROUTE_SEITEN` (app/lib/seo.js), kein Seitenobjekt.
 *   (4) NICHT im Menü, NICHT auf der Startseite. Der Einstieg kommt später
 *       (Startseiten-Entwurf s03, Anna s04).
 * Die Verwalten-Ansicht (?b=<token>) trägt noindex: sie ist persönlich.
 *
 * AD-WEICHE: der Pfad steht in AUSSCHLUSS_SEGMENTE (app/lib/ad-weiche.server.js),
 * damit ein bezahlter Klick nicht auf eine Kaufseite umgeleitet wird.
 *
 * TRACKING-NAHT: kein Cookie, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel. TRACKING_COOKIE_NAMES bleibt unangetastet. Die Kunden-IP geht
 * nur als X-PB-Kunde-IP an den eigenen Endpunkt (Mengen-Deckel je Kundin statt
 * je Oxygen-Knoten), nirgendwo sonst hin.
 *
 * TESTUMGEBUNG: die Env-Variable PRODUKTBERATUNG_API lenkt Loader und Action
 * auf einen Wegwerf-Endpunkt um (lokaler Dev-Server). Ohne sie gilt der
 * Live-Endpunkt. Auf Oxygen ist sie nicht gesetzt.
 *
 * WACHE: produktberatung/pruefungen/probe_seite_zeigt_termine.py — misst am
 * Live-Rand, dass jeder freie Termin des Endpunkts im SSR-HTML steht.
 */
export const ENDPUNKT = 'https://termin.65-108-150-121.sslip.io';

function basis(context) {
  const env = context?.env?.PRODUKTBERATUNG_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

function signal(ms) {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

const NICHT_ERREICHBAR =
  'Das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.';

async function holeJson(url, init, ms) {
  try {
    const res = await fetch(url, {...init, signal: signal(ms)});
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return {status: res.status, body};
  } catch {
    return {status: 0, body: null};
  }
}

export function links() {
  return [{rel: 'stylesheet', href: produktberatungStyles}];
}

/** Persönliche Daten und frische Termine: nie in einem Zwischenspeicher. */
export const headers = () => ({'Cache-Control': 'private, no-store'});

export async function loader({request, context}) {
  const url = new URL(request.url);
  const token = (url.searchParams.get('b') || '').trim();
  const vorwahl = (url.searchParams.get('termin') || '').trim();
  const api = basis(context);
  const jetzt = new Date().toISOString();

  if (token) {
    const r = await holeJson(
      `${api}/api/buchung?t=${encodeURIComponent(token)}`,
      {headers: {Accept: 'application/json'}},
      4000,
    );
    if (r.status === 200 && r.body?.ok) {
      return {
        jetzt,
        token,
        vorwahl,
        buchung: r.body.buchung,
        termine: r.body.termine || [],
        buchungMoeglich: Boolean(r.body.buchung_moeglich),
        ladeFehler: false,
      };
    }
    return {
      jetzt,
      token,
      vorwahl,
      buchung: null,
      verwaltenFehler:
        r.body?.text ||
        (r.status === 0
          ? 'Dein Termin lädt gerade nicht. Bitte versuch es gleich noch einmal oder schreib uns an service@qiblanco.com.'
          : 'Diesen Link kennen wir nicht. Schreib uns gern an service@qiblanco.com.'),
      termine: [],
      buchungMoeglich: false,
      ladeFehler: r.status === 0,
    };
  }

  const r = await holeJson(`${api}/api/termine`, {headers: {Accept: 'application/json'}}, 4000);
  if (r.status === 200 && Array.isArray(r.body?.termine)) {
    return {
      jetzt,
      token: '',
      vorwahl,
      buchung: null,
      termine: r.body.termine,
      buchungMoeglich: Boolean(r.body.buchung_moeglich),
      ladeFehler: false,
    };
  }
  return {jetzt, token: '', vorwahl, buchung: null, termine: [], buchungMoeglich: false, ladeFehler: true};
}

const FELDER = ['name', 'email', 'telefon', 'produkt', 'anliegen'];

export async function action({request, context}) {
  const form = await request.formData();
  const intent = String(form.get('intent') || '');
  const api = basis(context);
  const kopf = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-PB-Kunde-IP': buyerIpAusRequest(request),
  };
  const post = (pfad, body) =>
    holeJson(`${api}${pfad}`, {method: 'POST', headers: kopf, body: JSON.stringify(body)}, 15000);

  if (intent === 'buchen') {
    const eingabe = Object.fromEntries(FELDER.map((k) => [k, String(form.get(k) || '').slice(0, 2000)]));
    const slot = String(form.get('slot_start') || '');
    if (!slot) {
      return {intent, ok: false, text: 'Wähl bitte zuerst einen Termin.', eingabe, slot};
    }
    const r = await post('/api/buchen', {
      ...eingabe,
      slot_start: slot,
      tz: String(form.get('tz') || '').slice(0, 64),
      website: String(form.get('website') || ''),
      quelle: 'seite',
    });
    if (r.status === 200 && r.body?.ok && r.body.buchung) {
      return {intent, ok: true, buchung: r.body.buchung, token: r.body.t || ''};
    }
    if (r.status === 200 && r.body?.ok) {
      // Honigtopf: der Endpunkt bucht nicht und sagt nichts. Die Seite auch nicht.
      return {intent, ok: true, buchung: null, token: ''};
    }
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR, code: r.body?.code || '', eingabe, slot};
  }

  const t = String(form.get('t') || '');
  if (intent === 'absagen') {
    const r = await post('/api/absagen', {t});
    if (r.status === 200 && r.body?.ok) return {intent, ok: true, buchung: r.body.buchung};
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR};
  }
  if (intent === 'umbuchen') {
    const slot = String(form.get('slot_start') || '');
    if (!slot) return {intent, ok: false, text: 'Wähl bitte zuerst einen neuen Termin.'};
    const r = await post('/api/umbuchen', {t, slot_start: slot});
    if (r.status === 200 && r.body?.ok) {
      return {intent, ok: true, buchung: r.body.buchung, token: r.body.t || ''};
    }
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR};
  }
  return {intent, ok: false, text: NICHT_ERREICHBAR};
}

/**
 * DER TITEL TRÄGT DEN SUCHBEGRIFF „Produktberatung" (Christian: „Google-Search-
 * Bar"), dazu das, was die Kundin bekommt: 20 Minuten mit Christian.
 */
const TITEL = 'Produktberatung: 20 Minuten mit Christian per Zoom | Qi Blanco';
const BESCHREIBUNG =
  'Kostenlose Produktberatung mit Christian von Qi Blanco: 20 Minuten live per Zoom. Termin wählen, buchen, Fragen zu QiOne® 2 Pro, QiBracelet, QiHome Air und Qi Master klären.';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({location}) => {
  const persoenlich = new URLSearchParams(location?.search || '').has('b');
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...(persoenlich ? [{name: 'robots', content: 'noindex, nofollow'}] : []),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
  ];
};

function serviceJsonLd() {
  const url = absoluteCanonical(PFAD);
  const knoten = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: 'Produktberatung mit Christian',
    serviceType: 'Produktberatung',
    description:
      '20 Minuten Produktberatung per Zoom mit Christian von Qi Blanco, kostenlos, Termin online buchbar.',
    url,
    provider: {'@type': 'Organization', '@id': ORG_ID, name: MARKE},
    areaServed: [
      {'@type': 'Country', name: 'DE'},
      {'@type': 'Country', name: 'AT'},
      {'@type': 'Country', name: 'CH'},
    ],
    availableLanguage: 'de',
    offers: {'@type': 'Offer', price: '0', priceCurrency: 'EUR', url},
  };
  return JSON.stringify(knoten).replace(/</g, '\\u003c');
}

export default function ProduktberatungRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: serviceJsonLd()}} />
      <ProduktberatungSeite />
    </>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
