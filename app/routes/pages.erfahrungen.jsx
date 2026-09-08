import {ErfahrungenSeite} from '~/components/campaign/ErfahrungenSeite';
import erfahrungenStyles from '~/styles/erfahrungen.css?url';
import {noindexMeta, noindexHeader} from '~/lib/seo';

/**
 * /pages/erfahrungen — ERREICHBAR, ABER DUNKEL.
 *
 * Auftrag: Segment s05 des Grossjobs 20260907-GROSSJOB-erfahrungen-und-kritik-
 * seiten-bauen-und-die-marken-suchbegriffe-zurueckholen-prio6.
 * Christian woertlich: „Das soll schon automatisiert gebaut werden, aber noch
 * nicht live und noch nicht verlinkt auf der Frontseite — einfach, dass es
 * existiert, sodass ich es anschauen kann."
 *
 * DAS BEDEUTET TECHNISCH DREIERLEI, und alle drei sind hier bewusst gesetzt:
 *
 * (1) NICHT INDEXIERBAR — `noindex,nofollow` im HTML-head UND als X-Robots-Tag
 *     (Hausmuster D-006 „Gurt und Hosenträger"): die zweite Sperre greift auch
 *     bei einem Bot, der den head nicht parst. BEWUSST KEIN canonical: entweder
 *     noindex ODER canonical, nie beides (Hausregel, wortgleich in
 *     pages.uebersicht.jsx und pages.wirkt-das.jsx) — ein Bot, der dem Canonical
 *     folgt, kann das noindex der Zielseite zuordnen.
 *
 * (2) NICHT IN DER SITEMAP — und zwar durch die WAHL DES TRAEGERS, nicht durch
 *     eine Ausschlussliste. Das ist die eine Entscheidung dieses Baus, die man
 *     ausdrücklich treffen muss statt sie geschehen zu lassen:
 *
 *       Eine reine Hydrogen-Route liefert HTTP 200 und kommt NIE in die Sitemap.
 *       Die Sitemap entsteht in sitemap.$type.$page[.xml].jsx über getSitemap()
 *       aus der SHOPIFY-Page-Liste und kennt nur eine Ausschluss-, keine
 *       Einschlussliste. Ein Shopify-Page-Objekt mit dem Handle `erfahrungen`
 *       wäre der zweite mögliche Traeger — es trägt Sitemap-Eintrag und
 *       Menue-Ziel.
 *
 *     Für /pages/studie-qihome-air war genau das am 2026-08-15 ein DEFEKT: die
 *     Seite sollte gefunden werden und war für Suchmaschinen unsichtbar. Hier
 *     ist es die GEWOLLTE Richtung. Deshalb: NUR diese Route, KEIN Page-Objekt
 *     im Shopify-Admin. Gegenprobe im Bestand — /pages/zellstudien-ehrlich,
 *     /pages/das-20-tage-versprechen und /pages/so-wirkt-kohaerentes-wasser
 *     liefern je HTTP 200 und haben je 0 Treffer in sitemap/pages/1.xml.
 *
 *     WER DIESE SEITE SPAETER LIVE NIMMT, MUSS BEIDES TUN: das noindex hier
 *     entfernen (und dann einen canonical setzen) UND ein Shopify-Page-Objekt
 *     `erfahrungen` anlegen. Nur das eine zu tun ergibt eine Seite, die
 *     indexierbar aussieht und nicht gefunden wird — oder umgekehrt.
 *
 * (3) NICHT VERLINKT — kein Eintrag in Navigation, Footer oder Startseite. Die
 *     Navigation ist Shopify-Menue-getrieben und wird von diesem Bau nicht
 *     angefasst; im Repo entsteht kein Link auf diesen Pfad. Christian bekommt
 *     die Adresse und entscheidet die Freigabe — nicht wir.
 *
 * TRACKING-NAHT: diese Seite setzt KEINE Cookies, führt KEINEN neuen
 * Identitaets- oder Tracking-Key ein und enthält keinen eigenen Pixel. Die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (Hausmuster D-006);
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Es gibt an dieser Route keine
 * Bereichsgrenze, über die ein Key verloren gehen könnte.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul. Oxygen läuft am Edge
 * und kann shared-state zur Laufzeit nicht lesen — dieselbe Bauform wie
 * /pages/uebersicht.
 *
 * WACHE: homepage-bauer/pruefungen/probe_erfahrungen_erreichbar_aber_dunkel.py
 * (Live-Hypothese hda7d255b) misst alle drei Eigenschaften zugleich — und misst
 * dabei INHALT, nicht HTTP 200: ein reiner Statuscode ist von einer leeren
 * Huelle nicht zu unterscheiden (Belegfall Wissens-Blog, 26 fertige Jobs, 82 kB
 * leere Huelle mit HTTP 200).
 */
export function links() {
  return [{rel: 'stylesheet', href: erfahrungenStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Erfahrungen mit Qi Blanco – Menschen erzählen selbst | Qi Blanco'},
  {
    name: 'description',
    content:
      'Menschen berichten in eigenen Videos, was sie mit QiOne, QiBracelet und QiHome Air erlebt haben – zu Schlaf, Energie und Ruhe im Alltag. Mit Zusammenfassung neben jedem Video.',
  },
  noindexMeta(),
];

/** @type {HeadersFunction} */
export const headers = () => noindexHeader();

export default function ErfahrungenRoute() {
  return <ErfahrungenSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
