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
    products: [data.qione, data.bracelet, data.kette, data.qihome]
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
    variants(first: 30) {
      nodes {
        ...ExclusiveProductVariant
      }
    }
  }

  query ExclusiveProducts {
    qione: product(handle: "qione-2-pro") {
      ...ExclusiveProduct
    }
    bracelet: product(handle: "qibracelet") {
      ...ExclusiveProduct
    }
    kette: product(handle: "qione-kette") {
      ...ExclusiveProduct
    }
    qihome: product(handle: "qihome-air") {
      ...ExclusiveProduct
    }
  }
`;
