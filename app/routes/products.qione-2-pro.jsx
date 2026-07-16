import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox, QiOneBenefitList} from '~/components/product-pages/QiOneBuyBox';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `${data?.product.title ?? ''} | Qi Blanco UG (haftungsbeschränkt)`},
    {
      rel: 'canonical',
      href: `/products/qione-2-pro`,
    },
  ];
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

  const {descriptionHtml} = product;
  // Buy-Box-Struktur (Bilder + Preis + Varianten + ATC + Analytics) lebt jetzt
  // geteilt in QiOneBuyBox (Query-SSoT-Bau T1). Die organische PDP übergibt
  // ihren UNVERÄNDERTEN Bestand als Slots — DOM bleibt byte-identisch:
  // Social-Proof-Zeile (4.8★/„Über 14.000 Nutzer"), descriptionHtml,
  // „Mehr als 14.000+"-Absatz, Bestseller-Label, geteilte BenefitList.
  return (
    <>
      <QiOneBuyBox
        product={product}
        socialProof={
          <div className="product-rating">
            <span>4.8</span> ★★★★★ <span>Über 14.000 Nutzer</span>
          </div>
        }
        description={
          <div
            className="ProductDescription"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        }
        topBadge={
          <p className="mt-2">
            <b>Mehr als 14.000+ aktive Nutzer</b>
          </p>
        }
        priceLabel={<div className="BestsellerLabel">Bestseller Angebot</div>}
        benefitList={<QiOneBenefitList />}
      />
      <QiOne2Pro />
    </>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
