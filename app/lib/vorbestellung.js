/**
 * SSoT der Vorbestellungs-Anzeige IM WARENKORB.
 *
 * Christians Anweisung (2026-09-16): liegt der Qi Master im Warenkorb, lautet
 * die Zeile "Qi Master® - Vorbestellung Jan 2027" und der Lieferhinweis
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
export const VORBESTELLUNGEN = {
  'qi-master': {
    warenkorbTitel: 'Qi Master® - Vorbestellung Jan 2027',
    versandhinweis: 'Versandbereit für Dich: Jan 2027',
  },
};

/** Eintrag zu einem Produkt-Handle, sonst null. */
export function vorbestellungFürHandle(handle) {
  if (!handle) return null;
  return VORBESTELLUNGEN[handle] ?? null;
}

/** Eintrag zu einer Warenkorb-Zeile, sonst null. */
export function vorbestellungFürLinie(line) {
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
 * Der Lieferhinweis für den GANZEN Warenkorb.
 *
 * Liegt eine Vorbestellung darin, gilt ihr Datum für die Bestellung — eine
 * Bestellung geht als EINE Sendung raus, und die spaetere Zusage ist die
 * ehrliche. Genau das verlangt die Anweisung ("wenn es im Warenkorb liegt …
 * statt 'In 2 bis 3 Tagen bei dir'"). Liegt keine darin, bleibt der
 * Standardtext unverändert — der Hinweis ist produktbezogen, nicht global.
 *
 * Liegen mehrere Vorbestellungen darin, gewinnt die ERSTE gefundene. Heute gibt
 * es genau einen Eintrag; kommt ein zweiter mit anderem Datum dazu, gehört
 * hier eine Regel hin, die das spaetere Datum wählt.
 */
export function versandhinweisFürLinien(lines) {
  const treffer = (lines ?? [])
    .map(vorbestellungFürLinie)
    .find((eintrag) => eintrag?.versandhinweis);
  return treffer?.versandhinweis || STANDARD_VERSANDHINWEIS;
}
