import {useLoaderData} from 'react-router';
import {canonicalLink} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';
import {KakaoKurs} from '~/components/kurse/KakaoKurs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // GEO M5-F2 (2026-10-11, SAGEO), Job
  // 20261011-geo-sageo-m5f2-strukturfelder-ratgeber-de-us-crystal:
  // Title höchstens 60 Zeichen mit Gegenstand,
  // Marke am Ende (Seitenregel R3); Meta 120-160 Zeichen mit Zahlen, die die
  // Seite sichtbar trägt (R4). Arm A eines A/B, Kontrolle Arm B bis 28 Tage
  // nach Livegang. Vorher: `Qi Blanco | ${page.title}` = 'Qi Blanco | Zeremonie Kakao Kurs'
  const titel = 'Zeremonie-Kakao-Kurs: kostenlos in vier Videos | Qi Blanco';
  return [
    {title: titel},
    ...beschreibungTags('/pages/zeremonie-kakao-kurs', data?.page?.seo?.description),
    canonicalLink('/pages/zeremonie-kakao-kurs'),
    ...seitenSignale({
      pfad: '/pages/zeremonie-kakao-kurs',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'zeremonie-kakao-kurs'); // ✅ Static handle

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
     <KakaoKurs /> 
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

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */