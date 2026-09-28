import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {
  QiHomeAirSeite,
  qiHomeAirSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirSeite';
import {QiHomeHeroBullets} from '~/components/product-pages/QiHomeHeroBullets';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import {BLOCK_LP} from '~/components/reusables/blockLinks';

/*
 * Campaign-PDP /pages/qihome-air — LP-Shopseite des LP-Blocks
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Schema = /pages/qione-2-pro: 1:1-PDP-Nachbau + Bullet-Updates).
 *
 * Christian-Praezisierung im GO 2026-07-17: die LP-Shopseite traegt "Air"
 * -> /pages/qihome-air (NICHT /pages/qihome). Die bisherige Detail-LP
 * (detailseiten/QiHomeLanding) lebt unter /pages/qihome-details weiter
 * (oeffentlicher Block, indexierbar); /pages/qihome selbst ist Code-301
 * dorthin (eigene Route). Die organische PDP /products/qihome-air bleibt
 * die SEO-Seite (kanonisch, unangetastet).
 */

/*
 * GLEICH DER PRODUKTSEITE BIS AUF DIE BESCHREIBUNG (Christian 28.09.2026):
 * diese Route rendert QiHomeAirSeite.jsx, dieselbe Komponente wie
 * /products/qihome-air (samt Wrapper .ProductQiHomeAir und Token-Schicht),
 * mit derselben PRODUCT_QUERY (die Kopie in QiHomeAirShop.jsx ist entfallen).
 * Eigen bleiben hier: noindex-Doppelgate ohne canonical, der harte Handle,
 * die Hero-Punkte als Beschreibung, der LP-Block und der Marker
 * data-qi-shop="qihome-pages".
 */
export function links() {
  return qiHomeAirSeiteLinks();
}

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
 * Loader: dieselbe PRODUCT_QUERY wie /products/qihome-air (aus der Seitenkomponente,
 * seit 28.09.2026 keine Kopie mehr), harter Handle "qihome-air",
 * getSelectedProductOptions(request) (Deep-Links SSR-korrekt), CacheShort().
 * BEWUSST KEIN redirectIfHandleIsLocalized (qione-2-pro-Praezedenz: harter
 * Handle, keine lokalisierten Code-Routen).
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const [{product}, vergleichsPreise] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: 'qihome-air',
        selectedOptions: getSelectedProductOptions(request),
      },
      cache: context.storefront.CacheShort(),
    }),
    // Preise der drei Geräte für den Gerätevergleich (seit dem 28.09.2026 auch
    // hier, dieselbe Seite wie /products). Fail-soft; null = Vergleich aus.
    ladeVergleichsPreise(context.storefront),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product, ...(vergleichsPreise ? {vergleichsPreise} : {})};
}

/*
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): ViewContent feuert
 * aus <Analytics.ProductView> in QiHomeAirSeite (exakt der PDP-Payload);
 * AddToCart als Cart-Event routen-unabhaengig; R1/R2/R3 im root-Layout.
 */
export default function QiHomeAirSeiteRoute() {
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiHomeAirSeite
      product={product}
      vergleichsPreise={vergleichsPreise}
      beschreibung={<QiHomeHeroBullets />}
      block={BLOCK_LP}
      shopMarker="qihome-pages"
    />
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
