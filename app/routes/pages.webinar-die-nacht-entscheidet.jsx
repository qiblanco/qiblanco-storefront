import {useLoaderData} from 'react-router';
import {ANMELDE_ENDPUNKT} from '~/components/reusables/Anmeldeweiche';
import {NachtWebinarSeite} from '~/components/campaign/NachtWebinarSeite';
import {FORMULAR} from '~/components/campaign/nacht-webinar';
import nachtStyles from '~/styles/webinar-nacht.css?url';

/**
 * /pages/webinar-die-nacht-entscheidet — Anmeldeseite der eigenen Live-Serie
 * (Grossjob 20261023-webinar-lp-die-nacht-entscheidet-serie-1511, s03). Inhalt
 * und Quellen: components/campaign/NachtWebinarSeite.jsx.
 *
 * DER LOADER HOLT /w DES ANMELDE-ENDPUNKTS SERVERSEITIG, damit Termin und
 * Formular im ausgelieferten HTML stehen (Leser: webinar-manager/pruefungen/
 * probe_livegang_lp.py). Höchstens WARTE_MS; danach oder bei jedem Fehler
 * rendert die Seite ohne Termin („Den nächsten Termin geben wir in Kürze
 * bekannt.“) und ohne Formular, nie mit einem getippten Datum. Der Browser
 * holt /w danach noch einmal frisch.
 *
 * noindex im Meta-Tag UND im Kopf, kein canonical, keine Sitemap
 * (Kampagnenseite wie PR 838). ?angemeldet=bestaetigt ist die danke_url von
 * ac-eingang nach dem Klick in der Bestätigungsmail.
 */
const WARTE_MS = 1500;

export const links = () => [{rel: 'stylesheet', href: nachtStyles}];

const TITEL = 'Die Nacht entscheidet | Kostenloses Live-Webinar | Qi Blanco';
const BESCHREIBUNG =
  'Kostenloses Live-Webinar mit Christian von Qi Blanco. Was dein Körper nachts erneuert, was Funk ' +
  'damit zu tun haben kann und warum Wasser die Hauptrolle spielt. Live per Zoom, keine Aufzeichnung.';
const BILD = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845&width=1200';

export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  {name: 'robots', content: 'noindex,nofollow'},
  {property: 'og:type', content: 'website'},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:locale', content: 'de_DE'},
  {property: 'og:title', content: 'Die Nacht entscheidet'},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:image', content: BILD},
];

export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

/** /w mit Zeitdeckel. Rückgabe null bei Netzfehler, Zeitüberschreitung, kaputtem JSON. */
async function holeWegeServer(holer = fetch, ms = WARTE_MS) {
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(ms)
        : undefined;
    const r = await holer(`${ANMELDE_ENDPUNKT}/w`, {
      signal,
      headers: {Accept: 'application/json'},
      cf: {cacheTtl: 60, cacheEverything: true},
    });
    if (!r.ok) return null;
    const w = await r.json();
    return w && typeof w.formulare === 'object' && typeof w.anzeige === 'object' ? w : null;
  } catch {
    return null;
  }
}

export async function loader({request}) {
  const wege = await holeWegeServer();
  const bestaetigt = new URL(request.url).searchParams.get('angemeldet') === 'bestaetigt';
  return {
    anzeige: wege ? wege.anzeige[FORMULAR] || null : null,
    weg: wege ? String(wege.formulare[FORMULAR] || 'aus') : 'aus',
    stand: wege ? String(wege.stand || '') : '',
    bestaetigt,
  };
}

export default function WebinarDieNachtEntscheidet() {
  const daten = useLoaderData();
  return <NachtWebinarSeite daten={daten} />;
}
