/*
 * Hermetischer Wächter für ohne-risiko-daten.js (Auftrag
 * zs-marke-energie-schmuck-20260927-s02).
 * Aufruf: node --test app/components/reusables/ohne-risiko-daten.test.mjs
 * Bewacht: jede Aussage ist Bestand (kauf-tatsachen.js, faq-seite.js,
 * Kaufzusage, product-faqs.js), die Rückgabe hängt nicht am Spüren, beide
 * Überschriften tragen das Kundenwort, Schalter und Rückweg.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {OHNE_RISIKO, ohneRisikoAn} from './ohne-risiko-daten.js';
import {FRISTEN, IM_PREIS} from '../../data/kauf-tatsachen.js';
import {FAQ_KAUF} from '../../data/faq-seite.js';
import {FAQ_QIBRACELET} from '../../data/product-faqs.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const frage = (id) => OHNE_RISIKO.fragen.find((f) => f.id === id);
const text = (id) => frage(id).absaetze.join(' ');

test('Schalter: nur qibracelet, seiten=[] -> aus', () => {
  assert.deepEqual(OHNE_RISIKO.seiten, ['qibracelet']);
  assert.equal(ohneRisikoAn('qibracelet'), true);
  for (const h of ['qione-2-pro', 'qihome-air', 'qi-master']) assert.equal(ohneRisikoAn(h), false);
  assert.equal(ohneRisikoAn('qibracelet', {...OHNE_RISIKO, seiten: []}), false);
});

test('Überschriften: Kundenwort Elektrosmog, Rückgabe- und Raten-Stamm (Kriterium s02)', () => {
  const esmog = /elektrosmog/i;
  const rueck = /zur(?:ü|ue)ckgeb|r(?:ü|ue)ckgabe/i;
  const raten = /\braten/i;
  assert.match(OHNE_RISIKO.titel, esmog);
  assert.match(OHNE_RISIKO.titel, rueck);
  assert.match(OHNE_RISIKO.titel, raten);
  const r = frage('elektrosmog-armband-zurueckgeben').frage;
  const z = frage('elektrosmog-schutz-raten').frage;
  assert.ok(esmog.test(r) && rueck.test(r), r);
  assert.ok(esmog.test(z) && raten.test(z), z);
});

test('Rückgabe: Frage wörtlich wie die FAQ, Antwort Ja + Rücknahme-Text aus kauf-tatsachen.js', () => {
  assert.equal(frage('elektrosmog-armband-zurueckgeben').frage, FAQ_KAUF[0].q);
  const ruecknahme = FRISTEN.find((f) => f.id === 'ruecknahme').text;
  assert.equal(frage('elektrosmog-armband-zurueckgeben').absaetze[0], `Ja. ${ruecknahme}`);
  assert.ok(FAQ_KAUF[0].a.includes('zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen'));
  assert.match(text('elektrosmog-armband-zurueckgeben'), /zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen/);
});

test('Rückgabe hängt am Zeitraum, nie am Spüren (ads-Falle F-002)', () => {
  assert.doesNotMatch(text('elektrosmog-armband-zurueckgeben'), /merk|spür|spuer|fühl|wahrnehm|wirkung/i);
  assert.match(text('elektrosmog-armband-zurueckgeben'), /20 Tage/);
});

test('Raten: Staffel und Einschränkungen wie IM_PREIS, PayPal und Klarna wie die Kaufzusage', () => {
  const t = text('elektrosmog-schutz-raten').replace(/ /g, ' ');
  const bestand = IM_PREIS.find((p) => p.id === 'raten').text;
  for (const [zahl, schwelle] of [['6', '25'], ['12', '500'], ['24', '1.000']]) {
    assert.ok(bestand.includes(schwelle) && bestand.includes(zahl), `Bestand ohne ${zahl}/${schwelle}`);
    assert.match(t, new RegExp(`ab ${schwelle.replace('.', '\\.')} €`));
  }
  assert.match(t, /6 Monatsraten/);
  assert.match(t, /bis zu 24/);
  assert.match(t, /garantiert ist sie nicht/);
  assert.match(t, /deutschem Wohnsitz/);
  const kaufzusage = readFileSync(join(HIER, 'KaufZusage.jsx'), 'utf8');
  assert.ok(kaufzusage.includes('mit 0&nbsp;% Finanzierung mit PayPal und Klarna'));
  assert.match(t, /mit 0 % Finanzierung mit PayPal und Klarna/);
  // Dieselbe Staffel wie das Klarna-Akkordeon derselben Seite.
  const klarna = FAQ_QIBRACELET.find((it) => /Klarna/.test(it.q)).a;
  assert.match(klarna, /Ab 25 € Warenwert kannst du in 6 Monatsraten zahlen, ab 500 € in 12 und ab 1000 € in 24/);
});

test('Wortlaut: echte Umlaute, keine Gedankenstriche, kein „kohärent", kein Produktpreis', () => {
  const alles = [OHNE_RISIKO.titel, ...OHNE_RISIKO.fragen.flatMap((f) => [f.frage, ...f.absaetze])].join(' ');
  assert.doesNotMatch(alles, /zurueck|fuer|ueber|moeglich|waehl|pruef/i);
  assert.doesNotMatch(alles, /[–—]/);
  assert.doesNotMatch(alles, /kohärent/i);
  // Nur die Klarna-Schwellen tragen ein €-Zeichen, nie ein Preis der Seite.
  const euro = [...alles.matchAll(/([\d.]+)\s€/g)].map((m) => m[1]);
  assert.deepEqual(euro, ['25', '500', '1.000']);
});
