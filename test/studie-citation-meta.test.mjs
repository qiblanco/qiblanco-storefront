// Hermetische Tests der citation_*-Metatags und der about-Produktreferenz
// (Hypothese GS-203, Auftrag km-entw-hebel-umsetzen-seo-top3-zwei-qibracelet-de-gs-203-20261025).
// Ausfuehren: node --test test/studie-citation-meta.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {citationMeta, studieSchema} from '../app/lib/studien-schema.js';

// Wie entitaet-eeat.test.mjs: die JSON-Datei selbst lesen statt die Registry
// (deren JSON-Import lehnt `node --test` ohne Import-Attribut ab).
const E0003 = JSON.parse(
  readFileSync(new URL('../app/data/studien/e0003.json', import.meta.url), 'utf8'),
);
const ROUTE = readFileSync(
  new URL('../app/routes/pages.studie-oxidativer-stress.jsx', import.meta.url),
  'utf8',
);
const wert = (tags, name) => tags.filter((t) => t.name === name).map((t) => t.content);

test('e0003 traegt alle citation_*-Tags mit den Werten der Originalarbeit', () => {
  const t = citationMeta(E0003);
  assert.deepEqual(wert(t, 'citation_title'), [
    'Protective Effect of the QiBracelet® Against Oxidative Stress',
  ]);
  assert.deepEqual(wert(t, 'citation_author'), ['Dartsch, Peter C.']);
  assert.deepEqual(wert(t, 'citation_journal_title'), ['Applied Cell Biology']);
  assert.deepEqual(wert(t, 'citation_volume'), ['12']);
  assert.deepEqual(wert(t, 'citation_issue'), ['1']);
  assert.deepEqual(wert(t, 'citation_firstpage'), ['1']);
  assert.deepEqual(wert(t, 'citation_lastpage'), ['6']);
  assert.deepEqual(wert(t, 'citation_publication_date'), ['2024/01/12']);
  assert.deepEqual(wert(t, 'citation_doi'), ['10.53043/2320-1991.acb12001']);
});

test('fehlende Eckdaten erzeugen keinen geratenen Tag', () => {
  const t = citationMeta({eckdaten: {titelOriginal: 'X', band: 'Sonderheft', veroeffentlicht: '2024'}});
  assert.deepEqual(wert(t, 'citation_volume'), []);
  assert.deepEqual(wert(t, 'citation_doi'), []);
  assert.deepEqual(wert(t, 'citation_publication_date'), []);
  assert.deepEqual(wert(t, 'citation_title'), ['X']);
});

test('about traegt die Produktreferenz nur mit produktPfad', () => {
  const art = (o) =>
    studieSchema(E0003, o)['@graph'].find((n) => n['@type'] === 'ScholarlyArticle');
  const mit = art({produktPfad: '/products/qibracelet'});
  assert.deepEqual(mit.about[0], {'@id': 'https://qiblanco.com/products/qibracelet#product'});
  assert.ok(mit.about.includes('QiBracelet®'), 'der Produktname als Text bleibt stehen');
  assert.equal(mit.sameAs, 'https://doi.org/10.53043/2320-1991.acb12001');
  // Ohne Angabe: Verhalten wie vor dem Bau (die anderen vier Studienblaetter).
  assert.deepEqual(art().about, ['QiBracelet®', 'Zellbiologie', 'In-vitro-Untersuchung']);
});

test('die Route der Studienseite haengt beides wirklich ein', () => {
  // Positiv-Kontrolle gegen eine Bibliothek ohne Aufrufer.
  assert.match(ROUTE, /\.\.\.citationMeta\(STUDIE\)/);
  assert.match(ROUTE, /studieSchema\(STUDIE, \{produktPfad: PRODUKT_PFAD\}\)/);
});
