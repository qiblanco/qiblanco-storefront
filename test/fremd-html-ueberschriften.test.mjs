import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  h1Zahl,
  ueberschriftenRangKorrigiert,
  fremdHtmlMitUeberschriftenRang,
} from '../app/lib/fremd-html-ueberschriften.js';

/*
 * DER ECHTE RUMPF ZUERST. Das Fragment ist die am 2026-09-13 live von
 * /pages/support-1 abgelesene Überschrift, nicht eine nachgebaute: sie trägt
 * Klasse, Inline-Stil und ein <br>, also genau die Eigenschaften, an denen
 * eine zu naive Ersetzung danebenläge.
 */
const ECHT =
  '<h1 class="elementor-heading-title elementor-size-default" ' +
  'style="text-align: center;">Deine Meinung<br>ist wichtig!</h1>';

test('der echte Rumpf wird zur h2, Attribute und Inhalt bleiben', () => {
  const {html, herabgestuft} = ueberschriftenRangKorrigiert(ECHT, {
    h1BereitsVergeben: true,
  });
  assert.equal(herabgestuft, 1);
  assert.match(html, /^<h2 class="elementor-heading-title/);
  assert.match(html, /<\/h2>$/);
  assert.ok(html.includes('style="text-align: center;"'));
  assert.ok(html.includes('Deine Meinung<br>ist wichtig!'));
  assert.equal(h1Zahl(html), 0);
});

/*
 * DIE GEGENRICHTUNG, und sie ist der eigentliche Grund für den Parameter:
 * nimmt der Aufrufer seine h1 NICHT selbst in die Hand, darf hier nichts
 * herabgestuft werden — sonst hat die Seite am Ende null h1 statt zwei.
 */
test('ohne vergebene h1 bleibt der Rumpf unangetastet', () => {
  const {html, herabgestuft} = ueberschriftenRangKorrigiert(ECHT, {
    h1BereitsVergeben: false,
  });
  assert.equal(herabgestuft, 0);
  assert.equal(html, ECHT);
  assert.equal(h1Zahl(html), 1);
});

test('h2 bis h6 werden nicht angefasst', () => {
  const roh = '<h2>a</h2><h3 class="x">b</h3><h6>c</h6>';
  assert.equal(
    fremdHtmlMitUeberschriftenRang(roh, true),
    roh,
  );
});

test('ein erfundener Tag-Name wird nicht getroffen', () => {
  const roh = '<h1foo>a</h1foo>';
  assert.equal(h1Zahl(roh), 0);
  assert.equal(fremdHtmlMitUeberschriftenRang(roh, true), roh);
});

test('mehrere h1 werden alle herabgestuft und gezaehlt', () => {
  const roh = '<h1>a</h1><p>x</p><H1 id="z">b</H1 >';
  const {html, herabgestuft} = ueberschriftenRangKorrigiert(roh, {
    h1BereitsVergeben: true,
  });
  assert.equal(herabgestuft, 2);
  assert.equal(h1Zahl(html), 0);
  assert.ok(html.includes('<h2 id="z">'));
  assert.ok(!/<\/h1/i.test(html));
});

test('leerer und fehlender Rumpf sind kein Fehler', () => {
  assert.equal(h1Zahl(''), 0);
  assert.equal(h1Zahl(undefined), 0);
  assert.equal(ueberschriftenRangKorrigiert(undefined, {h1BereitsVergeben: true}).html, '');
  assert.equal(
    ueberschriftenRangKorrigiert(null, {h1BereitsVergeben: true}).herabgestuft,
    0,
  );
});

/*
 * Ein selbstschliessendes h1 gibt es in HTML nicht, aber der Scanner soll an
 * einem `/` im Tag nicht vorbeilaufen — sonst bliebe eine Form stehen, die
 * ein Browser trotzdem als Überschrift rendert.
 */
test('h1 mit Schraegstrich im Tag wird erkannt', () => {
  assert.equal(h1Zahl('<h1/>'), 1);
});
