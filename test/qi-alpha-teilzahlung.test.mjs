/**
 * Wächter: geteilte Zahlung am Qi Alpha (node --test, ohne Bundler) —
 * Grossjob 20261027-qi-alpha-geteilte-zahlung-10000-raten-rest-sofort, s03.
 * Christian 27.10.2026 Z3: „zahle jetzt sofort … und eben 10.000 Euro bequem
 * in Raten. Also abhängig davon, was er ausgewählt hat.“
 *
 * Gemessen werden die Aufteilungsrechnung, der Schritt-1-Link, die
 * Warenkorb-Merkmale aus der Adresse, die Rabattcode-Liste und die NAHT zum
 * Wächter-Vertrag (qi-alpha-teilzahlung/config/vertrag.json): Variante,
 * Betrag, Märkte und Merkmalsnamen der Seite sind die des Vertrags.
 * ROT VOR GRÜN: auf origin/main d9860fb7 fehlt app/lib/qi-alpha-teilzahlung.js
 * (Import scheitert, alle Tests rot).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const tz = await import(join(WURZEL, 'app/lib/qi-alpha-teilzahlung.js'));
const VERTRAG_PFAD =
  process.env.QA_VERTRAG ||
  '/srv/openclaw/shared-state/qi-alpha-teilzahlung/config/vertrag.json';

test('Aufteilung: Summe minus 10.000 sofort, 10.000 in Raten (DE und AT, EUR)', () => {
  assert.deepEqual(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'DE'}), {
    gesamt: 15518,
    raten: 10000,
    sofort: 5518,
  });
  assert.deepEqual(tz.aufteilung({summe: 10639, waehrung: 'EUR', land: 'AT'}), {
    gesamt: 10639,
    raten: 10000,
    sofort: 639,
  });
});

test('Aufteilung: Cents bleiben centgenau, kein Gleitkomma-Rest', () => {
  const a = tz.aufteilung({summe: 12660.41, waehrung: 'EUR', land: 'AT'});
  assert.equal(a.sofort, 2660.41);
  const b = tz.aufteilung({summe: 10000.1, waehrung: 'EUR', land: 'DE'});
  assert.equal(b.sofort, 0.1);
});

test('Aufteilung: bis 10.000 € gibt es keine (normaler Ratenweg)', () => {
  assert.equal(tz.aufteilung({summe: 10000, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: 9999, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: 0, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: NaN, waehrung: 'EUR', land: 'DE'}), null);
});

test('Aufteilung: nur EUR-Markt DE/AT, nie CHF, USD oder ein anderes EUR-Land', () => {
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'CHF', land: 'CH'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'USD', land: 'US'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'CH'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'NL'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'CHF', land: 'DE'}), null);
  assert.equal(tz.ratenMarkt({waehrung: 'EUR', land: 'DE'}), true);
  assert.equal(tz.ratenMarkt({waehrung: 'CHF', land: 'CH'}), false);
});

test('Konfig: Format des Vertrags, Varianten als Ziffern aus der GID', () => {
  assert.equal(
    tz.konfigText({
      qiAlpha: 'gid://shopify/ProductVariant/62077673767180',
      nummer: 'gid://shopify/ProductVariant/65965789577484',
      kette: null,
    }),
    'qi-alpha=62077673767180;nummer=65965789577484;kette=-;partner=-',
  );
  assert.equal(
    tz.konfigText({qiAlpha: '1', nummer: null, kette: 'gid://shopify/ProductVariant/7', partner: 'LEVELUP5'}),
    'qi-alpha=1;nummer=-;kette=7;partner=LEVELUP5',
  );
});

test('Schritt-1-Link: genau die Ratenanteil-Variante, Menge 1, beide Merkmale', () => {
  const link = tz.teil1Link({
    vorgang: 'qa-abc123-x7k2',
    konfig: 'qi-alpha=1;nummer=-;kette=-;partner=-',
  });
  const u = new URL(link, 'https://qiblanco.com');
  assert.equal(u.pathname, `/cart/${tz.TEILZAHLUNG.variante}:1`);
  assert.equal(u.searchParams.get('_qa_vorgang'), 'qa-abc123-x7k2');
  assert.equal(u.searchParams.get('_qa_konfig'), 'qi-alpha=1;nummer=-;kette=-;partner=-');
  assert.equal(u.searchParams.get('discount'), null);
});

test('Vorgangskennung: Form, die merkmaleAusQuery annimmt', () => {
  const v = tz.vorgangsKennung(() => 0.5, 1761638400000);
  assert.match(v, /^qa-[a-z0-9]+-[a-z0-9]{4}$/);
  const zwei = tz.vorgangsKennung(() => 0.25, 1761638400000);
  assert.notEqual(v, zwei);
});

test('Merkmale aus der Adresse: nur die zwei Vertragsschlüssel, geprüft und gekappt', () => {
  const q = new URLSearchParams({
    _qa_vorgang: 'qa-abc123-x7k2',
    _qa_konfig: 'qi-alpha=1;nummer=2;kette=-;partner=-',
    _fremd: 'boese',
    _qpx_anon: 'darf-nicht-ueber-die-adresse',
  });
  assert.deepEqual(tz.merkmaleAusQuery(q), [
    {key: '_qa_vorgang', value: 'qa-abc123-x7k2'},
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=2;kette=-;partner=-'},
  ]);
  // Ungültige Form fällt weg (nicht gekürzt, nicht repariert).
  assert.deepEqual(
    tz.merkmaleAusQuery(new URLSearchParams({_qa_vorgang: 'a b<script>', _qa_konfig: 'x'.repeat(500)})),
    [],
  );
  assert.deepEqual(
    tz.merkmaleAusQuery(new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=2;kette=-;partner=-;extra=1'})),
    [],
  );
  assert.deepEqual(tz.merkmaleAusQuery(new URLSearchParams('')), []);
});

test('Merkmale: Partnercode der Sitzung ersetzt partner=-, ein gesetzter bleibt', () => {
  const q = new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=-;kette=-;partner=-'});
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['LEVELUP5']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=LEVELUP5'},
  ]);
  // Ein QA-REST-Anrechnungscode ist kein Partnercode.
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['QA-REST-1001-AB12', 'PARTNER5']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=PARTNER5'},
  ]);
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['mit leer']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=-'},
  ]);
  const gesetzt = new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=-;kette=-;partner=DNX'});
  assert.equal(tz.merkmaleAusQuery(gesetzt, {sitzungsCodes: ['LEVELUP5']})[0].value.endsWith('partner=DNX'), true);
});

test('Rabattcodes: Komma-Liste wird zu mehreren Codes, ein Code bleibt einer', () => {
  assert.deepEqual(tz.rabattcodesAusQuery(new URLSearchParams('discount=HYDROBOARD')), ['HYDROBOARD']);
  assert.deepEqual(
    tz.rabattcodesAusQuery(new URLSearchParams('discount=QA-REST-1001-AB12,LEVELUP5')),
    ['QA-REST-1001-AB12', 'LEVELUP5'],
  );
  assert.deepEqual(
    tz.rabattcodesAusQuery(new URLSearchParams('discount= A , ,A,B,C,D,E,F')),
    ['A', 'B', 'C', 'D', 'E'],
  );
  assert.deepEqual(tz.rabattcodesAusQuery(new URLSearchParams('')), []);
});

test('NAHT Vertrag: Variante, Betrag, Märkte und Merkmale der Seite = vertrag.json', () => {
  assert.ok(existsSync(VERTRAG_PFAD), `Vertrag fehlt: ${VERTRAG_PFAD}`);
  const v = JSON.parse(readFileSync(VERTRAG_PFAD, 'utf8'));
  assert.equal(tz.TEILZAHLUNG.variante, String(v.ratenanteil.variant_id));
  assert.equal(tz.TEILZAHLUNG.betrag, Number(v.ratenanteil.betrag_eur));
  assert.equal(tz.TEILZAHLUNG.waehrung, v.ratenanteil.waehrung);
  assert.deepEqual(tz.TEILZAHLUNG.maerkte, v.ratenanteil.maerkte);
  assert.deepEqual(tz.TEILZAHLUNG.merkmale, v.merkmale);
  // Die Form, die die Seite baut, liest der Wächter (parse_konfig) so.
  const k = tz.konfigText({qiAlpha: v.qi_alpha_standard_variante, nummer: null, kette: null});
  assert.equal(k.split(';').map((t) => t.split('=')[0]).join(';'), 'qi-alpha;nummer;kette;partner');
});

test('Verdrahtung: Seite zeigt Ratenzahlung statt Ratencode, cart.$lines liest Merkmale und Codes', () => {
  const seite = lies('app/components/campaign/TheAlphaShop.jsx');
  const daten = lies('app/components/campaign/the-alpha-shop-daten.js');
  assert.doesNotMatch(seite, /ratenMoeglich|RATEN\.ratenpreis|Code von Anna/);
  assert.doesNotMatch(daten, /ratenpreis: 9999/);
  assert.match(daten, /Zahle 10\.000\\u00a0€ der Gesamtsumme in Raten/);
  assert.match(seite, /TeilzahlungFenster/);
  const permalink = lies('app/routes/cart.$lines.jsx');
  assert.match(permalink, /merkmaleAusQuery\(/);
  assert.match(permalink, /rabattcodesAusQuery\(/);
  const route = lies('app/routes/products.qi-alpha.jsx');
  assert.match(route, /qi-alpha-teilzahlung\.css\?url/);
});
