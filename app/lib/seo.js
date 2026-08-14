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
