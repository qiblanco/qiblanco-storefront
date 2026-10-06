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
  assert.equal(label(EUR, 'DE', null, '3'), '3x 420g | 30% Rabatt | 53,- € pro Packung');
  assert.equal(label(EUR, 'DE', null, '1'), '1x 420g | 76,- € pro Packung');
});

test('AT 3x: Zeilenbetrag statt Packungspreis mal Menge (Punkt 8)', () => {
  const p3 = cp.cacaoPricing('3', EUR, AWAKE, 'AT');
  assert.equal(p3.gesamtNum, 163.46);
  assert.equal(p3.teilbar, false);
  assert.equal(label(EUR, 'AT', null, '3'), '3x 420g | 30% Rabatt | 163,46 € für 3 Packungen');
  // 2x geht auf: 125,42 = 2 x 62,71, dort bleibt der Packungspreis.
  assert.equal(label(EUR, 'AT', null, '2'), '2x 420g | 20% Rabatt | 62,71 € pro Packung');
  assert.equal(label(EUR, 'AT', null, '1'), '1x 420g | 78,13 € pro Packung');
});

test('CH: Zeilenbetrag aus dem Warenkorb mal 8,1 Prozent (Punkt 2)', () => {
  const p2 = cp.cacaoPricing('2', CHF, AWAKE, 'CH', KASSE_CH);
  assert.equal(p2.gesamtNum, 124.68);
  assert.equal(p2.rabattImWarenkorb, false);
  assert.equal(p2.rabattProzent, 19);
  assert.equal(label(CHF, 'CH', KASSE_CH, '2'), '2x 420g | 19% Rabatt | 62,34 CHF pro Packung');
  const p3 = cp.cacaoPricing('3', CHF, AWAKE, 'CH', KASSE_CH);
  assert.equal(p3.gesamtNum, 163.96);
  assert.equal(label(CHF, 'CH', KASSE_CH, '3'), '3x 420g | 29% Rabatt | 163,96 CHF für 3 Packungen');
  // Streichpreis daneben: Listenpreis mit Satz.
  assert.equal(p3.compareAtGesamt, '230,25 CHF');
  assert.equal(label(CHF, 'CH', KASSE_CH, '1'), '1x 420g | 76,75 CHF pro Packung');
});

test('US: Zeilenbetrag ohne Steuer, Rabatt aus den echten Beträgen', () => {
  assert.equal(label(USD, 'US', KASSE_US, '2'), '2x 420g | 16% Rabatt | $165.91 für 2 Packungen');
  assert.equal(label(USD, 'US', KASSE_US, '3'), '3x 420g | 25% Rabatt | $74.40 pro Packung');
  assert.equal(cp.cacaoPricing('3', USD, AWAKE, 'US', KASSE_US).gesamtNum, 223.2);
});

test('Ohne Warenkorb-Betrag (oder fremde Währung): Stand davor, Listenpreis + Hinweis', () => {
  const alt = '2x 420g | 76,75 CHF pro Packung | Mengenrabatt im Warenkorb';
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
