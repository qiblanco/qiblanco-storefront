import {useLoaderData} from 'react-router';
import { Kakao } from '~/components/product-pages/Kakao';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';

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
  // ZUNÄCHST LIEGENGELASSEN, DANN DOCH MITGEZOGEN — und der Grund gehört
  // hierher, weil er die Entscheidung umgedreht hat: der canonical-Descriptor
  // stand hier in der im Kopf von ~/lib/seo.js beschriebenen WIRKUNGSLOSEN
  // Form. Ohne `tagName` rendert react-router 7 daraus `<meta rel="canonical">`
  // statt `<link>`, und der Pfad war relativ — auf einem Oxygen-Preview-Host
  // kanonisiert das die Preview-URL auf sich selbst.
  //
  // Das CANONICAL-Gate von hb-deploy hat ihn beim ersten Lauf über diese Datei
  // gemeldet, und es hat recht: die RICHTIGE FORM ist bekannt, unabhängig
  // davon, ob die Route heute ausgeliefert wird. Nicht messbar war allein die
  // Ziel-URL — und die ist der EIGENE Pfad, nicht das Redirect-Ziel
  // /pages/crystal-cacao. Ein canonical sagt „das ist die kanonische Fassung
  // DIESER ausgelieferten Seite"; solange die 301 steht, wird hier nichts
  // ausgeliefert und der Descriptor bleibt folgenlos, und fällt sie weg, ist
  // die Seite wieder ihre eigene kanonische Fassung.
  const roh = data?.page?.seo?.title || data?.page?.title || '';
  return [
    {title: roh ? `${roh} | Qi Blanco` : 'Qi Blanco'},
    canonicalLink('/pages/kristall-kakao'),
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