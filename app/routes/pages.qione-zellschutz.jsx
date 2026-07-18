import {useLoaderData} from 'react-router';
import {redirect} from '@shopify/remix-oxygen';
import {QiOneZellschutz} from '~/components/campaign/QiOneZellschutz';
import {lpTestPausiert, lpAZiel} from '~/lib/lp-pause.server';
import qioneZellschutzStyles from '~/styles/qione-zellschutz.css?url';

export function links() {
  return [{rel: 'stylesheet', href: qioneZellschutzStyles}];
}

export const meta = () => [
  {title: 'QiOne Zellschutz - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export async function loader({request, context}) {
  // LP-PAUSE (Auftrag 20260718-ads-alle-auf-lp-a-redirect-pause): Ad-LP ohne
  // interne Verlinkung, 1 aktive Meta-Ad zeigt direkt hierher — waehrend der
  // Pause (zuteilung.json modus='aus') per 302 auf LP A, Query erhalten.
  if (await lpTestPausiert()) {
    throw redirect(lpAZiel(request.url), {
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

  query CampaignProducts($country: CountryCode, $language: LanguageCode)
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
