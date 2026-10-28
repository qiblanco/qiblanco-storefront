import {redirect} from 'react-router';

/*
 * /products/qi-alpha-goldkette — 301 auf /products/the-alpha.
 *
 * SEIT 2026-10-26 ZIEL /products/the-alpha (Christian Z4 vom 25.10.2026: „wir
 * gehen im link weg von qi-alpha hin zu the alpha"; Grossjob 20261025-prio1-
 * the-alpha-..., s06). Ein Sprung, keine Kette über /products/qi-alpha.
 *
 * Neuer Add-on-Pfad seit der Umbenennung Qi Master -> Qi Alpha (Christian
 * 2026-10-17). Ab dem s09-Handle-Wechsel heißt das Shopify-Produkt so; ohne
 * diese Route rendert der Catch-all products.$handle.jsx dann eine eigene
 * Add-on-Kaufseite.
 *
 * Das Produkt ist ein ADD-ON des Qi Alpha (bis 2026-10-17 Qi Master; Christian 2026-09-24) und wird
 * nur zusammen mit ihm verkauft: es steht im Add-on-Bereich unter dem
 * Kaufknopf von /products/qi-alpha, nie allein. Ohne diese Route rendert der
 * Catch-all products.$handle.jsx eine eigene Kaufseite, von der aus es ohne
 * Qi Master in den Warenkorb ginge. Query-String bleibt erhalten.
 * Bauform wie pages.qihome.jsx (Code-Route statt Admin-Redirect: der greift
 * nur bei 404).
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/products/qi-alpha${url.search}`, 301);
}

export default function QiMasterAddonRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
