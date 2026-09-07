import {
  appendTrackingToCheckoutUrl,
  buildAttributionCartAttributes,
  buildOriginCartAttributes,
  getCheckoutTrackingSearchParams,
  isQiblancoProductionHost,
  mergeCartAttributes,
} from '~/lib/checkout-tracking';
import {hasRegionAwareTrackingPermission} from '~/lib/consent-policy';

/**
 * Persists ad click IDs on the Shopify cart so they become order note_attributes.
 *
 * @param {{
 *   cart: import('@shopify/hydrogen').HydrogenCart,
 *   request: Request,
 *   env?: Record<string, string | undefined>,
 *   result: {
 *     cart?: {id?: string, attributes?: Array<{key?: string | null, value?: string | null}> | null} | null,
 *     errors?: Array<unknown>,
 *     warnings?: Array<unknown>,
 *   } | null,
 * }} options
 */
export async function persistAttributionOnCartResult({
  cart,
  request,
  env,
  result,
}) {
  if (!result?.cart) return result;

  // Job 20260907-fbc-klick-id-... (s02): hier stand
  // `if (!result?.cart || !hasAttributionConsent(request, env)) return result;`.
  // Ohne Consent lief `buildAttributionCartAttributes` GAR NICHT ERST AN — der
  // dortige Fix vom 2026-08-09 (Marker unbedingt) war von hier oben aus
  // wirkungslos, und die Order trug am Ende KEIN einziges note_attribute.
  // Die consent-FREIEN Herkunfts-Marker werden deshalb IMMER geschrieben, die
  // personenbezogenen NUR mit Consent. Details: buildOriginCartAttributes().
  const cartAttributes = [
    ...getOriginCartAttributes(request),
    ...(hasAttributionConsent(request, env)
      ? getAttributionCartAttributes(request)
      : []),
  ];

  const {attributes, changed} = mergeCartAttributes(
    result.cart.attributes,
    cartAttributes,
  );

  if (!changed) return result;

  const updatedResult = await cart.updateAttributes(attributes);

  return {
    ...result,
    ...updatedResult,
    cart: updatedResult?.cart ?? result.cart,
    errors: mergeResultMessages(result.errors, updatedResult?.errors),
    warnings: mergeResultMessages(result.warnings, updatedResult?.warnings),
  };
}

/**
 * @param {Request} request
 * @param {Record<string, string | undefined> | undefined} env
 */
export function hasAttributionConsent(request, env) {
  // Job 20260718: region-aware (DE=consent, sonst optout NACH Env-Flip;
  // ohne PUBLIC_CONSENT_STRICT_REGIONS exakt heutiges Consent-Verhalten).
  return (
    hasRegionAwareTrackingPermission(request, env) ||
    isPreviewTrackingAllowed(request, env)
  );
}

/**
 * Consent-FREIE Herkunfts-Marker (attribution_source, consent_state, ua_class).
 * Ausschließlich Request-Metadaten: User-Agent-Header + Cookiebot-Cookie als
 * ja/nein/unbekannt. Keine Klick-ID, kein _fbc/_fbp/_qpx_anon, kein
 * landing_page, kein referrer.
 *
 * @param {Request} request
 */
export function getOriginCartAttributes(request) {
  return buildOriginCartAttributes({
    userAgent: request.headers.get('User-Agent'),
    cookieHeader: request.headers.get('Cookie'),
  });
}

/**
 * @param {Request} request
 */
export function getAttributionCartAttributes(request) {
  const url = new URL(request.url);

  return buildAttributionCartAttributes({
    searchParams: url.searchParams,
    cookieHeader: request.headers.get('Cookie'),
    includeCookies: true,
  });
}

/**
 * @param {string} checkoutUrl
 * @param {Request} request
 * @param {Record<string, string | undefined> | undefined} env
 */
export function getTrackedCheckoutUrl(checkoutUrl, request, env) {
  if (!hasAttributionConsent(request, env)) return checkoutUrl;

  const url = new URL(request.url);
  const searchParams = getCheckoutTrackingSearchParams({
    searchParams: url.searchParams,
    cookieHeader: request.headers.get('Cookie'),
    includeCookies: true,
  });

  return appendTrackingToCheckoutUrl(checkoutUrl, {
    searchParams,
    cookieHeader: request.headers.get('Cookie'),
    includeCookies: true,
  });
}

/**
 * @param {Array<unknown> | undefined} first
 * @param {Array<unknown> | undefined} second
 */
function mergeResultMessages(first, second) {
  return [...(first ?? []), ...(second ?? [])];
}

/**
 * @param {Request} request
 * @param {Record<string, string | undefined> | undefined} env
 */
function isPreviewTrackingAllowed(request, env) {
  return (
    env?.PUBLIC_ENABLE_TRACKING_IN_PREVIEW === 'true' &&
    !isQiblancoProductionHost(request.url)
  );
}
