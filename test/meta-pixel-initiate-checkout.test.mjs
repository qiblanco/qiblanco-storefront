// Hermetische Tests des InitiateCheckout-content_ids-Fix (Job 20260723-
// initiate-checkout-content-ids-fix-pr-vorbereiten). Wie catchall/go-router/
// checkout-tracking-qpx-anon: node:test/node:assert als Bordmittel, KEIN Netz,
// kein neuer Runner. Ausfuehren: node --test test/meta-pixel-initiate-checkout.test.mjs
//
// Anlass (Gesamt-Funde-Sweep Fund #14): das DACH-Meta-Pixel InitiateCheckout
// ('Kaufvorgang starten', CartSummary.jsx) sendete KEIN content_ids, waehrend
// ViewContent/AddToCart (MetaPixel.jsx) es tun -> Events-Manager-Warnung +
// schlechtere Match-Qualitaet. Dieser Test belegt die Ableitung der content_ids
// aus den Cart-Lines (Verhalten, nicht nur Quelltext) UND die Verdrahtung in
// den IC-fbq-Aufruf; plus Regressionsschutz, dass ViewContent/AddToCart
// unangetastet bleiben.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

import {numericProductId, cartLineContentIds} from '../app/lib/pixel-content.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..', 'app');

// ── Verhalten: numericProductId spiegelt MetaPixel.jsx (parseGid(gid).id) ──
test('numericProductId: echte Shopify-GID -> numerische ID', () => {
  assert.equal(numericProductId('gid://shopify/Product/123'), '123');
  assert.equal(
    numericProductId('gid://shopify/Product/8123456789012'),
    '8123456789012',
  );
});

test('numericProductId: Junk/leer/nullish -> undefined (wird gefiltert)', () => {
  for (const junk of ['', 'notagid', null, undefined, 42, {}]) {
    assert.equal(numericProductId(junk), undefined, `junk: ${String(junk)}`);
  }
});

// ── Verhalten: cartLineContentIds ueber den ganzen Cart ──
test('cartLineContentIds: mehrere Lines -> alle numerischen Produkt-IDs', () => {
  const lines = [
    {merchandise: {product: {id: 'gid://shopify/Product/111'}}},
    {merchandise: {product: {id: 'gid://shopify/Product/222'}}},
  ];
  assert.deepEqual(cartLineContentIds(lines), ['111', '222']);
});

test('cartLineContentIds: leerer/fehlender Cart -> []', () => {
  assert.deepEqual(cartLineContentIds([]), []);
  assert.deepEqual(cartLineContentIds(undefined), []);
  assert.deepEqual(cartLineContentIds(null), []);
});

test('cartLineContentIds: kaputte/fehlende IDs werden herausgefiltert', () => {
  const lines = [
    {merchandise: {product: {id: 'gid://shopify/Product/333'}}},
    {merchandise: {product: {id: 'notagid'}}}, // -> undefined
    {merchandise: {product: {}}}, // -> undefined
    {merchandise: {}}, // -> undefined
    {}, // -> undefined
  ];
  assert.deepEqual(cartLineContentIds(lines), ['333']);
});

test('cartLineContentIds: Ergebnis ist ein string[] (fbq content_ids-Form)', () => {
  const ids = cartLineContentIds([
    {merchandise: {product: {id: 'gid://shopify/Product/999'}}},
  ]);
  assert.ok(Array.isArray(ids));
  assert.ok(ids.every((x) => typeof x === 'string'));
});

// ── Verdrahtung: CartSummary.jsx feuert IC mit content_ids/content_type ──
test('CartSummary.jsx: InitiateCheckout-fbq traegt content_ids + content_type', () => {
  const src = readFileSync(join(APP, 'components', 'CartSummary.jsx'), 'utf8');
  const ic = src.slice(src.indexOf("'InitiateCheckout'"));
  const block = ic.slice(0, ic.indexOf('}'));
  assert.match(block, /content_ids:\s*contentIds/, 'content_ids fehlt im IC-Aufruf');
  assert.match(block, /content_type:\s*'product'/, 'content_type fehlt im IC-Aufruf');
  // Bestehende Felder duerfen nicht regressieren:
  assert.match(block, /value:/);
  assert.match(block, /currency:/);
  assert.match(block, /num_items:/);
  // content_ids kommt aus den Cart-Lines, nicht hartkodiert:
  assert.match(src, /cartLineContentIds\(lines\)/);
});

// ── Regressionsschutz: ViewContent/AddToCart bleiben unangetastet ──
test('MetaPixel.jsx: ViewContent & AddToCart tragen weiterhin content_ids', () => {
  const src = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  for (const ev of ['ViewContent', 'AddToCart']) {
    const seg = src.slice(src.indexOf(`'${ev}'`));
    const block = seg.slice(0, seg.indexOf('});'));
    assert.match(block, /content_ids:/, `${ev} verlor content_ids`);
    assert.match(block, /content_type:\s*'product'/, `${ev} verlor content_type`);
  }
});
