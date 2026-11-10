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
    aufrufe.push({url, signal: init?.signal, headers: init?.headers});
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

test('jeder Versuch nennt dem Endpunkt seine Nummer (X-PB-Versuch), Accept bleibt', async () => {
  const {holer, aufrufe} = holerAus(['netz']);
  await holeMitWiederholung(
    'x',
    {headers: {Accept: 'application/json'}},
    termineBrauchbar,
    {holer},
  );
  assert.deepEqual(
    aufrufe.map((a) => a.headers['X-PB-Versuch']),
    ['1', '2'],
  );
  assert.ok(aufrufe.every((a) => a.headers.Accept === 'application/json'));
});

// ─── Messfixtur des Formate-Prüfers (Job 20261110-gate12-messfixtur-produktberatung-termine) ───
// Mutanten, die rot werden müssen: istMessfixtur ohne Host-Prüfung (Kunde mit
// Kopf sieht Fixtur), Fixtur-Termine vor jetzt + Buchungsschluss (Abdaten
// leert die Liste), Loader ruft /api/termine trotz Kopf, Browser nimmt Date.now().
import {readFileSync} from 'node:fs';
import {
  istMessfixtur,
  messfixturTermine,
  PB_MESSFIXTUR_JETZT,
  PB_MESSFIXTUR_NAME,
  PB_MESSFIXTUR_SCHLUSS_MIN,
  PB_MESSFIXTUR_ZONE,
} from './produktberatung-abruf.server.js';
import {istMessfixtur as istMessfixturLive} from './coming-home-live.server.js';

const KOPF = 'x-hbfmt-messfixtur';
const anfrage = (url, kopf) =>
  new Request(url, {headers: kopf ? {[KOPF]: kopf} : {}});

test('Messfixtur: dieselbe Funktion wie /pages/live (gemeinsam, nicht kopiert)', () => {
  assert.equal(istMessfixtur, istMessfixturLive);
});

test('Messfixtur: nur Kopf 1 an der lokalen Bank', () => {
  assert.equal(
    istMessfixtur(anfrage('http://localhost:3000/pages/produktberatung', '1')),
    true,
  );
  assert.equal(
    istMessfixtur(
      anfrage('http://127.0.0.1:3000/pages/produktberatung-b', '1'),
    ),
    true,
  );
  assert.equal(
    istMessfixtur(anfrage('http://localhost:3000/pages/produktberatung')),
    false,
  );
  assert.equal(
    istMessfixtur(anfrage('http://localhost:3000/pages/produktberatung', '0')),
    false,
  );
});

test('Messfixtur NEGATIV-KONTROLLE: Host nicht localhost -> echte Termine', () => {
  assert.equal(
    istMessfixtur(anfrage('https://qiblanco.com/pages/produktberatung', '1')),
    false,
  );
  assert.equal(
    istMessfixtur(anfrage('https://qiblanco.com/pages/produktberatung-b', '1')),
    false,
  );
  assert.equal(
    istMessfixtur(
      anfrage('https://localhost.qiblanco.com/pages/produktberatung', '1'),
    ),
    false,
  );
});

test('Messfixtur: feste Termine in der Form von /api/termine, alle noch buchbar', () => {
  const a = messfixturTermine();
  const b = messfixturTermine();
  assert.deepEqual(a, b);
  assert.notEqual(a.termine, b.termine);
  assert.equal(a.termine.length, 9);
  assert.equal(new Set(a.termine.map((t) => t.datum)).size, 3);
  assert.equal(a.jetzt, PB_MESSFIXTUR_JETZT);
  assert.equal(a.buchungMoeglich, true);
  assert.equal(a.buchungsschlussMin, PB_MESSFIXTUR_SCHLUSS_MIN);
  assert.ok(termineBrauchbar({status: 200, body: {termine: a.termine}}));
  const grenze = Date.parse(a.jetzt) + a.buchungsschlussMin * 60000;
  for (const t of a.termine) {
    assert.deepEqual(Object.keys(t).sort(), [
      'datum',
      'slot_ende',
      'slot_start',
      'utc',
      'zeit',
    ]);
    assert.equal(Date.parse(t.slot_start), Date.parse(t.utc), t.slot_start);
    assert.equal(
      Date.parse(t.slot_ende) - Date.parse(t.slot_start),
      20 * 60000,
    );
    assert.equal(t.slot_start.slice(0, 10), t.datum);
    assert.equal(t.slot_start.slice(11, 16), t.zeit);
    assert.equal(new Date(t.utc).getUTCDay(), 4, 'Donnerstag');
    assert.ok(Date.parse(t.utc) > grenze, `${t.utc} würde abgedatet`);
  }
  assert.equal(PB_MESSFIXTUR_NAME, 'produktberatung');
  assert.equal(PB_MESSFIXTUR_ZONE, 'Europe/Berlin');
});

test('Messfixtur: Loader nimmt die Fixtur vor /api/termine, persönliche Aufrufe bleiben', () => {
  const route = readFileSync(
    new URL('../routes/pages.produktberatung.jsx', import.meta.url),
    'utf8',
  );
  const mess = route.indexOf('if (mess) {');
  const abruf = route.indexOf('`${api}/api/termine`');
  assert.ok(mess > 0 && abruf > mess, 'Fixtur-Zweig steht vor dem Abruf');
  assert.match(
    route,
    /const mess =\s*istMessfixtur\(request\) &&\s*!PERSOENLICH\.some/,
  );
  assert.match(route, /const exp =\s*!mess &&/);
  assert.match(
    route,
    /messfixtur: PB_MESSFIXTUR_NAME,\s*messfixturZone: PB_MESSFIXTUR_ZONE,/,
  );
});

test('Messfixtur: Browser-Uhr und Zone fest, Marker an den Termin-Bereichen', () => {
  const seite = readFileSync(
    new URL('../components/campaign/ProduktberatungSeite.jsx', import.meta.url),
    'utf8',
  );
  assert.match(
    seite,
    /const fest = roh\.messfixtur \? Date\.parse\(roh\.jetzt\) : null;/,
  );
  assert.match(
    seite,
    /const zone = fest != null \? roh\.messfixturZone \|\| '' : zoneBrowser;/,
  );
  assert.match(
    seite,
    /const jetzt = fest != null && Number\.isFinite\(fest\) \? fest : jetztBrowser;/,
  );
  const marker =
    seite.match(/data-messfixtur=\{daten\.messfixtur \|\| undefined\}/g) || [];
  assert.equal(marker.length, 4, 'alle vier Zustände des Termin-Bereichs');
  assert.match(
    seite,
    /className="pb__naechster" data-messfixtur=\{messfixtur \|\| undefined\}/,
  );
});
