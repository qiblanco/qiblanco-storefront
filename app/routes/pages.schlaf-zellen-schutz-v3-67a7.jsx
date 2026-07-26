import {useLoaderData} from 'react-router';
import {SchlafZellenSchutzV3} from '~/components/campaign/SchlafZellenSchutzV3';
import {istV3Aus} from '~/lib/lp-v3.server';
import lpV3Styles from '~/styles/schlaf-zellen-schutz-v3-67a7.css?url';

/**
 * LP-V3 /pages/schlaf-zellen-schutz-v3-67a7 — Review-Artefakt im Apple/
 * Microsoft-Stil (Grossjob 20260726-lp-v3-apple-microsoft-scrollanim),
 * aufgebaut aus der LP-V2 (/pages/schlaf-zellen-schutz-v2-18ef).
 *
 * Der Slug ist DETERMINISTISCH abgeleitet (sha256 des Job-Schluessels
 * "<job-id>/pages-v3", Hex4 = 67a7) — ein Retry erzeugt denselben Pfad
 * statt eines zweiten Geisterpfads (V2-Muster).
 *
 * KEIN A/B, KEIN Ad-Eintritt: nichts verlinkt hierher, die Ad-Weiche
 * führt diese Route in AUSSCHLUSS_SEGMENTE (ein geteilter Review-Link
 * mit fbclid darf nicht auf LP A umgeleitet werden). Die Split-Logik
 * lp-ab-v2.server.js bleibt unberuehrt.
 *
 * KILL: LP_V3_MODE='off' (Oxygen-Env) -> 404 ohne Deploy; Entscheidung in
 * lib/lp-v3.server.js (hermetisch getestet). Rueckbau: hb-deploy revert.
 *
 * Tracking hängt pfad-agnostisch im root-Layout — der Loader fragt NUR
 * Produktdaten ab, KEINEN zusaetzlichen Pixel (D-006, keine Doppelzählung).
 * KEIN neuer Identitaets-Key, keine Aenderung an TRACKING_COOKIE_NAMES;
 * Varianten-Trennung allein über url_path + Namespace lp-v3-*.
 */
export function links() {
  return [{rel: 'stylesheet', href: lpV3Styles}];
}

/**
 * noindex, nofollow — Review-Artefakt darf weder ranken noch in KI-/
 * Suchmaschinen-Indizes laufen. Wie V2 BEWUSST OHNE canonical (noindex +
 * fremdes canonical = widerspruechliche Signale, D-006) — zugleich der
 * Duplicate-Content-Schutz gegenüber V2/LP A.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Wirkt auf drei Ebenen — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusaetzlich (Gurt + Hosenträger) + no-store: von einem
 * unverlinkten Review-Artefakt darf keine öffentliche Kopie entstehen.
 * Dritter Riemen: robots.txt-Disallow ([robots.txt].jsx).
 * @type {HeadersFunction}
 */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

export async function loader({context}) {
  // KILL-Flag zuerst: explizites LP_V3_MODE='off' nimmt die Seite vom Netz.
  if (istV3Aus(context.env)) {
    throw new Response('Not Found', {status: 404});
  }

  let data;
  try {
    data = await context.storefront.query(CAMPAIGN_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED wie V2/LP A: Storefront-API nicht erreichbar -> leere
    // Produktliste; die Komponente zeigt den letzten bekannten guten Preis
    // aus campaign-fallback-prices statt eines 500ers. Preis-SSoT bleibt
    // Shopify, KEINE Hartpreise im Code.
    console.error(
      '[preis-fallback] Campaign-Query V3 fehlgeschlagen:',
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

export default function SchlafZellenSchutzV3Route() {
  const {products} = useLoaderData();
  return <SchlafZellenSchutzV3 products={products} />;
}

// Bestands-Query von V2 übernommen (gleiche drei Handles, @inContext,
// CacheShort) — QiBracelet ist EIN Produkt in drei Größen, also genau EIN
// Handle und genau EINE Karte im Produkt-Grid.
const CAMPAIGN_PRODUCTS_QUERY = `#graphql
  fragment CampaignProductV3 on Product {
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

  query CampaignProductsSchlafZellenSchutzV3($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...CampaignProductV3
    }
    bracelet: product(handle: "qibracelet") {
      ...CampaignProductV3
    }
    qihome: product(handle: "qihome-air") {
      ...CampaignProductV3
    }
  }
`;

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
