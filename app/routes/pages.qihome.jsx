import {redirect} from '@shopify/remix-oxygen';

/*
 * /pages/qihome — permanenter 301 auf /pages/qihome-details
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Christian-Praezisierung im GO 2026-07-17: die neue LP-Shopseite traegt
 * "Air" -> /pages/qihome-air, diese URL hier zieht auf -details um).
 *
 * Der bisherige Content (Detail-LP detailseiten/QiHomeLanding) lebt unter
 * /pages/qihome-details weiter.
 *
 * WARUM CODE-ROUTE STATT SHOPIFY-ADMIN-REDIRECT: storefrontRedirect
 * (server.js) greift NUR bei 404. Ohne diese Code-Route uebernaehme
 * pages.$handle.jsx — der rendert bei existierender CMS-Seite "qihome" den
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
  throw redirect(`/pages/qihome-details${url.search}`, 301);
}

export default function QiHomeRedirect() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
