/**
 * Wächter: SCROLLGEFÜHL WIE APPLE auf Variante C (/pages/Qi-Alpha-B), node
 * --test ohne Bundler. Job 20261027-qi-alpha-c-scrollgefuehl-apple-iphone-18-
 * pro, Christian 27.10.2026: „muss sich vom scrollgeüfhl so anfühlen wie die
 * https://www.apple.com/iphone-18-pro/“.
 *  - die Rechenregeln des Treibers (Ausblendung am Bühnenende, Wörter folgen
 *    dem Finger, Film-Leinwand, Seitenband-Zoom) stimmen an den Rändern,
 *  - der Treiber hängt nur an C und läuft nie ohne Bewegung,
 *  - CSS und Treiber nennen denselben Ausblendweg (35svh = 0,35),
 *  - A und B bleiben unberührt.
 * ROT VOR GRÜN: auf origin/main 1454ff89 fehlt the-alpha-c-scroll.js, C
 * bindet keinen Treiber ein und hat keine Film-Bühne.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const s = await import(join(WURZEL, 'app/components/campaign/the-alpha-c-scroll.js'));

test('Ausblendung: 0 solange die Bühne steht, 1 am Ende der Laufbahn', () => {
  // Bühne 2000 px, stehendes Bild 800 px, Ausblendweg 280 px: Laufbahn 1200.
  assert.equal(s.ausblendung(100, 2000, 800, 280), 0); // noch nicht da
  assert.equal(s.ausblendung(-900, 2000, 800, 280), 0); // steht, Wörter bauen sich auf
  assert.equal(s.ausblendung(-920, 2000, 800, 280), 0); // Beginn der Ausblendung
  assert.equal(s.ausblendung(-1060, 2000, 800, 280), 0.5);
  assert.equal(s.ausblendung(-1200, 2000, 800, 280), 1);
  assert.equal(s.ausblendung(-1500, 2000, 800, 280), 1);
  assert.equal(s.ausblendung(-1060, 2000, 800, 0), 0); // ohne Weg nie ausblenden
});

test('Wörter folgen dem Finger und decken sich mit der Zählung von useTapFilm', () => {
  assert.equal(s.schrittFortschritt(50, 40, 1), 0); // vor dem Stillstand: nichts
  assert.equal(s.schrittFortschritt(0, 40, 1), 1);
  assert.equal(s.schrittFortschritt(-60, 40, 1), 2.5);
  // useTapFilm zeigt floor(f) Schritte ganz; hier steht Schritt floor(f) halb.
  assert.equal(s.schrittDeckung(2.5, 1), 1);
  assert.equal(s.schrittDeckung(2.5, 2), 0.5);
  assert.equal(s.schrittDeckung(2.5, 3), 0);
});

test('Film-Leinwand öffnet sich von 86 % auf volle Größe, Seitenband zoomt im Rahmen', () => {
  assert.deepEqual(s.filmZustand(0), {deckung: 0, skala: 0.86});
  assert.equal(s.filmZustand(s.TAC_SZENE.filmEin).deckung, 1);
  assert.equal(s.filmZustand(s.TAC_SZENE.filmZoom).skala, 1);
  assert.equal(s.filmZustand(1).skala, 1);
  // Seitenband: unten am Bildschirm 108 %, oben angekommen 100 %, nie kleiner.
  assert.equal(s.bandSkala(800, 200, 800), 1.08);
  assert.equal(s.bandSkala(-200, 200, 800), 1);
  assert.ok(s.bandSkala(300, 200, 800) > 1 && s.bandSkala(300, 200, 800) < 1.08);
});

test('Treiber nur an C, nie ohne Bewegung, nur opacity und transform', () => {
  const c = lies('app/components/campaign/TheAlphaVarianteC.jsx');
  assert.match(c, /from '~\/components\/campaign\/the-alpha-c-scroll'/);
  assert.match(c, /<TacScrollFilm \/>/);
  assert.match(c, /className="tac-film-buehne"/);
  for (const f of ['app/components/campaign/TheAlpha.jsx', 'app/components/campaign/TheAlphaVarianteB.jsx',
    'app/components/campaign/TheAlphaPremium.jsx']) {
    assert.doesNotMatch(lies(f), /the-alpha-c-scroll|tacScrollFilm|tac-film-buehne/, f);
  }
  const t = lies('app/components/campaign/the-alpha-c-scroll.js');
  assert.match(t, /prefers-reduced-motion: reduce/);
  assert.match(t, /'film'\) === 'still'/);
  assert.match(t, /passive: true/);
  // Geschrieben wird nur Deckung und Größe (Compositor), keine Lage.
  const schreibt = [...t.matchAll(/\.style\.(\w+)\s*=/g)].map((m) => m[1]);
  assert.ok(schreibt.length > 0);
  assert.deepEqual([...new Set(schreibt)].sort(), ['opacity', 'transform']);
  const a = s.tacScrollFilm(null);
  assert.equal(a, undefined);
});

test('CSS: alles im Scope von C, Ausblendweg wie im Treiber, Ruhe ohne Bewegung', () => {
  const css = lies('app/styles/the-alpha-variante-c.css');
  const kopf = css.indexOf('Scrollgefühl wie Apple');
  assert.ok(kopf > 0);
  const teil = css.slice(css.indexOf('*/', kopf) + 2);
  // Jeder Selektor des neuen Teils hängt an der Wurzel von C.
  const selektoren = teil
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}')
    .map((b) => b.split('{')[0].trim())
    .filter((x) => x && !x.startsWith('@media'))
    .flatMap((x) => x.split(',').map((y) => y.replace(/^@media[^{]*\{/, '').trim()))
    .filter(Boolean);
  assert.ok(selektoren.length > 10);
  for (const sel of selektoren) {
    assert.match(sel, /^\.tap-seite\[data-the-alpha-premium='c'\]/, sel);
  }
  assert.match(teil, /--tac-aus: 35svh;/);
  assert.equal(s.TAC_SZENE.aus, 0.35);
  // Ohne Bewegung keine stehenden Bühnen (reduced motion und ?film=still).
  assert.match(teil, /prefers-reduced-motion: reduce[\s\S]*\.tac-film-buehne \{\s*height: auto;/);
  assert.match(teil, /\.tap-still \.tac-film-buehne \{\s*height: auto;/);
  // Kein Hereinschieben (Christian Z283–Z285): keine Verschiebung im Teil.
  assert.doesNotMatch(teil, /translate/);
});
