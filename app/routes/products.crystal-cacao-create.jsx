import {useLoaderData} from 'react-router';
import {KAKAO_KENNZAHLEN} from '~/lib/kakao-zone';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {CacaoProductForm} from '~/components/CacaoProductForm';
import {CacaoPriceDisplay} from '~/components/CacaoPriceDisplay';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useState} from 'react';
import Create from '~/components/product-pages/Create';
import LazyImage from '~/components/reusables/LazyImage';

import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    pfad: '/products/crystal-cacao-create',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'crystal-cacao-create'); // ✅ pass hardcoded handle

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data (above-the-fold content)
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const {storefront} = context;

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle, // ✅ use the static handle
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({context, params}) {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

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
  const [featuredImage, setFeaturedImage] = useState(product?.images.nodes[0]);
  const [quantity, setQuantity] = useState('3');
  return (
    <>
      <div className="flex flex-col gap-5 items-center-justify-center text-center max-w-[750px] mx-auto! my-[5vh]! p-2">
        <div className="max-w-[500px] m-center">
          <LazyImage highQualityLink="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Create_Schriftzug_1.png?v=1766481502"
          compressedLink="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Create_Schriftzug_1_small.png?v=1766481502" />
        </div>
        <h2 className="kk-h2 kk-h2--hero">Wach. Klar. Fokussiert.</h2>
        <h3 className="kk-lead">High Performance Cacao</h3>
      </div>
      <div className="product">
        <div className="ProductImages">
          <div className="ProductImageWrapperSticky">
          <ProductImage image={featuredImage} />
          <ProductImageList
            images={product?.images}
            onSelectImage={(image) => setFeaturedImage(image)}
          />
          </div>
        </div>
        <div className="product-main">
          <h1>{title}</h1>
          {/*
            * MERGE 2026-08-30 (Job 20260830-sterne-s05-...): VEREINIGUNG, kein
            * Seiten-Sieg. Von diesem Zweig kommt die Bedienbarkeit (SterneSprung
            * + StarRating + Marker), von origin/main (a75fd47) kommen die
            * KENNZAHLEN. Der Zweig trug hier noch hartkodiert 4.8 und "14.000
            * Nutzer" — das ist der Stand VOR jener Aenderung. Wer beim
            * Aufloesen "ours" nimmt, dreht eine juengere, bewusste
            * Inhalts-Entscheidung an einer KUNDENSICHTBAREN ZAHL zurück.
            * Die Sterne-Zahl wird aus derselben Konstante ABGELEITET statt
            * daneben geschrieben, damit sie nicht erneut auseinanderlaufen kann.
            */}
          <SterneSprung className="product-rating">
            <span>{KAKAO_KENNZAHLEN.bewertung}</span>{' '}
            <StarRating
              value={Number(KAKAO_KENNZAHLEN.bewertung.replace(',', '.'))}
            />{' '}
            <span>Über {KAKAO_KENNZAHLEN.nutzer} Nutzer</span>
          </SterneSprung>
          <div
            className="ProductDescription"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />

          <p className="mt-2">
            <b>Mehr als {KAKAO_KENNZAHLEN.nutzer}+ aktive Nutzer</b>
          </p>

          <CacaoPriceDisplay
            quantity={quantity}
            selectedVariant={selectedVariant}
            handle={product.handle}
          />

          <CacaoProductForm
            selectedVariant={selectedVariant}
            handle={product.handle}
            quantity={quantity}
            onQuantityChange={setQuantity}
            /* Elina EL-20260909-8c4001d1: die Mitteilung hängt auf dieser
               Kaufflaeche IN der Nutzen-Liste darunter. Hier abgeschaltet --
               sonst stuende sie zweimal auf der Seite. */
            gewaehrleistungsHinweis={false}
          />
          <CacaoBenefitList />
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
      <Create />
    </>
  );
}

function CacaoBenefitList() {
  return (
    <div className="CacaoBenefitList">
      <ul>
        <li>✅ Kostenloser Versand ab 99 € innerhalb Deutschlands</li>
        <li>🚚 In 1-3 Tagen bei Dir</li>
        <li>🔄 100 % Geld-zurück-Garantie bei Unzufriedenheit</li>
        <li>🔬 Laboranalytisch geprüft (Dartsch Institut)</li>
        <li>🌿 Bio-zertifiziert nach DE-ÖKO-006</li>
        {/* Elina EL-20260909-8c4001d1: die Pflichtmitteilung ist hier der
            SECHSTE Punkt derselben Liste, nicht mehr ein Block unter dem
            Kauf-Knopf. Bestellt war "Abstand/Icon-Groesse/Schrift/Hover
            identisch zu den anderen 5 Zeilen dieser Liste" -- alle vier
            Werte sind deshalb GEERBT: der Abstand aus `.CacaoBenefitList ul
            { gap: 0.6rem }`, Schrift und Zeilenhoehe aus
            `.CacaoBenefitList li`, die Zeichen-Hoehe aus der `1em`-Regel
            daneben (app.css). Nachgebaute Zahlen laufen still auseinander.
            Der Default in CacaoProductForm ist oben abgeschaltet; ohne das
            stuende die Mitteilung zweimal auf der Seite. */}
        <EuGewaehrleistungsListenpunkt />
      </ul>
    </div>
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
