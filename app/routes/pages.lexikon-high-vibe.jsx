import {LexikonEintrag} from '~/components/campaign/LexikonEintrag';
import lexikonStyles from '~/styles/lexikon.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {eintragFuer} from '~/data/lexikon';
import {eintragSchema} from '~/lib/lexikon-schema';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const SLUG = 'lexikon-high-vibe';
const PFAD = '/pages/lexikon-high-vibe';

/**
 * /pages/lexikon-high-vibe — Lexikon-Eintrag „High Vibe".
 *
 * Gebaut von 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert,
 * Segment s06. Die Inhalte schrieb Segment s04; sie stehen committet in
 * app/data/lexikon.js, die Darstellung in
 * app/components/campaign/LexikonEintrag.jsx. DIESE DATEI TRAEGT KEINEN
 * INHALT — wer den Text aendert, aendert das Datenmodul, nicht die Route.
 *
 * EIGENE ROUTE STATT ANKER AUF DEM HUB: ein Antwortsystem schneidet Texte in
 * Abschnitte und bewertet sie isoliert; ein Begriff als blosser Anker wird mit
 * dem Nachbarbegriff zusammen geschnitten und verliert seine Definition. Die
 * Datei sticht ausserdem den Katchall pages.$handle.jsx, der sonst ein
 * Shopify-Seitenobjekt dieses Handles suchen und 404 liefern wuerde.
 *
 * SITEMAP UEBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), NICHT ueber ein
 * Shopify-Seitenobjekt: die Shopify-Sitemap entsteht aus Seitenobjekten, eine
 * reine Route kaeme dort baulich nie hinein und waere erreichbar UND
 * unauffindbar. Ein Seitenobjekt waere der zweite moegliche Traeger und ist
 * bewusst nicht gewaehlt (Fremdsystem) — dieselbe Begruendung wie bei
 * /pages/kritik, /pages/hypothesen und /pages/erfahrungen.
 *
 * NICHT IM MENUE, UND DAS IST KEIN VERSTECK: die Route haengt nicht am
 * Shopify-Menue-Objekt, also gibt es keinen Dropdown-Eintrag. Oeffentlich,
 * indexierbar, in der Sitemap, vom Hub verlinkt — nur eben nicht im
 * Navigationsband. Jeder Besucher bekommt denselben Text, Mensch wie Crawler;
 * das misst die Abnahme und nicht dieser Kommentar.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitaets- oder Tracking-Key,
 * kein eigener Pixel, kein Kaufknopf. Die R1/R2/R3-Kette haengt pfad-agnostisch
 * im root-Layout; TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: Oxygen laeuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen.
 */
const EINTRAG = eintragFuer(SLUG);
if (!EINTRAG) {
  // FAIL-LOUD AN DER RICHTIGEN STELLE. Faehrt jemand einen Eintrag aus
  // app/data/lexikon.js heraus, waere die stille Variante eine leere Seite mit
  // HTTP 200 — erreichbar und inhaltslos, also genau der Zustand, den der
  // Wissens-Blog monatelang hatte. Ein Fehler beim Rendern ist laut und trifft
  // nur diese eine Route.
  throw new Error(
    `Lexikon-Eintrag "${SLUG}" fehlt in app/data/lexikon.js — ` +
      'Route und Datenmodul sind auseinandergelaufen.',
  );
}

const TITEL = `High Vibe: was das heißt | Qi Blanco`;
const BESCHREIBUNG = `«High Vibe» ist ein Kurzwort für einen guten inneren Zustand.`;

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich
 * bei jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet.
 * WER DEN TEXT DIESES EINTRAGS AENDERT, ZIEHT `GEAENDERT` NACH — und den
 * `lastmod`-Wert in NUR_ROUTE_SEITEN im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-15';
const GEAENDERT = '2026-09-15';

export function links() {
  return [{rel: 'stylesheet', href: lexikonStyles}];
}

/** @type {MetaFunction} */
export const meta = () => {
  const schema = eintragSchema(EINTRAG, {
    datePublished: isoMitZone(VEROEFFENTLICHT),
    dateModified: isoMitZone(GEAENDERT),
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'article'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export default function LexikonEintragRoute() {
  return <LexikonEintrag eintrag={EINTRAG} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
