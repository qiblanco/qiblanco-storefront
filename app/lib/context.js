import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {resolveCountry} from '~/lib/markt-pricing';

/**
 * The context implementation is separate from server.ts
 * so that type can be extracted for AppLoadContext
 * @param {Request} request
 * @param {Env} env
 * @param {ExecutionContext} executionContext
 */
export async function createAppLoadContext(request, env, executionContext) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  // M3 (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft): Markt-Kontext
  // aus Geo/Preview statt hartem DE-Pin. Solange FREIGESCHALTETE_MAERKTE
  // leer ist, liefert resolveCountry IMMER 'DE' (dunkel = Status quo).
  // Sprache bleibt DE (deutschsprachiger Storefront) — Storefront-API
  // akzeptiert language DE mit beliebigem country (belegt via @inContext).
  const country = resolveCountry(request);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: {language: 'DE', country},
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
      getBuyerIdentity: () => ({
           countryCode: country,
      }),
    },
  });

  return {
    ...hydrogenContext,
    // declare additional Remix loader context
  };
}
