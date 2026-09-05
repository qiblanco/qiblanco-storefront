// Hermetische Tests der ad-scharfen Rabattcode-Ausspielung
// (Grossjob 20260905-ads-rabattcode-sonde-je-ad-kausalinstrument s03).
// Bordmittel node:test/node:assert wie ad-weiche.test.mjs, KEIN Netz.
// Ausfuehren: node --test test/adcode-ausspielung.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  LP_A_PFAD,
  adIdAusQuery,
  rabattZiel,
  holeAdCodes,
  pruefeAdWeiche,
} from '../app/lib/ad-weiche.server.js';
import {
  adIdAusTrackingParams,
  buildAttributionCartAttributes,
} from '../app/lib/checkout-tracking.js';

const BASIS = 'https://qiblanco.com';
const AD = '120250590409220704';
const CODE = 'QB57667';
const KARTE = {aktiv: true, codes: {[AD]: CODE}};
const META_QUERY =
  `utm_source=facebook&utm_medium=paid&utm_campaign=120250590399490704&utm_content=${AD}&fbclid=IwAR0abc`;

function sp(query) {
  return new URL(`${BASIS}/?${query}`).searchParams;
}

function fetchStub({zuteilung = {}, adCodes = KARTE, adCodesStatus = 200} = {}) {
  const rufe = [];
  const impl = async (url) => {
    rufe.push(String(url));
    if (String(url).includes('ad-codes.json')) {
      return {ok: adCodesStatus === 200, status: adCodesStatus, json: async () => adCodes};
    }
    return {ok: true, status: 200, json: async () => zuteilung};
  };
  impl.rufe = rufe;
  return impl;
}

// --- A1 Ad-ID-Erkennung ------------------------------------------------------

test('A1: utm_content mit numerischer Ad-ID wird erkannt', () => {
  assert.equal(adIdAusQuery(sp(META_QUERY)), AD);
});

test('A1: h_ad_id trägt, wenn utm_content fehlt (unabhaengiger Traeger)', () => {
  assert.equal(adIdAusQuery(sp('utm_medium=paid&h_ad_id=120243903213670443')), '120243903213670443');
});

test('A1-ROT: Freitext-utm_content ist KEINE Ad-ID', () => {
  // Live gemessen 14 T: 'Facebook_UA' 11.174, 'linktree' 1.420, 'link_in_bio'.
  for (const wert of ['Facebook_UA', 'linktree', 'link_in_bio', '12345', 'ad_120250590409220704']) {
    assert.equal(adIdAusQuery(sp(`utm_medium=paid&utm_content=${wert}`)), null, wert);
  }
});

test('A1: ohne jeden Traeger -> null', () => {
  assert.equal(adIdAusQuery(sp('utm_medium=paid')), null);
});

// --- A2 Zielbau --------------------------------------------------------------

test('A2: Ziel trägt redirect ZUERST und den Original-Query vollstaendig', () => {
  const weichenZiel = `${LP_A_PFAD}?${META_QUERY}&lp_m=w`;
  const ziel = rabattZiel(weichenZiel, AD, KARTE);
  assert.equal(ziel, `/discount/${CODE}?redirect=${LP_A_PFAD}&${META_QUERY}&lp_m=w`);
  // redirect MUSS das erste Vorkommen sein: die Zielroute liest per
  // URLSearchParams.get, und das liefert das erste.
  assert.equal(new URLSearchParams(ziel.split('?')[1]).get('redirect'), LP_A_PFAD);
});

test('A2-ROT: Schalter aus / fehlend -> kein Rabattziel', () => {
  const z = `${LP_A_PFAD}?${META_QUERY}&lp_m=w`;
  assert.equal(rabattZiel(z, AD, {codes: {[AD]: CODE}}), null); // aktiv fehlt
  assert.equal(rabattZiel(z, AD, {aktiv: 'true', codes: {[AD]: CODE}}), null); // String statt true
  assert.equal(rabattZiel(z, AD, {aktiv: false, codes: {[AD]: CODE}}), null);
  assert.equal(rabattZiel(z, AD, null), null);
});

test('A2-ROT: unbekannte Ad-ID bekommt keinen fremden Code', () => {
  assert.equal(rabattZiel(`${LP_A_PFAD}?${META_QUERY}`, '999999999999999999', KARTE), null);
});

test('A2-ROT: unsauberer Code wird nie in eine URL geschrieben', () => {
  for (const boese of ['QB 5', 'QB/5', '../x', '', 'a'.repeat(40)]) {
    assert.equal(rabattZiel(`${LP_A_PFAD}?a=1`, AD, {aktiv: true, codes: {[AD]: boese}}), null, boese);
  }
});

test('A2-ROT: Original-Query mit redirect/return_to -> lieber kein Rabatt als Parameter-Verlust', () => {
  // Die Zielroute loescht BEIDE Schluessel aus dem Query, den sie weiterreicht.
  assert.equal(rabattZiel(`${LP_A_PFAD}?utm_medium=paid&redirect=/x`, AD, KARTE), null);
  assert.equal(rabattZiel(`${LP_A_PFAD}?utm_medium=paid&return_to=/x`, AD, KARTE), null);
});

test('A2-ROT: Pfad mit // würde von der Phishing-Bremse der Route verworfen', () => {
  assert.equal(rabattZiel('//fremd.example/x?a=1', AD, KARTE), null);
});

// --- A3 Kartenbeschaffung ist fail-SAFE (nicht fail-soft) --------------------

test('A3-ROT: HTTP-Fehler, kaputtes JSON und Ausnahme -> null (kein Rabatt)', async () => {
  assert.equal(await holeAdCodes(fetchStub({adCodesStatus: 500})), null);
  assert.equal(
    await holeAdCodes(async () => ({ok: true, json: async () => { throw new Error('kaputt'); }})),
    null,
  );
  assert.equal(await holeAdCodes(async () => { throw new Error('netz'); }), null);
  assert.equal(await holeAdCodes(async () => ({ok: true, json: async () => 'kein objekt'})), null);
});

// --- A4 Verdrahtung in der Weiche -------------------------------------------

test('A4: Meta-Paid-Klick mit bekannter Ad-ID landet auf dem Code-Ziel', async () => {
  const f = fetchStub();
  const ziel = await pruefeAdWeiche(new Request(`${BASIS}/?${META_QUERY}`), f);
  assert.equal(ziel, `/discount/${CODE}?redirect=${LP_A_PFAD}&${META_QUERY}&lp_m=w`);
});

test('A4-ROT: ohne Karte bleibt es exakt beim bisherigen Weichen-Ziel', async () => {
  const ziel = await pruefeAdWeiche(
    new Request(`${BASIS}/?${META_QUERY}`),
    fetchStub({adCodesStatus: 404}),
  );
  assert.equal(ziel, `${LP_A_PFAD}?${META_QUERY}&lp_m=w`);
});

test('A4-ROT: organischer Traffic fragt die Karte GAR NICHT an', async () => {
  const f = fetchStub();
  assert.equal(await pruefeAdWeiche(new Request(`${BASIS}/?utm_source=newsletter`), f), null);
  assert.equal(f.rufe.filter((u) => u.includes('ad-codes.json')).length, 0);
});

test('A4-ROT: Paid ohne Ad-ID im Query fragt die Karte GAR NICHT an', async () => {
  const f = fetchStub();
  const ziel = await pruefeAdWeiche(new Request(`${BASIS}/?gclid=Cj0KCQ`), f);
  assert.equal(ziel, `${LP_A_PFAD}?gclid=Cj0KCQ&lp_m=w`);
  assert.equal(f.rufe.filter((u) => u.includes('ad-codes.json')).length, 0);
});

test('A4-ROT: ad_weiche=aus schaltet auch den Rabattweg ab', async () => {
  const f = fetchStub({zuteilung: {ad_weiche: 'aus'}});
  assert.equal(await pruefeAdWeiche(new Request(`${BASIS}/?${META_QUERY}`), f), null);
  assert.equal(f.rufe.filter((u) => u.includes('ad-codes.json')).length, 0);
});

// --- A5 DIE NAHT: was die ECHTE Zielroute aus meinem Ziel macht --------------
// Gemessen wird der QUELLTEXT der Route, nicht ein Nachbau: waechst dort eine
// Regel dazu, faellt dieser Test — genau das ist der Zweck.

const ROUTE_SRC = readFileSync(new URL('../app/routes/discount.$code.jsx', import.meta.url), 'utf8');

function routenWeiterleitung(zielUrlString) {
  // Der Loader-Rumpf der echten Route, ausgefuehrt mit gestubbtem redirect/cart.
  const rumpf = ROUTE_SRC
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export async function loader/, 'async function loader');
  const bauen = new Function(
    'redirect',
    `${rumpf}; return loader;`,
  );
  const loader = bauen((url, init) => ({url, init}));
  const request = new Request(`${BASIS}${zielUrlString}`);
  const code = decodeURIComponent(zielUrlString.split('/discount/')[1].split('?')[0]);
  return loader({
    request,
    params: {code},
    context: {
      cart: {
        updateDiscountCodes: async () => ({cart: {id: 'gid://shopify/Cart/X'}}),
        setCartId: () => new Headers(),
      },
    },
  });
}

test('A5-NAHT: der Original-Query kommt vollstaendig auf LP A an, redirect faellt weg', async () => {
  const ziel = rabattZiel(`${LP_A_PFAD}?${META_QUERY}&lp_m=w`, AD, KARTE);
  const {url, init} = await routenWeiterleitung(ziel);
  assert.equal(init.status, 303);
  const [pfad, query] = url.split('?');
  assert.equal(pfad, LP_A_PFAD, 'Landeflaeche unveraendert');
  const an = new URLSearchParams(query);
  assert.equal(an.get('redirect'), null, 'redirect wird von der Route verbraucht');
  const soll = new URLSearchParams(`${META_QUERY}&lp_m=w`);
  for (const [k, v] of soll) {
    assert.equal(an.get(k), v, `Schluessel ${k} muss die Grenze ueberleben`);
  }
  assert.equal([...an.keys()].length, [...soll.keys()].length, 'kein Schluessel zu viel');
});

test('A5-NAHT-ROT: ohne den redirect-Parameter landet der Klick auf /, nicht auf LP A', async () => {
  // Das ist der Fehlbau, gegen den A5 sichert: er sieht mit 303 identisch aus.
  const {url} = await routenWeiterleitung(`/discount/${CODE}?${META_QUERY}`);
  assert.equal(url.split('?')[0], '/', 'ohne redirect verliert der Klick die Landeflaeche');
});

// --- A6 Der preisneutrale Zwilling qb_ad_id ---------------------------------

test('A6: qb_ad_id entsteht aus utm_content und aus h_ad_id', () => {
  assert.equal(adIdAusTrackingParams(new URLSearchParams(`utm_content=${AD}`)), AD);
  assert.equal(adIdAusTrackingParams(new URLSearchParams('h_ad_id=120243903213670443')), '120243903213670443');
});

test('A6-ROT: Freitext erzeugt KEIN qb_ad_id', () => {
  assert.equal(adIdAusTrackingParams(new URLSearchParams('utm_content=Facebook_UA')), null);
  const attrs = buildAttributionCartAttributes({searchParams: 'utm_source=instagram&utm_content=linktree'});
  assert.equal(attrs.find((a) => a.key === 'qb_ad_id'), undefined);
});

test('A6: qb_ad_id steht als Cart-Attribut neben dem Rohwert', () => {
  const attrs = buildAttributionCartAttributes({searchParams: META_QUERY});
  assert.equal(attrs.find((a) => a.key === 'qb_ad_id')?.value, AD);
  assert.equal(attrs.find((a) => a.key === 'utm_content')?.value, AD);
});

test('A6-ROT: qb_ad_id öffnet den hasTrackingSignal-Zweig nicht kuenstlich', () => {
  // Ein Besucher ohne jedes Ad-Signal bekommt weiterhin nur den Marker.
  const attrs = buildAttributionCartAttributes({searchParams: ''});
  assert.deepEqual(attrs.map((a) => a.key), ['attribution_source']);
});
