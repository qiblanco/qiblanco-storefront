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
  assert.equal(
    switchTarget('/pages/kohaerentes-wasser', 'us'),
    'https://qi-blanco.com/pages/coherent-water',
  );
  // und derselbe Weg zurück
  assert.equal(
    switchTarget('/pages/imprint', 'de'),
    'https://qiblanco.com/pages/impressum',
  );
});

test('UNBEKANNT: ohne Entsprechung die Startseite, nie eine falsche Seite', () => {
  assert.equal(
    switchTarget('/pages/gibt-es-drueben-nicht', 'us'),
    'https://qi-blanco.com/',
  );
  assert.equal(
    switchTarget('/collections/irgendwas/products/xy', 'us'),
    'https://qi-blanco.com/',
  );
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
