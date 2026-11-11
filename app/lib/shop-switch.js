// GENERIERT AUS shop-mapping.yaml — NICHT VON HAND AENDERN.
// Quelle: homepage-bauer/shop-switch/shop-mapping.yaml (Version 2)
// Erzeuger: homepage-bauer/shop-switch/bin/shop-switch-gen
//
// Zuordnung der gleichwertigen Seite im jeweils anderen Shop. Gibt es keine,
// fällt der Umschalter auf die Startseite des Zielshops zurück — nie auf eine
// unpassende Seite.

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
  "/pages/entgiftung": "/pages/detoxification",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/impressum": "/pages/imprint",
  "/pages/kohaerentes-wasser": "/pages/coherent-water-structure",
  "/pages/mentales-setting": "/pages/mental-setting",
  "/pages/produktberatung": "/pages/consultation",
  "/pages/qibracelet-details": "/pages/page-qibracelet",
  "/pages/qihome-details": "/pages/pages-qihome-air",
  "/pages/studie-darmbarriere": "/pages/study-intestinal-cells",
  "/pages/studie-nutzererfahrung": "/pages/study-user-observations",
  "/pages/studien": "/pages/studies",
  "/pages/support": "/pages/support",
  "/pages/teilnahmebedingungen": "/pages/terms-of-participation",
  "/pages/vitamine-mineralien": "/pages/minerals-vitamins",
  "/pages/was-ist-kohaerentes-wasser": "/pages/coherent-water",
  "/pages/widerrufsbelehrung": "/pages/return-instructions",
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
  "/cart": "/cart",
  "/collections": "/collections",
  "/collections/all": "/collections/all",
  "/pages/agb": "/pages/terms-conditions",
  "/pages/best-wearables-for-longevity-2027": "/pages/best-wearables-for-longevity-2027",
  "/pages/bewertungen": "/pages/reviews",
  "/pages/cookie-erklaerung": "/pages/cookie-policy",
  "/pages/das-beispiel": "/pages/example",
  "/pages/datenschutz": "/pages/privacy-policy",
  "/pages/e-smog": "/pages/e-smog",
  "/pages/entgiftung": "/pages/detoxification",
  "/pages/erinnerung-erfolgreich": "/pages/subscription-successful",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/impressum": "/pages/imprint",
  "/pages/kohaerentes-wasser": "/pages/coherent-water-structure",
  "/pages/linkseite": "/pages/linktree",
  "/pages/mentales-setting": "/pages/mental-setting",
  "/pages/partner": "/pages/partner",
  "/pages/pre-access": "/pages/pre-access",
  "/pages/produktberatung": "/pages/consultation",
  "/pages/qibracelet": "/pages/page-qibracelet",
  "/pages/qibracelet-details": "/pages/page-qibracelet",
  "/pages/qihome-air": "/pages/pages-qihome-air",
  "/pages/qihome-details": "/pages/pages-qihome-air",
  "/pages/studie-darmbarriere": "/pages/study-intestinal-cells",
  "/pages/studie-nutzererfahrung": "/pages/study-user-observations",
  "/pages/studien": "/pages/studies",
  "/pages/superhuman-anmeldung-erfolgreich": "/pages/class-confirmation",
  "/pages/support": "/pages/support",
  "/pages/teilnahmebedingungen": "/pages/terms-of-participation",
  "/pages/vitamine-mineralien": "/pages/minerals-vitamins",
  "/pages/was-ist-kohaerentes-wasser": "/pages/coherent-water",
  "/pages/widerrufsbelehrung": "/pages/return-instructions",
  "/policies/privacy-policy": "/policies/privacy-policy",
  "/policies/refund-policy": "/policies/refund-policy",
  "/policies/shipping-policy": "/policies/shipping-policy",
  "/policies/terms-of-service": "/policies/terms-of-service",
  "/products/crystal-cacao-awake": "/products/crystal-cacao-awake",
  "/products/crystal-cacao-create": "/products/crystal-cacao-create",
  "/products/qibracelet": "/products/qibracelet",
  "/products/qihome-air": "/products/qihome",
  "/products/qione-2-pro": "/products/qione",
  "/products/qione-kette": "/products/necklace",
  "/search": "/search"
};

const MAP_US_DE = {
  "/cart": "/cart",
  "/collections": "/collections",
  "/collections/all": "/collections/all",
  "/pages/best-wearables-for-longevity-2027": "/pages/best-wearables-for-longevity-2027",
  "/pages/class-confirmation": "/pages/superhuman-anmeldung-erfolgreich",
  "/pages/coherent-water": "/pages/was-ist-kohaerentes-wasser",
  "/pages/coherent-water-structure": "/pages/kohaerentes-wasser",
  "/pages/consultation": "/pages/produktberatung",
  "/pages/cookie-policy": "/pages/cookie-erklaerung",
  "/pages/detoxification": "/pages/entgiftung",
  "/pages/e-smog": "/pages/e-smog",
  "/pages/example": "/pages/das-beispiel",
  "/pages/healy-alternative": "/pages/healy-alternative",
  "/pages/imprint": "/pages/impressum",
  "/pages/linktree": "/pages/linkseite",
  "/pages/mental-setting": "/pages/mentales-setting",
  "/pages/minerals-vitamins": "/pages/vitamine-mineralien",
  "/pages/page-qibracelet": "/pages/qibracelet-details",
  "/pages/pages-qihome-air": "/pages/qihome-details",
  "/pages/partner": "/pages/partner",
  "/pages/pre-access": "/pages/pre-access",
  "/pages/privacy-policy": "/pages/datenschutz",
  "/pages/return-instructions": "/pages/widerrufsbelehrung",
  "/pages/reviews": "/pages/bewertungen",
  "/pages/studies": "/pages/studien",
  "/pages/study-intestinal-cells": "/pages/studie-darmbarriere",
  "/pages/study-user-observations": "/pages/studie-nutzererfahrung",
  "/pages/subscription-successful": "/pages/erinnerung-erfolgreich",
  "/pages/support": "/pages/support",
  "/pages/terms-conditions": "/pages/agb",
  "/pages/terms-of-participation": "/pages/teilnahmebedingungen",
  "/policies/privacy-policy": "/policies/privacy-policy",
  "/policies/refund-policy": "/policies/refund-policy",
  "/policies/shipping-policy": "/policies/shipping-policy",
  "/policies/terms-of-service": "/policies/terms-of-service",
  "/products/crystal-cacao-awake": "/products/crystal-cacao-awake",
  "/products/crystal-cacao-create": "/products/crystal-cacao-create",
  "/products/necklace": "/products/qione-kette",
  "/products/qibracelet": "/products/qibracelet",
  "/products/qihome": "/products/qihome-air",
  "/products/qione": "/products/qione-2-pro",
  "/search": "/search"
};

/**
 * Gleichwertige Ziel-URL im anderen Shop.
 * @param {string} pathname aktueller Pfad, z.B. '/pages/impressum'
 * @param {'de'|'us'} ziel   Zielshop
 * @returns {string} absolute URL
 */
export function switchTarget(pathname, ziel) {
  const origin = SHOP_ORIGIN[ziel];
  if (!origin) return SHOP_ORIGIN.de;
  const pfad = String(pathname || '/').split('?')[0].split('#')[0];
  const norm = pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
  const karte = ziel === 'us' ? MAP_DE_US : MAP_US_DE;
  const treffer = karte[norm];
  return origin + (treffer || '/');
}
