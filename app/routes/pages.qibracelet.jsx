import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {
  QiBraceletShop,
  QIBRACELET_PRODUCT_QUERY,
} from '~/components/product-pages/QiBraceletShop';
import {withEuLabel} from '~/components/EuGewaehrleistungsLabel';

/*
 * Campaign-PDP /pages/qibracelet — LP-Shopseite des LP-Blocks
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Schema = /pages/qione-2-pro: 1:1-PDP-Nachbau + Bullet-Updates).
 *
 * CONTENT-SWAP AN STABILER URL: die bisherige Detail-LP (detailseiten/
 * QiBracelet) lebt unter /pages/qibracelet-details weiter (oeffentlicher
 * Block, indexierbar); diese URL hier ist ab jetzt die kaufbereite
 * Fortsetzung der Paid-Strecke. Die organische PDP /products/qibracelet
 * bleibt die SEO-Seite (kanonisch, unangetastet).
 *
 * HANDLE-KOLLISION: Diese statische Code-Route schlaegt pages.$handle UND
 * das Shopify-Admin-Page-Objekt "qibracelet" (Code-Route gewinnt im Router).
 */

/*
 * noindex, nofollow (D-006): Campaign-Seite gehoert NICHT in den Index.
 * Doppelgate Meta-robots + X-Robots-Tag; BEWUSST KEIN canonical
 * (noindex + fremdes canonical = widerspruechliche Signale).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiBracelet\u00AE \u2014 jetzt sichern | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: QUERY-KOPIE (Drift-Guard-gesichert) mit hartem Handle "qibracelet",
 * getSelectedProductOptions(request) (Deep-Links SSR-korrekt), CacheShort().
 * BEWUSST KEIN redirectIfHandleIsLocalized (qione-2-pro-Praezedenz: harter
 * Handle, keine lokalisierten Code-Routen).
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {product} = await context.storefront.query(QIBRACELET_PRODUCT_QUERY, {
    variables: {
      handle: 'qibracelet',
      selectedOptions: getSelectedProductOptions(request),
    },
    cache: context.storefront.CacheShort(),
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

/*
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): ViewContent feuert
 * aus <Analytics.ProductView> in QiBraceletShop (exakt der PDP-Payload);
 * AddToCart als Cart-Event routen-unabhaengig; R1/R2/R3 im root-Layout.
 */
function QiBraceletShopRoute() {
  const {product} = useLoaderData();
  return <QiBraceletShop product={product} />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */

/*
 * EU-Gewährleistungslabel: Overlay + Trigger hängen an DIESER Route,
 * nicht am globalen Seitengerüst (Elina EL-20260901-3fb38a2a).
 */
export default withEuLabel(QiBraceletShopRoute);
