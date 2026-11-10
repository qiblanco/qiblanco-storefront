/**
 * Wächter: ANNA LÄDT FRÜH, SOLANGE IHR DIENST ANTWORTET (node --test, ohne
 * Bundler). s05 des Auftrags 20261030-folge-dienste-auf-eigene-domain-nach-dns,
 * 10.11.2026.
 *
 * Seit #1316 kam der Loader immer erst nach `load`. Gemessen auf der
 * Startseite (iPhone, Lighthouse-Mobilprofil): Rahmen nach 6,8 s statt 3,6 s.
 * Der Frühstart fragt `<origin>/healthz` per fetch (hält `load` nicht auf) und
 * fügt den Loader bei Antwort sofort ein; bei stillem Netz bleibt der Weg nach
 * `load`. Die Wirkung im Browser messen
 * claude-jobs/20261030-folge-dienste-auf-eigene-domain-nach-dns-s05/probe_anna_frueh.py
 * (Rahmen vor `load`) und claude-jobs/20261030-folge-dienste-auf-eigene-domain-nach-dns/
 * probe_anna_eigene_domain.py (stilles Netz hält `load` nicht auf).
 *
 * ROT VOR GRÜN: auf origin/main 15ea79b2 fehlen loaderJetztEinfuegen und
 * salesbotDienstPruefUrl, das Widget fragt den Dienst nicht, und connect-src
 * trägt die Anna-Origin nicht.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {ohneProsa} from './_quelltext.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => ohneProsa(readFileSync(join(WURZEL, f), 'utf8'));
const lib = await import(join(WURZEL, 'app/lib/salesbot-widget.js'));

test('Loader jetzt: nach load oder bei antwortendem Dienst, sonst warten', () => {
  assert.equal(typeof lib.loaderJetztEinfuegen, 'function');
  const f = lib.loaderJetztEinfuegen;
  assert.equal(f({readyState: 'complete', dienstAntwortet: false}), true);
  assert.equal(f({readyState: 'interactive', dienstAntwortet: true}), true);
  assert.equal(f({readyState: 'loading', dienstAntwortet: true}), true);
  assert.equal(f({readyState: 'interactive', dienstAntwortet: false}), false);
  assert.equal(f({readyState: 'loading', dienstAntwortet: false}), false);
});

test('Prüfadresse liegt auf der Anna-Origin, Frist begrenzt', () => {
  assert.equal(
    lib.salesbotDienstPruefUrl('https://anna.dienst.qiblanco.com'),
    'https://anna.dienst.qiblanco.com/healthz',
  );
  assert.equal(lib.salesbotDienstPruefUrl(''), '');
  assert.ok(lib.SALESBOT_DIENST_FRIST_MS > 0 && lib.SALESBOT_DIENST_FRIST_MS <= 3000);
});

test('SalesbotWidget fragt den Dienst per fetch mit Abbruch und behält den Weg nach load', () => {
  const q = lies('app/components/SalesbotWidget.jsx');
  assert.match(q, /fetch\(pruefUrl,/);
  assert.match(q, /signal: abbruch\.signal/);
  assert.match(q, /setTimeout\(\(\) => abbruch\.abort\(\), SALESBOT_DIENST_FRIST_MS\)/);
  assert.match(q, /window\.addEventListener\('load', einmal, \{once: true\}\)/);
  assert.match(q, /dienstAntwortet: true/);
  // Abbau: Uhr und Abruf enden mit der Komponente.
  assert.match(q, /abgebaut = true;/);
  assert.match(q, /if \(abbruch\) abbruch\.abort\(\);/);
});

test('connect-src trägt die Anna-Origin (sonst scheitert der fetch still an der CSP)', () => {
  // Roh gelesen: ohneProsa hält ein '/*' in einer CSP-Quelle für einen
  // Kommentaranfang und schluckt dann den connectSrc-Block.
  const q = readFileSync(join(WURZEL, 'app/entry.server.jsx'), 'utf8');
  const start = q.indexOf('connectSrc: [');
  const ende = q.indexOf('mediaSrc: [', start);
  assert.ok(start > 0 && ende > start, 'connectSrc-Block nicht gefunden');
  assert.match(q.slice(start, ende), /\.\.\.salesbotWidgetCspQuellen\(context\.env\)/);
});
