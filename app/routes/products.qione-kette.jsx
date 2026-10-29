import {Link, useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { UpsellLineUp } from '~/components/UpsellLineUp';
import {ProductFAQ} from '~/components/ProductFAQ';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {FAQ_QIONE_KETTE} from '~/data/product-faqs';
import { useRef, useState } from 'react';
import { SingleImage } from '~/components/reusables/SingleImage';
import { CallToAction } from '~/components/index-components/CallToAction';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {Preisanker} from '~/components/reusables/Preisanker';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {kaufZuerstAttribute} from '~/components/product-pages/pdpKaufZuerst';
import kaufZuerstStyles from '~/styles/qb-pdp-kauf-zuerst.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import preisankerStyles from '~/styles/qb-preisanker.css?url';
import pdpKetteStyles from '~/styles/pdp-kette.css?url';
import medienRandStyles from '~/styles/qb-360-rand.css?url';
import {Kaufleiste} from '~/components/reusables/Kaufleiste';
import {konfiguratorAn, ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qione-kette-alpha-daten';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import alphaKetteStyles from '~/styles/alpha-kette.css?url';
/**
 * Kauf zuerst: Preis, Variante und Kaufknopf im ersten Fenster, der
 * Beschreibungstext darunter (components/product-pages/pdpKaufZuerst.js).
 * Diese Seite steht auf der Gewinnerschutz-Liste; der Schalter
 * PDP_KAUF_ZUERST ist ihr Umschaltplan (desktop/mobil je `false` = vorher).
 */
export function links() {
  return [
    {rel: 'stylesheet', href: kaufZuerstStyles},
    {rel: 'stylesheet', href: kaufleisteStyles},
    // Preisanker-Dreizeiler (Job 20261026-design-preisanker-google-
    // bewertungen-link-einheitlich-alle-produkte). Scope `.qb-preisanker`.
    {rel: 'stylesheet', href: preisankerStyles},
    // Ein H2-Stil, ein Akzent (Rubrik-Pflicht 95, Christian 27.10.2026).
    {rel: 'stylesheet', href: pdpKetteStyles},
    {rel: 'stylesheet', href: medienRandStyles},
  ];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qione-kette',
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

  // APPLE-STIL (s13, Christian Zx 29.10.2026): mit KONFIGURATOR_QIONE_KETTE=on
  // rendert die Seite das Gerüst der Qi-Alpha-Seite (AlphaVorlage). Default AUS
  // = die heutige Seite, Loaderdaten wie bisher. Die alte Seite bleibt als C
  // unter /products/qione-kette-b (noindex).
  if (konfiguratorAn(args.context.env, 'qione-kette')) {
    const daten = await ladeProduktSeite(args, {
      handle: 'qione-kette',
      query: PRODUCT_QUERY,
      daten: ALPHA_DATEN,
      konfigurator: true,
    });
    return {...deferredData, ...daten};
  }

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'qione-kette'); // ✅ pass hardcoded handle

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

  return {
    product,
    // Markt-Land für die Produkt-Auszeichnung: `meta()` hat keinen Kontext,
    // und der ausgezeichnete Preis muss derselbe sein wie der sichtbare
    // (AT 20 statt 19 %). Job 20260913-at-paketkarte-rechnet-19-prozent-
    // kasse-nimmt-20-prio8.
    marktLand: storefront.i18n.country,
  };
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({ context, params }) {
  return {};
}


export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, konfigurator} = useLoaderData();
  if (konfigurator) return <Konfigurator product={product} />;
  return <HeutigeSeite product={product} />;
}

/*
 * KONFIGURATOR (s13): Band, Kopf, Länge, Bezahlart, Zusammenfassung, Box und
 * die Slots. Die Stylesheets der Alpha laden nur mit Schalter (links() kennt
 * die Loaderdaten nicht): aus heißt dieselben <link>-Tags wie vorher.
 */
function Konfigurator({product}) {
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={alphaQiOneStyles} />
      <link rel="stylesheet" href={alphaKetteStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          wissen: (
            <AlphaWissen
              kapitel={ALPHA_DATEN.WISSEN.kapitel}
              studien={ALPHA_DATEN.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} />,
          // Derselbe Fragen-Baustein wie QiOne® 2 Pro, QiHome® Air und QiBracelet®.
          faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />,
        }}
      />
    </>
  );
}

/** Die heutige Seite (Schalter aus) und die C-Fassung /products/qione-kette-b. */
export function HeutigeSeite({product}) {

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
  const kaufbox = useRef(null);
  // Derselbe Preis für Kaufbox und Kaufleiste: EIN Objekt, zwei Anzeigen.
  const preis = {
    handle: product.handle,
    price: selectedVariant?.price,
    compareAtPrice: selectedVariant?.compareAtPrice,
  };

  return (
    <>
    <div className="product" {...kaufZuerstAttribute()} ref={kaufbox}>
      <div className="ProductImages">
          <div className="ProductImageWrapperSticky">

        <ProductImage image={featuredImage} />
        <ProductImageList images={product?.images} onSelectImage={(image) => setFeaturedImage(image)} />
      </div>
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        {/* Die Kette ist Zubehör, das Gerät hat seine eigene Kaufseite
            (Grossjob 20261006-GROSSJOB-seo-strategie-seiten-bewertung-crawl-
            kannibalisierung, s02). Für „qione 2 pro" stand diese Seite in der
            Search Console auf Position 4,0 und damit vor der Kaufseite (7,4).
            Der Link mit dem Produktnamen als Linktext, oben in der Textspalte,
            zeigt Google und dem Kunden, wo das Gerät steht. Kein Preis, kein
            Kaufknopf: Linkstil `withdrawal-text-link` aus app.css (Bestand,
            wie in InhaltswegNeuOderGebraucht.jsx), Schriftgröße geerbt. */}
        <p className="mt-2">
          Zubehör für den{' '}
          <Link className="withdrawal-text-link" to="/products/qione-2-pro">
            QiOne® 2 Pro
          </Link>
        </p>
        <div className="ProductDescription" dangerouslySetInnerHTML={{__html: fremdHtmlMitBildAuszeichnung(descriptionHtml)}} />

        {/* PREISANKER (Christian 26.10.2026: "das braucht es nun für qione 2
            pro, qi bracelet und necklace auch"): der Dreizeiler statt der
            kleinen Sterne-Zeile unter dem Titel und des Absatzes "Mehr als
            14.000+ aktive Nutzer", ohne Banner (reusables/Preisanker.jsx). */}
        <Preisanker preis={preis} banner={null} />
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
    {/* Klebende Kaufleiste mobil (reusables/Kaufleiste.jsx). Gewinnerseite
        (zielsteuerung/exports/gewinner-schutz.json): Umschaltplan ist der
        Schalter KAUFLEISTE_AN bzw. diese eine Zeile; ohne sie ist die Seite
        wieder die von vorher. Die Größe wählt der Kunde in der Kaufbox. */}
    <Kaufleiste
      kaufbox={kaufbox}
      preis={preis}
      selectedVariant={selectedVariant}
      productOptions={productOptions}
    />
    <CallToAction img={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476"} imgBreite={1024} imgHoehe={1024} imgAlt="QiOne® 2 Pro mit goldfarbenem Gitterchip® und eingeprägtem Qi-Blanco-Zeichen" link={"/products/qione-2-pro"} linkStyle={"secondary"} linkText={"Hol' dir jetzt deinen QiOne® 2 pro"} 
    text={<>
    <h2>Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren</h2>
    <p className='mt-2'><b>✅ 100% deutsche Produktion <br />
✅ Hochwertigste Materialien <br />
✅ Weltweiter Versand </b></p>
    </>}/>
    <UpsellLineUp />
    <ProductFAQ items={FAQ_QIONE_KETTE} />
    {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
        Live-Reputon + Überschrift + Anker für den 4,8-Banner-Klick. */}
    <GoogleRezensionenBereich />
    {/* Foto läuft oben weich in die Leinwand aus (qb-360-rand.css, Medien-Auslauf):
        sein Grund oben ist ein Grauverlauf 185–248, die Fläche darüber weiß. */}
    <SingleImage size={"fullscreen"} auslauf="oben" link={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_White.webp?v=1675209654"} alt="QiOne® 2 Pro an einer silbernen Kette auf hellem Stoff" />
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
          <b>Kostenloser Versand</b> ab 99&nbsp;€ innerhalb Deutschlands
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

export const PRODUCT_QUERY = `#graphql
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

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
