import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOne2Pro2xShop} from '~/components/product-pages/QiOne2Pro2xShop';
import shopStyles from '~/styles/qione-2-pro-2x-shop.css?url';

/*
 * Campaign-PDP /pages/qione-2-pro-2x — die 2er-Set-Fortsetzung der Paid-Strecke
 * (Ad → LP → Campaign-PDP). Sie ersetzt das Preis-Klon-Produkt „Sale: 2x
 * QiOne® 2 Pro" (Handle jhsdhze783, draft/unlisted, Tag gorgias_do_not_recommend)
 * durch den referenzierenden Ansatz aus Konzept „Shopseite nach LP" (2026-07-16,
 * Kap. 5 Lean-Produkt-Management): EIN Produkt (qione-2-pro), referenziert statt
 * dupliziert; der Set-Preis entsteht über einen Automatic Discount am Warenkorb,
 * NICHT über ein zweites Produkt. Struktur 1:1 wie die Prototyp-Route
 * pages.qione-2-pro.jsx; einziger Delta ist die 2er-Set-Kauflogik in
 * QiOne2Pro2xShop (quantity=2). Die organische PDP /products/qione-2-pro bleibt
 * die SEO-Seite.
 *
 * HANDLE-KOLLISION: Die statische Code-Route `pages.qione-2-pro-2x.jsx` schlägt
 * `pages.$handle` UND ein etwaiges Shopify-Admin-Page-Objekt mit demselben
 * Handle (Code-Route gewinnt im Router). Deshalb bewusst KEIN Admin-Page-Objekt
 * „qione-2-pro-2x" anlegen (Sitemap-/noindex-Falle, Konzept Kap. 4).
 */

export function links() {
  return [{rel: 'stylesheet', href: shopStyles}];
}

/*
 * noindex, nofollow (D-006): Campaign-Seite gehört NICHT in den Index, darf aber
 * über Traffic bekannt werden. Doppelgate Meta-robots + X-Robots-Tag (Gurt +
 * Hosenträger). BEWUSST KEIN canonical (noindex + fremdes canonical =
 * widersprüchliche Signale). robots.txt bleibt unangetastet.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiOne® 2 Pro — 2er-Set sichern | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: geteilte PRODUCT_QUERY (Query-SSoT — Ware auf allen Routen identisch
 * dargestellt), Handle hart „qione-2-pro" (das EINE Produkt, NICHT das gelöschte
 * Klon-Produkt jhsdhze783), getSelectedProductOptions(request), CacheShort().
 *
 * BEWUSST KEIN redirectIfHandleIsLocalized: der Helper würde bei einem
 * lokalisierten Handle auf /pages/<lokalisiert> umleiten — dieser Pfad existiert
 * als Code-Route NICHT und liefe in eine 404-Falle. Die organische PDP
 * /products/qione-2-pro trägt den Localize-Redirect; hier ist der Handle hart.
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: 'qione-2-pro',
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
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): ViewContent feuert aus
 * <Analytics.ProductView> in der geteilten QiOneBuyBox (exakt der PDP-Payload);
 * AddToCart feuert automatisch als Cart-Event (routen-unabhängig, mit der echten
 * Set-Menge). R1/R2/R3 hängen im root-Layout. Ein zusätzlicher fbq/gtag hier
 * wäre Doppelzählung.
 */
export default function QiOne2Pro2xShopRoute() {
  const {product} = useLoaderData();
  return <QiOne2Pro2xShop product={product} />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
