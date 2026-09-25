import {redirect} from '@shopify/remix-oxygen';
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {istFremderRahmen} from '~/lib/einbettungs-weiche.server';
import {bindeQiMasterAddons} from '~/lib/qi-master-addons.server';

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
  // EINBETTUNGS-WEICHE (Job 20260924-partnerlink-setzt-code-automatisch-und-
  // permalink-einbettungsfest-prio12): in einem fremden Rahmen führt die
  // Weiterleitung unten auf checkout.qiblanco.com (X-Frame-Options DENY) zu
  // ERR_BLOCKED_BY_RESPONSE — genau Christians Bildschirmfoto vom 24.09.
  // Dort legt der Permalink deshalb KEINEN Warenkorb an und leitet nicht
  // weiter; die Seite rendert durch, und app/entry.server.jsx antwortet mit
  // der einbettbaren Weiter-Seite (app/lib/einbettungs-weiche.server.js). Sie
  // öffnet DENSELBEN Link im eigenen Fenster; erst dort entsteht der Warenkorb.
  // WARUM KEIN `return new Response(...)` HIER: diese Route hat eine
  // Komponente; React Router rendert eine Nicht-Weiterleitungs-Antwort eines
  // Loaders als Seite und verwirft ihren Rumpf (lokal gemessen: leere Seite).
  if (istFremderRahmen(request)) return null;

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
  // Job 20260907-fbc-klick-id-... (s02): hier stand `hasMarketingConsent ? ... : []`
  // für die GESAMTE Attributsliste — ein Direkt-zur-Kasse-Link ohne Consent
  // erzeugte einen Cart ganz ohne Attribute, und die Order war spaeter nicht
  // von einem Cart-Bypass zu unterscheiden. Herkunfts-Marker jetzt IMMER,
  // personenbezogene Attribute weiterhin NUR mit Consent.
  const attributionAttributes = [
    ...getOriginCartAttributes(request),
    ...(hasMarketingConsent ? getAttributionCartAttributes(request) : []),
  ];

  // create a cart
  const angelegt = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
    ...(attributionAttributes.length
      ? {attributes: attributionAttributes}
      : {}),
  });

  // Qi-Master-Add-ons hängen am Qi Master — auch über den Permalink: ein
  // /cart/<Wunschnummer>:2 ohne Qi Master führte bis 2026-09-25 direkt zur
  // Kasse (Job 20260925-qm-addon-bindung-greift-nur-bei-attribut).
  const result = angelegt?.errors?.length
    ? angelegt
    : await bindeQiMasterAddons({cart, action: 'LinesAdd', result: angelegt});

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = cart.setCartId(cartResult.id);

  // Hat die Bindung alles entfernt (nur Add-ons, kein Qi Master), gibt es
  // nichts zu bezahlen: zum Warenkorb statt in eine leere Kasse.
  if (result !== angelegt && cartResult.totalQuantity === 0) {
    return redirect('/cart', {headers});
  }

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
