/**
 * Bestands-Abfragen, die BEIDE Sitemap-Routen brauchen.
 *
 * WARUM DIESE DATEI EXISTIERT (2026-09-12, Job 20260912-sitemap-index-ohne-
 * lastmod-…): bis dahin standen diese Abfragen ausschließlich in
 * `sitemap.$type.$page[.xml].jsx`. Seit der Sitemap-INDEX ein `<lastmod>` je
 * Kind-Sitemap ausgibt, muss er dieselbe Menge kennen wie das Kind — sonst
 * nennt er ein Datum aus einem Eintrag, den das Kind gar nicht ausliefert.
 * Eine zweite Kopie der Abfrage wäre genau die Drift, gegen die `~/lib/seo`
 * gebaut ist; deshalb EINE Definition, zwei Leser.
 *
 * Der Inhalt ist unveraendert aus der Kind-Route hierher gezogen (gleiche
 * Abfragen, gleiche Fail-open-Entscheidungen, gleiche Begruendungen).
 */
import {BLOG_BESTAND_FRAGMENT, leereHandles} from '~/lib/blog-bestand';
import {
  ARTIKEL_PFAD_FRAGMENT,
  artikelBlogKarte,
  artikelKarteUnvollstaendig,
} from '~/lib/blog-artikel-pfad';

/**
 * Marke für einen Artikel ohne bekannten Blog.
 *
 * `getLink` ist synchron und kann keinen Eintrag ueberspringen — es MUSS eine
 * Zeichenkette liefern. Der so markierte `<url>`-Block wird in der Kind-Route
 * entfernt. Die Marke trägt bewusst ein Zeichen, das in keinem Shopify-Handle
 * vorkommen kann, damit sie nie einen echten Pfad trifft.
 */
export const OHNE_BLOG = '#kein-blog-bekannt';

/**
 * lädt die Handles der Blogs OHNE Artikel.
 *
 * Ein Blog ohne Artikel beantwortet seine Route seit dem 2026-09-01 mit 404
 * und wird von Shopify auf /blogs/wissen weitergeleitet. Eine Sitemap, die
 * weiterleitende URLs anbietet, ist ein dauerhafter Widerspruch.
 *
 * @param {{query: Function}} storefront
 * @returns {Promise<string[]>} Handles, die aus der Blog-Sitemap fliegen
 */
export async function leereBlogHandles(storefront) {
  try {
    const {blogs} = await storefront.query(BLOG_BESTAND_QUERY);
    // hasNextPage wird protokolliert, nicht geworfen: entfernt wird
    // ausschließlich, was positiv als leer GEMESSEN wurde. Eine
    // unvollstaendige Antwort entfernt dann weniger — nie mehr, nie das
    // Falsche.
    if (blogs?.pageInfo?.hasNextPage) {
      console.warn(
        '[sitemap/blogs] mehr Blogs als abgefragt — Filter bleibt Teilmenge',
      );
    }
    return leereHandles(blogs);
  } catch (fehler) {
    // Fail-open, aber LAUT: eine ungefilterte Sitemap ist unsauber, eine
    // Sitemap mit 500 nimmt dem ganzen Shop die Auffindbarkeit.
    console.error('[sitemap/blogs] Bestands-Abfrage fehlgeschlagen', fehler);
    return [];
  }
}

/**
 * lädt die Zuordnung Artikel -> Blog.
 *
 * Fehlerfall gibt `null` statt einer leeren Karte zurück, und der
 * Unterschied ist tragend: eine LEERE Karte hiesse "gemessen, kein Artikel
 * hat einen Blog" und würde die Sitemap für 24 h leer einfrieren. `null`
 * heißt "nicht gemessen" — der Aufrufer verkuerzt dann die Cache-Dauer,
 * damit der nächste Abruf es erneut versucht.
 *
 * @param {{query: Function}} storefront
 * @returns {Promise<Map<string, string> | null>}
 */
export async function artikelKarte(storefront) {
  try {
    const {blogs} = await storefront.query(ARTIKEL_PFAD_QUERY);
    if (artikelKarteUnvollstaendig(blogs)) {
      console.warn(
        '[sitemap/articles] mehr Artikel je Blog als abgefragt — die Karte ist eine Teilmenge, ueberzaehlige Artikel fehlen in der Sitemap',
      );
    }
    if (blogs?.pageInfo?.hasNextPage) {
      console.warn(
        '[sitemap/articles] mehr Blogs als abgefragt — die Karte ist eine Teilmenge',
      );
    }
    return artikelBlogKarte(blogs);
  } catch (fehler) {
    console.error(
      '[sitemap/articles] Zuordnungs-Abfrage fehlgeschlagen',
      fehler,
    );
    return null;
  }
}

// 50 statt eines Defaults: der Shop hat heute 3 Blogs, und ein Seitenlimit,
// das die zuletzt angelegten Objekte hinter den Rand schiebt, hat auf diesem
// Shop schon einmal ein "0 gefunden" für real existierende Datensaetze
// erzeugt. hasNextPage wird oben ausgewertet.
const BLOG_BESTAND_QUERY = `#graphql
  query SitemapBlogBestand($language: LanguageCode) @inContext(language: $language) {
    blogs(first: 50) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        ...BlogBestand
      }
    }
  }
  ${BLOG_BESTAND_FRAGMENT}
`;

// Dieselbe Blog-Obergrenze wie oben und aus demselben Grund: der Shop hat
// heute 3 Blogs, und ein Seitenlimit, das die zuletzt angelegten Objekte
// hinter den Rand schiebt, faellt genau bei neuen Inhalten auf.
const ARTIKEL_PFAD_QUERY = `#graphql
  query SitemapArtikelPfade($language: LanguageCode) @inContext(language: $language) {
    blogs(first: 50) {
      pageInfo {
        hasNextPage
      }
      nodes {
        ...BlogArtikelPfad
      }
    }
  }
  ${ARTIKEL_PFAD_FRAGMENT}
`;
