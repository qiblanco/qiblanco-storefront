import {useLoaderData} from 'react-router';
import {QiOneZellschutz} from '~/components/campaign/QiOneZellschutz';
import qioneZellschutzStyles from '~/styles/qione-zellschutz.css?url';

export function links() {
  return [{rel: 'stylesheet', href: qioneZellschutzStyles}];
}

export const meta = () => [
  {title: 'QiOne Zellschutz - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export async function loader({context}) {
  const data = await context.storefront.query(CAMPAIGN_PRODUCTS_QUERY, {
    cache: context.storefront.CacheShort(),
  });

  return {
    products: [data.qione, data.bracelet, data.qihome]
      .filter(Boolean)
      .map((product) => ({
        ...product,
        images: product.images?.nodes || [],
      })),
  };
}

export default function QioneZellschutzRoute() {
  const {products} = useLoaderData();
  return <QiOneZellschutz products={products} />;
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

  query CampaignProducts {
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
