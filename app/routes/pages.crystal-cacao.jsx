import {useLoaderData} from 'react-router';
import {Kakao} from '~/components/product-pages/Kakao';
import crystalCacaoStyles from '~/styles/crystal-cacao.css?url';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * Token-Schicht dieser Route. Sie hängt NUR hier und trägt
 * deshalb auf keiner anderen Seite - app.css bleibt unangetastet. Der Scope
 * ist die Klasse `cc` am Wurzel-Element der Kakao-Komponente.
 */
export function links() {
  return [{rel: 'stylesheet', href: crystalCacaoStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const titel = `Crystal Cacao® | Qi Blanco`;
  return [
    {title: titel},
    {
      name: 'description',
      content:
        'Crystal Cacao® – High Performance Cacao. Wach. Klar. Mineralisiert. 100 % reiner Premium-Naturkakao aus Peru.',
    },
    canonicalLink('/pages/crystal-cacao'),
    ...seitenSignale({
      pfad: '/pages/crystal-cacao',
      titel,
    }),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'crystal-cacao');
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}, handle) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {handle},
    }),
  ]);

  // Graceful fallback — Shopify page optional; component is self-contained
  if (page) {
    redirectIfHandleIsLocalized(request, {handle, data: page});
  }

  return {page: page ?? null};
}

function loadDeferredData() {
  return {};
}

export default function CrystalCacaoPage() {
  return <Kakao scope="cc" />;
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
