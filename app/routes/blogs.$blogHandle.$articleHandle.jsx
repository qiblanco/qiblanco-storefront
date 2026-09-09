import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {blogMeta} from '~/lib/blog-seo';
import {artikelHreflangLinks} from '~/lib/hreflang';
import {artikelInhaltAufraeumen} from '~/lib/blog-inhalt';
import {artikelSchema} from '~/lib/blog-schema';
import {autorenkastenSichtbarkeit} from '~/lib/autorenkasten';
import {Autorenkasten} from '~/components/Autorenkasten';
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
  const basis = blogMeta({
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

  // VORSCHAU WIRD NICHT INDEXIERT. Der Vorschauweg existiert, damit ein Mensch
  // den noch nicht freigegebenen Autorenkasten als SEITE lesen kann (und damit
  // die Design-Rubrik ihn scoren kann) -- nicht, damit eine zweite Fassung
  // derselben Seite in den Index gerät. Ohne diese Zeile wäre der Parameter
  // ein stiller Duplicate-Content-Erzeuger.
  // DIE hreflang-GEGENRICHTUNG DER ARTIKEL-NAHT (2026-09-08).
  //
  // WARUM HIER UND NICHT IN app/root.jsx, wo die SEITEN-Naht steht: die
  // Seiten-Naht ist eine reine Funktion des PFADES und kennt deshalb im
  // Layout alles, was sie braucht. Die Artikel-Naht hängt an einem
  // Metafeld, also an LOADER-DATEN dieser Route — root.jsx kaeme nur über
  // useMatches daran, und das wäre ein Layout, das den Aufbau einer
  // einzelnen Route kennt. Der Descriptor-Weg leistet dasselbe: react-router
  // rendert `tagName: 'link'` als echtes <link> in denselben <head>.
  //
  // KEINE DOPPELUNG MIT DER SEITEN-NAHT: hreflangLinks() in root.jsx schlaegt
  // Artikelpfade in HREFLANG_PAARE nach und findet sie dort nie (der SSoT
  // führt Seiten, keine Artikel) -> leere Liste. Beide Naehte können auf
  // derselben Seite baulich nicht zugleich sprechen. Genau das hält
  // test/hreflang-artikel.test.mjs (Arm C) fest, weil eine zweite,
  // abweichende Gruppe schlechter wäre als gar keine.
  //
  // KEIN RUECKFALL: fehlt das Metafeld, kommt eine leere Liste und es steht
  // nichts im Kopf. Begründung in app/lib/hreflang.js.
  const hreflang = artikelHreflangLinks(
    location?.pathname ?? '',
    data?.article?.hreflangEn?.value,
  );

  // DAS STRUKTURIERTE DATENOBJEKT (2026-09-09). Bis hierher trugen alle acht
  // Artikel NULL ld+json -- gemessen am ausgelieferten HTML, nicht im Repo.
  // Der Descriptor-Weg ist das Hausmuster (app/routes/pages.studien.jsx:44);
  // react-router rendert `script:ld+json` als echtes <script> in denselben
  // <head>. Die Datenfabrik liegt in app/lib/blog-schema.js und gibt null
  // zurück, wenn Titel oder Datum fehlen -- dann steht hier kein leerer
  // Block, sondern gar keiner.
  const schema = artikelSchema({
    pfad: location?.pathname ?? '',
    artikel: data?.article,
  });
  const ldJson = schema ? [{'script:ld+json': schema}] : [];

  // IN DER VORSCHAU BEWUSST OHNE ld+json: die Vorschau trägt eine Zeile
  // hoeher `noindex, nofollow`. Ein strukturiertes Datenobjekt auf einer
  // Seite, die ausdrücklich nicht in den Index soll, wäre ein Signal an
  // genau die Systeme, die dort nichts lesen sollen.
  return data?.autorenkasten?.vorschau
    ? [...basis, ...hreflang, {name: 'robots', content: 'noindex, nofollow'}]
    : [...basis, ...hreflang, ...ldJson];
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

  // DER AUTORENKASTEN WIRD HIER ENTSCHIEDEN, NICHT IN DER KOMPONENTE.
  // Die Sichtbarkeit hängt an der angefragten URL (Vorschau-Parameter), und
  // die kennt nur der Server. Entschiede die Komponente selbst, wären
  // Server-Render und Hydration zwei Antworten auf dieselbe Frage.
  const autorenkasten = autorenkastenSichtbarkeit(request.url);

  return {article, blogHandle, weitere, autorenkasten};
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
  const {article, blogHandle, weitere, autorenkasten} = useLoaderData();
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

        {/* GANZ AM ENDE, "wie in einem guten Buch" (Christian). Oben am Artikel
          bleibt es knapp: Datum und Name. Wer bis hierher gelesen hat, darf
          wissen, wer da geschrieben hat -- vorher wäre es eine Behauptung
          über Autoritaet, hier ist es eine Auskunft. */}
        <Autorenkasten sichtbar={autorenkasten?.sichtbar} />
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
        # DER ARTIKEL trägt SEINEN hreflang-PARTNER SELBST (2026-09-08).
        # Namensraum 'custom' und nicht 'qb': Shopify lehnt 'qb' hart ab
        # ("Namespace is too short (minimum is 3 characters)", live gemessen
        # auf articleUpdate UND metafieldsSet). Sichtbar ist das Feld hier nur,
        # weil es eine Definition mit access.storefront=PUBLIC_READ hat
        # (MetafieldDefinition/167767179532) — ohne Definition gibt die
        # Storefront-API null zurück, obwohl der Wert im Admin steht.
        # Geschrieben von blog-redaktion/src/publizier.py, und zwar erst, wenn
        # BEIDE Fassungen veroeffentlicht sind: hreflang wirkt nur reziprok.
        hreflangEn: metafield(namespace: "custom", key: "hreflang_en") {
          value
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
