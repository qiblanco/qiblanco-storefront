// Produktnamen nie trennen (Job 20261122-prio1-shop-design-header-...): reine Funktion.
import test from 'node:test';
import assert from 'node:assert/strict';
import {schuetze, nachMarke} from '../app/components/reusables/produktnamen-umbruch.js';

const NB = ' ';
test('QiOne-Namen bleiben zusammen', () => {
  assert.equal(schuetze('wie der QiOne® 1.'), `wie der QiOne®${NB}1.`);
  assert.equal(schuetze('Mit dem QiOne® 2 Pro hielt'), `Mit dem QiOne®${NB}2${NB}Pro hielt`);
  assert.equal(schuetze('QiOne 2'), `QiOne${NB}2`);
});
test('Qi Alpha, QiHome Air, Zahl+Einheit', () => {
  assert.equal(schuetze('der Qi Alpha® ist'), `der Qi${NB}Alpha® ist`);
  assert.equal(schuetze('QiHome Air hilft'), `QiHome${NB}Air hilft`);
  assert.equal(schuetze('fiel auf 60,5 Prozent.'), `fiel auf 60,5${NB}Prozent.`);
  assert.equal(schuetze('20 Tage testen'), `20${NB}Tage testen`);
  assert.equal(schuetze('8 x so viel'), `8${NB}x so viel`);
});
test('keine falschen Treffer und idempotent', () => {
  assert.equal(schuetze('5 Gründe'), '5 Gründe');
  assert.equal(schuetze('2 mehr'), '2 mehr');
  assert.equal(schuetze('20 Tagesgeld'), '20 Tagesgeld');
  const einmal = schuetze('QiOne® 2 Pro und 20 Tage');
  assert.equal(schuetze(einmal), einmal);
});
test('Text hinter abgesetztem ®', () => {
  assert.equal(nachMarke(' 1.'), `${NB}1.`);
  assert.equal(nachMarke(' 2 Pro hielt'), `${NB}2${NB}Pro hielt`);
  assert.equal(nachMarke(' Air'), `${NB}Air`);
  assert.equal(nachMarke(' hat'), ' hat');
});
