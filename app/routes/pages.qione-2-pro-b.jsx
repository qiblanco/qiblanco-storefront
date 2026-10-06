import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {qiOne2ProSeiteLinks} from '~/components/product-pages/QiOne2ProSeite';
import {QiOne2ProRookie} from '~/components/rookie/shop/QiOne2ProRookie';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import rookieShopStyles from '~/styles/rookie-shop.css?url';

/*
 * ROOKIE /pages/qione-2-pro-b — Variante B der Shopseite /pages/qione-2-pro
 * (Experiment q2p-e1-gs080, Hypothese GS-080, 15 % der Besucher von A, sobald
 * die Weiche app/lib/experiment-weiche.server.js scharf ist; Grossjob
 * 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-startseite).
 *
 * Bis dahin ist die Seite DUNKEL: erreichbar, aber nirgends verlinkt und ohne
 * Verkehr. Diese Route enthaelt KEINE Weiche; die sitzt im Loader von A.
 *
 * Loader wie A (pages.qione-2-pro.jsx): geteilte PRODUCT_QUERY, harter Handle,
 * getSelectedProductOptions, CacheShort, Vergleichspreise fail-soft.
 * Kein Pixel-Code (0-Pixel-Regel, D-006): ViewContent aus der geteilten Buybox,
 * AddToCart als Cart-Ereignis, wie auf A.
 */
export function links() {
  return [...qiOne2ProSeiteLinks(), {rel: 'stylesheet', href: rookieShopStyles}];
}

/*
 * noindex, nofollow als Doppelgate wie A (D-006): Meta-robots + X-Robots-Tag.
 * KEIN canonical (noindex + fremdes canonical = widerspruechliche Signale).
 * Titel wie A: die Seite ist dieselbe Ware, und ein Besucher von B sieht im Tab
 * dasselbe wie einer von A.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiOne® 2 Pro — jetzt sichern | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/** @param {LoaderFunctionArgs} args */
export async function loader({context, request}) {
  const [{product}, vergleichsPreise] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: 'qione-2-pro',
        selectedOptions: getSelectedProductOptions(request),
      },
      cache: context.storefront.CacheShort(),
    }),
    ladeVergleichsPreise(context.storefront),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product, ...(vergleichsPreise ? {vergleichsPreise} : {})};
}

export default function QiOne2ProRookieRoute() {
  const {product, vergleichsPreise} = useLoaderData();
  return <QiOne2ProRookie product={product} vergleichsPreise={vergleichsPreise} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
