/**
 * Hermetischer Test der ECHTEN Sitemap-Route fuer Seiten, die es NUR als
 * Hydrogen-Route gibt (kein Shopify-Seitenobjekt).
 *
 *   node test/sitemap-nur-route-seiten.test.mjs      # exit 0 = gruen
 *
 * WARUM ER NEBEN sitemap-artikel.test.mjs STEHT: jener prueft das ENTFERNEN
 * aus der Sitemap, dieser das ERGAENZEN. Beide Richtungen laufen durch
 * denselben Schnell-Ausstieg ("nichts zu tun -> Antwort unveraendert
 * durchreichen"), und genau dort war die Falle schon einmal: fuer `articles`
 * hat er den Filter uebersprungen. Fuer `pages` OHNE versteckte Handles
 * haette er jetzt die Ergaenzung uebersprungen — dieselbe Stelle, andere
 * Richtung.
 *
 * DIE ERGAENZUNG IST EINE ZUSAGE AN GOOGLE: was hier in die Sitemap kommt,
 * muss live antworten. Die Live-Haelfte dieser Zusage prueft
 * homepage-bauer/pruefungen/probe_partnerseite_naht_sitemap_route.py am
 * echten Shop; dieser Test prueft die Mechanik ohne Netz.
 *
 * Wie sitemap-artikel.test.mjs: die Route wird als Datei gelesen und nur die
 * `~/`-Import-Spezifizierer werden aufgeloest — kein Nachbau, kein zweites
 * Testobjekt.
 */
import assert from 'node:assert/strict';
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const routePfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');

async function ladeRoute() {
  const quelle = readFileSync(routePfad, 'utf8').replace(
    /from '~\/([^']+)'/g,
    (_, rest) => `from '${pathToFileURL(join(appDir, rest)).href}.js'`,
  );
  const ziel = join(hier, '..', `.sitemap-nurroute-test-${process.pid}.mjs`);
  writeFileSync(ziel, quelle);
  try {
    return await import(pathToFileURL(ziel).href);
  } finally {
    rmSync(ziel, {force: true});
  }
}

const {NUR_ROUTE_SEITEN, AUS_SITEMAP_ENTFERNTE_SEITEN} = await import(
  pathToFileURL(join(appDir, 'lib', 'seo.js')).href
);

/** Storefront-Attrappe: liefert die genannten Handles als Sitemap-Ressourcen. */
function storefrontAttrappe(handles) {
  return {
    async query() {
      return {
        sitemap: {
          resources: {
            items: handles.map((handle) => ({
              handle,
              updatedAt: '2026-09-05T00:00:00Z',
            })),
          },
        },
      };
    },
  };
}

async function sitemapXml(typ, handles) {
  const {loader} = await ladeRoute();
  const antwort = await loader({
    request: new Request(`https://qiblanco.com/sitemap/${typ}/1.xml`),
    params: {type: typ, page: '1'},
    context: {storefront: storefrontAttrappe(handles)},
  });
  return antwort.text();
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const zaehle = (xml, pfad) =>
  locs(xml).filter((u) => u.endsWith(pfad)).length;

let gruen = 0;
async function pruefe(name, fn) {
  await fn();
  gruen += 1;
  console.log(`  ok  ${name}`);
}

assert.ok(
  NUR_ROUTE_SEITEN.length > 0,
  'Die Liste ist leer — dieser Test haette dann keinen Gegenstand und wuerde ' +
    'strukturell nie rot. Das ist ein MESSAUSFALL, kein gruener Lauf.',
);

await pruefe('jede Nur-Route-Seite steht in sitemap/pages/1.xml', async () => {
  const xml = await sitemapXml('pages', ['studien', 'support']);
  for (const s of NUR_ROUTE_SEITEN) {
    assert.equal(
      zaehle(xml, s.pfad),
      1,
      `${s.pfad} fehlt in der Seiten-Sitemap (oder steht mehrfach)`,
    );
  }
});

await pruefe('Ergaenzung greift AUCH ohne versteckte Handles', async () => {
  // Der Schnell-Ausstieg der Route: ohne versteckte Handles wurde die Antwort
  // frueher unveraendert durchgereicht. Genau dieser Fall.
  const xml = await sitemapXml('pages', ['studien']);
  assert.ok(!AUS_SITEMAP_ENTFERNTE_SEITEN.includes('studien'));
  assert.equal(zaehle(xml, NUR_ROUTE_SEITEN[0].pfad), 1);
});

await pruefe('kein Doppel-Eintrag, wenn es das Shopify-Objekt doch gibt', async () => {
  const handle = NUR_ROUTE_SEITEN[0].pfad.split('/').pop();
  const xml = await sitemapXml('pages', ['studien', handle]);
  assert.equal(
    zaehle(xml, NUR_ROUTE_SEITEN[0].pfad),
    1,
    'Pfad steht doppelt — die Idempotenz-Pruefung greift nicht',
  );
});

await pruefe('das Entfernen versteckter Handles wirkt unveraendert weiter', async () => {
  const versteckt = AUS_SITEMAP_ENTFERNTE_SEITEN[0];
  const xml = await sitemapXml('pages', ['studien', versteckt]);
  assert.ok(
    !locs(xml).some((u) => u.endsWith(`/pages/${versteckt}`)),
    `${versteckt} steht trotz Ausschluss in der Sitemap`,
  );
  assert.equal(zaehle(xml, '/pages/studien'), 1);
});

await pruefe('andere Sitemap-Typen werden NICHT ergaenzt', async () => {
  const xml = await sitemapXml('products', ['qione-2-pro']);
  for (const s of NUR_ROUTE_SEITEN) {
    assert.equal(zaehle(xml, s.pfad), 0, `${s.pfad} in der Produkt-Sitemap`);
  }
});

await pruefe('die ergaenzte URL ist absolut und auf der Produktions-Domain', async () => {
  const xml = await sitemapXml('pages', ['studien']);
  const treffer = locs(xml).find((u) => u.endsWith(NUR_ROUTE_SEITEN[0].pfad));
  assert.equal(treffer, `https://qiblanco.com${NUR_ROUTE_SEITEN[0].pfad}`);
});

console.log(`\nsitemap-nur-route-seiten: ${gruen} Pruefungen gruen`);
