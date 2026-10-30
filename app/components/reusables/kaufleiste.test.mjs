// Kaufleiste der Produktseite (reusables/Kaufleiste.jsx, kaufleiste-lage.js).
// Lauf: node --test (findet *.test.mjs im ganzen Baum außer node_modules).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  JETZT_KAUFEN,
  KAUFLEISTE_AB_TEST,
  KAUFLEISTE_NUTZEN,
  kaufleisteAnzeige,
  kaufleisteSichtbar,
  kaufleisteZiel,
  variantenwahlText,
} from './kaufleiste-lage.js';

const lage = (x) => ({geraetAn: true, gemessen: true, kaufknopfImBild: false, ...x});

test('Kaufleiste: steht schon ganz oben, solange der Kaufknopf unter dem Fenster liegt', () => {
  assert.equal(kaufleisteSichtbar(lage({})), true);
});

test('Kaufleiste: weg, sobald der Kaufknopf der Kaufbox im Bild ist', () => {
  assert.equal(kaufleisteSichtbar(lage({kaufknopfImBild: true})), false);
});

test('Kaufleiste: bleibt am Seitenende über dem Fuß stehen (s08, 30.10.2026)', () => {
  // Der Fuß zählt nicht mehr: qb-kaufleiste.css hält ihm darunter Platz frei.
  assert.equal(kaufleisteSichtbar(lage({fussImBild: true})), true);
});

test('Kaufleiste: Fuß bekommt mobil den Platz der Leiste (qb-kaufleiste.css)', async () => {
  const {readFileSync} = await import('node:fs');
  const css = readFileSync(new URL('../../styles/qb-kaufleiste.css', import.meta.url), 'utf8');
  assert.match(css, /body:has\(\.qb-kaufleiste\[data-kaufleiste-mobil='an'\]\)\s+footer\s*\{[^}]*padding-bottom/);
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

// A/B-Test der Kaufleiste (s03, 25.10.2026, Christian Z4)
test('Kaufleiste A/B: Arm b zeigt Nutzenaussage und „Jetzt kaufen“', () => {
  assert.deepEqual(kaufleisteAnzeige({arm: 'b', handle: 'qione-2-pro'}),
    {arm: 'b', nutzen: 'E-Smog Schutz', knopf: 'Jetzt kaufen'});
  assert.equal(JETZT_KAUFEN, 'Jetzt kaufen');
  for (const h of ['qione-kette', 'qibracelet', 'qihome-air']) {
    assert.equal(kaufleisteAnzeige({arm: 'b', handle: h}).nutzen, 'E-Smog Schutz', h);
  }
});

test('Kaufleiste A/B: Arm a, kein Arm und Produkt ohne Nutzen zeigen den Bestand', () => {
  const bestand = {arm: 'a', nutzen: null, knopf: null};
  assert.deepEqual(kaufleisteAnzeige({arm: 'a', handle: 'qione-2-pro'}), bestand);
  assert.deepEqual(kaufleisteAnzeige({arm: undefined, handle: 'qione-2-pro'}), bestand);
  assert.deepEqual(kaufleisteAnzeige({arm: 'b', handle: 'qi-master'}), bestand);
  assert.deepEqual(kaufleisteAnzeige({arm: 'x', handle: 'qibracelet'}), bestand);
});

test('Kaufleiste A/B: Nutzen eine Zeile kurz, echte Umlaute, Testkennung gültig', () => {
  for (const [h, t] of Object.entries(KAUFLEISTE_NUTZEN)) {
    assert.ok(t.split(/\s+/).length <= 3, h);
    assert.ok(!/ae|oe|ue/.test(t.toLowerCase().replace('smog', '')), h);
  }
  assert.match(KAUFLEISTE_AB_TEST, /^[a-z0-9_]{1,32}$/);
});
