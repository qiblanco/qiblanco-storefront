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
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {useGoogleRating} from '~/lib/googleRating';
import {useMarktLand} from '~/lib/markt-land';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {betragText} from '~/lib/betrag-text';
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
  // A-FASSUNG (s06, wie s08): mit Schalter steht der Konfigurator allein, mit
  // den neuen Texten in seinen Slots. Die heutige Seite darunter trüge die
  // alten Texte („Dreifacher Weltrekordhalter“, Gitterchip™, Kaufleiste als
  // zweiter Knopf) und bleibt B (/products/qione-2-pro-b).
  if (konfigurator) {
    return (
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    );
  }
  return (
    <QiOne2ProSeite
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
 * konfigurator-qione-qihome-qibracelet-ab, s06): Band, Kopf, Kette, Bezahlart,
 * Zusammenfassung, Box und die Slots mit den s03-Texten. Die Stylesheets der
 * Alpha laden nur mit Konfigurator (links() kennt die Loaderdaten nicht): aus
 * heißt dieselben <link>-Tags wie vor s05.
 */
function Konfigurator({product, ketten, vergleichsPreise}) {
  const land = useMarktLand();
  const money = product?.selectedOrFirstAvailableVariant?.price;
  const preisText = money
    ? betragText(
        bruttoAnzeige(money.amount, product.handle, money.currencyCode, land),
        money.currencyCode,
      )
    : null;
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={alphaQiOneStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        ketten={ketten}
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          // Gewinner (s02 Z40): Gerätevergleich als „Modelle vergleichen“.
          // Die id ist das Ziel des Kopf-Links (s03 kopf.vergleich_link).
          vergleich: (
            <div id="geraetevergleich">
              <AlphaVergleich
                handle="qione-2-pro"
                daten={ALPHA_DATEN.VERGLEICH}
                preise={vergleichsPreise}
                eigenerPreis={money}
              />
            </div>
          ),
          wissen: (
            <>
              <QiOneNutzen daten={ALPHA_DATEN.NUTZEN} />
              <AlphaWissen
                kapitel={ALPHA_DATEN.WISSEN.kapitel}
                studien={ALPHA_DATEN.WISSEN.studien}
                bilder={product?.images?.nodes ?? []}
              />
            </>
          ),
          // Menschen zuerst (Kanon: Menschen ziehen): der Weltrekordhalter,
          // dann die Google-Stimmen und die Instagram-Reihe der heutigen Seite.
          stimmen: (
            <>
              <QiOneWeltrekord daten={ALPHA_DATEN.WELTREKORD} />
              <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} igProdukt="QiOne 2 Pro" />
            </>
          ),
          faq: <AlphaFaqMitRate daten={mitPreis(ALPHA_DATEN.FAQ, preisText)} product={product} />,
        }}
      />
    </>
  );
}

/**
 * `{preis}` in den Fragen durch den Shopify-Preis ersetzen (Seite und Kasse
 * nennen dieselbe Zahl). Ohne Preis entfällt die Frage, die ihn nennt.
 */
function mitPreis(faq, preisText) {
  const fragen = (faq?.fragen ?? [])
    .filter((x) => preisText || !`${x.f} ${x.a}`.includes('{preis}'))
    .map((x) => ({
      f: x.f.replaceAll('{preis}', preisText ?? ''),
      a: x.a.replaceAll('{preis}', preisText ?? ''),
    }));
  return {...faq, fragen};
}

/** Nutzen-Raster (s03 nutzen) nach Apple: vier Spalten, Etikett, Titel, Text. */
function QiOneNutzen({daten}) {
  const google = useGoogleRating();
  if (!daten?.spalten?.length) return null;
  return (
    <div className="avq-nutzen" data-av-nutzen="">
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="avq-nutzen-raster">
        {daten.spalten.map((s) => {
          const link = s.link
            ? {
                text: s.link.text.replace('{sterne}', google.komma),
                href: s.link.href === 'google' ? google.url : s.link.href,
                fremd: s.link.href === 'google',
              }
            : null;
          return (
            <li key={s.etikett} className="avq-spalte">
              <p className="avq-etikett">{s.etikett}</p>
              <h3 className="avq-titel">{mitMarkeR(s.titel)}</h3>
              <p className="avq-text">{mitMarkeR(s.text)}</p>
              {link ? (
                <a
                  className="avq-link"
                  href={link.href}
                  {...(link.fremd ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                >
                  {link.text}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Weltrekordhalter (s03 weltrekord): Video-Fassade links, Text rechts. */
function QiOneWeltrekord({daten}) {
  if (!daten?.video) return null;
  return (
    <div className="avq-weltrekord" data-av-weltrekord="">
      <div className="avq-weltrekord-video">
        <YoutubeIframe
          link={`https://www.youtube.com/embed/${daten.video}`}
          titel={daten.videoTitel}
        />
      </div>
      <div className="avq-weltrekord-text">
        <p className="taw-etikett">{daten.siegel}</p>
        <h2 className="tas-box-titel">{daten.titel}</h2>
        <p>{daten.text}</p>
        {daten.quellen?.length ? (
          <ul className="avq-quellen" aria-label="Quellen">
            {daten.quellen.map((q) => (
              <li key={q.href}>
                <a href={q.href} target="_blank" rel="noopener noreferrer">
                  {q.text}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
