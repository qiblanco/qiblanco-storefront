import {getSitemapIndex} from '@shopify/hydrogen';
import {kinderAusIndex, lastmodJeKind, mitKindLastmod} from '~/lib/sitemap-lastmod';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context: {storefront}}) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  // `getSitemapIndex` schreibt nackte `<loc>`-Zeilen; ohne `<lastmod>` hat
  // Google kein Signal, ein Kind erneut zu holen — gemessen 15 Tage
  // Rueckstand auf `sitemap/pages/1.xml`. Begründung, Datenherkunft und die
  // Grenzen der Messung stehen in ~/lib/sitemap-lastmod.
  //
  // FAIL-OPEN: der Sitemap-Index ist die Wurzel der Auffindbarkeit des ganzen
  // Shops. Schlaegt die Ergänzung fehl, geht die unveraenderte Ausgabe
  // hinaus — laut im Log, aber nie als 500 und nie als leere Datei.
  let rumpf;
  try {
    rumpf = await response.text();
    const kinder = kinderAusIndex(rumpf);
    if (kinder.length) {
      rumpf = mitKindLastmod(rumpf, await lastmodJeKind(storefront, kinder));
    }
  } catch (fehler) {
    console.error('[sitemap.xml] lastmod-Ergänzung fehlgeschlagen', fehler);
    if (rumpf === undefined) return response;
  }

  return new Response(rumpf, {
    status: response.status,
    headers: response.headers,
  });
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
