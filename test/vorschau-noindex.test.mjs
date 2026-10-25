/**
 * Wächter: VORSCHAU-NOINDEX (node --test, ohne Bundler) — Grossjob
 * 20261023-GROSSJOB-qi-alpha-landingpage-produktseite-finalisieren-lp-simulation s04.
 *
 * Christian am 23.10.2026 (Z8), wörtlich: „Also, dass das alles live ist, aber
 * eben nicht searchbar, nicht indiziert und nicht crawlbar und nicht für KI
 * verfügbar, bis auf weiteres."
 *
 * Gemessen wird die EINE Pfadliste app/lib/vorschau-noindex.js und ihre drei
 * Leser: entry.server.jsx (X-Robots-Tag), [robots.txt].jsx (Disallow je
 * Gruppe) und der Sitemap-Filter. Die robots-Zeilen werden mit einem Matcher
 * nach RFC 9309 / Google gelesen (längster Treffer gewinnt, `*` und `$`) —
 * urllib.robotparser und ähnliche Präfix-Leser kennen `$` nicht und sähen
 * jede Zeile als wirkungslos.
 *
 * ROT VOR GRÜN: VORSCHAU_MUTANTE=anker node --test <diese Datei> baut die
 * Zeilen ohne `$` und muss rot werden (goldkette/wunschnummer gesperrt);
 * VORSCHAU_MUTANTE=liste nimmt Shop B aus der Liste und muss rot werden.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const mod = await import(join(WURZEL, 'app/lib/vorschau-noindex.js'));

const MUTANTE = process.env.VORSCHAU_MUTANTE || '';
const LISTE =
  MUTANTE === 'liste'
    ? mod.VORSCHAU_NOINDEX.filter((e) => e.pfad !== '/products/qi-alpha-b')
    : mod.VORSCHAU_NOINDEX;
const istNoindex =
  MUTANTE === 'liste'
    ? (p) => LISTE.some((e) => e.pfad === p.split('?')[0].replace(/\/$/, '').toLowerCase())
    : mod.istVorschauNoindex;
const zeilen = (opt) =>
  MUTANTE === 'anker'
    ? mod.vorschauDisallowZeilen(opt).replace(/\$$/gm, '')
    : MUTANTE === 'liste'
      ? LISTE.filter((e) => opt?.alle || e.googlebot)
          .flatMap((e) => [`Disallow: ${e.pfad}$`, `Disallow: ${e.pfad}?`])
          .join('\n')
      : mod.vorschauDisallowZeilen(opt);

/** RFC 9309: Regel als Muster mit `*` und `$`; längster Treffer gewinnt, Allow bei Gleichstand. */
function erlaubt(regeln, pfad) {
  let best = null;
  for (const {art, muster} of regeln) {
    if (!muster) continue;
    const anker = muster.endsWith('$');
    const kern = anker ? muster.slice(0, -1) : muster;
    const re = new RegExp(
      '^' + kern.split('*').map((t) => t.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (anker ? '$' : ''),
    );
    if (!re.test(pfad)) continue;
    if (!best || muster.length > best.muster.length || (muster.length === best.muster.length && art === 'allow')) {
      best = {art, muster};
    }
  }
  return !best || best.art === 'allow';
}
const regelnAus = (text) =>
  text
    .split('\n')
    .map((z) => z.match(/^(Allow|Disallow):\s*(\S*)/i))
    .filter(Boolean)
    .map((m) => ({art: m[1].toLowerCase(), muster: m[2]}));

const PFLICHT = [
  '/pages/qi-alpha-b',
  '/products/qi-alpha-b',
  '/pages/qi-master-vorverkauf',
  '/pages/qi-alpha-vorverkauf',
  '/products/qi-master',
  '/products/qi-alpha',
  '/pages/The-Alpha-B',
  '/pages/The-Alpha-C',
];
const NACHBARN = [
  '/products/qi-alpha-goldkette',
  '/products/qi-alpha-wunschnummer',
  '/products/qi-master-goldkette',
  '/products/qi-master-wunschnummer',
  '/pages/qi-alpha-b-test',
  '/products/qione-2-pro',
  '/pages/qione-2-pro-b',
  // The-Alpha A ist die Hauptseite und bleibt indexierbar (s03, 25.10.2026).
  '/pages/The-Alpha',
  '/pages/the-alpha',
];

test('Pfadliste trägt genau die Pfade aus den Aufträgen (sechs + zwei The-Alpha-Testarme)', () => {
  assert.deepEqual(LISTE.map((e) => e.pfad).sort(), [...PFLICHT].sort());
});

test('Header-Entscheid: Listenpfade ja (auch mit / und ?), Nachbarn nein', () => {
  for (const p of PFLICHT) {
    assert.equal(istNoindex(p), true, p);
    assert.equal(istNoindex(p + '/'), true, p + '/');
    assert.equal(istNoindex(p + '?Seriennummer=7'), true, p + '?…');
  }
  for (const p of NACHBARN) assert.equal(istNoindex(p), false, p);
});

test('robots KI-Gruppen: alle sechs gesperrt, mit Varianten-Adresse', () => {
  const r = regelnAus(zeilen({alle: true}));
  for (const p of PFLICHT) {
    assert.equal(erlaubt(r, p), false, p);
    assert.equal(erlaubt(r, p + '?Seriennummer=7'), false, p + '?…');
  }
});

test('robots $-Anker: goldkette, wunschnummer und andere Nachbarn bleiben offen', () => {
  for (const alle of [true, false]) {
    const r = regelnAus(zeilen({alle}));
    for (const p of NACHBARN) assert.equal(erlaubt(r, p), true, `${p} alle=${alle}`);
  }
  for (const z of zeilen({alle: true}).split('\n')) {
    assert.match(z, /^Disallow: \/[A-Za-z0-9/-]+(\$|\?)$/, z);
  }
});

test('robots Gruppe *: LP A, LP B, Shop B gesperrt; Shop A für Googlebot lesbar', () => {
  const r = regelnAus(zeilen({alle: false}));
  for (const p of ['/pages/qi-alpha-b', '/products/qi-alpha-b', '/pages/qi-master-vorverkauf', '/pages/qi-alpha-vorverkauf']) {
    assert.equal(erlaubt(r, p), false, p);
  }
  for (const p of ['/products/qi-master', '/products/qi-alpha']) assert.equal(erlaubt(r, p), true, p);
});

test('Sitemap-Handles je Typ: alle Listenpfade, auch Shop A', () => {
  assert.deepEqual(mod.vorschauSitemapHandles('products').sort(), ['qi-alpha', 'qi-alpha-b', 'qi-master']);
  assert.deepEqual(mod.vorschauSitemapHandles('pages').sort(), ['The-Alpha-B', 'The-Alpha-C', 'qi-alpha-b', 'qi-alpha-vorverkauf', 'qi-master-vorverkauf']);
});

test('Groß/Klein (The-Alpha, s03): Header in jeder Schreibweise, robots sperrt beide, A bleibt offen', () => {
  for (const p of ['/pages/the-alpha-b', '/pages/THE-ALPHA-B', '/pages/the-alpha-c', '/pages/The-Alpha-C/']) {
    assert.equal(istNoindex(p), true, p);
  }
  for (const alle of [true, false]) {
    const r = regelnAus(zeilen({alle}));
    for (const p of ['/pages/The-Alpha-B', '/pages/the-alpha-b', '/pages/The-Alpha-C', '/pages/the-alpha-c']) {
      assert.equal(erlaubt(r, p), false, `${p} alle=${alle}`);
    }
    for (const p of ['/pages/The-Alpha', '/pages/the-alpha']) assert.equal(erlaubt(r, p), true, `${p} alle=${alle}`);
  }
});

test('Sitemap-Filter: trifft jeden Listenpfad, lässt die Nachbarn stehen', () => {
  const xml = (p) => `<url><loc>https://qiblanco.com${p}</loc></url>`;
  const gesperrt = LISTE.map((e) => e.pfad);
  const offen = NACHBARN;
  for (const typ of ['products', 'pages']) {
    const versteckt = mod.vorschauSitemapHandles(typ);
    const filter = (eintrag) => versteckt.some((h) => eintrag.includes(`/${typ}/${h}</loc>`));
    for (const p of gesperrt.filter((x) => x.startsWith(`/${typ}/`))) assert.equal(filter(xml(p)), true, p);
    for (const p of offen.filter((x) => x.startsWith(`/${typ}/`))) assert.equal(filter(xml(p)), false, p);
  }
});

test('Verdrahtung: alle drei Leser rufen die Liste', () => {
  const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
  const entry = lies('app/entry.server.jsx');
  assert.match(entry, /if \(istVorschauNoindex\(new URL\(request\.url\)\.pathname\)\) \{\s*responseHeaders\.set\('X-Robots-Tag', VORSCHAU_ROBOTS_KOPF\);/);
  assert.equal(mod.VORSCHAU_ROBOTS_KOPF, 'noindex, nofollow');
  const robots = lies('app/routes/[robots.txt].jsx');
  assert.match(robots, /\$\{vorschauDisallowZeilen\(\{alle: vorschauAlle\}\)\}/);
  // KUNDEN-AI und KI-MODELLE: alle Pfade
  assert.match(robots, /User-agent: Perplexity-User\n\$\{generalDisallowRules\(\{sitemapUrl, shopId, vorschauAlle: true\}\)\}/);
  assert.match(robots, /User-agent: Google-Extended\n\$\{generalDisallowRules\(\{sitemapUrl, shopId, vorschauAlle: true\}\)\}/);
  assert.match(robots, /User-agent: \*\nContent-Signal: [^\n]*\n\$\{generalDisallowRules\(\{sitemapUrl, shopId\}\)\}/);
  const sitemap = lies('app/routes/sitemap.$type.$page[.xml].jsx');
  assert.match(sitemap, /\.\.\.vorschauSitemapHandles\('products'\)/);
  // Die Vorschau-Pages sind reine Routen: sie kommen nur über den Nachtrag
  // nurRouteSeiten() in die Sitemap, und dort greift der Filter.
  assert.match(sitemap, /if \(istVorschauNoindex\(s\.pfad\)\) return false;/);
});
