// Hermetische Tests: gad_campaignid reist als eigenes Order-note_attribute
// (Job 20261004-aiceo-k2-j5, 2026-10-04). Wie qpx-anon: node:test/node:assert,
// KEIN Netz. Ausführen: node --test test/checkout-tracking-gad-campaignid.test.mjs
//
// Vorher hing die Google-Kampagnen-ID allein an der `landing_page`-Query: war
// die Landeseite nicht die Ad-Seite (SPA-Navigation, Rückkehr mit Cookie),
// war sie für das Backend weg. Jetzt speichert der Tracker sie, und
// checkout-tracking.js reicht sie an Checkout-URL und Cart-Attribute weiter.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  ATTRIBUTION_COOKIE_NAME,
  buildAttributionCartAttributes,
  appendTrackingToCheckoutUrl,
} from '../app/lib/checkout-tracking.js';

const CID = '22874519360';

test('gad_campaignid aus der URL -> eigenes Cart-Attribut', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(`gclid=abc&gad_campaignid=${CID}`),
    cookieHeader: '',
    includeCookies: true,
  });
  const a = attrs.find((x) => x.key === 'gad_campaignid');
  assert.ok(a, 'gad_campaignid fehlt in den Cart-Attributen');
  assert.equal(a.value, CID);
  assert.ok(attrs.find((x) => x.key === 'gclid'), 'gclid regressierte');
});

test('gad_campaignid aus dem gespeicherten Tracker-Record (Rückkehr ohne Query)', () => {
  const record = {
    params: [['gclid', 'abc'], ['gad_campaignid', CID]],
    href: `https://qiblanco.com/?gclid=abc&gad_campaignid=${CID}`,
    referrer: '',
    savedAt: '2026-10-04T00:00:00.000Z',
  };
  const cookieHeader = `${ATTRIBUTION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(record))}`;
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader,
    includeCookies: true,
  });
  const a = attrs.find((x) => x.key === 'gad_campaignid');
  assert.ok(a, 'gad_campaignid aus gespeicherter Attribution fehlt');
  assert.equal(a.value, CID);
});

test('gad_campaignid an die Checkout-URL', () => {
  const url = appendTrackingToCheckoutUrl('https://checkout.qiblanco.com/cart/c/x', {
    searchParams: new URLSearchParams(`gad_campaignid=${CID}`),
  });
  assert.equal(new URL(url).searchParams.get('gad_campaignid'), CID);
});

function namenAusSet(src) {
  const m = src.match(/const TRACKING_PARAM_NAMES = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(m, 'TRACKING_PARAM_NAMES in checkout-tracking.js nicht gefunden');
  return new Set([...m[1].replace(/\/\/.*$/gm, '').matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

function namenAusTracker(src) {
  const m = src.match(/var TRACKING_PARAM_NAMES = \{([\s\S]*?)\};/);
  assert.ok(m, 'TRACKING_PARAM_NAMES in qiblanco-tracker.js nicht gefunden');
  return new Set(
    [...m[1].replace(/\/\/.*$/gm, '').matchAll(/([A-Za-z0-9_]+)\s*:\s*true/g)].map((x) => x[1]),
  );
}

test('Zwillingslisten sind deckungsgleich und tragen gad_campaignid', () => {
  const ct = namenAusSet(readFileSync(new URL('../app/lib/checkout-tracking.js', import.meta.url), 'utf8'));
  const tr = namenAusTracker(readFileSync(new URL('../public/qiblanco-tracker.js', import.meta.url), 'utf8'));
  assert.ok(ct.has('gad_campaignid'), 'checkout-tracking.js ohne gad_campaignid');
  assert.ok(tr.has('gad_campaignid'), 'qiblanco-tracker.js ohne gad_campaignid');
  assert.deepEqual([...ct].sort(), [...tr].sort(), 'Zwillingslisten weichen ab');
});
