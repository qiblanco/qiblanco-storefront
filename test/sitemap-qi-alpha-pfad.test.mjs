/**
 * Hermetischer Test: die Kaufseite des Qi Alpha steht in
 * sitemap/products/1.xml unter ihrem Routenpfad /products/qi-alpha, auch
 * solange der Shopify-Handle noch `qi-master` heißt (Handle-Wechsel erst in
 * s09 des Grossjobs 20261017 zum
 * neuen Namen). /products/qi-master ist eine 301 und gehört in
 * keine Sitemap.
 *
 *   node test/sitemap-qi-alpha-pfad.test.mjs      # exit 0 = grün
 *
 * Gegenrichtung daneben: ein Namensvetter (qione) behält seinen Pfad, sonst
 * wäre eine Abbildung "jedes Produkt auf qi-alpha" ebenso grün.
 */
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const routePfad = join(hier, '..', 'app', 'routes', 'sitemap.$type.$page[.xml].jsx');

function storefrontAttrappe(handles) {
  return {
    async query() {
      return {
        sitemap: {
          resources: {
            items: handles.map((handle) => ({handle, updatedAt: '2026-10-17T00:00:00Z'})),
          },
        },
      };
    },
  };
}

async function produkteXml(handles) {
  const {loader} = await ladeMitAufgeloestenImporten(routePfad, 'sitemap-qa-route');
  const antwort = await loader({
    request: new Request('https://qiblanco.com/sitemap/products/1.xml'),
    params: {type: 'products', page: '1'},
    context: {storefront: storefrontAttrappe(handles)},
  });
  return antwort.text();
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

let grün = 0;
async function pruefe(name, fn) {
  await fn();
  grün += 1;
  console.log(`  ok  ${name}`);
}

await pruefe('Shopify-Handle qi-master erscheint als /products/qi-alpha', async () => {
  const l = locs(await produkteXml(['qi-master', 'qione']));
  assert.ok(l.includes('https://qiblanco.com/products/qi-alpha'), l.join(' '));
  assert.ok(!l.some((u) => u.endsWith('/products/qi-master')), l.join(' '));
});

await pruefe('Nach dem Handle-Wechsel (qi-alpha) genau ein Eintrag, kein Altpfad', async () => {
  const l = locs(await produkteXml(['qi-alpha', 'qione']));
  assert.equal(l.filter((u) => u.endsWith('/products/qi-alpha')).length, 1);
  assert.ok(!l.some((u) => u.endsWith('/products/qi-master')));
});

await pruefe('Gegenrichtung: Namensvetter qione behält seinen Pfad', async () => {
  const l = locs(await produkteXml(['qi-master', 'qione']));
  assert.ok(l.includes('https://qiblanco.com/products/qione'), l.join(' '));
});

console.log(`${grün}/3 grün`);
