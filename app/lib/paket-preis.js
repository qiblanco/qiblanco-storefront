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
 * FREMDWAEHRUNG -- GELOEST AM 2026-09-13. Neu gilt: in CHF/USD/GBP rechnet die
 * Karte weiter mit dem Prozentsatz UND legt jetzt auch den PROZENT-Code in den
 * Warenkorb (`rabattCodeFuer`, unten). Damit ist die Rechnung dieser Datei in
 * jeder Waehrung die, die die Kasse einloest -- ohne dass hier ein Wechselkurs
 * stehen muss. Der folgende Absatz ist die HISTORIE: er beschreibt den Zustand,
 * der den Fremdmarkt-Schaden erzeugt hat, und bleibt als Beleg stehen.
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
import {taxRateForHandle} from './cart-display-pricing.js';
import {istBrutto} from './preismodus.js';

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
 * @param {string} [land] Land des aufgelösten Marktes (ISO-2). DER STEUERSATZ
 *   FOLGT DEM MARKT, NICHT DER WÄHRUNG: AT und DE teilen sich den Euro und
 *   haben 20 % gegen 19 %. Wer `land` weglässt, bekommt den Satz, den
 *   `anzeigeSatz` ohne Land vergibt — für jeden zweiten EUR-Markt ist das die
 *   falsche Zahl (Job 20260913-at-paketkarte-rechnet-19-prozent-kasse-nimmt-20).
 * @returns {{compare: number, preis: number, waehrung: string}|null}
 *   null, wenn die Zeilen unbrauchbar sind (fail-closed — der Aufrufer zeigt
 *   dann den letzten bekannten guten Stand, nie 0/leer/falsch).
 */
export function paketBetraege(lines, paket, land) {
  if (!Array.isArray(lines) || lines.length === 0) return null;
  const waehrung = lines[0].waehrung || FESTBETRAG_WAEHRUNG;

  let nettoSumme = 0;
  let compareRoh = 0;
  let preisProzentRoh = 0;
  const saetze = new Set();
  // Heimatsatz (DE) je Zeile: `rabattFest` steht NETTO im Code, weil der Shop
  // bis zum Kipp netto kalibriert war. Im Preismodus brutto wird der Rabatt-
  // code in Shopify (s04) auf rabattFest x (1+Heimatsatz) gezogen, und genau
  // diese Zahl muss die Karte abziehen. Gemischte Heimatsätze -> kein Fest-Pfad.
  const heimatSaetze = new Set();
  // Summe in HEIMAT-Brutto (DE), auch wenn die Zeilen AT-Preise tragen: nur an
  // ihr ist der Festbetrag kalibriert, den s04 in den Rabattcode schreibt.
  let summeHeimat = 0;

  for (const line of lines) {
    const menge = Number(line.quantity);
    const netto = Number(line.einzelNetto);
    if (!Number.isFinite(netto) || !Number.isFinite(menge) || menge <= 0) {
      return null; // fail-closed
    }
    const satz = anzeigeSatz(line.handle, line.waehrung, land);
    saetze.add(satz);
    heimatSaetze.add(taxRateForHandle(line.handle, 'DE'));
    // Je STÜCK auf Cent zurückgerechnet: der AT-Preis ist DE-Brutto/1,19x1,20
    // auf Cent gerundet, der Rundungsfehler (<= 0,5 Cent) verschwindet so
    // wieder. Über die Summe gerechnet blieb er stehen (588,99 statt 589,00).
    summeHeimat +=
      (Math.round(
        (netto / (1 + taxRateForHandle(line.handle, land))) *
          (1 + taxRateForHandle(line.handle, 'DE')) *
          100,
      ) /
        100) *
      menge;
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
    saetze.size === 1 &&
    heimatSaetze.size === 1;

  // Preismodus brutto: `nettoSumme` ist dann schon die Bruttosumme (die API
  // liefert Endbeträge, satz ist 0), der Festbetrag wird auf denselben
  // centgenauen Bruttowert gehoben, den s04 in den Rabattcode schreibt.
  // UNGEMESSEN für AT: ob Shopify unter "Dynamisch" einen Festbetrag je Land
  // umrechnet, ist nicht belegt -- gerechnet wird er hier unverändert (Rand-
  // messung s05 prüft den Kartenpreis gegen die AT-Kasse).
  const rabattAbzug = istBrutto()
    ? festAbzugBrutto(summeHeimat, paket.rabattFest, [...heimatSaetze][0])
    : paket.rabattFest;
  const preisRoh = festGilt
    ? (nettoSumme - rabattAbzug) * (1 + [...saetze][0])
    : preisProzentRoh;

  return {
    compare: Math.round(compareRoh),
    preis: Math.round(preisRoh),
    waehrung,
    // WELCHE RABATTART DIESE ZAHL UNTERSTELLT. Sie wird zurueckgegeben, weil der
    // Warenkorb GENAU den Rabattcode bekommen muss, dessen Art hier gerechnet
    // wurde -- siehe rabattCodeFuer(). Vorher war das eine stille Annahme, und
    // sie ist am 2026-09-13 in CHF/USD gebrochen.
    rabattart: festGilt ? 'fest' : 'prozent',
    // Der Festbetrag, den diese Zahl unterstellt (null im Prozent-Pfad). Im
    // Preismodus brutto ist das der Betrag, der im PAKET-Code stehen muss.
    festAbzug: festGilt ? rabattAbzug : null,
  };
}

/**
 * DER BRUTTO-FESTBETRAG, DER DIE KASSE AUF GANZE EURO LEGT (Preismodus brutto,
 * Grossjob 20260924-kasse-zeigt-bruttopreise-wie-produktseite-prio10, s02).
 *
 * Der naheliegende Weg -- `rabattFest x 1,19` auf den Cent -- trifft den
 * ganzen Euro NICHT: 494,97 x 1,19 = 589,01, und 7.345 - 589,01 = 6.755,99 an
 * der Kasse (gefunden vom unabhängigen Prüfer, P2). Kalibriert wird deshalb
 * wie vor dem Kipp auf den ganzen Euro, den die Karte heute zeigt:
 *   Ziel   = round(summeHeimat - rabattFest x (1+heimatSatz))
 *   Abzug  = summeHeimat - Ziel
 * Fundament 589,00 · Unabhängig 1.265,00 · Residenz 3.077,00 bei den
 * Brutto-Basen von heute. GENAU DIESE Beträge schreibt s04 in die PAKET-Codes.
 * @param {number} summeHeimat Paketsumme in Heimat-Brutto (DE)
 * @param {number} rabattFest Festbetrag netto (wie im Code kalibriert)
 * @param {number} heimatSatz Steuersatz DE der Paketware
 * @returns {number} centgenauer Brutto-Abzug
 */
export function festAbzugBrutto(summeHeimat, rabattFest, heimatSatz) {
  const ziel = Math.round(summeHeimat - rabattFest * (1 + heimatSatz));
  return Math.round((summeHeimat - ziel) * 100) / 100;
}

/**
 * Suffix des PROZENT-Codes eines Pakets. Der Code in Shopify lautet
 * `<discountCode><PROZENT_SUFFIX>`, also z. B. `PAKET-FUNDAMENT-INTL`.
 *
 * WARUM ABGELEITET UND NICHT HINGESCHRIEBEN: so kann der Prozent-Code nicht vom
 * Festbetrag-Code abwandern -- ein Paket hat genau EINEN Namensstamm, und die
 * beiden Arten sind zwei Auspraegungen davon. Wer hier den Stamm aendert, aendert
 * beide zugleich.
 */
export const PROZENT_SUFFIX = '-INTL';

/**
 * DER RABATTCODE, DER ZU DER GERECHNETEN ZAHL PASST -- die eigentliche Lehre des
 * 2026-09-13.
 *
 * WAS AN DIESEM TAG PASSIERT IST. Die Karte rechnete den Preis mit dem
 * PROZENTSATZ und legte gleichzeitig einen Code in den Warenkorb, der einen
 * FESTBETRAG in EUR hat. In DE stimmte das Ergebnis ungefaehr; in CHF und USD
 * rechnet Shopify den Festbetrag mit einem eigenen Wechselkurs um, und der Kunde
 * zahlte mehr, als die Karte nannte -- gemessen CH +77,26 bzw. +155,58 CHF und
 * US +282,19 bzw. +663,51 USD je Bestellung.
 *
 * WARUM HIER KEIN KURS STEHT. Der naheliegende Weg -- den Festbetrag selbst
 * umrechnen -- braucht Shopifys Marktkurs. Der ist von diesem Haus aus NICHT
 * lesbar (kein App-Token hat `read_markets`), also nur schaetzbar; eine
 * geschaetzte Konstante im Quelltext ist morgen falsch, ohne dass es auffaellt.
 * Ein PROZENTSATZ dagegen ist waehrungsblind: er trifft in jeder Waehrung
 * dieselbe Zahl, die diese Datei ausrechnet. Also wird nicht der Betrag
 * uebersetzt, sondern die RABATTART gewechselt.
 *
 * DIE KOPPLUNG IST DER PUNKT, nicht die Fallunterscheidung: die Art kommt aus
 * `paketBetraege()`, also aus derselben Rechnung, die den angezeigten Preis
 * erzeugt hat. Damit kann die Anzeige nicht mehr eine Art zeigen und eine andere
 * einloesen -- der Fehler dieses Tages ist baulich nicht mehr formulierbar.
 *
 * ABGRENZUNG ZUM NACHBARFALL (P10, Naht klar benannt): die Kakao-Staffel
 * hat am 2026-09-12 dieselbe Wurzel anders geloest -- ausserhalb des EUR-Markts
 * nennt sie den LISTENPREIS und verspricht keinen Staffelpreis
 * (app/components/CacaoProductForm.jsx). Das ist kein Widerspruch, sondern eine
 * andere Ausgangslage: dort ist der Rabatt ein AUTOMATIK-Rabatt ohne Code, es
 * gibt also keinen zweiten Code zur Auswahl. Hier gibt es ihn, und
 * die Paketkarte lebt von der genannten Ersparnis -- ein Paket ohne Preisvorteil
 * zu bewerben ist die schlechtere Antwort.
 *
 * @param {{discountCode: string}} paket Paket-Definition
 * @param {'fest'|'prozent'} rabattart Art, die `paketBetraege` gerechnet hat
 * @returns {string} der Code, den der Warenkorb bekommen muss
 */
export function rabattCodeFuer(paket, rabattart) {
  const stamm = paket?.discountCode;
  if (!stamm) return stamm;
  return rabattart === 'fest' ? stamm : `${stamm}${PROZENT_SUFFIX}`;
}
