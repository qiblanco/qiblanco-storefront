/**
 * Trustpilot-Stimmen (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq).
 *
 * Christian 2026-10-06: Scroller auf den KI-SEO/GEO-Seiten und in der FAQ,
 * „nicht auf den Mainseiten", „nicht die Gesamtanzahl anzeigen".
 *
 *  T1 Keine Kauf-/Hauptroute erreicht TrustpilotStimmen über ihre Importe
 *     (Startseite, Produktseiten, /pages/qione*, Schlafseite inkl. Variante,
 *     Warenkorb). Gemessen am Import-Graphen, nicht an einer Dateiliste: eine
 *     neue Komponente zwischen Route und Scroller fiele sonst durch.
 *  T2 Die vorgesehenen Orte erreichen ihn (sonst ist T1 trivial grün).
 *  T3 Das Datenmodul ist nicht leer, trägt keine Inhaber-Bewertung und keine
 *     Gesamtzahl-Formulierung; der Baustein selbst rendert keine Zahl.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const ZIEL = join(APP, 'components/reusables/TrustpilotStimmen.jsx');

function aufloesen(von, spec) {
  let basis;
  if (spec.startsWith('~/')) basis = join(APP, spec.slice(2));
  else if (spec.startsWith('.')) basis = resolve(dirname(von), spec);
  else return null;
  basis = basis.replace(/\?.*$/, '');
  for (const kandidat of [basis, `${basis}.jsx`, `${basis}.js`, `${basis}/index.jsx`, `${basis}/index.js`]) {
    if (existsSync(kandidat) && !kandidat.endsWith('/')) {
      try {
        readFileSync(kandidat);
        return kandidat;
      } catch {
        /* Verzeichnis */
      }
    }
  }
  return null;
}

function erreicht(start, ziel) {
  const gesehen = new Set();
  const stapel = [start];
  while (stapel.length) {
    const datei = stapel.pop();
    if (gesehen.has(datei)) continue;
    gesehen.add(datei);
    if (datei === ziel) return true;
    if (!/\.(jsx?|mjs)$/.test(datei)) continue;
    const quelle = readFileSync(datei, 'utf8');
    for (const m of quelle.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      const n = aufloesen(datei, m[1]);
      if (n) stapel.push(n);
    }
  }
  return false;
}

const ROUTEN = join(APP, 'routes');
const alleRouten = readdirSync(ROUTEN).filter((f) => f.endsWith('.jsx'));
const VERBOTEN = alleRouten.filter(
  (f) =>
    f === '_index.jsx' ||
    f.startsWith('products.') ||
    f.startsWith('collections.') ||
    f.startsWith('cart') ||
    f.startsWith('pages.qione') ||
    f.startsWith('pages.schlaf-zellen-schutz'),
);
const ORTE = [
  'pages.erfahrungen.jsx',
  'pages.bewertungen.jsx',
  'pages.ist-qi-blanco-serioes.jsx',
  'pages.warum-qi-blanco.jsx',
  'pages.neu-oder-gebraucht.jsx',
  'pages.qi-blanco-auf-trustpilot.jsx',
  'pages.faq.jsx',
];

test('T1 keine Kauf-/Hauptroute erreicht den Trustpilot-Scroller', () => {
  assert.ok(VERBOTEN.length >= 5, `zu wenige verbotene Routen erkannt: ${VERBOTEN}`);
  const treffer = VERBOTEN.filter((r) => erreicht(join(ROUTEN, r), ZIEL));
  assert.deepEqual(treffer, []);
});

test('T2 jeder vorgesehene Ort erreicht den Scroller', () => {
  const fehlt = ORTE.filter((r) => !erreicht(join(ROUTEN, r), ZIEL));
  assert.deepEqual(fehlt, []);
});

test('T3 Datenmodul: gefüllt, keine Inhaber-Bewertung, keine Gesamtzahl', async () => {
  const daten = JSON.parse(readFileSync(join(APP, 'data/trustpilot-bewertungen.json'), 'utf8'));
  const TRUSTPILOT_BEWERTUNGEN = daten.bewertungen;
  const TRUSTPILOT_PROFIL_URL = daten.profil_url;
  assert.ok(TRUSTPILOT_BEWERTUNGEN.length > 0);
  assert.match(TRUSTPILOT_PROFIL_URL, /^https:\/\/(de|www)\.trustpilot\.com\/review\/qiblanco\.com$/);
  for (const r of TRUSTPILOT_BEWERTUNGEN) {
    assert.equal(r.rating, 5, r.id);
    assert.ok(r.text.trim(), r.id);
    assert.match(r.link, /^https:\/\/www\.trustpilot\.com\/reviews\//);
    assert.notEqual(r.name, 'Christian B.');
  }
  const baustein = readFileSync(ZIEL, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(baustein, /TRUSTPILOT_BEWERTUNGEN\.length\s*\}/, 'Anzahl im JSX');
  assert.doesNotMatch(JSON.stringify(daten), /"(anzahl|gesamt|count|total)"/i, 'Zahlfeld im Modul');
  assert.doesNotMatch(baustein, /basierend auf|Bewertungen insgesamt|\d+\s+Bewertungen/);
  assert.doesNotMatch(baustein, /<script|widget\.trustpilot|tp\.widget/i);
});

test('T4 Frageseite: der Scroller steht im Seitenrand der Frageseite, nicht bei x=0', () => {
  // `.frg section` (fragen.css) nullt das seitliche Padding JEDER Section, auch
  // der Trustpilot-Section (live gemessen 2026-10-06: Titel 0..390 bei 390 px).
  // Der Rahmen um den Baustein muss den Rand mit dem Token der Seite tragen.
  const quelle = readFileSync(join(APP, 'components/campaign/FrageSeite.jsx'), 'utf8')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const m = quelle.match(/<div\s+style=\{\{\s*paddingInline:\s*'var\(--frg-s3\)'\s*\}\}>\s*<TrustpilotStimmen\b/);
  assert.ok(m, 'TrustpilotStimmen ohne Rand-Rahmen in FrageSeite.jsx');
  const css = readFileSync(join(APP, 'styles/fragen.css'), 'utf8');
  assert.match(css, /--frg-s3:\s*\d+px/, 'Token --frg-s3 fehlt in fragen.css');
});
