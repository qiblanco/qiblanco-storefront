import {redirect} from 'react-router';
import TheAlphaElina from '~/components/campaign/TheAlphaElina';
import {canonicalLink} from '~/lib/seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';
import theAlphaElinaStyles from '~/styles/the-alpha-elina.css?url';

/*
 * /pages/Qi-Alpha-Elina: Elinas B-Seite der Qi-Alpha-LP (EL-20261101-a930d588,
 * EL-20261101-242cff9c), getrennt von Christians Live-Seite /pages/Qi-Alpha
 * (pages.Qi-Alpha.jsx, unverändert). Lädt zusätzlich the-alpha-elina.css;
 * alle Abweichungen hängen am Schalter `elina` (TheAlphaElina.jsx).
 * TESTARM: noindex,nofollow (meta + X-Robots-Tag über lib/vorschau-noindex.js),
 * nicht in der Sitemap, kein Menüeintrag, kein Pixel-Code. Groß/Klein wie A:
 * jede andere Schreibweise -> 301 auf /pages/Qi-Alpha-Elina.
 * RÜCKWEG: Route, TheAlphaElina.jsx, the-alpha-elina.css und die noindex-Zeile
 * entfernen; der Schalter ist dann tot.
 */

/** Film-Seite: ohne Shop-Kopf, Ankündigungsband, Fuß und AI Anna (root.jsx
 * istFilmSeite; Christian 27.10.2026, Z275–Z279). */
export const handle = {filmSeite: true};

const KANON_PFAD = '/pages/Qi-Alpha-Elina';

export function links() {
  return [
    {rel: 'stylesheet', href: theAlphaPremiumStyles},
    {rel: 'stylesheet', href: theAlphaElinaStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha®, Limited 1st. Edition 111/111 | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha® mit Diamant, Limited 1st. Edition: 111 Stück, jedes mit eigener Nummer der Alpha-Serie. Jetzt exklusiv reservieren.',
  },
  {property: 'og:title', content: 'Qi Alpha®, Limited 1st. Edition 111/111'},
  {
    property: 'og:image',
    content:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
  },
  {name: 'robots', content: 'noindex, nofollow'},
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

export default function TheAlphaElinaRoute() {
  return <TheAlphaElina />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
