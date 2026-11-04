// BLACK FRIDAY 2026 (Grossjob 20261103-prio6-black-friday-2026-…, s04), ohne Vite:
//   node --test test/black-friday-2026.test.mjs
// Drei Teile: (1) Regeln app/data/black-friday-2026.js, (2) Durchsetzer im Quelltext
// (Schalter vor dem Zehn-Jahre-Zaun, Zehn-Jahre-Zaun unberuehrt, kein Bundle, kein Qi
// Alpha), (3) Server-Render der Uhr ueber esbuild.
// BF2026_REGELN zeigt fuer die Mutationsmatrix auf eine Kopie; jeder Mutant muss rot werden.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = resolve(HIER, '..');
const REGELN = process.env.BF2026_REGELN || join(WURZEL, 'app/data/black-friday-2026.js');
const r = await import(pathToFileURL(REGELN).href);
const lies = (p) => readFileSync(join(WURZEL, p), 'utf8');

const JOB_ORDNER =
  '/srv/openclaw/shared-state/claude-jobs/20261103-prio6-black-friday-2026-landingpage-apple-stil-4-angebote-ohne-bundles-countdown';
const ms = (iso) => Date.parse(iso);
const angebot = (key) => r.BF2026.angebote.find((a) => a.key === key);

/* ---- Eine Quelle ---------------------------------------------------------- */

test('Repo-Kopie ist byte-gleich zur Quelle im Job-Ordner (nur wenn vorhanden)', (t) => {
  const quelle = join(JOB_ORDNER, 'angebote-bf2026.json');
  if (!existsSync(quelle)) return t.skip('Job-Ordner nicht da');
  const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
  assert.equal(sha(join(WURZEL, 'app/data/black-friday-2026.json')), sha(quelle));
});

test('Seiten und Texte tragen keine zweite Zahl: kein Euro-Betrag ausserhalb der Quelle', () => {
  for (const datei of [
    'app/components/black-friday-2026/bf2026-texte.js',
    'app/components/black-friday-2026/Bf2026Seiten.jsx',
    'app/components/black-friday-2026/Bf2026Kauf.jsx',
  ]) {
    assert.doesNotMatch(lies(datei), /\d\s?€/, datei);
  }
});

/* ---- Schalter ------------------------------------------------------------- */

test('Schalter: Standard off, Umgebung off/vorschau/on gewinnt, sonst Standard', () => {
  assert.equal(r.BF2026_STANDARD, 'off');
  assert.equal(r.bf2026Modus(undefined), 'off');
  assert.equal(r.bf2026Modus({}), 'off');
  for (const w of ['off', 'vorschau', 'on']) assert.equal(r.bf2026Modus({BF2026_SEITEN: w}), w);
  for (const w of ['', 'ON', 'true', 'an']) assert.equal(r.bf2026Modus({BF2026_SEITEN: w}), 'off');
});

test('bf_jetzt verstellt die Uhr nur in der Vorschau', () => {
  const url = 'https://x.test/pages/bf-deals?bf_jetzt=2026-11-28T12:00:00Z';
  const echt = ms('2026-11-03T12:00:00Z');
  assert.deepEqual(r.bf2026Jetzt({modus: 'vorschau', url, ms: echt}), {
    ms: ms('2026-11-28T12:00:00Z'),
    gepinnt: '2026-11-28T12:00:00Z',
  });
  for (const modus of ['on', 'off']) {
    assert.deepEqual(r.bf2026Jetzt({modus, url, ms: echt}), {ms: echt, gepinnt: null});
  }
  assert.deepEqual(
    r.bf2026Jetzt({modus: 'vorschau', url: 'https://x.test/?bf_jetzt=quatsch', ms: echt}),
    {ms: echt, gepinnt: null},
  );
});

/* ---- Phasen und Grenzen --------------------------------------------------- */

test('Grenzen: 26.11. 22:59:59Z vor, 23:00:00Z waehrend; 30.11. 22:59:59Z waehrend, 23:00:00Z vorbei', () => {
  assert.equal(r.bf2026Phase(ms('2026-11-26T22:59:59Z')), 'vor');
  assert.equal(r.bf2026Phase(ms('2026-11-26T23:00:00Z')), 'waehrend');
  assert.equal(r.bf2026Phase(ms('2026-11-30T22:59:59Z')), 'waehrend');
  assert.equal(r.bf2026Phase(ms('2026-11-30T23:00:00Z')), 'vorbei');
});

test('Ziel der Uhr: Start, dann Ende, danach keins', () => {
  assert.equal(r.bf2026Ziel('vor'), '2026-11-26T23:00:00Z');
  assert.equal(r.bf2026Ziel('waehrend'), '2026-11-30T22:59:59Z');
  assert.equal(r.bf2026Ziel('vorbei'), null);
});

test('Restzeit rechnet aus UTC und wird nie negativ', () => {
  assert.deepEqual(r.bf2026Restzeit('2026-11-26T23:00:00Z', ms('2026-11-26T22:59:59Z')), {
    tage: 0, stunden: 0, minuten: 0, sekunden: 1,
  });
  assert.deepEqual(r.bf2026Restzeit('2026-11-30T22:59:59Z', ms('2026-11-28T12:00:00Z')), {
    tage: 2, stunden: 10, minuten: 59, sekunden: 59,
  });
  assert.deepEqual(r.bf2026Restzeit('2026-11-26T23:00:00Z', ms('2026-12-01T00:00:00Z')), {
    tage: 0, stunden: 0, minuten: 0, sekunden: 0,
  });
});

test('Anzeige in Berlin, nie in der Zeit des Rechners', () => {
  const alt = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    assert.equal(r.bf2026Zeitpunkt('2026-11-26T23:00:00Z'), 'Freitag, 27. November, 0 Uhr');
    assert.equal(r.bf2026Zeitpunkt('2026-11-30T22:59:59Z'), 'Montag, 30. November, 23:59 Uhr');
  } finally {
    if (alt === undefined) delete process.env.TZ;
    else process.env.TZ = alt;
  }
  assert.equal(r.bf2026Zeitraum(), '27.–30. November');
  assert.equal(r.bf2026Starttag(), '27. November');
});

/* ---- Preis nur im Fenster ------------------------------------------------- */

const ist = (a) => ({betrag: a.preis_heute_eur, waehrung: 'EUR'});

test('Preisanzeige: BF-Preis nur im Fenster, davor „ab …“, danach gar keiner', () => {
  const c = angebot('qione-2x');
  const waehrend = r.bf2026PreisStand(c, 'waehrend', ist(c));
  assert.match(waehrend.preis, /^1\.674\s€$/);
  assert.match(waehrend.statt, /^statt 2\.174\s€$/);
  assert.match(waehrend.zusatz, /^Du sparst 500\s€$/);

  const vor = r.bf2026PreisStand(c, 'vor', ist(c));
  assert.equal(vor.preis, undefined);
  assert.match(vor.zeile, /^Heute 2\.174\s€$/);
  assert.match(vor.zusatz, /^ab 27\. November für 1\.674\s€$/);
  assert.ok(!JSON.stringify(vor).includes('sparst'));

  assert.deepEqual(r.bf2026PreisStand(c, 'vorbei', ist(c)), {});
});

test('jeder BF-Preis steht als Tausenderpunkt ohne Nachkommastellen', () => {
  const soll = {qihome: '4.583', qibracelet: '1.378', 'qione-2x': '1.674', 'qione-kette': '931'};
  for (const a of r.BF2026.angebote) {
    assert.ok(r.bf2026PreisStand(a, 'waehrend', ist(a)).preis.startsWith(soll[a.key]), a.key);
  }
});

test('Weicht der Markt vom Preis der Quelle ab, nennt die Seite keine Zahl', () => {
  const c = angebot('qione-2x');
  for (const anders of [
    {betrag: 2200, waehrung: 'EUR'},
    {betrag: 2174, waehrung: 'CHF'},
    null,
  ]) {
    for (const phase of ['vor', 'waehrend']) {
      const stand = r.bf2026PreisStand(c, phase, anders);
      assert.doesNotMatch(JSON.stringify(stand), /\d\.\d{3}|500/, `${phase} ${JSON.stringify(anders)}`);
      assert.match(stand.zusatz, /Warenkorb/);
    }
  }
});

/* ---- Warenkorb: ein Klick, Einzelprodukte --------------------------------- */

const v = (id, frei = true) => ({id, title: id, availableForSale: frei});
const produkte = {
  'qihome-air': {variants: {nodes: [v('home')]}},
  qibracelet: {variants: {nodes: [v('S'), v('M'), v('L')]}},
  'qione-2-pro': {variants: {nodes: [v('one')]}},
  'qione-kette': {variants: {nodes: [v('40'), v('50', false), v('60'), v('75', false)]}},
};

test('c) legt zwei QiOne in EINER Zeile, d) QiOne und Kette in zwei Zeilen', () => {
  const c = r.bf2026Zeilen(angebot('qione-2x'), produkte, {'qione-2-pro': 'one'});
  assert.deepEqual(c.map((z) => [z.merchandiseId, z.quantity]), [['one', 2]]);
  const d = r.bf2026Zeilen(angebot('qione-kette'), produkte, {'qione-2-pro': 'one', 'qione-kette': '60'});
  assert.deepEqual(d.map((z) => [z.merchandiseId, z.quantity]), [['one', 1], ['60', 1]]);
});

test('ein ausverkaufter Teil legt nichts in den Warenkorb, auch kein halbes Angebot', () => {
  assert.deepEqual(
    r.bf2026Zeilen(angebot('qione-kette'), produkte, {'qione-2-pro': 'one', 'qione-kette': '50'}),
    [],
  );
  assert.deepEqual(r.bf2026Zeilen(angebot('qione-2x'), {}, {'qione-2-pro': 'one'}), []);
});

test('Vorwahl trifft nie Ausverkauftes', () => {
  assert.equal(r.bf2026StartVariante(produkte.qibracelet), 'M');
  assert.equal(r.bf2026StartVariante(produkte['qione-kette'], (x) => x.id === '60'), '60');
  assert.equal(r.bf2026StartVariante(produkte['qione-kette'], (x) => x.id === '50'), '40');
  assert.equal(r.bf2026StartVariante({variants: {nodes: [v('a', false)]}}), null);
});

test('eine einzige Variante ist keine Wahl', () => {
  assert.deepEqual(r.bf2026Varianten(produkte['qione-2-pro']), []);
  assert.equal(r.bf2026Varianten(produkte.qibracelet).length, 3);
});

test('kein Bundle-Handle als Kaufziel in der Quelle oder als Pfad nach dem Ende', () => {
  const bundle = ['8kendiw34hd', 'pjdz538hgs0', 'jhsdhze783', '734husd8hh', '56huz67dds', '687ghgf4ed'];
  for (const a of r.BF2026.angebote) {
    for (const {produkt} of a.artikel) assert.ok(!bundle.includes(produkt), produkt);
    assert.ok(!bundle.some((h) => r.bf2026NormalePfad(a).includes(h)));
  }
  assert.doesNotMatch(lies('app/components/black-friday-2026/Bf2026Seiten.jsx'), /8kendiw34hd|pjdz538hgs0/);
  assert.doesNotMatch(lies('app/components/black-friday-2026/Bf2026Kauf.jsx'), /8kendiw34hd|pjdz538hgs0/);
});

test('interne Links tragen el, die verstellte Uhr nur in der Vorschau', () => {
  assert.equal(r.bf2026Link('/pages/bf-deals'), '/pages/bf-deals?el=BF2026');
  assert.match(r.bf2026Link('/products/x', '2026-11-28T12:00:00Z'), /^\/products\/x\?el=BF2026&bf_jetzt=2026-11-28T12/);
});

test('alte URL findet ihr Angebot, andere Handles nicht', () => {
  assert.equal(r.getBf2026AngebotByHandle('jhsdhze783').key, 'qione-2x');
  assert.equal(r.getBf2026AngebotByHandle('JHSDHZE783').key, 'qione-2x');
  assert.equal(r.getBf2026AngebotByHandle('qione-2-pro'), null);
  assert.equal(r.getBf2026AngebotByHandle(undefined), null);
});

/* ---- Durchsetzer im Quelltext --------------------------------------------- */

test('off = heute: der Zweig in products.$handle steht VOR dem Zehn-Jahre-Zaun und fällt bei off durch', () => {
  const route = lies('app/routes/products.$handle.jsx');
  const zweig = route.indexOf("bf2026Stellung !== 'off'");
  const zaun = route.indexOf('getTenYearsDealByHandle(args.params.handle)');
  assert.ok(zweig > 0 && zaun > zweig, 'Reihenfolge');
  assert.match(route, /if \(TEN_YEARS_SALE_RETIRED\) \{\s+throw new Response\(null, \{status: 404\}\);/);
});

test('off = heute: die Landingpage antwortet bei off mit 404 und ohne Inhalt', () => {
  assert.match(
    lies('app/routes/pages.bf-deals.jsx'),
    /if \(modus === 'off'\) throw new Response\(null, \{status: 404\}\);/,
  );
});

test('kein Qi Alpha in Quelle, Texten und Seiten', () => {
  for (const datei of [
    'app/components/black-friday-2026/bf2026-texte.js',
    'app/components/black-friday-2026/Bf2026Seiten.jsx',
    'app/components/black-friday-2026/Bf2026Kauf.jsx',
    'app/components/black-friday-2026/Bf2026Leistung.jsx',
  ]) {
    assert.doesNotMatch(lies(datei), /qi[\s-]*alpha/i, datei);
  }
  const verkauf = r.BF2026.angebote.flatMap((a) => a.artikel.map((x) => x.produkt)).join(' ');
  assert.doesNotMatch(verkauf, /alpha/i);
});

test('Das CSS nimmt nur Token: keine freien Farben, keine Schriftgrößen außerhalb der Skala', () => {
  const css = lies('app/styles/black-friday-2026.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
  for (const m of css.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(m[1].trim(), /^var\(--as-fs-[1-8]\)$/, m[1]);
  }
  assert.doesNotMatch(css, /animation|@keyframes|blink/i);
});

/* ---- Server-Render -------------------------------------------------------- */

async function uhrModul() {
  const {build} = await import('esbuild');
  const ergebnis = await build({
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/server'],
    alias: {'~': join(WURZEL, 'app')},
    stdin: {
      contents: `
        export {Bf2026Zeit, Bf2026Countdown} from '~/components/black-friday-2026/Bf2026Uhr.jsx';
        export {renderToStaticMarkup} from 'react-dom/server';
        export {jsx} from 'react/jsx-runtime';
      `,
      resolveDir: WURZEL,
      loader: 'js',
    },
  });
  // Das Bündel läuft aus einer Datei neben node_modules (import 'react').
  const ordner = mkdtempSync(join(WURZEL, 'node_modules/.bf2026-test-'));
  const datei = join(ordner, 'uhr.mjs');
  writeFileSync(datei, ergebnis.outputFiles[0].text);
  try {
    return await import(pathToFileURL(datei).href);
  } finally {
    rmSync(ordner, {recursive: true, force: true});
  }
}

test('Uhr im Server-HTML: Marker, Ziel im selben Element, Phase, Rückfalltext', async () => {
  const m = await uhrModul();
  const render = (iso) =>
    m.renderToStaticMarkup(
      m.jsx(m.Bf2026Zeit, {jetztMs: ms(iso), gepinnt: iso, children: m.jsx(m.Bf2026Countdown, {})}),
    );
  const waehrend = render('2026-11-28T12:00:00Z');
  assert.match(waehrend, /data-bf-countdown=""[^>]*data-bf-ziel="2026-11-30T22:59:59Z"/);
  assert.match(waehrend, /Endet in/);
  assert.match(waehrend, /Montag, 30\. November, 23:59 Uhr/);
  assert.match(waehrend, />02</);

  const vor = render('2026-11-03T12:00:00Z');
  assert.match(vor, /data-bf-ziel="2026-11-26T23:00:00Z"/);
  assert.match(vor, /Beginnt in/);
  assert.match(vor, /Freitag, 27\. November, 0 Uhr/);

  const vorbei = render('2026-12-01T00:00:00Z');
  assert.doesNotMatch(vorbei, /data-bf-ziel/);
  assert.match(vorbei, /Black Friday ist vorbei/);
});
