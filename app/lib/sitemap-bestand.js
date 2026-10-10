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

/**
 * Produkt-Handles, die Google nicht abrufen kann — und die deshalb nicht in
 * der Produkt-Sitemap stehen dürfen. Beide Sitemap-Routen lesen sie (Kind und
 * Index-lastmod), darum steht die Liste hier und nicht in einer der Routen.
 *
 * WARUM GOOGLE EINE SEITE NICHT SIEHT, DIE EIN DEUTSCHER KUNDE SIEHT
 * (gemessen 2026-10-06, Grossjob 20261006-GROSSJOB-seo-strategie-seiten-
 * bewertung-crawl-kannibalisierung, s02):
 * `resolveCountry()` in ~/lib/markt-pricing wählt den Markt aus dem Header
 * `oxygen-buyer-country`. US ist ein freigeschalteter Markt. Googlebot crawlt
 * aus den USA, die Produkt-Query läuft also im US-Kontext. Ist ein Produkt im
 * US-Markt nicht veröffentlicht, liefert die Route 404, obwohl dieselbe URL
 * in Deutschland 200 antwortet. Gemessen per `?markt=US` (dieselbe Weiche):
 * von 14 Produkt-URLs der Sitemap antworteten genau zwei mit 404. Die Search
 * Console bestätigt es für `qione-1`: „Nicht gefunden (404)", letzter Abruf
 * 2026-10-04.
 *
 * WARUM NICHT IN `NICHT_INDEXIERBARE_PRODUKTE` (~/lib/seo):
 *  1. Jene Liste setzt zusätzlich `noindex` auf die Produktseite und nimmt das
 *     Produkt aus Kollektionen und Suche. Beide Produkte hier sind für Kunden
 *     in Deutschland kaufbar; das wäre ein Eingriff in den Laden, nicht in die
 *     Sitemap.
 *  2. Ihr Aufnahme-Kriterium lautet „nur Handles ohne Zweck für Kunden". Das
 *     trifft hier nicht zu.
 *  3. Reichweite: ~/lib/seo wird von rund 36 Routen gelesen (Begründung
 *     wörtlich wie in ~/lib/sitemap-weiterleitungen).
 *
 * WAS DIESE LISTE NICHT ENTSCHEIDET: ob `qione-1` per 301 auf
 * `qione-2-pro` zieht. Entschieden am 2026-10-07 (Coworker A im Auftrag
 * Christians): ja. Der 301 steht in products.$handle.jsx über
 * app/lib/zusammenlegungen.js; der Eintrag hier bleibt, weil eine
 * Weiterleitung ebenso wenig in die Sitemap gehört wie ein 404.
 *
 * DER SCHUTZ GEGEN EINE VERALTETE LISTE liegt nicht hier, sondern am Rand:
 * homepage-bauer/shop-switch/pruefungen/probe_s02_zufahrt_produktname_sitemap.py
 * `--arm crawlermarkt` ruft jede Produkt-URL der AUSGELIEFERTEN Sitemap im
 * Markt US ab und wird rot, sobald eine davon 404 liefert, auch bei einem
 * Produkt, das hier niemand eingetragen hat. Wird ein Produkt hier später im
 * US-Markt veröffentlicht, gehört sein Eintrag wieder heraus.
 *
 * @type {Array<{handle: string, grund: string, seit: string}>}
 */
export const IM_CRAWLER_MARKT_NICHT_ABRUFBAR_DEF = [
  {
    handle: 'qione-1',
    grund:
      'Vorgängermodell, im US-Markt nicht veröffentlicht: Googlebot bekommt 404',
    seit: '2026-10-06',
  },
  {
    handle: 'broschure',
    grund:
      'Faltbroschüre für Partner, im US-Markt nicht veröffentlicht: Googlebot bekommt 404',
    seit: '2026-10-06',
  },
];

/** @type {string[]} */
export const IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE =
  IM_CRAWLER_MARKT_NICHT_ABRUFBAR_DEF.map((e) => e.handle);

