import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {
  QiBraceletSeite,
  qiBraceletSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiBraceletSeite';
import {QiBraceletHeroBullets} from '~/components/product-pages/QiBraceletHeroBullets';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import {BLOCK_LP} from '~/components/reusables/blockLinks';
import {appleSeiteLaden} from '~/lib/apple-seiten';
import {ladeAlphaKetten} from '~/components/product-pages/AlphaVorlage';
import {
  QiBraceletKampagneApple,
  QIBRACELET_ALPHA_DATEN,
} from '~/components/apple-seite/produkt-lp/QiBraceletKampagneApple';

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
 * GLEICH DER PRODUKTSEITE BIS AUF DIE BESCHREIBUNG (Christian 28.09.2026):
 * diese Route rendert QiBraceletSeite.jsx, dieselbe Komponente wie
 * /products/qibracelet, mit derselben PRODUCT_QUERY (die Kopie in
 * QiBraceletShop.jsx ist entfallen). Eigen bleiben hier: noindex-Doppelgate
 * ohne canonical, der harte Handle, die Hero-Punkte als Beschreibung, der
 * LP-Block und der Marker data-qi-shop="qibracelet-pages".
 */
export function links() {
  return qiBraceletSeiteLinks();
}

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
 * Loader: dieselbe PRODUCT_QUERY wie /products/qibracelet (aus der Seitenkomponente,
 * seit 28.09.2026 keine Kopie mehr), harter Handle "qibracelet",
 * getSelectedProductOptions(request) (Deep-Links SSR-korrekt), CacheShort().
 * BEWUSST KEIN redirectIfHandleIsLocalized (qione-2-pro-Praezedenz: harter
 * Handle, keine lokalisierten Code-Routen).
 *
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  // APPLE-FASSUNG (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-
  // ausser-seo-geo, s05): Schalter in app/lib/apple-seiten.js, Seite qibracelet.
  // An: derselbe Konfigurator wie /products/qibracelet (dazu die Ketten, fail-soft
  // wie dort). Aus: die heutige Seite (C) mit denselben Loaderdaten wie
  // vorher. Rückweg: Befehl zurück in homepage-bauer/bin/apple-seite, Seite qibracelet.
  const appleSeite = appleSeiteLaden(context, 'qibracelet');
  const [{product}, vergleichsPreise, ketten] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: 'qibracelet',
        selectedOptions: getSelectedProductOptions(request),
      },
      cache: context.storefront.CacheShort(),
    }),
    // Preise der drei Geräte für den Gerätevergleich (seit dem 28.09.2026 auch
    // hier, dieselbe Seite wie /products). Fail-soft; null = Vergleich aus.
    ladeVergleichsPreise(context.storefront),
    appleSeite?.an ? ladeAlphaKetten(context.storefront, QIBRACELET_ALPHA_DATEN) : null,
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
    ...(vergleichsPreise ? {vergleichsPreise} : {}),
    ...(appleSeite?.an ? {appleSeite, ...(ketten ? {ketten} : {})} : {}),
  };
}

/*
 * KEIN Pixel-Code in dieser Route (0-Pixel-Regel, D-006): ViewContent feuert
 * aus <Analytics.ProductView> in QiBraceletSeite (exakt der PDP-Payload);
 * AddToCart als Cart-Event routen-unabhaengig; R1/R2/R3 im root-Layout.
 */
export default function QiBraceletSeiteRoute() {
  const {product, vergleichsPreise, appleSeite, ketten} = useLoaderData();
  if (appleSeite?.an) {
    return (
      <QiBraceletKampagneApple
        seite="qibracelet"
        product={product}
        ketten={ketten}
        vergleichsPreise={vergleichsPreise}
      />
    );
  }
  return (
    <QiBraceletSeite
      product={product}
      vergleichsPreise={vergleichsPreise}
      beschreibung={<QiBraceletHeroBullets />}
      block={BLOCK_LP}
      shopMarker="qibracelet-pages"
    />
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
