// Hermetische Tests für app/lib/fremd-html-bilder.js (s07 des Grossjobs
// 20260911-...-technische-auffindbarkeit). Bordmittel, KEIN Netz.
// Ausfuehren: node --test test/fremd-html-bilder.test.mjs
//
// WELCHE ARME HIER BELEGT WERDEN (Hausregel: wer einen Rot-Nachweis führt,
// nennt den Arm -- ein gruener Gesamtlauf unterscheidet Geschwisterarme nicht):
//   ARM-SETZT      bekanntes dekoratives Icon OHNE alt -> alt="" wird gesetzt
//   ARM-BESTAND  Bild MIT alt (auch nichtleerem) bleibt byte-identisch
//   ARM-OFFEN      unbekanntes Bild OHNE alt bleibt UNBERUEHRT und wird
//                  GEMELDET -- das ist der Restbericht des Einschluss-Selektors
//                  und zugleich die Zusage "nicht maschinell auffuellen"
//   ARM-FORM       Attribut-Reihenfolge und />-Form ändern nichts
//   ARM-STILLE     leere/fehlende Eingabe gibt leeres Ergebnis, nie einen Wurf
//   ARM-UNVERSEHRT ausser den eingefuegten alt="" ändert sich KEIN Byte
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEKORATIVE_ICONS,
  bilderAuszeichnen,
  fremdHtmlMitBildAuszeichnung,
} from '../app/lib/fremd-html-bilder.js';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';

test('ARM-SETZT: bekanntes dekoratives Icon ohne alt bekommt alt=""', () => {
  const roh = `<img style="float: none;" height="17" width="23" src="${CDN}/WIFI_ICON_09426b68_16x16.webp?v=1676668860">`;
  const {html, gesetzt, offen} = bilderAuszeichnen(roh);
  assert.match(html, /<img alt=""/);
  assert.equal(gesetzt.length, 1);
  assert.deepEqual(offen, []);
});

test('ARM-SETZT: alle vier Icons der Liste werden erkannt', () => {
  for (const name of DEKORATIVE_ICONS) {
    const {gesetzt} = bilderAuszeichnen(`<img src="${CDN}/${name}_480x480.webp">`);
    assert.deepEqual(gesetzt.length, 1, `nicht erkannt: ${name}`);
  }
});

test('ARM-SETZT: Größenvariante ändert nichts (Namensteil statt URL-Literal)', () => {
  for (const v of ['_16x16', '_480x480', '_1024x1024', '']) {
    const {gesetzt} = bilderAuszeichnen(`<img src="${CDN}/Molecule_Icon_1930bc3d${v}.webp?v=9">`);
    assert.equal(gesetzt.length, 1, `Variante verfehlt: ${v}`);
  }
});

test('ARM-BESTAND: vorhandenes alt bleibt unverändert, auch leeres', () => {
  for (const a of ['alt=""', 'alt="Zellgesundheit"', "alt=''"]) {
    const roh = `<img ${a} src="${CDN}/WIFI_ICON_x.webp">`;
    const {html, gesetzt} = bilderAuszeichnen(roh);
    assert.equal(html, roh, `verändert bei ${a}`);
    assert.deepEqual(gesetzt, []);
  }
});

test('ARM-OFFEN: unbekanntes Bild ohne alt bleibt unberührt UND wird gemeldet', () => {
  // Die Zusage dieses Baus: nicht maschinell auffuellen. Ein alt="" auf einem
  // Inhaltsbild wäre keine Auszeichnung, sondern eine Löschung.
  const roh = `<img src="${CDN}/kakao-herkunft-peru.jpg">`;
  const {html, gesetzt, offen} = bilderAuszeichnen(roh);
  assert.equal(html, roh);
  assert.deepEqual(gesetzt, []);
  assert.equal(offen.length, 1);
  assert.match(offen[0], /kakao-herkunft-peru/);
});

test('ARM-FORM: Attribut-Reihenfolge und selbstschließende Form ändern nichts', () => {
  const formen = [
    `<img src="${CDN}/Green_Checkmark_480x480.webp" width="21">`,
    `<img width="21" src="${CDN}/Green_Checkmark_480x480.webp"/>`,
    `<IMG SRC="${CDN}/Green_Checkmark_480x480.webp">`,
    `<img src='${CDN}/Green_Checkmark_480x480.webp'>`,
  ];
  for (const f of formen) {
    const {gesetzt, html} = bilderAuszeichnen(f);
    assert.equal(gesetzt.length, 1, `Form verfehlt: ${f}`);
    assert.match(html, /alt=""/);
  }
});

test('ARM-FREMDATTRIBUT: data-alt zählt NICHT als vorhandenes alt', () => {
  // Gegenpruefung 2026-09-12: /\balt\s*=/ trifft auch `data-alt=`, weil `-`
  // eine Wortgrenze ist. Das Bild blieb dann still ohne alt.
  const roh = `<img data-alt="x" src="${CDN}/WIFI_ICON_a_16x16.webp">`;
  const {html, gesetzt} = bilderAuszeichnen(roh);
  assert.equal(gesetzt.length, 1, 'data-alt wurde als echtes alt gelesen');
  assert.match(html, /<img alt="" data-alt="x"/);
});

test('ARM-FREMDATTRIBUT: ?alt= IN der Bild-URL zählt NICHT als alt', () => {
  const roh = `<img src="${CDN}/WIFI_ICON_a.webp?alt=de">`;
  const {gesetzt} = bilderAuszeichnen(roh);
  assert.equal(gesetzt.length, 1, 'alt= aus der Query wurde als Attribut gelesen');
});

test('ARM-FREMDATTRIBUT: die Gegenrichtung bleibt heil (echtes alt wird erkannt)', () => {
  // Positiv-Kontrolle zur Verschärfung: sie darf nicht so streng werden, dass
  // ein ECHTES alt durchrutscht und doppelt gesetzt wird.
  for (const roh of [
    `<img alt="" src="${CDN}/WIFI_ICON_a.webp">`,
    `<img\talt="Text" src="${CDN}/WIFI_ICON_a.webp">`,
    `<img\n  alt="Text" src="${CDN}/WIFI_ICON_a.webp">`,
  ]) {
    const {gesetzt, html} = bilderAuszeichnen(roh);
    assert.deepEqual(gesetzt, [], `echtes alt übersehen: ${roh}`);
    assert.equal(html, roh);
  }
});

test('ARM-TAGENDE: ein > im Attributwert beendet das Tag nicht', () => {
  // Gegenpruefung 2026-09-12: <img[^>]*> bricht am > im title ab.
  const roh = `<img title="a > b" src="${CDN}/Green_Checkmark_480x480.webp">`;
  const {html, gesetzt, offen} = bilderAuszeichnen(roh);
  assert.equal(gesetzt.length, 1, 'Tag am > im Attributwert abgeschnitten');
  assert.deepEqual(offen, []);
  assert.match(html, /<img alt="" title="a > b"/);
});

test('ARM-TAGENDE: ein unabgeschlossenes Tag wird übersprungen, nicht geraten', () => {
  const roh = `<p>davor</p><img src="${CDN}/WIFI_ICON_a.webp"`;
  const {html, gesetzt} = bilderAuszeichnen(roh);
  assert.equal(html, roh, 'am unabgeschlossenen Tag verändert');
  assert.deepEqual(gesetzt, []);
});

test('ARM-STILLE: leere und fehlende Eingabe werfen nicht', () => {
  assert.equal(fremdHtmlMitBildAuszeichnung(''), '');
  assert.equal(fremdHtmlMitBildAuszeichnung(undefined), '');
  assert.equal(fremdHtmlMitBildAuszeichnung(null), '');
});

test('ARM-UNVERSEHRT: ausser alt="" ändert sich kein Byte', () => {
  const roh = [
    '<p class="p1"><meta charset="utf-8">Text mit   und &amp; Entität</p>',
    `<ul><li><b><img style="float: none;" height="17" width="23" src="${CDN}/WIFI_ICON_a_16x16.webp?v=1">  E-Smog Schutz</b></li></ul>`,
    `<img alt="Titelseite der Publikation" src="${CDN}/studie.png">`,
  ].join('\n');
  const {html} = bilderAuszeichnen(roh);
  assert.equal(html.replace(' alt=""', ''), roh);
});

test('ARM-UNVERSEHRT: idempotent -- ein zweiter Lauf ändert nichts mehr', () => {
  const roh = `<img src="${CDN}/WIFI_ICON_a.webp"><img src="${CDN}/bohne.jpg">`;
  const einmal = fremdHtmlMitBildAuszeichnung(roh);
  assert.equal(fremdHtmlMitBildAuszeichnung(einmal), einmal);
});
