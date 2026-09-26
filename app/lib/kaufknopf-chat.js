/**
 * Die reine Entscheidung hinter KaufknopfChatSignal (components/), ohne DOM
 * und ohne React, damit test/kaufknopf-chat.test.mjs sie ohne Browser prüft.
 * Begründung, Messung und Rückweg stehen in der Komponente.
 */

/**
 * Die Kaufknöpfe, als EIGENSCHAFT und nicht als Ort: das Attribut sitzt am
 * <button> in AddToCartButton.jsx und damit an jedem Kaufknopf, der über
 * diese Komponente gerendert wird, egal auf welcher Seite.
 */
export const KAUFKNOPF_SELEKTOR = '[data-qb-kaufknopf]';

/** Das Attribut am <html>, auf das die Unterdrückungs-Regel in app.css hängt. */
export const UEBERDECKUNG_ATTRIBUT = 'data-chat-ueber-kaufknopf';

/** Die id, die der Loader seinem iframe gibt (wie SalesbotWidget.jsx). */
export const RAHMEN_ID = 'qiblanco-salesbot-widget-frame';

/** Die Klasse, die der Loader am <html> setzt, solange der Chat angedockt ist. */
export const DOCK_KLASSE = 'qb-chat-docked';

/** Der Deckel des Loaders für geschlossene Flächen (Anteil der Fensterhöhe). */
export const GESCHLOSSEN_MAX_ANTEIL = 0.6;

/**
 * Luft zwischen Widget und Knopf. Ein Widget, das den Knopf um 2 px
 * verfehlt, klebt optisch trotzdem daran, und der Kunde zielt nicht auf den
 * Pixel genau.
 */
export const ABSTAND_PX = 8;

/**
 * Reine Entscheidung, ohne DOM — damit sie ohne Browser prüfbar ist.
 *
 * @param {{
 *   rahmen: {left:number, top:number, right:number, bottom:number} | null,
 *   knoepfe: Array<{left:number, top:number, right:number, bottom:number}>,
 *   fensterHoehe: number,
 *   angedockt: boolean,
 *   beruehrt: boolean,
 * }} lage
 * @returns {boolean} true = Widget unterdrücken
 */
export function ueberdecktKaufknopf({
  rahmen,
  knoepfe,
  fensterHoehe,
  angedockt,
  beruehrt,
}) {
  if (!rahmen || angedockt || beruehrt) return false;
  const hoehe = rahmen.bottom - rahmen.top;
  const breite = rahmen.right - rahmen.left;
  if (!(hoehe > 0 && breite > 0)) return false;
  if (hoehe > fensterHoehe * GESCHLOSSEN_MAX_ANTEIL + 1) return false;
  return knoepfe.some(
    (k) =>
      k.right > k.left &&
      k.bottom > k.top &&
      k.left < rahmen.right + ABSTAND_PX &&
      k.right > rahmen.left - ABSTAND_PX &&
      k.top < rahmen.bottom + ABSTAND_PX &&
      k.bottom > rahmen.top - ABSTAND_PX,
  );
}
