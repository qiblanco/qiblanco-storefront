// Hermetische Tests der Catch-All-Entscheidung (Auftrag
// 20260720-ads-lpa-s02-catchall-404, BEFUND-E-Faelle). Wie go-router.test.mjs:
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/catchall.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analysiereCatchAllPfad,
  catchAllEntscheidung,
  protokolliereCatchAll,
} from '../app/lib/catchall.server.js';

// --- BEFUND-E-Faelle: Locale-Prefixe werden gestrippt ------------------------
const BEFUND_E = [
  ['/en-th/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/th/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/en-us/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/en-sg/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/de-de/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/en/pages/exclusive-solutions', '/pages/exclusive-solutions'],
  ['/en-th/pages/schlaf-zellen-schutz', '/pages/schlaf-zellen-schutz'],
  ['/en-th/', '/'],
];

for (const [pfad, ziel] of BEFUND_E) {
  test(`BEFUND E: ${pfad} -> strip -> ${ziel}`, () => {
    const r = analysiereCatchAllPfad(pfad);
    assert.equal(r.typ, 'locale-strip');
    assert.equal(r.ziel, ziel);
  });
}

test('Prefix ohne trailing Slash (/en-th) -> /', () => {
  const r = analysiereCatchAllPfad('/en-th');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.ziel, '/');
});

test('case-insensitiv: /DE-DE/pages/x -> /pages/x (Rest byte-erhalten)', () => {
  const r = analysiereCatchAllPfad('/DE-DE/pages/Exclusive-Solutions');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.locale, 'de-de');
  assert.equal(r.ziel, '/pages/Exclusive-Solutions');
});

// --- Query byte-erhalten -----------------------------------------------------
test('Query bleibt byte-identisch erhalten (inkl. fbclid)', () => {
  const r = catchAllEntscheidung(
    'https://qiblanco.com/en-th/pages/exclusive-solutions?x=1&fbclid=IwAR0_AbC-123.test&utm_source=meta',
  );
  assert.equal(r.typ, 'locale-strip');
  assert.equal(
    r.location,
    '/pages/exclusive-solutions?x=1&fbclid=IwAR0_AbC-123.test&utm_source=meta',
  );
});

test('ohne Query: Location ist der nackte Ziel-Pfad', () => {
  const r = catchAllEntscheidung('https://qiblanco.com/en/pages/e-smog');
  assert.equal(r.location, '/pages/e-smog');
});

// --- Nicht-Locale-Pfade: ehrlicher 404 ---------------------------------------
for (const pfad of [
  '/definitiv-nicht-da',
  '/pages/x',
  '/enx/pages/x',
  '/e/',
  '/xx/pages/x', // 'xx' ist kein ISO-639-1-Code
  '/de-deu/pages/x', // Country != 2 Buchstaben
  '/en-t/pages/x',
  '/12/pages/x',
]) {
  test(`kein Locale-Muster: ${pfad} -> not-found`, () => {
    assert.equal(analysiereCatchAllPfad(pfad).typ, 'not-found');
  });
}

// --- Kollisions-Beleg: echte 2-Buchstaben-Routen ----------------------------
test('Kollision /go: erreicht den Catch-All nie — und SELBST WENN, wuerde "go" (kein ISO-639-1) nicht gestrippt', () => {
  assert.equal(analysiereCatchAllPfad('/go').typ, 'not-found');
  assert.equal(analysiereCatchAllPfad('/go/unterpfad').typ, 'not-found');
});

test('Kollision /b: kein Locale-Muster (1 Buchstabe)', () => {
  assert.equal(analysiereCatchAllPfad('/b').typ, 'not-found');
});

// --- Loop-Guard: genau EIN Strip pro Durchlauf -------------------------------
test('nur EIN Strip pro Durchlauf: /en/de/pages/x -> /de/pages/x (Rest entscheidet das Routing)', () => {
  const r = analysiereCatchAllPfad('/en/de/pages/x');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.ziel, '/de/pages/x');
  // Terminierungs-Beleg: jeder Strip verkuerzt den Pfad strikt.
  assert.ok(r.ziel.length < '/en/de/pages/x'.length);
});

// --- Open-Redirect-Guard -----------------------------------------------------
test('kein Open Redirect: /en//evil.com -> /evil.com (lokal), nie //host', () => {
  const r = analysiereCatchAllPfad('/en//evil.com');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.ziel, '/evil.com');
  assert.ok(!r.ziel.startsWith('//'));
});

test('kein Open Redirect via Backslash: /en/\\evil.com -> /evil.com', () => {
  const r = analysiereCatchAllPfad('/en/\\evil.com');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.ziel, '/evil.com');
});

// --- Grenzfaelle --------------------------------------------------------------
test('/de/ -> /', () => {
  const r = analysiereCatchAllPfad('/de/');
  assert.equal(r.typ, 'locale-strip');
  assert.equal(r.ziel, '/');
});

test('leerer/kaputter Input -> not-found (nie werfen)', () => {
  assert.equal(analysiereCatchAllPfad('').typ, 'not-found');
  assert.equal(analysiereCatchAllPfad(null).typ, 'not-found');
  assert.equal(analysiereCatchAllPfad('/').typ, 'not-found');
});

// --- Messbarkeit: Beacon fail-soft, nie blockierend --------------------------
test('protokolliereCatchAll: locale_strip sendet /b-Beacon via waitUntil (Argument-pruefender Mock)', () => {
  const calls = [];
  const waited = [];
  globalThis.__origFetch = globalThis.fetch;
  globalThis.fetch = (endpoint, opts) => {
    calls.push({endpoint, opts});
    return Promise.resolve({status: 204});
  };
  try {
    protokolliereCatchAll(
      {
        env: {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'},
        waitUntil: (p) => waited.push(p),
      },
      'locale_strip',
      new URL('https://qiblanco.com/en-th/pages/exclusive-solutions?x=1'),
      '/pages/exclusive-solutions',
    );
  } finally {
    globalThis.fetch = globalThis.__origFetch;
  }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].endpoint, 'https://qpx.example/b');
  assert.equal(calls[0].opts.method, 'POST');
  const body = JSON.parse(calls[0].opts.body);
  // Synthetischer filterbarer Namespace, KEINE Query im Beacon-URL-Feld.
  assert.equal(
    body.url,
    'https://qiblanco.com/__qb-catchall/locale_strip/en-th/pages/exclusive-solutions',
  );
  assert.equal(calls[0].opts.headers['User-Agent'], 'qpx-catchall-beacon/1.0');
  assert.equal(waited.length, 1);
});

test('protokolliereCatchAll: not_found sendet KEINEN Beacon (404-Seite misst client-seitig)', () => {
  const calls = [];
  globalThis.__origFetch = globalThis.fetch;
  globalThis.fetch = (...a) => {
    calls.push(a);
    return Promise.resolve({status: 204});
  };
  try {
    protokolliereCatchAll(
      {env: {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'}, waitUntil: () => {}},
      'not_found',
      new URL('https://qiblanco.com/definitiv-nicht-da'),
      null,
    );
  } finally {
    globalThis.fetch = globalThis.__origFetch;
  }
  assert.equal(calls.length, 0);
});

test('protokolliereCatchAll: ohne Env fail-closed (kein Fetch, kein Wurf)', () => {
  const calls = [];
  globalThis.__origFetch = globalThis.fetch;
  globalThis.fetch = (...a) => {
    calls.push(a);
    return Promise.resolve({status: 204});
  };
  try {
    protokolliereCatchAll(
      {env: {}, waitUntil: () => {}},
      'locale_strip',
      new URL('https://qiblanco.com/en/x'),
      '/x',
    );
    protokolliereCatchAll(undefined, 'locale_strip', new URL('https://qiblanco.com/en/x'), '/x');
  } finally {
    globalThis.fetch = globalThis.__origFetch;
  }
  assert.equal(calls.length, 0);
});
