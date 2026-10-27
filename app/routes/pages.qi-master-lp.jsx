import {redirect} from 'react-router';

/*
 * /pages/qi-master-lp — 301 auf /pages/Qi-Alpha, in EINEM Sprung, Query bleibt.
 *
 * Bis zum 27.10.2026 trug nur eine Shopify-Admin-Weiterleitung diese Adresse
 * (DACH, qi-master-lp -> /pages/The-Alpha, gelesen am 27.10.2026). Nach dem Umzug Qi Alpha
 * (Christian 27.10.2026, Z1; Job 20261027-prio1-umzug-the-alpha-zu-qi-alpha-
 * links-name) wäre das eine Kette über /pages/The-Alpha. Diese Route greift vor
 * der Admin-Weiterleitung (die kommt erst bei einem 404) und hält den einen
 * Sprung, ohne Shopify-Schreibvorgang. Die Admin-Zeile kann stehen bleiben.
 * Rückweg: Datei löschen, dann gilt wieder die Admin-Weiterleitung.
 */

/** @param {LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/pages/Qi-Alpha${url.search}`, 301);
}

export default function QiMasterAltadresseRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
