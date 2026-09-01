import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {blogMeta} from '~/lib/blog-seo';
import {BLOG_BESTAND_FRAGMENT, hatArtikel} from '~/lib/blog-bestand';

/**
 * @type {MetaFunction}
 */
export const meta = ({location}) => {
  return blogMeta({
    pfad: location?.pathname ?? '/blogs',
    titel: 'Magazin',
    beschreibung:
      'Das Magazin von Qi Blanco: Beiträge rund um Strahlung, Schlaf und ' +
      'Energie im Alltag — und wie unsere Life Technology dabei hilft.',
  });
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Blogs OHNE Artikel werden hier NICHT verlinkt.
  //
  // Das ist kein kosmetischer Nachzug, sondern der zweite Pflichtteil des
  // 301-Fixes: `storefrontRedirect` lebt in `server.js` und sieht nur echte
  // Dokument-Anfragen. Ein Klick von hier aus ist eine Client-Navigation,
  // also ein Data-Request — der 404 der Ziel-Route landete dann in der
  // ErrorBoundary statt in der Weiterleitung, und der Kunde saehe einen
  // Fehler, wo ein Crawler sauber umgeleitet wird.
  //
  // Gefiltert wird der ANGEZEIGTE Knoten-Satz, die Cursor bleiben
  // unangetastet: `pageInfo` gehört der echten Verbindung, und eine
  // gefaelschte Seiten-Info wäre schlimmer als eine kuerzere Seite.
  return {
    blogs: {
      ...blogs,
      nodes: (blogs?.nodes ?? []).filter(hatArtikel),
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

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="blogs">
      <h1>Magazin</h1>
      <div className="blogs-grid">
        <PaginatedResourceSection connection={blogs}>
          {({node: blog}) => (
            <Link
              className="blog"
              key={blog.handle}
              prefetch="intent"
              to={`/blogs/${blog.handle}`}
            >
              <h2>{blog.title}</h2>
            </Link>
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
        ...BlogBestand
      }
    }
  }
  ${BLOG_BESTAND_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
