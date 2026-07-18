/**
 * Region-aware Consent-Policy (Job 20260718-storefront-pixel-tracking-vertiefung).
 *
 * Christian-Vorgabe: DSGVO-Consent-Gating NUR fuer Deutschland (DE); US, CH und
 * EU-Ausland ohne DSGVO-Restriktion. Ehrlicher Hinweis: CH (revDSG) und
 * AT/EU (ePrivacy/TKG) kennen aehnliche Regeln — die Umstufung folgt Christians
 * expliziter Vorgabe und ist pro Region per Env-Var reversibel.
 *
 * FAIL-CLOSED: Ohne PUBLIC_CONSENT_STRICT_REGIONS (Oxygen-Env, Christian-Hand)
 * gilt 'consent' fuer ALLE Regionen = heutiges Verhalten, byte-gleich. Erst der
 * Env-Flip (z.B. "DE") oeffnet die Nicht-DE-Regionen auf 'optout'.
 *
 * Policies:
 *   'consent'  Tracking NUR nach aktiver Cookiebot-Marketing-Einwilligung.
 *   'optout'   Tracking ab Seitenaufruf; eine AKTIV erklaerte Ablehnung im
 *              Banner wird IMMER respektiert (nie gegen erklaerten Willen).
 *
 * Region-Quelle: Oxygen-Geo-Header 'oxygen-buyer-country' (Cloudflare).
 * Unbekannte/fehlende Region => 'consent' (strengste Stufe, fail-closed).
 */
import {
  hasCookiebotMarketingConsent,
  hasCookiebotMarketingDeclined,
} from '~/lib/checkout-tracking';

export const OXYGEN_COUNTRY_HEADER = 'oxygen-buyer-country';

/**
 * @param {Record<string, string | undefined> | undefined} env
 * @returns {string[]} ISO-3166-1-alpha-2 Laender mit Consent-Pflicht;
 *   leeres Array = Flag nicht gesetzt = ALLE Regionen streng (fail-closed).
 */
export function strictRegions(env) {
  const raw = env?.PUBLIC_CONSENT_STRICT_REGIONS;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c));
}

/**
 * @param {string | null | undefined} country ISO-2 (z.B. 'DE'), '' = unbekannt
 * @param {Record<string, string | undefined> | undefined} env
 * @returns {'consent' | 'optout'}
 */
export function policyForCountry(country, env) {
  const strict = strictRegions(env);
  if (!strict.length) return 'consent'; // Env unset => heutiges Verhalten
  const c = (country || '').trim().toUpperCase();
  if (!c) return 'consent'; // Region unbekannt => strengste Stufe
  return strict.includes(c) ? 'consent' : 'optout';
}

/**
 * @param {Request} request
 * @returns {string} ISO-2 oder ''
 */
export function buyerCountry(request) {
  try {
    return (request.headers.get(OXYGEN_COUNTRY_HEADER) || '').toUpperCase();
  } catch {
    return '';
  }
}

/**
 * Server-seitige Tracking-Erlaubnis (Cart-Attribute/Checkout-URL-Dekoration).
 *
 * @param {Request} request
 * @param {Record<string, string | undefined> | undefined} env
 * @returns {boolean}
 */
export function hasRegionAwareTrackingPermission(request, env) {
  const cookieHeader = request.headers.get('Cookie');
  const policy = policyForCountry(buyerCountry(request), env);
  if (policy === 'consent') return hasCookiebotMarketingConsent(cookieHeader);
  // 'optout': erlaubt, ausser der Besucher hat AKTIV abgelehnt.
  return !hasCookiebotMarketingDeclined(cookieHeader);
}
