import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';

/**
 * Der Preis auf einer KACHEL — Kollektionsseite, Suchergebnis, Vorschlagsliste.
 *
 * WARUM ES DIESE DATEI GIBT (Job 20260910-REPAIR-qiblanco-dieselbe-ware-kostet-
 * gleichzeitig-53-und-85-euro):
 * Bis zum 2026-09-09 stand auf diesen drei Flaechen `<Money data={...}/>` mit
 * dem ROHEN Betrag aus der Storefront-API. Der Shop speichert netto
 * (taxes_included=false), und <Money> formatiert nach Shop-Locale. Gemessen am
 * Kundenrand auf https://qiblanco.com/collections/zeremonie-kakao:
 *
 *     €71.03   statt   76,- €        (Kakao, 7 % Lebensmittelsatz)
 *     €913.45  statt   1.087,- €     (QiOne 2 Pro, 19 %)
 *     €4,187.40 statt  4.983,- €     (QiHome Air)
 *
 * Also zweimal falsch in einem Wert: der NETTO-Betrag, den die Kasse nie
 * belastet, und dazu im US-Format mit Punkt als Dezimaltrenner. Auf
 * /collections/all traf es JEDES Produkt, nicht nur den Kakao.
 *
 * DAS BESONDERS TEURE DARAN war nicht die Zahl, sondern ihre Unsichtbarkeit:
 * der Preis-Waechter (homepage-bauer/src/preiswatch.py, RE_PREIS) kennt nur
 * das deutsche Format. Genau die Schreibweise, deren blosses Auftreten der
 * Defekt IST, konnte er baulich nicht sehen.
 *
 * ES WIRD HIER NICHTS GERECHNET UND NICHTS FORMATIERT. Beides kommt aus dem
 * Markt-Preis-Kanon (markt-pricing.js -> cart-display-pricing.js), derselben
 * Stelle, aus der die Kaufseite und der Warenkorb ihre Zahl holen. Eine
 * vierte Implementierung wäre genau der Fehler, gegen den diese Datei
 * gebaut ist — die Preise sind schon zweimal auseinandergelaufen, weil
 * dieselbe Rechnung an zwei Orten stand.
 *
 * WAS DIE KACHEL ZEIGT, ist der Preis EINER Packung / EINES Stuecks
 * (minVariantPrice, brutto). Die Mengenstaffel (3x = 53,- € je Packung)
 * steht bewusst NICHT hier: sie gilt nur unter einer Bedingung — der Menge —
 * und die wählt der Kunde erst auf der Kaufseite. Eine Kachel kann diese
 * Bedingung nicht mittragen, und dieselbe Ware muss auf der Kachel dieselbe
 * Zahl zeigen, egal über welches Handle sie erreichbar ist.
 *
 * @param {{money?: {amount?: string|number, currencyCode?: string},
 *          handle?: string, stil?: 'lp'|'pdp'}} props
 */
export function KachelPreis({money, handle, stil = 'lp'}) {
  if (!money) return null;
  const waehrung = money.currencyCode || 'EUR';
  const text = formatPreis(bruttoAnzeige(money.amount, handle, waehrung), waehrung, stil);
  return text ? <span className="kachel-preis">{text}</span> : null;
}
