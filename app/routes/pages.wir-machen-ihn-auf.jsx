import {useLoaderData} from 'react-router';
import {MmWirMachenIhnAuf} from '~/components/campaign/MmWirMachenIhnAuf';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {LpApple} from '~/components/apple-seite/lp/LpApple';
import {SKEPTIKER_SEKTIONEN} from '~/components/apple-seite/lp/lp-skeptiker';

/**
 * Message-Match-Landingpage /pages/wir-machen-ihn-auf — Cluster „Skeptiker /
 * Mechanismus-Transparenz" (Ad-Welle C: qb45-c1 „Ist das nicht ein Scam? Gute
 * Frage. Machen wir ihn auf."; verwandt B2/B4). 1:1-Match: die Ad öffnet den
 * Chip — die Seite zeigt Aufbau -> Messung -> Erfahrung -> 20-Tage-Test.
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
  {title: '„Ist das Einbildung?" Wir machen ihn auf. QiOne® 2 Pro | Qi Blanco'},
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
  const appleSeite = appleSeiteLaden(context, appleSeiteFuerPfad('/pages/wir-machen-ihn-auf'));
  if (appleSeite.an) return {appleSeite, products: []};
  return {...(await mmLadeProdukte(context)), appleSeite};
}

export default function WirMachenIhnAufRoute() {
  const {products, appleSeite} = useLoaderData();
  if (appleSeite?.an) return <LpApple seite={appleSeite.seite} sektionen={SKEPTIKER_SEKTIONEN} />;
  return <MmWirMachenIhnAuf products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
