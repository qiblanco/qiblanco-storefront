/**
 * Wächter: QI ALPHA A, Einrasten an jeder Einheit (node --test, ohne
 * Bundler). Job 20261101-prio1-qi-alpha-lp-sanfte-stopper-jede-einheit-
 * scroll-snap, Christian 01.11.2026: „wenn ich jetzt einen ganz langen Wisch
 * mache, dass er auf jeden Fall da anhält und ich einen neuen Wisch ansetzen
 * muss“, „Video-Stopper … den haben wir“.
 * ROT VOR GRÜN: auf origin/main 643388b4 fehlt the-alpha-einrasten.js
 * (Import scheitert), useTapFilm bindet kein Einrasten, die Quellzeile trägt
 * kein data-tap-rast.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const ra = await import(join(WURZEL, 'app/components/campaign/the-alpha-einrasten.js'));

// Gleiche Rechnung wie useTapFilm (zeichnen): Schritte an, Bühne weicht.
const an = ({oben, px, start}, y) => start + Math.floor((1 - (oben - y)) / px);
const weicht = ({oben, px, zahl}, y) => oben - y <= 1 && Math.floor((1 - (oben - y)) / px) >= zahl + 1;

test('Raststelle: die Einheit steht ganz da, die Bühne weicht noch nicht', () => {
  // Kapitel am Handy: Kopf + drei Zeilen, Zeilen-Takt 96 px, start 1, --tap-schritte 3
  const kap = {oben: 2000, px: 96, schritte: 4, start: 1, zahl: 3};
  const [s] = ra.bühnenRast(kap);
  assert.equal(an(kap, s), 4, 'alle vier Schritte an');
  assert.equal(weicht(kap, s), false, 'Bühne weicht noch nicht');
  assert.equal(an(kap, s - 49), 3, 'knapp davor fehlt die letzte Zeile');
  // Bilder: zwei Karten, Bild-Takt 160 px, start 1, --tap-schritte 1
  const bil = {oben: 3000, px: 160, schritte: 2, start: 1, zahl: 1};
  const [b] = ra.bühnenRast(bil);
  assert.equal(an(bil, b), 2);
  assert.equal(weicht(bil, b), false);
  // Seitenband: ein Bild, start 1, --tap-schritte 0
  const band = {oben: 4000, px: 160, schritte: 1, start: 1, zahl: 0};
  const [m] = ra.bühnenRast(band);
  assert.equal(an(band, m), 1);
  assert.equal(weicht(band, m), false);
  // Titel: Unterzeile als ein Schritt, start 0, --tap-schritte 1
  const tit = {oben: 0, px: 96, schritte: 1, start: 0, zahl: 1};
  const [t] = ra.bühnenRast(tit);
  assert.equal(an(tit, t), 1);
  assert.equal(weicht(tit, t), false);
});

test('Definition und Google AI sind zwei Einheiten', () => {
  // Wörterbuch: Kopf, Punkt 1, Punkt 2, Quelle; Absatz-Takt 160 px, start 1
  const wb = {oben: 500, px: 160, schritte: 4, start: 1, zahl: 3, extra: [3]};
  const [def, ga] = ra.bühnenRast(wb);
  assert.equal(an(wb, def), 3, 'Definition ganz, Quelle noch nicht');
  assert.equal(an(wb, ga), 4, 'Quelle Google AI da');
  assert.equal(weicht(wb, ga), false);
  assert.ok(ga - def === 160);
});

test('Raststelle nie hinter dem Seitenende', () => {
  const ende = {oben: 3000, px: 96, schritte: 4, start: 1, max: 3290};
  assert.deepEqual(ra.bühnenRast(ende), [3290]);
});

test('Ein Wisch kommt bis zur nächsten Raststelle vor ihm, nicht weiter', () => {
  const st = [143, 559, 719, 1500];
  assert.equal(ra.naechsteRast(st, 0), 143);
  assert.equal(ra.naechsteRast(st, 143), 559, 'von der Raststelle aus: die nächste');
  assert.equal(ra.naechsteRast(st, 142), 559, 'knapp davor zählt als dort');
  assert.equal(ra.naechsteRast(st, 600), 719);
  assert.equal(ra.naechsteRast(st, 1500), null, 'nach der letzten: frei');
});

test('Neuer Rad-Wisch erst nach einer Pause; Schrittweiten', () => {
  assert.equal(ra.neuerRadWisch(1000, null), true);
  assert.equal(ra.neuerRadWisch(1030, 1000), false, 'Trackpad-Schwung bleibt ein Wisch');
  assert.equal(ra.neuerRadWisch(1300, 1000), true);
  assert.equal(ra.schritt({type: 'wheel', deltaY: 3, deltaMode: 1}, 900), 48);
  assert.equal(ra.schritt({type: 'keydown', key: 'ArrowDown'}, 900), 40);
  assert.equal(ra.schritt({type: 'keydown', key: 'PageDown'}, 900), 810);
});

test('Verdrahtet: Szenen-Kette bindet das Einrasten, Video-Stopper unverändert', () => {
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(p, /tapEinrasten\(raststellen, window\)/);
  assert.match(p, /if \(kette && new URLSearchParams\(window\.location\.search\)\.get\('rast'\) !== 'aus'\)/);
  assert.match(p, /className="tap-wb-quelle" data-tap-schritt="" data-tap-rast=""/);
  const css = lies('app/styles/the-alpha-premium.css');
  assert.match(css, /html\[data-tap-rast-halt\] \{\s*overflow: hidden;/);
  // Das Einrasten schreibt nie html.style.overflow (das gehört dem Video-Stopper).
  const e = lies('app/components/campaign/the-alpha-einrasten.js');
  assert.doesNotMatch(e, /style\.overflow/);
  assert.match(e, /data-tap-stopper-stand="hält"/, 'hält der Video-Stopper, regelt er allein');
});
