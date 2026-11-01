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

// Warenkorb der Qi-Alpha-Add-ons (Christian 01.11.2026, Screenshots Warenkorb-Fenster;
// Job 20261101-prio1-qi-alpha-warenkorb-kette-bild-name-chirurgenstahlkette-r2):
//   „die menge darf nicht veränderbar sein, genau wie bei der Wunschnummer — und bei dem artiekkel
//    qi alpha 69/111 muss noch „- Wunschnummer“ im Namen hinzugefügt werden“.
// 1. Wunschnummer-Zeile heißt „Qi Alpha® 69/111 – Wunschnummer“.
// 2. Wunschnummer, Goldkette und inklusive Stahlkette haben KEINE Mengen-Knöpfe, nur Entfernen.
//    Die Menge hält der Server ohnehin (lib/qi-master-addons.server.js, je Qi Alpha eine).

const addonsMf = await import('../app/lib/qi-master-addons.js');
const datenMf = await import('../app/components/campaign/the-alpha-shop-daten.js');
const liesMf = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const linieMf = (handle, titel, produktTitel = 'Qi Alpha® Wunschnummer') => ({
  merchandise: {title: titel, product: {handle, title: produktTitel}, selectedOptions: []},
});

test('Wunschnummer-Zeile heißt „Qi Alpha® 69/111 – Wunschnummer“', () => {
  for (const t of ['69/111', 'Alpha 69/111', 'Alpha 69/100']) {
    assert.equal(addonsMf.addonZeile(linieMf('qi-alpha-wunschnummer', t)).titel,
      'Qi Alpha® 69/111 – Wunschnummer', t);
  }
  assert.equal(addonsMf.addonZeile(linieMf('qi-master-wunschnummer', '7/111')).titel,
    'Qi Alpha® 7/111 – Wunschnummer');
});

test('Menge fest: Wunschnummer, Goldkette und inklusive Stahlkette', () => {
  for (const h of ['qi-alpha-wunschnummer', 'qi-master-wunschnummer', 'qi-alpha-goldkette',
    'qi-master-goldkette', 'qi-alpha-stahlkette']) {
    assert.equal(addonsMf.mengeFest(h), true, h);
  }
  for (const h of ['qi-alpha', 'qi-master', 'qione-2-pro', '', undefined]) {
    assert.equal(addonsMf.mengeFest(h), false, String(h));
  }
});

test('Stahlketten-Handle der lib = Handle der Kaufseite (eine Stelle, zwei Leser)', () => {
  assert.equal(addonsMf.QM_STAHLKETTE_HANDLE, datenMf.QM_STAHLKETTE);
});

test('CartLineItem: bei fester Menge nur Entfernen, kein Plus/Minus', () => {
  const src = liesMf('app/components/CartLineItem.jsx');
  // Die feste Menge entscheidet VOR dem Stepper und gibt nur den Entfernen-Knopf zurück.
  const fest = /if \(mengeFest\(handle\)\) \{\s*return \(\s*<div className="cart-line-quantity">\s*<CartLineRemoveButton/;
  assert.match(src, fest);
  assert.ok(src.indexOf('mengeFest(handle)') < src.indexOf('name="increase-quantity"'),
    'mengeFest muss vor dem Plus-Knopf greifen');
});

test('Tipp auf die Stahlketten-Zeile führt zum Qi Alpha, nicht auf die nackte Add-on-Seite', async () => {
  // Ohne Karteneintrag führte der Link der Kettenzeile im Warenkorb-Fenster auf
  // /products/qi-alpha-stahlkette, eine generische Produktseite (01.11.2026 gemessen: HTTP 200).
  const {getVariantUrl} = await import('../app/lib/variants.js');
  const url = getVariantUrl({handle: 'qi-alpha-stahlkette', pathname: '/', searchParams: new URLSearchParams(),
    selectedOptions: [{name: 'Länge', value: '60 cm'}]});
  assert.match(url, /^\/products\/qi-alpha(\?|$)/);
});
