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
const {EINWILLIGUNG_FASSUNG} = await import('../app/lib/einwilligung-texte.js');
// Fixturen folgen der laufenden Fassung (Fassung 2.0 kam mit #1308): eine Wahl
// gilt nur ab deren Hauptnummer, eine ältere zählt als keine Wahl.
const HAUPT = Number(String(EINWILLIGUNG_FASSUNG).split('.')[0]);
const AKTUELL = EINWILLIGUNG_FASSUNG;
const VORHER = `${HAUPT - 1}.9`;

const JETZT = Date.parse('2026-11-01T12:00:00Z');
const wahl = (o) =>
  'CookieConsent=' +
  encodeURIComponent(
    `{stamp:'x',necessary:true,preferences:${o.p ?? false},statistics:${o.s},marketing:${o.m},` +
      `method:'explicit',ver:1,utc:${o.utc ?? JETZT - 1000},region:'de'` +
      (o.qbv === null ? '' : `,qbv:'${o.qbv ?? AKTUELL}'`) +
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
  assert.equal(tor.wahlAusCookie(wahl({s: true, m: true, qbv: VORHER}), JETZT), null);
  // ohne qbv gilt Fassung 1: unter einer späteren Hauptnummer keine Wahl
  assert.equal(tor.wahlAusCookie(wahl({s: true, m: true, qbv: null}), JETZT), HAUPT > 1 ? null : {statistics: true, marketing: true});
  assert.deepEqual(tor.wahlAusCookie(wahl({s: false, m: true, qbv: `${HAUPT}.2`}), JETZT), {statistics: false, marketing: true});
});

test('shopifyTorStand: Einwilligungsregion montiert erst nach der Wahl', () => {
  assert.deepEqual(tor.shopifyTorStand(fenster({})), {montieren: false, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: false, consent: {statistics: true}}})), {montieren: false, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: false}}})), {montieren: true, tracken: false});
  // Wahl mit Statistik: zählen erst, wenn Shopify die Wahl übernommen hat (Messung 2026-11-04:
  // sonst verwirft Hydrogen das page_viewed der Seite, auf der gewählt wurde).
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: true}}})), {montieren: true, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: true}}, apa: false})), {montieren: true, tracken: false});
  assert.deepEqual(tor.shopifyTorStand(fenster({cb: {hasResponse: true, consent: {statistics: true}}, apa: true})), {montieren: true, tracken: true});
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
  assert.deepEqual(
    tor.shopifyTorStand(fenster({...o, cb: {hasResponse: true, consent: {statistics: true}}})),
    {montieren: true, tracken: false},
  );
  assert.deepEqual(
    tor.shopifyTorStand(fenster({...o, apa: true, cb: {hasResponse: true, consent: {statistics: true}}})),
    {montieren: true, tracken: true},
  );
});

test('shopifyDarfTracken: am Server false', () => {
  assert.equal(tor.shopifyDarfTracken(), false);
});

test('shopifyServerErlaubt: Rückweg-Motor cookiebot prüft keine Fassung, Motor eigen schon', () => {
  const cookiebotWahl = wahl({s: true, m: false, qbv: null, utc: Date.now() - 1000});
  const viaQuery = new Request('https://example.test/?qb_einwilligung=cookiebot', {
    headers: {'oxygen-buyer-country': 'DE', Cookie: cookiebotWahl},
  });
  assert.deepEqual(tor.shopifyServerErlaubt(viaQuery, {}), {_shopify_analytics: true, _shopify_marketing: false});
  const viaCookie = new Request('https://example.test/', {
    headers: {'oxygen-buyer-country': 'CH', Cookie: `qb_einwilligung_motor=cookiebot; ${cookiebotWahl}`},
  });
  assert.deepEqual(tor.shopifyServerErlaubt(viaCookie, {}), {_shopify_analytics: true, _shopify_marketing: false});
  const eigen = new Request('https://example.test/', {
    headers: {'oxygen-buyer-country': 'CH', Cookie: cookiebotWahl},
  });
  assert.deepEqual(tor.shopifyServerErlaubt(eigen, {}), {_shopify_analytics: false, _shopify_marketing: false});
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

test('shopifyServerErlaubt: GPC ohne Wahl in einer Opt-out-Region sperrt Marketing (Z11 s02)', () => {
  const env = {PUBLIC_CONSENT_STRICT_REGIONS: 'DE,AT,CH'};
  const ohne = new Request('https://example.test/', {headers: {'oxygen-buyer-country': 'US'}});
  const gpc = new Request('https://example.test/', {headers: {'oxygen-buyer-country': 'US', 'Sec-GPC': '1'}});
  const gpcMitWahl = new Request('https://example.test/', {
    headers: {'oxygen-buyer-country': 'US', 'Sec-GPC': '1', Cookie: wahl({s: true, m: true, utc: Date.now() - 1000})},
  });
  const gpcDe = new Request('https://example.test/', {headers: {'oxygen-buyer-country': 'DE', 'Sec-GPC': '1'}});
  assert.deepEqual(tor.shopifyServerErlaubt(ohne, env), {_shopify_analytics: true, _shopify_marketing: true});
  assert.deepEqual(tor.shopifyServerErlaubt(gpc, env), {_shopify_analytics: true, _shopify_marketing: false});
  assert.deepEqual(tor.shopifyServerErlaubt(gpcMitWahl, env), {_shopify_analytics: true, _shopify_marketing: true});
  assert.deepEqual(tor.shopifyServerErlaubt(gpcDe, env), {_shopify_analytics: false, _shopify_marketing: false});
});
