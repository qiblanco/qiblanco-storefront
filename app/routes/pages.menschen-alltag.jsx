import {useLoaderData} from 'react-router';
import {MenschenAlltag} from '~/components/campaign/MenschenAlltag';
import {HydrationsRettung} from '~/components/reusables/HydrationsRettung';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';
import lpASeiteStyles from '~/styles/schlaf-zellen-schutz-seite.css?url';
import menschenAlltagStyles from '~/styles/menschen-alltag.css?url';

/**
 * STUFE B des Funnel-Managers: /pages/menschen-alltag — „Menschen und Alltag
 * statt Zellen" (Grossjob 20261007-GROSSJOB-funnel-manager-customer-journey-
 * ad-lp, Segment s02; Christian 07.10.2026). Was die Seite anders macht und
 * was sie mit Absicht gleich lässt, steht in components/campaign/
 * MenschenAlltag.jsx.
 *
 * WER HIERHER KOMMT: heute niemand. Die Seite ist nirgends verlinkt und bis
 * zum Testgewinn noindex. Verkehr bekommt sie erst, wenn Segment s04 den
 * Stufe-B-Arm der Ad-Weiche einschaltet (zuteilung.json `ad_weiche_b`). Den
 * Arm bringt ein eigener PR (Zweig feat/stufe-b-arm-20261007,
 * lib/ad-weiche-stufe-b.server.js); er nimmt diesen Pfad auch in die
 * AUSSCHLUSS_SEGMENTE der Weiche auf, sonst schickte sie bezahlten Verkehr
 * von hier zurück auf A.
 *
 * KEIN eigener Split hier: B rendert immer B.
 */
export function links() {
  // Das Token-System von A (Kit, dann seiteneigene Regeln von A für Kopf,
  // Vertrauenszeile und Zahlarten), danach die wenigen Regeln von B — alle
  // aus denselben Tokens. Reihenfolge = Kaskade.
  return [
    {rel: 'stylesheet', href: lpAStyles},
    {rel: 'stylesheet', href: lpASeiteStyles},
    {rel: 'stylesheet', href: menschenAlltagStyles},
  ];
}

/**
 * noindex, nofollow wie A — B ist eine Testfläche und darf bis zum Testgewinn
 * nicht in den Index. BEWUSST KEIN canonical (wie A): noindex + fremdes
 * canonical sind widersprüchliche Signale (Konzept §3, D-006).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Ruhe zu Hause, obwohl überall WLAN ist | QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusätzlich zum Meta-Tag; no-store, damit keine Proxy-Kopie
 * entsteht, solange die Seite ein Testarm ist (wie A).
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
      '[preis-fallback] Campaign-Query (Stufe B) fehlgeschlagen:',
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

export default function MenschenAlltagRoute() {
  const {products} = useLoaderData();
  return (
    <>
      {/* Dieselbe Hydrations-Rettung wie A (Begründung in der Komponente). */}
      <HydrationsRettung />
      <MenschenAlltag products={products} />
    </>
  );
}

/* Dieselbe Abfrage wie A, eigener Operationsname (Codegen verlangt Eindeutigkeit;
   Hausmuster der V2- und B-Route). */
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

  query CampaignProductsMenschenAlltag($country: CountryCode, $language: LanguageCode)
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
