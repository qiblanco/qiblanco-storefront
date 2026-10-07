import {BewertungenSeite} from '~/components/campaign/BewertungenSeite';
import bewertungenStyles from '~/styles/bewertungen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';

const PFAD = '/pages/bewertungen';

/**
 * /pages/bewertungen — der Landeplatz für „Qi Blanco Bewertungen".
 *
 * Gebaut vom Grossjob 20260921-GROSSJOB-die-bewertenden-markenbegriffe-
 * gehoeren-uns, Segment s04 (Christian-Auftrag: die bewertenden Markenbegriffe
 * gehören uns — für jeden Sitelink ein Landeplatz). „Qi Blanco Bewertungen" war
 * am 2026-09-21 der einzige der vier Pflichtbegriffe ohne einen eigenen
 * organischen Treffer (seo.db, 0 von 10) und ohne Seite: dieser Pfad gab 404.
 *
 * DIESE DATEI TRÄGT KEINEN INHALT. Text: app/data/bewertungen-seite.js;
 * Darstellung: app/components/campaign/BewertungenSeite.jsx; die Bewertungen
 * selbst: der Standard-Baustein app/components/reusables/Bewertungsblock.jsx,
 * gespeist aus dem root-Loader (Reputon-Feed des Google-Unternehmensprofils).
 * Kein eigener Loader — Oxygen läuft am Edge und kann shared-state zur
 * Laufzeit nicht lesen; dieselbe Bauform wie /pages/kritik.
 *
 * INDEXIERBAR VON ANFANG AN, und zwar in allen vier Richtungen zugleich
 * (Hausregel: eine Seite, die indexierbar aussieht und unauffindbar ist, ist
 * der nächste Befund):
 *   (1) CANONICAL statt noindex — `canonicalLink()` rendert ein echtes
 *       <link rel="canonical">; ein {rel:'canonical'} ohne tagName ergäbe
 *       <meta rel="canonical"> und wäre wirkungslos (Befund L11).
 *   (2) ROBOTS — kein Disallow in [robots.txt].jsx für diesen Pfad.
 *   (3) SITEMAP über `NUR_ROUTE_SEITEN` (app/lib/seo.js), NICHT über ein
 *       Shopify-Seitenobjekt: das wäre der zweite Träger für dieselbe Seite
 *       (dieselbe Begründung wie /pages/kritik, /pages/neu-oder-gebraucht).
 *   (4) VERLINKT von einer indexierten Seite: die FAQ-Antwort zu den
 *       Bewertungen verweist hierher (app/data/faq-seite.js, Feld `weiter`).
 *       Der Menü-Eintrag ist ein Shopify-Admin-Schreibvorgang und kein Teil
 *       dieses Baus; die Verlinkung hängt nicht daran.
 *
 * SITELINK-NAHT: die Ad-Weiche (app/lib/ad-weiche.server.js) leitet jeden
 * bezahlten Klick auf die Kaufseite um, sofern der Pfad nicht in
 * AUSSCHLUSS_SEGMENTE steht. Dieser Pfad steht dort — sonst landete der
 * Sucher von „Qi Blanco Bewertungen" auf einem Kaufversprechen, genau der Fall
 * der fünf Kritik-Ziele vor PR #541. Gemessen wird das am Rand (Arm H der
 * Wache), nicht am Quelltext.
 *
 * KEIN AggregateRating-KNOTEN HIER: die Zufriedenheits-Auszeichnung der
 * Organisation kommt aus app/lib/zufriedenheit-schema.js über das Widget
 * selbst. Ein zweiter Knoten wäre eine zweite Wahrheit für dieselbe Zahl.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel, kein Kaufknopf. Die R1/R2/R3-Kette hängt pfad-agnostisch im
 * root-Layout; TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * WACHE: homepage-bauer/pruefungen/probe_bewertungen_hell.py — misst am
 * Live-Rand INHALT (Rand-Marker, Feed-Region mit Karten, Badge mit Note), die
 * vier Sichtbarkeits-Richtungen und die Sitelink-Naht (gclid -> 200).
 */
export function links() {
  return [{rel: 'stylesheet', href: bewertungenStyles}];
}

/**
 * DER TITEL TRÄGT DEN SUCHBEGRIFF und stellt die Frage, die der Suchende hat.
 * Keine Zahl im Titel: Note und Anzahl leben im Widget und würden hier still
 * veralten.
 */
const TITEL = 'Qi Blanco Bewertungen – was Kundinnen und Kunden schreiben | Qi Blanco';
const BESCHREIBUNG =
  'Echte Google-Bewertungen zu Qi Blanco, live mit Note und Anzahl: woher sie kommen, was sie zeigen, was nicht – und wie du es 20 Tage selbst prüfst.';

/**
 * DER EINZIGE LOADER-WERT DIESER SEITE IST DER TAG DER AUSLIEFERUNG (2026-09-25,
 * Grossjob 20260925-GROSSJOB-seo-geo-bewertung-und-kritik-auf-platz-1-bis-3-
 * und-ki-zitat, s03). Er ist das „Stand" im Note-Satz (BewertungenSeite.jsx).
 * Note und Anzahl kommen NICHT von hier, sondern aus useGoogleRating() — der
 * Variablen, aus der auch das Widget zeichnet.
 *
 * WARUM SERVERSEITIG UND NICHT `new Date()` IN DER KOMPONENTE: die Komponente
 * rendert zweimal (Server, dann Hydrierung im Browser). Zwei Uhren ergäben um
 * Mitternacht zwei verschiedene Texte und einen Hydrierungsfehler. Der Loader
 * läuft einmal, sein Wert reist mit den Seitendaten.
 *
 * WAS „STAND" HIER BEDEUTET, ehrlich: der Tag, an dem die Seite ausgeliefert
 * wurde. Der Wert daneben ist dabei höchstens sechs Stunden alt (CACHE_TTL_S in
 * app/lib/googleRating.js). Das Abrufdatum selbst führt googleRating.js nicht;
 * es dort nachzurüsten hätte den root-Loader und damit jede Seite berührt.
 */
export async function loader() {
  return {ausgeliefert: new Date().toISOString()};
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  ...teilbildTags(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {property: 'og:site_name', content: MARKE},
];

export default function BewertungenRoute() {
  return <BewertungenSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
