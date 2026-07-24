import {useLoaderData} from 'react-router';
import {MmSoWirktWasser} from '~/components/campaign/MmSoWirktWasser';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Trust-Ketten-Hub „Mechanismus / Wie funktioniert es" — verlinkt von den
 * Message-Match-LPs (Nordstern: WIE es wirkt, nicht DASS es Premium ist).
 *
 * Zentrale „how it works"-Erklärseite: die Message-Match-Landingpages linken
 * hier hinein. Ruhig, nüchtern, evidenzbasiert, ehrlich über Grenzen.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosenträger, D-006): Freigabe-
 * Ansicht für Christian, NICHT öffentlich indexiert. BEWUSST kein canonical.
 * Tracking hängt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'So wirkt kohärentes Wasser — der Mechanismus, ehrlich erklärt | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function SoWirktWasserRoute() {
  const {products} = useLoaderData();
  return <MmSoWirktWasser products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
