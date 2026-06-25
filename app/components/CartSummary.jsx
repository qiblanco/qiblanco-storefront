import {Form} from 'react-router';
import {getCartLineGrossDisplayTotal} from '~/lib/cart-display-pricing';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  // Format as 1.087,- €
  const formatEuroPrice = (money) => {
    if (!money?.amount) return '';
    const amount = Math.floor(parseFloat(money.amount));
    return `${amount.toLocaleString('de-DE')},- €`;
  };

  const lines = cart?.lines?.nodes ?? [];
  const correctedTotal = lines.reduce(
    (total, line) => total + getCartLineGrossDisplayTotal(line),
    0,
  );

  const currencyCode = cart.cost?.subtotalAmount?.currencyCode ?? 'EUR';
  const taxedSubtotal = {amount: correctedTotal.toFixed(2), currencyCode};

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <div className="cart-aside-subtotal">
       <div>Zwischensumme:</div> {formatEuroPrice(taxedSubtotal)}
      </div>
      <div className="cart-delivery-notes">
        <small className="additional-delivery-notice">
          In 2 bis 3 Tagen bei dir!
        </small>
        <div className="trenner"></div>
        <small className="additional-delivery-notice">
          100% versichterter Versand!
        </small>
      </div>
      <CartCheckoutActions
        checkoutUrl={cart.checkoutUrl}
      />
      <PaymentMethods />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <Form
      action="/cart/attribution"
      className="cartSummaryWrapper"
      method="post"
    >
      <button
        className="btn--primary"
        type="submit"
      >
        <p>Jetzt sicher zur Kasse</p>
      </button>
    </Form>
  );
}

function PaymentMethods() {
  return (
    <div className="PaymentMethods">
      {/* (all your SVGs remain unchanged) */}
    </div>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
