import {useLoaderData} from 'react-router';
import {
  ElektrosmogSchutzSchmuckSeite,
  strukturierteDaten,
} from '~/components/ratgeber/ElektrosmogSchutzSchmuckSeite';
import {PFAD, SEITE} from '~/data/elektrosmog-schutz-schmuck';
import essStyles from '~/styles/elektrosmog-schutz-schmuck.css?url';
import elinaBewegungStyles from '~/styles/elina-bewegung.css?url';
import {canonicalLink} from '~/lib/seo';
import {resolveCountry} from '~/lib/markt-pricing';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * /pages/elektrosmog-schutz-schmuck — Ratgeber und Produktübersicht
 * „Elektrosmog-Schutz zum Tragen: Armband, Anhänger oder Kette?"
 *
 * Grossjob 20261114-seo-kategorie-kaufbegriffe-suchabsicht-r2, Segment s02
 * (Christian 14.11.2026). Muster /pages/healy-alternative: DIESE DATEI TRÄGT
 * KEINEN INHALT. Text in app/data/elektrosmog-schutz-schmuck.js, Darstellung
 * und Schema in app/components/ratgeber/ElektrosmogSchutzSchmuckSeite.jsx.
 *
 * REINE ROUTE, KEIN SHOPIFY-SEITENOBJEKT: sticht den Katchall pages.$handle.jsx.
 * Sitemap über NUR_ROUTE_SEITEN in app/lib/seo.js.
 *
 * LOADER NUR FÜR PREISE UND BILDER der drei tragbaren Produkte (CacheShort).
 * Fällt die Storefront-API aus, kommt eine leere Liste zurück, und die Seite
 * nennt keinen Betrag statt eines falschen (fail-closed).
 *
 * INDEXIERBAR: canonicalLink() (Gate 17 verlangt die <link>-Form), kein noindex.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key.
 */
const PRODUKTE_QUERY = `#graphql
  fragment EssProdukt on Product {
    handle
    title
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query EssProdukte($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    bracelet: product(handle: "qibracelet") { ...EssProdukt }
    qione: product(handle: "qione-2-pro") { ...EssProdukt }
    kette: product(handle: "qione-kette") { ...EssProdukt }
  }
`;

export function links() {
  return [
    {rel: 'stylesheet', href: essStyles},
    {rel: 'stylesheet', href: elinaBewegungStyles},
  ];
}

export async function loader({context, request}) {
  const land = resolveCountry(request);
  try {
    const data = await context.storefront.query(PRODUKTE_QUERY, {
      cache: context.storefront.CacheShort(),
    });
    return {products: [data.bracelet, data.qione, data.kette].filter(Boolean), land};
  } catch (fehler) {
    console.error('[ess-preis-fallback] Produkt-Query fehlgeschlagen:', fehler?.message || fehler);
    return {products: [], land};
  }
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  canonicalLink(PFAD),
  ...seitenSignale({
    pfad: PFAD,
    titel: SEITE.titel,
    beschreibung: SEITE.beschreibung,
    hauptknoten: false,
  }),
  ...strukturierteDaten(data?.products, data?.land).map((knoten) => ({
    'script:ld+json': knoten,
  })),
];

export default function ElektrosmogSchutzSchmuckRoute() {
  const {products, land} = useLoaderData();
  return <ElektrosmogSchutzSchmuckSeite products={products} land={land} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
