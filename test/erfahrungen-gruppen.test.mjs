/**
 * Hermetischer Test der Zusammenführung „ein Mensch, ein Eintrag" und der
 * strukturierten Daten von /pages/erfahrungen.
 *
 *   node test/erfahrungen-gruppen.test.mjs      # exit 0 = grün
 *
 * WARUM ES DIESEN TEST GIBT: Christian hat am 2026-09-11 zwei doppelte Namen
 * gemeldet (Yann Sura, Scott Schwenk). Gemessen waren es DREI Fälle — Constantin
 * Preis stand ebenfalls zweimal da. Ein Fix, der die zwei gemeldeten Namen
 * zusammenführt, hätte den dritten stehen lassen und trotzdem „erledigt"
 * ausgesehen. Dieser Test prüft deshalb die EIGENSCHAFT (kein Name doppelt),
 * nicht die drei bekannten Namen: ein vierter Doppelbeitrag im Datenmodul fällt
 * damit von selbst auf.
 *
 * ROT-VOR-GRÜN, UND ZWAR AM VERTRAG STATT AN EINER BEHAUPTUNG: Arm 3 speist eine
 * künstlich verdoppelte Beitragsliste ein und VERLANGT, dass die Gruppierung sie
 * zusammenzieht. Ohne diesen Arm wäre der Test auch dann grün, wenn
 * `gruppiereNachSprecher` die Liste bloß unverändert durchreichte und das
 * Datenmodul zufällig keine Dublette mehr enthielt — also grün aus Abwesenheit.
 *
 * WAS ER NICHT KANN: er misst den Code, nicht die Auslieferung. Ob am Live-Rand
 * wirklich 13 `h3.erf__name` stehen und der Graph im HTML ankommt, misst
 * homepage-bauer/pruefungen/probe_erfahrungen_hell.py am echten Shop.
 */
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const appDir = join(hier, '..', 'app');

/**
 * Hydrogens `~/`-Alias gibt es nur im Vite-Build, nicht in nacktem node. Die
 * Hausvorlage (test/sitemap-nur-route-seiten.test.mjs) schreibt den Alias in
 * EINER Datei um; hier reicht das nicht, weil die Kette drei Glieder hat
 * (Route -> Schema -> Gruppen -> Datenmodul). Umgeschrieben wird deshalb
 * REKURSIV, mit Zwischenspeicher gegen Mehrfacharbeit — die geladene Datei ist
 * damit byte-gleich zur echten, ausser in ihren Import-Zeilen.
 *
 * WEGWERF-VERZEICHNIS statt Ablage neben der Quelle: eine .mjs-Datei im
 * Projektbaum würde vom nächsten Lint- und Deploy-Lauf als echte Quelldatei
 * gelesen. `tmpdir()` folgt TMPDIR und landet damit auf dem Volume, nicht im
 * RAM-Wurzeldateisystem.
 */
const tmp = mkdtempSync(join(tmpdir(), 'erfahrungen-test-'));
process.on('exit', () => rmSync(tmp, {recursive: true, force: true}));

const gespiegelt = new Map();
function spiegele(rel) {
  if (gespiegelt.has(rel)) return gespiegelt.get(rel);
  const quelle = readFileSync(join(appDir, rel), 'utf8');
  const ziel = join(tmp, `${gespiegelt.size}-${basename(rel)}`);
  // Platzhalter VOR dem Auflösen eintragen: ein Zyklus im Importgraphen liefe
  // sonst in eine Endlosschleife statt in eine Fehlermeldung.
  gespiegelt.set(rel, ziel);
  writeFileSync(
    ziel,
    quelle.replace(/from '~\/([^']+)'/g, (_, r) => {
      const mitEndung = /\.[a-z]+$/.test(r) ? r : `${r}.js`;
      return `from '${pathToFileURL(spiegele(mitEndung)).href}'`;
    }),
  );
  return ziel;
}

const lade = (rel) => import(pathToFileURL(spiegele(rel)).href);

const {ERFAHRUNGS_BEITRAEGE} = await lade('data/erfahrungen-beitraege.js');
const {gruppiereNachSprecher, gruppenNachSprache, sprecherSlug} = await lade(
  'lib/erfahrungen-gruppen.js',
);
const {erfahrungenSchema} = await lade('lib/erfahrungen-schema.js');

/* ── Arm 1: kein Mensch steht zweimal ─────────────────────────────────────── */
const gruppen = gruppiereNachSprecher();
const namen = gruppen.map((g) => g.sprecher);
assert.equal(
  new Set(namen).size,
  namen.length,
  `Sprecher doppelt in der Gruppierung: ${namen.join(', ')}`,
);

/* ── Arm 2: kein Beitrag geht verloren, keiner kommt doppelt vor ──────────── */
const idsGruppiert = gruppen.flatMap((g) => g.videos.map((b) => b.videoId));
assert.equal(
  idsGruppiert.length,
  ERFAHRUNGS_BEITRAEGE.length,
  'Die Gruppierung hat Beiträge verloren oder verdoppelt.',
);
assert.equal(new Set(idsGruppiert).size, idsGruppiert.length);

/* ── Arm 3: der Rot-Arm — eine eingespeiste Dublette MUSS zusammenfallen ──── */
const erster = ERFAHRUNGS_BEITRAEGE[0];
const kuenstlich = [
  ...ERFAHRUNGS_BEITRAEGE,
  {...erster, videoId: `${erster.videoId}-zwilling`},
];
const mitDublette = gruppiereNachSprecher(kuenstlich);
assert.equal(
  mitDublette.length,
  gruppen.length,
  'Ein zweites Video desselben Menschen hat eine ZWEITE Gruppe erzeugt — ' +
    'genau der Zustand, den dieses Modul beseitigen soll.',
);
assert.equal(
  mitDublette.find((g) => g.sprecher === erster.sprecher).videos.length,
  gruppen.find((g) => g.sprecher === erster.sprecher).videos.length + 1,
  'Das zusätzliche Video ist nicht in der Gruppe seines Menschen gelandet.',
);

/* ── Arm 4: die Sprachabschnitte teilen die Menschen auf, sie doppeln nicht ─ */
const de = gruppenNachSprache('de');
const en = gruppenNachSprache('en');
assert.equal(de.length + en.length, gruppen.length);
assert.equal(
  de.filter((g) => en.some((e) => e.sprecher === g.sprecher)).length,
  0,
  'Ein Mensch steht in beiden Sprachabschnitten und ist damit wieder doppelt.',
);

/* ── Arm 5: Anker-Slugs sind eindeutig und ASCII ──────────────────────────── */
const slugs = gruppen.map((g) => g.slug);
assert.equal(new Set(slugs).size, slugs.length, 'Anker-Slug doppelt.');
for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, `Slug nicht ASCII: ${s}`);
assert.equal(sprecherSlug('André Stern'), 'andre-stern');
assert.equal(sprecherSlug('Nada & Kurt Tepperwein'), 'nada-kurt-tepperwein');

/* ── Arm 6: der Graph — VideoObject je Video, Person je MENSCH ────────────── */
const graph = erfahrungenSchema()['@graph'];
const typ = (t) => graph.filter((n) => n['@type'] === t);
const liste = typ('ItemList')[0];
const videos = liste.itemListElement;

assert.equal(videos.length, ERFAHRUNGS_BEITRAEGE.length);
assert.equal(liste.numberOfItems, videos.length);
assert.equal(
  typ('Person').length,
  gruppen.length,
  'Die Zahl der Person-Knoten folgt den MENSCHEN, nicht den Videos.',
);
assert.equal(typ('CollectionPage').length, 1);
assert.equal(typ('BreadcrumbList').length, 1);

for (const v of videos) {
  for (const feld of [
    'name',
    'description',
    'thumbnailUrl',
    'uploadDate',
    'duration',
    'embedUrl',
    'contentUrl',
  ]) {
    assert.ok(v[feld], `VideoObject ${v['@id']} ohne Pflichtfeld ${feld}`);
  }
  assert.match(v.uploadDate, /^\d{4}-\d{2}-\d{2}T/, `uploadDate ${v.uploadDate}`);
  assert.match(v.duration, /^PT/, `duration ${v.duration} ist nicht ISO-8601`);
}

/* Jeder actor-Verweis muss auf einen Knoten IM Graphen zeigen — ein
   @id-Verweis ins Leere ist ein kaputter Graph, den kein Validator meldet. */
const ids = new Set(graph.filter((n) => n['@id']).map((n) => n['@id']));
for (const v of videos) {
  assert.ok(ids.has(v.actor['@id']), `actor-Verweis ins Leere: ${v.actor['@id']}`);
}

/* ── Arm 7: KEINE Bewertungs-Auszeichnung, und das ist eine Entscheidung ──── */
const roh = JSON.stringify(graph);
assert.ok(
  !roh.includes('aggregateRating') && !roh.includes('"Review"'),
  'Review/aggregateRating im Graphen: Google spielt self-serving reviews auf ' +
    'eigener Domain nicht aus, und eine Sternezahl wäre eine Kennziffer, die ' +
    'wir über fremde Aussagen bilden. Begründung in app/lib/erfahrungen-schema.js.',
);

console.log(
  `OK — ${gruppen.length} Menschen, ${videos.length} Videos, ` +
    `${typ('Person').length} Person-Knoten, 0 Dubletten, 7 Arme.`,
);
