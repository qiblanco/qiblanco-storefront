import {redirect} from '@shopify/remix-oxygen';

/*
 * /qione — permanenter 301 auf die echte Produktseite.
 *
 * WARUM DIESE ROUTE EXISTIERT (Job 20260901-redirect-qione-taggt-organischen-
 * traffic-als-affiliate, gemessen 2026-09-03):
 *
 * Im Shopify-Admin liegt ein Partner-Vanity-Redirect
 *   /qione -> https://qiblanco.com/?sca_ref=3827399.BH9HZVLgbE
 * für den AKTIVEN Affiliate 3827399. Der ist korrekt und bleibt bestehen —
 * er ist eine von 66 gleichartigen Vanity-Weiterleitungen im DACH-Shop.
 *
 * Das Problem ist nicht der Redirect, sondern eine KOLLISION: "qione" ist
 * zugleich unser eigener Content-Handle (Shopify-Page "QiOne"), und der alte
 * indexierte Pfad /en/qione/ fällt über den Locale-Strip ($.jsx) auf /qione.
 * Organischer Marken-Traffic wurde dadurch als Vermittlung dieses Partners
 * gebucht. Von 66 Vanity-Slugs kollidiert genau dieser eine mit einem eigenen
 * Handle (beidseitig gegengeprüft: auch 1 von 56 Partner-custom-links).
 *
 * DER SCHNITT: qiblanco.com ist Hydrogen, checkout.qiblanco.com ist der
 * Liquid-Store — zwei getrennte Engines. Diese Route wirkt NUR auf Hydrogen
 * und fängt /qione ab, bevor server.js bei 404 storefrontRedirect() die
 * Admin-Redirects befragt. Der offizielle Partner-Link
 * checkout.qiblanco.com/qione läuft weiter über den Admin-Redirect und
 * behält seine Attribution unveraendert. Deshalb wurde am Admin NICHTS
 * geaendert.
 *
 * QUERY-STRING BLEIBT ERHALTEN: wer mit ?sca_ref=... (oder Klick-IDs) hier
 * ankommt, behält seine Attribution — geheilt wird nur der PARAMETERLOSE
 * organische Zugriff, nicht der bewusst attribuierte.
 *
 * Rollback: git revert dieses Commits. Danach greift wieder der
 * Admin-Redirect, ohne dass am Shopify-Admin etwas zurückgedreht werden muss.
 */

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/pages/qione-2-pro-details${url.search}`, 301);
}

export default function QiOneVanityRedirect() {
  return null;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
