import {useLoaderData} from 'react-router';
import QiAlphaLpB, {betrag} from '~/components/campaign/QiAlphaLpB';
import {QM_ADDONS_QUERY, KETTE_VORWAHL} from '~/lib/qi-master-addons';
import qiMasterStyles from '~/styles/qi-master.css?url';
import qiAlphaBStyles from '~/styles/qi-alpha-b.css?url';

/*
 * /pages/qi-alpha-b — LP B zum Qi Alpha (Vorschau, Grossjob 20261023-GROSSJOB-
 * qi-alpha-landingpage-produktseite-finalisieren-lp-simulation, s04).
 *
 * Doppelgate wie /pages/qione-2-pro-b: meta robots + X-Robots-Tag, KEIN
 * canonical. Der Kopf kommt zusätzlich aus der zentralen Pfadliste
 * app/lib/vorschau-noindex.js (entry.server.jsx), die auch robots.txt und die
 * Sitemap speist. Kein Pixel-Code: die Seite misst sich über die geteilten
 * Bausteine wie jede LP.
 *
 * PRODUKT HANDLE-TOLERANT: der Umbenennungs-Grossjob macht aus qi-master
 * qi-alpha. Gelesen wird beides, gezeigt wird das erste, das existiert;
 * Preise und Bilder kommen zur Laufzeit aus der Storefront-API, nie als Text.
 */
export function links() {
  return [
    // Token und Fragen-/Studien-Gestaltung der Qi-Familie, dazu die eigene
    // Scope-Schicht dieser Variante.
    {rel: 'stylesheet', href: qiMasterStyles},
    {rel: 'stylesheet', href: qiAlphaBStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha, erste Edition mit 111 Stück | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha: ein Naturdiamant am Gitterchip™ der zweiten Generation, eigene Seriennummer, erste Edition mit 111 Stück.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const QA_HANDLES = ['qi-alpha', 'qi-master'];

const LP_PRODUKT_QUERY = `#graphql
  query QiAlphaLpProdukt(
    $a: String!
    $b: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    a: product(handle: $a) {
      ...QiAlphaLpProduktFelder
    }
    b: product(handle: $b) {
      ...QiAlphaLpProduktFelder
    }
  }
  fragment QiAlphaLpProduktFelder on Product {
    id
    handle
    title
    images(first: 1) {
      nodes {
        url
        altText
        width
        height
      }
    }
    selectedOrFirstAvailableVariant {
      id
      price {
        amount
        currencyCode
      }
    }
  }
`;

/** @param {LoaderFunctionArgs} args */
export async function loader({context}) {
  const {storefront} = context;
  const [produkte, addons] = await Promise.all([
    storefront.query(LP_PRODUKT_QUERY, {
      variables: {a: QA_HANDLES[0], b: QA_HANDLES[1]},
      cache: storefront.CacheShort(),
    }),
    storefront.query(QM_ADDONS_QUERY).catch(() => null),
  ]);
  const product = produkte?.a?.id ? produkte.a : produkte?.b;
  if (!product?.id) throw new Response(null, {status: 404});

  const wunsch = addons?.wunschnummer?.variants?.nodes?.find((v) => v.availableForSale)
    ?? addons?.wunschnummer?.variants?.nodes?.[0];
  const kette =
    addons?.kette?.variants?.nodes?.find((v) => v.title === KETTE_VORWAHL) ??
    addons?.kette?.variants?.nodes?.[0];

  return {
    bild: product.images?.nodes?.[0] ?? null,
    preise: {
      haupt: betrag(product.selectedOrFirstAvailableVariant?.price),
      wunschnummer: betrag(wunsch?.price),
      kette: betrag(kette?.price),
    },
  };
}

export default function QiAlphaLpBRoute() {
  const {bild, preise} = useLoaderData();
  return <QiAlphaLpB bild={bild} preise={preise} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
