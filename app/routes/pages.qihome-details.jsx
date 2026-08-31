import {useLoaderData} from 'react-router';
import {QiHomeLanding} from '~/components/index-components/detailseiten/QiHomeLanding';
import {canonicalLink} from '~/lib/seo';

/*
 * /pages/qihome-details — oeffentliche Detailseite QiHome Air
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau).
 *
 * Traegt den bisherigen Content von /pages/qihome (Detail-LP-Komponente
 * detailseiten/QiHomeLanding) 1:1 weiter — /pages/qihome selbst wird zur
 * noindex-LP-Shopseite (Block LP). Diese Seite gehoert zum OEFFENTLICHEN
 * Block: indexierbar, canonical auf sich selbst; "Jetzt kaufen" zeigt
 * block-korrekt auf /products/qihome-air (die PDP heisst qihome-AIR —
 * /products/qihome existiert NICHT, Flanke 4 des Logik-Verdikts).
 *
 * PAGE_QUERY behaelt bewusst den ALTEN CMS-Handle "qihome".
 * BEWUSST KEIN redirectIfHandleIsLocalized (wuerde den -details-Pfad
 * verstuemmeln; qione-2-pro-Praezedenz).
 */

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [
    {title: 'QiHome\u00AE Air im Detail | Qi Blanco'},
    canonicalLink('/pages/qihome-details'),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context}) {
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle: 'qihome'},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function QiHomeDetailsPage() {
  useLoaderData();

  return (
    <>
      <QiHomeLanding />
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
