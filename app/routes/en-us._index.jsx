import {UsHomeSections} from '~/components/us/UsHomeSections';
import usStyles from '~/styles/us.css?url';

/*
 * US-Startseite /en-us — Vorabversion (Job 20260720-usa-seite-auf-dach-
 * basis-vorabversion s05, Konzept 1a Kap. 3 Klasse i: Pendant der Live-
 * US-Startseite qi-blanco.com, heutiges 100-%-Ads-Ziel).
 *
 * Host-agnostischer EN-Routen-Block (Kap. 2.6): explizite Code-Route,
 * erreicht den Catch-All nie. EN-Rahmen via handle -> root.jsx
 * (htmlLang 'en' + US-Layout); ohne handle bliebe alles beim DACH-Default.
 *
 * KEIN Loader noetig: die Sektionen sind (wie der DACH-Traeger
 * HomepageSections) reine Praesentation ohne Loader-Daten.
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/*
 * noindex,nofollow fuer die GESAMTE Vorab-Phase (Konzept 1b P2: Dunkel-
 * Live; Indexierbarkeit erst P5). Doppelgate Meta + X-Robots-Tag (D-006).
 * @type {MetaFunction}
 */
export const meta = () => [
  {
    title:
      'Qi Blanco® — Wearable High-Tech With Measurable Effects at the Cellular Level',
  },
  {
    name: 'description',
    content:
      'QiOne® 2 Pro: wearable high-tech designed to support coherent water structuring. Confirmed in peer-reviewed cell studies. Free insured shipping from Germany — duties included.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function UsHomepage() {
  return <UsHomeSections />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
