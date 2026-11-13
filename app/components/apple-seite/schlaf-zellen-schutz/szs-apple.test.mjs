// node --test app/components/apple-seite/schlaf-zellen-schutz/szs-apple.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KONJUNKTIV, VERBOTEN, texteVon} from '../apple-seite-logik.js';
import * as D from './szs-daten.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';

import {
  E1, E2, E3, E4, E6, E6_AKTIV, LP_EXP_B_PFAD, LP_EXP_E6_MARKER, besucherEimer, entscheideLpExperiment, experimentE6Aktiv,
} from '../../../lib/lp-ab-v2.server.js';

const C = readFileSync(new URL('../../campaign/SchlafZellenSchutz.jsx', import.meta.url), 'utf8');
const ALLE_TEXTE = texteVon({
  KOPF: D.KOPF, VERTRAUEN: D.VERTRAUEN, WIRKPRINZIP: D.WIRKPRINZIP, EBENEN: D.EBENEN, LABOR: D.LABOR,
  MIKROSKOP: D.MIKROSKOP, STIMMEN: D.STIMMEN, VIDEOS: D.VIDEOS, GARANTIE: D.GARANTIE, MODELLE: D.MODELLE,
  SCHLUSS: D.SCHLUSS,
}).join('\n');

test('jeder Arm hat einen Schalter in app/lib/apple-seiten.js', () => {
  for (const v of D.VARIANTEN) assert.ok(APPLE_SEITEN[D.SEITE_JE_VARIANTE[v]], v);
});

test('Arm-Regeln wie C: was K50/K25 weglassen, B2 ohne festen Knopf mit Weiter 1 und 2', () => {
  const a = D.teileFuer('a');
  const b2 = D.teileFuer('b2');
  const k50 = D.teileFuer('k50');
  const k25 = D.teileFuer('k25');
  assert.equal(a.weiter1, 'mobil');
  assert.equal(a.sticky, true);
  assert.equal(a.weiter2, false);
  assert.equal(b2.weiter1, 'immer');
  assert.equal(b2.weiter2, true);
  assert.equal(b2.sticky, false);
  for (const t of [k50, k25]) {
    assert.equal(t.gitterchipVideo, false);
    assert.equal(t.mikroskopVideo, false);
    assert.equal(t.videos, false);
    assert.equal(t.schluss, false);
    assert.equal(t.sticky, true);
  }
  assert.equal(k50.labor, true);
  assert.equal(k50.weiter1, 'mobil');
  for (const teil of ['wirkprinzip', 'ebenen', 'labor', 'weiter6']) assert.equal(k25[teil], false, teil);
  assert.equal(k25.weiter1, null);
  for (const t of [a, b2, k50, k25]) {
    assert.equal(t.stimmen, true);
    assert.equal(t.garantie, true);
    assert.equal(t.modelle, true);
  }
  assert.equal(D.teileFuer('unbekannt').variante, 'a', 'fail-closed auf A');
});

test('C trägt dieselben Arm-Regeln (Kopplung: wer C ändert, zieht teileFuer nach)', () => {
  assert.match(C, /return variante === 'a' \|\| variante === 'k50' \|\| variante === 'k25';/);
  assert.match(C, /\{!istKurz && <FinalCTA \/>\}/);
  assert.match(C, /\{istB2 && <WeiterCta nr=\{2\} \/>\}/);
});

test('Christians Wortlaut im Kopf unverändert aus C', () => {
  for (const s of ['Leistung auf Zellebene', 'Tragbares Hightech mit messbaren Effekten auf Zellebene',
    'Tiefer schlafen.', 'Starker Fokus.', 'Innere Ruhe.', 'Wirkung in Zellstudien bestätigt', 'Erfahre es jetzt selbst.']) {
    assert.ok(C.includes(s), `in C: ${s}`);
    assert.ok(ALLE_TEXTE.includes(s), `in A: ${s}`);
  }
  const absatzC = 'Der QiOne<sup>®</sup>&nbsp;2 Pro strukturiert dort Wasser, wo es darauf';
  assert.ok(C.includes(absatzC));
  assert.ok(D.KOPF.absatz.startsWith('Der QiOne® 2 Pro strukturiert dort Wasser, wo es darauf ankommt: In deinen Zellen.'));
});

test('kein Preisanker, kein Konjunktiv, kein Schild', () => {
  for (const v of VERBOTEN) assert.doesNotMatch(ALLE_TEXTE, v.muster, v.grund);
  assert.doesNotMatch(ALLE_TEXTE, KONJUNKTIV);
  assert.doesNotMatch(ALLE_TEXTE, /14\.000|4[.,]8|★/);
});

test('kein Weg auf /pages/bewertungen (Christian 28.09.: KEIN WEGLINK)', () => {
  const alles = JSON.stringify(Object.values(D).filter((x) => typeof x !== 'function'));
  assert.doesNotMatch(alles, /\/pages\/bewertungen/);
});

test('Video-Stimmen sind die drei aus C (gleiche id, gleicher Titel)', () => {
  for (const v of D.VIDEOS.liste) {
    assert.ok(C.includes(`id: '${v.id}'`), v.id);
    assert.ok(C.includes(v.tag), v.tag);
  }
});

test('Bilder tragen gemessene Breite und Höhe', () => {
  for (const e of D.EBENEN) {
    assert.ok(e.bild.breite > 0 && e.bild.hoehe > 0, e.etikett);
    assert.ok(e.bild.url.startsWith('https://cdn.shopify.com/'), e.etikett);
  }
  for (const z of D.ZAHLWEGE) assert.ok(z.breite > 0 && z.hoehe > 0, z.alt);
});

// ═══ Letzte A/B-Runde szs-e6-gs082 (Christian 01.11.2026) ═══════════════════════
const A_URL = 'https://qiblanco.com/pages/schlaf-zellen-schutz';

function anfrage(i, query = '') {
  // Hausfremde Adresse: die interne Liste (interner-verkehr.js) trifft sie nicht.
  const kopf = new Map([
    ['user-agent', `Mozilla/5.0 (iPhone) Besucher ${i}`],
    ['oxygen-buyer-ip', `198.51.${100 + (i % 100)}.${1 + (i % 250)}`],
  ]);
  return {method: 'GET', url: `${A_URL}${query}`, headers: {get: (k) => kopf.get(k.toLowerCase()) ?? null}};
}
const entscheideE6 = (req, env = {}) => entscheideLpExperiment(req, env, false, false, false, false, true);

test('E6: B zeigt alles wie A, nur die Stimmen stehen oben', () => {
  const a = D.teileFuer('a');
  const b = D.teileFuer('b');
  assert.equal(b.stimmenOben, true);
  assert.equal(a.stimmenOben, false);
  for (const k of Object.keys(a)) {
    if (k !== 'variante' && k !== 'stimmenOben') assert.deepEqual(b[k], a[k], k);
  }
  for (const v of ['b2', 'k50', 'k25']) assert.equal(D.teileFuer(v).stimmenOben, false, v);
  const quelle = readFileSync(new URL('./SchlafZellenSchutzApple.jsx', import.meta.url), 'utf8');
  const kopf = quelle.indexOf('<Kopf preis={qionePreis} />');
  const oben = quelle.indexOf('{t.stimmenOben ? stimmen : null}');
  const video = quelle.indexOf('{t.gitterchipVideo ?');
  assert.ok(kopf > 0 && kopf < oben && oben < video, 'Stimmen zwischen Kopf und Video');
  const unten = quelle.indexOf('{t.stimmenOben ? null : stimmen}');
  assert.ok(unten > quelle.indexOf('{t.weiter6 ?'), 'in A unverändert nach dem Labor');
});

test('E6: Schalter aus bis zum Start, kein Besucher und kein Pin kommt auf B', () => {
  assert.equal(E6_AKTIV, false);
  for (let i = 0; i < 2000; i += 1) {
    const e = entscheideLpExperiment(anfrage(i), {}, false, false, false, false);
    assert.equal(e, null, `Besucher ${i}`);
  }
  assert.equal(entscheideLpExperiment(anfrage(1, '?lp_exp=b'), {}, false, false, false, false), null);
});

test('E6: 15 % in den Eimern 30..44, A sonst; Query bleibt, Marker g', () => {
  let b = 0;
  const n = 20000;
  for (let i = 0; i < n; i += 1) {
    const req = anfrage(i, '?fbclid=abc&utm_source=meta');
    const e = entscheideE6(req);
    const kopf = req.headers;
    const eimer = besucherEimer(kopf.get('oxygen-buyer-ip'), kopf.get('user-agent'), E1.salz);
    assert.equal(Boolean(e), eimer >= 30 && eimer < 45, `Eimer ${eimer}`);
    if (e) {
      b += 1;
      assert.equal(e.ziel, `${LP_EXP_B_PFAD}?fbclid=abc&utm_source=meta&lp_m=${LP_EXP_E6_MARKER}`);
      assert.equal(e.arm, 'b');
    }
  }
  assert.ok(Math.abs(b / n - 0.15) < 0.02, `Anteil ${b / n}`);
});

test('E6: Eimer überlappen nicht, und jede Kollision schaltet E6 ab', () => {
  const arme = [[E3.eimer_ab, E3.anteil_prozent], [E4.eimer_ab, E4.anteil_prozent], [E6.eimer_ab, E6.anteil_prozent], [100 - E2.anteil_prozent, E2.anteil_prozent]];
  const belegt = new Set();
  for (const [ab, n] of arme) {
    for (let e = ab; e < ab + n; e += 1) {
      assert.ok(!belegt.has(e), `Eimer ${e} doppelt`);
      belegt.add(e);
    }
  }
  assert.equal(E6.salz, E1.salz);
  assert.equal(E6.id, 'szs-e6-gs082');
  assert.equal(experimentE6Aktiv({}, true, false), true);
  assert.equal(experimentE6Aktiv({}, false, false), false);
  assert.equal(experimentE6Aktiv({}, true, true), false, 'E1 belegt die Route');
  assert.equal(experimentE6Aktiv({LP_EXP_SZS_E6_MODE: 'off'}, true, false), false);
  assert.equal(experimentE6Aktiv({}, true, false, {...E6, eimer_ab: 20}), false, 'in K25');
  assert.equal(experimentE6Aktiv({}, true, false, {...E6, eimer_ab: 80}), false, 'in B2');
  assert.equal(experimentE6Aktiv({}, true, false, {...E6, salz: 'anders'}), false, 'fremdes Salz');
});

test('E6: Pin und Rückweg', () => {
  const pin = entscheideE6(anfrage(3, '?lp_exp=b'));
  assert.equal(pin.ziel, `${LP_EXP_B_PFAD}?lp_exp=b&lp_m=${LP_EXP_E6_MARKER}`);
  assert.equal(entscheideE6(anfrage(3, '?lp_exp=a')), null);
  assert.equal(entscheideE6(anfrage(3, '?lp_exp=b'), {LP_EXP_SZS_E6_MODE: 'off'}), null);
});

// Gerätegrenze des Urteils szs-e1-gs050 (experimente.yaml abgeschlossen[] geraetegrenze): mobil = grober Zeiger
// wie im Pixel, nicht die Breite. Der Umbau in die Apple-Fassung (PR #1140) hatte sie auf 750 px gesetzt;
// Auftrag 20261113-szs-apple-a-geraetegrenze-pointer-champion.
function mediaBloecke(css) {
  const out = [];
  const re = /@media([^{]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    let tiefe = 1;
    let i = re.lastIndex;
    while (tiefe > 0 && i < css.length) {
      if (css[i] === '{') tiefe += 1;
      else if (css[i] === '}') tiefe -= 1;
      i += 1;
    }
    out.push({bedingung: m[1].trim(), rumpf: css.slice(re.lastIndex, i - 1)});
  }
  return out;
}

test('Champion mobil nach Zeiger: lp-a-weiter-1 und fester Knopf folgen pointer coarse, nicht der Breite', () => {
  const css = readFileSync(new URL('../../../styles/szs-apple.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const bloecke = mediaBloecke(css);
  const nurMobil = bloecke.filter((b) => /\.szs-nur-mobil\b/.test(b.rumpf));
  assert.equal(nurMobil.length, 1, 'genau eine Regel für .szs-nur-mobil');
  assert.match(nurMobil[0].bedingung, /^\(pointer:\s*fine\),\s*\(pointer:\s*none\)$/);
  assert.match(nurMobil[0].rumpf, /display:\s*none/);
  const fest = bloecke.filter((b) => /\.szs-fest\s*\{[^}]*position:\s*fixed/.test(b.rumpf));
  assert.equal(fest.length, 1, 'genau eine Regel macht .szs-fest sichtbar');
  assert.match(fest[0].bedingung, /max-width:\s*749px/);
  assert.match(fest[0].bedingung, /\(pointer:\s*coarse\)/);
  assert.match(fest[0].rumpf, /body:has\(\.as-seite > \.szs-fest\) footer/, 'Fuß-Polster nur, wo die Leiste steht');
  // Arme: nur die Champion-Arme tragen die Klassen (B2 zeigt Weiter 1 immer und hat keinen festen Knopf).
  for (const v of D.VARIANTEN) {
    const t = D.teileFuer(v);
    if (v === 'b2') assert.deepEqual([t.weiter1, t.sticky], ['immer', false]);
    else assert.equal(t.sticky, true, v);
  }
});
