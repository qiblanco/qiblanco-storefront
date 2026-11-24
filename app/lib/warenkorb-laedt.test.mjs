// Ladezustand des Warenkorb-Fensters (lib/warenkorb-laedt.js). Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  CART_FORM_FELD,
  aktionAusFeldwert,
  fensterZustand,
  istHinzufuegenKlick,
  istLaufendesHinzufuegen,
} from './warenkorb-laedt.js';

const fd = (aktion) => {
  const m = new Map([[CART_FORM_FELD, JSON.stringify({action: aktion, inputs: {}})]]);
  return {get: (k) => m.get(k) ?? null};
};

test('Fenster: Zeilen schlagen alles, Laden schlägt leer', () => {
  assert.equal(fensterZustand({zeilen: 1, fetcherLaeuft: true, klickLaeuft: true}), 'zeilen');
  assert.equal(fensterZustand({zeilen: 0, fetcherLaeuft: true, klickLaeuft: false}), 'laedt');
  assert.equal(fensterZustand({zeilen: 0, fetcherLaeuft: false, klickLaeuft: true}), 'laedt');
  assert.equal(fensterZustand({zeilen: 0, fetcherLaeuft: false, klickLaeuft: false}), 'leer');
});

test('Fetcher: nur ein nicht-idles LinesAdd zählt', () => {
  assert.equal(istLaufendesHinzufuegen({state: 'submitting', formData: fd('LinesAdd')}), true);
  assert.equal(istLaufendesHinzufuegen({state: 'loading', formData: fd('LinesAdd')}), true);
  assert.equal(istLaufendesHinzufuegen({state: 'idle', formData: fd('LinesAdd')}), false);
  assert.equal(istLaufendesHinzufuegen({state: 'submitting', formData: fd('LinesRemove')}), false);
  assert.equal(istLaufendesHinzufuegen({state: 'loading'}), false);
  assert.equal(istLaufendesHinzufuegen(null), false);
});

test('Feldwert: kaputtes JSON ist keine Aktion', () => {
  assert.equal(aktionAusFeldwert('{'), null);
  assert.equal(aktionAusFeldwert(''), null);
  assert.equal(aktionAusFeldwert('{"action":"LinesAdd"}'), 'LinesAdd');
});

function knopf({attrs = {}, disabled = false, feldwert} = {}) {
  const form = {
    querySelector: (sel) =>
      sel === `input[name="${CART_FORM_FELD}"]` && feldwert !== undefined ? {value: feldwert} : null,
  };
  const k = {
    disabled,
    form,
    hasAttribute: (n) => n in attrs,
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
  };
  k.closest = () => k;
  return k;
}

test('Klick: Kaufknopf-Marke oder LinesAdd-Formular, nie gesperrt', () => {
  assert.equal(istHinzufuegenKlick(knopf({attrs: {'data-qb-kaufknopf': ''}})), true);
  assert.equal(istHinzufuegenKlick(knopf({attrs: {'data-qb-kaufknopf': ''}, disabled: true})), false);
  assert.equal(istHinzufuegenKlick(knopf({feldwert: JSON.stringify({action: 'LinesAdd'})})), true);
  assert.equal(istHinzufuegenKlick(knopf({feldwert: JSON.stringify({action: 'LinesUpdate'})})), false);
  assert.equal(
    istHinzufuegenKlick(knopf({attrs: {type: 'button'}, feldwert: JSON.stringify({action: 'LinesAdd'})})),
    false,
  );
  assert.equal(istHinzufuegenKlick(knopf()), false);
  assert.equal(istHinzufuegenKlick({closest: () => null}), false);
  assert.equal(istHinzufuegenKlick(null), false);
});
