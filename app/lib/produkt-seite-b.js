/**
 * meta() und headers() der B-Fassungen /products/<h>-b (Grossjob 20261027-
 * GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s05). Eigene Datei,
 * nicht lib/produkt-seite-laden.server.js: meta() läuft auch im Client, ein
 * .server-Modul darf es nicht importieren (React Router entfernt nur loader,
 * action, middleware und headers aus dem Client-Bündel).
 */

/**
 * meta() der B-Fassung: dieselben Tags wie A (Titel, Beschreibung, Product-
 * Auszeichnung, Kanonische auf den A-Pfad aus produktMeta) OHNE deren robots-
 * Tag. Das noindex-Tag schreibt jede B-Route selbst als festes Objekt in ihr
 * meta() (das Zufahrts-Gate erkennt nur ein statisches robots-Objekt im
 * Routen-Quelltext). So steht genau ein robots-Tag im Kopf.
 */
export function bMeta(basis) {
  return (basis ?? []).filter((t) => t?.name !== 'robots');
}

/** headers() der B-Fassung (Hausmuster pages.qione-2-pro-b.jsx). */
export const B_HEADERS = Object.freeze({'X-Robots-Tag': 'noindex, nofollow'});
