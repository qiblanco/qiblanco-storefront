import {SESSION_SCHLUESSEL} from '~/lib/geschaeftskunde';

/**
 * Serverseite des Geschäftskontos. Vertrag der Tür: b2b-ust/README.md,
 * Abschnitt „Geschäftskonto über den Login-Schalter“.
 *
 *   POST /api/gk/vies      {uid, adresse:{land}}            -> {bestaetigt, name}
 *   POST /api/gk/anmelden  Authorization: <Kundentoken>, Firmendaten
 *   POST /api/gk/status    Authorization: <Kundentoken>
 *
 * KEIN GEHEIMNIS: die Adresse ist öffentlich, ohne gültiges Kundentoken
 * antwortet der Dienst 401 (er prüft das Token selbst bei Shopify, Muster
 * account.partner.jsx). Der Browser ruft den Dienst nie direkt.
 */
export const ENDPUNKT = 'https://b2b.dienst.qiblanco.com';
export const ZEIT_MS = 9000;

/** @param {any} context */
function basis(context) {
  const env = context?.env?.B2B_NETTO_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

/**
 * @param {any} context
 * @param {string} weg
 * @param {any} body
 * @param {string} [token]
 * @returns {Promise<any>} nie wirft: {ok:false, grund:'messausfall'} bei Störung
 */
async function tuer(context, weg, body, token) {
  try {
    const antwort = await fetch(`${basis(context)}/api/gk/${weg}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'qiblanco-storefront/geschaeftskunde',
        ...(token ? {Authorization: token} : {}),
      },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(ZEIT_MS),
    });
    if (antwort.status !== 200) return {ok: false, grund: `http_${antwort.status}`};
    return await antwort.json();
  } catch {
    return {ok: false, grund: 'messausfall'};
  }
}

/** @param {any} context @param {{uid: string, land: string}} d */
export function viesAbfrage(context, d) {
  return tuer(context, 'vies', {uid: d.uid, adresse: {land: d.land}});
}

/** @param {any} context */
async function kundenToken(context) {
  try {
    return (await context.customerAccount.getAccessToken()) || '';
  } catch {
    return '';
  }
}

/** @param {any} context @param {any} daten */
export async function anmelden(context, daten) {
  const token = await kundenToken(context);
  if (!token) return {ok: false, grund: 'token'};
  return tuer(context, 'anmelden', daten, token);
}

/** @param {any} context */
export async function status(context) {
  const token = await kundenToken(context);
  if (!token) return {ok: false, grund: 'token'};
  return tuer(context, 'status', {}, token);
}

/** Firmendaten aus dem Login-Fenster bis nach der Anmeldung (signierte Sitzung, 1 h). */
export function merke(context, daten) {
  context.session.set(SESSION_SCHLUESSEL, {daten, zeit: Date.now()});
}

/** @returns {any|null} und löscht den Merkposten */
export function hole(context) {
  const m = context.session.get(SESSION_SCHLUESSEL);
  if (!m) return null;
  context.session.unset(SESSION_SCHLUESSEL);
  if (!m.daten || Date.now() - Number(m.zeit || 0) > 3600_000) return null;
  return m.daten;
}
