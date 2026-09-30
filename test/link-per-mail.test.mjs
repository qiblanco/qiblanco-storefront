// Hermetische Tests von „Link per E-Mail schicken" (CJ-Großjob 20260930, s06).
// Stil wie test/cart-herkunfts-marker.test.mjs: node:test/node:assert als
// Bordmittel, KEIN Netz (fetch ist ein Stub), die Routen werden WIRKLICH
// ausgeführt (der `~/`-Alias per module.registerHooks).
// Ausfuehren: node --test test/link-per-mail.test.mjs
//
// WAS HIER FESTGENAGELT WIRD, weil es die Zusagen des Baus sind:
//   E1  Ohne Einwilligung reist KEINE Kennung der Instagram-Sitzung zum Server
//       (anon leer, einwilligung false) — mit Einwilligung genau _qpx_anon.
//   E2  Auf einer Produktseite ohne Warenkorb entsteht einer, und zwar mit den
//       Attribut-Helfern des Bestands: personenbezogene Attribute nur mit
//       Einwilligung. Der Warenkorb-Cookie wird gesetzt.
//   E3  /weiter/<token> setzt den Warenkorb nur mit gültiger cart id, hängt
//       qpx_eh nur in exakter Form an und leitet nie auf eine fremde Domain.
//   E4  Server nicht erreichbar -> Startseite bzw. {ok:false}, nie ein Absturz.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs|ts|tsx)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
  load(url, kontext, naechster) {
    // Beide Routen sind .jsx ohne JSX-Syntax (Ressourcen-Routen).
    if (url.endsWith('.jsx')) {
      return {format: 'module', shortCircuit: true, source: readFileSync(fileURLToPath(url), 'utf8')};
    }
    return naechster(url, kontext);
  },
});

const lib = await import('../app/lib/inapp-bruecke.js');
const {loader: weicheLoader, action} = await import('../app/routes/link-per-mail.jsx');
const {loader: weiterLoader} = await import('../app/routes/weiter.$token.jsx');

const UA_IG =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 345.0.0.0 (iPhone14,3; iOS 17_5)';
const UA_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const UA_PROBE = UA_IG + ' QiBlancoInternal/link-per-mail';
const JA = 'CookieConsent={stamp:%27x%27,marketing:true}';
const NEIN = 'CookieConsent={stamp:%27x%27,marketing:false}';
const ANON = 'a184b103-5aa6-41be-bbf5-90d37d1b07f9';
const CART = 'gid://shopify/Cart/hWN4abcdEFGH1234?key=0123456789abcdef';
const NEU = 'gid://shopify/Cart/hWNneu0000000001?key=fedcba9876543210';
const TOKEN = 'AbCdEfGhIjKlMnOpQrStUvWxYz012345';

/** fetch-Stub: merkt sich jeden Aufruf, antwortet aus `antworten` (url-Teil -> [status, body]). */
function stubFetch(antworten = {}) {
  const aufrufe = [];
  globalThis.fetch = async (url, init = {}) => {
    aufrufe.push({url: String(url), init});
    for (const [teil, [status, body]] of Object.entries(antworten)) {
      if (String(url).includes(teil)) {
        if (status === 0) throw new TypeError('fetch failed');
        return new Response(JSON.stringify(body), {status});
      }
    }
    return new Response('{}', {status: 404});
  };
  return aufrufe;
}

function kontext({cartId = CART, angelegt = NEU} = {}) {
  const k = {
    env: {},
    erstellt: [],
    cart: {
      getCartId: () => cartId || undefined,
      setCartId: (id) =>
        new Headers({'Set-Cookie': `cart=${encodeURIComponent(id.split('/').pop())}; Path=/`}),
      create: async (input) => {
        k.erstellt.push(input);
        return {cart: {id: angelegt}, errors: []};
      },
    },
  };
  return k;
}

function post(felder, {ua = UA_IG, cookie = `${JA}; _qpx_anon=${ANON}`, ip = '91.65.12.200'} = {}) {
  const body = new URLSearchParams(felder);
  return new Request('https://qiblanco.com/link-per-mail', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': ua,
      Cookie: cookie,
      'oxygen-buyer-ip': ip,
    },
  });
}

const serverBody = (aufrufe) => JSON.parse(aufrufe.find((a) => a.url.endsWith('/a')).init.body);

test('Muster: Meta-Browser, Pfade, Warenkorb, Kennung', () => {
  assert.equal(lib.istMetaBrowser(UA_IG), true);
  assert.equal(lib.istMetaBrowser('Mozilla/5.0 (Linux; Android 14) [FBAN/EMA;FBAV/450.0]'), true);
  assert.equal(lib.istMetaBrowser(UA_SAFARI), false);
  for (const gut of ['/', '/cart', '/products/qione-2-pro', '/pages/E-Smog-Schutz', '/collections/all']) {
    assert.ok(lib.PFAD_RX.test(gut), gut);
  }
  for (const schlecht of ['//boese.example', 'https://boese.example/', '/products/../x', '/cart?x=1', '/account']) {
    assert.ok(!lib.PFAD_RX.test(schlecht), schlecht);
  }
  assert.ok(lib.CART_RX.test(CART));
  assert.ok(!lib.CART_RX.test('https://checkout.qiblanco.com/cart/c/abc'));
  assert.ok(lib.EH_RX.test('0123456789abcdef') && !lib.EH_RX.test('0123456789ABCDEF'));
});

test('E1 mit Einwilligung: anon und einwilligung gehen mit, Warenkorb der Sitzung', async () => {
  const aufrufe = stubFetch({'/a': [200, {ok: true}]});
  const res = await action({request: post({email: 'kundin@example.de', art: 'warenkorb', pfad: '/cart'}), context: kontext()});
  assert.deepEqual(await res.json(), {ok: true, code: ''});
  const b = serverBody(aufrufe);
  assert.equal(b.einwilligung, true);
  assert.equal(b.anon, ANON);
  assert.equal(b.cart_id, CART);
  assert.equal(b.pfad, '/cart');
  assert.equal(b.ua_klasse, 'webview_meta');
  assert.equal(b.intern, false);
  assert.equal(aufrufe[0].init.headers['X-Bruecke-KundE-IP'.replace('KundE', 'Kunde')], '91.65.12.200');
});

test('E1 ohne Einwilligung: keine Kennung der Sitzung', async () => {
  const aufrufe = stubFetch({'/a': [200, {ok: true}]});
  await action({
    request: post({email: 'kundin@example.de', art: 'warenkorb'}, {cookie: `${NEIN}; _qpx_anon=${ANON}`}),
    context: kontext(),
  });
  const b = serverBody(aufrufe);
  assert.equal(b.einwilligung, false);
  assert.equal(b.anon, '');
});

test('E2 Produktseite ohne Warenkorb: neuer Warenkorb, personenbezogen nur mit Einwilligung, Cookie gesetzt', async () => {
  for (const [cookie, erwartetPersonenbezogen] of [[`${JA}; _qpx_anon=${ANON}; _fbp=fb.1.1000.222`, true], [`${NEIN}; _qpx_anon=${ANON}; _fbp=fb.1.1000.222`, false]]) {
    const aufrufe = stubFetch({'/a': [200, {ok: true}]});
    const k = kontext({cartId: ''});
    const res = await action({
      request: post({email: 'kundin@example.de', art: 'seite', pfad: '/products/qione-2-pro'}, {cookie}),
      context: k,
    });
    assert.equal(k.erstellt.length, 1);
    const schluessel = (k.erstellt[0].attributes || []).map((a) => a.key);
    assert.ok(schluessel.includes('ua_class'), 'Herkunftsmarker fehlen');
    assert.equal(schluessel.includes('_qpx_anon'), erwartetPersonenbezogen, schluessel.join(','));
    assert.equal(schluessel.includes('_fbp'), erwartetPersonenbezogen);
    assert.match(res.headers.get('Set-Cookie') || '', /^cart=/);
    const b = serverBody(aufrufe);
    assert.equal(b.cart_id, NEU);
    assert.equal(b.pfad, '/products/qione-2-pro');
  }
});

test('Eingaben: falsche Adresse und Warenkorb ohne Warenkorb gehen nie zum Server', async () => {
  let aufrufe = stubFetch({'/a': [200, {ok: true}]});
  let res = await action({request: post({email: 'kein-at', art: 'warenkorb'}), context: kontext()});
  assert.deepEqual(await res.json(), {ok: false, code: 'adresse'});
  res = await action({request: post({email: 'kundin@example.de', art: 'warenkorb'}), context: kontext({cartId: ''})});
  assert.deepEqual(await res.json(), {ok: false, code: 'eingabe'});
  res = await action({request: post({email: 'kundin@example.de', art: 'seite', pfad: 'https://boese.example/'}), context: kontext()});
  assert.deepEqual(await res.json(), {ok: false, code: 'eingabe'});
  assert.equal(aufrufe.length, 0);
});

test('Drossel und Ausfall des Servers kommen als Code zurück, nie als Absturz', async () => {
  stubFetch({'/a': [429, {ok: false, code: 'drossel'}]});
  let res = await action({request: post({email: 'kundin@example.de', art: 'warenkorb'}), context: kontext()});
  assert.deepEqual(await res.json(), {ok: false, code: 'drossel'});
  stubFetch({'/a': [0, null]});
  res = await action({request: post({email: 'kundin@example.de', art: 'warenkorb'}), context: kontext()});
  assert.deepEqual(await res.json(), {ok: false, code: 'fehler'});
});

test('Interne Probe: intern=true, Klasse intern', async () => {
  const aufrufe = stubFetch({'/a': [200, {ok: true}]});
  await action({request: post({email: 'noreply+ql-zustellprobe@qiblanco.com', art: 'warenkorb'}, {ua: UA_PROBE}), context: kontext()});
  const b = serverBody(aufrufe);
  assert.equal(b.intern, true);
  assert.equal(b.ua_klasse, 'intern');
});

test('Weiche: nur ?w=1, intern wird durchgereicht, Ausfall = aus', async () => {
  let aufrufe = stubFetch({'/w?intern=0': [200, {an: false}], '/w?intern=1': [200, {an: true}]});
  let res = await weicheLoader({request: new Request('https://qiblanco.com/link-per-mail?w=1', {headers: {'User-Agent': UA_IG}}), context: kontext()});
  assert.deepEqual(await res.json(), {an: false});
  res = await weicheLoader({request: new Request('https://qiblanco.com/link-per-mail?w=1', {headers: {'User-Agent': UA_PROBE}}), context: kontext()});
  assert.deepEqual(await res.json(), {an: true});
  res = await weicheLoader({request: new Request('https://qiblanco.com/link-per-mail'), context: kontext()});
  assert.equal(res.status, 404);
  stubFetch({'/w': [0, null]});
  res = await weicheLoader({request: new Request('https://qiblanco.com/link-per-mail?w=1', {headers: {'User-Agent': UA_IG}}), context: kontext()});
  assert.deepEqual(await res.json(), {an: false});
  assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
});

test('E3 /weiter: Warenkorb gesetzt, qpx_eh angehängt, Klasse des Browsers gemeldet', async () => {
  const aufrufe = stubFetch({[`/k/${TOKEN}`]: [200, {ok: true, ziel: '/cart', cart_id: CART, qpx_eh: '0123456789abcdef'}]});
  const res = await weiterLoader({
    request: new Request(`https://qiblanco.com/weiter/${TOKEN}`, {headers: {'User-Agent': UA_SAFARI}}),
    params: {token: TOKEN},
    context: kontext(),
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('Location'), '/cart?qpx_eh=0123456789abcdef');
  assert.match(res.headers.get('Set-Cookie') || '', /^cart=hWN4abcdEFGH1234/);
  assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(aufrufe[0].init.headers['X-Bruecke-UA-Klasse'], 'browser');
});

test('E3 /weiter: fremdes Ziel, kaputte Kennung, kaputter Warenkorb werden verworfen', async () => {
  stubFetch({[`/k/${TOKEN}`]: [200, {ok: true, ziel: 'https://boese.example/', cart_id: 'https://x/cart', qpx_eh: 'ZZZ'}]});
  const res = await weiterLoader({request: new Request(`https://qiblanco.com/weiter/${TOKEN}`), params: {token: TOKEN}, context: kontext()});
  assert.equal(res.headers.get('Location'), '/');
  assert.equal(res.headers.get('Set-Cookie'), null);
});

test('E4 /weiter: kaputtes Token fragt den Server nicht, Ausfall führt auf die Startseite', async () => {
  let aufrufe = stubFetch({});
  let res = await weiterLoader({request: new Request('https://qiblanco.com/weiter/x'), params: {token: 'x'}, context: kontext()});
  assert.equal(res.headers.get('Location'), '/');
  assert.equal(aufrufe.length, 0);
  stubFetch({[`/k/${TOKEN}`]: [0, null]});
  res = await weiterLoader({request: new Request(`https://qiblanco.com/weiter/${TOKEN}`), params: {token: TOKEN}, context: kontext()});
  assert.equal(res.headers.get('Location'), '/');
  stubFetch({[`/k/${TOKEN}`]: [404, {ok: false, ziel: '/'}]});
  res = await weiterLoader({request: new Request(`https://qiblanco.com/weiter/${TOKEN}`), params: {token: TOKEN}, context: kontext()});
  assert.equal(res.headers.get('Location'), '/');
});
