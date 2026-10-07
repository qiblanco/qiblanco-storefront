import {
  ErfahrungenSeite,
  erfahrungenFragen,
} from '~/components/campaign/ErfahrungenSeite';
import erfahrungenStyles from '~/styles/erfahrungen.css?url';
import absichtHinweisStyles from '~/styles/absicht-hinweis.css?url';
import {absoluteCanonical, canonicalLink} from '~/lib/seo';
import {erfahrungenSchema} from '~/lib/erfahrungen-schema';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {isoMitZone} from '~/lib/datum';

/**
 * /pages/erfahrungen — LIVE UND INDEXIERBAR seit 2026-09-11.
 *
 * VORGESCHICHTE, DIE MAN KENNEN MUSS, BEVOR MAN HIER ETWAS ZURUECKDREHT: diese
 * Route wurde am 2026-09-08 bewusst DUNKEL gebaut (Grossjob 20260907-…-prio6,
 * Segment s05) — `noindex` doppelt, per robots.txt gesperrt, nicht verlinkt,
 * nicht in der Sitemap. Das war kein Versehen und keine halbe Arbeit, sondern
 * Christians ausdruecklicher Auftrag: „noch nicht live … einfach, dass es
 * existiert, sodass ich es anschauen kann."
 *
 * ER HAT SIE ANGESCHAUT UND AM 2026-09-11 FREIGEGEBEN, woertlich: „Aber ja,
 * können wir auch freischalten. … auch beim Reiter ‚Mehr‘ einfuegen, live
 * schalten und crawlbar machen, genau wie /pages/kritik." Damit sind ALLE VIER
 * Sperren des Ursprungsbaus aufgehoben — und zwar in der Reihenfolge, die der
 * Erbauer selbst hinterlassen hat und die tragend ist:
 *
 *   1. ZUERST das `Disallow: /pages/erfahrungen` aus app/routes/[robots.txt].jsx
 *      (eine Quellzeile in `generalDisallowRules`, die live VIER Mal erscheint,
 *      weil vier User-agent-Gruppen sie rufen). Ein Bot, den Disallow aussperrt,
 *      kann ein `noindex` gar nicht erst LESEN — steht das noindex zuerst weg,
 *      bleibt die Seite unsichtbar und sieht dabei indexierbar aus.
 *   2. DANN das noindex hier raus — und im selben Zug den `canonical` SETZEN.
 *      Nie beides zugleich: ein Bot, der einem Canonical folgt, kann das
 *      noindex der Zielseite zuordnen. Deshalb trug diese Route bis heute
 *      bewusst KEINEN Canonical; jetzt trägt sie ihn und kein noindex.
 *   3. Sitemap über `NUR_ROUTE_SEITEN` in app/lib/seo.js — die ZWEITE Bauform
 *      für Seiten ohne Shopify-Seitenobjekt. Der Kommentar der Erstfassung
 *      („eine Code-Route kommt baulich nie in die Sitemap, also braucht es ein
 *      Shopify-Page-Objekt") ist damit UEBERHOLT: die Liste existiert seit dem
 *      Quellen-Bau. Es wird ausdrücklich KEIN Shopify-Page-Objekt angelegt —
 *      das wäre ein zweiter Traeger für dieselbe Seite und ein Schreibzugriff
 *      ins Fremdsystem.
 *   4. Verlinkung: Eintrag unter „Mehr" im Shopify-Hauptmenue (das Menue ist
 *      Shopify-geführt, nicht Code — Header.jsx rendert `header.menu`).
 *
 * WAS AN DIESER SEITE FÜR DIE SUCHE ZÄHLT UND VORHER FEHLTE: strukturierte
 * Daten. Gemessen am 2026-09-11 trug sie 0 `ld+json` — 17 Videos mit 13
 * namentlichen Menschen, und für eine Maschine war davon nichts erkennbar.
 * Der Graph steht jetzt in app/lib/erfahrungen-schema.js (VideoObject je Video,
 * Person je Mensch, CollectionPage + BreadcrumbList + ItemList). Ausdrücklich
 * OHNE `Review`/`aggregateRating` — Begründung im Kopf jenes Moduls.
 *
 * TRACKING-NAHT: unveraendert gegenueber dem Ursprungsbau. Diese Seite setzt
 * KEINE Cookies, führt KEINEN neuen Identitaets- oder Tracking-Key ein und hat
 * keinen eigenen Pixel; die R1/R2/R3-Kette hängt pfad-agnostisch im
 * root-Layout, `TRACKING_COOKIE_NAMES` bleibt unangetastet. An dieser Route gibt
 * es keine Bereichsgrenze, über die ein Key verloren gehen könnte — die
 * Freischaltung aendert daran nichts.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul. Oxygen läuft am Edge
 * und kann shared-state zur Laufzeit nicht lesen — dieselbe Bauform wie
 * /pages/uebersicht und /pages/quellen.
 *
 * WACHE, UND SIE HAT SICH MIT DER FREISCHALTUNG UMGEDREHT: bis heute mass
 * homepage-bauer/pruefungen/probe_erfahrungen_erreichbar_aber_dunkel.py, dass
 * die Seite DUNKEL ist. Diese Aussage ist jetzt falsch — nicht kaputt, sondern
 * ueberholt. Sie wurde im selben Zug zurueckgenommen und durch
 * pruefungen/probe_erfahrungen_hell.py ersetzt, die dieselben Achsen in der
 * ANDEREN Richtung misst und zusaetzlich Inhalt, Auszeichnung und Dubletten-
 * freiheit prueft. Wer eine Sperre wieder einbaut, ohne die Wache mitzudrehen,
 * erzeugt einen Reparaturfall gegen gesunden Code.
 */

/**
 * TITEL UND BESCHREIBUNG, GEÄNDERT AM 2026-10-07 (Grossjob 20261007-GROSSJOB-
 * seo-keyword-beobachtung-erweitern-nach-beliebtheit, s05, Massnahme
 * M-20261007-erfahrungen-antwort-faq). Vorher: „Erfahrungen mit Qi Blanco –
 * Menschen erzählen selbst | Qi Blanco". Gesucht wird „qi blanco erfahrung"
 * (63 Impressionen) und „qi blanco erfahrungen" (59), Position 6,6 bzw. 6,0,
 * keine eigene Seite in den Top 3 (Search Console 06.09.-04.10.2026). Der
 * Titel nennt den Begriff jetzt in der Suchreihenfolge vorn und sagt, was die
 * Seite einlöst. Ohne „| Qi Blanco"-Anhang: die Marke steht schon am Anfang
 * (dieselbe Abwägung wie auf /pages/kritik).
 */
const TITEL = 'Qi Blanco Erfahrungen: Menschen erzählen in eigenen Videos';

const BESCHREIBUNG =
  'Qi Blanco Erfahrungen aus erster Hand: Menschen erzählen in eigenen Videos ' +
  'von Schlaf, Energie und Ruhe im Alltag, jedes mit einer Zusammenfassung.';

/**
 * FAQPage-SCHEMA AUS DEM SICHTBAREN TEXT: `erfahrungenFragen()` ist dieselbe
 * Liste, die die Komponente als „Kurz gefragt" ausgibt. `buildFaqPageJsonLd`
 * wirft Items aus, die sein Deny-Netz treffen, und liefert dann still ein
 * kürzeres Schema. Am 2026-10-07 passieren alle vier Fragen das Netz; die
 * Rand-Probe des Segments (claude-jobs/20261007-GROSSJOB-seo-keyword-
 * beobachtung-erweitern-nach-beliebtheit/segmente/s05/probe_s05_massnahmen_
 * rand.py --arm erfahrungen) verlangt mindestens vier sichtbare Fragen im
 * Schema. WER DIE FRAGEN ÄNDERT, ZIEHT `FRAGEN_GEAENDERT` NACH.
 */
const FRAGEN_VEROEFFENTLICHT = '2026-10-07';
const FRAGEN_GEAENDERT = '2026-10-07';

const PFAD = '/pages/erfahrungen';

/**
 * Teilbild für Open Graph. Gemessen 2026-09-11: `maxresdefault` dieses Videos
 * liefert HTTP 200 mit 99 kB, also 1280x720 — das gaengige og-Seitenverhaeltnis.
 *
 * WARUM EIN VIDEO-STANDBILD UND NICHT DAS PRODUKTFOTO DER STARTSEITE: diese
 * Seite verspricht Menschen, die selbst sprechen. Ein Gesicht hält beim Teilen,
 * was die Seite einloest; ein freigestelltes Gerät verspricht eine
 * Produktseite. Gewählt ist der reichweitenstaerkste Beitrag (80 494 Aufrufe).
 *
 * BEKANNTES RISIKO, DESHALB BEWACHT: das Bild liegt bei YouTube. Wird das Video
 * dort geloescht, faellt es still auf 404 und die Seite teilt sich ohne Bild.
 * probe_erfahrungen_hell.py ruft die og:image-URL deshalb AB und urteilt am
 * Statuscode, statt nur zu prüfen, dass das Tag vorhanden ist.
 */
const OG_BILD = 'https://i.ytimg.com/vi/CkHjy2lU0IM/maxresdefault.jpg';

export function links() {
  return [
    {rel: 'stylesheet', href: erfahrungenStyles},
    {rel: 'stylesheet', href: absichtHinweisStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:locale', content: 'de_DE'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {property: 'og:image', content: OG_BILD},
  {property: 'og:image:type', content: 'image/jpeg'},
  {property: 'og:image:width', content: '1280'},
  {property: 'og:image:height', content: '720'},
  {
    property: 'og:image:alt',
    content:
      'Patrick Thiele erzählt in einem Video von seiner Erfahrung mit Qi Blanco',
  },
  // `summary_large_image` sagt ein großes Bild ZU. Die Zusage hat hier einen
  // Traeger: og:image steht unbedingt direkt darueber (Hausmuster _index.jsx).
  {name: 'twitter:card', content: 'summary_large_image'},
  {name: 'twitter:title', content: TITEL},
  {name: 'twitter:description', content: BESCHREIBUNG},
  {name: 'twitter:image', content: OG_BILD},
  {'script:ld+json': erfahrungenSchema()},
  ...faqSchema(),
];

function faqSchema() {
  const schema = buildFaqPageJsonLd(erfahrungenFragen(), {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
    datePublished: isoMitZone(FRAGEN_VEROEFFENTLICHT),
    dateModified: isoMitZone(FRAGEN_GEAENDERT),
  });
  return schema ? [{'script:ld+json': schema}] : [];
}

export default function ErfahrungenRoute() {
  return <ErfahrungenSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
