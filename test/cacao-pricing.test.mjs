/**
 * Hermetischer Test: KAKAO-STAFFEL NENNT DEN BETRAG DER KASSE, AUCH IN
 * FREMDWÄHRUNG (node --test test/cacao-pricing.test.mjs).
 *
 * ANLASS (Job 20261006-preisanzeige-rest-laender-achse-staffel-fremdwaehrung,
 * Punkte 2 und 8). Gemessen am 2026-10-06 per Storefront-Warenkorb je Land:
 *
 *     CH  2x  Seite 2 x 76,75 = 153,50 CHF   Kasse 115,34 x 1,081 = 124,68 CHF
 *     CH  3x  Seite 3 x 76,75 = 230,25 CHF   Kasse 151,67 x 1,081 = 163,96 CHF
 *     US  2x  Seite 2 x 99    = 198 USD      Kasse 165,91 USD
 *     AT  3x  Seite 3 x 54,49 = 163,47 EUR   Kasse 148,60 x 1,10  = 163,46 EUR
 *
 * Der Mengenrabatt ist ein EUR-Festbetrag, den Shopify per Kurs umrechnet; die
 * Seite liest den Zeilenbetrag deshalb aus einem Warenkorb des Landes
 * (ladeStaffelKasse). AT 3x ist kein Kursproblem, sondern Teilbarkeit:
 * 163,46 / 3 ist kein Centbetrag.
 *
 * Die Datei wird dynamisch geladen: gegen einen Stand ohne
 * app/lib/cacao-pricing.js fällt jeder Test einzeln rot (Rot vor Grün).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setzePreismodus} from '../app/lib/preismodus.js';
// Die Fixturen dieser Datei sind NETTO-Basispreise (Shop-Zustand bis zum Kipp
// 2026-10-09). Seit dem Kipp ist PREISMODUS_VORGABE 'brutto'; der Netto-Pfad
// bleibt als Rueckbau-Weg im Code und wird hier gepinnt. Brutto: preismodus.test.mjs.
setzePreismodus('netto');

const cp = await import('../app/lib/cacao-pricing.js').catch(() => ({}));

const variante = (amount, currencyCode) => ({price: {amount, currencyCode}});
const AWAKE = 'crystal-cacao-awake';
const EUR = variante('71.03', 'EUR');
const CHF = variante('71.0', 'CHF');
const USD = variante('99.0', 'USD');
const KASSE_CH = {waehrung: 'CHF', land: 'CH', zeilen: {'2': 115.34, '3': 151.67}};
const KASSE_US = {waehrung: 'USD', land: 'US', zeilen: {'2': 165.91, '3': 223.2}};

const label = (v, land, kasse, menge) =>
  cp.cacaoSizeOptions(v, AWAKE, land, kasse).find((o) => o.value === menge)?.label;

test('DE unverändert: 76 / 61 / 53 pro Packung, Kaufknopf 76 / 122 / 159', () => {
  assert.equal(typeof cp.cacaoPricing, 'function', 'cacao-pricing.js fehlt');
  const p = ['1', '2', '3'].map((m) => cp.cacaoPricing(m, EUR, AWAKE, 'DE'));
  assert.deepEqual(p.map((x) => x.priceNum), [76, 61, 53]);
  assert.deepEqual(p.map((x) => x.gesamtNum), [76, 122, 159]);
  assert.ok(p.every((x) => x.teilbar));
  assert.equal(label(EUR, 'DE', null, '3'), '3x 420g | 30% Rabatt | 53 € pro Packung');
  assert.equal(label(EUR, 'DE', null, '1'), '1x 420g | 76 € pro Packung');
});

test('AT 3x: Zeilenbetrag statt Packungspreis mal Menge (Punkt 8)', () => {
  const p3 = cp.cacaoPricing('3', EUR, AWAKE, 'AT');
  assert.equal(p3.gesamtNum, 163.46);
  assert.equal(p3.teilbar, false);
  assert.equal(label(EUR, 'AT', null, '3'), '3x 420g | 30% Rabatt | 163,46 € für 3 Packungen');
  // 2x geht auf den Cent auf (125,42 = 2 x 62,71), aber 62,71 hat Nachkommastellen:
  // seit s04 (Christian 06.10. "keine Nachkommastellen") steht dann der Zeilenbetrag.
  assert.equal(cp.cacaoPricing('2', EUR, AWAKE, 'AT').teilbar, false);
  assert.equal(label(EUR, 'AT', null, '2'), '2x 420g | 20% Rabatt | 125,42 € für 2 Packungen');
  assert.equal(label(EUR, 'AT', null, '1'), '1x 420g | 78,13 € pro Packung');
});

test('CH: Zeilenbetrag aus dem Warenkorb mal 8,1 Prozent (Punkt 2)', () => {
  const p2 = cp.cacaoPricing('2', CHF, AWAKE, 'CH', KASSE_CH);
  assert.equal(p2.gesamtNum, 124.68);
  assert.equal(p2.rabattImWarenkorb, false);
  assert.equal(p2.rabattProzent, 19);
  assert.equal(label(CHF, 'CH', KASSE_CH, '2'), '2x 420g | 19% Rabatt | 124,68 CHF für 2 Packungen');
  const p3 = cp.cacaoPricing('3', CHF, AWAKE, 'CH', KASSE_CH);
  assert.equal(p3.gesamtNum, 163.96);
  assert.equal(label(CHF, 'CH', KASSE_CH, '3'), '3x 420g | 29% Rabatt | 163,96 CHF für 3 Packungen');
  // Streichpreis daneben: Listenpreis mit Satz.
  assert.equal(p3.compareAtGesamt, '230,25 CHF');
  assert.equal(label(CHF, 'CH', KASSE_CH, '1'), '1x 420g | 76,75 CHF pro Packung');
});

test('US: Zeilenbetrag ohne Steuer, Rabatt aus den echten Beträgen', () => {
  assert.equal(label(USD, 'US', KASSE_US, '2'), '2x 420g | 16% Rabatt | $165.91 für 2 Packungen');
  assert.equal(label(USD, 'US', KASSE_US, '3'), '3x 420g | 25% Rabatt | $223.20 für 3 Packungen');
  assert.equal(cp.cacaoPricing('3', USD, AWAKE, 'US', KASSE_US).gesamtNum, 223.2);
});

test('Ohne Warenkorb-Betrag (oder fremde Währung): Stand davor, Listenpreis + Hinweis', () => {
  const alt = '2x 420g | 153,50 CHF für 2 Packungen | Mengenrabatt im Warenkorb';
  assert.equal(label(CHF, 'CH', null, '2'), alt);
  assert.equal(label(CHF, 'CH', {...KASSE_US}, '2'), alt);
  assert.equal(cp.cacaoPricing('2', CHF, AWAKE, 'CH', null).rabattImWarenkorb, true);
  // EUR ignoriert einen Warenkorb-Betrag: dort trifft das Modell die Kasse.
  const eurKasse = {waehrung: 'EUR', zeilen: {'2': 1, '3': 1}};
  assert.equal(cp.cacaoPricing('2', EUR, AWAKE, 'AT', eurKasse).gesamtNum, 125.42);
});

const laden = (antworten, zaehler) => ({
  mutate: async (_q, {variables}) => {
    zaehler.n += 1;
    const menge = variables.lines[0].quantity;
    const a = antworten(menge, variables.land);
    if (a instanceof Error) throw a;
    if (a === 'hängt') return new Promise(() => {});
    return {cartCreate: {userErrors: [], cart: {lines: {nodes: [{quantity: menge, cost: {totalAmount: a}}]}}}};
  },
});

test('ladeStaffelKasse: liest je Menge einen Warenkorb, hält ihn, fällt sauber zurück', async () => {
  assert.equal(typeof cp.ladeStaffelKasse, 'function', 'ladeStaffelKasse fehlt');
  cp._ablageLeeren();
  const z = {n: 0};
  const sf = laden((m) => ({amount: m === 2 ? '115.34' : '151.67', currencyCode: 'CHF'}), z);
  const angabe = {variantId: 'gid://v/1', waehrung: 'CHF', land: 'CH', listenpreis: '71.0'};
  const w = await cp.ladeStaffelKasse(sf, angabe, {jetzt: 1000});
  assert.deepEqual(w, {waehrung: 'CHF', land: 'CH', zeilen: {'2': 115.34, '3': 151.67}});
  assert.equal(z.n, 2);
  // Gehalten: kein zweiter Warenkorb innerhalb der Ablagezeit, danach neu.
  await cp.ladeStaffelKasse(sf, angabe, {jetzt: 1000 + 60_000});
  assert.equal(z.n, 2);
  await cp.ladeStaffelKasse(sf, angabe, {jetzt: 1000 + 16 * 60_000});
  assert.equal(z.n, 4);
  // EUR: keine Abfrage.
  assert.equal(await cp.ladeStaffelKasse(sf, {...angabe, waehrung: 'EUR', land: 'AT'}), null);
  assert.equal(z.n, 4);
});

test('ladeStaffelKasse: Fehler, Frist, fremde Währung, Aufschlag -> null', async () => {
  const angabe = {variantId: 'gid://v/2', waehrung: 'CHF', land: 'CH', listenpreis: '71.0'};
  const z = {n: 0};
  cp._ablageLeeren();
  assert.equal(await cp.ladeStaffelKasse(laden(() => new Error('429'), z), angabe), null);
  cp._ablageLeeren();
  assert.equal(await cp.ladeStaffelKasse(laden(() => 'hängt', z), angabe, {fristMs: 30}), null);
  cp._ablageLeeren();
  assert.equal(
    await cp.ladeStaffelKasse(laden(() => ({amount: '100', currencyCode: 'EUR'}), z), angabe),
    null,
  );
  cp._ablageLeeren();
  // 3 Packungen teurer als dreimal der Listenpreis: kein Rabatt, also kein Wert.
  assert.equal(
    await cp.ladeStaffelKasse(laden((m) => ({amount: String(71 * m + 1), currencyCode: 'CHF'}), z), angabe),
    null,
  );
});

// Der Laden legt 2/3 Packungen als Sorten-Set, wenn es nicht teurer ist
// (kakao-set-zeile.server.js). Gemessen 2026-10-10 CH: Warenkorb Awake x2
// 127,53 CHF, bundle-2x-awake 124 CHF -> die Kasse nimmt 124, die Seite
// nannte 127,53 (Job 20261010-update-kakao-mengen-schweiz-ganze-franken).
test('ladeStaffelKasse: Sorten-Set statt Einzelweg, wenn der Laden es legt', async () => {
  cp._ablageLeeren();
  const z = {n: 0};
  const sets = (antwort) => ({
    ...laden((m) => ({amount: m === 2 ? '127.53' : '168.53', currencyCode: 'CHF'}), z),
    query: async () => antwort,
  });
  const preis = (amount, currencyCode = 'CHF', availableForSale = true) => ({
    selectedOrFirstAvailableVariant: {availableForSale, price: {amount, currencyCode}},
  });
  const angabe = {variantId: 'gid://v/3', waehrung: 'CHF', land: 'CH', listenpreis: '78.0'};
  const awake = {variante: {product: {handle: 'crystal-cacao-awake'}},
    awake2: preis('124.0'), awake3: preis('161.0'), create2: preis('1.0'), create3: preis('1.0')};
  assert.deepEqual((await cp.ladeStaffelKasse(sets(awake), angabe)).zeilen, {'2': 124, '3': 161});
  // Set teurer als der Einzelweg: der Laden lässt die Einzelzeile, die Seite auch
  cp._ablageLeeren();
  assert.deepEqual((await cp.ladeStaffelKasse(sets({...awake, awake2: preis('128.0')}), angabe)).zeilen,
    {'2': 127.53, '3': 161});
  // nicht verfügbar oder fremde Währung: Einzelweg
  cp._ablageLeeren();
  assert.deepEqual((await cp.ladeStaffelKasse(
    sets({...awake, awake2: preis('124.0', 'CHF', false), awake3: preis('161.0', 'EUR')}), angabe)).zeilen,
    {'2': 127.53, '3': 168.53});
  // die Sorte kommt aus der Variante: Create liest create2/create3
  cp._ablageLeeren();
  assert.deepEqual((await cp.ladeStaffelKasse(sets({...awake,
    variante: {product: {handle: 'crystal-cacao-create'}}, create2: preis('124.0'), create3: preis('161.0')}),
  {...angabe, variantId: 'gid://v/4'})).zeilen, {'2': 124, '3': 161});
  // Abfrage scheitert: Stand davor (Warenkorb-Betrag)
  cp._ablageLeeren();
  const kaputt = {...sets(awake), query: async () => { throw new Error('429'); }};
  assert.deepEqual((await cp.ladeStaffelKasse(kaputt, angabe)).zeilen, {'2': 127.53, '3': 168.53});
});

// KEINE NACHKOMMASTELLEN IM PACKUNGSPREIS (Grossjob 20261006-repair-glatte-preise-alle-
// maerkte-keine-nachkommastellen, s04, 2026-10-17). Gemessen am 13.10. im Preismodus brutto:
// US 2x "$79.50 pro Packung" (Kasse 159), GB 2x "61,50 GBP pro Packung" (Kasse 123). Die Summe
// war ganz, der Packungspreis nicht. Regel für jede Währung: der Packungspreis steht nur,
// wenn er ganz ist UND mal Menge den Zeilenbetrag trifft; sonst "<Gesamt> für N Packungen".
// Für 1 Packung bleibt "pro Packung".
test('brutto: Packungspreis nur ganz, sonst Zeilenbetrag (US, GB, CH, PL, DE)', () => {
  setzePreismodus('brutto');
  try {
    const fall = [
      ['US', variante('99.0', 'USD'), {waehrung: 'USD', zeilen: {'2': 159, '3': 210}},
        ['$159 für 2 Packungen', '$70 pro Packung', '$99 pro Packung']],
      ['GB', variante('77.0', 'GBP'), {waehrung: 'GBP', zeilen: {'2': 123, '3': 162}},
        ['123 GBP für 2 Packungen', '54 GBP pro Packung', '77 GBP pro Packung']],
      ['CH', variante('78.0', 'CHF'), {waehrung: 'CHF', zeilen: {'2': 124, '3': 161}},
        ['62 CHF pro Packung', '161 CHF für 3 Packungen', '78 CHF pro Packung']],
      ['PL', variante('340.0', 'PLN'), {waehrung: 'PLN', zeilen: {'2': 544, '3': 709}},
        ['272 PLN pro Packung', '709 PLN für 3 Packungen', '340 PLN pro Packung']],
      ['DE', variante('76.0', 'EUR'), null, ['61 € pro Packung', '53 € pro Packung', '76 € pro Packung']],
    ];
    for (const [land, v, kasse, [z2, z3, z1]] of fall) {
      const betrag = (m) => cp.staffelBetragText(cp.cacaoPricing(m, v, AWAKE, land, kasse));
      assert.equal(betrag('2'), z2, `${land} 2x`);
      assert.equal(betrag('3'), z3, `${land} 3x`);
      assert.equal(betrag('1'), z1, `${land} 1x`);
      // Die Nebenzeile der Kaufbox ("2 x 79.50 pro Packung") liest dasselbe Feld.
      for (const m of ['2', '3']) {
        const p = cp.cacaoPricing(m, v, AWAKE, land, kasse);
        if (p.teilbar) assert.equal(p.priceNum % 1, 0, `${land} ${m}x: teilbar mit Nachkommastellen`);
      }
    }
    // 1 Packung mit Nachkommastellen (Rückbau-Weg netto, Fallback): kein "für 1 Packungen".
    assert.equal(cp.cacaoPricing('1', variante('78.13', 'EUR'), AWAKE, 'AT').teilbar, true);
  } finally {
    setzePreismodus('netto');
  }
});
