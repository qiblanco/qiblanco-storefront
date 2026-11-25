// node --test test/bf-pre-access-weiterleitung.test.mjs
// Pre-Access schaltet sich zum Black-Friday-Start ab (Elina EL-20261125-b4b99e96 A): feste Uhr vor und nach 26.11. 23:00Z.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  preAccessJetzt,
  preAccessTabWache,
  preAccessUmleitung,
  preAccessVorbei,
  preAccessZiel,
} from '../app/components/black-friday-2026/bf-pre-access-weiterleitung.js';
import {BF_PRESALE_ENDE} from '../app/components/black-friday-2026/bf-deals-daten.js';

const ENDE = Date.parse('2026-11-26T23:00:00Z');
const URL_DE = 'https://qiblanco.com/pages/pre-access';

test('Ende ist Fr 27.11.2026 00:00 Berlin', () => {
  assert.equal(Date.parse(BF_PRESALE_ENDE), ENDE);
});

test('vor dem Start: keine Weiterleitung (eine Sekunde davor)', () => {
  assert.equal(preAccessUmleitung(URL_DE, ENDE - 1000), null);
  assert.equal(preAccessUmleitung(URL_DE, Date.parse('2026-11-25T12:00:00Z')), null);
  assert.equal(preAccessVorbei(ENDE - 1), false);
});

test('ab dem Start: 301 auf bf-deals, no-store', () => {
  const um = preAccessUmleitung(URL_DE, ENDE);
  assert.deepEqual(um, {
    pfad: '/pages/bf-deals',
    status: 301,
    headers: {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow'},
  });
  assert.equal(preAccessUmleitung(URL_DE + '-b', Date.parse('2026-12-10T00:00:00Z')).pfad, '/pages/bf-deals');
});

test('Parameter der Anzeige kommen mit', () => {
  const um = preAccessUmleitung(URL_DE + '?utm_source=facebook&utm_medium=paid&fbclid=AbC_1&el=x%20y', ENDE + 5);
  assert.equal(um.pfad, '/pages/bf-deals?utm_source=facebook&utm_medium=paid&fbclid=AbC_1&el=x%20y');
});

test('Vorschau-Zeit ?pab_jetzt= gilt in beide Richtungen', () => {
  const vorher = Date.parse('2026-11-25T06:00:00Z');
  const um = preAccessUmleitung(URL_DE + '?pab_jetzt=2026-11-26T23:00:00Z', vorher);
  assert.equal(um.pfad, '/pages/bf-deals?pab_jetzt=2026-11-26T23:00:00Z');
  assert.equal(preAccessUmleitung(URL_DE + '?pab_jetzt=2026-11-26T22:59:59Z', vorher), null);
  assert.equal(preAccessUmleitung(URL_DE + '?pab_jetzt=kaputt', vorher), null);
  assert.equal(preAccessJetzt('?pab_jetzt=kaputt', 7), 7);
});

test('Ziel ohne Parameter hat kein Fragezeichen', () => {
  assert.equal(preAccessZiel(''), '/pages/bf-deals');
  assert.equal(preAccessZiel('?'), '/pages/bf-deals');
  assert.equal(preAccessZiel('a=1'), '/pages/bf-deals?a=1');
});

function fenster(suche) {
  const f = {
    sprung: null,
    zeitgeber: [],
    zuhoerer: {},
    location: {search: suche, replace: (z) => (f.sprung = z)},
    setTimeout: (fn, ms) => f.zeitgeber.push({fn, ms}) - 1,
    clearTimeout: () => {},
    document: {
      visibilityState: 'visible',
      addEventListener: (n, fn) => (f.zuhoerer[n] = fn),
      removeEventListener: (n) => delete f.zuhoerer[n],
    },
  };
  return f;
}

test('offener Tab nach dem Start springt sofort (Vorschau-Zeit)', () => {
  const f = fenster('?pab_jetzt=2026-11-27T00:30:00Z&utm_source=ig');
  preAccessTabWache(f);
  assert.equal(f.sprung, '/pages/bf-deals?pab_jetzt=2026-11-27T00:30:00Z&utm_source=ig');
});

test('offener Tab vor dem Start wartet bis 23:00Z und springt dann', () => {
  const f = fenster('?pab_jetzt=2026-11-26T22:59:00Z');
  const weg = preAccessTabWache(f);
  assert.equal(f.sprung, null);
  assert.equal(f.zeitgeber.length, 1);
  const ms = f.zeitgeber[0].ms;
  assert.ok(ms > 59000 && ms < 61500, `Wartezeit ${ms}`);
  assert.ok(typeof f.zuhoerer.visibilitychange === 'function');
  weg();
  assert.equal(f.zuhoerer.visibilitychange, undefined);
});

test('ohne Fenster (Server) tut die Tab-Wache nichts', () => {
  assert.equal(typeof preAccessTabWache(null), 'function');
});
