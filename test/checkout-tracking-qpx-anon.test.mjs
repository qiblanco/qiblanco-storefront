// Hermetische Tests der _qpx_anon-Erfassung (Job 20260722-stitch-gap-session-
// kauf-schliessen-live, 2026-07-23). Wie catchall/go-router: node:test/node:assert
// als Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/checkout-tracking-qpx-anon.test.mjs
//
// Belegt die Session->Kauf-Bruecke auf der Storefront-Seite: der first-party
// qpx-Visitor-Cookie _qpx_anon wird server-seitig aus dem Cookie-Header gelesen
// und wird zum Shopify-Cart-Attribut -> spaeter Order-note_attribute, das der
// own-source-Stitch (own_source.py, OS_STITCH_SESSION) deterministisch verwendet.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAttributionCartAttributes,
  getCheckoutTrackingSearchParams,
} from '../app/lib/checkout-tracking.js';

const ANON = 'a184b103-5aa6-41be-bbf5-90d37d1b07f9';

test('_qpx_anon aus Cookie -> Cart-Attribut (Order-note_attribute)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: `_qpx_anon=${ANON}; foo=bar`,
    includeCookies: true,
  });
  const anon = attrs.find((a) => a.key === '_qpx_anon');
  assert.ok(anon, '_qpx_anon fehlt in den Cart-Attributen');
  assert.equal(anon.value, ANON);
});

test('_qpx_anon reist neben fbc/fbp weiter (Konsolidierung, kein Zweit-Stack)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: `_qpx_anon=${ANON}; _fbp=fb.1.123.456; _fbc=fb.1.789.abc`,
    includeCookies: true,
  });
  const keys = new Set(attrs.map((a) => a.key));
  assert.ok(keys.has('_qpx_anon'), '_qpx_anon fehlt');
  assert.ok(keys.has('_fbp'), '_fbp regressierte');
  assert.ok(keys.has('_fbc'), '_fbc regressierte');
});

test('URL-encodeter Cookie-Wert wird dekodiert (Round-Trip mit qpx.js)', () => {
  // qpx.js setzt setCookie via encodeURIComponent; parseCookieHeader dekodiert.
  const raw = 'anon+mit%20space';
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: `_qpx_anon=${encodeURIComponent(raw)}`,
    includeCookies: true,
  });
  const anon = attrs.find((a) => a.key === '_qpx_anon');
  assert.ok(anon);
  assert.equal(anon.value, raw);
});

test('kein _qpx_anon-Cookie -> kein _qpx_anon-Attribut (fail-soft)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams('gclid=abc'),
    cookieHeader: 'foo=bar',
    includeCookies: true,
  });
  assert.equal(
    attrs.find((a) => a.key === '_qpx_anon'),
    undefined,
  );
});

test('includeCookies=false -> _qpx_anon wird NICHT aus Cookies gezogen', () => {
  const params = getCheckoutTrackingSearchParams({
    searchParams: new URLSearchParams(),
    cookieHeader: `_qpx_anon=${ANON}`,
    includeCookies: false,
  });
  assert.equal(params.get('_qpx_anon'), null);
});
