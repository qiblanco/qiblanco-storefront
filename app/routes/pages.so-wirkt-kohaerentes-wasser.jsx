import {useLoaderData} from 'react-router';
import {MmSoWirktWasser} from '~/components/campaign/MmSoWirktWasser';
import mmStyles from '~/styles/mm-lp.css?url';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {LpApple} from '~/components/apple-seite/lp/LpApple';
import {MECHANISMUS_SEKTIONEN} from '~/components/apple-seite/lp/lp-mechanismus';

/**
 * Trust-Ketten-Hub „Mechanismus / Wie funktioniert es" — verlinkt von den
 * Message-Match-LPs (Nordstern: WIE es wirkt, nicht DASS es Premium ist).
 *
 * Zentrale „how it works"-Erklärseite: die Message-Match-Landingpages linken
 * hier hinein. Ruhig, nüchtern, evidenzbasiert, ehrlich über Grenzen.
 *
 * PFLICHT noindex (Meta + X-Robots-Tag, Gurt+Hosenträger, D-006): die Seite
 * gehört zum LANDING-BEREICH, dem bezahlten Funnel. noindex ist hier
 * ISOLATION, keine Freigabe-Sperre: der Bereich soll nur über die Ad
 * erreichbar sein (Christian 2026-08-26, funnel-substrat/src/landing_bereich.py:
 * „das ist alles, was von den Ads kommt. Deswegen bauen wir die ja getrennt.").
 * Der Ads-Sitelink „Wirkweise, ehrlich" ist bezahlter Verkehr und passt dazu.
 * Ein organischer Google-Platz ist das Leck, das noindex schließt.
 * Entschieden am 2026-10-24 als Variante B (Beleg im devlog homepage-bauer).
 * Benannt in seo-manager/conf/gewollt-noindex.yaml,
 * damit die Flächenbesitz-Wache den Indexaustritt als H1 führt statt als B2.
 * Soll die Seite öffentlich werden: noindex hier UND den Eintrag dort im
 * selben Zug entfernen, und den Inhalt besser auf eine öffentliche Seite
 * KOPIEREN (Kopierregel R7, selftest_zweiblock.py). BEWUSST kein canonical.
 * Tracking hängt global im root-Layout — der Loader fragt NUR Produktdaten ab.
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'So wirkt kohärentes Wasser: der Mechanismus in vier Schritten | Qi Blanco'},
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
  const appleSeite = appleSeiteLaden(context, appleSeiteFuerPfad('/pages/so-wirkt-kohaerentes-wasser'));
  if (appleSeite.an) return {appleSeite, products: []};
  return {...(await mmLadeProdukte(context)), appleSeite};
}

export default function SoWirktWasserRoute() {
  const {products, appleSeite} = useLoaderData();
  if (appleSeite?.an) return <LpApple seite={appleSeite.seite} sektionen={MECHANISMUS_SEKTIONEN} />;
  return <MmSoWirktWasser products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
