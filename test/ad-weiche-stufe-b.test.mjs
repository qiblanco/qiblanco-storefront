// Hermetische Tests des STUFE-B-ARMS der Ad-Traffic-Weiche (Funnel-Manager,
// Grossjob 20261007-GROSSJOB-funnel-manager-customer-journey-ad-lp, s02).
// Bordmittel wie ad-weiche-mm.test.mjs: node:test/node:assert, KEIN Netz.
// Ausführen: node --test test/ad-weiche-stufe-b.test.mjs
//
// WELCHE ARME HIER BELEGT WERDEN (je Arm ein eigener Test, damit ein Rot-
// Nachweis den Arm nennt und nicht nur einen Exit-Code):
//   ARM-SCHALTER    ad_weiche_b fehlt/falsch     -> LP A wie heute (der Arm steht AUS)
//   ARM-PIN         fm_b=a/b, nur bei Schalter an -> deterministisch beide Arme
//   ARM-QUERY       Original-Query byte-gleich auf B, dazu lp_m=n
//   ARM-NAHT        der ZWEITE Request, auf B selbst: die Weiche feuert dort nicht
//   ARM-ANTEIL      rund 15 % der Besucher, stabil je Besucher (IP + UA)
//   ARM-UNABHÄNGIG  eigenes Salz: die B-Zuteilung hängt nicht an E1
//   ARM-AUSNAHMEN   Crawler, eigener Verkehr, fehlende IP -> LP A
//   ARM-QUELLE      alle bezahlten Quellen teilen sich gleich (Arme mit gleichem
//                   Quellenmix); Google-Shopping auf /products/* bleibt, wo es ist
//   ARM-MM-VORRANG  ein Message-Match-Ziel geht vor, B greift nur ohne
//   ARM-RABATT      der Ad-Rabattcode setzt auf B auf wie auf LP A
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AUSSCHLUSS_SEGMENTE,
  LP_A_PFAD,
  pruefeAdWeiche,
  stufeBAktivAusRoh,
} from '../app/lib/ad-weiche.server.js';
import {
  STUFE_B,
  STUFE_B_MARKER,
  STUFE_B_PFAD,
  stufeBZielPfad,
} from '../app/lib/ad-weiche-stufe-b.server.js';
import {E1, besucherEimer} from '../app/lib/lp-ab-v2.server.js';
import {MM_ZIELE} from '../app/lib/ad-weiche-ziele.js';

const BASIS = 'https://qiblanco.com';
const PAID = 'utm_source=facebook&utm_medium=paid&utm_campaign=120250590399490704&fbclid=IwAR0abc';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/** Zuteilung-Attrappe: liefert genau das ROH-JSON, das die Weiche fetcht. */
function fetchAttrappe(zuteilung, adCodes = null) {
  return async (url) => {
    if (String(url).includes('zuteilung.json')) {
      return {ok: true, json: async () => zuteilung};
    }
    if (String(url).includes('ad-codes.json')) {
      return adCodes ? {ok: true, json: async () => adCodes} : {ok: false, status: 404};
    }
    return {ok: false, status: 404};
  };
}

function req(pfad, query, {ip = '203.0.113.7', ua = UA} = {}) {
  const headers = {'user-agent': ua};
  if (ip) headers['oxygen-buyer-ip'] = ip;
  return new Request(`${BASIS}${pfad}?${query}`, {headers});
}

/** Eine IP, deren Eimer im B-Arm liegt (bzw. im Kontrollarm). */
function ipImArm(imB) {
  for (let i = 1; i < 5000; i += 1) {
    const ip = `198.51.${Math.floor(i / 250)}.${i % 250}`;
    const eimer = besucherEimer(ip, UA, STUFE_B.salz);
    if ((eimer < STUFE_B.anteil_prozent) === imB) return ip;
  }
  throw new Error('keine passende IP gefunden');
}

const AN = {ad_weiche_b: 'an'};

// --- ARM-SCHALTER: der Arm steht aus, solange das Feld nicht 'an' ist --------

test('ARM-SCHALTER: ohne ad_weiche_b bleibt alles auf LP A (auch ein B-Besucher)', async () => {
  const ziel = await pruefeAdWeiche(req('/', PAID, {ip: ipImArm(true)}), fetchAttrappe({}));
  assert.ok(ziel.startsWith(`${LP_A_PFAD}?`), `erwartet LP A, war: ${ziel}`);
  assert.ok(ziel.endsWith('&lp_m=w'), 'Weichen-Marker w erwartet');
});

test('ARM-SCHALTER: jeder andere Wert als "an" ist AUS', () => {
  for (const wert of ['aus', 'AN', 'true', '1', true, null, undefined, 'b']) {
    assert.equal(stufeBAktivAusRoh({ad_weiche_b: wert}), false, `Wert ${String(wert)} darf nicht aktivieren`);
  }
  assert.equal(stufeBAktivAusRoh(AN), true);
  assert.equal(stufeBAktivAusRoh(null), false, 'Fetch-Fehler (null) darf nie aktivieren');
});

test('ARM-SCHALTER: Fetch-Fehler der Zuteilung heißt LP A, nie B', async () => {
  const kaputt = async () => {
    throw new Error('netz weg');
  };
  const ziel = await pruefeAdWeiche(req('/', PAID, {ip: ipImArm(true)}), kaputt);
  assert.ok(ziel.startsWith(`${LP_A_PFAD}?`), `erwartet LP A, war: ${ziel}`);
});

// --- ARM-PIN -----------------------------------------------------------------

test('ARM-PIN: fm_b=b führt bei eingeschaltetem Arm immer auf B, fm_b=a immer auf A', async () => {
  const b = await pruefeAdWeiche(req('/', `${PAID}&fm_b=b`, {ip: ipImArm(false)}), fetchAttrappe(AN));
  assert.ok(b.startsWith(`${STUFE_B_PFAD}?`), `erwartet B, war: ${b}`);
  const a = await pruefeAdWeiche(req('/', `${PAID}&fm_b=a`, {ip: ipImArm(true)}), fetchAttrappe(AN));
  assert.ok(a.startsWith(`${LP_A_PFAD}?`), `erwartet A, war: ${a}`);
});

test('ARM-PIN: ohne Schalter wirkt der Pin nicht (der Schalter dominiert)', async () => {
  const ziel = await pruefeAdWeiche(req('/', `${PAID}&fm_b=b`), fetchAttrappe({}));
  assert.ok(ziel.startsWith(`${LP_A_PFAD}?`), `erwartet LP A, war: ${ziel}`);
});

// --- ARM-QUERY ---------------------------------------------------------------

test('ARM-QUERY: B bekommt den Original-Query byte-gleich plus lp_m=n', async () => {
  const query = `${PAID}&utm_content=120251220869070704&h_ad_id=120251220869070704&gclid=Cj0K-x_1`;
  const ziel = await pruefeAdWeiche(req('/', query, {ip: ipImArm(true)}), fetchAttrappe(AN));
  assert.equal(ziel, `${STUFE_B_PFAD}?${query}&lp_m=${STUFE_B_MARKER}`);
  assert.equal(STUFE_B_MARKER, 'n');
});

// --- ARM-NAHT: auf B selbst feuert die Weiche nicht noch einmal --------------

test('ARM-NAHT: B steht in AUSSCHLUSS_SEGMENTE, der zweite Request bleibt auf B', async () => {
  assert.ok(AUSSCHLUSS_SEGMENTE.includes(STUFE_B_PFAD));
  for (const zut of [AN, {}]) {
    const ziel = await pruefeAdWeiche(
      req(STUFE_B_PFAD, `${PAID}&lp_m=n`, {ip: ipImArm(true)}),
      fetchAttrappe(zut),
    );
    assert.equal(ziel, null, `auf B darf nichts umleiten (Zuteilung ${JSON.stringify(zut)})`);
  }
});

test('ARM-NAHT: Schleifenschutz auch in der reinen Funktion', () => {
  const r = req(STUFE_B_PFAD, `${PAID}&fm_b=b`);
  assert.equal(stufeBZielPfad(r, true, 'meta-paid'), null);
});

// --- ARM-ANTEIL --------------------------------------------------------------

test('ARM-ANTEIL: rund 15 % der Besucher landen auf B, stabil je Besucher', () => {
  let n = 0;
  let b = 0;
  for (let x = 0; x < 40; x += 1) {
    for (let y = 1; y < 101; y += 1) {
      const r = req('/', PAID, {ip: `100.${x}.7.${y}`});
      const erst = stufeBZielPfad(r, true, 'meta-paid');
      const zweit = stufeBZielPfad(req('/', PAID, {ip: `100.${x}.7.${y}`}), true, 'meta-paid');
      assert.equal(erst, zweit, 'derselbe Besucher muss denselben Arm sehen');
      n += 1;
      if (erst) b += 1;
    }
  }
  const anteil = b / n;
  assert.ok(anteil > 0.12 && anteil < 0.18, `Anteil B ${anteil.toFixed(3)} ausserhalb 12-18 %`);
  assert.equal(STUFE_B.anteil_prozent, 15);
});

// --- ARM-UNABHÄNGIG ---------------------------------------------------------

test('ARM-UNABHÄNGIG: die B-Zuteilung hängt nicht an der E1-Zuteilung', () => {
  assert.notEqual(STUFE_B.salz, E1.salz);
  let n = 0;
  let beide = 0;
  let nurB = 0;
  let nurE1 = 0;
  for (let x = 0; x < 60; x += 1) {
    for (let y = 1; y < 101; y += 1) {
      const ip = `100.${x}.9.${y}`;
      const inB = besucherEimer(ip, UA, STUFE_B.salz) < STUFE_B.anteil_prozent;
      const inE1 = besucherEimer(ip, UA, E1.salz) < E1.anteil_prozent;
      n += 1;
      if (inB && inE1) beide += 1;
      else if (inB) nurB += 1;
      else if (inE1) nurE1 += 1;
    }
  }
  // Unabhängig heißt: P(B und E1) ~ P(B) * P(E1) = 2,25 %.
  const pB = (beide + nurB) / n;
  const pE1 = (beide + nurE1) / n;
  const pBeide = beide / n;
  assert.ok(Math.abs(pBeide - pB * pE1) < 0.012, `P(beide) ${pBeide.toFixed(4)} vs ${(pB * pE1).toFixed(4)}`);
});

// --- ARM-AUSNAHMEN -----------------------------------------------------------

test('ARM-AUSNAHMEN: Such- und Vorschau-Crawler sehen A, auch mit Pin', () => {
  for (const ua of [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  ]) {
    assert.equal(stufeBZielPfad(req('/', `${PAID}&fm_b=b`, {ua}), true, 'meta-paid'), null, ua);
  }
});

test('ARM-AUSNAHMEN: eigener Verkehr und fehlende IP bleiben auf A', () => {
  const imB = ipImArm(true);
  assert.equal(stufeBZielPfad(req('/', PAID, {ip: imB}), true, 'meta-paid'), STUFE_B_PFAD, 'Kontrolle: diese IP fällt in B');
  assert.equal(stufeBZielPfad(req('/', PAID, {ip: imB, ua: `${UA} QiBlancoInternal/funnel-manager`}), true, 'meta-paid'), null);
  assert.equal(stufeBZielPfad(req('/', PAID, {ip: ''}), true, 'meta-paid'), null);
});

// --- ARM-QUELLE: alle bezahlten Quellen, gleich verteilt ---------------------
// Der Kreislauf trennt die Arme nur am Einstiegspfad. Bekäme B nur Meta, trüge A
// allein die Markensuche (57 % Weiterklick gegen 16 % bei Meta, 14 Tage bis
// 07.10.2026) und B startete mit Rückstand. Deshalb: dieselbe Zuteilung für jede
// bezahlte Quelle, und derselbe Besucher landet je Quelle im selben Arm.

test('ARM-QUELLE: Meta, Google und weitere Paid-Klicks teilen sich gleich auf A und B', async () => {
  assert.deepEqual([...STUFE_B.erkennungen], ['meta-paid', 'google-paid', 'weitere-paid']);
  const imB = ipImArm(true);
  const imA = ipImArm(false);
  for (const query of [PAID, 'gclid=Cj0K-x_1', 'gbraid=abc', 'wbraid=abc', 'msclkid=abc', 'ttclid=abc']) {
    const b = await pruefeAdWeiche(req('/', query, {ip: imB}), fetchAttrappe(AN));
    assert.ok(b.startsWith(`${STUFE_B_PFAD}?`), `${query}: B-Besucher erwartet B, war: ${b}`);
    assert.ok(b.endsWith('&lp_m=n'), `${query}: Marker n erwartet`);
    const a = await pruefeAdWeiche(req('/', query, {ip: imA}), fetchAttrappe(AN));
    assert.ok(a.startsWith(`${LP_A_PFAD}?`), `${query}: A-Besucher erwartet LP A, war: ${a}`);
  }
  // Eine künftige Erkennung bleibt auf A, bis sie in STUFE_B.erkennungen steht.
  assert.equal(stufeBZielPfad(req('/', PAID, {ip: imB}), true, 'neue-quelle'), null);
});

test('ARM-QUELLE: Google-Shopping auf /products/* bleibt beim Shopping-Ziel, B greift dort nicht', async () => {
  const ziel = await pruefeAdWeiche(req('/products/qione-2-pro', 'gclid=Cj0K-x_1', {ip: ipImArm(true)}), fetchAttrappe(AN));
  assert.equal(ziel, null);
});

// --- ARM-MM-VORRANG ----------------------------------------------------------

test('ARM-MM-VORRANG: ein Message-Match-Ziel geht vor, B greift nicht', async () => {
  const [adId, mmPfad] = Object.entries(MM_ZIELE)[0];
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${adId}&lp_mm=an&fm_b=b`),
    fetchAttrappe({ad_weiche_mm: 'an', ad_weiche_b: 'an'}),
  );
  assert.ok(ziel.startsWith(`${mmPfad}?`), `erwartet MM-Ziel ${mmPfad}, war: ${ziel}`);
});

// --- ARM-RABATT --------------------------------------------------------------

test('ARM-RABATT: der Ad-Rabattcode setzt auf B auf', async () => {
  const adId = '120251220869070704';
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${adId}`, {ip: ipImArm(true)}),
    fetchAttrappe(AN, {aktiv: true, codes: {[adId]: 'QBTEST1'}}),
  );
  assert.ok(
    ziel.startsWith(`/discount/QBTEST1?redirect=${STUFE_B_PFAD}&`),
    `erwartet Rabattweg auf B, war: ${ziel}`,
  );
  assert.ok(ziel.endsWith('&lp_m=n'));
});
