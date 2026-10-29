import {redirect} from 'react-router';
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {istFremderRahmen} from '~/lib/einbettungs-weiche.server';
import {bindeQiMasterAddons} from '~/lib/qi-master-addons.server';
import {begrenzeAngebot} from '~/lib/angebot-limit.server';
import {legeKakaoSetZeile} from '~/lib/kakao-set-zeile.server';
import {
  bindeRatenanteil,
  merkmaleAusQuery,
  mitRatenanteil,
  permalinkZeilen,
  rabattcodesAusQuery,
  TEILZAHLUNG,
  teil1Erlaubt,
} from '~/lib/qi-alpha-teilzahlung';

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

  const {cart, env, storefront} = context;
  const {lines} = params;
  if (!lines) return redirect('/cart');
  // Der Ratenanteil der geteilten Zahlung steht höchstens einmal und mit
  // Menge 1 im Warenkorb (lib/qi-alpha-teilzahlung.js, permalinkZeilen):
  // `/cart/<Ratenanteil>:2` legte bis zum 29.10.2026 20.000 € an.
  const linesMap = permalinkZeilen(
    lines.split(',').map((line) => {
      const lineDetails = line.split(':');
      const variantId = lineDetails[0];
      const quantity = parseInt(lineDetails[1], 10);

      return {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity,
      };
    }),
  );

  // Teil 1 der geteilten Zahlung nur im Markt DE/AT (lib/qi-alpha-
  // teilzahlung.js): anderswo kein Warenkorb, zurück zur Kaufseite.
  if (
    !teil1Erlaubt({
      varianten: linesMap.map((l) => l.merchandiseId),
      land: storefront?.i18n?.country,
    })
  ) {
    return redirect('/products/qi-alpha');
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  // Komma-Liste = mehrere Codes (Restzahlungs-Link der geteilten Zahlung:
  // Anrechnungscode plus kombinierbarer Partnercode). Ein Code bleibt einer.
  const discountArray = rabattcodesAusQuery(searchParams);
  // GETEILTE ZAHLUNG AM QI ALPHA (Grossjob 20261027-qi-alpha-geteilte-
  // zahlung-10000-raten-rest-sofort, s03): der Schritt-1-Link trägt die zwei
  // Vertrags-Merkmale _qa_vorgang/_qa_konfig; der Wächter liest sie aus
  // Bestellung 1. Nur diese zwei Schlüssel, nur in ihrer Form
  // (lib/qi-alpha-teilzahlung.js), und nur, wenn der Link den Ratenanteil
  // trägt. Der Partnercode kommt aus dem Warenkorb,
  // den der Kunde schon hat; gelesen wird nur, wenn ein Merkmal da ist.
  const mitTeilzahlung =
    mitRatenanteil(linesMap.map((l) => l.merchandiseId)) &&
    Boolean(
      searchParams.get(TEILZAHLUNG.merkmale.konfig) ||
        searchParams.get(TEILZAHLUNG.merkmale.vorgang),
    );
  let sitzungsCodes = [];
  if (mitTeilzahlung) {
    try {
      const bisher = await cart.get();
      sitzungsCodes = (bisher?.discountCodes || []).map((d) => d?.code);
    } catch {
      // Fail-soft: ohne lesbaren Warenkorb geht partner=- an den Wächter.
    }
  }
  const teilzahlungsMerkmale = mitTeilzahlung
    ? merkmaleAusQuery(searchParams, {sitzungsCodes})
    : [];
  const hasMarketingConsent = hasAttributionConsent(request, env);
  // Job 20260907-fbc-klick-id-... (s02): hier stand `hasMarketingConsent ? ... : []`
  // für die GESAMTE Attributsliste — ein Direkt-zur-Kasse-Link ohne Consent
  // erzeugte einen Cart ganz ohne Attribute, und die Order war spaeter nicht
  // von einem Cart-Bypass zu unterscheiden. Herkunfts-Marker jetzt IMMER,
  // personenbezogene Attribute weiterhin NUR mit Consent.
  const attributionAttributes = [
    ...getOriginCartAttributes(request),
    ...(hasMarketingConsent ? getAttributionCartAttributes(request) : []),
    ...teilzahlungsMerkmale,
  ];

  // create a cart
  const erstellt = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
    ...(attributionAttributes.length
      ? {attributes: attributionAttributes}
      : {}),
  });

  // In DE/AT zählt, was Shopify angelegt hat: permalinkZeilen oben erkennt
  // nur die Schreibweisen, die mitRatenanteil kennt. `/cart/6604_8336396556:3`
  // legte am 29.10.2026 trotzdem 30.000 € an (K3-Widerleger s02). Gelesen wird
  // nur, wenn eine Zeile der Ratenanteil sein kann (ratenanteilPruefen).
  // Außerhalb DE/AT greift die zweite Linie unten.
  const angelegt =
    erstellt?.errors?.length ||
    !TEILZAHLUNG.maerkte.includes(storefront?.i18n?.country)
      ? erstellt
      : await bindeRatenanteil({
          cart,
          action: 'LinesAdd',
          inputs: {lines: linesMap},
          result: erstellt,
          land: storefront?.i18n?.country,
        });

  // Qi-Master-Add-ons hängen am Qi Master — auch über den Permalink: ein
  // /cart/<Wunschnummer>:2 ohne Qi Master führte bis 2026-09-25 direkt zur
  // Kasse (Job 20260925-qm-addon-bindung-greift-nur-bei-attribut).
  // Das Einführungsangebot höchstens einmal — auch über den Permalink, der
  // direkt zur Kasse führt (/cart/<Angebot>:3).
  const begrenzt = angelegt?.errors?.length
    ? angelegt
    : await begrenzeAngebot({cart, action: 'LinesAdd', result: angelegt});
  const gebunden = begrenzt?.errors?.length
    ? begrenzt
    : await bindeQiMasterAddons({cart, action: 'LinesAdd', result: begrenzt});
  // Partner-Permalink mit 2/3 Packungen einer Kakao-Sorte: Set-Zeile, damit
  // der ?discount=-Code neben dem Staffelpreis greift (kakao-set-zeile.server.js).
  const result = gebunden?.errors?.length
    ? gebunden
    : await legeKakaoSetZeile({
        cart,
        storefront,
        env,
        action: 'LinesAdd',
        result: gebunden,
      });

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Zweite Linie der Teil-1-Sperre: außerhalb DE/AT zählt, was Shopify
  // angelegt hat, nicht wie der Link die Variante schreibt. Gesperrt wird ohne
  // Warenkorb-Cookie. Ein Lesefehler sperrt nicht: die erste Linie oben hat
  // den Link schon geprüft, und ein Partnerlink in CH bliebe sonst tot.
  if (!TEILZAHLUNG.maerkte.includes(storefront?.i18n?.country)) {
    let angelegteZeilen = null;
    try {
      // 250 = Seitenhöchstwert der Storefront-API; ohne Angabe liest
      // Hydrogen 100 Zeilen, und Zeile 101 bliebe ungesehen.
      angelegteZeilen = (
        await cart.get({cartId: cartResult.id, numCartLines: 250})
      )?.lines?.nodes;
    } catch {
      angelegteZeilen = null;
    }
    if (
      Array.isArray(angelegteZeilen) &&
      !teil1Erlaubt({
        varianten: angelegteZeilen.map((z) => z?.merchandise?.id),
        land: storefront?.i18n?.country,
      })
    ) {
      return redirect('/products/qi-alpha');
    }
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

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
