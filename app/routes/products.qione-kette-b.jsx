import {useLoaderData} from 'react-router';
import {HeutigeSeite, PRODUCT_QUERY, links as heutigeLinks} from './products.qione-kette';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';

/*
 * C-FASSUNG DER KAUFSEITE /products/qione-kette (Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, s13, Muster s09-r2): die heutige Seite
 * mit den alten Texten, erreichbar, aber noindex (Meta + X-Robots-Tag) und
 * unverlinkt. Die Kanonische zeigt wie bei A auf /products/qione-kette.
 * Dieselbe Seite (HeutigeSeite), dieselben Stylesheets, dieselbe Abfrage.
 */
export function links() {
  return heutigeLinks();
}

function metaVonA({data}) {
  return produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js;
    // Kanonische auf A (pfad von A), wie products.qibracelet-b.jsx.
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qione-kette',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
}

/** @type {MetaFunction<typeof loader>} */
export const meta = (args) => [
  ...bMeta(metaVonA(args)),
  {name: 'robots', content: 'noindex,nofollow'},
];

export const headers = () => B_HEADERS;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  return ladeProduktSeite(args, {handle: 'qione-kette', query: PRODUCT_QUERY, konfigurator: false});
}

export default function ProductC() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();
  return <HeutigeSeite product={product} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
