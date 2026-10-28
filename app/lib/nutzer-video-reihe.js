/**
 * Setzt die YouTube-Videos eines Produkts an ihre `vorn`-Stelle in die fertig
 * sortierte Instagram-Reihe (IgTestimonialSlideshow).
 *
 * Die Instagram-Reihe kommt unverändert herein und behält ihre Ordnung; ein
 * YouTube-Eintrag ohne `vorn` steht am Ende. FAIL-CLOSED wie die
 * Instagram-Datenschicht: nur `inDerReihe === true` steht auf der Fläche.
 *
 * @param {Array<object>} igListe   sortierte Instagram-Kacheln
 * @param {Array<object>} ytEintraege  Einträge aus app/data/yt-nutzer-videos.js
 * @param {string} produkt
 * @returns {Array<{art: 'ig' | 'yt', t: object}>}
 */
export function nutzerVideoReihe(igListe, ytEintraege, produkt) {
  const reihe = igListe.map((t) => ({art: 'ig', t}));
  const stelleVon = (t) => (Number.isInteger(t.vorn) ? t.vorn : Infinity);
  const yt = ytEintraege
    .filter((t) => t.produkt === produkt && t.inDerReihe === true)
    .sort((a, b) => stelleVon(a) - stelleVon(b));
  for (const t of yt) {
    const stelle = Number.isInteger(t.vorn)
      ? Math.min(Math.max(t.vorn - 1, 0), reihe.length)
      : reihe.length;
    reihe.splice(stelle, 0, {art: 'yt', t});
  }
  return reihe;
}
