import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {
  QiHomeAirShop,
  QIHOME_AIR_PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirShop';

/*
 * Campaign-PDP /pages/qihome — LP-Shopseite des LP-Blocks
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Schema = /pages/qione-2-pro: 1:1-PDP-Nachbau + Bullet-Updates).
 *
 * CONTENT-SWAP AN STABILER URL: die bisherige Detail-LP (detailseiten/
 * QiHomeLanding) lebt unter /pages/qihome-details weiter (oeffentlicher
 * Block, indexierbar); diese URL hier ist ab jetzt die kaufbereite
 * Fortsetzung der Paid-Strecke. Die organische PDP /products/qihome-air
 * bleibt die SEO-Seite (kanonisch, unangetastet).
 *
 * HANDLE-KOLLISION: Diese statische Code-Route schlaegt pages.$handle UND
 * das Shopify-Admin-Page-Objekt "qihome" (Code-Route gewinnt im Router).
 */

/*
 * noindex, nofollow (D-006): Campaign-Seite gehoert NICHT in den Index.
 * Doppelgate Meta-robots + X-Robots-Tag; BEWUSST KEIN canonical
 * (noindex + fremdes canonical = widerspruechliche Signale).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiHome\u00AE Air \u2014 jetzt sichern | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: QUERY-KOPIE (Drift-Guard-gesichert) mit hartem Handle "qihome-air",
 * getSelectedProductOptions(request) (Deep-Links SSR-korrekt), CacheShort().
 * BEWUSST KEIN redirectIfHandleIsLocalized (qione-2-pro-Praezedenz: harter
 * Handle, keine lokalisierten Code-Routen).
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {product} = await context.storefront.query(QIHOME_AIR_PRODUCT_QUERY, {
    variables: {
      handle: 'qihome-air',
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
 * aus <Analytics.ProductView> in QiHomeAirShop (exakt der PDP-Payload);
 * AddToCart als Cart-Event routen-unabhaengig; R1/R2/R3 im root-Layout.
 */
export default function QiHomeAirShopRoute() {
  const {product} = useLoaderData();
  return <QiHomeAirShop product={product} />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
