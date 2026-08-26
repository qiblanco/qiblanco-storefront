import {useLoaderData} from 'react-router';
import {QiOne} from '~/components/index-components/detailseiten/QiOne';
import {canonicalLink} from '~/lib/seo';

/*
 * /pages/qione-2-pro-details — oeffentliche Detailseite QiOne 2 Pro
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau).
 *
 * Traegt den bisherigen Content von /pages/qione (Detail-LP-Komponente
 * detailseiten/QiOne) 1:1 weiter — /pages/qione wird zur 301-Route hierher
 * (der Name qione war der einzige, der das Produkt qione-2-pro nicht traf).
 * OEFFENTLICHER Block: indexierbar, canonical auf sich selbst; "Jetzt
 * kaufen"-Links zeigen block-korrekt auf /products/qione-2-pro.
 *
 * PAGE_QUERY behaelt bewusst den ALTEN CMS-Handle "qione" (Shopify-Admin-
 * Seite existiert dort; kein Admin-Handgriff noetig).
 * BEWUSST KEIN redirectIfHandleIsLocalized (wuerde den -details-Pfad
 * verstuemmeln; qione-2-pro-Praezedenz).
 */

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [
    {title: 'QiOne\u00AE 2 Pro im Detail | Qi Blanco UG (haftungsbeschr\u00E4nkt)'},
    canonicalLink('/pages/qione-2-pro-details'),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context}) {
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle: 'qione'},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function QiOne2ProDetailsPage() {
  useLoaderData();

  return (
    <>
      <QiOne />
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
