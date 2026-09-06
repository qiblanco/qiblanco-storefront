import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {blogMeta} from '~/lib/blog-seo';
import {artikelInhaltAufraeumen} from '~/lib/blog-inhalt';
import blogStyles from '~/styles/blog.css?url';

// EIGENES STYLESHEET STATT app/styles/app.css: die Blog-Regeln lagen bis zum
// 2026-09-04 im globalen Blatt. Dort ist jede Zeile eine Änderung an ALLEN 43
// Seiten, die daran hängen — eine Stunde vor einem öffentlichen Auftritt ist
// das ein Risiko ohne Not. Hausmuster: app/routes/pages.faq.jsx,
// pages.studien.jsx. Die Zeilenlänge kommt weiterhin aus dem globalen Token
// --measure-text, das in app.css auf :root steht.
export const links = () => [{rel: 'stylesheet', href: blogStyles}];

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, location}) => {
  return blogMeta({
    pfad: location?.pathname ?? '/blogs',
    titel: data?.article?.seo?.title || data?.article?.title,
    // DER EXCERPT IST DIE AUFFANGLINIE, UND ER IST REDAKTIONELL GESCHRIEBEN:
    // am 2026-09-06 gegen die Storefront-API gemessen trägt KEINER der sieben
    // Artikel ein gepflegtes `seo.description`, aber JEDER einen `excerpt` von
    // 140–157 Zeichen — also bereits in Meta-Länge und vom Inhalt des Artikels
    // abgeleitet. Nichts zu erfinden, nichts zu kürzen. Shopify-`seo` schlägt
    // ihn weiterhin, falls das Feld eines Tages gepflegt wird.
    beschreibung:
      data?.article?.seo?.description?.trim() || data?.article?.excerpt,
    bildUrl: data?.article?.image?.url,
    typ: 'article',
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  // Der aktuelle Beitrag faellt raus; hoechstens drei bleiben stehen. Fehlt
  // die Verbindung (leerer Blog, alte Antwort aus dem Cache), ist die Liste
  // leer und der Abschluss-Block rendert seinen Weiterlesen-Teil gar nicht.
  const weitere = (blog.articles?.nodes ?? [])
    .filter((a) => a?.handle && a.handle !== articleHandle)
    .slice(0, 3);

  return {article, blogHandle, weitere};
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

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blogHandle, weitere} = useLoaderData();
  const {title, image, contentHtml, author} = article;

  // de-DE statt en-US: das Hausmuster steht in app/lib/withdrawal.js. Auf einem
  // deutschsprachigen Blog ist "August 31, 2026" kein Stilfehler, sondern ein
  // sichtbar falscher Ort.
  const publishedDate = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  // Siehe app/lib/blog-inhalt.js: der Artikelkörper aus Shopify trägt den
  // Titel ein zweites Mal und die wörtlichen Markdown-Trenner.
  const inhaltHtml = artikelInhaltAufraeumen(contentHtml, title);

  return (
    <div className="blog-wissen">
      <div className="article">
        {/* Das Datum stand bis 2026-09-04 IM <h1> und erbte damit dessen
          Schriftgröße — Datum und Autor waren so groß wie die Überschrift.
          Der Kopf trägt jetzt nur noch den Titel; die Angaben stehen als
          eigene Zeile darunter. */}
        <h1 className="article-titel">{title}</h1>
        <p className="article-meta">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {author?.name ? (
            <>
              {' '}
              &middot; <address>{author.name}</address>
            </>
          ) : null}
        </p>

        {image && (
          <div className="article-bild">
            <Image
              data={image}
              sizes="(min-width: 900px) 900px, 100vw"
              loading="eager"
            />
          </div>
        )}
        <div
          dangerouslySetInnerHTML={{__html: inhaltHtml}}
          className="article-inhalt"
        />

        {/* WOHIN NACH DEM LESEN. Bisher endete der Beitrag im Nichts.
          Bewusst am Ende, bewusst ruhig und bewusst KEIN Verkaufsbanner: ein
          Wissensbeitrag, der zur Verkaufsseite wird, verliert genau die
          Glaubwuerdigkeit, die ihn wertvoll macht. Eine Wissensseite wird am
          folgenden KLICK gemessen, nicht an der Bestellung — deshalb fuehren
          die ersten Wege zum folgenden Beitrag und nur der letzte, einzelne
          in die Produktwelt. */}
        <aside className="article-weiter">
          {weitere?.length ? (
            <>
              <h2>Weiterlesen</h2>
              <ul>
                {weitere.map((a) => (
                  <li key={a.handle}>
                    <Link to={`/blogs/${blogHandle}/${a.handle}`}>
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="article-weiter-fuss">
            <Link to={`/blogs/${blogHandle}`}>Alle Beiträge</Link>
            <Link className="article-weiter-produkt" to="/">
              Womit wir arbeiten
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      # NUR handle und title, bewusst KEIN contentHtml und kein Bild:
      # der Abschluss-Block braucht Namen, keine Inhalte. Ein zweites Mal
      # Artikeltext im Payload war 2026-09-03 der Grund, warum die Uebersicht
      # 183 KB wog.
      articles(first: 4) {
        nodes {
          handle
          title
        }
      }
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        excerpt
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
