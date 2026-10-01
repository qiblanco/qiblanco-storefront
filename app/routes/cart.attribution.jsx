import {redirect} from 'react-router';
import {geschenkAusFormular, geschenkCartAttributes} from '~/lib/geschenk';
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {mergeCartAttributes} from '~/lib/checkout-tracking';
import {
  bewertungsanfrageAusFormular,
  bewertungsanfrageCartAttributes,
} from '~/lib/bewertungsanfrage';

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
  // Parameter-Wert; `adParamsSeenMarker` lässt ohnehin nur 'yes'/'no' durch.
  // Faellt das Feld aus (JavaScript aus, Tracker geblockt), bleibt es null und
  // der Marker faellt auf Query/Referer/Cookie bzw. auf 'unknown' zurück —
  // nie auf 'no'.
  //
  // Ein Request-Body ist nur EINMAL lesbar: das Formular wird hier einmal
  // gelesen und an alle drei Leser weitergegeben (Ankunfts-Marker,
  // Geschenk-Angabe, Einwilligung in die Bewertungsanfrage).
  const form = await formularLesen(request);
  const clientMarker = adMarkerAusFormular(form);
  const geschenk = geschenkAusFormular(form);


  // Job 20260907-fbc-klick-id-... (s02): der gesamte Block stand unter
  // `if (hasAttributionConsent(request, env)) { ... }` — ohne Consent wurde am
  // Kassen-Knopf KEIN einziges Attribut gesetzt, auch nicht der Herkunfts-Marker.
  // Jetzt: Herkunfts-Marker IMMER, personenbezogene Attribute NUR mit Consent.
  const cartAttributes = [
    // Geschenk-Angabe: eine Auskunft des Kunden, kein Tracking, darum
    // außerhalb des Consent-Zweigs. Leer, wenn nicht gefragt oder unverändert.
    ...geschenkCartAttributes(geschenk, {
      bestehendeAttribute: cartResult.attributes,
    }),
    ...getOriginCartAttributes(request, {
      clientMarker,
      bestehendeAttribute: cartResult.attributes,
    }),
    ...(hasAttributionConsent(request, env)
      ? getAttributionCartAttributes(request)
      : []),
    // Einwilligung in die Bewertungsanfrage (E1): eine Erklärung des Kunden,
    // kein Tracking, darum außerhalb des Consent-Zweigs. Leer, wenn die Frage
    // nicht gestellt wurde oder sich die Antwort nicht geändert hat.
    ...bewertungsanfrageCartAttributes(bewertungsanfrageAusFormular(form), {
      bestehendeAttribute: cartResult.attributes,
    }),
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
 * Liest das Kasse-Formular. Wirft NIE: ein Request ohne lesbaren Body ist kein
 * Grund, den Weg zur Kasse zu stoeren — das Tracking darf den Checkout nie
 * blockieren (dieselbe Regel wie in CartSummary.jsx).
 *
 * @param {Request} request
 * @returns {Promise<FormData | null>}
 */
async function formularLesen(request) {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

/**
 * Das versteckte Ankunfts-Feld des Kasse-Formulars.
 *
 * @param {FormData | null} form
 * @returns {string | null}
 */
function adMarkerAusFormular(form) {
  const wert = form?.get('ad_params_seen');
  return typeof wert === 'string' ? wert : null;
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

/** @typedef {import('react-router').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
