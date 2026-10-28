/**
 * Wächter: KEINE STEUERANGABE AUF DEN PRODUKTSEITEN von qiblanco.com
 * (node --test, ohne Bundler) — Grossjob 20261027-produktseiten-mwst-zeile-raus-z233, s03.
 * Christian 27.10.2026 (Register Z223/Z232-Z233): „das mit den Mehrwertsteuern
 * wird nirgendwo angezeigt, das zeigen wir erst im Checkout".
 *
 * Gemessen wird nach der Eigenschaft, nicht nach einem Literal: jede Route
 * app/routes/products.* und qi-master.css, ohne Kommentare (die Kommentare
 * erzählen die Geschichte der entfernten Zeile und werden nicht ausgeliefert).
 * ROT VOR GRÜN: auf origin/main cb5afb77 rot (products.qi-alpha-b.jsx trägt
 * <p className="qm-steuerhinweis">, qi-master.css die Regel dazu).
 * Nicht erfasst: Landingpages (/pages/*) — nicht Teil dieses Auftrags.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const ohneKommentare = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
const STEUER = /qm-steuerhinweis|MwSt|Mehrwertsteuer|Umsatzsteuer/i;

test('Produkt-Routen rendern keine Steuerangabe', () => {
  const routen = readdirSync(join(WURZEL, 'app/routes')).filter((f) =>
    /^products\..*\.jsx$/.test(f),
  );
  assert.ok(routen.length >= 5, `Produkt-Routen gefunden: ${routen.length}`);
  const funde = routen.filter((f) => STEUER.test(ohneKommentare(lies(`app/routes/${f}`))));
  assert.deepEqual(funde, []);
});

test('qi-master.css trägt keine Regel für den Steuerhinweis und keine inline-flex-Preiszeile', () => {
  const css = ohneKommentare(lies('app/styles/qi-master.css'));
  assert.ok(css.length > 1000, 'qi-master.css gelesen');
  assert.doesNotMatch(css, /\.qm-steuerhinweis/);
  assert.doesNotMatch(css, /\.qm-pdp \.Bestseller-Price > \.product-price/);
});
