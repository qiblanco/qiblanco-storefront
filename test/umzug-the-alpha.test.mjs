/**
 * Umzug the-alpha -> qi-alpha (Christian Z1 vom 27.10.2026: „Und den Link
 * ändern wir auch wieder von The Alpha in Qi Alpha“; Job 20261027-prio1-
 * umzug-the-alpha-zu-qi-alpha-links-name). Vorgänger: Umzug qi-alpha ->
 * the-alpha vom 26.10.2026 (#1024), dessen Test diese Datei war.
 *
 * Zusagen:
 *   1. Jede alte Adresse (the-alpha, the-alpha-b, The-Alpha, -B, -C, qi-master,
 *      die Add-on-Pfade, die alten LPs) antwortet mit GENAU EINEM 301 auf ihr
 *      Endziel unter Qi Alpha, Query unverändert, keine Kette.
 *   2. Die neuen Seiten leiten jede andere Schreibweise per 301 auf
 *      Christians Schreibweise (/pages/Qi-Alpha, /products/qi-alpha).
 *   3. Warenkorb-Zeile und Produktkarte (Shopify-Handle qi-master/qi-alpha)
 *      verlinken direkt /products/qi-alpha.
 *   4. Die Sitemap bildet den Shopify-Handle auf /products/qi-alpha ab.
 *   5. /products/qi-alpha trägt das Vorschau-noindex wie Shop A vorher.
 * Den Rand misst claude-jobs/20261027-prio1-umzug-the-alpha-zu-qi-alpha-links-name/probe.py.
 *
 * GEGENRICHTUNG (tragend): ein Namensvetter (qione, qione-kette) behält seinen
 * Pfad. Sonst wäre eine Abbildung "alles auf qi-alpha" ebenso grün.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';
import {getVariantUrl} from '../app/lib/variants.js';
import {istVorschauNoindex} from '../app/lib/vorschau-noindex.js';

const hier = dirname(fileURLToPath(import.meta.url));
const route = (name) => join(hier, '..', 'app', 'routes', name);
// sm-ausnahme: Test-Fixture, kein Abruf eines echten Shops.
const BASIS = 'https://qiblanco.com';
const Q = '?utm_source=x&gclid=g1&fbclid=f1&Title=Alpha%207%2F111';

async function erster301(datei, pfad) {
  const {loader} = await ladeMitAufgeloestenImporten(route(datei), 'umzug-qi-alpha');
  try {
    await loader({request: new Request(`${BASIS}${pfad}${Q}`), params: {}, context: {}});
  } catch (antwort) {
    return antwort;
  }
  assert.fail(`${datei}: kein Redirect geworfen`);
}

const HUELLEN = [
  ['products.qi-master.jsx', '/products/qi-master', '/products/qi-alpha'],
  ['products.qi-master-goldkette.jsx', '/products/qi-master-goldkette', '/products/qi-alpha'],
  ['products.qi-master-wunschnummer.jsx', '/products/qi-master-wunschnummer', '/products/qi-alpha'],
  ['products.qi-alpha-goldkette.jsx', '/products/qi-alpha-goldkette', '/products/qi-alpha'],
  ['products.qi-alpha-wunschnummer.jsx', '/products/qi-alpha-wunschnummer', '/products/qi-alpha'],
  ['products.the-alpha.jsx', '/products/the-alpha', '/products/qi-alpha'],
  ['products.the-alpha.jsx', '/products/The-Alpha', '/products/qi-alpha'],
  ['products.the-alpha-b.jsx', '/products/the-alpha-b', '/products/qi-alpha-b'],
  ['pages.The-Alpha.jsx', '/pages/The-Alpha', '/pages/Qi-Alpha'],
  ['pages.The-Alpha.jsx', '/pages/the-alpha', '/pages/Qi-Alpha'],
  ['pages.The-Alpha-B.jsx', '/pages/The-Alpha-B', '/pages/Qi-Alpha-B'],
  ['pages.The-Alpha-B.jsx', '/pages/the-alpha-b', '/pages/Qi-Alpha-B'],
  ['pages.The-Alpha-C.jsx', '/pages/The-Alpha-C', '/pages/Qi-Alpha-C'],
  ['pages.The-Alpha-C.jsx', '/pages/the-alpha-c', '/pages/Qi-Alpha-C'],
  ['pages.qi-master-vorverkauf.jsx', '/pages/qi-master-vorverkauf', '/pages/Qi-Alpha'],
  // DACH-Admin-Weiterleitungen (gelesen 27.10.2026) zeigten auf the-alpha;
  // die Routen halten den einen Sprung ohne Shopify-Schreibvorgang.
  ['pages.qi-master.jsx', '/pages/qi-master', '/products/qi-alpha'],
  ['pages.qi-master-lp.jsx', '/pages/qi-master-lp', '/pages/Qi-Alpha'],
];

for (const [datei, pfad, ziel] of HUELLEN) {
  test(`${pfad} -> 301 ${ziel} in einem Sprung, Query bleibt`, async () => {
    const a = await erster301(datei, pfad);
    assert.equal(a.status, 301);
    assert.equal(a.headers.get('Location'), `${ziel}${Q}`);
  });
}

// Die Seiten selbst und die alte LP qi-alpha-vorverkauf ziehen ganze
// Komponentenbäume nach, die der Import-Auflöser nicht lädt. Ihr Sprung steht
// deshalb als Quelltext-Zusage hier; das Verhalten am Rand misst probe.py.
const lies = (name) => readFileSync(route(name), 'utf8');
for (const [datei, kanon, konst] of [
  ['pages.Qi-Alpha.jsx', '/pages/Qi-Alpha', 'KANON_PFAD'],
  ['pages.Qi-Alpha-B.jsx', '/pages/Qi-Alpha-B', 'KANON_PFAD'],
  ['pages.Qi-Alpha-C.jsx', '/pages/Qi-Alpha-C', 'KANON_PFAD'],
  ['products.qi-alpha.jsx', '/products/qi-alpha', 'THE_ALPHA_PDP_PFAD'],
  ['products.qi-alpha-b.jsx', '/products/qi-alpha-b', 'THE_ALPHA_PDP_PFAD'],
]) {
  test(`${datei}: kanonisch ${kanon}, jede andere Schreibweise 301 dorthin`, () => {
    const q = lies(datei);
    assert.ok(q.includes(`const ${konst} = '${kanon}';`), datei);
    assert.ok(q.includes(`throw redirect(\`\${${konst}}\${url.search}\`, 301);`), datei);
  });
}

test('pages.qi-alpha-vorverkauf.jsx: 301 direkt auf /pages/Qi-Alpha', () => {
  assert.ok(lies('pages.qi-alpha-vorverkauf.jsx').includes('throw redirect(`/pages/Qi-Alpha${url.search}`, 301);'));
});

test('Keine zweite Route für /pages/qi-alpha-b (Schreibweise kollidiert mit Qi-Alpha-B)', () => {
  assert.equal(existsSync(route('pages.qi-alpha-b.jsx')), false);
});

test('Kein Ziel einer Hülle ist selbst eine Hülle (keine Kette)', () => {
  const alt = new Set(HUELLEN.map(([, p]) => p.toLowerCase()));
  for (const [, pfad, ziel] of HUELLEN) {
    if (pfad.toLowerCase() === ziel.toLowerCase()) continue;
    assert.ok(!alt.has(ziel.toLowerCase()) || HUELLEN.some(([, p, z]) => p.toLowerCase() === ziel.toLowerCase() && z === ziel), ziel);
  }
});

test('Warenkorb-Zeile/Produktkarte des Qi Alpha zeigt direkt auf /products/qi-alpha', () => {
  for (const handle of ['qi-master', 'qi-alpha', 'qi-master-wunschnummer', 'qi-alpha-goldkette']) {
    const url = getVariantUrl({
      handle,
      pathname: '/cart',
      searchParams: new URLSearchParams(),
      selectedOptions: [{name: 'Title', value: 'Alpha 7/111'}],
    });
    assert.equal(url, '/products/qi-alpha?Title=Alpha+7%2F111', handle);
  }
  // Gegenrichtung: Namensvetter behalten ihren Pfad.
  for (const handle of ['qione', 'qi-alpha-b', 'qione-kette', 'the-alpha']) {
    const url = getVariantUrl({handle, pathname: '/', searchParams: new URLSearchParams()});
    assert.equal(url, `/products/${handle}`);
  }
});

test('Sitemap: Shopify-Handle qi-master nie als Altpfad, the-alpha nie', async () => {
  const {loader} = await ladeMitAufgeloestenImporten(
    route('sitemap.$type.$page[.xml].jsx'),
    'umzug-qi-alpha-sitemap',
  );
  const storefront = {
    async query() {
      return {
        sitemap: {
          resources: {
            items: ['qi-master', 'qi-alpha', 'qione'].map((handle) => ({
              handle,
              updatedAt: '2026-10-26T00:00:00Z',
            })),
          },
        },
      };
    },
  };
  const antwort = await loader({
    request: new Request(`${BASIS}/sitemap/products/1.xml`),
    params: {type: 'products', page: '1'},
    context: {storefront},
  });
  const locs = [...(await antwort.text()).matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.ok(!locs.some((u) => /\/products\/(qi-master|the-alpha)$/.test(u)), locs.join(' '));
  assert.ok(locs.includes(`${BASIS}/products/qione`), locs.join(' '));
  // Vorschau-noindex (Christian 23.10.): solange /products/qi-alpha dort
  // steht, fehlt er in der Sitemap; fliegt der Eintrag raus, steht er genau einmal.
  const soll = istVorschauNoindex('/products/qi-alpha') ? 0 : 1;
  assert.equal(locs.filter((u) => u.endsWith('/products/qi-alpha')).length, soll, locs.join(' '));
});

test('/products/qi-alpha trägt das Vorschau-noindex wie Shop A', () => {
  assert.equal(istVorschauNoindex('/products/qi-alpha'), true);
  assert.equal(istVorschauNoindex('/products/Qi-Alpha'), true);
});
