export const ATTRIBUTION_STORAGE_KEY = 'qiblanco_checkout_attribution';
export const ATTRIBUTION_COOKIE_NAME = ATTRIBUTION_STORAGE_KEY;

const TRACKING_PRODUCTION_HOSTS = new Set([
  'qiblanco.com',
  'www.qiblanco.com',
  'us.qiblanco.com',
  'qiblanco.de',
  'www.qiblanco.de',
]);

const TRACKING_PARAM_NAMES = new Set([
  'fbclid',
  'fbc',
  'fbp',
  '_fbc',
  '_fbp',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'ttclid',
  'twclid',
  'li_fat_id',
  'epik',
  'scclid',
  'sccid',
  'rdt_cid',
  'irclickid',
  'click_id',
  'clickid',
  'h_ad_id',
  'h_click_id',
]);

const TRACKING_COOKIE_NAMES = new Set([
  '_fbc',
  '_fbp',
  'hyros_id',
  'hyros_sid',
  'hyros_session_id',
  'hyros_visitor_id',
  // First-Party qpx-Visitor-ID (Job 20260722-stitch-gap-session-kauf, 2026-07-23):
  // der eigene qpx-Pixel setzt _qpx_anon (365-Tage-Cookie, opakes uuid). Ihn als
  // Order-note_attribute mitzufuehren schliesst die Session->Kauf-Luecke: der
  // own-source-Stitch (own_source.py, gated OS_STITCH_SESSION) verbindet den Kauf
  // deterministisch mit der Ad-Klick-Session ueber identity_edge(anon) — auch bei
  // Multi-Session/Return-Visit ohne fbclid in der URL. Rein first-party/intern,
  // NICHT an Meta/Google gesendet; Capture bleibt consent-gated (wie fbc/fbp).
  '_qpx_anon',
]);

const MAX_CART_ATTRIBUTE_VALUE_LENGTH = 500;

// Query-Keys, die nie in ein Order-note_attribute gehoeren (Identitaet,
// Zugangsdaten, Kontakt). Bewusst eine DENYLIST, keine Allowlist:
// die Backend-Konsumenten der `landing_page`-Query sitzen in mehreren fremden
// Modulen (hyros-eigenbau own_source `_landing_params` + herkunft,
// capi-rueckspeisung order_to_event, google-rueckspeisung click_conversions,
// funnel-substrat sources) und lesen dort u.a. `sca_ref`, `gad_campaignid` und
// `source` — Keys, die in TRACKING_PARAM_NAMES bewusst NICHT stehen und darum
// ausschließlich über diese Query erreichbar sind. Eine Allowlist wäre hier
// eine handgepflegte Spiegelliste fremder Parser ohne Durchsetzer: ein
// uebersehener Key = stiller Attributionsverlust. Bei der Denylist ist ein
// uebersehener Key = unveraenderter Bestand. Die Fehlerrichtung entscheidet.
const SENSITIVE_QUERY_PARAM_NAMES = new Set([
  'email',
  'e_mail',
  'mail',
  'user_email',
  'customer_email',
  'phone',
  'telephone',
  'mobile',
  'first_name',
  'firstname',
  'last_name',
  'lastname',
  'fullname',
  'address',
  'street',
  'postal_code',
  'birthday',
  'birthdate',
  'dob',
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'access_token',
  'id_token',
  'refresh_token',
  'auth',
  'authorization',
  'api_key',
  'apikey',
  'otp',
  'session',
  'session_id',
  'sessionid',
  'sid',
  'iban',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
]);

/**
 * Appends only allowlisted ad attribution values to a checkout URL.
 *
 * @param {string} checkoutUrl
 * @param {{
 *   searchParams?: URLSearchParams | string | null,
 *   cookieHeader?: string | null,
 *   includeCookies?: boolean,
 * }} options
 */
export function appendTrackingToCheckoutUrl(
  checkoutUrl,
  {searchParams, cookieHeader, includeCookies = false} = {},
) {
  if (!checkoutUrl) return checkoutUrl;

  let url;
  try {
    url = new URL(checkoutUrl);
  } catch {
    return checkoutUrl;
  }

  const trackingParams = getCheckoutTrackingSearchParams({
    searchParams,
    cookieHeader,
    includeCookies,
  });

  for (const [name, value] of trackingParams) {
    appendAllowedTrackingValue(url.searchParams, name, value);
  }

  return url.toString();
}

/**
 * @param {{
 *   searchParams?: URLSearchParams | string | null,
 *   cookieHeader?: string | null,
 *   includeCookies?: boolean,
 * }} options
 */
export function getCheckoutTrackingSearchParams({
  searchParams,
  cookieHeader,
  includeCookies = false,
} = {}) {
  const target = new URLSearchParams();
  const storedAttribution = readStoredAttribution(cookieHeader);

  for (const [name, value] of getStoredAttributionParamEntries(
    storedAttribution,
  )) {
    setAllowedTrackingValue(target, name, value);
  }

  for (const [name, value] of normalizeSearchParams(searchParams)) {
    setAllowedTrackingValue(target, name, value, {overwrite: true});
  }

  if (includeCookies) {
    const cookies = parseCookieHeader(cookieHeader);
    for (const name of TRACKING_COOKIE_NAMES) {
      setAllowedTrackingValue(target, name, cookies[name], {overwrite: true});
    }
  }

  return target;
}

/**
 * Builds Shopify cart attributes that become order note_attributes after checkout.
 *
 * `alwaysMarkEntry` (Job 20260802-fj1, Kill-Schalter PUBLIC_ATTRIBUTION_ENTRY_MARK):
 * Hier stand ein Early-Return auf `!attributes.length`. Fand die Funktion keinen
 * Klick-/Cookie-Key, fiel damit auch der NICHT-identifizierende Einstiegspfad weg
 * (landing_page/referrer/attribution_saved_at/attribution_source) — er wird erst
 * darunter angehaengt. Folge: eine Order mit leeren note_attributes war nicht
 * unterscheidbar von einer, bei der unser Code nie lief. `attribution_source`
 * ist deshalb jetzt der Abdeckungs-Marker "unser Code lief und hat gemessen".
 *
 * WICHTIG — der Fix lockert KEINE Einwilligung: identifizierende Keys kommen
 * unveraendert nur über `trackingParams` (Consent-/Cookie-Logik), und der
 * einzige produktive Aufrufer (cart-attribution.server.js) ruft diese Funktion
 * ohnehin erst NACH `hasAttributionConsent()` auf.
 *
 * @param {{
 *   searchParams?: URLSearchParams | string | null,
 *   cookieHeader?: string | null,
 *   includeCookies?: boolean,
 *   alwaysMarkEntry?: boolean,
 * }} options
 */
export function buildAttributionCartAttributes({
  searchParams,
  cookieHeader,
  includeCookies = true,
  alwaysMarkEntry = true,
} = {}) {
  const storedAttribution = readStoredAttribution(cookieHeader);
  const trackingParams = getCheckoutTrackingSearchParams({
    searchParams,
    cookieHeader,
    includeCookies,
  });

  const attributes = [];
  for (const [key, value] of trackingParams) {
    addCartAttribute(attributes, key, value);
  }

  // Kill-Schalter: `false` stellt exakt das alte All-or-Nothing-Verhalten her.
  if (!attributes.length && !alwaysMarkEntry) return attributes;

  addCartAttribute(
    attributes,
    'landing_page',
    sanitizeAttributionUrl(storedAttribution?.href),
  );
  addCartAttribute(
    attributes,
    'referrer',
    sanitizeAttributionUrl(storedAttribution?.referrer),
  );
  addCartAttribute(
    attributes,
    'attribution_saved_at',
    storedAttribution?.savedAt,
  );
  addCartAttribute(attributes, 'attribution_source', 'qiblanco_hydrogen');

  return attributes;
}

/**
 * @param {Array<{key?: string | null, value?: string | null}> | null | undefined} existingAttributes
 * @param {Array<{key: string, value: string}>} attributionAttributes
 */
export function mergeCartAttributes(existingAttributes, attributionAttributes) {
  const merged = new Map();

  for (const attribute of existingAttributes ?? []) {
    if (!attribute?.key) continue;
    merged.set(attribute.key, attribute.value ?? '');
  }

  let changed = false;
  for (const attribute of attributionAttributes) {
    if (!attribute?.key || !attribute?.value) continue;
    if (merged.get(attribute.key) !== attribute.value) changed = true;
    merged.set(attribute.key, attribute.value);
  }

  return {
    attributes: [...merged].map(([key, value]) => ({key, value})),
    changed,
  };
}

/**
 * @param {string | null} cookieHeader
 */
export function hasCookiebotMarketingConsent(cookieHeader) {
  const cookieConsent = parseCookieHeader(cookieHeader).CookieConsent;
  if (!cookieConsent) return false;

  const decoded = safeDecode(cookieConsent);
  return /(?:^|[,{]\s*|["'])marketing["']?\s*:\s*true(?:[,}]|$)/i.test(
    decoded,
  );
}

/**
 * Aktive Ablehnung: Cookiebot-Stamp vorhanden UND marketing:false.
 * (Kein Stamp = keine Entscheidung => false; Zustimmung => false.)
 * Job 20260718: Grundlage der 'optout'-Policy — nie gegen erklaerten Willen.
 *
 * @param {string | null} cookieHeader
 */
export function hasCookiebotMarketingDeclined(cookieHeader) {
  const cookieConsent = parseCookieHeader(cookieHeader).CookieConsent;
  if (!cookieConsent) return false;

  const decoded = safeDecode(cookieConsent);
  return /(?:^|[,{]\s*|["'])marketing["']?\s*:\s*false(?:[,}]|$)/i.test(
    decoded,
  );
}

/**
 * @param {string} requestUrl
 */
export function isQiblancoProductionHost(requestUrl) {
  try {
    const {hostname} = new URL(requestUrl);
    return TRACKING_PRODUCTION_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/**
 * @param {URLSearchParams | string | null | undefined} searchParams
 */
function normalizeSearchParams(searchParams) {
  if (!searchParams) return [];
  if (searchParams instanceof URLSearchParams) return searchParams.entries();
  return new URLSearchParams(searchParams).entries();
}

/**
 * @param {URLSearchParams} target
 * @param {string} name
 * @param {string | undefined} value
 */
function appendAllowedTrackingValue(target, name, value) {
  if (!value || !isTrackingParamName(name) || target.has(name)) return;
  target.append(name, value);
}

/**
 * @param {URLSearchParams} target
 * @param {string} name
 * @param {string | undefined} value
 * @param {{overwrite?: boolean}} options
 */
function setAllowedTrackingValue(target, name, value, {overwrite = false} = {}) {
  if (!value || !isTrackingParamName(name)) return;
  if (!overwrite && target.has(name)) return;
  target.set(name, value);
}

/**
 * @param {string} name
 */
function isTrackingParamName(name) {
  return (
    TRACKING_PARAM_NAMES.has(name) ||
    TRACKING_COOKIE_NAMES.has(name) ||
    /^utm_[a-z0-9_]+$/i.test(name)
  );
}

/**
 * @param {Array<{key: string, value: string}>} attributes
 * @param {string} key
 * @param {string | null | undefined} value
 */
function addCartAttribute(attributes, key, value) {
  if (!value) return;
  attributes.push({
    key,
    value: truncateCartAttributeValue(value),
  });
}

/**
 * Entfernt Identitaets-/Zugangs-Query-Keys und den Fragment-Teil aus einer URL,
 * bevor sie als `landing_page`/`referrer` in ein Order-note_attribute geht.
 *
 * Gibt den Eingabe-String BYTE-IDENTISCH zurück, wenn nichts zu entfernen war —
 * so bleibt der Bestandswert (den fremde Parser per `urlsplit().query` lesen)
 * frei von URL-Normalisierungs-Nebenwirkungen.
 *
 * @param {string | null | undefined} rawUrl
 * @returns {string} bereinigte URL oder '' wenn unbrauchbar
 */
function sanitizeAttributionUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl) return '';

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return '';
  }

  // Nur echte Web-URLs (schuetzt vor javascript:/data:/android-app: im referrer).
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';

  let removed = false;
  for (const name of [...url.searchParams.keys()]) {
    if (!SENSITIVE_QUERY_PARAM_NAMES.has(name.toLowerCase())) continue;
    url.searchParams.delete(name);
    removed = true;
  }

  if (!removed && !url.hash) return rawUrl;

  url.hash = '';
  return url.toString();
}

/**
 * @param {string} value
 */
function truncateCartAttributeValue(value) {
  if (value.length <= MAX_CART_ATTRIBUTE_VALUE_LENGTH) return value;
  return value.slice(0, MAX_CART_ATTRIBUTE_VALUE_LENGTH);
}

/**
 * @param {string | null | undefined} cookieHeader
 */
function readStoredAttribution(cookieHeader) {
  const rawValue = parseCookieHeader(cookieHeader)[ATTRIBUTION_COOKIE_NAME];
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} storedAttribution
 */
function getStoredAttributionParamEntries(storedAttribution) {
  if (!Array.isArray(storedAttribution?.params)) return [];

  return storedAttribution.params.filter(
    (entry) =>
      Array.isArray(entry) &&
      typeof entry[0] === 'string' &&
      typeof entry[1] === 'string',
  );
}

/**
 * @param {string | null | undefined} cookieHeader
 */
function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (name) cookies[name] = safeDecode(value);
    return cookies;
  }, {});
}

/**
 * @param {string} value
 */
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
