import {redirect} from '@shopify/remix-oxygen';
import {handleGoRequest} from '~/lib/go-router.server';

/**
 * LP-Router /go (qiblanco.com/go) — Konzept landingpage-4lp-abcd-konzept, Kap. 4.2.
 *
 * Reine Loader-Route: KEIN UI, KEIN Pixel-Code. Liest Herkunfts-Parameter
 * (utm_term/utm_content) + Consent-Signal, entscheidet per Prioritaets-Kaskade
 * (Kap. 4.6: Herkunft > Profil-Rotation > Bandit > Default) und leitet mit GENAU
 * EINEM serverseitigen 302 same-domain weiter — Query komplett weitergereicht
 * (fbclid ueberlebt byte-identisch, Kap. 8 #1), Cache-Control: no-store (Kap. 8 #3).
 *
 * Segment s06 des Grossjobs landingpage-4lp-abcd-bau. Zone A: diese Route ist
 * UNVERLINKT (kein Ad/Menu/interner Link zeigt her) und ROTATION_MODE ist in DIESEM
 * Segment NICHT gesetzt (=off) — jeder Request landet auf Default A mit vollem
 * Query-Forward (Kap. 9 P2, live-unbedenklich). Aktivierung (ROTATION_MODE=on) ist
 * ein spaeteres Christian-Gate (P4+).
 *
 * Die eigentliche Entscheidungslogik lebt in ~/lib/go-router.server.js (Fail-soft-
 * Orchestrierung) + ~/lib/go-router-logic.js (reine Kaskade) — bewusst OHNE
 * Remix/Oxygen-Import, damit sie mit `node --test test/go-router.test.mjs` ohne
 * Build-Toolchain prüfbar ist. Dieser Adapter übersetzt nur in ein redirect().
 */
export async function loader({request, context}) {
  const {location, headers} = await handleGoRequest({
    request,
    env: context?.env,
    fetchImpl: fetch,
  });
  const responseHeaders = new Headers();
  for (const [key, value] of headers) {
    responseHeaders.append(key, value);
  }
  throw redirect(location, {status: 302, headers: responseHeaders});
}

export default function GoRoute() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
