import {redirect} from 'react-router';
import TheAlphaVarianteC from '~/components/campaign/TheAlphaVarianteC';
import {canonicalLink} from '~/lib/seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';
import varianteCStyles from '~/styles/the-alpha-variante-c.css?url';

/*
 * /pages/The-Alpha-B — Variante C (KI-optimiert) der The-Alpha-Seite
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * s05). Adresse nach KONZEPT Abschnitt 2 und Christian Z6: „C wäre dann
 * https://qiblanco.com/pages/The-Alpha-B“. A = /pages/The-Alpha (Figma),
 * B (Server) = /pages/The-Alpha-C.
 *
 * Seit 26.10.2026 erzählt C Christians Film-Geschichte wie A auf dem Gerüst
 * TheAlphaPremium (Grossjob 20261026-prio1-the-alpha-variante-a-
 * designmeister-premium-gestaltung, s03); KI-optimiert sind nur die
 * Feinheiten (TheAlphaVarianteC.jsx).
 *
 * TESTARM: noindex,nofollow (meta + X-Robots-Tag; der Pfad steht zusätzlich
 * in app/lib/vorschau-noindex.js), canonical auf sich selbst, nicht in der
 * Sitemap, kein Menüeintrag. Verkehr bekommt die Seite über die A/B/C-Weiche
 * (s07, lib/experiment-weiche.server.js im Loader von A).
 *
 * GROß/KLEIN wie A und B: jede andere Schreibweise (the-alpha-b, THE-ALPHA-B)
 * -> 301 auf /pages/The-Alpha-B, die Abfrage bleibt erhalten. Kollision: die
 * statische Route schlägt pages.$handle.jsx; /pages/qi-alpha-b ist ein
 * anderer Pfad (eigene Route pages.qi-alpha-b.jsx) und wird hier nie erreicht.
 *
 * PREIS: steht nicht auf der Film-Seite. Die Schluss-Szene endet mit dem
 * roten Knopf; Preis und Details zeigt die Shopseite (Christian, Nachtrag
 * 27.10.2026 ~21:40 Bangkok).
 *
 * TRACKING: kein Pixel-Code hier, kein neuer Schlüssel.
 * RÜCKWEG: hb-deploy revert des Merge-Commits (Seite antwortet dann 404).
 */

/** Film-Seite: ohne Shop-Kopf, Ankündigungsband, Fuß und AI Anna (root.jsx
 * istFilmSeite; Christian 27.10.2026, Z275–Z279). */
export const handle = {filmSeite: true};

/*
 * UMZUG QI ALPHA (Christian 27.10.2026, Z1: „Und den Link ändern wir auch
 * wieder von The Alpha in Qi Alpha“; Job 20261027-prio1-umzug-the-alpha-zu-
 * qi-alpha-links-name). Bis dahin stand diese Seite unter /pages/The-Alpha-B.
 */

const KANON_PFAD = '/pages/Qi-Alpha-B';

export function links() {
  return [
    {rel: 'stylesheet', href: theAlphaPremiumStyles},
    {rel: 'stylesheet', href: varianteCStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha®, Limited 1st. Edition 111/111 | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha® mit Naturdiamant und Gitterchip™, Limited 1st. Edition: 111 Stück, jedes mit eigener ' +
      'Nummer. 10.639 €, 20 Tage ab Erhalt testen, Versand ab Mitte Januar 2027.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
  {property: 'og:title', content: 'Qi Alpha®, Limited 1st. Edition 111/111'},
  {
    property: 'og:image',
    content:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
  },
  canonicalLink(KANON_PFAD),
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/** @param {LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, '');
  if (pfad !== KANON_PFAD) {
    throw redirect(`${KANON_PFAD}${url.search}`, 301);
  }
  return null;
}

export default function TheAlphaBRoute() {
  return <TheAlphaVarianteC />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
