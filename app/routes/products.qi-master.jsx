import {useState} from 'react';
import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox} from '~/components/product-pages/QiOneBuyBox';
import QiMaster, {
  QiMasterBenefitList,
} from '~/components/product-pages/QiMaster';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import qiMasterStyles from '~/styles/qi-master.css?url';
import wortlautStyles from '~/styles/qi-master-wortlaut.css?url';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {QiMasterWortlaut} from '~/components/product-pages/QiMasterWortlaut';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {fremdHtmlMitKopfsymbolen} from '~/lib/qi-master-kopfsymbole';
import {QiMasterAddons} from '~/components/product-pages/QiMasterAddons';
import {
  QM_ADDONS_QUERY,
  KETTE_VORWAHL,
  addonLinien,
} from '~/lib/qi-master-addons';

/*
 * Organische Produktseite /products/qi-master — QiMaster, „der QiOne mit
 * Diamant" (Christian-Auftrag 2026-09-10, CW-20260910-0e45045b).
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
 * Blanco Storefront" zugeordnet ist. Der Rueckweg ist derselbe Schalter.
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
  ];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return produktMeta({
    produkt: data?.product,
    marktLand: data?.marktLand,
    pfad: '/products/qi-master',
    titel: `${data?.product?.title ?? 'Qi Master®'} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'qi-master');
  return {...deferredData, ...criticalData};
}

/**
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const {storefront} = context;

  const [{product}, addonDaten] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
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

  redirectIfHandleIsLocalized(request, {handle, data: product});

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
      wunschnummer: addonDaten?.wunschnummer ?? null,
      kette: addonDaten?.kette ?? null,
    },
  };
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, addons} = useLoaderData();
  const {descriptionHtml} = product;
  const qmVariante = product.selectedOrFirstAvailableVariant;
  // Add-ons nur neben einem KAUFBAREN Qi Master: ist er nicht bestellbar,
  // sind es die Add-ons auch nicht (Auftrag 2026-09-24, Grenzen).
  const addonsSichtbar = qmVariante?.availableForSale ? addons : null;
  const [auswahl, setAuswahl] = useState(() => ({
    wunschnummer: null,
    ketteAn: false,
    kette:
      addons?.kette?.variants?.nodes?.find((v) => v.title === KETTE_VORWAHL)?.id ??
      addons?.kette?.variants?.nodes?.[0]?.id ??
      null,
  }));
  const zusatzLinien = addonsSichtbar
    ? addonLinien({
        wunschnummer: addonsSichtbar.wunschnummer?.variants?.nodes?.find(
          (v) => v.id === auswahl.wunschnummer && v.availableForSale,
        ),
        kette: auswahl.ketteAn
          ? addonsSichtbar.kette?.variants?.nodes?.find((v) => v.id === auswahl.kette)
          : null,
      })
    : [];

  return (
    <div className="qm-pdp">
      <QiOneBuyBox
        product={product}
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
        /* DIE ADD-ONS STEHEN UNTER DEM KAUFKNOPF, nicht darüber (Christian
           2026-09-24, woertlich: „einen Bereich unterhalb vom Kaufknopf, wo
           man Add-ons auswählen kann"). Der Knopf legt die gewählten Add-ons
           im selben Klick mit in den Warenkorb; die Warenkorb-Action bindet
           sie dort an den Qi Master (lib/qi-master-addons.server.js). */
        zusatzLinien={zusatzLinien}
        unterKaufknopf={
          <QiMasterAddons
            addons={addonsSichtbar}
            qmPreis={qmVariante?.price}
            auswahl={auswahl}
            setAuswahl={setAuswahl}
          />
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
              __html: fremdHtmlMitKopfsymbolen(
                fremdHtmlMitBildAuszeichnung(descriptionHtml),
              ),
            }}
          />
        }
        /* DIE STEUERANGABE HÄNGT AM PREIS, NICHT UNTER DER TABELLE
           (Christian am 2026-09-16, woertlich: „Das inkl. 19 % MwSt. muss in
           klein hinter den großen Kaufpreis von: 10.639,- €").

           WARUM HIER UND NICHT IN ProductPrice.jsx: die Komponente trägt
           JEDE Kaufseite des Ladens. Ein Zusatz dort hätte 45 Seiten
           verändert, um eine zu bedienen. Der `priceLabel`-Slot steht im
           ausgelieferten HTML unmittelbar hinter <div class="product-price">
           — genau die Stelle, die Christian benennt — und gehört allein
           dieser Route. Dass „hinter" auch optisch „in derselben Zeile"
           heißt, macht die Regel .qm-pdp .Bestseller-Price in
           app/styles/qi-master.css; „in klein" ist dort --qm-fs-xs, also
           kleiner als die 2rem des Preises. */
        priceLabel={
          <>
            <p className="qm-steuerhinweis">inkl. 19 % MwSt.</p>
            {/* Christians Fassung vom 22.09.2026 an der Stelle der
                abgelösten Vorverkaufstreppe — aus der einen Quelle
                app/data/qi-master-wortlaut.json. */}
            <QiMasterWortlaut kompakt />
          </>
        }
        benefitList={
          <QiMasterBenefitList zusatzPunkt={<EuGewaehrleistungsListenpunkt />} />
        }
      />
      <QiMaster />
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
