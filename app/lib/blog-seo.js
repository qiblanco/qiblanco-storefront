/**
 * Meta-Signale der Blog-/Magazin-Routen (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 L7, am 2026-08-14 live
 * nachgemessen): die drei Blog-Routen trugen unveränderte Titel aus dem
 * Hydrogen-Scaffold —
 *     /blogs        ->  "Hydrogen | Blogs"
 *     /blogs/news   ->  "Hydrogen | News blog"
 *     Artikel       ->  "Hydrogen | <Titel> article"
 * Das ist der Name des Frameworks im Suchergebnis einer Marke, und bei der
 * Artikelroute zusätzlich eine Sprachmischung. Keine der drei trug einen
 * Canonical oder eine description.
 *
 * WARUM NEBEN app/lib/seo.js: dieselbe Begründung wie bei produkt-seo.js —
 * seo.js wird u.a. von pages.support importiert, das einen etablierten
 * Formate-Beleg-Ordner hat; eine Änderung dort zöge über Gate 12 fremde
 * Seiten in die Prüfmenge. CANONICAL_ORIGIN wird GELESEN, nicht kopiert.
 *
 * ZUR BESCHREIBUNG: für die Übersicht steht hier ein gepflegter Text, für
 * Blog und Artikel kommt sie ausschließlich aus dem, was Shopify unter
 * `seo.description` wirklich pflegt. Fehlt sie dort, wird KEINE gerendert.
 * Ein generisch erfundener Fülltext stünde sonst wortgleich unter jedem
 * Artikel und wäre für eine Suchmaschine schlechter als gar keiner.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node — sonst wäre diese Datei nicht hermetisch testbar.
import {absoluteCanonical} from './seo.js';

/** Marken-Suffix — identisch zu den Produktrouten, damit die Marke im
 * Suchergebnis nicht je Bereich anders heißt. Die Rechtsform ist hier am
 * 2026-08-15 entfallen (Begründung an MARKE in produkt-seo.js: 24 Zeichen
 * ohne Suchwert, und "Qi Blanco" ist die Schreibweise von Organization-Schema
 * und Wikidata Q141070656). Bewusst als eigene Konstante und NICHT als Import
 * aus produkt-seo.js: das koppelte die Blog- an die Produkt-Import-Closure. */
export const MARKEN_SUFFIX = 'Qi Blanco';

/**
 * meta-Descriptoren einer Blog-Route.
 *
 * @param {{pfad: string, titel?: string, beschreibung?: string,
 *          bildUrl?: string, typ?: string}} args
 * @returns {Array<object>}
 */
export function blogMeta({pfad, titel, beschreibung, bildUrl, typ}) {
  const voll = titel ? `${titel} | ${MARKEN_SUFFIX}` : MARKEN_SUFFIX;
  const url = absoluteCanonical(pfad);
  const descriptoren = [
    {title: voll},
    // Canonical als echtes <link> und absolut — Begründung im Kopf von
    // app/lib/seo.js. Ohne tagName rendert react-router ein wirkungsloses
    // <meta rel="canonical">.
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:type', content: typ === 'article' ? 'article' : 'website'},
    {property: 'og:site_name', content: 'Qi Blanco'},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: voll},
    {property: 'og:url', content: url},
  ];
  if (beschreibung) {
    descriptoren.splice(1, 0, {name: 'description', content: beschreibung});
    descriptoren.push({property: 'og:description', content: beschreibung});
  }
  if (bildUrl) {
    descriptoren.push({property: 'og:image', content: bildUrl});
    // TWITTER-KARTE IN DERSELBEN BEDINGUNG WIE DAS BILD, und aus demselben
    // Grund wie in produkt-seo.js und products.$handle.jsx (2026-09-05):
    // `summary_large_image` sagt ein großes Bild ZU — ohne og:image wäre
    // das eine Zusage ohne Deckung. Deshalb hier drin und nicht daneben.
    //
    // WARUM DAS NACHGEZOGEN WURDE (2026-09-06): der Restposten-Bau vom
    // 2026-09-05 hat die Karte auf Startseite und Produktseiten gebracht und
    // die Blog-Familie ausgelassen — begründet mit „/blogs/wissen trägt
    // og:title, aber kein og:image". Das stimmt für die UEBERSICHT und war
    // für die ARTIKEL falsch: alle sieben tragen ein og:image (live gemessen
    // 2026-09-06, probe_dach_restposten_live.py), also genau die Bedingung,
    // unter der die Karte gesetzt gehört. Die Regel galt schon, ihre
    // Reichweite nicht.
    descriptoren.push({name: 'twitter:card', content: 'summary_large_image'});
  }
  return descriptoren;
}
