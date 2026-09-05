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
  // UpPromote-Affiliate-Referenz (Großjob s03, 2026-08-25). Der Wert kommt als
  // Query-Parameter am Affiliate-Link an (`?sca_ref=<id>.<hash>`) und ist KEIN
  // Cookie — er gehört deshalb hierher und ausdrücklich NICHT in
  // TRACKING_COOKIE_NAMES, genau wie fbclid und gclid (Entscheidung 2026-07-27,
  // sie steht weiter).
  //
  // WARUM DER WERT DIE CHECKOUT-GRENZE ÜBERQUERT: die UpPromote-Cookies auf
  // qiblanco.com sind host-only und auf checkout.qiblanco.com nicht lesbar. Der
  // Linker der App könnte sie überreichen, aber er dekoriert nur <a href> —
  // und in diesem Storefront führt KEIN einziger <a> zum Checkout, beide Wege
  // (cart.attribution.jsx, cart.$lines.jsx) enden in einem Server-Redirect.
  // Der Übergabeweg, den die Gegenseite selbst vorsieht, ist dieser Parameter:
  // das App-Embed auf checkout.qiblanco.com liest `sca_ref` aus der URL
  // (core.min.js: REF_CODE:"sca_ref") und misst sogar, wie lange sein Web-Pixel
  // braucht, um daraus die Affiliate-Cookies zu machen.
  //
  // ZWEITE WIRKUNG, die hier beabsichtigt ist: der Wert wird dadurch auch zum
  // Order-note_attribute und macht die Zuordnung für uns GEGENPRÜFBAR. Vor
  // diesem Bau trug 0 von 4 nachweislichen Affiliate-Orders die Referenz in
  // einem eigenen Attribut (gemessen 2026-08-25).
  //
  // ACHTUNG BEI ÄNDERUNGEN: diese Liste hat eine ZWILLINGSLISTE in
  // public/qiblanco-tracker.js (Z. 4). Der Tracker entscheidet, was überhaupt
  // GESPEICHERT wird, diese Liste, was davon WEITERGEREICHT wird. Wer nur eine
  // von beiden ergänzt, baut einen stillen Verlust — in beide Richtungen.
  // Bewacht von probe-uppromote-dach (Subkommando `naht`).
  'sca_ref',
  'sca_source',
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
  // deterministisch mit der Ad-Klick-Session über identity_edge(anon) — auch bei
  // Multi-Session/Return-Visit ohne fbclid in der URL. Rein first-party/intern,
  // NICHT an Meta/Google gesendet; Capture bleibt consent-gated (wie fbc/fbp).
  '_qpx_anon',
]);

const MAX_CART_ATTRIBUTE_VALUE_LENGTH = 500;

// Query-Keys, die nie in ein Order-note_attribute gehören (Identitaet,
// Zugangsdaten, Kontakt). Bewusst eine DENYLIST, keine Allowlist:
// die Backend-Konsumenten der `landing_page`-Query sitzen in mehreren fremden
// Modulen (hyros-eigenbau own_source `_landing_params` + herkunft,
// capi-rueckspeisung order_to_event, google-rueckspeisung click_conversions,
// funnel-substrat sources) und lesen dort u.a. `sca_ref`, `gad_campaignid` und
// `source` — Keys, die in TRACKING_PARAM_NAMES bewusst NICHT stehen und darum
// ausschließlich über diese Query erreichbar sind. Eine Allowlist wäre hier
// eine handgepflegte Spiegelliste fremder Parser ohne Durchsetzer: ein
// übersehener Key = stiller Attributionsverlust. Bei der Denylist ist ein
// übersehener Key = unveränderter Bestand. Die Fehlerrichtung entscheidet.
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
 * @param {{
 *   searchParams?: URLSearchParams | string | null,
 *   cookieHeader?: string | null,
 *   includeCookies?: boolean,
 * }} options
 */
export function buildAttributionCartAttributes({
  searchParams,
  cookieHeader,
  includeCookies = true,
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

  // Job 20260809-dach-tracking-schluessel-verlust (2026-08-09): früher stand
  // hier `if (!attributes.length) return attributes;` VOR dem Marker. Ein
  // signal-loser Besucher verließ die Funktion damit, bevor irgendetwas
  // geschrieben wurde — gemessen trugen 41,7 % der DACH-Orders GAR KEIN
  // note_attribute. Folge: "Order lief nicht über die instrumentierte Kasse"
  // war von "Besucher hatte kein Ad-Signal" nicht mehr unterscheidbar, und
  // Gate B von `shop-ankunft` meldete darauf falsch-grün.
  //
  // Der US-Zwilling (us-qiblanco-2024, Commit afa642c, 2026-08-08) hat exakt
  // diesen Frühausstieg geschlossen; hier dieselbe Bauform. ZWEI Hälften,
  // beide nötig:
  //   1. Der Marker wird UNBEDINGT geschrieben (auch ohne jedes Signal).
  //   2. Der Marker zählt NICHT als Signal — sonst würden landing_page und
  //      referrer plötzlich für jeden organischen Besucher mitgeschrieben,
  //      also eine stille Ausweitung der Datenmenge statt eines Fixes.
  // Regression: test/checkout-tracking-signallos.test.mjs
  const hasTrackingSignal = attributes.length > 0;

  if (hasTrackingSignal) {
    // Job 20260809-fj1 (2026-08-10): `landing_page`/`referrer` trugen bisher den
    // VOLLEN href inklusive Query und Fragment in ein Order-note_attribute. Ein
    // Query-String kann personenbeziehbar sein (`?email=`, `?token=`); er wird
    // deshalb vor dem Schreiben bereinigt. Gerettet aus PR #163, der wegen des
    // hiesigen `hasTrackingSignal`-Gates (#174) sonst nicht mehr mergebar war.
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
  }

  // qb_ad_id — DIE NORMALISIERTE AD-ID (Grossjob 20260905-ads-rabattcode-sonde
  // s03). Sie ist der PREISNEUTRALE Zwilling des ad-scharfen Rabattcodes und
  // die Bedingung dafür, dass der Code ueberhaupt kausal gelesen werden darf:
  // ohne einen zweiten, unabhaengigen Zeugen kann eine Bestellung mit Code X
  // nicht von einer Bestellung unterschieden werden, deren Kaeufer den Code
  // nur weitergereicht bekam (Leck-Kennzahl, Sollwert 0).
  //
  // WARUM EIN EIGENES ATTRIBUT UND NICHT utm_content DIREKT: utm_content ist
  // KEIN Ad-ID-Feld. Gemessen über 14 Tage stehen dort auch 'Facebook_UA'
  // (11.174 Landungen), 'linktree' (1.420) und 'link_in_bio'. Ein Konsument
  // könnte Ad-ID und Freitext nicht trennen. Und die beiden Traeger sind
  // komplementaer, nicht redundant: Ad 120251220869070704 liefert 32.621 mal
  // utm_content und 0 mal h_ad_id, Ad 120243903213670443 genau umgekehrt —
  // erst ihre Vereinigung deckt alle aktiven Anzeigen.
  //
  // Regel wie hyros-eigenbau/journey/own_source.py:_AD_ID_RE (rein numerisch,
  // 10-20 Stellen). Reihenfolge = Deckung: utm_content 98,7 %, h_ad_id 54,1 %.
  //
  // ZÄHLT NICHT ALS SIGNAL: der Wert wird aus `trackingParams` abgeleitet,
  // existiert also nur, wenn ohnehin ein Ad-Signal da war — er kann den
  // hasTrackingSignal-Zweig oben nicht kuenstlich öffnen (Job 20260809).
  addCartAttribute(attributes, 'qb_ad_id', adIdAusTrackingParams(trackingParams));

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

const AD_ID_RE = /^[0-9]{10,20}$/;

/**
 * Plattform-Ad-ID aus den bereits erlaubten Tracking-Parametern. Liefert nur
 * eine rein numerische ID (10-20 Stellen) — Freitext-utm_content wird
 * verworfen, nicht durchgereicht.
 *
 * @param {URLSearchParams} trackingParams
 * @returns {string | null}
 */
export function adIdAusTrackingParams(trackingParams) {
  if (!trackingParams) return null;
  for (const key of ['utm_content', 'h_ad_id']) {
    const wert = (trackingParams.get(key) || '').trim();
    if (AD_ID_RE.test(wert)) return wert;
  }
  return null;
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
 * Entfernt Identitäts-/Zugangs-Query-Keys und den Fragment-Teil aus einer URL,
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
