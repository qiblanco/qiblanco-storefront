// node --test app/components/black-friday-2026/bf-deal-landespreis.test.mjs
// Deal-Preis im Land des Besuchers (Job 20261113-deal-ruecklaeufer-seite-zeigt-eur-in-ch-pl-se-cz).
// Der Mock zeichnet die Argumente auf: geprüft wird, WAS an die Cart-API geht.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  _ablageLeeren,
  bfDealLandesPreis,
  bfDealLandesPreise,
  bfDealLandesPreiseSetzen,
  bfKakaoLandesDaten,
  bfKakaoSetPreise,
  dealWahlen,
  kakaoEinzelZeilen,
} from './bf-deal-landespreis.server.js';

const JETZT = Date.parse('2026-11-20T12:00:00Z');
const NACH_ENDE = Date.parse('2026-12-02T12:00:00Z');
const ZWEI_PRO = {handle: '8kendiw34hd', deal: '2x-qione-2-pro', basis: '8kendiw34hd', art: 'alpha-angebot'};
const PRO_KETTE = {handle: 'pjdz538hgs0', deal: 'qione-2-pro-necklace', basis: 'pjdz538hgs0', art: 'alpha-angebot'};

const geld = (amount, currencyCode) => ({amount: String(amount), currencyCode});

/** Antwort wie gemessen 13.11.2026, CH, 2x QiOne 2 Pro + BF26-PRO-13GLX. */
function chAntwort({applicable = true, menge = 2} = {}) {
  return {
    cartCreate: {
      cart: {
        totalQuantity: menge,
        discountCodes: [{code: 'BF26-PRO-13GLX', applicable}],
        lines: {
          nodes: [
            {
              quantity: menge,
              cost: {
                totalAmount: geld('2079.08', 'CHF'),
                amountPerQuantity: geld('1133.0', 'CHF'),
                compareAtAmountPerQuantity: geld('1290.0', 'CHF'),
              },
            },
          ],
        },
      },
      userErrors: [],
    },
  };
}

/** Einzelpackungen des Landes (gemessen 13.11.2026 CH: Awake 78, Create 77 CHF). */
const EINZEL_CH = {
  nodes: [
    {id: 'gid://shopify/ProductVariant/54540698485004', price: geld('78.0', 'CHF')},
    {id: 'gid://shopify/ProductVariant/44685294567692', price: geld('77.0', 'CHF')},
  ],
};

/** Antwort wie gemessen 13.11.2026, CH, Kakao-Set-Variante + BF26-KAKAO-NKSKX (80,54 CHF). */
function kakaoChAntwort() {
  return {
    cartCreate: {
      cart: {
        totalQuantity: 1,
        discountCodes: [{code: 'BF26-KAKAO-NKSKX', applicable: true}],
        lines: {
          nodes: [
            {
              quantity: 1,
              cost: {
                totalAmount: geld('80.54', 'CHF'),
                amountPerQuantity: geld('124.0', 'CHF'),
                compareAtAmountPerQuantity: null,
              },
            },
          ],
        },
      },
      userErrors: [],
    },
  };
}

function mockStorefront(antworten, einzel = EINZEL_CH) {
  const aufrufe = [];
  const queries = [];
  return {
    aufrufe,
    queries,
    CacheShort: () => 'kurz',
    query: async (q, opts) => {
      queries.push({q, variables: opts.variables});
      if (einzel instanceof Error) throw einzel;
      return einzel;
    },
    mutate: async (q, opts) => {
      aufrufe.push({q, variables: opts.variables});
      const a = antworten.shift();
      if (a instanceof Error) throw a;
      return a;
    },
  };
}

test('DE: kein Warenkorb, null (Euro-Preise aus bf-deals-daten bleiben)', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort()]);
  assert.equal(await bfDealLandesPreis(sf, ZWEI_PRO, 'DE', {jetzt: JETZT}), null);
  assert.equal(sf.aufrufe.length, 0);
});

test('CH: Betrag der Cart-API mit Kaufknopf-Zeilen, Merkmal _bf_deal und BF-Code', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort()]);
  const lp = await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 2079.08, uvp: 2580, waehrung: 'CHF'});
  assert.equal(sf.aufrufe.length, 1);
  const v = sf.aufrufe[0].variables;
  assert.equal(v.land, 'CH');
  assert.deepEqual(v.codes, ['BF26-PRO-13GLX']);
  assert.deepEqual(v.lines, [
    {
      merchandiseId: 'gid://shopify/ProductVariant/39680087326790',
      quantity: 2,
      attributes: [{key: '_bf_deal', value: '2x-qione-2-pro'}],
    },
  ]);
  assert.match(sf.aufrufe[0].q, /_messung/);
});

test('Ablage: zweiter Abruf im selben Land ohne neuen Warenkorb', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort()]);
  await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT});
  const zwei = await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT + 60_000});
  assert.equal(zwei.preis, 2079.08);
  assert.equal(sf.aufrufe.length, 1);
});

test('fail-closed: Code nicht anwendbar -> null (Euro wie bisher)', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort({applicable: false})]);
  assert.equal(await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT}), null);
});

test('fail-closed: Zeile fehlt (Menge 1 statt 2) -> null', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort({menge: 1})]);
  assert.equal(await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT}), null);
});

test('fail-closed: Frist -> null, kein Wurf', async () => {
  _ablageLeeren();
  const sf = {mutate: () => new Promise(() => {})};
  assert.equal(await bfDealLandesPreis(sf, ZWEI_PRO, 'PL', {jetzt: JETZT, fristMs: 20}), null);
});

test('nach Aktionsende: keine Codes, Warenkorb ohne Code gilt nicht als Deal', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort({applicable: false})]);
  // bfDealCodes ist nach dem Ende leer; der Aufrufer ruft dann gar nicht (bfDealSeite null).
  const lp = await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: NACH_ENDE});
  assert.equal(sf.aufrufe[0]?.variables.codes.length ?? 0, 0);
  assert.notEqual(lp, undefined);
});

test('Pro + Necklace: ausverkaufte erste Länge -> nächste Länge', async () => {
  _ablageLeeren();
  const fehl = {cartCreate: {cart: null, userErrors: [{message: 'not available'}]}};
  const ok = {
    cartCreate: {
      cart: {
        totalQuantity: 2,
        discountCodes: [{code: 'BF26-PRO-13GLX', applicable: true}],
        lines: {
          nodes: [
            {quantity: 1, cost: {totalAmount: geld('86.0', 'CHF'), amountPerQuantity: geld('86.0', 'CHF'), compareAtAmountPerQuantity: null}},
            {quantity: 1, cost: {totalAmount: geld('1039.54', 'CHF'), amountPerQuantity: geld('1133.0', 'CHF'), compareAtAmountPerQuantity: geld('1290.0', 'CHF')}},
          ],
        },
      },
      userErrors: [],
    },
  };
  const sf = mockStorefront([fehl, ok]);
  const lp = await bfDealLandesPreis(sf, PRO_KETTE, 'CH', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 1125.54, uvp: 1376, waehrung: 'CHF'});
  assert.equal(sf.aufrufe.length, 2);
  assert.notDeepEqual(sf.aufrufe[0].variables.lines, sf.aufrufe[1].variables.lines);
  assert.equal(dealWahlen(PRO_KETTE).length, 5);
});

test('Preise setzen: jede EUR-Variante bekommt Landespreis und -Streichpreis', () => {
  const p = {
    selectedOrFirstAvailableVariant: {price: geld('1976', 'EUR'), compareAtPrice: geld('2476', 'EUR')},
    variants: {nodes: [{price: geld('1976', 'EUR')}]},
  };
  const n = bfDealLandesPreiseSetzen(p, {preis: 2079.08, uvp: 2580, waehrung: 'CHF'});
  assert.deepEqual(n.selectedOrFirstAvailableVariant.price, geld('2079.08', 'CHF'));
  assert.deepEqual(n.selectedOrFirstAvailableVariant.compareAtPrice, geld('2580', 'CHF'));
  assert.deepEqual(n.variants.nodes[0].price, geld('2079.08', 'CHF'));
  assert.equal(bfDealLandesPreiseSetzen(p, null), p);
});

test('Galerie: mehrere Deals parallel, DE leer', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort(), chAntwort({menge: 1})]);
  const lp = await bfDealLandesPreise(sf, ['2x-qione-2-pro', 'qihome-air'], 'CH', {jetzt: JETZT});
  assert.deepEqual(Object.keys(lp), ['2x-qione-2-pro', 'qihome-air']);
  assert.equal(sf.aufrufe.length, 2);
  assert.deepEqual(sf.aufrufe[1].variables.codes, ['BF26-QIHOME-2DP8H']);
  assert.deepEqual(await bfDealLandesPreise(sf, ['2x-qione-2-pro'], 'DE', {jetzt: JETZT}), {});
});

test('Kakao CH: Set-Zeile mit _bf_deal + Kakao-Code, Streichpreis = Einzelpackungen (78 + 77)', async () => {
  _ablageLeeren();
  const sf = mockStorefront([kakaoChAntwort()]);
  const lp = await bfDealLandesPreis(sf, {deal: 'kakao', set: 'create-awake'}, 'CH', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 80.54, uvp: 155, waehrung: 'CHF'});
  assert.deepEqual(sf.aufrufe[0].variables.codes, ['BF26-KAKAO-NKSKX']);
  assert.deepEqual(sf.aufrufe[0].variables.lines, [
    {
      merchandiseId: 'gid://shopify/ProductVariant/65979750809868',
      quantity: 1,
      attributes: [{key: '_bf_deal', value: 'kakao'}],
    },
  ]);
  assert.equal(sf.aufrufe[0].variables.land, 'CH');
  assert.equal(sf.queries[0].variables.land, 'CH');
  assert.deepEqual(sf.queries[0].variables.ids, [
    'gid://shopify/ProductVariant/54540698485004',
    'gid://shopify/ProductVariant/44685294567692',
  ]);
});

test('Kakao: 2x Awake = zwei gleiche Einzelpackungen (Menge 2), je Set eigene Ablage', async () => {
  assert.deepEqual(kakaoEinzelZeilen('2x-awake'), [
    {id: 'gid://shopify/ProductVariant/54540698485004', menge: 2},
  ]);
  _ablageLeeren();
  const sf = mockStorefront([kakaoChAntwort(), kakaoChAntwort(), kakaoChAntwort()]);
  const je = await bfKakaoSetPreise(sf, 'CH', {jetzt: JETZT});
  assert.deepEqual(Object.keys(je), ['create-awake', '2x-awake', '2x-create']);
  assert.equal(je['2x-awake'].uvp, 156);
  assert.equal(je['2x-create'].uvp, 154);
  assert.equal(sf.aufrufe.length, 3);
  await bfKakaoSetPreise(sf, 'CH', {jetzt: JETZT + 1000});
  assert.equal(sf.aufrufe.length, 3);
});

test('Kakao DE: kein Abruf, null', async () => {
  _ablageLeeren();
  const sf = mockStorefront([]);
  assert.deepEqual(await bfKakaoSetPreise(sf, 'DE', {jetzt: JETZT}), {});
  assert.equal(await bfKakaoLandesDaten(sf, {deal: 'kakao', set: 'create-awake'}, 'DE'), null);
  assert.equal(sf.aufrufe.length + sf.queries.length, 0);
});

test('Kakao fail-closed: Einzelpreis in anderer Währung oder Abfrage wirft -> null (Euro wie bisher)', async () => {
  _ablageLeeren();
  const falsch = {nodes: [{id: 'gid://shopify/ProductVariant/54540698485004', price: geld('78', 'EUR')}]};
  const sf = mockStorefront([kakaoChAntwort(), kakaoChAntwort(), kakaoChAntwort()], falsch);
  assert.equal(await bfDealLandesPreis(sf, {deal: 'kakao', set: 'create-awake'}, 'CH', {jetzt: JETZT}), null);
  _ablageLeeren();
  const sf2 = mockStorefront([kakaoChAntwort(), kakaoChAntwort(), kakaoChAntwort()], new Error('netz'));
  assert.equal(await bfDealLandesPreis(sf2, {deal: 'kakao', set: '2x-awake'}, 'CH', {jetzt: JETZT}), null);
});

test('Kakao-Landesdaten: Seite bekommt Set-Preise, Preis des gewählten Sets und Galerie', async () => {
  _ablageLeeren();
  const antworten = [kakaoChAntwort(), kakaoChAntwort(), kakaoChAntwort(), chAntwort(), chAntwort({menge: 1}), chAntwort({menge: 1}), chAntwort({menge: 1})];
  const sf = mockStorefront(antworten);
  const d = await bfKakaoLandesDaten(sf, {deal: 'kakao', set: '2x-create'}, 'CH', {jetzt: JETZT});
  assert.deepEqual(Object.keys(d.kakaoSetPreise), ['create-awake', '2x-awake', '2x-create']);
  assert.equal(d.landesPreis.uvp, 154);
  assert.equal(Object.keys(d.landesPreise).includes('kakao'), false);
});
