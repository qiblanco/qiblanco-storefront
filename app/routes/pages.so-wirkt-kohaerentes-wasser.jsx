import {useLoaderData} from 'react-router';
import {MmSoWirktWasser} from '~/components/campaign/MmSoWirktWasser';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Trust-Ketten-Hub „Mechanismus / Wie funktioniert es" — verlinkt von den
 * Message-Match-LPs (Nordstern: WIE es wirkt, nicht DASS es Premium ist).
 *
 * Zentrale „how it works"-Erklaerseite: die Message-Match-Landingpages linken
 * hier hinein. Ruhig, nuechtern, evidenzbasiert, ehrlich ueber Grenzen.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosentraeger, D-006): Freigabe-
 * Ansicht fuer Christian, NICHT oeffentlich indexiert. BEWUSST kein canonical.
 * Tracking haengt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'So wirkt kohaerentes Wasser — der Mechanismus, ehrlich erklaert | Qi Blanco'},
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
