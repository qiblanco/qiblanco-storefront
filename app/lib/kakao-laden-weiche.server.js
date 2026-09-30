/**
 * KAKAO-LADEN-WEICHE (Auftrag 20260930-growth-crystal-laden-zulauf-traeger,
 * Eigner growth-manager; Stufe 1 des Kanal-Routings der Kakao-Nachfrage).
 *
 * WOFÜR: Der eigene Kakao-Laden crystal-cacao.com hatte seit der
 * Ladenmarkierung (19.09.2026) keine Bestellung, weil kein Kanal auf ihn
 * zeigt. Diese Weiche schickt Besucher aus UNSEREN EIGENEN Kanälen (Social
 * organisch, Mail/Newsletter), die auf einer Kakao-Seite von qiblanco.com
 * EINSTEIGEN, per 302 auf die gleichwertige Seite des eigenen Ladens. Das ist
 * dieselbe Wirkung, als hätten wir den Link an der Quelle umgestellt, nur
 * zentral und für alte Posts und Mails mit.
 *
 * WARUM NUR DIESE KLASSE (gemessen 2026-09-30, events.db + Bestell-Feed,
 * 60 Tage, erste Seite der Sitzung auf einer der drei Kakao-Seiten):
 *   Social 113 + Mail 80 Einstiege -> 0 der 23 Kakao-Bestellungen,
 *   Suche 38 Einstiege -> 5 Bestellungen, ohne Referrer 134 -> 3.
 * Die Umleitung der eigenen Kanäle kostet also gemessen keine Bestellung.
 * NIE umgeleitet werden deshalb:
 *   - Suche: sie verkauft (13 % der Einstiege), und eine Umleitung nur für
 *     Suchbesucher wäre gegenüber dem Crawler ein verdeckter Redirect.
 *   - Einstiege ohne Referrer und ohne Kanal-Parameter (Crawler, Tipper,
 *     Lesezeichen): der Crawler sieht so dieselbe Seite wie der Besucher.
 *   - Bezahlte Klicks (utm_medium paid/cpc, gclid, ...): deren Landefläche
 *     gehört der Anzeigen-Steuerung (siehe ad-weiche.server.js).
 *   - Interne Navigation (Referrer qiblanco.com oder crystal-cacao.com) und
 *     Datenrequests (*.data, _data): wer in der Qi-Blanco-Welt weiterklickt,
 *     bleibt dort.
 *
 * SCHALTER (ohne Deploy): Shop-Metafeld `qb_routing.kakao_laden` mit
 * Storefront-Lesezugriff. NUR der Wert 'eigene-kanaele' schaltet ein;
 * Abwesenheit, Lesefehler und jeder andere Wert bedeuten AUS (fail-safe:
 * ohne Messung keine Umleitung). Den Wert setzt und zieht der growth-manager
 * (Stop-Loss auf die Kakao-Bestellungen über alle Läden).
 * Rückweg: Metafeld auf 'aus' (wirkt nach dem 30-s-Cache), zweite Stufe
 * `hb-deploy revert --sha <merge-sha>`.
 *
 * CROSS-BOUNDARY: der Original-Query fährt vollständig mit (utm_*, fbclid,
 * Variante), dazu der Marker qb_weg=qiblanco-kakao für die Zählung am
 * Zugriffslog des eigenen Ladens. Kein neuer Identitäts-Key.
 *
 * Relativ importierbar, kein '~'-Alias: `node --test` lädt das ohne Build.
 */

export const KAKAO_LADEN_HOST = 'https://crystal-cacao.com';
export const KAKAO_WEICHE_MARKER = ['qb_weg', 'qiblanco-kakao'];
export const KAKAO_WEICHE_EIN = 'eigene-kanaele';

/** Kakao-Seite auf qiblanco.com -> gleichwertige Seite im eigenen Laden. */
export const KAKAO_ZIELE = {
  '/pages/crystal-cacao': '/',
  '/products/crystal-cacao-awake': '/products/crystal-cacao-awake',
  '/products/crystal-cacao-create': '/products/crystal-cacao-create',
};

export const KAKAO_WEICHE_QUERY = `#graphql
  query KakaoLadenWeiche {
    shop {
      metafield(namespace: "qb_routing", key: "kakao_laden") {
        value
      }
    }
  }
`;

const BEZAHLT_PARAMETER = [
  'gclid', 'gbraid', 'wbraid', 'dclid', 'gad_source', 'gad_campaignid',
  'ttclid', 'msclkid', 'fbc_id', 'h_ad_id',
];
const BEZAHLT_MEDIUM = new Set([
  'paid', 'cpc', 'ppc', 'cpm', 'display', 'paid_social', 'paidsocial', 'paid-social',
]);
const EIGENES_MEDIUM = new Set([
  'email', 'e-mail', 'newsletter', 'social', 'organic_social', 'social-organic',
]);
const EIGENE_QUELLE = new Set([
  'newsletter', 'mailerlite', 'activecampaign', 'klaviyo', 'ig', 'instagram',
  'facebook', 'fb', 'tiktok', 'youtube', 'pinterest', 'linktree', 'whatsapp',
]);
const INTERNE_HOSTS = ['qiblanco.com', 'crystal-cacao.com', 'myshopify.com'];
const SUCH_HOSTS = [
  'google.', 'bing.', 'qwant.', 'yahoo.', 'duckduckgo.', 'ecosia.', 'startpage.',
  'yandex.', 'baidu.', 'search.brave.', 'perplexity.', 'chatgpt.',
];
const SOCIAL_HOSTS = [
  'instagram.com', 'facebook.com', 'fb.com', 'fb.me', 'tiktok.com', 'youtube.com',
  'pinterest.', 'linktr.ee', 'whatsapp.com', 'wa.me', 'threads.net',
];
const MAIL_HOSTS = [
  'mail.google.com', 'outlook.live.com', 'outlook.office.com', 'outlook.office365.com',
  'mail.yahoo.', 'web.de', 'gmx.', 'mlsend.com', 'mailerlite.', 't-online.de',
  'mail.', 'com.google.android.gm',
];

function hostPasst(host, liste) {
  return liste.some((m) =>
    m.endsWith('.')
      ? host.startsWith(m) || host.includes(`.${m}`)
      : host === m || host.endsWith(`.${m}`),
  );
}

/**
 * Host aus einem Referer-Header; auch android-app://com.google.android.gm/.
 * @param {string | null | undefined} referer
 */
export function refererHost(referer) {
  const r = String(referer ?? '').trim();
  if (!r) return '';
  try {
    return new URL(r).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Herkunftsklasse eines Einstiegs. Reihenfolge: bezahlt und intern zuerst
 * (Vorsicht = Seite zeigen), dann Kanal-Parameter, dann Referrer.
 * @param {URLSearchParams} sp
 * @param {string} host Referer-Host (klein)
 * @returns {'bezahlt'|'intern'|'suche'|'eigener_kanal'|'ohne'|'andere'}
 */
export function herkunftsKlasse(sp, host) {
  const medium = (sp.get('utm_medium') || '').trim().toLowerCase();
  const quelle = (sp.get('utm_source') || '').trim().toLowerCase();
  if (BEZAHLT_PARAMETER.some((k) => sp.has(k)) || BEZAHLT_MEDIUM.has(medium)) {
    return 'bezahlt';
  }
  if (host && INTERNE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return 'intern';
  }
  // Mail VOR Suche: Gmail (mail.google.com, com.google.android.gm) trägt
  // 'google.' im Host und wäre sonst ein Suchbesucher.
  if (host && hostPasst(host, MAIL_HOSTS)) return 'eigener_kanal';
  if (host && hostPasst(host, SUCH_HOSTS)) return 'suche';
  if (EIGENES_MEDIUM.has(medium) || (!medium && EIGENE_QUELLE.has(quelle))) {
    return 'eigener_kanal';
  }
  if (host && hostPasst(host, SOCIAL_HOSTS)) return 'eigener_kanal';
  if (!host && !medium && !quelle) return 'ohne';
  return 'andere';
}

/**
 * Reine Entscheidung (hermetisch testbar).
 * @param {{url: string, referer?: string|null, schalter?: string|null}} args
 * @returns {{ziel: string|null, grund: string}}
 */
export function entscheideKakaoWeiche({url, referer, schalter}) {
  if (String(schalter ?? '').trim().toLowerCase() !== KAKAO_WEICHE_EIN) {
    return {ziel: null, grund: 'schalter_aus'};
  }
  let u;
  try {
    u = new URL(url);
  } catch {
    return {ziel: null, grund: 'url_unlesbar'};
  }
  let pfad = u.pathname;
  if (pfad.endsWith('.data') || u.searchParams.has('_data')) {
    return {ziel: null, grund: 'datenrequest'};
  }
  if (pfad.length > 1 && pfad.endsWith('/')) pfad = pfad.slice(0, -1);
  const zielPfad = KAKAO_ZIELE[pfad];
  if (!zielPfad) return {ziel: null, grund: 'keine_kakao_seite'};
  const [mk, mw] = KAKAO_WEICHE_MARKER;
  if (u.searchParams.has(mk)) return {ziel: null, grund: 'schon_umgeleitet'};
  if ((u.searchParams.get('utm_source') || '').toLowerCase() === 'r3check') {
    return {ziel: null, grund: 'healthcheck'};
  }
  const klasse = herkunftsKlasse(u.searchParams, refererHost(referer));
  if (klasse !== 'eigener_kanal') return {ziel: null, grund: klasse};
  const sp = new URLSearchParams(u.searchParams);
  sp.append(mk, mw);
  return {ziel: `${KAKAO_LADEN_HOST}${zielPfad}?${sp.toString()}`, grund: klasse};
}

/**
 * Liest den Schalter über die Storefront-API (30-s-Cache). Wirft nie; jeder
 * Fehler ist 'aus'.
 * @param {any} storefront Hydrogen-Storefront-Client
 * @returns {Promise<string>}
 */
export async function ladeKakaoWeicheSchalter(storefront) {
  try {
    const cache =
      typeof storefront?.CacheCustom === 'function'
        ? storefront.CacheCustom({mode: 'public', maxAge: 30, staleWhileRevalidate: 30})
        : undefined;
    const data = await storefront.query(KAKAO_WEICHE_QUERY, {cache});
    return String(data?.shop?.metafield?.value ?? 'aus');
  } catch {
    return 'aus';
  }
}

/**
 * Für die drei Kakao-Loader: liefert das Umleitungsziel oder null. Liest den
 * Schalter nur, wenn der Einstieg überhaupt in Frage kommt (spart die Abfrage
 * für Suche, interne Navigation und Datenrequests).
 * @param {{request: Request, context: any}} args
 * @returns {Promise<string|null>}
 */
export async function kakaoLadenZiel({request, context}) {
  try {
    if (request.method !== 'GET') return null;
    const referer = request.headers.get('Referer');
    const vorab = entscheideKakaoWeiche({url: request.url, referer, schalter: KAKAO_WEICHE_EIN});
    if (!vorab.ziel) return null;
    const schalter = await ladeKakaoWeicheSchalter(context?.storefront);
    return entscheideKakaoWeiche({url: request.url, referer, schalter}).ziel;
  } catch {
    return null;
  }
}
