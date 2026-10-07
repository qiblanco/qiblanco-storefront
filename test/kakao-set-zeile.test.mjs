// Hermetischer Regeltest der Kakao-Normalform (app/lib/kakao-set-zeile.js).
// Kein Netz. Ausführen: node --test test/kakao-set-zeile.test.mjs
//
// Gegenstand: Christian 30.09.2026 "die Rabattcodes von den Influencern sollen
// mit allen Kakaomengen kompatibel sein ... auch gemischt über die Sorten
// hinweg", Nachtrag 01.10. "für jede Menge, auch 20". Großjob
// 20260930-GROSSJOB-kakao-partnercodes-alle-mengen-und-mengenrabatt-gemischt,
// s03. Rot-Arm: gegen die Tabelle vor s03 (nur 2 und 3 Packungen) muss jeder
// Fall ab 4 Packungen hier FAIL geben.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KAKAO_SETS,
  KAKAO_EINZEL,
  kakaoZeilenPlan,
  kakaoSetArt,
  stepperZusammensetzung,
} from '../app/lib/kakao-set-zeile.js';
import * as lib from '../app/lib/kakao-set-zeile.js';

const A = KAKAO_EINZEL.awake;
const C = KAKAO_EINZEL.create;

function plan(zeilen) {
  return kakaoZeilenPlan(
    zeilen.map(([handle, quantity], i) => ({id: `L${i}`, handle, quantity})),
  );
}

function einzel(a, c) {
  const z = [];
  if (a) z.push([A, a]);
  if (c) z.push([C, c]);
  return z;
}

function setHandle(a, c) {
  return KAKAO_SETS[`${a}+${c}`];
}

// Summe der Packungen je Sorte über die Soll-Set-Zeilen eines Plans.
function summe(sets) {
  const je = {awake: 0, create: 0};
  for (const s of sets) {
    const art = kakaoSetArt(s.handle);
    assert.ok(art, `${s.handle} ist kein bekanntes Set`);
    je.awake += art.je.awake * s.quantity;
    je.create += art.je.create * s.quantity;
  }
  return je;
}

// --- Bestand der Set-Tabelle -------------------------------------------------

test('jede Zusammensetzung von 2 bis 7 Packungen hat genau ein Set', () => {
  for (let n = 2; n <= 7; n += 1) {
    for (let a = 0; a <= n; a += 1) {
      const h = setHandle(a, n - a);
      assert.ok(h, `kein Set für ${a}+${n - a}`);
      const art = kakaoSetArt(h);
      assert.deepEqual(art.je, {awake: a, create: n - a});
      assert.equal(art.packungen, n);
    }
  }
  assert.equal(new Set(Object.values(KAKAO_SETS)).size, Object.keys(KAKAO_SETS).length);
  assert.equal(Object.keys(KAKAO_SETS).length, 33);
});

test('Handles der neuen Sets wie in Shopify angelegt (s02)', () => {
  assert.equal(setHandle(4, 0), 'bundle-4x-awake');
  assert.equal(setHandle(0, 5), 'bundle-5x-create');
  assert.equal(setHandle(3, 2), 'bundle-3x-awake-2x-create');
  assert.equal(setHandle(1, 6), 'bundle-1x-awake-6x-create');
  // Bestand vom 29.09. bleibt, wie er heißt.
  assert.equal(setHandle(0, 2), 'mengenrabatt-2x');
  assert.equal(setHandle(0, 3), 'mengenrabatt-3x-create');
});

// --- Normalform: jede Menge, einzeln und gemischt ----------------------------

test('1 Packung: Einzelpackung bleibt, nichts zu tun', () => {
  assert.equal(plan([[A, 1]]), null);
  assert.equal(plan([[C, 1]]), null);
});

test('2 bis 7 Packungen, jede Mischung: genau EIN Set x1', () => {
  for (let n = 2; n <= 7; n += 1) {
    for (let a = 0; a <= n; a += 1) {
      const c = n - a;
      const p = plan(einzel(a, c));
      assert.ok(p?.kandidat, `${a}+${c}: kein Kandidat`);
      assert.equal(p.kandidat.set, setHandle(a, c), `${a}+${c}`);
      assert.deepEqual(
        p.kandidat.sets.map((s) => [s.handle, s.quantity]),
        [[setHandle(a, c), 1]],
      );
      assert.equal(p.kandidat.packungen, n);
      assert.equal(p.kandidat.gemischt, a > 0 && c > 0);
    }
  }
});

test('8 bis 30 Packungen, jede Mischung: Sets der Größen 4 bis 7, Summe stimmt', () => {
  for (let n = 8; n <= 30; n += 1) {
    for (let a = 0; a <= n; a += 1) {
      const c = n - a;
      const p = plan(einzel(a, c));
      assert.ok(p?.kandidat, `${a}+${c}: kein Kandidat`);
      const {sets} = p.kandidat;
      assert.deepEqual(summe(sets), {awake: a, create: c}, `${a}+${c}`);
      for (const s of sets) {
        const g = kakaoSetArt(s.handle).packungen;
        assert.ok(g >= 4 && g <= 7, `${a}+${c}: Set-Größe ${g}`);
        assert.ok(s.quantity >= 1);
      }
      assert.equal(new Set(sets.map((s) => s.handle)).size, sets.length);
      assert.ok(sets.length <= 3, `${a}+${c}: ${sets.length} Zeilen`);
    }
  }
});

test('Christians Beispiele: 12 Awake + 8 Create = Set 3+2 x4, 20 Awake = Set 5 x4', () => {
  const p = plan(einzel(12, 8));
  assert.deepEqual(p.kandidat.sets.map((s) => [s.handle, s.quantity]), [
    ['bundle-3x-awake-2x-create', 4],
  ]);
  const q = plan(einzel(20, 0));
  assert.deepEqual(q.kandidat.sets.map((s) => [s.handle, s.quantity]), [
    ['bundle-5x-awake', 4],
  ]);
  const r = plan(einzel(5, 5));
  assert.deepEqual(summe(r.kandidat.sets), {awake: 5, create: 5});
  assert.equal(r.kandidat.set, null);
});

test('2 Awake + 1 Create: das gemischte 3er-Set (Christians 30-%-Beispiel)', () => {
  assert.equal(plan(einzel(2, 1)).kandidat.set, 'bundle-2x-awake-1x-create');
});

test('Warenkorb schon in Normalform: nichts zu tun', () => {
  assert.equal(plan([['bundle-4x-awake', 1]]), null);
  assert.equal(plan([['bundle-3x-awake-2x-create', 4]]), null);
  assert.equal(plan([['bundle-6x-awake', 2], ['bundle-5x-awake', 2]]), null);
  assert.equal(plan([['bundle-3x-awake', 1]]), null);
});

test('Set-Zeilen, die nicht die Normalform sind, gehen über die Einzelform', () => {
  // Set 3 Awake + 1 Awake -> Einzelform Awake x4, dann Set 4.
  const p = plan([['bundle-3x-awake', 1], [A, 1]]);
  assert.equal(p.einzelform.length, 1);
  assert.equal(p.einzelform[0].quantity, 4);
  assert.equal(p.entfernen.length, 1);
  assert.equal(p.kandidat.set, 'bundle-4x-awake');
  // Set 1+1 x2 -> 2 Awake + 2 Create, eine Zeile neu, dann Set 2+2.
  const q = plan([['bundle-1x-awake-1x-create', 2]]);
  assert.equal(q.hinzu.length, 1);
  assert.equal(q.kandidat.set, 'bundle-2x-awake-2x-create');
  // Set 5 x2 (10 Awake) ist nicht die Normalform von 10 Awake? Doch: 5+5.
  assert.equal(plan([['bundle-5x-awake', 2]]), null);
  // Set 4 Awake + Set 3 Create = 4+3 -> ein 7er-Set.
  const r = plan([['bundle-4x-awake', 1], ['mengenrabatt-3x-create', 1]]);
  assert.equal(r.kandidat.set, 'bundle-4x-awake-3x-create');
});

test('fremde Kakao-Zeile daneben: alter Weg, kein Set, auch ab 4', () => {
  assert.equal(plan([[A, 4], ['crystal-cacao-angebot', 1]]), null);
  assert.equal(plan([[A, 2], [C, 3], ['crystal-cacao-adfiefiale', 1]]), null);
  const p = plan([['bundle-4x-awake', 1], ['crystal-cacao-angebot', 1]]);
  assert.equal(p.kandidat, null);
  assert.equal(p.einzelform[0].handle, A);
  assert.equal(p.einzelform[0].quantity, 4);
});

test('fremde Nicht-Kakao-Zeile stört nicht', () => {
  assert.equal(plan([[A, 3], [C, 2], ['qione-2-pro', 1]]).kandidat.set, 'bundle-3x-awake-2x-create');
});

// --- Stepper ----------------------------------------------------------------

test('Stepper über 3 <-> 4 <-> 5 <-> 6 und zurück, Sorte und gemischt', () => {
  const {stepperEinzelZeilen} = lib;
  assert.equal(typeof stepperEinzelZeilen, 'function', 'stepperEinzelZeilen fehlt');
  const weg = (handle, menge, packungen) => {
    const z = stepperEinzelZeilen(handle, menge, packungen);
    const je = {awake: 0, create: 0};
    for (const x of [z.zeile, z.dazu].filter(Boolean)) {
      je[x.handle === A ? 'awake' : 'create'] += x.quantity;
    }
    const p = plan(einzel(je.awake, je.create));
    return p?.kandidat?.sets.map((s) => `${s.handle}x${s.quantity}`).join(',') ?? 'einzel';
  };
  // Sorte: 3 -> 4 -> 5 -> 6 -> 5 -> 4 -> 3
  assert.equal(weg('bundle-3x-awake', 1, 4), 'bundle-4x-awakex1');
  assert.equal(weg('bundle-4x-awake', 1, 5), 'bundle-5x-awakex1');
  assert.equal(weg('bundle-5x-awake', 1, 6), 'bundle-6x-awakex1');
  assert.equal(weg('bundle-6x-awake', 1, 5), 'bundle-5x-awakex1');
  assert.equal(weg('bundle-5x-awake', 1, 4), 'bundle-4x-awakex1');
  assert.equal(weg('bundle-4x-awake', 1, 3), 'bundle-3x-awakex1');
  assert.equal(weg('mengenrabatt-2x', 1, 1), 'einzel');
  // gemischt: 2+1 -> 3+1 -> 4+1 -> 4+2 ... und zurück
  assert.equal(weg('bundle-2x-awake-1x-create', 1, 4), 'bundle-3x-awake-1x-createx1');
  assert.equal(weg('bundle-3x-awake-1x-create', 1, 5), 'bundle-4x-awake-1x-createx1');
  assert.equal(weg('bundle-4x-awake-1x-create', 1, 4), 'bundle-3x-awake-1x-createx1');
  assert.equal(weg('bundle-3x-awake-1x-create', 1, 3), 'bundle-2x-awake-1x-createx1');
  // 7 -> 8: zwei Sets
  assert.equal(weg('bundle-7x-awake', 1, 8), 'bundle-4x-awakex2');
  // Zeile mit Menge: Set 3+2 x4 (20 Packungen) +1 -> 21, nicht 6
  const z = stepperEinzelZeilen('bundle-3x-awake-2x-create', 4, 21);
  assert.equal(z.zeile.quantity + (z.dazu?.quantity || 0), 21);
  assert.equal(weg('bundle-3x-awake-2x-create', 4, 19), plan(einzel(11, 8)).kandidat.sets.map((s) => `${s.handle}x${s.quantity}`).join(','));
  // Einzelpackung ist keine Set-Zeile
  assert.equal(stepperEinzelZeilen(A, 1, 2), null);
});

test('stepperZusammensetzung: + auf die größere Sorte, - von der größeren', () => {
  assert.deepEqual(stepperZusammensetzung({awake: 1, create: 1}, 3), {awake: 2, create: 1});
  assert.deepEqual(stepperZusammensetzung({awake: 1, create: 2}, 4), {awake: 1, create: 3});
  assert.deepEqual(stepperZusammensetzung({awake: 4, create: 1}, 4), {awake: 3, create: 1});
});

// --- Preisschutz je Markt (Werte gemessen s02, 2026-09-30) -------------------

test('Preisschutz DE/US/CH: nie teurer, nie billiger, Anker benannt', () => {
  const {kakaoPreisschutz} = lib;
  assert.equal(typeof kakaoPreisschutz, 'function', 'kakaoPreisschutz fehlt');
  const ps = (o) => kakaoPreisschutz({einzelZeilen: 1, ...o});
  // DE 4 Packungen: Set 198,92 = Einzelweg 198,92 -> legt um
  assert.deepEqual(ps({packungen: 4, gemischt: false, setCent: 19892, zeileCent: 19892}),
    {ok: true, grund: 'anker_einzelweg'});
  // DE 12A+8C: 4 x 248,65 = 994,60 = Einzelweg (zwei Einzelzeilen)
  assert.equal(ps({packungen: 20, gemischt: true, setCent: 99460, zeileCent: 99460, einzelZeilen: 2}).ok, true);
  // US 5 Packungen: 346,50 = 346,50
  assert.equal(ps({packungen: 5, gemischt: false, setCent: 34650, zeileCent: 34650}).ok, true);
  // CH 4 Create: Set 202 gegen Einzelweg 198,80 -> alter Weg
  assert.deepEqual(ps({packungen: 4, gemischt: false, setCent: 20200, zeileCent: 19880}),
    {ok: false, grund: 'nie_teurer'});
  // ab 4: ein Cent je Einzelzeile Rundung erlaubt, drei Cent unter nicht
  assert.equal(ps({packungen: 7, gemischt: true, setCent: 34809, zeileCent: 34811, einzelZeilen: 2}).ok, true);
  assert.deepEqual(ps({packungen: 7, gemischt: true, setCent: 34808, zeileCent: 34811, einzelZeilen: 2}),
    {ok: false, grund: 'nie_billiger_als_automatik'});
  // US gemischt 2+1 mit Festpreis 210 = Sorten-Set 210, unter Automatik 222,50 -> legt um
  assert.deepEqual(ps({packungen: 3, gemischt: true, setCent: 21000, zeileCent: 22250, sortenSetCent: 21000}),
    {ok: true, grund: 'anker_sorten_set'});
  // US gemischt 1+1 umgerechnet 139 unter Sorten-Set 159 -> alter Weg (Stand vor s02)
  assert.deepEqual(ps({packungen: 2, gemischt: true, setCent: 13900, zeileCent: 16557, sortenSetCent: 15900}),
    {ok: false, grund: 'nie_billiger_als_sorten_set'});
  // US Sorten-Set 3 Awake 210 unter Automatik: Bestandsstufe, legt um
  assert.equal(ps({packungen: 3, gemischt: false, setCent: 21000, zeileCent: 22250}).ok, true);
  // unlesbar -> alter Weg
  assert.equal(ps({packungen: 4, gemischt: false, setCent: NaN, zeileCent: 19892}).ok, false);
});

// --- Umgerechnete Währung (gemessen 2026-10-07, alle 26 Sets, Job
// 20261007-update-kakao-set-ab4-fremdwaehrung-partnercode-greift-prio45) ------
// In LI/GB (Markt international, Basis USD) und PL/SE (Markt eu, Basis EUR)
// gibt es keine Preisliste in der Landeswährung. Shopify rechnet Einzelpackung
// und Set um und rundet jeden Preis auf eine ganze Einheit auf. Rot-Arm: gegen
// den Stand vor diesem Job (strikt 1 Cent) liefert jeder Fall hier ok=false.

test('Preisschutz umgerechnete Währung: Rundungsband der Umrechnung, sonst strikt', () => {
  const {kakaoPreisschutz, UMRECHNUNGS_LAENDER} = lib;
  assert.deepEqual([...UMRECHNUNGS_LAENDER].sort(), ['GB', 'LI', 'PL', 'SE']);
  const ps = (o) => kakaoPreisschutz({einzelZeilen: 1, setStueck: 1, gemischt: false, ...o});
  // LI 4A: Set 236 gegen Einzelweg 4 x 59,50 = 238 -> legt um
  assert.deepEqual(ps({packungen: 4, setCent: 23600, zeileCent: 23800, umgerechnet: true}),
    {ok: true, grund: 'anker_einzelweg_umrechnung'});
  // LI 7: 413 gegen 416,50 (-3,50), GB 7: 374 gegen 377,30 (-3,30)
  assert.equal(ps({packungen: 7, setCent: 41300, zeileCent: 41650, umgerechnet: true}).ok, true);
  assert.equal(ps({packungen: 7, setCent: 37400, zeileCent: 37730, umgerechnet: true, einzelZeilen: 2}).ok, true);
  // PL 4A: 888 gegen 887,60 (+0,40), PL 7: 1554 gegen 1553,30 (+0,70), SE 4A +0,20
  assert.equal(ps({packungen: 4, setCent: 88800, zeileCent: 88760, umgerechnet: true}).ok, true);
  assert.equal(ps({packungen: 7, setCent: 155400, zeileCent: 155330, umgerechnet: true}).ok, true);
  assert.equal(ps({packungen: 4, setCent: 228500, zeileCent: 228480, umgerechnet: true}).ok, true);
  // Grenzen: mehr als eine Einheit je Set darüber -> nie teurer
  assert.deepEqual(ps({packungen: 4, setCent: 88861, zeileCent: 88760, umgerechnet: true}),
    {ok: false, grund: 'nie_teurer_als_umrechnung'});
  // zwei Set-Stück (8 Packungen): zwei Einheiten darüber erlaubt, mehr nicht
  assert.equal(ps({packungen: 8, setStueck: 2, setCent: 177700, zeileCent: 177520, umgerechnet: true}).ok, true);
  assert.equal(ps({packungen: 8, setStueck: 2, setCent: 177721, zeileCent: 177520, umgerechnet: true}).ok, false);
  // mehr als eine Einheit je Packung darunter -> nie billiger
  assert.deepEqual(ps({packungen: 4, setCent: 23399, zeileCent: 23800, umgerechnet: true}),
    {ok: false, grund: 'nie_billiger_als_umrechnung'});
  // Dieselben Beträge OHNE umgerechnet (CH, US, EUR) bleiben strikt
  assert.deepEqual(ps({packungen: 4, setCent: 23600, zeileCent: 23800}),
    {ok: false, grund: 'nie_billiger_als_automatik'});
  assert.deepEqual(ps({packungen: 4, setCent: 88800, zeileCent: 88760}), {ok: false, grund: 'nie_teurer'});
  // CH 07.10.: Festpreis 202,05 gegen Einzelweg 202,08 bleibt strikt (Heilung über den Festpreis)
  assert.equal(ps({packungen: 4, setCent: 20205, zeileCent: 20208}).ok, false);
  // unter 4 Packungen ändert umgerechnet nichts (Sorten-Set-Anker)
  assert.deepEqual(ps({packungen: 2, gemischt: true, setCent: 13900, zeileCent: 16557, sortenSetCent: 15900, umgerechnet: true}),
    {ok: false, grund: 'nie_billiger_als_sorten_set'});
  // unlesbar bleibt alter Weg
  assert.equal(ps({packungen: 4, setCent: NaN, zeileCent: 23800, umgerechnet: true}).ok, false);
});
