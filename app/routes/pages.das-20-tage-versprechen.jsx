import {useLoaderData} from 'react-router';
import {MmDas20TageVersprechen} from '~/components/campaign/MmDas20TageVersprechen';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Trust-Ketten-Hub „Garantie / Risiko-Umkehr" — 20-Tage-Rückgabe, Spür-Regel #7
 * (Rückgabe an Frist+Überzeugung, nie am Spüren); verlinkt von den
 * Message-Match-LPs.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosenträger, D-006): Freigabe-
 * Ansicht für Christian, NICHT öffentlich indexiert. BEWUSST kein canonical.
 * Nicht in Nav (Shopify-Menu-getrieben) und nicht in Sitemap (Shopify-getrieben,
 * reine Route-Datei) — selbst-definierter, nicht-crawlbarer Link.
 *
 * Tracking hängt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Das 20-Tage-Versprechen — kein Kleingedrucktes, kein „nur wenn“ | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function Das20TageVersprechenRoute() {
  const {products} = useLoaderData();
  return <MmDas20TageVersprechen products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
