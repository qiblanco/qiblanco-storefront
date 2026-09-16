/*
 * qi-master-kopfsymbole — setzt je ein eigenes Symbol vor die vier Zeilen des
 * Qi-Master-Kopfblocks. Schwesterdatei zu `fremd-html-bilder.js` und mit derselben
 * Begruendung gebaut.
 *
 * ANLASS (Christian am 2026-09-16): „Fuer diese 4 noch eigene kleine Grafiken
 * entwickeln ... Farbe und Stil wie unten bei ‚Ein Stueck, kein Serienteil'."
 * Nachtrag desselben Tages: „direkt einbauen, braucht keine Freigabe".
 *
 * WARUM DER EINBAU HIER STEHT UND NICHT IN DEN SHOPIFY-DATEN -- das ist der Kern
 * dieser Datei, und die Begruendung ist die des Hauses, nicht eine neue:
 * Die vier Zeilen stehen im Shopify-Feld `descriptionHtml` (<div class="qi-de">),
 * nicht im Repo. Man KOENNTE die <svg> dort hineinschreiben. Zwei Gruende dagegen,
 * beide bereits in fremd-html-bilder.js belegt:
 *   1. Das Feld wird im Rich-Text-Editor von Menschen bearbeitet. Eine einmalige
 *      Korrektur der Daten haelt nur bis zur naechsten Bearbeitung und hat keinen
 *      Waechter -- der RTE wirft Inline-SVG beim naechsten Speichern heraus.
 *      Hausregel: wird eine Dateiklasse nicht ausgeliefert, ist der Fix-Ort die
 *      VORLAGE.
 *   2. Der TEXT der vier Zeilen gehoert einem anderen Auftrag
 *      (20260916-qi-master-kopf-tauschen-und-die-schreibweise-durchziehen), der ihn
 *      am 2026-09-16 per productUpdate gesetzt hat. Wer die Symbole in dasselbe Feld
 *      schreibt, teilt sich mit ihm eine Schreibstelle. Hier ist die Naht entlang der
 *      ARTEFAKTE geschnitten: ihm der Text in Shopify, uns das Symbol im Render-Pfad.
 *      Keiner der beiden kann den anderen ueberschreiben.
 *
 * DIE ZUORDNUNG IST EIN EINSCHLUSS-SELEKTOR und schuldet deshalb einen Restbericht.
 * `kopfsymboleEinsetzen()` gibt `offen` zurueck: jede Zeile des Blocks, die KEIN
 * Symbol bekommen hat. Der Leser dieser Zusage ist
 * test/qi-master-kopfsymbole.test.mjs (Arm „alle vier Zeilen getroffen") und am
 * Kundenrand homepage-bauer/pruefungen/probe_qimaster_kopfsymbole.py. Eine Zusage
 * ohne Leser ist keine -- darum stehen beide hier namentlich.
 *
 * ERKANNT WIRD AM STABILEN WORT, NICHT AM GANZEN SATZ. Die Zeilen sind Christians
 * Wortlaut und koennen sich in Anfuehrungszeichen, ™ und Bindestrichen aendern (genau
 * das hat der Schwester-Auftrag an diesem Tag getan). Ein Literal-Vergleich waere beim
 * naechsten Feinschliff still wirkungslos; „one eye", „zweiteilig", „diamant",
 * „alpha charge" ueberleben ihn.
 *
 * FAIL-SOFT: passt nichts, bleibt das HTML unveraendert. Der Kopfblock ohne Symbole
 * ist der Zustand von gestern und kein Schaden; ein Fehler beim Einsetzen waere einer.
 */
import {QIMASTER_SYMBOL_PFADE} from './qi-master-symbole.generated.js';

/**
 * Zeile -> Symbol. Die Reihenfolge entscheidet: die erste passende Regel gewinnt,
 * und jedes Symbol wird hoechstens einmal gesetzt.
 *
 * `/diamant/` steht NACH `/zweiteilig/`, weil die Diamant-Zeile „... eingelassen in
 * den Gitterchip™" ebenfalls das Wort Gitterchip traegt. Umgekehrt matcht
 * „Zweiteiliger Gitterchip™" kein „diamant" -- die vier Regeln sind auf Christians
 * Fassung paarweise trennscharf, und der Test prueft genau das.
 */
export const ZUORDNUNG = [
  {erkennung: /one\s*eye/i, symbol: 'one-eye'},
  {erkennung: /zweiteilig/i, symbol: 'gitterchip-zweiteilig'},
  {erkennung: /diamant/i, symbol: 'diamant-gefasst'},
  {erkennung: /alpha\s*charge/i, symbol: 'alpha-charge'},
];

/**
 * Das Markup eines Symbols. EINE Stelle, an der viewBox, fill und Groesse stehen --
 * damit koennen die Symbole untereinander nicht auseinanderlaufen.
 *
 * `width/height="1em"` wie im Bestand: die Groesse macht CSS, nicht das Markup.
 * `aria-hidden`, weil die Bedeutung als Text unmittelbar daneben steht; ein
 * erfundener Alternativtext waere schlechter als keiner (dieselbe Entscheidung wie
 * bei den Beschriftungs-Icons in fremd-html-bilder.js).
 * KEINE feste Farbe: `currentColor` holt sie aus dem Stylesheet.
 */
export function symbolMarkup(name) {
  const d = QIMASTER_SYMBOL_PFADE[name];
  if (!d) return '';
  return (
    `<svg class="qm-kopfsymbol" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"` +
    ` viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path fill="currentColor" d="${d}"/></svg>`
  );
}

const LI_RX = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;

/**
 * Setzt die Symbole in die <li> des Kopfblocks.
 *
 * @param {string} html  descriptionHtml aus Shopify
 * @returns {{html: string, gesetzt: string[], offen: string[]}}
 *   `gesetzt` = Symbolnamen, die gesetzt wurden; `offen` = Zeilentexte ohne Symbol.
 */
export function kopfsymboleEinsetzen(html) {
  if (typeof html !== 'string' || !html) return {html: html ?? '', gesetzt: [], offen: []};
  const gesetzt = [];
  const offen = [];
  const neu = html.replace(LI_RX, (ganz, attrs, inhalt) => {
    // Eine Zeile, die schon ein Symbol traegt, wird nicht angefasst: sonst
    // verdoppelt ein zweiter Durchlauf das Symbol.
    if (/<svg\b/i.test(inhalt)) return ganz;
    const text = inhalt.replace(/<[^>]*>/g, ' ');
    const regel = ZUORDNUNG.find(
      (r) => r.erkennung.test(text) && !gesetzt.includes(r.symbol),
    );
    if (!regel) {
      const knapp = text.replace(/\s+/g, ' ').trim();
      if (knapp) offen.push(knapp);
      return ganz;
    }
    gesetzt.push(regel.symbol);
    return `<li${attrs}>${symbolMarkup(regel.symbol)}${inhalt}</li>`;
  });
  return {html: neu, gesetzt, offen};
}

/** Bequemer Aufruf fuer den Render-Pfad -- verwirft den Restbericht bewusst. */
export function fremdHtmlMitKopfsymbolen(html) {
  return kopfsymboleEinsetzen(html).html;
}
