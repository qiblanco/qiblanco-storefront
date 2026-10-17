import {redirect} from 'react-router';

/*
 * /products/qi-master — 301 auf /products/qi-alpha.
 *
 * Christian am 2026-10-17: „ja bitte auch die Shopseite und das Produkt. es
 * heisst nun Qi Alpha" (Grossjob 20261017-GROSSJOB-qi-master-heisst-qi-alpha-
 * shop-produkt-seiten-serverweit, s02). Die Kaufseite steht seitdem unter
 * products.qi-alpha.jsx; dieser alte Pfad ist nur noch die Huelle, damit kein
 * Link aus Mail, Anzeige, Chat oder Suche tot laeuft. Query-String bleibt
 * erhalten (UTM, Click-IDs, Partnercode).
 * Bauform wie products.qi-master-goldkette.jsx (Code-Route statt Admin-
 * Redirect: der greift auf Hydrogen nur bei 404, und ohne diese Route
 * renderte der Catch-all products.$handle.jsx bis zum s09-Handle-Wechsel die
 * alte Kaufseite).
 * Rueckweg: diese Datei durch den Stand vor dem Umbau ersetzen (git).
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/qi-alpha${url.search}`, 301);
}

export default function QiMasterAltpfadRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
