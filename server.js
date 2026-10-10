// Virtual entry point for the app
// eslint-disable-next-line import/no-unresolved
import * as serverBuild from 'virtual:react-router/server-build';
// createRequestHandler kommt seit Hydrogen 2025.7.1 aus @shopify/hydrogen, nicht
// mehr aus @shopify/remix-oxygen (seit 2026.4.1 deprecated). Nur dieser Handler
// betreibt den Storefront-API-Proxy auf der eigenen Domain (/api/<version>/
// graphql.json). Ueber ihn setzt Shopify die server-gesetzten Cookies
// (_shopify_analytics/_shopify_marketing) und ab Hydrogen 2026.4 auch die
// Einwilligung (backend consent) -- ohne ihn fiele die Consent-Schicht still
// auf den Checkout-Domain-Weg zurueck. Upgrade 2025.7 -> 2026.4, Job
// 20260926-qiblanco-hydrogen-2025-7-auf-2026-4-vor-sfapi-ruhestand-2026-10-16.
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createAppLoadContext} from '~/lib/context';
import {mitAbwehr} from '~/lib/abwehr/abwehr';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    /**
     * Der unveränderte Bestands-Handler. Der Abwehr-Vorfilter
     * (sicherheitsmeister T2, SHADOW-Default) legt sich als never-break-
     * Mantel davor: er ändert ausschließlich Statuscode/Challenge, nie
     * Content (INV-1), und fällt bei jedem Fehler/Flag-off auf genau
     * diesen Handler zurück.
     */
    const next = async () => {
      try {
        const appLoadContext = await createAppLoadContext(
          request,
          env,
          executionContext,
        );

        /**
         * Create a Remix request handler and pass
         * Hydrogen's Storefront client to the loader context.
         */
        const handleRequest = createRequestHandler({
          build: serverBuild,
          mode: process.env.NODE_ENV,
          getLoadContext: () => appLoadContext,
        });

        const response = await handleRequest(request);

        // MESSPUNKT AM RAND: welche Storefront-API-Version dieser Server fuer
        // seine eigenen Abfragen WIRKLICH benutzt. Shopify schaltet Versionen
        // nach rund zwölf Monaten ab und liefert dann still eine andere aus
        // (2025-10 am 2026-10-16). Die Wache vergleicht diesen Kopf mit dem
        // X-Shopify-API-Version-Kopf, den Shopify für genau diese Version
        // zurückgibt. Aus dem Client-Bundle ist die Version nicht verlässlich
        // lesbar (am 2026-09-26 in keinem der 74 Chunks einer Kaufseite).
        // Wirft nie: ein fehlender Messkopf darf den Kaufweg nicht berühren.
        try {
          const version = /\/api\/([^/]+)\/graphql\.json/.exec(
            appLoadContext.storefront.getApiUrl(),
          )?.[1];
          if (version) response.headers.set('X-QB-SFAPI-Version', version);
        } catch {
          // unveränderliche Kopfzeilen (z.B. Redirect) — Messkopf entfällt
        }

        if (appLoadContext.session.isPending) {
          // append, nicht set: seit Hydrogen 2026.4 haengt createRequestHandler
          // die Set-Cookie-Zeilen der Storefront-API-Unterabfragen (server-
          // gesetzte _shopify_*-Cookies) an die Dokument-Antwort. `set` wuerde
          // sie beim Session-Commit still ueberschreiben.
          response.headers.append(
            'Set-Cookie',
            await appLoadContext.session.commit(),
          );
        }

        if (response.status === 404) {
          /**
           * Check for redirects only when there's a 404 from the app.
           * If the redirect doesn't exist, then `storefrontRedirect`
           * will pass through the 404 response.
           */
          return storefrontRedirect({
            request,
            response,
            storefront: appLoadContext.storefront,
          });
        }

        return response;
      } catch (error) {
        console.error(error);
        return new Response('An unexpected error occurred', {status: 500});
      }
    };

    return mitAbwehr(request, env, executionContext, next);
  },
};