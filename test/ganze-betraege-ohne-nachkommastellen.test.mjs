/**
 * Hermetischer Test: EIN GANZER BETRAG STEHT OHNE NACHKOMMASTELLEN, AUCH IM WARENKORB
 * (node --test test/ganze-betraege-ohne-nachkommastellen.test.mjs).
 *
 * ANLASS (Job 20261013-bau-ganze-betraege-ohne-nachkommastellen-alle-shops-und-wache),
 * Christian 13.10.2026: "ich möchte auch nicht dass im warenkorb die nachkommastellen
 * angezeigt werden, wir haben ja die preise bereinigt auf ganze euro".
 * Gemessen am 14.10. 01:0xZ (rt-Wache preisformat-ganze-betraege-wache, desktop):
 * Schublade und /cart zeigten "1.087,00 €", der Versandhinweis "Nur noch 99,00 €".
 * Ursache: formatPreis(..., 'cart-cent') erzwang zwei Stellen auch bei ganzen Beträgen.
 *
 * Die zweite Hälfte der Regel wird mitgeprüft: ein Betrag MIT Cent bleibt cent-genau
 * (die Kasse belastet ihn so, aiceo:digest54:p3).
 *
 * NACHTRAG 15.10.2026 (Grossjob 20261015-GROSSJOB-design-update-designmeister-homepagebauer-
 * fehler-wurzel-alle-beheben, s02), Christian: "ja dann auch 76 € statt ,-". Die Kaufseiten
 * (Stil 'pdp') zeigten "53,- €", "76,- €", "1.087,- €"; crystal-cacao.com zieht dieselbe Datei
 * per K1-Nachzug. Der Grundpreis stand als "12,62€ / 100g" und steht jetzt "12,62 € / 100 g".
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatPreis} from '../app/lib/markt-pricing.js';
import {FALLBACK_PREISE} from '../app/lib/campaign-fallback-prices.js';
import {setzePreismodus} from '../app/lib/preismodus.js';
import {cacaoPricing} from '../app/lib/cacao-pricing.js';

test('Warenkorb: ganzer Betrag ohne Nachkommastellen, in jeder Währung', () => {
  assert.equal(formatPreis(1087, 'EUR', 'cart-cent'), '1.087 €');
  assert.equal(formatPreis(99, 'EUR', 'cart-cent'), '99 €');
  assert.equal(formatPreis(1048, 'CHF', 'cart-cent'), '1.048 CHF');
  assert.equal(formatPreis(1383, 'USD', 'cart-cent'), '$1,383');
  assert.equal(formatPreis(4608, 'GBP', 'cart-cent'), '4.608 GBP');
});

test('Warenkorb: Betrag mit Cent bleibt cent-genau', () => {
  assert.equal(formatPreis(159.63, 'EUR', 'cart-cent'), '159,63 €');
  assert.equal(formatPreis(1132.89, 'CHF', 'cart-cent'), '1.132,89 CHF');
  assert.equal(formatPreis(277.2, 'USD', 'cart-cent'), '$277.20');
  assert.equal(formatPreis(5.9, 'EUR', 'cart-cent'), '5,90 €');
});

test('Kein ",-" in keinem Stil: Kaufseite, Warenkorb, Karten', () => {
  for (const stil of ['pdp', 'cart-cent', 'lp']) {
    assert.equal(formatPreis(53, 'EUR', stil), '53 €', stil);
    assert.equal(formatPreis(76, 'EUR', stil), '76 €', stil);
    assert.equal(formatPreis(1087, 'EUR', stil), '1.087 €', stil);
    assert.equal(formatPreis(1048, 'CHF', stil), '1.048 CHF', stil);
    assert.equal(formatPreis(49, 'USD', stil), '$49', stil);
    assert.doesNotMatch(formatPreis(78, 'CHF', stil), /,-/, stil);
  }
});

test('Kaufseite: Betrag mit Cent bleibt cent-genau', () => {
  assert.equal(formatPreis(12.62, 'EUR', 'pdp'), '12,62 €');
  assert.equal(formatPreis(78.13, 'EUR', 'pdp'), '78,13 €');
  assert.equal(formatPreis(53.67, 'CHF', 'pdp'), '53,67 CHF');
});

test('Grundpreis: "12,62 € / 100 g" mit Leerzeichen vor € und vor g', () => {
  // Netto-Fixtur wie test/cacao-pricing.test.mjs: 71,03 netto -> 53 € je Packung im 3er-Set.
  setzePreismodus('netto');
  const variante = (amount, currencyCode) => ({price: {amount, currencyCode}});
  const p3 = cacaoPricing('3', variante('71.03', 'EUR'), 'crystal-cacao-awake', 'DE');
  assert.equal(p3.price, '53 €');
  assert.equal(p3.per100g, '12,62 € / 100 g');
  const p1 = cacaoPricing('1', variante('71.03', 'EUR'), 'crystal-cacao-awake', 'DE');
  assert.equal(p1.price, '76 €');
  assert.equal(p1.per100g, '18,10 € / 100 g');
  const usd = cacaoPricing('1', variante('99.0', 'USD'), 'crystal-cacao-awake', 'US');
  assert.match(usd.per100g, /^\$\d+\.\d{2} \/ 100 g$/);
  for (const p of [p3, p1, usd]) {
    assert.doesNotMatch(p.per100g, /\d€|100g/, p.per100g);
  }
});

test('Notfall-Preis der Kampagnenseiten: ganz ohne Nachkommastellen', () => {
  for (const [handle, {bruttoWert, label}] of Object.entries(FALLBACK_PREISE)) {
    if (Number.isInteger(bruttoWert)) {
      assert.doesNotMatch(label, /,00\b/, handle);
    }
  }
});
