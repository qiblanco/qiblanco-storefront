import {redirect, useLoaderData} from 'react-router';
import TheAlphaVarianteC from '~/components/campaign/TheAlphaVarianteC';
import {THE_ALPHA_LIVE_ANMELDUNG_STIL} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {THE_ALPHA_KAUF_ZIEL} from '~/components/campaign/the-alpha-daten';
import {canonicalLink} from '~/lib/seo';
import theAlphaStyles from '~/styles/the-alpha.css?url';
import varianteCStyles from '~/styles/the-alpha-variante-c.css?url';
import preisankerStyles from '~/styles/qb-preisanker.css?url';

/*
 * /pages/The-Alpha-B — Variante C (KI-optimiert) der The-Alpha-Seite
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * s05). Adresse nach KONZEPT Abschnitt 2 und Christian Z6: „C wäre dann
 * https://qiblanco.com/pages/The-Alpha-B“. A = /pages/The-Alpha (Figma),
 * B (Server) = /pages/The-Alpha-C.
 *
 * TESTARM: noindex,nofollow (meta + X-Robots-Tag; der Pfad steht zusätzlich
 * in app/lib/vorschau-noindex.js), canonical auf sich selbst, nicht in der
 * Sitemap, kein Menüeintrag. Verkehr bekommt die Seite über die A/B/C-Weiche
 * (s07, lib/experiment-weiche.server.js im Loader von A).
 *
 * GROß/KLEIN wie A und B: jede andere Schreibweise (the-alpha-b, THE-ALPHA-B)
 * -> 301 auf /pages/The-Alpha-B, die Abfrage bleibt erhalten. Kollision: die
 * statische Route schlägt pages.$handle.jsx; /pages/qi-alpha-b ist ein
 * anderer Pfad (eigene Route pages.qi-alpha-b.jsx) und wird hier nie erreicht.
 *
 * PREIS: zur Laufzeit aus der Storefront, Produkt = Ziel des roten Knopfs
 * (THE_ALPHA_KAUF_ZIEL), damit Seite und Kaufseite denselben Betrag zeigen.
 * Antwortet die Storefront nicht, zeigt die Seite Christians Endpreis
 * (data-preis-quelle="fest"), nie einen leeren Preis.
 *
 * TRACKING: kein Pixel-Code hier, kein neuer Schlüssel. Die Live-Anmeldung
 * sendet an die bestehende Action von /pages/live.
 * RÜCKWEG: hb-deploy revert des Merge-Commits (Seite antwortet dann 404).
 */

const KANON_PFAD = '/pages/The-Alpha-B';

export function links() {
  return [
    {rel: 'stylesheet', href: theAlphaStyles},
    {rel: 'stylesheet', href: preisankerStyles},
    {rel: 'stylesheet', href: THE_ALPHA_LIVE_ANMELDUNG_STIL},
    {rel: 'stylesheet', href: varianteCStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha: Gitterchip™ mit Naturdiamant, nur 111 Stück | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha: Anhänger aus 750er Gold mit Naturdiamant und Gitterchip™. 111 Stück mit eigener ' +
      'Nummer, 10.639 €, 20 Tage testen. Live-Vorstellung mit Christian am 8. November.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
  {property: 'og:title', content: 'Qi Alpha: Gitterchip™ mit Naturdiamant, nur 111 Stück'},
  {
    property: 'og:image',
    content:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
  },
  canonicalLink(KANON_PFAD),
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/** @param {LoaderFunctionArgs} args */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, '');
  if (pfad !== KANON_PFAD) {
    throw redirect(`${KANON_PFAD}${url.search}`, 301);
  }
  const handle = THE_ALPHA_KAUF_ZIEL.replace(/^\/products\//, '').split(/[?#]/)[0];
  let preis = null;
  try {
    const {product} = await context.storefront.query(PREIS_QUERY, {
      variables: {handle},
    });
    const price = product?.selectedOrFirstAvailableVariant?.price;
    if (price?.amount) preis = {handle: product.handle, price};
  } catch {
    preis = null;
  }
  return {preis};
}

export default function TheAlphaBRoute() {
  const {preis} = useLoaderData();
  return <TheAlphaVarianteC preis={preis ?? null} />;
}

const PREIS_QUERY = `#graphql
  query TheAlphaBPreis(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    product(handle: $handle) {
      handle
      selectedOrFirstAvailableVariant {
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
