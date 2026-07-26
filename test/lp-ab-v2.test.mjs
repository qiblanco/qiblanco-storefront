// Hermetische Tests des LP-A/B-Splits V1 gegen V2 (Grossjob
// 20260726-scoring-standortbestimmung-lp-v2-psychobuild, Segment s07).
// Wie ad-weiche.test.mjs: node:test/node:assert sind Bordmittel, KEIN Netz,
// kein neuer Runner. Ausfuehren: node --test test/lp-ab-v2.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LP_V2_PFAD,
  SPLIT_DEFAULT_PROZENT,
  entscheideLpAbV2,
  leseSplitProzent,
  splitAktiv,
} from '../app/lib/lp-ab-v2.server.js';
import {AUSSCHLUSS_SEGMENTE, istAusgeschlossen, entscheideAdWeiche} from '../app/lib/ad-weiche.server.js';

const BASIS = 'https://qiblanco.com';
const LP_A = '/pages/schlaf-zellen-schutz';

/** Minimaler Request-Stub — die Entscheidungsfunktion liest nur method + url. */
function req(pfadMitQuery, method = 'GET') {
  return {method, url: `${BASIS}${pfadMitQuery}`};
}

const AN = {LP_AB_V2_MODE: 'on'};
const immer = () => 0; // Wuerfel 0 => faellt immer in den Split-Anteil
const nie = () => 0.999999; // Wuerfel ~1 => faellt nie in den Split-Anteil

// --- Kill-Schalter: nur 'on' aktiviert -------------------------------------

test('splitAktiv: NUR der explizite Wert on aktiviert', () => {
  assert.equal(splitAktiv({LP_AB_V2_MODE: 'on'}), true);
  assert.equal(splitAktiv({LP_AB_V2_MODE: 'shadow'}), false);
  assert.equal(splitAktiv({LP_AB_V2_MODE: 'ON'}), false);
  assert.equal(splitAktiv({LP_AB_V2_MODE: ''}), false);
  assert.equal(splitAktiv({}), false);
  assert.equal(splitAktiv(undefined), false);
});

test('Abwesenheit des Flags => 100 % Alt-LP (Fail-Richtung auf den Bestand)', () => {
  assert.equal(entscheideLpAbV2(req(LP_A), {}, immer), null);
  assert.equal(entscheideLpAbV2(req(LP_A), undefined, immer), null);
  assert.equal(entscheideLpAbV2(req(LP_A), {LP_AB_V2_MODE: 'off'}, immer), null);
});

// --- Split-Anteil -----------------------------------------------------------

test('leseSplitProzent: Default 50, geklemmt auf 0..100, kaputte Werte fail-soft', () => {
  assert.equal(leseSplitProzent({}), SPLIT_DEFAULT_PROZENT);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: ''}), SPLIT_DEFAULT_PROZENT);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: 'huch'}), SPLIT_DEFAULT_PROZENT);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: '30'}), 30);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: 30}), 30);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: '-5'}), 0);
  assert.equal(leseSplitProzent({LP_AB_V2_SPLIT: '400'}), 100);
});

test('Split 0 leitet nie um, Split 100 immer', () => {
  assert.equal(entscheideLpAbV2(req(LP_A), {...AN, LP_AB_V2_SPLIT: '0'}, immer), null);
  assert.ok(entscheideLpAbV2(req(LP_A), {...AN, LP_AB_V2_SPLIT: '100'}, nie));
});

test('Wuerfel entscheidet an der Schwelle (50 %)', () => {
  assert.ok(entscheideLpAbV2(req(LP_A), AN, () => 0.4999));
  assert.equal(entscheideLpAbV2(req(LP_A), AN, () => 0.5), null);
});

// --- Query-Invariante (die eine Stelle, an der Tracking verloren ginge) -----

test('roher Query faehrt byte-identisch mit, lp_m=v wird angehaengt', () => {
  const e = entscheideLpAbV2(
    req(`${LP_A}?utm_source=facebook&utm_medium=paid&utm_content=120250590409220704&fbclid=IwAR0abc&lp_m=w`),
    AN,
    immer,
  );
  assert.equal(
    e.ziel,
    `${LP_V2_PFAD}?utm_source=facebook&utm_medium=paid&utm_content=120250590409220704&fbclid=IwAR0abc&lp_m=w&lp_m=v`,
  );
  assert.ok(e.ziel.includes('fbclid=IwAR0abc'));
});

test('ohne Query: nur ?lp_m=v', () => {
  assert.equal(entscheideLpAbV2(req(LP_A), AN, immer).ziel, `${LP_V2_PFAD}?lp_m=v`);
});

// --- Ausschluesse -----------------------------------------------------------

test('nur GET/HEAD splitten', () => {
  assert.ok(entscheideLpAbV2(req(LP_A, 'GET'), AN, immer));
  assert.ok(entscheideLpAbV2(req(LP_A, 'HEAD'), AN, immer));
  assert.equal(entscheideLpAbV2(req(LP_A, 'POST'), AN, immer), null);
});

test('React-Router-Datenrequests bleiben unberuehrt (sonst reisst die Client-Navigation)', () => {
  assert.equal(entscheideLpAbV2(req(`${LP_A}.data`), AN, immer), null);
  assert.equal(entscheideLpAbV2(req(`${LP_A}?_data=routes%2Fpages`), AN, immer), null);
});

// --- LOOP-GUARD (ship-breaking, Konzept §0.3) -------------------------------

test('LOOP-GUARD: V2-Slug steht in AUSSCHLUSS_SEGMENTE der Ad-Weiche', () => {
  assert.ok(AUSSCHLUSS_SEGMENTE.includes(LP_V2_PFAD));
  assert.equal(istAusgeschlossen(LP_V2_PFAD), true);
});

test('LOOP-GUARD: Paid-Marker auf der V2-URL wird NICHT auf LP A zurueckgeworfen', () => {
  // Genau die Kette, die sonst endlos liefe: LP A -> 302 V2 (utm_medium=paid
  // faehrt mit) -> Ad-Weiche wuerfe zurueck auf LP A -> LP A splittet erneut.
  assert.equal(
    entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?utm_source=facebook&utm_medium=paid&lp_m=v`),
    null,
  );
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?gclid=LOOPTEST123`), null);
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?ttclid=abc`), null);
});

test('LOOP-GUARD: der LP-A-Eintrag deckt den Suffix-Slug NICHT mit ab', () => {
  // Beweist, warum ein EIGENER Eintrag noetig war: istAusgeschlossen matcht nur
  // exakt oder '<eintrag>/...'. Ohne den V2-Eintrag waere der Pfad offen.
  const ohneV2 = ['/pages/schlaf-zellen-schutz', '/go'];
  const trifft = ohneV2.some(
    (seg) => LP_V2_PFAD === seg || LP_V2_PFAD.startsWith(`${seg}/`),
  );
  assert.equal(trifft, false);
});

test('Ad-Weiche leitet organischen V2-Aufruf ebenfalls nicht um', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}`), null);
});
