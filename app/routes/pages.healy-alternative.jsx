import {useLoaderData} from 'react-router';
import {
  HealyAlternativeSeite,
  PFAD,
  SEITE,
  preisFuerSchema,
  strukturierteDaten,
} from '~/components/campaign/HealyAlternativeSeite';
import {mmLadeProdukte} from '~/components/campaign/mmProducts';
import healyStyles from '~/styles/healy-alternative.css?url';
import {canonicalLink} from '~/lib/seo';
import {resolveCountry} from '~/lib/markt-pricing';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * /pages/healy-alternative — „Was ist eine gute Alternative zu Healy?"
 *
 * Gebaut von Segment s04 des GEO-Grossjobs 20261007-GROSSJOB-geo-manager-
 * chatgpt-perplexity-grok-gemini-sichtbarkeit (Christian, 07.10.2026). Text,
 * Tabelle, Fragen und Quellen stehen in
 * app/components/campaign/HealyAlternativeSeite.jsx; DIESE DATEI TRÄGT KEINEN
 * INHALT. Die US-Fassung auf qi-blanco.com (Segment s05) übernimmt Aufbau,
 * Tabelle, Fragen und Quellen aus diesem Stand.
 *
 * REINE ROUTE, KEIN SHOPIFY-SEITENOBJEKT: die Datei sticht den Katchall
 * pages.$handle.jsx, der sonst ein Seitenobjekt dieses Handles suchen und 404
 * liefern würde.
 *
 * LOADER NUR FÜR PREISE: mmLadeProdukte fragt die Storefront-API nach
 * QiOne® 2 Pro, QiBracelet® und QiHome® Air (CacheShort). Fällt die API aus,
 * kommt eine leere Liste zurück, und die Seite nennt keinen Betrag statt eines
 * falschen (fail-closed, Muster der Message-Match-Seiten).
 *
 * INDEXIERBAR: canonical über canonicalLink() (Gate 17 verlangt die
 * <link>-Form), kein noindex. Die Sitemap-Aufnahme (NUR_ROUTE_SEITEN in
 * app/lib/seo.js) und Verweise aus den Hub-Seiten liegen außerhalb des
 * Mutationsgebiets von s04 und gehen als offene Flanke an das Merge-Segment.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key,
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Die Kette hängt im root-Layout.
 */
export function links() {
  return [{rel: 'stylesheet', href: healyStyles}];
}

export async function loader({context, request}) {
  return {...(await mmLadeProdukte(context)), land: resolveCountry(request)};
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  canonicalLink(PFAD),
  ...seitenSignale({
    pfad: PFAD,
    titel: SEITE.titel,
    beschreibung: SEITE.beschreibung,
    hauptknoten: false,
  }).filter((d) => d.property !== 'og:type'),
  {property: 'og:type', content: 'article'},
  {property: 'article:published_time', content: SEITE.veroeffentlicht},
  {property: 'article:modified_time', content: SEITE.geaendert},
  ...strukturierteDaten(preisFuerSchema(data?.products, data?.land)).map((knoten) => ({
    'script:ld+json': knoten,
  })),
];

export default function HealyAlternativeRoute() {
  const {products} = useLoaderData();
  return <HealyAlternativeSeite products={products} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
