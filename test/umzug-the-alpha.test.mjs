/**
 * Umzug qi-alpha -> the-alpha (Christian Z4 vom 25.10.2026: „d.h. wir gehen im
 * link weg von qi-alpha hin zu the alpha"; Grossjob 20261025-prio1-the-alpha-
 * landingpage-figma-vorlage-a-server-b-ki-c, Segment s06).
 *
 * WAS DIESER TEST BEWEIST (hermetisch, ohne Shop):
 *   1. Jede alte Produkt-Adresse (qi-master, qi-alpha, ihre Add-on-Pfade)
 *      antwortet mit GENAU EINEM 301 auf /products/the-alpha, Query unverändert.
 *   2. /pages/qi-master-vorverkauf geht in einem Sprung auf /pages/The-Alpha,
 *      nicht mehr über /pages/qi-alpha-vorverkauf.
 *   3. Eine Warenkorb-Zeile bzw. Produktkarte des Qi Alpha (Shopify-Handle
 *      qi-master oder qi-alpha) verlinkt direkt /products/the-alpha.
 *   4. Die Sitemap bildet den Shopify-Handle auf /products/the-alpha ab.
 *   5. /products/the-alpha trägt das Vorschau-noindex wie Shop A vorher.
 * Die beiden JSX-Routen (pages.qi-alpha-vorverkauf, pages.qi-alpha-b,
 * products.the-alpha) misst die Rand-Probe probe_umzug_the_alpha.py.
 *
 * GEGENRICHTUNG (tragend): ein Namensvetter (qione, qi-alpha-b) behält seinen
 * Pfad. Sonst wäre eine Abbildung "alles auf the-alpha" ebenso grün.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
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
  const {loader} = await ladeMitAufgeloestenImporten(route(datei), 'umzug-the-alpha');
  try {
    await loader({request: new Request(`${BASIS}${pfad}${Q}`), params: {}, context: {}});
  } catch (antwort) {
    return antwort;
  }
  assert.fail(`${datei}: kein Redirect geworfen`);
}

const PRODUKT_HUELLEN = [
  ['products.qi-master.jsx', '/products/qi-master'],
  ['products.qi-alpha.jsx', '/products/qi-alpha'],
  ['products.qi-master-goldkette.jsx', '/products/qi-master-goldkette'],
  ['products.qi-master-wunschnummer.jsx', '/products/qi-master-wunschnummer'],
  ['products.qi-alpha-goldkette.jsx', '/products/qi-alpha-goldkette'],
  ['products.qi-alpha-wunschnummer.jsx', '/products/qi-alpha-wunschnummer'],
];

for (const [datei, pfad] of PRODUKT_HUELLEN) {
  test(`${pfad} -> 301 /products/the-alpha, Query bleibt`, async () => {
    const a = await erster301(datei, pfad);
    assert.equal(a.status, 301);
    assert.equal(a.headers.get('Location'), `/products/the-alpha${Q}`);
  });
}

test('/pages/qi-master-vorverkauf -> 301 /pages/The-Alpha in einem Sprung', async () => {
  const a = await erster301('pages.qi-master-vorverkauf.jsx', '/pages/qi-master-vorverkauf');
  assert.equal(a.status, 301);
  assert.equal(a.headers.get('Location'), `/pages/The-Alpha${Q}`);
});

test('Warenkorb-Zeile/Produktkarte des Qi Alpha zeigt direkt auf /products/the-alpha', () => {
  for (const handle of ['qi-master', 'qi-alpha', 'qi-master-wunschnummer', 'qi-alpha-goldkette']) {
    const url = getVariantUrl({
      handle,
      pathname: '/cart',
      searchParams: new URLSearchParams(),
      selectedOptions: [{name: 'Title', value: 'Alpha 7/111'}],
    });
    assert.equal(url, '/products/the-alpha?Title=Alpha+7%2F111', handle);
  }
  // Gegenrichtung: Namensvetter behalten ihren Pfad.
  for (const handle of ['qione', 'qi-alpha-b', 'qione-kette']) {
    const url = getVariantUrl({handle, pathname: '/', searchParams: new URLSearchParams()});
    assert.equal(url, `/products/${handle}`);
  }
});

test('Sitemap: Shopify-Handle qi-master/qi-alpha nie als Altpfad', async () => {
  const {loader} = await ladeMitAufgeloestenImporten(
    route('sitemap.$type.$page[.xml].jsx'),
    'umzug-the-alpha-sitemap',
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
  assert.ok(!locs.some((u) => /\/products\/qi-(master|alpha)$/.test(u)), locs.join(' '));
  assert.ok(locs.includes(`${BASIS}/products/qione`), locs.join(' '));
  // Vorschau-noindex (Christian 23.10.): solange /products/the-alpha dort
  // steht, fehlt er in der Sitemap; fliegt der Eintrag raus, steht er genau einmal.
  const soll = istVorschauNoindex('/products/the-alpha') ? 0 : 1;
  assert.equal(locs.filter((u) => u.endsWith('/products/the-alpha')).length, soll, locs.join(' '));
});

test('/products/the-alpha trägt das Vorschau-noindex wie Shop A', () => {
  assert.equal(istVorschauNoindex('/products/the-alpha'), true);
  assert.equal(istVorschauNoindex('/products/The-Alpha'), true);
});
