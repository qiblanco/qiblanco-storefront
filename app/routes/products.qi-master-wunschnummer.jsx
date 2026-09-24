import {redirect} from '@shopify/remix-oxygen';

/*
 * /products/qi-master-wunschnummer — 301 auf /products/qi-master.
 *
 * Das Produkt ist ein ADD-ON des Qi Master® (Christian 2026-09-24) und wird
 * nur zusammen mit ihm verkauft: es steht im Add-on-Bereich unter dem
 * Kaufknopf von /products/qi-master, nie allein. Ohne diese Route rendert der
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
  throw redirect(`/products/qi-master${url.search}`, 301);
}

export default function QiMasterAddonRedirect() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
