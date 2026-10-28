import {redirect, useLoaderData} from 'react-router';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {
  QiOne2ProSeite,
  qiOne2ProSeiteLinks,
} from '~/components/product-pages/QiOne2ProSeite';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {entscheideSeitenExperiment} from '~/lib/experiment-weiche.server';
import {konfiguratorAn, ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qione-2-pro-alpha-daten';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
/*
 * ZWEIFEL-BELEG IST HIER ENTFALLEN (2026-09-08, Elina EL-20260908-d8349a01).
 *
 * Hier hing zweifel-beleg.css als route-gebundenes Stylesheet, weil diese
 * Seite den <ZweifelBeleg> trug. Der ist entfallen -- sein Stylesheet lädt
 * diese Route deshalb NICHT mehr. Die Datei selbst BLEIBT: /cart trägt seine
 * eigene Zweifel-Zeile und lädt sie über sein eigenes links().
 *
 * Das links() unten kam am 2026-09-11 zurück, aber für eine ANDERE Datei
 * (ig-testimonials.css) -- der alte Satz "kein links()-Export mehr" stand hier
 * bis dahin woertlich und wäre ab dieser Zeile eine falsche Selbstauskunft.
 * Seit dem 28.09.2026 steht die Liste samt Begründung in QiOne2ProSeite.jsx,
 * weil /pages/qione-2-pro dieselbe Seite rendert und dieselben Dateien braucht.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiOne2ProSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
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
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // SEITEN-EXPERIMENT konfig-qione-2-pro-e1 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
  // qione-qihome-qibracelet-ab, KONZEPT §4): VOR dem ersten await. B ist die
  // heutige Seite unter /products/qione-2-pro-b. Vorbau mit aktiv: false, scharf
  // schaltet s09; Kill EXP_KONFIG_QIONE_2_PRO_MODE=off.
  const exp = entscheideSeitenExperiment(args.request, args.context.env, 'konfig-qione-2-pro-e1');
  if (exp) throw redirect(exp.ziel, {status: 302, headers: {'Cache-Control': 'no-store'}});

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page.
  // Eine Ladefunktion für A und B (lib/produkt-seite-laden.server.js); der
  // Konfigurator nur mit KONFIGURATOR_QIONE_2_PRO=on (Default AUS = heutige Seite).
  const criticalData = await ladeProduktSeite(args, {
    handle: 'qione-2-pro',
    query: PRODUCT_QUERY,
    daten: ALPHA_DATEN,
    konfigurator: konfiguratorAn(args.context.env, 'qione-2-pro'),
  });

  return {...deferredData, ...criticalData};
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({context, params}) {
  return {};
}

/*
 * Der Seiteninhalt lebt seit dem 28.09.2026 in QiOne2ProSeite.jsx und ist
 * derselbe wie auf /pages/qione-2-pro. Diese Route gibt allein den
 * Beschreibungstext oben am Produkt hinein.
 */
export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise, konfigurator, ketten} = useLoaderData();
  const kaufbereich = konfigurator ? (
    <Konfigurator product={product} ketten={ketten} />
  ) : null;
  return (
    <QiOne2ProSeite
      kaufbereich={kaufbereich}
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

/*
 * KONFIGURATOR (Christian 27.10.2026 Z2–Z6; Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab): steht an der Stelle der Buy-Box,
 * alles darunter bleibt die heutige Seite. Die Stylesheets der Alpha laden
 * nur mit Konfigurator (links() kennt die Loaderdaten nicht): aus heißt
 * dieselben <link>-Tags wie vor s05.
 */
function Konfigurator({product, ketten}) {
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        ketten={ketten}
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        vertrauen={<EuGewaehrleistungsHinweis />}
      />
    </>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
