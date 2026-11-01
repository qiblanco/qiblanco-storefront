/**
 * Hermetischer Test: Seiten mit eigener Code-Route tragen in
 * sitemap/pages/1.xml das Datum ihres letzten inhaltlichen Commits
 * (~/lib/routen-lastmod, Tabelle aus scripts/routen-lastmod.mjs).
 *
 *   node test/sitemap-routen-lastmod.test.mjs      # exit 0 = grün
 *
 * Gemessen an der ECHTEN Kind-Route und am ECHTEN Index-Rechner. Die Tabelle
 * setzt Vite im Bundle als Literal ein; hier steht sie als globalThis-Feld,
 * denselben Namen liest die Bibliothek. Jeder Anhebe-Arm hat eine
 * Gegenrichtung daneben: ein Nachtrag, der jedes Datum überschreibt, machte
 * den Anhebe-Arm genauso grün.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';
import {inhaltlicheZeilen, routenLastmod} from '../scripts/routen-lastmod.mjs';

const hier = dirname(fileURLToPath(import.meta.url));
const wurzel = join(hier, '..');
const appDir = join(wurzel, 'app');
const routePfad = join(appDir, 'routes', 'sitemap.$type.$page[.xml].jsx');

const TABELLE = {
  support: '2026-10-06T17:35:00Z',
  datenschutz: '2026-09-12T09:34:13Z',
  qione: '2026-05-01T00:00:00Z',
  'nur-in-tabelle': '2030-01-01T00:00:00Z',
};

/** @param {Record<string, string>} daten handle -> updatedAt */
function storefrontAttrappe(daten, alias = 'sitemap') {
  return {
    async query() {
      return {
        [alias]: {
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
  const {loader} = await ladeMitAufgeloestenImporten(routePfad, 'sitemap-rl-route');
  const antwort = await loader({
    request: new Request('https://qiblanco.com/sitemap/pages/1.xml'),
    params: {type: 'pages', page: '1'},
    context: {storefront: storefrontAttrappe(daten)},
  });
  return antwort.text();
}

function lastmodVon(xml, pfad) {
  for (const m of xml.matchAll(/<url>[\s\S]*?<\/url>/g)) {
    if (!m[0].includes(`${pfad}</loc>`)) continue;
    return m[0].match(/<lastmod>([^<]*)<\/lastmod>/)?.[1] ?? null;
  }
  return undefined;
}

let grün = 0;
async function pruefe(name, fn) {
  await fn();
  grün += 1;
  console.log(`  ok  ${name}`);
}

const ALT = {
  support: '2022-11-21T00:22:33Z',
  datenschutz: '2023-08-22T10:00:00Z',
  'qione-2-pro': '2021-01-01T00:00:00Z',
};

await pruefe('Kind: altes updatedAt wird auf das Routen-Datum angehoben', async () => {
  globalThis.__QB_ROUTEN_LASTMOD__ = TABELLE;
  const xml = await seitenXml(ALT);
  assert.equal(lastmodVon(xml, '/pages/support'), TABELLE.support);
  assert.equal(lastmodVon(xml, '/pages/datenschutz'), TABELLE.datenschutz);
});

await pruefe('Kind: ein JÜNGERES updatedAt bleibt stehen (nie zurückdrehen)', async () => {
  globalThis.__QB_ROUTEN_LASTMOD__ = TABELLE;
  const xml = await seitenXml({...ALT, support: '2027-03-03T00:00:00Z'});
  assert.equal(lastmodVon(xml, '/pages/support'), '2027-03-03T00:00:00Z');
});

await pruefe('Kind: Namensvetter (qione vs. qione-2-pro) wird nicht mitgetroffen', async () => {
  globalThis.__QB_ROUTEN_LASTMOD__ = TABELLE;
  const xml = await seitenXml(ALT);
  assert.equal(lastmodVon(xml, '/pages/qione-2-pro'), ALT['qione-2-pro']);
});

await pruefe('Kind: Tabellen-Handle ohne Sitemap-Eintrag erzeugt keine URL', async () => {
  globalThis.__QB_ROUTEN_LASTMOD__ = TABELLE;
  const xml = await seitenXml(ALT);
  assert.equal(lastmodVon(xml, '/pages/nur-in-tabelle'), undefined);
});

await pruefe('Kind: ohne Tabelle bleibt jedes Datum wie Shopify es liefert', async () => {
  delete globalThis.__QB_ROUTEN_LASTMOD__;
  const xml = await seitenXml(ALT);
  assert.equal(lastmodVon(xml, '/pages/support'), ALT.support);
  assert.equal(lastmodVon(xml, '/pages/datenschutz'), ALT.datenschutz);
});

const {lastmodJeKind} = await ladeMitAufgeloestenImporten(
  join(appDir, 'lib', 'sitemap-lastmod.js'),
  'sitemap-rl-index',
);
const KINDER = [{typ: 'pages', seite: 1, loc: 'https://x.test/sitemap/pages/1.xml'}];

await pruefe('Index: das Routen-Datum einer AUSGELIEFERTEN Seite zählt ins Maximum', async () => {
  globalThis.__QB_ROUTEN_LASTMOD__ = {...TABELLE, support: '2029-06-06T00:00:00Z'};
  const karte = await lastmodJeKind(storefrontAttrappe(ALT, 'k0'), KINDER);
  assert.equal(karte.get(KINDER[0].loc), '2029-06-06T00:00:00Z');
});

await pruefe('Index: ein Tabellen-Handle, den das Kind NICHT führt, zählt nicht', async () => {
  // nur-in-tabelle trägt 2030 — stünde es im Maximum, wäre der Index-Wert 2030.
  globalThis.__QB_ROUTEN_LASTMOD__ = TABELLE;
  const karte = await lastmodJeKind(storefrontAttrappe(ALT, 'k0'), KINDER);
  assert.ok(Date.parse(karte.get(KINDER[0].loc)) < Date.parse('2030-01-01T00:00:00Z'));
});

delete globalThis.__QB_ROUTEN_LASTMOD__;

await pruefe('Generator: Kommentar- und Leerzeilen zählen nicht als Inhalt', async () => {
  assert.equal(inhaltlicheZeilen(['+++ b/x', '+// nur Kommentar', '+', '- * alt']), 0);
  assert.equal(inhaltlicheZeilen(['+++ b/x', '+const a = 1;']), 1);
});

await pruefe('Generator: letzter INHALTLICHER Commit zählt; eine FLACHE Kopie liefert null', async () => {
  // Hermetisch im Wegwerf-Repo mit festen Commit-Zeiten: die Suite läuft auf
  // einem `git archive`-Auszug ohne .git, das echte Repo steht dort nicht.
  const repo = mkdtempSync(join(tmpdir(), 'routen-lastmod-repo-'));
  const flach = mkdtempSync(join(tmpdir(), 'routen-lastmod-flach-'));
  const g = (args, datum) =>
    execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      stdio: 'ignore',
      env: {...process.env, GIT_COMMITTER_DATE: datum, GIT_AUTHOR_DATE: datum},
    });
  try {
    g(['init', '-q'], '2026-01-01T00:00:00Z');
    mkdirSync(join(repo, 'app', 'routes'), {recursive: true});
    const route = join(repo, 'app', 'routes', 'pages.beispiel.jsx');
    const dyn = join(repo, 'app', 'routes', 'pages.$handle.jsx');
    writeFileSync(route, 'export const a = 1;\n');
    writeFileSync(dyn, 'export const b = 1;\n');
    g(['add', '-A'], '2026-01-01T00:00:00Z');
    g(['commit', '-q', '-m', 'inhalt'], '2026-02-03T04:05:06+02:00');
    writeFileSync(route, 'export const a = 1;\n// nur ein Kommentar\n');
    g(['commit', '-q', '-am', 'kommentar'], '2026-03-01T00:00:00Z');

    const tabelle = routenLastmod(repo);
    // Kommentar-Commit übersprungen, Zeitzone nach UTC, dynamische Route raus.
    assert.deepEqual(tabelle, {beispiel: '2026-02-03T02:05:06Z'});

    execFileSync('git', ['clone', '-q', '--depth', '1', `file://${repo}`, flach], {
      stdio: 'ignore',
    });
    assert.equal(routenLastmod(flach), null);
    // Der Build vertieft die flache Kopie selbst (so checkt Oxygen-CI aus)
    // und kommt dann auf dieselbe Tabelle wie die volle Kopie.
    assert.deepEqual(routenLastmod(flach, {vertiefen: true}), {
      beispiel: '2026-02-03T02:05:06Z',
    });
    // Und ohne git überhaupt (der Suite-Auszug): ebenfalls null, kein Wurf.
    rmSync(join(flach, '.git'), {recursive: true, force: true});
    assert.equal(routenLastmod(flach), null);
  } finally {
    rmSync(repo, {recursive: true, force: true});
    rmSync(flach, {recursive: true, force: true});
  }
});

await pruefe('Generator: ein Auszug UNTER einem fremden Repo liefert null, nicht dessen Historie', async () => {
  // Der Suite-Auszug hat kein eigenes .git; liegt sein TMPDIR unter einem
  // anderen Repo (auf dem Server: shared-state), fand `git -C` dessen .git in
  // einem Elternordner. Dann kippte das Urteil mit dem TMPDIR (Gate 22,
  // 2026-11-01). Hier steht das fremde Repo absichtlich darüber und trägt
  // sogar eine Routendatei unter demselben relativen Pfad.
  const aussen = mkdtempSync(join(tmpdir(), 'routen-lastmod-aussen-'));
  const g = (args, datum) =>
    execFileSync('git', ['-C', aussen, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      stdio: 'ignore',
      env: {...process.env, GIT_COMMITTER_DATE: datum, GIT_AUTHOR_DATE: datum},
    });
  try {
    g(['init', '-q'], '2026-01-01T00:00:00Z');
    const auszug = join(aussen, 'auszug');
    mkdirSync(join(auszug, 'app', 'routes'), {recursive: true});
    writeFileSync(join(auszug, 'app', 'routes', 'pages.fremd.jsx'), 'export const f = 1;\n');
    g(['add', '-A'], '2026-01-01T00:00:00Z');
    g(['commit', '-q', '-m', 'fremd'], '2026-04-05T06:07:08Z');
    assert.equal(routenLastmod(auszug), null);
    assert.equal(routenLastmod(auszug, {vertiefen: true}), null);
    // Gegenrichtung: an der echten Wurzel desselben Repos wird gemessen.
    mkdirSync(join(aussen, 'app', 'routes'), {recursive: true});
    writeFileSync(join(aussen, 'app', 'routes', 'pages.eigen.jsx'), 'export const e = 1;\n');
    g(['add', '-A'], '2026-01-01T00:00:00Z');
    g(['commit', '-q', '-m', 'eigen'], '2026-05-06T07:08:09Z');
    assert.deepEqual(routenLastmod(aussen), {eigen: '2026-05-06T07:08:09Z'});
  } finally {
    rmSync(aussen, {recursive: true, force: true});
  }
});

await pruefe('Generator: EIN git-Aufruf liefert dieselbe Tabelle wie der Einzelweg, auch bei Umbenennung', async () => {
  // Der Gesamtweg (ein `git log -- app/routes`) muss je Route dasselbe Datum
  // finden wie ein `git log -- <datei>` je Route (ROUTEN_LASTMOD_EINZELN=1).
  // Die Falle: mit Umbenennungs-Erkennung über das Verzeichnis zählte eine
  // reine Umbenennung 0 Zeilen, der Einzelweg sah die Datei als neu angelegt.
  const repo = mkdtempSync(join(tmpdir(), 'routen-lastmod-gesamt-'));
  const g = (args, datum) =>
    execFileSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      stdio: 'ignore',
      env: {...process.env, GIT_COMMITTER_DATE: datum, GIT_AUTHOR_DATE: datum},
    });
  const vorher = process.env.ROUTEN_LASTMOD_EINZELN;
  try {
    g(['init', '-q'], '2026-01-01T00:00:00Z');
    mkdirSync(join(repo, 'app', 'routes'), {recursive: true});
    writeFileSync(join(repo, 'app', 'routes', 'pages.alt.jsx'), 'export const a = 1;\n');
    writeFileSync(join(repo, 'app', 'routes', 'pages.b.jsx'), 'export const b = 1;\n');
    g(['add', '-A'], '2026-01-01T00:00:00Z');
    g(['commit', '-q', '-m', 'inhalt'], '2026-01-01T00:00:00Z');
    g(['mv', 'app/routes/pages.alt.jsx', 'app/routes/pages.neu.jsx'], '2026-02-01T00:00:00Z');
    g(['commit', '-q', '-m', 'umbenannt'], '2026-02-01T00:00:00Z');
    writeFileSync(join(repo, 'app', 'routes', 'pages.b.jsx'), 'export const b = 2;\n');
    g(['commit', '-q', '-am', 'b'], '2026-03-01T00:00:00Z');

    delete process.env.ROUTEN_LASTMOD_EINZELN;
    const gesamt = routenLastmod(repo);
    process.env.ROUTEN_LASTMOD_EINZELN = '1';
    const einzeln = routenLastmod(repo);
    assert.deepEqual(einzeln, {b: '2026-03-01T00:00:00Z', neu: '2026-02-01T00:00:00Z'});
    assert.equal(JSON.stringify(gesamt, null, 2), JSON.stringify(einzeln, null, 2));
  } finally {
    if (vorher === undefined) delete process.env.ROUTEN_LASTMOD_EINZELN;
    else process.env.ROUTEN_LASTMOD_EINZELN = vorher;
    rmSync(repo, {recursive: true, force: true});
  }
});

console.log(`sitemap-routen-lastmod: ${grün} Arme grün`);
