/**
 * Wächter: QI ALPHA A, Scrollstopper am Diamant-Video und kein langes Schwarz
 * zwischen den Bühnen (node --test, ohne Bundler). Job 20261030-update-qi-
 * alpha-seite-scrollstopper-video-schwarzraum-kuerzen-r2, Christian
 * 30.10.2026: „Scrollstopper bauen … nach 3 Sekunden … kann man erst weiter
 * scrollen“ (Z4), „nur beim ersten Mal“ (Z5), „das Video soll nicht früher
 * starten“ (Z7), „die Bereiche, wo dann komplett schwarz sind … verkürzen“ (Z3).
 * ROT VOR GRÜN: auf origin/main bd72454a fehlt the-alpha-stopper.js (Import
 * scheitert), TapFilm kennt kein `stopper`, Bühnen zeigen erst beim Anstoßen.
 * NICHT ÜBERSPRINGBAR (Job 20261031-prio2-qi-alpha-lp-ueberlappung-beheben-
 * scrollstopper-robust, Christian 31.10.2026: „im video sieht man, dass man
 * das video sehr einfach übersprigen kann“): in der Szenen-Kette hält der
 * erste Durchlauf im Fenster des Videos, nach der Lage, auch bei Schwung
 * und solange das Video lädt. ROT VOR GRÜN: auf origin/main 7bc58b3b fehlen
 * fensterHalt, schrittWeite, START_MS, figur.tapFenster.
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
  // Gesperrt nur an der Halte-Stelle: wer zurück ist, darf wieder bis zu ihr vor.
  const src = lies('app/components/campaign/the-alpha-stopper.js');
  assert.match(src, /if \(!istVorwaerts\(e, touchY0\) \|\| !e\.cancelable\) return;\s*const y = f\.scrollY;\s*if \(y >= haltY - 1\) \{\s*e\.preventDefault\(\);/);
  // Rad/Tasten knapp darüber: der Schritt endet AN der Halte-Stelle, nie erst dahinter.
  assert.match(src, /e\.type !== 'touchmove' && y \+ schrittWeite\(e, f\.innerHeight\) > haltY \+ 1\) \{\s*e\.preventDefault\(\);\s*f\.scrollTo\(0, haltY\);/);
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
  // Seit der Szenen-Kette (31.10.2026) gilt frueh() nur außerhalb der Kette.
  assert.match(p, /if \(kette \|\| !szene \|\| !s\.start \|\| !s\.vor \|\| unterkante\(s\.vor\) > 0\) return false;/);
  assert.match(p, /r\.top >= 0 && r\.bottom <= bild/);
  assert.match(p, /const vorab = !still && oben > 1 && oben < bild && frueh\(s\);/);
  // Der Ton der Bühne kommt mit dem Bild.
  assert.match(p, /s\.ton\.dispatchEvent\(new Event\('tap-akzent'\)\)/);
  assert.match(lies('app/components/campaign/TheAlphaTon.jsx'), /el\.addEventListener\('tap-akzent', vorab\)/);
});

test('Fenster-Halt: wer von oben kommt, hält im Fenster; Schwung darüber hinaus springt in die Mitte', () => {
  const fe = {von: 1056, bis: 1216};
  assert.equal(st.fensterHalt({y: 1000, ...fe, vorher: 0}), null, 'noch vor dem Fenster');
  assert.equal(st.fensterHalt({y: 1060, ...fe, vorher: 0}), 1060, 'im Fenster: wo man ist');
  assert.equal(st.fensterHalt({y: 1200, ...fe, vorher: 0}), 1136, 'hinter der Mitte: zurück zur Mitte');
  assert.equal(st.fensterHalt({y: 3800, ...fe, vorher: 900}), 1136, 'Schwung bis ans Ende: zurück ins Fenster');
  assert.equal(st.fensterHalt({y: 3800, ...fe, vorher: 3800}), null, 'neu geladen weiter unten: kein Halt');
  assert.equal(st.fensterHalt({y: 1100, von: 1100, bis: 1100, vorher: 0}), null, 'kein Fenster');
});

test('Rad, Trackpad und Tasten: der Schritt über den Fensteranfang wird abgefangen', () => {
  assert.equal(st.schrittWeite({type: 'wheel', deltaY: 120, deltaMode: 0}, 900), 120);
  assert.equal(st.schrittWeite({type: 'wheel', deltaY: 3, deltaMode: 1}, 900), 48, 'Zeilen-Modus (Firefox)');
  assert.equal(st.schrittWeite({type: 'keydown', key: 'End'}, 900), Infinity);
  assert.equal(st.schrittWeite({type: 'keydown', key: 'PageDown'}, 900), 810);
  const src = lies('app/components/campaign/the-alpha-stopper.js');
  assert.match(src, /if \(!fe \|\| y >= fe\.von \|\| y \+ schrittWeite\(e, f\.innerHeight\) < fe\.von\) return;\s*e\.preventDefault\(\);\s*halten\(fe\.von\);/);
  // Was durchrutscht (Daumen-Schwung, Bildlaufleiste, Sprung), springt sofort zurück.
  assert.match(src, /const ziel = fe \? fensterHalt\(\{y, \.\.\.fe, vorher\}\) : null;/);
  assert.match(src, /if \(Math\.abs\(f\.scrollY - haltY\) > 1\) f\.scrollTo\(0, haltY\);/);
});

test('Gehalten auch, wenn das Video noch lädt; startet es nicht, wird freigegeben', () => {
  assert.equal(st.START_MS, 4000);
  assert.equal(st.ABGELEHNT_MS, 1200);
  assert.ok(st.DECKEL_MS >= 8000);
  const src = lies('app/components/campaign/the-alpha-stopper.js');
  // Vom Browser abgelehnt (wartet auf Geste): kurzer Notausgang, über freiFrist.
  assert.match(src, /wartetGeste: Boolean\(video\.dataset\.tapWartetGeste\)/);
  assert.equal(st.freiFrist({spielt: false, gespielt: 0, wartetGeste: true}), st.ABGELEHNT_MS);
  // Wer zurückgescrollt ist, lässt das Video nicht hängen.
  assert.match(src, /const amHalt = f\.scrollY >= haltY - 2 && gezeigt\(\);\s*if \(!amHalt\) seitFortschritt = jetzt;/);
  // Der Deckel zählt nur Zeit am Halt: Hin-und-Her wartet das Video nicht weg.
  assert.match(src, /if \(amHalt\) amHaltMs \+= jetzt - vorigJetzt;/);
  assert.match(src, /: amHaltMs > DECKEL_MS/);
  assert.doesNotMatch(src, /jetzt - beginn > DECKEL_MS/);
});

test('Fenster kommt aus der Szenen-Kette: Bühne davor weicht bis Bühne danach steht', () => {
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(p, /film\.f\.tapFenster = \(\) => \{/);
  assert.match(p, /const von = Math\.ceil\(y \+ vor\.b\.getBoundingClientRect\(\)\.top - 1 \+ \(vor\.zahl \+ 1\) \* vor\.px\);/);
  assert.match(p, /const bis = Math\.floor\(y \+ nach\.getBoundingClientRect\(\)\.top - 1\);/);
});

// HÄLT, BIS DAS VIDEO WIRKLICH LÄUFT (Job 20261031-prio1-qi-alpha-lp-video-
// nicht-ueberscrollbar-3s-halt-feste-reihenfolge, Christian 31.10.2026: „nicht
// mehr gespürt, dass das Video irgendwie da 3 Sekunden anhält“). Gemessen live,
// Handy-Netz 10 Mbit/s, ein Wisch von ganz oben: Halt am Video, der Browser
// meldet das Video nach ~1,2 s „spielend“ (paused=false, readyState 2), es kommt
// aber erst 2,5–2,8 s nach dem Halt voran. Die alte Regel gab nach 2,0 s mit
// 0 s Video frei (Grund „stockt“). ROT VOR GRÜN: auf origin/main 12391d0a fehlt
// freiFrist (Import liefert undefined).
test('Ladendes Video, das schon „spielt“, aber nie vorankam: Startfenster, nicht Stock-Notausgang', () => {
  assert.equal(typeof st.freiFrist, 'function');
  assert.equal(st.freiFrist({spielt: true, gespielt: 0, wartetGeste: false}), st.START_MS,
    'spielend gemeldet, 0 s gelaufen: lädt noch');
  assert.equal(st.freiFrist({spielt: false, gespielt: 0, wartetGeste: false}), st.START_MS);
  assert.ok(st.START_MS >= 2800 + 1000, 'Startfenster deckt den gemessenen Start (2,8 s) mit Luft');
});

test('Schon gelaufen und hängt: Stock-Notausgang; vom Browser abgelehnt: kurz', () => {
  assert.equal(st.freiFrist({spielt: true, gespielt: 0.4, wartetGeste: false}), st.STILL_MS);
  assert.equal(st.freiFrist({spielt: false, gespielt: 1.2, wartetGeste: false}), st.STILL_MS);
  assert.equal(st.freiFrist({spielt: false, gespielt: 0, wartetGeste: true}), st.ABGELEHNT_MS);
  // Ein abgelehntes Video, das nach einer Geste doch spielt, lädt wieder im Startfenster.
  assert.equal(st.freiFrist({spielt: true, gespielt: 0, wartetGeste: true}), st.START_MS);
});

test('Stopper nutzt freiFrist (kein zweiter, abweichender Fristbaum im Takt)', () => {
  const quelle = lies('app/components/campaign/the-alpha-stopper.js');
  assert.match(quelle, /const frist = freiFrist\(/);
  assert.doesNotMatch(quelle, /const frist = spielt\(\)/);
});
