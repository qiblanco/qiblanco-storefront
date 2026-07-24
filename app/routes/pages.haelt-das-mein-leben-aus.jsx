import {useLoaderData} from 'react-router';
import {MmHaeltDasAus} from '~/components/campaign/MmHaeltDasAus';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Message-Match-Landingpage /pages/haelt-das-mein-leben-aus — Cluster „Alltags-
 * Durability" (Ad-Welle B: qb45-b3 „Hält das mein Leben aus? Dusche, Sport,
 * Sauna — er bleibt einfach dran"). 1:1-Match: die Ad verspricht Robustheit im
 * echten Alltag — die Seite zeigt, warum ihm Wasser, Hitze, Schweiß und Chlor
 * nichts anhaben, und ordnet die Wirkung ehrlich ein (präklinisch).
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
  {title: 'Hält das mein Leben aus? Dusche, Sport, Sauna — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function HaeltDasMeinLebenAusRoute() {
  const {products} = useLoaderData();
  return <MmHaeltDasAus products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
