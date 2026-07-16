import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOne2ProShop} from '~/components/product-pages/QiOne2ProShop';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';
import shopStyles from '~/styles/qione-2-pro-shop.css?url';

/*
 * Campaign-PDP /pages/qione-2-pro — kaufbereite Fortsetzung der Paid-Strecke
 * (Ad → LP → Campaign-PDP). Erste Campaign-PDP; Prototyp für Lean-PM
 * (ein Produkt, referenziert statt dupliziert — Konzept „Shopseite nach LP"
 * 2026-07-16). Die organische PDP /products/qione-2-pro bleibt die SEO-Seite.
 *
 * HANDLE-KOLLISION: Die statische Code-Route `pages.qione-2-pro.jsx` schlägt
 * `pages.$handle` UND ein etwaiges Shopify-Admin-Page-Objekt mit demselben
 * Handle (Code-Route gewinnt im Router). Deshalb bewusst KEIN Admin-Page-Objekt
 * „qione-2-pro" anlegen (Sitemap-/noindex-Falle, Konzept Kap. 4).
 *
 * Style: geteilte Token-Quelle — dieselbe schlaf-zellen-schutz.css wie LP A
 * (Scent-Harmonie per Konstruktion) + Wrapper `lp-vp lp-a3` (im Component) +
 * additives Shop-Scoped-CSS (.lp-a3 .shopq) in qione-2-pro-shop.css.
 */

export function links() {
  return [
    {rel: 'stylesheet', href: lpAStyles},
    {rel: 'stylesheet', href: shopStyles},
  ];
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
export default function QiOne2ProShopRoute() {
  const {product} = useLoaderData();
  return <QiOne2ProShop product={product} />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
