import {FaqSeite} from '~/components/faq/FaqSeite';
import {FAQ_ALLE} from '~/data/faq-seite';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import faqStyles from '~/styles/faq.css?url';

const PFAD = '/pages/faq';

/**
 * /pages/faq — öffentliche FAQ der DACH-Storefront. Neu am 2026-09-02.
 *
 * ZWEI TRÄGER, UND BEIDE SIND PFLICHT — das ist der Punkt, an dem dieses
 * Segment hätte scheitern können, ohne es zu merken:
 *   diese Route            trägt Design, Inhalt und Token-CSS
 *   das Shopify-Page-Objekt
 *   mit Handle `faq`       trägt den SITEMAP-Eintrag
 * EINE HYDROGEN-ROUTE KOMMT NIE IN DIE SHOPIFY-SITEMAP. Die Liste entsteht in
 * sitemap.$type.$page[.xml].jsx über getSitemap() aus der SHOPIFY-Page-Liste
 * und kennt nur eine Ausschluss-, keine Aufnahme-Liste. Genau das ist am
 * 2026-08-15 an /pages/studie-qihome-air passiert: gemergt, Live-Abnahme
 * grün, HTTP 200, Canonical korrekt, verlinkt — und NICHT in
 * sitemap/pages/1.xml. Erreichbar und für Suchmaschinen praktisch unsichtbar.
 * KEIN Gate der Deploy-Kette prüft das. Die Abnahme-Probe dieses Segments
 * (proben/probe_faq_live_und_in_sitemap.py) hat deshalb ZWEI Beine: HTTP 200
 * UND Mitgliedschaft in der Sitemap.
 *
 * GEGENPROBE NACH DEM pageCreate, ebenfalls aus jenem Belegfall: ein neues
 * Page-Objekt kann die generische Route pages.$handle.jsx aktivieren, die dann
 * den kurzen Admin-Body STATT dieser Seite rendert. Die spezifische Route
 * sticht den Katchall — aber das ist nachzumessen, nicht anzunehmen. Der
 * Nachweis steht im RESULT des Segments (Marker `.faq-a1` im Live-HTML).
 *
 * CANONICAL UND KEIN noindex: diese Seite ist ausdrücklich zum Gefundenwerden
 * gebaut. Hausregel bleibt gewahrt — ENTWEDER noindex ODER canonical, nie
 * beides.
 *
 * DAS FAQPage-SCHEMA kommt aus app/lib/faq-schema.js (P10: die Fabrik
 * existiert, samt Deny-Netz). `buildFaqPageJsonLd` gibt `null` zurück, wenn
 * KEIN Item das Netz passiert — dann wird bewusst gar kein Schema emittiert
 * statt eines leeren. Ein stiller Verlust ist hier trotzdem der teure Fall:
 * fällt später ein Item still heraus, bleibt die Seite sichtbar und wird nur
 * für Google ärmer. test/faq-seite.test.mjs hält dagegen und verlangt, dass
 * JEDES Item im Schema landet.
 */
export function links() {
  return [{rel: 'stylesheet', href: faqStyles}];
}

const TITEL = 'Häufige Fragen zu Qi Blanco — ehrlich beantwortet';
const BESCHREIBUNG =
  'Größe, Wasser und Sauna, Reichweite, 20-Tage-Rückgabe, Ratenzahlung — und was ' +
  'wissenschaftlich belegt ist und was nicht. Die häufigsten Fragen an Qi Blanco, ' +
  'ohne Ausweichen beantwortet.';

/** @type {MetaFunction} */
export const meta = () => {
  const schema = buildFaqPageJsonLd(FAQ_ALLE, {inLanguage: 'de-DE'});
  return [
    {title: `${TITEL} | Qi Blanco`},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export function loader() {
  return {};
}

export default function FaqRoute() {
  return <FaqSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
