/**
 * Wächter: QI ALPHA A, Scrollstopper am Diamant-Video und kein langes Schwarz
 * zwischen den Bühnen (node --test, ohne Bundler). Job 20261030-update-qi-
 * alpha-seite-scrollstopper-video-schwarzraum-kuerzen-r2, Christian
 * 30.10.2026: „Scrollstopper bauen … nach 3 Sekunden … kann man erst weiter
 * scrollen“ (Z4), „nur beim ersten Mal“ (Z5), „das Video soll nicht früher
 * starten“ (Z7), „die Bereiche, wo dann komplett schwarz sind … verkürzen“ (Z3).
 * ROT VOR GRÜN: auf origin/main bd72454a fehlt the-alpha-stopper.js (Import
 * scheitert), TapFilm kennt kein `stopper`, Bühnen zeigen erst beim Anstoßen.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const st = await import(join(WURZEL, 'app/components/campaign/the-alpha-stopper.js'));

test('3 Sekunden Video, gezählt als abgespielte Videozeit', () => {
  assert.equal(st.STOPPER_SEKUNDEN, 3);
  assert.equal(st.weiterGezaehlt(1, 2, 2.25), 1.25);
  assert.equal(st.weiterGezaehlt(1, 19.8, 0.1), 1, 'Schleife zählt nicht rückwärts');
  assert.equal(st.weiterGezaehlt(1, 2, 9), 1, 'Suchen ist keine Laufzeit');
  assert.equal(st.weiterGezaehlt(1, 2, 2), 1, 'Pause zählt nicht');
});

test('Halten nur bei laufendem Video in der Mitte, nie ein zweites Mal', () => {
  const bild = 844;
  const mitte = 0.43 * bild; // Lage beim Start, gemessen 390 x 844
  assert.equal(st.sollHalten({mitte, hoehe: 390, bild, spielt: true, verbraucht: false}), true);
  assert.equal(st.sollHalten({mitte, hoehe: 390, bild, spielt: false, verbraucht: false}), false, 'Video läuft nicht: kein Stopper');
  assert.equal(st.sollHalten({mitte, hoehe: 390, bild, spielt: true, verbraucht: true}), false, 'zweiter Durchlauf');
  assert.equal(st.sollHalten({mitte: 0.7 * bild, hoehe: 390, bild, spielt: true, verbraucht: false}), false, 'noch unten');
  assert.equal(st.sollHalten({mitte: -100, hoehe: 390, bild, spielt: true, verbraucht: false}), false, 'schon fast weg');
});

test('Halte-Stelle: wo man ist; nach schnellem Wisch sanft zurück zur Mitte', () => {
  assert.equal(st.haltePunkt({y: 2448, mitte: 363, bild: 844}), 2448);
  const y = st.haltePunkt({y: 2700, mitte: 100, bild: 844});
  assert.ok(y < 2700 && y > 2400, `zurück, aber nicht weit: ${y}`);
  assert.equal(Math.round(100 + (2700 - y)), Math.round(844 * st.MITTE_ZURUECK));
});

test('Gesperrt ist nur vorwärts, zurück geht immer', () => {
  const v = st.istVorwaerts;
  assert.equal(v({type: 'wheel', deltaY: 40}), true);
  assert.equal(v({type: 'wheel', deltaY: -40}), false);
  assert.equal(v({type: 'touchmove', touches: [{clientY: 300}]}, 400), true, 'Finger nach oben = Seite nach unten');
  assert.equal(v({type: 'touchmove', touches: [{clientY: 500}]}, 400), false);
  for (const key of ['ArrowDown', 'PageDown', 'End', ' ']) assert.equal(v({type: 'keydown', key, target: {}}), true, key);
  for (const key of ['ArrowUp', 'PageUp', 'Home']) assert.equal(v({type: 'keydown', key, target: {}}), false, key);
  assert.equal(v({type: 'keydown', key: ' ', shiftKey: true, target: {}}), false, 'Umschalt+Leer = zurück');
  assert.equal(v({type: 'keydown', key: ' ', target: {tagName: 'INPUT'}}), false, 'Eingabefeld');
});

test('Einmal je Besuch, nie ohne Bewegung, Videostart nicht angefasst', () => {
  const src = lies('app/components/campaign/the-alpha-stopper.js');
  assert.match(src, /sessionStorage/);
  assert.match(src, /prefers-reduced-motion: reduce/);
  assert.match(src, /'film'\) === 'still'/);
  assert.doesNotMatch(src, /\.play\(/, 'Der Stopper startet kein Video (Z7)');
  // Prüfer sehen, warum frei: nach 3 s Video oder über einen Notausgang.
  assert.match(src, /figur\.dataset\.tapStopperGrund = grund;/);
  assert.match(src, /\? 'video'/);
  // Die Start-Regel in TheAlphaTon.jsx steht wie auf main (Z7).
  const ton = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(ton, /if \(e\.intersectionRatio >= 0\.35 && !document\.hidden\) \{/);
  assert.match(ton, /figur\.classList\.contains\('tap-sichtbar'\)/);
});

test('Stopper nur an A (Diamant-Video), nicht an B und C', () => {
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapFilm film=\{THE_ALPHA_FILM_OHNE_TEXT\} stopper \/>/);
  assert.doesNotMatch(lies('app/components/campaign/TheAlphaVarianteB.jsx'), /stopper/);
  assert.doesNotMatch(lies('app/components/campaign/TheAlphaVarianteC.jsx'), /stopper/);
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  const film = p.slice(p.indexOf('export function TapFilm'), p.indexOf('export function TapKapitel'));
  assert.match(film, /export function TapFilm\(\{film, stopper = false\}\)/);
  assert.match(film, /data-tap-stopper=\{stopper \? '' : undefined\}/);
  assert.match(film, /tapStopper\(figurRef\.current, filmRef\.current, window\)/);
});

test('Szenen-Fassung: erste Zeile einer Bühne, sobald das Alte weg und sie ganz im Bild ist', () => {
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(p, /if \(!szene \|\| !s\.start \|\| !s\.vor \|\| unterkante\(s\.vor\) > 0\) return false;/);
  assert.match(p, /r\.top >= 0 && r\.bottom <= bild/);
  assert.match(p, /const vorab = !still && oben > 1 && oben < window\.innerHeight && frueh\(s\);/);
  // Der Ton der Bühne kommt mit dem Bild.
  assert.match(p, /s\.ton\.dispatchEvent\(new Event\('tap-akzent'\)\)/);
  assert.match(lies('app/components/campaign/TheAlphaTon.jsx'), /el\.addEventListener\('tap-akzent', vorab\)/);
});
