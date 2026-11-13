// Länder-Weiche DE -> US (Elina EL-20261113-73c7c1f9). node --test test/laender-weiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  laenderWeiche,
  laenderWeicheEntscheiden,
  sitzungMerken,
  usGegenseite,
  istRoboter,
  WEICHE_AKTIV_AB,
} from '../app/lib/laender-weiche.js';

const NACH = Date.parse('2026-11-13T20:36:00Z');
const VOR = Date.parse('2026-11-13T20:34:00Z');
const BROWSER =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

function req(pfad, {land = 'US', ua = BROWSER, cookie, referer, method = 'GET'} = {}) {
  const h = new Headers({'user-agent': ua});
  if (land !== null) h.set('oxygen-buyer-country', land);
  if (cookie) h.set('cookie', cookie);
  if (referer) h.set('referer', referer);
  return new Request('https://qiblanco.com' + pfad, {method, headers: h});
}
const ent = (r, jetzt = NACH) => laenderWeicheEntscheiden(r, {jetzt});

test('Startzeit 21:35 Berlin = 20:35Z', () => {
  assert.equal(WEICHE_AKTIV_AB, '2026-11-13T20:35:00Z');
  assert.equal(ent(req('/'), VOR).art, 'bleiben');
  assert.equal(ent(req('/'), NACH).art, 'weiter');
  assert.equal(laenderWeiche(req('/'), {jetzt: NACH, schalter: false}), null);
});

test('Länder: EU, CH, LI, NO, IS bleiben; US, GB, TH, CA, AU gehen', () => {
  for (const l of ['DE', 'AT', 'CH', 'LI', 'NO', 'IS', 'FR', 'PL', 'SE', 'IE', 'CY', 'RE', 'AX']) {
    assert.equal(ent(req('/', {land: l})).art, 'bleiben', l);
  }
  for (const l of ['US', 'GB', 'TH', 'CA', 'AU', 'AE', 'TR', 'RS', 'UA']) {
    assert.equal(ent(req('/', {land: l})).art, 'weiter', l);
  }
});

test('Land unbekannt: bleibt (fail-closed)', () => {
  for (const l of [null, '', 'XX', 'T1', 'usa']) {
    assert.equal(ent(req('/', {land: l})).art, 'bleiben', String(l));
  }
});

test('Gegenseiten: Produkt, bf-deals, Pre-Access, Startseite, Deals', () => {
  const z = (p) => ent(req(p)).ziel;
  assert.equal(z('/'), 'https://qi-blanco.com/');
  assert.equal(z('/products/qione-2-pro'), 'https://qi-blanco.com/products/qione');
  assert.equal(z('/products/qione-kette'), 'https://qi-blanco.com/products/necklace');
  assert.equal(z('/products/qihome-air'), 'https://qi-blanco.com/products/qihome');
  assert.equal(z('/products/qibracelet'), 'https://qi-blanco.com/products/qibracelet');
  assert.equal(z('/pages/bf-deals'), 'https://qi-blanco.com/pages/bf-deals');
  assert.equal(z('/pages/bf-deals-b'), 'https://qi-blanco.com/pages/bf-deals-b');
  assert.equal(z('/pages/pre-access'), 'https://qi-blanco.com/pages/pre-access');
  assert.equal(z('/pages/pre-access-b'), 'https://qi-blanco.com/pages/pre-access-b');
  assert.equal(z('/pages/Qi-Alpha'), 'https://qi-blanco.com/pages/Qi-Alpha');
  assert.equal(z('/products/8kendiw34hd'), 'https://qi-blanco.com/pages/rk3xmgho0m0');
  assert.equal(z('/products/pjdz538hgs0'), 'https://qi-blanco.com/pages/b9rkk99ssbm');
  assert.equal(z('/products/687ghgf4ed'), 'https://qi-blanco.com/pages/w3ickm27k2i');
  assert.equal(z('/products/56huz67dds'), 'https://qi-blanco.com/pages/c4173cw1v79');
  assert.equal(z('/products/j7hcyb802kn'), 'https://qi-blanco.com/pages/izw9jai5k5x');
  assert.equal(z('/pages/impressum'), 'https://qi-blanco.com/pages/imprint');
  assert.equal(z('/blogs/journal/irgendwas'), 'https://qi-blanco.com/');
  // nach Ende der BF-Codes fällt die Deal-Zuordnung weg
  assert.equal(usGegenseite('/products/8kendiw34hd', Date.parse('2026-12-01T00:00:00Z')), 'https://qi-blanco.com/');
});

test('Abfrage-Parameter reisen mit', () => {
  assert.equal(
    ent(req('/products/qione-2-pro?utm_source=meta&fbclid=abc')).ziel,
    'https://qi-blanco.com/products/qione?utm_source=meta&fbclid=abc',
  );
});

test('?markt=DE: keine Weiterleitung und Sitzung merken; jedes ?markt= ist Prüf-Ausnahme', () => {
  const e = ent(req('/?markt=DE'));
  assert.equal(e.art, 'bleiben');
  assert.equal(sitzungMerken(req('/?markt=de'), {jetzt: NACH}), true);
  assert.equal(sitzungMerken(req('/?markt=DE'), {jetzt: VOR}), true);
  assert.equal(ent(req('/?markt=US')).art, 'bleiben');
  assert.equal(sitzungMerken(req('/?markt=US'), {jetzt: NACH}), false);
  assert.equal(ent(req('/', {cookie: 'a=1; qb_markt=DE'})).art, 'bleiben');
  assert.equal(ent(req('/', {cookie: 'qb_markt=US'})).art, 'weiter');
});

test('laufender Warenkorb: keine Weiterleitung', () => {
  assert.equal(ent(req('/products/qione-2-pro', {cookie: 'cart=hWN1abc; _y=1'})).art, 'bleiben');
  assert.equal(ent(req('/products/qione-2-pro', {cookie: 'cart_currency=EUR'})).art, 'weiter');
});

test('Pfade außerhalb der Seiten bleiben', () => {
  for (const p of ['/cart', '/cart/123:1', '/checkout', '/account/login', '/api/2026-04/graphql.json',
    '/discount/BF26', '/sitemap.xml', '/robots.txt', '/products/qione-2-pro.data', '/__manifest',
    '/favicon.ico', '/collect']) {
    assert.equal(ent(req(p)).art, 'bleiben', p);
  }
  assert.equal(ent(req('/', {method: 'POST'})).art, 'bleiben');
  assert.equal(ent(req('/', {method: 'HEAD'})).art, 'weiter');
});

test('Roboter bleiben, normale Browser nicht', () => {
  for (const ua of [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'Mozilla/5.0 (compatible; YandexBot/3.0)',
    'Twitterbot/1.0',
    'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0)',
    'Storebot-Google/1.0',
    '',
  ]) {
    assert.equal(istRoboter(ua), true, ua);
    assert.equal(ent(req('/', {ua})).art, 'bleiben', ua);
  }
  for (const ua of [
    BROWSER,
    'Mozilla/5.0 (Linux; Android 10; CUBOT X30 Build/QP1A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
    'curl/8.5.0',
  ]) {
    assert.equal(istRoboter(ua), false, ua);
  }
});

test('Klick vom US-Shop: bleibt und merkt sich die Sitzung', () => {
  const r = () => req('/products/qione-2-pro', {referer: 'https://qi-blanco.com/products/qione'});
  assert.equal(ent(r()).art, 'bleiben');
  assert.equal(sitzungMerken(r(), {jetzt: NACH}), true);
  assert.equal(ent(req('/', {referer: 'https://www.google.com/'})).art, 'weiter');
});

test('Antwort: 302, no-store, Location', () => {
  const a = laenderWeiche(req('/pages/pre-access'), {jetzt: NACH});
  assert.equal(a.status, 302);
  assert.equal(a.headers.get('location'), 'https://qi-blanco.com/pages/pre-access');
  assert.equal(a.headers.get('cache-control'), 'no-store');
  assert.equal(laenderWeiche(req('/pages/pre-access', {land: 'CH'}), {jetzt: NACH}), null);
});
