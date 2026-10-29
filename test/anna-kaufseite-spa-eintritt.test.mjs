/**
 * Wächter: AI ANNA AUF DER QI-ALPHA-KAUFSEITE, AUCH NACH DEM KLICK VON DER LP
 * (node --test, ohne Bundler). Job 20261029-qi-alpha-kaufseite-ai-anna-fehlt-
 * nur-lp-ohne, Christian 29.10.2026: „auf der Kaufseite ist nun AI Anna
 * komplett weg, das sollte nur auf der LP so sein.“
 *
 * Gemessen: die LP /pages/Qi-Alpha rendert keinen Loader (handle.filmSeite),
 * ihr Kaufknopf ist ein <Link>. Auf /products/qi-alpha fügte React den Loader
 * dann client-seitig ein, und React 18 führt solche Skripte nie aus. Der
 * Nachzug in SalesbotWidget griff nur, wenn der Loader schon gelaufen war.
 *
 * ROT VOR GRÜN: auf origin/main 53fac142 fehlt loaderNachziehen, und
 * SalesbotWidget zieht nur bei gesetztem Flag nach (Arme 1 und 3 rot).
 * Die Wirkung im Browser misst claude-jobs/20261029-qi-alpha-kaufseite-ai-
 * anna-fehlt-nur-lp-ohne/anna_naht_probe.py (Direktaufruf UND Klick von der LP).
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

test('Nachzug, sobald kein Rahmen steht, auch wenn der Loader nie lief (SPA-Eintritt)', () => {
  assert.equal(typeof lib.loaderNachziehen, 'function');
  assert.equal(lib.loaderNachziehen({rahmenDa: false, nachzugUnterwegs: false}), true);
});

test('kein Nachzug bei stehendem Rahmen oder laufendem Nachzug', () => {
  assert.equal(lib.loaderNachziehen({rahmenDa: true, nachzugUnterwegs: false}), false);
  assert.equal(lib.loaderNachziehen({rahmenDa: false, nachzugUnterwegs: true}), false);
  assert.equal(lib.loaderNachziehen({rahmenDa: true, nachzugUnterwegs: true}), false);
});

test('SalesbotWidget entscheidet über loaderNachziehen, nicht über das Loader-Flag', () => {
  const quelle = lies('app/components/SalesbotWidget.jsx');
  assert.match(quelle, /if \(loaderNachziehen\(\{rahmenDa, nachzugUnterwegs\}\)\)/);
  // Das Flag darf die Entscheidung nicht mehr tragen: es kommt nur noch beim
  // Löschen vor (Nachzug und Aufräumen), nie in einer Bedingung.
  assert.doesNotMatch(quelle, /if \([^)]*__QiBlancoWidgetLoaded/);
  assert.doesNotMatch(quelle, /loaderLiefSchon/);
});

test('Kaufseite ohne, LP mit Film-Merkmal: Anna nur auf der Kaufseite', () => {
  const kauf = lies('app/routes/products.qi-alpha.jsx');
  const lp = lies('app/routes/pages.Qi-Alpha.jsx');
  assert.doesNotMatch(kauf, /filmSeite/);
  assert.match(lp, /export const handle = \{filmSeite: true\}/);
  const root = lies('app/root.jsx');
  assert.match(root, /!filmSeite &&\s*\(salesbotSeite \|\| salesbotDeutscherShop\)/);
});
