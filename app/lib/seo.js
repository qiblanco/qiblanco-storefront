/**
 * Zentraler SEO-Helper (DACH-Storefront) — Canonical-Bausteine.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, analog
 * structured-data.js). Liefert ABSOLUTE Canonical-URLs für die
 * Route-`meta`-Exporte.
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 F_canonical):
 * react-router-7 rendert einen meta-Descriptor OHNE `tagName` als
 * `<meta ...>` mit allen Keys als Attribute (Renderschleife der
 * <Meta>-Komponente in den dist-Chunks von node_modules/react-router:
 * tagName -> title -> charset -> script:ld+json -> Fallback
 * `createElement('meta', {...metaProps})`). Ein Descriptor
 * `{rel:'canonical', href:X}` ergibt deshalb `<meta rel="canonical" href="X">`
 * — im Quelltext fast nicht von der korrekten Form zu unterscheiden, für
 * Suchmaschinen aber wirkungslos. Korrekt ist:
 *
 *     {tagName: 'link', rel: 'canonical', href: absoluteCanonical(pfad)}
 *
 * `isValidMetaTag` des Routers akzeptiert genau /^(meta|link)$/.
 *
 * WARUM ABSOLUT: react-router-7 merged `meta` NICHT baumweit (der nächste
 * Leaf gewinnt vollstaendig) — es gibt also keinen zentralen Ort, an dem ein
 * relativer Canonical serverseitig gegen die Produktions-Domain aufgeloest
 * wird. Auf einem Oxygen-Preview-Host würde ein relativer Canonical auf den
 * Preview-Host zeigen und die Preview-URL selbst kanonisieren. Ein absoluter
 * Canonical ist auf Preview wie Produktion identisch korrekt.
 *
 * API-KOMPATIBILITAET: Namen und Semantik von CANONICAL_ORIGIN und
 * absoluteCanonical() sind bewusst identisch zum Entwurf in PR #103
 * (geo/seo-entity-hygiene-dach), damit dessen breiterer Helper diese Datei
 * spaeter als Obermenge ersetzen kann statt neben ihr zu stehen.
 */

// Kanonische Produktions-Domain (apex). Quelle: TRACKING_PRODUCTION_HOSTS in
// app/lib/checkout-tracking.js. Canonicals zeigen IMMER hierauf, auch wenn die
// Seite gerade unter einer Preview-/Oxygen-URL ausgeliefert wird.
export const CANONICAL_ORIGIN = 'https://qiblanco.com';

/**
 * Absolute Canonical-URL für einen Pfad. Query/Hash werden entfernt, ein
 * abschliessender Slash (ausser Root) getrimmt.
 * @param {string} pathname
 * @returns {string}
 */
export function absoluteCanonical(pathname) {
  if (!pathname || pathname === '/') return `${CANONICAL_ORIGIN}/`;
  let p = String(pathname).split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return `${CANONICAL_ORIGIN}${p}`;
}

/**
 * Fertiger meta-Descriptor für den Canonical einer Route.
 * Rendert ein echtes `<link rel="canonical" href="...">`.
 * @param {string} pathname
 * @returns {{tagName: 'link', rel: 'canonical', href: string}}
 */
export function canonicalLink(pathname) {
  return {tagName: 'link', rel: 'canonical', href: absoluteCanonical(pathname)};
}

/**
 * Shopify-Page-Handles, die NICHT in den Google-Index gehören.
 *
 * WARUM DIESE LISTE HIER STEHT UND NICHT IN DER ROUTE (Befund SEO-2026-W33,
 * Stufe S0): sie hat ZWEI Leser — die Route `pages.$handle.jsx` (setzt
 * `robots: noindex`) und die Sitemap-Route (wirft den Eintrag raus). Stünden
 * zwei Listen nebeneinander, driften sie auseinander, und der häufigere Fall
 * ist der gefährliche: Seite trägt `noindex`, steht aber weiter in der
 * Sitemap — dann meldet die Search Console dauerhaft einen Konflikt, und
 * niemand sieht ihn, weil beide Einzelstellen für sich richtig aussehen.
 *
 * BELEGTER ANLASS: `/pages/development-nicht-loschen` ist eine
 * Entwicklungsseite und stand am 2026-08-14 auf Platz 4 der Suche nach
 * "Qi Blanco Studien" — sie war NICHT intern verlinkt (0 Treffer im
 * gerenderten HTML der Startseite), sondern ausschließlich über
 * `sitemap/pages/1.xml` auffindbar (lastmod 2025-02-02). Der Discovery-Pfad
 * ist also die Sitemap, und deshalb genügt `noindex` allein nicht.
 *
 * AUFNAHME-KRITERIUM: nur Seiten, die für Kunden keinen Zweck haben
 * (Entwicklungs-/Test-/Rest-Seiten). Eine Seite, die Kunden nutzen sollen,
 * gehört NIE hierher — dann ist die richtige Antwort besserer Inhalt, nicht
 * Unsichtbarkeit.
 * @type {string[]}
 */
export const NICHT_INDEXIERBARE_SEITEN = ['development-nicht-loschen'];

/**
 * Gehört dieser Page-Handle aus dem Index?
 * @param {string|undefined} handle
 * @returns {boolean}
 */
export function istNichtIndexierbar(handle) {
  return !!handle && NICHT_INDEXIERBARE_SEITEN.includes(handle);
}

/**
 * meta-Descriptor, der eine Seite aus dem Index nimmt.
 * `noindex` schließt den Index aus, `nofollow` verhindert, dass die Seite
 * ihre Linkkraft weiterreicht — bei einer Entwicklungsseite ist beides
 * gewollt.
 * @returns {{name: 'robots', content: string}}
 */
export function noindexMeta() {
  return {name: 'robots', content: 'noindex,nofollow'};
}
