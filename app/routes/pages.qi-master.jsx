import {redirect} from 'react-router';

/*
 * /pages/qi-master — 301 auf /products/qi-alpha, in EINEM Sprung, Query bleibt.
 *
 * Bis zum 27.10.2026 trug nur eine Shopify-Admin-Weiterleitung diese Adresse
 * (DACH, qi-master -> /products/the-alpha, gelesen am 27.10.2026). Nach dem Umzug Qi Alpha
 * (Christian 27.10.2026, Z1; Job 20261027-prio1-umzug-the-alpha-zu-qi-alpha-
 * links-name) wäre das eine Kette über /products/the-alpha. Diese Route greift vor
 * der Admin-Weiterleitung (die kommt erst bei einem 404) und hält den einen
 * Sprung, ohne Shopify-Schreibvorgang. Die Admin-Zeile kann stehen bleiben.
 * Rückweg: Datei löschen, dann gilt wieder die Admin-Weiterleitung.
 */

/** @param {LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/qi-alpha${url.search}`, 301);
}

/*
 * Nie im Index: die Adresse ist nur noch eine Weiterleitung (Zufahrts-Gate,
 * statisches noindex in meta() wie bei den Testarmen).
 */
export const meta = () => [{name: 'robots', content: 'noindex,nofollow'}];

export default function QiMasterAltadresseRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
