/**
 * schema.org / JSON-LD Grundausstattung fuer die DACH-Storefront.
 *
 * Herkunft: Folgejob FJ1 aus dem GEO/AEO-Deep-Dive
 * (20260723-ki-sichtbarkeit-geo-aeo-empfehlbarkeit-nicht-eso). Befund dort:
 * die Hydrogen-Storefront emittierte 0 (null) strukturierte Daten -> KI/Google
 * konnten die Entitaet "Qi Blanco" nicht sauber verstehen.
 *
 * LEITPLANKE (verbindlich): NUR faktische Auszeichnung. KEINE Heil-/Wirk-/
 * Gesundheitsaussage wird ins Schema geschrieben. Das `description`-Feld eines
 * Produkts wird BEWUSST NICHT uebernommen (der Shop-Beschreibungstext enthaelt
 * Wirkaussagen) — Produkte werden ueber neutrale Fakten (Name/Marke/Bild/Preis/
 * SKU/Verfuegbarkeit) ausgezeichnet. Firmendaten stammen aus dem Impressum
 * (pages.impressum.jsx = SSoT), Produktdaten aus der vorhandenen Storefront-API.
 *
 * Reine Datenfabrik: KEIN React-/Remix-Import, damit das Modul ohne Build-
 * Toolchain lesbar und in Node-Unit-Tests direkt aufrufbar ist. Alle Bauer
 * sind defensiv (optional chaining, fehlende Felder werden weggelassen statt
 * mit Platzhaltern gefuellt).
 */

// Kanonischer Produktions-Origin (checkout-tracking.js Host-Allowlist).
export const SITE_ORIGIN = 'https://qiblanco.com';

// Domain-verankerte @id-Anker fuer die site-weite Entitaet.
export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const ORG_NAME = 'Qi Blanco';
// Firmen-/Registerdaten wortgetreu aus dem Impressum (§5 DDG).
const ORG_LEGAL_NAME = 'Qi Blanco UG (haftungsbeschränkt)';
const ORG_EMAIL = 'info@qiblanco.com';
const ORG_VAT_ID = 'DE306530406';
const ORG_STREET = 'Brunnrangenstr. 25';
const ORG_POSTAL = '97711';
const ORG_LOCALITY = 'Maßbach';
const ORG_HRB = 'HRB 7306, Amtsgericht Schweinfurt';

/**
 * Organization — site-weiter Entitaets-Anker (Name, Anschrift, Register).
 * NAP wortgetreu aus dem Impressum. `sameAs` (verifizierte Social-/Register-
 * Profile) ist bewusst optional und wird nur gesetzt, wenn ein nicht-leeres
 * Array uebergeben wird — erfundene Profil-URLs sind untersagt.
 *
 * @param {{logo?: string, sameAs?: string[]}} [opts]
 * @returns {object} JSON-LD Organization
 */
export function organizationSchema(opts = {}) {
  const {logo, sameAs} = opts;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: `${SITE_ORIGIN}/`,
    email: ORG_EMAIL,
    vatID: ORG_VAT_ID,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG_STREET,
      postalCode: ORG_POSTAL,
      addressLocality: ORG_LOCALITY,
      addressCountry: 'DE',
    },
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'HRB',
      value: ORG_HRB,
    },
  };
  if (logo) org.logo = logo;
  if (Array.isArray(sameAs) && sameAs.length > 0) org.sameAs = sameAs;
  return org;
}

/**
 * WebSite — verweist per publisher auf die Organization.
 * Ein SearchAction wird BEWUSST NICHT ausgezeichnet (kein bestaetigter,
 * dokumentierter Such-Endpoint -> keine unbelegte Funktion behaupten).
 *
 * @returns {object} JSON-LD WebSite
 */
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: ORG_NAME,
    inLanguage: 'de-DE',
    publisher: {'@id': ORG_ID},
  };
}

/**
 * Sammelt Bild-URLs eines Produkts (Varianten-Bild zuerst, dann Galerie),
 * dedupliziert, Reihenfolge stabil.
 * @param {object} product
 * @param {object|null} variant
 * @returns {string[]}
 */
function collectImages(product, variant) {
  const urls = [];
  const variantImg = variant?.image?.url;
  if (variantImg) urls.push(variantImg);
  const nodes = product?.images?.nodes || [];
  for (const n of nodes) {
    if (n?.url && !urls.includes(n.url)) urls.push(n.url);
  }
  return urls;
}

/**
 * Baut das Offer aus der Varianten-Preisinfo. Ohne Preis kein Offer (null).
 * @param {object|null} variant
 * @param {string} url absolute PDP-URL
 * @returns {object|null}
 */
function buildOffer(variant, url) {
  const amount = variant?.price?.amount;
  if (!amount) return null;
  return {
    '@type': 'Offer',
    price: String(amount),
    priceCurrency: variant?.price?.currencyCode || 'EUR',
    availability: variant?.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: {'@id': ORG_ID},
  };
}

/**
 * Product + Offer aus VORHANDENEN Storefront-Produktdaten.
 *
 * BEWUSST WEGGELASSEN: `description` (kann Wirk-/Heilaussagen enthalten). Das
 * Produkt wird ueber neutrale Fakten ausgezeichnet; fehlende Felder entfallen.
 *
 * @param {object} product Hydrogen-Produkt (title, vendor, images,
 *   selectedOrFirstAvailableVariant{price, currencyCode, sku, availableForSale, image})
 * @param {string} url absolute, kanonische PDP-URL
 * @returns {object|null} JSON-LD Product oder null (fehlende Pflichtdaten)
 */
export function productSchema(product, url) {
  if (!product || !product.title || !url) return null;
  const variant = product.selectedOrFirstAvailableVariant || null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.title,
    brand: {
      '@type': 'Brand',
      name: product.vendor || ORG_NAME,
    },
    url,
  };

  const images = collectImages(product, variant);
  if (images.length > 0) schema.image = images;

  const sku = variant?.sku;
  if (sku) schema.sku = sku;

  const offer = buildOffer(variant, url);
  if (offer) schema.offers = offer;

  return schema;
}

/**
 * BreadcrumbList: Startseite -> Produkt (zwei Stufen, faktisch).
 * @param {string} name Produkt-Titel (letzte Stufe)
 * @param {string} url absolute PDP-URL
 * @returns {object|null}
 */
export function breadcrumbSchema(name, url) {
  if (!name || !url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: url,
      },
    ],
  };
}

/**
 * Bequemer Sammel-Helfer fuer PDP-Routen: liefert die zwei ld+json-Meta-
 * Descriptoren (Product + Breadcrumb) als Array, die per Spread an das
 * `meta()`-Ergebnis angehaengt werden. Leeres Array, wenn kein Produkt.
 *
 * @param {object|null|undefined} product
 * @param {string} url absolute PDP-URL
 * @returns {Array<{'script:ld+json': object}>}
 */
export function productMetaLdJson(product, url) {
  const out = [];
  const prod = productSchema(product, url);
  if (prod) out.push({'script:ld+json': prod});
  const crumb = breadcrumbSchema(product?.title, url);
  if (crumb) out.push({'script:ld+json': crumb});
  return out;
}

/**
 * (Optional, A4) ScholarlyArticle-Auszeichnung der auf /pages/studien REAL
 * verlinkten Publikationen. NUR bibliografische Fakten (angezeigte Bezeichnung,
 * Journal, Erscheinungsjahr/-datum, PDF-URL). Bewusst KEINE Aufwertung der
 * Evidenzstaerke, KEINE Wirk-/Heilaussage, kein `about`/`healthCondition`.
 * Titel = die auf der Seite oeffentlich angezeigten Bezeichnungen (die realen
 * Artikeltitel liegen nicht im Code vor).
 *
 * @returns {object} JSON-LD CollectionPage mit hasPart = ScholarlyArticle[]
 */
export function studienSchema() {
  const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';
  const articles = [
    {
      name: 'Wissenschaftliche Publikation an Immunzellen',
      periodical: 'Japan Journal of Medicine',
      datePublished: '2021-04-30',
      url: `${CDN}/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1679586513`,
    },
    {
      name: 'Wissenschaftliche Publikation an Darmzellen',
      periodical: 'Applied Cell Biology Journal',
      datePublished: '2021',
      url: `${CDN}/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1679586513`,
    },
    {
      name: 'Wissenschaftliche Publikation zum oxidativen Stress',
      periodical: 'Applied Cell Biology Journal',
      datePublished: '2024-01-12',
      url: `${CDN}/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505`,
    },
    {
      name: 'Wissenschaftliche Publikation zur Nutzererfahrung',
      periodical: 'Advances in Bioengineering & Biomedical Science Research',
      datePublished: '2024-05-10',
      url: `${CDN}/ABBSR-24_-31_3.pdf?v=1717500318`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_ORIGIN}/pages/studien#page`,
    url: `${SITE_ORIGIN}/pages/studien`,
    name: 'Wissenschaftliche Studien',
    inLanguage: 'de-DE',
    isPartOf: {'@id': WEBSITE_ID},
    hasPart: articles.map((a) => ({
      '@type': 'ScholarlyArticle',
      name: a.name,
      isPartOf: {'@type': 'Periodical', name: a.periodical},
      datePublished: a.datePublished,
      url: a.url,
    })),
  };
}
