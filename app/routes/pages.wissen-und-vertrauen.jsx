import {WissenVertrauenHub} from '~/components/campaign/WissenVertrauenHub';
import wvStyles from '~/styles/wissen-vertrauen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {WV_HUB, WV_TITEL, wvSeiten} from '~/lib/hub-seiten';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = WV_HUB.pfad;

/**
 * /pages/wissen-und-vertrauen — „Alle Antworten rund um Qi Blanco".
 *
 * Gebaut vom Großjob 20261006-GROSSJOB-seo-strategie-seiten-bewertung-crawl-
 * kannibalisierung, Segment s06. Anlass, gemessen in der Search Console am
 * 2026-10-06: zehn neue Wissens- und Vertrauensseiten kannte Google nur aus
 * der Sitemap, ohne verweisende Seite. Christian: „das muss sauber gemacht
 * werden". Diese Seite ist die Übersicht, auf die der Fuß jeder Seite und die
 * Leiste „Weiterlesen" jeder aufgeführten Seite zeigen.
 *
 * WARUM EINE NEUE SEITE: Begründung an WV_GRUPPEN in app/lib/hub-seiten.js
 * (Lexikon, Warum Qi Blanco und FAQ geprüft, keine trägt ein
 * Inhaltsverzeichnis, ohne ihr eigenes Thema zu verwässern).
 *
 * TITEL OHNE „Erfahrungen", „seriös" und „Kritik": diese Suchbegriffe gehören
 * ihren eigenen Seiten. Eine Übersicht mit demselben Wort im Titel konkurriert
 * mit genau den Seiten, die sie stärken soll.
 *
 * SITEMAP ÜBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), KEIN Shopify-
 * Seitenobjekt: dieselbe Begründung wie bei /pages/lexikon. Ohne den Eintrag
 * lieferte die Seite HTTP 200 und stünde in keiner Sitemap.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key,
 * kein Kaufknopf. TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul.
 */
const TITEL = `${WV_TITEL}: alle Antworten rund um Qi Blanco`;
const BESCHREIBUNG =
  'Elektrosmog, Lexikon, Studien, Erfahrungen, Bewertungen und Trustpilot: ' +
  'jede Frage rund um Qi Blanco mit ihrer eigenen Seite und einem Satz dazu, ' +
  'was du dort findest.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR — siehe pages.kritik.jsx. Wer
 * die Liste ändert, zieht `GEAENDERT` und das `lastmod` in NUR_ROUTE_SEITEN im
 * selben Commit nach.
 */
const VEROEFFENTLICHT = '2026-10-06';
const GEAENDERT = '2026-10-07';

export function links() {
  return [{rel: 'stylesheet', href: wvStyles}];
}

/** CollectionPage mit der Liste als ItemList: dieselben Ziele wie sichtbar. */
function schema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITEL,
    description: BESCHREIBUNG,
    url: absoluteCanonical(PFAD),
    inLanguage: 'de-DE',
    datePublished: isoMitZone(VEROEFFENTLICHT),
    dateModified: isoMitZone(GEAENDERT),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: wvSeiten().map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.anker,
        url: absoluteCanonical(s.pfad),
      })),
    },
  };
}

/** @type {MetaFunction} */
export const meta = () => {
  return [
    {title: `${TITEL} | ${MARKE}`},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    {'script:ld+json': schema()},
  ];
};

export default function WissenVertrauenRoute() {
  return <WissenVertrauenHub />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
