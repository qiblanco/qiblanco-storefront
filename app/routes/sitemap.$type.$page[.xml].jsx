import {getSitemap} from '@shopify/hydrogen';
import {
  NICHT_INDEXIERBARE_SEITEN,
  NICHT_INDEXIERBARE_PRODUKTE,
} from '~/lib/seo';

/**
 * Welche Handles fliegen aus welchem Sitemap-Typ?
 *
 * `pages` kam mit Stufe S0 (Index-Hygiene) dazu: eine Seite auf `noindex` zu
 * setzen und sie gleichzeitig in der Sitemap anzubieten, ist ein Widerspruch,
 * den die Search Console dauerhaft als Konflikt meldet. Die Handle-Liste ist
 * DIESELBE, die `pages.$handle.jsx` für das robots-meta liest (Quelle
 * ~/lib/seo) — genau deshalb steht sie dort und nicht hier.
 *
 * `products` folgte am 2026-08-15 derselben Regel. Bis dahin stand die
 * Produkt-Liste ZWEIMAL: hier und als `HIDDEN_BUNDLE_PRODUCT_HANDLES` in
 * `products.$handle.jsx`. Beide Kopien trugen zufällig denselben Inhalt —
 * also genau der Zustand, vor dem der Absatz oben warnt, nur für Produkte
 * noch nicht aufgelöst. Jetzt liest auch sie ~/lib/seo.
 */
const VERSTECKTE_HANDLES = {
  products: NICHT_INDEXIERBARE_PRODUKTE,
  pages: NICHT_INDEXIERBARE_SEITEN,
};

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

  const versteckt = VERSTECKTE_HANDLES[params.type];
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
