import {getSitemap} from '@shopify/hydrogen';
import {
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  NICHT_INDEXIERBARE_PRODUKTE,
} from '~/lib/seo';
import {BLOG_BESTAND_FRAGMENT, leereHandles} from '~/lib/blog-bestand';

/**
 * Welche Handles fliegen aus welchem Sitemap-Typ?
 *
 * `pages` kam mit Stufe S0 (Index-Hygiene) dazu: eine Seite auf `noindex` zu
 * setzen und sie gleichzeitig in der Sitemap anzubieten, ist ein Widerspruch,
 * den die Search Console dauerhaft als Konflikt meldet.
 *
 * SEIT 2026-08-23 (s05) IST DAS NICHT MEHR DIESELBE LISTE, SONDERN IHRE
 * TEILMENGE — und das ist der Punkt, nicht ein Rückschritt. Beide Sichten
 * werden weiterhin aus GENAU EINER Definition in ~/lib/seo abgeleitet
 * (`NICHT_INDEXIERBARE_SEITEN_DEF`), können also nach wie vor nicht
 * auseinanderdriften. Getrennt wurde nur der ZEITPUNKT: eine Seite ohne
 * eingehende interne Links wird ausschließlich über die Sitemap besucht,
 * und wer sie im selben Deploy dort herausnimmt, in dem sie ihr `noindex`
 * bekommt, sorgt dafür, dass Google das `noindex` nie liest. Der Eintrag
 * bleibt deshalb zunächst in der Sitemap (`ausSitemap: false`) und fliegt
 * erst raus, wenn das Signal gewirkt hat. Die Begründung je Handle steht an
 * der Definition.
 *
 * `products` folgte am 2026-08-15 derselben Regel. Bis dahin stand die
 * Produkt-Liste ZWEIMAL: hier und als `HIDDEN_BUNDLE_PRODUCT_HANDLES` in
 * `products.$handle.jsx`. Beide Kopien trugen zufällig denselben Inhalt —
 * also genau der Zustand, vor dem der Absatz oben warnt, nur für Produkte
 * noch nicht aufgelöst. Jetzt liest auch sie ~/lib/seo. Produkte tragen
 * bewusst keine Übergangsstufe: dort war der Discovery-Pfad nicht das
 * Problem.
 */
const VERSTECKTE_HANDLES = {
  products: NICHT_INDEXIERBARE_PRODUKTE,
  pages: AUS_SITEMAP_ENTFERNTE_SEITEN,
};

/**
 * `blogs` kam am 2026-09-01 dazu und steht als EINZIGER Typ nicht in der
 * Tabelle oben, weil seine Menge nicht kuratiert ist, sondern GEMESSEN wird:
 * ein Blog ohne Artikel beantwortet seine Route seit demselben Tag mit 404
 * und wird von Shopify auf /blogs/wissen weitergeleitet. Eine Sitemap, die
 * weiterleitende URLs anbietet, ist derselbe dauerhafte Widerspruch, den der
 * Absatz oben für `noindex` beschreibt — nur eine Ebene früher.
 *
 * Die Uebergangsstufe von `pages` (erst noindex, erst spaeter aus der
 * Sitemap) gilt hier ausdrücklich NICHT: sie existiert, weil Google eine
 * Seite CRAWLEN muss, um ihr `noindex` ueberhaupt zu lesen. Einen 301 sieht
 * Google bei jedem Crawl der URL, ob sie in der Sitemap steht oder nicht.
 *
 * @param {{query: Function}} storefront
 * @returns {Promise<string[]>} Handles, die aus der Blog-Sitemap fliegen
 */
async function leereBlogHandles(storefront) {
  try {
    const {blogs} = await storefront.query(BLOG_BESTAND_QUERY);
    // hasNextPage wird protokolliert, nicht geworfen: entfernt wird
    // ausschließlich, was positiv als leer GEMESSEN wurde. Eine
    // unvollstaendige Antwort entfernt dann weniger — nie mehr, nie das
    // Falsche.
    if (blogs?.pageInfo?.hasNextPage) {
      console.warn(
        '[sitemap/blogs] mehr Blogs als abgefragt — Filter bleibt Teilmenge',
      );
    }
    return leereHandles(blogs);
  } catch (fehler) {
    // Fail-open, aber LAUT: eine ungefilterte Sitemap ist unsauber, eine
    // Sitemap mit 500 nimmt dem ganzen Shop die Auffindbarkeit.
    console.error('[sitemap/blogs] Bestands-Abfrage fehlgeschlagen', fehler);
    return [];
  }
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  const versteckt =
    params.type === 'blogs'
      ? await leereBlogHandles(storefront)
      : VERSTECKTE_HANDLES[params.type];
  if (!versteckt || versteckt.length === 0) {
    response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);
    return response;
  }

  const body = (await response.text()).replace(
    /<url>[\s\S]*?<\/url>/g,
    (urlEntry) =>
      // Auf `</loc>` verankert statt loser Teilstring-Suche: sonst risse ein
      // Handle auch seinen längeren Namensvetter mit raus (…-2, …-alt).
      // Für die drei Bundle-Handles ist das wirkungsgleich zur früheren
      // Form — es kann nur WENIGER entfernen, nie mehr.
      versteckt.some((handle) =>
        urlEntry.includes(`/${params.type}/${handle}</loc>`),
      )
        ? ''
        : urlEntry,
  );

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return new Response(body, {
    status: response.status,
    headers,
  });
}

// 50 statt eines Defaults: der Shop hat heute 3 Blogs, und ein Seitenlimit,
// das die zuletzt angelegten Objekte hinter den Rand schiebt, hat auf diesem
// Shop schon einmal ein "0 gefunden" für real existierende Datensaetze
// erzeugt. hasNextPage wird oben ausgewertet.
const BLOG_BESTAND_QUERY = `#graphql
  query SitemapBlogBestand($language: LanguageCode) @inContext(language: $language) {
    blogs(first: 50) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        ...BlogBestand
      }
    }
  }
  ${BLOG_BESTAND_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
