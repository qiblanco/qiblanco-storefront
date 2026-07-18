/**
 * MARKT-PREIS-KANON — die EINE Stelle, die aus einem Storefront-API-Preis
 * (Betrag + Waehrung) den Anzeigewert und das Anzeigeformat macht.
 * (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft; Deep-Dive Preis-Job
 * 20260718-preis-konsistenz-fix-und-preis-monitor.)
 *
 * Belegte Markt-Mechanik (Cart-API-Gegenproben 2026-07-18):
 * - EUR-Maerkte (DE/AT): Shopify speichert NETTO (`taxes_included=false`);
 *   der Warenkorb-Kanon (cart-display-pricing) zeigt round(netto*(1+satz)),
 *   satz 19 % bzw. 7 % (Kakao). Steuer kommt im Checkout obendrauf.
 * - Alle anderen Waehrungen (CHF/USD/GBP, Shopify Markets): der Markets-
 *   Preis IST der Endbetrag — Cart-Zeile == @inContext-Preis, keine
 *   Steuer-Zeile (CH 1.048 CHF belegt; inkl. Wechselkursaufschlag 1,5 %
 *   + Aufrundung bei Auto-FX-Preisen bzw. manuell fixierter Marktpreis).
 */
import {taxRateForHandle} from '~/lib/cart-display-pricing';

/**
 * Anzeige-Steuersatz eines Produkts im Waehrungs-Kontext.
 * @param {string} handle Produkt-Handle
 * @param {string} [currencyCode] Waehrung des API-Preises (Default EUR)
 * @returns {number} 0.19 / 0.07 fuer EUR-Netto-Maerkte, 0 sonst (Endbetrag)
 */
export function anzeigeSatz(handle, currencyCode) {
  if ((currencyCode || 'EUR') !== 'EUR') return 0;
  return taxRateForHandle(handle);
}

/**
 * Brutto-Anzeigewert eines API-Preises (Warenkorb-Kanon: Math.round).
 * @param {string|number} amount API-Betrag (Netto bei EUR, Endbetrag sonst)
 * @param {string} handle Produkt-Handle (Steuersatz-Zuordnung)
 * @param {string} [currencyCode]
 * @returns {number|null} gerundeter Anzeigewert oder null (Betrag fehlt)
 */
export function bruttoAnzeige(amount, handle, currencyCode) {
  const zahl = Number.parseFloat(amount);
  if (!Number.isFinite(zahl)) return null;
  return Math.round(zahl * (1 + anzeigeSatz(handle, currencyCode)));
}

/**
 * Anzeigeformat je Waehrung. Stile:
 * - 'lp'  (Campaign-/Paket-Karten): "7.345 €" · "1.048 CHF" · "$1,383"
 * - 'pdp' (ProductPrice-Kanon):    "1.087,- €" · "1.048,- CHF" · "$1,383"
 * @param {number|null} wert gerundeter Anzeigewert
 * @param {string} [currencyCode]
 * @param {'lp'|'pdp'} [stil]
 * @returns {string|null}
 */
export function formatPreis(wert, currencyCode = 'EUR', stil = 'lp') {
  if (wert == null || !Number.isFinite(Number(wert))) return null;
  const n = Number(wert);
  if (currencyCode === 'USD') {
    return `$${n.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
  }
  const de = n.toLocaleString('de-DE', {maximumFractionDigits: 0});
  const symbol = currencyCode === 'EUR' ? '€' : currencyCode;
  return stil === 'pdp' ? `${de},- ${symbol}` : `${de} ${symbol}`;
}
