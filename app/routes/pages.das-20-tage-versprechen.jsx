import {useLoaderData} from 'react-router';
import {MmDas20TageVersprechen} from '~/components/campaign/MmDas20TageVersprechen';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {LpApple} from '~/components/apple-seite/lp/LpApple';
import {VERSPRECHEN_SEKTIONEN} from '~/components/apple-seite/lp/lp-versprechen';

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
  {title: 'Das 20-Tage-Versprechen: kein Kleingedrucktes, kein „nur wenn“ | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * APPLE-FASSUNG (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-
 * ausser-seo-geo, s07): der Schalter steht in app/lib/apple-seiten.js. An:
 * die Apple-Fassung ohne Produktabfrage. Aus: die Seite unverändert (C,
 * Rückweg: Befehl „zurück“ in homepage-bauer/bin/apple-seite).
 */
export async function loader({context}) {
  const appleSeite = appleSeiteLaden(context, appleSeiteFuerPfad('/pages/das-20-tage-versprechen'));
  if (appleSeite.an) return {appleSeite, products: []};
  return {...(await mmLadeProdukte(context)), appleSeite};
}

export default function Das20TageVersprechenRoute() {
  const {products, appleSeite} = useLoaderData();
  if (appleSeite?.an) return <LpApple seite={appleSeite.seite} sektionen={VERSPRECHEN_SEKTIONEN} />;
  return <MmDas20TageVersprechen products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
