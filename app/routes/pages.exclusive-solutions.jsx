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
  const data = await context.storefront.query(EXCLUSIVE_PRODUCTS_QUERY, {
    cache: context.storefront.CacheShort(),
  });

  return {
    products: [data.fundament, data.unabhaengig, data.erholungsResidenz]
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

  query ExclusiveProducts {
    fundament: product(handle: "bundle-fundament") {
      ...ExclusiveProduct
    }
    unabhaengig: product(handle: "bundle-unabhangig") {
      ...ExclusiveProduct
    }
    erholungsResidenz: product(handle: "bundle-erholungs-residenz") {
      ...ExclusiveProduct
    }
  }
`;
