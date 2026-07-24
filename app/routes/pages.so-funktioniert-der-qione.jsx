import {useLoaderData} from 'react-router';
import {MmSoFunktioniertQiOne} from '~/components/campaign/MmSoFunktioniertQiOne';
import mmStyles from '~/styles/mm-lp.css?url';
import malibuStyles from '~/styles/mm-malibu.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';

/**
 * Erklär-Landingpage /pages/so-funktioniert-der-qione — „Wie funktioniert der
 * QiOne?" maximal verständlich (Bild-Zeitung-Niveau) im NEUEN USA/Malibu-Style
 * (Job 20260724-how-funktioniert-qione-malibu-v2, Christian 2026-07-24).
 *
 * Sie ist die einfache TÜR in die schlaf-zellen-schutz-LP-Gruppe: erklärt das
 * Prinzip in Sekunden und leitet dann tiefer (Funnel -> so-wirkt / zellstudien /
 * 20-tage) bzw. zum Produkt.
 *
 * DESIGN: zwei Stylesheets — mm-lp.css (das bewährte Token-System der LP-Gruppe,
 * design-rubrik-Referenz) + mm-malibu.css (der isolierte Malibu-Mood-Layer,
 * .mm-malibu-scoped, additiv). MmKit unangetastet.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosenträger, D-006): selbst-
 * definierter, nicht-crawlbarer Link; nicht in Nav/Sitemap (Shopify-getrieben).
 * Tracking hängt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: mmStyles},
    {rel: 'stylesheet', href: malibuStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'So funktioniert der QiOne® 2 Pro — einfach erklärt | Qi Blanco'},
  {
    name: 'description',
    content:
      'In einfachen Worten: Wie der QiOne 2 Pro wirkt — tieferer Schlaf, Zellschutz, E-Smog-Schutz. Ehrlich, mit klaren Grenzen.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  return mmLadeProdukte(context);
}

export default function SoFunktioniertDerQiOneRoute() {
  const {products} = useLoaderData();
  return <MmSoFunktioniertQiOne products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
