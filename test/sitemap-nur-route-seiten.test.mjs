/**
 * Hermetischer Test der ECHTEN Sitemap-Route für Seiten, die es NUR als
 * Hydrogen-Route gibt (kein Shopify-Seitenobjekt).
 *
 *   node test/sitemap-nur-route-seiten.test.mjs      # exit 0 = grün
 *
 * WARUM ER NEBEN sitemap-artikel.test.mjs STEHT: jener prueft das ENTFERNEN
 * aus der Sitemap, dieser das ERGÄNZEN. Beide Richtungen laufen durch
 * denselben Schnell-Ausstieg ("nichts zu tun -> Antwort unveraendert
 * durchreichen"), und genau dort war die Falle schon einmal: für `articles`
 * hat er den Filter übersprungen. Für `pages` OHNE versteckte Handles
 * hätte er jetzt die Ergänzung übersprungen — dieselbe Stelle, andere
 * Richtung.
 *
 * DIE ERGÄNZUNG IST EINE ZUSAGE AN GOOGLE: was hier in die Sitemap kommt,
 * muss live antworten. Die Live-Haelfte dieser Zusage prueft
 * homepage-bauer/pruefungen/probe_partnerseite_naht_sitemap_route.py am
 * echten Shop; dieser Test prueft die Mechanik ohne Netz.
 *
 * SEIT 2026-09-08 STEHT HIER AUCH DIE KOLLEKTIONS-ZWEITSICHT. Sie ist der
 * schwierige Fall, weil ihre Liste HEUTE ABSICHTLICH LEER ist: alle fünf
 * noindex-Kollektionen bleiben in der Sitemap, weil sie sonst nie wieder
 * gecrawlt und ihr `noindex` nie gelesen würde. Ein Test, der nur „steht
 * frontpage noch drin?" fragt, wäre damit grün aus ABWESENHEIT — er würde
 * auch dann bestehen, wenn `collections` gar nicht verdrahtet wäre. Der
 * Nachweis läuft deshalb als ZWEIARMIGE MUTATION an der Route selbst
 * (`ladeRoute` mit `wandle`): mit einer künstlich gefüllten Liste MUSS der
 * Handle verschwinden, ohne sie MUSS er stehenbleiben. Erst beide Arme
 * zusammen belegen, dass die Möglichkeit gebaut ist und der Vollzug bewusst
 * aussteht.
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

async function ladeRoute(wandle = (q) => q) {
  const quelle = wandle(
    readFileSync(routePfad, 'utf8').replace(
      /from '~\/([^']+)'/g,
      (_, rest) => `from '${pathToFileURL(join(appDir, rest)).href}.js'`,
    ),
  );
  const ziel = join(
    hier,
    '..',
    `.sitemap-nurroute-test-${process.pid}-${lfd++}.mjs`,
  );
  writeFileSync(ziel, quelle);
  try {
    return await import(pathToFileURL(ziel).href);
  } finally {
    rmSync(ziel, {force: true});
  }
}

let lfd = 0;

const {
  NUR_ROUTE_SEITEN,
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  ausSitemapEntfernteKollektionen,
  NICHT_INDEXIERBARE_KOLLEKTIONEN,
} = await import(pathToFileURL(join(appDir, 'lib', 'seo.js')).href);

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

async function sitemapXml(typ, handles, wandle) {
  const {loader} = await ladeRoute(wandle);
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

let grün = 0;
async function pruefe(name, fn) {
  await fn();
  grün += 1;
  console.log(`  ok  ${name}`);
}

assert.ok(
  NUR_ROUTE_SEITEN.length > 0,
  'Die Liste ist leer — dieser Test hätte dann keinen Gegenstand und würde ' +
    'strukturell nie rot. Das ist ein MESSAUSFALL, kein grüner Lauf.',
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

await pruefe('Ergänzung greift AUCH ohne versteckte Handles', async () => {
  // Der Schnell-Ausstieg der Route: ohne versteckte Handles wurde die Antwort
  // früher unveraendert durchgereicht. Genau dieser Fall.
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
    'Pfad steht doppelt — die Idempotenz-Prüfung greift nicht',
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

await pruefe('andere Sitemap-Typen werden NICHT ergänzt', async () => {
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

// ---------------------------------------------------------------------------
// KOLLEKTIONS-ZWEITSICHT (2026-09-08). Herleitung im Kopf dieser Datei.
// ---------------------------------------------------------------------------

assert.ok(
  NICHT_INDEXIERBARE_KOLLEKTIONEN.length > 0,
  'Keine noindex-Kollektion im Bestand — die vier Prüfungen unten hätten ' +
    'dann keinen Gegenstand und wären strukturell nie rot. MESSAUSFALL.',
);

await pruefe('Zweitsicht ist eine TEILMENGE der noindex-Liste', async () => {
  // Der ganze Zweck der Trennung: aus der Sitemap fliegt nur, was ohnehin
  // schon noindex trägt — nie umgekehrt. Die Prüfung ist richtungsagnostisch
  // und bleibt gültig, wenn später ein Eintrag auf `ausSitemap: true` kippt.
  for (const handle of ausSitemapEntfernteKollektionen()) {
    assert.ok(
      NICHT_INDEXIERBARE_KOLLEKTIONEN.includes(handle),
      `${handle} fliegt aus der Sitemap, trägt aber kein noindex`,
    );
  }
});

await pruefe('was NICHT auf ausSitemap steht, bleibt in der Sitemap', async () => {
  // Der gewollte Zustand, nicht als Zahl festgenagelt: geprüft wird das
  // PRÄDIKAT (`ausSitemap`), nicht die heutige Liste. Kippt jemand einen
  // Eintrag, wandert er von dieser Prüfung in die nächste — der Test muss
  // dafür nicht angefasst werden.
  const xml = await sitemapXml('collections', NICHT_INDEXIERBARE_KOLLEKTIONEN);
  for (const handle of NICHT_INDEXIERBARE_KOLLEKTIONEN) {
    if (ausSitemapEntfernteKollektionen().includes(handle)) continue;
    assert.equal(
      zaehle(xml, `/collections/${handle}`),
      1,
      `${handle} ist aus der Sitemap verschwunden, ohne dass jemand das ` +
        'entschieden hätte — für diese Handles ist die Sitemap der einzige ' +
        'Weg, auf dem Google ihr noindex noch liest',
    );
  }
});

await pruefe('MUTATIONSARM: eine gefüllte Zweitsicht entfernt wirklich', async () => {
  // OHNE diesen Arm wäre die Prüfung darüber grün aus Abwesenheit: sie wäre
  // auch dann bestanden, wenn `collections` in VERSTECKTE_HANDLES gar nicht
  // stünde. Hier wird die Route mit einer künstlich gefüllten Liste geladen —
  // erst das belegt, dass der Schlüssel gelesen und der Handle am
  // `</loc>`-Anker getroffen wird.
  const [opfer, ...rest] = NICHT_INDEXIERBARE_KOLLEKTIONEN;
  assert.ok(rest.length > 0, 'braucht mindestens zwei Handles');
  const xml = await sitemapXml(
    'collections',
    NICHT_INDEXIERBARE_KOLLEKTIONEN,
    (quelle) => {
      const neu = quelle.replace(
        'collections: ausSitemapEntfernteKollektionen(),',
        `collections: ['${opfer}'],`,
      );
      assert.notEqual(
        neu,
        quelle,
        'Die Zeile `collections: ausSitemapEntfernteKollektionen(),` steht ' +
          'nicht mehr in der Route — die Mutation hat ins Leere gegriffen ' +
          'und der Arm wäre falsch grün.',
      );
      return neu;
    },
  );
  assert.equal(
    zaehle(xml, `/collections/${opfer}`),
    0,
    `${opfer} steht trotz gefüllter Zweitsicht in der Sitemap`,
  );
  for (const handle of rest) {
    assert.equal(
      zaehle(xml, `/collections/${handle}`),
      1,
      `${handle} wurde mitgerissen — der Filter schneidet zu breit`,
    );
  }
});

await pruefe('die Kollektions-Sitemap wird NICHT um Seiten ergänzt', async () => {
  const xml = await sitemapXml('collections', NICHT_INDEXIERBARE_KOLLEKTIONEN);
  for (const s of NUR_ROUTE_SEITEN) {
    assert.equal(zaehle(xml, s.pfad), 0, `${s.pfad} in der Kollektions-Sitemap`);
  }
});

console.log(`\nsitemap-nur-route-seiten: ${grün} Prüfungen grün`);
