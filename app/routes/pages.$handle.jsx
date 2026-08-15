import {useLoaderData} from 'react-router';
import {Rechtsseite} from '~/components/Rechtsseite';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {istNichtIndexierbar, noindexMeta} from '~/lib/seo';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, params}) => {
  // Shopify pflegt je Seite ein eigenes seo.title — der Loader holt es
  // (PAGE_QUERY seo{title description}), benutzt wurde es nie. Vorrang für
  // das gepflegte Feld, sonst der Seitentitel, immer mit der Marke dahinter.
  const roh = data?.page?.seo?.title || data?.page?.title || '';
  const tags = [{title: roh ? `${roh} | Qi Blanco` : 'Qi Blanco'}];
  // Stufe S0 (Index-Hygiene): Entwicklungs-/Restseiten gehören nicht in den
  // Index. Die Liste steht in ~/lib/seo, weil die Sitemap-Route sie ebenfalls
  // liest — eine zweite Liste hier würde früher oder später abweichen.
  //
  // Bewusst NUR das robots-meta und KEIN X-Robots-Tag-Header: der Header
  // brauchte einen Umbau der Loader-Rückgabe auf data(payload, {headers}),
  // und dieser Loader bedient JEDE Shopify-Seite des Shops. Das Flächen-
  // Risiko steht in keinem Verhältnis zum Nutzen eines zweiten Signals —
  // Google honoriert `noindex` im meta-Tag vollständig.
  if (istNichtIndexierbar(params?.handle)) tags.push(noindexMeta());
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

  return {...deferredData, ...criticalData};
}

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
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
