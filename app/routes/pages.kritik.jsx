import {KritikSeite} from '~/components/campaign/KritikSeite';
import kritikStyles from '~/styles/kritik.css?url';
import {noindexMeta, noindexHeader} from '~/lib/seo';

/**
 * /pages/kritik — ERREICHBAR, ABER DUNKEL.
 *
 * Auftrag: 20260910-BAU-zweifelsseiten-live-aber-noindex-und-nicht-im-menue
 * (Christian, 2026-09-10, Eintrag 7 der High-Hanging-Fruits-Liste, wörtlich:
 * „liveschalten und mergen, aber noch nicht crawlbar und noch nicht ins drop
 * down einbetten, d.h. erstmal nur bauen und live schalten sodass wir es
 * kontrollieren koennen").
 *
 * WARUM EINE NEUE ROUTE UND NICHT /pages/wirkt-das UMGEBAUT: die Vorlage aus
 * s04 des Grossjobs 20260907-…-prio6 empfahl die Überarbeitung von
 * /pages/wirkt-das. Christians Entscheidung vom 2026-09-10 lautet „eine eigene
 * Seite JE Zweifelsfrage" — für „Qi Blanco Kritik" also eine Seite, die diese
 * Frage im Namen trägt. /pages/wirkt-das bleibt unangetastet (zurückgezogen,
 * noindex, Rückweg dokumentiert im Job 20260831-vollzug-wirkt-das-…).
 *
 * DAS DUNKEL HAT HIER VIER SPERREN, und alle vier sind angeordnet („Beides,
 * nicht eines von beiden"):
 *
 * (1) NOINDEX im HTML-head UND als X-Robots-Tag (Hausmuster „Gurt und
 *     Hosenträger", wortgleich zu pages.erfahrungen.jsx). BEWUSST KEIN
 *     canonical: entweder noindex ODER canonical, nie beides.
 *
 * (2) ROBOTS.TXT: `Disallow: /pages/kritik` in der `User-agent: *`-Gruppe
 *     ([robots.txt].jsx, generalDisallowRules). Die Index-Hygiene des Hauses
 *     lehnt Disallow für Seiten ab, die im Index STEHEN — Google könnte das
 *     noindex dann nicht mehr lesen. Diese Seite war nie im Index: Disallow
 *     verhindert den Erstbesuch, noindex ist der Gurt für den Bot, der über
 *     einen fremden Link trotzdem kommt. WER DIE SEITE FREISCHALTET, NIMMT
 *     ZUERST DAS DISALLOW RAUS, DANN DAS NOINDEX — in dieser Reihenfolge.
 *
 * (3) NICHT IN DER SITEMAP — durch die Wahl des Trägers: reine Hydrogen-Route,
 *     KEIN Shopify-Page-Objekt. Die Sitemap entsteht aus der Shopify-Page-
 *     Liste; eine Code-Route kommt dort baulich nie hinein (Begründung und
 *     Gegenprobe im Bestand: pages.erfahrungen.jsx, Punkt 2).
 *
 * (4) NICHT VERLINKT — kein Eintrag in Navigation, Footer, Übersicht oder auf
 *     einer indexierten Seite. Ausgehende Links (auf /pages/studien, die fünf
 *     Studienseiten und die FAQ) sind erlaubt und gewollt.
 *
 * WER DIESE SEITE SPÄTER LIVE NIMMT, MUSS VIER DINGE TUN: Disallow raus,
 * noindex raus (dann canonical setzen), Shopify-Page-Objekt `kritik` anlegen
 * (Sitemap + Menü-Ziel), Verlinkung setzen (FAQ-Antwort zur Kritik verweist
 * laut Abgrenzungs-SSoT hierher). Das ist Christians Entscheidung, nicht unsere.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel. Die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout;
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Keine Bereichsgrenze an dieser
 * Route. KEIN Kaufknopf — auf dieser Seite gibt es keinen Kaufweg zu messen.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/kritik-
 * vorwuerfe.js). Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen — dieselbe Bauform wie /pages/erfahrungen und /pages/uebersicht.
 *
 * WACHE: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py --flaeche kritik
 * misst Inhalt UND alle vier Sperren am Live-Rand (nachbau-audit h1afce75b).
 */
export function links() {
  return [{rel: 'stylesheet', href: kritikStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Blanco Kritik – was stimmt davon? | Qi Blanco'},
  {
    name: 'description',
    content:
      'Die Kritik an Qi Blanco, wörtlich zitiert und Punkt für Punkt beantwortet: Was stimmt, was stimmt zum Teil, was stimmt nicht – mit Fundstelle, Belegen und den Grenzen unserer Studien.',
  },
  noindexMeta(),
];

/** @type {HeadersFunction} */
export const headers = () => noindexHeader();

export default function KritikRoute() {
  return <KritikSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
