import {RedditTatsachenSeite} from '~/components/campaign/RedditTatsachenSeite';
import rdtStyles from '~/styles/reddit-tatsachen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {FRAGEN, ZAHL, zahlwort} from '~/data/reddit-tatsachen';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/was-auf-reddit-ueber-qi-blanco-steht';

/**
 * /pages/was-auf-reddit-ueber-qi-blanco-steht — INDEXIERBAR VON ANFANG AN.
 *
 * WARUM ES DIESE SEITE GIBT: zum Zweifelsbegriff „Qi Blanco Reddit" lag
 * unser Eigenanteil in Googles KI-Antwort am 2026-09-30 bei 2 von 42
 * Zitatzeilen (4,8 %), und der Begriff hatte als einer von zwei DACH-
 * Zweifelsbegriffen keine zuständige Seite (seo-manager/conf/keywords.yaml).
 * Zitiert wurden zwei Reddit-Fäden ohne eine einzige Antwort. Die Antwort
 * darauf ist eine Zählung mit Quelle und Stand (AI-CEO-Entscheid zu
 * forschungs-meister sollist-seo07-zitierwirkung-bewertende-reihe,
 * Job 20261001-s07vm-tatsachenseite-reddit).
 *
 * BAUFORM 1:1 WIE /pages/neu-oder-gebraucht (homepage-bauer devlog D-2622),
 * die vier Bedingungen der Sichtbarkeit in derselben Reihenfolge:
 *
 * (1) ROBOTS.TXT: `generalDisallowRules` in app/routes/[robots.txt].jsx führt
 *     für diesen Pfad keine Disallow-Zeile.
 * (2) CANONICAL statt noindex: `canonicalLink()` rendert ein echtes
 *     `<link rel="canonical">`.
 * (3) SITEMAP über `NUR_ROUTE_SEITEN` (app/lib/seo.js): reine Hydrogen-Route
 *     ohne Shopify-Seitenobjekt; ohne den Eintrag HTTP 200 und in keiner
 *     Sitemap.
 * (4) VERLINKT von einer indexierten Seite: die FAQ-Antwort „Was sagen andere
 *     Kunden über Qi Blanco" verweist hierher (app/data/faq-seite.js, Feld
 *     `auch`). /pages/faq stand am 2026-10-01 laut Search Console als
 *     „Gesendet und indexiert" im Index, die übrigen Zweifelsseiten nicht.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel, kein Kaufknopf. TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul
 * (app/data/reddit-tatsachen.js), weil Oxygen am Edge shared-state nicht
 * lesen kann. Die einzige bewegliche Größe, die Google-Bewertung, kommt aus
 * dem root-Loader.
 *
 * WACHE: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py --flaeche
 * reddit (Flächen-SSoT konzepte/abgrenzung-flaechen.json, status
 * live_indexiert): Inhalt per Rand-Marker, kein noindex, kein Disallow,
 * Canonical, Sitemap-<loc>, eingehender Link.
 */
export function links() {
  return [{rel: 'stylesheet', href: rdtStyles}];
}

// Die Zahlen im Titel kommen aus dem Datenmodul, nicht aus der Hand.
const versal = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const TITEL = `Qi Blanco auf Reddit: ${zahlwort(ZAHL.alle)} Fäden, einzeln nachgelesen | Qi Blanco`;
const BESCHREIBUNG =
  'Was auf Reddit über Qi Blanco steht: die Fäden, die Google zeigt, mit ' +
  `Datum und Quelle. ${versal(zahlwort(ZAHL.fremd))} handeln von etwas ` +
  'anderem, in keinem berichtet jemand vom eigenen Tragen.';

/**
 * SCHEMA-DATEN als Konstanten, keine Laufzeit-Uhr. WER DEN INHALT ÄNDERT,
 * ZIEHT `RDT_GEAENDERT` UND `STAND` IM DATENMODUL IM SELBEN COMMIT NACH.
 */
const RDT_VEROEFFENTLICHT = '2026-10-01';
const RDT_GEAENDERT = '2026-10-01';

/**
 * DAS FAQPage-SCHEMA WIRD AUS DEM SICHTBAREN TEXT GEBAUT: `FRAGEN` ist
 * dieselbe Liste, die die Komponente als „Kurz gefragt" ausgibt. Der stille
 * Verlust durch das Deny-Netz ist der teure Fall; test/reddit-tatsachen.
 * test.mjs hält dagegen, dass jede Frage durchkommt.
 */
/** @type {MetaFunction} */
export const meta = () => {
  const schema = buildFaqPageJsonLd(FRAGEN, {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
    datePublished: isoMitZone(RDT_VEROEFFENTLICHT),
    dateModified: isoMitZone(RDT_GEAENDERT),
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export default function RedditTatsachenRoute() {
  return <RedditTatsachenSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
