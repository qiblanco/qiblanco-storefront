// Hermetischer Test: BF-Deal-Zeilen (Merkmal _bf_deal) bleiben in der
// Kakao-Normalform unberührt. Kein Netz. node --test test/kakao-bf-deal-zeile.test.mjs
//
// Anlass: Notbahn 20261119 (Christian, DM Nina Froitzheim, Patient in NL): im
// Pre-Sale springt der Warenkorb "ab 2 Bundles" auf den Normalpreis. Gemessen
// live 19.11.: zweiter Deal-Klick bundle-2x-awake legt die Normalform auf
// bundle-4x-awake (213 EUR, BF26-KAKAO-NKSKX applicable=false) bzw. in NL auf
// 4x crystal-cacao-awake mit 30 % Automatik (212,80 EUR) statt 2 x 76 = 152 EUR.
//
// Rot-vor-Gruen: KAKAO_SERVER_MODUL=<Fassung von origin/main> node --test …
// muss die Arme A und B rot werfen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, naechster) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    if (spez === '@shopify/hydrogen') {
      return naechster(spez, {...kontext, parentURL: import.meta.url});
    }
    return naechster(spez, kontext);
  },
});
const MODUL = process.env.KAKAO_SERVER_MODUL
  ? pathToFileURL(process.env.KAKAO_SERVER_MODUL).href
  : new URL('../app/lib/kakao-set-zeile.server.js', import.meta.url).href;
const {legeKakaoSetZeile, kakaoPackungenEingabe} = await import(MODUL);

const vid = (h) => `gid://shopify/ProductVariant/${h}`;
const BF = [{key: '_bf_deal', value: 'kakao'}];

function fake(zeilen) {
  const log = [];
  let n = 0;
  const korb = {
    id: 'gid://shopify/Cart/k1',
    zeilen: zeilen.map(([handle, quantity, bf]) => ({
      id: `gid://shopify/CartLine/L${++n}`, handle, quantity, attributes: bf ? BF : [],
    })),
  };
  const knoten = () =>
    korb.zeilen.map((z) => ({
      id: z.id,
      quantity: z.quantity,
      attributes: z.attributes,
      merchandise: {id: vid(z.handle), product: {handle: z.handle}},
      cost: {totalAmount: {amount: (76 * z.quantity).toFixed(2), currencyCode: 'EUR'}},
      discountAllocations: [],
    }));
  const storefront = {
    i18n: {country: 'DE', language: 'DE'},
    CacheShort: () => ({}),
    CacheNone: () => ({}),
    async query(q, opt = {}) {
      if (q.includes('KakaoSetZeilen(')) {
        log.push('Q:zeilen');
        return {cart: {discountCodes: [{code: 'BF26-KAKAO-NKSKX', applicable: true}], lines: {nodes: knoten()}}};
      }
      if (q.includes('KakaoSetVariante(')) {
        log.push('Q:variante');
        const h = opt.variables.handle;
        return {product: {selectedOrFirstAvailableVariant: {id: vid(h), availableForSale: true, price: {amount: '122.00', currencyCode: 'EUR'}}}};
      }
      if (q.includes('KakaoSetVarianten(')) return {};
      throw new Error('unbekannte Abfrage');
    },
  };
  const antwort = () => ({cart: {id: korb.id, totalQuantity: 1}, userErrors: []});
  const cart = {
    getCartId: () => korb.id,
    async updateLines(lines) {
      log.push('M:update');
      for (const l of lines) {
        const z = korb.zeilen.find((x) => x.id === l.id);
        if (l.merchandiseId) z.handle = l.merchandiseId.split('/').pop();
        z.quantity = l.quantity;
      }
      return antwort();
    },
    async addLines(lines) {
      log.push('M:add');
      for (const l of lines) korb.zeilen.push({id: `gid://shopify/CartLine/L${++n}`, handle: l.merchandiseId.split('/').pop(), quantity: l.quantity, attributes: l.attributes || []});
      return antwort();
    },
    async removeLines() { log.push('M:remove'); return antwort(); },
  };
  return {cart, storefront, log, korb, antwort};
}

const stand = (k) => k.korb.zeilen.map((z) => `${z.handle} x${z.quantity}`).sort();

test('A: zwei BF-Sets 2x Awake bleiben zwei BF-Sets (kein Umlegen auf 4x)', async () => {
  const k = fake([['bundle-2x-awake', 2, true]]);
  await legeKakaoSetZeile({cart: k.cart, storefront: k.storefront, action: 'LinesAdd', result: k.antwort()});
  assert.deepEqual(stand(k), ['bundle-2x-awake x2']);
  assert.equal(k.log.filter((x) => x.startsWith('M:')).length, 0);
});

test('A2: BF-Set 1x Awake + 1x Create und BF-Set 2x Create bleiben getrennt', async () => {
  const k = fake([['bundle-1x-awake-1x-create', 1, true], ['mengenrabatt-2x', 1, true]]);
  await legeKakaoSetZeile({cart: k.cart, storefront: k.storefront, action: 'LinesAdd', result: k.antwort()});
  assert.deepEqual(stand(k), ['bundle-1x-awake-1x-create x1', 'mengenrabatt-2x x1']);
});

test('B: Stepper + auf BF-Set (alter Browser, Packungen) erhoeht die Set-Menge', async () => {
  const k = fake([['bundle-2x-awake', 1, true]]);
  const id = k.korb.zeilen[0].id;
  const lines = await kakaoPackungenEingabe({storefront: k.storefront, cart: k.cart,
    inputs: {lines: [{id, quantity: 1}], kakaoPackungen: {lineId: id, handle: 'bundle-2x-awake', packungen: 3}}});
  assert.deepEqual(lines, [{id, quantity: 2}]);
  const runter = await kakaoPackungenEingabe({storefront: k.storefront, cart: k.cart,
    inputs: {lines: [{id, quantity: 3}], kakaoPackungen: {lineId: id, handle: 'bundle-2x-awake', packungen: 5}}});
  assert.deepEqual(runter, [{id, quantity: 2}]);
});

test('C: ohne BF-Merkmal bleibt die Normalform wie bisher (zwei 2x-Sets -> umgelegt)', async () => {
  const k = fake([['bundle-2x-awake', 2, false]]);
  await legeKakaoSetZeile({cart: k.cart, storefront: k.storefront, action: 'LinesAdd', result: k.antwort()});
  assert.notDeepEqual(stand(k), ['bundle-2x-awake x2']);
});

test('D: Stepper ohne BF-Merkmal nimmt den Packungsweg wie bisher', async () => {
  const k = fake([['bundle-2x-awake', 1, false]]);
  const id = k.korb.zeilen[0].id;
  const lines = await kakaoPackungenEingabe({storefront: k.storefront, cart: k.cart,
    inputs: {lines: [{id, quantity: 1}], kakaoPackungen: {lineId: id, handle: 'bundle-2x-awake', packungen: 3}}});
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
  assert.ok(lines[0].merchandiseId.endsWith('crystal-cacao-awake'));
});
