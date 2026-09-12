import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {absoluteCanonical, canonicalLink, istNichtIndexierbareKollektion}
  from '~/lib/seo';
import {kollektionSignale} from '~/lib/kollektion-seo';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // DIESE ROUTE HATTE BIS HIERHER GAR KEINEN meta-EXPORT: kein eigener Titel,
  // KEIN canonical, kein og, keine strukturierten Daten (live gemessen
  // 2026-09-12). Sie ist damit die einzige indexierbare Kollektions-URL ohne
  // canonical gewesen — die uebrigen fünf ohne canonical tragen noindex und
  // sollen korrekt keinen haben.
  //
  // Wie in `collections.$handle.jsx` sammelt der canonical die cursor-basierte
  // Paginierung bewusst ein: die Cursor sind opake, alternde Zeiger auf
  // dieselbe Menge, keine eigenstaendigen Seiten.
  const kollektionen = data?.collections?.nodes ?? [];
  const titel = 'Kollektionen | Qi Blanco';
  return [
    {title: titel},
    canonicalLink('/collections'),
    ...kollektionSignale({
      pfad: '/collections',
      titel,
      name: 'Kollektionen',
      uebersicht: true,
      // KEIN Kollektionsbild als Quelle: am 2026-09-12 führt keine der neun
      // Kollektionen eines. teilbild() faellt hier ohne Umweg auf das
      // Markenbild zurück, deshalb steht hier gar kein `bild`.
      eintraege: kollektionen.map((k) => ({
        url: absoluteCanonical(`/collections/${k.handle}`),
        name: k.title,
      })),
      ersteSeite: !data?.collections?.pageInfo?.hasPreviousPage,
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
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request}) {
  // WARUM 50 UND NICHT 4 — derselbe Scaffold-Wert und derselbe Schaden wie im
  // Blog (blogs.$blogHandle._index.jsx, dort am 2026-09-03 behoben): `4` stammt
  // unveraendert aus dem Hydrogen-Skelett und war nie eine Entscheidung. Bei
  // neun Kollektionen zeigte die Uebersicht am 2026-09-12 live genau vier
  // Kacheln — digitale-kurse, digital-goods-vat-tax, frontpage, products —,
  // also DREI, die `noindex,nofollow` tragen, und keine der drei Kollektionen
  // mit echtem Inhalt. Die lagen hinter „Mehr laden".
  //
  // Die Paginierung BLEIBT (sie ist cursor-basiert und trägt jede kuenftige
  // Menge); 50 ist eine HYPOTHESE, keine Konstante: neun Kollektionen wachsen
  // menschlich gegated, und eine Kachel wiegt Titel und ein Bild.
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 50,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // NICHT-INDEXIERBARE KOLLEKTIONEN WERDEN HIER NICHT VERLINKT.
  //
  // Das ist kein kosmetischer Nachzug, sondern die Vorbedingung des
  // ItemList-Markups oben: eine ItemList darf nur enthalten, was die Seite
  // auch ZEIGT, und sie darf einer Suchmaschine keine Seiten anbieten, denen
  // wir per `noindex` gerade gesagt haben, sie moege sie ignorieren. Gerenderte
  // Liste und ItemList kommen deshalb aus EINER Quelle — diesem `nodes`.
  //
  // Gefiltert wird der ANGEZEIGTE Knoten-Satz, die Cursor bleiben unangetastet:
  // `pageInfo` gehört der echten Verbindung, und eine gefaelschte Seiten-Info
  // wäre schlimmer als eine kuerzere Seite. Hausmuster: blogs._index.jsx.
  return {
    collections: {
      ...collections,
      nodes: (collections?.nodes ?? []).filter(
        (k) => !istNichtIndexierbareKollektion(k.handle),
      ),
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="collections">
      <h1>Kollektionen</h1>
      <PaginatedResourceSection
        connection={collections}
        resourcesClassName="collections-grid"
      >
        {({node: collection, index}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  return (
    <Link
      className="collection-item"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection?.image && (
        <Image
          alt={collection.image.altText || collection.title}
          aspectRatio="1/1"
          data={collection.image}
          loading={index < 3 ? 'eager' : undefined}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h5>{collection.title}</h5>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
