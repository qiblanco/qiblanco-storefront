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
import { QiHome } from '~/components/product-pages/QiHome';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {Video360Button} from '~/components/reusables/Video360Viewer';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import qihomeAirStyles from '~/styles/qihome-air.css?url';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {Einsatzkarte} from '~/components/product-pages/Einsatzkarte';
import einsatzkarteStyles from '~/styles/qihome-einsatzkarte.css?url';
// DATENSPARSAM AN DER GRENZE: benannte Importe statt des ganzen Artefakts.
// Der Baustein braucht genau diese zwei Felder; `seed`/`verteilung` sagen etwas
// über den Datensatz und haben im Browser nichts zu suchen. Vite gibt JSON
// benannte Exporte, unbenutzte fallen im Produktionsbau weg -- am gebauten
// Bundle nachgemessen (s04), nicht angenommen.
//
// QUELLENWECHSEL 2026-09-19 (Job 20260919-karte-479-punkte-und-text-ohne-
// entschuldigung): bis hierher stand `~/data/qihome-einsatzkarte.json`, und die
// Datei wurde woechentlich aus Kauf- und Kundendaten abgeleitet (kunden-db).
// Christian hat die Karte auf 479 GERECHNETE, einwohnergewichtete Punkte
// umgestellt -- kein Punkt darf ein echter Standort sein. Die neue Datei
// entsteht in homepage-bauer/bin/qihome-karte-punkte und liest keine Bestellung.
import {
  km_pro_einheit as einsatzkarteKmProEinheit,
  punkte as einsatzkartePunkte,
} from '~/data/qihome-karte-punkte.json';
/**
 * Token-Schicht dieser Kaufseite (Design-Score 59 -> >= 80, Job
 * 20260910-designschuld-...-s04). Sie hängt NUR hier und trägt
 * deshalb auf keiner anderen Seite - app.css bleibt unangetastet. Der Scope
 * ist die Klasse `ProductQiHomeAir` am Wrapper unten; der Kaufweg (Preis,
 * Varianten, Warenkorb-Knopf) wird von der Datei nicht berührt.
 * Rückweg: diesen links()-Export und den Wrapper entfernen.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: qihomeAirStyles},
    // Scope-CSS der Einsatzkarte (Grossjob 20260914-qihome-einsatzkarte, s04).
    // Eigene Datei, Scope `.qh-karte`: eine Seite ohne diese Klasse sieht von
    // ihr baulich nichts.
    {rel: 'stylesheet', href: einsatzkarteStyles},
  ];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qihome-air',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // KEIN VideoObject mehr auf dieser Seite (Christian 2026-09-19, Job
  // 20260919-qihome-air-karte-statt-instagram-christian-hat-entschieden):
  // die Instagram-Fläche ist von dieser Route gestrichen. Ein VideoObject
  // auf einer Seite ohne das Video wäre gegenüber der Suchmaschine eine
  // Lüge — dieselbe Regel, die ig-video-schema.js für Einträge ohne
  // Video setzt, gilt für eine Route ohne Fläche.
  return basis;
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'qihome-air'); // ✅ pass hardcoded handle

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

  return (
    <div className="ProductQiHomeAir">
    <div className="product-360-hero">
      <div className="product-360-hero__text">
        <h2>QiHome® Air</h2>
        <p>
          Fördere die Gesundheit deines Zuhauses,
          <br />
          schaffe ein produktives Zuhause.
        </p>
      </div>
      <div className="product-360-hero__video">
        <ImgixVideo videoPath="360-QiHome-1x1.mov" fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/3d-animation-qi-home-preview.webp?v=1740224642" />
      </div>
    </div>
    {/* id="product" = Anker-Ziel der "#product"-CTAs im QiHome-Content
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
        <div className="ProductDescription" dangerouslySetInnerHTML={{__html: fremdHtmlMitBildAuszeichnung(descriptionHtml)}} />

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
        DIE QIHOME-EINSATZKARTE — HIER, unmittelbar nach dem Kaufblock und VOR
        dem langen Produkttext ("QiHome® Air – Die Zukunft für ein
        intelligentes Raumklima").

        Bis zum 2026-09-19 stand an dieser Stelle die Instagram-Fläche
        (<IgTestimonialSlideshow produkt="QiHome" ueberschrift="QiHome® Air auf
        Instagram" />) und die Karte war das letzte Element der Route, direkt
        oberhalb des Footers. Christian, 19.09.2026: der Instagram-Abschnitt
        kommt weg, "und dort sollte doch die Karte dann ersatzweise stehen".
        Die Fläche ist deshalb ersatzlos gestrichen — samt Überschrift,
        Videoeinbettung, Stylesheet und VideoObject-Auszeichnung in meta() —
        und die Karte ist VERSCHOBEN, nicht neu gebaut: Punkte, Verteilung,
        Text und Gestaltung sind unverändert (Grossjob 20260914-qihome-
        einsatzkarte, Zahl und Wortlaut Job 20260919-karte-zahl-im-text-wird-
        ueber-450).

        Die drei QiHome-Beiträge bleiben im Korpus (app/data/ig-testimonials.js)
        und in der Komponente; QiOne 2 Pro, QiBracelet und Kakao hängen daran
        und bewegen sich nicht. Kommt die Fläche hierher zurück, ist das eine
        neue Ansage von Christian, kein Rückbau.

        `daten` sind BEREITS projizierte SVG-Punkte aus dem Erzeuger; diese
        Route rechnet nichts und reicht nur durch. Die Zahl in der Überschrift
        ist Christians Wortlaut in der Komponente und wird hier NICHT
        mitgegeben. Rückweg: VITE_EINSATZKARTE=off lässt den Baustein `null`
        rendern und die Seite bleibt vollständig.

        BEWUSST OHNE zweites data-section: die Karte trägt ihres in der
        Komponente (qihome-einsatzkarte); ein weiteres würde den
        Design-Rubrik-Collector einengen — dieselbe Begründung wie auf
        products.qibracelet.jsx und products.qione-2-pro.jsx.
      */}
      <Einsatzkarte
        daten={{
          km_pro_einheit: einsatzkarteKmProEinheit,
          punkte: einsatzkartePunkte,
        }}
      />
      <QiHome /> 
    {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
        Live-Reputon + Überschrift + Anker für den 4,8-Banner-Klick. */}
    <GoogleRezensionenBereich />
    </div>
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
