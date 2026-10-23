// Hermetische Tests des Zähl-Beacons in public/qiblanco-qpx-loader.js
// (Grossjob 20261023 Global Deutsch-Shop Wiedererkennung, s02, Naht N2).
// Wie qpx-spa-pageview: node:test/node:assert, KEIN Netz, kein jsdom.
// Ausführen: node --test test/qpx-loader-zaehlung.test.mjs
//
// Vertrag: je Dokument-Ladung GENAU EIN Beacon an /a mit
// {quelle:"loader", host[, widerspruch:"cookiebot"]}; widerspruch nur bei
// einer im Banner erklärten Ablehnung (hasResponse && !consent.marketing),
// gesendet sobald die Wahl feststeht, sonst beim ersten Verlassen. Ob qpx
// lädt, entscheidet weiter allein die Einwilligung (unverändert).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const SRC = readFileSync(
  new URL('../public/qiblanco-qpx-loader.js', import.meta.url),
  'utf8',
);
const BASIS = 'https://qpx.65-108-150-121.sslip.io/b';

/**
 * @param {{cookiebot?: any, region?: string, basis?: string|null, beacon?: boolean}} o
 */
function ladeLoader(o = {}) {
  const beacons = [];
  const skripte = [];
  const win = new Map();
  const doc = new Map();
  const attrs = {
    'data-qb-consent-strict': 'DE,AT,CH',
    'data-qb-region': o.region ?? 'DE',
  };
  const tags = {
    'script[data-qpx-endpoint]': {getAttribute: () => '/collect'},
    'script[data-qpx-src]': {getAttribute: () => '/qiblanco-qpx.js?v=abc'},
    'script[data-qpx-basis-endpoint]':
      o.basis === null ? null : {getAttribute: () => o.basis ?? BASIS},
  };
  const document = {
    cookie: '',
    visibilityState: 'visible',
    documentElement: {getAttribute: (k) => attrs[k] ?? null},
    querySelector: (sel) => tags[sel] ?? null,
    createElement: () => ({}),
    head: {appendChild: (s) => skripte.push(s)},
    addEventListener: (t, fn) => {
      if (!doc.has(t)) doc.set(t, []);
      doc.get(t).push(fn);
    },
  };
  const window = {
    addEventListener: (t, fn) => {
      if (!win.has(t)) win.set(t, []);
      win.get(t).push(fn);
    },
  };
  if (o.cookiebot !== undefined) window.Cookiebot = o.cookiebot;
  const navigator =
    o.beacon === false
      ? {}
      : {
          sendBeacon: (url, body) => {
            beacons.push({url, body: JSON.parse(body)});
            return true;
          },
        };
  const ctx = {
    window,
    document,
    navigator,
    location: {hostname: 'qiblanco.com'},
    JSON,
  };
  vm.runInNewContext(SRC, ctx);
  return {
    beacons,
    skripte,
    window,
    document,
    feuer: (t) => (win.get(t) || []).forEach((fn) => fn()),
    verlassen: () => {
      document.visibilityState = 'hidden';
      (doc.get('visibilitychange') || []).forEach((fn) => fn());
      (win.get('pagehide') || []).forEach((fn) => fn());
    },
  };
}

test('keine Wahl: genau ein aufruf beim Verlassen, ohne widerspruch', () => {
  const s = ladeLoader();
  assert.equal(s.beacons.length, 0);
  s.verlassen();
  s.verlassen();
  assert.equal(s.beacons.length, 1);
  assert.equal(s.beacons[0].url, 'https://qpx.65-108-150-121.sslip.io/a');
  assert.deepEqual(s.beacons[0].body, {quelle: 'loader', host: 'qiblanco.com'});
  assert.equal(s.skripte.length, 0, 'ohne Einwilligung lädt qpx nicht');
});

test('gespeicherte Ablehnung beim Laden: sofort ein widerspruch, qpx lädt nicht', () => {
  const s = ladeLoader({cookiebot: {hasResponse: true, consent: {marketing: false}}});
  assert.equal(s.beacons.length, 1);
  assert.deepEqual(s.beacons[0].body, {
    quelle: 'loader',
    host: 'qiblanco.com',
    widerspruch: 'cookiebot',
  });
  s.verlassen();
  assert.equal(s.beacons.length, 1, 'nie zwei Beacons je Ladung');
  assert.equal(s.skripte.length, 0);
});

test('Ablehnung fällt nach dem Laden: Beacon erst mit der Wahl, Endstand widerspruch', () => {
  const cb = {hasResponse: false, consent: {marketing: false}};
  const s = ladeLoader({cookiebot: cb});
  s.feuer('CookiebotOnConsentReady');
  assert.equal(s.beacons.length, 0, '„noch keine Wahl" ist keine Ablehnung');
  cb.hasResponse = true;
  s.feuer('CookiebotOnDecline');
  assert.equal(s.beacons.length, 1);
  assert.equal(s.beacons[0].body.widerspruch, 'cookiebot');
  s.feuer('CookiebotOnConsentReady');
  s.verlassen();
  assert.equal(s.beacons.length, 1);
});

test('Banner offen, keine Wahl, Seite verlassen: aufruf ohne widerspruch', () => {
  const s = ladeLoader({cookiebot: {hasResponse: false, consent: {marketing: false}}});
  s.feuer('CookiebotOnConsentReady');
  s.verlassen();
  assert.equal(s.beacons.length, 1);
  assert.deepEqual(s.beacons[0].body, {quelle: 'loader', host: 'qiblanco.com'});
});

test('Zustimmung nach dem Laden: aufruf ohne widerspruch, qpx lädt wie bisher', () => {
  const cb = {hasResponse: false, consent: {marketing: false}};
  const s = ladeLoader({cookiebot: cb});
  cb.hasResponse = true;
  cb.consent.marketing = true;
  s.feuer('CookiebotOnAccept');
  assert.equal(s.beacons.length, 1);
  assert.deepEqual(s.beacons[0].body, {quelle: 'loader', host: 'qiblanco.com'});
  assert.equal(s.skripte.length, 1);
  assert.equal(s.skripte[0].src, '/qiblanco-qpx.js?v=abc');
});

test('Cookiebot noch nicht geladen (window.Cookiebot = Script-Element): kein Sofort-Beacon', () => {
  const s = ladeLoader({cookiebot: {id: 'Cookiebot'}});
  assert.equal(s.beacons.length, 0);
  s.verlassen();
  assert.equal(s.beacons.length, 1);
  assert.equal(s.beacons[0].body.widerspruch, undefined);
});

test('Ablehnung in einer optout-Region wird ebenso gezählt, qpx bleibt aus', () => {
  const s = ladeLoader({
    region: 'TH',
    cookiebot: {hasResponse: true, consent: {marketing: false}},
  });
  assert.equal(s.beacons.length, 1);
  assert.equal(s.beacons[0].body.widerspruch, 'cookiebot');
  assert.equal(s.skripte.length, 0);
});

test('ohne Basis-Endpunkt oder ohne sendBeacon: nichts gesendet, nichts bricht', () => {
  const a = ladeLoader({basis: null});
  a.verlassen();
  assert.equal(a.beacons.length, 0);
  const b = ladeLoader({basis: '/collect'});
  b.verlassen();
  assert.equal(b.beacons.length, 0, 'kein geratenes Ziel');
  assert.doesNotThrow(() => ladeLoader({beacon: false}).verlassen());
});
