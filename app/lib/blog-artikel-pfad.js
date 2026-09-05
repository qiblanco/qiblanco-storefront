/**
 * Unter welchem Blog liegt ein Artikel? — die Zuordnung, die Hydrogen der
 * Sitemap NICHT gibt.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie blog-bestand.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund vom 2026-09-04, am 2026-09-05 live
 * nachgemessen): die Artikel-Sitemap nannte Google sechs URLs der Form
 * `/articles/<slug>`, und alle sechs lieferten HTTP 404 — waehrend dieselben
 * sechs Slugs unter `/blogs/wissen/<slug>` mit echtem Artikelinhalt
 * antworteten (121-129 KB, je eigener Titel und eigene Pruefsumme, also
 * nachweislich keine leere Huelle). Die funktionierenden URLs standen in
 * KEINER Sitemap.
 *
 * DIE URSACHE LAG IM EIGENEN CODE, NICHT IN DEN SHOPIFY-DATEN: `getLink` in
 * der Sitemap-Route baute `${baseUrl}/${type}/${handle}`, was für
 * `type === 'articles'` zwangslaeufig `/articles/<slug>` ergibt. Eine Route
 * dieses Namens hat der Storefront nie gehabt; sie heißt
 * `blogs.$blogHandle.$articleHandle.jsx`. Die tote Form war also nicht
 * veraltet, sondern von Anfang an erfunden — es gibt deshalb auch keine
 * externe Link-Equity, die ein 301 zurueckholen könnte.
 *
 * WARUM DIE ZUORDNUNG VORGELADEN WIRD: Hydrogens `ARTICLE_SITEMAP_QUERY`
 * selektiert ausschließlich `handle` und `updatedAt` — der Blog-Handle steht
 * `getLink` baulich nicht zur Verfuegung, und `getLink` ist synchron, kann ihn
 * also auch nicht nachladen. Die Karte muss vor `getSitemap` stehen.
 *
 * FAIL-SAFE-RICHTUNG, UND SIE IST HIER DIE UMGEKEHRTE ZU blog-bestand.js:
 * dort darf eine Fehlmessung nie einen befuellten Blog aus dem Netz nehmen,
 * die milde Richtung ist also "behalten". Hier gibt es keine milde Variante,
 * die eine FUNKTIONIERENDE URL erzeugt: ein Artikel ohne bekannten Blog hat
 * schlicht keine bekannte Adresse. Geraten wird trotzdem nicht — eine
 * geratene URL wäre wieder genau der 404, der hier repariert wird. Ein
 * Artikel ohne Treffer faellt deshalb aus der Sitemap. Fehlend ist besser als
 * tot: der Artikel bleibt über den Index /blogs/wissen crawlbar, waehrend
 * eine tote URL Crawl-Budget und Vertrauen kostet.
 */

/**
 * Wie viele Artikel je Blog werden für die Zuordnung gelesen?
 *
 * 250 ist das Maximum einer Storefront-Verbindung. Der Blog trägt heute 6
 * Artikel; der Deckel ist also weit weg, aber er ist da — und was ihn
 * ueberschreitet, faellt still aus der Sitemap statt tot darin zu stehen.
 * `artikelKarteUnvollstaendig()` macht genau diesen Fall sichtbar, damit
 * "still" nicht "unbemerkt" heißt.
 */
export const ARTIKEL_PRO_BLOG = 250;

/**
 * GraphQL-Fragment, das die Zuordnung liefert.
 *
 * WARUM EIN FRAGMENT UND KEIN EINGESETZTER TEILSTRING: `${...}` MITTEN in
 * einer Selektion bricht `shopify hydrogen codegen` — dieselbe Falle, an der
 * BLOG_BESTAND_FRAGMENT hängt. Die Definition wird auf oberster Ebene
 * angehaengt, nicht eingesetzt.
 *
 * UND DIE 250 STEHT DESHALB HIER ALS ZIFFER, NICHT ALS `${ARTIKEL_PRO_BLOG}`:
 * genau daran ist der erste Bauversuch am 2026-09-05 gescheitert. Eine
 * Interpolation IM FRAGMENTTEXT macht das Dokument für den Codegen statisch
 * unlesbar, die Fragment-Definition wird nicht registriert, und der Build
 * bricht mit `Unknown fragment "BlogArtikelPfad"` an der IMPORT-Zeile der
 * Route ab — also an einer Stelle, die mit der Ursache nichts zu tun hat.
 * `ARTIKEL_PRO_BLOG` bleibt als lesbare Konstante bestehen; dass beide Zahlen
 * uebereinstimmen, sichert der Unit-Test ab (sonst driften sie stumm).
 */
export const ARTIKEL_PFAD_FRAGMENT = `#graphql
  fragment BlogArtikelPfad on Blog {
    handle
    artikel: articles(first: 250) {
      nodes {
        handle
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

/**
 * Baut die Karte Artikel-Handle -> Blog-Handle.
 *
 * Kollisionsregel: trägt derselbe Artikel-Handle in zwei Blogs, gewinnt der
 * ZUERST gelesene und die spaeteren werden ignoriert. Das ist bewusst
 * deterministisch (Reihenfolge der Shopify-Antwort) statt "letzter gewinnt" —
 * ein Aufruf, der zweimal dieselbe Antwort bekommt, erzeugt so zweimal
 * dieselbe Sitemap.
 *
 * @param {{nodes?: Array<{handle?: string, artikel?: {nodes?: Array<{handle?: string}>}}>} | null | undefined} verbindung
 * @returns {Map<string, string>}
 */
export function artikelBlogKarte(verbindung) {
  const karte = new Map();
  const blogs = verbindung?.nodes;
  if (!Array.isArray(blogs)) return karte;
  for (const blog of blogs) {
    const blogHandle = blog?.handle;
    if (!blogHandle) continue;
    const artikel = blog?.artikel?.nodes;
    if (!Array.isArray(artikel)) continue;
    for (const eintrag of artikel) {
      const handle = eintrag?.handle;
      if (!handle || karte.has(handle)) continue;
      karte.set(handle, blogHandle);
    }
  }
  return karte;
}

/**
 * Wurde mindestens ein Blog abgeschnitten?
 *
 * @param {{nodes?: Array<{artikel?: {pageInfo?: {hasNextPage?: boolean}}}>} | null | undefined} verbindung
 * @returns {boolean}
 */
export function artikelKarteUnvollstaendig(verbindung) {
  const blogs = verbindung?.nodes;
  if (!Array.isArray(blogs)) return false;
  return blogs.some((blog) => blog?.artikel?.pageInfo?.hasNextPage === true);
}

/**
 * Der Pfad, unter dem ein Artikel wirklich liegt — oder `null`.
 *
 * `null` heißt ausdrücklich "keine bekannte Adresse", nicht "Fehler": der
 * Aufrufer lässt den Artikel dann aus der Sitemap, statt zu raten.
 *
 * @param {Map<string, string> | null | undefined} karte
 * @param {string | undefined} handle
 * @returns {string | null}
 */
export function artikelPfad(karte, handle) {
  if (!handle || !karte || typeof karte.get !== 'function') return null;
  const blogHandle = karte.get(handle);
  if (!blogHandle) return null;
  return `/blogs/${blogHandle}/${handle}`;
}
