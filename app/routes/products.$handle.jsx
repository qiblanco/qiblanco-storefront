import {useLoaderData} from 'react-router';
import {redirect} from '@shopify/remix-oxygen';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {TenYearsDealPage} from '~/components/campaign/TenYearsDealPage';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {
  getTenYearsDealByHandle,
  TEN_YEARS_SALE_RETIRED,
} from '~/data/ten-years-deals';
import tenYearsDealStyles from '~/styles/ten-years-deal-page.css?url';

import {
  canonicalLink,
  istNichtIndexierbaresProdukt,
  noindexMeta,
} from '~/lib/seo';
import {produktSchema} from '~/lib/produkt-schema';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsDealStyles}];
}
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  if (data?.campaignDeal) {
    return [
      {title: `${data.campaignDeal.displayTitle} - 10 Jahre Jubiläums Sale`},
      {name: 'robots', content: 'noindex,nofollow'},
    ];
  }

  // Test-, Dubletten- und reine Link-Ziel-Handles aus dem Index nehmen.
  // Die Liste steht in ~/lib/seo, weil die Sitemap-Route sie ebenfalls liest:
  // bis 2026-08-15 lagen hier und dort ZWEI Listen mit gleichem Inhalt, und
  // genau vor deren Auseinanderdriften warnt der Kommentar an der Liste.
  if (istNichtIndexierbaresProdukt(data?.product?.handle)) {
    return [
      {title: `${data.product.title ?? ''} | Qi Blanco UG (haftungsbeschränkt)`},
      noindexMeta(),
    ];
  }

  const descriptoren = [
    {title: `${data?.product.title ?? ''} | Qi Blanco UG (haftungsbeschränkt)`},
    canonicalLink(`/products/${data?.product.handle}`),
  ];

  // Snippet-Vorgabe. Gemessen am 2026-08-15 trug KEINE der 17 DACH-Produkt-
  // URLs eine meta description — Google reimt sich das Snippet dann aus dem
  // Seitentext zusammen, ausgerechnet auf den Umsatzseiten. Der Text kommt
  // aus dem in Shopify gepflegten Beschreibungsfeld: dieselbe Aussage, die
  // im Backend steht, ohne eine Wirkzusage dazuzuerfinden.
  const beschreibung = kuerzeBeschreibung(
    data?.product?.seo?.description || data?.product?.description,
  );
  if (beschreibung) {
    descriptoren.push({name: 'description', content: beschreibung});
    descriptoren.push({property: 'og:description', content: beschreibung});
  }

  // Produkt-Auszeichnung. Gemessen am 2026-08-15: 0 von 17 DACH-Produktseiten
  // trugen Product-Schema, während alle 6 US-Produktseiten es tragen. Ohne
  // sie kann Google Preis und Verfügbarkeit nicht als Rich Result zeigen.
  const schema = produktSchema(data?.product);
  if (schema) descriptoren.push({'script:ld+json': schema});

  return descriptoren;
};

/**
 * Shopify-`description` (Klartext, oft mehrere Absätze) auf Snippet-Länge
 * bringen. Google schneidet Snippets bei rund 160 Zeichen ab; wir schneiden
 * an der letzten Wortgrenze davor, damit kein Wort zerrissen wird. Fehlt die
 * Beschreibung, kommt `null` zurück — dann bleibt es beim bisherigen
 * Zustand statt bei einem leeren Tag.
 * @param {string|undefined} text
 * @returns {string|null}
 */
function kuerzeBeschreibung(text) {
  const roh = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!roh) return null;
  if (roh.length <= 160) return roh;
  const schnitt = roh.slice(0, 160);
  const grenze = schnitt.lastIndexOf(' ');
  return `${(grenze > 80 ? schnitt.slice(0, grenze) : schnitt).trim()}…`;
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const campaignDeal = getTenYearsDealByHandle(args.params.handle);

  if (campaignDeal) {
    /*
     * STILLGELEGTER JUBILÄUMS-SALE (Schalter: app/data/ten-years-deals.js).
     * Diese Deal-Handles rendern sonst die Aktionsseite mit den Sale-Preisen.
     * Stillgelegt liefern sie 404 — BEWUSST statt eines Durchfallens in die
     * normale Produkt-Query: die Handles tragen Sale-Titel („Sale: …",
     * „Black Friday Sale: …"), ein Durchfallen würde die Aktion also weiter
     * bewerben statt sie zu beenden. Der 301 auf die ebenfalls stillgelegte
     * Campaign-PDP entfällt damit gewollt mit. Das 404 erlaubt zugleich, dass
     * eine in Shopify gepflegte Weiterleitung greift (storefrontRedirect).
     */
    if (TEN_YEARS_SALE_RETIRED) {
      throw new Response(null, {status: 404});
    }
    // Deal-Handles kurzschließen die Produkt-Query -> nie 404 -> der
    // Shopify-URL-Redirect (storefrontRedirect, greift NUR bei 404) kann
    // für Alt-Handles NIE feuern. Trägt der Deal ein redirectTo, ist die
    // Alt-URL dauerhaft umgezogen: 301 mit Query-Erhalt (fbclid/gclid/UTM
    // überleben die Weiterleitung; Params aus redirectTo gewinnen).
    if (campaignDeal.redirectTo) {
      const incoming = new URL(args.request.url);
      const target = new URL(campaignDeal.redirectTo, incoming.origin);
      incoming.searchParams.forEach((value, key) => {
        if (!target.searchParams.has(key)) {
          target.searchParams.set(key, value);
        }
      });
      throw redirect(target.pathname + target.search, 301);
    }
    return {campaignDeal, product: null};
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData() {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}
/**
function RenderProductPage({product}) {
  if (product.title === "QiOne® 2 Pro") {
    return (
      <QiOne2Pro />
    )
  }
  return (
    <></>
  )
} */

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, campaignDeal} = useLoaderData();

  if (campaignDeal) {
    return <TenYearsDealPage deal={campaignDeal} />;
  }

  return <StandardProduct product={product} />;
}

function StandardProduct({product}) {
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <>
    {/* data-section-Anker: instrumentieren die Standard-PDP (products.$handle,
        z.B. /products/qione) wie Homepage/LPs für den qpx-Sektions-Tracker
        (behavior_section). Drei DISJUNKTE Zonen (kein Verschachteln — sonst
        zählt Dwell doppelt und Description-Klicks stanzen ein Loch in die
        Buybox): pdp-gallery (Bilder), pdp-description (Produkttext), pdp-buybox
        (Preis + Kauf/ATC). Reine Attribute bzw. EIN Wrapper-Div in normalem
        Blockfluss (.product-main ist kein Flex/Grid mit gap/>child) — kein
        Layout-Effekt. Erfasst beim HARD-LOAD (Ad-Traffic landet hart) analog
        zum bestehenden Tracker; SPA-navigierte PDPs bleiben ungemessen (Eigen-
        schaft des Trackers, s. RESULT). Job 20260723-commerce-microfunnel. */}
    <div className="product">
      <div className="ProductImages" data-section="pdp-gallery">
        <ProductImage image={selectedVariant?.image} />
        <ProductImageList images={product?.images} />
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        <div className="product-rating mt-2"><span>4.8</span> ★★★★★ <span>Über 14.000 Nutzer</span></div>
        <div className="ProductDescription" data-section="pdp-description" dangerouslySetInnerHTML={{__html: descriptionHtml}} />

        <p className='mt-2'><b>Mehr als 14.000+ aktive Nutzer</b></p>

        <div data-section="pdp-buybox">
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>

    {/* Google-Rezensionsbereich sitewide auf Produktseiten (Job
        20260731-google-rezensionen): auch die generischen PDPs tragen die
        echten Google-Bewertungen (Live-Reputon) + Anker für den
        4,8-Banner-Klick. Marken-Bewertung (Qi Blanco), daher produkt-
        unabhängig korrekt. */}
    <GoogleRezensionenBereich />
    </>
  );
}



const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
