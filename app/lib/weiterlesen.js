/**
 * WEITERLESEN am Ende eines Fachartikels: welche drei Beiträge dort stehen.
 *
 * Bewusst PUR (kein React, kein Server-Zugriff), damit die Auswahl hermetisch
 * testbar ist — dasselbe Muster wie app/lib/autorenkasten.js.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIESE DATEI GIBT (Befund 2026-09-25, am ausgelieferten Rand gemessen)
 * ---------------------------------------------------------------------------
 * Grossjob 20260925-GROSSJOB-neue-seiten-kommen-bei-google-nicht-an-
 * indexierung-und-soll, Segment s04. Bis hierhin holte die Route
 * `articles(first: 4)` in der Standard-Sortierung des Shops und zeigte davon
 * die ersten drei, die nicht der aktuelle Beitrag waren. Das ergab auf JEDEM
 * Artikel dieselben drei ältesten Beiträge. Neun von dreizehn Artikeln
 * bekamen aus diesem Block nie einen Link, auch nicht von den drei Artikeln,
 * die Google im Index führt und alle paar Tage liest. Drei Artikel hatten
 * dadurch überhaupt keinen Weg von einer indexierten Seite
 * (urlInspection 2026-09-25: "URL ist Google nicht bekannt").
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL: DIE DREI NÄCHSTEN IN DER VERÖFFENTLICHUNGSREIHE, ZYKLISCH
 * ---------------------------------------------------------------------------
 * Die Liste kommt neueste zuerst (sortKey PUBLISHED_AT, reverse). Ein Beitrag
 * an Stelle i zeigt die Stellen i+1, i+2, i+3; am Ende geht es vorne weiter.
 * Damit zeigt jeder Beitrag andere Nachbarn, und jeder Beitrag wird von genau
 * drei anderen verlinkt. Ein neuer Artikel erscheint sofort im Block der
 * beiden jüngsten und des ältesten, ohne dass jemand eine Liste pflegt.
 *
 * WARUM NICHT NACH THEMA: es gibt keinen Themen-Träger, der mitwächst. Die
 * Stränge in app/data/werk.js sind ein Schnappschuss vom 2026-09-08 mit acht
 * von dreizehn Artikeln, und ihre Benennung liegt unentschieden bei Christian
 * (STRAENGE_LIVE=false). Eine Themenliste hier wäre eine zweite Stelle, die
 * dieselbe offene Frage führt. Die thematischen Querverweise stehen schon im
 * Artikeltext selbst (blog-redaktion verlinkung).
 *
 * FEHLT DER AKTUELLE BEITRAG IN DER LISTE (Liste gekappt, alte Antwort aus dem
 * Cache), gibt es die neuesten Beiträge ohne ihn. Das ist die frühere
 * Bauform und bricht nichts.
 *
 * RÜCKWEG: `hb-deploy revert` auf den Merge dieses Baus. Die Route fragt dann
 * wieder `articles(first: 4)` ohne Sortierung ab und zeigt die alten drei.
 */

export const WEITERLESEN_ANZAHL = 3;

/**
 * @param {Array<{handle?: string, title?: string}>} artikel neueste zuerst
 * @param {string} aktuell Handle des angezeigten Beitrags
 * @param {number} [anzahl]
 * @returns {Array<{handle: string, title?: string}>}
 */
export function weiterlesenNachbarn(artikel, aktuell, anzahl = WEITERLESEN_ANZAHL) {
  const liste = [];
  const gesehen = new Set();
  for (const a of artikel ?? []) {
    if (!a?.handle || gesehen.has(a.handle)) continue;
    gesehen.add(a.handle);
    liste.push(a);
  }
  const andere = liste.filter((a) => a.handle !== aktuell);
  if (!andere.length || anzahl <= 0) return [];

  const i = liste.findIndex((a) => a.handle === aktuell);
  if (i < 0) return andere.slice(0, anzahl);

  const aus = [];
  for (let k = 1; k < liste.length && aus.length < anzahl; k += 1) {
    aus.push(liste[(i + k) % liste.length]);
  }
  return aus;
}
