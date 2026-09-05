import {useLoaderData} from 'react-router';
import {Superhuman} from '~/components/kurse/Superhuman';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Qi Blanco | ${data?.page.title ?? ''}`},
    canonicalLink('/pages/superhuman'),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'superhuman'); // ✅ Static handle

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold.
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle,
      },
    }),
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: page});

  return {page};
}

/**
 * Load data for rendering content below the fold (deferred)
 * @param {LoaderFunctionArgs} args
 */
function loadDeferredData({context}) {
  return {};
}

export default function KakaoPage() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  return (
    <>
     <Superhuman /> 
    </>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */