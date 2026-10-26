import {redirect} from 'react-router';

/*
 * /products/qi-master-wunschnummer — 301 auf /products/the-alpha (seit 2026-10-26, davor /products/qi-alpha; bis 2026-10-17
 * auf /products/qi-master: Christian benannte das Produkt in Qi Alpha um, und
 * ein Add-on-Pfad leitet in EINEM Sprung auf die Hauptseite, nie über den
 * alten Pfad).
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
  throw redirect(`/products/the-alpha${url.search}`, 301);
}

export default function QiMasterAddonRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
