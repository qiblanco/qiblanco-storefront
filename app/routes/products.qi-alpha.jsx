import {redirect} from 'react-router';

/*
 * /products/qi-alpha — 301 auf /products/the-alpha (Kaufseite des Qi Alpha).
 *
 * Christian am 25.10.2026 (Z4): „d.h. wir gehen im link weg von qi-alpha hin
 * zu the alpha" (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-
 * a-server-b-ki-c, Segment s06). EIN Sprung, keine Kette über einen
 * Zwischenpfad; der Query-String bleibt (UTM, Click-IDs, Partnercode).
 * Die Kaufseite stand hier vom 2026-10-26T02:10Z (#1021) bis zum Umzug; sie
 * lebt unverändert in products.the-alpha.jsx weiter.
 * Rückweg: git revert des Umzug-PR.
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/the-alpha${url.search}`, 301);
}

export default function QiAlphaAltpfadRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
