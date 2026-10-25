import {redirect} from 'react-router';
import TheAlpha from '~/components/campaign/TheAlpha';
import {canonicalLink} from '~/lib/seo';
import theAlphaStyles from '~/styles/the-alpha.css?url';

/*
 * /pages/The-Alpha — Variante A, Christians Figma-Vorlage 1:1 (Grossjob
 * 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s03). Christian (Z2): „link wird sein
 * https://qiblanco.com/pages/The-Alpha“, (Z4): „wir gehen im link weg von
 * qi-alpha hin zu the alpha“. Gekauft wird auf der Shopseite (Z9/Z10); der
 * rote Knopf (TheAlphaKauf) führt dorthin.
 *
 * GROẞ- UND KLEINSCHREIBUNG: React Router vergleicht Pfade ohne Rücksicht auf
 * Groß/Klein, diese Route fängt also auch /pages/the-alpha und
 * /pages/THE-ALPHA (die statische Route schlägt pages.$handle.jsx). Jede
 * andere Schreibweise als Christians bekommt ein 301 auf /pages/The-Alpha
 * (Abfrage bleibt erhalten, z. B. utm_*), damit es genau EINE Adresse gibt.
 *
 * INDEXIERBAR: A ist die Hauptseite. canonical = https://qiblanco.com/pages/The-Alpha,
 * Sitemap über NUR_ROUTE_SEITEN in lib/seo.js. Die Testarme -B und -C stehen in
 * lib/vorschau-noindex.js.
 *
 * TRACKING: kein Pixel-Code hier (0-Pixel-Regel). Die A/B/C-Weiche kommt in
 * s07 über lib/experiment-weiche.server.js in diesen Loader.
 */

const KANON_PFAD = '/pages/The-Alpha';

export function links() {
  return [{rel: 'stylesheet', href: theAlphaStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha, Limited 1st. Edition 111/111 | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha mit Diamant, Limited 1st. Edition: 111 Stück, jedes mit eigener Nummer der Alpha-Serie. Jetzt exklusiv reservieren.',
  },
  {property: 'og:title', content: 'Qi Alpha, Limited 1st. Edition 111/111'},
  {
    property: 'og:image',
    content:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
  },
  canonicalLink(KANON_PFAD),
];

/** @param {LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, '');
  if (pfad !== KANON_PFAD) {
    throw redirect(`${KANON_PFAD}${url.search}`, 301);
  }
  return {};
}

export default function TheAlphaRoute() {
  return <TheAlpha />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
