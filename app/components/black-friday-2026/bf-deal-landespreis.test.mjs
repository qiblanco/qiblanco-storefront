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
  const zwei = await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT + 5_000});
  assert.equal(zwei.preis, 2079.08);
  assert.equal(sf.aufrufe.length, 1);
});

test('Ablage: nach 10 s neuer Warenkorb (Kurs wandert, Kasse rechnet aktuell)', async () => {
  _ablageLeeren();
  const sf = mockStorefront([chAntwort(), chAntwort()]);
  await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT});
  await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT + 11_000});
  assert.equal(sf.aufrufe.length, 2);
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

// ---------------------------------------------------------------------------
// BF-STAND DES STREICHPREISES AUSSERHALB DE (Job 20261113-folge-bf-dealseite-
// auslandsansicht-streichpreis-halten-qione2pro-prio1; Elina EL-20261113-a7edaf0e
// „Erst mal so belassen“, Christian CW-20261113-bb47c38d „Kein Einfluss auf BF“).
// Seit der QiOne-2-Pro-Neubepreisung (13.11., Streichpreis 1.349 €) lieferte
// der Warenkorb in AT 2 x 1.349 = 2.698 € als Streichpreis (Du sparst 722 €).

/** Warenkorb-Antwort mit einer Zeile je [gesamt, Stück, Streich|null, Menge]. */
function korb(waehrung, zeilen, code = 'BF26-2XPRO-HDRSN') {
  return {
    cartCreate: {
      cart: {
        totalQuantity: zeilen.reduce((s, z) => s + z[3], 0),
        discountCodes: [{code, applicable: true}],
        lines: {
          nodes: zeilen.map(([g, e, v, m]) => ({
            quantity: m,
            cost: {
              totalAmount: geld(g, waehrung),
              amountPerQuantity: geld(e, waehrung),
              compareAtAmountPerQuantity: v === null ? null : geld(v, waehrung),
            },
          })),
        },
      },
      userErrors: [],
    },
  };
}
const QIBRACELET = {deal: 'qibracelet'};
const QIHOME = {deal: 'qihome-air'};

test('BF-Stand AT: 2x QiOne nach Neubepreisung -> Streichpreis 2.476 € (nicht 2 x 1.349), Endpreis 1.976 €', async () => {
  _ablageLeeren();
  const sf = mockStorefront([korb('EUR', [['1976.0', '1214.0', '1349.0', 2]])]);
  const lp = await bfDealLandesPreis(sf, ZWEI_PRO, 'AT', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 1976, uvp: 2476, waehrung: 'EUR'});
});

test('BF-Stand FR: Pro + Necklace nach Neubepreisung -> Streichpreis 1.332 € (nicht 1.443), Endpreis 1.082 €', async () => {
  _ablageLeeren();
  const sf = mockStorefront([
    korb('EUR', [['94.0', '94.0', null, 1], ['988.0', '1214.0', '1349.0', 1]], 'BF26-PROKETTE-PMB52'),
  ]);
  const lp = await bfDealLandesPreis(sf, PRO_KETTE, 'FR', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 1082, uvp: 1332, waehrung: 'EUR'});
});

test('BF-Stand Euro-Land: QiBracelet und QiHome bleiben, wie sie sind (Streichpreis = BF-Liste)', async () => {
  _ablageLeeren();
  const sf = mockStorefront([
    korb('EUR', [['1378.0', '1578.0', null, 1]], 'BF26-QIBRACELET-X'),
    korb('EUR', [['4583.0', '4983.0', null, 1]], 'BF26-QIHOME-X'),
  ]);
  assert.deepEqual(await bfDealLandesPreis(sf, QIBRACELET, 'AT', {jetzt: JETZT}), {preis: 1378, uvp: 1578, waehrung: 'EUR'});
  assert.deepEqual(await bfDealLandesPreis(sf, QIHOME, 'AT', {jetzt: JETZT}), {preis: 4583, uvp: 4983, waehrung: 'EUR'});
});

test('BF-Stand Fremdwährung PL: Streichpreis = BF-Verhältnis zum Landes-Endpreis, ganze Einheit (Du sparst 20 %)', async () => {
  _ablageLeeren();
  // gemessen 13.11. 14:30Z: 2x QiOne PL Endpreis 12.130 - 3.246,08 = 8.883,92 PLN, Streich 12.130 (= 2 x 6.065)
  const sf = mockStorefront([korb('PLN', [['8883.92', '6065.0', '6065.0', 2]])]);
  const lp = await bfDealLandesPreis(sf, ZWEI_PRO, 'PL', {jetzt: JETZT});
  assert.equal(lp.preis, 8883.92);
  assert.equal(lp.uvp, Math.round((8883.92 * 2476) / 1976)); // 11.132
  assert.equal(lp.uvp, 11132);
  assert.equal(Math.round(((lp.uvp - lp.preis) / lp.uvp) * 100), 20);
});

test('BF-Stand Fremdwährung: für nicht neu bepreiste Deals gleich dem Shopify-Streichpreis (gemessen 13.11.)', async () => {
  // Die Regel ohne Basis-Streichpreis trifft dort, wo sich nichts geändert hat,
  // den Shopify-Wert auf die ganze Einheit: QiBracelet PL 7.095, SE 17.882,
  // QiHome PL 22.403, CZ 124.120 (Endpreis = Streich - „Du sparst“ der Live-Seite).
  const faelle = [
    [QIBRACELET, 'PLN', '6195.85', 7095],
    [QIBRACELET, 'SEK', '15615.68', 17882],
    [QIHOME, 'PLN', '20604.70', 22403],
    [QIHOME, 'CZK', '114156.56', 124120],
  ];
  for (const [seite, w, endpreis, shopifyStreich] of faelle) {
    _ablageLeeren();
    const sf = mockStorefront([korb(w, [[endpreis, String(shopifyStreich), null, 1]], 'BF26-X')]);
    const lp = await bfDealLandesPreis(sf, seite, 'PL', {jetzt: JETZT});
    assert.equal(lp.uvp, shopifyStreich, `${seite.deal} ${w}`);
  }
});

test('BF-Stand: Schweiz bleibt, wie sie rechnet (Elina: CH so lassen) -> Shopify-Streichpreis', async () => {
  _ablageLeeren();
  // gemessen 14:12Z: 8kendiw34hd ?markt=CH „2.812 CHF 2.103 CHF Du sparst 709 CHF“
  const sf = mockStorefront([korb('CHF', [['2102.98', '1265.0', '1406.0', 2]])]);
  const lp = await bfDealLandesPreis(sf, ZWEI_PRO, 'CH', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 2102.98, uvp: 2812, waehrung: 'CHF'});
});

test('BF-Stand: Kakao behält den Streichpreis aus den Einzelpackungen (keine BF-Verhältnis-Regel)', async () => {
  _ablageLeeren();
  // PL, Einzelpackungen bewusst 300 + 300 PLN: die Verhältnis-Regel ergäbe 342,10 x 152/76 = 684.
  const einzelPl = {
    nodes: [
      {id: 'gid://shopify/ProductVariant/54540698485004', price: geld('300.0', 'PLN')},
      {id: 'gid://shopify/ProductVariant/44685294567692', price: geld('300.0', 'PLN')},
    ],
  };
  const sf = mockStorefront([korb('PLN', [['342.10', '684.0', null, 1]], 'BF26-KAKAO-NKSKX')], einzelPl);
  const lp = await bfDealLandesPreis(sf, {deal: 'kakao', set: 'create-awake'}, 'PL', {jetzt: JETZT});
  assert.deepEqual(lp, {preis: 342.1, uvp: 600, waehrung: 'PLN'});
});
