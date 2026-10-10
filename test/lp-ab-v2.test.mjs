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

test('React-Router-Datenrequests bleiben unberuehrt (sonst reißt die Client-Navigation)', () => {
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
  // faehrt mit) -> Ad-Weiche wuerfe zurück auf LP A -> LP A splittet erneut.
  assert.equal(
    entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?utm_source=facebook&utm_medium=paid&lp_m=v`),
    null,
  );
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?gclid=LOOPTEST123`), null);
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}?ttclid=abc`), null);
});

test('LOOP-GUARD: der LP-A-Eintrag deckt den Suffix-Slug NICHT mit ab', () => {
  // Beweist, warum ein EIGENER Eintrag nötig war: istAusgeschlossen matcht nur
  // exakt oder '<eintrag>/...'. Ohne den V2-Eintrag wäre der Pfad offen.
  const ohneV2 = ['/pages/schlaf-zellen-schutz', '/go'];
  const trifft = ohneV2.some(
    (seg) => LP_V2_PFAD === seg || LP_V2_PFAD.startsWith(`${seg}/`),
  );
  assert.equal(trifft, false);
});

test('Ad-Weiche leitet organischen V2-Aufruf ebenfalls nicht um', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_V2_PFAD}`), null);
});

// --- VARIANTEN-PIN (s08): jede Variante deterministisch adressierbar -------
test('?lp_ab=a erzwingt LP A, auch wenn der Wuerfel auf V2 zeigt', () => {
  const r = entscheideLpAbV2(req(`${LP_A}?lp_ab=a`),
                             {LP_AB_V2_MODE: 'on'}, () => 0);   // 0 = würde umleiten
  assert.equal(r, null);
});

test('?lp_ab=b erzwingt V2, auch wenn der Wuerfel auf LP A zeigt', () => {
  const r = entscheideLpAbV2(req(`${LP_A}?lp_ab=b`),
                             {LP_AB_V2_MODE: 'on'}, () => 0.99); // 0.99 = würde bleiben
  assert.ok(r && r.ziel.includes('/pages/schlaf-zellen-schutz-v2-18ef'));
});

test('Der Kill-Schalter dominiert den Pin (lp_ab=b bei Split aus bleibt LP A)', () => {
  assert.equal(entscheideLpAbV2(req(`${LP_A}?lp_ab=b`),
                                {}, () => 0), null);
});

test('Der Pin faehrt im Query mit und zerstört den Passthrough nicht', () => {
  const r = entscheideLpAbV2(req(`${LP_A}?lp_ab=b&fbclid=X1`),
                             {LP_AB_V2_MODE: 'on'}, () => 0.99);
  assert.ok(r.ziel.includes('fbclid=X1'), r.ziel);
});

// ═══ Experiment-Kreislauf E1 (06.10.2026): 15 % stabil je Besucher ═══════════
import {
  E1,
  E2,
  E2_AKTIV,
  LP_EXP_B_PFAD,
  LP_EXP_B2_PFAD,
  LP_EXP_B2_MARKER,
  besucherEimer,
  entscheideLpExperiment,
  experimentAktiv,
  experimentB2Aktiv,
} from '../app/lib/lp-ab-v2.server.js';

/** Request-Stub mit Kopfzeilen (IP + UA), wie Oxygen sie liefert. */
function reqK(pfadMitQuery, {ip = '', ua = 'Mozilla/5.0 (iPhone)', method = 'GET'} = {}) {
  const h = new Map([['oxygen-buyer-ip', ip], ['user-agent', ua]]);
  return {method, url: `${BASIS}${pfadMitQuery}`, headers: {get: (k) => h.get(k.toLowerCase()) || null}};
}

/** Erste IP (10.x), deren Eimer im B-Anteil liegt (inB) bzw. bei A bleibt.
 *  Seit B2 (szs-e2-gs126, 10.10.2026) heißt „nicht B" nicht mehr „A": die
 *  obersten Eimer gehören B2. Für inB=false sucht der Helfer deshalb einen
 *  Eimer, der weder B noch B2 ist — sonst prüfte ein A-Test still B2. */
function ipMit(inB, ua = 'Mozilla/5.0 (iPhone)') {
  for (let i = 1; i < 5000; i += 1) {
    const ip = `10.0.${i >> 8}.${i & 255}`;
    const eimer = besucherEimer(ip, ua);
    const istB = eimer < E1.anteil_prozent;
    const istB2 = eimer >= 100 - E2.anteil_prozent;
    if (inB ? istB : !istB && !istB2) return ip;
  }
  throw new Error('keine IP gefunden');
}

test('E1: Anteil ist 15 % und B-Pfad ist eine eigene Route', () => {
  assert.equal(E1.anteil_prozent, 15);
  assert.equal(LP_EXP_B_PFAD, '/pages/schlaf-zellen-schutz-b');
  assert.notEqual(LP_EXP_B_PFAD, LP_A);
});

test('E1: Zuteilung ist stabil je Besucher (gleiche IP+UA => gleicher Arm, 50x)', () => {
  const ip = ipMit(true);
  for (let i = 0; i < 50; i += 1) {
    const e = entscheideLpExperiment(reqK(LP_A, {ip}), {});
    assert.ok(e, 'derselbe Besucher muss jedes Mal B sehen');
  }
  const ipA = ipMit(false);
  for (let i = 0; i < 50; i += 1) {
    assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: ipA}), {}), null);
  }
});

test('E1: Anteil über 20.000 Besucher liegt bei 15 % (+-1 Pkt.)', () => {
  let b = 0;
  const n = 20000;
  for (let i = 0; i < n; i += 1) {
    const ip = `100.${(i >> 16) & 255}.${(i >> 8) & 255}.${i & 255}`;
    // Nur Arm B zählt: seit B2 ist „umgeleitet" nicht mehr dasselbe wie „B".
    if (entscheideLpExperiment(reqK(LP_A, {ip, ua: `UA-${i % 7}`}), {})?.arm === 'b') b += 1;
  }
  const anteil = b / n;
  assert.ok(anteil > 0.14 && anteil < 0.16, `Anteil ${anteil}`);
});

test('E1: Zuteilung hängt NICHT an der Quelle (Query) — Markensuche bleibt gleich verteilt', () => {
  const ip = ipMit(true);
  for (const q of ['', '?gclid=x&gad_campaignid=8925560332', '?utm_medium=paid&utm_content=120252123057700236', '?fbclid=abc']) {
    assert.ok(entscheideLpExperiment(reqK(`${LP_A}${q}`, {ip}), {}), `Quelle ${q}`);
  }
});

test('E1: Ziel trägt den rohen Query byte-identisch + lp_m=x (Tracking-Kette)', () => {
  const ip = ipMit(true);
  const q = '?utm_source=facebook&utm_medium=paid&fbclid=AbC_123&gclid=G-9';
  const e = entscheideLpExperiment(reqK(`${LP_A}${q}`, {ip}), {});
  assert.equal(e.ziel, `${LP_EXP_B_PFAD}${q}&lp_m=x`);
  const ohne = entscheideLpExperiment(reqK(LP_A, {ip}), {});
  assert.equal(ohne.ziel, `${LP_EXP_B_PFAD}?lp_m=x`);
});

test('E1: eigener Verkehr (Server-IP oder Marker-UA) bleibt immer auf A', () => {
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: '65.108.150.121'}), {}), null);
  const ip = ipMit(true, 'QiBlancoInternal/1.0 (design-watch)');
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip, ua: 'QiBlancoInternal/1.0 (design-watch)'}), {}), null);
});

test('E1: Pin ?lp_exp=a|b dominiert den Würfel, auch für eigenen Verkehr', () => {
  const ipB = ipMit(true);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?lp_exp=a`, {ip: ipB}), {}), null);
  const e = entscheideLpExperiment(reqK(`${LP_A}?lp_exp=b`, {ip: '65.108.150.121'}), {});
  assert.ok(e && e.ziel.startsWith(`${LP_EXP_B_PFAD}?lp_exp=b`));
});

test('E1: ohne Client-IP keine Zuteilung (A), Datenrequests und POST nie', () => {
  // Scharf gemacht: ein UA, dessen Eimer OHNE IP in B läge — nur die IP-Pflicht hält ihn auf A.
  let uaOhne = '';
  for (let i = 0; i < 5000 && !uaOhne; i += 1) if (besucherEimer('', `UA-${i}`) < E1.anteil_prozent) uaOhne = `UA-${i}`;
  assert.ok(uaOhne);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: '', ua: uaOhne}), {}), null);
  const ip = ipMit(true);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}.data`, {ip}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?_data=routes`, {ip}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip, method: 'POST'}), {}), null);
  assert.ok(entscheideLpExperiment(reqK(LP_A, {ip, method: 'HEAD'}), {}));
});

test('E1: Kill — Env LP_EXP_SZS_MODE=off oder Code-Schalter false => 100 % A', () => {
  const ip = ipMit(true);
  assert.equal(experimentAktiv({}), true);
  assert.equal(experimentAktiv({LP_EXP_SZS_MODE: 'off'}), false);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {LP_EXP_SZS_MODE: 'off'}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {}, false), null);
});

test('E1: Ad-Weiche schließt B aus (sonst Schleife B -> A für bezahlten Verkehr)', () => {
  assert.ok(AUSSCHLUSS_SEGMENTE.includes(LP_EXP_B_PFAD));
  assert.equal(istAusgeschlossen(LP_EXP_B_PFAD), true);
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_EXP_B_PFAD}?utm_medium=paid&lp_m=x`), null);
  // Gegenprobe: ein nicht ausgeschlossener Pfad wird weiter umgeleitet.
  assert.ok(entscheideAdWeiche(`${BASIS}/pages/irgendwas?utm_medium=paid`));
});

// ═══ Zweiter Arm B2 (szs-e2-gs126, 10.10.2026): ausschließend neben B ════════
// Grossjob „LP-Tests je Gerät, Sticky isoliert“ vom 10.10.2026, s02. Dasselbe Salz wie E1, B die untersten, B2 die obersten
// Eimer, A die gemeinsame Kontrolle.

/** Synthetische Population: 30.000 IP/UA-Paare, mobil und desktop gemischt. */
const POP_B2 = Array.from({length: 30000}, (_, i) => ({
  ip: `${80 + (i % 50)}.${(i >> 16) & 255}.${(i >> 8) & 255}.${i & 255}`,
  ua: i % 3 ? `Mozilla/5.0 (iPhone; CPU iPhone OS 17_${i % 9})` : `Mozilla/5.0 (Windows NT 10.0) Chrome/12${i % 7}`,
}));

/** Die Zuteilung von B, wie sie vor B2 lautete (Stand PR #779, eingefroren). */
const bVorher = (b) => besucherEimer(b.ip, b.ua, 'szs-e1-gs050') < 15;

/** Erste IP mit Eimer im B2-Bereich. */
function ipInB2(ua = 'Mozilla/5.0 (iPhone)') {
  for (let i = 1; i < 5000; i += 1) {
    const ip = `10.1.${i >> 8}.${i & 255}`;
    if (besucherEimer(ip, ua) >= 100 - E2.anteil_prozent) return ip;
  }
  throw new Error('keine IP gefunden');
}

test('B2: dasselbe Salz wie E1, 15 %, eigene Route, eigener Marker', () => {
  assert.equal(E2.id, 'szs-e2-gs126');
  assert.equal(E2.hypothese_id, 'GS-126');
  assert.equal(E2.salz, E1.salz);
  assert.equal(E2.anteil_prozent, 15);
  assert.equal(E2_AKTIV, true);
  assert.equal(LP_EXP_B2_PFAD, '/pages/schlaf-zellen-schutz-b2');
  assert.notEqual(LP_EXP_B2_PFAD, LP_EXP_B_PFAD);
  assert.equal(LP_EXP_B2_MARKER, 'z');
  assert.ok(E1.anteil_prozent + E2.anteil_prozent <= 100);
});

test('B2: kein Besucher steht in B und B2 zugleich (30.000 synthetische Besucher)', () => {
  let beide = 0;
  for (const b of POP_B2) {
    const e = entscheideLpExperiment(reqK(LP_A, b), {});
    const eimer = besucherEimer(b.ip, b.ua);
    const inB = eimer < E1.anteil_prozent;
    const inB2 = eimer >= 100 - E2.anteil_prozent;
    if (inB && inB2) beide += 1;
    // Der gelieferte Arm folgt genau aus dem Eimer, ohne Überlappung.
    assert.equal(e?.arm ?? 'a', inB ? 'b' : inB2 ? 'b2' : 'a', `${b.ip} ${b.ua} Eimer ${eimer}`);
  }
  assert.equal(beide, 0);
});

test('B2: Anteile A/B/B2 liegen bei 70/15/15 (+-1 Pkt.)', () => {
  const z = {a: 0, b: 0, b2: 0};
  for (const b of POP_B2) z[entscheideLpExperiment(reqK(LP_A, b), {})?.arm ?? 'a'] += 1;
  const n = POP_B2.length;
  assert.ok(Math.abs(z.a / n - 0.7) < 0.01, `A ${z.a / n}`);
  assert.ok(Math.abs(z.b / n - 0.15) < 0.01, `B ${z.b / n}`);
  assert.ok(Math.abs(z.b2 / n - 0.15) < 0.01, `B2 ${z.b2 / n}`);
});

test('B2: die Zuteilung von B (gs050) ist unverändert — derselbe Besucher, derselbe Arm', () => {
  // Ein laufender Test wird nicht umgedeutet: wer vor B2 in B war, ist es
  // weiter; wer nicht in B war, kommt nie nach B. B2 nimmt nur aus A.
  for (const b of POP_B2) {
    const e = entscheideLpExperiment(reqK(LP_A, b), {});
    assert.equal(e?.arm === 'b', bVorher(b), `${b.ip} ${b.ua}`);
    if (e?.arm === 'b') assert.equal(e.ziel, `${LP_EXP_B_PFAD}?lp_m=x`);
  }
  // Auch mit abgeschaltetem B2 bleibt B byte-gleich.
  for (const b of POP_B2.slice(0, 3000)) {
    const mit = entscheideLpExperiment(reqK(LP_A, b), {});
    const ohne = entscheideLpExperiment(reqK(LP_A, b), {}, true, false);
    if (mit?.arm === 'b2') assert.equal(ohne, null);
    else assert.deepEqual(ohne, mit);
  }
});

test('B2: Ziel trägt den rohen Query byte-identisch + lp_m=z (Tracking-Kette)', () => {
  const ip = ipInB2();
  const q = '?utm_source=facebook&utm_medium=paid&fbclid=AbC_123&gclid=G-9&utm_campaign=x%20y';
  const e = entscheideLpExperiment(reqK(`${LP_A}${q}`, {ip}), {});
  assert.equal(e.arm, 'b2');
  assert.equal(e.ziel, `${LP_EXP_B2_PFAD}${q}&lp_m=z`);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {}).ziel, `${LP_EXP_B2_PFAD}?lp_m=z`);
});

test('B2: Pin ?lp_exp=b2 zeigt B2, auch für eigenen Verkehr; ?lp_exp=a hält einen B2-Besucher auf A', () => {
  const e = entscheideLpExperiment(reqK(`${LP_A}?lp_exp=b2`, {ip: '65.108.150.121'}), {});
  assert.equal(e.arm, 'b2');
  assert.ok(e.ziel.startsWith(`${LP_EXP_B2_PFAD}?lp_exp=b2`), e.ziel);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?lp_exp=a`, {ip: ipInB2()}), {}), null);
  // Pin b bleibt B (nicht B2), Pin auf einen abgeschalteten Arm zeigt A.
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?lp_exp=b`, {ip: '65.108.150.121'}), {}).arm, 'b');
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?lp_exp=b2`, {ip: '65.108.150.121'}), {LP_EXP_SZS_B2_MODE: 'off'}), null);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?lp_exp=b`, {ip: '65.108.150.121'}), {LP_EXP_SZS_MODE: 'off'}), null);
});

test('B2: dieselben Ausnahmen wie E1 (eigener Verkehr, ohne IP, .data, _data, POST)', () => {
  const ip = ipInB2();
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: '65.108.150.121'}), {}), null);
  const ipI = ipInB2('QiBlancoInternal/1.0 (design-watch)');
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: ipI, ua: 'QiBlancoInternal/1.0 (design-watch)'}), {}), null);
  let uaOhne = '';
  for (let i = 0; i < 5000 && !uaOhne; i += 1) if (besucherEimer('', `UA-${i}`) >= 100 - E2.anteil_prozent) uaOhne = `UA-${i}`;
  assert.ok(uaOhne);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: '', ua: uaOhne}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}.data`, {ip}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(`${LP_A}?_data=routes`, {ip}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip, method: 'POST'}), {}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip, method: 'HEAD'}), {}).arm, 'b2');
});

test('B2: Kill — Env LP_EXP_SZS_B2_MODE=off oder E2_AKTIV false => kein B2, B läuft weiter', () => {
  const ip = ipInB2();
  const ipB = ipMit(true);
  assert.equal(experimentB2Aktiv({}), true);
  assert.equal(experimentB2Aktiv({LP_EXP_SZS_B2_MODE: 'off'}), false);
  assert.equal(experimentB2Aktiv({LP_EXP_SZS_B2_MODE: 'on'}), true);
  assert.equal(experimentB2Aktiv({}, false), false);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {LP_EXP_SZS_B2_MODE: 'off'}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {}, true, false), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: ipB}), {LP_EXP_SZS_B2_MODE: 'off'}).arm, 'b');
  // Umgekehrt: der Kill von E1 lässt B2 laufen, und B-Besucher sehen dann A.
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {LP_EXP_SZS_MODE: 'off'}).arm, 'b2');
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip: ipB}), {LP_EXP_SZS_MODE: 'off'}), null);
  assert.equal(entscheideLpExperiment(reqK(LP_A, {ip}), {LP_EXP_SZS_MODE: 'off', LP_EXP_SZS_B2_MODE: 'off'}), null);
});

test('B2: Summe der Anteile über 100 oder fremdes Salz => B2 aus (Fail-Richtung Bestand)', () => {
  assert.equal(experimentB2Aktiv({}, true, {salz: 's', anteil_prozent: 86}, {salz: 's', anteil_prozent: 15}), false);
  assert.equal(experimentB2Aktiv({}, true, {salz: 's', anteil_prozent: 85}, {salz: 's', anteil_prozent: 15}), true);
  assert.equal(experimentB2Aktiv({}, true, {salz: 's', anteil_prozent: 50}, {salz: 's', anteil_prozent: 51}), false);
  assert.equal(experimentB2Aktiv({}, true, {salz: 's', anteil_prozent: 15}, {salz: 't', anteil_prozent: 15}), false);
  assert.equal(experimentB2Aktiv({}, true, {salz: 's', anteil_prozent: 15}, {salz: 's', anteil_prozent: 0}), false);
});

test('B2: Ad-Weiche schließt B2 aus (sonst Schleife B2 -> A -> B2 für bezahlten Verkehr)', () => {
  assert.ok(AUSSCHLUSS_SEGMENTE.includes(LP_EXP_B2_PFAD));
  assert.equal(istAusgeschlossen(LP_EXP_B2_PFAD), true);
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_EXP_B2_PFAD}?utm_medium=paid&fbclid=X&lp_m=z`), null);
});
