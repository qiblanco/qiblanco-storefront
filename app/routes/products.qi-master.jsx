import {redirect} from 'react-router';

/*
 * /products/qi-master — 301 auf /products/the-alpha.
 *
 * SEIT 2026-10-26 ZIEL /products/the-alpha (Christian Z4 vom 25.10.2026: „wir
 * gehen im link weg von qi-alpha hin zu the alpha"; Grossjob 20261025-prio1-
 * the-alpha-..., s06). Ein Sprung, keine Kette über /products/qi-alpha.
 *
 * Christian am 2026-10-17: „ja bitte auch die Shopseite und das Produkt. es
 * heißt nun Qi Alpha" (Grossjob 20261017 zum neuen
 * Namen, Segment s02). Die Kaufseite steht seitdem unter
 * products.qi-alpha.jsx; dieser alte Pfad ist nur noch die Hülle, damit kein
 * Link aus Mail, Anzeige, Chat oder Suche tot läuft. Query-String bleibt
 * erhalten (UTM, Click-IDs, Partnercode).
 * Bauform wie products.qi-master-goldkette.jsx (Code-Route statt Admin-
 * Redirect: der greift auf Hydrogen nur bei 404, und ohne diese Route
 * renderte der Catch-all products.$handle.jsx bis zum s09-Handle-Wechsel die
 * alte Kaufseite).
 * Rückweg: diese Datei durch den Stand vor dem Umbau ersetzen (git).
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/the-alpha${url.search}`, 301);
}

export default function QiMasterAltpfadRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
