import {redirect} from '@shopify/remix-oxygen';
import {
  getAttributionCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';

/**
 * Automatically creates a new cart based on the URL and redirects straight to checkout.
 * Expected URL structure:
 * ```js
 * /cart/<variant_id>:<quantity>
 *
 * ```
 *
 * More than one `<variant_id>:<quantity>` separated by a comma, can be supplied in the URL, for
 * carts with more than one product variant.
 *
 * @example
 * Example path creating a cart with two product variants, different quantities, and a discount code in the querystring:
 * ```js
 * /cart/41007289663544:1,41007289696312:2?discount=HYDROBOARD
 *
 * ```
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context, params}) {
  const {cart, env} = context;
  const {lines} = params;
  if (!lines) return redirect('/cart');
  const linesMap = lines.split(',').map((line) => {
    const lineDetails = line.split(':');
    const variantId = lineDetails[0];
    const quantity = parseInt(lineDetails[1], 10);

    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity,
    };
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const discount = searchParams.get('discount');
  const discountArray = discount ? [discount] : [];
  const hasMarketingConsent = hasAttributionConsent(request, env);
  const attributionAttributes = hasMarketingConsent
    ? getAttributionCartAttributes(request)
    : [];

  // create a cart
  const result = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
    ...(attributionAttributes.length
      ? {attributes: attributionAttributes}
      : {}),
  });

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = cart.setCartId(cartResult.id);

  // redirect to checkout
  if (cartResult.checkoutUrl) {
    const trackedCheckoutUrl = hasMarketingConsent
      ? getTrackedCheckoutUrl(cartResult.checkoutUrl, request, env)
      : cartResult.checkoutUrl;

    return redirect(trackedCheckoutUrl, {headers});
  } else {
    throw new Error('No checkout URL found');
  }
}

export default function Component() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
