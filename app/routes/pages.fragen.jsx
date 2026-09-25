import {redirect} from '@shopify/remix-oxygen';
import {HUB_PFAD, HUB_ANKER} from '~/lib/fragen-schema';

/**
 * /pages/fragen — permanenter 301 auf den Fragen-Abschnitt der FAQ.
 *
 * WARUM (Auftrag 20260926-seo-duenne-vorlagenseiten-aufwerten-oder-
 * zusammenfuehren, Christian 2026-09-25: „Dünne Vorlagenseiten … werden
 * aufgewertet oder in eine starke Seite zusammengeführt (301)"): der Hub hatte
 * 480 Wörter, stand bei Google auf „Gefunden – zurzeit nicht indexiert" und war
 * nur von Seiten verlinkt, die selbst nicht im Index sind. Seine Absicht ist
 * die der FAQ — die Flächen-SSoT homepage-bauer/konzepte/abgrenzung-
 * flaechen.json führt für /pages/faq die Primär-Anfrage „Qi Blanco Fragen".
 * Die FAQ ist seit dem 2026-09-22 indexiert und hängt an der Fußzeile jeder
 * Seite. Ihr Abschnitt `#einzelfragen` trägt jetzt die Liste der Frageseiten
 * (FaqEinzelfragen() in app/components/faq/FaqSeite.jsx), samt dem Marker
 * data-geo="frageliste", an dem die Proben die Frageseiten ablesen.
 *
 * WARUM CODE-ROUTE STATT SHOPIFY-ADMIN-REDIRECT: storefrontRedirect
 * (server.js) greift NUR bei 404, und ohne diese Datei übernähme
 * pages.$handle.jsx — dieselbe Begründung wie in pages.qihome.jsx. Der
 * Query-String bleibt erhalten (Klick-IDs überleben).
 *
 * SITEMAP: der Eintrag in NUR_ROUTE_SEITEN (app/lib/seo.js) ist im selben
 * Commit entfernt — eine Sitemap-URL, die weiterleitet, meldet
 * pruefungen/probe_sitemap_ohne_weiterleitung.py.
 *
 * RÜCKWEG: hb-deploy revert --sha <merge> stellt Hub, Route und
 * Sitemap-Eintrag gemeinsam wieder her.
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`${HUB_PFAD}${url.search}#${HUB_ANKER}`, 301);
}

export default function FragenWeiterleitung() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
