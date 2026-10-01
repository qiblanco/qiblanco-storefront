import {TrustpilotTatsachenSeite} from '~/components/campaign/TrustpilotTatsachenSeite';
import tptStyles from '~/styles/trustpilot-tatsachen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {FRAGEN, PROFIL, ZAHL} from '~/data/trustpilot-tatsachen';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/qi-blanco-auf-trustpilot';

/**
 * /pages/qi-blanco-auf-trustpilot — INDEXIERBAR VON ANFANG AN.
 *
 * WARUM ES DIESE SEITE GIBT: zum Zweifelsbegriff „Qi Blanco Trustpilot" lag
 * unser Eigenanteil in Googles KI-Antwort am 2026-09-30 bei 5 von 58
 * Zitatzeilen (8,6 %), und der Begriff hatte als einer von zwei DACH-
 * Zweifelsbegriffen keine zuständige Seite (seo-manager/conf/keywords.yaml).
 * Die Antwort darauf ist eine Nachlese des Profils mit Quelle und Stand
 * (AI-CEO-Entscheid zu forschungs-meister sollist-seo07-zitierwirkung-
 * bewertende-reihe, Job 20261001-s07vm-tatsachenseite-trustpilot).
 *
 * BAUFORM 1:1 WIE /pages/was-auf-reddit-ueber-qi-blanco-steht und
 * /pages/neu-oder-gebraucht (homepage-bauer devlog D-2622), die vier
 * Bedingungen der Sichtbarkeit in derselben Reihenfolge:
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
 *     `auch`, zweiter Eintrag der Liste).
 *
 * DAS PROFIL IST NICHT UNSERES: Trustpilot führt es als „nicht beansprucht",
 * und das bleibt so (stehende Entscheidung, ruf-manager/konzepte/
 * KONZEPTPLAN.md Kapitel 9). Die Seite verlinkt es als Quelle mit nofollow
 * und behauptet keine Zugehörigkeit; deshalb steht es auch NICHT in
 * MARKEN_PROFILE (app/lib/entity-schema.js).
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel, kein Kaufknopf. TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul
 * (app/data/trustpilot-tatsachen.js), weil Oxygen am Edge shared-state nicht
 * lesen kann und trustpilot.com dem Server mit 403 antwortet. Die einzige
 * bewegliche Größe, die Google-Bewertung, kommt aus dem root-Loader.
 *
 * WACHEN: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py --flaeche
 * trustpilot (Rand-Marker, kein noindex, Canonical, Sitemap-<loc>,
 * eingehender Link) und seo-manager/pruefungen/
 * probe_trustpilot_stand_auf_der_seite.py (TrustScore der Seite gegen den,
 * den Google neben dem Profil zeigt).
 */
export function links() {
  return [{rel: 'stylesheet', href: tptStyles}];
}

// Die Zahlen in Titel und Beschreibung kommen aus dem Datenmodul.
const TITEL = `Qi Blanco auf Trustpilot: ${ZAHL.alle} Bewertungen, nachgelesen | Qi Blanco`;
const BESCHREIBUNG =
  `Was auf Trustpilot über Qi Blanco steht: ${ZAHL.alle} Bewertungen, ` +
  `TrustScore ${PROFIL.trustscore} von 5, alle ohne Einladung geschrieben. ` +
  'Mit Quelle und Stand, und wo du mehr Stimmen liest.';

/**
 * SCHEMA-DATEN als Konstanten, keine Laufzeit-Uhr. WER DEN INHALT ÄNDERT,
 * ZIEHT `TPT_GEAENDERT` UND `STAND` IM DATENMODUL IM SELBEN COMMIT NACH.
 */
const TPT_VEROEFFENTLICHT = '2026-10-01';
const TPT_GEAENDERT = '2026-10-01';

/**
 * DAS FAQPage-SCHEMA WIRD AUS DEM SICHTBAREN TEXT GEBAUT: `FRAGEN` ist
 * dieselbe Liste, die die Komponente als „Kurz gefragt" ausgibt. Der stille
 * Verlust durch das Deny-Netz ist der teure Fall; test/trustpilot-tatsachen.
 * test.mjs hält dagegen, dass jede Frage durchkommt.
 */
/** @type {MetaFunction} */
export const meta = () => {
  const schema = buildFaqPageJsonLd(FRAGEN, {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
    datePublished: isoMitZone(TPT_VEROEFFENTLICHT),
    dateModified: isoMitZone(TPT_GEAENDERT),
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

export default function TrustpilotTatsachenRoute() {
  return <TrustpilotTatsachenSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
