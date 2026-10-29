import {useLoaderData} from 'react-router';
import {MmZellstudienEhrlich} from '~/components/campaign/MmZellstudienEhrlich';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {LpApple} from '~/components/apple-seite/lp/LpApple';
import {ZELLSTUDIEN_SEKTIONEN} from '~/components/apple-seite/lp/lp-zellstudien';

/**
 * Trust-Ketten-Hub „Evidenz / Studien" /pages/zellstudien-ehrlich — nüchterne
 * Evidenz statt Eso, mit ehrlichen Grenzen. Die vier Zellstudien mit Methode,
 * Ergebnis und Grenze plus die deskriptiven Nutzerberichte. Verlinkt von den
 * Message-Match-LPs (Cluster Skeptiker/Mechanismus) — der ehrliche Beleg-Anker.
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
  {title: 'Die Zellstudien: was sie zeigen und was nicht | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * APPLE-FASSUNG (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-
 * ausser-seo-geo, s07): der Schalter steht in app/lib/apple-seiten.js. An:
 * die Apple-Fassung ohne Produktabfrage. Aus: die Seite unverändert (C,
 * Rückweg: homepage-bauer/bin/apple-seite zurueck <seite>).
 */
export async function loader({context}) {
  const appleSeite = appleSeiteLaden(context, appleSeiteFuerPfad('/pages/zellstudien-ehrlich'));
  if (appleSeite.an) return {appleSeite, products: []};
  return {...(await mmLadeProdukte(context)), appleSeite};
}

export default function ZellstudienEhrlichRoute() {
  const {products, appleSeite} = useLoaderData();
  if (appleSeite?.an) return <LpApple seite={appleSeite.seite} sektionen={ZELLSTUDIEN_SEKTIONEN} />;
  return <MmZellstudienEhrlich products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
