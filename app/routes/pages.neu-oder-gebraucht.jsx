import {NeuOderGebrauchtSeite} from '~/components/campaign/NeuOderGebrauchtSeite';
import nogStyles from '~/styles/neu-oder-gebraucht.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {FRAGEN} from '~/data/kauf-tatsachen';
import {teilbildTags} from '~/lib/seiten-seo';

const PFAD = '/pages/neu-oder-gebraucht';

/**
 * /pages/neu-oder-gebraucht — INDEXIERBAR VON ANFANG AN, und das ist der
 * ganze Zweck.
 *
 * WARUM ES DIESE SEITE GIBT: Googles KI-Antwort auf unsere Zweifelsbegriffe
 * empfiehlt den Gebrauchtmarkt und nennt dabei eine Rücknahmefrist von 14
 * Tagen. `merchantReturnDays: 20` steht seit langem korrekt im Produkt-Markup
 * (app/lib/produkt-schema.js) und hat daran nichts geändert. Die Lehre daraus
 * ist nicht "mehr Markup", sondern: die Tatsache muss als SATZ dastehen, mit
 * genannter Quelle, auf einer Seite, die abgerufen werden darf.
 *
 * DIE HÄRTESTE BEDINGUNG STEHT VOR JEDER FORMULIERUNG: Googles eigene Doku
 * verlangt für ein Zitat, dass die Seite "indexed and eligible to be shown …
 * with a snippet" ist. EINE SEITE AUF `noindex` KANN BAULICH NIE ZITIERT
 * WERDEN. Diese Route trägt deshalb KEIN noindex und KEINEN X-Robots-Tag —
 * anders als ihre beiden Nachbarn /pages/wirkt-das und
 * /pages/zellstudien-ehrlich, deren Dunkelheit eine menschliche Entscheidung
 * ist und hier nicht angetastet wird.
 *
 * DIE VIER BEDINGUNGEN DER SICHTBARKEIT, in dieser Reihenfolge gebaut, weil
 * sie einander bedingen (Muster von pages.kritik.jsx übernommen, P10):
 *
 * (1) ROBOTS.TXT: `generalDisallowRules` in app/routes/[robots.txt].jsx führt
 *     für diesen Pfad KEINE Disallow-Zeile. Nachgemessen am 2026-09-12 gegen
 *     origin/main: die einzige `/pages`-Sperre dort gilt
 *     /pages/schlaf-zellen-schutz-v3-67a7. Solange eine Sperre steht, kann
 *     Google die Seite nicht abrufen und damit auch kein Markup lesen.
 *
 * (2) CANONICAL statt noindex: `canonicalLink()` rendert ein echtes
 *     `<link rel="canonical">`. Ein `{rel:'canonical'}` ohne `tagName` ergäbe
 *     `<meta rel="canonical">` und wäre wirkungslos (Befund L11, siehe
 *     pages.studien.jsx).
 *
 * (3) SITEMAP über `NUR_ROUTE_SEITEN` (app/lib/seo.js): diese Seite besteht
 *     allein aus einer Hydrogen-Route und hat KEIN Shopify-Seitenobjekt. Ohne
 *     den Eintrag liefert sie HTTP 200 mit vollem Text und steht in keiner
 *     Sitemap — gebaut und für die Suche unsichtbar. Ein Seitenobjekt wäre
 *     der zweite mögliche Träger und ist bewusst nicht gewählt; dieselbe
 *     Begründung wie bei /pages/kritik, /pages/erfahrungen und
 *     /pages/hypothesen.
 *
 * (4) VERLINKT von einer indexierten Seite: die FAQ-Antwort zum 20-Tage-Test
 *     verweist hierher (app/data/faq-seite.js, Feld `weiter`). Ein
 *     Menü-Eintrag allein trüge das nicht — dessen Kinder rendert Shopify
 *     clientseitig, im Server-HTML stehen sie nicht.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel. Die Kette hängt pfad-agnostisch im root-Layout;
 * TRACKING_COOKIE_NAMES bleibt unangetastet. KEIN Kaufknopf auf dieser Seite.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul
 * (app/data/kauf-tatsachen.js). Oxygen läuft am Edge und kann shared-state zur
 * Laufzeit nicht lesen — dieselbe Bauform wie /pages/kritik und
 * /pages/erfahrungen. Die einzige bewegliche Größe, die Google-Bewertung,
 * kommt aus dem root-Loader.
 *
 * WACHE: homepage-bauer/pruefungen/probe_neu_oder_gebraucht_hell.py — sie
 * misst am ausgelieferten HTML den INHALT (Rand-Marker), die Freischaltung
 * (kein noindex, kein Disallow, Canonical, Sitemap-Eintrag, eingehender Link)
 * und das FAQPage-Schema. Erreichbarkeit ist nicht Inhalt: ein Prüfpunkt auf
 * HTTP 200 wäre von einer leeren Hülle nicht zu unterscheiden.
 */
export function links() {
  return [{rel: 'stylesheet', href: nogStyles}];
}

const TITEL =
  'Qi Blanco gebraucht kaufen: was fehlt und was im Preis steckt | Qi Blanco';
const BESCHREIBUNG =
  'Rücknahme, Widerruf, Gewährleistung und Versand bei Qi Blanco – jede ' +
  'Angabe mit Quelle. Und was ein Kauf von privat nicht enthält.';

/**
 * SCHEMA-DATEN. `datePublished` ist der Tag der Veröffentlichung,
 * `dateModified` der Tag der letzten inhaltlichen Änderung — BEIDE sind
 * Konstanten und KEINE Laufzeit-Uhr: ein `dateModified`, das sich bei jedem
 * Abruf bewegt, behauptet eine Pflege, die nicht stattfindet. WER DEN INHALT
 * DIESER SEITE ÄNDERT, ZIEHT `NOG_GEAENDERT` IM SELBEN COMMIT NACH.
 */
const NOG_VEROEFFENTLICHT = '2026-09-12';
const NOG_GEAENDERT = '2026-09-12';

/**
 * DAS FAQPage-SCHEMA WIRD AUS DEM SICHTBAREN TEXT GEBAUT: `FRAGEN` ist
 * dieselbe Liste, die die Komponente als Abschnitt „Kurz gefragt" ausgibt.
 * Eine Frage im Schema, die auf der Seite nicht steht, wäre ein Verstoß gegen
 * Googles Richtlinien für strukturierte Daten.
 *
 * DER STILLE VERLUST IST DER TEURE FALL: `buildFaqPageJsonLd` wirft Items
 * aus, die das Deny-Netz treffen, und liefert dann ein kürzeres Schema — die
 * Seite bliebe sichtbar und würde nur für Google ärmer, ohne Fehlermeldung.
 * Am 2026-09-12 passieren alle fünf Fragen das Netz; der Test
 * test/neu-oder-gebraucht.test.mjs hält mit einem Soll von fünf
 * Question-Einträgen dagegen.
 */
/** @type {MetaFunction} */
export const meta = () => {
  const schema = buildFaqPageJsonLd(FRAGEN, {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
    datePublished: NOG_VEROEFFENTLICHT,
    dateModified: NOG_GEAENDERT,
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export default function NeuOderGebrauchtRoute() {
  return <NeuOderGebrauchtSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
