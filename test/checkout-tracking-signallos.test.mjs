// Regressionstest zum Fruehausstieg in buildAttributionCartAttributes
// (Job 20260809-dach-tracking-schluessel-verlust-42prozent-fix-plus-quoten-waechter-prio1).
// Stil wie checkout-tracking-qpx-anon.test.mjs: node:test/node:assert als
// Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/checkout-tracking-signallos.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT (gemessen 2026-08-09):
//   41,7 % der DACH-Orders trugen GAR KEIN note_attribute — auch nicht den
//   Marker `attribution_source`. Ursache war `if (!attributes.length) return`
//   VOR dem Marker: ein signal-loser Besucher verliess die Funktion, bevor
//   irgendetwas geschrieben wurde. Damit war "Order lief nicht ueber die
//   instrumentierte Kasse" von "Besucher hatte kein Ad-Signal" nicht mehr
//   unterscheidbar — genau die Blindheit, die Gate B von `shop-ankunft`
//   falsch-gruen meldete.
//
// Der US-Zwilling (us-qiblanco-2024, Commit afa642c, 2026-08-08) hat exakt
// diesen Fruehausstieg bereits geschlossen: Marker UNBEDINGT, aber der Marker
// zaehlt NICHT als Signal (sonst wuerden landing_page/referrer ploetzlich fuer
// jeden organischen Besucher geschrieben). Diese Tests halten BEIDE Haelften.
import test from 'node:test';
import assert from 'node:assert/strict';

import {buildAttributionCartAttributes} from '../app/lib/checkout-tracking.js';

const MARKER_KEY = 'attribution_source';
const MARKER_WERT = 'qiblanco_hydrogen';
const ANON = 'a184b103-5aa6-41be-bbf5-90d37d1b07f9';

// Der gespeicherte Attributions-Cookie (href/referrer/savedAt) — ein organischer
// Besucher kann ihn haben, OHNE ein einziges Ad-Signal zu tragen.
function attributionCookie({href, referrer, savedAt} = {}) {
  const payload = JSON.stringify({
    href: href ?? 'https://qiblanco.com/products/qione-2-pro',
    referrer: referrer ?? 'https://www.google.com/',
    savedAt: savedAt ?? '2026-08-09T18:28:02.000Z',
  });
  return `qiblanco_checkout_attribution=${encodeURIComponent(payload)}`;
}

test('DER FIX: signal-loser Besucher traegt den Marker (vorher: gar nichts)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: 'foo=bar',
    includeCookies: true,
  });

  const marker = attrs.find((a) => a.key === MARKER_KEY);
  assert.ok(
    marker,
    'signal-loser Besucher bekam KEIN attribution_source — der Fruehausstieg ist zurueck',
  );
  assert.equal(marker.value, MARKER_WERT);
});

test('signal-los OHNE jeden Cookie: exakt EIN Attribut, und das ist der Marker', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: '',
    includeCookies: true,
  });

  assert.deepEqual(attrs, [{key: MARKER_KEY, value: MARKER_WERT}]);
});

test('DIE ANDERE HAELFTE: der Marker zaehlt NICHT als Signal', () => {
  // Ein organischer Besucher hat den Attributions-Cookie (href/referrer), aber
  // KEIN Ad-Signal. landing_page/referrer duerfen deshalb NICHT geschrieben
  // werden — sonst haette der Fix die Datenmenge still ausgeweitet.
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie(),
    includeCookies: true,
  });

  const keys = new Set(attrs.map((a) => a.key));
  assert.ok(keys.has(MARKER_KEY), 'Marker fehlt');
  assert.ok(
    !keys.has('landing_page'),
    'landing_page wurde ohne Ad-Signal geschrieben — der Marker gilt faelschlich als Signal',
  );
  assert.ok(
    !keys.has('referrer'),
    'referrer wurde ohne Ad-Signal geschrieben — der Marker gilt faelschlich als Signal',
  );
  assert.ok(
    !keys.has('attribution_saved_at'),
    'attribution_saved_at wurde ohne Ad-Signal geschrieben',
  );
});

test('KEINE REGRESSION: mit echtem Signal bleibt der volle Satz erhalten', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams('gclid=abc123'),
    cookieHeader: attributionCookie(),
    includeCookies: true,
  });

  const keys = new Set(attrs.map((a) => a.key));
  for (const erwartet of [
    'gclid',
    'landing_page',
    'referrer',
    'attribution_saved_at',
    MARKER_KEY,
  ]) {
    assert.ok(keys.has(erwartet), `${erwartet} fehlt bei einem Besucher MIT Signal`);
  }
});

test('KEINE REGRESSION: _qpx_anon aus dem Cookie zaehlt weiter als Signal', () => {
  // Der Stitch-Schluessel selbst ist ein Signal — ein Besucher mit _qpx_anon
  // bekommt daher weiterhin den vollen Satz inkl. landing_page.
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: `_qpx_anon=${ANON}; ${attributionCookie()}`,
    includeCookies: true,
  });

  const keys = new Set(attrs.map((a) => a.key));
  assert.ok(keys.has('_qpx_anon'), '_qpx_anon regressierte');
  assert.ok(keys.has('landing_page'), 'landing_page fehlt trotz Signal _qpx_anon');
  assert.ok(keys.has(MARKER_KEY), 'Marker fehlt');
});

test('Marker ist genau EINMAL vorhanden (kein Doppel-Eintrag durch den Fix)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams('fbclid=xyz'),
    cookieHeader: `_qpx_anon=${ANON}`,
    includeCookies: true,
  });

  const marker = attrs.filter((a) => a.key === MARKER_KEY);
  assert.equal(marker.length, 1, 'attribution_source wurde mehrfach geschrieben');
});
