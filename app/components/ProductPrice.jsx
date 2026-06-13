export function ProductPrice({ price, compareAtPrice, taxRate = 0.19 }) {
  const applyTax = (money) => {
    if (!money) return null;
    const numericAmount = Number.parseFloat(money.amount);
    if (!Number.isFinite(numericAmount)) return null;
    const amount = Math.ceil(numericAmount * (1 + taxRate));
    return { ...money, amount };
  };

  const formatGermanPrice = (money) => {
    if (!money) return null;
    const amount = Number(money.amount);
    if (!Number.isFinite(amount)) return null;
    const formattedAmount = new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formattedAmount},- €`;
  };

  const taxedPrice = formatGermanPrice(applyTax(price));
  const compareAtFormatted = formatGermanPrice(compareAtPrice); // no tax here

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
