import {useLoaderData} from 'react-router';
import {Partner} from '~/components/campaign/Partner';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import partnerStyles from '~/styles/partner.css?url';

/**
 * Partner-/Empfehlungs-Landingpage /pages/partner (Grossjob
 * 20260726-partner-affiliate-manager-programm s05).
 *
 * Ziel-URL für Partner-Traffic (UpPromote-Links `?sca_ref=...` + Empfehlungs-
 * Codes) statt roher Produktseiten. Vertrauensseite: Empfehlungs-Kontext,
 * Wirkmechanismus kohärenten Wassers, Studien-Fakten, Code-Einlöse-Hinweis,
 * Links in den LP-Block (blockLinks, BLOCK_LP).
 *
 * DESIGN: nutzt das bewährte Token-System der LP A als geteilte Token-Quelle
 * (styles/schlaf-zellen-schutz.css, Scope .lp-a3 — gleiches Muster wie die
 * Campaign-PDP /pages/qione-2-pro) + additive styles/partner.css (nur
 * lp-pt-*-Regeln, keine Änderung an Bestandsdateien).
 *
 * TRACKING-NAHT: KEIN Redirect in diesem Loader, KEIN eigener Pixel-Code
 * (R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout, D-006). Der
 * `sca_ref`-Query-Param bleibt dadurch unangetastet und erreicht die Order
 * über Shopifys natives landing_site-Feld (s02-Befund, empirisch belegt).
 * KEINE neuen Cookies — TRACKING_COOKIE_NAMES bleibt unverändert.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: partnerStyles},
  ];
}

/**
 * noindex, nofollow — Partner-Traffic kommt über persönliche Links/Codes,
 * nicht über Suche; BEWUSST KEIN canonical (noindex + fremdes canonical =
 * widersprüchliche Signale, Hausmuster D-006).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Auf Empfehlung hier — kohärentes Wasser verstehen | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusätzlich (Gurt + Hosenträger, Hausmuster D-006).
 * Cache-Control: no-store wie die Schwester-LPs — die Seite ist noindex und
 * trägt dynamische Markt-Preise; eine CDN-Kopie würde einen fremden
 * Markt-Preis einfrieren. Fail-Richtung „nie cachen" ist hier gratis.
 * @type {HeadersFunction}
 */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

export async function loader({context}) {
  let data;
  try {
    data = await context.storefront.query(PARTNER_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED (Hausmuster M1, 20260718-lp-preise-dynamisch-binden-
    // gestuft): Storefront-API nicht erreichbar -> leere Produktliste; die
    // Komponenten zeigen den letzten bekannten guten Preis aus
    // campaign-fallback-prices (+ Warnung) statt eines 500ers.
    console.error(
      '[preis-fallback] Partner-Query fehlgeschlagen:',
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

export default function PartnerRoute() {
  const {products} = useLoaderData();
  return <Partner products={products} />;
}

const PARTNER_PRODUCTS_QUERY = `#graphql
  fragment PartnerProduct on Product {
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

  query CampaignProductsPartner($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...PartnerProduct
    }
    bracelet: product(handle: "qibracelet") {
      ...PartnerProduct
    }
    qihome: product(handle: "qihome-air") {
      ...PartnerProduct
    }
  }
`;

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
