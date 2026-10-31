// Hermetische Tests der gemeinsamen Meta-eventID (Job 20261031-meta-capi-
// luecken-dach-bau-ai-server-prio10). node:test/node:assert, kein Netz.
// Ausfuehren: node --test test/meta-event-id.test.mjs
//
// Belegt wird:
//  1. eventIdFuer: dasselbe Payload-Objekt + derselbe Name -> dieselbe Id,
//     ein anderes Objekt -> eine andere; Form qbm-<uuid>.
//  2. Hydrogen (installierter Code, nicht nachgebaut) gibt beiden Subscribern
//     DASSELBE Payload-Objekt. Nur dann reicht die WeakMap als eine Id-Quelle.
//  3. Verdrahtung: MetaPixel.jsx (fbq eventID) und QpxCommerce.jsx (qpx
//     event_id) fragen mit denselben Namen; keine zweite Id-Quelle im Repo.
//  4. InitiateCheckout: der Storefront-fbq ist stillgelegt, qpx bleibt.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import vm from 'node:vm';

import {
  eventIdFuer,
  uuid,
  META_EVENT_VIEW_CONTENT,
  META_EVENT_ADD_TO_CART,
} from '../app/lib/meta-event-id.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const APP = join(ROOT, 'app');
const QBM = /^qbm-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// ── 1. Vertrag eventIdFuer ──
test('eventIdFuer: gleiches Objekt + Name -> gleiche Id, Form qbm-<uuid v4>', () => {
  const data = {currentLine: {}};
  const a = eventIdFuer(data, META_EVENT_ADD_TO_CART);
  const b = eventIdFuer(data, META_EVENT_ADD_TO_CART);
  assert.equal(a, b);
  assert.match(a, QBM);
});

test('eventIdFuer: neues Ereignis-Objekt -> neue Id; anderer Name -> andere Id', () => {
  const ids = new Set();
  for (let i = 0; i < 200; i++) ids.add(eventIdFuer({i}, META_EVENT_VIEW_CONTENT));
  assert.equal(ids.size, 200);
  const d = {};
  assert.notEqual(
    eventIdFuer(d, META_EVENT_VIEW_CONTENT),
    eventIdFuer(d, META_EVENT_ADD_TO_CART),
  );
});

test('eventIdFuer: ohne Objekt oder Name -> undefined (kein Wurf)', () => {
  for (const x of [undefined, null, 'x', 42]) {
    assert.equal(eventIdFuer(x, META_EVENT_ADD_TO_CART), undefined);
  }
  assert.equal(eventIdFuer({}, ''), undefined);
});

test('uuid: Rueckfall ohne crypto liefert dieselbe Form', () => {
  const alt = globalThis.crypto;
  Object.defineProperty(globalThis, 'crypto', {value: undefined, configurable: true});
  try {
    assert.match('qbm-' + uuid(), QBM);
  } finally {
    Object.defineProperty(globalThis, 'crypto', {value: alt, configurable: true});
  }
});

// ── 2. Hydrogen gibt beiden Subscribern dasselbe Objekt ──
// subscribe/publish aus dem INSTALLIERTEN @shopify/hydrogen herausgeschnitten
// und ausgefuehrt: misst den Code, der im Bundle steht, nicht eine Annahme.
function hydrogenBus() {
  const pfad = join(ROOT, 'node_modules', '@shopify', 'hydrogen', 'dist', 'development', 'index.js');
  const src = readFileSync(pfad, 'utf8');
  const von = src.indexOf('var subscribers = ');
  const bis = src.indexOf('function register(', von);
  assert.ok(von > 0 && bis > von, 'Hydrogen-Analytics-Bus im Bundle nicht gefunden');
  const ctx = {console};
  vm.runInNewContext(
    src.slice(von, bis) + '\n;this.subscribe = subscribe; this.publish = publish;',
    ctx,
  );
  return ctx;
}

test('Hydrogen publish: beide Subscriber bekommen DASSELBE Payload-Objekt', () => {
  const bus = hydrogenBus();
  const gesehen = [];
  // Verschiedener Funktionstext: Hydrogen schluesselt Subscriber nach
  // callback.toString(), zwei textgleiche Callbacks ueberschrieben sich.
  bus.subscribe('product_added_to_cart', (data) => gesehen.push(['meta', data]));
  bus.subscribe('product_added_to_cart', (d) => gesehen.push(['qpx', d]));
  const payload = {currentLine: {merchandise: {}}};
  bus.publish('product_added_to_cart', payload);
  assert.equal(gesehen.length, 2);
  assert.equal(gesehen[0][1], payload);
  assert.equal(gesehen[1][1], payload);
  assert.equal(
    eventIdFuer(gesehen[0][1], META_EVENT_ADD_TO_CART),
    eventIdFuer(gesehen[1][1], META_EVENT_ADD_TO_CART),
  );
});

// ── 3. Verdrahtung: eine Id-Quelle, beide Konsumenten ──
test('MetaPixel.jsx: ViewContent/AddToCart senden eventID aus eventIdFuer', () => {
  const src = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  assert.match(src, /window\.fbq\('track', eventName, params, \{eventID: eventId\}\)/);
  assert.match(src, /eventIdFuer\(data, META_EVENT_VIEW_CONTENT\)/);
  assert.match(src, /eventIdFuer\(data, META_EVENT_ADD_TO_CART\)/);
});

test('QpxCommerce.jsx: view_content/add_to_cart tragen event_id aus eventIdFuer', () => {
  const src = readFileSync(join(APP, 'components', 'QpxCommerce.jsx'), 'utf8');
  assert.match(src, /event_id: eventIdFuer\(data, META_EVENT_VIEW_CONTENT\)/);
  assert.match(src, /event_id: eventIdFuer\(data, META_EVENT_ADD_TO_CART\)/);
});

test('Subscriber-Texte von MetaPixel und QpxCommerce sind verschieden (toString-Schluessel)', () => {
  const mp = readFileSync(join(APP, 'components', 'MetaPixel.jsx'), 'utf8');
  const qc = readFileSync(join(APP, 'components', 'QpxCommerce.jsx'), 'utf8');
  const cb = (s, ev) => {
    const i = s.indexOf(`subscribe('${ev}'`);
    return s.slice(i, s.indexOf('});', i));
  };
  for (const ev of ['product_viewed', 'product_added_to_cart']) {
    assert.notEqual(cb(mp, ev), cb(qc, ev), ev);
  }
});

test('nie zwei Id-Quellen: qbm- entsteht nur in app/lib/meta-event-id.js', () => {
  const treffer = [];
  const lauf = (dir) => {
    for (const e of readdirSync(dir, {withFileTypes: true})) {
      const p = join(dir, e.name);
      if (e.isDirectory()) lauf(p);
      else if (/\.(jsx?|mjs)$/.test(e.name) && readFileSync(p, 'utf8').includes("'qbm-'")) {
        treffer.push(p.slice(APP.length + 1));
      }
    }
  };
  lauf(APP);
  assert.deepEqual(treffer, ['lib/meta-event-id.js']);
});

// ── 4. InitiateCheckout aus einer Quelle ──
test('CartSummary.jsx: Storefront-fbq-InitiateCheckout stillgelegt, qpx bleibt', () => {
  const src = readFileSync(join(APP, 'components', 'CartSummary.jsx'), 'utf8');
  assert.match(src, /export const STOREFRONT_IC_FBQ = false;/);
  const i = src.indexOf("'InitiateCheckout'");
  const davor = src.slice(src.lastIndexOf('if (', i), i);
  assert.match(davor, /STOREFRONT_IC_FBQ &&/, 'fbq-IC nicht hinter dem Schalter');
  assert.match(src, /qpxTrack\(\s*'initiate_checkout'/, 'qpx-Zeuge fehlt');
});

test('CartSummary: Submit-Handler feuert ohne Schalter kein fbq-IC, aber qpx', async () => {
  // Verhalten des Handlers nachgestellt: nur der Rumpf von trackInitiateCheckout.
  const src = readFileSync(join(APP, 'components', 'CartSummary.jsx'), 'utf8');
  const a = src.indexOf('const trackInitiateCheckout = () => {');
  const b = src.indexOf('\n  };', a);
  const rumpf = src.slice(a, b + 4);
  const fbq = [];
  const qpx = [];
  const ctx = {
    STOREFRONT_IC_FBQ: false,
    window: {fbq: (...x) => fbq.push(x)},
    qpxTrack: (...x) => qpx.push(x),
    buildInitiateCheckoutEvent: (d) => d,
    contentIds: ['1'],
    subtotal: {amount: '94.00', currencyCode: 'EUR'},
    numItems: 1,
  };
  vm.runInNewContext('{' + rumpf + '\ntrackInitiateCheckout();}', ctx);
  assert.equal(fbq.length, 0, 'fbq-IC trotz Schalter false');
  assert.equal(qpx.length, 1);
  assert.equal(qpx[0][0], 'initiate_checkout');
  ctx.STOREFRONT_IC_FBQ = true;
  vm.runInNewContext('{' + rumpf + '\ntrackInitiateCheckout();}', ctx);
  assert.equal(fbq.length, 1, 'Rueckweg true feuert fbq-IC nicht');
  assert.equal(fbq[0][1], 'InitiateCheckout');
});
