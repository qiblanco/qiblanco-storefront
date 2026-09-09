/**
 * JSON-LD der Fachartikel unter /blogs/wissen (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie seo.js,
 * entity-schema.js und studien-schema.js).
 *
 * WARUM ES DIESE DATEI GIBT (gemessen 2026-09-09 am ausgelieferten HTML):
 * alle acht Artikel unter /blogs/wissen/ lieferten NULL
 * `<script type="application/ld+json">` — nicht "das falsche Schema",
 * sondern gar keins. Sie trugen damit weder Autor noch
 * Veröffentlichungsdatum als maschinenlesbares Signal, obwohl die Seite
 * beides sichtbar rendert. /pages/studien zeigt am selben Tag, dass es kein
 * Plattform-Zwang ist: dort steht ein Graph aus app/lib/studien-schema.js.
 * Die Fähigkeit war im Haus, sie war auf der Artikelroute nur nicht gezogen.
 *
 * TYPWAHL: `BlogPosting` statt `Article`. BlogPosting ist der Subtyp von
 * Article für einen Beitrag, der Teil eines Blogs ist — genau die Lage hier
 * (Shopify-Blog `wissen`). Der allgemeinere Typ wäre nicht falsch, nur
 * weniger genau; der speziellere ist es nur, solange die Seite wirklich ein
 * Blogbeitrag ist. `ScholarlyArticle` wäre hier FALSCH und ist bewusst nicht
 * gewählt: den Typ tragen in diesem Haus die peer-reviewten Arbeiten in
 * studien-schema.js. Ein Wissensbeitrag, der Forschung ERKLÄRT, ist keine
 * Publikation — der Typ wäre eine Behauptung über die Evidenzstufe, die der
 * Text nicht trägt.
 *
 * WAS HIER BEWUSST NICHT STEHT: `dateModified` und ein erfundener
 * `wordCount`. Die Storefront-API liefert zum Artikel kein Änderungsdatum,
 * und ein aus `publishedAt` abgeleitetes `dateModified` wäre kein Signal,
 * sondern eine Verdopplung. Fehlt ein Feld, entfaellt es — es wird nichts
 * geraten (Regel: keine erfundenen Angaben in maschinenlesbarem Markup, wo
 * ein Widerspruch zur sichtbaren Seite schlechter ist als eine Lücke).
 */

// Bewusst RELATIV und MIT `.js` — wie entity-schema.js und studien-schema.js
// und aus demselben Grund: den '~'-Alias loest nur Vite auf, `node --test`
// nicht. Der Import-Stil entscheidet hier darueber, ob dieses Modul aus einem
// Bordmittel-Test überhaupt ladbar ist.
import {absoluteCanonical} from './seo.js';
import {ORG_ID} from './entity-schema.js';

/**
 * BlogPosting-Graph EINES Fachartikels.
 *
 * @param {{pfad: string, artikel: object}} args
 *   pfad     Pfad der angefragten Seite (location.pathname)
 *   artikel  Artikel-Knoten aus ARTICLE_QUERY
 * @returns {object|null} JSON-LD-Objekt, oder null wenn die Pflichtangaben
 *   fehlen — dann steht lieber KEIN Block im Kopf als ein leerer.
 */
export function artikelSchema({pfad, artikel}) {
  // OHNE TITEL ODER DATUM KEIN OBJEKT. Beides sind die Angaben, wegen derer
  // dieser Block überhaupt gebaut wurde; ein BlogPosting ohne headline oder
  // ohne datePublished trägt genau das Signal nicht, das er tragen soll.
  if (!artikel?.title || !artikel?.publishedAt) return null;

  const url = absoluteCanonical(pfad);

  const beitrag = {
    '@type': 'BlogPosting',
    '@id': `${url}#artikel`,
    // DIE UEBERSCHRIFT DER SEITE, NICHT DER <title>-TAG. Sichtbar rendert die
    // Route `article.title` als <h1> (blogs.$blogHandle.$articleHandle.jsx);
    // `seo.title` ist der Suchergebnis-Titel und trägt zusaetzlich das
    // Marken-Suffix. headline soll die Überschrift des Textes nennen —
    // weicht sie von der sichtbaren <h1> ab, widerspricht das Markup der
    // Seite.
    headline: artikel.title,
    name: artikel.title,
    inLanguage: 'de',
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    datePublished: artikel.publishedAt,
    publisher: {'@id': ORG_ID},
  };

  // DIESELBE RANGFOLGE WIE IN blogMeta() (app/lib/blog-seo.js): gepflegtes
  // `seo.description` schlaegt den `excerpt`. Zwei verschiedene
  // Beschreibungen derselben Seite in <meta> und im Markup wären ein
  // Widerspruch, den wir selbst erzeugen.
  const beschreibung =
    artikel.seo?.description?.trim() || artikel.excerpt?.trim();
  if (beschreibung) beitrag.description = beschreibung;

  // AUTOR NUR, WENN SHOPIFY EINEN FÜHRT. Die Seite rendert ihn sichtbar aus
  // demselben Feld (`authorV2.name`); ein hier erfundener oder auf die Marke
  // zurückfallender Autor stuende im Widerspruch zu dem, was der Leser sieht.
  if (artikel.author?.name) {
    beitrag.author = {'@type': 'Person', name: artikel.author.name};
  }

  // BILD MIT MASSEN, WENN DIE API SIE MITLIEFERT. ARTICLE_QUERY holt width
  // und height ohnehin; fehlen sie, bleibt die schlichte URL stehen statt
  // einer erfundenen Größe.
  if (artikel.image?.url) {
    const bild = {'@type': 'ImageObject', url: artikel.image.url};
    if (artikel.image.width) bild.width = artikel.image.width;
    if (artikel.image.height) bild.height = artikel.image.height;
    if (artikel.image.altText) bild.caption = artikel.image.altText;
    beitrag.image = bild;
  }

  return {'@context': 'https://schema.org', '@graph': [beitrag]};
}
