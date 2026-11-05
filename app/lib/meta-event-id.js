/**
 * meta-event-id.js — EINE Ereignis-Id je Hydrogen-Analytics-Payload.
 * ===========================================================================
 * Job 20261031-meta-capi-luecken-dach-bau-ai-server-prio10 (Christian,
 * 31.10.2026: „Die Conversions API sorgt dafür, dass dir nichts entgeht.“).
 *
 * ViewContent und AddToCart gehen im Global Deutsch-Shop zweimal an Meta:
 * als Browser-Ereignis (MetaPixel.jsx, fbq) und als Server-Ereignis
 * (capi-rueckspeisung liest die qpx-Zeile aus events.db). Meta zählt beide nur
 * dann einmal, wenn sie DIESELBE event_id tragen. Diese Id entsteht hier und
 * nur hier:
 *   MetaPixel.jsx    fbq('track', …, params, {eventID: id})
 *   QpxCommerce.jsx  qpxTrack(…, {...ev, event_id: id})  -> events.db PRIMARY KEY
 *
 * Warum eine WeakMap auf das Payload-Objekt: Hydrogen ruft jeden Subscriber
 * eines Ereignisses mit DERSELBEN payload-Referenz auf (publishEvent:
 * `callback(payload)` je Subscriber, belegt in test/meta-event-id.test.mjs
 * gegen den installierten Hydrogen-Code). Beide Subscriber fragen hier mit
 * demselben Objekt und demselben Namen und bekommen dieselbe Id, gleich in
 * welcher Reihenfolge sie laufen. Ein neues Ereignis ist ein neues Objekt und
 * bekommt eine neue Id. Die WeakMap hält das Objekt nicht fest.
 *
 * Die Id quert keine Grenze: sie bleibt am Storefront (fbq + qpx-Beacon an den
 * eigenen Receiver), kein Cookie, kein Checkout-Attribut.
 */

export const META_EVENT_ID_PRAEFIX = 'qbm-';

/** Hydrogen-Ereignisnamen als Schlüssel: beide Subscriber nennen denselben. */
export const META_EVENT_VIEW_CONTENT = 'product_viewed';
export const META_EVENT_ADD_TO_CART = 'product_added_to_cart';

const idsJePayload = new WeakMap();

function hex(bytes) {
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

/**
 * RFC-4122-v4-UUID. crypto.randomUUID gibt es nur im sicheren Kontext; sonst
 * getRandomValues, sonst Math.random (nur Eindeutigkeit gefragt, kein Geheimnis).
 * @returns {string}
 */
export function uuid() {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(b);
  } else {
    for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  }
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = hex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Die eine Id für dieses Payload-Objekt und diesen Ereignisnamen.
 *
 * @param {object|null|undefined} payload  Hydrogen-Analytics-Payload (data)
 * @param {string} name  META_EVENT_VIEW_CONTENT | META_EVENT_ADD_TO_CART
 * @returns {string|undefined} `qbm-<uuid>`; ohne Objekt undefined
 */
export function eventIdFuer(payload, name) {
  if (!payload || typeof payload !== 'object' || !name) return undefined;
  let je = idsJePayload.get(payload);
  if (!je) {
    je = Object.create(null);
    idsJePayload.set(payload, je);
  }
  if (!je[name]) je[name] = META_EVENT_ID_PRAEFIX + uuid();
  return je[name];
}
