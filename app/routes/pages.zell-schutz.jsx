import {useLoaderData} from 'react-router';
import {ZellSchutz} from '~/components/campaign/ZellSchutz';
import lpBStyles from '~/styles/zell-schutz.css?url';

/**
 * Ad-Landingpage /pages/zell-schutz — ZELLSCHUTZ „Der Zellversuch als Held".
 *
 * LP B der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 B):
 * ERSATZ des frueheren Startseiten-Klons (HomepageSections-overrides) durch eine
 * echte Zellschutz-Campaign-Route an DERSELBEN URL. Ads, die heute auf
 * /pages/zell-schutz zeigen (TOF Therapeutin/Praktikerin-Strecke), profitieren
 * ohne Ad-Edit vom echten Thema. Rollback = git revert dieses Commits.
 *
 * Eigenes Token-Designsystem (styles/zell-schutz.css, Scope .lp-b3), uebernommen
 * aus dem 93/100-Rezept der LP A. KEINE DreiThemenBand (B ist Einzelthema).
 *
 * Das Tracking (R1/R2/R3-Kette) haengt pfad-agnostisch im root-Layout — der
 * Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel (D-006,
 * keine Doppelzaehlung).
 */
export function links() {
  return [{rel: 'stylesheet', href: lpBStyles}];
}

/**
 * noindex, nofollow (Meta-robots) — BEWUSST KEIN canonical:
 * noindex + fremdes canonical = widerspruechliche Signale (Konzept §3, D-006).
 * Der fruehere Klon war ebenfalls noindex,nofollow — Stand bleibt erhalten.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Zellschutz, den man messen kann — QiOne® 2 Pro | Qi Blanco'},
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

export default function ZellSchutzRoute() {
  const {products} = useLoaderData();
  return <ZellSchutz products={products} />;
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

  query CampaignProductsZellSchutz {
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
