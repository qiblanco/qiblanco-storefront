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
import {ANGEBOT_HINWEIS, istBegrenztesAngebot} from '~/lib/angebot-limit';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';

/*
 * HEUTIGE SEITE der zwei Angebote /products/pjdz538hgs0 und /products/8kendiw34hd
 * (s13-r3): wörtliche Kopie von StandardProduct, PRODUCT_QUERY und
 * loadCriticalData aus routes/products.$handle.jsx (Stand origin/main 12391d0a),
 * damit die eigenen Routen der Angebote ohne Schalter dieselbe Seite rendern
 * wie heute. Route-Module importieren nie aus anderen Route-Modulen (Server-
 * Exporte im Client-Bundle), deshalb die Kopie. Ändert sich die Sammelroute,
 * gilt diese Kopie für die zwei Angebote weiter, bis der Schalter an ist.
 */

/** Kritische Daten wie loadCriticalData der Sammelroute (Preis frisch, 404 ohne Produkt). */
export async function ladeHeutigeSeite({context, params, request}, handle = params.handle) {
  const {storefront} = context;
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      // PREIS FRISCH, nicht streichen (siehe routes/products.$handle.jsx).
      cache: storefront.CacheShort(),
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);
  if (!product?.id) {
    throw new Response(null, {status: 404});
  }
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, marktLand: storefront.i18n.country};
}

export function StandardProduct({product}) {
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
        <SterneSprung className="product-rating mt-2"><span style={{color: 'var(--color-accent-ink)'}}>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        <div className="ProductDescription" data-section="pdp-description" dangerouslySetInnerHTML={{__html: fremdHtmlMitBildAuszeichnung(descriptionHtml)}} />

        <p className='mt-2'><b>Mehr als 14.000+ aktive Nutzer</b></p>

        <div data-section="pdp-buybox">
          <ProductPrice
            handle={product.handle}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            unterKaufknopf={
              istBegrenztesAngebot(product.handle) ? (
                <p className="mt-2">{ANGEBOT_HINWEIS}</p>
              ) : null
            }
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
