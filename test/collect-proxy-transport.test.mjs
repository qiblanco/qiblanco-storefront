// Hermetische Tests des /collect-Proxys (Job 20260809-dach-tracking-schluessel-
// verlust-42prozent-fix-plus-quoten-waechter-prio1).
// Wie qpx-spa-pageview: node:test/node:assert als Bordmittel, KEIN Netz.
// Ausführen: node --test test/collect-proxy-transport.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT (gemessen 2026-08-09):
//   DACH: 0 von 11.037 Pixel-Events trugen device_fp/ua_hash — USA 1.367 von
//   2.036. Der Modus stand für BEIDE Shops auf `full`, es war also kein
//   Schalter-, sondern ein TRANSPORT-Problem:
//
//   Browser --(POST /collect, echter UA)--> Oxygen-Worker (diese Route)
//          --(fetch, NUR Content-Type)--> Caddy --> Receiver
//
//   Der Re-Fetch reichte den Browser-User-Agent nicht weiter. Der Receiver las
//   `self.headers.get("User-Agent","")` -> "" -> ua_hash()="" -> NULL, und
//   device_fp fällt in fingerprint.py:179 (`if not ua.strip() and belegt==0`)
//   ebenfalls auf "". Der USA-Shop ist ein Liquid-Theme und sendet den Beacon
//   DIREKT aus dem Browser — dort kam der UA deshalb immer an.
//
//   Zweiter, subtilerer Teil desselben Defekts: ohne Weiterreichen der echten
//   Client-IP trug der Receiver die EGRESS-IP DES OXYGEN-EDGE ein — der
//   DACH-`ip_net_hash` war also nicht nur dünn, sondern FALSCH. Das erklärt die
//   gemessenen 190 verschiedenen Besucher hinter EINEM ip_net_hash.
//
// KORREKTUR 2026-08-27 (Job 20260826-storefront-zwei-veraltete-regressions-
// tests-falsch-rot): Die IP-Hälfte dieser Datei nagelte bis heute einen Weg
// fest, der nachweislich NIE funktioniert hat — sie erwartete die Client-IP im
// Upstream-Fetch unter `X-Forwarded-For` und war deshalb ab Commit a7037d3
// (#227) dauerhaft rot, ohne dass irgendetwas kaputt war. Zwei gemessene
// Gründe, jeder allein hinreichend (Volltext im Kopf von app/routes/collect.jsx):
//
//   [1] `CF-Connecting-IP` existiert auf Oxygen nicht — die Cloudflare-Edge
//       beansprucht den Namen selbst und weist einen vom Client gesetzten Wert
//       mit "error code: 1000" ab. Der belegte Träger heisst `oxygen-buyer-ip`.
//   [2] Caddy >= 2.7 ERSETZT einen eingehenden `X-Forwarded-For` durch die
//       Peer-Adresse, solange der Absender nicht in `trusted_proxies` steht.
//       Über X-Forwarded-For kann diese Route den Receiver BAULICH nie
//       erreichen.
//
// Deshalb reist die IP unter eigenem Namen (`X-QPX-Client-IP`), und die Tests
// unten prüfen genau das: den Träger, die Reihenfolge der Quellen und `ipsrc`
// als Rückkanal. Der CF-/XFF-Zweig steht weiter im Code — aber als RÜCKFALL
// für lokales `h2 dev` und einen etwaigen Umzug, nicht als Hauptweg. Er wird
// hier auch als Rückfall getestet: er darf nur greifen, wenn `oxygen-buyer-ip`
// fehlt.
//
// Der Mock zeichnet die ÜBERGEBENEN ARGUMENTE auf und asserted darauf — ein
// Mock, der nur ein Ergebnis zurückliefert, hätte genau diesen Bug nie
// gesehen (stehende Bau-Regel für Sender-/Client-Mocks).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// collect.jsx ist reines JS ohne Imports (nur die Dateiendung ist .jsx), lässt
// sich also als Data-URL-Modul laden. Kein Bundler, kein Transpiler nötig.
const SRC = readFileSync(new URL('../app/routes/collect.jsx', import.meta.url), 'utf8');
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(SRC, 'utf8').toString('base64')
);

const UPSTREAM = 'https://qpx.example.invalid/collect';
const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0';
const CLIENT_IP = '2003:d9:7f2b:1234::5';
// Bewusst VERSCHIEDENE Werte je Quelle: nur so zeigt ein Test, welche der drei
// Quellen tatsächlich gelesen wurde. Mit dreimal derselben IP wäre jede
// Reihenfolge grün — und die Zusicherung wertlos.
const FALLBACK_CF_IP = '2003:d9:7f2b:1234::c7';
const FALLBACK_XFF_IP = '2003:d9:7f2b:1234::ff';

/** Ruft die Route mit gestubbtem globalem fetch auf und gibt die Aufrufe zurück. */
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

test('DER FIX: die echte Client-IP reist unter X-QPX-Client-IP mit', async () => {
  const {calls, response} = await ruf({
    headers: {'User-Agent': BROWSER_UA, 'oxygen-buyer-ip': CLIENT_IP},
  });

  assert.equal(
    kopf(calls[0].init, 'X-QPX-Client-IP'),
    CLIENT_IP,
    'Client-IP fehlt — der Receiver hasht sonst die Egress-IP des Oxygen-Edge',
  );
  assert.equal(
    (await response.json()).ipsrc,
    'oxygen-buyer-ip',
    'ipsrc muss die benutzte Quelle benennen (Rückkanal für die Naht-Messung)',
  );
});

test('X-Forwarded-For ist NIE der Träger — Caddy würde ihn ersetzen', async () => {
  // Die Gegenrichtung des Fixes, und der eigentliche Grund für diesen Test:
  // wer die IP "wieder auf den Standard-Header" zurückstellt, baut den
  // wirkungslosen Zustand von 2026-08-09 bis 08-16 nach, ohne dass sonst
  // irgendetwas rot würde.
  const {calls} = await ruf({
    headers: {'User-Agent': BROWSER_UA, 'oxygen-buyer-ip': CLIENT_IP},
  });

  assert.equal(
    kopf(calls[0].init, 'X-Forwarded-For'),
    null,
    'X-Forwarded-For wird von Caddy >= 2.7 durch die Peer-Adresse ersetzt — ' +
      'über ihn erreicht die IP den Receiver baulich nicht',
  );
});

test('REIHENFOLGE: oxygen-buyer-ip schlägt beide Rückfälle', async () => {
  // Alle drei Quellen gesetzt, mit UNTERSCHIEDLICHEN Werten — sonst könnte der
  // Test nicht zeigen, welche davon tatsächlich gelesen wurde.
  const {calls, response} = await ruf({
    headers: {
      'User-Agent': BROWSER_UA,
      'oxygen-buyer-ip': CLIENT_IP,
      'CF-Connecting-IP': FALLBACK_CF_IP,
      'X-Forwarded-For': `${FALLBACK_XFF_IP}, 10.0.0.1`,
    },
  });

  assert.equal(
    kopf(calls[0].init, 'X-QPX-Client-IP'),
    CLIENT_IP,
    'oxygen-buyer-ip ist der einzige auf Oxygen belegte Träger und muss gewinnen',
  );
  assert.equal((await response.json()).ipsrc, 'oxygen-buyer-ip');
});

test('RÜCKFALL (nicht Hauptweg): CF-Connecting-IP greift nur ohne oxygen-buyer-ip', async () => {
  // Für lokales `h2 dev` bzw. einen etwaigen Umzug hinter einen echten
  // CF-Worker. Auf Oxygen kommt dieser Header nie an.
  const {calls, response} = await ruf({
    headers: {
      'User-Agent': BROWSER_UA,
      'CF-Connecting-IP': FALLBACK_CF_IP,
      'X-Forwarded-For': `${FALLBACK_XFF_IP}, 10.0.0.1`,
    },
  });

  assert.equal(kopf(calls[0].init, 'X-QPX-Client-IP'), FALLBACK_CF_IP);
  assert.equal((await response.json()).ipsrc, 'cf-connecting-ip');
});

test('RÜCKFALL (nicht Hauptweg): linkester X-Forwarded-For, wenn sonst nichts da ist', async () => {
  const {calls, response} = await ruf({
    headers: {
      'User-Agent': BROWSER_UA,
      'X-Forwarded-For': `${FALLBACK_XFF_IP}, 10.0.0.1, 172.16.0.9`,
    },
  });

  assert.equal(
    kopf(calls[0].init, 'X-QPX-Client-IP'),
    FALLBACK_XFF_IP,
    'der linkeste Eintrag ist die client-nächste Adresse',
  );
  assert.equal((await response.json()).ipsrc, 'x-forwarded-for');
});

test('KEINE REGRESSION: Content-Type bleibt gesetzt', async () => {
  const {calls} = await ruf({headers: {'User-Agent': BROWSER_UA}});
  assert.equal(kopf(calls[0].init, 'Content-Type'), 'application/json');
});

test('KEINE REGRESSION: Body und Methode reisen unverändert weiter', async () => {
  const body = '{"events":[{"event_name":"page_view"}]}';
  const {calls} = await ruf({headers: {'User-Agent': BROWSER_UA}, body});
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.body, body);
  assert.equal(calls[0].url, UPSTREAM);
});

test('fail-soft: ohne UA und ohne IP wird kein leerer/erfundener Header gesendet', async () => {
  const {calls, response} = await ruf({headers: {}});
  const ua = kopf(calls[0].init, 'User-Agent');
  const ip = kopf(calls[0].init, 'X-QPX-Client-IP');
  assert.ok(!ua, `leerer User-Agent wurde als Header gesendet: ${JSON.stringify(ua)}`);
  assert.ok(!ip, `leerer X-QPX-Client-IP wurde gesendet: ${JSON.stringify(ip)}`);
  assert.equal(response.status, 200);
  // Der Receiver soll "nicht gemessen" von "gemessen und leer" unterscheiden
  // können — deshalb sagt ipsrc hier ausdrücklich 'keine' statt ''.
  assert.equal(
    (await response.json()).ipsrc,
    'keine',
    'ein stiller Rückfall auf die Egress-IP muss am Rückkanal sichtbar werden',
  );
});

test('KEINE REGRESSION: Cookie-Refresh (ITP) läuft weiter', async () => {
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
