import {
  WissenVertrauenHub,
  WV_FRAGE,
} from '~/components/campaign/WissenVertrauenHub';
import wvStyles from '~/styles/wissen-vertrauen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {WV_HUB, wvSeiten} from '~/lib/hub-seiten';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = WV_HUB.pfad;

/**
 * /pages/wissen-und-vertrauen — „Ist Elektrosmog-Schutz wissenschaftlich belegt?"
 * und darunter „Alle Antworten rund um Qi Blanco".
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
/**
 * DIE FRAGE VORN (SEO-Maßnahme M-SP-20261017-wissen-und-vertrauen, Job
 * seo-2026-w43-l26-wissen-und-vertrauen-bdee-sollseite-ohne-begriff-ohne-n2,
 * 2026-11-10). Die Seite stand seit dem 06.10. für keinen Begriff ohne Marke
 * in der Suche. Titel, H1 und Beschreibung führen jetzt die Frage
 * „Ist Elektrosmog-Schutz wissenschaftlich belegt?", der erste Absatz gibt die
 * Antwort. Der Titel behält danach den Namen der Übersicht
 * (WV_HUB.anker): mit genau diesem Text verlinken Fuß und „Weiterlesen"
 * hierher, Ankertext und Titel bleiben so deckungsgleich. Ohne
 * „| Qi Blanco"-Anhang, die Marke steht schon im Titel. Messung:
 * seo-manager/exports/sollseiten-position.json, Wirkungskreislauf gleiche id.
 */
const TITEL = `${WV_FRAGE} ${WV_HUB.anker}`;
const BESCHREIBUNG =
  `${WV_FRAGE} Im Labor hielten Zellen unter Handystrahlung mit dem ` +
  'QiOne® 2 Pro besser stand, am Menschen ist es offen.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR — siehe pages.kritik.jsx. Wer
 * die Liste ändert, zieht `GEAENDERT` und das `lastmod` in NUR_ROUTE_SEITEN im
 * selben Commit nach.
 */
const VEROEFFENTLICHT = '2026-10-06';
const GEAENDERT = '2026-11-11';

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
    {title: TITEL},
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
