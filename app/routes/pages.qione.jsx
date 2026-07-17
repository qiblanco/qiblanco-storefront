import {redirect} from '@shopify/remix-oxygen';

/*
 * /pages/qione — permanenter 301 auf /pages/qione-2-pro-details
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau).
 *
 * Der bisherige Content (Detail-LP detailseiten/QiOne) lebt unter
 * /pages/qione-2-pro-details weiter; der Name "qione" traf als einziger das
 * Produkt (qione-2-pro) nicht.
 *
 * WARUM CODE-ROUTE STATT SHOPIFY-ADMIN-REDIRECT: storefrontRedirect
 * (server.js) greift NUR bei 404. Ohne diese Code-Route uebernaehme
 * pages.$handle.jsx — der rendert bei existierender CMS-Seite "qione" den
 * Alt-Content und wirft bei fehlender CMS-Seite redirect('/') statt 404.
 * Ein Admin-Redirect wuerde fuer /pages/* also NIE feuern; der 301 muss
 * hier im Code liegen. Query-String bleibt erhalten (Klick-IDs ueberleben).
 *
 * Rollback: git revert dieses Commits stellt die alte Detail-LP-Route wieder her.
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/pages/qione-2-pro-details${url.search}`, 301);
}

export default function QiOneRedirect() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
