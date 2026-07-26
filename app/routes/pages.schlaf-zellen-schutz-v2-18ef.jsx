import {useLoaderData} from 'react-router';
import {SchlafZellenSchutzV2} from '~/components/campaign/SchlafZellenSchutzV2';
import lpV2Styles from '~/styles/schlaf-zellen-schutz-v2-18ef.css?url';

/**
 * Ad-Landingpage /pages/schlaf-zellen-schutz-v2-18ef — VARIANTE B des
 * A/B-Tests gegen LP A /pages/schlaf-zellen-schutz (Grossjob
 * 20260726-scoring-standortbestimmung-lp-v2-psychobuild, s07 nach Konzept).
 *
 * Der Slug ist DETERMINISTISCH abgeleitet (sha256 des Job-/Segment-Schluessels,
 * Hex4 = 18ef) — ein Retry erzeugt denselben Pfad statt eines zweiten
 * Geisterpfads. Die Kette liest ihn aus state/v2_slug.txt; die Route heisst
 * exakt so, wie die Abnahme-Proben es erwarten.
 *
 * EINTRITT: Ads zeigen WEITER auf LP A. Der Split sitzt im LP-A-Loader
 * (lib/lp-ab-v2.server.js) und wirft cookie-los 302 hierher. Diese Route
 * steht deshalb in AUSSCHLUSS_SEGMENTE der Ad-Traffic-Weiche — sonst wuerfe
 * der root-Loader den bezahlten Traffic sofort auf LP A zurueck, LP A
 * splittete erneut, und es entstuende eine Endlosschleife ueber den gesamten
 * bezahlten Traffic (Konzept §0.3, Test test/lp-ab-v2.test.mjs).
 *
 * Eigenes Token-Designsystem (styles/schlaf-zellen-schutz-v2-18ef.css, Scope
 * .lp-v2) — bewusst eigener Token-Praefix --v2-*, damit bei Client-Navigation
 * zwischen den Varianten kein Stylesheet in das andere durchschlaegt.
 *
 * Das Tracking haengt pfad-agnostisch im root-Layout — der Loader fragt NUR
 * Produktdaten ab, KEINEN zusaetzlichen Pixel (D-006, keine Doppelzaehlung).
 * Die Varianten-Trennung in der Messung entsteht allein ueber den
 * unterschiedlichen url_path plus den Sektions-Namespace lp-v2-*: KEIN neuer
 * Identitaets-Key, kein neues Event, keine Aenderung an TRACKING_COOKIE_NAMES.
 */
export function links() {
  return [{rel: 'stylesheet', href: lpV2Styles}];
}

/**
 * noindex, nofollow — wie LP A und aus demselben Grund BEWUSST OHNE canonical
 * (noindex + fremdes canonical = widerspruechliche Signale, D-006). Bei zwei
 * inhaltsgleichen Varianten ist das zusaetzlich der Duplicate-Content-Schutz.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Wirkt auf drei Ebenen — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusaetzlich (Gurt + Hosentraeger) + no-store: solange der Split
 * laeuft, darf keine oeffentliche Kopie einer Variante existieren — sie wuerde
 * die Randomisierung einfrieren und die Messung verderben (Konzept §E.3).
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
    // FAIL-CLOSED wie LP A: Storefront-API nicht erreichbar -> leere
    // Produktliste; die Komponenten zeigen den letzten bekannten guten Preis
    // aus campaign-fallback-prices statt eines 500ers. Nie 0/leer/falsch
    // rendern — Preis-SSoT bleibt Shopify, KEINE Hartpreise im Code.
    console.error(
      '[preis-fallback] Campaign-Query V2 fehlgeschlagen:',
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

export default function SchlafZellenSchutzV2Route() {
  const {products} = useLoaderData();
  return <SchlafZellenSchutzV2 products={products} />;
}

// Bestands-Query von LP A uebernommen (gleiche drei Handles, @inContext,
// CacheShort) — QiBracelet ist EIN Produkt in drei Groessen, also genau EIN
// Handle und genau EINE Karte im Kaufblock.
const CAMPAIGN_PRODUCTS_QUERY = `#graphql
  fragment CampaignProductV2 on Product {
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

  query CampaignProductsSchlafZellenSchutzV2($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...CampaignProductV2
    }
    bracelet: product(handle: "qibracelet") {
      ...CampaignProductV2
    }
    qihome: product(handle: "qihome-air") {
      ...CampaignProductV2
    }
  }
`;

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
