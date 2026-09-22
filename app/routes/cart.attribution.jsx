import {redirect} from '@shopify/remix-oxygen';
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
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
  const {cart, env} = context;
  const cartResult = await cart.get();

  if (!cartResult?.checkoutUrl) return redirect('/cart');

  let checkoutCart = cartResult;

  // Der Kasse-Knopf ist der EINZIGE Cart-Eintrittspunkt mit einem Formular —
  // und damit der einzige, an dem der Browser seine consent-freie Ja/Nein-
  // Antwort mitschicken kann, ob auf der Landeseite ueberhaupt Ad-Parameter
  // ankamen (CartSummary.jsx, Quelle ist der sessionStorage-Puffer, den der
  // Tracker seit jeher VOR der Zustimmung fuellt). Es reist ein Wort, nie ein
  // Parameter-Wert; `adParamsSeenMarker` laesst ohnehin nur 'yes'/'no' durch.
  // Faellt das Feld aus (JavaScript aus, Tracker geblockt), bleibt es null und
  // der Marker faellt auf Query/Referer/Cookie bzw. auf 'unknown' zurueck —
  // nie auf 'no'.
  const clientMarker = await adMarkerAusFormular(request);


  // Job 20260907-fbc-klick-id-... (s02): der gesamte Block stand unter
  // `if (hasAttributionConsent(request, env)) { ... }` — ohne Consent wurde am
  // Kassen-Knopf KEIN einziges Attribut gesetzt, auch nicht der Herkunfts-Marker.
  // Jetzt: Herkunfts-Marker IMMER, personenbezogene Attribute NUR mit Consent.
  const cartAttributes = [
    ...getOriginCartAttributes(request, {
      clientMarker,
      bestehendeAttribute: cartResult.attributes,
    }),
    ...(hasAttributionConsent(request, env)
      ? getAttributionCartAttributes(request)
      : []),
  ];
  const {attributes, changed} = mergeCartAttributes(
    cartResult.attributes,
    cartAttributes,
  );

  if (changed) {
    const updatedResult = await cart.updateAttributes(attributes);
    checkoutCart = updatedResult?.cart ?? cartResult;
  }

  const headers = checkoutCart?.id ? cart.setCartId(checkoutCart.id) : undefined;
  const checkoutUrl = getTrackedCheckoutUrl(
    checkoutCart.checkoutUrl ?? cartResult.checkoutUrl,
    request,
    env,
  );

  return redirect(checkoutUrl, {headers});
}

/**
 * Liest das versteckte Feld des Kasse-Formulars. Wirft NIE: ein Request ohne
 * lesbaren Body ist kein Grund, den Weg zur Kasse zu stoeren — das Tracking
 * darf den Checkout nie blockieren (dieselbe Regel wie in CartSummary.jsx).
 *
 * @param {Request} request
 * @returns {Promise<string | null>}
 */
async function adMarkerAusFormular(request) {
  try {
    const form = await request.formData();
    const wert = form.get('ad_params_seen');
    return typeof wert === 'string' ? wert : null;
  } catch {
    return null;
  }
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
