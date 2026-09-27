import {redirect} from 'react-router';
import {rabattlinkZiel} from '~/lib/discount-ziel';

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 *
 * @example
 * Example path applying a discount and optional redirecting (defaults to the home page)
 * ```js
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context, params}) {
  const {cart} = context;
  const {code} = params;

  // Nur Pfade auf der eigenen Herkunft; Begründung in lib/discount-ziel.js.
  const redirectUrl = rabattlinkZiel(request.url);

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  const headers = cart.setCartId(result.cart.id);

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
