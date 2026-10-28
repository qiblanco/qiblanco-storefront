import {useLoaderData} from 'react-router';
import {
  QiHomeAirSeite,
  qiHomeAirSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';

/*
 * B-FASSUNG DER KAUFSEITE /products/qihome-air (Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, KONZEPT §4; Christian 27.10.2026
 * Z2: „die jetzigen A werden zu den B versionen und dnan im verlgeihc laufen
 * lassen“). Diese Route ist die HEUTIGE Seite mit den alten Texten, damit der
 * Test auch die Texte misst: dieselbe Ladefunktion wie A (lib/produkt-seite-
 * laden.server.js, ohne Konfigurator), dieselbe Seite, dieselben Stylesheets.
 * Unterschied zu A-ohne-Konfigurator nur: noindex (Meta + X-Robots-Tag); die
 * Kanonische zeigt wie bei A auf /products/qihome-air (produktMeta, pfad von A).
 * Erreicht wird sie über die Seiten-Weiche (konfig-qihome-air-e1) oder den Pin.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiHomeAirSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

function metaVonA({data}) {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qihome-air',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // KEIN VideoObject mehr auf dieser Seite (Christian 2026-09-19, Job
  // 20260919-qihome-air-karte-statt-instagram-christian-hat-entschieden):
  // die Instagram-Fläche ist von dieser Route gestrichen. Ein VideoObject
  // auf einer Seite ohne das Video wäre gegenüber der Suchmaschine eine
  // Lüge — dieselbe Regel, die ig-video-schema.js für Einträge ohne
  // Video setzt, gilt für eine Route ohne Fläche.
  return basis;
}

/** @type {MetaFunction<typeof loader>} */
export const meta = (args) => bMeta(metaVonA(args));

export const headers = () => B_HEADERS;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // KEINE Weiche hier: B lenkt nie um (sonst Schleife bei Eimer < Anteil).
  return ladeProduktSeite(args, {handle: 'qihome-air', query: PRODUCT_QUERY, konfigurator: false});
}

export default function ProductB() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiHomeAirSeite
      kaufleiste
      product={product}
      vergleichsPreise={vergleichsPreise}
      beschreibung={
        <div
          className="ProductDescription"
          dangerouslySetInnerHTML={{
            __html: fremdHtmlMitBildAuszeichnung(product.descriptionHtml),
          }}
        />
      }
    />
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
