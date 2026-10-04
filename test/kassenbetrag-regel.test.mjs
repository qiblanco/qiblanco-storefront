/* KASSENBETRAG-REGEL: die Seite nennt den Betrag, den die Kasse des
   Besucherlandes nimmt (Grossjob 20261004-GROSSJOB-preisanzeige-netto-brutto-
   rundung-alle-shops-waehrungen, s03; Konzept Abschnitt 2).
   Die Kassenbetraege stammen aus der Kassenmessung vom 2026-10-04
   (preisanzeige-pruefung/data/messung-20261004T201009Z.json). Rot auf
   origin/main 67fac79 belegt (RESULT s03). */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bruttoAnzeige, formatPreis, kassenAnzeige} from '../app/lib/markt-pricing.js';
import {
  getCartLineGrossDisplayTotalExact,
  taxRateForHandle,
} from '../app/lib/cart-display-pricing.js';
import {produktSchema} from '../app/lib/produkt-schema.js';

test('AT Kakao: 78,13 wie die Kasse, nicht 79', () => {
  assert.equal(bruttoAnzeige('71.03', 'crystal-cacao-awake', 'EUR', 'AT'), 78.13);
  assert.equal(formatPreis(78.13, 'EUR', 'pdp'), '78,13 €');
  assert.equal(formatPreis(78.13, 'EUR', 'lp'), '78,13 €');
});

test('CH QiOne: CHF-Preis plus 8,1 Prozent wie die CH-Kasse', () => {
  assert.equal(bruttoAnzeige('1048.00', 'qione-2-pro', 'CHF', 'CH'), 1132.89);
  assert.equal(formatPreis(1132.89, 'CHF', 'pdp'), '1.132,89 CHF');
  const zeile = {
    quantity: 1,
    merchandise: {product: {handle: 'qione-2-pro'}},
    cost: {totalAmount: {amount: '1048.00', currencyCode: 'CHF'}},
  };
  assert.equal(getCartLineGrossDisplayTotalExact(zeile, 'CH'), 1132.89);
});

test('DE Set 5x: 266,06 wie die Kasse, nicht 267', () => {
  assert.equal(bruttoAnzeige('248.65', 'bundle-5x-awake', 'EUR', 'DE'), 266.06);
});

test('DE QiOne bleibt 1.087,- (Notbehelf 1 Cent bis zum Brutto-Kipp)', () => {
  assert.equal(bruttoAnzeige('913.45', 'qione-2-pro', 'EUR', 'DE'), 1087);
  assert.equal(formatPreis(1087, 'EUR', 'pdp'), '1.087,- €');
  assert.equal(formatPreis(76, 'EUR', 'lp'), '76 €');
  // Der Notbehelf gilt nur in DE und nur 1 Cent weit.
  assert.equal(kassenAnzeige(1087.01, 'AT'), 1087.01);
  assert.equal(kassenAnzeige(1086.99, 'DE'), 1087);
  assert.equal(kassenAnzeige(1087.02, 'DE'), 1087.02);
});

test('FR: gemessener Satz 20 / 5,5 Prozent', () => {
  assert.equal(taxRateForHandle('qione-2-pro', 'FR'), 0.2);
  assert.equal(taxRateForHandle('crystal-cacao-awake', 'FR'), 0.055);
  assert.equal(bruttoAnzeige('913.45', 'qione-2-pro', 'EUR', 'FR'), 1096.14);
  assert.equal(bruttoAnzeige('71.03', 'crystal-cacao-awake', 'EUR', 'FR'), 74.94);
});

test('Format: Cent in jeder Waehrung, ganz bleibt ganz', () => {
  assert.equal(formatPreis(1234.56, 'USD', 'pdp'), '$1,234.56');
  assert.equal(formatPreis(1383, 'USD', 'pdp'), '$1,383');
  assert.equal(formatPreis(5025.78, 'PLN', 'lp'), '5.025,78 PLN');
});

test('JSON-LD nennt den Cent-Betrag der Seite', () => {
  const s = produktSchema(
    {
      handle: 'crystal-cacao-awake',
      title: 'Crystal Cacao Awake',
      selectedOrFirstAvailableVariant: {
        availableForSale: true,
        price: {amount: '71.03', currencyCode: 'EUR'},
      },
    },
    'AT',
  );
  assert.equal(s.offers.price, '78.13');
});
