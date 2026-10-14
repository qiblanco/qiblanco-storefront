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
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatPreis} from '../app/lib/markt-pricing.js';
import {FALLBACK_PREISE} from '../app/lib/campaign-fallback-prices.js';

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

test('Warenkorb: kein ",-" (das ist der Stil der Produktseite)', () => {
  assert.doesNotMatch(formatPreis(76, 'EUR', 'cart-cent'), /,-/);
  assert.equal(formatPreis(76, 'EUR', 'pdp'), '76,- €');
});

test('Notfall-Preis der Kampagnenseiten: ganz ohne Nachkommastellen', () => {
  for (const [handle, {bruttoWert, label}] of Object.entries(FALLBACK_PREISE)) {
    if (Number.isInteger(bruttoWert)) {
      assert.doesNotMatch(label, /,00\b/, handle);
    }
  }
});
