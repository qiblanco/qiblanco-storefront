// node --test app/components/apple-seite/produktberatung/produktberatung.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KONJUNKTIV, VERBOTEN, texteVon} from '../apple-seite-logik.js';
import * as D from './produktberatung-daten.js';

const HEUTE = new URL('../../campaign/ProduktberatungSeite.jsx', import.meta.url);
const APPLE = new URL('./ProduktberatungApple.jsx', import.meta.url);
/** Quelltext mit zusammengezogenem Leerraum: so liest React den JSX-Text. */
const flach = (url) => readFileSync(url, 'utf8').replace(/\s+/g, ' ');

test('Christians Wortlaut steht Zeichen für Zeichen wie in der heutigen Fassung', () => {
  const heute = flach(HEUTE);
  const saetze = [
    ...D.CHRISTIAN_EINSTIEG,
    ...D.CHRISTIAN_BLOCK.absaetze,
    D.CHRISTIAN_BLOCK.name,
    D.CHRISTIAN_BLOCK.titel,
    ...D.CHRISTIAN_SCHON,
  ];
  for (const s of saetze) assert.ok(heute.includes(s), `fehlt in der heutigen Fassung: „${s.slice(0, 60)}…“`);
});

test('übrige Texte gleich wie heute (Ablauf, Schluss, Überschriften)', () => {
  const heute = flach(HEUTE);
  for (const s of D.ABLAUF.schritte) {
    assert.ok(heute.includes(s.titel), s.titel);
    assert.ok(heute.includes(s.satz), s.satz);
  }
  for (const t of [D.ABLAUF.titel, D.SCHLUSS.titel, D.SCHLUSS.text, D.FRAGEN_TITEL, D.STIMMEN_TITEL, D.KOPF.overline])
    assert.ok(heute.includes(t), t);
});

test('kein Preisanker und kein Konjunktiv in eigenen Texten; Christians Wortlaut ist markiert', () => {
  const christian = new Set([...D.CHRISTIAN_EINSTIEG, ...D.CHRISTIAN_BLOCK.absaetze, ...D.CHRISTIAN_SCHON]);
  for (const t of texteVon(D)) {
    for (const v of VERBOTEN) assert.doesNotMatch(t, v.muster, v.grund);
    if (!christian.has(t)) assert.doesNotMatch(t, KONJUNKTIV, t);
  }
  const apple = readFileSync(APPLE, 'utf8');
  assert.equal(apple.match(/data-fremdtext=\{WORTLAUT\}/g)?.length, 4, 'Einstieg (je Absatz), Name, Block, „schon“ tragen data-fremdtext');
  assert.doesNotMatch(apple, /★|komma|von 5/, 'keine Note und keine Sterne in der Apple-Fassung');
});

test('pb-e1-gs107 bleibt je Arm unterscheidbar', () => {
  assert.deepEqual(D.reihenfolge('a'), ['fragen', 'ablauf', 'stimmen']);
  assert.deepEqual(D.reihenfolge('b'), ['ablauf', 'stimmen', 'fragen']);
});

test('Messpunkte der heutigen Seite bleiben, Anna ist da', () => {
  const apple = readFileSync(APPLE, 'utf8');
  for (const m of ['pb-kopf', 'pb-person', 'pb-fragen', 'pb-ablauf', 'pb-stimmen', 'pb-schluss'])
    assert.ok(apple.includes(`data-section="${m}"`), m);
  assert.match(apple, /<AppleAnna \/>/);
  assert.match(apple, /useProduktberatung\(b\)/, 'Buchungsteile aus der heutigen Komponente');
});
