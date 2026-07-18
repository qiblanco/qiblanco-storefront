import {useLoaderData} from 'react-router';
import {ExclusiveSolutions} from '~/components/campaign/ExclusiveSolutions';
import exclusiveSolutionsStyles from '~/styles/exclusive-solutions.css?url';

export function links() {
  return [{rel: 'stylesheet', href: exclusiveSolutionsStyles}];
}

export const meta = () => [
  {title: 'Exclusive Solutions - Qi Blanco'},
  {
    name: 'description',
    content:
      'Exclusive Solutions - die Premium-Landingpage fuer QiOne 2 Pro mit Social Proof, Studien und Klarna.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

export async function loader({context}) {
  // Bewusst KEINE Shopify-Bundle-Produkte mehr: Die Pakete werden aus den
  // Einzelprodukten zusammengesetzt (jede Komponente = eigenes Line Item),
  // der Paketpreis entsteht über einen automatisch angewendeten
  // Prozent-Rabattcode.
  let data;
  try {
    data = await context.storefront.query(EXCLUSIVE_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED (M2, Auftrag 20260718-lp-preise-dynamisch-binden-gestuft):
    // Storefront-API nicht erreichbar -> leere Produktliste; die Paket-Karten
    // zeigen den letzten bekannten guten Stand (fallback-Literale) und die
    // CTAs sind deaktiviert. Nie 0/leer/falsch rendern.
    console.error(
      '[preis-fallback] Exclusive-Query fehlgeschlagen:',
      fehler?.message || fehler,
    );
    return {products: []};
  }

  return {
    products: [data.qihomeAir, data.qione2Pro, data.qibracelet, data.qioneKette]
      .filter(Boolean)
      .map((product) => ({
        ...product,
        variants: product.variants?.nodes || [],
      })),
  };
}

export default function ExclusiveSolutionsRoute() {
  const {products} = useLoaderData();
  return <ExclusiveSolutions products={products} />;
}

const EXCLUSIVE_PRODUCTS_QUERY = `#graphql
  fragment ExclusiveProductVariant on ProductVariant {
    id
    title
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      handle
      title
    }
  }

  fragment ExclusiveProduct on Product {
    handle
    title
    featuredImage {
      url
      altText
      width
      height
    }
    variants(first: 50) {
      nodes {
        ...ExclusiveProductVariant
      }
    }
  }

  query ExclusiveProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qihomeAir: product(handle: "qihome-air") {
      ...ExclusiveProduct
    }
    qione2Pro: product(handle: "qione-2-pro") {
      ...ExclusiveProduct
    }
    qibracelet: product(handle: "qibracelet") {
      ...ExclusiveProduct
    }
    qioneKette: product(handle: "qione-kette") {
      ...ExclusiveProduct
    }
  }
`;
