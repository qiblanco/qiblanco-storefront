import {useLoaderData} from 'react-router';
import {MmZellstudienEhrlich} from '~/components/campaign/MmZellstudienEhrlich';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Trust-Ketten-Hub „Evidenz / Studien" /pages/zellstudien-ehrlich — nuechterne
 * Evidenz statt Eso, mit ehrlichen Grenzen. Die vier Zellstudien mit Methode,
 * Ergebnis und Grenze plus die deskriptiven Nutzerberichte. Verlinkt von den
 * Message-Match-LPs (Cluster Skeptiker/Mechanismus) — der ehrliche Beleg-Anker.
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
  {title: 'Die Zellstudien, ehrlich eingeordnet — was sie zeigen und was nicht | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function ZellstudienEhrlichRoute() {
  const {products} = useLoaderData();
  return <MmZellstudienEhrlich products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
