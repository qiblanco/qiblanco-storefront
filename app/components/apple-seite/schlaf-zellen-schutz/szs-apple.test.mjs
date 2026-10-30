// node --test app/components/apple-seite/schlaf-zellen-schutz/szs-apple.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KONJUNKTIV, VERBOTEN, texteVon} from '../apple-seite-logik.js';
import * as D from './szs-daten.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';

const C = readFileSync(new URL('../../campaign/SchlafZellenSchutz.jsx', import.meta.url), 'utf8');
const ALLE_TEXTE = texteVon({
  KOPF: D.KOPF, VERTRAUEN: D.VERTRAUEN, WIRKPRINZIP: D.WIRKPRINZIP, EBENEN: D.EBENEN, LABOR: D.LABOR,
  MIKROSKOP: D.MIKROSKOP, STIMMEN: D.STIMMEN, VIDEOS: D.VIDEOS, GARANTIE: D.GARANTIE, GERAETE: D.GERAETE,
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
    assert.equal(t.geraete, true);
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
});
