import {redirect, useLoaderData} from 'react-router';
import TheAlphaVarianteB from '~/components/campaign/TheAlphaVarianteB';
import {THE_ALPHA_LIVE_ANMELDUNG_STIL} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {THE_ALPHA_KAUF_ZIEL} from '~/components/campaign/the-alpha-daten';
import {canonicalLink} from '~/lib/seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';
import varianteBStyles from '~/styles/the-alpha-variante-b.css?url';

/*
 * /pages/The-Alpha-C — Variante B (Server-Fassung) der The-Alpha-Seite
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * s04). Adresse nach KONZEPT Abschnitt 2: A = /pages/The-Alpha, C (KI) =
 * /pages/The-Alpha-B (Christian Z6), B (Server) = /pages/The-Alpha-C.
 *
 * TESTARM: noindex,nofollow (meta + X-Robots-Tag; der Pfad steht zusätzlich
 * in app/lib/vorschau-noindex.js), canonical auf sich selbst, nicht in der
 * Sitemap, kein Menüeintrag. Verkehr bekommt die Seite über die A/B/C-Weiche
 * (s07, lib/experiment-weiche.server.js im Loader von A).
 *
 * SEIT 26.10.2026 (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-
 * premium-gestaltung, s02): B erzählt Christians Film-Geschichte wie A, auf
 * dem geteilten Gerüst (the-alpha-premium.css) plus Varianten-Stil
 * (the-alpha-variante-b.css, Scope data-the-alpha-premium='b').
 *
 * GROß/KLEIN wie A: jede andere Schreibweise -> 301 auf /pages/The-Alpha-C,
 * die Abfrage bleibt erhalten.
 *
 * PREIS: zur Laufzeit aus der Storefront, Produkt = Ziel des roten Knopfs
 * (THE_ALPHA_KAUF_ZIEL), damit Seite und Kaufseite denselben Betrag zeigen.
 * Antwortet die Storefront nicht, zeigt die Seite Christians Endpreis
 * (data-preis-quelle="fest"), nie einen leeren Preis. Der Preis steht nur im
 * Abschluss und ist kleiner als der Titel (Christian Z10).
 *
 * TRACKING: kein Pixel-Code hier, kein neuer Schlüssel. Die Live-Anmeldung
 * sendet an die bestehende Action von /pages/live.
 * RÜCKWEG: hb-deploy revert des Merge-Commits (Seite antwortet dann 404).
 */

const KANON_PFAD = '/pages/The-Alpha-C';

export function links() {
  return [
    {rel: 'stylesheet', href: theAlphaPremiumStyles},
    {rel: 'stylesheet', href: THE_ALPHA_LIVE_ANMELDUNG_STIL},
    {rel: 'stylesheet', href: varianteBStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha, Limited 1st. Edition 111/111 | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha mit Diamant, Limited 1st. Edition: 111 Stück mit eigener Nummer, 10.639 €, ' +
      'Versand ab Mitte Januar 2027. Live-Vorstellung mit Christian am 8. November.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
  {property: 'og:title', content: 'Qi Alpha, Limited 1st. Edition 111/111'},
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

export default function TheAlphaCRoute() {
  const {preis} = useLoaderData();
  return <TheAlphaVarianteB preis={preis ?? null} />;
}

const PREIS_QUERY = `#graphql
  query TheAlphaCPreis(
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
