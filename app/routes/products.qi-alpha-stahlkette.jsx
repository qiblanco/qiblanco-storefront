import {redirect} from 'react-router';

/*
 * /products/qi-alpha-stahlkette — 301 auf /products/qi-alpha.
 *
 * Das Produkt ist ein ADD-ON des Qi Alpha und wird nur zusammen mit ihm
 * verkauft: inklusive im Warenkorb, nie allein. Ohne diese Route rendert der
 * Catch-all products.$handle.jsx eine generische Einzelseite (gemessen
 * 01.11.2026: HTTP 200). Query-String bleibt erhalten.
 * Bauform wie products.qi-alpha-goldkette.jsx (Code-Route statt Admin-Redirect:
 * der greift nur bei 404).
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/qi-alpha${url.search}`, 301);
}

export default function QiAlphaStahlketteRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
