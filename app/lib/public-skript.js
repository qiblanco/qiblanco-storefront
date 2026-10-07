/* global __QB_PUBLIC_SKRIPT_V__ */

/**
 * URL eines eigenen Skripts aus `public/`, mit Versionsangabe aus dem Inhalt.
 *
 * `public/` wird ein Jahr lang im Browser gecacht (max-age=31536000). Erst ein
 * neuer URL je Fassung bringt eine Änderung zu wiederkehrenden Besuchern. Die
 * Tabelle baut `scripts/public-skript-version.mjs` beim Build; `vite.config.js`
 * setzt sie als `__QB_PUBLIC_SKRIPT_V__` ein.
 *
 * Fehlt die Tabelle (Test unter node) oder die Datei darin, kommt der Pfad
 * unverändert zurück. Das ist dasselbe Verhalten wie vor diesem Bau.
 *
 * RÜCKWEG: die `define`-Zeile in `vite.config.js` entfernen, oder
 * `hb-deploy revert --sha <merge>`.
 */
const VERSIONEN =
  typeof __QB_PUBLIC_SKRIPT_V__ !== 'undefined' ? __QB_PUBLIC_SKRIPT_V__ : {};

export function publicSkript(pfad, versionen = VERSIONEN) {
  const v = versionen?.[pfad];
  return v ? `${pfad}?v=${v}` : pfad;
}
