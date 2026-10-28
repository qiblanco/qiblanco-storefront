import {redirect, useLoaderData} from 'react-router';
import {
  QiHomeAirSeite,
  qiHomeAirSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {entscheideSeitenExperiment} from '~/lib/experiment-weiche.server';
import {konfiguratorAn, ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qihome-air-alpha-daten';
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
import {mitMarkeR} from '~/components/reusables/MarkeR';
/*
 * Die Stylesheets der Seite (samt Begründung und tragender Reihenfolge) stehen
 * seit dem 28.09.2026 in QiHomeAirSeite.jsx, weil /pages/qihome-air dieselbe Seite
 * rendert und dieselben Dateien braucht.
 */
export function links() {
  // Die Kaufleiste (reusables/Kaufleiste.jsx) steht nur auf der Kaufseite,
  // nicht auf dem Landingpage-Spiegel; ihr Stylesheet lädt deshalb hier.
  return [...qiHomeAirSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
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
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // SEITEN-EXPERIMENT konfig-qihome-air-e1 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
  // qione-qihome-qibracelet-ab, KONZEPT §4): VOR dem ersten await. B ist die
  // heutige Seite unter /products/qihome-air-b. Vorbau mit aktiv: false, scharf
  // schaltet s09; Kill EXP_KONFIG_QIHOME_AIR_MODE=off.
  const exp = entscheideSeitenExperiment(args.request, args.context.env, 'konfig-qihome-air-e1');
  if (exp) throw redirect(exp.ziel, {status: 302, headers: {'Cache-Control': 'no-store'}});

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page.
  // Eine Ladefunktion für A und B (lib/produkt-seite-laden.server.js); der
  // Konfigurator nur mit KONFIGURATOR_QIHOME_AIR=on (Default AUS = heutige Seite).
  const criticalData = await ladeProduktSeite(args, {
    handle: 'qihome-air',
    query: PRODUCT_QUERY,
    daten: ALPHA_DATEN,
    konfigurator: konfiguratorAn(args.context.env, 'qihome-air'),
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
 * Der Seiteninhalt lebt seit dem 28.09.2026 in QiHomeAirSeite.jsx und ist derselbe
 * wie auf /pages/qihome-air. Diese Route gibt allein den Beschreibungstext oben
 * am Produkt hinein.
 */
export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise, konfigurator, ketten} = useLoaderData();
  // A-FASSUNG (s07): mit Schalter steht der Konfigurator allein, mit den neuen
  // Texten (s04) in seinen Slots. Die heutige Seite darunter trüge die alten
  // Texte (über 500 Haushalte, 7-Tage-Service, Revolutions-Floskeln, zweiter
  // Kaufknopf) und bleibt B unter /products/qihome-air-b. Gleiches Muster wie
  // products.qibracelet.jsx (s08).
  if (konfigurator) {
    return (
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    );
  }
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
          // Erst „wo“ (Einsatz statt Varianten-Schritt, s04), dann „welches“:
          // der Gewinner-Kandidat Gerätevergleich (s02 Z40) als „Modelle
          // vergleichen“. Die Einsatzkarte bleibt in B (ihr fester Text „über
          // 450 … Teil der Revolution“ widerspricht Kachel „Über 400“ und den
          // in s04 gestrichenen Floskeln).
          vergleich: (
            <>
              <Einsatz daten={ALPHA_DATEN.EINSATZ} />
              <AlphaVergleich
                handle="qihome-air"
                daten={ALPHA_DATEN.VERGLEICH}
                preise={vergleichsPreise}
                eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
              />
            </>
          ),
          wissen: (
            <AlphaWissen
              kapitel={ALPHA_DATEN.WISSEN.kapitel}
              studien={ALPHA_DATEN.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} />,
          faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />,
        }}
      />
    </>
  );
}

/*
 * EINSATZ (nur QiHome Air, s04): drei Orte, keine Auswahl. Kachel-Stil der
 * Faktenkacheln (av-kacheln), eine Überschrift im H2-Stil der Slots.
 */
function Einsatz({daten}) {
  if (!daten?.zeilen?.length) return null;
  return (
    <div className="av-einsatz" data-av-einsatz="" style={{marginBottom: 'var(--tas-s-8)'}}>
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="av-kacheln">
        {daten.zeilen.map((z) => (
          <li key={z.titel} className="av-kachel">
            <span className="av-kachel-zahl">{z.titel}</span>
            <span className="av-kachel-satz">{mitMarkeR(z.zeile)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
