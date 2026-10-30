// Schlussleiste der Konfigurator-Kaufseiten (reusables/Schlussleiste.jsx,
// schlussleiste-lage.js). Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHLUSSLEISTE_AN, schlussleisteSichtbar} from './schlussleiste-lage.js';
import {lageRuhig, lageZusammen} from '../../lib/kaufleiste-sicht.js';

const knopf = (x) => ({da: true, imBild: false, darueber: false, ...x});
const lage = (k) => ({geraetAn: true, knopf: knopf(k)});

test('Schlussleiste: weg, solange der Knopf der Zusammenfassung noch kommt (Kopf, Auswahl)', () => {
  assert.equal(schlussleisteSichtbar(lage({darunter: true})), false);
});

test('Schlussleiste: weg, solange der Knopf der Zusammenfassung im Bild ist', () => {
  assert.equal(schlussleisteSichtbar(lage({imBild: true})), false);
});

test('Schlussleiste: steht, sobald der Knopf nach oben weg ist (Box, Fragen, Fuß, Seitenende)', () => {
  assert.equal(schlussleisteSichtbar(lage({darueber: true})), true);
});

test('Schlussleiste: ohne gemessenen Knopf und auf ausgeschaltetem Gerät weg', () => {
  assert.equal(schlussleisteSichtbar({geraetAn: true, knopf: lageZusammen([])}), false);
  assert.equal(schlussleisteSichtbar({geraetAn: false, knopf: knopf({darueber: true})}), false);
  assert.deepEqual(SCHLUSSLEISTE_AN, {desktop: false, mobil: true});
});

test('Schlussleiste: Seitenende ruhig, ob die Browserleisten ein- oder ausgeklappt sind', () => {
  // Gemessen wird gegen 100svh (kleine Höhe), nicht gegen das Fenster: an
  // derselben Scrollposition ist die Lage in beiden Zuständen gleich.
  const svh = 664;
  const kante = {oben: -2900, unten: -2830}; // Knopf weit oben, Fuß im Bild
  const ein = lageRuhig(kante, svh, false);
  const aus = lageRuhig(kante, svh, false);
  const z = (l) => schlussleisteSichtbar({geraetAn: true, knopf: lageZusammen([l])});
  assert.equal(z(ein), true);
  assert.equal(z(aus), z(ein));
});

test('Schlussleiste: Hysterese an der Oberkante, ein Ruck schaltet nichts', () => {
  const svh = 664;
  const z = (kante, war) =>
    schlussleisteSichtbar({geraetAn: true, knopf: lageZusammen([lageRuhig(kante, svh, war)])});
  // Knopf eben über den oberen Rand: gilt noch als im Bild (Hysterese 48 px).
  assert.equal(z({oben: -80, unten: -20}, true), false);
  // Deutlich darüber: Leiste steht.
  assert.equal(z({oben: -140, unten: -70}, true), true);
});

const css = readFileSync(new URL('../../styles/the-alpha-shop.css', import.meta.url), 'utf8');

test('Schlussleiste: Fuß bekommt mobil ein festes Polster, Dialog blendet aus', () => {
  assert.match(
    css,
    /body:has\(\.tas-schlussleiste\[data-schlussleiste-mobil='an'\]\) footer\s*\{\s*padding-bottom:/,
  );
  assert.match(css, /html\[data-dialog-offen\] \.tas-schlussleiste\s*\{\s*display: none;/);
});

for (const datei of ['../product-pages/AlphaVorlage.jsx', '../campaign/TheAlphaShop.jsx']) {
  test(`Schlussleiste: ${datei} hängt sie ein und reicht den Knopf der Zusammenfassung herein`, () => {
    const q = readFileSync(new URL(datei, import.meta.url), 'utf8');
    assert.match(q, /<Schlussleiste[\s\S]*?wurzel=\{seite\}/);
    assert.match(q, /\{kaufknopf\}\s*<\/Schlussleiste>/);
    assert.match(q, /className="tas-kaufknopf[^"]*">\s*\{kaufknopf\}/);
  });
}
