/**
 * BLOG-INHALT — was zwischen Shopify-Artikelkörper und Seite noch weg muss.
 *
 * WARUM DIESE SCHICHT UEBERHAUPT EXISTIERT (Befund 2026-09-04, live gemessen an
 * allen 6 Artikeln von /blogs/wissen): die Artikel sind aus Markdown nach HTML
 * gewandelt in Shopify eingespielt worden, und dabei sind zwei Dinge
 * durchgerutscht, die der Leser sieht:
 *   (1) DER TITEL STAND ZWEIMAL da — einmal als Seitenkopf aus `article.title`
 *       (die Route rendert ihn), unmittelbar darauf noch einmal als erstes
 *       Element des Artikelkörpers. 6 von 6 Artikeln betroffen.
 *   (2) DIE HORIZONTALE LINIE DES MARKDOWN blieb woertlich stehen: `<p>---</p>`
 *       mitten im Fliesstext, 31 Stück über die 6 Artikel (10 allein in
 *       kohärentes-wasser-was-die-forschung-misst).
 *
 * WARUM DIE REPARATUR HIER SITZT UND NICHT IM SHOPIFY-INHALT: der Rueckweg.
 * Eine Korrektur am Artikelkörper im Shopify-Admin ist eine Änderung an
 * fremdem Bestand ohne Versionierung; diese Schicht ist ein Commit und damit in
 * Minuten per `hb-deploy revert` zuruecknehmbar. Beide Eingriffe sind
 * ausdrücklich beauftragt ("am Inhalt der Texte wird nichts geändert, ausser
 * den Resten der Auszeichnungssprache und der doppelten Überschrift"), aber nur
 * einer davon ist unter einer Frist verantwortbar.
 *
 * WAS DIESE DATEI AUSDRÜCKLICH NICHT TUT: sie schreibt nichts um, sie kuerzt
 * nichts inhaltlich und sie fasst keine Überschrift an, die nicht wortgleich
 * dem Seitentitel entspricht. Sie ENTFERNT nur — jede Regel hier ist rein
 * subtraktiv. Bleibt ein Muster unerkannt, ist das Ergebnis der heutige
 * Zustand, nie ein kaputter Artikel.
 */

/** Entitaeten und Auszeichnung raus, damit zwei Überschriften vergleichbar sind. */
function textkern(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[\s ]+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Die FÜHRENDE Überschrift entfernen, wenn sie den Seitentitel wiederholt.
 *
 * Bewusst nur die erste Überschrift und bewusst nur bei Wortgleichheit: eine
 * spätere Zwischenüberschrift, die zufällig wie der Titel heißt, ist eine
 * redaktionelle Entscheidung und bleibt stehen.
 */
export function ohneDoppeltenTitel(html, titel) {
  const roh = String(html ?? '');
  if (!roh || !titel) return roh;
  const treffer = roh.match(/^\s*<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/i);
  if (!treffer) return roh;
  if (textkern(treffer[2]) !== textkern(titel)) return roh;
  return roh.slice(treffer[0].length).replace(/^\s+/, '');
}

/**
 * Wörtliche Markdown-Trenner entfernen: ein Absatz, der NUR aus drei oder mehr
 * Strichen, Sternen oder Unterstrichen besteht.
 *
 * Bewusst ersatzlos und nicht als <hr>: die Trenner standen im Markdown vor
 * jeder Zwischenüberschrift; die Überschriften trennen die Abschnitte bereits
 * sichtbar, eine zweite Trennlinie wäre Lärm. Ein Absatz mit Strichen UND
 * Text bleibt unangetastet — der könnte gemeint sein.
 */
export function ohneMarkdownTrenner(html) {
  return String(html ?? '').replace(
    /<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*(?:-{3,}|\*{3,}|_{3,})(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*/gi,
    '',
  );
}

/** Beide Regeln in der Reihenfolge, in der die Reste im Dokument stehen. */
export function artikelInhaltAufraeumen(html, titel) {
  return ohneMarkdownTrenner(ohneDoppeltenTitel(html, titel));
}
