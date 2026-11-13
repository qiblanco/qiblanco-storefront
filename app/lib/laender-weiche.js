/**
 * LÄNDER-WEICHE DE -> US (Elina EL-20261113-73c7c1f9, GO 13.11.2026).
 *
 * Besucher von qiblanco.com aus Ländern AUSSERHALB von EU + Schweiz
 * (+ Liechtenstein, Norwegen, Island) gehen auf den US-Shop qi-blanco.com,
 * und zwar auf die passende Gegenseite: Produkt -> gleiches US-Produkt,
 * bf-deals -> US-bf-deals, Pre-Access -> US-Pre-Access, Startseite ->
 * Startseite. Die Schweiz bleibt im DE-Shop (CHF).
 *
 * KEINE Weiterleitung, wenn
 *   - der Schalter aus ist oder die Startzeit (WEICHE_AKTIV_AB) noch nicht
 *     erreicht ist. Elina: "erst nach dem Pre-Sale-Start heute (nach 21:30)
 *     live schalten" -> 21:35 Uhr Berlin = 20:35Z;
 *   - die Adresse einen ?markt=-Parameter trägt (Prüf-Ausnahme). ?markt=DE
 *     schaltet die Weiche zusätzlich für die ganze Sitzung ab (Sitzungs-Cookie
 *     qb_markt=DE, ohne Ablaufdatum = endet mit dem Browser);
 *   - ein Warenkorb läuft (Hydrogen-Cookie `cart`): Warenkorb und Kasse
 *     laufender Sitzungen werden nicht unterbrochen. Die Kasse selbst liegt
 *     ohnehin auf Shopifys Kassen-Domain und läuft nie durch diese Weiche;
 *   - der Besuch vom US-Shop kommt (Referer qi-blanco.com): wer dort bewusst
 *     auf "Deutsch" klickt, soll nicht im Kreis zurückgeschickt werden; die
 *     Sitzung merkt sich die Wahl wie bei ?markt=DE;
 *   - ein Suchmaschinen-Crawler oder ein Vorschau-/Prüf-Roboter fragt (Google,
 *     Bing, Meta-Linkvorschau, Werbeprüfung, Uptime-Messung ...);
 *   - das Land unbekannt ist (kein Geo-Kopf) -> fail-closed, der DE-Shop
 *     antwortet wie bisher;
 *   - es kein Seitenaufruf ist: nur GET/HEAD auf Seitenpfade. Daten-Abrufe der
 *     Seitennavigation (.data), /api, /cart, /checkout, /account, /discount,
 *     Sitemap, robots, Dateien mit Endung bleiben unberührt.
 *
 * Antwort: 302 + Cache-Control no-store (Konvention der Bestands-Weichen,
 * siehe lp-ab-v2.server.js). Die Seiten sind ohnehin full-page-uncacheable.
 * Die Abfrage-Parameter (utm_*, fbclid, gclid ...) reisen mit.
 *
 * RÜCKWEG ohne Code-Suche: WEICHE_SCHALTER = false (ein Deploy), oder
 * hb-deploy revert des Merge-Commits.
 *
 * Reine Datenfabrik ohne React-/Vite-Import: node --test-fähig
 * (test/laender-weiche.test.mjs).
 */
import {switchTarget, SHOP_ORIGIN} from './shop-switch.js';

/** Hauptschalter. false = die Weiche ist aus, egal wie spät es ist. */
export const WEICHE_SCHALTER = true;

/** Startzeit: 13.11.2026 21:35 Uhr Berlin (MEZ) = 20:35Z, nach dem Pre-Sale-Start 21:30. */
export const WEICHE_AKTIV_AB = '2026-11-13T20:35:00Z';
const AKTIV_AB_MS = Date.parse(WEICHE_AKTIV_AB);

export const US_ORIGIN = SHOP_ORIGIN.us;
export const SITZUNGS_COOKIE = 'qb_markt';

/**
 * Länder, die im DE-Shop bleiben: die 27 EU-Staaten (Österreich ist EU),
 * dazu Schweiz, Liechtenstein, Norwegen, Island (Elinas Wortlaut).
 * Mit eigenem ISO-Code geführte Gebiete, die Teil der EU sind, zählen als EU:
 * Åland (AX, Finnland) und die französischen Gebiete in äußerster Randlage
 * (GP Guadeloupe, MQ Martinique, GF Französisch-Guayana, RE Réunion,
 * YT Mayotte, MF Saint-Martin).
 */
export const BLEIBT_IM_DE_SHOP = new Set([
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EU-Gebiete mit eigenem ISO-Code
  'AX', 'GP', 'MQ', 'GF', 'RE', 'YT', 'MF',
  // Schweiz + EWR
  'CH', 'LI', 'NO', 'IS',
]);

/**
 * Gegenseiten, die die Umschalter-Tabelle (shop-switch.js) nicht kennt.
 * BF-Deal-Adressen DE (bf-deals-daten.js, BF_DEAL_SEITEN + Kakao-Umleitungen)
 * -> US-Deal-Seiten (us-qiblanco-2024 snippets/bf-deal-daten.liquid, Feld
 * adresse), nur bis zum Ende der BF-Codes. Alle US-Ziele live gemessen
 * 13.11.2026: HTTP 200.
 */
export const BF_DEAL_ENDE_MS = Date.parse('2026-11-30T22:59:59Z');
const BF_DEAL_GEGENSEITEN = {
  '/products/8kendiw34hd': '/pages/rk3xmgho0m0', // 2x QiOne 2 Pro
  '/products/jhsdhze783': '/pages/rk3xmgho0m0',
  '/products/pjdz538hgs0': '/pages/b9rkk99ssbm', // QiOne 2 Pro + Kette
  '/products/734husd8hh': '/pages/b9rkk99ssbm',
  '/products/687ghgf4ed': '/pages/w3ickm27k2i', // QiBracelet
  '/products/56huz67dds': '/pages/c4173cw1v79', // QiHome Air
  '/products/j7hcyb802kn': '/pages/izw9jai5k5x', // Kakao
  '/products/awcr37shyj': '/pages/izw9jai5k5x',
  '/products/aw783hfn': '/pages/izw9jai5k5x',
  '/products/37cr378n': '/pages/izw9jai5k5x',
};
const ZUSATZ_GEGENSEITEN = {
  '/pages/bf-deals': '/pages/bf-deals',
  '/pages/bf-deals-b': '/pages/bf-deals-b',
  '/pages/pre-access': '/pages/pre-access',
  '/pages/pre-access-b': '/pages/pre-access-b',
  '/pages/10-jahre-pre-access': '/pages/pre-access',
  '/pages/qi-alpha': '/pages/Qi-Alpha',
  '/products/necklace-2': '/products/necklace-2',
};

/** Pfade, die nie weitergeleitet werden (Präfix, klein geschrieben). */
const NIE_PRAEFIXE = [
  '/api/',
  '/cart',
  '/checkout',
  '/checkouts',
  '/account',
  '/discount/',
  '/collect',
  '/sitemap',
  '/robots.txt',
  '/.well-known',
  '/cdn/',
  '/__',
  '/admin',
  '/apps/',
];

/**
 * Roboter: Suchmaschinen, Linkvorschau, Werbeprüfung, Leistungs- und
 * Verfügbarkeitsmessung. Leerer User-Agent zählt ebenfalls als Roboter.
 */
const ROBOTER =
  /\bbot\b|bot\/|bot;|bot\)|crawl|spider|slurp|mediapartners-google|adsbot|storebot|google-inspectiontool|googleother|google-extended|feedfetcher|apis-google|google-read-aloud|facebookexternalhit|facebookcatalog|meta-externalagent|meta-externalfetcher|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|pinterest|redditbot|embedly|quora link preview|skypeuripreview|bingpreview|applebot|duckduck|yandex|baidu|sogou|exabot|petalbot|semrush|ahrefs|mj12bot|dotbot|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic|perplexity|bytespider|amazonbot|ccbot|diffbot|headlesschrome|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|site24x7|monitor/i;

export function istRoboter(userAgent) {
  const ua = String(userAgent || '').trim();
  if (!ua) return true;
  return ROBOTER.test(ua);
}

function cookieWert(cookieKopf, name) {
  for (const teil of String(cookieKopf || '').split(';')) {
    const i = teil.indexOf('=');
    if (i < 0) continue;
    if (teil.slice(0, i).trim() === name) return teil.slice(i + 1).trim();
  }
  return null;
}

function istSeitenPfad(pfad) {
  const klein = pfad.toLowerCase();
  if (NIE_PRAEFIXE.some((p) => klein === p.replace(/\/$/, '') || klein.startsWith(p))) {
    return false;
  }
  // Dateien und Daten-Abrufe der Seitennavigation (.data, .xml, .json, .js ...)
  const letztes = klein.split('/').pop() || '';
  if (/\.[a-z0-9]{1,6}$/.test(letztes)) return false;
  return true;
}

/**
 * US-Gegenseite eines DE-Pfads (ohne Abfrage-Parameter).
 * @param {string} pathname
 * @param {number} [jetzt]
 * @returns {string} absolute URL auf qi-blanco.com
 */
export function usGegenseite(pathname, jetzt = Date.now()) {
  let pfad = String(pathname || '/');
  try {
    pfad = decodeURIComponent(pfad);
  } catch {
    // roher Pfad
  }
  const norm = (pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad).toLowerCase() || '/';
  if (jetzt <= BF_DEAL_ENDE_MS && BF_DEAL_GEGENSEITEN[norm]) {
    return US_ORIGIN + BF_DEAL_GEGENSEITEN[norm];
  }
  if (ZUSATZ_GEGENSEITEN[norm]) return US_ORIGIN + ZUSATZ_GEGENSEITEN[norm];
  // Umschalter-Tabelle (SSoT shop-mapping.yaml); ohne Treffer US-Startseite.
  return switchTarget(norm, 'us');
}

/**
 * Entscheidung für einen Request.
 * @param {Request} request
 * @param {{jetzt?: number, schalter?: boolean}} [opt]
 * @returns {{art: 'weiter', ziel: string}
 *   | {art: 'bleiben', grund: string, sitzungMerken?: boolean}}
 */
export function laenderWeicheEntscheiden(request, opt = {}) {
  const jetzt = opt.jetzt ?? Date.now();
  const schalter = opt.schalter ?? WEICHE_SCHALTER;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return {art: 'bleiben', grund: 'url'};
  }
  const methode = (request.method || 'GET').toUpperCase();
  if (methode !== 'GET' && methode !== 'HEAD') return {art: 'bleiben', grund: 'methode'};
  if (!istSeitenPfad(url.pathname)) return {art: 'bleiben', grund: 'pfad'};

  const kopf = request.headers;
  const markt = url.searchParams.get('markt');
  if (markt !== null) {
    return {
      art: 'bleiben',
      grund: 'markt-parameter',
      sitzungMerken: markt.trim().toUpperCase() === 'DE',
    };
  }
  if (!schalter || jetzt < AKTIV_AB_MS) return {art: 'bleiben', grund: 'aus'};

  const cookies = kopf.get('cookie') || '';
  if ((cookieWert(cookies, SITZUNGS_COOKIE) || '').toUpperCase() === 'DE') {
    return {art: 'bleiben', grund: 'sitzung-de'};
  }
  if (cookieWert(cookies, 'cart')) return {art: 'bleiben', grund: 'warenkorb'};
  if (istRoboter(kopf.get('user-agent'))) return {art: 'bleiben', grund: 'roboter'};

  const land = (kopf.get('oxygen-buyer-country') || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(land) || land === 'XX' || land === 'T1') {
    return {art: 'bleiben', grund: 'land-unbekannt'};
  }
  if (BLEIBT_IM_DE_SHOP.has(land)) return {art: 'bleiben', grund: 'land-de-shop'};

  let vonUs = false;
  try {
    const ref = kopf.get('referer');
    if (ref) vonUs = new URL(ref).hostname.replace(/^www\./, '') === 'qi-blanco.com';
  } catch {
    vonUs = false;
  }
  if (vonUs) return {art: 'bleiben', grund: 'von-us-shop', sitzungMerken: true};

  return {art: 'weiter', ziel: usGegenseite(url.pathname, jetzt) + url.search};
}

/** Set-Cookie-Zeile der Sitzungs-Ausnahme (Sitzungs-Cookie, kein Ablaufdatum). */
export const SITZUNGS_COOKIE_ZEILE = `${SITZUNGS_COOKIE}=DE; Path=/; Secure; SameSite=Lax`;

/**
 * Weiche am Rand: liefert eine 302-Antwort oder null (= normal weiter).
 * Wirft nie: jeder Fehler heißt "DE-Shop antwortet wie bisher".
 */
export function laenderWeiche(request, opt) {
  try {
    const e = laenderWeicheEntscheiden(request, opt);
    if (e.art !== 'weiter') return null;
    return new Response(null, {
      status: 302,
      headers: {
        Location: e.ziel,
        'Cache-Control': 'no-store',
        'X-QB-Laender-Weiche': 'us',
      },
    });
  } catch {
    return null;
  }
}

/** true = die Antwort soll das Sitzungs-Cookie setzen (?markt=DE, Klick vom US-Shop). */
export function sitzungMerken(request, opt) {
  try {
    const e = laenderWeicheEntscheiden(request, opt);
    return Boolean(e.sitzungMerken);
  } catch {
    return false;
  }
}
