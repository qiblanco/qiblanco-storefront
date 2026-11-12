/**
 * SSoT der Vorbestellungs-Anzeige IM WARENKORB.
 *
 * Christians Anweisung (2026-09-16): liegt der Qi Master im Warenkorb, lautet
 * die Zeile "Qi Master® - Vorbestellung Jan 2027" (seit der Umbenennung vom
 * 2026-10-17: "Qi Alpha - Vorbestellung Jan 2027") und der Lieferhinweis
 * darunter "Versandbereit für Dich: Jan 2027" statt "In 2 bis 3 Tagen bei dir!".
 *
 * WARUM DIE ANZEIGE UND NICHT DER PRODUKTTITEL: der Warenkorb zeigt
 * `product.title`. Wer den Shopify-Titel umbenennt, benennt ihn überall um —
 * Produktseite, Kollektionen, Suche, Bestellbestaetigung, Rechnung,
 * Meta-Katalog. Der Auftrag will den Text ausdrücklich NUR im Warenkorb. Der
 * Varianten-Weg scheidet ebenfalls aus: CartLineItem rendert allein
 * `product.title`, Varianten stehen getrennt als "Name: Wert" darunter — der
 * gewuenschte Wortlaut entstünde dort baulich nie.
 *
 * WARUM EINE DATEI FÜR BEIDE STELLEN: Zeile und Lieferhinweis werden von zwei
 * verschiedenen Komponenten gerendert (CartLineItem, CartSummary). Stuenden die
 * Texte je einmal dort, könnte eine Haelfte gepflegt werden und die andere
 * nicht — der Warenkorb sähe dann für den Kunden widersprüchlich aus
 * ("Vorbestellung Jan 2027" über "In 2 bis 3 Tagen bei dir!"). Beide Stellen
 * lesen deshalb denselben Eintrag, und die Naht wird geprüft
 * (test/vorbestellung.test.mjs).
 *
 * PFLEGE: läuft die Vorbestellung aus, wird der Eintrag hier entfernt — dann
 * greifen wieder Produkttitel und Standardhinweis, ohne Änderung an den
 * Komponenten. Das ist zugleich der Rückweg.
 */

/** Standard-Lieferzusage des Warenkorbs (gilt für alles ohne Eintrag unten). */
export const STANDARD_VERSANDHINWEIS = 'In 2 bis 3 Tagen bei dir!';

/** Produkt-Handle -> Anzeige im Warenkorb. */
// Qi Alpha (bis 2026-10-17 Qi Master; Christian am 2026-10-17: „es heißt
// nun Qi Alpha"). Beide Handles tragen denselben Eintrag, weil der Shopify-
// Handle erst in s09 des Umbenennungs-Grossjobs wechselt und Warenkörbe von
// vorher den alten behalten.
//
// Seit 2026-10-28 (Christian 27.10.: „Qi Alpha immer mit R“ und „dass z.b.
// Vorbestellung Jan 2027 eine eigene Zeile bekommt“; Job 20261027-qi-alpha-
// immer-mit-registered-zeichen): der Name steht allein, die Vorbestellung in
// einer eigenen, kleineren zweiten Zeile. Derselbe Wortlaut steht in Shopify
// als Variante des Qi Alpha, damit Kasse, Bestellbestätigung und Rechnung die
// zweite Zeile genauso zeigen.
const QI_ALPHA_VORBESTELLUNG = {
  warenkorbTitel: 'Qi Alpha®',
  unterzeile: 'Vorbestellung · Versand Jan 2027',
  versandhinweis: 'Versandbereit für Dich: Jan 2027',
  reif: '2027-01',
};
export const VORBESTELLUNGEN = {
  'qi-alpha': QI_ALPHA_VORBESTELLUNG,
  'qi-master': QI_ALPHA_VORBESTELLUNG,
};

// Necklace 2 (Christian 04.11.2026): zwei Liefertermine je Material. Die Zeile
// nennt Material, Länge und Termin, weil sie die Liste „Name: Wert“ ersetzt.
// Kasse und Bestellbestätigung lesen das Zeilenattribut „Lieferbar“ (Daten der
// Seite, necklace-2-alpha-daten.js).
// `reif` ist der sortierbare Termin-Schlüssel (YYYY-MM, ein Quartal zählt mit
// seinem letzten Monat): der Sammelhinweis vergleicht ihn, nie den Text.
const NECKLACE_2_NAME = 'Necklace 2 für den Qi Alpha® und QiOne®';
export const NECKLACE_2_TERMIN = {
  '750er ethisches Vollgold': {text: 'ab Januar 2027', reif: '2027-01'},
  Chirurgenstahl: {text: 'ab 1. Quartal 2027', reif: '2027-03'},
};

/** Eintrag der Necklace 2 zu einer Warenkorb-Zeile: Termin je Material. */
function necklace2Eintrag(line) {
  const opt = line?.merchandise?.selectedOptions ?? [];
  const wert = (n) => opt.find((o) => o?.name === n)?.value;
  const termin = NECKLACE_2_TERMIN[wert('Material')];
  if (!termin) return null;
  return {
    warenkorbTitel: NECKLACE_2_NAME,
    unterzeile: `${wert('Material')} · ${wert('Länge')} · Vorbestellung, lieferbar ${termin.text}`,
    versandhinweis: `Lieferbar für Dich: ${termin.text}`,
    reif: termin.reif,
  };
}

/** Eintrag zu einem Produkt-Handle, sonst null. */
export function vorbestellungFürHandle(handle) {
  if (!handle) return null;
  return VORBESTELLUNGEN[handle] ?? null;
}

/** Eintrag zu einer Warenkorb-Zeile, sonst null. */
export function vorbestellungFürLinie(line) {
  if (line?.merchandise?.product?.handle === 'necklace-2') return necklace2Eintrag(line);
  return vorbestellungFürHandle(line?.merchandise?.product?.handle);
}

/**
 * Der Titel, der in der Warenkorb-Zeile steht: der Vorbestellungs-Text, sonst
 * unverändert der Produkttitel.
 */
export function warenkorbTitel(line) {
  const eintrag = vorbestellungFürLinie(line);
  return eintrag?.warenkorbTitel || line?.merchandise?.product?.title || '';
}

/**
 * Die zweite Zeile unter dem Titel (kleiner, dezent), sonst null. Sie ersetzt
 * für diese Zeile die Liste „Name: Wert“ der Varianten-Optionen.
 */
export function warenkorbUnterzeile(line) {
  return vorbestellungFürLinie(line)?.unterzeile || null;
}

/**
 * Der Lieferhinweis für den GANZEN Warenkorb.
 *
 * Liegt eine Vorbestellung darin, gilt ihr Datum für die Bestellung — eine
 * Bestellung geht als EINE Sendung raus, und die spaetere Zusage ist die
 * ehrliche. Genau das verlangt die Anweisung ("wenn es im Warenkorb liegt …
 * statt 'In 2 bis 3 Tagen bei dir'"). Liegt keine darin, bleibt der
 * Standardtext unverändert — der Hinweis ist produktbezogen, nicht global.
 *
 * Liegen mehrere Vorbestellungen darin, gewinnt die SPAETESTE (Schlüssel
 * `reif`, YYYY-MM): die Bestellung geht erst raus, wenn alles da ist. Seit
 * Necklace 2 gibt es abweichende Termine (Gold Januar, Stahl 1. Quartal 2027);
 * vorher gewann die erste Zeile, und Gold + Stahl versprachen Januar (Job
 * 20261105-prio1-necklace-2-livegang-de-freigegeben-christian-s03). Bei
 * gleichem Monat bleibt die erste. Ein Eintrag ohne `reif` zählt als
 * spaetester, weil für ihn kein früherer Termin belegt ist.
 */
const OHNE_REIF = '9999-12';
export function versandhinweisFürLinien(lines) {
  let treffer = null;
  for (const eintrag of (lines ?? []).map(vorbestellungFürLinie)) {
    if (!eintrag?.versandhinweis) continue;
    if (!treffer || (eintrag.reif || OHNE_REIF) > (treffer.reif || OHNE_REIF)) {
      treffer = eintrag;
    }
  }
  return treffer?.versandhinweis || STANDARD_VERSANDHINWEIS;
}
