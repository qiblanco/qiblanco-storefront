import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOne2ProShop} from '~/components/product-pages/QiOne2ProShop';
import shopStyles from '~/styles/qione-2-pro-shop.css?url';
import {withEuLabel} from '~/components/EuGewaehrleistungsLabel';

/*
 * Campaign-PDP /pages/qione-2-pro — kaufbereite Fortsetzung der Paid-Strecke
 * (Ad → LP → Campaign-PDP). Erste Campaign-PDP; Prototyp für Lean-PM
 * (ein Produkt, referenziert statt dupliziert). Die organische PDP
 * /products/qione-2-pro bleibt die SEO-Seite.
 *
 * SEIT 2026-07-16 IM SHOP-DESIGN (Job qione-shopniveau-design-qa): das
 * Styling kommt aus den globalen Shop-Stylesheets (root.jsx: app.css +
 * redesign-3themen.css) — identisch zur organischen PDP; die frühere
 * LP-A-Kopplung (schlaf-zellen-schutz.css) ist aufgehoben. Diese Route lädt
 * nur noch das schmale Campaign-Delta-CSS (Scope .shopq2).
 *
 * HANDLE-KOLLISION: Die statische Code-Route `pages.qione-2-pro.jsx` schlägt
 * `pages.$handle` UND ein etwaiges Shopify-Admin-Page-Objekt mit demselben
 * Handle (Code-Route gewinnt im Router). Deshalb bewusst KEIN Admin-Page-Objekt
 * „qione-2-pro" anlegen (Sitemap-/noindex-Falle, Konzept Kap. 4).
 */

export function links() {
  return [{rel: 'stylesheet', href: shopStyles}];
}

/*
 * noindex, nofollow (D-006): Campaign-Seite gehört NICHT in den Index, aber
 * darf über Traffic bekannt werden. Doppelgate Meta-robots + X-Robots-Tag
 * (Gurt + Hosenträger, greift auch wenn ein Bot den head nicht parst).
 * BEWUSST KEIN canonical: noindex + fremdes canonical = widersprüchliche
 * Signale (Müller). robots.txt bleibt unangetastet (Disallow würde Bots am
 * noindex-Lesen hindern).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiOne® 2 Pro — jetzt sichern | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: geteilte PRODUCT_QUERY (Query-SSoT — Ware auf beiden Routen identisch
 * dargestellt), Handle hart „qione-2-pro", getSelectedProductOptions(request)
 * (Deep-Links SSR-korrekt vorausgewählt), CacheShort().
 *
 * BEWUSST KEIN redirectIfHandleIsLocalized: der Helper würde bei einem
 * lokalisierten Handle auf /pages/<lokalisiert> umleiten — dieser Pfad
 * existiert als Code-Route NICHT und liefe in eine 404-Falle. Die organische
 * PDP /products/qione-2-pro trägt den Localize-Redirect; hier ist der Handle
 * hart, es gibt nichts zu lokalisieren.
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
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): der ViewContent-Event
 * feuert aus <Analytics.ProductView> in der geteilten QiOneBuyBox (exakt der
 * PDP-Payload → ViewContent-Parität); AddToCart feuert automatisch als
 * Cart-Event (routen-unabhängig). R1/R2/R3 hängen im root-Layout. Ein
 * zusätzlicher fbq/gtag/MetaPixel hier wäre Doppelzählung.
 */
function QiOne2ProShopRoute() {
  const {product} = useLoaderData();
  return <QiOne2ProShop product={product} />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */

/*
 * EU-Gewährleistungslabel: Overlay + Trigger hängen an DIESER Route,
 * nicht am globalen Seitengerüst (Elina EL-20260901-3fb38a2a).
 */
export default withEuLabel(QiOne2ProShopRoute);
