/**
 * Weiterlesen-Auswahl am Artikelende, hermetisch.
 *
 * Anlass: Segment s04 des Grossjobs 20260925-GROSSJOB-neue-seiten-kommen-bei-
 * google-nicht-an-indexierung-und-soll. Vorher zeigte jeder Artikel dieselben
 * drei ältesten Beiträge. Der tragende Arm ist "jeder Beitrag wird von genau
 * drei anderen verlinkt": er fällt rot, sobald die Auswahl wieder für alle
 * Artikel gleich ist (Mutant ALTE_BAUFORM unten).
 *
 * Ein grüner Test hier ist KEIN Wirkungsnachweis. Ob die Links im
 * ausgelieferten HTML stehen, misst homepage-bauer/pruefungen/
 * probe_blog_wege__20260925.py am Rand.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';

import {weiterlesenNachbarn} from '../app/lib/weiterlesen.js';

const REIHE = ['a', 'b', 'c', 'd', 'e', 'f'].map((h) => ({handle: h, title: h.toUpperCase()}));

// Die Bauform bis 2026-09-25, als Mutant: die ersten drei ausser dem aktuellen.
const ALTE_BAUFORM = (liste, aktuell) =>
  liste.filter((a) => a?.handle && a.handle !== aktuell).slice(0, 3);

function eingangsgrade(fn, liste) {
  const grad = Object.fromEntries(liste.map((a) => [a.handle, 0]));
  for (const a of liste) for (const w of fn(liste, a.handle)) grad[w.handle] += 1;
  return grad;
}

test('die drei naechsten in der Reihe, am Ende zyklisch weiter', () => {
  assert.deepEqual(weiterlesenNachbarn(REIHE, 'a').map((x) => x.handle), ['b', 'c', 'd']);
  assert.deepEqual(weiterlesenNachbarn(REIHE, 'e').map((x) => x.handle), ['f', 'a', 'b']);
  assert.deepEqual(weiterlesenNachbarn(REIHE, 'f').map((x) => x.handle), ['a', 'b', 'c']);
});

test('nie der aktuelle Beitrag, nie doppelt', () => {
  for (const a of REIHE) {
    const aus = weiterlesenNachbarn(REIHE, a.handle).map((x) => x.handle);
    assert.ok(!aus.includes(a.handle));
    assert.equal(new Set(aus).size, aus.length);
  }
});

test('jeder Beitrag wird von genau drei anderen verlinkt', () => {
  const grad = eingangsgrade(weiterlesenNachbarn, REIHE);
  assert.deepEqual(Object.values(grad), [3, 3, 3, 3, 3, 3]);
});

test('Mutant alte Bauform: derselbe Arm faellt rot', () => {
  const grad = eingangsgrade(ALTE_BAUFORM, REIHE);
  assert.notDeepEqual(Object.values(grad), [3, 3, 3, 3, 3, 3]);
  assert.equal(grad.f, 0);
});

test('kleiner Blog: weniger als drei andere, dann alle anderen', () => {
  const zwei = REIHE.slice(0, 3);
  assert.deepEqual(weiterlesenNachbarn(zwei, 'b').map((x) => x.handle), ['c', 'a']);
  assert.deepEqual(weiterlesenNachbarn(REIHE.slice(0, 1), 'a'), []);
});

test('aktueller Beitrag fehlt in der Liste: die neuesten ohne ihn', () => {
  assert.deepEqual(weiterlesenNachbarn(REIHE, 'zz').map((x) => x.handle), ['a', 'b', 'c']);
});

test('leere, fehlende und kaputte Eintraege brechen nichts', () => {
  assert.deepEqual(weiterlesenNachbarn(undefined, 'a'), []);
  assert.deepEqual(weiterlesenNachbarn([], 'a'), []);
  const kaputt = [null, {title: 'ohne'}, {handle: 'a'}, {handle: 'a'}, {handle: 'b'}];
  assert.deepEqual(weiterlesenNachbarn(kaputt, 'a').map((x) => x.handle), ['b']);
});
