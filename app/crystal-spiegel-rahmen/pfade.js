/**
 * PFAD-KARTE DES CRYSTAL-SPIEGELS — die eine Stelle, an der crystal-Pfade zu
 * qiblanco-Pfaden werden.
 *
 * WARUM ES SIE GIBT (Christian, 16.10.2026, Übergabe #71): der Bereich
 * „Unser Kakao / AWAKE / CREATE“ auf qiblanco.com ist ein 1:1-Spiegel von
 * crystal-cacao.com. Der Spiegel unter app/crystal-spiegel/ ist ERZEUGT
 * (crystal-cacao-node/bin/spiegel-nachzug) und rechnet in crystal-Koordinaten:
 * seine Verweise zeigen auf `/`, `/#kundenstimmen`, `/pages/warum-crystal-cacao`.
 * Im qiblanco-Laden ist `/` aber die Qi-Blanco-Startseite. Statt den Text des
 * Spiegels umzuschreiben (das wäre eine zweite, driftende Fassung), übersetzt
 * der Router-Shim (./router.js) jeden Verweis beim Rendern über diese Karte.
 *
 * DREI FÄLLE:
 *   1. Seiten des Spiegels: crystal-Pfad -> qiblanco-Pfad (SPIEGEL_SEITEN).
 *   2. Geteilte Ziele: derselbe Shopify-Katalog, dieselbe Kasse, dieselben
 *      Rechtstexte der Qi Blanco UG — der Pfad bleibt (GETEILT).
 *   3. Alles andere gibt es nur auf crystal-cacao.com (Absichtserklärung,
 *      Kakao-Erfahrungen, Kurs-Eintragung …): absoluter Verweis dorthin.
 *      Default-deny: eine neue crystal-Seite landet so nie als 404 im
 *      qiblanco-Laden, sondern beim Original.
 */

export const CRYSTAL_ORIGIN = 'https://crystal-cacao.com';

/** crystal-Pfad -> qiblanco-Pfad der gespiegelten Reiter-Seiten. */
export const SPIEGEL_SEITEN = Object.freeze({
  '/': '/pages/crystal-cacao',
  '/pages/crystal-cacao': '/pages/crystal-cacao',
  '/products/crystal-cacao-awake': '/products/crystal-cacao-awake',
  '/products/crystal-cacao-create': '/products/crystal-cacao-create',
});

/** Ziele, die beide Läden gleich führen (Katalog, Kasse, Rechtstexte). */
const GETEILT = [
  /^\/products\//,
  /^\/collections\//,
  /^\/cart(\/|$)/,
  /^\/policies\//,
  /^\/discount\//,
  /^\/pages\/(impressum|datenschutz|agb|widerruf)$/,
];

function zerlege(ziel) {
  const m = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(ziel);
  return {pfad: m[1] || '/', suche: m[2] || '', anker: m[3] || ''};
}

/**
 * crystal-Ziel -> qiblanco-Ziel. Relative Ziele, reine Anker, fremde Hosts
 * und Nicht-Strings bleiben unberührt (Objekt-Ziele werden am pathname übersetzt).
 */
export function zuQiblanco(ziel) {
  if (ziel && typeof ziel === 'object') {
    return ziel.pathname ? {...ziel, pathname: zuQiblanco(ziel.pathname)} : ziel;
  }
  if (typeof ziel !== 'string' || !ziel.startsWith('/') || ziel.startsWith('//')) {
    return ziel;
  }
  const {pfad, suche, anker} = zerlege(ziel);
  if (Object.prototype.hasOwnProperty.call(SPIEGEL_SEITEN, pfad)) {
    return SPIEGEL_SEITEN[pfad] + suche + anker;
  }
  if (GETEILT.some((re) => re.test(pfad))) return ziel;
  return CRYSTAL_ORIGIN + ziel;
}

/** qiblanco-Pfad -> crystal-Pfad (für useLocation im Spiegel). */
export function zuCrystal(pfad) {
  if (pfad === '/pages/crystal-cacao' || pfad === '/pages/crystal-cacao/') return '/';
  return pfad;
}

/** Ist das Ziel nach der Übersetzung ein fremder Host? */
export function istExtern(ziel) {
  return typeof ziel === 'string' && /^https?:\/\//.test(ziel);
}

/** Hosts des eigenen Kakao-Ladens (mit und ohne www, wie im Shopify-Menü). */
const CRYSTAL_HOSTS = new Set(['crystal-cacao.com', 'www.crystal-cacao.com']);

/**
 * Menüpunkt mit Ziel auf crystal-cacao.com -> Pfad im qiblanco-Laden, sonst null.
 *
 * AUFTRAG (Christian, 17.10.2026, Eingang #1 zu Übergabe #71, zum Shop-Menü
 * „Crystal Cacao®“): „hier wenn man auf Crystal Kakao klickt, soll man eben
 * auf die Frontseite von Kakao kommen. Das aber innerhalb der Seite“. Der
 * Eintrag im Shopify-Menü zeigt auf https://www.crystal-cacao.com/ und öffnete
 * bis hier einen zweiten Laden im neuen Tab. Über dieselbe Karte wie der
 * Spiegel wird `/` zur Reiter-Seite; ein geteiltes Ziel (Katalog) bleibt im
 * Laden; was es nur bei crystal gibt, bleibt extern (null).
 */
export function menueZiel(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!CRYSTAL_HOSTS.has(url.hostname)) return null;
  const ziel = zuQiblanco(`${url.pathname}${url.search}${url.hash}`);
  return istExtern(ziel) ? null : ziel;
}
