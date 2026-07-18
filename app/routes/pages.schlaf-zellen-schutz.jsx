import {useLoaderData} from 'react-router';
import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';
import lpAStyles from '~/styles/schlaf-zellen-schutz.css?url';

/**
 * Ad-Landingpage /pages/schlaf-zellen-schutz — ALLROUNDER „Wirkt auf drei Ebenen".
 *
 * LP A der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept): breiter
 * Erst-Kontakt / Perspektiven-Einstieg. Additiv, kein Ad zeigt (noch) darauf.
 *
 * Eigenes Token-Designsystem (styles/schlaf-zellen-schutz.css, Scope .lp-a3);
 * NUTZT die vorhandene DreiThemenBand aus dem Bestand (~/components/redesign).
 *
 * Das Tracking (R1/R2/R3-Kette) haengt pfad-agnostisch im root-Layout — der
 * Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel (D-006,
 * keine Doppelzaehlung).
 */
export function links() {
  return [{rel: 'stylesheet', href: lpAStyles}];
}

/**
 * noindex, nofollow (Meta-robots) — BEWUSST KEIN canonical:
 * noindex + fremdes canonical = widerspruechliche Signale (Konzept §3, D-006).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Wirkt auf drei Ebenen — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusaetzlich (Gurt + Hosentraeger): greift auch, wenn ein Bot
 * das HTML-head nicht parst. Identische Wirkung laut Google-Doku (D-006).
 * @type {HeadersFunction}
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  let data;
  try {
    data = await context.storefront.query(CAMPAIGN_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED (M1, Auftrag 20260718-lp-preise-dynamisch-binden-gestuft):
    // Storefront-API nicht erreichbar -> leere Produktliste; die Komponenten
    // zeigen den letzten bekannten guten Preis aus campaign-fallback-prices
    // (+ Warnung) statt eines 500ers. Nie 0/leer/falsch rendern.
    console.error(
      '[preis-fallback] Campaign-Query fehlgeschlagen:',
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

export default function SchlafZellenSchutzRoute() {
  const {products} = useLoaderData();
  return <SchlafZellenSchutz products={products} />;
}

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

  query CampaignProductsSchlafZellenSchutz($country: CountryCode, $language: LanguageCode)
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
