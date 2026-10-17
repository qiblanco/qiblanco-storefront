import {useLoaderData} from 'react-router';
import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';
import {HydrationsRettung} from '~/components/reusables/HydrationsRettung';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';
import lpASeiteStyles from '~/styles/schlaf-zellen-schutz-seite.css?url';
import externeStimmenStyles from '~/styles/externe-stimmen.css?url';

/**
 * VARIANTE K25 der Ads-LP /pages/schlaf-zellen-schutz (Job 20261017-ads-lp-
 * radikal-kurz-tests-gs079-durch-sim-tor; Christian 17.10.2026: „und auch mal
 * radikale Ideen testen, wo die LP für die Ads deutlich kürzer ist. Also eine
 * Gewinner-LP dann kürzen, um zu schauen, wie die Effekte sind.").
 *
 * Diese Seite IST Seite A, gekürzt auf Radikal-Kurz GS-174 (rund ein Viertel der Seite: Kopf, Bewertungen, Garantie,
 * Preisblock, Schluss).
 * Dieselbe Komponente, dieselben Stylesheets, derselbe Loader-Inhalt wie A;
 * die Kürzung steckt allein in der Variante k25 (components/campaign/
 * SchlafZellenSchutz.jsx). Kein Satz ist umformuliert.
 *
 * Wer hierher kommt: niemand, solange E4_AKTIV in lib/lp-ab-v2.server.js
 * false steht; danach 15 % der Eintritte auf A (szs-e4-gs174, Definition in
 * heatmap-manager/config/experimente.yaml). Vorschau und Tor rufen den Pfad
 * direkt auf; der Pin ?lp_exp=k25 auf A wirkt erst, wenn der Arm steht.
 * Die Ad-Weiche schließt diesen Pfad aus.
 *
 * KEIN eigener Split hier: K25 rendert immer K25.
 */
export function links() {
  // Dieselben drei Stylesheets wie A, in derselben Reihenfolge (Kaskade).
  return [
    {rel: 'stylesheet', href: lpAStyles},
    {rel: 'stylesheet', href: lpASeiteStyles},
    {rel: 'stylesheet', href: externeStimmenStyles},
  ];
}

/**
 * noindex, nofollow wie A und B — K25 ist eine Testfläche und darf nie in den Index.
 * BEWUSST KEIN canonical (wie A und V2): noindex + fremdes canonical sind
 * widersprüchliche Signale (Konzept §3, D-006).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Wirkt auf drei Ebenen | QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusätzlich zum Meta-Tag; no-store, damit keine Proxy-Kopie
 * entsteht (wie A).
 * @type {HeadersFunction}
 */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

export async function loader({context}) {
  let data;
  try {
    data = await context.storefront.query(CAMPAIGN_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED wie A: letzter bekannter guter Preis statt 500er.
    console.error(
      '[preis-fallback] Campaign-Query (Variante K25) fehlgeschlagen:',
      fehler?.message || fehler,
    );
    return {products: []};
  }

  return {
    products: [data.qione, data.bracelet, data.qihome]
      .filter(Boolean)
      .map((product) => ({
        ...product,
        images: product.images?.nodes || [],
      })),
  };
}

export default function SchlafZellenSchutzVarianteK25Route() {
  const {products} = useLoaderData();
  return (
    <>
      {/* Dieselbe Hydrations-Rettung wie A (Begründung in der Komponente). */}
      <HydrationsRettung />
      <SchlafZellenSchutz products={products} variante="k25" />
    </>
  );
}

/* Dieselbe Abfrage wie A, eigener Operationsname (Codegen verlangt Eindeutigkeit;
   Hausmuster der V2-Route). */
const CAMPAIGN_PRODUCTS_QUERY = `#graphql
  fragment CampaignProduct on Product {
    handle
    title
    featuredImage {
      url
      altText
    }
    images(first: 1) {
      nodes {
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }

  query CampaignProductsSchlafZellenSchutzK25($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...CampaignProduct
    }
    bracelet: product(handle: "qibracelet") {
      ...CampaignProduct
    }
    qihome: product(handle: "qihome-air") {
      ...CampaignProduct
    }
  }
`;

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
