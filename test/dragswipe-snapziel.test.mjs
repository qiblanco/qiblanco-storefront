/**
 * useDragSwipe.restoreSnap: Ziel = der Snap-Punkt, den CSS-Snap selbst waehlt.
 *
 * Anlass: Job 20261010-hb-dragswipe-restoresnap-offsetleft-ziel-prio35. Das
 * alte Ziel child.offsetLeft lag @1440 auf der Startseite 61 px neben dem
 * Snap-Punkt (421 statt 360), am IG-Slider mit scroll-padding 96 px
 * (188 statt 284). Ob der Slider live nur EINMAL ruckt, misst
 * homepage-bauer/pruefungen/probe_dragswipe_snap_ziel.py am Rand - nicht hier.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';

import {naechsterSnapPunkt} from '../app/components/reusables/snapZiel.js';

// Reputon @1440: Karten 340 breit, Luecke 20, Kartenkanten in scrollLeft-
// Koordinaten (Rect relativ zum Scrollport + scrollLeft).
function reihe(n, {breite = 340, luecke = 20, versatz = 0, align = 'start'} = {}) {
  return Array.from({length: n}, (_, i) => ({
    links: versatz + i * (breite + luecke),
    rechts: versatz + i * (breite + luecke) + breite,
    align,
  }));
}

const basis = {portBreite: 1200, padStart: 0, padEnd: 0, max: 3000};

test('Startseite-Fall: 471 nach dem Zug -> 360, nicht 421', () => {
  const p = naechsterSnapPunkt({...basis, scrollLeft: 471, kinder: reihe(10)});
  assert.equal(p, 360);
});

test('offsetParent-Versatz spielt keine Rolle: Kanten sind scrollport-relativ', () => {
  // Der alte Code haette 61 + 360 = 421 genommen.
  const p = naechsterSnapPunkt({...basis, scrollLeft: 400, kinder: reihe(10)});
  assert.equal(p, 360);
});

test('scroll-padding-inline-start verschiebt den Punkt (IG-Slider)', () => {
  // Karten ab 24 (Innenabstand), Padding 24 -> Punkte 0, 284, 568 ...
  const kinder = reihe(8, {breite: 264, luecke: 20, versatz: 24});
  const p = naechsterSnapPunkt({...basis, padStart: 24, scrollLeft: 188, kinder});
  assert.equal(p, 284);
  const q = naechsterSnapPunkt({...basis, padStart: 24, scrollLeft: 60, kinder});
  assert.equal(q, 0);
});

test('center und end werden wie CSS gerechnet', () => {
  const c = naechsterSnapPunkt({
    ...basis, portBreite: 400, scrollLeft: 300,
    kinder: reihe(6, {breite: 200, luecke: 0, align: 'center'}),
  });
  // Kartenmitte 500 auf Portmitte 200 -> 300
  assert.equal(c, 300);
  const e = naechsterSnapPunkt({
    ...basis, portBreite: 400, scrollLeft: 190,
    kinder: reihe(6, {breite: 200, luecke: 0, align: 'end'}),
  });
  // Kartenende 600 auf Portende 400 -> 200
  assert.equal(e, 200);
});

test('auf den Scrollbereich begrenzt (letzte Karte nicht ganz erreichbar)', () => {
  const p = naechsterSnapPunkt({...basis, max: 2400, scrollLeft: 2390, kinder: reihe(10)});
  assert.equal(p, 2400);
});

test('Karten ohne Align werden uebergangen, ganz ohne Align gilt start', () => {
  const kinder = reihe(4).map((k, i) => ({...k, align: i === 2 ? 'start' : 'none'}));
  assert.equal(naechsterSnapPunkt({...basis, scrollLeft: 0, kinder}), 720);
  const ohne = reihe(4).map((k) => ({...k, align: 'none'}));
  assert.equal(naechsterSnapPunkt({...basis, scrollLeft: 400, kinder: ohne}), 360);
});

test('keine Karte -> null', () => {
  assert.equal(naechsterSnapPunkt({...basis, scrollLeft: 0, kinder: []}), null);
});
