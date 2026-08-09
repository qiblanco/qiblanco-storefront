// Hermetische Tests des /collect-Proxys (Job 20260809-dach-tracking-schluessel-
// verlust-42prozent-fix-plus-quoten-waechter-prio1).
// Wie qpx-spa-pageview: node:test/node:assert als Bordmittel, KEIN Netz.
// Ausfuehren: node --test test/collect-proxy-transport.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT (gemessen 2026-08-09):
//   DACH: 0 von 11.037 Pixel-Events trugen device_fp/ua_hash — USA 1.367 von
//   2.036. Der Modus stand fuer BEIDE Shops auf `full`, es war also kein
//   Schalter-, sondern ein TRANSPORT-Problem:
//
//   Browser --(POST /collect, echter UA)--> Oxygen-Worker (diese Route)
//          --(fetch, NUR Content-Type)--> Caddy --> Receiver
//
//   Der Re-Fetch reichte den Browser-User-Agent nicht weiter. Der Receiver las
//   `self.headers.get("User-Agent","")` -> "" -> ua_hash()="" -> NULL, und
//   device_fp faellt in fingerprint.py:179 (`if not ua.strip() and belegt==0`)
//   ebenfalls auf "". Der USA-Shop ist ein Liquid-Theme und sendet den Beacon
//   DIREKT aus dem Browser — dort kam der UA deshalb immer an.
//
//   Zweiter, subtilerer Teil desselben Defekts: `basis.client_ip()` nimmt den
//   LINKESTEN X-Forwarded-For-Eintrag. Ohne Weiterreichen der echten Client-IP
//   trug Caddy die EGRESS-IP DES OXYGEN-EDGE ein — der DACH-`ip_net_hash` war
//   also nicht nur duenn, sondern FALSCH. Das erklaert die gemessenen 190
//   verschiedenen Besucher hinter EINEM ip_net_hash (CDN-Signatur).
//
// Der Mock zeichnet die UEBERGEBENEN ARGUMENTE auf und asserted darauf — ein
// Mock, der nur ein Ergebnis zurueckliefert, haette genau diesen Bug nie
// gesehen (stehende Bau-Regel fuer Sender-/Client-Mocks).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// collect.jsx ist reines JS ohne Imports (nur die Dateiendung ist .jsx), laesst
// sich also als Data-URL-Modul laden. Kein Bundler, kein Transpiler noetig.
const SRC = readFileSync(new URL('../app/routes/collect.jsx', import.meta.url), 'utf8');
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(SRC, 'utf8').toString('base64')
);

const UPSTREAM = 'https://qpx.example.invalid/collect';
const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0';
const CLIENT_IP = '2003:d9:7f2b:1234::5';

/** Ruft die Route mit gestubbtem globalem fetch auf und gibt die Aufrufe zurueck. */
async function ruf({headers = {}, body = '{"events":[]}', env} = {}) {
  const calls = [];
  const echtesFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({url, init});
    return new Response('{}', {status: 200});
  };
  try {
    const request = new Request('https://qiblanco.com/collect', {
      method: 'POST',
      headers,
      body,
    });
    const response = await mod.action({
      request,
      context: {env: env ?? {QPX_PROXY_UPSTREAM: UPSTREAM}},
    });
    return {calls, response};
  } finally {
    globalThis.fetch = echtesFetch;
  }
}

/** Header-Zugriff case-insensitiv, egal ob init.headers Objekt oder Headers ist. */
function kopf(init, name) {
  return new Headers(init.headers ?? {}).get(name);
}

test('DER FIX: der Browser-User-Agent wird an den Receiver weitergereicht', async () => {
  const {calls} = await ruf({
    headers: {'User-Agent': BROWSER_UA, 'Content-Type': 'application/json'},
  });

  assert.equal(calls.length, 1, 'Upstream wurde nicht genau einmal gerufen');
  assert.equal(
    kopf(calls[0].init, 'User-Agent'),
    BROWSER_UA,
    'User-Agent fehlt im Upstream-Fetch — ua_hash/device_fp bleiben NULL',
  );
});

test('DER FIX: die echte Client-IP reist als X-Forwarded-For mit (CF-Connecting-IP)', async () => {
  const {calls} = await ruf({
    headers: {'User-Agent': BROWSER_UA, 'CF-Connecting-IP': CLIENT_IP},
  });

  assert.equal(
    kopf(calls[0].init, 'X-Forwarded-For'),
    CLIENT_IP,
    'Client-IP fehlt — der Receiver haesht sonst die Egress-IP des Oxygen-Edge',
  );
});

test('Rueckfall: ohne CF-Connecting-IP zaehlt der LINKESTE X-Forwarded-For-Eintrag', async () => {
  const {calls} = await ruf({
    headers: {
      'User-Agent': BROWSER_UA,
      'X-Forwarded-For': `${CLIENT_IP}, 10.0.0.1, 172.16.0.9`,
    },
  });

  assert.equal(
    kopf(calls[0].init, 'X-Forwarded-For'),
    CLIENT_IP,
    'Der linkeste XFF-Eintrag ist die echte Client-IP (basis.client_ip liest genau den)',
  );
});

test('KEINE REGRESSION: Content-Type bleibt gesetzt', async () => {
  const {calls} = await ruf({headers: {'User-Agent': BROWSER_UA}});
  assert.equal(kopf(calls[0].init, 'Content-Type'), 'application/json');
});

test('KEINE REGRESSION: Body und Methode reisen unveraendert weiter', async () => {
  const body = '{"events":[{"event_name":"page_view"}]}';
  const {calls} = await ruf({headers: {'User-Agent': BROWSER_UA}, body});
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.body, body);
  assert.equal(calls[0].url, UPSTREAM);
});

test('fail-soft: ohne UA und ohne IP wird kein leerer/erfundener Header gesendet', async () => {
  const {calls, response} = await ruf({headers: {}});
  const ua = kopf(calls[0].init, 'User-Agent');
  const xff = kopf(calls[0].init, 'X-Forwarded-For');
  assert.ok(!ua, `leerer User-Agent wurde als Header gesendet: ${JSON.stringify(ua)}`);
  assert.ok(!xff, `leerer X-Forwarded-For wurde gesendet: ${JSON.stringify(xff)}`);
  assert.equal(response.status, 200);
});

test('KEINE REGRESSION: Cookie-Refresh (ITP) laeuft weiter', async () => {
  const anon = 'a184b103-5aa6-41be-bbf5-90d37d1b07f9';
  const {response} = await ruf({
    headers: {'User-Agent': BROWSER_UA, Cookie: `_qpx_anon=${anon}`},
  });
  const setCookie = response.headers.getSetCookie?.() ?? [];
  assert.ok(
    setCookie.some((c) => c.startsWith('_qpx_anon=')),
    'der 400-Tage-Cookie-Refresh regressierte',
  );
});

test('KEINE REGRESSION: ohne QPX_PROXY_UPSTREAM bleibt die Route 404 (fail-closed)', async () => {
  const {calls, response} = await ruf({headers: {'User-Agent': BROWSER_UA}, env: {}});
  assert.equal(response.status, 404);
  assert.equal(calls.length, 0, 'ohne Upstream darf kein Fetch passieren');
});
