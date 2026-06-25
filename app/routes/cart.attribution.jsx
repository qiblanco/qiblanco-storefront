import {redirect} from '@shopify/remix-oxygen';
import {
  getAttributionCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {mergeCartAttributes} from '~/lib/checkout-tracking';

/**
 * Saves click IDs on the cart before sending the customer to Shopify Checkout.
 *
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;
  const cartResult = await cart.get();

  if (!cartResult?.checkoutUrl) return redirect('/cart');

  let checkoutCart = cartResult;

  if (hasAttributionConsent(request)) {
    const attributionAttributes = getAttributionCartAttributes(request);
    const {attributes, changed} = mergeCartAttributes(
      cartResult.attributes,
      attributionAttributes,
    );

    if (changed) {
      const updatedResult = await cart.updateAttributes(attributes);
      checkoutCart = updatedResult?.cart ?? cartResult;
    }
  }

  const headers = checkoutCart?.id ? cart.setCartId(checkoutCart.id) : undefined;
  const checkoutUrl = getTrackedCheckoutUrl(
    checkoutCart.checkoutUrl ?? cartResult.checkoutUrl,
    request,
  );

  return redirect(checkoutUrl, {headers});
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader() {
  return redirect('/cart');
}

export default function CartAttribution() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
