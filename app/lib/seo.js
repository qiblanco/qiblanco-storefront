/**
 * Zentraler SEO-/Entity-Hygiene-Helper (DACH-Storefront) — GEO-Folgejob FJ3.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, analog
 * structured-data.js / faq-schema.js). Liefert markenkonsistente Titel,
 * ABSOLUTE Canonicals und Default-Meta-Bausteine fuer die Route-`meta`-Exporte.
 *
 * WARUM absolut: react-router-7 rendert `meta` NICHT baumweit gemerged (der
 * naechste Leaf gewinnt vollstaendig) — es gibt also keinen zentralen Ort, an
 * dem ein relativer Canonical serverseitig gegen die Produktions-Domain
 * aufgeloest wird. Ein absoluter Canonical ist auf Preview-/Oxygen-Hosts wie
 * auf Produktion identisch korrekt.
 *
 * Nicht-ASCII-Zeichen sind bewusst als \uXXXX-Escapes geschrieben
 * (transit-sicher gegen Doppel-Encoding, homepage-bauer FEHLER-DB F-010).
 */

// EIN kanonischer Anzeigename. Die Rechtsform gehoert NUR ins Impressum /
// schema.org Organization.legalName, nie in Seiten-Titel-Suffixe.
export const BRAND = 'Qi Blanco';
export const LEGAL_NAME = 'Qi Blanco UG (haftungsbeschränkt)';

// Kanonische Produktions-Domain (apex). Quelle: TRACKING_PRODUCTION_HOSTS in
// app/lib/checkout-tracking.js. Canonicals zeigen IMMER hierauf, auch wenn die
// Seite gerade unter einer Preview-/Oxygen-URL ausgeliefert wird.
export const CANONICAL_ORIGIN = 'https://qiblanco.com';

export const OG_LOCALE = 'de_DE';

// Nuechterne, faktische Default-Beschreibung — beschreibt WAS die Produkte sind
// (Produktlinie), KEINE Wirk-/Heil-/Schutzaussage (GEO/Nicht-Eso-Leitlinie).
export const DEFAULT_DESCRIPTION =
  'Qi Blanco aus Deutschland: Life Technology rund um kohärentes Wasser ' +
  'und den Gitterchip – QiOne, QiBracelet, QiHome und Zeremonie-Kakao.';

/**
 * Markenkonsistenter Seiten-Titel: "<Seite> | Qi Blanco".
 * Der Separator "|" folgt der etablierten Konvention der bereits gepflegten
 * indexierbaren Seiten (Impressum/AGB/Datenschutz/Studien/Support/Produkte).
 * @param {string} name
 * @returns {string}
 */
export function pageTitle(name) {
  const n = (name || '').trim();
  return n ? `${n} | ${BRAND}` : BRAND;
}

/**
 * Absolute Canonical-URL fuer einen Pfad. Query/Hash werden entfernt, ein
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

/** Kuerzt eine (evtl. lange) Beschreibung auf eine meta-taugliche Laenge. */
export function clampDescription(text, max = 200) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Baut ein vollstaendiges Basis-`meta`-Array (Titel + Description + absoluter
 * Canonical) fuer einen Route-`meta`-Export.
 * Canonical als {tagName:'link',...} (rendert ein echtes <link rel="canonical">).
 * @param {{title?: string, description?: string, path?: string}} opts
 * @returns {Array<object>}
 */
export function seoMeta({title, description, path} = {}) {
  const tags = [{title: pageTitle(title)}];
  if (description) tags.push({name: 'description', content: description});
  if (path) {
    tags.push({tagName: 'link', rel: 'canonical', href: absoluteCanonical(path)});
  }
  return tags;
}

/**
 * Seiten-spezifische Open-Graph-Tags (Titel/Description/URL/Typ) fuer eine
 * einzelne Route. Die KONSTANTEN Default-OG-/Twitter-Tags (og:site_name,
 * og:locale, og:image, twitter:card) rendert app/root.jsx site-weit im <head>.
 * @param {{title: string, description?: string, path?: string, type?: string}} opts
 * @returns {Array<object>}
 */
export function openGraphMeta({title, description, path, type = 'website'} = {}) {
  const tags = [];
  if (title) tags.push({property: 'og:title', content: title});
  if (description) tags.push({property: 'og:description', content: description});
  if (path) tags.push({property: 'og:url', content: absoluteCanonical(path)});
  tags.push({property: 'og:type', content: type});
  return tags;
}
