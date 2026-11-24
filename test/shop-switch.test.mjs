// Hermetische Tests der Umschalt-Zuordnung (Grossjob bl-20260806T203228Z-d11854,
// Segment s02). Wie lp-v3.test.mjs / catchall.test.mjs: node:test/node:assert
// sind Bordmittel, KEIN Netz.
// Ausfuehren: node --test test/shop-switch.test.mjs
//
// Geprueft wird das GENERAT app/lib/shop-switch.js. Es wird nie von Hand
// editiert — Quelle ist homepage-bauer/shop-switch/shop-mapping.yaml, der
// Byte-Abgleich läuft über `shop-switch-gen --pruefe`. Dieser Test misst die
// andere Haelfte: dass die erzeugte Funktion sich auch so VERHAELT.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SHOP_LABEL,
  SHOP_ORIGIN,
  switchTarget,
} from '../app/lib/shop-switch.js';

test('Origins und Labels beider Shops stehen im Generat', () => {
  assert.equal(SHOP_ORIGIN.de, 'https://qiblanco.com');
  assert.equal(SHOP_ORIGIN.us, 'https://qi-blanco.com');
  assert.equal(SHOP_LABEL.de, 'Deutsch');
  assert.equal(SHOP_LABEL.us, 'USA');
});

test('GLEICHWERTIG: eine Seite mit Entsprechung führt auf genau diese', () => {
  assert.equal(
    switchTarget('/pages/impressum', 'us'),
    'https://qi-blanco.com/pages/imprint',
  );
  // Kohärentes Wasser: Info-Seite <-> Info-Seite, Kurs Tag 5 <-> Part 5
  // (seit 24.09.2026, shop-mapping.yaml).
  assert.equal(
    switchTarget('/pages/was-ist-kohaerentes-wasser', 'us'),
    'https://qi-blanco.com/pages/coherent-water',
  );
  assert.equal(
    switchTarget('/pages/kohaerentes-wasser', 'us'),
    'https://qi-blanco.com/pages/coherent-water-structure',
  );
  assert.equal(
    switchTarget('/pages/coherent-water', 'de'),
    'https://qiblanco.com/pages/was-ist-kohaerentes-wasser',
  );
  // und derselbe Weg zurück
  assert.equal(
    switchTarget('/pages/imprint', 'de'),
    'https://qiblanco.com/pages/impressum',
  );
});

test('UNBEKANNT: ohne Paar und ohne passende Familie die Startseite', () => {
  assert.equal(
    switchTarget('/pages/gibt-es-drueben-nicht', 'us'),
    'https://qi-blanco.com/',
  );
});

// Christian 24.11.2026: "dass man direkt auf die gegenüberliegende richtige
// Seite landet. Und das wirklich auf jede Seite nochmal ausprobieren."
test('NÄCHSTPASSEND: Produktfamilie, Kollektion, Blog statt Startseite', () => {
  assert.equal(
    switchTarget('/collections/irgendwas/products/xy', 'us'),
    'https://qi-blanco.com/collections/all',
  );
  assert.equal(switchTarget('/products/qione-1', 'us'), 'https://qi-blanco.com/products/qione');
  assert.equal(switchTarget('/blogs/wissen/neu', 'us'), 'https://qi-blanco.com/blogs/knowledge');
  assert.equal(switchTarget('/blogs/knowledge/new', 'de'), 'https://qiblanco.com/blogs/wissen');
  assert.equal(switchTarget('/products/irgendein-necklace', 'de'), 'https://qiblanco.com/products/qione-kette');
});

test('BF-DEAL: Deal-Seite führt auf die Deal-Seite desselben Deals, beide Richtungen', () => {
  const vorEnde = {jetzt: Date.parse('2026-11-24T12:00:00Z')};
  assert.equal(switchTarget('/products/j7hcyb802kn', 'us', vorEnde), 'https://qi-blanco.com/pages/izw9jai5k5x');
  assert.equal(switchTarget('/pages/izw9jai5k5x', 'de', vorEnde), 'https://qiblanco.com/products/j7hcyb802kn');
  assert.equal(switchTarget('/pages/rk3xmgho0m0', 'de', vorEnde), 'https://qiblanco.com/products/8kendiw34hd');
  assert.equal(switchTarget('/products/u09mvn6eftj', 'de', vorEnde), 'https://qiblanco.com/products/j7hcyb802kn');
  const nachEnde = {jetzt: Date.parse('2026-12-01T00:00:00Z')};
  assert.equal(switchTarget('/pages/izw9jai5k5x', 'de', nachEnde), 'https://qiblanco.com/');
});

// Christian 24.11.2026 (Job 20261124-prio2-folge-laenderwahl-kakao-bundles-de-ausrollen): die US-Bundle-Produkte
// sind 404 (custom.hidden), darum führen die DE-Kakao-Bundles im BF auf die US-BF-Kakao-Seite mit der Set-Wahl,
// danach auf die US-Kakao-Seite. Nur Hinweg.
test('KAKAO-BUNDLES: DE-Bundle führt im BF auf die US-BF-Kakao-Seite, danach auf /pages/crystal-cacao', () => {
  const vorEnde = {jetzt: Date.parse('2026-11-24T12:00:00Z')};
  const nachEnde = {jetzt: Date.parse('2026-12-01T00:00:00Z')};
  for (const p of ['/products/bundle-1x-awake-1x-create', '/products/bundle-2x-awake', '/products/mengenrabatt-2x']) {
    assert.equal(switchTarget(p, 'us', vorEnde), 'https://qi-blanco.com/pages/izw9jai5k5x', p);
    assert.equal(switchTarget(p, 'us', nachEnde), 'https://qi-blanco.com/pages/crystal-cacao', p);
  }
  assert.equal(switchTarget('/products/mengenrabatt-3x-create', 'us', vorEnde), 'https://qi-blanco.com/pages/crystal-cacao');
  // Rückweg bleibt die Kakao-Deal-Seite, nie ein Bundle
  assert.equal(switchTarget('/pages/izw9jai5k5x', 'de', vorEnde), 'https://qiblanco.com/products/j7hcyb802kn');
});

test('ARTIKEL: das hreflang-Gegenstück des Artikels gewinnt vor dem Blog', () => {
  assert.equal(
    switchTarget('/blogs/wissen/a', 'us', {artikel: '/blogs/knowledge/b'}),
    'https://qi-blanco.com/blogs/knowledge/b',
  );
});

test('ABFRAGE: mit search wandert die Abfrage mit (utm, el)', () => {
  assert.equal(
    switchTarget('/pages/impressum', 'us', {search: '?utm_source=meta&el=x'}),
    'https://qi-blanco.com/pages/imprint?utm_source=meta&el=x',
  );
  assert.equal(switchTarget('/pages/impressum', 'us', {search: '?'}), 'https://qi-blanco.com/pages/imprint');
});

test('FRONT -> FRONT: die Startseite bleibt die Startseite', () => {
  assert.equal(switchTarget('/', 'us'), 'https://qi-blanco.com/');
  assert.equal(switchTarget('/', 'de'), 'https://qiblanco.com/');
});

test('TRAILING SLASH aendert das Ziel nicht', () => {
  assert.equal(
    switchTarget('/pages/impressum/', 'us'),
    switchTarget('/pages/impressum', 'us'),
  );
  // aber die blosse '/' bleibt die Front und wird nicht leergekuerzt
  assert.equal(switchTarget('/', 'us'), 'https://qi-blanco.com/');
});

test('QUERY und HASH werden abgeschnitten, nicht mitgeschleppt', () => {
  assert.equal(
    switchTarget('/pages/impressum?utm_source=meta&x=1', 'us'),
    'https://qi-blanco.com/pages/imprint',
  );
  assert.equal(
    switchTarget('/pages/impressum#kontakt', 'us'),
    'https://qi-blanco.com/pages/imprint',
  );
});

test('ROBUST: leerer/fehlender Pfad und unbekannter Zielshop kippen nicht', () => {
  assert.equal(switchTarget('', 'us'), 'https://qi-blanco.com/');
  assert.equal(switchTarget(undefined, 'us'), 'https://qi-blanco.com/');
  assert.equal(switchTarget(null, 'de'), 'https://qiblanco.com/');
  // unbekannter Zielshop -> DACH-Origin statt Absturz
  assert.equal(switchTarget('/pages/impressum', 'xx'), 'https://qiblanco.com');
});

test('KEIN Ziel zeigt versehentlich auf den eigenen Shop zurück', () => {
  for (const pfad of [
    '/pages/impressum',
    '/pages/agb',
    '/pages/datenschutz',
    '/pages/kohaerentes-wasser',
    '/',
  ]) {
    const ziel = switchTarget(pfad, 'us');
    assert.ok(
      ziel.startsWith('https://qi-blanco.com'),
      `Ziel für ${pfad} zeigt nicht in den US-Shop: ${ziel}`,
    );
  }
});
