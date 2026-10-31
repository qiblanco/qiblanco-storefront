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
const C_ALT = 'https://crystal-cacao.com';
const EIN = KAKAO_WEICHE_EIN;

function ent(pfad, referer, schalter = EIN) {
  return entscheideKakaoWeiche({url: `${Q}${pfad}`, referer, schalter});
}

// --- Eigene Kanäle werden umgeleitet ----------------------------------------

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

test('Facebook organisch mit fbclid (kein Bezahl-Marker) -> umgeleitet, fbclid fährt mit', () => {
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

test('abschließender Schrägstrich zählt wie die Seite', () => {
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

test('interne Navigation bleibt (Menü auf qiblanco.com, Rückweg vom eigenen Laden)', () => {
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
    // direkt, nicht über ent(): dessen Vorgabewert machte aus undefined 'ein'
    const r = entscheideKakaoWeiche({url: `${Q}/pages/crystal-cacao`, referer: 'https://l.instagram.com/', schalter: s});
    assert.equal(r.ziel, null, String(s));
    assert.equal(r.grund, 'schalter_aus', String(s));
  }
  assert.ok(ent('/pages/crystal-cacao', 'https://l.instagram.com/', ' Eigene-Kanaele ').ziel);
});

test('herkunftsKlasse: utm_source allein (ohne medium) aus Social zählt als eigener Kanal', () => {
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

// Seit Stufe 2 ('alle', EL-20261030-0adb59f3) fragt auch ein Suchbesuch auf
// einer Kakao-Adresse den Schalter (genau einmal, 30-s-Cache): bei 'alle'
// wird auch er weitergeleitet. Bei 'eigene-kanaele' bleibt er auf der Seite.
// Nicht-Kakao-Seiten fragen weiterhin nie.
test('kakaoLadenZiel: Suche bleibt bei eigene-kanaele; Nicht-Kakao fragt nie; POST nie', async () => {
  const z = {n: 0};
  const u = `${Q}/pages/crystal-cacao`;
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://www.google.com/'), context: {storefront: sf(EIN, {zaehler: z})}}), null);
  assert.equal(z.n, 1);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://www.google.com/'), context: {storefront: sf('alle')}}), `${C_ALT}/`);
  z.n = 0;
  assert.equal(await kakaoLadenZiel({request: req(`${Q}/products/qione-2-pro`, 'https://www.google.com/'), context: {storefront: sf(EIN, {zaehler: z})}}), null);
  assert.equal(z.n, 0);
  assert.equal(await kakaoLadenZiel({request: req(u, 'https://l.instagram.com/', 'POST'), context: {storefront: sf(EIN, {zaehler: z})}}), null);
  assert.equal(z.n, 0);
});

// --- Stufe 2: Schalterwert 'alle' (Elina 30.10.2026, EL-20261030-0adb59f3) --

import {entscheideAlle, kakaoAlleAntwort, KAKAO_WEICHE_ALLE} from '../app/lib/kakao-laden-weiche.server.js';
import {kakaoHref, kakaoZielUrl} from '../app/lib/kakao-adressen.js';

const C = 'https://crystal-cacao.com';

test("'alle': Sorten, Uebersicht, Sets, alte Handles -> 301, Query unveraendert", () => {
  const faelle = [
    ['/products/crystal-cacao-awake?sca_ref=12345.abc&Art=420g&utm_source=x', `${C}/products/crystal-cacao-awake?sca_ref=12345.abc&Art=420g&utm_source=x`],
    ['/products/crystal-cacao-create', `${C}/products/crystal-cacao-create`],
    ['/pages/crystal-cacao?utm_medium=cpc&gclid=G', `${C}/?utm_medium=cpc&gclid=G`],
    ['/pages/kristall-kakao', `${C}/`],
    ['/products/zeremonie-kakao?variant=1', `${C}/products/crystal-cacao-create?variant=1`],
    ['/products/bundle-2x-awake-1x-create?sca_ref=9', `${C}/products/bundle-2x-awake-1x-create?sca_ref=9`],
    ['/products/bundle-7x-create', `${C}/products/bundle-7x-create`],
    ['/products/mengenrabatt-3x-create', `${C}/products/mengenrabatt-3x-create`],
    ['/products/aw783hfn', `${C}/products/bundle-2x-awake`],
    ['/collections/zeremonie-kakao', `${C}/collections/zeremonie-kakao`],
    ['/en/products/crystal-cacao-awake/', `${C}/products/crystal-cacao-awake`],
  ];
  for (const [von, nach] of faelle) {
    const r = entscheideKakaoWeiche({url: `${Q}${von}`, referer: 'https://www.google.com/', schalter: KAKAO_WEICHE_ALLE});
    assert.equal(r.ziel, nach, von);
    assert.equal(entscheideAlle(`${Q}${von}`).status, 301, von);
  }
});

test("'alle': Nicht-Kakao, Kurs-Lektionen und QiOne bleiben", () => {
  for (const p of ['/', '/products/qione-2-pro', '/pages/zeremonie-kakao-kurs', '/pages/kakao-anwendung',
    '/products/bundle-9x-awake', '/collections/all', '/cart']) {
    assert.equal(entscheideAlle(`${Q}${p}`).ziel, null, p);
  }
});

test("'alle': Partner-Rabattlink mit Kakao-Ziel geht auf die /discount-Route des Kakao-Ladens", () => {
  const r = entscheideAlle(`${Q}/discount/JULIE10?redirect=/products/crystal-cacao-awake&sca_ref=777.x`);
  assert.equal(r.ziel, `${C}/discount/JULIE10?redirect=%2Fproducts%2Fcrystal-cacao-awake&sca_ref=777.x`);
  const z = new URL(r.ziel);
  assert.equal(z.searchParams.get('redirect'), '/products/crystal-cacao-awake');
  assert.equal(z.searchParams.get('sca_ref'), '777.x');
  // Rabattlink auf ein Geraet bleibt auf qiblanco.com
  assert.equal(entscheideAlle(`${Q}/discount/JULIE10?redirect=/products/qione-2-pro&sca_ref=1`).ziel, null);
  assert.equal(entscheideAlle(`${Q}/discount/JULIE10`).ziel, null);
});

test("'alle': Datenrequest zeigt auf die Dokument-Adresse", () => {
  assert.equal(entscheideAlle(`${Q}/products/crystal-cacao-awake.data?sca_ref=1&_routes=x`).ziel,
    `${C}/products/crystal-cacao-awake?sca_ref=1`);
});

test("Schalter 'eigene-kanaele' verhaelt sich wie vorher (Suche bleibt auf qiblanco.com)", () => {
  const r = entscheideKakaoWeiche({url: `${Q}/products/crystal-cacao-awake`, referer: 'https://www.google.com/', schalter: EIN});
  assert.equal(r.ziel, null);
  assert.equal(r.grund, 'suche');
});

test("kakaoAlleAntwort: 301 nur bei Schalter 'alle', sonst null; wirft nie", async () => {
  const sf = (wert) => ({query: async () => ({shop: {metafield: {value: wert}}})});
  const req = new Request(`${Q}/products/crystal-cacao-create?sca_ref=5`);
  const an = await kakaoAlleAntwort(req, sf('alle'));
  assert.equal(an.status, 301);
  assert.equal(an.headers.get('Location'), `${C}/products/crystal-cacao-create?sca_ref=5`);
  assert.equal(an.headers.get('Cache-Control'), 'public, max-age=3600');
  assert.equal(await kakaoAlleAntwort(req, sf('eigene-kanaele')), null);
  assert.equal(await kakaoAlleAntwort(req, sf('aus')), null);
  assert.equal(await kakaoAlleAntwort(req, {query: async () => { throw new Error('netz'); }}), null);
  assert.equal(await kakaoAlleAntwort(new Request(`${Q}/products/qione-2-pro`), sf('alle')), null);
  assert.equal(await kakaoAlleAntwort(new Request(req.url, {method: 'POST'}), sf('alle')), null);
});

test('kakaoHref: Ladenverweise zeigen direkt auf crystal-cacao.com, Rest unveraendert', () => {
  assert.equal(kakaoHref('/pages/crystal-cacao'), `${C}/`);
  assert.equal(kakaoHref('/products/crystal-cacao-awake#kauf'), `${C}/products/crystal-cacao-awake#kauf`);
  assert.equal(kakaoHref('https://qiblanco.com/products/crystal-cacao-create?Art=420g'), `${C}/products/crystal-cacao-create?Art=420g`);
  assert.equal(kakaoHref('/products/qione-2-pro'), '/products/qione-2-pro');
  assert.equal(kakaoZielUrl('https://qi-blanco.com/products/crystal-cacao-awake'), null);
});
