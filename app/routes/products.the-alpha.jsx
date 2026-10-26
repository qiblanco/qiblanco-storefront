import {redirect, useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {TheAlphaShop} from '~/components/campaign/TheAlphaShop';
import shopStyles from '~/styles/the-alpha-produkt.css?url';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {istVorschauNoindex} from '~/lib/vorschau-noindex';
import {QM_ADDONS_QUERY, QM_HANDLES} from '~/lib/qi-master-addons';

/** Der kanonische Pfad dieser Kaufseite (Christian Z4, 25.10.2026). */
const THE_ALPHA_PDP_PFAD = '/products/the-alpha';

/*
 * SEIT 2026-10-26 (Segment s12): /products/the-alpha zeigt die NEUE Shopseite
 * nach Christians Figma-Spalte und der Apple-Kaufseite (Z9: „so habe im
 * gleichen link nochmal einen neue shopseite gebaut, sie soll sehr nahe an dem
 * hier gebaut werden aber eben nur mit den inhalten die ich definiert habe“).
 * Seite: components/campaign/TheAlphaShop.jsx, Daten the-alpha-shop-daten.js,
 * Stil styles/the-alpha-produkt.css. Die bisherige Kaufseite (QiOneBuyBox +
 * QiMaster-Sektionen) lebt unverändert als B-Fassung unter
 * /products/the-alpha-b (products.the-alpha-b.jsx, Christian Z10). Rückweg:
 * den Default-Export unten wieder auf die Fassung aus products.the-alpha-b.jsx
 * setzen (oder hb-deploy revert des s12-PR). Was unten über BuyBox, Add-ons
 * und Steuerhinweis steht, gilt seitdem für die B-Fassung.
 *
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
  return [{rel: 'stylesheet', href: shopStyles}];
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
      {title: `${data?.product?.title ?? 'Qi Alpha'} | ${MARKE}`},
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
    produkt: data?.product && {...data.product, handle: 'the-alpha'},
    marktLand: data?.marktLand,
    pfad: THE_ALPHA_PDP_PFAD,
    titel: `${data?.product?.title ?? 'Qi Alpha'} | ${MARKE}`,
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
      wunschnummer: addonDaten?.wunschnummerNeu ?? addonDaten?.wunschnummer ?? null,
      kette: addonDaten?.ketteNeu ?? addonDaten?.kette ?? null,
    },
  };
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, addons} = useLoaderData();
  return <TheAlphaShop product={product} addons={addons} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
