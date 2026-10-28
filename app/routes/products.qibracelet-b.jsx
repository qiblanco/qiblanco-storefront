import {useLoaderData} from 'react-router';
import {
  QiBraceletSeite,
  qiBraceletSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiBraceletSeite';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';

/*
 * B-FASSUNG DER KAUFSEITE /products/qibracelet (Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, KONZEPT §4; Christian 27.10.2026
 * Z2: „die jetzigen A werden zu den B versionen und dnan im verlgeihc laufen
 * lassen“). Diese Route ist die HEUTIGE Seite mit den alten Texten, damit der
 * Test auch die Texte misst: dieselbe Ladefunktion wie A (lib/produkt-seite-
 * laden.server.js, ohne Konfigurator), dieselbe Seite, dieselben Stylesheets.
 * Unterschied zu A-ohne-Konfigurator nur: noindex (Meta + X-Robots-Tag); die
 * Kanonische zeigt wie bei A auf /products/qibracelet (produktMeta, pfad von A).
 * Erreicht wird sie über die Seiten-Weiche (konfig-qibracelet-e1) oder den Pin.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiBraceletSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

function metaVonA({data}) {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qibracelet',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // VideoObject je Instagram-Beitrag MIT Video. Ein Knoten auf einem Eintrag
  // OHNE Video wäre eine Luege, und ein Knoten ohne Pflichtfeld (name,
  // thumbnailUrl, uploadDate) steht dauerhaft als Fehler in der Search
  // Console — beides faellt in ig-video-schema.js baulich aus.
  const videos = igVideoDescriptor({
    produkt: 'QiBracelet',
    pfad: '/products/qibracelet',
    produktTitel: data?.product?.title,
  });
  return videos ? [...basis, videos] : basis;
}

/** @type {MetaFunction<typeof loader>} */
export const meta = (args) => bMeta(metaVonA(args));

export const headers = () => B_HEADERS;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // KEINE Weiche hier: B lenkt nie um (sonst Schleife bei Eimer < Anteil).
  return ladeProduktSeite(args, {handle: 'qibracelet', query: PRODUCT_QUERY, konfigurator: false});
}

export default function ProductB() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiBraceletSeite
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
