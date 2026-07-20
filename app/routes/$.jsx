import {redirect} from '@shopify/remix-oxygen';
import {
  analysiereCatchAllPfad,
  protokolliereCatchAll,
} from '~/lib/catchall.server';

/**
 * Catch-All (Auftrag 20260720-ads-lpa-s02-catchall-404): Locale-Prefixe
 * (/en-th/, /de-de/, /en/ ...) werden gestrippt und 302-weitergeleitet
 * (Query byte-erhalten); alle anderen unbekannten Pfade antworten ehrlich
 * 404, damit server.js storefrontRedirect (Shopify-URL-Redirects) greifen
 * kann und sonst die root-ErrorBoundary rendert. Entscheidungslogik +
 * WARUM: app/lib/catchall.server.js (Tests: test/catchall.test.mjs).
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const befund = analysiereCatchAllPfad(url.pathname);
  if (befund.typ === 'locale-strip') {
    protokolliereCatchAll(context, 'locale_strip', url, befund.ziel);
    throw redirect(`${befund.ziel}${url.search}`, 302);
  }
  protokolliereCatchAll(context, 'not_found', url, null);
  throw new Response(null, {status: 404});
}

export default function CatchAllPage() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
