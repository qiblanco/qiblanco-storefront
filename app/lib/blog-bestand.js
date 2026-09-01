/**
 * Hat ein Blog ueberhaupt Artikel? — die eine Eigenschaft, an der drei
 * Blog-Flaechen hängen.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie blog-seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund vom 2026-08-31, live nachgemessen):
 * qiblanco.com hat drei Blog-Objekte, aber nur eines trägt Inhalt.
 *     /blogs/wissen   HTTP 200, 183693 B, 6 Artikel
 *     /blogs/news     HTTP 200,  82297 B, 0 Artikel, Selbst-Canonical
 *     /blogs/e-smog   HTTP 200,  82313 B, 0 Artikel, Selbst-Canonical
 * Die beiden leeren Pfade sind damit indexierbarer duenner Inhalt, der
 * behauptet, eine eigene Seite zu sein — /blogs/news steht seit über vier
 * Jahren so da. Im Shopify-Admin lagen dafür laengst zwei Weiterleitungen
 * auf /blogs/wissen; sie waren BAULICH WIRKUNGSLOS, weil `server.js`
 * `storefrontRedirect` nur bei `response.status === 404` befragt und ein
 * leerer Blog eine voellig gueltige Hydrogen-Route ist, die 200 rendert.
 * Ein Shopify-Admin-Redirect kann einen Pfad, den Hydrogen selbst bedient,
 * grundsaetzlich nicht uebersteuern.
 *
 * DIE EIGENSCHAFT IST "NULL ARTIKEL", NICHT DER NAME. Hier steht
 * bewusst KEINE Handle-Liste: ein vierter leerer Blog wäre sonst wieder
 * unsichtbar, und genau daran ist auf diesem Server schon mehrfach ein Zaun
 * gescheitert, der an Orten statt an Eigenschaften gemessen hat.
 *
 * WARUM NEBEN app/lib/seo.js: dieselbe Begründung wie bei blog-seo.js und
 * produkt-seo.js — seo.js wird u.a. von pages.support importiert; eine
 * Aenderung dort zoege über Gate 12 fremde Seiten in die Pruefmenge.
 */

/**
 * Der Blog, auf den die Leer-Weiterleitungen zeigen.
 *
 * Er ist von der 404-Regel AUSGENOMMEN, und das ist kein Ortsdenken, sondern
 * die Aufloesung eines Selbstbezugs: wären eines Tages alle Artikel
 * zurueckgenommen, würde die Regel auch das Weiterleitungs-ZIEL auf 404
 * setzen — die beiden Weiterleitungen zeigten dann ins Leere (eine
 * "haengende Weiterleitung", für den Kunden identisch mit gar keiner).
 * Der Fall ist HEUTE nicht ausloesbar (6 Artikel) und damit genau die Art
 * Fall, den sonst niemand testet.
 *
 * Statt 404 rendert der Anker dann eine ehrlich leere Uebersicht — und ist
 * damit die einzige Blog-Route, die einen 200 ohne Artikel geben darf.
 */
export const ANKER_BLOG_HANDLE = 'wissen';

/**
 * GraphQL-Fragment, das die Eigenschaft misst — die EINE Definition des
 * Feldnamens `bestand`, den `hatArtikel()` unten liest.
 *
 * Bewusst ein EIGENER, aliasierter Zweig mit festem `first: 1` und nicht die
 * angezeigte `articles`-Verbindung: die trägt die Pagination-Variablen der
 * Route, und auf Seite 2 eines befuellten Blogs wäre sie legitim leer. Wer
 * darauf pruefte, würde einen gesunden Blog ab Seite 2 weiterleiten.
 *
 * WARUM EIN FRAGMENT UND KEIN EINGESETZTER TEILSTRING: `${...}` MITTEN in
 * einer Selektion bricht `shopify hydrogen codegen` ("Variable ... not
 * found") — und zwar STILL, der Lauf endet trotzdem mit Exit 0 und meldet
 * "success". Ein Fragment-Spread ist statischer Text; die Definition wird
 * wie COLLECTION_ITEM_FRAGMENT auf oberster Ebene angehaengt. Am 2026-09-01
 * mit beiden Varianten gemessen.
 *
 * KEIN `cache: CacheLong` an einer Query, die dieses Fragment führt: ein
 * Blog, der seinen ersten Artikel bekommt, haenge sonst bis zum Cache-Ablauf
 * in der Weiterleitung — die Redaktion saehe ihre frisch veroeffentlichte
 * Seite nicht.
 */
export const BLOG_BESTAND_FRAGMENT = `#graphql
  fragment BlogBestand on Blog {
    bestand: articles(first: 1) {
      nodes {
        id
      }
    }
  }
`;

/**
 * Trägt dieser Blog-Knoten Artikel?
 *
 * Fail-safe in die MILDE Richtung: was nicht als nachweislich leer gemessen
 * wurde (fehlender Zweig, null, kaputte Antwort), gilt als befuellt. Eine
 * Fehlmessung darf nie einen befuellten Blog aus dem Netz nehmen — sie darf
 * hoechstens einen leeren stehen lassen, und das ist der Zustand von heute.
 *
 * @param {{bestand?: {nodes?: Array<unknown>}} | null | undefined} blog
 * @returns {boolean}
 */
export function hatArtikel(blog) {
  const nodes = blog?.bestand?.nodes;
  if (!Array.isArray(nodes)) return true;
  return nodes.length > 0;
}

/**
 * Soll dieser Blog als eigene Seite existieren?
 *
 * @param {string | undefined} handle
 * @param {{bestand?: {nodes?: Array<unknown>}} | null | undefined} blog
 * @returns {boolean}
 */
export function istEigenstaendig(handle, blog) {
  if (handle === ANKER_BLOG_HANDLE) return true;
  return hatArtikel(blog);
}

/**
 * Die Handles, die aus Uebersicht und Sitemap fliegen.
 *
 * @param {{nodes?: Array<{handle?: string}>} | null | undefined} verbindung
 * @returns {string[]}
 */
export function leereHandles(verbindung) {
  const nodes = verbindung?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes
    .filter((blog) => !istEigenstaendig(blog?.handle, blog))
    .map((blog) => blog.handle)
    .filter(Boolean);
}
