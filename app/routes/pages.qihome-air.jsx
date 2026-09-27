import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {
  QiHomeAirShop,
  QIHOME_AIR_PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirShop';
import qihomeAirStyles from '~/styles/qihome-air.css?url';

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
 * Token-Schicht der Kaufseite /products/qihome-air (qihome-air.css), hier an
 * der LP-Fassung derselben Ware: beide Routen rendern dieselben Bausteine,
 * nur diese hier lud die Schicht nie (Design-Score 71 gegen 97, Job
 * 20260927-designschuld-lp-shopseiten-qibracelet-qihome-air-prio35). Scope
 * ist der Wrapper `.ProductQiHomeAir` in der Default-Komponente unten; Kopf/Fuss/Warenkorb
 * bleiben unberuehrt. Rueckweg: links()-Export, Import und Wrapper entfernen.
 */
export function links() {
  return [{rel: 'stylesheet', href: qihomeAirStyles}];
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
  // Scope der Token-Schicht qihome-air.css (links() oben) — derselbe Wrapper
  // wie auf /products/qihome-air, hier an der Route statt in QiHomeAirShop.
  return (
    <div className="ProductQiHomeAir">
      <QiHomeAirShop product={product} />
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
