import {useLoaderData} from 'react-router';
import {MmWirMachenIhnAuf} from '~/components/campaign/MmWirMachenIhnAuf';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Message-Match-Landingpage /pages/wir-machen-ihn-auf — Cluster „Skeptiker /
 * Mechanismus-Transparenz" (Ad-Welle C: qb45-c1 „Ist das nicht ein Scam? Gute
 * Frage. Machen wir ihn auf."; verwandt B2/B4). 1:1-Match: die Ad oeffnet den
 * Chip — die Seite zeigt Aufbau -> Messung -> Erfahrung -> 20-Tage-Test.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosentraeger, D-006): Freigabe-
 * Ansicht fuer Christian, NICHT oeffentlich indexiert. BEWUSST kein canonical.
 * Nicht in Nav (Shopify-Menu-getrieben) und nicht in Sitemap (Shopify-getrieben,
 * reine Route-Datei) — selbst-definierter, nicht-crawlbarer Link.
 *
 * Tracking haengt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: '„Ist das Einbildung?" Wir machen ihn auf — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function WirMachenIhnAufRoute() {
  const {products} = useLoaderData();
  return <MmWirMachenIhnAuf products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
