import {
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useState} from 'react';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductImageList} from '~/components/ProductImageList';
import {QiHome} from '~/components/product-pages/QiHome';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {QiHomeHeroBullets} from '~/components/product-pages/QiHomeHeroBullets';

/*
 * QiHomeAirShop — Campaign-PDP-Komponente fuer die LP-Shopseite
 * /pages/qihome (IA-Umbau Zwei-Block-Struktur, Job
 * 20260717-storefront-ia-zweiblock-umbau; Schema = /pages/qione-2-pro).
 *
 * SHOP-NIVEAU PER KONSTRUKTION: 1:1-Replikat des Render-Bodys der organischen
 * PDP /products/qihome-air (product-360-hero + .product-Block + geteilter
 * <QiHome/>-Content darunter) mit denselben geteilten Bausteinen
 * (ProductImage/ProductImageList/ProductPrice/ProductForm). Die PDP-Route
 * selbst wird NICHT angefasst (deploy-Allowlist, chirurgisch) — deshalb
 * traegt dieses Modul eine QUERY-KOPIE; der Zweiblock-Leak-Guard prueft
 * Byte-Gleichheit gegen products.qihome-air.jsx (Drift-Guard statt
 * lib-Extraktion).
 *
 * EINZIGES Content-Delta: der Beschreibungs-Block kommt ENTKOPPELT aus
 * QiHomeHeroBullets (Bullet-Updates der Paid-Strecke) statt aus dem
 * geteilten Shopify-Feld descriptionHtml — /products rendert descriptionHtml
 * unveraendert weiter (D-046-Muster).
 *
 * TRACKING (0-Pixel-Regel D-006): Analytics.ProductView mit exakt dem
 * PDP-Payload (ViewContent-Paritaet); AddToCart feuert als Cart-Event
 * routen-unabhaengig; R1/R2/R3 haengen im root-Layout. KEIN fbq/gtag hier.
 *
 * Marker data-qi-shop="qihome-pages" (Testbarkeit, unsichtbar).
 */
export function QiHomeAirShop({product}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const [featuredImage, setFeaturedImage] = useState(product?.images.nodes[0]);
  const {title} = product;

  return (
    <>
    <div className="product-360-hero">
      <div className="product-360-hero__text">
        <h2>{'QiHome\u00AE Air'}</h2>
        <p>
          {'F\u00F6rdere die Gesundheit deines Zuhauses,'}
          <br />
          {'schaffe ein produktives Zuhause.'}
        </p>
      </div>
      <div className="product-360-hero__video">
        <ImgixVideo videoPath="360-QiHome-1x1.mov" fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/3d-animation-qi-home-preview.webp?v=1740224642" />
      </div>
    </div>
    <div className="product" data-qi-shop="qihome-pages">
      <div className="ProductImages">
          <div className="ProductImageWrapperSticky">

        <ProductImage image={featuredImage} />
        <ProductImageList images={product?.images} onSelectImage={(image) => setFeaturedImage(image)} />
      </div>
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        <div className="product-rating"><span>4.8</span>{' \u2605\u2605\u2605\u2605\u2605 '}<span>{'\u00DCber 14.000 Nutzer'}</span></div>
        <QiHomeHeroBullets />

        <p className='mt-2'><b>Mehr als 14.000+ aktive Nutzer</b></p>

        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
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
      <QiHome />
    </>
  );
}

/*
 * BenefitList — 1:1-Kopie aus products.qihome-air.jsx (dort lokale Funktion,
 * nicht exportiert; Route bleibt unangefasst).
 */
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
              d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"
            ></path>
          </svg>
          100% Versicherter Versand
        </li>
      </ul>
    </div>
  );
}

/*
 * QUERY-KOPIE aus app/routes/products.qihome-air.jsx (SSoT-Aufloesung s.o.):
 * byte-identisch halten — der Zweiblock-Leak-Guard prueft das maschinell
 * (Drift = ROT). Ware auf beiden Routen identisch dargestellt.
 */
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

export const QIHOME_AIR_PRODUCT_QUERY = `#graphql
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
