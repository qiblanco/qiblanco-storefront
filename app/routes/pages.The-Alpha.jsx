import {Link, redirect, useLoaderData} from 'react-router';
import TheAlpha from '~/components/campaign/TheAlpha';
import {canonicalLink} from '~/lib/seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';

/*
 * /pages/The-Alpha — Variante A (Grossjob 20261025-prio1-the-alpha-landingpage-
 * figma-vorlage-a-server-b-ki-c, s03). Seit 26.10.2026 gestaltet statt 1:1
 * (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung): Bausteine TheAlphaPremium.jsx, Stil the-alpha-premium.css.
 * Christian (Z2): „link wird sein
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
  return [{rel: 'stylesheet', href: theAlphaPremiumStyles}];
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
  // NUR VORSCHAU (Elina EL-20261027-9707359d, Zweig vorschau/the-alpha-
  // dreier-etikett, NICHT MERGEN): ?etikett=a (Verlauf) | b (Pille) wählt
  // die Etikett-Variante, ?schalter=0 blendet den Umschalter aus
  // (Bildschirmfotos). Nach Elinas Wahl fallen Abfrage und Umschalter weg.
  const wahl = url.searchParams.get('etikett') === 'b' ? 'b' : 'a';
  return {wahl, schalter: url.searchParams.get('schalter') !== '0'};
}

const ETIKETT_STIL = {a: 'verlauf', b: 'pille'};

export default function TheAlphaRoute() {
  const {wahl, schalter} = useLoaderData();
  return (
    <>
      <TheAlpha etikett={ETIKETT_STIL[wahl]} />
      {schalter ? <VorschauSchalter wahl={wahl} /> : null}
    </>
  );
}

/** Umschalter der Vorschau, unten links, nicht Teil der Seite. */
function VorschauSchalter({wahl}) {
  const knopf = (w, text) => (
    <Link
      to={`?etikett=${w}`}
      preventScrollReset
      replace
      aria-current={wahl === w ? 'true' : undefined}
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        textDecoration: 'none',
        color: wahl === w ? '#000' : '#fff',
        background: wahl === w ? '#fff' : 'transparent',
      }}
    >
      {text}
    </Link>
  );
  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(30,30,30,0.92)',
        border: '1px solid rgba(255,255,255,0.25)',
        font: '500 13px/1 system-ui, sans-serif',
      }}
    >
      <span style={{color: 'rgba(255,255,255,0.7)', padding: '0 8px'}}>Vorschau</span>
      {knopf('a', 'A Verlauf')}
      {knopf('b', 'B Pille')}
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
