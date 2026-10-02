/**
 * kakao-tiefe-daten.test.mjs — Vertrag der Daten hinter KakaoTiefe.jsx.
 *
 * Grossjob 20261002-GROSSJOB-kakaoseiten-mineralstoffe-dartsch-und-crystal-
 * niveau-auf-dach-und-us. Der Mineralstoff-Block ist ein Abdruck der
 * Dartsch-Auszugs-JSON auf dem Server; ob er ihr GLEICHT, prueft dort
 * crystal-cacao-node/bin/kakao-tiefe-mineralblock --pruefe. Hier steht, was
 * ohne Server pruefbar ist: Form, Gruppenregel, Sprachen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KAKAO_TIEFE_AN,
  KT_DOKUMENTE,
  KT_LOQ,
  KT_MINERALSTOFFE,
  KT_PROFIL,
  KT_SORTEN,
  KT_TEXTE,
} from '../app/components/reusables/kakao-tiefe-daten.js';

const WERT = /^(< )?\d+(\.\d+)?$/;
const zahl = (w) => Number(w.replace('< ', ''));

test('Rueckweg-Schalter ist ein Boolean', () => {
  assert.equal(typeof KAKAO_TIEFE_AN, 'boolean');
});

test('beide Sorten: dieselben 31 Elemente in derselben Reihenfolge, 14 hoch + 17 spur', () => {
  const a = KT_MINERALSTOFFE.sorten.awake;
  const c = KT_MINERALSTOFFE.sorten.create;
  assert.equal(a.length, 31);
  assert.deepEqual(a.map((e) => e.s), c.map((e) => e.s));
  for (const liste of [a, c]) {
    assert.equal(liste.filter((e) => e.g === 'hoch').length, 14);
    assert.equal(liste.filter((e) => e.g === 'spur').length, 17);
  }
});

test('Werte sind Berichts-Strings, nie Zahlen und nie gerundet umgeschrieben', () => {
  for (const sorte of ['awake', 'create']) {
    for (const e of KT_MINERALSTOFFE.sorten[sorte]) {
      assert.equal(typeof e.w, 'string', `${sorte} ${e.s}`);
      assert.match(e.w, WERT, `${sorte} ${e.s}: ${e.w}`);
      assert.ok(e.de && e.en, `${sorte} ${e.s}: Name fehlt`);
    }
  }
});

test('Gruppenregel = Bestimmungsgrenze des Berichts: hoch >= LOQ, spur < LOQ', () => {
  const loq = Number(KT_LOQ);
  for (const sorte of ['awake', 'create']) {
    for (const e of KT_MINERALSTOFFE.sorten[sorte]) {
      if (e.g === 'hoch') assert.ok(!e.w.startsWith('<') && zahl(e.w) >= loq, `${sorte} ${e.s}`);
      else assert.ok(e.w.startsWith('<') || zahl(e.w) < loq, `${sorte} ${e.s}`);
    }
  }
});

test('Quelle je Sorte ist das Dartsch-PDF dieser Sorte', () => {
  for (const sorte of ['awake', 'create']) {
    assert.match(KT_MINERALSTOFFE.quelle[sorte], new RegExp(`mineralstoffanalyse-dartsch-crystal-cacao-${sorte}-`));
    assert.ok(KT_MINERALSTOFFE.bericht[sorte].nr);
  }
});

test('Deutsch und Englisch haben dieselben Textschluessel', () => {
  const schluessel = (o, p = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v) ? schluessel(v, `${p}${k}.`) : [`${p}${k}`],
    );
  assert.deepEqual(schluessel(KT_TEXTE.de).sort(), schluessel(KT_TEXTE.en).sort());
  assert.equal(KT_TEXTE.de.einordnung.stufen.length, 4);
  assert.equal(KT_TEXTE.en.einordnung.stufen.length, 4);
});

test('keine alte Zaehlung "24" in den Texten', () => {
  const alle = JSON.stringify(KT_TEXTE);
  assert.ok(!/\b24 (Mineral|mineral)/.test(alle));
});

test('Profil und Dokumente: sechs Zeilen, drei Dokumente je Sorte', () => {
  assert.equal(KT_PROFIL.length, 6);
  for (const sorte of Object.keys(KT_SORTEN)) {
    assert.equal(KT_DOKUMENTE[sorte].length, 3);
    for (const d of KT_DOKUMENTE[sorte]) assert.match(d.url, /^https:\/\/cdn\.shopify\.com\/.+\.pdf/);
  }
});
