import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {blogMeta} from '~/lib/blog-seo';
import {BLOG_BESTAND_FRAGMENT, istEigenstaendig} from '~/lib/blog-bestand';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, location}) => {
  return blogMeta({
    pfad: location?.pathname ?? '/blogs',
    titel: data?.blog?.seo?.title || data?.blog?.title,
    // Nur was Shopify wirklich pflegt — ein erfundener Fuelltext wäre hier
    // schlechter als gar keiner (er stuende auf JEDER Blog-Uebersicht gleich).
    beschreibung: data?.blog?.seo?.description,
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
async function loadCriticalData({context, request, params}) {
  // WARUM 50 UND WARUM ÜBERHAUPT EINE ZAHL (Befund 2026-09-03, live gemessen):
  // hier stand `pageBy: 4` — unverändert aus dem Scaffolding-Commit f0c1158
  // ("Generate routes for core functionality", 2025-07-08), also die
  // Hydrogen-Skeleton-Vorgabe und nie eine redaktionelle Entscheidung. Bei
  // sechs veröffentlichten Artikeln lagen dadurch ZWEI hinter dem
  // "Mehr laden"-Link: /blogs/wissen verlinkte 4, die Sitemap führte 6.
  // Für den Kunden hieß das, ein ausgelieferter Artikel war über die
  // Übersicht nicht auffindbar — nur per Direktlink oder Suchmaschine.
  //
  // Die Paginierung BLEIBT (Artikel 51 geht nicht verloren, er steht auf
  // Seite 2). Sie ist aber cursor-basiert (`?direction=next&cursor=...`),
  // nicht seitenbasiert: `?page=2` wird von Hydrogen ignoriert und liefert
  // byte-identisch Seite 1 zurück. Genau diese Byte-Identität wurde am
  // 2026-09-01 als "es gibt hier gar keine Paginierung" gelesen — sie ist
  // ein Messartefakt, kein Abwesenheitsbeweis.
  //
  // 50 ist eine HYPOTHESE, keine Konstante: eine Kachel wiegt Titel, Datum
  // und ein lazy geladenes Bild, 50 davon bleiben weit unter jedem
  // Seitengewichts-Budget, und der Bestand wächst menschlich gegated
  // (blog-redaktion veröffentlicht nicht selbst). Wächst er über 50,
  // meldet das die stehende Wache
  // blog-redaktion/pruefungen/probe_blog_index_vollstaendig.py von selbst
  // rot — dann ist eine Archiv-/Blätter-Fläche fällig, nicht die
  // nächsthöhere Zahl.
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 50,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  // Ein Blog OHNE Artikel ist keine Seite, sondern eine leere Huelle mit
  // Selbst-Canonical. Er wird als 404 beantwortet — nicht damit der Kunde
  // einen Fehler sieht, sondern weil `server.js` NUR bei 404 den
  // Shopify-Admin nach einer Weiterleitung fragt (`storefrontRedirect`).
  // Für /blogs/news und /blogs/e-smog liegen dort seit dem 2026-08-31
  // Weiterleitungen auf /blogs/wissen bereit; erst diese Zeile macht sie
  // wirksam. Gibt es für einen leeren Blog keine Weiterleitung, reicht
  // `storefrontRedirect` den 404 durch — auch das ist richtig, ein leerer
  // Container gehört nicht in den Index.
  // Zur Ausnahme des Anker-Handles und dazu, warum hier keine Handle-Liste
  // steht: siehe Kopf von ~/lib/blog-bestand.
  if (!istEigenstaendig(params.blogHandle, blog)) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
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

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div className="blog">
      <h1>{blog.title}</h1>
      <div className="blog-grid">
        <PaginatedResourceSection connection={articles}>
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));
  return (
    <div className="blog-article" key={article.id}>
      <Link to={`/blogs/${article.blog.handle}/${article.handle}`}>
        {article.image && (
          <div className="blog-article-image">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="3/2"
              data={article.image}
              loading={loading}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}
        <h3>{article.title}</h3>
        <small>{publishedAt}</small>
      </Link>
    </div>
  );
}

// KEIN `contentHtml` im ArticleItem-Fragment (entfernt 2026-09-03): die
// Übersicht rendert nur Bild, Titel und Datum — der volle Artikeltext ging
// ungerendert in den Hydrations-Payload. Er kostete den größten Teil der
// 183 KB dieser Seite UND machte die Messung unehrlich: ein Querverweis IM
// FLIESSTEXT eines Artikels sah für jede Vollständigkeits-Probe aus wie ein
// Eintrag der Übersicht (gemessen: zellulaere-hydration-biophysik galt so als
// "verlinkt", obwohl keine Kachel dafür existierte). Der Artikeltext wird
// weiterhin dort geladen, wo er gebraucht wird: blogs.$blogHandle.$articleHandle.
// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      ...BlogBestand
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  ${BLOG_BESTAND_FRAGMENT}
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
