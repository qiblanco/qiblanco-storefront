import {redirect} from 'react-router';
import {ProduktberatungSeite} from '~/components/campaign/ProduktberatungSeite';
import produktberatungStyles from '~/styles/produktberatung.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {ORG_ID} from '~/lib/entity-schema';
import {buyerIpAusRequest} from '~/lib/interner-verkehr';
import {
  verwaltenAdresse,
  verwaltenCookie,
  verwaltenToken,
} from '~/lib/produktberatung-verwalten.server';

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
 * UMBAU 2026-10-01 (Job 20261001-bau-beratungsseite-gestaltung-und-text-in-
 * christians-stimme): Gestaltung und Text leben in
 * app/components/campaign/ProduktberatungSeite.jsx und styles/produktberatung.css;
 * Loader, Action und Feldnamen dieser Route sind unverändert.
 * Nachtrag PR 2: der Kopf ist einspaltig, damit das Chat-Fenster unten rechts
 * Christians Worte nicht verdeckt. Nachtrag 02.10. (lebensfroh, s02): zwischen
 * 768 und 1139 px ist Christians Karte schmaler als 100vw minus Chat-Breite
 * (produktberatung.css, --pb-chat-frei), sonst lag das Fenster bei 1024 px auf
 * seinem Text.
 *
 * FUNKTIONIERT OHNE JAVASCRIPT: Termine und Formular kommen serverseitig, das
 * Formular ist ein normaler POST. JavaScript ergänzt nur die Zeitzone der
 * Kundin (verstecktes Feld + Termine in ihrer Ortszeit, Christian 08.10.) und
 * das Abdaten im Browser.
 *
 * ABDATEN IM BROWSER (Grossjob 20261002-…-lebensfroh, s02; Christian 02.10.:
 * „sind die 8 h für den Donnerstag um, zeigt die Seite automatisch den nächsten
 * Donnerstag"): der Loader reicht `buchungsschluss_min` aus der Antwort des
 * Endpunkts durch (nie eine feste Zahl hier). Die Komponente blendet damit jeden
 * Termin aus, dessen Beginn minus Buchungsschluss erreicht ist, und holt beim
 * Zurückkehren in den Tab frische Termine (revalidate). Das SSR-HTML bleibt die
 * Quelle der Wahrheit: der Endpunkt liefert ohnehin nur buchbare Termine.
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
 * Die Verwalten-Ansicht (?verwalten=1) trägt noindex: sie ist persönlich.
 *
 * DER VERWALTEN-TOKEN STEHT IN KEINER ADRESSE, DIE EIN SKRIPT LESEN KANN (Job
 * 20261008-produktberatung-verwalten-token-aus-der-url-vor-den-trackern, offene
 * Flanke #24 B). Der Mail-Link lautet weiter ?b=<token>. Der Loader nimmt den
 * Token heraus, legt ihn in den Cookie `pb_verwalten` (HttpOnly, Path=/pages,
 * ein Tag) und leitet mit 303 auf ?verwalten=1 um. Die Seite mit ?b= wird nie
 * gerendert, also liest kein Tracker, kein Chat-iframe und kein Referer sie.
 * Gemessen vorher: mit Einwilligung 36 Tracker-Anfragen mit Token (GA4, Meta,
 * TikTok, Bing, Clarity, Taboola, Shopify), ohne Einwilligung Shopify-Monorail
 * und das Chat-iframe, Letzteres noch vor der Hydration. Deshalb kein
 * replaceState im Browser: das käme zu spät und verlöre den Token bei der
 * Revalidierung nach der Cookie-Wahl. Absagen, Umbuchen und die Kalenderdatei
 * lesen den Token aus dem Cookie; er steht weder im HTML noch in den
 * Hydrationsdaten. Buchen und Umbuchen setzen den Cookie selbst und leiten auf
 * ?verwalten=1&status=… weiter. Ohne Cookie (abgelaufen, anderes Gerät) sagt die
 * Seite, dass der Link aus der Mail neu zu öffnen ist.
 * Wache: produktberatung/pruefungen/probe_token_nicht_in_trackern.py.
 *
 * AD-WEICHE: der Pfad steht in AUSSCHLUSS_SEGMENTE (app/lib/ad-weiche.server.js),
 * damit ein bezahlter Klick nicht auf eine Kaufseite umgeleitet wird.
 *
 * TRACKING-NAHT: kein Tracking-Cookie, kein neuer Identitäts- oder
 * Tracking-Key, kein eigener Pixel. Der einzige Cookie ist `pb_verwalten`
 * (oben): HttpOnly, nur für unseren Server lesbar, trägt keine Person über
 * Seiten hinweg und geht an keinen Tracker. TRACKING_COOKIE_NAMES bleibt unangetastet. Die Kunden-IP geht
 * nur als X-PB-Kunde-IP an den eigenen Endpunkt (Mengen-Deckel je Kundin statt
 * je Oxygen-Knoten), nirgendwo sonst hin.
 *
 * QUELLE AUS DEM LINK (Job 20261007-ep-beratungstermin-im-warenkorb-abbruch,
 * s02): die Warenkorb-Mail verlinkt /pages/produktberatung?von=warenkorb-mail.
 * Der Loader liest `von` gegen die Allowlist QUELLEN_AUS_LINK, die Komponente
 * trägt den Wert als verstecktes Feld im Buchen-Formular, die Action schickt ihn
 * als `quelle` an /api/buchen. Ohne oder mit unbekanntem `von` bleibt es
 * 'seite'. Nie freie Weitergabe: der Endpunkt prüft zusätzlich selbst
 * (produktberatung/src/server.py). Umbuchen und Absagen bleiben unberührt.
 * Zweiter Wert ig-stichwort-call: Link aus dem Instagram-Stichwort-Weg (Job
 * 20261007-anna-kommentar-stichwort-call-donnerstag, s03). Ein neuer Wert
 * gehört immer an beide Stellen, sonst bucht er still als 'seite'.
 *
 * TESTUMGEBUNG: die Env-Variable PRODUKTBERATUNG_API lenkt Loader und Action
 * auf einen Wegwerf-Endpunkt um (lokaler Dev-Server). Ohne sie gilt der
 * Live-Endpunkt. Auf Oxygen ist sie nicht gesetzt.
 *
 * WACHE: produktberatung/pruefungen/probe_seite_zeigt_termine.py — misst am
 * Live-Rand, dass jeder freie Termin des Endpunkts im SSR-HTML steht.
 */
export const ENDPUNKT = 'https://termin.65-108-150-121.sslip.io';

export function basis(context) {
  const env = context?.env?.PRODUKTBERATUNG_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

function signal(ms) {
  return typeof AbortSignal !== 'undefined' &&
    typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

/** Quellen, die ein Link über ?von= setzen darf; alles andere bucht als 'seite'. */
const QUELLEN_AUS_LINK = ['warenkorb-mail', 'ig-stichwort-call'];

function quelleAusLink(wert) {
  const v = String(wert || '').trim();
  return QUELLEN_AUS_LINK.includes(v) ? v : '';
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

/** Buchungsschluss in Minuten, wie ihn der Endpunkt meldet; fehlt er oder ist er unbrauchbar: null (dann kein Abdaten). */
function schlussMin(body) {
  const n = Number(body?.buchungsschluss_min);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function links() {
  return [{rel: 'stylesheet', href: produktberatungStyles}];
}

/** Persönliche Daten und frische Termine: nie in einem Zwischenspeicher. */
export const headers = () => ({'Cache-Control': 'private, no-store'});

/** Weiter in die Verwalten-Ansicht: der Token reist im Cookie, die Adresse bleibt ohne ihn. */
function zurVerwaltung(token, status) {
  return redirect(verwaltenAdresse(status), {
    status: 303,
    headers: {
      'Set-Cookie': verwaltenCookie(token),
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  const ausLink = (url.searchParams.get('b') || '').trim();
  if (ausLink) {
    const s = (url.searchParams.get('status') || '').trim();
    return zurVerwaltung(
      ausLink,
      ['gebucht', 'umgebucht'].includes(s) ? s : '',
    );
  }
  const verwalten = url.searchParams.has('verwalten');
  const token = verwalten ? verwaltenToken(request) : '';
  const vorwahl = (url.searchParams.get('termin') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const von = quelleAusLink(url.searchParams.get('von'));
  const api = basis(context);
  const jetzt = new Date().toISOString();

  if (verwalten && !token) {
    return {
      jetzt,
      verwalten: true,
      vorwahl,
      von,
      status,
      api,
      buchung: null,
      verwaltenFehler:
        'Öffne bitte den Link aus deiner Bestätigungsmail noch einmal, dann siehst du deinen Termin.',
      termine: [],
      buchungMoeglich: false,
      ladeFehler: false,
    };
  }

  if (token) {
    const r = await holeJson(
      `${api}/api/buchung?t=${encodeURIComponent(token)}`,
      {headers: {Accept: 'application/json'}},
      4000,
    );
    if (r.status === 200 && r.body?.ok) {
      return {
        jetzt,
        verwalten: true,
        vorwahl,
        von,
        status,
        api,
        buchung: r.body.buchung,
        termine: r.body.termine || [],
        buchungMoeglich: Boolean(r.body.buchung_moeglich),
        buchungsschlussMin: schlussMin(r.body),
        ladeFehler: false,
      };
    }
    return {
      jetzt,
      verwalten: true,
      vorwahl,
      von,
      status,
      api,
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

  const r = await holeJson(
    `${api}/api/termine`,
    {headers: {Accept: 'application/json'}},
    4000,
  );
  if (r.status === 200 && Array.isArray(r.body?.termine)) {
    return {
      jetzt,
      verwalten: false,
      vorwahl,
      von,
      status,
      api,
      buchung: null,
      termine: r.body.termine,
      buchungMoeglich: Boolean(r.body.buchung_moeglich),
      buchungsschlussMin: schlussMin(r.body),
      ladeFehler: false,
    };
  }
  return {
    jetzt,
    verwalten: false,
    vorwahl,
    von,
    status,
    api,
    buchung: null,
    termine: [],
    buchungMoeglich: false,
    ladeFehler: true,
  };
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
    holeJson(
      `${api}${pfad}`,
      {method: 'POST', headers: kopf, body: JSON.stringify(body)},
      15000,
    );

  if (intent === 'buchen') {
    const eingabe = Object.fromEntries(
      FELDER.map((k) => [k, String(form.get(k) || '').slice(0, 2000)]),
    );
    const slot = String(form.get('slot_start') || '');
    if (!slot) {
      return {
        intent,
        ok: false,
        text: 'Wähl bitte zuerst einen Termin.',
        eingabe,
        slot,
      };
    }
    const r = await post('/api/buchen', {
      ...eingabe,
      slot_start: slot,
      tz: String(form.get('tz') || '').slice(0, 64),
      website: String(form.get('website') || ''),
      // Verstecktes Feld zuerst; ohne es (alter Tab vor dem Deploy) die URL des POST, der ?von= behält.
      quelle:
        quelleAusLink(form.get('von')) ||
        quelleAusLink(new URL(request.url).searchParams.get('von')) ||
        'seite',
    });
    if (r.status === 200 && r.body?.ok && r.body.buchung) {
      // POST -> REDIRECT -> GET: die Bestaetigung lebt unter ?verwalten=1, der Token im Cookie. Neuladen schickt
      // die Buchung so nie ein zweites Mal ab (ohne JavaScript), und die Angaben gehen beim Neuladen nicht verloren.
      if (r.body.t) return zurVerwaltung(r.body.t, 'gebucht');
      return {intent, ok: true, buchung: r.body.buchung, token: ''};
    }
    if (r.status === 200 && r.body?.ok) {
      // Honigtopf: der Endpunkt bucht nicht und sagt nichts. Die Seite auch nicht.
      return {intent, ok: true, buchung: null, token: ''};
    }
    return {
      intent,
      ok: false,
      text: r.body?.text || NICHT_ERREICHBAR,
      code: r.body?.code || '',
      eingabe,
      slot,
    };
  }

  // Der Token kommt aus dem Cookie; das Formularfeld t trägt nur noch ein Tab, der vor dem Umbau geöffnet wurde.
  const t = verwaltenToken(request) || String(form.get('t') || '');
  if (intent === 'absagen') {
    const r = await post('/api/absagen', {t});
    if (r.status === 200 && r.body?.ok)
      return {intent, ok: true, buchung: r.body.buchung};
    return {intent, ok: false, text: r.body?.text || NICHT_ERREICHBAR};
  }
  if (intent === 'umbuchen') {
    const slot = String(form.get('slot_start') || '');
    if (!slot)
      return {intent, ok: false, text: 'Wähl bitte zuerst einen neuen Termin.'};
    const r = await post('/api/umbuchen', {t, slot_start: slot});
    if (r.status === 200 && r.body?.ok) {
      // Das alte Token zeigt danach auf eine stornierte Buchung: weiter auf das NEUE.
      if (r.body.t) return zurVerwaltung(r.body.t, 'umgebucht');
      return {intent, ok: true, buchung: r.body.buchung, token: ''};
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
  const such = new URLSearchParams(location?.search || '');
  const persoenlich = such.has('verwalten') || such.has('b');
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: serviceJsonLd()}}
      />
      <ProduktberatungSeite />
    </>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
