import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_MUTATE_FRAGMENT, CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {resolveCountry} from '~/lib/markt-pricing';
import {
  ladePreismodus,
  setzePreismodus,
  vorschauModus,
} from '~/lib/preismodus';

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
      // PFLICHT, nicht Kosmetik (Job 20260923-adparams-monotonie-tot-auf-
      // hauptpfad-...): ohne `mutateFragment` greift Hydrogens Default
      // `CartApiMutation { id totalQuantity checkoutUrl }`, und JEDES
      // Mutationsergebnis kommt ohne `attributes` zurück. Der Vorbestand, den
      // `persistAttributionOnCartResult` für die Monotonie von
      // `ad_params_seen` liest, war deshalb auf dem gesamten Hauptpfad immer
      // leer. Begründung und Nachweis: app/lib/fragments.js, ARM-H1/H2.
      mutateFragment: CART_MUTATE_FRAGMENT,
      getBuyerIdentity: () => ({
           countryCode: country,
      }),
    },
  });

  // PREISMODUS netto|brutto (Grossjob 20260924-kasse-zeigt-bruttopreise-wie-
  // produktseite-prio10, s02): HIER und nicht im root-Loader, weil Kind-Loader
  // parallel zum root-Loader laufen und sonst mit dem alten Modus rechneten.
  // Kurz gecacht (30 s + 30 s stale), wirft nie; Rückfall-Reihenfolge und
  // Begründung in lib/preismodus.js.
  let preismodus = await ladePreismodus(hydrogenContext.storefront);
  // Vorschau-Weiche (nur localhost/Oxygen-Vorschau, Positivliste in
  // lib/preismodus.js): macht den Kipp vorab am gerenderten Laden messbar.
  const vorschau = vorschauModus(request.url);
  if (vorschau) {
    setzePreismodus(vorschau, 'vorschau');
    preismodus = {modus: vorschau, quelle: 'vorschau'};
  }

  return {
    ...hydrogenContext,
    preismodus,
    // declare additional Remix loader context
  };
}
