import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  QiHomeAirSeite,
  qiHomeAirSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
/*
 * Die Stylesheets der Seite (samt Begründung und tragender Reihenfolge) stehen
 * seit dem 28.09.2026 in QiHomeAirSeite.jsx, weil /pages/qihome-air dieselbe Seite
 * rendert und dieselben Dateien braucht.
 */
export function links() {
  return qiHomeAirSeiteLinks();
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

  const [{ product }, vergleichsPreise] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle, // ✅ use the static handle
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Preise der drei Geräte für den Gerätevergleich, parallel zur Kaufbox
    // und aus demselben Variantenfeld (amazonstil-daten.js). Fail-soft;
    // null = Vergleich aus, dann fragt niemand.
    ladeVergleichsPreise(storefront),
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
    // Nur bei eingeschaltetem Vergleich: aus heißt auch ohne Schlüssel in
    // den Loaderdaten, die Seite ist dann byte-gleich zum Stand vor s04.
    ...(vergleichsPreise ? {vergleichsPreise} : {}),
  };
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({ context, params }) {
  return {};
}


/*
 * Der Seiteninhalt lebt seit dem 28.09.2026 in QiHomeAirSeite.jsx und ist derselbe
 * wie auf /pages/qihome-air. Diese Route gibt allein den Beschreibungstext oben
 * am Produkt hinein.
 */
export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiHomeAirSeite
      product={product}
      vergleichsPreise={vergleichsPreise}
      beschreibung={
        <div
          className="ProductDescription"
          dangerouslySetInnerHTML={{
            __html: fremdHtmlMitBildAuszeichnung(product.descriptionHtml),
          }}
        />
      }
    />
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
