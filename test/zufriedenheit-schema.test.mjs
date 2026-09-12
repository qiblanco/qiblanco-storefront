// Hermetische Tests der Zufriedenheits-Auszeichnung (Job 20260912-GROSSJOB-
// googles-ki-antwort-raet-vom-kauf-ab-was-davon-können-wir-drehen, Segment s04).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/zufriedenheit-schema.test.mjs
import test from 'node:test';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  ORG_ID_LITERAL,
  ORG_NAME,
  ERHEBER,
  zufriedenheitSchema,
  zufriedenheitJsonLdString,
} from '../app/lib/zufriedenheit-schema.js';
import {ORG_ID, ORGANISATION} from '../app/lib/entity-schema.js';

const WIDGET = readFileSync(
  new URL('../app/components/index-components/ReputonWidget.jsx', import.meta.url),
  'utf8',
);
const LIB = readFileSync(
  new URL('../app/lib/zufriedenheit-schema.js', import.meta.url),
  'utf8',
);

const LIVE = {value: 4.8, total: 440, url: 'https://search.google.com/local/reviews?placeid=X'};

// ---------------------------------------------------------------------------
// Die Naht, die der Import bewusst NICHT herstellt.
// ---------------------------------------------------------------------------

test('ORG_ID_LITERAL ist byte-gleich zur SSoT in entity-schema.js', () => {
  // Der Import dort wurde bewusst vermieden (Gate-12-Reichweite, Begründung
  // im Kopf der Lib). Dieser Test ist der Ersatz-Traeger für die Gleichheit —
  // fällt er, ist die Entitaets-Identitaet auseinandergelaufen.
  assert.equal(ORG_ID_LITERAL, ORG_ID);
});

test('ORG_NAME ist byte-gleich zu ORGANISATION.name', () => {
  assert.equal(ORG_NAME, ORGANISATION.name);
});

test('die Lib importiert entity-schema NICHT (Gate-12-Reichweite)', () => {
  // Der Verzicht ist die Entscheidung, nicht ein Versehen. Wer den Import
  // später einbaut, zieht Startseite, Kampagnen- und Produktseiten in die
  // Closure von entity-schema.js — dann soll dieser Test daran erinnern.
  assert.ok(!/from\s+['"].*entity-schema/.test(LIB));
});

// ---------------------------------------------------------------------------
// Subjekt und Gattung — der eigentliche Gegenstand des Segments.
// ---------------------------------------------------------------------------

test('der Knoten ist eine Organization, niemals ein Product', () => {
  const k = zufriedenheitSchema(LIVE);
  assert.equal(k['@type'], 'Organization');
  assert.equal(k['@id'], ORG_ID);
  assert.ok(!JSON.stringify(k).includes('"Product"'));
});

test('die Quelle ist maschinenlesbar benannt', () => {
  const k = zufriedenheitSchema(LIVE);
  assert.equal(k.aggregateRating.author.name, 'Google');
  assert.equal(k.aggregateRating.author['@type'], 'Organization');
  assert.equal(ERHEBER.name, 'Google');
});

test('der Nachprüf-Link ist der des sichtbaren Badges, kein zweiter', () => {
  const k = zufriedenheitSchema(LIVE);
  assert.equal(k.aggregateRating.url, LIVE.url);
});

test('reviewCount statt ratingCount — die Grundmenge sind Rezensionen', () => {
  const k = zufriedenheitSchema(LIVE);
  assert.equal(k.aggregateRating.reviewCount, 440);
  assert.ok(!('ratingCount' in k.aggregateRating));
});

// ---------------------------------------------------------------------------
// Kein Knoten ohne belegten Wert.
// ---------------------------------------------------------------------------

for (const [name, eingabe] of [
  ['ohne Wert', {total: 440}],
  ['Wert 0', {value: 0, total: 440}],
  ['Wert 6', {value: 6, total: 440}],
  ['Wert NaN', {value: Number.NaN, total: 440}],
  ['ohne Anzahl', {value: 4.8}],
  ['Anzahl 0', {value: 4.8, total: 0}],
  ['Anzahl unendlich', {value: 4.8, total: Number.POSITIVE_INFINITY}],
  ['gar nichts', undefined],
]) {
  test(`kein Knoten bei: ${name}`, () => {
    assert.equal(zufriedenheitSchema(eingabe), null);
    assert.equal(zufriedenheitJsonLdString(eingabe), '');
  });
}

test('ohne Nachprüf-Link entsteht kein leeres url-Feld', () => {
  const k = zufriedenheitSchema({value: 4.8, total: 440});
  assert.ok(!('url' in k.aggregateRating));
});

// ---------------------------------------------------------------------------
// Der String, der ins <script> geht.
// ---------------------------------------------------------------------------

test('der String ist gültiges JSON und identisch zum Knoten', () => {
  const s = zufriedenheitJsonLdString(LIVE);
  assert.deepEqual(JSON.parse(s.replace(/\\u003c/g, '<')), zufriedenheitSchema(LIVE));
});

test('</script> aus dem Fremdtext kann den Block nicht schließen', () => {
  const s = zufriedenheitJsonLdString({...LIVE, url: 'https://x/</script><script>böse()'});
  assert.ok(!s.includes('</script>'));
  assert.ok(s.includes('\\u003c/script'));
});

// ---------------------------------------------------------------------------
// Die Zusage der Platzierung: EIN Wert, EINE Quelle.
// ---------------------------------------------------------------------------

test('das Badge speist Anzeige und Markup aus derselben Variablen', () => {
  // Die Wertgleichheit Anzeige<->Markup ist der Grund, warum dieser Knoten
  // überhaupt zulässig ist. Sie hängt daran, dass beide `g` lesen.
  assert.match(WIDGET, /const g = useGoogleRating\(\);/);
  assert.match(WIDGET, /const zufriedenheitLd = zufriedenheitJsonLdString\(g\);/);
  assert.match(WIDGET, /aria-label=\{`\$\{g\.komma\} von 5 Sternen aus \$\{g\.total\}/);
});

test('genau EINE Aufrufstelle der Lib im ganzen app/-Baum', () => {
  // Ein zweiter Aufrufer könnte die Wertgleichheit nicht mitzusagen — die
  // Lib sagt das in ihrem Kopf zu, hier wird es gemessen.
  const {execFileSync} = require('node:child_process');
  const treffer = execFileSync('grep', [
    '-rl', 'zufriedenheitJsonLdString', 'app/',
  ], {encoding: 'utf8'})
    .split('\n')
    .filter(Boolean)
    .filter((f) => !f.endsWith('app/lib/zufriedenheit-schema.js'));
  assert.deepEqual(treffer, ['app/components/index-components/ReputonWidget.jsx']);
});
