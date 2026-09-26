import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {blogIndexSignale, blogMeta} from '~/lib/blog-seo';
import {absoluteCanonical} from '~/lib/seo';
import {BESCHREIBUNGEN} from '~/lib/seiten-beschreibung';
import {BLOG_BESTAND_FRAGMENT, istEigenstaendig} from '~/lib/blog-bestand';
import {tagLang} from '~/lib/datum';
import {STRAENGE_LIVE, einstiegsWeg} from '~/lib/werk';
import blogStyles from '~/styles/blog.css?url';
import straengeStyles from '~/styles/werk-straenge.css?url';

// EIGENES STYLESHEET STATT app/styles/app.css: die Blog-Regeln lagen bis zum
// 2026-09-04 im globalen Blatt. Dort ist jede Zeile eine Änderung an ALLEN 43
// Seiten, die daran hängen — eine Stunde vor einem öffentlichen Auftritt ist
// das ein Risiko ohne Not. Hausmuster: app/routes/pages.faq.jsx,
// pages.studien.jsx. Die Zeilenlänge kommt weiterhin aus dem globalen Token
// --measure-text, das in app.css auf :root steht.
// NEUN JE SEITE — Christians Vorgabe vom 18.09.2026, woertlich: "Pro Seite
// nur 9 Artikel anzeigen lassen". Die Zahl ist eine VORGABE, keine Messung;
// sie steht hier einmal und wird von der Blätterung UND vom Schnitt
// gelesen, damit die beiden nicht auseinanderlaufen können.
const PRO_SEITE = 9;

// WIE VIELE ARTIKEL EINE ABFRAGE HOLT. Nicht die Seitengroesse: aus diesem
// Bestand wird geschnitten. Vorher stand hier `pageBy: 50` mit derselben
// Begründung (Befund 2026-09-03: `pageBy: 4` ließ zwei von sechs Artikeln
// hinter einem "Mehr laden" verschwinden). Der Wert bleibt 50 — er deckelt
// jetzt den BESTAND je Abfrage, nicht mehr die Anzeige.
const BESTANDS_DECKEL = 50;

export const links = () => [
  {rel: 'stylesheet', href: blogStyles},
  // Eigenes Blatt für die Strang-Gruppierung: siehe Kopf dort. Es trägt
  // keine eigenen Tokens, sondern erbt die `--bw-*` aus blog.css.
  {rel: 'stylesheet', href: straengeStyles},
];

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, location, params}) => {
  const basis = location?.pathname ?? '/blogs';
  const seite = data?.seite ?? 1;
  const seiten = data?.seiten ?? 1;
  const pfad = basis;
  // Nur was Shopify wirklich pflegt — ein erfundener Fuelltext wäre hier
  // schlechter als gar keiner (er stuende auf JEDER Blog-Uebersicht gleich).
  // `blog.seo.description` ist am 2026-09-06 leer und der Blog hat keinen
  // excerpt — Auffanglinie aus ~/lib/seiten-beschreibung, eigener
  // Schlüsselraum, damit ein Blog-Handle nie mit einem Seiten-Handle kollidiert.
  const beschreibung =
    data?.blog?.seo?.description?.trim() ||
    BESCHREIBUNGEN[`/blogs/${params?.blogHandle}`];
  // DIE ARTIKEL DIESER SEITE, nicht der ganze Bestand: die strukturierten
  // Daten sollen beschreiben, was auf der Seite steht.
  const artikel = data?.artikel ?? [];

  // DAS TEILEN-BILD KOMMT AUS DEM NEUESTEN ARTIKEL MIT BILD (s04 des Grossjobs
  // 20260911-…-auffindbarkeit). Die Liste ist absteigend nach publishedAt
  // sortiert, der erste Treffer ist also der juengste.
  //
  // DIESER SATZ WAR BIS ZUM 2026-09-18 FALSCH, und er stand hier seit s04:
  // die Abfrage trug KEIN `sortKey`, die Storefront-API liefert dann nach ID
  // aufsteigend — der „juengste" Treffer war in Wahrheit der ÄLTESTE. Live
  // gemessen am 18.09.: die Übersicht begann mit dem Beitrag vom 31.08. und
  // endete mit dem vom 11.09. Seit dem Nachzug von `sortKey: PUBLISHED_AT,
  // reverse: true` stimmt der Satz. Er ist nicht neu formuliert, sondern
  // erstmals wahr. Es wird KEIN Bild
  // erfunden und keines hochskaliert: hat kein Artikel ein Aufmacherbild,
  // bleibt og:image weg — und mit ihm die twitter:card, die sonst ein großes
  // Bild ZUSAGEN würde, das es nicht gibt (blogMeta setzt beide in derselben
  // Bedingung).
  const bildUrl = artikel.find((a) => a?.image?.url)?.image?.url;

  // DIE SEITENZAHL MUSS HINTER absoluteCanonical() DRANGEHAENGT WERDEN, nicht
  // davor: jene Funktion SCHNEIDET den Query-String ab (app/lib/seo.js,
  // `.split('?')[0]`) — und das ist dort richtig, weil eine Seite sich nicht
  // über einen utm-Parameter vervielfältigen soll. Wer ihr `?seite=2`
  // übergibt, bekommt schweigend die Adresse von Seite 1 zurück und hätte
  // Seite 2 zum Duplikat erklärt. Sie wird deshalb NICHT angefasst; die
  // Blätterung baut ihre Adresse hier.
  const absolut = (n) =>
    n <= 1
      ? absoluteCanonical(basis)
      : `${absoluteCanonical(basis)}?seite=${n}`;

  const kopf = blogMeta({
    pfad,
    titel: data?.blog?.seo?.title || data?.blog?.title,
    beschreibung,
    bildUrl,
  }).map((d) =>
    // SELBST-CANONICAL JE SEITE. Zeigte Seite 2 auf Seite 1, erklärte sie
    // sich selbst zum Duplikat, und die Beiträge darauf fielen aus dem
    // Index — genau das verbietet der Auftrag ("Seite 2 und folgende bleiben
    // crawlbar"). og:url wandert mit, sonst teilt jemand Seite 3 und landet
    // auf Seite 1.
    seite > 1 && d?.rel === 'canonical'
      ? {...d, href: absolut(seite)}
      : seite > 1 && d?.property === 'og:url'
        ? {...d, content: absolut(seite)}
        : d,
  );

  return kopf.concat(
    // STRUKTURIERTE DATEN DER INDEX-SEITE. Die ARTIKEL tragen seit dem
    // 2026-09-09 BlogPosting+Person+ImageObject; ohne Auszeichnung war
    // ausschließlich diese Uebersicht — sie ist der Knoten, der die neun
    // Beitraege zu EINEM Publikationsorgan verbindet.
    blogIndexSignale({
      pfad,
      name: data?.blog?.title || 'Wissen',
      beschreibung,
      artikel,
      ersteSeite: seite === 1,
    }),
    // rel=prev/next, vom Auftrag namentlich verlangt. `tagName: 'link'` ist
    // Pflicht — ohne es rendert react-router ein wirkungsloses
    // <meta rel="next"> (dieselbe Falle wie beim Canonical, siehe
    // app/lib/seo.js). Für die Indexierung sind sie seit 2019 kein Signal
    // mehr; die Arbeit machen die Anker in <Seitenwahl>.
    seite > 1 ? [{tagName: 'link', rel: 'prev', href: absolut(seite - 1)}] : [],
    seite < seiten
      ? [{tagName: 'link', rel: 'next', href: absolut(seite + 1)}]
      : [],
  );
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
    pageBy: BESTANDS_DECKEL,
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

  // --- BLAETTERUNG (Christian, 18.09.2026) -----------------------------
  // "Pro Seite nur 9 Artikel anzeigen lassen, danach dann unten einen
  //  Reiter einbauen mit Seite 1, 2, etc. Der neuste Artikel erscheint
  //  immer ganz links oben als erstes."
  //
  // WARUM HIER GESCHNITTEN WIRD UND NICHT ÜBER `first`/`after`: Christian
  // verlangt NUMMERIERTE Seiten. Die Storefront-API kennt nur Cursor —
  // `?seite=3` lässt sich damit baulich nicht beantworten, ohne die zwei
  // Seiten davor erst zu holen. Der Bestand ist menschlich gegated
  // (blog-redaktion veroeffentlicht im Takt di/fr/so) und durch
  // BESTANDS_DECKEL gedeckelt; EINE Abfrage holt ihn ganz, der Schnitt
  // passiert danach. Wächst er über den Deckel, meldet das die stehende
  // Wache blog-redaktion/pruefungen/probe_blog_index_vollstaendig.py von
  // selbst rot — dann ist eine echte Cursor-Blätterung fällig, nicht die
  // nächsthöhere Zahl.
  const alle = blog.articles?.nodes ?? [];
  const seiten = Math.max(1, Math.ceil(alle.length / PRO_SEITE));
  const roh = Number.parseInt(
    new URL(request.url).searchParams.get('seite') ?? '1',
    10,
  );
  // EINE UNSINNIGE SEITENZAHL IST KEINE LEERE SEITE. `?seite=0`, `?seite=99`
  // und `?seite=abc` fallen auf Seite 1 zurück statt ein leeres Raster zu
  // rendern — eine leere Übersicht sieht für Mensch und Crawler aus wie
  // ein geloeschter Blog.
  const seite = Number.isFinite(roh) && roh >= 1 && roh <= seiten ? roh : 1;
  const start = (seite - 1) * PRO_SEITE;

  return {
    blog,
    artikel: alle.slice(start, start + PRO_SEITE),
    seite,
    seiten,
    gesamt: alle.length,
    // Der Wegweiser steht nur auf Seite 1: wer blättert, kennt den Einstieg
    // schon. Er wird gegen den GANZEN Bestand aufgelöst, nicht gegen die
    // Seitenscheibe — der Einstiegsartikel eines Strangs ist selten der
    // neueste und läge sonst meist außerhalb der ersten neun.
    einstieg: STRAENGE_LIVE && seite === 1 ? einstiegsWeg(alle) : [],
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

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog, artikel, seite, seiten, gesamt, einstieg} = useLoaderData();

  // Die Überschrift stand nackt über einer reinen Titelliste. Eine Einleitung
  // sagt in Kundensprache (Schutz, Schlaf, Energie, Strahlung), was hier
  // erwartet werden darf — und was NICHT: der Begriff „kohärentes Wasser"
  // kommt aus unserem Marketing und wird von Kunden nur zurückgespiegelt.
  // Gepflegte SEO-Beschreibung geht vor, damit die Redaktion sie in Shopify
  // ändern kann, ohne dass jemand diese Datei anfasst.
  const einleitung =
    blog.seo?.description?.trim() ||
    'Was zu Schlaf, Energie und Strahlung im Alltag wirklich gemessen ist — ' +
      'und wo die Messung aufhört. Jeder Beitrag nennt seine Quellen.';

  return (
    <div className="blog-wissen">
      <div className="blog">
        <h1>{blog.title}</h1>
        <p className="blog-einleitung">{einleitung}</p>
        {einstieg?.length ? (
          <Wegweiser blogHandle={blog.handle} weg={einstieg} />
        ) : null}
        {einstieg?.length ? (
          <h2 className="blog-strang-frage blog-alle">Alle Beiträge</h2>
        ) : null}
        <div className="blog-grid">
          {artikel.map((article, index) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <Seitenwahl
          pfad={`/blogs/${blog.handle}`}
          seite={seite}
          seiten={seiten}
          gesamt={gesamt}
        />
      </div>
    </div>
  );
}

/**
 * Die nummerierte Blätterung unter dem Raster.
 *
 * WARUM ECHTE <a href> UND KEINE KNOEPFE: Christian hat verlangt, dass die
 * Blätterung die Seite nicht aus der Indexierung nimmt. Ein Crawler folgt
 * einem Anker mit href — einem Knopf mit onClick folgt er nicht, und Seite 2
 * wäre damit für eine Suchmaschine nicht vorhanden. Die Cursor-Blätterung
 * davor (`?direction=next&cursor=...`) hatte genau dieses Problem: anklickbar
 * und trotzdem keine Adresse, die man verlinken oder indexieren kann.
 *
 * KEINE BLAETTERUNG BEI EINER EINZIGEN SEITE: eine Leiste mit genau der
 * Zahl 1 ist kein Bedienelement, sondern Dekoration.
 *
 * @param {{pfad: string, seite: number, seiten: number, gesamt: number}}
 */
function Seitenwahl({pfad, seite, seiten, gesamt}) {
  if (seiten <= 1) return null;
  const zu = (n) => (n <= 1 ? pfad : `${pfad}?seite=${n}`);
  const nummern = Array.from({length: seiten}, (_, i) => i + 1);

  return (
    <nav className="blog-seitenwahl" aria-label="Seiten der Übersicht">
      {seite > 1 ? (
        <a className="blog-seitenwahl-pfeil" href={zu(seite - 1)} rel="prev">
          <span aria-hidden="true">&#8592;</span> Zurück
        </a>
      ) : null}
      <ol className="blog-seitenwahl-liste">
        {nummern.map((n) =>
          n === seite ? (
            <li key={n}>
              <span className="blog-seitenwahl-hier" aria-current="page">
                {n}
              </span>
            </li>
          ) : (
            <li key={n}>
              <a href={zu(n)} aria-label={`Seite ${n}`}>
                {n}
              </a>
            </li>
          ),
        )}
      </ol>
      {seite < seiten ? (
        <a className="blog-seitenwahl-pfeil" href={zu(seite + 1)} rel="next">
          Weiter <span aria-hidden="true">&#8594;</span>
        </a>
      ) : null}
      <p className="blog-seitenwahl-stand">
        Seite {seite} von {seiten} &#183; {gesamt} Beiträge
      </p>
    </nav>
  );
}

/**
 * "Wo Sie anfangen" — der Weg für jemanden, der zum ersten Mal hier ist.
 *
 * ENTSCHIEDEN am 2026-09-26 (AI-CEO, review.db
 * `blog-redaktion:entscheidung:werk-straenge-benennung-20260908`): die
 * Strang-Fragen und der Einstiegstext gehen live, leere Stränge erst, wenn sie
 * Artikel tragen.
 *
 * WARUM EIN WEGWEISER ÜBER DEM RASTER UND NICHT DIE GRUPPIERTE ÜBERSICHT, die
 * hier bis dahin hinter dem Schalter lag: jene Ansicht ersetzte die
 * Blätterung. Christian hat am 18.09.2026 wörtlich verlangt "Pro Seite nur 9
 * Artikel ... Der neuste Artikel erscheint immer ganz links oben als erstes".
 * Die Gruppierung hätte nur die Seitenscheibe gruppiert (Beitrag 10 und
 * folgende wären aus der Übersicht verschwunden) und den neuesten Beitrag
 * unter einen älteren Strang geschoben. Eine Maschinen-Entscheidung
 * überstimmt keine menschliche; die Fragen gehen deshalb als Wegweiser live,
 * und das Raster darunter bleibt, wie Christian es bestellt hat.
 *
 * WELCHER Artikel je Strang der Einstieg ist, entscheidet der Bestand
 * (blog-redaktion, meiste eingehende Querverweise) — nicht diese Datei.
 *
 * @param {{blogHandle: string, weg: Array<{id: string, frage: string,
 *          kurz?: string, handle: string, titel: string}>}}
 */
function Wegweiser({blogHandle, weg}) {
  return (
    <section className="blog-wegweiser" aria-labelledby="blog-wegweiser-titel">
      <h2 className="blog-strang-frage" id="blog-wegweiser-titel">
        Wo Sie anfangen
      </h2>
      <p className="blog-strang-kurz">
        Wenn Sie zum ersten Mal hier sind, ist das der kürzeste Weg durch das
        Material:
      </p>
      <ol className="blog-wegweiser-liste">
        {weg.map((schritt) => (
          <li className="blog-wegweiser-schritt" key={schritt.id}>
            <h3 className="blog-wegweiser-frage">{schritt.frage}</h3>
            {schritt.kurz ? (
              <p className="blog-wegweiser-kurz">{schritt.kurz}</p>
            ) : null}
            <Link
              className="blog-wegweiser-link"
              to={`/blogs/${blogHandle}/${schritt.handle}`}
            >
              {schritt.titel}
            </Link>
          </li>
        ))}
      </ol>
      <p className="blog-wegweiser-quellen">
        Wenn Sie eine Angabe nachschlagen wollen: In der{' '}
        <Link to="/pages/quellen">Quellenübersicht</Link> steht jede Studie,
        auf die wir uns berufen, mit voller Angabe.
      </p>
    </section>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading}) {
  // de-DE statt en-US: „August 31, 2026" ist auf einem deutschsprachigen Blog
  // kein Stilfehler, sondern ein sichtbar falscher Ort.
  // Die Zone kommt seit 2026-09-13 aus app/lib/datum.js MIT — ohne sie rendert
  // der Server in UTC, der Kunde in Europe/Berlin, und React bricht beim
  // Hydrieren. Die Begründung steht dort.
  const publishedAt = tagLang(article.publishedAt);

  // ANRISS, und warum er aus `excerpt` kommt und NICHT aus dem Artikeltext:
  // `contentHtml` wurde am 2026-09-03 bewusst aus diesem Fragment entfernt —
  // der volle Text ging ungerendert in den Hydrations-Payload und kostete den
  // größten Teil der Seitengröße. Ein Anriss, den wir uns aus dem Volltext
  // schneiden, holte ihn zurück. Ist kein Auszug gepflegt, bleibt die Kachel
  // ohne Anriss; sie ist dann kürzer, aber nicht kaputt.
  const anriss = article.excerpt?.trim();

  return (
    <div className="blog-article" key={article.id}>
      <Link to={`/blogs/${article.blog.handle}/${article.handle}`}>
        {/* FAIL-SOFT: solange kein Aufmacherbild gepflegt ist, rendert hier
            nichts — kein leerer Rahmen, keine gerissene Rasterhöhe. Das Bild
            selbst liefert das Bild-Segment dieses Auftrags. */}
        {article.image && (
          <div className="blog-article-image">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="3/2"
              data={article.image}
              loading={loading}
              sizes="(min-width: 1100px) 340px, (min-width: 750px) 45vw, 100vw"
            />
          </div>
        )}
        <div className="blog-article-text">
          <time dateTime={article.publishedAt}>{publishedAt}</time>
          <h3>{article.title}</h3>
          {anriss ? <p className="blog-article-anriss">{anriss}</p> : null}
          <span className="blog-article-mehr" aria-hidden="true">
            Weiterlesen
          </span>
        </div>
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
        after: $endCursor,
        sortKey: PUBLISHED_AT,
        reverse: true
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
    excerpt
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
