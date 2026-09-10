// Hermetische Tests des Such-Ausschlusses (Auftrag 20260910-VOLLZUG-kakao-
// dublette-aus-storefront-suche, Weg A zweite Hälfte). Wie shop-switch.test.mjs
// / catchall.test.mjs: node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausführen: node --test test/such-ausschluss.test.mjs
//
// Gemessen wird das VERHALTEN des Filters, nicht seine Schreibweise. Die drei
// Gegenrichtungs-Tests sind hier die wichtigeren: ein Ausschluss, der zu weit
// greift, nimmt echte Kaufware aus der Suche, und das fällt erst auf, wenn der
// Umsatz fehlt.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUCH_AUSSCHLUSS_TAG,
  SUCH_AUSSCHLUSS_HANDLES,
  istSuchAusgeschlossen,
  ohneAusgeschlossene,
} from '../app/lib/such-ausschluss.js';

test('die Kakao-Dublette steht mit Grund in der Liste', () => {
  const eintrag = SUCH_AUSSCHLUSS_HANDLES.find(
    (e) => e.handle === 'crystal-cacao-adfiefiale',
  );
  assert.ok(eintrag, 'crystal-cacao-adfiefiale fehlt in SUCH_AUSSCHLUSS_HANDLES');
  // Eine Liste ohne Gründe ist in einem halben Jahr nicht mehr auflösbar.
  assert.ok(eintrag.grund && eintrag.grund.length > 30);
});

test('AUSSCHLUSS über die Handle-Liste', () => {
  assert.equal(istSuchAusgeschlossen({handle: 'crystal-cacao-adfiefiale'}), true);
});

test('AUSSCHLUSS über die Tag-Konvention, Schreibweise egal', () => {
  assert.equal(SUCH_AUSSCHLUSS_TAG, 'qb-nicht-suchbar');
  assert.equal(
    istSuchAusgeschlossen({handle: 'irgendwas', tags: ['Neu', 'QB-Nicht-Suchbar']}),
    true,
  );
  assert.equal(
    istSuchAusgeschlossen({handle: 'irgendwas', tags: ['  qb-nicht-suchbar  ']}),
    true,
  );
});

// --- GEGENRICHTUNG: der Filter darf nichts verschlucken -------------------

test('GEGENBEIN: die echten Kakao-Kaufseiten bleiben drin', () => {
  for (const handle of [
    'crystal-cacao-create',
    'crystal-cacao-awake',
    'crystal-cacao-angebot',
  ]) {
    assert.equal(istSuchAusgeschlossen({handle}), false, handle);
  }
});

test('GEGENBEIN: kein Präfix-Treffer — nur das exakte Handle fällt raus', () => {
  // Das Handle der Dublette enthält das Familien-Präfix 'crystal-cacao'.
  // Ein Teilstring-Vergleich würde die ganze Produktfamilie verschlucken.
  assert.equal(istSuchAusgeschlossen({handle: 'crystal-cacao'}), false);
  assert.equal(
    istSuchAusgeschlossen({handle: 'crystal-cacao-adfiefiale-neu'}),
    false,
  );
});

test('GEGENBEIN: fail-open bei unbrauchbarer Eingabe', () => {
  assert.equal(istSuchAusgeschlossen(null), false);
  assert.equal(istSuchAusgeschlossen(undefined), false);
  assert.equal(istSuchAusgeschlossen({}), false);
  assert.equal(istSuchAusgeschlossen({handle: 'x', tags: 'kein-array'}), false);
});

test('ohneAusgeschlossene nimmt genau einen Knoten und behält die Reihenfolge', () => {
  const vorher = [
    {handle: 'crystal-cacao-create'},
    {handle: 'crystal-cacao-adfiefiale'},
    {handle: 'crystal-cacao-awake'},
    {handle: 'qione-2-pro', tags: ['qb-nicht-suchbar']},
  ];
  const nachher = ohneAusgeschlossene(vorher);
  assert.deepEqual(
    nachher.map((n) => n.handle),
    ['crystal-cacao-create', 'crystal-cacao-awake'],
  );
});

test('ohneAusgeschlossene ist robust gegen fehlende Knotenliste', () => {
  assert.deepEqual(ohneAusgeschlossene(undefined), []);
  assert.deepEqual(ohneAusgeschlossene(null), []);
  assert.deepEqual(ohneAusgeschlossene([]), []);
});
