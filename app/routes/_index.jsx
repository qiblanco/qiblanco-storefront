import {HomepageSections} from '~/components/homepage/HomepageSections';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {entityGraph} from '~/lib/entity-schema';

const TITEL =
  'Qi Blanco - Life Technology - Jetzt kennenlernen. - Qi Blanco UG (haftungsbeschränkt)';

/**
 * Meta-Beschreibung der Startseite.
 *
 * Gemessen am 2026-08-14 hatte die Startseite ÜBERHAUPT KEINE Beschreibung —
 * Google reimt sich das Snippet dann aus dem Seitentext zusammen.
 *
 * Bewusst in KUNDENSPRACHE (Strahlung, Schlaf, Energie) statt im Fachbegriff
 * „kohärentes Wasser": laut Kaufüberzeugungs-Kanon suchen Kunden mit den
 * eigenen Wörtern und spiegeln den Fachbegriff nur zurück, wenn wir ihn
 * zuerst benutzen. Bewusst OHNE Wirkungs-/Heilaussage — „rund um" ist
 * thematisch, nicht kausal —, weil der Auftrag das für die L6-Texte
 * ausdrücklich verlangt. 151 Zeichen, unter der Snippet-Kappung von ~155.
 */
const BESCHREIBUNG =
  'Qi Blanco® – Life Technology aus Deutschland. Rund um Strahlung, Schlaf und ' +
  'Energie im Alltag: QiOne® 2 Pro, QiBracelet, QiHome Air und Crystal Cacao®.';

/**
 * Teilbild für Open Graph. Native Kantenlaenge 1024 — die CDN-Breite wird
 * ausdrücklich mitgegeben, damit das ausgelieferte Bild eine feste, zu
 * og:image:width passende Größe hat und nicht von Shopify-Defaults abhängt.
 */
const OG_BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  'qiblanco-com-qione-2-pro-transparent_1.webp?width=1024';

/**
 * @type {MetaFunction}
 */
export const meta = ({matches}) => {
  // Logo aus den Shopify-Markendaten des root-Loaders. Fehlt es, lässt
  // organizationSchema() das Feld weg — ein leeres logo wäre ein kaputter
  // Knoten, kein neutraler. Defensiv gelesen: eine Formänderung der
  // Loader-Daten darf die Startseite nicht 500en.
  const marke = matches?.find((m) => m?.id === 'root')?.data?.header?.shop
    ?.brand;
  const logoUrl = marke?.logo?.image?.url || marke?.squareLogo?.image?.url;

  const descriptoren = [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    // Canonical als echtes <link> (tagName) und absolut — Begründung im Kopf
    // von app/lib/seo.js.
    canonicalLink('/'),
    // Open Graph: gemessen 0 og-Tags auf allen Routen. Ohne sie entscheidet
    // das jeweilige Netzwerk selbst, was beim Teilen erscheint.
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'Qi Blanco'},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical('/')},
    // og:image — als einziges og-Tag noch offen, nachdem PR #187 die übrigen
    // gesetzt hat. Ohne Bild wählt jedes Netzwerk beim Teilen selbst etwas
    // aus der Seite; bei uns hiess das: gar nichts.
    //
    // WARUM DIESES BILD (gemessen, nicht geraten):
    //   Shopify-Markenlogo  2000x703 RGBA, alpha_min=0 — das INVERTIERTE
    //     (weisse) Logo auf Transparenz. Netzwerke flachen Transparenz auf
    //     Weiss ab, es wäre also weiss auf weiss: unsichtbar. Deshalb NICHT
    //     das naheliegende logoUrl, obwohl es hier bereits aufgelöst vorliegt.
    //   Flaggschiff-Produktbild 1024x1024 RGBA — dunkles, kontrastreiches
    //     Objekt, das auf weissem Grund trägt. Quadratisch ist für og:image
    //     zulässig und wird von allen großen Netzwerken unterstuetzt.
    // Offen und bewusst so benannt: ein eigens gebautes 1200x630-Sharebild
    // wäre besser als ein freigestelltes Produktfoto. Das ist eine Gestaltungs-
    // aufgabe, kein Head-Tag — siehe RESULT des Auftrags.
    {property: 'og:image', content: OG_BILD},
    {property: 'og:image:type', content: 'image/png'},
    {property: 'og:image:width', content: '1024'},
    {property: 'og:image:height', content: '1024'},
    // Alt-Text in Kundensprache (Schutz/Alltag), nicht im Fachbegriff.
    {
      property: 'og:image:alt',
      content: 'QiOne® 2 Pro von Qi Blanco – das Gerät für den Alltag',
    },
    // Entitäts-Graph. react-router 7 rendert diesen Descriptor nativ als
    // <script type="application/ld+json"> und maskiert den Inhalt selbst.
    {'script:ld+json': entityGraph({logoUrl})},
  ];
  // og:image war der einzige fehlende Open-Graph-Wert der Startseite
  // (gemessen live am 2026-08-14: og:type/site_name/locale/title/description/
  // url vorhanden, og:image nicht). Ohne ihn wählt jedes Netzwerk beim Teilen
  // selbst ein Bild aus der Seite — oder zeigt gar keines.
  //
  // Quelle ist dasselbe Marken-Logo, das schon in den Organization-Knoten
  // geht: es ist bereits geladen (kein zweiter Abruf), es ist im Shopify-Admin
  // pflegbar, und es kann nicht auf ein Motiv zeigen, das die Redaktion
  // später von der Seite nimmt. Bedingt gepusht wie in produkt-seo.js und
  // blog-seo.js — ein leeres og:image ist schlechter als keines.
  if (logoUrl) descriptoren.push({property: 'og:image', content: logoUrl});
  return descriptoren;
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  // Loader/meta/Queries bleiben bewusst unangetastet (never-break); die
  // Startseiten-Sektionen sind in HomepageSections extrahiert, damit die
  // Ad-Landingpages exakt denselben DOM rendern.
  return <HomepageSections />;
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
