import {getSitemap} from '@shopify/hydrogen';
import {
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  NICHT_INDEXIERBARE_PRODUKTE,
  NUR_ROUTE_SEITEN,
  absoluteCanonical,
} from '~/lib/seo';
import {BLOG_BESTAND_FRAGMENT, leereHandles} from '~/lib/blog-bestand';
import {
  ARTIKEL_PFAD_FRAGMENT,
  artikelBlogKarte,
  artikelKarteUnvollstaendig,
  artikelPfad,
} from '~/lib/blog-artikel-pfad';

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
 * Marke für einen Artikel ohne bekannten Blog.
 *
 * `getLink` ist synchron und kann keinen Eintrag ueberspringen — es MUSS eine
 * Zeichenkette liefern. Der so markierte `<url>`-Block wird unten entfernt.
 * Die Marke trägt bewusst ein Zeichen, das in keinem Shopify-Handle
 * vorkommen kann, damit sie nie einen echten Pfad trifft.
 */
const OHNE_BLOG = '#kein-blog-bekannt';

/**
 * lädt die Zuordnung Artikel -> Blog.
 *
 * Fehlerfall gibt `null` statt einer leeren Karte zurück, und der
 * Unterschied ist tragend: eine LEERE Karte hiesse "gemessen, kein Artikel
 * hat einen Blog" und würde die Sitemap für 24 h leer einfrieren. `null`
 * heißt "nicht gemessen" — der Aufrufer verkuerzt dann die Cache-Dauer,
 * damit der nächste Abruf es erneut versucht.
 *
 * @param {LoaderFunctionArgs['context']['storefront']} storefront
 * @returns {Promise<Map<string, string> | null>}
 */
async function artikelKarte(storefront) {
  try {
    const {blogs} = await storefront.query(ARTIKEL_PFAD_QUERY);
    if (artikelKarteUnvollstaendig(blogs)) {
      console.warn(
        '[sitemap/articles] mehr Artikel je Blog als abgefragt — die Karte ist eine Teilmenge, ueberzaehlige Artikel fehlen in der Sitemap',
      );
    }
    if (blogs?.pageInfo?.hasNextPage) {
      console.warn(
        '[sitemap/articles] mehr Blogs als abgefragt — die Karte ist eine Teilmenge',
      );
    }
    return artikelBlogKarte(blogs);
  } catch (fehler) {
    console.error('[sitemap/articles] Zuordnungs-Abfrage fehlgeschlagen', fehler);
    return null;
  }
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  // Artikel liegen unter /blogs/<blogHandle>/<slug>; die generische Form
  // `${baseUrl}/${type}/${handle}` traefe /articles/<slug> und damit eine
  // Route, die es nie gab. Die Zuordnung steht nur VOR getSitemap zur
  // Verfuegung, weil getLink synchron ist.
  const karte = params.type === 'articles' ? await artikelKarte(storefront) : null;
  const nichtGemessen = params.type === 'articles' && karte === null;

  const pfad = (type, handle) => {
    if (type !== 'articles') return `/${type}/${handle}`;
    return artikelPfad(karte, handle) ?? OHNE_BLOG;
  };

  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      const rest = pfad(type, handle);
      if (rest === OHNE_BLOG) return OHNE_BLOG;
      if (!locale) return `${baseUrl}${rest}`;
      return `${baseUrl}/${locale}${rest}`;
    },
  });

  const versteckt =
    params.type === 'blogs'
      ? await leereBlogHandles(storefront)
      : VERSTECKTE_HANDLES[params.type];
  // Konnte die Zuordnung nicht gelesen werden, faellt die Sitemap vorerst
  // leer aus. Sie darf dann NICHT 24 h so festhaengen — die kurze Frist ist
  // der Unterschied zwischen "gleich nochmal versuchen" und "einen Tag lang
  // nichts anmelden".
  const cacheSekunden = nichtGemessen ? 60 * 5 : 60 * 60 * 24;

  // Artikel werden IMMER gefiltert, auch ohne versteckte Handles: sonst
  // truege die Sitemap die `OHNE_BLOG`-Marken als `<loc>` aus. Genau hier lag
  // eine Falle — der früher an dieser Stelle stehende Schnell-Ausstieg
  // greift für `articles` (kein Eintrag in VERSTECKTE_HANDLES) und haette
  // den Filter zuverlaessig uebersprungen.
  const hatVersteckte = Boolean(versteckt && versteckt.length > 0);
  // Nur-Route-Seiten kommen NACH dem Filter dazu (s. mitNurRouteSeiten unten).
  // Sie muessen den Schnell-Ausstieg mit oeffnen, sonst greift die Ergaenzung
  // genau dann nicht, wenn es sonst nichts zu tun gibt.
  const ergaenzung = params.type === 'pages' ? NUR_ROUTE_SEITEN : [];
  if (!hatVersteckte && params.type !== 'articles' && !ergaenzung.length) {
    response.headers.set('Cache-Control', `max-age=${cacheSekunden}`);
    return response;
  }

  const gefiltert = (await response.text()).replace(
    /<url>[\s\S]*?<\/url>/g,
    (urlEntry) => {
      // Ein Artikel ohne bekannten Blog hat keine bekannte Adresse. Lieber
      // gar keine URL als eine tote: fehlend bleibt über den Blog-Index
      // crawlbar, tot kostet Crawl-Budget und Vertrauen.
      if (urlEntry.includes(OHNE_BLOG)) return '';
      // Auf `</loc>` verankert statt loser Teilstring-Suche: sonst risse ein
      // Handle auch seinen längeren Namensvetter mit raus (…-2, …-alt).
      // Für die drei Bundle-Handles ist das wirkungsgleich zur früheren
      // Form — es kann nur WENIGER entfernen, nie mehr.
      return hatVersteckte &&
        versteckt.some((handle) =>
          urlEntry.includes(`/${params.type}/${handle}</loc>`),
        )
        ? ''
        : urlEntry;
    },
  );

  const body = mitNurRouteSeiten(gefiltert, ergaenzung);

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${cacheSekunden}`);

  return new Response(body, {
    status: response.status,
    headers,
  });
}

/**
 * Traegt Seiten nach, die es NUR als Hydrogen-Route gibt (kein Shopify-Objekt).
 *
 * WARUM ES DIESE FUNKTION BRAUCHT: `getSitemap` kennt ausschliesslich
 * Shopify-Ressourcen. Eine Seite, die allein aus einer Route in diesem Repo
 * besteht, liefert HTTP 200 mit vollem Inhalt und steht trotzdem in KEINER
 * Sitemap — sie ist gebaut und fuer die Suche unsichtbar. Das ist kein
 * Sonderfall: /pages/tiefer-schlaf, /pages/qione-2-pro und /pages/podcasts
 * sind seit jeher genau so unsichtbar (gemessen 2026-09-05 gegen
 * sitemap/pages/1.xml, 47 Eintraege).
 *
 * DER HAUSWEG WAR BISHER EIN ANDERER und bleibt gueltig: ein leeres
 * Shopify-Seitenobjekt als Sitemap-Traeger (so gebaut bei `technologie` und
 * `studien`). Diese Funktion ersetzt ihn NICHT und raeumt ihn nicht ab — sie
 * ist die zweite Bauform fuer Seiten, deren Traeger im Repo stehen soll.
 * Der Unterschied ist die Sichtbarkeit: das leere Shopify-Objekt sieht im
 * Admin aus wie eine vergessene leere Seite, und wer es loescht, nimmt der
 * Route ihre Auffindbarkeit, ohne dass irgendwo steht, warum sie existierte.
 *
 * DIE LISTE IST ABSICHTLICH KURZ UND KEINE SAMMELSTELLE: sie traegt genau die
 * Seiten, fuer die diese Entscheidung getroffen ist UND deren Live-Zustand
 * gewacht wird. Ein Eintrag ohne Wache waere eine Sitemap-URL, die still auf
 * 404 laufen kann — derselbe Schaden, vor dem der Blog-Filter oben warnt, nur
 * andersherum. Die Begruendung je Eintrag steht an der Definition in ~/lib/seo.
 *
 * IDEMPOTENT: steht der Pfad schon im Rumpf (weil doch ein Shopify-Objekt
 * existiert), wird nichts ergaenzt — sonst stuende die URL doppelt.
 * KEINE hreflang-Alternates: die Locale-Praefixe (/EN-US/…) sind fuer diese
 * deutschsprachigen Routen keine eigenen Seiten.
 *
 * @param {string} body Sitemap-XML nach dem Versteckt-Filter
 * @param {Array<{pfad: string}>} seiten
 * @returns {string}
 */
function mitNurRouteSeiten(body, seiten) {
  const neu = seiten
    .filter((s) => !body.includes(`${s.pfad}</loc>`))
    .map(
      (s) =>
        `<url>\n  <loc>${absoluteCanonical(s.pfad)}</loc>\n` +
        `  <changefreq>weekly</changefreq>\n</url>\n`,
    )
    .join('');
  if (!neu) return body;
  return body.replace('</urlset>', `${neu}</urlset>`);
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

// Dieselbe Blog-Obergrenze wie oben und aus demselben Grund: der Shop hat
// heute 3 Blogs, und ein Seitenlimit, das die zuletzt angelegten Objekte
// hinter den Rand schiebt, faellt genau bei neuen Inhalten auf.
const ARTIKEL_PFAD_QUERY = `#graphql
  query SitemapArtikelPfade($language: LanguageCode) @inContext(language: $language) {
    blogs(first: 50) {
      pageInfo {
        hasNextPage
      }
      nodes {
        ...BlogArtikelPfad
      }
    }
  }
  ${ARTIKEL_PFAD_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
