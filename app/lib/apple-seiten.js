/**
 * APPLE-SEITEN: EIN SCHALTER JE SEITE (Grossjob 20261029-GROSSJOB-alle-shop-
 * seiten-apple-niveau-ausser-seo-geo, s03, KONZEPT §3). Christian 29.10.2026:
 * „die restlichen seiten auf das gleiche apple niveau bringen … also wirklich
 * alle Seiten“, außer SEO/GEO.
 *
 *   A  die Apple-Fassung einer Seite (Baukasten app/components/apple-seite/),
 *      Wurzel trägt data-apple-seite="<seite>"
 *   C  die heutige Fassung, bleibt als Code in der Route und kommt mit einem
 *      Befehl zurück (homepage-bauer/bin/apple-seite, Bauvertrag s03/BAUKASTEN.md)
 *
 * DIESE TABELLE IST DIE QUELLE DES SCHALTERS. `standard` gilt, solange die
 * Umgebung nichts anderes sagt. Steht in der Oxygen-Umgebung der Schalter auf
 * genau 'on' oder 'off', gewinnt dieser Wert (Notgriff ohne Deploy, Muster
 * KONFIGURATOR_<X> in lib/produkt-seite-laden.server.js). Jeder andere Wert,
 * auch ein leerer, lässt `standard` gelten.
 *
 * Default off bis zum Livegang der Seite. Das Bau-Segment einer Seite stellt
 * genau ihre Zeile mit dem Livegang auf 'on' (über `apple-seite an <seite>`
 * oder im eigenen Deploy-Zweig). Der Rückweg-Unterbefehl desselben Befehls stellt sie auf
 * 'off' und deployt über hb-deploy.
 *
 * ZEILENVERTRAG (der Befehl liest und schreibt genau so, nichts sonst):
 *   eine Seite = eine Zeile:  '<seite>': {pfad: '<pfad>', schalter: '<NAME>', standard: 'on'|'off'},
 * Die Gruppen je Bau-Segment sind durch eine Kommentarzeile getrennt, damit
 * parallele Segmente keine benachbarten Zeilen ändern (sonst Merge-Konflikt).
 * `<seite>` ist der Name aus homepage-bauer/config/design_gate_seiten.yaml bzw.
 * claude-jobs/<grossjob>/s02/inventar.json (nur Seiten mit umfang im_umfang,
 * Global Deutsch-Shop). SEO/GEO-Seiten, Qi Alpha und die fertigen
 * Apple-Kaufseiten /products/qione-2-pro|qihome-air|qibracelet stehen hier
 * bewusst nicht: für sie gibt es keinen Schalter.
 */

/** Marker am Wurzelelement jeder A-Fassung (Naht-Vertrag KONZEPT §4.1). */
export const APPLE_SEITE_ATTR = 'data-apple-seite';

export const APPLE_SEITEN = Object.freeze({
  // ---- s04 · Startseite ----
  'startseite': {pfad: '/', schalter: 'APPLE_SEITE_STARTSEITE', standard: 'on'},
  'start-b': {pfad: '/pages/start-b', schalter: 'APPLE_SEITE_START_B', standard: 'on'},

  // ---- s05 · Produkt-Details und Produkt-LPs ----
  'qibracelet': {pfad: '/pages/qibracelet', schalter: 'APPLE_SEITE_QIBRACELET', standard: 'on'},
  'qibracelet-details': {pfad: '/pages/qibracelet-details', schalter: 'APPLE_SEITE_QIBRACELET_DETAILS', standard: 'off'},
  'qihome-air': {pfad: '/pages/qihome-air', schalter: 'APPLE_SEITE_QIHOME_AIR', standard: 'on'},
  'qihome-details': {pfad: '/pages/qihome-details', schalter: 'APPLE_SEITE_QIHOME_DETAILS', standard: 'on'},
  'qione-2-pro-shop': {pfad: '/pages/qione-2-pro', schalter: 'APPLE_SEITE_QIONE_2_PRO_SHOP', standard: 'on'},
  'qione-2-pro-details': {pfad: '/pages/qione-2-pro-details', schalter: 'APPLE_SEITE_QIONE_2_PRO_DETAILS', standard: 'on'},
  'products-8kendiw34hd': {pfad: '/products/8kendiw34hd', schalter: 'APPLE_SEITE_PRODUCTS_8KENDIW34HD', standard: 'off'},
  'products-broschure': {pfad: '/products/broschure', schalter: 'APPLE_SEITE_PRODUCTS_BROSCHURE', standard: 'off'},
  'products-pjdz538hgs0': {pfad: '/products/pjdz538hgs0', schalter: 'APPLE_SEITE_PRODUCTS_PJDZ538HGS0', standard: 'off'},
  'products-qione-kette': {pfad: '/products/qione-kette', schalter: 'APPLE_SEITE_PRODUCTS_QIONE_KETTE', standard: 'off'},

  // ---- s06 · genannte LPs schlaf-zellen-schutz-Familie, studien ----
  'schlaf-zellen-schutz': {pfad: '/pages/schlaf-zellen-schutz', schalter: 'APPLE_SEITE_SCHLAF_ZELLEN_SCHUTZ', standard: 'on'},
  'schlaf-zellen-schutz-b2': {pfad: '/pages/schlaf-zellen-schutz-b2', schalter: 'APPLE_SEITE_SCHLAF_ZELLEN_SCHUTZ_B2', standard: 'on'},
  'schlaf-zellen-schutz-k25': {pfad: '/pages/schlaf-zellen-schutz-k25', schalter: 'APPLE_SEITE_SCHLAF_ZELLEN_SCHUTZ_K25', standard: 'on'},
  'schlaf-zellen-schutz-k50': {pfad: '/pages/schlaf-zellen-schutz-k50', schalter: 'APPLE_SEITE_SCHLAF_ZELLEN_SCHUTZ_K50', standard: 'on'},
  'schlaf-zellen-schutz-v2-18ef': {pfad: '/pages/schlaf-zellen-schutz-v2-18ef', schalter: 'APPLE_SEITE_SCHLAF_ZELLEN_SCHUTZ_V2_18EF', standard: 'off'},
  'studien': {pfad: '/pages/studien', schalter: 'APPLE_SEITE_STUDIEN', standard: 'off'},
  'zell-schutz': {pfad: '/pages/zell-schutz', schalter: 'APPLE_SEITE_ZELL_SCHUTZ', standard: 'off'},

  // ---- s07 · übrige Landingpages ----
  'e-smog-schutz': {pfad: '/pages/E-Smog-Schutz', schalter: 'APPLE_SEITE_E_SMOG_SCHUTZ', standard: 'off'},
  'das-20-tage-versprechen': {pfad: '/pages/das-20-tage-versprechen', schalter: 'APPLE_SEITE_DAS_20_TAGE_VERSPRECHEN', standard: 'on'},
  'das-beispiel': {pfad: '/pages/das-beispiel', schalter: 'APPLE_SEITE_DAS_BEISPIEL', standard: 'off'},
  'e-smog': {pfad: '/pages/e-smog', schalter: 'APPLE_SEITE_E_SMOG', standard: 'off'},
  'entgiftung': {pfad: '/pages/entgiftung', schalter: 'APPLE_SEITE_ENTGIFTUNG', standard: 'off'},
  'exclusive-solutions': {pfad: '/pages/exclusive-solutions', schalter: 'APPLE_SEITE_EXCLUSIVE_SOLUTIONS', standard: 'off'},
  // forschung: bewusst ohne Zeile. Die Seite ist versteckt, test/forschung-seite.test.mjs
  // verbietet jede Nennung ihres Pfads unter app/. s07 entscheidet und zieht den Test mit.
  'haelt-das-mein-leben-aus': {pfad: '/pages/haelt-das-mein-leben-aus', schalter: 'APPLE_SEITE_HAELT_DAS_MEIN_LEBEN_AUS', standard: 'off'},
  'kette-oder-armband': {pfad: '/pages/kette-oder-armband', schalter: 'APPLE_SEITE_KETTE_ODER_ARMBAND', standard: 'on'},
  'kohaerentes-wasser': {pfad: '/pages/kohaerentes-wasser', schalter: 'APPLE_SEITE_KOHAERENTES_WASSER', standard: 'off'},
  'menschen-alltag': {pfad: '/pages/menschen-alltag', schalter: 'APPLE_SEITE_MENSCHEN_ALLTAG', standard: 'off'},
  'mentales-setting': {pfad: '/pages/mentales-setting', schalter: 'APPLE_SEITE_MENTALES_SETTING', standard: 'off'},
  'podcasts': {pfad: '/pages/podcasts', schalter: 'APPLE_SEITE_PODCASTS', standard: 'off'},
  'pages-podcasts-seite-2': {pfad: '/pages/podcasts/seite-2', schalter: 'APPLE_SEITE_PAGES_PODCASTS_SEITE_2', standard: 'off'},
  'pages-podcasts-seite-3': {pfad: '/pages/podcasts/seite-3', schalter: 'APPLE_SEITE_PAGES_PODCASTS_SEITE_3', standard: 'off'},
  'pages-podcasts-seite-4': {pfad: '/pages/podcasts/seite-4', schalter: 'APPLE_SEITE_PAGES_PODCASTS_SEITE_4', standard: 'off'},
  'pages-podcasts-seite-5': {pfad: '/pages/podcasts/seite-5', schalter: 'APPLE_SEITE_PAGES_PODCASTS_SEITE_5', standard: 'off'},
  'quellen': {pfad: '/pages/quellen', schalter: 'APPLE_SEITE_QUELLEN', standard: 'off'},
  'so-funktioniert-der-qione': {pfad: '/pages/so-funktioniert-der-qione', schalter: 'APPLE_SEITE_SO_FUNKTIONIERT_DER_QIONE', standard: 'off'},
  'so-wirkt-kohaerentes-wasser': {pfad: '/pages/so-wirkt-kohaerentes-wasser', schalter: 'APPLE_SEITE_SO_WIRKT_KOHAERENTES_WASSER', standard: 'on'},
  'superhuman': {pfad: '/pages/superhuman', schalter: 'APPLE_SEITE_SUPERHUMAN', standard: 'off'},
  'tiefer-schlaf': {pfad: '/pages/tiefer-schlaf', schalter: 'APPLE_SEITE_TIEFER_SCHLAF', standard: 'off'},
  'vitamine-mineralien': {pfad: '/pages/vitamine-mineralien', schalter: 'APPLE_SEITE_VITAMINE_MINERALIEN', standard: 'off'},
  'webinar-die-nacht-entscheidet': {pfad: '/pages/webinar-die-nacht-entscheidet', schalter: 'APPLE_SEITE_WEBINAR_DIE_NACHT_ENTSCHEIDET', standard: 'off'},
  'wir-machen-ihn-auf': {pfad: '/pages/wir-machen-ihn-auf', schalter: 'APPLE_SEITE_WIR_MACHEN_IHN_AUF', standard: 'off'},
  'zellstudien-ehrlich': {pfad: '/pages/zellstudien-ehrlich', schalter: 'APPLE_SEITE_ZELLSTUDIEN_EHRLICH', standard: 'off'},

  // ---- s08 · Service, Formulare, Kollektionen, Rechtsseiten ----
  'cart': {pfad: '/cart', schalter: 'APPLE_SEITE_CART', standard: 'off'},
  'collections': {pfad: '/collections', schalter: 'APPLE_SEITE_COLLECTIONS', standard: 'off'},
  'collections-all': {pfad: '/collections/all', schalter: 'APPLE_SEITE_COLLECTIONS_ALL', standard: 'off'},
  'collections-products': {pfad: '/collections/products', schalter: 'APPLE_SEITE_COLLECTIONS_PRODUCTS', standard: 'off'},
  'agb': {pfad: '/pages/agb', schalter: 'APPLE_SEITE_AGB', standard: 'off'},
  'cookie-erklaerung': {pfad: '/pages/cookie-erklaerung', schalter: 'APPLE_SEITE_COOKIE_ERKLAERUNG', standard: 'off'},
  'datenschutz': {pfad: '/pages/datenschutz', schalter: 'APPLE_SEITE_DATENSCHUTZ', standard: 'off'},
  'erinnerung-erfolgreich': {pfad: '/pages/erinnerung-erfolgreich', schalter: 'APPLE_SEITE_ERINNERUNG_ERFOLGREICH', standard: 'off'},
  'impressum': {pfad: '/pages/impressum', schalter: 'APPLE_SEITE_IMPRESSUM', standard: 'off'},
  'live': {pfad: '/pages/live', schalter: 'APPLE_SEITE_LIVE', standard: 'on'},
  'partner': {pfad: '/pages/partner', schalter: 'APPLE_SEITE_PARTNER', standard: 'off'},
  'partner-beispielseite': {pfad: '/pages/partner-beispielseite', schalter: 'APPLE_SEITE_PARTNER_BEISPIELSEITE', standard: 'off'},
  'partner-details': {pfad: '/pages/partner-details', schalter: 'APPLE_SEITE_PARTNER_DETAILS', standard: 'off'},
  'produktberatung': {pfad: '/pages/produktberatung', schalter: 'APPLE_SEITE_PRODUKTBERATUNG', standard: 'on'},
  'produktberatung-b': {pfad: '/pages/produktberatung-b', schalter: 'APPLE_SEITE_PRODUKTBERATUNG_B', standard: 'on'},
  'sprechstunde': {pfad: '/pages/sprechstunde', schalter: 'APPLE_SEITE_SPRECHSTUNDE', standard: 'off'},
  'superhuman-anmeldung-erfolgreich': {pfad: '/pages/superhuman-anmeldung-erfolgreich', schalter: 'APPLE_SEITE_SUPERHUMAN_ANMELDUNG_ERFOLGREICH', standard: 'off'},
  'superhuman-kurs-bestatigung': {pfad: '/pages/superhuman-kurs-bestatigung', schalter: 'APPLE_SEITE_SUPERHUMAN_KURS_BESTATIGUNG', standard: 'off'},
  'teilnahmebedingungen': {pfad: '/pages/teilnahmebedingungen', schalter: 'APPLE_SEITE_TEILNAHMEBEDINGUNGEN', standard: 'off'},
  'ueber-uns': {pfad: '/pages/ueber-uns', schalter: 'APPLE_SEITE_UEBER_UNS', standard: 'off'},
  'uebersicht': {pfad: '/pages/uebersicht', schalter: 'APPLE_SEITE_UEBERSICHT', standard: 'off'},
  'widerrufsbelehrung': {pfad: '/pages/widerrufsbelehrung', schalter: 'APPLE_SEITE_WIDERRUFSBELEHRUNG', standard: 'on'},
  'policies': {pfad: '/policies', schalter: 'APPLE_SEITE_POLICIES', standard: 'on'},
  'policies-privacy-policy': {pfad: '/policies/privacy-policy', schalter: 'APPLE_SEITE_POLICIES_PRIVACY_POLICY', standard: 'on'},
  'policy-refund-policy': {pfad: '/policies/refund-policy', schalter: 'APPLE_SEITE_POLICY_REFUND_POLICY', standard: 'on'},
  'policies-shipping-policy': {pfad: '/policies/shipping-policy', schalter: 'APPLE_SEITE_POLICIES_SHIPPING_POLICY', standard: 'on'},
  'policies-terms-of-service': {pfad: '/policies/terms-of-service', schalter: 'APPLE_SEITE_POLICIES_TERMS_OF_SERVICE', standard: 'on'},
  'products-sprechstunde-mit-christian': {pfad: '/products/sprechstunde-mit-christian', schalter: 'APPLE_SEITE_PRODUCTS_SPRECHSTUNDE_MIT_CHRISTIAN', standard: 'off'},
  'search': {pfad: '/search', schalter: 'APPLE_SEITE_SEARCH', standard: 'off'},
  'widerruf': {pfad: '/widerruf', schalter: 'APPLE_SEITE_WIDERRUF', standard: 'off'},
  'widerruf-bestaetigen': {pfad: '/widerruf/bestaetigen', schalter: 'APPLE_SEITE_WIDERRUF_BESTAETIGEN', standard: 'off'},
});
for (const eintrag of Object.values(APPLE_SEITEN)) Object.freeze(eintrag);

const WERT = new Set(['on', 'off']);

/** Eintrag einer Seite oder null (unbekannte Seite hat keinen Schalter). */
export function appleSeite(seite) {
  return Object.prototype.hasOwnProperty.call(APPLE_SEITEN, seite) ? APPLE_SEITEN[seite] : null;
}

const NACH_PFAD = new Map(Object.entries(APPLE_SEITEN).map(([seite, e]) => [e.pfad, seite]));

/**
 * Seitenname zu einem Pfad oder null. Für Routen, deren Seitenname einen
 * Digraph trägt: die Route nennt dann ihren Pfad, nicht den Namen.
 * @param {string} pfad
 */
export function appleSeiteFuerPfad(pfad) {
  return NACH_PFAD.get(pfad) ?? null;
}

/**
 * true, wenn die Seite ihre Apple-Fassung rendert. Umgebung 'on'/'off'
 * gewinnt, sonst `standard`. Unbekannte Seite: immer false (fail-closed auf C).
 * @param {Record<string, string>|undefined|null} env
 * @param {string} seite
 */
export function appleSeiteAn(env, seite) {
  const eintrag = appleSeite(seite);
  if (!eintrag) return false;
  const wert = env ? env[eintrag.schalter] : undefined;
  if (WERT.has(wert)) return wert === 'on';
  return eintrag.standard === 'on';
}

/**
 * Für den Loader einer Route: `{seite, an}`. Die Seite rendert mit `an` die
 * A-Fassung im Baukasten, sonst ihre heutige Fassung (C) unverändert.
 * @param {{env?: Record<string, string>}} context
 * @param {string} seite
 */
export function appleSeiteLaden(context, seite) {
  return {seite, an: appleSeiteAn(context?.env, seite)};
}
