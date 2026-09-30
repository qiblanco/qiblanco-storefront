// Hermetische Tests der Kakao-Laden-Weiche (Auftrag
// 20260930-growth-crystal-laden-zulauf-traeger). Bordmittel, kein Netz.
// Ausfuehren: node --test test/kakao-laden-weiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  entscheideKakaoWeiche,
  herkunftsKlasse,
  refererHost,
  kakaoLadenZiel,
  KAKAO_WEICHE_EIN,
} from '../app/lib/kakao-laden-weiche.server.js';

const Q = 'https://qiblanco.com';
const EIN = KAKAO_WEICHE_EIN;

function ent(pfad, referer, schalter = EIN) {
  return entscheideKakaoWeiche({url: `${Q}${pfad}`, referer, schalter});
}

// --- Eigene Kanaele werden umgeleitet ----------------------------------------

test('Instagram-Bio (utm) auf der Landeseite -> Startseite des eigenen Ladens', () => {
  const r = ent('/pages/crystal-cacao?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    'https://l.instagram.com/');
  assert.equal(r.grund, 'eigener_kanal');
  assert.equal(
    r.ziel,
    'https://crystal-cacao.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&qb_weg=qiblanco-kakao',
  );
});

test('Newsletter-Klick auf Kaufseite Awake -> Kaufseite Awake, Query vollstaendig', () => {
  const r = ent('/products/crystal-cacao-awake?Art=420g&utm_source=newsletter&utm_medium=email&utm_campaign=Tag+2',
    'https://mail.google.com/');
  assert.equal(
    r.ziel,
    'https://crystal-cacao.com/products/crystal-cacao-awake?Art=420g&utm_source=newsletter&utm_medium=email&utm_campaign=Tag+2&qb_weg=qiblanco-kakao',
  );
});

test('Facebook organisch mit fbclid (kein Bezahl-Marker) -> umgeleitet, fbclid faehrt mit', () => {
  const r = ent('/products/crystal-cacao-create?fbclid=IwAR0abc', 'https://m.facebook.com/');
  assert.equal(r.grund, 'eigener_kanal');
  assert.match(r.ziel, /^https:\/\/crystal-cacao\.com\/products\/crystal-cacao-create\?fbclid=IwAR0abc&qb_weg=qiblanco-kakao$/);
});

test('Gmail-App-Referrer ist Mail, nicht Suche', () => {
  assert.equal(refererHost('android-app://com.google.android.gm/'), 'com.google.android.gm');
  assert.equal(ent('/pages/crystal-cacao', 'android-app://com.google.android.gm/').grund, 'eigener_kanal');
  assert.equal(ent('/pages/crystal-cacao', 'https://mail.google.com/').grund, 'eigener_kanal');
});

test('Mail-Klick ohne Referrer, nur utm_medium=email -> umgeleitet', () => {
  assert.equal(ent('/pages/crystal-cacao?utm_source=newsletter&utm_medium=email', null).grund, 'eigener_kanal');
});

test('abschliessender Schraegstrich zaehlt wie die Seite', () => {
  assert.equal(ent('/pages/crystal-cacao/', 'https://www.instagram.com/').grund, 'eigener_kanal');
});

// --- Nie umgeleitet ----------------------------------------------------------

test('Suche bleibt (Google, Bing, Qwant)', () => {
  for (const ref of ['https://www.google.com/', 'https://www.google.de/', 'https://www.bing.com/', 'https://www.qwant.com/']) {
    const r = ent('/products/crystal-cacao-awake?srsltid=AfmBOo', ref);
    assert.equal(r.ziel, null, ref);
    assert.equal(r.grund, 'suche', ref);
  }
});

test('ohne Referrer und ohne Kanal-Parameter bleibt (Crawler, Lesezeichen)', () => {
  const r = ent('/pages/crystal-cacao', null);
  assert.equal(r.ziel, null);
  assert.equal(r.grund, 'ohne');
});

test('bezahlt bleibt, auch mit Social-Referrer', () => {
  for (const q of ['utm_source=facebook&utm_medium=paid&utm_campaign=1', 'gclid=abc', 'h_ad_id=12345678901', 'utm_medium=cpc']) {
    const r = ent(`/pages/crystal-cacao?${q}`, 'https://instagram.com/');
    assert.equal(r.ziel, null, q);
    assert.equal(r.grund, 'bezahlt', q);
  }
});

test('interne Navigation bleibt (Menue auf qiblanco.com, Rueckweg vom eigenen Laden)', () => {
  assert.equal(ent('/pages/crystal-cacao', 'https://qiblanco.com/').grund, 'intern');
  assert.equal(ent('/pages/crystal-cacao?utm_source=ig', 'https://www.qiblanco.com/products/qione-2-pro').grund, 'intern');
  assert.equal(ent('/pages/crystal-cacao', 'https://crystal-cacao.com/').grund, 'intern');
});

test('Datenrequests und fremde Seiten bleiben', () => {
  assert.equal(ent('/pages/crystal-cacao.data', 'https://l.instagram.com/').grund, 'datenrequest');
  assert.equal(ent('/pages/crystal-cacao?_data=routes', 'https://l.instagram.com/').grund, 'datenrequest');
  assert.equal(ent('/products/qione-2-pro', 'https://l.instagram.com/').grund, 'keine_kakao_seite');
  assert.equal(ent('/products/zeremonie-kakao', 'https://l.instagram.com/').grund, 'keine_kakao_seite');
});

test('Schleifenschutz und Healthcheck', () => {
  assert.equal(ent('/pages/crystal-cacao?qb_weg=qiblanco-kakao', 'https://l.instagram.com/').grund, 'schon_umgeleitet');
  assert.equal(ent('/pages/crystal-cacao?utm_source=r3check&utm_medium=social', null).grund, 'healthcheck');
});

// --- Schalter fail-safe -----------------------------------------------------

test('Schalter: nur eigene-kanaele schaltet ein; aus, leer, null, Tippfehler = aus', () => {
  for (const s of ['aus', '', null, undefined, 'an', 'eigene_kanaele', 'true']) {
    // direkt, nicht ueber ent(): dessen Vorgabewert machte aus undefined 'ein'
    const r = entscheideKakaoWeiche({url: `${Q}/pages/crystal-cacao`, referer: 'https://l.instagram.com/', schalter: s});
    assert.equal(r.ziel, null, String(s));
    assert.equal(r.grund, 'schalter_aus', String(s));
  }
  assert.ok(ent('/pages/crystal-cacao', 'https://l.instagram.com/', ' Eigene-Kanaele ').ziel);
});

test('herkunftsKlasse: utm_source allein (ohne medium) aus Social zaehlt als eigener Kanal', () => {
  assert.equal(herkunftsKlasse(new URLSearchParams('utm_source=instagram'), ''), 'eigener_kanal');
  assert.equal(herkunftsKlasse(new URLSearchParams('utm_source=partnerseite'), ''), 'andere');
});

// --- Loader-Adapter ----------------------------------------------------------

function req(url, referer, method = 'GET') {
  return new Request(url, {method, headers: referer ? {Referer: referer} : {}});
}
function sf(wert, {wirft = false, zaehler} = {}) {
  return {
    CacheCustom: () => ({}),
    query: async () => {
      if (zaehler) zaehler.n += 1;
      if (wirft) throw new Error('netz');
      return {shop: {metafield: wert === null ? null : {value: wert}}};
    },
  };
}

test('kakaoLadenZiel: Schalter an -> Ziel; Metafeld fehlt oder Lesefehler -> null (fail-safe)', async () => {
  const u = `${Q}/pages/crystal-cacao?utm_source=ig&utm_medium=social`;
  assert.match(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/'), context: {storefront: sf(EIN)}}),
    /^https:\/\/crystal-cacao\.com\/\?/);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/'), context: {storefront: sf(null)}}), null);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/'), context: {storefront: sf(EIN, {wirft: true})}}), null);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/'), context: {}}), null);
});

test('kakaoLadenZiel: Suche fragt den Schalter gar nicht erst; POST nie', async () => {
  const z = {n: 0};
  const u = `${Q}/pages/crystal-cacao`;
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://www.google.com/'), context: {storefront: sf(EIN, {zaehler: z})}}), null);
  assert.equal(z.n, 0);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/', 'POST'), context: {storefront: sf(EIN, {zaehler: z})}}), null);
  assert.equal(z.n, 0);
});
