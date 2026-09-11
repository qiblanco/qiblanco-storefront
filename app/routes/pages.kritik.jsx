import {KritikSeite} from '~/components/campaign/KritikSeite';
import kritikStyles from '~/styles/kritik.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';

const PFAD = '/pages/kritik';

/**
 * /pages/kritik — FREIGESCHALTET, INDEXIERBAR.
 *
 * Gebaut als dunkle Freigabe-Ansicht von 20260910-BAU-zweifelsseiten-live-aber-
 * noindex-und-nicht-im-menue („erstmal nur bauen und live schalten sodass wir
 * es kontrollieren können"). Christian hat sie am 2026-09-11 gelesen und
 * entschieden: „ist schon sehr gut. Live schalten und bei ‚Mehr' einbinden."
 * Freigeschaltet von 20260911-BAU-kritikseite-freischalten-…-s02.
 *
 * WARUM EINE NEUE ROUTE UND NICHT /pages/wirkt-das UMGEBAUT: Christians
 * Entscheidung vom 2026-09-10 lautet „eine eigene Seite JE Zweifelsfrage" —
 * für „Qi Blanco Kritik" also eine Seite, die diese Frage im Namen trägt.
 * /pages/wirkt-das bleibt unangetastet (zurückgezogen, noindex).
 *
 * DIE VIER SPERREN UND WIE SIE GEFALLEN SIND — in dieser Reihenfolge gebaut,
 * weil sie einander bedingen:
 *
 * (1) ROBOTS.TXT: `Disallow: /pages/kritik` ist aus generalDisallowRules in
 *     [robots.txt].jsx ENTFERNT. Diese Sperre muss ZUERST fallen: solange sie
 *     steht, kann Google die Seite nicht abrufen und damit auch kein noindex
 *     lesen — eine Seite, die indexierbar aussieht und unsichtbar bleibt.
 *     Im Quelltext stand die Zeile genau EINMAL, in der Auslieferung viermal
 *     (generalDisallowRules wird aus vier User-agent-Gruppen gerufen). Wer sie
 *     live sucht und „beide Vorkommen" entfernt, lässt zwei stehen.
 *
 * (2) NOINDEX RAUS, CANONICAL REIN — im selben Zug, nie einzeln. Die alte
 *     Fassung trug `noindexMeta()` + `noindexHeader()` und BEWUSST keinen
 *     Canonical („entweder noindex ODER canonical, nie beides"). Die Umkehrung
 *     gilt genauso: eine indexierbare Seite ohne Canonical ist der nächste
 *     Befund. `canonicalLink()` rendert ein echtes `<link rel="canonical">`;
 *     ein `{rel:'canonical'}` ohne `tagName` ergäbe `<meta rel="canonical">`
 *     und wäre wirkungslos (Befund L11, siehe pages.studien.jsx).
 *
 * (3) SITEMAP — ÜBER DEN BESTAND, NICHT ÜBER EIN SHOPIFY-PAGE-OBJEKT. Der
 *     frühere Satz an dieser Stelle („die Sitemap entsteht aus der Shopify-
 *     Page-Liste; eine Code-Route kommt dort baulich nie hinein") war zum
 *     Zeitpunkt seines Schreibens richtig und ist es SEITHER NICHT MEHR:
 *     app/lib/seo.js führt `NUR_ROUTE_SEITEN`, und die Sitemap-Route
 *     `sitemap.$type.$page[.xml].jsx` trägt diese Einträge nach. Diese Seite
 *     steht dort. Ein zusätzliches Shopify-Page-Objekt wäre ein ZWEITER Träger
 *     für dieselbe Seite und ist deshalb bewusst nicht angelegt.
 *
 * (4) VERLINKT von einer indexierten Seite: die FAQ-Antwort zur öffentlichen
 *     Kritik verweist hierher (app/data/faq-seite.js, Feld `weiter`) — genau
 *     der Weg, den der Abgrenzungs-SSoT für die FAQ vorsieht. Der Eintrag im
 *     Menü „Mehr" ist ein Shopify-Admin-Schreibvorgang und kommt aus dem
 *     Folgesegment s03; die Verlinkung hängt nicht daran.
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
 * WACHE: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py --flaeche
 * kritik (nachbau-audit h1afce75b). Sie misst am Live-Rand und verzweigt am
 * Feld `status` der SSoT konzepte/abgrenzung-flaechen.json: für diese Flaeche
 * steht dort seit der Freischaltung `live_indexiert`, und die Probe prüft
 * damit die HELL-Arme (Inhalt unverändert, kein Disallow, kein noindex,
 * Canonical vorhanden, in einer Sitemap, verlinkt) statt der Dunkel-Arme.
 * WER DIESE SEITE WIEDER ZURÜCKZIEHT, setzt den Status zurück — die Wache
 * dreht dann von selbst mit, und es ist kein Code zu ändern.
 */
export function links() {
  return [{rel: 'stylesheet', href: kritikStyles}];
}

const TITEL = 'Qi Blanco Kritik – was stimmt davon? | Qi Blanco';
const BESCHREIBUNG =
  'Die Kritik an Qi Blanco, wörtlich zitiert und Punkt für Punkt beantwortet: Was stimmt, was stimmt zum Teil, was stimmt nicht – mit Fundstelle, Belegen und den Grenzen unserer Studien.';

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
];

export default function KritikRoute() {
  return <KritikSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
