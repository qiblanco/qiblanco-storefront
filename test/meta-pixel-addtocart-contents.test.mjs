// Hermetische Tests: AddToCart traegt `contents` wie ViewContent (Job
// 20261019-addtocart-contents-wie-viewcontent-prio50-r2, aufgegangen in
// 20261031-meta-capi-luecken-dach-bau-ai-server-prio10). Vorbild
// meta-pixel-viewcontent-contents.test.mjs. Kein Netz.
// Ausfuehren: node --test test/meta-pixel-addtocart-contents.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

import {addToCartPayload} from '../app/lib/pixel-content.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..', 'app');

const zeile = (menge, preis = '94.00', id = 'gid://shopify/Product/8123456789012') => ({
  quantity: menge,
  merchandise: {
    price: {amount: preis, currencyCode: 'EUR'},
    product: {id, title: 'QiOne® 2 Pro'},
  },
});

test('addToCartPayload: Erstkauf -> contents [{id, quantity 1, item_price}]', () => {
  const p = addToCartPayload({currentLine: zeile(1)});
  assert.deepEqual(p, {
    content_ids: ['8123456789012'],
    contents: [{id: '8123456789012', quantity: 1, item_price: 94}],
    content_name: 'QiOne® 2 Pro',
    content_type: 'product',
    value: 94,
    currency: 'EUR',
    num_items: 1,
  });
});

test('addToCartPayload: Mengen-Erhoehung 1->3 zaehlt das Delta (2) in contents und value', () => {
  const p = addToCartPayload({currentLine: zeile(3), prevLine: {quantity: 1}});
  assert.equal(p.num_items, 2);
  assert.equal(p.contents[0].quantity, 2);
  assert.equal(p.contents[0].item_price, 94);
  assert.equal(p.value, 188);
});

test('addToCartPayload: ohne merchandise -> null (kein Event)', () => {
  assert.equal(addToCartPayload({currentLine: {}}), null);
  assert.equal(addToCartPayload({}), null);
  assert.equal(addToCartPayload(undefined), null);
});

test('addToCartPayload: ohne Produkt-ID -> contents leer, content_ids leer', () => {
  const p = addToCartPayload({currentLine: zeile(1, '94.00', 'kaputt')});
  assert.deepEqual(p.contents, []);
  assert.deepEqual(p.content_ids, []);
});

test('addToCartPayload: Paritaet content_ids[0] == contents[0].id', () => {
  const p = addToCartPayload({currentLine: zeile(2, '1087.00', 'gid://shopify/Product/42')});
  assert.equal(p.content_ids[0], p.contents[0].id);
});

test('MetaPixel.jsx: AddToCart feuert mit addToCartPayload(data)', () => {
  const src = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  assert.match(src, /addToCartPayload\(data\)/);
  assert.match(src, /if \(!payload\) return;/);
});
