import {redirect} from '@shopify/remix-oxygen';
// `data` umbenannt importiert: der meta()-Export destrukturiert selbst ein
// Argument namens `data` und würde den Import sonst beschatten (Muster aus
// `pages.$handle.jsx`).
import {data as mitHeadern, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  canonicalLink,
  istNichtIndexierbareKollektion,
  noindexHeader,
  noindexMeta,
} from '~/lib/seo';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, params}) => {
  // Stand vorher: `Hydrogen | <Name> Collection` — der Vorgabewert des
  // Hydrogen-Starters. Er stand auf JEDER Kollektionsseite im Browser-Tab und
  // in der Google-Trefferzeile: der Name des Frameworks und das englische Wort
  // "Collection" neben einem deutschen Kollektionsnamen (live gemessen
  // 2026-08-22: <title>Hydrogen | Digitale Kurse Collection</title>).
  // Muster wie cart.jsx und collections.all.jsx: "<Seite> | Qi Blanco".
  const tags = [{title: `${data?.collection.title ?? 'Kollektion'} | Qi Blanco`}];

  // ENTWEDER noindex ODER canonical (s04, 2026-08-26) — dieselbe Regel wie in
  // `pages.$handle.jsx` und `pages.uebersicht.jsx`. Die Liste steht in
  // ~/lib/seo, damit sie nicht neben einer zweiten in der Sitemap-Route driftet.
  if (istNichtIndexierbareKollektion(params?.handle)) {
    tags.push(noindexMeta());
    return tags;
  }

  // WARUM DER canonical DIE PAGINIERUNG BEWUSST EINSAMMELT: `absoluteCanonical`
  // wirft Query und Hash weg, `/collections/x?cursor=…&direction=next` zeigt
  // also auf `/collections/x`. Für die verbreitete `?page=N`-Paginierung wäre
  // das falsch (Google rät ausdrücklich davon ab, Seite 2 auf Seite 1 zu
  // kanonisieren). Hydrogen paginiert hier aber CURSOR-basiert: die Parameter
  // sind opake Zeiger, dieselbe Produktmenge ist über beliebig viele
  // verschiedene Cursor-URLs erreichbar, und ein Cursor altert mit dem
  // Sortiment. Ein Selbst-canonical je Cursor-URL würde also unbegrenzt viele
  // fast gleiche URLs in den Index einladen — genau der Fall, für den es
  // canonical gibt.
  if (params?.handle) tags.push(canonicalLink(`/collections/${params.handle}`));
  return tags;
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const payload = {...deferredData, ...criticalData};

  // Zweite Hälfte des noindex-Doppelgates (Hausmuster D-006): greift auch bei
  // einem Bot, der den HTML-head nicht parst. `data()` greift NUR im
  // noindex-Fall; alle übrigen Kollektionen geben unverändert das nackte
  // Objekt zurück. Gegenprobe zur Header-Kette steht in `pages.$handle.jsx`:
  // `app/root.jsx` exportiert kein `headers`, die CSP-Header setzt
  // `entry.server.jsx` ausserhalb der Routen-Kette — es geht nichts verloren.
  if (istNichtIndexierbareKollektion(args.params?.handle)) {
    return mitHeadern(payload, {headers: noindexHeader()});
  }

  return payload;
}

/**
 * Reicht ausschließlich das X-Robots-Tag des Loaders durch und erbt sonst
 * unverändert, was der Elternbaum liefert. Bewusst NICHT `loaderHeaders` als
 * Ganzes: das machte auch jeden künftigen Loader-Header (Cache-Control,
 * Set-Cookie) ungeprüft zum Dokument-Header.
 * @type {HeadersFunction}
 */
export const headers = ({loaderHeaders, parentHeaders}) => {
  const kopf = new Headers(parentHeaders);
  const robots = loaderHeaders?.get('X-Robots-Tag');
  if (robots) kopf.set('X-Robots-Tag', robots);
  return kopf;
};

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();

  return (
    <div className="collection">
      <h1>{collection.title}</h1>
      <p className="collection-description">{collection.description}</p>
      <PaginatedResourceSection
        connection={collection.products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
