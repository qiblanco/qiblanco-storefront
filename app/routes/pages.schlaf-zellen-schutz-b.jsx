import {useLoaderData} from 'react-router';
import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';
import {HydrationsRettung} from '~/components/reusables/HydrationsRettung';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';
import lpASeiteStyles from '~/styles/schlaf-zellen-schutz-seite.css?url';
import externeStimmenStyles from '~/styles/externe-stimmen.css?url';

/**
 * VARIANTE B der Ads-LP /pages/schlaf-zellen-schutz — Experiment-Kreislauf E1
 * (Grossjob 20261006-GROSSJOB-lp-experimente-schlaf-zellen-schutz-variante-b-
 * 15pct-kreislauf, Christian 06.10.2026: „eine zweite Landingpage von Zelle
 * Schlaf Schutz, auf der 15 % der User fließen und an der konkrete Hypothesen
 * getestet werden").
 *
 * Diese Seite IST Seite A plus genau die Änderung der laufenden Hypothese —
 * dieselbe Komponente, dieselben Stylesheets, derselbe Loader-Inhalt. Die
 * Änderung steckt allein in `variante="b"` (components/campaign/
 * SchlafZellenSchutz.jsx). So kann B nie still von A wegdriften: jeder
 * Umbau an A erreicht B im selben Commit, und der Unterschied zwischen den
 * Armen bleibt die eine Hypothese.
 *
 * Test 1 (Hypothesen GS-050 + GS-056, geschaeftssteuerung/data/hypothesen.json):
 * der Kaufknopf nach dem Mechanismus-Block kehrt zurück (lp-a-weiter-1, bis
 * 20.09. live) und mobil steht ab dem zweiten Bildschirm ein Kaufknopf unten.
 *
 * Wer hierher kommt: 15 % der Eintritte auf A, stabil je Besucher, gewürfelt
 * im Loader von A (lib/lp-ab-v2.server.js, entscheideLpExperiment). Die
 * Ad-Weiche schließt diesen Pfad aus (ad-weiche.server.js), sonst schickte
 * sie bezahlten Verkehr zurück auf A.
 *
 * KEIN eigener Split hier: würfelte B selbst, könnte ein Besucher zwischen
 * den Armen pendeln. B rendert immer B.
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
 * noindex, nofollow wie A — B ist eine Testfläche und darf nie in den Index.
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
      '[preis-fallback] Campaign-Query (Variante B) fehlgeschlagen:',
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

export default function SchlafZellenSchutzVarianteBRoute() {
  const {products} = useLoaderData();
  return (
    <>
      {/* Dieselbe Hydrations-Rettung wie A (Begründung in der Komponente). */}
      <HydrationsRettung />
      <SchlafZellenSchutz products={products} variante="b" />
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

  query CampaignProductsSchlafZellenSchutzB($country: CountryCode, $language: LanguageCode)
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
