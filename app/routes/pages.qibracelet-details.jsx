import {useLoaderData} from 'react-router';
import {QiBracelet} from '~/components/index-components/detailseiten/QiBracelet';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';

/*
 * /pages/qibracelet-details — oeffentliche Detailseite QiBracelet
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau).
 *
 * Traegt den bisherigen Content von /pages/qibracelet (Detail-LP-Komponente
 * detailseiten/QiBracelet) 1:1 weiter — /pages/qibracelet selbst wird zur
 * noindex-LP-Shopseite (Block LP). Diese Seite gehoert zum OEFFENTLICHEN
 * Block: indexierbar, canonical auf sich selbst; ihre "Jetzt kaufen"-Links
 * zeigen block-korrekt auf /products/qibracelet.
 *
 * PAGE_QUERY behaelt bewusst den ALTEN CMS-Handle "qibracelet" (die
 * Shopify-Admin-Seite existiert dort; kein Admin-Handgriff noetig).
 *
 * BEWUSST KEIN redirectIfHandleIsLocalized: der Helper ersetzt den Handle im
 * URL-Pfad — bei /pages/qibracelet-details wuerde er den Pfad verstuemmeln
 * (qione-2-pro-Praezedenz: harter Handle, keine lokalisierten Code-Routen).
 */

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // Die Seite stand seit 4ae2729 ohne Meta-Beschreibung live und fiel erst
  // auf, als #383 sie am 2026-09-12 in die Sitemap nachtrug — bis dahin war
  // sie nicht Teil der Grundmenge, die das misst. Rangfolge wie ueberall: ein
  // gepflegtes `seo.description` aus Shopify schlägt die kuratierte Karte,
  // die Karte fängt nur auf. Das PAGE_QUERY läuft hier auf dem ALTEN
  // CMS-Handle `qibracelet` — dasselbe Shopify-Objekt trägt also die
  // noindex-LP /pages/qibracelet; ein dort gepflegtes Feld fände beide.
  //
  // `beschreibung` geht zusätzlich an seitenSignale, damit og:description
  // und JSON-LD denselben Satz tragen wie die meta description. Ein Netzwerk,
  // das beim Teilen etwas anderes zeigt als die Suchmaschine, erzeugt zwei
  // Versprechen (qione-2-pro-Präzedenz).
  const titel = 'QiBracelet\u00AE im Detail | Qi Blanco';
  return [
    {title: titel},
    ...beschreibungTags('/pages/qibracelet-details', data?.page?.seo?.description),
    canonicalLink('/pages/qibracelet-details'),
    ...seitenSignale({
      pfad: '/pages/qibracelet-details',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context}) {
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle: 'qibracelet'},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function QiBraceletDetailsPage() {
  useLoaderData();

  return (
    <>
      <QiBracelet />
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
