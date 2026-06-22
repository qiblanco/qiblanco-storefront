import {getCartLineGrossDisplayTotal} from '~/lib/cart-display-pricing';
import {appendTrackingToCheckoutUrl} from '~/lib/checkout-tracking';

const ATTRIBUTION_STORAGE_KEY = 'qiblanco_checkout_attribution';

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

  const handleCheckoutClick = (event) => {
    const trackedCheckoutUrl = getClientTrackedCheckoutUrl(checkoutUrl);
    if (trackedCheckoutUrl) event.currentTarget.href = trackedCheckoutUrl;
  };

  return (
    <div className="cartSummaryWrapper">
      <a
        className="btn--primary"
        href={checkoutUrl}
        onClick={handleCheckoutClick}
        target="_self"
      >
        <p>Jetzt sicher zur Kasse</p>
      </a>
    </div>
  );
}

function getClientTrackedCheckoutUrl(checkoutUrl) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return checkoutUrl;
  }

  if (!hasMarketingConsent()) return checkoutUrl;

  return appendTrackingToCheckoutUrl(checkoutUrl, {
    searchParams: getStoredAndCurrentTrackingParams(),
    cookieHeader: document.cookie,
    includeCookies: true,
  });
}

function hasMarketingConsent() {
  return Boolean(window.Cookiebot?.consent?.marketing);
}

function getStoredAndCurrentTrackingParams() {
  const params = new URLSearchParams(readStoredTrackingParams());

  for (const [name, value] of new URLSearchParams(window.location.search)) {
    params.set(name, value);
  }

  return params;
}

function readStoredTrackingParams() {
  try {
    const saved = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed?.params) ? parsed.params : [];
  } catch {
    return [];
  }
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
