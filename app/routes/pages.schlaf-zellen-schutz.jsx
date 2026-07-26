import {redirect, useLoaderData} from 'react-router';
import {SchlafZellenSchutz} from '~/components/campaign/SchlafZellenSchutz';
import {entscheideLpAbV2} from '~/lib/lp-ab-v2.server';
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
 *
 * Cache-Control: no-store (s07, Konzept §E.3 Auflage 2) — waehrend des A/B-
 * Splits darf keine CDN-/Proxy-Kopie dieses Dokuments existieren: sie wuerde
 * EINE Variante einfrieren und damit die Randomisierung toeten. Bewusst
 * UNKONDITIONAL statt env-abhaengig: der statische headers()-Export sieht die
 * Env nicht, und die Fail-Richtung „nie cachen" ist hier gratis — die Seite
 * ist noindex, traegt dynamische Preise und steht ohnehin hinter zwei 302-
 * Weichen. Kein Verlust, wenn der Split aus ist.
 * @type {HeadersFunction}
 */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

export async function loader({context, request}) {
  // A/B-SPLIT V1 gegen V2 (s07, Konzept §E.1): ein Teil der Eintritte wird
  // cookie-los per 302 auf die V2-Route umgeleitet — VOR jeder Datenarbeit,
  // damit ein Split-Treffer keine Storefront-Query kostet. Kill
  // LP_AB_V2_MODE !== 'on' => 100 % diese Seite (Fail-Richtung auf den
  // Bestand). Der rohe Query faehrt byte-identisch mit (zielUrl-Invariante).
  const v2 = entscheideLpAbV2(request, context.env);
  if (v2) {
    throw redirect(v2.ziel, {
      status: 302,
      headers: {'Cache-Control': 'no-store'},
    });
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
