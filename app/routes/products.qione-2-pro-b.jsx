import {useLoaderData} from 'react-router';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {
  QiOne2ProSeite,
  qiOne2ProSeiteLinks,
} from '~/components/product-pages/QiOne2ProSeite';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';

/*
 * B-FASSUNG DER KAUFSEITE /products/qione-2-pro (Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, KONZEPT §4; Christian 27.10.2026
 * Z2: „die jetzigen A werden zu den B versionen und dnan im verlgeihc laufen
 * lassen“). Diese Route ist die HEUTIGE Seite mit den alten Texten, damit der
 * Test auch die Texte misst: dieselbe Ladefunktion wie A (lib/produkt-seite-
 * laden.server.js, ohne Konfigurator), dieselbe Seite, dieselben Stylesheets.
 * Unterschied zu A-ohne-Konfigurator nur: noindex (Meta + X-Robots-Tag); die
 * Kanonische zeigt wie bei A auf /products/qione-2-pro (produktMeta, pfad von A).
 * Erreicht wird sie über die Seiten-Weiche (konfig-qione-2-pro-e1) oder den Pin.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiOne2ProSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

function metaVonA({data}) {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qione-2-pro',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // VideoObject je Instagram-Beitrag MIT Video (43 von 44 Kacheln dieser
  // Seite — CYHc4RClQLb ist ein Bild-Post und bekommt deshalb keinen Knoten).
  // Der Descriptor ist null, wenn es nichts zu sagen gibt; dann wird bewusst
  // nichts angehängt statt ein leerer Container ausgeliefert.
  const videos = igVideoDescriptor({
    produkt: 'QiOne 2 Pro',
    pfad: '/products/qione-2-pro',
    produktTitel: data?.product?.title,
  });
  return videos ? [...basis, videos] : basis;
}

/** @type {MetaFunction<typeof loader>} */
export const meta = (args) => [
  ...bMeta(metaVonA(args)),
  {name: 'robots', content: 'noindex,nofollow'},
];

export const headers = () => B_HEADERS;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // KEINE Weiche hier: B lenkt nie um (sonst Schleife bei Eimer < Anteil).
  return ladeProduktSeite(args, {handle: 'qione-2-pro', query: PRODUCT_QUERY, konfigurator: false});
}

export default function ProductB() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise} = useLoaderData();
  return (
    <QiOne2ProSeite
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
