// Leitung des Besuchers -> 360-Drehung (leitung.js, Grossjob Ladezeiten s13, M3).
// Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {leitungAus} from './leitung.js';

test('ohne API (Safari, Firefox) -> normal, wie bisher', () => {
  assert.equal(leitungAus(undefined), 'normal');
  assert.equal(leitungAus(null), 'normal');
  assert.equal(leitungAus({}), 'normal');
});

test('saveData ist ein Wunsch des Besuchers -> sparen, auch auf 4G', () => {
  assert.equal(leitungAus({saveData: true, effectiveType: '4g'}), 'sparen');
});

test('2g und slow-2g -> sparen', () => {
  assert.equal(leitungAus({effectiveType: '2g'}), 'sparen');
  assert.equal(leitungAus({effectiveType: 'slow-2g'}), 'sparen');
});

test('3g -> langsam, 4g -> normal', () => {
  assert.equal(leitungAus({effectiveType: '3g', saveData: false}), 'langsam');
  assert.equal(leitungAus({effectiveType: '4g', saveData: false}), 'normal');
});

const ohneKommentare = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const lies = (rel) => ohneKommentare(readFileSync(new URL(rel, import.meta.url), 'utf8'));

test('ImgixVideo: sparen lädt die Drehung nicht, langsam deckelt hls.js auf DPR 1', () => {
  const c = lies('./ImgixVideo.jsx');
  assert.match(c, /if \(mitErsatz && \(bevorzugtRuhe\(\) \|\| stufe === 'sparen'\)\) return;/);
  assert.match(c, /stufe === 'langsam' \? HLS_STUFENDECKEL_LANGSAM : \{\}/);
  assert.match(c, /const HLS_STUFENDECKEL_LANGSAM = \{\s*maxDevicePixelRatio: 1,\s*\};/);
});

test('Produkt360Video: sparen nimmt die Quelle zurück und bricht den Abruf ab', () => {
  const c = lies('./Produkt360Video.jsx');
  assert.match(c, /src=\{nah && !sparen \? video\.src : undefined\}/);
  assert.match(c, /if \(!el\.getAttribute\('src'\) && el\.currentSrc\) el\.load\(\);/);
  assert.match(c, /if \(!el \|\| !nah \|\| sparen\) return;/);
});
