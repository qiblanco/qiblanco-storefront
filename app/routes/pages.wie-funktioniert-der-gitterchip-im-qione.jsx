import {GitterChipSeite} from '~/components/campaign/GitterChipSeite';
import {noindexMeta, noindexHeader} from '~/lib/seo';
import kwStyles from '~/styles/was-ist-kohaerentes-wasser.css?url';
import gcStyles from '~/styles/wie-funktioniert-der-gitterchip-im-qione.css?url';
import {SEITE} from '~/data/gitterchip-seite';

/**
 * /pages/wie-funktioniert-der-gitterchip-im-qione: die Seite „Wie funktioniert
 * der GitterChip im QiOne?“.
 *
 * Christian, 23.09.2026, ~22:30: „Und noch eine Seite bauen … alles mit dem
 * Salesmanager aufbauen … mit Grafiken und Animation und ohne Verteidigung …
 * Die Seite noch nicht verlinken und nicht crawlbar machen.“
 *
 * ─── VERSTECKT, BIS CHRISTIAN SIE FREIGIBT ─────────────────────────────────
 *
 * Dasselbe Hausmuster wie pages.qi-master-vorverkauf.jsx, drei Wege:
 * (1) noindexMeta() im head und (2) noindexHeader() als X-Robots-Tag, KEIN
 * canonical (entweder noindex oder canonical, nie beides); (3) der Eintrag
 * `wie-funktioniert-der-gitterchip-im-qione` in NICHT_INDEXIERBARE_SEITEN_DEF
 * (app/lib/seo.js) mit `ausSitemap: true`. Er ist heute wirkungslos, weil
 * diese reine Route in keiner Sitemap steht; er ist die Sperre für den Tag, an
 * dem jemand im Shopify-Admin eine Seite mit diesem Handle anlegt. Die Seite
 * steht NICHT in NUR_ROUTE_SEITEN, und kein Menü, keine Seite und Anna
 * verlinken sie. Erreichbar ist sie nur über die Adresse.
 *
 * FREIGABE (ein PR, drei Stellen): hier noindexMeta/noindexHeader durch
 * canonicalLink(SEITE.pfad) ersetzen, den Eintrag aus
 * NICHT_INDEXIERBARE_SEITEN_DEF nehmen und die Seite in NUR_ROUTE_SEITEN
 * aufnehmen.
 *
 * ─── GESTALTUNG ────────────────────────────────────────────────────────────
 *
 * Zwei Stylesheets: das der Info-Seite bringt die Grundstile der drei
 * Zeichnungen, die diese Seite von dort übernimmt (Winkel, Domäne, EZ-Schicht;
 * eine Zeichnung, eine Quelle). Das eigene trägt den Seiten-Scope `.gc` und die
 * Einmal-Bewegung. Die Endlos-Schleifen der Info-Seite schaltet es im Scope ab.
 *
 * TRACKING-NAHT: kein neuer Cookie, kein neuer Identitäts- oder
 * Tracking-Schlüssel. Das Video lädt erst auf Klick über youtube-nocookie.com
 * (YoutubeTimestamp). Der Kaufknopf ist ein gewöhnlicher Link auf die
 * Produktseite; die Tracking-Kette hängt pfad-agnostisch im root-Layout.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: kwStyles},
    {rel: 'stylesheet', href: gcStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  noindexMeta(),
];

/**
 * Zweite, vom HTML unabhängige Sperre desselben Signals: greift auch bei einem
 * Bot, der den head nicht parst.
 */
export const headers = () => noindexHeader();

export default function WieFunktioniertDerGitterChipRoute() {
  return <GitterChipSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
