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
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');
const routePfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');

const ladeRoute = (wandle) =>
  ladeMitAufgeloestenImporten(routePfad, 'sitemap-nurroute-test', wandle);

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
      // Seit 2026-10-10 (GEO M3) steht die Zweitsicht als erstes Glied von
      // NICHT_IN_COLLECTIONS_SITEMAP (daneben die Vorlagen ohne Indexwert).
      const neu = quelle.replace(
        '  ...ausSitemapEntfernteKollektionen(),',
        `  '${opfer}',`,
      );
      assert.notEqual(
        neu,
        quelle,
        'Die Zeile `...ausSitemapEntfernteKollektionen(),` steht ' +
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

// ---------------------------------------------------------------------------
// PRODUKTE, DIE GOOGLEBOT NUR ALS 404 SIEHT (2026-10-06). Herleitung an der
// Definition in ~/lib/sitemap-bestand. Zwei Arme wie bei den Kollektionen:
// mit der Verdrahtung MUSS der Handle verschwinden, mit herausmutierter
// Verdrahtung MUSS er stehen bleiben.
// ---------------------------------------------------------------------------

// sitemap-bestand.js importiert selbst über `~/`, darum derselbe Auflöser
// wie für die Route, kein nacktes import().
const {IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE} = await ladeMitAufgeloestenImporten(
  join(appDir, 'lib', 'sitemap-bestand.js'),
  'sitemap-bestand-crawlermarkt-test',
);
assert.ok(
  IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE.length > 0,
  'Die Crawler-Markt-Liste ist leer — die zwei Arme unten hätten keinen ' +
    'Gegenstand. MESSAUSFALL.',
);
const CRAWLER_VERDRAHTUNG = '...IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE,';
const namensvetter = `${IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE[0]}-neu`;
const produktHandles = [
  'qione-2-pro',
  namensvetter,
  ...IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE,
];

await pruefe('Crawler-Markt: gelistete Produkte fehlen in der Produkt-Sitemap', async () => {
  const xml = await sitemapXml('products', produktHandles);
  for (const h of IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE) {
    assert.equal(zaehle(xml, `/products/${h}`), 0, `${h} steht trotz Liste in der Sitemap`);
  }
  assert.equal(zaehle(xml, '/products/qione-2-pro'), 1, 'qione-2-pro wurde mitgerissen');
  assert.equal(
    zaehle(xml, `/products/${namensvetter}`),
    1,
    `${namensvetter} wurde mitgerissen — der Filter ist nicht auf </loc> verankert`,
  );
});

await pruefe('Crawler-Markt: ohne Verdrahtung bleiben sie stehen (Mutation)', async () => {
  const xml = await sitemapXml('products', produktHandles, (quelle) => {
    assert.ok(
      quelle.includes(CRAWLER_VERDRAHTUNG),
      'Die Verdrahtung steht nicht mehr in der Route — die Mutation griffe ' +
        'ins Leere und Arm 1 wäre nicht belegt.',
    );
    return quelle.replace(CRAWLER_VERDRAHTUNG, '');
  });
  for (const h of IM_CRAWLER_MARKT_NICHT_ABRUFBARE_PRODUKTE) {
    assert.equal(zaehle(xml, `/products/${h}`), 1, `${h} fehlt auch ohne Verdrahtung`);
  }
});


// Die ZWEITE Quelle des Nachtrags: abgeleitete Pfade (Podcast-Paginierung).
const {NICHT_INDEXIERBARE_SEITEN} = await import(
  pathToFileURL(join(appDir, 'lib', 'seo.js')).href
);
const {SEITEN_ZAHL, seitenPfad, sitemapSeiten: podcastSeiten} =
  await ladeMitAufgeloestenImporten(
    join(appDir, 'lib', 'podcast-daten.server.js'),
    'podcast-daten-sitemap-test',
  );

// ---------------------------------------------------------------------------
// ZWEITE QUELLE DES NACHTRAGS: abgeleitete Pfade (Podcast-Paginierung).
// Naht-Befund Selbst-Debug 2026-09-04 — /pages/podcasts ist ein Shopify-
// Seitenobjekt und stand in der Sitemap, seine vier Folgeseiten sind reine
// Code-Routen und standen in KEINER. Der Crawlpfad über <a>-Links war intakt;
// der WEG der Auffindung fehlte.
// ---------------------------------------------------------------------------

assert.ok(
  SEITEN_ZAHL > 1,
  'Die Podcast-Sektion hat nur eine Seite — die Folgeseiten-Fälle unten ' +
    'hätten dann keinen Gegenstand. MESSAUSFALL, kein grüner Lauf.',
);

await pruefe('jede Seite der Podcast-Paginierung steht in der Sitemap', async () => {
  // 'podcasts' ist als Shopify-Seitenobjekt DA (so ist es live) — Seite 1 kommt
  // also von Shopify, die Folgeseiten können nur aus dem Nachtrag kommen.
  const xml = await sitemapXml('pages', ['studien', 'podcasts']);
  for (const s of podcastSeiten()) {
    assert.equal(
      zaehle(xml, s.pfad),
      1,
      `${s.pfad} fehlt in der Seiten-Sitemap (oder steht mehrfach)`,
    );
  }
});

await pruefe('die Menge folgt SEITEN_ZAHL, nicht einer Literal-Liste', async () => {
  // Der eigentliche Auftragspunkt: eine hingeschriebene Liste der heutigen
  // vier Folgeseiten wäre ab der ersten neuen Podcast-Seite falsch, ohne dass
  // etwas rot würde. Hier wird gegen die DATENWAHRHEIT gezählt, nie gegen
  // eine Zahl im Test — ein Zähler-Pin wäre hier rot-by-construction.
  assert.equal(podcastSeiten().length, SEITEN_ZAHL);
  assert.equal(
    podcastSeiten().at(-1).pfad,
    seitenPfad(SEITEN_ZAHL),
    'Die letzte abgeleitete Seite ist nicht seitenPfad(SEITEN_ZAHL)',
  );
  const xml = await sitemapXml('pages', ['studien', 'podcasts']);
  const podcastUrls = locs(xml).filter((u) =>
    /\/pages\/podcasts(\/seite-\d+)?$/.test(u),
  );
  assert.equal(
    podcastUrls.length,
    SEITEN_ZAHL,
    `Sitemap führt ${podcastUrls.length} Podcast-Seiten, die Daten kennen ${SEITEN_ZAHL}`,
  );
});

await pruefe('Seite 1 steht genau einmal, obwohl beide Quellen sie kennen', async () => {
  // Der Nachtrag führt Seite 1 bewusst mit (fiele ihr Shopify-Objekt weg,
  // trägt ihn diese Liste). Solange das Objekt existiert, darf daraus KEIN
  // Doppel-Eintrag werden.
  const xml = await sitemapXml('pages', ['studien', 'podcasts']);
  assert.equal(zaehle(xml, '/pages/podcasts'), 1);
});

await pruefe('Podcast-Seiten NUR in der Seiten-Sitemap', async () => {
  const xml = await sitemapXml('products', ['qione-2-pro']);
  assert.equal(
    locs(xml).filter((u) => u.includes('/pages/podcasts')).length,
    0,
  );
});

// ---------------------------------------------------------------------------
// DIE HYGIENE-SPERRE: der Nachtrag läuft NACH dem Versteckt-Filter und
// könnte zurückholen, was dieser gerade entfernt hat. Die Fixtur ersetzt per
// `wandle` nur die EINGABE (NUR_ROUTE_SEITEN), nicht die Logik.
// ---------------------------------------------------------------------------

await pruefe('ein noindex-Handle kommt durch den Nachtrag NICHT zurück', async () => {
  const noindexHandle = NICHT_INDEXIERBARE_SEITEN[0];
  assert.ok(noindexHandle, 'keine noindex-Seite definiert — Fall ohne Gegenstand');
  const fixtur = [
    {pfad: `/pages/${noindexHandle}`, grund: 'Fixtur: noindex-Seite im Nachtrag'},
    {pfad: `/pages/${noindexHandle}/unterseite`, grund: 'Fixtur: Unterpfad davon'},
    {pfad: '/pages/kontroll-fixtur', grund: 'Fixtur: Kontrolle, muss durchkommen'},
  ];
  // Ersetzt wird nur die EINGABE der ersten Quelle (NUR_ROUTE_SEITEN) in der
  // echten Route; Sperre, Dedup und Injektor bleiben der echte Code.
  const xml = await sitemapXml('pages', ['studien'], (quelle) => {
    const anker = '[...NUR_ROUTE_SEITEN, ...podcastSitemapSeiten()]';
    assert.ok(
      quelle.includes(anker),
      'Die Zusammenfuehrung beider Quellen steht nicht mehr in der Route — ' +
        'die Fixtur griffe ins Leere und der Fall wäre falsch grün.',
    );
    return quelle.replace(anker, `[...${JSON.stringify(fixtur)}, ...podcastSitemapSeiten()]`);
  });
  assert.equal(
    zaehle(xml, `/pages/${noindexHandle}`),
    0,
    `${noindexHandle} trägt noindex und wurde trotzdem nachgetragen`,
  );
  assert.equal(
    zaehle(xml, `/pages/${noindexHandle}/unterseite`),
    0,
    'Der Unterpfad einer noindex-Seite wurde nachgetragen — die ' +
      'Pfad-zu-Handle-Umrechnung greift nicht',
  );
  // GEGENPROBE, ohne die der Fall auch bei einem komplett wirkungslosen
  // Nachtrag grün wäre: die Kontroll-Fixtur MUSS ankommen.
  assert.equal(
    zaehle(xml, '/pages/kontroll-fixtur'),
    1,
    'Die Kontroll-Fixtur fehlt — der Nachtrag trägt gar nichts ein, der ' +
      'Fall oben ist damit ohne Aussage',
  );
});


console.log(`\nsitemap-nur-route-seiten: ${grün} Prüfungen grün`);
