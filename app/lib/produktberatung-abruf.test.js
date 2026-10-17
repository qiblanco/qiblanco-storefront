/**
 * Tests für produktberatung-abruf.server.js, node --test.
 * Repair 20261017-repair-prio1-produktberatung-termine-laden-nicht-kundenrand-
 * fehlerwache, s02.
 *
 * Mutanten, die rot werden müssen: nur ein Versuch (FRISTEN_MS auf einen
 * Eintrag), Wiederholung auch nach brauchbarer Antwort, 404 von /api/buchung
 * als flüchtig.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FRISTEN_MS,
  holeMitWiederholung,
  istFluechtig,
  termineBrauchbar,
} from './produktberatung-abruf.server.js';

const TERMINE = {termine: [{slot_start: '2026-10-22T19:00:00+02:00'}]};

/** Gefälschtes fetch: arbeitet die Liste der Antworten ab und zählt die Aufrufe. */
function holerAus(antworten) {
  const aufrufe = [];
  const holer = async (url, init) => {
    aufrufe.push({url, signal: init?.signal});
    const a = antworten[Math.min(aufrufe.length - 1, antworten.length - 1)];
    if (a === 'netz') throw new TypeError('fetch failed');
    return {status: a.status, text: async () => JSON.stringify(a.body ?? null)};
  };
  return {holer, aufrufe};
}

test('Fristen: zwei Versuche, zusammen höchstens 7 s', () => {
  assert.equal(FRISTEN_MS.length, 2);
  assert.ok(FRISTEN_MS.reduce((a, b) => a + b, 0) <= 7000);
});

test('erster Versuch scheitert (Netz), zweiter liefert Termine', async () => {
  const {holer, aufrufe} = holerAus(['netz', {status: 200, body: TERMINE}]);
  const r = await holeMitWiederholung('x/api/termine', {}, termineBrauchbar, {
    holer,
  });
  assert.equal(aufrufe.length, 2);
  assert.equal(r.versuche, 2);
  assert.ok(termineBrauchbar(r));
});

test('erster Versuch 502, zweiter liefert Termine', async () => {
  const {holer} = holerAus([{status: 502}, {status: 200, body: TERMINE}]);
  const r = await holeMitWiederholung('x', {}, termineBrauchbar, {holer});
  assert.ok(termineBrauchbar(r));
});

test('200 ohne termine-Array gilt als Fehlschlag und wird wiederholt', async () => {
  const {holer, aufrufe} = holerAus([
    {status: 200, body: {ok: true}},
    {status: 200, body: TERMINE},
  ]);
  const r = await holeMitWiederholung('x', {}, termineBrauchbar, {holer});
  assert.equal(aufrufe.length, 2);
  assert.ok(termineBrauchbar(r));
});

test('Endpunkt tot: genau zwei Versuche, dann Fehlschlag (Rückfall Fehlersatz)', async () => {
  const {holer, aufrufe} = holerAus(['netz']);
  const r = await holeMitWiederholung('x', {}, termineBrauchbar, {holer});
  assert.equal(aufrufe.length, 2);
  assert.equal(r.status, 0);
  assert.equal(termineBrauchbar(r), false);
});

test('brauchbare erste Antwort: kein zweiter Abruf', async () => {
  const {holer, aufrufe} = holerAus([{status: 200, body: TERMINE}]);
  const r = await holeMitWiederholung('x', {}, termineBrauchbar, {holer});
  assert.equal(aufrufe.length, 1);
  assert.equal(r.versuche, 1);
});

test('/api/buchung: 404 ist eine Antwort, kein Fehlschlag', async () => {
  const {holer, aufrufe} = holerAus([{status: 404, body: {ok: false}}]);
  const r = await holeMitWiederholung('x', {}, (x) => !istFluechtig(x), {
    holer,
  });
  assert.equal(aufrufe.length, 1);
  assert.equal(r.status, 404);
});

test('jeder Versuch trägt eine eigene Frist (AbortSignal)', async () => {
  const {holer, aufrufe} = holerAus(['netz']);
  await holeMitWiederholung('x', {}, termineBrauchbar, {holer});
  if (typeof AbortSignal?.timeout === 'function') {
    assert.ok(aufrufe.every((a) => a.signal instanceof AbortSignal));
    assert.notEqual(aufrufe[0].signal, aufrufe[1].signal);
  }
});
