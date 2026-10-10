/**
 * Vorlagen ohne eigenen Indexwert (GEO-Maßnahme M3, 2026-10-10): EINE Liste in
 * ~/lib/sitemap-bestand, vier Leser. Dieser Test prüft jeden Leser an der
 * echten Datei, nicht an einem Nachbau.
 *
 *   node test/vorlagen-ohne-indexwert.test.mjs      # exit 0 = grün
 *
 *   A  Kind-Sitemap products und collections: die Einträge fehlen, die
 *      Nachbarn (Kaufseiten, gefüllte Kollektion, Namensvettern) bleiben.
 *   B  Sitemap-Index: das Datum einer Vorlage bewegt `<lastmod>` nicht
 *      (Negativ-Kontrolle: dasselbe Datum an einer Kaufseite bewegt es).
 *   C  robots-Meta: products.$handle und collections.$handle rufen die
 *      Prüfung im noindex-Zweig auf, collections.$handle auch für den Header.
 *   D  die Liste trifft die alten Listen in ~/lib/seo nicht: deren
 *      Aufnahme-Kriterium („ohne Zweck für Kunden") bleibt wahr.
 *
 * Rot vor Grün: Arm A und B schlagen aus, wenn der Eintrag in der Route bzw.
 * in sitemap-lastmod.js fehlt (beim Bau per `wandle` mutiert, siehe unten).
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const kindPfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');
const indexPfad = join(appDir, 'routes', '[sitemap.xml].jsx');

// sitemap-bestand.js importiert selbst `~/`-Module, darum über denselben
// Auflöser wie die Routen.
const {VORLAGEN_OHNE_INDEXWERT_DEF, vorlagenOhneIndexwert, istVorlageOhneIndexwert} =
  await ladeMitAufgeloestenImporten(join(appDir, 'lib', 'sitemap-bestand.js'), 'vorlagen-liste');
const {NICHT_INDEXIERBARE_PRODUKTE, NICHT_INDEXIERBARE_KOLLEKTIONEN} =
  await import(pathToFileURL(join(appDir, 'lib', 'seo.js')).href);

// Unabhängiges Literal (nicht aus der Liste abgeleitet), sonst verglichen
// sich Liste und Erwartung mit sich selbst. Quelle: rand-spec.json M3.
const SOLL = {
  products: [
    'bundle-2x-awake',
    'bundle-3x-awake',
    'mengenrabatt-2x',
    'mengenrabatt-3x-create',
    'crystal-cacao-angebot',
  ],
  collections: ['digitale-kurse', 'valentinstag-angebote', 'blackfriday-sale-artikel'],
};
const NACHBARN = {
  products: ['crystal-cacao-awake', 'crystal-cacao-create', 'qione-2-pro', 'bundle-2x-awake-neu'],
  collections: ['zeremonie-kakao', 'all'],
};

let grün = 0;
async function pruefe(name, fn) {
  await fn();
  grün += 1;
  console.log(`  ok  ${name}`);
}

function kindStorefront(handles) {
  return {
    async query() {
      return {
        sitemap: {
          resources: {
            items: handles.map((handle) => ({handle, updatedAt: '2026-10-01T00:00:00Z'})),
          },
        },
      };
    },
  };
}

async function kindXml(typ, handles, wandle) {
  const {loader} = await ladeMitAufgeloestenImporten(kindPfad, `vorlagen-kind-${typ}`, wandle);
  const antwort = await loader({
    request: new Request(`https://qiblanco.com/sitemap/${typ}/1.xml`),
    params: {type: typ, page: '1'},
    context: {storefront: kindStorefront(handles)},
  });
  return antwort.text();
}
const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const hat = (xml, typ, h) => locs(xml).some((u) => u.endsWith(`/${typ}/${h}`));

await pruefe('Liste deckt genau das Soll der Maßnahme', async () => {
  for (const typ of ['products', 'collections']) {
    assert.deepEqual([...vorlagenOhneIndexwert(typ)].sort(), [...SOLL[typ]].sort(), typ);
  }
  for (const e of VORLAGEN_OHNE_INDEXWERT_DEF) {
    assert.ok(e.grund && e.seit, `${e.handle}: grund/seit fehlt`);
  }
  assert.equal(istVorlageOhneIndexwert('products', undefined), false);
  assert.equal(istVorlageOhneIndexwert('collections', 'bundle-2x-awake'), false, 'Typ wird beachtet');
});

for (const typ of ['products', 'collections']) {
  await pruefe(`A ${typ}: Vorlagen fehlen in der Kind-Sitemap, Nachbarn bleiben`, async () => {
    const xml = await kindXml(typ, [...SOLL[typ], ...NACHBARN[typ]]);
    for (const h of SOLL[typ]) assert.ok(!hat(xml, typ, h), `${h} steht noch in sitemap/${typ}`);
    for (const h of NACHBARN[typ]) assert.ok(hat(xml, typ, h), `${h} fehlt in sitemap/${typ}`);
  });
}

await pruefe('A Rot-Arm: ohne die Verdrahtung in der Route bleiben die Vorlagen drin', async () => {
  // Mutation an der echten Route: die Liste liefert dort nichts.
  const wandle = (q) =>
    q.replace(/vorlagenOhneIndexwert\('(products|collections)'\)/g, '[]');
  const xml = await kindXml('products', [...SOLL.products, 'qione-2-pro'], wandle);
  assert.ok(hat(xml, 'products', 'bundle-2x-awake'), 'Mutation griff nicht — der Arm wäre blind');
});

// ------------------------------------------------------------------ B
function indexStorefront(produkte, kollektionen) {
  const kinder = {products: 1, pages: 0, collections: 1, articles: 0, blogs: 0, metaObjects: 0};
  return {
    async query(q) {
      if (q.includes('query SitemapIndex')) {
        return Object.fromEntries(
          Object.entries(kinder).map(([k, n]) => [k, {pagesCount: {count: n}}]),
        );
      }
      if (q.includes('SitemapKindLastmod')) {
        return {k0: {resources: {items: produkte}}, k1: {resources: {items: kollektionen}}};
      }
      if (q.includes('SitemapBlogBestand')) return {blogs: {pageInfo: {hasNextPage: false}, nodes: []}};
      if (q.includes('SitemapArtikelPfade')) return {blogs: {pageInfo: {hasNextPage: false}, nodes: []}};
      throw new Error(`unerwartete Abfrage: ${q.slice(0, 60)}`);
    },
  };
}

async function indexKarte(produkte, kollektionen, wandle) {
  const {loader} = await ladeMitAufgeloestenImporten(indexPfad, 'vorlagen-index', wandle);
  const antwort = await loader({
    request: new Request('https://x.test/sitemap.xml'),
    context: {storefront: indexStorefront(produkte, kollektionen)},
  });
  const rumpf = await antwort.text();
  const karte = {};
  for (const block of rumpf.match(/<sitemap>[\s\S]*?<\/sitemap>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)[1];
    const lm = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    karte[loc.replace('https://x.test/sitemap/', '').replace('/1.xml', '')] = lm ? lm[1] : null;
  }
  return karte;
}

await pruefe('B das Datum einer Vorlage bewegt das lastmod im Index nicht', async () => {
  const alt = {handle: 'qione-2-pro', updatedAt: '2026-01-01T00:00:00Z'};
  const altK = {handle: 'zeremonie-kakao', updatedAt: '2026-01-01T00:00:00Z'};
  const neu = '2026-12-31T00:00:00Z';
  const karte = await indexKarte(
    [alt, {handle: 'bundle-2x-awake', updatedAt: neu}],
    [altK, {handle: 'digitale-kurse', updatedAt: neu}],
  );
  assert.equal(karte.products, alt.updatedAt, 'products-lastmod aus einer Vorlage');
  assert.equal(karte.collections, altK.updatedAt, 'collections-lastmod aus einer Vorlage');
  // Negativ-Kontrolle: an einem sichtbaren Eintrag bewegt dasselbe Datum ihn.
  const kontrolle = await indexKarte(
    [alt, {handle: 'crystal-cacao-awake', updatedAt: neu}],
    [altK, {handle: 'all-x', updatedAt: neu}],
  );
  assert.equal(kontrolle.products, neu);
  assert.equal(kontrolle.collections, neu);
});

// ------------------------------------------------------------------ C
await pruefe('C robots-Meta und Header lesen die Liste im noindex-Zweig', async () => {
  const quelle = (d) => readFileSync(join(appDir, 'routes', d), 'utf8');
  const p = quelle('products.$handle.jsx');
  assert.match(
    p,
    /if \(\s*istNichtIndexierbaresProdukt\(data\?\.product\?\.handle\) \|\|\s*istVorlageOhneIndexwert\('products', data\?\.product\?\.handle\)\s*\) \{\s*return \[\s*\{title:[^\]]*noindexMeta\(\),\s*\];/,
    'products.$handle: Vorlage nicht im noindex-Zweig (oder canonical daneben)',
  );
  const k = quelle('collections.$handle.jsx');
  assert.match(
    k,
    /istVorlageOhneIndexwert\('collections', params\?\.handle\)\s*\) \{\s*tags\.push\(noindexMeta\(\)\);\s*return tags;/,
    'collections.$handle: Meta-Zweig fehlt',
  );
  assert.match(
    k,
    /istVorlageOhneIndexwert\('collections', args\.params\?\.handle\)\s*\) \{\s*return mitHeadern\(payload, \{headers: noindexHeader\(\)\}\);/,
    'collections.$handle: X-Robots-Tag-Zweig fehlt',
  );
});

// ------------------------------------------------------------------ D
await pruefe('D die alten Listen bleiben unberührt (Aufnahme-Kriterium bleibt wahr)', async () => {
  for (const h of SOLL.products) assert.ok(!NICHT_INDEXIERBARE_PRODUKTE.includes(h), h);
  for (const h of SOLL.collections) assert.ok(!NICHT_INDEXIERBARE_KOLLEKTIONEN.includes(h), h);
});

console.log(`vorlagen-ohne-indexwert: ${grün} Arme grün`);
