import {getSitemap} from '@shopify/hydrogen';
import {
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  NICHT_INDEXIERBARE_PRODUKTE,
} from '~/lib/seo';

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
