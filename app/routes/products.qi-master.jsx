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
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {QiMasterTreppe} from '~/components/product-pages/QiMasterTreppe';
import {treppe as treppeRechnen} from '~/lib/qi-master-preisstufen';
import preisstufen from '~/data/qi-master-preisstufen.json';

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
 * 14.000 zufriedene Kunden") und <UpsellLineUp/> („Über 300 neue Nutzer im
 * Monat") bringen MARKENWEITE Zahlen mit und rendern sie auch auf dieser
 * Seite — genauso wie auf /products/qione-2-pro. Sie behaupten nichts über
 * den QiMaster, und sie bleiben, weil der Auftrag ausdrücklich dieselben
 * Bausteine verlangt. Dass markenweiter Sozialbeweis auf einer brandneuen
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
  return [{rel: 'stylesheet', href: qiMasterStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return produktMeta({
    produkt: data?.product,
    pfad: '/products/qi-master',
    titel: `${data?.product?.title ?? 'QiMaster'} | ${MARKE}`,
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

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
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

  // VORVERKAUFSTREPPE — hier und nicht in der Komponente. Welche Stufe gilt,
  // entscheidet das Datum; im Browser berechnet stünde sie NICHT im
  // ausgelieferten HTML (die Abnahme-Probe misst genau dieses HTML) und liefe
  // am Stufenwechsel zwischen Server- und Browserdatum auseinander.
  // Quelle ist app/data/qi-master-preisstufen.json — Prozentsätze, keine
  // ausgerechneten Preise; gerechnet wird EINMAL in ~/lib/qi-master-preisstufen.
  return {product, treppe: treppeRechnen(preisstufen)};
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, treppe} = useLoaderData();
  const {descriptionHtml} = product;

  return (
    <div className="qm-pdp">
      <QiOneBuyBox
        product={product}
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
        description={
          <div
            className="ProductDescription"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        }
        priceLabel={<QiMasterTreppe treppe={treppe} kompakt />}
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
