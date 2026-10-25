// Regressionstest: Qi Alpha mit Wunschnummer bringt den Warenkorb nicht zum
// Absturz, und die Wunschnummer geht bis 111
// (Job 20261025-repair-qi-alpha-kauffaehig-warenkorb-absturz-wunschnummer-111-logo).
// Ausführen: node --test test/qi-alpha-warenkorb-zeile.test.mjs
//
// DER DEFEKT (live gemessen 2026-10-25, probe.py im Jobordner, Handy und
// Desktop): Klick auf „In den Warenkorb legen“ MIT gewählter Wunschnummer ->
// „Application Error: Cannot read properties of undefined (reading 'handle')“,
// OHNE Wunschnummer kein Absturz. Die Wunschnummer-Variante kommt aus
// QM_ADDONS_QUERY und ging als selectedVariant in die optimistische
// Warenkorbzeile (addonLinien -> useOptimisticCart). Die Abfrage lieferte die
// Variante ohne `product`, CartLineItem las `product.handle`.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, nächster) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return nächster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return nächster(spez, kontext);
  },
});

const addons = await import('../app/lib/qi-master-addons.js');

/** Die Knoten-Auswahl der Varianten im Fragment QiMasterAddon. */
function variantenKnoten(query) {
  const ab = query.indexOf('variants(first:');
  assert.ok(ab > 0, 'Fragment fragt Varianten ab');
  return query.slice(ab, query.indexOf('availableForSale', ab));
}

test('Wunschnummer-Varianten tragen product.handle (optimistische Zeile)', () => {
  const knoten = variantenKnoten(addons.QM_ADDONS_QUERY);
  assert.match(knoten, /product\s*\{[^}]*\bhandle\b[^}]*\}/);
  assert.match(knoten, /selectedOptions\s*\{[^}]*\bname\b[^}]*\bvalue\b/);
});

test('Varianten-Abfrage reicht für die Serie bis 111', () => {
  const m = addons.QM_ADDONS_QUERY.match(/variants\(first:\s*(\d+)\)/);
  assert.ok(m && Number(m[1]) >= 111, `variants(first: ${m?.[1]})`);
});

test('addonLinien reicht das Produkt der Variante in die Zeile durch', () => {
  const variante = {
    id: 'gid://shopify/ProductVariant/1',
    title: 'Alpha 19/100',
    product: {id: 'gid://shopify/Product/2', handle: 'qi-master-wunschnummer', title: 'Wunschnummer'},
    selectedOptions: [{name: 'Nummer', value: 'Alpha 19/100'}],
  };
  const [zeile] = addons.addonLinien({wunschnummer: variante});
  assert.equal(zeile.selectedVariant.product.handle, 'qi-master-wunschnummer');
});

test('Anzeige der Wunschnummer: Serie bis 111', () => {
  assert.equal(addons.nummerAnzeige('Alpha 19/100'), 'Alpha 19/111');
  assert.equal(addons.nummerAnzeige('Alpha 105/111'), 'Alpha 105/111');
  assert.equal(addons.nummerAnzeige('60 cm'), '60 cm');
  assert.equal(addons.nummerAnzeige(undefined), '');
});

test('CartLineItem liest product und selectedOptions nie ungeschützt', () => {
  const quelle = readFileSync(new URL('../app/components/CartLineItem.jsx', import.meta.url), 'utf8');
  const kopf = quelle.slice(quelle.indexOf('export function CartLineItem'), quelle.indexOf('return ('));
  assert.doesNotMatch(kopf, /[^?]product\.handle/);
  assert.match(kopf, /selectedOptions\s*=\s*merchandise\?\.selectedOptions\s*\?\?\s*\[\]/);
});
