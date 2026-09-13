/**
 * PAKETPREIS-KANON — die EINE Stelle, die aus den API-Preisen eines Pakets den
 * beworbenen Kartenpreis macht.
 *
 * WARUM ES DIESE DATEI GIBT (Auftragsordner claude-jobs/20260912-repair-paket-
 * codes-seite-gegen-kasse-cent-mehrzeiliger-korb). Die Rechnung stand bis zum
 * 2026-09-12 in `paketAnzeige()` und rundete JE WARENKORBZEILE auf ganze Euro.
 * Daraus folgten zwei am Kundenrand belegte Fehler:
 *
 *  (1) DER BEWORBENE PREIS HING AM GRÖSSEN-DROPDOWN. Zwei gleiche Kettenlaengen
 *      buendeln zu EINER Zeile, zwei verschiedene bleiben ZWEI — und zwei Zeilen
 *      runden anders als eine. Gemessen: Fundament zeigte 6.756 ODER 6.757,
 *      Unabhängig 9.240/9.241/9.242, Residenz 17.397/17.398, je nach Wahl im
 *      Dropdown. Der Kunde aenderte eine Kettenlaenge und der Paketpreis sprang,
 *      ohne dass sich am Warenkorb sonst etwas aenderte.
 *
 *  (2) DER KARTENPREIS WAR AN DER KASSE NICHT HERSTELLBAR. Der DACH-Shop führt
 *      NETTO-Preise; ein Prozent-Rabatt landet nach der Steuer fast nie auf
 *      einem runden Bruttobetrag. Gemessen am 2026-09-12 (`runningTotal` der
 *      Kassenseite): Karte 6.756 / Kasse 6.757,45 · Karte 9.242 / Kasse 9.240,95
 *      · Karte 17.397 / Kasse 17.397,04.
 *
 * ZWEI AENDERUNGEN, DIE GETRENNT NICHTS TAUGEN:
 *
 *  A) EINMAL RUNDEN STATT JE ZEILE. Die Zeilenaufteilung ist eine Eigenschaft
 *     der Groessenwahl, nicht des Preises: `netto x menge` ist vor dem Runden
 *     identisch, egal ob eine Zeile mit Menge 2 oder zwei mit Menge 1 entsteht.
 *     Wer einmal am Ende rundet, ist deshalb baulich unabhängig vom Dropdown.
 *     GEGENPROBE, die das bestaetigt: die `compare`-Literale der Komponente
 *     (7.345 / 10.501 / 20.467 EUR) sind exakt round(netto x 1,19) — einmal
 *     gerundet war schon immer die gemeinte Semantik, nur nicht die gebaute.
 *
 *  B) DER RABATT WIRD ALS FESTBETRAG GERECHNET, NICHT ALS PROZENTSATZ. Nur ein
 *     Festbetrag erzeugt an einer Netto-Kasse einen ganzen Euro. Welcher Betrag
 *     welchen Euro erzeugt, ist ausgerechnet und gegen die Kasse geeicht
 *     (werkzeug/festbetrag_spektrum.py im Job-Ordner); er steht als
 *     `rabattFest` an der Paket-Definition, damit Anzeige und Shopify-Rabatt
 *     EINE Groesse sind und nicht zwei, die dasselbe meinen.
 *
 * DIE NAHT, DIE DAS NEU ERZEUGT, UND IHR WAECHTER: `rabattFest` hier und der
 * Festbetrag des Rabattcodes in Shopify müssen zusammenbleiben. Wer einen
 * aendert und den anderen nicht, wird täglich laut — die Wache
 * `shop-manager/pruefungen/probe_rundung_kundenrand.py` liest den Kartenpreis
 * LIVE aus `ghx-pak__price` und stellt ihn gegen den `runningTotal` der Kasse.
 *
 * FREMDWAEHRUNG, AUSDRÜCKLICH BENANNT STATT STILL UEBERGANGEN: `rabattFest` ist
 * ein EUR-Betrag. In CHF/USD/GBP (Shopify Markets, FREIGESCHALTETE_MAERKTE in
 * markt-pricing.js) ist der Markets-Preis bereits der Endbetrag (anzeigeSatz
 * gibt dort 0) und Shopify rechnet einen Festbetrag-Rabatt selbst um — mit
 * welchem Kurs, ist NICHT gemessen. Dort wäre ein hier nachgerechneter
 * Festbetrag eine Behauptung. Deshalb gilt der Festbetrag-Pfad NUR für EUR;
 * jede andere Waehrung rechnet unveraendert weiter mit dem Prozentsatz, also
 * genau so, wie die Karte es vor diesem Umbau tat. Das ist keine Loesung für
 * die Fremdmaerkte, sondern die ehrliche Grenze dieses Baus.
 */
import {anzeigeSatz} from './markt-pricing.js';

/** Waehrung, in der `rabattFest` denominiert ist. */
export const FESTBETRAG_WAEHRUNG = 'EUR';

/**
 * @typedef {Object} PaketLine
 * @property {number} einzelNetto  Netto-Einzelpreis aus der Storefront-API
 * @property {number} quantity     Stueckzahl dieser Zeile
 * @property {string} handle       Produkt-Handle (bestimmt den Steuersatz)
 * @property {string} waehrung     Waehrung des API-Preises
 */

/**
 * Die drei Betraege einer Paketkarte — gerundet, aber nur EINMAL.
 *
 * @param {PaketLine[]} lines Warenkorbzeilen des Pakets
 * @param {{rabatt: number, rabattFest?: number}} paket Paket-Definition
 * @returns {{compare: number, preis: number, waehrung: string}|null}
 *   null, wenn die Zeilen unbrauchbar sind (fail-closed — der Aufrufer zeigt
 *   dann den letzten bekannten guten Stand, nie 0/leer/falsch).
 */
export function paketBetraege(lines, paket) {
  if (!Array.isArray(lines) || lines.length === 0) return null;
  const waehrung = lines[0].waehrung || FESTBETRAG_WAEHRUNG;

  let nettoSumme = 0;
  let compareRoh = 0;
  let preisProzentRoh = 0;
  const saetze = new Set();

  for (const line of lines) {
    const menge = Number(line.quantity);
    const netto = Number(line.einzelNetto);
    if (!Number.isFinite(netto) || !Number.isFinite(menge) || menge <= 0) {
      return null; // fail-closed
    }
    const satz = anzeigeSatz(line.handle, line.waehrung);
    saetze.add(satz);
    nettoSumme += netto * menge;
    compareRoh += netto * menge * (1 + satz);
    // Prozent-Pfad: Shopify schneidet den Prozentrabatt JE STÜCK centgenau ab
    // (Cart-Probe 2026-07-18: 78,99 x 8 % = 6,3192 -> 6,31).
    const rabattProEinheit = Math.floor(netto * paket.rabatt * 100) / 100;
    preisProzentRoh += (netto - rabattProEinheit) * menge * (1 + satz);
  }

  // FESTBETRAG-PFAD nur, wenn er auch wirklich gilt: ein EUR-Betrag in einer
  // EUR-Zeile, und EIN Steuersatz über das ganze Paket. Bei gemischten
  // Saetzen (19 % Technik neben 7 % Lebensmittel) wäre die Verteilung eines
  // Bestellrabatts auf die Zeilen entscheidend und ist NICHT gemessen — dann
  // lieber den unveraenderten Prozent-Pfad als eine gerechnete Behauptung.
  const festGilt =
    Number.isFinite(paket.rabattFest) &&
    paket.rabattFest > 0 &&
    waehrung === FESTBETRAG_WAEHRUNG &&
    saetze.size === 1;

  const preisRoh = festGilt
    ? (nettoSumme - paket.rabattFest) * (1 + [...saetze][0])
    : preisProzentRoh;

  return {
    compare: Math.round(compareRoh),
    preis: Math.round(preisRoh),
    waehrung,
  };
}
