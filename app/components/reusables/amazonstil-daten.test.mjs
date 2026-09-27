/*
 * Hermetischer Wächter für amazonstil-daten.js (Amazon-Stil Stufe 2, s04,
 * 27.09.2026). Aufruf: node --test app/components/reusables/amazonstil-daten.test.mjs
 *
 * WARUM DER TEST NEBEN DER DATEI LIEGT und nicht in test/: die Scope-
 * Allowlist des Deploy-Wegs gibt test/ nur namentlich frei, reusables/* als
 * Ganzes (Kopf von amazonstil-daten.js). Der Node-Test-Runner findet die
 * Datei über ihren Namen (*.test.mjs) auch hier.
 *
 * Was er bewacht: (1) die Auswahl der Kundenfragen und dass das FAQPage-
 * Schema genau eines bleibt, (2) den Preis in derselben Rechnung wie die
 * Kaufbox, (3) den Rückweg über die zwei Schalter, (4) dass jede Frage der
 * Rangliste und jede Studie des Vergleichs im Bestand existiert, (5) keine
 * gesperrten Wörter im Vergleich.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  KUNDENFRAGEN,
  VERGLEICH,
  amazonstilAn,
  ladeVergleichsPreise,
  preisAnzeige,
  ratenAnzeige,
  teileFragen,
  vergleichAn,
  vergleichSpalten,
} from './amazonstil-daten.js';
import {FAQ_QIBRACELET, FAQ_QIHOME_AIR, FAQ_QIONE_2_PRO} from '../../data/product-faqs.js';
import {faqPageJsonLdString, isSchemaSafe} from '../../lib/faq-schema.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', '..');
const SEITEN = {
  'qione-2-pro': FAQ_QIONE_2_PRO,
  qibracelet: FAQ_QIBRACELET,
  'qihome-air': FAQ_QIHOME_AIR,
};

test('Kundenfragen: oben mindestens 3, alle sauber, unten keine saubere, nichts doppelt, nichts verloren', () => {
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {oben, unten} = teileFragen(handle, items);
    assert.ok(oben.length >= 3, `${handle}: nur ${oben.length} Fragen oben`);
    assert.ok(oben.every((it) => isSchemaSafe(it)), `${handle}: ungeprüfte Antwort oben`);
    assert.ok(unten.every((it) => !isSchemaSafe(it)), `${handle}: saubere Frage unten geblieben`);
    assert.equal(oben.length + unten.length, items.length, `${handle}: Frage verloren oder doppelt`);
    for (const it of items) {
      assert.equal(Number(oben.includes(it)) + Number(unten.includes(it)), 1, `${handle}: ${it.q}`);
    }
  }
});

test('Kundenfragen: Reihenfolge nach dem Zähler (Tragen, Sauna, Preis/Raten, Material)', () => {
  assert.deepEqual(teileFragen('qione-2-pro', FAQ_QIONE_2_PRO).oben.map((it) => it.q), [
    'Kann ich den QiOne® an einer anderen Kette tragen?',
    'Darf der QiOne® in die Sauna bzw. nass werden?',
    'Wie funktioniert die Finanzierung über Klarna?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
  ]);
  assert.deepEqual(teileFragen('qibracelet', FAQ_QIBRACELET).oben.map((it) => it.q), [
    'Darf das QiBracelet® nass werden, bzw. in die Sauna?',
    'Wie funktioniert die Finanzierung über Klarna?',
    'Ist das QiBracelet® sicher für Anwender mit Allergien?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
  ]);
  assert.deepEqual(teileFragen('qihome-air', FAQ_QIHOME_AIR).oben.map((it) => it.q), [
    'Wie funktioniert die Finanzierung über Klarna?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    'Kann ich mit dem QiHome® Air reisen?',
  ]);
});

test('Schema: genau ein FAQPage je Seite, byte-gleich zum Stand vor s04', () => {
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {unten} = teileFragen(handle, items);
    // Vorher gab ProductFAQ faqPageJsonLdString(items) aus. Jetzt gibt der
    // Block oben GENAU diesen Aufruf aus (AmazonStil.jsx, Kundenfragen),
    // die FAQ unten bekommt `unten` und darf nichts mehr ausgeben.
    assert.equal(faqPageJsonLdString(unten), null, `${handle}: FAQ unten gäbe ein zweites FAQPage aus`);
    assert.notEqual(faqPageJsonLdString(items), null, `${handle}: kein Schema mehr`);
  }
  const quelle = readFileSync(join(HIER, 'AmazonStil.jsx'), 'utf8');
  assert.match(quelle, /faqPageJsonLdString\(alle\)/, 'Kundenfragen gibt das Schema nicht über die VOLLE Liste aus');
});

test('Rückweg Schalter Kundenfragen: seiten=[] -> oben leer, unten DIESELBE Liste', () => {
  const aus = {...KUNDENFRAGEN, seiten: []};
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {oben, unten} = teileFragen(handle, items, aus);
    assert.equal(oben.length, 0);
    assert.equal(unten, items, `${handle}: unten ist nicht dasselbe Array (Seite nicht byte-gleich)`);
  }
});

test('Rückweg Schalter Vergleich: geraete=[] -> keine Spalten, keine Abfrage, kein Stylesheet', async () => {
  const aus = {...VERGLEICH, geraete: []};
  assert.equal(vergleichAn(aus), false);
  assert.deepEqual(vergleichSpalten('qione-2-pro', {}, aus), []);
  let gefragt = false;
  const storefront = {query: async () => { gefragt = true; return {}; }, CacheShort: () => ({})};
  assert.equal(await ladeVergleichsPreise(storefront, aus), null);
  assert.equal(gefragt, false, 'Loader fragt trotz Schalter aus');
  for (const handle of Object.keys(SEITEN)) {
    assert.equal(amazonstilAn(handle, aus, {...KUNDENFRAGEN, seiten: []}), false);
    assert.equal(amazonstilAn(handle), true);
  }
});

test('Preis: dieselbe Rechnung wie die Kaufbox (ProductPrice), Raten wie KaufZusage', () => {
  // QiOne 2 Pro netto 913,45 -> Kaufbox "1.087,- €" (Kopf von markt-pricing.js).
  const qione = {amount: '913.45', currencyCode: 'EUR'};
  assert.equal(preisAnzeige(qione, 'qione-2-pro', 'DE'), '1.087,- €');
  assert.equal(ratenAnzeige(qione, 'qione-2-pro', 'DE'), '12 Raten à 91 €²');
  assert.equal(ratenAnzeige(qione, 'qione-2-pro', 'AT'), null, 'Raten nur im Markt DE');
  assert.equal(preisAnzeige({amount: '1383.0', currencyCode: 'USD'}, 'qione-2-pro', 'US'), '$1,383');
  assert.equal(preisAnzeige(null, 'qione-2-pro', 'DE'), null);
});

test('Spalten: eigenes Gerät zuerst, eigener Preis aus der Kaufbox, Name/Bild aus PRODUKT_TRIO', () => {
  const preise = {
    'qione-2-pro': {amount: '913.45', currencyCode: 'EUR'},
    qibracelet: {amount: '1326.05', currencyCode: 'EUR'},
    'qihome-air': {amount: '4187.39', currencyCode: 'EUR'},
  };
  const s = vergleichSpalten('qibracelet', {preise, eigenerPreis: {amount: '1000', currencyCode: 'EUR'}, land: 'DE'});
  assert.deepEqual(s.map((x) => x.handle), ['qibracelet', 'qione-2-pro', 'qihome-air']);
  assert.equal(s[0].eigenes, true);
  assert.equal(s[0].preis, '1.190,- €', 'eigenes Gerät nimmt den Kaufbox-Preis');
  assert.equal(s[1].preis, '1.087,- €');
  for (const x of s) {
    assert.ok(x.name && x.bild && x.alt, `${x.handle}: Name/Bild fehlt`);
  }
});

test('Loader: fail-soft bei Ausfall der Abfrage, Preise je Handle bei Erfolg', async () => {
  const kaputt = {query: async () => { throw new Error('netz'); }, CacheShort: () => ({})};
  const alt = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await ladeVergleichsPreise(kaputt), {});
  } finally {
    console.error = alt;
  }
  const money = (a) => ({selectedOrFirstAvailableVariant: {price: {amount: a, currencyCode: 'EUR'}}});
  const gut = {
    query: async () => ({
      qione: {handle: 'qione-2-pro', ...money('913.45')},
      bracelet: {handle: 'qibracelet', ...money('1326.05')},
      qihome: {handle: 'qihome-air', ...money('4187.39')},
    }),
    CacheShort: () => ({}),
  };
  const p = await ladeVergleichsPreise(gut);
  assert.deepEqual(Object.keys(p).sort(), ['qibracelet', 'qihome-air', 'qione-2-pro']);
});

test('Bestand: jede Frage der Rangliste steht wörtlich in product-faqs.js', () => {
  const alle = new Set([...FAQ_QIONE_2_PRO, ...FAQ_QIBRACELET, ...FAQ_QIHOME_AIR].map((it) => it.q));
  for (const t of KUNDENFRAGEN.rang) {
    for (const q of t.fragen) assert.ok(alle.has(q), `Frage nicht (mehr) im Bestand: ${q}`);
  }
});

test('Bestand: jede Studie des Vergleichs hat ihre Datei und ihre Seite', () => {
  const dir = join(APP, 'data', 'studien');
  const slugs = new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).slug),
  );
  for (const g of VERGLEICH.geraete) {
    assert.ok(g.studien.length >= 1, `${g.handle}: keine Studie`);
    for (const st of g.studien) {
      const slug = st.href.replace('/pages/', '');
      assert.ok(slugs.has(slug), `${g.handle}: Studie ${slug} nicht in data/studien`);
      assert.ok(existsSync(join(APP, 'routes', `pages.${slug}.jsx`)), `${g.handle}: Route pages.${slug} fehlt`);
    }
  }
});

test('Wortlaut: keine gesperrten Angaben im Vergleich (300 m², Stärke-Rangfolge, kohärent)', () => {
  const texte = [
    VERGLEICH.titel,
    ...Object.values(VERGLEICH.zeilen),
    ...VERGLEICH.geraete.flatMap((g) => [g.einsatz, g.material, g.wasser, ...g.studien.map((s) => s.text)]),
    KUNDENFRAGEN.titel,
  ].join('\n');
  assert.doesNotMatch(texte, /m²|m2\b|quadratmeter/i, 'Fläche in m² ist gesperrt (GL-SPR-0007)');
  assert.doesNotMatch(texte, /stärker|staerker|stärkste|besser als/i, 'kein Stärke-Vergleich');
  assert.doesNotMatch(texte, /koh(ä|ae)rent/i, 'Kanon: nicht mit "kohärent" einsteigen');
});
