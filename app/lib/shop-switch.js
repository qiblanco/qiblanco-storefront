// GENERIERT AUS shop-mapping.yaml — NICHT VON HAND AENDERN.
// Quelle: homepage-bauer/shop-switch/shop-mapping.yaml (Version 2)
// Erzeuger: homepage-bauer/shop-switch/bin/shop-switch-gen
//
// Zuordnung der gleichwertigen Seite im jeweils anderen Shop. Reihenfolge:
// festes Paar -> BF-Zeitpaar (nur im Zeitfenster) -> Artikel-Gegenstück aus
// dem Metafeld -> nächstpassende Seite (Produktfamilie, Kollektion, Blog) ->
// Startseite. Abfrage-Parameter (UTM, el=...) wandern mit.

export const SHOP_ORIGIN = {
  de: 'https://qiblanco.com',
  us: 'https://qi-blanco.com',
};

export const SHOP_LABEL = {
  de: 'Deutsch',
  us: 'USA',
};

// hreflang-taugliche Teilmenge (Schluessel = DACH-Pfad, Wert = US-Pfad).
// Enger als MAP_DE_US: nur bijektive UND auf beiden Seiten indexierbare Paare.
// Begründung in shop-mapping.yaml, Abschnitt "ZWEITE, ENGERE RELATION".
export const HREFLANG_PAARE = {
  "/": "/",
  "/pages/agb": "/pages/terms-conditions",
  "/pages/best-wearables-for-longevity-2027": "/pages/best-wearables-for-longevity-2027",
  "/pages/bewertungen": "/pages/reviews",
  "/pages/das-beispiel": "/pages/example",
  "/pages/datenschutz": "/pages/privacy-policy",
  "/pages/e-smog": "/pages/e-smog",
  "/pages/elektrosmog-schutz-schmuck": "/pages/emf-protection-jewelry",
  "/pages/entgiftung": "/pages/detoxification",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/hypothesen": "/pages/hypotheses",
  "/pages/impressum": "/pages/imprint",
  "/pages/kohaerentes-wasser": "/pages/coherent-water-structure",
  "/pages/kritik": "/pages/criticism",
  "/pages/mentales-setting": "/pages/mental-setting",
  "/pages/produktberatung": "/pages/consultation",
  "/pages/qibracelet-details": "/pages/page-qibracelet",
  "/pages/qihome-details": "/pages/pages-qihome-air",
  "/pages/quellen": "/pages/sources",
  "/pages/studie-darmbarriere": "/pages/study-intestinal-cells",
  "/pages/studie-nutzererfahrung": "/pages/study-user-observations",
  "/pages/studien": "/pages/studies",
  "/pages/support": "/pages/support",
  "/pages/teilnahmebedingungen": "/pages/terms-of-participation",
  "/pages/vitamine-mineralien": "/pages/minerals-vitamins",
  "/pages/warum-qi-blanco": "/pages/why-qi-blanco",
  "/pages/was-ist-hexagonales-wasser": "/pages/hexagonal-water",
  "/pages/was-ist-kohaerentes-wasser": "/pages/coherent-water",
  "/pages/widerrufsbelehrung": "/pages/return-instructions",
  "/pages/wissen-und-vertrauen": "/pages/knowledge-and-trust",
  "/policies/privacy-policy": "/policies/privacy-policy",
  "/policies/refund-policy": "/policies/refund-policy",
  "/policies/shipping-policy": "/policies/shipping-policy",
  "/policies/terms-of-service": "/policies/terms-of-service",
  "/products/qibracelet": "/products/qibracelet",
  "/products/qihome-air": "/products/qihome",
  "/products/qione-2-pro": "/products/qione",
  "/products/qione-kette": "/products/necklace"
};

const MAP_DE_US = {
  "/blogs/coming-home": "/blogs/knowledge",
  "/blogs/wissen": "/blogs/knowledge",
  "/cart": "/cart",
  "/collections": "/collections",
  "/collections/all": "/collections/all",
  "/collections/zeremonie-kakao": "/pages/crystal-cacao",
  "/pages/affiliate-partnerprogramm": "/pages/partner",
  "/pages/agb": "/pages/terms-conditions",
  "/pages/armband-duschen-sauna": "/pages/page-qibracelet",
  "/pages/best-wearables-for-longevity-2027": "/pages/best-wearables-for-longevity-2027",
  "/pages/bewertungen": "/pages/reviews",
  "/pages/bf-deals": "/pages/bf-deals",
  "/pages/bf-deals-b": "/pages/bf-deals-b",
  "/pages/coming-home": "/pages/why-qi-blanco",
  "/pages/cookie-erklaerung": "/pages/cookie-policy",
  "/pages/crystal-cacao": "/pages/crystal-cacao",
  "/pages/das-beispiel": "/pages/example",
  "/pages/datenschutz": "/pages/privacy-policy",
  "/pages/e-smog": "/pages/e-smog",
  "/pages/elektrosmog-schutz-schmuck": "/pages/emf-protection-jewelry",
  "/pages/entgiftung": "/pages/detoxification",
  "/pages/erfahrungen": "/pages/reviews",
  "/pages/erinnerung-erfolgreich": "/pages/subscription-successful",
  "/pages/faq": "/pages/faq",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/hypothesen": "/pages/hypotheses",
  "/pages/impressum": "/pages/imprint",
  "/pages/intuition-erfahren": "/pages/mental-setting",
  "/pages/ist-qi-blanco-serioes": "/pages/is-qi-blanco-legit",
  "/pages/kakao-anwendung": "/pages/crystal-cacao",
  "/pages/kann-elektrosmog-den-schlaf-stoeren": "/pages/e-smog",
  "/pages/kohaerentes-wasser": "/pages/coherent-water-structure",
  "/pages/kritik": "/pages/criticism",
  "/pages/lexikon": "/pages/faq",
  "/pages/lexikon-elektrosmog": "/pages/e-smog",
  "/pages/lexikon-kohaerentes-wasser": "/pages/coherent-water",
  "/pages/linkseite": "/pages/linktree",
  "/pages/live": "/pages/why-qi-blanco",
  "/pages/meditieren-mit-zeremonie-kakao": "/pages/crystal-cacao",
  "/pages/mentales-setting": "/pages/mental-setting",
  "/pages/neu-oder-gebraucht": "/pages/faq",
  "/pages/newsletter-anmeldung-erfolgreich": "/pages/subscription-successful",
  "/pages/partner": "/pages/partner",
  "/pages/podcasts": "/blogs/knowledge/qi-blanco-podcast-emf-water-where-to-start",
  "/pages/pre-access": "/pages/pre-access",
  "/pages/produktberatung": "/pages/consultation",
  "/pages/qi-alpha": "/pages/Qi-Alpha",
  "/pages/qi-blanco-auf-trustpilot": "/pages/reviews",
  "/pages/qibracelet": "/pages/page-qibracelet",
  "/pages/qibracelet-details": "/pages/page-qibracelet",
  "/pages/qihome-air": "/pages/pages-qihome-air",
  "/pages/qihome-details": "/pages/pages-qihome-air",
  "/pages/qione-2-pro-details": "/pages/qione-learn-more",
  "/pages/quellen": "/pages/sources",
  "/pages/schlaf-zellen-schutz": "/pages/emf-protection",
  "/pages/sprechstunde": "/pages/consultation",
  "/pages/studie-darmbarriere": "/pages/study-intestinal-cells",
  "/pages/studie-immunzellen": "/pages/study-immune-cells",
  "/pages/studie-nutzererfahrung": "/pages/study-user-observations",
  "/pages/studie-oxidativer-stress": "/pages/study-oxidative-stress",
  "/pages/studie-qihome-air": "/pages/study-qihome-air",
  "/pages/studien": "/pages/studies",
  "/pages/superhuman": "/pages/biohacking",
  "/pages/superhuman-anmeldung-erfolgreich": "/pages/class-confirmation",
  "/pages/support": "/pages/support",
  "/pages/technologie": "/pages/qione-learn-more",
  "/pages/teilnahmebedingungen": "/pages/terms-of-participation",
  "/pages/ueber-uns": "/pages/why-qi-blanco",
  "/pages/vitamine-mineralien": "/pages/minerals-vitamins",
  "/pages/warum-qi-blanco": "/pages/why-qi-blanco",
  "/pages/was-auf-reddit-ueber-qi-blanco-steht": "/pages/is-qi-blanco-legit",
  "/pages/was-ist-elektrosmog": "/pages/e-smog",
  "/pages/was-ist-hexagonales-wasser": "/pages/hexagonal-water",
  "/pages/was-ist-kohaerentes-wasser": "/pages/coherent-water",
  "/pages/was-ist-zeremonie-kakao": "/pages/crystal-cacao",
  "/pages/widerrufsbelehrung": "/pages/return-instructions",
  "/pages/wie-funktioniert-der-gitterchip-im-qione": "/pages/qione-learn-more",
  "/pages/wie-funktioniert-schutz-vor-elektrosmog": "/pages/emf-protection-jewelry",
  "/pages/wie-weit-reicht-elektrosmog-schutz": "/pages/e-smog",
  "/pages/wissen-und-vertrauen": "/pages/knowledge-and-trust",
  "/pages/zeremonie-kakao-kurs": "/pages/crystal-cacao",
  "/policies/privacy-policy": "/policies/privacy-policy",
  "/policies/refund-policy": "/policies/refund-policy",
  "/policies/shipping-policy": "/policies/shipping-policy",
  "/policies/terms-of-service": "/policies/terms-of-service",
  "/products/broschure": "/pages/qione-learn-more",
  "/products/crystal-cacao-awake": "/products/crystal-cacao-awake",
  "/products/crystal-cacao-create": "/products/crystal-cacao-create",
  "/products/necklace-2": "/products/necklace-2",
  "/products/qi-alpha": "/products/qi-alpha",
  "/products/qibracelet": "/products/qibracelet",
  "/products/qihome-air": "/products/qihome",
  "/products/qione-2-pro": "/products/qione",
  "/products/qione-kette": "/products/necklace",
  "/search": "/search"
};

const MAP_US_DE = {
  "/blogs/knowledge": "/blogs/wissen",
  "/cart": "/cart",
  "/collections": "/collections",
  "/collections/all": "/collections/all",
  "/pages/best-wearables-for-longevity-2027": "/pages/best-wearables-for-longevity-2027",
  "/pages/bf-deals": "/pages/bf-deals",
  "/pages/bf-deals-b": "/pages/bf-deals-b",
  "/pages/biohacking": "/pages/superhuman",
  "/pages/ccpa-opt-out": "/pages/datenschutz",
  "/pages/class-confirmation": "/pages/superhuman-anmeldung-erfolgreich",
  "/pages/coherent-water": "/pages/was-ist-kohaerentes-wasser",
  "/pages/coherent-water-structure": "/pages/kohaerentes-wasser",
  "/pages/consultation": "/pages/produktberatung",
  "/pages/cookie-policy": "/pages/cookie-erklaerung",
  "/pages/criticism": "/pages/kritik",
  "/pages/crystal-cacao": "/pages/crystal-cacao",
  "/pages/detoxification": "/pages/entgiftung",
  "/pages/e-smog": "/pages/e-smog",
  "/pages/emf-protection": "/pages/schlaf-zellen-schutz",
  "/pages/emf-protection-jewelry": "/pages/elektrosmog-schutz-schmuck",
  "/pages/example": "/pages/das-beispiel",
  "/pages/faq": "/pages/faq",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/hexagonal-water": "/pages/was-ist-hexagonales-wasser",
  "/pages/hypotheses": "/pages/hypothesen",
  "/pages/imprint": "/pages/impressum",
  "/pages/is-qi-blanco-legit": "/pages/ist-qi-blanco-serioes",
  "/pages/knowledge-and-trust": "/pages/wissen-und-vertrauen",
  "/pages/linktree": "/pages/linkseite",
  "/pages/mental-setting": "/pages/mentales-setting",
  "/pages/minerals-vitamins": "/pages/vitamine-mineralien",
  "/pages/new-stuff": "/pages/warum-qi-blanco",
  "/pages/page-qibracelet": "/pages/qibracelet-details",
  "/pages/pages-qihome-air": "/pages/qihome-details",
  "/pages/partner": "/pages/partner",
  "/pages/pre-access": "/pages/pre-access",
  "/pages/privacy-policy": "/pages/datenschutz",
  "/pages/qi-alpha": "/pages/Qi-Alpha",
  "/pages/qione-learn-more": "/pages/qione-2-pro-details",
  "/pages/return-instructions": "/pages/widerrufsbelehrung",
  "/pages/reviews": "/pages/bewertungen",
  "/pages/sources": "/pages/quellen",
  "/pages/studies": "/pages/studien",
  "/pages/study-immune-cells": "/pages/studie-immunzellen",
  "/pages/study-intestinal-cells": "/pages/studie-darmbarriere",
  "/pages/study-oxidative-stress": "/pages/studie-oxidativer-stress",
  "/pages/study-qihome-air": "/pages/studie-qihome-air",
  "/pages/study-user-observations": "/pages/studie-nutzererfahrung",
  "/pages/subscription-successful": "/pages/erinnerung-erfolgreich",
  "/pages/support": "/pages/support",
  "/pages/terms-conditions": "/pages/agb",
  "/pages/terms-of-participation": "/pages/teilnahmebedingungen",
  "/pages/why-qi-blanco": "/pages/warum-qi-blanco",
  "/policies/privacy-policy": "/policies/privacy-policy",
  "/policies/refund-policy": "/policies/refund-policy",
  "/policies/shipping-policy": "/policies/shipping-policy",
  "/policies/terms-of-service": "/policies/terms-of-service",
  "/products/crystal-cacao-awake": "/products/crystal-cacao-awake",
  "/products/crystal-cacao-create": "/products/crystal-cacao-create",
  "/products/necklace": "/products/qione-kette",
  "/products/necklace-2": "/products/necklace-2",
  "/products/qi-alpha": "/products/qi-alpha",
  "/products/qibracelet": "/products/qibracelet",
  "/products/qihome": "/products/qihome-air",
  "/products/qione": "/products/qione-2-pro",
  "/search": "/search"
};

// Black-Friday-Deal-Seiten: gelten bis ZEIT_BIS_MS, danach nächstpassend.
export const ZEIT_BIS_MS = 1796079599000;
const ZEIT_DE_US = {
  "/products/37cr378n": "/pages/izw9jai5k5x",
  "/products/56huz67dds": "/pages/c4173cw1v79",
  "/products/687ghgf4ed": "/pages/w3ickm27k2i",
  "/products/734husd8hh": "/pages/b9rkk99ssbm",
  "/products/8kendiw34hd": "/pages/rk3xmgho0m0",
  "/products/aw783hfn": "/pages/izw9jai5k5x",
  "/products/awcr37shyj": "/pages/izw9jai5k5x",
  "/products/bundle-1x-awake-1x-create": "/pages/izw9jai5k5x",
  "/products/bundle-2x-awake": "/pages/izw9jai5k5x",
  "/products/j7hcyb802kn": "/pages/izw9jai5k5x",
  "/products/jhsdhze783": "/pages/rk3xmgho0m0",
  "/products/mengenrabatt-2x": "/pages/izw9jai5k5x",
  "/products/pjdz538hgs0": "/pages/b9rkk99ssbm"
};
const ZEIT_US_DE = {
  "/pages/b9rkk99ssbm": "/products/pjdz538hgs0",
  "/pages/c4173cw1v79": "/products/56huz67dds",
  "/pages/izw9jai5k5x": "/products/j7hcyb802kn",
  "/pages/rk3xmgho0m0": "/products/8kendiw34hd",
  "/pages/w3ickm27k2i": "/products/687ghgf4ed",
  "/products/83dauwg6": "/products/687ghgf4ed",
  "/products/e8d69cde": "/products/pjdz538hgs0",
  "/products/f6bcc67f": "/products/8kendiw34hd",
  "/products/q588sdhg": "/products/56huz67dds",
  "/products/u09mvn6eftj": "/products/j7hcyb802kn"
};

// Nächstpassend: erste Regel gewinnt. [Präfix, Teilwort oder '', Ziel]
const REGELN_DE_US = [
  [
    "/products/",
    "qione",
    "/products/qione"
  ],
  [
    "/products/",
    "kette",
    "/products/necklace"
  ],
  [
    "/products/",
    "necklace",
    "/products/necklace"
  ],
  [
    "/products/",
    "bracelet",
    "/products/qibracelet"
  ],
  [
    "/products/",
    "qihome",
    "/products/qihome"
  ],
  [
    "/products/",
    "alpha",
    "/products/qi-alpha"
  ],
  [
    "/products/",
    "cacao",
    "/pages/crystal-cacao"
  ],
  [
    "/products/",
    "kakao",
    "/pages/crystal-cacao"
  ],
  [
    "/products/",
    "awake",
    "/pages/crystal-cacao"
  ],
  [
    "/products/",
    "create",
    "/pages/crystal-cacao"
  ],
  [
    "/products/mengenrabatt-2x",
    "",
    "/pages/crystal-cacao"
  ],
  [
    "/products/mengenrabatt-3x-create",
    "",
    "/pages/crystal-cacao"
  ],
  [
    "/products/",
    "",
    "/collections/all"
  ],
  [
    "/collections/",
    "",
    "/collections/all"
  ],
  [
    "/blogs/",
    "",
    "/blogs/knowledge"
  ],
  [
    "/pages/podcasts",
    "",
    "/blogs/knowledge/qi-blanco-podcast-emf-water-where-to-start"
  ],
  [
    "/pages/lexikon",
    "",
    "/pages/faq"
  ],
  [
    "/pages/studie",
    "",
    "/pages/studies"
  ],
  [
    "/pages/bf-",
    "",
    "/pages/bf-deals"
  ],
  [
    "/account",
    "",
    "/account"
  ],
  [
    "/policies/",
    "",
    "/policies/privacy-policy"
  ]
];
const REGELN_US_DE = [
  [
    "/products/",
    "qione",
    "/products/qione-2-pro"
  ],
  [
    "/products/",
    "necklace",
    "/products/qione-kette"
  ],
  [
    "/products/",
    "bracelet",
    "/products/qibracelet"
  ],
  [
    "/products/",
    "qihome",
    "/products/qihome-air"
  ],
  [
    "/products/",
    "alpha",
    "/products/qi-alpha"
  ],
  [
    "/products/",
    "cacao",
    "/pages/crystal-cacao"
  ],
  [
    "/products/",
    "",
    "/collections/all"
  ],
  [
    "/collections/",
    "",
    "/collections/all"
  ],
  [
    "/blogs/",
    "",
    "/blogs/wissen"
  ],
  [
    "/pages/study",
    "",
    "/pages/studien"
  ],
  [
    "/pages/bf-",
    "",
    "/pages/bf-deals"
  ],
  [
    "/account",
    "",
    "/account"
  ],
  [
    "/policies/",
    "",
    "/policies/privacy-policy"
  ]
];

/**
 * Zielpfad im anderen Shop (ohne Origin).
 * @param {string} pathname
 * @param {'de'|'us'} ziel
 * @param {{jetzt?: number, artikel?: string|null}} [extra]
 */
export function switchPfad(pathname, ziel, extra = {}) {
  let pfad = String(pathname || '/').split('?')[0].split('#')[0];
  try {
    pfad = decodeURIComponent(pfad);
  } catch {
    // roher Pfad
  }
  const norm = (pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad).toLowerCase() || '/';
  if (norm === '/') return '/';
  const hin = ziel === 'us';
  const karte = hin ? MAP_DE_US : MAP_US_DE;
  if (karte[norm]) return karte[norm];
  const jetzt = extra.jetzt ?? Date.now();
  const zeit = hin ? ZEIT_DE_US : ZEIT_US_DE;
  if (jetzt <= ZEIT_BIS_MS && zeit[norm]) return zeit[norm];
  if (extra.artikel && String(extra.artikel).startsWith('/')) return String(extra.artikel);
  for (const [praefix, teil, z] of hin ? REGELN_DE_US : REGELN_US_DE) {
    if (norm.startsWith(praefix) && (!teil || norm.includes(teil))) return z;
  }
  return '/';
}

/**
 * Gleichwertige Ziel-URL im anderen Shop.
 * @param {string} pathname aktueller Pfad, z.B. '/pages/impressum'
 * @param {'de'|'us'} ziel   Zielshop
 * @param {{search?: string, jetzt?: number, artikel?: string|null}} [extra]
 *   search: Abfrage der aktuellen Seite ('?utm_source=...'), wandert mit.
 * @returns {string} absolute URL
 */
export function switchTarget(pathname, ziel, extra = {}) {
  const origin = SHOP_ORIGIN[ziel];
  if (!origin) return SHOP_ORIGIN.de;
  const search = typeof extra.search === 'string' && extra.search.startsWith('?') && extra.search.length > 1
    ? extra.search
    : '';
  return origin + switchPfad(pathname, ziel, extra) + search;
}
