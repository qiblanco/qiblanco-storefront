/**
 * mmProducts — geteilte Live-Preis-Query + Loader-Helfer der neuen
 * Message-Match-/Trust-Ketten-Landingpages
 * (Job 20260723-neue-landingpages-message-match-trust-kette-welle-abc).
 *
 * WARUM: Alle neuen LPs zeigen Live-Preise aus der Storefront-API (nie
 * hartkodiert — homepage-bauer D-040/Preis-Kanon). Statt die Query in jede
 * Route zu kopieren, teilen sie sich diesen einen Helfer.
 *
 * FAIL-CLOSED (Muster pages.tiefer-schlaf): ist die Storefront-API nicht
 * erreichbar, liefert der Loader eine leere Produktliste; die Komponenten
 * zeigen dann Text/Fallback statt eines 500ers. Nie 0/leer/falsch rendern.
 *
 * KEIN Pixel/Tracking hier: der Loader fragt NUR Produktdaten ab; die
 * R1/R2/R3-Kette haengt pfad-agnostisch im root-Layout (keine Doppelzaehlung).
 */

export const MM_PRODUCTS_QUERY = `#graphql
  fragment MmProduct on Product {
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

  query MmCampaignProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") { ...MmProduct }
    bracelet: product(handle: "qibracelet") { ...MmProduct }
    qihome: product(handle: "qihome-air") { ...MmProduct }
  }
`;

export async function mmLadeProdukte(context) {
  let data;
  try {
    data = await context.storefront.query(MM_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    console.error(
      '[mm-preis-fallback] Campaign-Query fehlgeschlagen:',
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
