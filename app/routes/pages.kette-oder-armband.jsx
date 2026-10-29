import {useLoaderData} from 'react-router';
import {MmKetteOderArmband} from '~/components/campaign/MmKetteOderArmband';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {LpApple} from '~/components/apple-seite/lp/LpApple';
import {TRAGEFORM_SEKTIONEN} from '~/components/apple-seite/lp/lp-trageform';

/**
 * Message-Match-Landingpage /pages/kette-oder-armband — Cluster „Produktwahl /
 * Kaufentscheidung" (Ad-Welle C: qb45-c2 „Die häufigste Frage kurz vor
 * Bestellung: Kette oder Armband?"). 1:1-Match: die Ad stellt die Trageform-Frage
 * — die Seite beantwortet sie ehrlich: gleiche Technik, gleiche Wirkung, der
 * Unterschied ist nur die Sichtbarkeit/Trageweise.
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
  {title: 'Kette oder Armband? Gleiche Technik, deine Trageform | Qi Blanco'},
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
  const appleSeite = appleSeiteLaden(context, appleSeiteFuerPfad('/pages/kette-oder-armband'));
  if (appleSeite.an) return {appleSeite, products: []};
  return {...(await mmLadeProdukte(context)), appleSeite};
}

export default function KetteOderArmbandRoute() {
  const {products, appleSeite} = useLoaderData();
  if (appleSeite?.an) return <LpApple seite={appleSeite.seite} sektionen={TRAGEFORM_SEKTIONEN} />;
  return <MmKetteOderArmband products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
