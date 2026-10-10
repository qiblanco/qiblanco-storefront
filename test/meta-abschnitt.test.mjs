// node --test test/meta-abschnitt.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  META_ABSCHNITT_MODUS,
  erstelleErfasser,
  istLpPfad,
  seiteAusPfad,
  sichtbarGenug,
} from '../app/lib/meta-abschnitt.js';

function aufbau(modus, einwilligung) {
  const gesendet = [];
  const notiert = [];
  const e = erstelleErfasser({
    modus,
    einwilligung: () => einwilligung.wert,
    senden: (p) => gesendet.push(p),
    notieren: (n) => notiert.push(n),
  });
  return {e, gesendet, notiert};
}

test('Schalter steht auf einem bekannten Wert', () => {
  assert.ok(['aus', 'schatten', 'an'].includes(META_ABSCHNITT_MODUS));
});

test('ohne Einwilligung: 0 Ereignisse, 0 Notizen, Abschnitt bleibt ungesehen', () => {
  const ew = {wert: false};
  const {e, gesendet, notiert} = aufbau('an', ew);
  assert.equal(e.melde('lp-a-mechanismus', '/pages/x'), false);
  assert.equal(gesendet.length, 0);
  assert.equal(notiert.length, 0);
  ew.wert = true; // späte Einwilligung: derselbe Abschnitt zählt dann
  assert.equal(e.melde('lp-a-mechanismus', '/pages/x'), true);
  assert.deepEqual(gesendet, [{abschnitt: 'lp-a-mechanismus', seite: '/pages/x'}]);
});

test('an: je Abschnitt genau eines, nur abschnitt+seite', () => {
  const {e, gesendet, notiert} = aufbau('an', {wert: true});
  e.melde('a', '/pages/x');
  e.melde('a', '/pages/x');
  e.melde('b', '/pages/x');
  assert.deepEqual(gesendet, [
    {abschnitt: 'a', seite: '/pages/x'},
    {abschnitt: 'b', seite: '/pages/x'},
  ]);
  assert.equal(notiert.length, 2);
  assert.equal(notiert[0].modus, 'an');
});

test('schatten: notiert, sendet nie', () => {
  const {e, gesendet, notiert} = aufbau('schatten', {wert: true});
  e.melde('a', '/pages/x');
  assert.equal(gesendet.length, 0);
  assert.deepEqual(notiert, [{abschnitt: 'a', seite: '/pages/x', modus: 'schatten'}]);
});

test('aus und unbekannter Modus: nichts', () => {
  for (const m of ['aus', 'irgendwas', undefined]) {
    const {e, gesendet, notiert} = aufbau(m, {wert: true});
    assert.equal(e.melde('a', '/pages/x'), false);
    assert.equal(gesendet.length + notiert.length, 0);
  }
});

test('Einwilligungs-Prüfung wirft: zählt als keine Einwilligung', () => {
  const gesendet = [];
  const e = erstelleErfasser({
    modus: 'an',
    einwilligung: () => {
      throw new Error('Cookiebot fehlt');
    },
    senden: (p) => gesendet.push(p),
    notieren: () => {},
  });
  assert.equal(e.melde('a', '/pages/x'), false);
  assert.equal(gesendet.length, 0);
});

test('nur Landingpages', () => {
  assert.equal(istLpPfad('/pages/schlaf-zellen-schutz'), true);
  assert.equal(istLpPfad('/pages/schlaf-zellen-schutz/'), true);
  for (const p of ['/', '/products/qione-2-pro', '/pages', '/pages/', '/pages/a/b', '/collections/all', null]) {
    assert.equal(istLpPfad(p), false, String(p));
  }
  assert.equal(seiteAusPfad('/pages/x/'), '/pages/x');
});

test('Sichtbarkeit: halber Abschnitt oder halbe Fensterhöhe', () => {
  assert.equal(sichtbarGenug({isIntersecting: false, intersectionRatio: 1}, 900), false);
  assert.equal(sichtbarGenug({isIntersecting: true, intersectionRatio: 0.5}, 900), true);
  assert.equal(sichtbarGenug({isIntersecting: true, intersectionRatio: 0.49, intersectionRect: {height: 100}}, 900), false);
  // Abschnitt höher als das Fenster: Anteil klein, aber halbes Fenster belegt
  assert.equal(sichtbarGenug({isIntersecting: true, intersectionRatio: 0.2, intersectionRect: {height: 450}}, 900), true);
  assert.equal(sichtbarGenug({isIntersecting: true, intersectionRatio: 0.2, intersectionRect: {height: 449}, rootBounds: {height: 900}}, 0), false);
});
