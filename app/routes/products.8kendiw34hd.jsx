import {useLoaderData} from 'react-router';
import {MARKE} from '~/lib/produkt-seo';
import {noindexMeta} from '~/lib/seo';
import tenYearsDealStyles from '~/styles/ten-years-deal-page.css?url';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {konfiguratorAn, ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {
  ladeHeutigeSeite,
  StandardProduct,
} from '~/components/product-pages/AngebotHeutigeSeite';
import {AngebotKonfigurator} from '~/components/product-pages/AngebotKonfigurator';
import * as ALPHA_DATEN from '~/components/product-pages/8kendiw34hd-alpha-daten';

/*
 * ANGEBOT /products/8kendiw34hd (2× QiOne® 2 Pro), Ziel verschickter Angebotslinks.
 * Eigene Route seit s13-r3 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
 * qione-qihome-qibracelet-ab, Christian Zx 29.10.2026). Ohne Schalter
 * KONFIGURATOR_8KENDIW34HD (Default aus) rendert sie die heutige Seite der
 * Sammelroute products.$handle.jsx (Kopie in AngebotHeutigeSeite.jsx), mit
 * Schalter das Apple-Gerüst (AngebotKonfigurator, Daten 8kendiw34hd-alpha-daten.js).
 * Beide Fassungen bleiben noindex (lib/seo.js NICHT_INDEXIERBARE_PRODUKTE).
 * Rückweg: Schalter aus, dann die heutige Seite.
 */
export function links() {
  return [{rel: 'stylesheet', href: tenYearsDealStyles}];
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.product?.title ?? ''} | ${MARKE}`},
  noindexMeta(),
];

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  if (konfiguratorAn(args.context.env, '8kendiw34hd')) {
    return ladeProduktSeite(args, {
      handle: '8kendiw34hd',
      query: PRODUCT_QUERY,
      daten: ALPHA_DATEN,
      konfigurator: true,
    });
  }
  return ladeHeutigeSeite(args, '8kendiw34hd');
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, konfigurator, ketten} = useLoaderData();
  if (konfigurator) {
    return <AngebotKonfigurator product={product} ketten={ketten} daten={ALPHA_DATEN} />;
  }
  return <StandardProduct product={product} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
