import {useLoaderData} from 'react-router';
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
import { useState } from 'react';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {QiBracelet} from '~/components/product-pages/QiBracelet';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {Video360Button} from '~/components/reusables/Video360Viewer';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import igStyles from '~/styles/ig-testimonials.css?url';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import pdpQiStyles from '~/styles/pdp-qi.css?url';
/*
 * ZWEI route-gebundene Stylesheets — zwei Gründe, keines ersetzt das andere.
 *
 * MERGE-NOTIZ (2026-09-12): dieser Block war ein echter Konflikt. PR #376
 * (IG-Testimonial-Slideshow) und PR #377 (Token-Schicht pdp-qi) haben
 * unabhängig voneinander je einen links()-Export an genau diese Stelle
 * geschrieben; aufgelöst wird additiv.
 *
 * - ig-testimonials.css (PR #376): Slideshow-Fläche, steht auf vier
 *   Kaufseiten. Setzt ihre Token bewusst auf `.qb-igt` statt auf `:root` —
 *   ein Route-Stylesheet mit :root-Token wäre auf jeder anderen Route
 *   undefiniert, und `var(--x)` ohne Rückfall kippt dort still in Vererbung.
 * - pdp-qi.css (PR #377): Token-Schicht genau der zwei Flaggschiff-
 *   Kaufseiten (Score 59 -> 84 bzw. 56 -> 83), innen zusätzlich auf `main`
 *   gescoped. Jeder ihrer Selektoren trifft hier gemessen (h2,
 *   .NormalSectionSize, .snap-start, .HeroBannerAlt, main img) — der
 *   Entfall-Grund von zweifel-beleg.css oben ("Stylesheet für eine Klasse,
 *   die es hier nicht mehr gibt") spricht also nicht gegen diese Zeile,
 *   sondern verlangt genau diese Prüfung.
 *
 * REIHENFOLGE IST TRAGEND: pdp-qi.css steht HINTER ig-testimonials.css.
 * Beide sind ungelayert; bei gleicher Spezifität gewinnt die später
 * geladene. pdp-qi.css setzt den EINEN H2-Stil dieser Seite und braucht
 * deshalb die letzte Stimme — die Slideshow-Überschrift ist genau der Fall,
 * den Commit 765faef schon einmal auf die H2-Regel der Gastgeber-Seite
 * zurückgeholt hat.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: igStyles},
    {rel: 'stylesheet', href: pdpQiStyles},
  ];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    pfad: '/products/qibracelet',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // VideoObject je Instagram-Beitrag MIT Video. Ein Knoten auf einem Eintrag
  // OHNE Video wäre eine Luege, und ein Knoten ohne Pflichtfeld (name,
  // thumbnailUrl, uploadDate) steht dauerhaft als Fehler in der Search
  // Console — beides faellt in ig-video-schema.js baulich aus.
  const videos = igVideoDescriptor({
    produkt: 'QiBracelet',
    pfad: '/products/qibracelet',
    produktTitel: data?.product?.title,
  });
  return videos ? [...basis, videos] : basis;
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'qibracelet'); // ✅ pass hardcoded handle

  return { ...deferredData, ...criticalData };
}

/**
 * Load critical data (above-the-fold content)
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({ context, request }, handle) {
  const { storefront } = context;

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle, // ✅ use the static handle
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle, data: product });

  return { product };
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({ context, params }) {
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

  const [featuredImage, setFeaturedImage] = useState(product?.images.nodes[0]);
  const {title, descriptionHtml} = product;

  return (
    <>
    <div className="product-360-hero">
      <div className="product-360-hero__text">
        <h2>QiBracelet®</h2>
        <h3>Entwickelt für Superhumans</h3>
        <p>
          Deine leistungsstarke Unterstützung – edel und dezent.
          <br />
          Passend für jede Situation und jeden Style.
        </p>
      </div>
      <div className="product-360-hero__video">
        <ImgixVideo videoPath="new-360-QiBracelet-1x1.mov" fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/JjGdCuv.webp?v=1747927956" />
      </div>
    </div>
    {/* id="product" = Anker-Ziel der "#product"-CTAs im QiBracelet-Content
        darunter (war toter Anker; linkwatch anker-Prüfebene wacht darüber). */}
    <div className="product" id="product">
      <div className="ProductImages">
          <div className="ProductImageWrapperSticky">

        <ProductImage image={featuredImage} />
        <ProductImageList images={product?.images} onSelectImage={(image) => setFeaturedImage(image)} />
      </div>
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        <SterneSprung className="product-rating"><span>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        <div className="ProductDescription" dangerouslySetInnerHTML={{__html: descriptionHtml}} />

        <p className='mt-2'><b>Mehr als 14.000+ aktive Nutzer</b></p>

        <ProductPrice
          handle={product.handle}
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          /* Elina EL-20260909-8c4001d1: die Mitteilung hängt auf dieser
             Kaufflaeche IN der Nutzen-Liste darunter. Hier abgeschaltet --
             sonst stuende sie zweimal auf der Seite. Der Default bleibt
             true; jede Flaeche OHNE eigene Nutzen-Liste behaelt sie an
             dieser Stelle (Begründung in ProductForm.jsx). */
          gewaehrleistungsHinweis={false}
        />
        <BenefitList />
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
      {/*
        DIE INSTAGRAM-STIMMEN — WEIT OBEN: unmittelbar nach dem Kaufblock
        (Bilder, Preis, Varianten, Kaufknopf) und VOR dem langen Inhaltsteil.
        Das ist die Stelle, an der der Zweifel vor dem Kauf entsteht.

        BEWUSST OHNE dataSection: diese PDP führt heute kein einziges
        data-section. Das erste würde den Design-Rubrik-Collector auf genau
        eine Sektion einengen (Watch-Regression) — dieselbe Begründung, mit
        der products.qione-2-pro.jsx seine Anker-frei-Regel führt.
      */}
      <IgTestimonialSlideshow produkt="QiBracelet" />
      <QiBracelet /> 
    {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
        Live-Reputon + Überschrift + Anker für den 4,8-Banner-Klick. */}
    <GoogleRezensionenBereich />
    </>
  );
}

function BenefitList() {
  return (
    <div className="BenefitList">
      <ul>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.23em"
            height="1em"
            viewBox="0 0 1728 1408"
          >
            <path
              fill="currentColor"
              d="M576 1152q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M192 640h384V384H418q-13 0-22 9L201 588q-9 9-9 22zm1280 512q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M1728 64v1024q0 15-4 26.5t-13.5 18.5t-16.5 11.5t-23.5 6t-22.5 2t-25.5 0t-22.5-.5q0 106-75 181t-181 75t-181-75t-75-181H704q0 106-75 181t-181 75t-181-75t-75-181h-64q-3 0-22.5.5t-25.5 0t-22.5-2t-23.5-6t-16.5-11.5T4 1114.5T0 1088q0-26 19-45t45-19V704q0-8-.5-35t0-38t2.5-34.5t6.5-37t14-30.5t22.5-30l198-198q19-19 50.5-32t58.5-13h160V64q0-26 19-45t45-19h1024q26 0 45 19t19 45"
            ></path>
          </svg>
          <b>Kostenloser Versand</b> innerhalb Deutschlands
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z"
            ></path>
          </svg>
          In 2-3 Tagen bei Dir
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.15em"
            height="1em"
            viewBox="0 0 2048 1792"
          >
            <path
              fill="currentColor"
              d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"
            ></path>
          </svg>
          100% Versicherter Versand
        </li>
        {/* Elina EL-20260909-8c4001d1: die Pflichtmitteilung ist hier der
            4. Punkt DERSELBEN Liste -- nicht mehr ein eigener Block unter
            dem Kauf-Knopf. Bestellt war "exakt gleiches Design": Abstand,
            Schrift und Icon-Hoehe sind deshalb GEERBT (eine <li> in dieser
            <ul>), nicht nachgebaut. Nachgebaute Zahlen sehen am Tag des Baus
            gleich aus und laufen danach still auseinander.
            Bauform + Begründung stehen EINMAL in EuGewaehrleistungsLabel.jsx
            (EuGewaehrleistungsListenpunkt), damit alle Kaufflaechen sie
            teilen. Der Default in ProductForm ist oben abgeschaltet; ohne das
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
