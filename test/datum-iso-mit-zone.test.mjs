/**
 * isoMitZone(): Kalendertag -> ISO 8601 mit Zone.
 *
 * Anlass: Search Console 2026-09-13, "Zeitzone in Datum/Uhrzeit-Attribut
 * `uploadDate` fehlt" + "ungültiger Datum/Uhrzeit-Wert". Die Fälle hier sind
 * nicht ausgedacht, sondern die Werte, die am selben Tag live auf
 * qiblanco.com standen, plus die beiden Umstellungstage, an denen ein
 * einmalig berechneter Offset den falschen Kalendertag ergibt.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isoMitZone, HAUS_ZEITZONE} from '../app/lib/datum.js';

/** Die Form, die Google für uploadDate verlangt. */
const ISO_MIT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

test('die live beanstandeten Werte bekommen Uhrzeit UND Zone', () => {
  for (const roh of ['2025-10-20', '2025-10-30', '2024-08-11', '2013-09-06']) {
    const v = isoMitZone(roh);
    assert.match(v, ISO_MIT_ZONE, `${roh} -> ${v}`);
    assert.ok(v.startsWith(roh), 'der Kalendertag darf sich nicht verschieben');
  }
});

test('der Offset folgt der Sommerzeit, er ist nicht getippt', () => {
  assert.equal(isoMitZone('2025-10-20'), '2025-10-20T00:00:00+02:00');
  assert.equal(isoMitZone('2026-02-05'), '2026-02-05T00:00:00+01:00');
});

test('die zwei Umstellungstage: Mitternacht trägt noch den ALTEN Offset', () => {
  // Sommerzeit endet am 2025-10-26 um 03:00 MESZ -> 00:00 ist noch +02:00.
  assert.equal(isoMitZone('2025-10-26'), '2025-10-26T00:00:00+02:00');
  // Sommerzeit beginnt am 2025-03-30 um 02:00 MEZ -> 00:00 ist noch +01:00.
  assert.equal(isoMitZone('2025-03-30'), '2025-03-30T00:00:00+01:00');
});

test('GEGENPROBE AN DER UHR: der Zeitstempel ist wirklich Mitternacht in Berlin', () => {
  // Ohne diese Probe würde ein falscher Offset nur "irgendwie plausibel"
  // aussehen. Hier wird er zurückgerechnet.
  for (const tag of ['2025-10-20', '2026-02-05', '2025-10-26', '2025-03-30', '2026-06-01']) {
    const d = new Date(isoMitZone(tag));
    const w = new Intl.DateTimeFormat('en-CA', {
      timeZone: HAUS_ZEITZONE, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d).replace(',', '');
    assert.ok(w.startsWith(tag), `${tag}: Berliner Wanduhr sagt ${w}`);
    assert.match(w, /00:00$/, `${tag}: sollte Mitternacht sein, ist ${w}`);
  }
});

test('IDEMPOTENT: ein schon vollständiger Wert wird nicht vergröbert', () => {
  // Genau diese Werte stehen in app/data/erfahrungen-beitraege.js.
  assert.equal(isoMitZone('2021-02-12T03:23:31Z'), '2021-02-12T03:23:31Z');
  assert.equal(isoMitZone('2025-10-20T00:00:00+02:00'), '2025-10-20T00:00:00+02:00');
  assert.equal(isoMitZone(isoMitZone('2024-08-11')), isoMitZone('2024-08-11'));
});

test('KEINE ERFUNDENE GENAUIGKEIT: ein bloßes Jahr bleibt ein bloßes Jahr', () => {
  // Das Erscheinungsjahr einer Studie (datePublished "2021" auf
  // /pages/studie-darmbarriere) ist genau so genau, wie wir es wissen.
  assert.equal(isoMitZone('2021'), '2021');
  assert.equal(isoMitZone('2021-04'), '2021-04');
});

test('FAIL-SOFT: nichts kostet keine Seite', () => {
  assert.equal(isoMitZone(null), '');
  assert.equal(isoMitZone(undefined), '');
  assert.equal(isoMitZone(''), '');
});
