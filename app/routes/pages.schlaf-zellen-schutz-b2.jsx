import {useLoaderData} from 'react-router';
import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';
import {HydrationsRettung} from '~/components/reusables/HydrationsRettung';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';
import lpASeiteStyles from '~/styles/schlaf-zellen-schutz-seite.css?url';
import externeStimmenStyles from '~/styles/externe-stimmen.css?url';

/**
 * VARIANTE B2 der Ads-LP /pages/schlaf-zellen-schutz — zweiter Arm neben E1
 * (Grossjob „LP-Tests je Gerät, Sticky isoliert“, s02; Christian 10.10.2026:
 * „Vielleicht ist der feste Kaufknopf zu aggressiv, das muss dann mobil auch
 * nochmal mit der alten Ansicht und mehr Knöpfen getestet werden.").
 *
 * Diese Seite IST Seite A plus genau die Änderung der Hypothese GS-126 —
 * dieselbe Komponente, dieselben Stylesheets, derselbe Loader-Inhalt wie A und
 * B. Die Änderung steckt allein in der Variante b2 (components/campaign/
 * SchlafZellenSchutz.jsx): die Weiter-Knöpfe nr=1 und nr=2 an ihren Stellen
 * von vor dem 20.09., KEIN fester Kaufknopf. Mobil und desktop gleich.
 *
 * Wer hierher kommt: 15 % der Eintritte auf A (die obersten Eimer desselben
 * Salzes wie B, also nie dieselben Besucher wie B), gewürfelt im Loader von A
 * (lib/lp-ab-v2.server.js, entscheideLpExperiment). Die Ad-Weiche schließt
 * diesen Pfad aus (ad-weiche.server.js), sonst schickte sie bezahlten Verkehr
 * zurück auf A — und A wieder hierher.
 *
 * KEIN eigener Split hier: B2 rendert immer B2.
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
 * noindex, nofollow wie A und B — B2 ist eine Testfläche und darf nie in den Index.
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
      '[preis-fallback] Campaign-Query (Variante B2) fehlgeschlagen:',
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

export default function SchlafZellenSchutzVarianteB2Route() {
  const {products} = useLoaderData();
  return (
    <>
      {/* Dieselbe Hydrations-Rettung wie A (Begründung in der Komponente). */}
      <HydrationsRettung />
      <SchlafZellenSchutz products={products} variante="b2" />
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

  query CampaignProductsSchlafZellenSchutzB2($country: CountryCode, $language: LanguageCode)
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
