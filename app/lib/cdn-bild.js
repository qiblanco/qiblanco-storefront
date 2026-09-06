/*
 * cdn-bild — Breitenparameter + srcset fuer Shopify-CDN-Bilder.
 *
 * WOZU (Job 20260906-lp-erzeugt-den-naechsten-klick-…-prio20, Segment s02):
 * Die Landingpages liefern Produkt- und Studienbilder als UNSKALIERTE
 * ORIGINALE aus — ohne `width=`, ohne `srcset`. Gemessen am 2026-09-06 auf
 * /pages/schlaf-zellen-schutz: 14 Bilder = 16,88 MB, darunter QiBracelet1.webp
 * mit 6.266.409 B bei einer ANZEIGEGROESSE von 200 px. Shopify skaliert
 * serverseitig ueber den Query-Parameter `width=`; der Fix ist damit ein
 * URL-Parameter, kein Redesign.
 *
 * WARUM EIN HELFER UND NICHT 14 HANDGRIFFE (P10): dieselbe Rechnung steht
 * sonst an jedem <img> noch einmal — und jede Kopie kann eigenstaendig falsch
 * werden. Die fuenf Studien-Cover haengen an EINEM <img> im StudienSlider;
 * ein Aufruf dort deckt alle fuenf und alle 14 Konsumenten-Seiten des Blocks.
 *
 * DIE REGEL, DIE HIER NICHT VERLETZT WERDEN DARF — KEIN PAUSCHALER WERT:
 * ein fester Wert ueber alle Bilder macht kleine Bilder GROESSER. Gemessen in
 * s01 bei `width=600`: Logo 44->63 KB, Klarna-Badge 17->28 KB, Cell-Biology-
 * Seite-4 340->399 KB (Shopify re-encodiert und skaliert dabei HOCH). Die
 * `breiten` kommen deshalb IMMER aus der tatsaechlichen Anzeigegroesse des
 * jeweiligen Elements, gemessen am gerenderten DOM — nie geraten.
 *
 * WAS MAN NICHT WISSEN MUSS: die natuerliche Breite des Originals. Shopify
 * DECKELT `width=` daran und liefert oberhalb byte-identisch das Original
 * zurueck — gemessen 2026-09-06 an Cell-Biology-Cover-Remake-Seite-4.webp
 * (natuerlich 620 px): width=680 und width=800 geben beide exakt 348.188 B,
 * also das Original. Eine Leiter darf deshalb ueber die natuerliche Breite
 * hinausreichen, ohne Schaden anzurichten; sie waechst dort nur nicht weiter.
 *
 * FAIL-SAFE: alles, was keine Shopify-CDN-URL ist oder bereits einen eigenen
 * `width=`-Parameter traegt, geht UNVERAENDERT durch (kein srcset). Ein Bild
 * ohne Optimierung ist der Bestandszustand — ein falsch umgeschriebenes Bild
 * waere ein neuer Fehler.
 */

const CDN = 'cdn.shopify.com';

/** Traegt die URL schon einen eigenen Breitenparameter? (Query, nicht Tag!) */
function hatBreite(url) {
  const frage = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
  return /(^|&)width=/.test(frage);
}

/** Genau EIN Ort, an dem der Parameter angehaengt wird. */
function mitBreite(url, breite) {
  return `${url}${url.includes('?') ? '&' : '?'}width=${breite}`;
}

/**
 * Ist diese URL ueberhaupt ein Kandidat? Exportiert, damit Aufrufer eine
 * Fremd-URL erkennen koennen, ohne das Praefix selbst zu kennen.
 * @param {string} url
 * @returns {boolean}
 */
export function istCdnBild(url) {
  return typeof url === 'string' && url.includes(CDN) && !hatBreite(url);
}

/**
 * `src` + `srcSet` fuer ein Shopify-CDN-Bild.
 *
 * Das Ergebnis wird per Spread in das <img> gegeben; `sizes` bleibt beim
 * Aufrufer, weil nur DER die Layoutbreite kennt:
 *
 *   <img {...cdnBild(url, [200, 400])} sizes="200px" alt="…" loading="lazy" />
 *
 * `src` traegt die KLEINSTE Stufe: sie ist der Rueckfall fuer Browser ohne
 * srcset-Unterstuetzung, und dort ist ein zu kleines Bild der billigere
 * Fehler als ein 6-MB-Original.
 *
 * @param {string} url  Bild-URL (beliebig; Nicht-CDN geht unveraendert durch)
 * @param {number[]} breiten  aufsteigende Zielbreiten in px, aus der
 *   gemessenen Anzeigegroesse abgeleitet (1x … DPR-Reserve)
 * @returns {{src: string, srcSet?: string}}
 */
export function cdnBild(url, breiten) {
  if (!istCdnBild(url) || !Array.isArray(breiten) || breiten.length === 0) {
    return {src: url};
  }
  const sortiert = [...new Set(breiten)].sort((a, b) => a - b);
  return {
    src: mitBreite(url, sortiert[0]),
    srcSet: sortiert.map((b) => `${mitBreite(url, b)} ${b}w`).join(', '),
  };
}
