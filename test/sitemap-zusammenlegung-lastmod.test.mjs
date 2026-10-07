/**
 * Hermetischer Test: die Zielseiten einer Zusammenlegung tragen in
 * sitemap/pages/1.xml deren Datum (~/lib/zusammenlegungen-lastmod).
 *
 *   node test/sitemap-zusammenlegung-lastmod.test.mjs      # exit 0 = grün
 *
 * Gemessen an der ECHTEN Kind-Route (wie sitemap-nur-route-seiten.test.mjs),
 * mit einer Storefront-Attrappe, deren `updatedAt` je Handle frei gesetzt
 * wird. Jeder Arm hat eine Gegenrichtung daneben: ein Nachtrag, der jedes
 * Datum überschreibt, würde den Anhebe-Arm genauso grün machen.
 */
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const routePfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');

const {zielLastmod, ZUSAMMENLEGUNGS_STAENDE} = await ladeMitAufgeloestenImporten(
  join(appDir, 'lib', 'zusammenlegungen-lastmod.js'),
  'sitemap-zl-lastmod-lib',
);

/** @param {Record<string, string>} daten handle -> updatedAt */
function storefrontAttrappe(daten) {
  return {
    async query() {
      return {
        sitemap: {
          resources: {
            items: Object.entries(daten).map(([handle, updatedAt]) => ({
              handle,
              updatedAt,
            })),
          },
        },
      };
    },
  };
}

async function seitenXml(daten) {
  const {loader} = await ladeMitAufgeloestenImporten(
    routePfad,
    'sitemap-zl-lastmod-route',
  );
  const antwort = await loader({
    request: new Request('https://qiblanco.com/sitemap/pages/1.xml'),
    params: {type: 'pages', page: '1'},
    context: {storefront: storefrontAttrappe(daten)},
  });
  return antwort.text();
}

/** lastmod des Eintrags, dessen <loc> auf `pfad` endet (oder null). */
function lastmodVon(xml, pfad) {
  for (const m of xml.matchAll(/<url>[\s\S]*?<\/url>/g)) {
    if (!m[0].includes(`${pfad}</loc>`)) continue;
    const lm = m[0].match(/<lastmod>([^<]*)<\/lastmod>/);
    return lm ? lm[1] : null;
  }
  return undefined;
}

let grün = 0;
async function pruefe(name, fn) {
  await fn();
  grün += 1;
  console.log(`  ok  ${name}`);
}

const ziele = zielLastmod();
const AM = ZUSAMMENLEGUNGS_STAENDE[0]?.am;
assert.ok(AM, 'kein Zusammenlegungs-Stand — der Test hätte keinen Gegenstand');

await pruefe('die drei Shopify-Ziele des 07.10. tragen ein Datum', async () => {
  for (const z of ['/pages/technologie', '/pages/studien', '/pages/faq']) {
    assert.equal(ziele.get(z), AM, `${z} fehlt in zielLastmod()`);
  }
});

await pruefe('support und Produkt-Ziele bekommen KEIN Datum', async () => {
  // support-1 und qione-1 gingen ohne übernommenen Inhalt auf.
  assert.equal(ziele.has('/pages/support'), false);
  assert.equal(ziele.has('/products/qione-2-pro'), false);
});

await pruefe('altes updatedAt wird auf das Zusammenlegungs-Datum angehoben', async () => {
  const xml = await seitenXml({
    technologie: '2022-12-12T07:36:24Z',
    studien: '2024-11-22T20:13:10Z',
    faq: '2026-09-02T02:22:06Z',
    support: '2022-11-21T00:22:33Z',
  });
  assert.equal(lastmodVon(xml, '/pages/technologie'), AM);
  assert.equal(lastmodVon(xml, '/pages/studien'), AM);
  assert.equal(lastmodVon(xml, '/pages/faq'), AM);
  // Gegenrichtung: eine Seite ohne Zusammenlegung bleibt unberührt.
  assert.equal(lastmodVon(xml, '/pages/support'), '2022-11-21T00:22:33Z');
});

await pruefe('ein JÜNGERES updatedAt bleibt stehen (nie zurückdrehen)', async () => {
  const xml = await seitenXml({
    technologie: '2027-01-01T00:00:00Z',
    studien: '2024-11-22T20:13:10Z',
  });
  assert.equal(lastmodVon(xml, '/pages/technologie'), '2027-01-01T00:00:00Z');
  assert.equal(lastmodVon(xml, '/pages/studien'), AM);
});

await pruefe('Nur-Route-Ziel (lexikon) wird ebenfalls erfasst', async () => {
  const xml = await seitenXml({studien: '2024-11-22T20:13:10Z'});
  const lm = lastmodVon(xml, '/pages/lexikon');
  assert.ok(lm, '/pages/lexikon steht ohne lastmod in der Sitemap');
  assert.ok(Date.parse(lm) >= Date.parse(AM), `lexikon ${lm} < ${AM}`);
});

await pruefe('Namensvetter wird nicht mitgetroffen', async () => {
  const xml = await seitenXml({
    'faq-alt': '2020-01-01T00:00:00Z',
    faq: '2020-01-01T00:00:00Z',
  });
  assert.equal(lastmodVon(xml, '/pages/faq-alt'), '2020-01-01T00:00:00Z');
  assert.equal(lastmodVon(xml, '/pages/faq'), AM);
});

console.log(`sitemap-zusammenlegung-lastmod: ${grün} Arme grün`);
