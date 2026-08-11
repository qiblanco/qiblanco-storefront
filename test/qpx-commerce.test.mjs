// Hermetische Tests der First-Party-Commerce-Instrumentierung (Job 20260723-
// commerce-microfunnel-instrumentierung-messluecke, Folgejob A der Ad-Sales-
// Diagnose). Wie catchall/go-router/meta-pixel-initiate-checkout: node:test/
// node:assert als Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/qpx-commerce.test.mjs
//
// Anlass: events.db kannte First-Party NUR behavior/page_view/identify — NULL
// view_content/add_to_cart/initiate_checkout (Mid-Funnel First-Party blind).
// Der qpx-Receiver akzeptiert diese event_names laengst; was fehlte, war das
// STOREFRONT-Feuern. Dieser Test belegt (a) die Event-Payload-Ableitung aus den
// Hydrogen-Analytics-Daten (Verhalten, nicht nur Quelltext), (b) den sicheren
// qpxTrack-Queue-Stub (Puffer vor qpx-Boot, nie werfen), (c) die Verdrahtung in
// QpxCommerce.jsx/root.jsx/CartSummary.jsx + die PDP-Sektions-Anker, und (d)
// Regressionsschutz: MetaPixel.jsx (Meta-Events) bleibt unangetastet.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

import {
  qpxTrack,
  toValue,
  buildViewContentEvent,
  buildAddToCartEvent,
  buildInitiateCheckoutEvent,
} from '../app/lib/qpx-commerce.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..', 'app');

// ── toValue: robuste Zahl aus Shopify-Money/String ──────────────────────────
test('toValue: String/Number -> Number, Junk -> 0', () => {
  assert.equal(toValue('349.00'), 349);
  assert.equal(toValue('12.5'), 12.5);
  assert.equal(toValue(42), 42);
  assert.equal(toValue(undefined), 0);
  assert.equal(toValue(null), 0);
  assert.equal(toValue('abc'), 0);
  assert.equal(toValue(''), 0);
});

// ── buildViewContentEvent: spiegelt MetaPixel ViewContent ───────────────────
test('buildViewContentEvent: echtes product_viewed -> view_content-Payload', () => {
  const ev = buildViewContentEvent({
    products: [
      {
        id: 'gid://shopify/Product/8123456789012',
        title: 'QiOne 2 Pro',
        price: '349.00',
      },
    ],
    shop: {currency: 'EUR'},
  });
  assert.deepEqual(ev, {
    content_ids: ['8123456789012'],
    content_name: 'QiOne 2 Pro',
    content_type: 'product',
    value: 349,
    currency: 'EUR',
  });
});

test('buildViewContentEvent: ohne Produkt -> null (Aufrufer skippt)', () => {
  assert.equal(buildViewContentEvent({products: []}), null);
  assert.equal(buildViewContentEvent({}), null);
  assert.equal(buildViewContentEvent(undefined), null);
});

test('buildViewContentEvent: Junk-GID -> content_ids gefiltert []', () => {
  const ev = buildViewContentEvent({products: [{id: 'notagid', price: '1'}]});
  assert.deepEqual(ev.content_ids, []);
});

test('buildViewContentEvent: fehlende shop.currency -> EUR-Fallback', () => {
  const ev = buildViewContentEvent({
    products: [{id: 'gid://shopify/Product/1', price: '9'}],
  });
  assert.equal(ev.currency, 'EUR');
});

// ── buildAddToCartEvent: spiegelt MetaPixel AddToCart inkl. Mengen-Delta ─────
test('buildAddToCartEvent: erster Add -> value = Einzelpreis * 1', () => {
  const ev = buildAddToCartEvent({
    currentLine: {
      quantity: 1,
      merchandise: {
        product: {id: 'gid://shopify/Product/222', title: 'QiBracelet'},
        price: {amount: '199.00', currencyCode: 'EUR'},
      },
    },
    shop: {currency: 'EUR'},
  });
  assert.deepEqual(ev, {
    content_ids: ['222'],
    content_name: 'QiBracelet',
    content_type: 'product',
    value: 199,
    currency: 'EUR',
    num_items: 1,
  });
});

test('buildAddToCartEvent: Mengen-Erhoehung 1->3 zählt nur das Delta (2)', () => {
  const ev = buildAddToCartEvent({
    currentLine: {
      quantity: 3,
      merchandise: {
        product: {id: 'gid://shopify/Product/5'},
        price: {amount: '10.00', currencyCode: 'CHF'},
      },
    },
    prevLine: {quantity: 1},
  });
  assert.equal(ev.num_items, 2);
  assert.equal(ev.value, 20); // 10 * Delta 2
  assert.equal(ev.currency, 'CHF'); // Line-Waehrung schlaegt shop
});

test('buildAddToCartEvent: Delta nie < 1 (Untergrenze)', () => {
  const ev = buildAddToCartEvent({
    currentLine: {
      quantity: 1,
      merchandise: {product: {id: 'gid://shopify/Product/9'}, price: {amount: '5'}},
    },
    prevLine: {quantity: 5},
  });
  assert.equal(ev.num_items, 1);
});

test('buildAddToCartEvent: ohne Merchandise -> null', () => {
  assert.equal(buildAddToCartEvent({currentLine: {}}), null);
  assert.equal(buildAddToCartEvent({}), null);
  assert.equal(buildAddToCartEvent(undefined), null);
});

// ── buildInitiateCheckoutEvent: Cart-weiter IC-Payload ──────────────────────
test('buildInitiateCheckoutEvent: subtotal/contentIds/numItems -> Payload', () => {
  const ev = buildInitiateCheckoutEvent({
    subtotal: {amount: '558.00', currencyCode: 'EUR'},
    numItems: 2,
    contentIds: ['111', '222'],
  });
  assert.deepEqual(ev, {
    content_ids: ['111', '222'],
    content_type: 'product',
    value: 558,
    currency: 'EUR',
    num_items: 2,
  });
});

test('buildInitiateCheckoutEvent: leitet content_ids aus lines ab, wenn kein contentIds', () => {
  const ev = buildInitiateCheckoutEvent({
    subtotal: {amount: '10', currencyCode: 'EUR'},
    lines: [{merchandise: {product: {id: 'gid://shopify/Product/777'}}}],
  });
  assert.deepEqual(ev.content_ids, ['777']);
});

test('buildInitiateCheckoutEvent: leerer Cart -> content_ids [], value 0, EUR', () => {
  const ev = buildInitiateCheckoutEvent({});
  assert.deepEqual(ev.content_ids, []);
  assert.equal(ev.value, 0);
  assert.equal(ev.currency, 'EUR');
  assert.equal(ev.num_items, 0);
});

// ── qpxTrack: sicherer Queue-Stub, bricht nie ───────────────────────────────
test('qpxTrack: puffert über window.qpx.q, wenn qpx noch nicht geladen', () => {
  const prev = globalThis.window;
  globalThis.window = {}; // qpx noch nicht da (async, consent-gated)
  try {
    qpxTrack('view_content', {value: 1});
    qpxTrack('add_to_cart', {value: 2});
    assert.equal(typeof globalThis.window.qpx, 'function');
    const q = globalThis.window.qpx.q;
    assert.ok(Array.isArray(q));
    assert.equal(q.length, 2);
    // Standard-Snippet-Form: jede Zeile ist die Argumentliste des Aufrufs.
    assert.deepEqual(Array.from(q[0]), ['track', 'view_content', {value: 1}]);
    assert.deepEqual(Array.from(q[1]), ['track', 'add_to_cart', {value: 2}]);
  } finally {
    globalThis.window = prev;
  }
});

test('qpxTrack: ruft die echte qpx-API direkt, wenn geladen', () => {
  const prev = globalThis.window;
  const calls = [];
  const realQpx = (...args) => calls.push(args);
  globalThis.window = {qpx: realQpx};
  try {
    qpxTrack('initiate_checkout', {value: 99});
    assert.deepEqual(calls, [['track', 'initiate_checkout', {value: 99}]]);
    assert.equal(globalThis.window.qpx, realQpx); // Stub NICHT ueberschrieben
  } finally {
    globalThis.window = prev;
  }
});

test('qpxTrack: no-op ohne window (SSR) und bei leerem Payload — wirft nie', () => {
  const prev = globalThis.window;
  try {
    globalThis.window = undefined;
    assert.doesNotThrow(() => qpxTrack('view_content', {value: 1}));
    globalThis.window = {};
    assert.doesNotThrow(() => qpxTrack('view_content', null));
    assert.doesNotThrow(() => qpxTrack('', {value: 1}));
    assert.equal(globalThis.window.qpx, undefined); // kein Stub bei leerem Call
  } finally {
    globalThis.window = prev;
  }
});

// ── Verdrahtung: QpxCommerce.jsx bridged die Hydrogen-Events ─────────────────
test('QpxCommerce.jsx: subscribt product_viewed/added_to_cart -> qpxTrack', () => {
  const src = readFileSync(join(APP, 'components', 'QpxCommerce.jsx'), 'utf8');
  assert.match(src, /useAnalytics/, 'nutzt Hydrogen useAnalytics nicht');
  assert.match(src, /subscribe\(\s*'product_viewed'/, 'kein product_viewed-Sub');
  assert.match(
    src,
    /subscribe\(\s*'product_added_to_cart'/,
    'kein product_added_to_cart-Sub',
  );
  assert.match(src, /qpxTrack\(\s*'view_content'/, 'feuert view_content nicht');
  assert.match(src, /qpxTrack\(\s*'add_to_cart'/, 'feuert add_to_cart nicht');
});

// ── Verdrahtung: root.jsx montiert <QpxCommerce/> neben <MetaPixel/> ─────────
test('root.jsx: <QpxCommerce/> ist neben <MetaPixel/> gated montiert', () => {
  const src = readFileSync(join(APP, 'root.jsx'), 'utf8');
  assert.match(src, /import\s*{\s*QpxCommerce\s*}\s*from\s*'\.\/components\/QpxCommerce'/);
  assert.match(src, /<QpxCommerce\s*\/>/, '<QpxCommerce/> nicht montiert');
  // dieselbe Gating-Bedingung wie MetaPixel (Produktion/Preview):
  const mp = src.indexOf('<MetaPixel');
  const qc = src.indexOf('<QpxCommerce');
  assert.ok(mp > 0 && qc > mp, 'QpxCommerce nicht direkt bei MetaPixel');
});

// ── Verdrahtung: CartSummary.jsx feuert First-Party initiate_checkout ────────
test('CartSummary.jsx: initiate_checkout via qpxTrack im Checkout-Submit', () => {
  const src = readFileSync(join(APP, 'components', 'CartSummary.jsx'), 'utf8');
  assert.match(src, /buildInitiateCheckoutEvent/, 'nutzt Builder nicht');
  assert.match(
    src,
    /qpxTrack\(\s*[\n\s]*'initiate_checkout'/,
    'feuert initiate_checkout nicht',
  );
  // Das Meta-Pixel-IC darf nicht regressieren (bleibt daneben bestehen):
  assert.match(src, /'InitiateCheckout'/, 'Meta-IC regressiert');
});

// ── Verdrahtung: Standard-PDP trägt die 3 data-section-Anker ───────────────
test('products.$handle.jsx: StandardProduct trägt pdp-section-Anker', () => {
  const src = readFileSync(join(APP, 'routes', 'products.$handle.jsx'), 'utf8');
  for (const sec of ['pdp-gallery', 'pdp-buybox', 'pdp-description']) {
    assert.match(src, new RegExp(`data-section="${sec}"`), `data-section="${sec}" fehlt`);
  }
});

test('products.$handle.jsx: pdp-Sektionen sind DISJUNKT (nicht verschachtelt)', () => {
  const src = readFileSync(join(APP, 'routes', 'products.$handle.jsx'), 'utf8');
  // product-main trägt KEINE data-section (sonst umschliesst es description+buybox):
  assert.match(
    src,
    /className="product-main">/,
    'product-main darf keine data-section tragen (Verschachtelung)',
  );
  // pdp-buybox steht NACH pdp-description in Quellreihenfolge = Geschwister,
  // nicht Elternteil (die Description stanzt sonst ein Klick-Loch in die Buybox):
  const desc = src.indexOf('data-section="pdp-description"');
  const buybox = src.indexOf('data-section="pdp-buybox"');
  assert.ok(desc > 0 && buybox > desc, 'pdp-description/pdp-buybox nicht disjunkt');
});

// ── Regressionsschutz: MetaPixel.jsx (Meta-Events) unangetastet ──────────────
test('MetaPixel.jsx: ViewContent & AddToCart tragen weiterhin content_ids (fbq)', () => {
  const src = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  assert.doesNotMatch(src, /window\.qpx/, 'MetaPixel darf qpx nicht anfassen');
  for (const ev of ['ViewContent', 'AddToCart']) {
    const seg = src.slice(src.indexOf(`'${ev}'`));
    const block = seg.slice(0, seg.indexOf('});'));
    assert.match(block, /content_ids:/, `${ev} verlor content_ids`);
  }
});
