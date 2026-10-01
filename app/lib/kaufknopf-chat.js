/**
 * Die reine Entscheidung hinter KaufknopfChatSignal (components/), ohne DOM
 * und ohne React, damit test/kaufknopf-chat.test.mjs sie ohne Browser prüft.
 * Begründung, Messung und Rückweg stehen in der Komponente.
 */

import {
  lpKaufZiele,
  oeffentlicheDetailZiele,
} from '../components/reusables/blockLinks.js';

/**
 * Die Kaufknöpfe, als EIGENSCHAFT und nicht als Ort: das Attribut sitzt am
 * <button> in AddToCartButton.jsx und damit an jedem Kaufknopf, der über
 * diese Komponente gerendert wird, egal auf welcher Seite. Dazu der einzige
 * Ausgang der Landingpage /pages/qi-master-vorverkauf („Zum Qi Master®"),
 * die keinen Warenkorb trägt und am nächsten Klick gemessen wird.
 */
export const KAUFKNOPF_SELEKTOR = '[data-qb-kaufknopf]';

/**
 * Die Landingpage-Knöpfe, ebenfalls als EIGENSCHAFT: jeder Link im
 * Seiteninhalt, dessen Ziel ein Kaufziel des LP-Blocks ist (blockLinks.js,
 * lpKaufZiele: /pages/qione-2-pro, /pages/qibracelet, /pages/qihome-air).
 * Er trägt den nächsten Klick der Landingpage, ob er aus einer Campaign-LP,
 * einer Mm-Seite oder einer Produktkarte kommt.
 *
 * Anlass: Job 20261001-lp-kaufknoepfe-chatblase-verdeckt. Live auf
 * /pages/E-Smog-Schutz (390x844, Zustimmung gesetzt) trafen 5 von 8
 * Hit-Tests auf Knöpfe nach /pages/qione-2-pro das iframe des Chats, darunter
 * der Hero-Knopf. Keiner dieser Knöpfe trug [data-qb-kaufknopf].
 *
 * Der Selektor ist nur der Vorfilter (er trifft auch /pages/qione-2-pro-details
 * und -2x); entschieden wird am Pfad in istLpKaufausgang.
 */
export const LP_KAUFZIELE = lpKaufZiele();
export const LP_KAUFAUSGANG_VORFILTER = LP_KAUFZIELE.map(
  (pfad) => `main a[href*="${pfad}"]`,
).join(', ');

/**
 * @param {string} pfad pathname des Links (a.pathname)
 * @returns {boolean} true = der Link führt auf ein LP-Kaufziel
 */
export function istLpKaufausgang(pfad) {
  if (typeof pfad !== 'string' || !pfad) return false;
  const ohneSchraegstrich = pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
  return LP_KAUFZIELE.includes(ohneSchraegstrich);
}

/**
 * Die Knöpfe des ÖFFENTLICHEN Blocks zur Produkt- bzw. Kaufseite, ebenfalls
 * als EIGENSCHAFT und zwar als zwei: das ZIEL (jede /products/<handle> und
 * die Detailseiten aus blockLinks.js, oeffentlicheDetailZiele) und die
 * KNOPF-OPTIK (hatKnopfOptik unten). Ein Klassenname taugt dafür nicht: die
 * 58 Knöpfe, die der Zensus fand, tragen neun Klassenfamilien (btn--primary,
 * btn--secondary, btn--text, lp-vp-btn, erf__weiter …), und die nächste
 * Seite bringt eine zehnte mit.
 *
 * Anlass: Job 20261001-oeffentlicher-block-chatblase-verdeckt-produktknoepfe.
 * Zensus am 2026-10-01 über 102 öffentliche URLs (390x844, Zustimmung
 * gesetzt): 27 Seiten tragen 58 solche Knöpfe. Unter der Einladungsblase
 * (298x225, die ersten Sekunden nach dem Laden) traf der Hit-Test in der
 * Knopfmitte das iframe des Chats, Belegfall „Den QiOne® 2 Pro ansehen“ auf
 * /pages/erfahrungen. Unter der Pille (86x86, Dauerzustand) lag bei 45 der
 * 58 Knöpfe an mindestens einer Scrollposition der rechte Knopfrand.
 *
 * DER SCHNITT, und warum nicht mehr: Produktkarten und Textlinks bleiben
 * draußen. Mit ihnen wäre der Chat an 1,05 % der Scrollpositionen
 * ausgeblendet, mit allen Knöpfen gleich welchen Ziels an 1,43 %; mit diesem
 * Schnitt sind es 0,71 % (vorher 0,20 %). Der Chat ist Annas Einstieg und
 * soll nur dort weichen, wo er einen Knopf zum Kauf verdeckt.
 *
 * Der Selektor ist nur der Vorfilter; entschieden wird am Pfad
 * (istOeffentlichesProduktziel) und an der Optik.
 */
export const OEFFENTLICHE_DETAILZIELE = oeffentlicheDetailZiele();
export const OEFFENTLICH_KNOPF_VORFILTER = [
  'main a[href*="/products/"]',
  ...OEFFENTLICHE_DETAILZIELE.map((pfad) => `main a[href*="${pfad}"]`),
].join(', ');

/**
 * @param {string} pfad pathname des Links (a.pathname)
 * @returns {boolean} true = der Link führt auf eine Produkt- bzw. Kaufseite
 *   des öffentlichen Blocks
 */
export function istOeffentlichesProduktziel(pfad) {
  if (typeof pfad !== 'string' || !pfad) return false;
  const ohneSchraegstrich = pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
  return (
    /^\/products\/[^/]+$/.test(ohneSchraegstrich) ||
    OEFFENTLICHE_DETAILZIELE.includes(ohneSchraegstrich)
  );
}

/** Höher ist kein Knopf mehr, sondern eine Karte mit Fläche. */
export const KNOPF_MAX_HOEHE_PX = 120;

/**
 * Deckt eine berechnete Farbe (getComputedStyle) sichtbar? `transparent` und
 * ein Alpha bis 0,05 decken nicht. Gelesen werden beide Schreibweisen:
 * `rgba(0, 0, 0, 0)` und `rgb(0 0 0 / 0)`.
 *
 * @param {string} farbe
 * @returns {boolean}
 */
export function farbeDeckt(farbe) {
  if (typeof farbe !== 'string' || !farbe || farbe === 'transparent') {
    return false;
  }
  const innen = /\(([^)]*)\)/.exec(farbe)?.[1];
  if (innen == null) return true;
  let alpha = '1';
  if (innen.includes('/')) alpha = innen.split('/').pop();
  else if (innen.split(',').length > 3) alpha = innen.split(',')[3];
  const zahl = parseFloat(alpha);
  if (Number.isNaN(zahl)) return true;
  return (alpha.trim().endsWith('%') ? zahl / 100 : zahl) > 0.05;
}

/**
 * Sieht der Link wie ein Knopf aus? Reine Entscheidung über berechnete
 * Werte, damit sie ohne Browser prüfbar ist: ein Knopf hat eine eigene
 * Fläche oder einen Rahmen an allen vier Seiten, steht nicht im Textfluss,
 * trägt kein Bild und ist höchstens KNOPF_MAX_HOEHE_PX hoch. Ein Textlink
 * („Mehr erfahren“ in der Produktkarte) hat weder Fläche noch Rahmen, eine
 * Produktkarte trägt ein Bild oder ist höher.
 *
 * @param {{
 *   display: string,
 *   flaeche: boolean,
 *   raender: number[],
 *   hoehe: number,
 *   hatBild: boolean,
 * }} optik
 * @returns {boolean}
 */
export function hatKnopfOptik({display, flaeche, raender, hoehe, hatBild}) {
  if (display === 'inline' || hatBild) return false;
  if (!(hoehe > 0) || hoehe > KNOPF_MAX_HOEHE_PX) return false;
  if (flaeche) return true;
  return (
    Array.isArray(raender) && raender.length === 4 && raender.every((b) => b > 0)
  );
}

/** Das Attribut am <html>, auf das die Unterdrückungs-Regel in app.css hängt. */
export const UEBERDECKUNG_ATTRIBUT = 'data-chat-deckt-kaufknopf';

/**
 * Das Attribut am <html>, das die Signal-Komponente nach ihrer ersten
 * Messung setzt. Bis dahin hält app.css das Widget unsichtbar: der Loader
 * läuft vor der Hydration, das Signal erst danach.
 */
export const BEREIT_ATTRIBUT = 'data-chat-signal-bereit';

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
