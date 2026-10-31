/**
 * KAKAO-ADRESSEN: welche qiblanco.com-Adresse gehört welcher Seite auf
 * crystal-cacao.com (Elina, Grundsatzentscheidung 30.10.2026,
 * EL-20261030-0adb59f3: „Es soll KEINE parallelen Kakao-Produktseiten auf
 * qiblanco.com mehr geben. Crystal Cacao lebt nur noch auf crystal-cacao.com.“).
 *
 * Die eine Karte für beide Verbraucher:
 *   - die Weiterleitung (kakao-laden-weiche.server.js, Schalterwert 'alle'),
 *   - die Verweise im Laden (Menü, Mega-Menü, Footer, Banner, Partnerseiten),
 *     die ohne Umweg direkt auf crystal-cacao.com zeigen.
 *
 * Ziele GEMESSEN am 2026-10-31 (curl, beide Domains): jedes Ziel unten
 * antwortet auf crystal-cacao.com mit 200. Wo crystal-cacao.com eine Adresse
 * nicht führt (crystal-cacao-angebot = 404 auf beiden Domains), geht es auf
 * die Startseite des Ladens statt auf eine geratene Sortenseite.
 *
 * NICHT in der Karte, mit Absicht: die Kurs-Lektionen (/pages/kakao-anwendung,
 * /pages/zeremonie-kakao-kurs, /pages/was-ist-zeremonie-kakao,
 * /pages/meditieren-mit-zeremonie-kakao). Das sind Inhaltsseiten ohne
 * Gegenstück auf crystal-cacao.com (dort 404), keine Produktseiten.
 *
 * Der Original-Query fährt unverändert mit (sca_ref, utm_*, Art=420g, fbclid,
 * gclid …): Partnercodes und Kampagnen-Zuordnung bleiben erhalten.
 *
 * Rein (kein Netz, kein Server-Import): Komponenten und `node --test` laden sie.
 */

export const KAKAO_LADEN_URSPRUNG = 'https://crystal-cacao.com';

/** qiblanco-Pfad -> crystal-Pfad (exakte Pfade). */
export const KAKAO_ADRESSEN = Object.freeze({
  '/pages/crystal-cacao': '/',
  '/pages/kristall-kakao': '/',
  '/products/crystal-cacao-awake': '/products/crystal-cacao-awake',
  '/products/crystal-cacao-create': '/products/crystal-cacao-create',
  '/products/zeremonie-kakao': '/products/crystal-cacao-create',
  '/products/crystal-cacao-adfiefiale': '/products/crystal-cacao-create',
  '/products/crystal-cacao-angebot': '/',
  // Alte Kurz-Handles (heute Shopify-Weiterleitungen im selben Katalog):
  '/products/37cr378n': '/products/mengenrabatt-2x',
  '/products/aw783hfn': '/products/bundle-2x-awake',
  '/products/awcr37shyj': '/',
  '/collections/zeremonie-kakao': '/collections/zeremonie-kakao',
});

/**
 * Kakao-Sets: gleicher Handle auf crystal-cacao.com (derselbe Shopify-Katalog,
 * gemessen 200 für bundle-2x-awake, bundle-1x-awake-1x-create,
 * bundle-7x-create, mengenrabatt-2x).
 */
const SET_MUSTER = /^\/products\/(bundle-[1-7]x-(awake|create)(-[1-7]x-create)?|mengenrabatt-(2x|3x-create))$/;

function normalisiere(pfad) {
  let p = String(pfad || '').toLowerCase();
  // Locale-Präfixe strippt der Laden ohnehin (catchall.server.js); hier
  // zählen sie gleich, damit /de/products/... denselben Weg nimmt.
  p = p.replace(/^\/(de|en)(?=\/)/, '');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * crystal-Pfad zu einem qiblanco-Pfad, sonst null.
 * @param {string} pfad nur der Pfad, ohne Query
 * @returns {string|null}
 */
export function kakaoZielPfad(pfad) {
  const p = normalisiere(pfad);
  if (Object.prototype.hasOwnProperty.call(KAKAO_ADRESSEN, p)) {
    return KAKAO_ADRESSEN[p];
  }
  if (SET_MUSTER.test(p)) return p;
  return null;
}

/**
 * Verweis (relativ oder absolut auf qiblanco.com) -> absolute crystal-URL mit
 * unverändertem Query und Anker, sonst null.
 * @param {string} ziel
 * @returns {string|null}
 */
export function kakaoZielUrl(ziel) {
  if (typeof ziel !== 'string' || !ziel) return null;
  let u;
  try {
    u = new URL(ziel, 'https://qiblanco.com');
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  if (host !== 'qiblanco.com' && host !== 'www.qiblanco.com') return null;
  const zielPfad = kakaoZielPfad(u.pathname);
  if (!zielPfad) return null;
  return `${KAKAO_LADEN_URSPRUNG}${zielPfad}${u.search}${u.hash}`;
}

/**
 * Für Verweise im Laden: Kakao-Ziel -> crystal-URL, alles andere unverändert.
 * @param {string} ziel
 * @returns {string}
 */
export function kakaoHref(ziel) {
  return kakaoZielUrl(ziel) ?? ziel;
}

/*
 * PARTNER-BRÜCKE (gemessen 2026-10-31, Kanalprüfung zu EL-20261030-0adb59f3):
 * alle rund 700 Partner-Standardlinks zeigen auf die qiblanco.com-Startseite;
 * 2 der 9 Partnerbestellungen seit 01.09. waren Kakao, gekauft nach einem
 * Klick INNERHALB von qiblanco.com. Geht dieser Klick künftig auf
 * crystal-cacao.com, fehlt dort sca_ref, und der Code im qiblanco-Warenkorb
 * wandert nicht mit. Darum trägt ein Kakao-Verweis die Partner-Referenz mit,
 * die der Tracker beim Eintreffen gemerkt hat (sessionStorage/Cookie
 * 'qiblanco_checkout_attribution', public/qiblanco-tracker.js). crystal-cacao.com
 * legt den Code aus demselben Datenmodul selbst in seinen Warenkorb.
 */
export const PARTNER_PARAMETER = ['sca_ref', 'sca_source'];
export const ATTRIBUTION_SCHLUESSEL = 'qiblanco_checkout_attribution';

/**
 * Partner-Parameter aus dem gespeicherten Tracker-Datensatz (JSON-Text).
 * @param {string} roh
 * @returns {Array<[string, string]>}
 */
export function partnerParameterAus(roh) {
  try {
    const d = JSON.parse(String(roh || ''));
    const params = Array.isArray(d?.params) ? d.params : [];
    return params.filter(
      (p) => Array.isArray(p) && PARTNER_PARAMETER.includes(p[0]) && typeof p[1] === 'string' && p[1],
    );
  } catch {
    return [];
  }
}

/**
 * Hängt gemerkte Partner-Parameter an einen crystal-cacao.com-Verweis, wenn
 * er noch keine sca_ref trägt. Alles andere bleibt unverändert.
 * @param {string} href
 * @param {Array<[string, string]>} partner
 * @returns {string}
 */
export function mitPartnerRef(href, partner) {
  if (!partner?.length) return href;
  let u;
  try {
    u = new URL(href);
  } catch {
    return href;
  }
  const host = u.hostname.toLowerCase();
  if (host !== 'crystal-cacao.com' && host !== 'www.crystal-cacao.com') return href;
  if (u.searchParams.has('sca_ref')) return href;
  for (const [name, wert] of partner) {
    if (!u.searchParams.has(name)) u.searchParams.set(name, wert);
  }
  return u.toString();
}
