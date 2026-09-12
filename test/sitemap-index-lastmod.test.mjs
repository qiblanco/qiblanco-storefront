/**
 * Hermetischer Test der ECHTEN Sitemap-INDEX-Route.
 *
 *   node test/sitemap-index-lastmod.test.mjs      # exit 0 = grün
 *
 * WARUM ES IHN GIBT (2026-09-12): `getSitemapIndex` aus @shopify/hydrogen
 * schreibt nackte `<loc>`-Zeilen. Google holte `sitemap/pages/1.xml`
 * daraufhin 15 Tage lang nicht (lastDownloaded 2026-08-28), und die sechs in
 * dieser Zeit aufgenommenen /pages-URLs blieben ihm unbekannt. Der Index
 * ergänzt seither je Kind ein `<lastmod>`.
 *
 * DER GEFÄHRLICHE FEHLER IST NICHT DAS FEHLENDE DATUM, SONDERN EIN FALSCHES:
 * ein `lastmod`, das ein Kind für frischer ausgibt, als es ist, ist eine
 * Lüge gegenüber Google. Die drei Filter-Arme prüfen deshalb nicht nur, DASS
 * ein Datum kommt, sondern dass genau die Einträge zählen, die das Kind auch
 * ausliefert — jeder mit einer NEGATIV-KONTROLLE daneben, weil ein Filter,
 * der immer alles wegwirft, dieselben grünen Arme erzeugen würde.
 *
 * Wie sitemap-nur-route-seiten.test.mjs: die Route wird als Datei gelesen und
 * nur die `~/`-Import-Spezifizierer werden aufgelöst (transitiv, siehe
 * test/route-import-aufloesung.mjs) — kein Nachbau, kein zweites Testobjekt.
 */
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const routePfad = join(appDir, 'routes', '[sitemap.xml].jsx');

const ladeRoute = () =>
  ladeMitAufgeloestenImporten(routePfad, 'sitemap-index-test');

const {NUR_ROUTE_SEITEN, NICHT_INDEXIERBARE_PRODUKTE} = await import(
  pathToFileURL(join(appDir, 'lib', 'seo.js')).href
);

const BASIS = 'https://x.test';
const MAX_NUR_ROUTE = NUR_ROUTE_SEITEN.map((e) => e.lastmod)
  .filter(Boolean)
  .sort()
  .at(-1);

/**
 * Storefront-Attrappe.
 * @param {{items?: object, blogsLeer?: string[], artikelBlogs?: object,
 *          artikelWirft?: boolean, kinder?: object}} lage
 */
function storefrontAttrappe(lage = {}) {
  const kinder = lage.kinder ?? {
    products: 1,
    pages: 1,
    collections: 1,
    articles: 1,
    blogs: 1,
    metaObjects: 0,
  };
  return {
    async query(q) {
      if (q.includes('query SitemapIndex')) {
        return Object.fromEntries(
          Object.entries(kinder).map(([k, n]) => [k, {pagesCount: {count: n}}]),
        );
      }
      if (q.includes('SitemapKindLastmod')) {
        // Aliase k0..kn in der Reihenfolge der <loc>-Zeilen des Index.
        const reihe = Object.entries(kinder)
          .flatMap(([typ, n]) => Array.from({length: n}, () => typ));
        return Object.fromEntries(
          reihe.map((typ, i) => [
            `k${i}`,
            {resources: {items: (lage.items ?? {})[typ] ?? []}},
          ]),
        );
      }
      if (q.includes('SitemapBlogBestand')) {
        return {
          blogs: {
            pageInfo: {hasNextPage: false},
            nodes: (lage.blogsAlle ?? []).map((handle) => ({
              handle,
              bestand: {nodes: (lage.blogsLeer ?? []).includes(handle) ? [] : [{id: '1'}]},
            })),
          },
        };
      }
      if (q.includes('SitemapArtikelPfade')) {
        if (lage.artikelWirft) throw new Error('Zuordnung nicht abfragbar');
        return {
          blogs: {
            pageInfo: {hasNextPage: false},
            nodes: Object.entries(lage.artikelBlogs ?? {}).map(([blog, artikel]) => ({
              handle: blog,
              artikel: {pageInfo: {hasNextPage: false}, nodes: artikel.map((h) => ({handle: h}))},
            })),
          },
        };
      }
      throw new Error(`unerwartete Abfrage: ${q.slice(0, 60)}`);
    },
  };
}

const {loader} = await ladeRoute();

/** @returns {Promise<{rumpf: string, karte: Record<string,string>}>} */
async function indexHolen(storefront) {
  const antwort = await loader({
    request: new Request(`${BASIS}/sitemap.xml`),
    context: {storefront},
  });
  const rumpf = await antwort.text();
  assert.equal(antwort.status, 200, 'der Index antwortet nie mit einem Fehler');
  const karte = {};
  for (const block of rumpf.match(/<sitemap>[\s\S]*?<\/sitemap>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)[1];
    const lm = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    karte[loc.replace(`${BASIS}/sitemap/`, '').replace('/1.xml', '')] =
      lm ? lm[1] : null;
  }
  return {rumpf, karte};
}

const D = (t) => ({handle: 'egal', updatedAt: t});

// ---------------------------------------------------------------- ARM 1
// Der Regelfall: je Kind das Maximum seiner Einträge.
{
  const {karte} = await indexHolen(
    storefrontAttrappe({
      items: {
        products: [D('2026-01-01T00:00:00Z'), D('2026-02-02T00:00:00Z')],
        pages: [D('2026-03-03T00:00:00Z')],
        collections: [D('2026-04-04T00:00:00Z')],
        articles: [{handle: 'a1', updatedAt: '2026-05-05T00:00:00Z'}],
        blogs: [{handle: 'wissen', updatedAt: '2026-06-06T00:00:00Z'}],
      },
      blogsAlle: ['wissen'],
      artikelBlogs: {wissen: ['a1']},
    }),
  );
  assert.equal(karte.products, '2026-02-02T00:00:00Z', 'products = Maximum');
  assert.equal(karte.collections, '2026-04-04T00:00:00Z', 'collections = Maximum');
  assert.equal(karte.articles, '2026-05-05T00:00:00Z', 'articles = Maximum');
  assert.equal(karte.blogs, '2026-06-06T00:00:00Z', 'blogs = Maximum');
  // pages: die NUR_ROUTE_SEITEN zählen mit, sie stehen im Kind.
  assert.equal(
    karte.pages,
    MAX_NUR_ROUTE > '2026-03-03T00:00:00Z' ? MAX_NUR_ROUTE : '2026-03-03T00:00:00Z',
    'pages bezieht die NUR_ROUTE_SEITEN ein',
  );
}

// ---------------------------------------------------------------- ARM 2
// Ein verstecktes Produkt steht NICHT im Kind — sein Datum darf den Index
// nicht bewegen. Negativ-Kontrolle daneben: ein sichtbares Produkt tut es.
{
  const verstecktesHandle = NICHT_INDEXIERBARE_PRODUKTE[0];
  assert.ok(verstecktesHandle, 'die Fixture braucht ein real verstecktes Produkt');
  const bau = (handle) =>
    storefrontAttrappe({
      items: {
        products: [D('2026-01-01T00:00:00Z'), {handle, updatedAt: '2026-12-31T00:00:00Z'}],
      },
      blogsAlle: [],
    });
  const {karte: gefiltert} = await indexHolen(bau(verstecktesHandle));
  assert.equal(gefiltert.products, '2026-01-01T00:00:00Z',
    'ein verstecktes Produkt bewegt den Index nicht');
  const {karte: sichtbar} = await indexHolen(bau('ein-sichtbares-produkt'));
  assert.equal(sichtbar.products, '2026-12-31T00:00:00Z',
    'NEGATIV-KONTROLLE: ein sichtbares Produkt bewegt ihn sehr wohl');
}

// ---------------------------------------------------------------- ARM 3
// Ein leerer Blog fliegt aus dem Kind — und damit aus dem Maximum.
{
  const bau = (leer) =>
    storefrontAttrappe({
      items: {
        blogs: [
          {handle: 'wissen', updatedAt: '2026-03-03T00:00:00Z'},
          {handle: 'leerer-blog', updatedAt: '2026-12-31T00:00:00Z'},
        ],
      },
      blogsAlle: ['wissen', 'leerer-blog'],
      blogsLeer: leer,
    });
  const {karte: mitFilter} = await indexHolen(bau(['leerer-blog']));
  assert.equal(mitFilter.blogs, '2026-03-03T00:00:00Z',
    'ein leerer Blog bewegt den Index nicht');
  const {karte: ohneFilter} = await indexHolen(bau([]));
  assert.equal(ohneFilter.blogs, '2026-12-31T00:00:00Z',
    'NEGATIV-KONTROLLE: ein befüllter Blog bewegt ihn sehr wohl');
}

// ---------------------------------------------------------------- ARM 4
// Ein Artikel ohne bekannten Blog steht in keiner Sitemap — und zählt nicht.
{
  const {karte} = await indexHolen(
    storefrontAttrappe({
      items: {
        articles: [
          {handle: 'mit-blog', updatedAt: '2026-04-04T00:00:00Z'},
          {handle: 'ohne-blog', updatedAt: '2026-12-31T00:00:00Z'},
        ],
      },
      blogsAlle: [],
      artikelBlogs: {wissen: ['mit-blog']},
    }),
  );
  assert.equal(karte.articles, '2026-04-04T00:00:00Z',
    'ein Artikel ohne bekannten Blog bewegt den Index nicht');
}

// ---------------------------------------------------------------- ARM 5
// Zuordnung NICHT MESSBAR heißt: gar kein Datum. Das Kind liefert dann keinen
// einzigen Artikel aus — ein Maximum über die ungefilterte Menge wäre
// nachweislich falsch.
{
  const {karte} = await indexHolen(
    storefrontAttrappe({
      items: {articles: [{handle: 'x', updatedAt: '2026-12-31T00:00:00Z'}]},
      blogsAlle: [],
      artikelWirft: true,
    }),
  );
  assert.equal(karte.articles, null,
    'ohne messbare Zuordnung nennt der Index kein Datum');
}

// ---------------------------------------------------------------- ARM 6
// Kein Eintrag hat ein Datum -> die Zeile bleibt nackt, statt eines erfunden.
{
  const {karte} = await indexHolen(
    storefrontAttrappe({
      items: {collections: [{handle: 'c', updatedAt: null}]},
      blogsAlle: [],
    }),
  );
  assert.equal(karte.collections, null, 'kein Datum ist besser als ein erfundenes');
}

// ---------------------------------------------------------------- ARM 7
// FAIL-OPEN: bricht die Ergänzung, geht der unveränderte Index hinaus — der
// Sitemap-Index ist die Wurzel der Auffindbarkeit des ganzen Shops.
{
  const kaputt = {
    async query(q) {
      if (q.includes('query SitemapIndex')) {
        return {
          products: {pagesCount: {count: 1}},
          pages: {pagesCount: {count: 1}},
          collections: {pagesCount: {count: 0}},
          articles: {pagesCount: {count: 0}},
          blogs: {pagesCount: {count: 0}},
          metaObjects: {pagesCount: {count: 0}},
        };
      }
      throw new Error('Bestands-Abfrage kaputt');
    },
  };
  const {rumpf, karte} = await indexHolen(kaputt);
  assert.ok(rumpf.includes('<sitemapindex'), 'der Index kommt trotzdem');
  assert.equal(karte.products, null, 'ohne Messung kein Datum');
  assert.equal(karte.pages, null, 'ohne Messung kein Datum');
}

// ---------------------------------------------------------------- ARM 8
// Jeder NUR_ROUTE_SEITEN-Eintrag trägt ein `lastmod`: diese Seiten haben
// kein Shopify-Objekt, es gibt für sie keine zweite Datumsquelle.
{
  const ohne = NUR_ROUTE_SEITEN.filter((e) => !e.lastmod).map((e) => e.pfad);
  assert.deepEqual(ohne, [],
    'NUR_ROUTE_SEITEN ohne lastmod verlieren ihr Frischesignal ersatzlos');
  for (const e of NUR_ROUTE_SEITEN) {
    assert.match(e.lastmod, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      `${e.pfad}: lastmod muss ein ISO-Zeitpunkt in UTC sein`);
  }
}

console.log('sitemap-index-lastmod: alle 8 Arme grün');
