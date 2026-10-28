/**
 * meta() und headers() der B-Fassungen /products/<h>-b (Grossjob 20261027-
 * GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s05). Eigene Datei,
 * nicht lib/produkt-seite-laden.server.js: meta() läuft auch im Client, ein
 * .server-Modul darf es nicht importieren (React Router entfernt nur loader,
 * action, middleware und headers aus dem Client-Bündel).
 */

/**
 * meta() der B-Fassung: dieselben Tags wie A (Titel, Beschreibung, Product-
 * Auszeichnung, Kanonische auf den A-Pfad aus produktMeta), dazu noindex.
 * Ein vorhandenes robots-Tag wird ersetzt, nicht verdoppelt.
 */
export function bMeta(basis) {
  const ohneRobots = (basis ?? []).filter((t) => t?.name !== 'robots');
  return [...ohneRobots, {name: 'robots', content: 'noindex,nofollow'}];
}

/** headers() der B-Fassung (Hausmuster pages.qione-2-pro-b.jsx). */
export const B_HEADERS = Object.freeze({'X-Robots-Tag': 'noindex, nofollow'});
