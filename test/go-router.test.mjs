// Unit-/Integrationstests des /go-Loaders (Segment s06, landingpage-4lp-abcd-bau).
// `node:test`/`node:assert` sind Node-Bordmittel (Node 18+) — bewusst KEIN neuer
// Test-Runner (Repo hat keinen konfiguriert; package.json bleibt unangetastet).
// Ausfuehren: node --test test/go-router.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {baueBasisHit, handleGoRequest, ZUTEILUNG_URL} from '../app/lib/go-router.server.js';
import {
  kaskadeEntscheiden,
  validiereZuteilung,
  parseHistCookie,
  serialisiereHistCookie,
  hatMarketingConsent,
  bandItZiehen,
  naechsteUngeseheneKuerzel,
  zielUrl,
  LP_PFAD,
  DEFAULT_ZUTEILUNG,
} from '../app/lib/go-router-logic.js';

function req(query, {cookie} = {}) {
  const headers = new Headers();
  if (cookie) headers.set('Cookie', cookie);
  return new Request(`https://qiblanco.com/go${query}`, {headers});
}

function jsonFetch(body, {ok = true, status = 200} = {}) {
  return async (url) => {
    assert.equal(url, ZUTEILUNG_URL);
    return {ok, status, json: async () => body};
  };
}

function throwingFetch() {
  return async () => {
    throw new Error('simulierter Netzwerkfehler');
  };
}

const ZUTEILUNG_HERKUNFT = {
  version: '2026-07-14T00:00:00Z',
  modus: 'herkunft',
  default: '/pages/schlaf-zellen-schutz',
  herkunft: {'ad:999': '/pages/zell-schutz', 'adset:555': '/pages/tiefer-schlaf'},
  bandit: {A: 0.4, B: 0.1, C: 0.1, D: 0.4},
  rotation_reihenfolge: ['A', 'C', 'B', 'D'],
};

// --- (a) fbclid+utm Roundtrip byte-identisch -------------------------------------
test('(a) fbclid ueberlebt Query-Forwarding byte-identisch bei Herkunfts-Treffer', async () => {
  const r = await handleGoRequest({
    request: req('?fbclid=IwAR0_AbC-123.test&utm_content=999&utm_source=meta'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/zell-schutz?'));
  assert.ok(r.location.includes('fbclid=IwAR0_AbC-123.test'), r.location);
  assert.ok(r.location.includes('utm_source=meta'));
  assert.ok(r.location.endsWith('&lp_m=h'));
});

test('(a2) reine Kaskade: pure zielUrl() haengt niemals fbclid um (keine URLSearchParams-Neuserialisierung)', () => {
  const url = new URL('https://qiblanco.com/go?fbclid=IwAR0%2Ftest&x=1');
  const ziel = zielUrl('/pages/zell-schutz', url.search, 'h');
  assert.equal(ziel, '/pages/zell-schutz' + url.search + '&lp_m=h');
});

// --- (b) modus=aus => immer default+lp_m=f ---------------------------------------
test('(b) zuteilung.modus=aus => immer Default mit lp_m=f, auch bei Herkunfts-Treffer-Query', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=999&fbclid=xyz'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch({...ZUTEILUNG_HERKUNFT, modus: 'aus'}),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz?'));
  assert.ok(r.location.endsWith('&lp_m=f'));
});

// --- (c) ROTATION_MODE fehlt => default -----------------------------------------
test('(c) ROTATION_MODE fehlt (env undefined) => Default, Zuteilung wird NICHT gefetcht', async () => {
  let fetchAufgerufen = false;
  const r = await handleGoRequest({
    request: req('?utm_content=999'),
    env: {},
    fetchImpl: async () => {
      fetchAufgerufen = true;
      return {ok: true, status: 200, json: async () => ZUTEILUNG_HERKUNFT};
    },
  });
  assert.equal(fetchAufgerufen, false);
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz?'));
  assert.ok(r.location.endsWith('&lp_m=f'));
});

test('(c2) ROTATION_MODE=off (expliziter Wert) => ebenfalls Default', async () => {
  const r = await handleGoRequest({
    request: req(''),
    env: {ROTATION_MODE: 'off'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz'));
  assert.ok(r.location.endsWith('lp_m=f'));
});

// --- (d) Tabelle nicht erreichbar => default (kein Throw) ------------------------
test('(d) Zuteilungstabelle wirft (Netzwerkfehler) => Default, kein Throw nach aussen', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=999'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: throwingFetch(),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz?'));
  assert.ok(r.location.endsWith('&lp_m=f'));
});

test('(d2) Zuteilungstabelle liefert HTTP 500 => Default (kein Throw)', async () => {
  const r = await handleGoRequest({
    request: req(''),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch({}, {ok: false, status: 500}),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz'));
});

test('(d3) Zuteilungstabelle liefert strukturell kaputtes JSON (kein modus-Feld) => Default', async () => {
  const r = await handleGoRequest({
    request: req(''),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch({foo: 'bar'}),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz'));
  assert.ok(r.location.endsWith('lp_m=f'));
});

// --- (e) herkunft-Treffer => richtige LP + lp_m=h --------------------------------
test('(e) utm_content=Ad-ID matcht herkunft-Map => richtige LP + lp_m=h', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=999'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/zell-schutz?'));
  assert.ok(r.location.endsWith('lp_m=h'));
});

test('(e2) utm_term=AdSet-ID matcht herkunft-Map (adset-Praefix) => richtige LP + lp_m=h', async () => {
  const r = await handleGoRequest({
    request: req('?utm_term=555'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/tiefer-schlaf?'));
  assert.ok(r.location.endsWith('lp_m=h'));
});

test('(e3) utm_content (Ad) schlaegt utm_term (AdSet) wenn beide vorhanden', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=999&utm_term=555'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/zell-schutz?'));
});

test('(e4) generischer Traffic ohne Herkunfts-Match, modus=herkunft => Default (kein p/b, Tiefe zu gering)', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=unbekannt-ad-id'),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz'));
  assert.ok(r.location.endsWith('lp_m=f'));
});

// --- (f) Es existiert kein 200/404/500-Pfad — immer 302 (Location gesetzt) -------
test('(f) JEDER getestete Pfad liefert eine location (== ein spaeterer 302), nie undefined/leer', async () => {
  const faelle = [
    {env: undefined, fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT)},
    {env: {ROTATION_MODE: 'on'}, fetchImpl: throwingFetch()},
    {env: {ROTATION_MODE: 'on'}, fetchImpl: jsonFetch(null)},
    {env: {ROTATION_MODE: 'on'}, fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT)},
  ];
  for (const f of faelle) {
    const r = await handleGoRequest({request: req('?a=b'), env: f.env, fetchImpl: f.fetchImpl});
    assert.equal(typeof r.location, 'string');
    assert.ok(r.location.length > 0);
    assert.ok(r.location.startsWith('/pages/'));
    // Cache-Control: no-store MUSS auf jedem Pfad gesetzt sein (Kap. 8 #3)
    assert.ok(r.headers.some(([k, v]) => k === 'Cache-Control' && v === 'no-store'));
    assert.ok(r.headers.some(([k, v]) => k === 'X-Robots-Tag' && v.includes('noindex')));
  }
});

test('(f2) kaputte/fehlende Query-Params werfen nicht (defensive Params)', async () => {
  const r = await handleGoRequest({
    request: req('?utm_content=&utm_term=%'), // '%' ist ein ungueltiges Escape
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(ZUTEILUNG_HERKUNFT),
  });
  assert.equal(typeof r.location, 'string');
  assert.ok(r.location.startsWith('/pages/'));
});

// --- Kaskaden-Detail: Profil-Rotation (Modus 3, Kap. 4.5) ------------------------
test('Profil-Rotation waehlt naechste ungesehene Perspektive bei vorhandenem Consent-Cookie', async () => {
  const zuteilung = {...ZUTEILUNG_HERKUNFT, modus: 'herkunft+profil', herkunft: {}};
  const r = await handleGoRequest({
    request: req('', {
      cookie: 'qb_lp_hist=A%3AC; CookieConsent=marketing=true%2Cstatistics=true',
    }),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(zuteilung),
  });
  // rotation_reihenfolge A,C,B,D; gesehen A,C -> naechste B
  assert.ok(r.location.startsWith('/pages/zell-schutz?'), r.location);
  assert.ok(r.location.endsWith('lp_m=p'));
  const setCookie = r.headers.find(([k]) => k === 'Set-Cookie');
  assert.ok(setCookie, 'Set-Cookie sollte gesetzt werden (neue Perspektive gesehen)');
  assert.ok(setCookie[1].includes('A%3AC%3AB') || decodeURIComponent(setCookie[1]).includes('A:C:B'));
});

test('Profil-Rotation OHNE Cookie (erster Besuch) faellt auf Bandit/Default zurueck, kein p', async () => {
  const zuteilung = {...ZUTEILUNG_HERKUNFT, modus: 'herkunft+profil', herkunft: {}};
  const r = await handleGoRequest({
    request: req('', {cookie: 'CookieConsent=marketing=true'}),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(zuteilung),
  });
  assert.ok(r.location.endsWith('lp_m=f'));
});

test('Profil-Rotation OHNE Consent-Signal ist toter Codepfad (kein Cookie-Read/Write trotz Cookie vorhanden)', async () => {
  const zuteilung = {...ZUTEILUNG_HERKUNFT, modus: 'herkunft+profil', herkunft: {}};
  const r = await handleGoRequest({
    request: req('', {cookie: 'qb_lp_hist=A'}), // kein CookieConsent-Cookie
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(zuteilung),
  });
  assert.ok(r.location.endsWith('lp_m=f'));
  assert.equal(r.headers.some(([k]) => k === 'Set-Cookie'), false);
});

test('Herkunft schlaegt Profil-Rotation IMMER (Kap. 4.5)', async () => {
  const zuteilung = {...ZUTEILUNG_HERKUNFT, modus: 'herkunft+profil'};
  const r = await handleGoRequest({
    request: req('?utm_content=999', {
      cookie: 'qb_lp_hist=B; CookieConsent=marketing=true',
    }),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(zuteilung),
  });
  assert.ok(r.location.startsWith('/pages/zell-schutz?'));
  assert.ok(r.location.endsWith('lp_m=h'));
});

test('modus=voll: alle Perspektiven gesehen faellt zu Bandit durch (kein 5. Grund-Code)', async () => {
  const zuteilung = {...ZUTEILUNG_HERKUNFT, modus: 'voll', herkunft: {}, bandit: {A: 1}};
  const r = await handleGoRequest({
    request: req('', {cookie: 'qb_lp_hist=A%3AB%3AC%3AD; CookieConsent=marketing=true'}),
    env: {ROTATION_MODE: 'on'},
    fetchImpl: jsonFetch(zuteilung),
  });
  assert.ok(r.location.startsWith('/pages/schlaf-zellen-schutz?'));
  assert.ok(r.location.endsWith('lp_m=b'));
});

// --- Reine Bausteine (schnelle, deterministische Einheitstests) -----------------
test('validiereZuteilung: lehnt fehlendes modus-Feld / unbekannten modus-Wert ab', () => {
  assert.equal(validiereZuteilung({default: '/x'}), null);
  assert.equal(validiereZuteilung({modus: 'voellig-falsch', default: '/x'}), null);
  assert.equal(validiereZuteilung(null), null);
  assert.equal(validiereZuteilung('nicht-mal-ein-objekt'), null);
  assert.ok(validiereZuteilung({modus: 'aus', default: '/pages/x'}));
});

test('bandItZiehen: waehlt deterministisch nach injiziertem Zufallswert', () => {
  const bandit = {A: 0.4, B: 0.1, C: 0.1, D: 0.4};
  assert.equal(bandItZiehen(bandit, () => 0), 'A');
  assert.equal(bandItZiehen(bandit, () => 0.999), 'D');
  assert.equal(bandItZiehen({}, () => 0.5), 'A'); // leeres Bandit -> Fallback A
});

test('naechsteUngeseheneKuerzel respektiert rotation_reihenfolge', () => {
  assert.equal(naechsteUngeseheneKuerzel(['A', 'C', 'B', 'D'], ['A']), 'C');
  assert.equal(naechsteUngeseheneKuerzel(['A', 'C', 'B', 'D'], ['A', 'C', 'B', 'D']), null);
});

test('parseHistCookie: null wenn Cookie fehlt, [] wenn leer, Kuerzel-Liste sonst', () => {
  assert.equal(parseHistCookie(undefined), null);
  assert.equal(parseHistCookie('andereCookie=x'), null);
  assert.deepEqual(parseHistCookie('qb_lp_hist='), []);
  assert.deepEqual(parseHistCookie('qb_lp_hist=A%3AC'), ['A', 'C']);
  assert.deepEqual(parseHistCookie('foo=bar; qb_lp_hist=b%3AD; other=1'), ['B', 'D']);
});

test('serialisiereHistCookie: nur Kuerzel, httpOnly+SameSite=Lax+90-Tage-MaxAge', () => {
  const c = serialisiereHistCookie(['A', 'B']);
  assert.match(c, /^qb_lp_hist=/);
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Lax/);
  assert.match(c, /Max-Age=7776000/);
  const wert = c.split(';')[0].split('=')[1];
  assert.doesNotMatch(wert, /[0-9]{5,}/); // Cookie-INHALT selbst: keine ID-artigen Ziffernfolgen/PII
});

test('hatMarketingConsent: erkennt Cookiebot marketing=true, sonst false', () => {
  assert.equal(hatMarketingConsent(undefined), false);
  assert.equal(hatMarketingConsent('CookieConsent=necessary=true%2Cmarketing=false'), false);
  assert.equal(hatMarketingConsent('CookieConsent=necessary=true%2Cmarketing=true'), true);
});

test('kaskadeEntscheiden: modus=herkunft ignoriert Bandit-Feld komplett (Tiefe 1)', () => {
  const zuteilung = validiereZuteilung({...ZUTEILUNG_HERKUNFT, modus: 'herkunft', herkunft: {}});
  const e = kaskadeEntscheiden(new URLSearchParams(), zuteilung, ['A'], true, () => 0);
  assert.equal(e.grund, 'f');
});

test('LP_PFAD deckt exakt die 4 Konzept-URLs ab (Kap. 3.1)', () => {
  assert.deepEqual(LP_PFAD, {
    A: '/pages/schlaf-zellen-schutz',
    B: '/pages/zell-schutz',
    C: '/pages/tiefer-schlaf',
    D: '/pages/E-Smog-Schutz',
  });
});

test('DEFAULT_ZUTEILUNG ist in sich konsistent (modus=aus, default=A)', () => {
  assert.equal(DEFAULT_ZUTEILUNG.modus, 'aus');
  assert.equal(DEFAULT_ZUTEILUNG.default, LP_PFAD.A);
});

// ---- baueBasisHit: serverseitiger cookieloser Basis-Hit fuer /go ----------

function reqMitHeadern(query, headerPairs = {}) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(headerPairs)) headers.set(k, v);
  return new Request(`https://qiblanco.com/go${query}`, {headers});
}

test('baueBasisHit: ohne PUBLIC_QPX_BASIS_ENDPOINT -> null (Gate wie Browser-Beacon)', () => {
  assert.equal(baueBasisHit(reqMitHeadern(''), {}), null);
  assert.equal(baueBasisHit(reqMitHeadern(''), {PUBLIC_QPX_BASIS_ENDPOINT: ''}), null);
  assert.equal(baueBasisHit(reqMitHeadern(''), undefined), null);
});

test('baueBasisHit: Payload = Pfad OHNE Query, Plattform-KLASSE statt Klick-ID', () => {
  const hit = baueBasisHit(
    reqMitHeadern('?fbclid=abc123XYZ&utm_source=fb'),
    {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'},
  );
  assert.equal(hit.endpoint, 'https://qpx.example/b');
  assert.equal(hit.init.method, 'POST');
  const body = JSON.parse(hit.init.body);
  assert.equal(body.url, 'https://qiblanco.com/go'); // keine Query im Payload
  assert.equal(body.platform, 'meta');               // Klasse, nie die ID
  assert.ok(!hit.init.body.includes('abc123XYZ'));   // Klick-ID verlaesst uns NIE
});

test('baueBasisHit: reicht Client-UA + oxygen-buyer-ip (als XFF) an den Receiver durch', () => {
  const hit = baueBasisHit(
    reqMitHeadern('?gclid=g1', {
      'User-Agent': 'Mozilla/5.0 (iPhone)',
      'oxygen-buyer-ip': '198.51.100.7',
      Referer: 'https://www.google.com/',
    }),
    {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'},
  );
  assert.equal(hit.init.headers['User-Agent'], 'Mozilla/5.0 (iPhone)');
  assert.equal(hit.init.headers['X-Forwarded-For'], '198.51.100.7');
  assert.equal(hit.init.headers['Content-Type'], 'application/json');
  const body = JSON.parse(hit.init.body);
  assert.equal(body.platform, 'google');
  assert.equal(body.referrer, 'https://www.google.com/');
});

test('baueBasisHit: ohne UA/IP-Header keine leeren Header-Felder, ohne Klick-ID platform leer', () => {
  const hit = baueBasisHit(reqMitHeadern('?utm_source=newsletter'), {
    PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b',
  });
  assert.ok(!('User-Agent' in hit.init.headers));
  assert.ok(!('X-Forwarded-For' in hit.init.headers));
  assert.equal(JSON.parse(hit.init.body).platform, '');
});

test('baueBasisHit: fail-soft — kaputter Input wirft NIE (Redirect-Schutz)', () => {
  assert.equal(baueBasisHit(null, {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'}), null);
  assert.equal(baueBasisHit({}, {PUBLIC_QPX_BASIS_ENDPOINT: 'https://qpx.example/b'}), null);
});
