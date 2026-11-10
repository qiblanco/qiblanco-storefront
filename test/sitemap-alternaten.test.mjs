/**
 * Hermetischer Test der ECHTEN Sitemap-Route: keine hreflang-Alternaten.
 *
 *   node test/sitemap-alternaten.test.mjs      # exit 0 = gruen
 *
 * WAS ER SCHUETZT: bis 2026-10-31 rief die Route `getSitemap` mit der
 * unveraenderten Hydrogen-Schablone `locales: ['EN-US', 'EN-CA', 'FR-CA']`.
 * Jede Sitemap-Adresse trug damit drei `xhtml:link`-Alternaten auf
 * `/EN-US/…`, `/EN-CA/…`, `/FR-CA/…` — Pfade, die es hier nicht gibt: der
 * Catch-All (`~/lib/catchall.server`, D-063) schickt sie per 302 auf die
 * deutsche Seite ohne Praefix. Gemessen 2026-10-30: 207 solcher Alternaten,
 * 19 Praefix-URLs mit 120 Impressionen in der Search Console. Dazu
 * widersprachen sie dem HTML-hreflang (`~/lib/hreflang`, de/en/x-default
 * gegen qi-blanco.com).
 *
 * DIE ENTSCHEIDUNG, die dieser Test festhaelt: die Sitemap traegt GAR KEINE
 * Alternaten. Das Sprachpaar steht an genau einer Stelle, im HTML-Kopf, aus
 * homepage-bauer/shop-switch/shop-mapping.yaml. Eine zweite Kopie in der
 * Sitemap waere eine zweite Stelle, die still davon abweichen kann — und
 * genau das war der Defekt.
 *
 * Der Test laedt die echte Route mit aufgeloesten `~/`-Importen (wie
 * test/sitemap-artikel.test.mjs) und fragt ALLE fuenf Sitemap-Typen ab, weil
 * die Schablone in allen fuenf stand und ein Fix an nur einem Zweig die
 * anderen vier offen liesse.
 */
import assert from 'node:assert/strict';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const routePfad = join(hier, '..', 'app', 'routes', 'sitemap.$type.$page[.xml].jsx');

const TYPEN = ['products', 'pages', 'collections', 'articles', 'blogs'];
const HANDLES = ['qione-2-pro', 'support', 'kohaerentes-wasser-was-die-forschung-misst'];

/** Attrappe: jede Ressourcen-Abfrage liefert dieselben drei Handles. */
const storefront = {
  async query(anfrage) {
    const text = String(anfrage);
    if (text.includes('SitemapArtikelPfade')) {
      return {
        blogs: {
          pageInfo: {hasNextPage: false},
          nodes: [
            {
              handle: 'wissen',
              artikel: {
                nodes: HANDLES.map((handle) => ({handle})),
                pageInfo: {hasNextPage: false},
              },
            },
          ],
        },
      };
    }
    if (text.includes('SitemapBlogBestand')) {
      return {blogs: {pageInfo: {hasNextPage: false}, nodes: []}};
    }
    return {
      sitemap: {
        resources: {
          items: HANDLES.map((handle) => ({
            handle,
            updatedAt: '2026-10-30T12:00:00Z',
          })),
        },
      },
    };
  },
};

async function sitemapXml(type) {
  const {loader} = await ladeMitAufgeloestenImporten(routePfad, 'sitemap-alternaten-test');
  const antwort = await loader({
    request: new Request(`https://qiblanco.com/sitemap/${type}/1.xml`),
    params: {type, page: '1'},
    context: {storefront},
  });
  return antwort.text();
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

let gruen = 0;
async function pruefe(name, fn) {
  await fn();
  gruen += 1;
  console.log(`  ok  ${name}`);
}

for (const type of TYPEN) {
  await pruefe(`${type}: kein xhtml:link-Alternat`, async () => {
    const xml = await sitemapXml(type);
    const alternaten = xml.match(/<xhtml:link\b[^>]*>/g) ?? [];
    assert.deepEqual(alternaten, [], `${type} traegt noch Alternaten`);
  });

  await pruefe(`${type}: keine Adresse mit Schablonen-Praefix`, async () => {
    const xml = await sitemapXml(type);
    assert.doesNotMatch(xml, /qiblanco\.com\/(EN-US|EN-CA|FR-CA)\//i);
  });

  // Gegenprobe, damit "keine Alternaten" nicht aus einer leeren Datei
  // kommt: die Adressen selbst muessen weiter da sein, ohne Praefix.
  await pruefe(`${type}: Adressen bleiben, ohne Praefix`, async () => {
    const gefunden = locs(await sitemapXml(type));
    assert.ok(gefunden.length > 0, `${type} ohne <loc>`);
    for (const loc of gefunden) {
      assert.match(loc, /^https:\/\/qiblanco\.com\/(products|pages|collections|blogs)\//);
    }
  });
}

console.log(`\nsitemap-alternaten: ${gruen} Pruefungen gruen`);
