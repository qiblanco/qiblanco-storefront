import {useLoaderData} from 'react-router';
import { Kakao } from '~/components/product-pages/Kakao';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // Derselbe Hydrogen-Gerüst-Titel wie in `pages.superhuman.jsx`, hier aber
  // OHNE Live-Wirkung: /pages/kristall-kakao antwortet mit 301 auf
  // /pages/crystal-cacao (gemessen 2026-09-05, ein Redirect, Zieltitel
  // korrekt). Diese Route rendert heute nie. Sie wird trotzdem mitgezogen,
  // weil sie beim nächsten Rückbau des Redirects wieder ausgeliefert würde
  // — dann wäre der Scaffold-Titel sofort wieder live.
  //
  // NICHT MITGEZOGEN und hier benannt, damit es beim Rückbau nicht untergeht:
  // der canonical-Descriptor unten hat die im Kopf von ~/lib/seo.js
  // beschriebene wirkungslose Form (ohne `tagName` rendert react-router 7
  // daraus `<meta rel="canonical">` statt `<link>`, und der Pfad ist relativ).
  // Er bleibt unverändert, weil die richtige Ziel-URL für eine Route, die
  // nie ausgeliefert wird, nicht messbar ist — ein Rateergebnis wäre hier
  // schlechter als der sichtbare Defekt.
  const roh = data?.page?.seo?.title || data?.page?.title || '';
  return [
    {title: roh ? `${roh} | Qi Blanco` : 'Qi Blanco'},
    {
      rel: 'canonical',
      href: `/pages/kristall-kakao`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'kristall-kakao'); // ✅ Static handle

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
     <Kakao /> 
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