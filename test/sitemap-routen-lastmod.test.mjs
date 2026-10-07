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

console.log(`sitemap-routen-lastmod: ${grün} Arme grün`);
