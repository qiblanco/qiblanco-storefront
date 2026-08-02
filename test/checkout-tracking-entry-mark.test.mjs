// Hermetische Tests des Einstiegs-Markers + Datenschutz-Schnitts (Job
// 20260802-fj1-storefront-cart-attribut-early-return-reparatur).
// Wie catchall/go-router/checkout-tracking-qpx-anon: node:test/node:assert als
// Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/checkout-tracking-entry-mark.test.mjs
//
// Anlass: buildAttributionCartAttributes() brach mit einem Early-Return auf
// `!attributes.length` ab, BEVOR die nicht-identifizierenden Felder
// (landing_page/referrer/attribution_saved_at/attribution_source) angehaengt
// wurden. Ohne Klick-/Cookie-Key trug die Order deshalb GAR KEINE
// note_attributes — 'unser Code lief und fand nichts' war nicht von 'unser Code
// lief nie' unterscheidbar.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ATTRIBUTION_COOKIE_NAME,
  buildAttributionCartAttributes,
} from '../app/lib/checkout-tracking.js';

/** Baut den Cookie-Header, den qiblanco-tracker.js writeAttributionCookie setzt. */
function attributionCookie(record, extra = '') {
  const raw = encodeURIComponent(JSON.stringify(record));
  return `${ATTRIBUTION_COOKIE_NAME}=${raw}${extra ? '; ' + extra : ''}`;
}

const byKey = (attrs) => Object.fromEntries(attrs.map((a) => [a.key, a.value]));

// ── Zweig 1: MIT Tracking-Keys — Bestandsverhalten darf sich nicht aendern ──

test('MIT Keys: Klick-ID + Einstiegsfelder wie bisher', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [['gclid', 'G-123']],
      href: 'https://qiblanco.com/pages/schlaf?gclid=G-123',
      referrer: 'https://www.google.com/',
      savedAt: '2026-08-02T10:00:00.000Z',
    }),
    includeCookies: true,
  });
  const m = byKey(attrs);

  assert.equal(m.gclid, 'G-123', 'Klick-ID regressierte');
  assert.equal(m.landing_page, 'https://qiblanco.com/pages/schlaf?gclid=G-123');
  assert.equal(m.referrer, 'https://www.google.com/');
  assert.equal(m.attribution_saved_at, '2026-08-02T10:00:00.000Z');
  assert.equal(m.attribution_source, 'qiblanco_hydrogen');
});

// ── Zweig 2: OHNE Tracking-Keys — der eigentliche Fix ──

test('OHNE Keys: Einstiegsfelder werden jetzt gesetzt (war vorher leer)', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [],
      href: 'https://qiblanco.com/products/qione',
      referrer: 'https://www.bing.com/',
      savedAt: '2026-08-02T11:00:00.000Z',
    }),
    includeCookies: true,
  });
  const m = byKey(attrs);

  assert.equal(m.landing_page, 'https://qiblanco.com/products/qione');
  assert.equal(m.referrer, 'https://www.bing.com/');
  assert.equal(m.attribution_saved_at, '2026-08-02T11:00:00.000Z');
  assert.equal(m.attribution_source, 'qiblanco_hydrogen');

  // Die Bindung der IDENTIFIZIERENDEN Keys bleibt unangetastet: ohne Cookie/
  // Param entsteht KEIN _fbp/_fbc/_qpx_anon aus dem Nichts.
  for (const id of ['_fbp', '_fbc', '_qpx_anon', 'gclid', 'fbclid']) {
    assert.equal(m[id], undefined, `${id} darf nicht erfunden werden`);
  }
});

test('OHNE Keys UND ohne Attributions-Cookie: nur der Abdeckungs-Marker', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: 'foo=bar',
    includeCookies: true,
  });

  assert.deepEqual(attrs, [
    {key: 'attribution_source', value: 'qiblanco_hydrogen'},
  ]);
});

test('Kill-Schalter alwaysMarkEntry=false stellt das alte Verhalten her', () => {
  const opts = {
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [],
      href: 'https://qiblanco.com/products/qione',
      referrer: '',
      savedAt: '2026-08-02T11:00:00.000Z',
    }),
    includeCookies: true,
  };

  assert.deepEqual(
    buildAttributionCartAttributes({...opts, alwaysMarkEntry: false}),
    [],
    'Kill-Schalter muss exakt das alte All-or-Nothing liefern',
  );
  assert.ok(
    buildAttributionCartAttributes({...opts, alwaysMarkEntry: true}).length > 0,
    'Gegenprobe: eingeschaltet muss es liefern',
  );
});

// ── Datenschutz-Schnitt (DENYLIST, nicht Allowlist) ──

test('Schnitt: Identitaets-Query-Keys fallen weg, Klick-IDs bleiben', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [['fbclid', 'F-9']],
      href: 'https://qiblanco.com/p?fbclid=F-9&email=kunde%40example.com&token=geheim',
      referrer: 'https://partner.example/x?password=abc&utm_source=news',
      savedAt: '2026-08-02T12:00:00.000Z',
    }),
    includeCookies: true,
  });
  const m = byKey(attrs);

  assert.equal(m.landing_page, 'https://qiblanco.com/p?fbclid=F-9');
  assert.equal(m.referrer, 'https://partner.example/x?utm_source=news');
});

test('Schnitt: sca_ref/gad_campaignid/source ueberleben (Backend-Sole-Source)', () => {
  // Diese drei stehen NICHT in TRACKING_PARAM_NAMES und sind darum
  // ausschließlich über die landing_page-Query erreichbar. own_source
  // _landing_params / channel.py lesen sie dort. Eine Allowlist haette sie
  // still gekappt — genau deshalb ist der Schnitt eine Denylist.
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [],
      href: 'https://qiblanco.com/p?sca_ref=aff-77&gad_campaignid=C-1&source=nl',
      referrer: '',
      savedAt: '2026-08-02T12:00:00.000Z',
    }),
    includeCookies: true,
  });

  assert.equal(
    byKey(attrs).landing_page,
    'https://qiblanco.com/p?sca_ref=aff-77&gad_campaignid=C-1&source=nl',
  );
});

test('Schnitt: nichts zu entfernen -> Wert bleibt byte-identisch', () => {
  const href = 'https://qiblanco.com/pages/x?gclid=G-1&utm_source=meta';
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [['gclid', 'G-1']],
      href,
      referrer: '',
      savedAt: '2026-08-02T12:00:00.000Z',
    }),
    includeCookies: true,
  });

  assert.equal(byKey(attrs).landing_page, href, 'keine URL-Normalisierung');
});

test('Schnitt: Fragment faellt weg, unbrauchbare URLs werden verworfen', () => {
  const attrs = buildAttributionCartAttributes({
    searchParams: new URLSearchParams(),
    cookieHeader: attributionCookie({
      params: [],
      href: 'https://qiblanco.com/p?utm_source=x#section-preise',
      referrer: 'javascript:alert(1)',
      savedAt: '2026-08-02T12:00:00.000Z',
    }),
    includeCookies: true,
  });
  const m = byKey(attrs);

  assert.equal(m.landing_page, 'https://qiblanco.com/p?utm_source=x');
  assert.equal(m.referrer, undefined, 'nicht-http(s) referrer muss entfallen');
});
