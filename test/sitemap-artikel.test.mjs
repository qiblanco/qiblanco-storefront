/**
 * Hermetischer Test der ECHTEN Sitemap-Route (kein Netz, kein Shopify).
 *
 *   node test/sitemap-artikel.test.mjs      # exit 0 = gruen
 *
 * WARUM DIESER TEST NEBEN blog-artikel-pfad.test.mjs STEHT: jener prueft die
 * Datenfabrik, dieser die VERDRAHTUNG. Genau dazwischen lag beim Bau die
 * teure Stelle — der Schnell-Ausstieg "keine versteckten Handles" haette den
 * Filter für `articles` uebersprungen, und die Datenfabrik wäre dabei
 * fehlerfrei geblieben. Ein gruener Lib-Test sagt darueber nichts.
 *
 * Die Route ist eine `.jsx`-Datei und damit für `node` nicht direkt
 * importierbar. Der Test LIEST deshalb die echte Datei und ersetzt
 * ausschließlich die `~/`-Import-Spezifizierer durch Dateipfade — kein
 * Nachbau, keine zweite Kopie im Repo: aendert sich die Route, aendert sich
 * das Testobjekt mit.
 */
import assert from 'node:assert/strict';
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const routePfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');

/**
 * lädt die echte Route, nur mit aufgeloesten `~/`-Importen.
 *
 * Die Ablage liegt bewusst IM Repo und nicht in /tmp: `@shopify/hydrogen`
 * wird über `node_modules` aufgeloest, und ausserhalb des Baums findet node
 * das Paket nicht (`ERR_MODULE_NOT_FOUND`). Die Datei wird sofort nach dem
 * Import wieder entfernt.
 */
async function ladeRoute() {
  const quelle = readFileSync(routePfad, 'utf8').replace(
    /from '~\/([^']+)'/g,
    (_, rest) => `from '${pathToFileURL(join(appDir, rest)).href}.js'`,
  );
  const ziel = join(hier, '..', `.sitemap-route-test-${process.pid}.mjs`);
  writeFileSync(ziel, quelle);
  try {
    return await import(pathToFileURL(ziel).href);
  } finally {
    rmSync(ziel, {force: true});
  }
}

/**
 * Die sechs am 2026-09-05 live gemessenen Artikel, in der Adressform, unter
 * der sie wirklich antworten. Die Handles werden daraus abgeleitet.
 */
const LIVE_PFADE = [
  '/blogs/wissen/kohaerentes-wasser-was-die-forschung-misst',
  '/blogs/wissen/nervensystem-regulieren-trend-innere-ruhe',
  '/blogs/wissen/schlaf-vermessen-trend-optimierte-nacht',
  '/blogs/wissen/schlafqualitaet-wasser-drei-studien',
  '/blogs/wissen/strukturiertes-wasser-trend-was-gemessen-ist',
  '/blogs/wissen/zellulaere-hydration-biophysik',
];

const SLUGS = LIVE_PFADE.map((pfad) => pfad.split('/').pop());

/**
 * @param {{artikel?: string[], karte?: Record<string, string[]> | null}} lage
 */
function storefrontAttrappe(lage) {
  const {artikel = SLUGS, karte = {wissen: SLUGS}} = lage;
  return {
    async query(anfrage) {
      if (String(anfrage).includes('SitemapArtikelPfade')) {
        if (karte === null) throw new Error('Zuordnung nicht lesbar (Attrappe)');
        return {
          blogs: {
            pageInfo: {hasNextPage: false},
            nodes: Object.entries(karte).map(([handle, slugs]) => ({
              handle,
              artikel: {
                nodes: slugs.map((h) => ({handle: h})),
                pageInfo: {hasNextPage: false},
              },
            })),
          },
        };
      }
      return {
        sitemap: {
          resources: {
            items: artikel.map((handle) => ({
              handle,
              updatedAt: '2026-08-31T23:53:31Z',
            })),
          },
        },
      };
    },
  };
}

async function sitemapXml(lage = {}) {
  const {loader} = await ladeRoute();
  const antwort = await loader({
    request: new Request('https://qiblanco.com/sitemap/articles/1.xml'),
    params: {type: 'articles', page: '1'},
    context: {storefront: storefrontAttrappe(lage)},
  });
  return {
    xml: await antwort.text(),
    cache: antwort.headers.get('Cache-Control'),
  };
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

let gruen = 0;
async function pruefe(name, fn) {
  await fn();
  gruen += 1;
  console.log(`  ok  ${name}`);
}

await pruefe('jede genannte URL trägt die echte /blogs/-Form', async () => {
  const {xml} = await sitemapXml();
  const gefunden = locs(xml);
  assert.equal(gefunden.length, SLUGS.length);
  for (const slug of SLUGS) {
    assert.ok(gefunden.includes(`https://qiblanco.com/blogs/wissen/${slug}`));
  }
});

await pruefe('KEINE genannte URL trägt mehr die tote /articles/-Form', async () => {
  const {xml} = await sitemapXml();
  for (const url of locs(xml)) {
    assert.ok(!/\/articles\//.test(url), `tote Form in der Sitemap: ${url}`);
  }
  // Auch die hreflang-Alternativen duerfen sie nicht mehr tragen.
  assert.ok(!/href="[^"]*\/articles\//.test(xml));
});

await pruefe('Artikel ohne bekannten Blog faellt raus statt tot dazustehen', async () => {
  const {xml} = await sitemapXml({
    artikel: [...SLUGS, 'verwaister-artikel'],
    karte: {wissen: SLUGS},
  });
  const gefunden = locs(xml);
  assert.equal(gefunden.length, SLUGS.length);
  assert.ok(!xml.includes('verwaister-artikel'));
  // Die Marke selbst darf nie im Ergebnis landen.
  assert.ok(!xml.includes('kein-blog-bekannt'));
});

await pruefe('Artikel aus zwei Blogs bekommen je ihren eigenen Pfad', async () => {
  const {xml} = await sitemapXml({
    artikel: ['a', 'b'],
    karte: {wissen: ['a'], 'e-smog': ['b']},
  });
  const gefunden = locs(xml);
  assert.ok(gefunden.includes('https://qiblanco.com/blogs/wissen/a'));
  assert.ok(gefunden.includes('https://qiblanco.com/blogs/e-smog/b'));
});

await pruefe('gemessene Lage wird 24 h zwischengespeichert', async () => {
  const {cache} = await sitemapXml();
  assert.equal(cache, `max-age=${60 * 60 * 24}`);
});

await pruefe('NICHT gemessene Lage: keine tote URL, aber kurze Cache-Frist', async () => {
  const {xml, cache} = await sitemapXml({karte: null});
  assert.deepEqual(locs(xml), []);
  assert.equal(cache, `max-age=${60 * 5}`);
});

console.log(`\nsitemap-artikel: ${gruen} Pruefungen gruen`);
