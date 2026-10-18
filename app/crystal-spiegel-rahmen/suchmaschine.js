/**
 * WAS DIE SUCHMASCHINE ÜBER DEN CRYSTAL-SPIEGEL ERFÄHRT.
 *
 * Die gespiegelten Seiten tragen das canonical von crystal-cacao.com
 * (Christian, 16.10.2026, Übergabe #71: „1:1 Kopie des Crystal Kakao
 * Shops“; das Original bleibt die indexierte Fassung, der Doppelinhalt ist
 * damit aufgelöst). Eine Seite, die auf eine fremde Domain kanonisiert,
 * gehört deshalb
 *   - in KEINE hreflang-Gruppe: die Aufnahmebedingung in ~/lib/hreflang ist
 *     ein selbstreferenzierendes canonical; eine Gruppe mit einem Glied, das
 *     sich selbst abmeldet, verwirft Google ganz,
 *   - in KEINE Sitemap: dort stünde eine URL, die sich selbst als Duplikat
 *     erklärt — derselbe Widerspruch, den die Sitemap-Route für noindex- und
 *     Weiterleitungs-Seiten schon ausschließt.
 *
 * Die Menge ist ERZEUGT (../crystal-spiegel/seiten.js, aus SEITEN= in
 * crystal-cacao-node/spiegel-nachzug.conf): kommt CREATE in den Spiegel,
 * fällt es hier ohne weitere Änderung mit heraus.
 *
 * Relative Importe statt `~/`: node:test liest diese Datei direkt
 * (test/crystal-spiegel.test.mjs, test/seo-hreflang-produkt.test.mjs).
 */
import {GESPIEGELTE_PFADE} from '../crystal-spiegel/seiten.js';

/** Ist dieser qiblanco-Pfad eine gespiegelte Seite? */
export function istGespiegelt(pfad) {
  const p = String(pfad || '').replace(/\/+$/, '') || '/';
  return GESPIEGELTE_PFADE.includes(p);
}

/** Handles der gespiegelten Seiten je Sitemap-Typ ('products' | 'pages'). */
export function gespiegelteHandles(typ) {
  const praefix = `/${typ}/`;
  return GESPIEGELTE_PFADE.filter((p) => p.startsWith(praefix)).map((p) =>
    p.slice(praefix.length),
  );
}
