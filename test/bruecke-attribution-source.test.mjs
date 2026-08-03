// Hermetische Tests der Herkunfts-Beschriftung an der Bridge-Route
// (Grossjob 20260728-crystal-cacao-dach-markteintritt-parallel, Segment s06,
// 2026-07-29). Muster wie checkout-tracking-qpx-anon.test.mjs: node:test /
// node:assert als Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/bruecke-attribution-source.test.mjs
//
// HINTERGRUND: crystal-cacao.de ist eine eigene Domain, fuehrt aber ueber
// /cart/<variantId>:<qty> in DIESEN Checkout. Bis hierher trugen beide Flaechen
// dasselbe attribution_source und waren in der Auswertung nicht mehr zu
// trennen. Beschriftet wird die HERKUNFT DES WARENKORBS — die Kanal-
// Attribution entscheidet weiterhin allein die Klick-ID.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ATTRIBUTION_SOURCE_DEFAULT,
  buildAttributionCartAttributes,
  resolveAttributionSource,
} from '../app/lib/checkout-tracking.js';

function quelleAus(attrs) {
  return attrs.find((a) => a.key === 'attribution_source')?.value;
}

test('ohne Referer bleibt es beim Default', () => {
  assert.equal(resolveAttributionSource(null), ATTRIBUTION_SOURCE_DEFAULT);
  assert.equal(resolveAttributionSource(''), ATTRIBUTION_SOURCE_DEFAULT);
});

test('Referer der eigenen Storefront bleibt Default', () => {
  assert.equal(
    resolveAttributionSource('https://qiblanco.com/pages/crystal-cacao'),
    ATTRIBUTION_SOURCE_DEFAULT,
  );
});

test('Referer crystal-cacao.de ergibt crystal_cacao_site', () => {
  for (const ref of [
    'https://crystal-cacao.de/',
    'https://www.crystal-cacao.de/create/',
    'https://CRYSTAL-CACAO.DE/awake/',
    'https://crystalcacao.de/',
    'https://crystal-cacao.com/',
  ]) {
    assert.equal(resolveAttributionSource(ref), 'crystal_cacao_site', ref);
  }
});

test('ein unbekannter fremder Host faellt NICHT auf sich selbst zurueck', () => {
  // Wichtig: die Beschriftung ist eine Allowlist, kein Echo. Sonst schriebe
  // jeder beliebige Referrer seinen Hostnamen in die Order-note_attributes.
  assert.equal(
    resolveAttributionSource('https://beliebige-fremde-seite.example/x'),
    ATTRIBUTION_SOURCE_DEFAULT,
  );
});

test('kaputter Referer wirft nicht, sondern faellt auf Default', () => {
  assert.equal(resolveAttributionSource('nicht-mal-eine-url'), ATTRIBUTION_SOURCE_DEFAULT);
});

test('Cart-Attribute tragen die uebergebene Quelle', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams('fbclid=X&utm_source=crystal-cacao'),
    cookieHeader: null,
    includeCookies: false,
    source: 'crystal_cacao_site',
  });
  assert.equal(quelleAus(attrs), 'crystal_cacao_site');
  assert.equal(attrs.find((a) => a.key === 'fbclid')?.value, 'X');
});

test('Bestandsverhalten unveraendert: ohne source-Option der alte Wert', () => {
  // Regressionsschutz. Jeder Aufrufer, der die Option nicht kennt, muss exakt
  // das bisherige Ergebnis bekommen.
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams('gclid=Y'),
    cookieHeader: null,
    includeCookies: false,
  });
  assert.equal(quelleAus(attrs), 'qiblanco_hydrogen');
});

test('ohne einen einzigen Tracking-Key entstehen gar keine Attribute', () => {
  // Die Beschriftung darf keinen leeren Warenkorb "attribuiert" aussehen
  // lassen — sonst zaehlt spaeter jede Direkt-Bestellung als Bruecken-Kauf.
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: null,
    includeCookies: false,
    source: 'crystal_cacao_site',
  });
  assert.deepEqual(attrs, []);
});
