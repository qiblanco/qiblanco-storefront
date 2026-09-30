import {WEBVIEW_META_MARKERS} from './checkout-tracking.js';

/**
 * Gemeinsame Regeln von „Link per E-Mail schicken" (CJ-Großjob 20260930, s06):
 * Komponente reusables/LinkPerMail.jsx, Routen link-per-mail.jsx und
 * weiter.$token.jsx. EINE Quelle je Muster; der Server
 * (hyros-eigenbau/learning/inapp_bruecke/src/bruecke.py) prüft dieselben
 * Muster noch einmal und ist die maßgebliche Stelle.
 *
 * Kein Geheimnis in dieser Datei: der Endpunkt ist öffentlich, die Drossel
 * sitzt auf dem Server.
 */
export const ENDPUNKT = 'https://bruecke.65-108-150-121.sslip.io';
export const LINK_PER_MAIL_ROUTE = '/link-per-mail';

export const PFAD_RX =
  /^\/(?:|cart|products\/[a-z0-9][a-z0-9-]{0,99}|pages\/[A-Za-z0-9][A-Za-z0-9-]{0,99}|collections\/[a-z0-9][a-z0-9-]{0,99})$/;
export const CART_RX =
  /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_-]{8,160}(?:\?key=[A-Za-z0-9_-]{8,160})?$/;
export const TOKEN_RX = /^[A-Za-z0-9_-]{20,64}$/;
export const EH_RX = /^[0-9a-f]{16}$/;
export const EMAIL_RX =
  /^[^\s@<>"',;:\\]{1,64}@[A-Za-z0-9.-]{1,252}\.[A-Za-z]{2,24}$/;

/**
 * Meta-Browser nach DERSELBEN Markerliste wie classifyUserAgent. classifyUserAgent
 * selbst zieht die Klasse `intern` vor; unsere stummen Proben tragen den
 * Haus-Marker und müssen das Element trotzdem sehen (wie KasseImBrowser).
 *
 * @param {string | null | undefined} userAgent
 */
export function istMetaBrowser(userAgent) {
  const u = (userAgent || '').toLowerCase();
  return Boolean(u) && WEBVIEW_META_MARKERS.some((m) => u.includes(m));
}

/**
 * Env INAPP_BRUECKE_API lenkt auf einen Wegwerf-Endpunkt um (Tests, lokal).
 * Auf Oxygen ist sie nicht gesetzt.
 */
export function basis(context) {
  const env = context?.env?.INAPP_BRUECKE_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

function signal(ms) {
  return typeof AbortSignal !== 'undefined' &&
    typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

/**
 * Wirft nie. {status: 0} heißt „nicht erreichbar", nie „leer".
 *
 * @param {string} url
 * @param {RequestInit} init
 * @param {number} ms
 */
export async function holeJson(url, init, ms) {
  try {
    const res = await fetch(url, {...init, signal: signal(ms)});
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return {status: res.status, body};
  } catch {
    return {status: 0, body: null};
  }
}
