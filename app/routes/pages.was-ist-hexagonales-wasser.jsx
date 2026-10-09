import {HexagonalesWasserSeite} from '~/components/campaign/HexagonalesWasserSeite';
import kwStyles from '~/styles/was-ist-kohaerentes-wasser.css?url';
import hwStyles from '~/styles/was-ist-hexagonales-wasser.css?url';
import qbErklaerPopupStyles from '~/styles/qb-erklaer-popup.css?url';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {SEITE, strukturierteDaten} from '~/data/hexagonales-wasser-seite';

/**
 * /pages/was-ist-hexagonales-wasser — die Seite „Hexagonales Wasser".
 *
 * Auftrag: Christian, 23.09.2026 (wörtlich): „Welche Seiten kommen als
 * erstes, wenn man hexagonales Wasser eingibt oder kohärentes Wasser? Wie
 * können wir hier einen Platz eins erreichen in SEO und GEO?" Träger:
 * der Grossjob „Platz eins für kohärentes und hexagonales Wasser“ vom 09.10.2026.
 *
 * DIE FRAGE STEHT IM PFAD, wie bei der Info-Seite (Christians Entscheidung
 * vom 23.09.2026 zu /pages/was-ist-kohaerentes-wasser). Warum eine eigene
 * Seite statt eines Abschnitts: Kopf von app/data/hexagonales-wasser-seite.js.
 *
 * REINE ROUTE, KEIN SHOPIFY-SEITENOBJEKT: der Inhalt steht committet im
 * Datenmodul. Sitemap über NUR_ROUTE_SEITEN in app/lib/seo.js. Indexierbar:
 * canonical über canonicalLink() (Gate 17), kein noindex.
 *
 * STYLESHEETS: die Seite trägt die Klassen der Info-Seite und lädt deren
 * Stylesheet mit; das eigene trägt nur die Abgrenzungstabelle.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-
 * Schlüssel, kein Kaufknopf, kein Video. Die Tracking-Kette hängt
 * pfad-agnostisch im root-Layout.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: qbErklaerPopupStyles},
    {rel: 'stylesheet', href: kwStyles},
    {rel: 'stylesheet', href: hwStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  canonicalLink(SEITE.pfad),
  ...seitenSignale({
    pfad: SEITE.pfad,
    titel: SEITE.titel,
    beschreibung: SEITE.beschreibung,
    hauptknoten: false,
  }).filter((d) => d.property !== 'og:type'),
  {property: 'og:type', content: 'article'},
  {property: 'article:published_time', content: SEITE.veroeffentlicht},
  {property: 'article:modified_time', content: SEITE.geaendert},
  ...strukturierteDaten().map((knoten) => ({'script:ld+json': knoten})),
];

export default function WasIstHexagonalesWasserRoute() {
  return <HexagonalesWasserSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
