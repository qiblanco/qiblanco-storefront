// Warenkorb der Qi-Alpha-Add-ons (Christian 01.11.2026, Screenshots Warenkorb-Fenster;
// Job 20261101-prio1-qi-alpha-warenkorb-kette-bild-name-chirurgenstahlkette-r2):
//   „die menge darf nicht veränderbar sein, genau wie bei der Wunschnummer — und bei dem artiekkel
//    qi alpha 69/111 muss noch „- Wunschnummer“ im Namen hinzugefügt werden“.
// 1. Wunschnummer-Zeile heißt „Qi Alpha® 69/111 – Wunschnummer“.
// 2. Wunschnummer, Goldkette und inklusive Stahlkette haben KEINE Mengen-Knöpfe, nur Entfernen.
//    Die Menge hält der Server ohnehin (lib/qi-master-addons.server.js, je Qi Alpha eine).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const addons = await import('../app/lib/qi-master-addons.js');
const daten = await import('../app/components/campaign/the-alpha-shop-daten.js');
const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const linie = (handle, titel, produktTitel = 'Qi Alpha® Wunschnummer') => ({
  merchandise: {title: titel, product: {handle, title: produktTitel}, selectedOptions: []},
});

test('Wunschnummer-Zeile heißt „Qi Alpha® 69/111 – Wunschnummer“', () => {
  for (const t of ['69/111', 'Alpha 69/111', 'Alpha 69/100']) {
    assert.equal(addons.addonZeile(linie('qi-alpha-wunschnummer', t)).titel,
      'Qi Alpha® 69/111 – Wunschnummer', t);
  }
  assert.equal(addons.addonZeile(linie('qi-master-wunschnummer', '7/111')).titel,
    'Qi Alpha® 7/111 – Wunschnummer');
});

test('Menge fest: Wunschnummer, Goldkette und inklusive Stahlkette', () => {
  for (const h of ['qi-alpha-wunschnummer', 'qi-master-wunschnummer', 'qi-alpha-goldkette',
    'qi-master-goldkette', 'qi-alpha-stahlkette']) {
    assert.equal(addons.mengeFest(h), true, h);
  }
  for (const h of ['qi-alpha', 'qi-master', 'qione-2-pro', '', undefined]) {
    assert.equal(addons.mengeFest(h), false, String(h));
  }
});

test('Stahlketten-Handle der lib = Handle der Kaufseite (eine Stelle, zwei Leser)', () => {
  assert.equal(addons.QM_STAHLKETTE_HANDLE, daten.QM_STAHLKETTE);
});

test('CartLineItem: bei fester Menge nur Entfernen, kein Plus/Minus', () => {
  const src = lies('app/components/CartLineItem.jsx');
  // Die feste Menge entscheidet VOR dem Stepper und gibt nur den Entfernen-Knopf zurück.
  const fest = /if \(mengeFest\(handle\)\) \{\s*return \(\s*<div className="cart-line-quantity">\s*<CartLineRemoveButton/;
  assert.match(src, fest);
  assert.ok(src.indexOf('mengeFest(handle)') < src.indexOf('name="increase-quantity"'),
    'mengeFest muss vor dem Plus-Knopf greifen');
});
