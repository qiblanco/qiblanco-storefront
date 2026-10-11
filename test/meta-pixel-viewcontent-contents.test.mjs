// Hermetische Tests: ViewContent trägt content_ids, contents und content_type
// (Grossjob 20261011-fm-folge-attribution-nachzuege, Segment s05).
// Bordmittel wie meta-pixel-initiate-checkout.test.mjs: node:test, kein Netz.
// Ausführen: node --test test/meta-pixel-viewcontent-contents.test.mjs
//
// Anlass: Meta da_checks am Pixel 9450046881736733 meldete am 2026-10-11
// `pixel_missing_param_in_events` für ViewContent (content_ids, contents,
// content_type). Live gemessen sendete ViewContent content_ids + content_type,
// `contents` fehlte immer. Der Payload kommt jetzt aus EINER testbaren
// Funktion (viewContentPayload), MetaPixel.jsx ruft sie nur noch auf.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

import {viewContentPayload} from '../app/lib/pixel-content.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..', 'app');

const EVENT = {
  products: [
    {
      id: 'gid://shopify/Product/6763794399302',
      title: 'QiOne 2 Pro',
      price: '1087.00',
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 1,
    },
  ],
  shop: {currency: 'EUR'},
};

test('viewContentPayload: content_ids, contents, content_type gesetzt', () => {
  const p = viewContentPayload(EVENT);
  assert.deepEqual(p.content_ids, ['6763794399302']);
  assert.deepEqual(p.contents, [
    {id: '6763794399302', quantity: 1, item_price: 1087},
  ]);
  assert.equal(p.content_type, 'product');
});

test('viewContentPayload: bestehende Felder bleiben (name, value, currency)', () => {
  const p = viewContentPayload(EVENT);
  assert.equal(p.content_name, 'QiOne 2 Pro');
  assert.equal(p.value, 1087);
  assert.equal(p.currency, 'EUR');
});

test('viewContentPayload: contents-ID ist dieselbe wie content_ids (Katalog-Match)', () => {
  const p = viewContentPayload(EVENT);
  assert.equal(p.contents[0].id, p.content_ids[0]);
});

test('viewContentPayload: ohne Produkt -> null (Aufrufer feuert nicht)', () => {
  assert.equal(viewContentPayload({}), null);
  assert.equal(viewContentPayload({products: []}), null);
  assert.equal(viewContentPayload(undefined), null);
});

test('viewContentPayload: kaputte GID -> leere Listen, kein undefined im Array', () => {
  const p = viewContentPayload({products: [{id: 'notagid', title: 'x', price: '5'}]});
  assert.deepEqual(p.content_ids, []);
  assert.deepEqual(p.contents, []);
  assert.equal(p.content_type, 'product');
});

test('viewContentPayload: Preis fehlt -> 0, Währung fehlt -> EUR', () => {
  const p = viewContentPayload({products: [{id: 'gid://shopify/Product/9'}]});
  assert.equal(p.value, 0);
  assert.equal(p.currency, 'EUR');
  assert.deepEqual(p.contents, [{id: '9', quantity: 1, item_price: 0}]);
});

test('MetaPixel.jsx: ViewContent feuert mit viewContentPayload(data)', () => {
  const src = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  assert.match(src, /viewContentPayload\(data\)/, 'MetaPixel nutzt den geteilten Payload nicht');
  const seg = src.slice(src.indexOf("'ViewContent'"));
  assert.ok(seg.length > 0, 'ViewContent-Aufruf fehlt');
});
