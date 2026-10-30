// node --test app/components/apple-seite/produktberatung/produktberatung.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KONJUNKTIV, VERBOTEN, texteVon} from '../apple-seite-logik.js';
import * as D from './produktberatung-daten.js';

const HEUTE = new URL(
  '../../campaign/ProduktberatungSeite.jsx',
  import.meta.url,
);
const APPLE = new URL('./ProduktberatungApple.jsx', import.meta.url);
/** Quelltext mit zusammengezogenem Leerraum: so liest React den JSX-Text. */
const flach = (url) => readFileSync(url, 'utf8').replace(/\s+/g, ' ');

const MARKE = 'data-fremdtext="christian-wortlaut-20261008"';

/** Christians Wortlaut aus der Apple-Fassung: die Textstücke jedes Elements mit MARKE. */
function wortlautStuecke(quelle) {
  const stuecke = [];
  let ab = 0;
  for (;;) {
    const i = quelle.indexOf(MARKE, ab);
    if (i < 0) return stuecke;
    const start = quelle.lastIndexOf('<', i);
    const tag = /^<(\w+)/.exec(quelle.slice(start))[1];
    const ende = quelle.indexOf(`</${tag}>`, i);
    const innen = quelle
      .slice(quelle.indexOf('>', i) + 1, ende)
      .replace(/\{mitMarkeR\(\s*'([^']*)',?\s*\)\}/g, '<>$1<>');
    for (const t of innen.split(/<[^>]*>/)) {
      const flach = t.replace(/\s+/g, ' ').trim();
      if (flach) stuecke.push(flach);
    }
    ab = ende;
  }
}

test('Christians Wortlaut steht Zeichen für Zeichen wie in der heutigen Fassung', () => {
  const heute = flach(HEUTE);
  const stuecke = wortlautStuecke(readFileSync(APPLE, 'utf8'));
  assert.equal(
    stuecke.length,
    8,
    'Name, Einstieg 2x, Titel, Geschichte 2x, „schon“ 2x',
  );
  for (const s of stuecke)
    assert.ok(
      heute.includes(s),
      `nicht wortgleich mit heute: „${s.slice(0, 60)}…“`,
    );
  assert.ok(
    stuecke.some((s) => s.includes('Es lag nicht an mir, sondern am E-Smog')),
    'Gründungsgeschichte vollständig',
  );
});

test('übrige Texte gleich wie heute (Ablauf, Schluss, Überschriften)', () => {
  const heute = flach(HEUTE);
  for (const s of D.ABLAUF.schritte) {
    assert.ok(heute.includes(s.titel), s.titel);
    assert.ok(heute.includes(s.satz), s.satz);
  }
  for (const t of [
    D.ABLAUF.titel,
    D.SCHLUSS.titel,
    D.SCHLUSS.text,
    D.FRAGEN_TITEL,
    D.STIMMEN_TITEL,
    D.KOPF.overline,
  ])
    assert.ok(heute.includes(t), t);
});

test('kein Preisanker und kein Konjunktiv in eigenen Texten; Christians Wortlaut ist markiert', () => {
  for (const t of texteVon(D)) {
    for (const v of VERBOTEN) assert.doesNotMatch(t, v.muster, v.grund);
    assert.doesNotMatch(t, KONJUNKTIV, t);
  }
  const apple = readFileSync(APPLE, 'utf8');
  assert.equal(
    apple.split(MARKE).length - 1,
    5,
    'Name, Einstieg (je Absatz), Geschichte, „schon“ tragen data-fremdtext',
  );
  assert.doesNotMatch(
    apple,
    /★|komma|von 5/,
    'keine Note und keine Sterne in der Apple-Fassung',
  );
});

test('pb-e1-gs107 bleibt je Arm unterscheidbar', () => {
  assert.deepEqual(D.reihenfolge('a'), ['fragen', 'ablauf', 'stimmen']);
  assert.deepEqual(D.reihenfolge('b'), ['ablauf', 'stimmen', 'fragen']);
});

test('Messpunkte der heutigen Seite bleiben, Anna ist da', () => {
  const apple = readFileSync(APPLE, 'utf8');
  for (const m of [
    'pb-kopf',
    'pb-person',
    'pb-fragen',
    'pb-ablauf',
    'pb-stimmen',
    'pb-schluss',
  ])
    assert.ok(apple.includes(`data-section="${m}"`), m);
  assert.match(apple, /<AppleAnna \/>/);
  assert.match(
    apple,
    /useProduktberatung\(b\)/,
    'Buchungsteile aus der heutigen Komponente',
  );
});
