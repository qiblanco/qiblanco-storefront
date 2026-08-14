import {Form} from 'react-router';
import {getCartLineGrossDisplayTotal} from '~/lib/cart-display-pricing';
import {formatPreis} from '~/lib/markt-pricing';
import {cartLineContentIds} from '~/lib/pixel-content';
import {qpxTrack, buildInitiateCheckoutEvent} from '~/lib/qpx-commerce';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  // Format as 1.087,- € / 1.048,- CHF / $1,383 (M3: Waehrung des Carts)
  const formatEuroPrice = (money) => {
    if (!money?.amount) return '';
    const amount = Math.floor(parseFloat(money.amount));
    return formatPreis(amount, money.currencyCode || 'EUR', 'pdp') || '';
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
        subtotal={taxedSubtotal}
        numItems={lines.length}
        contentIds={cartLineContentIds(lines)}
      />
      <PaymentMethods />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string, subtotal?: {amount: string, currencyCode: string}, numItems?: number, contentIds?: string[]}}
 */
function CartCheckoutActions({checkoutUrl, subtotal, numItems, contentIds}) {
  if (!checkoutUrl) return null;

  // Meta-Pixel InitiateCheckout: feuert nur, wenn das Pixel (consent-gated)
  // geladen ist. Die Form submittet normal weiter — Tracking darf den
  // Checkout nie blockieren.
  // content_ids/content_type spiegeln ViewContent/AddToCart (MetaPixel.jsx),
  // damit die Event-Kette dieselben Produkt-IDs traegt (Meta-Match-Qualitaet).
  const trackInitiateCheckout = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          content_ids: contentIds || [],
          content_type: 'product',
          value: parseFloat(subtotal?.amount) || 0,
          currency: subtotal?.currencyCode || 'EUR',
          num_items: numItems || 0,
        });
      }
    } catch {
      // Tracking-Fehler ignorieren.
    }
    // First-Party (qpx-Receiver): schließt das initiate_checkout-Leck der
    // First-Party-Funnel-Messung (Job 20260723-commerce-microfunnel). Eigener
    // try/catch/no-op via qpxTrack — unabhängig vom Meta-Pixel, blockt nie.
    qpxTrack(
      'initiate_checkout',
      buildInitiateCheckoutEvent({subtotal, numItems, contentIds}),
    );
  };

  return (
    <Form
      action="/cart/attribution"
      className="cartSummaryWrapper"
      method="post"
      onSubmit={trackInitiateCheckout}
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
