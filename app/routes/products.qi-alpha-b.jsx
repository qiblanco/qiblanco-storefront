import {useState} from 'react';
import {redirect, useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox} from '~/components/product-pages/QiOneBuyBox';
import {QiMasterBenefitList} from '~/components/product-pages/QiMaster';
import QiAlphaShopB from '~/components/product-pages/QiAlphaShopB';
import {
  QA_AUFLAGE,
  QA_NAME,
  alpha,
  alphaWortlaut,
} from '~/components/campaign/QiAlphaLpB';
import {THE_ALPHA_LIVE_ANMELDUNG_STIL} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import qiMasterStyles from '~/styles/qi-master.css?url';
import wortlautStyles from '~/styles/qi-master-wortlaut.css?url';
import kaufZuerstStyles from '~/styles/qb-pdp-kauf-zuerst.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import qiAlphaBStyles from '~/styles/qi-alpha-b.css?url';
import {kaufZuerstAttribute} from '~/components/product-pages/pdpKaufZuerst';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {istVorschauNoindex} from '~/lib/vorschau-noindex';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {fremdHtmlMitKopfsymbolen} from '~/lib/qi-master-kopfsymbole';
import {QiMasterAddons} from '~/components/product-pages/QiMasterAddons';
import {
  QM_ADDONS_QUERY,
  ADDON_WAEHRUNGEN,
  KETTE_VORWAHL,
  addonLinien,
  QM_HANDLES,
} from '~/lib/qi-master-addons';

/**
 * B-FASSUNG DER KAUFSEITE (Christian 25.10.2026, Z10: „die alte seite als B
 * Vraitne aufheben mit ienem link wo ich drauf zugreifen kann, dmait ich dort
 * mich noch inspierern kann für texte und co.“; Grossjob 20261025-prio1-the-
 * alpha-landingpage-figma-vorlage-a-server-b-ki-c, s12). Diese Datei ist die
 * bisherige Kaufseite /products/the-alpha, unverändert bis auf den Pfad. Die
 * neue Apple-nahe Shopseite lebt dort (products.the-alpha.jsx). noindex über
 * app/lib/vorschau-noindex.js, nicht verlinkt, nicht im Ad-/Testverkehr.
 */
/*
 * UMZUG QI ALPHA (Christian 27.10.2026, Z1: „Und den Link ändern wir auch
 * wieder von The Alpha in Qi Alpha“; Job 20261027-prio1-umzug-the-alpha-zu-
 * qi-alpha-links-name). Bis dahin stand diese Seite unter /products/the-alpha-b.
 */
/*
 * B-INHALT (Christian 25.10.2026 Z3: „also die b variante ist besser als die A
 * veraitne, d.h. a updaten auf b level, ich probier dann noch einiges aus";
 * Grossjob 20261025-qi-alpha-produktseite-englisch-aufbauen-a-auf-b-niveau,
 * s04-r1-r2). Der Umzug hatte hier die alte Kaufseite (QiMaster-Sektionen)
 * stehen lassen, QiAlphaShopB hatte keine Route mehr. Seit s04-r1-r2 rendert
 * diese Route unter der Kaufbox QiAlphaShopB, die Kaufbox trägt wieder die
 * B-Zeilen (Name Qi Alpha®, „Erste Edition · 111 Stück", Christians Wortlaut
 * aus alphaWortlaut()). Pfad, 301, noindex und Add-on-Handles bleiben, wie der
 * Umzug sie gesetzt hat. Die Apple-Seite /products/qi-alpha ist A; beide
 * Routen bleiben getrennt, damit Christian weiter vergleichen kann.
 */
const THE_ALPHA_PDP_PFAD = '/products/qi-alpha-b';

/*
 * Organische Produktseite /products/the-alpha — seit 2026-10-26. Christian am
 * 25.10.2026 (Z4): „d.h. wir gehen im link weg von qi-alpha hin zu the alpha"
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * Segment s06). Der Produktname bleibt „Qi Alpha", nur die Adresse wechselt.
 * /products/qi-alpha und /products/qi-master sind 301-Hüllen auf diesen Pfad,
 * je in EINEM Sprung. Andere Schreibweisen (/products/The-Alpha) treffen diese
 * Route, weil React Router die Schreibweise nicht unterscheidet; der Loader leitet
 * sie per 301 auf die kleine Schreibweise.
 *
 * Bis 2026-10-26 /products/qi-alpha, bis 2026-10-17 /products/qi-master. Christian am 2026-10-17: „ja bitte auch die
 * Shopseite und das Produkt. es heißt nun Qi Alpha" (Grossjob
 * 20261017 zum neuen Namen, Segment s02). Der alte Pfad ist eine 301-Hülle (products.qi-master.jsx). Interne
 * Bezeichner (QiMaster.jsx, qm-*-Klassen, qi-master-*-Dateien) bleiben.
 *
 * HANDLE-TOLERANT (s02 bis s09): der Shopify-Handle wechselt erst in s09
 * von `qi-master` auf `qi-alpha`. Bis dahin lädt der Loader erst `qi-alpha`
 * und, wenn es das nicht gibt, `qi-master`. Nach s09 trifft schon die erste
 * Abfrage; der zweite Handle ist dann nur noch Rückweg und kann gehen.
 *
 * Ursprung: QiMaster, „der QiOne mit Diamant" (Christian-Auftrag
 * 2026-09-10, CW-20260910-0e45045b).
 *
 * PFAD: Christian nannte gesprochen „/shop/qi-master". Das Hausmuster für
 * Kaufseiten ist /products/<handle> (qione-2-pro, qibracelet, qihome-air,
 * qione-kette); einen /shop/-Pfad gibt es in dieser Storefront nicht. Die
 * Seite folgt dem Muster — der Unterschied steht im RESULT des Auftrags.
 *
 * BAUFORM: analog zur organischen QiOne-2-Pro-PDP (products.qione-2-pro.jsx):
 * geteilte QiOneBuyBox (Query-SSoT PRODUCT_QUERY, Varianten-/Preis-/ATC-Logik
 * identisch) + Sektionen unterhalb in product-pages/QiMaster.jsx.
 *
 * ZAHLEN AM PRODUKT: die BuyBox läuft bewusst OHNE Sternzeile, ohne Nutzer-
 * zahl und ohne „Bestseller"-Label — der QiMaster ist neu, hat diese Zahlen
 * nicht, und eine geliehene Zahl wäre eine erfundene.
 *
 * ZAHLEN AN DER MARKE — hier stand bis 2026-09-10 das Gegenteil des
 * Gerenderten, und der Kommentar war die Stelle, an der man die Claims-Lage
 * nachliest: die geteilten Bausteine <GoogleRezensionenBereich/> („Über
 * 14.000 zufriedene Kunden") und <UpsellLineUp/> bringen MARKENWEITE Zahlen
 * mit und rendern sie auch auf dieser Seite — genauso wie auf
 * /products/qione-2-pro. Sie behaupten nichts über den QiMaster, und sie
 * bleiben, weil der Auftrag ausdrücklich dieselben Bausteine verlangt.
 * NACHZUG 2026-09-21: <UpsellLineUp/> trug bis dahin zusätzlich die Zeile
 * „Über 300 neue Nutzer im Monat". Christian hat sie ersatzlos streichen
 * lassen (Job 20260921, "300 neue Nutzer ersatzlos streichen"); der
 * Baustein bringt seitdem nur noch die Revolutions-Zeile mit. Die
 * 14.000er-Zahl ist davon NICHT berührt — sie ist eine andere Aussage. Dass markenweiter Sozialbeweis auf einer brandneuen
 * Produktseite wie Produktbeweis gelesen werden kann, ist als offene Frage
 * an Christian ausgewiesen (RESULT) — nicht still entschieden.
 *
 * VEROEFFENTLICHUNG: der Knopf liegt bei Christian. Das Produkt liegt in
 * Shopify als DRAFT; die Storefront-API liefert dafür null, der Loader
 * antwortet 404 — auch nach einem Merge dieser Route bleibt die Seite
 * unerreichbar, bis das Produkt auf ACTIVE steht und dem Kanal „Main Qi
 * Blanco Storefront" zugeordnet ist. Der Rückweg ist derselbe Schalter.
 *
 * TRACKING: KEIN Pixel-Code hier (0-Pixel-Regel, D-006) — ViewContent feuert
 * aus <Analytics.ProductView> in der geteilten QiOneBuyBox, AddToCart als
 * Cart-Event; die Identitaets-Keys laufen über app/lib/checkout-tracking.js
 * und werden von dieser Route nicht beruehrt.
 */

/**
 * Route-gebundenes Stylesheet (Muster zweifel-beleg.css / qione-2-pro-shop.css):
 * die Token-Schicht der Seite, damit app.css unangetastet bleibt.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: qiMasterStyles},
    // Christians Fassung vom 22.09.2026 (QiMasterWortlaut) — eigene Datei,
    // geteilt mit der Landingpage; Begründung im Kopf von
    // app/styles/qi-master-wortlaut.css.
    {rel: 'stylesheet', href: wortlautStyles},
    // Kauf zuerst: Preis und Kaufknopf im ersten Fenster; Schalter und
    // Begründung in components/product-pages/pdpKaufZuerst.js. Das Attribut
    // sitzt auf dem Seiten-Wrapper .qm-pdp, nicht in der geteilten Buy-Box.
    {rel: 'stylesheet', href: kaufZuerstStyles},
    {rel: 'stylesheet', href: kaufleisteStyles},
    {rel: 'stylesheet', href: qiAlphaBStyles},
    {rel: 'stylesheet', href: THE_ALPHA_LIVE_ANMELDUNG_STIL},
  ];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // VORSCHAU-NOINDEX (Christian 23.10.2026, Liste app/lib/vorschau-noindex.js):
  // solange der Pfad dort steht, trägt die Seite das noindex AUCH im HTML,
  // nicht nur als X-Robots-Tag aus entry.server.jsx (Hausmuster D-006 „Gurt
  // und Hosenträger"), und wie products.$handle.jsx nur Titel + noindex,
  // kein canonical daneben. Grund am 2026-10-25 gemessen: die Zufahrts-
  // prüfung (src/seiten_zufahrt.py) liest nur den HTML-Kopf und hielt die
  // Seite für indexierbar. Der Eintrag raus = alles unten gilt wieder, die
  // Liste bleibt die einzige Stelle.
  if (istVorschauNoindex(THE_ALPHA_PDP_PFAD)) {
    return [
      {title: `${data?.product?.title ?? 'Qi Alpha®'} | ${MARKE}`},
      // Statisch, nicht noindexMeta(): das Zufahrts-Gate (hb-deploy) liest
      // das Literal in meta() und erspart dann den Zufahrts-Beleg.
      {name: 'robots', content: 'noindex,nofollow'},
    ];
  }
  return produktMeta({
    // Der Strukturknoten (Product-@id, url, Brotkrumen) baut seine Adresse aus
    // dem HANDLE. Bis zum s09-Handle-Wechsel heißt der in Shopify noch
    // `qi-master`, und die Auszeichnung zeigte auf die 301-Hülle statt auf
    // diese Seite. Sie folgt deshalb dem Pfad dieser Route, nicht Shopify.
    produkt: data?.product && {...data.product, handle: 'qi-alpha-b'},
    marktLand: data?.marktLand,
    pfad: THE_ALPHA_PDP_PFAD,
    titel: `${data?.product?.title ?? 'Qi Alpha®'} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // EINE Schreibweise: /products/The-Alpha und /products/THE-ALPHA treffen
  // diese Route (Schreibweise egal) und gehen in einem Sprung hierher, die
  // Query bleibt (UTM, Click-IDs, Varianten-Parameter).
  const url = new URL(args.request.url);
  if (url.pathname !== THE_ALPHA_PDP_PFAD) {
    throw redirect(`${THE_ALPHA_PDP_PFAD}${url.search}`, 301);
  }
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Erst `qi-alpha`, sonst `qi-master` (QM_HANDLES, Reihenfolge tragend).
 * @param {LoaderFunctionArgs['context']['storefront']} storefront
 * @param {Request} request
 */
async function ladeQiAlpha(storefront, request) {
  for (const handle of QM_HANDLES) {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    });
    if (product?.id) return {product, handle};
  }
  return {product: null, handle: QM_HANDLES[0]};
}

/**
 * @param {LoaderFunctionArgs} args
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;

  const [{product}, addonDaten] = await Promise.all([
    ladeQiAlpha(storefront, request),
    // DIE ADD-ONS UNTER DEM KAUFKNOPF (Christian 2026-09-24): Wunschnummer
    // und Goldkette sind eigene Shopify-Produkte (lib/qi-master-addons.js).
    // FAIL-SOFT: fehlt eines (noch nicht veröffentlicht) oder scheitert die
    // Abfrage, entfällt nur der Bereich — die Kaufseite selbst bleibt heil.
    storefront.query(QM_ADDONS_QUERY).catch(() => null),
  ]);

  if (!product?.id) {
    // Hausmuster (products.qione-2-pro.jsx:70, products.$handle.jsx:220): kein
    // Produkt -> 404. Für den QiMaster ist das der REGELFALL, nicht der
    // Ausnahmefall: solange Christian das Produkt nicht auf ACTIVE schaltet,
    // liefert die Storefront-API null, und diese Route bleibt unerreichbar.
    // HIER STAND BIS 2026-09-10 EINE VORSCHAU-FIXTURE. Sie hat genau diesen
    // Zweig abgefangen und die Seite MIT ERFUNDENEN DATEN ausgeliefert — im
    // heutigen DRAFT-Zustand also immer. Ein Merge davon haette die Seite
    // öffentlich gemacht, obwohl Kopfkommentar und RESULT 404 zusagten.
    // Die Vorschau läuft seitdem über vorschau-fixture.sh im Jobordner
    // (schaltet lokal ein und wieder aus), nie über committeten Code.
    throw new Response(null, {status: 404});
  }

  // HIER STAND BIS 2026-10-26 redirectIfHandleIsLocalized(request, {handle,
  // data: product}). Der Pfad /products/the-alpha enthält keinen Shopify-
  // Handle mehr; die Funktion hätte bei abweichendem Handle nichts ersetzt
  // und trotzdem auf dieselbe Adresse umgeleitet, also einen Kreis gebaut.

  // HIER STAND BIS ZUM 22.09.2026 DIE VORVERKAUFSTREPPE (`treppe:
  // treppeRechnen(preisstufen)`). Christian hat sie an diesem Tag ersatzlos
  // abgelöst: kein laufender Vorverkauf, kein Rabatt, der Preis ist fixiert.
  // Der Loader rechnet deshalb keine Stufe mehr — auch nicht „nur für die
  // Daten": was der Loader liefert, steht im ausgelieferten Stream, und eine
  // Treppe dort wäre ausgeliefert, auch wenn sie niemand sieht. Der Text an
  // ihrer Stelle kommt zur Bauzeit aus app/data/qi-master-wortlaut.json
  // (QiMasterWortlaut) und braucht keinen Loader.
  return {
    product,
    // Markt-Land für die Produkt-Auszeichnung: `meta()` hat keinen Kontext,
    // und der ausgezeichnete Preis muss derselbe sein wie der sichtbare
    // (AT 20 statt 19 %). Job 20260913-at-paketkarte-rechnet-19-prozent-
    // kasse-nimmt-20-prio8.
    marktLand: storefront.i18n.country,
    addons: {
      // Neuer Handle zuerst, alter als Rückfall (s09 wechselt ihn).
      wunschnummer:
        addonDaten?.wunschnummerNeu ?? addonDaten?.wunschnummer ?? null,
      kette: addonDaten?.ketteNeu ?? addonDaten?.kette ?? null,
    },
  };
}

function loadDeferredData() {
  return {};
}

// Rollen der Wortlaut-Absätze ohne den entfallenen Terminsatz (Gestaltung
// aus qi-master-wortlaut.css, wie auf A).
const WORTLAUT_ROLLE = ['grund', 'herkunft', 'versand'];

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, addons} = useLoaderData();
  const {descriptionHtml} = product;
  const qmVariante = product.selectedOrFirstAvailableVariant;
  // Add-ons nur neben einem KAUFBAREN Qi Master: ist er nicht bestellbar,
  // sind es die Add-ons auch nicht (Auftrag 2026-09-24, Grenzen). Und nur in
  // den Märkten, für die Christian einen Preis genannt hat (ADDON_WAEHRUNGEN).
  const addonsSichtbar =
    qmVariante?.availableForSale &&
    ADDON_WAEHRUNGEN.includes(qmVariante?.price?.currencyCode)
      ? addons
      : null;
  const [auswahl, setAuswahl] = useState(() => ({
    wunschnummer: null,
    ketteAn: false,
    kette:
      addons?.kette?.variants?.nodes?.find((v) => v.title === KETTE_VORWAHL)
        ?.id ??
      addons?.kette?.variants?.nodes?.[0]?.id ??
      null,
  }));
  const zusatzLinien = addonsSichtbar
    ? addonLinien({
        wunschnummer: addonsSichtbar.wunschnummer?.variants?.nodes?.find(
          (v) => v.id === auswahl.wunschnummer && v.availableForSale,
        ),
        kette: auswahl.ketteAn
          ? addonsSichtbar.kette?.variants?.nodes?.find(
              (v) => v.id === auswahl.kette,
            )
          : null,
      })
    : [];

  // Nur die Anzeige trägt den Namen mit ®; Kaufweg und Ereignisse laufen über
  // dasselbe Produkt (id, Varianten) wie auf A.
  const anzeige = {...product, title: QA_NAME};

  return (
    <div className="qm-pdp qa-b" {...kaufZuerstAttribute()}>
      <QiOneBuyBox
        product={anzeige}
        /* SPRUNGZIEL DES PARALLAX-KNOPFES "Hole dir deinen QiMaster" weiter
           unten auf der Seite (product-pages/QiMaster.jsx, link={'#qm-buybox'}).
           BIS ZUM 2026-09-16 GAB ES DIESE ID IM GANZEN LADEN NICHT: der Knopf
           stand seit dem ersten Tag der Seite da und tat beim Klick nichts —
           gemessen 2026-09-16T20:24Z im Browser, ein einziger seiteninterner
           Sprungziel-Link auf der Seite, und der war tot. Der Kopfkommentar in
           QiMaster.jsx nannte ihn ausdrücklich "ein echtes Ziel"; genau diese
           Behauptung ist der Grund, warum es niemandem auffiel.

           Die Id hängt an der Buy-Box und nicht an einem neuen Wrapper: sie
           IST das Ziel, das der Knopf verspricht. Dieselbe Hausform wie
           products.qibracelet.jsx / products.qihome-air.jsx / products.
           zeremonie-kakao.jsx (`<div className="product" id="product">`), hier
           nur über die geteilte Komponente statt von Hand. */
        ankerId="qm-buybox"
        /* Klebende Kaufleiste mobil (reusables/Kaufleiste.jsx): Preis und
           Knopf dieser Buy-Box, mit denselben Add-on-Zeilen wie ihr Knopf. */
        kaufleiste
        /* Die Pflichtmitteilung hängt auf dieser Seite NICHT unter dem
           Kauf-Knopf, sondern als letzter Punkt der Nutzen-Liste darunter —
           dieselbe Bauform wie auf qione-2-pro, qibracelet, qihome-air und
           qione-kette (Hausregel: ProductForm.jsx, `gewaehrleistungsHinweis`,
           Elina EL-20260909-8c4001d1). Dieser Schalter ist die einzige
           Stelle, die verhindert, dass sie zweimal auf der Seite steht.

           BIS ZUM 2026-09-12 FEHLTE ER HIER, und die Seite war damit die
           einzige im Laden, die eine eigene Liste hatte UND das Siegel
           daneben klebte (Christian: „So soll das aussehen bei der
           garantierten gesetzlichen Leistung", mit Bildschirmfoto der
           qione-2-pro-Liste). Der Default ist bewusst true — er trägt die
           Mehrheit der Kaufflächen, die über products.$handle laufen und
           gar keine Liste haben. */
        gewaehrleistungsHinweis={false}
        /* DIE ADD-ONS STEHEN VOR DEM KAUFKNOPF (seit 29.10.2026, s04-r1-r2).
           Bis dahin standen sie darunter (Christian 2026-09-24: „einen Bereich
           unterhalb vom Kaufknopf, wo man Add-ons auswählen kann"). Jünger ist
           Christians Shop-Regel vom 27.10.2026 (Z1 „in den warenkorb muss hier
           raus", design-meister/db/webdesign/shop-regeln.yaml
           S2_kein_kaufknopf_im_konfigurator_kopf): gekauft wird NACH der
           Auswahl, wie auf A. Die QiOneBuyBox hat vor dem Knopf nur den
           Preis-Slot; die Auswahl steht deshalb dort, unter dem Wortlaut.
           Der Knopf legt die gewählten Add-ons weiter im selben Klick mit in
           den Warenkorb (zusatzLinien, lib/qi-master-addons.server.js). */
        zusatzLinien={zusatzLinien}
        /* B-Zeile über dem Preis: die Auflage, keine Bewertung und keine
           Nutzerzahl (Christian 28.10.2026 Z1: „wir stellen das produkt erst
           vor es kann nochk eien bewerugn geben"). */
        socialProof={
          <p className="qa-auge qa-auge--kaufbox">
            Erste Edition · {QA_AUFLAGE}
          </p>
        }
        description={
          <div
            className="ProductDescription"
            /* ZWEI Durchlaeufe über dasselbe fremde HTML, und die Reihenfolge ist
               beliebig: der eine zeichnet Bilder aus (alt), der andere setzt die
               Symbole vor die vier Zeilen des Kopfblocks (Christian am 2026-09-16).
               Sie fassen disjunkte Knoten an -- <img> gegen <li> --, können sich
               also nicht ueberschreiben. */
            dangerouslySetInnerHTML={{
              __html: alpha(
                fremdHtmlMitKopfsymbolen(
                  fremdHtmlMitBildAuszeichnung(descriptionHtml),
                ),
              ),
            }}
          />
        }
        /* KEINE STEUERANGABE AM PREIS (Christian am 2026-10-27, Register
           Z223/Z232-Z233: „das mit den Mehrwertsteuern wird nirgendwo
           angezeigt, das zeigen wir erst im Checkout"). Bis dahin stand hier
           <p class="qm-steuerhinweis">inkl. 19 % MwSt.</p> (Christian
           2026-09-16); Element und CSS sind an der Quelle entfernt. */
        priceLabel={
          <>
            {/* Christians Fassung vom 22.09.2026 aus der einen Quelle
             app/data/qi-master-wortlaut.json, in der B-Lesart (alphaWortlaut:
             Name, 111 Stück, ohne den Terminsatz). */}
            <section
              className="qm-wortlaut qm-wortlaut--kompakt"
              aria-label="Preis, Auflage und Versand des Qi Alpha®"
            >
              {alphaWortlaut().map((text, i) => (
                <p
                  className={`qm-wortlaut__absatz qm-wortlaut__absatz--${WORTLAUT_ROLLE[i] ?? 'grund'}`}
                  key={text.slice(0, 32)}
                >
                  {text}
                </p>
              ))}
            </section>
            <div className="qa-b-auswahl">
              <QiMasterAddons
                addons={addonsSichtbar}
                qmPreis={qmVariante?.price}
                auswahl={auswahl}
                setAuswahl={setAuswahl}
              />
            </div>
          </>
        }
        benefitList={
          <QiMasterBenefitList
            zusatzPunkt={<EuGewaehrleistungsListenpunkt />}
          />
        }
      />
      <QiAlphaShopB />
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
