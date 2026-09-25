// Regressionstest: die Bindung der Qi-Master-Add-ons greift unabhaengig vom
// Zeilen-Merkmal `_qm_addon`, das der CLIENT setzt
// (Job 20260925-qm-addon-bindung-greift-nur-bei-attribut-prio15).
// Ausfuehren: node --test test/qi-master-addons-bindung.test.mjs
//
// DER DEFEKT (K3-Widerleger s05, live gemessen 2026-09-25): die Warenkorb-
// Action las bei LinesAdd nur nach, wenn eine Eingabezeile das Merkmal trug.
// Ein POST an /cart ohne Merkmal hinterliess eine Wunschnummer ohne Qi Master
// (H1), eine Kette x3 ohne Qi Master (H1b), eine Wunschnummer mit Menge 2
// (H3b) und dieselbe Nummer in zwei Zeilen (H6). Die attributierten Arme
// (H2-H5, H7-H9) hielten schon vorher und muessen es weiter tun.
//
// Der Fake-Warenkorb bildet die zwei Shopify-Eigenschaften nach, auf die es
// ankommt (beide in hydrogen_versuche.out gemessen): gleiche Variante MIT
// gleichen Attributen wird zu einer Zeile zusammengelegt, und die zuletzt
// hinzugefuegte Zeile steht vorn.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, naechster) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spez, kontext);
  },
  load(url, kontext, naechster) {
    if (url.endsWith('.jsx')) {
      return {format: 'module', shortCircuit: true, source: readFileSync(fileURLToPath(url), 'utf8')};
    }
    return naechster(url, kontext);
  },
});

const {bindeQiMasterAddons} = await import('../app/lib/qi-master-addons.server.js');
const {bindungsKorrektur, ADDON_ATTR} = await import('../app/lib/qi-master-addons.js');

const V = (h, n) => `gid://shopify/ProductVariant/${h}-${n}`;
const QM = V('qi-master', 1);
const WN1 = V('qi-master-wunschnummer', 1);
const WN2 = V('qi-master-wunschnummer', 2);
const WN3 = V('qi-master-wunschnummer', 3);
const K60 = V('qi-master-goldkette', 60);
const K40 = V('qi-master-goldkette', 40);
const ATTR = [{key: ADDON_ATTR, value: 'wunschnummer'}];
const ATTRK = [{key: ADDON_ATTR, value: 'kette'}];
const handleVon = (vid) => vid.split('/').pop().replace(/-\d+$/, '');

function fakeCart() {
  let zeilen = [];
  let n = 0;
  let queries = 0;
  const gleich = (a = [], b = []) => JSON.stringify(a) === JSON.stringify(b);
  const antwort = () => ({cart: {id: 'gid://shopify/Cart/t', totalQuantity: zeilen.reduce((s, z) => s + z.quantity, 0), checkoutUrl: 'https://checkout.example/x'}});
  return {
    get queries() { return queries; },
    zeilen: () => zeilen,
    async addLines(lines) {
      for (const l of lines) {
        const at = l.attributes || [];
        const da = zeilen.find((z) => z.vid === l.merchandiseId && gleich(z.attributes, at));
        if (da) da.quantity += l.quantity;
        else zeilen.unshift({id: `L${++n}`, vid: l.merchandiseId, quantity: l.quantity, attributes: at});
      }
      return antwort();
    },
    async create({lines}) { zeilen = []; return this.addLines(lines); },
    async get() {
      queries++;
      return {lines: {nodes: zeilen.map((z) => ({id: z.id, quantity: z.quantity, attributes: z.attributes, merchandise: {id: z.vid, product: {handle: handleVon(z.vid)}}}))}};
    },
    async removeLines(ids) { zeilen = zeilen.filter((z) => !ids.includes(z.id)); return antwort(); },
    async updateLines(lines) {
      for (const l of lines) {
        const z = zeilen.find((x) => x.id === l.id);
        if (!z) continue;
        z.quantity = l.quantity;
        if (l.attributes) z.attributes = l.attributes;
      }
      zeilen = zeilen.filter((z) => z.quantity > 0);
      return antwort();
    },
  };
}

// Dieselbe Reihenfolge wie routes/cart.jsx: Mutation, dann Bindung.
async function aktion(cart, action, inputs) {
  let result;
  if (action === 'LinesAdd') result = await cart.addLines(inputs.lines);
  else if (action === 'LinesUpdate') result = await cart.updateLines(inputs.lines);
  else if (action === 'LinesRemove') result = await cart.removeLines(inputs.lineIds);
  else result = {cart: {id: 'gid://shopify/Cart/t'}};
  return bindeQiMasterAddons({cart, action, inputs, result});
}
const korb = (cart) => cart.zeilen().map((z) => `${handleVon(z.vid).replace('qi-master-', '')}:${z.vid.split('-').pop()}x${z.quantity}${z.attributes.some((a) => a.key === ADDON_ATTR) ? '+' : ''}`).sort();
const zeile = (cart, vid) => cart.zeilen().find((z) => z.vid === vid).id;

// ---- Die vier Umgehungen (vor dem Fix rot) ----
test('H1 Wunschnummer OHNE Merkmal, OHNE Qi Master -> faellt weg', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: WN1, quantity: 1}]});
  assert.deepEqual(korb(c), []);
});
test('H1b Kette x3 OHNE Merkmal, OHNE Qi Master -> faellt weg', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: K60, quantity: 3}]});
  assert.deepEqual(korb(c), []);
});
test('H3b Qi Master + Wunschnummer x2 OHNE Merkmal -> Menge 1, Merkmal gesetzt', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN2, quantity: 2}]});
  assert.deepEqual(korb(c), ['qi-master:1x1', 'wunschnummer:2x1+']);
});
test('H6 dieselbe Nummer ein zweites Mal OHNE Merkmal, dann weitere Add-ons -> je Art hoechstens Qi-Master-Menge, keine Nummer doppelt', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN3, quantity: 1, attributes: ATTR}]});
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: WN3, quantity: 1}]});
  assert.equal(c.zeilen().filter((z) => z.vid === WN3).length, 1);
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: WN2, quantity: 1}, {merchandiseId: K40, quantity: 2}]});
  const k = korb(c);
  assert.equal(k.filter((x) => x.startsWith('wunschnummer')).length, 1);
  assert.deepEqual(k.filter((x) => x.startsWith('goldkette')), ['goldkette:40x1+']);
});
test('H6b zwei Qi Master, dieselbe Nummer in zwei Zeilen -> nur eine bleibt', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 2}, {merchandiseId: WN3, quantity: 1, attributes: ATTR}]});
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: WN3, quantity: 1}]});
  assert.equal(c.zeilen().filter((z) => z.vid === WN3).length, 1);
});
test('PERMALINK /cart/<Wunschnummer>:2 ohne Qi Master -> leerer Korb, Weiterleitung auf /cart statt zur Kasse', async () => {
  const c = fakeCart();
  c.setCartId = () => new Headers();
  const {loader} = await import('../app/routes/cart.$lines.jsx');
  const antwort = await loader({
    request: new Request('https://qiblanco.com/cart/x'),
    context: {cart: c, env: {}},
    params: {lines: 'qi-master-wunschnummer-1:2'},
  });
  assert.deepEqual(korb(c), []);
  assert.equal(antwort.status, 302);
  assert.equal(antwort.headers.get('Location'), '/cart');
});

// ---- Die attributierten Arme (vor und nach dem Fix gruen) ----
test('H2 Wunschnummer MIT Merkmal ohne Qi Master -> faellt weg', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: WN1, quantity: 1, attributes: ATTR}]});
  assert.deepEqual(korb(c), []);
});
test('H3 Qi Master + Wunschnummer x2 MIT Merkmal -> Menge 1', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN2, quantity: 2, attributes: ATTR}]});
  assert.deepEqual(korb(c), ['qi-master:1x1', 'wunschnummer:2x1+']);
});
test('H4 LinesRemove Qi Master -> Add-ons fallen mit', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN3, quantity: 1, attributes: ATTR}, {merchandiseId: K60, quantity: 1, attributes: ATTRK}]});
  await aktion(c, 'LinesRemove', {lineIds: [zeile(c, QM)]});
  assert.deepEqual(korb(c), []);
});
test('H5 LinesUpdate Wunschnummer auf 2 -> zurueck auf 1', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN3, quantity: 1, attributes: ATTR}]});
  await aktion(c, 'LinesUpdate', {lines: [{id: zeile(c, WN3), quantity: 2}]});
  assert.deepEqual(korb(c), ['qi-master:1x1', 'wunschnummer:3x1+']);
});
test('H7 LinesUpdate Qi Master auf 0 -> Add-ons fallen mit', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN3, quantity: 1, attributes: ATTR}, {merchandiseId: K60, quantity: 1, attributes: ATTRK}]});
  await aktion(c, 'LinesUpdate', {lines: [{id: zeile(c, QM), quantity: 0}]});
  assert.deepEqual(korb(c), []);
});
test('H9 zwei Ketten-Zeilen bei einem Qi Master -> die zuletzt genannte bleibt (Shopify: neueste zuerst)', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: K60, quantity: 1, attributes: ATTRK}, {merchandiseId: K40, quantity: 1, attributes: ATTRK}]});
  assert.deepEqual(korb(c), ['goldkette:40x1+', 'qi-master:1x1']);
});
test('REGULAER Qi Master + Nummer + Kette mit Merkmal -> unveraendert', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}, {merchandiseId: WN1, quantity: 1, attributes: ATTR}, {merchandiseId: K60, quantity: 1, attributes: ATTRK}]});
  assert.deepEqual(korb(c), ['goldkette:60x1+', 'qi-master:1x1', 'wunschnummer:1x1+']);
});

// ---- Kosten und Grenzen ----
test('KOSTEN genau eine Cart-Query je Zeilen-Aktion, keine bei Rabattcode', async () => {
  const c = fakeCart();
  await aktion(c, 'LinesAdd', {lines: [{merchandiseId: QM, quantity: 1}]});
  assert.equal(c.queries, 1);
  await aktion(c, 'DiscountCodesUpdate', {discountCodes: []});
  assert.equal(c.queries, 1);
});
test('FAIL-SOFT ein Lesefehler leert keinen Warenkorb', async () => {
  const c = fakeCart();
  await c.addLines([{merchandiseId: WN1, quantity: 1}]);
  c.get = async () => { throw new Error('netz'); };
  const r = await bindeQiMasterAddons({cart: c, action: 'LinesAdd', result: {cart: {id: 'x'}}});
  assert.deepEqual(r, {cart: {id: 'x'}});
  assert.equal(c.zeilen().length, 1);
});
test('REIN fremde Attribute einer Add-on-Zeile bleiben beim Merkmal-Setzen erhalten', () => {
  const {aendern} = bindungsKorrektur([
    {id: 'q', quantity: 1, handle: 'qi-master'},
    {id: 'w', quantity: 1, handle: 'qi-master-wunschnummer', variantId: WN1, attributes: [{key: '_x', value: 'y'}]},
  ]);
  assert.deepEqual(aendern, [{id: 'w', quantity: 1, attributes: [{key: '_x', value: 'y'}, {key: ADDON_ATTR, value: 'wunschnummer'}]}]);
});
test('REIN ohne attributes-Feld wird kein Merkmal geschrieben (Aufrufer ohne Zeilen-Attribute)', () => {
  const r = bindungsKorrektur([
    {id: 'q', quantity: 1, handle: 'qi-master'},
    {id: 'w', quantity: 1, handle: 'qi-master-wunschnummer'},
  ]);
  assert.deepEqual(r, {entfernen: [], aendern: []});
});
