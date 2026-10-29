/*
 * Apple-Seitenbaukasten (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-
 * niveau-ausser-seo-geo, s03), ohne Vite:
 *   node --test app/components/apple-seite/apple-seite.test.mjs
 * Drei Teile: (1) Schalter-Tabelle lib/apple-seiten.js, (2) reine Regeln
 * apple-seite-logik.js, (3) Server-Render aller Sektionen (esbuild bündelt
 * die JSX, react-dom/server rendert) — der Marker data-apple-seite und jede
 * data-section stehen im HTML.
 * Mutationsmatrix: APPLE_SEITEN_LIB / APPLE_SEITE_LOGIK zeigen auf eine Kopie,
 * jeder Mutant muss hier rot werden.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HIER, '../..');
const LIB = process.env.APPLE_SEITEN_LIB || join(APP, 'lib/apple-seiten.js');
const LOGIK = process.env.APPLE_SEITE_LOGIK || join(HIER, 'apple-seite-logik.js');
const lib = await import(pathToFileURL(LIB).href);
const logik = await import(pathToFileURL(LOGIK).href);

/* ---- (1) Schalter-Tabelle ------------------------------------------------- */

const ZEILE =
  /^ {2}'?([a-z0-9-]+)'?: \{pfad: '([^']*)', schalter: '(APPLE_SEITE_[A-Z0-9_]+)', standard: '(on|off)'\},$/;

test('jede Seite steht in genau einer Zeile nach dem Zeilenvertrag', () => {
  const zeilen = readFileSync(LIB, 'utf8').split('\n').filter((z) => /^ {2}[^ */].*schalter: '/.test(z));
  assert.equal(zeilen.length, Object.keys(lib.APPLE_SEITEN).length);
  for (const z of zeilen) assert.match(z, ZEILE, z);
});

test('Schalternamen sind eindeutig und folgen APPLE_SEITE_<X>', () => {
  const namen = Object.values(lib.APPLE_SEITEN).map((e) => e.schalter);
  assert.equal(new Set(namen).size, namen.length);
  for (const n of namen) assert.match(n, /^APPLE_SEITE_[A-Z0-9_]+$/);
});

test('ausgenommene Seiten haben keinen Schalter', () => {
  const pfade = new Set(Object.values(lib.APPLE_SEITEN).map((e) => e.pfad));
  for (const p of ['/products/qione-2-pro', '/products/qihome-air', '/products/qibracelet', '/products/qi-alpha', '/pages/qi-alpha']) {
    assert.ok(!pfade.has(p), `${p} darf keinen Schalter tragen`);
  }
});

test('die von Christian genannten Seiten haben einen Schalter', () => {
  for (const s of ['start-b', 'qione-2-pro-details', 'schlaf-zellen-schutz', 'qione-2-pro-shop', 'produktberatung', 'studien', 'live']) {
    assert.ok(lib.appleSeite(s), `${s} fehlt`);
  }
});

test('appleSeiteAn: Standard gilt, Umgebung on/off gewinnt, sonst nichts', () => {
  const s = 'start-b';
  const n = lib.APPLE_SEITEN[s].schalter;
  const std = lib.APPLE_SEITEN[s].standard === 'on';
  assert.equal(lib.appleSeiteAn({}, s), std);
  assert.equal(lib.appleSeiteAn(undefined, s), std);
  assert.equal(lib.appleSeiteAn({[n]: 'on'}, s), true);
  assert.equal(lib.appleSeiteAn({[n]: 'off'}, s), false);
  assert.equal(lib.appleSeiteAn({[n]: ''}, s), std);
  assert.equal(lib.appleSeiteAn({[n]: 'ON'}, s), std);
  assert.equal(lib.appleSeiteAn({[n]: 'on'}, 'gibt-es-nicht'), false);
  assert.equal(lib.appleSeiteAn({toString: 'on'}, 'toString'), false);
  assert.equal(lib.appleSeite('toString'), null);
  assert.equal(lib.appleSeite('constructor'), null);
});

test('appleSeiteFuerPfad: Pfad zu Seitenname, fremder Pfad null', () => {
  assert.equal(lib.appleSeiteFuerPfad('/'), 'startseite');
  assert.equal(lib.appleSeiteFuerPfad('/pages/start-b'), 'start-b');
  assert.equal(lib.appleSeiteFuerPfad('/products/qione-2-pro'), null);
  assert.equal(lib.appleSeiteFuerPfad(undefined), null);
  const pfade = Object.values(lib.APPLE_SEITEN).map((e) => e.pfad);
  assert.equal(new Set(pfade).size, pfade.length, 'jeder Pfad nur einmal');
  for (const [seite, e] of Object.entries(lib.APPLE_SEITEN)) assert.equal(lib.appleSeiteFuerPfad(e.pfad), seite);
});

test('appleSeiteLaden liefert {seite, an}', () => {
  const n = lib.APPLE_SEITEN.studien.schalter;
  assert.deepEqual(lib.appleSeiteLaden({env: {[n]: 'on'}}, 'studien'), {seite: 'studien', an: true});
  assert.deepEqual(lib.appleSeiteLaden({}, 'studien'), {seite: 'studien', an: lib.APPLE_SEITEN.studien.standard === 'on'});
});

test('Tabelle ist eingefroren', () => {
  assert.ok(Object.isFrozen(lib.APPLE_SEITEN));
  assert.ok(Object.isFrozen(lib.APPLE_SEITEN['start-b']));
});

/* ---- (2) reine Regeln ----------------------------------------------------- */

const SAUBER = [
  {art: 'hero', titel: 'Schlaf, der bleibt.', bild: {url: 'https://cdn.shopify.com/x.jpg'}},
  {art: 'fakten', kacheln: [{zahl: '84,7 %', satz: 'Abwehrleistung mit QiOne® 2 Pro.'}]},
  {art: 'anna'},
];

test('pruefeSeite: saubere Seite hat keine Mängel', () => {
  assert.deepEqual(logik.pruefeSeite(SAUBER), []);
});

test('pruefeSeite: Preisanker, Schild und Konjunktiv sind Mängel', () => {
  const fall = (text) => logik.pruefeSeite([{...SAUBER[0], unter: text}, SAUBER[2]]);
  assert.ok(fall('Ultimate Power für dein Zuhause').some((m) => /Ultimate/.test(m)));
  assert.ok(fall('Unser Bestseller').some((m) => /Bestseller/.test(m)));
  assert.ok(fall('+14.000 Nutzer vertrauen uns').some((m) => /Nutzerzahl/.test(m)));
  assert.ok(fall('4,8 ★ bei Google').some((m) => /Google-Note/.test(m)));
  assert.ok(fall('Das könnte dir helfen').some((m) => /Konjunktiv/.test(m)));
});

test('pruefeSeite: Struktur (ein Hero zuerst, Anna da, Pflichtfelder)', () => {
  assert.ok(logik.pruefeSeite([]).length > 0);
  assert.ok(logik.pruefeSeite([SAUBER[1], SAUBER[0], SAUBER[2]]).some((m) => /erste Sektion/.test(m)));
  assert.ok(logik.pruefeSeite([SAUBER[0], SAUBER[0], SAUBER[2]]).some((m) => /genau eine Hero/.test(m)));
  assert.ok(logik.pruefeSeite([SAUBER[0]]).some((m) => /Anna/.test(m)));
  assert.ok(logik.pruefeSeite([{art: 'hero', titel: 'x'}, SAUBER[2]]).some((m) => /'bild'/.test(m)));
  assert.ok(logik.pruefeSeite([SAUBER[0], {art: 'preisanker'}, SAUBER[2]]).some((m) => /unbekannte/.test(m)));
});

test('pruefeSeite: URLs zählen nicht als Text', () => {
  const m = logik.pruefeSeite([{...SAUBER[0], cta: {text: 'Ansehen', href: '/pages/bestseller'}}, SAUBER[2]]);
  assert.deepEqual(m, []);
});

test('Bild-Helfer und Band-Seite', () => {
  assert.equal(logik.mitBreite('https://a/b.jpg', 750), 'https://a/b.jpg?width=750');
  assert.equal(logik.mitBreite('https://a/b.jpg?v=1', 750), 'https://a/b.jpg?v=1&width=750');
  assert.match(logik.bildSrcSet('https://a/b.jpg'), /width=480 480w, .*width=2048 2048w$/);
  assert.equal(logik.bildSrcSet(''), undefined);
  assert.deepEqual([0, 1, 2].map((i) => logik.bandSeite(i)), ['links', 'rechts', 'links']);
  assert.equal(logik.bandSeite(0, 'rechts'), 'rechts');
  assert.deepEqual(logik.absaetze(['a', '', '  ', 'b']), ['a', 'b']);
  assert.deepEqual(logik.absaetze('a'), ['a']);
});

/* ---- (3) Server-Render ---------------------------------------------------- */

async function renderSeite(props) {
  const esbuild = await import('esbuild');
  const ergebnis = await esbuild.build({
    stdin: {
      contents: `import {renderToStaticMarkup} from 'react-dom/server';
        import {createElement} from 'react';
        import {AppleSeite, AppleSeiteWeiche} from './app/components/apple-seite/index.js';
        export function seite(p) { return renderToStaticMarkup(createElement(AppleSeite, p)); }
        export function weiche(p) { return renderToStaticMarkup(createElement(AppleSeiteWeiche, p)); }`,
      resolveDir: resolve(APP, '..'),
      loader: 'jsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    loader: {'.js': 'jsx'},
    external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    alias: {'~': APP},
    plugins: [
      {
        name: 'url-stub',
        setup(b) {
          b.onResolve({filter: /\?url$/}, (a) => ({path: a.path, namespace: 'url'}));
          b.onLoad({filter: /.*/, namespace: 'url'}, (a) => ({contents: `export default ${JSON.stringify('/assets/' + a.path.split('/').pop().replace(/\?url$/, ''))};`}));
        },
      },
    ],
  });
  const code = ergebnis.outputFiles[0].text;
  const pfad = join(process.env.TMPDIR || '/tmp', `apple-seite-ssr-${process.pid}-${Date.now()}.mjs`);
  const {writeFileSync, unlinkSync} = await import('node:fs');
  // React aus dem Repo, nicht aus TMPDIR: Import auf absolute Pfade umbiegen.
  const {createRequire} = await import('node:module');
  const req = createRequire(join(APP, '..', 'package.json'));
  const ersetzt = code.replace(/from "(react(?:-dom)?(?:\/[a-z-]+)?)"/g, (_, m) => `from ${JSON.stringify(pathToFileURL(req.resolve(m)).href)}`);
  writeFileSync(pfad, ersetzt);
  try {
    const mod = await import(pathToFileURL(pfad).href);
    return props.__weiche ? mod.weiche(props) : mod.seite(props);
  } finally {
    unlinkSync(pfad);
  }
}

const ALLE = [
  {art: 'hero', overline: 'QiOne® 2 Pro', titel: 'Schlaf, der bleibt.', unter: 'Ein Gerät. Tag und Nacht.', bild: {url: 'https://cdn.shopify.com/h.jpg', alt: 'QiOne'}, cta: {text: 'Ansehen', href: '/products/qione-2-pro'}},
  {art: 'fakten', titel: 'In Zahlen', kacheln: [{zahl: '20', titel: 'Tage', satz: 'Testen ohne Risiko.'}]},
  {art: 'band', titel: 'Am Körper.', text: ['Er sitzt an der Kette.'], bild: {url: 'https://cdn.shopify.com/b.jpg'}},
  {art: 'kapitel', etikett: 'Wissenschaft', titel: 'Im Labor.', absaetze: ['Prof. Dr. Peter C. Dartsch.'], quellen: ['Dartsch 2024']},
  {art: 'stimmen', titel: 'Das sagen Kunden.', stimmen: [{text: 'Endlich wieder durchschlafen.', quelle: 'Google, Mai 2026'}]},
  {art: 'faq', titel: 'Fragen', fragen: [{f: 'Wie lange?', a: '20 Tage.'}, {f: 'Wasser?', a: 'Ja.'}], jsonLd: true},
  {art: 'cta', titel: 'Bereit?', cta: {text: 'Jetzt ansehen', href: '/products/qione-2-pro'}},
  {art: 'anna'},
];

test('SSR: Marker, alle Sektionen, ein H1, Antworten im HTML, CSS-Link', async () => {
  const html = await renderSeite({seite: 'start-b', sektionen: ALLE});
  assert.match(html, /data-apple-seite="start-b"/);
  for (const a of ['hero', 'fakten', 'band', 'kapitel', 'stimmen', 'faq', 'cta', 'anna']) {
    assert.match(html, new RegExp(`data-section="as-${a}"`), a);
  }
  assert.equal((html.match(/<h1/g) || []).length, 1);
  assert.match(html, /20 Tage\./);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/apple-seite\.css"/);
  assert.match(html, /<sup[^>]*class="qb-marke-r"/);
  assert.match(html, /fetchpriority="high"/);
  assert.doesNotMatch(html, /★|Ultimate Power/);
});

test('SSR: Weiche aus = heutige Seite byte-gleich, kein Marker, kein CSS', async () => {
  const aus = await renderSeite({__weiche: true, an: false, seite: 'start-b', sektionen: ALLE, alt: null});
  assert.equal(aus, '');
  const an = await renderSeite({__weiche: true, an: true, seite: 'start-b', sektionen: ALLE});
  assert.match(an, /data-apple-seite="start-b"/);
});
