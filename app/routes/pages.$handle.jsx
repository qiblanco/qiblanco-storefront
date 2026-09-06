// `data` bewusst umbenannt importiert: der meta()-Export unten destrukturiert
// selbst ein Argument namens `data` und würde den Import sonst beschatten.
import {data as mitHeadern, useLoaderData} from 'react-router';
import {Rechtsseite} from '~/components/Rechtsseite';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  canonicalLink,
  istNichtIndexierbar,
  noindexHeader,
  noindexMeta,
} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, params}) => {
  // Shopify pflegt je Seite ein eigenes seo.title — der Loader holt es
  // (PAGE_QUERY seo{title description}), benutzt wurde es nie. Vorrang für
  // das gepflegte Feld, sonst der Seitentitel, immer mit der Marke dahinter.
  const roh = data?.page?.seo?.title || data?.page?.title || '';
  const tags = [{title: roh ? `${roh} | Qi Blanco` : 'Qi Blanco'}];
  // DIE BESCHREIBUNG WURDE GEHOLT UND NIE AUSGEGEBEN — das ist der Befund des
  // Papiers vom 2026-08-15: `PAGE_QUERY` unten holt `seo { title description }`,
  // benutzt wurde bis hierher nur der Titel. Rangfolge und der Grund, warum die
  // Verdrahtung allein nicht reicht, stehen im Kopf von ~/lib/seiten-beschreibung.
  tags.push(
    ...beschreibungTags(
      params?.handle ? `/pages/${params.handle}` : '',
      data?.page?.seo?.description,
    ),
  );
  // Stufe S0 (Index-Hygiene): Entwicklungs-/Restseiten gehören nicht in den
  // Index. Die Liste steht in ~/lib/seo, weil die Sitemap-Route sie ebenfalls
  // liest — eine zweite Liste hier würde früher oder später abweichen.
  //
  // Die zweite Hälfte des Doppelgates (X-Robots-Tag) sitzt im Loader und im
  // `headers`-Export unten — hier steht nur das meta.
  //
  // ENTWEDER noindex ODER canonical, nie beides (s04, 2026-08-26). Die Regel
  // ist nicht neu, sie stand bisher nur in den Routen mit eigener Datei —
  // wörtlich in `pages.uebersicht.jsx`: „noindex plus ein canonical auf eine
  // andere URL sind widersprüchliche Signale; ein Bot, der dem canonical
  // folgt, kann das noindex der Zielseite zuordnen." Dieser Katchall bediente
  // bis hierher BEIDE Fälle und setzte für KEINEN einen canonical: die
  // indexierbaren Shopify-Seiten (`/pages/widerrufsbelehrung`,
  // `/pages/support-1`) gingen deshalb ganz ohne canonical live.
  //
  // WARUM DER canonical AUS `params.handle` UND NICHT AUS DER ANGEFRAGTEN URL
  // GEBAUT WIRD: `absoluteCanonical` würde eine mitgegebene URL zwar von Query
  // und Hash befreien, aber der Pfad selbst kann eine lokalisierte Variante
  // sein. `params.handle` ist der Wert, unter dem Shopify die Seite führt —
  // damit zeigt der canonical immer auf die eine kanonische Fassung, auch wenn
  // die Seite über einen Alias erreicht wurde.
  if (istNichtIndexierbar(params?.handle)) {
    tags.push(noindexMeta());
  } else if (params?.handle) {
    tags.push(canonicalLink(`/pages/${params.handle}`));
  }
  return tags;
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const payload = {...deferredData, ...criticalData};

  // ZWEITE HÄLFTE DES noindex-DOPPELGATES (s05, 2026-08-23).
  //
  // Bis hierher stand hier der ausdrückliche Verzicht: „bewusst NUR das
  // robots-meta und KEIN X-Robots-Tag — das Flächen-Risiko steht in keinem
  // Verhältnis". Das benannte Risiko war, dass ein `headers`-Export einer
  // Blattroute die Header der Elternroute verdrängt, und dieser Loader
  // bedient JEDE Shopify-Seite des Shops.
  //
  // DAS RISIKO IST NACHGEMESSEN UND EXISTIERT NICHT: `app/root.jsx`
  // exportiert gar kein `headers`, und die Sicherheits-/CSP-Header setzt
  // `app/entry.server.jsx` über `responseHeaders.set()` — also AUSSERHALB
  // der Routen-Header-Kette. Live gegengeprüft am 2026-08-23:
  // /pages/uebersicht (Blattroute MIT headers-Export) und /pages/support
  // (ohne) liefern denselben Header-Satz, die erste zusätzlich x-robots-tag.
  // Es gibt keine Elternheader, die verloren gehen könnten. Der `headers`-
  // Export unten baut trotzdem auf `parentHeaders` auf statt sie zu
  // ersetzen — dann bleibt das auch wahr, wenn root eines Tages welche setzt.
  //
  // Warum überhaupt zwei Signale: Hausmuster D-006 („Gurt und Hosenträger").
  // Google honoriert das meta-Tag vollständig, aber nur, wenn der Bot das
  // HTML-head parst. Alle eigenen noindex-Routen des Repos (uebersicht,
  // tiefer-schlaf, partner, …) tragen beide — der Katchall war die letzte
  // Fläche, die nur eines trug.
  //
  // `data()` greift NUR im noindex-Fall; für die anderen ~47 Shopify-Seiten
  // gibt der Loader unverändert das nackte Objekt zurück.
  if (istNichtIndexierbar(args.params?.handle)) {
    return mitHeadern(payload, {headers: noindexHeader()});
  }

  return payload;
}

/**
 * Reicht ausschließlich das X-Robots-Tag des Loaders durch und erbt sonst
 * unverändert, was der Elternbaum liefert.
 *
 * Bewusst NICHT `loaderHeaders` als Ganzes zurückgeben: das würde auch jeden
 * künftigen Loader-Header (Cache-Control, Set-Cookie) ungeprüft zum
 * Dokument-Header machen. Gefiltert wird auf genau den einen Namen, den diese
 * Route setzt.
 * @type {HeadersFunction}
 */
export const headers = ({loaderHeaders, parentHeaders}) => {
  const kopf = new Headers(parentHeaders);
  const robots = loaderHeaders?.get('X-Robots-Tag');
  if (robots) kopf.set('X-Robots-Tag', robots);
  return kopf;
};

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    // Ehrlicher 404 statt stillem redirect('/') (Auftrag 20260720-ads-lpa-
    // s02-catchall-404): erst mit Status 404 kann server.js
    // storefrontRedirect Shopify-Admin-URL-Redirects greifen lassen; findet
    // Shopify nichts, rendert die root-ErrorBoundary die 404-Seite.
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
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

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  // DIESE ROUTE IST DER LETZTE UNGESTALTETE DEFAULT DES SHOPS GEWESEN.
  //
  // Sie bedient JEDE Shopify-Seite, für die es keine eigene Route gibt, und
  // rendert deren `body` als rohes CMS-HTML. Bis zum Job 20260815-designmeister-
  // rechtsseiten... stand hier ein nacktes <div className="page"> ohne jede
  // Typografie — eine im Shopify-Admin angelegte Seite war damit sofort live
  // und ungestaltet. Genau so lag /pages/widerrufsbelehrung draußen: 7646
  // Zeichen Gesetzestext, 95 % der Textbloecke über 75 Zeichen Zeilenlaenge.
  //
  // Warum ein DOKUMENT-Layout der richtige Default ist (gemessen, nicht
  // vermutet): von den 48 Shopify-Seiten laufen 17 über diese Route, davon
  // 7 reiner Flies-/Rechtstext und 10 mit leerem body — KEINE EINZIGE mit
  // Bild, iframe oder eigenem Layout-Geruest. Reiche Seiten haben in diesem
  // Repo ausnahmslos eine eigene Route. Der Katchall trägt also per Bauart
  // Lesetext, und Lesetext gehört in eine Lese-Spalte.
  //
  // Wer hier kuenftig eine reiche Seite braucht, legt ihr eine eigene Route an
  // (das etablierte Muster) — statt den Default für alle aufzuweichen.
  return (
    <Rechtsseite titel={page.title}>
      {/* Inhalt unveraendert aus dem Shopify-Admin. Gestaltet wird er
          ausschließlich über die .rs-doc-Tokens, nie durch Eingriff in den
          Text. Kein <main> mehr: PageLayout liefert bereits eines
          (components/PageLayout.jsx), das hier war ein zweites, verschachteltes. */}
      <div
        className="rs-doc__rumpf"
        dangerouslySetInnerHTML={{__html: page.body}}
      />
    </Rechtsseite>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
