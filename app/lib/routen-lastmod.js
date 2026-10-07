/* global __QB_ROUTEN_LASTMOD__ */

/**
 * `<lastmod>` für Seiten, deren INHALT im Repo steht: die KLASSE statt der
 * Einzelfälle.
 *
 * DER ANLASS (2026-10-07, Job 20261007-sitemap-lastmod-code-route-klasse):
 * `getSitemap` schreibt das `updatedAt` des Shopify-Seitenobjekts, und das
 * bewegt sich durch eine Code-Änderung nie. 28 von 44 Sitemap-Seiten mit
 * eigener Code-Route meldeten Google darum ein falsches Alter (support 1395
 * Tage, datenschutz 1051). `~/lib/zusammenlegungen-lastmod` und
 * `NUR_ROUTE_SEITEN.lastmod` schlossen je einzelne Seiten von Hand.
 *
 * DIE TABELLE ENTSTEHT BEIM BUILD, NICHT HIER: `scripts/routen-lastmod.mjs`
 * liest je `app/routes/pages.<handle>.jsx` den letzten inhaltlichen Commit
 * (Commit-Zeit, Kommentar-Commits zählen nicht) und `vite.config.js` setzt
 * das Ergebnis als `__QB_ROUTEN_LASTMOD__` ein. Zur Laufzeit gibt es auf
 * Oxygen kein git — die Tabelle ist darum eine Konstante im Bundle.
 *
 * NUR ANHEBEN, NIE SENKEN: ist das `updatedAt` jünger (Admin-Änderung), bleibt
 * es stehen. Ein Datum, das schon stimmt, wird nicht angefasst.
 *
 * FEHLT DIE TABELLE (Test unter node, Build ohne Historie), ist sie leer und
 * die Sitemap bleibt unverändert. Das ist gewollt: ein geratenes Datum wäre
 * schlechter als keines. Gemerkt wird es an der Probe
 * (homepage-bauer/pruefungen/probe_sitemap_lastmod_wahrhaftig.py), die dann
 * wieder Befunde meldet.
 *
 * RÜCKWEG: die `define`-Zeile in `vite.config.js` entfernen (Tabelle leer,
 * Verhalten wie vor diesem Bau), oder `hb-deploy revert --sha <merge>`.
 */

/** @returns {Readonly<Record<string, string>>} Handle -> UTC-ISO */
export function routenLastmodTabelle() {
  // Unter node (Tests) ist der Name ein globalThis-Feld, im Bundle ein
  // Literal, das Vite an dieser Stelle einsetzt.
  const roh =
    typeof __QB_ROUTEN_LASTMOD__ !== 'undefined' ? __QB_ROUTEN_LASTMOD__ : null;
  return roh && typeof roh === 'object' ? roh : {};
}

/**
 * Hebt in einer `pages`-Sitemap jedes `<lastmod>` auf das Datum der Route an.
 *
 * Der Handle wird aus `/pages/<handle></loc>` gelesen, auf `</loc>`
 * verankert wie der Versteckt-Filter der Kind-Route. Fehlt einem Eintrag das
 * `<lastmod>`, wird es hinter `</loc>` eingesetzt.
 *
 * @param {string} body Sitemap-XML
 * @param {Readonly<Record<string, string>>} [tabelle]
 * @returns {string}
 */
export function mitRoutenLastmod(body, tabelle = routenLastmodTabelle()) {
  if (!Object.keys(tabelle).length) return body;
  return body.replace(/<url>[\s\S]*?<\/url>/g, (eintrag) => {
    const loc = eintrag.match(/<loc>[^<]*?\/pages\/([^/<]+)<\/loc>/);
    const datum = loc && tabelle[loc[1]];
    if (!datum || Number.isNaN(Date.parse(datum))) return eintrag;
    const alt = eintrag.match(/<lastmod>([^<]*)<\/lastmod>/);
    if (alt) {
      const altZahl = Date.parse(alt[1]);
      if (!Number.isNaN(altZahl) && altZahl >= Date.parse(datum)) {
        return eintrag;
      }
      return eintrag.replace(alt[0], `<lastmod>${datum}</lastmod>`);
    }
    return eintrag.replace('</loc>', `</loc>\n  <lastmod>${datum}</lastmod>`);
  });
}

/**
 * Die Routen-Daten genau der Handles, die die `pages`-Sitemap auch führt —
 * für das Maximum im Sitemap-INDEX. Ein Datum aus einer Route, die gar nicht
 * in der Sitemap steht, wäre eine Aussage über eine URL, die es dort nicht
 * gibt.
 *
 * @param {Iterable<string>} handles
 * @param {Readonly<Record<string, string>>} [tabelle]
 * @returns {string[]}
 */
export function routenDatenFuer(handles, tabelle = routenLastmodTabelle()) {
  const werte = [];
  for (const handle of handles) {
    if (tabelle[handle]) werte.push(tabelle[handle]);
  }
  return werte;
}
