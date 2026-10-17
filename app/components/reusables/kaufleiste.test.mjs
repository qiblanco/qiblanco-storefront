// Kaufleiste der Produktseite (reusables/Kaufleiste.jsx, kaufleiste-lage.js).
// Lauf: node --test (findet *.test.mjs im ganzen Baum außer node_modules).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  kaufleisteSichtbar,
  kaufleisteZiel,
  variantenwahlText,
} from './kaufleiste-lage.js';

const lage = (x) => ({geraetAn: true, gemessen: true, kaufknopfImBild: false, fussImBild: false, ...x});

test('Kaufleiste: steht schon ganz oben, solange der Kaufknopf unter dem Fenster liegt', () => {
  assert.equal(kaufleisteSichtbar(lage({})), true);
});

test('Kaufleiste: weg, sobald der Kaufknopf der Kaufbox im Bild ist', () => {
  assert.equal(kaufleisteSichtbar(lage({kaufknopfImBild: true})), false);
});

test('Kaufleiste: weg, sobald der Fuß im Bild ist', () => {
  assert.equal(kaufleisteSichtbar(lage({fussImBild: true})), false);
});

test('Kaufleiste: Schalter aus für das Gerät = keine Leiste', () => {
  assert.equal(kaufleisteSichtbar(lage({geraetAn: false})), false);
});

test('Kaufleiste: ohne Messung des Kaufknopfs keine Leiste', () => {
  assert.equal(kaufleisteSichtbar(lage({gemessen: false})), false);
});

test('Ziel: eine Variante -> Warenkorb', () => {
  assert.equal(kaufleisteZiel({mehrereVarianten: false, gewählt: false}), 'warenkorb');
});

test('Ziel: mehrere Varianten, nichts gewählt -> Variantenwahl, nie die vorgewählte kaufen', () => {
  assert.equal(kaufleisteZiel({mehrereVarianten: true, gewählt: false}), 'variantenwahl');
});

test('Ziel: mehrere Varianten, Größe angetippt -> Warenkorb', () => {
  assert.equal(kaufleisteZiel({mehrereVarianten: true, gewählt: true}), 'warenkorb');
});

test('Beschriftung der Variantenwahl: deutsch, auch für Shopifys "Size"', () => {
  assert.equal(variantenwahlText('Größe'), 'Größe wählen');
  assert.equal(variantenwahlText('Size'), 'Größe wählen');
  assert.equal(variantenwahlText(undefined), 'Größe wählen');
});
