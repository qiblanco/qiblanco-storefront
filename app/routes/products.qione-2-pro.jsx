import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {
  QiOne2ProSeite,
  qiOne2ProSeiteLinks,
} from '~/components/product-pages/QiOne2ProSeite';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
/*
 * ZWEIFEL-BELEG IST HIER ENTFALLEN (2026-09-08, Elina EL-20260908-d8349a01).
 *
 * Hier hing zweifel-beleg.css als route-gebundenes Stylesheet, weil diese
 * Seite den <ZweifelBeleg> trug. Der ist entfallen -- sein Stylesheet lädt
 * diese Route deshalb NICHT mehr. Die Datei selbst BLEIBT: /cart trägt seine
 * eigene Zweifel-Zeile und lädt sie über sein eigenes links().
 *
 * Das links() unten kam am 2026-09-11 zurück, aber für eine ANDERE Datei
 * (ig-testimonials.css) -- der alte Satz "kein links()-Export mehr" stand hier
 * bis dahin woertlich und wäre ab dieser Zeile eine falsche Selbstauskunft.
 * Seit dem 28.09.2026 steht die Liste samt Begründung in QiOne2ProSeite.jsx,
 * weil /pages/qione-2-pro dieselbe Seite rendert und dieselben Dateien braucht.
 */
export function links() {
  return qiOne2ProSeiteLinks();
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qione-2-pro',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // VideoObject je Instagram-Beitrag MIT Video (43 von 44 Kacheln dieser
  // Seite — CYHc4RClQLb ist ein Bild-Post und bekommt deshalb keinen Knoten).
  // Der Descriptor ist null, wenn es nichts zu sagen gibt; dann wird bewusst
  // nichts angehängt statt ein leerer Container ausgeliefert.
  const videos = igVideoDescriptor({
    produkt: 'QiOne 2 Pro',
    pfad: '/products/qione-2-pro',
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
  const criticalData = await loadCriticalData(args, 'qione-2-pro'); // ✅ pass hardcoded handle

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data (above-the-fold content)
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const {storefront} = context;

  const [{product}, vergleichsPreise] = await Promise.all([
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
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

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
function loadDeferredData({context, params}) {
  return {};
}

/*
 * Der Seiteninhalt lebt seit dem 28.09.2026 in QiOne2ProSeite.jsx und ist
 * derselbe wie auf /pages/qione-2-pro. Diese Route gibt allein den
 * Beschreibungstext oben am Produkt hinein.
 */
export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiOne2ProSeite
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
