import {anzeigeSatz, formatPreis} from '~/lib/markt-pricing';

/**
 * Der Preisblock der Kaufseiten.
 *
 * WARUM DIESE DATEI KEINEN STEUERSATZ MEHR KENNT (Job 20260910-REPAIR-qiblanco-
 * dieselbe-ware-kostet-gleichzeitig-53-und-85-euro):
 * Bis zum 2026-09-09 stand hier `taxRate = 0.19` als Vorgabewert, und KEINE
 * einzige Kaufseite hat den Wert je uebergeben. Der Lebensmittelsatz von 7 %
 * für Kakao lebte deshalb nur im Warenkorb-Kanon (cart-display-pricing.js) —
 * die Kaufseite davor rechnete unverandert mit 19 %.
 *
 * WAS DAS GEKOSTET HAT, gemessen am Kundenrand:
 * /products/crystal-cacao-adfiefiale zeigte 85,- € (= round(71,03 × 1,19)),
 * waehrend Warenkorb und Kasse für DIESELBE Ware (SKU 6666, 420 g) 44,08 €
 * belasteten und die Schwesterseite /products/crystal-cacao-create für die
 * gleiche Packung 76,- € auswies. Der Fix vom 2026-07-29 (PR #144/#145,
 * "Lebensmittel-MwSt für crystal-cacao-adfiefiale + -angebot") hat genau
 * diese Klasse geschlossen — aber nur beim Warenkorb-Konsumenten. Der zweite
 * Konsument stand daneben und wurde nicht mitgezogen.
 *
 * DESHALB: der Satz wird HIER NICHT MEHR ENTSCHIEDEN, sondern geholt.
 * `anzeigeSatz(handle, waehrung)` ist die eine Stelle (markt-pricing.js ->
 * cart-display-pricing.js), die weiss, welche Ware welchen Satz trägt und
 * dass Nicht-EUR-Maerkte den Endbetrag liefern. Wer eine neue Kakaoseite
 * baut, trägt nichts mehr nach.
 *
 * DIE PROP `taxRate` BLEIBT — sie ist eine AUSNAHME, kein Vorgabewert:
 * der Warenkorb (CartLineItem) uebergibt 0, weil sein Betrag SCHON brutto ist
 * (getCartLineGrossDisplayTotal hat gerechnet). Ohne diese Ausnahme würden
 * 7 % ein zweites Mal aufgeschlagen. `taxRate` sticht deshalb den Handle —
 * aber nur, wenn er ausdrücklich gesetzt ist.
 *
 * @param {{price?: any, compareAtPrice?: any, handle?: string, taxRate?: number}} props
 */
export function ProductPrice({price, compareAtPrice, handle, taxRate}) {
  const satzFuer = (money) => {
    if (taxRate != null) {
      // Ausdrueckliche Ausnahme (Warenkorb: Betrag ist schon brutto).
      // Nicht-EUR bleibt auch hier steuerfrei — das ist die Markt-Mechanik
      // aus markt-pricing.js und gilt für beide Wege gleich.
      return (money.currencyCode || 'EUR') === 'EUR' ? taxRate : 0;
    }
    return anzeigeSatz(handle, money.currencyCode);
  };

  const applyTax = (money) => {
    if (!money) return null;
    const numericAmount = Number.parseFloat(money.amount);
    if (!Number.isFinite(numericAmount)) return null;
    // Warenkorb-Kanon (cart-display-pricing: Math.round) — ceil zeigte
    // 1.088 statt offiziell 1.087 bei netto 913,45 (QiOne 2 Pro).
    const amount = Math.round(numericAmount * (1 + satzFuer(money)));
    return {...money, amount};
  };

  const formatMarktPreis = (money) => {
    if (!money) return null;
    const amount = Number(money.amount);
    if (!Number.isFinite(amount)) return null;
    return formatPreis(Math.round(amount), money.currencyCode || 'EUR', 'pdp');
  };

  const taxedPrice = formatMarktPreis(applyTax(price));
  const compareAtFormatted = formatMarktPreis(compareAtPrice); // no tax here

  return (
    <div className="product-price">
      {compareAtFormatted ? (
        <div className="product-price-on-sale">
          {taxedPrice ? <span className="gradient-price">{taxedPrice}</span> : null}
          <s>{compareAtFormatted}</s>
        </div>
      ) : taxedPrice ? (
        <span>{taxedPrice}</span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
