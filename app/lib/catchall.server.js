/**
 * Catch-All-Entscheidung (Auftrag 20260720-ads-lpa-s02-catchall-404):
 * Der alte Catch-All ($.jsx) warf bedingungslos redirect('/') — jeder
 * unbekannte Pfad inkl. ALLER Locale-Prefixe (/en-th/, /de-de/, /en/ ...)
 * endete 302 auf der Startseite, ohne Log, ohne 404; die storefrontRedirect-
 * Kette in server.js (greift nur bei Status 404) wurde NIE erreicht.
 * Genau daran scheiterte der Thailand-Kunde an /en-th/pages/exclusive-solutions.
 *
 * Neues Verhalten (reine Entscheidungsfunktionen, hermetisch testbar in
 * test/catchall.test.mjs):
 *  - Locale-Prefix (/<lang>/ oder /<lang>-<country>/, case-insensitiv,
 *    lang strikt ISO-639-1) -> 302 auf denselben Pfad OHNE Prefix,
 *    Query byte-erhalten.
 *  - Alles andere -> 404 (Response, KEIN Redirect) -> storefrontRedirect
 *    kann Shopify-Admin-URL-Redirects greifen lassen, sonst rendert die
 *    root-ErrorBoundary den 404.
 *
 * Pro Catch-All-Durchlauf wird genau EIN Prefix gestrippt; faengt der Rest
 * wieder mit einem Locale-Muster an (/en/de/pages/x), entscheidet der
 * naechste Routing-Durchlauf. Ein Redirect-Loop ist unmoeglich, weil jeder
 * Strip den Pfad strikt verkuerzt.
 *
 * MESSBARKEIT (der alte Fehlermodus war die Unsichtbarkeit): jeder Treffer
 * wird strukturiert nach stdout geloggt (Oxygen-Logs); der Locale-Strip-Fall
 * sendet zusaetzlich einen fail-soften Server-Beacon an unseren eigenen
 * qpx-Receiver (/b, cookielose Basis-Ebene) — der 404-Fall braucht keinen
 * Beacon, weil die 404-Seite den qpx-Pixel client-seitig laedt und
 * basis_hit/behavior_page den Pfad ohnehin aufzeichnen. Beacon-Zeilen sind
 * in basis_hit am Pfad-Prefix /__qb-catchall/ eindeutig filterbar.
 */

// ISO-639-1-Sprachcodes (vollstaendige Menge). Strikte Whitelist statt
// "irgendwas Zweibuchstabiges": echte 2-Buchstaben-Routen wie /go ('go' ist
// KEIN ISO-639-1-Code) und Fantasie-Prefixe (/enx/, /e/) fallen durch.
const ISO_639_1 = new Set([
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu',
  'ja', 'jv',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku',
  'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq',
  'sr', 'ss', 'st', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt',
  'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu',
]);

// /<lang> oder /<lang>-<country>, danach Segmentende (/ oder Pfadende).
const LOCALE_RE = /^\/([A-Za-z]{2})(?:-([A-Za-z]{2}))?(?:\/(.*))?$/;

/**
 * Reine Pfad-Entscheidung des Catch-Alls.
 * @param {string} pathname URL-Pfad (ohne Query), z. B. '/en-th/pages/x'
 * @returns {{typ: 'locale-strip', locale: string, ziel: string} | {typ: 'not-found'}}
 */
export function analysiereCatchAllPfad(pathname) {
  const m = LOCALE_RE.exec(pathname || '');
  if (m && ISO_639_1.has(m[1].toLowerCase())) {
    const locale = m[2] ? `${m[1]}-${m[2]}`.toLowerCase() : m[1].toLowerCase();
    // Fuehrende Slashes/Backslashes des Rests auf EINEN '/' kollabieren:
    // '/en//evil.com' -> '/evil.com' (sonst waere '//evil.com' eine
    // schema-relative URL = Open Redirect auf einen Fremd-Host).
    const rest = (m[3] || '').replace(/^[/\\]+/, '');
    return {typ: 'locale-strip', locale, ziel: `/${rest}`};
  }
  return {typ: 'not-found'};
}

/**
 * Gesamt-Entscheidung inkl. Query-Erhalt (byte-identisch via url.search).
 * @param {string} requestUrl volle Request-URL
 * @returns {{typ: 'locale-strip', locale: string, location: string} | {typ: 'not-found'}}
 */
export function catchAllEntscheidung(requestUrl) {
  const url = new URL(requestUrl);
  const befund = analysiereCatchAllPfad(url.pathname);
  if (befund.typ === 'locale-strip') {
    return {
      typ: 'locale-strip',
      locale: befund.locale,
      location: `${befund.ziel}${url.search}`,
    };
  }
  return {typ: 'not-found'};
}

const BEACON_TIMEOUT_MS = 1200;

/**
 * Messbarkeit eines Catch-All-Treffers: strukturiertes Log (Oxygen) fuer
 * jeden Fall + fail-softer /b-Beacon fuer den Locale-Strip-Fall. Darf die
 * Response NIE verzoegern oder brechen: der Fetch laeuft via waitUntil,
 * jeder Fehler wird verschluckt.
 * @param {{env?: Record<string, string|undefined>, waitUntil?: (p: Promise<unknown>) => void}} context
 * @param {'locale_strip'|'not_found'} typ
 * @param {URL} url Original-Request-URL
 * @param {string|null} ziel Redirect-Ziel (nur locale_strip)
 */
export function protokolliereCatchAll(context, typ, url, ziel) {
  try {
    // eslint-disable-next-line no-console -- bewusstes Mess-Log (Oxygen-Logs)
    console.log(
      JSON.stringify({
        ereignis: 'qb-catchall',
        typ,
        pfad: url.pathname,
        query: url.search || '',
        ziel: ziel || null,
      }),
    );
  } catch {
    // Logging darf nie werfen.
  }
  if (typ !== 'locale_strip') return; // 404-Seite misst client-seitig via qpx
  try {
    const endpoint = context?.env?.PUBLIC_QPX_BASIS_ENDPOINT;
    if (!endpoint || typeof fetch !== 'function') return; // fail-closed ohne Env
    const signal =
      typeof AbortSignal !== 'undefined' &&
      typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(BEACON_TIMEOUT_MS)
        : undefined;
    const beacon = fetch(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        // Bewusst eigener UA (kein _BOT_MARKERS-Treffer des Receivers):
        // macht die Zeilen serverseitig als Catch-All-Beacon erkennbar.
        'User-Agent': 'qpx-catchall-beacon/1.0',
      },
      body: JSON.stringify({
        // Synthetischer Pfad-Namespace: in basis_hit eindeutig filterbar
        // (url_path LIKE '/__qb-catchall/%'), kollidiert mit keiner echten
        // Seiten-Zeile der Auswertungen (lp-rotation/verhaltens-schicht
        // aggregieren je url_path).
        url: `https://${url.hostname}/__qb-catchall/${typ}${url.pathname}`,
        referrer: '',
      }),
    }).catch(() => {});
    if (typeof context?.waitUntil === 'function') {
      context.waitUntil(beacon);
    }
  } catch {
    // fail-soft: Messung darf den Redirect nie brechen.
  }
}
