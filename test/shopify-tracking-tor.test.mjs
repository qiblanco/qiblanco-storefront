/**
 * Tor für Hydrogens Shopify-Analytik (app/lib/shopify-tracking-tor.js, Auftrag
 * einwilligung-scanner-20261023T144303Z, Segment s03): die reinen Teile ohne Browser.
 * Die Wirkung im Browser misst homepage-bauer/pruefungen/probe_shopify_vor_der_wahl.py.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
});

const tor = await import('../app/lib/shopify-tracking-tor.js');

const JETZT = Date.parse('2026-11-01T12:00:00Z');
const wahl = (o) =>
  'CookieConsent=' +
  encodeURIComponent(
    `{stamp:'x',necessary:true,preferences:${o.p ?? false},statistics:${o.s},marketing:${o.m},` +
      `method:'explicit',ver:1,utc:${o.utc ?? JETZT - 1000},region:'de'` +
      (o.qbv ? `,qbv:'${o.qbv}'` : '') +
      '}',
  );

function fenster({cb, strikt, region, apa} = {}) {
  const attr = {'data-qb-consent-strict': strikt ?? '', 'data-qb-region': region ?? ''};
  return {
    Cookiebot: cb,
    Shopify: apa === undefined ? undefined : {customerPrivacy: {analyticsProcessingAllowed: () => apa}},
    document: {documentElement: {getAttribute: (n) => attr[n] ?? null}},
  };
}

test('wahlAusCookie: gültige Wahl, keine, abgelaufen, alte Fassung', () => {
  assert.deepEqual(tor.wahlAusCookie(wahl({s: true, m: false}), JETZT), {statistics: true, marketing: false});
  assert.equal(tor.wahlAusCookie('', JETZT), null);
  assert.equal(tor.wahlAusCookie('andere=1', JETZT), null);
  assert.equal(tor.wahlAusCookie(wahl({s: true, m: true, utc: JETZT - 366 * 86400000}), JETZT), null);
  assert.equal(tor.wahlAusCookie(wahl({s: true, m: true, qbv: '0.9'}), JETZT), null);
  assert.deepEqual(tor.wahlAusCookie(wahl({s: false, m: true, qbv: '1.2'}), JETZT), {statistics: false, marketing: true});
});

test('shopifyTorStand: Einwilligungsregion montiert erst nach der Wahl', () => {
  assert.deepEqual(tor.shopifyTorStand(fenster({})), {montieren: false, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: false, consent: {statistics: true}}})), {montieren: false, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: false}}})), {montieren: true, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: true}}})), {montieren: true, tracken: true});
  // Region strikt gelistet -> consent
  assert.deepEqual(tor.shopifyTorStand(fenster({strikt: 'DE,AT', region: 'DE'})), {montieren: false, tracken: false});
});

test('shopifyTorStand: optout-Region wie vorher, Shopifys eigene Ablehnung zählt ohne Wahl', () => {
  const o = {strikt: 'DE,AT', region: 'US'};
  assert.deepEqual(tor.shopifyTorStand(fenster(o)), {montieren: true, tracken: true});
  assert.deepEqual(tor.shopifyTorStand(fenster({...o, apa: false})), {montieren: true, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({...o, apa: true})), {montieren: true, tracken: true});
  assert.deepEqual(
    tor.shopifyTorStand(fenster({...o, apa: true, cb: {hasResponse: true, consent: {statistics: false}}})),
    {montieren: true, tracken: false},
  );
});

test('shopifyDarfTracken: am Server false', () => {
  assert.equal(tor.shopifyDarfTracken(), false);
});

test('istLoeschung', () => {
  assert.equal(tor.istLoeschung('_shopify_analytics=; Path=/', JETZT), true);
  assert.equal(tor.istLoeschung('_shopify_analytics=x; Max-Age=0; Path=/', JETZT), true);
  assert.equal(tor.istLoeschung('_shopify_analytics=x; Expires=Thu, 01 Jan 1970 00:00:00 GMT', JETZT), true);
  assert.equal(tor.istLoeschung('_shopify_analytics=x; Max-Age=31536000; HttpOnly', JETZT), false);
  assert.equal(tor.istLoeschung('_shopify_analytics=x; Expires=Mon, 01 Nov 2027 00:00:00 GMT', JETZT), false);
});

test('filtereShopifyCookies: nur verbotene Setzzeilen fallen, Löschzeilen und Rest bleiben', () => {
  const h = new Headers();
  h.append('Set-Cookie', '_shopify_essential=e; Path=/; HttpOnly');
  h.append('Set-Cookie', '_shopify_analytics=a; Max-Age=31536000; HttpOnly');
  h.append('Set-Cookie', '_shopify_marketing=m; Max-Age=31536000; HttpOnly');
  h.append('Set-Cookie', 'cart=c; Path=/');
  const n = tor.filtereShopifyCookies(h, {_shopify_analytics: false, _shopify_marketing: false});
  assert.equal(n, 2);
  assert.deepEqual(h.getSetCookie().map((z) => z.split('=')[0]), ['_shopify_essential', 'cart']);

  const w = new Headers();
  w.append('Set-Cookie', '_shopify_analytics=; Max-Age=0; Path=/');
  w.append('Set-Cookie', '_shopify_marketing=m; Max-Age=31536000');
  assert.equal(tor.filtereShopifyCookies(w, {_shopify_analytics: false, _shopify_marketing: true}), 0);
  assert.equal(w.getSetCookie().length, 2);
});

test('ohneServerTracking: nur der Merker fällt, der Rest von Server-Timing bleibt', () => {
  const h = new Headers();
  h.append('Server-Timing', '_y;desc=aaa, _s;desc=bbb');
  h.append('Server-Timing', '_server_tracking;desc=1');
  h.append('Server-Timing', '_sfapi_proxy;desc=1');
  tor.ohneServerTracking(h);
  const st = h.get('Server-Timing');
  assert.ok(!st.includes('_server_tracking'), st);
  for (const k of ['_y;desc=aaa', '_s;desc=bbb', '_sfapi_proxy;desc=1']) assert.ok(st.includes(k), st);

  const nur = new Headers({'Server-Timing': '_server_tracking;desc=1'});
  tor.ohneServerTracking(nur);
  assert.equal(nur.get('Server-Timing'), null);
});

test('shopifyServerTorEinbauen: Dokument ohne Wahl verliert Statistik-Cookies und den Merker', async () => {
  const antwort = new Response('<html></html>', {headers: {'content-type': 'text/html'}});
  const storefront = {
    setCollectedSubrequestHeaders(r) {
      r.headers.append('Set-Cookie', '_shopify_essential=e; Path=/');
      r.headers.append('Set-Cookie', '_shopify_analytics=a; Max-Age=31536000');
      r.headers.append('Server-Timing', '_y;desc=a, _s;desc=b, _cmp;desc=c');
      r.headers.append('Server-Timing', '_server_tracking;desc=1');
    },
    forward: async () => {
      const r = new Response('{}');
      r.headers.append('Set-Cookie', '_shopify_marketing=m; Max-Age=31536000');
      return r;
    },
  };
  const req = new Request('https://example.test/', {headers: {'oxygen-buyer-country': 'DE'}});
  tor.shopifyServerTorEinbauen(storefront, req, {});
  storefront.setCollectedSubrequestHeaders(antwort);
  assert.deepEqual(antwort.headers.getSetCookie().map((z) => z.split('=')[0]), ['_shopify_essential']);
  assert.ok(!antwort.headers.get('Server-Timing').includes('_server_tracking'));
  const fw = await storefront.forward();
  assert.equal(fw.headers.getSetCookie().length, 0);

  const mitWahl = new Request('https://example.test/', {
    headers: {'oxygen-buyer-country': 'DE', Cookie: wahl({s: true, m: true, utc: Date.now() - 1000})},
  });
  const sf2 = {
    forward: async () => {
      const r = new Response('{}');
      r.headers.append('Set-Cookie', '_shopify_marketing=m; Max-Age=31536000');
      return r;
    },
  };
  tor.shopifyServerTorEinbauen(sf2, mitWahl, {});
  assert.equal((await sf2.forward()).headers.getSetCookie().length, 1);
});
