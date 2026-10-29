import {redirect, useLoaderData} from 'react-router';
import {
  QiBraceletSeite,
  qiBraceletSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiBraceletSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {entscheideSeitenExperiment} from '~/lib/experiment-weiche.server';
import {konfiguratorAn, ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qibracelet-alpha-daten';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
/*
 * Die Stylesheets der Seite (samt Begründung und tragender Reihenfolge) stehen
 * seit dem 28.09.2026 in QiBraceletSeite.jsx, weil /pages/qibracelet dieselbe Seite
 * rendert und dieselben Dateien braucht.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiBraceletSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
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
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // SEITEN-EXPERIMENT konfig-qibracelet-e1 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
  // qione-qihome-qibracelet-ab, KONZEPT §4): VOR dem ersten await. B ist die
  // heutige Seite unter /products/qibracelet-b. Vorbau mit aktiv: false, scharf
  // schaltet s09; Kill EXP_KONFIG_QIBRACELET_MODE=off.
  const exp = entscheideSeitenExperiment(args.request, args.context.env, 'konfig-qibracelet-e1');
  if (exp) throw redirect(exp.ziel, {status: 302, headers: {'Cache-Control': 'no-store'}});

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page.
  // Eine Ladefunktion für A und B (lib/produkt-seite-laden.server.js); der
  // Konfigurator nur mit KONFIGURATOR_QIBRACELET=on (Default AUS = heutige Seite).
  const criticalData = await ladeProduktSeite(args, {
    handle: 'qibracelet',
    query: PRODUCT_QUERY,
    daten: ALPHA_DATEN,
    konfigurator: konfiguratorAn(args.context.env, 'qibracelet'),
  });

  return {...deferredData, ...criticalData};
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({ context, params }) {
  return {};
}


/*
 * Der Seiteninhalt lebt seit dem 28.09.2026 in QiBraceletSeite.jsx und ist derselbe
 * wie auf /pages/qibracelet. Diese Route gibt allein den Beschreibungstext oben
 * am Produkt hinein.
 */
export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise, konfigurator, ketten} = useLoaderData();
  // A-FASSUNG (s08): mit Schalter steht der Konfigurator allein, mit den neuen
  // Texten in seinen Slots. Die heutige Seite darunter trüge die alten Texte
  // (S – 17, 10-fache Stärke, Kaufleiste als zweiter Knopf) und bleibt B.
  if (konfigurator) {
    return (
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    );
  }
  return (
    <QiBraceletSeite
      kaufbereich={null}
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
function Konfigurator({product, ketten, vergleichsPreise}) {
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          // Gewinner (s02 Z40): Gerätevergleich als „Modelle vergleichen“.
          vergleich: (
            <AlphaVergleich
              handle="qibracelet"
              daten={ALPHA_DATEN.VERGLEICH}
              preise={vergleichsPreise}
              eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
            />
          ),
          wissen: (
            <AlphaWissen
              kapitel={ALPHA_DATEN.WISSEN.kapitel}
              studien={ALPHA_DATEN.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} igProdukt="QiBracelet" />,
          faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />,
        }}
      />
    </>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
