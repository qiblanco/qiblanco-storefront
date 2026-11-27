// Regressionstest zu app/lib/kassen-rueckfall.server.js (Notfall 27.11.2026,
// Vorgang EL-20261127-8fe7809a): scheitert die Warenkorb-Neuanlage über Oxygen,
// geht der Kunde über den nativen Kassenweg weiter; im gesunden Zustand nie.
// Ausfuehren: node --test test/kassen-rueckfall.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

// '~/x' -> app/x(.js), wie Vite es auflöst.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const APP = new URL('../app/', ${JSON.stringify(import.meta.url)});
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('~/')) {
    for (const end of ['', '.js', '.jsx', '/index.js']) {
      const u = new URL(spec.slice(2) + end, APP);
      if (end !== '' || /\\.[cm]?jsx?$/.test(spec)) {
        if (existsSync(fileURLToPath(u))) return next(u.href, ctx);
      }
    }
  }
  return next(spec, ctx);
}`),
);

const m = await import('../app/lib/kassen-rueckfall.server.js');

function anfrage(url = 'https://qiblanco.com/cart?markt=DE', kopf = {}) {
  return new Request(url, {headers: {'User-Agent': 'Mozilla/5.0 (iPhone)', ...kopf}});
}

test('neuanlageGescheitert: nur ohne Korb UND mit API-Fehler', () => {
  assert.equal(m.neuanlageGescheitert({cart: null, errors: [new Error('x')]}), true);
  assert.equal(m.neuanlageGescheitert({errors: [{message: 'x'}]}), true);
  assert.equal(m.neuanlageGescheitert({cart: {id: 'gid://shopify/Cart/1'}, errors: []}), false);
  assert.equal(m.neuanlageGescheitert({cart: {id: 'gid://shopify/Cart/1'}, errors: [{}]}), false);
  assert.equal(m.neuanlageGescheitert({cart: null, errors: [], userErrors: [{message: 'ausverkauft'}]}), false);
  assert.equal(m.neuanlageGescheitert(undefined), false);
});

test('permalinkTeil: Zeilen als Nummer:Menge, Ratenanteil nie', () => {
  assert.equal(
    m.permalinkTeil([
      {merchandiseId: 'gid://shopify/ProductVariant/44685294567692', quantity: 2},
      {merchandiseId: 'gid://shopify/ProductVariant/39680087326790', quantity: 1},
    ]),
    '44685294567692:2,39680087326790:1',
  );
  assert.equal(m.permalinkTeil([]), null);
  assert.equal(m.permalinkTeil([{merchandiseId: 'kaputt', quantity: 1}]), null);
  assert.equal(m.permalinkTeil([{merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 0}]), null);
});

test('permalinkTeil: Qi-Alpha-Ratenanteil bekommt keinen Rückfall', async () => {
  const {TEILZAHLUNG} = await import('../app/lib/qi-alpha-teilzahlung.js').catch(() => ({}));
  if (!TEILZAHLUNG) return;
  assert.equal(
    m.permalinkTeil([{merchandiseId: `gid://shopify/ProductVariant/${TEILZAHLUNG.variante}`, quantity: 1}]),
    null,
  );
});

test('rueckfallUrl: nativer Kassenweg mit Code und Herkunfts-Merkmal', () => {
  const u = new URL(
    m.rueckfallUrl({
      zeilen: '44685294567692:1',
      codes: ['BF26-PRO-13GLX', 'bf26-pro-13glx'],
      request: anfrage(),
      env: {},
    }),
  );
  assert.equal(u.origin, 'https://checkout.qiblanco.com');
  assert.equal(u.pathname, '/cart/44685294567692:1');
  assert.equal(u.searchParams.get('discount'), 'BF26-PRO-13GLX');
  assert.equal(u.searchParams.get('attributes[kassen_rueckfall]'), 'oxygen-neuanlage');
  assert.ok(u.searchParams.get('attributes[attribution_source]'), 'Herkunft fehlt');
});

test('Rabatt-Cookie: hin und zurück, fremde Zeichen nie', () => {
  const keks = m.rabattCookie('BFHome400');
  assert.match(keks, /^qb_rabatt_offen=BFHome400; Path=\/; Max-Age=86400/);
  assert.equal(m.offenerRabatt(anfrage(undefined, {Cookie: 'a=1; qb_rabatt_offen=BFHome400'})), 'BFHome400');
  assert.equal(m.rabattCookie('x;y=1'), null);
  assert.equal(m.offenerRabatt(anfrage(undefined, {Cookie: 'qb_rabatt_offen=%3Cscript%3E'})), '');
});

test('Schalter KASSEN_RUECKFALL=off', () => {
  assert.equal(m.rueckfallAn({}), true);
  assert.equal(m.rueckfallAn({KASSEN_RUECKFALL: 'off'}), false);
  assert.equal(m.rueckfallAn({KASSEN_RUECKFALL: 'OFF'}), false);
});
