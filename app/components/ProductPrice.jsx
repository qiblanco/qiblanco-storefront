import {formatPreis} from '~/lib/markt-pricing';

export function ProductPrice({ price, compareAtPrice, taxRate = 0.19 }) {
  const applyTax = (money) => {
    if (!money) return null;
    const numericAmount = Number.parseFloat(money.amount);
    if (!Number.isFinite(numericAmount)) return null;
    // Warenkorb-Kanon (cart-display-pricing: Math.round) — ceil zeigte
    // 1.088 statt offiziell 1.087 bei netto 913,45 (QiOne 2 Pro).
    // M3: Nicht-EUR-Maerkte (Shopify Markets) liefern den ENDBETRAG —
    // dort gilt satz 0 (belegt: Cart-API == @inContext, keine Steuer-Zeile).
    const satz = (money.currencyCode || 'EUR') === 'EUR' ? taxRate : 0;
    const amount = Math.round(numericAmount * (1 + satz));
    return { ...money, amount };
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
