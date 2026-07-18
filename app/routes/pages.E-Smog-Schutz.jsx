import {useLoaderData} from 'react-router';
import {redirect} from '@shopify/remix-oxygen';
import {ESmogSchutz} from '~/components/campaign/ESmogSchutz';
import lpDStyles from '~/styles/esmog-schutz.css?url';

/**
 * Ad-Landingpage /pages/E-Smog-Schutz — E-SMOG „Die unsichtbare Dauerbelastung,
 * ruhig erklaert".
 *
 * LP D der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 D):
 * NEUE Campaign-Route fuer die E-Smog-/Strahlungs-Ad-Strecke (heute ohne Ziel).
 * Christian-URL-Vorgabe: /pages/E-Smog-Schutz (Grossschreibung, Hydrogen-Routen
 * case-sensitiv). Damit der lowercase-Tippfehler /pages/e-smog-schutz nicht ins
 * Leere laeuft, kanonisiert der Loader jede abweichende Schreibweise per 301 auf
 * die kanonische URL (react-router matcht per Default case-insensitiv -> die
 * lowercase-Variante landet in diesem Loader und wird umgeleitet; robust gegen
 * JEDE Case-Variante, eine Zeile im Router-Layer). Die alte Info-Seite
 * pages.e-smog.jsx (anderes Muster) ist davon unberuehrt.
 *
 * Eigenes Token-Designsystem (styles/esmog-schutz.css, Scope .lp-d3), uebernommen
 * aus dem 93/100-Rezept der LP A/B. Ruhiger Luxus statt Alarm-Rot (Konzept 3.3 D).
 *
 * Das Tracking (R1/R2/R3-Kette) haengt pfad-agnostisch im root-Layout — der
 * Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel (D-006,
 * keine Doppelzaehlung).
 */
export const CANONICAL_PATH = '/pages/E-Smog-Schutz';

export function links() {
  return [{rel: 'stylesheet', href: lpDStyles}];
}

/**
 * noindex, nofollow (Meta-robots) — BEWUSST KEIN canonical-Link:
 * noindex + fremdes canonical = widerspruechliche Signale (Konzept §3, D-006).
 * Wird mit der Route geboren (im selben Commit), nie nachgezogen.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'E-Smog-Schutz — kohärentes Wasser als ruhiger Puffer | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusaetzlich (Gurt + Hosentraeger): greift auch, wenn ein Bot
 * das HTML-head nicht parst. Identische Wirkung laut Google-Doku (D-006).
 * @type {HeadersFunction}
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context, request}) {
  // Case-Kanonisierung: jede von der Grossschreibung abweichende Variante
  // (z.B. /pages/e-smog-schutz) 301 auf die kanonische URL, Query erhalten.
  const url = new URL(request.url);
  if (url.pathname !== CANONICAL_PATH) {
    throw redirect(CANONICAL_PATH + url.search, 301);
  }

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

export default function ESmogSchutzRoute() {
  const {products} = useLoaderData();
  return <ESmogSchutz products={products} />;
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

  query CampaignProductsESmogSchutz {
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
