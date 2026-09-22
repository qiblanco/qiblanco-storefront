import {
  appendTrackingToCheckoutUrl,
  buildAttributionCartAttributes,
  buildOriginCartAttributes,
  getCheckoutTrackingSearchParams,
  isQiblancoProductionHost,
  mergeCartAttributes,
} from '~/lib/checkout-tracking';
import {hasRegionAwareTrackingPermission} from '~/lib/consent-policy';
import {
  buyerIpAusRequest,
  istInternerZugriff,
} from '~/lib/interner-verkehr';

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

  // FAIL-SAFE gegen eine Regression im Mutations-Fragment (Job 20260923-...):
  // `result.cart.attributes === undefined` heißt "das Feld wurde gar nicht
  // abgefragt", `[]` heißt "abgefragt und leer". Das sind zwei verschiedene
  // Saetze, und sie duerfen nie denselben Wert liefern — sonst wird aus "ich
  // konnte nicht nachsehen" die Sachaussage "da steht nichts", und die
  // Monotonie von `ad_params_seen` wertet ein belegtes `yes_*` still ab.
  // Genau so war es bis zum 2026-09-23 auf dem GESAMTEN Hauptpfad.
  //
  // Geheilt ist die Ursache im Fragment (app/lib/context.js `mutateFragment`).
  // Dieser Nachgriff ist der Rueckfall, falls sie je wieder wegfaellt: EINE
  // zusaetzliche Abfrage, und nur im kaputten Fall. Er ist zugleich der Grund,
  // warum der Defekt VERHALTENSMAESSIG rot pruefbar ist (ARM-H3).
  const bestehendeAttribute = await vorbestandAttribute(cart, result.cart);

  const cartAttributes = [
    ...getOriginCartAttributes(request, {
      bestehendeAttribute,
    }),
    ...(hasAttributionConsent(request, env)
      ? getAttributionCartAttributes(request)
      : []),
  ];

  const {attributes, changed} = mergeCartAttributes(
    bestehendeAttribute,
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
 * Vorbestand der Cart-Attribute. Ein Mutationsergebnis TRÄGT das Feld, solange
 * `mutateFragment` es abfragt; fehlt es (undefined), wird es einmal per
 * `cart.get()` nachgeholt statt `null` anzunehmen. Ein leeres Array ist eine
 * ANTWORT und wird nie nachgeholt.
 *
 * Wirft nie: eine gescheiterte Nachfrage darf den Kaufweg nicht stoeren — dann
 * gilt wieder der Zustand von vorher (kein Vorbestand bekannt), also hoechstens
 * so schlecht wie ohne diesen Nachgriff.
 *
 * @param {{get: () => Promise<{attributes?: Array<{key?: string | null, value?: string | null}> | null} | null>}} cart
 * @param {{attributes?: Array<{key?: string | null, value?: string | null}> | null}} resultCart
 * @returns {Promise<Array<{key?: string | null, value?: string | null}> | null>}
 */
async function vorbestandAttribute(cart, resultCart) {
  if (resultCart.attributes !== undefined) return resultCart.attributes;

  try {
    const gelesen = await cart.get();
    return gelesen?.attributes ?? null;
  } catch {
    return null;
  }
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
 * Consent-FREIE Herkunfts-Marker (attribution_source, consent_state, ua_class,
 * ad_params_seen). Ausschließlich Request-Metadaten: User-Agent-Header,
 * Cookiebot-Cookie als ja/nein/unbekannt, das VORHANDENSEIN eines
 * Tracking-Parameter-NAMENS in Query bzw. Referer, und die Ja/Nein-Antwort des
 * Trackers aus seinem seit jeher pre-consent gefuellten sessionStorage-Puffer.
 * Keine Klick-ID, kein _fbc/_fbp/_qpx_anon, kein landing_page, kein referrer —
 * und kein WERT eines Ad-Parameters.
 *
 * @param {Request} request
 * @param {{clientMarker?: string | null,
 *          bestehendeAttribute?: Array<{key?: string | null, value?: string | null}> | null}} [optionen]
 *   `clientMarker` liefert NUR der Kasse-Knopf (cart.attribution.jsx), weil nur
 *   dort ein Formular existiert. Die uebrigen Eintrittspunkte kommen ohne aus
 *   und fallen auf Query/Referer/Cookie bzw. auf `unknown` zurück.
 *   `bestehendeAttribute` trägt die Monotonie: ein bereits belegtes `yes_*`
 *   darf von einem spaeteren, schlechter informierten Lauf nicht abgewertet
 *   werden.
 */
export function getOriginCartAttributes(request, optionen = {}) {
  const {clientMarker = null, bestehendeAttribute = null} = optionen;
  const userAgent = request.headers.get('User-Agent');
  return buildOriginCartAttributes({
    userAgent,
    cookieHeader: request.headers.get('Cookie'),
    // Die Query DIESES Requests: leer beim POST auf /cart/attribution, aber
    // gefuellt beim Direkt-zur-Kasse-Link /cart/<lines>?utm_...
    searchParams: sucheAusRequest(request),
    referer: request.headers.get('Referer'),
    clientMarker,
    bisherigerAdMarker: adMarkerAusAttributen(bestehendeAttribute),
    // ZWEITE ACHSE, und sie ist NUR HIER verfuegbar: die Client-IP steht im
    // Request, nicht im User-Agent. Deshalb wird die SSoT SERVERSEITIG
    // ausgewertet — eine Wache, die ihren Marker-UA vergisst, wird an der IP
    // trotzdem erkannt, und ein Client ohne IP-Traeger am Marker. Zwei Achsen,
    // die VERSCHIEDENE Größen lesen: genau das macht sie unabhängig.
    intern: istInternerZugriff({
      userAgent,
      ip: buyerIpAusRequest(request),
    }),
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

/**
 * Query des laufenden Requests. Wirft nie — eine unparsbare URL ist hier kein
 * Grund, den Kaufweg zu stoeren.
 *
 * @param {Request} request
 * @returns {URLSearchParams | null}
 */
function sucheAusRequest(request) {
  try {
    return new URL(request.url).searchParams;
  } catch {
    return null;
  }
}

/**
 * Bereits am Warenkorb haengender Ankunfts-Marker (für die Monotonie-Regel in
 * `adParamsSeenMarker`).
 *
 * @param {Array<{key?: string | null, value?: string | null}> | null | undefined} attribute
 * @returns {string | null}
 */
function adMarkerAusAttributen(attribute) {
  for (const eintrag of attribute ?? []) {
    if (eintrag?.key === 'ad_params_seen') return eintrag.value ?? null;
  }
  return null;
}
