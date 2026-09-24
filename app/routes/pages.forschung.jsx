import {ForschungSeite} from '~/components/campaign/ForschungSeite';
import forschungStyles from '~/styles/forschung.css?url';
import {SEITE} from '~/data/forschung-seite';

/**
 * /pages/forschung: „Forschung bei Qi Blanco“.
 *
 * Christian, 24.09.2026, Sprachnachricht: „Neue Page kriegen, und zwar die
 * Page heißt /pages/forschung. Nicht crawlen, nicht veröffentlicht. Und da
 * möchte ich die Idee aufbringen: Wie versteht Qi Blanco Forschung? Und wo
 * sehen sie sich gerade selber?“
 *
 * ─── VERSTECKT, BIS CHRISTIAN SIE FREIGIBT ─────────────────────────────────
 *
 * Drei Wege, wie bei pages.wie-funktioniert-der-gitterchip-im-qione.jsx:
 * (1) meta robots noindex,nofollow im head und (2) derselbe Wert als
 * X-Robots-Tag, KEIN canonical (entweder noindex oder canonical, nie beides);
 * (3) der Eintrag `forschung` in NICHT_INDEXIERBARE_SEITEN_DEF (app/lib/seo.js)
 * mit `ausSitemap: true`. Er ist heute wirkungslos, weil diese reine Route in
 * keiner Sitemap steht, und sperrt den Tag, an dem jemand im Shopify-Admin
 * eine Seite mit diesem Handle anlegt. Die Seite steht NICHT in
 * NUR_ROUTE_SEITEN, und kein Menü, keine Seite und Anna verlinken sie.
 *
 * WARUM (1) UND (2) HIER ALS WERT STEHEN UND NICHT ÜBER noindexMeta() UND
 * noindexHeader(): Die Linkliste /pages/uebersicht erkennt noindex am
 * Wortlaut der Route (homepage-bauer/src/uebersicht.py, lies_noindex), nicht
 * am Aufruf der Helfer. Gemessen am 24.09.2026: die GitterChip-Seite steht
 * dort deshalb als „crawlbar“ im Bereich der öffentlichen Seiten. Die Werte
 * sind wortgleich mit den Helfern in app/lib/seo.js.
 *
 * FREIGABE (ein PR, drei Stellen): meta robots und headers durch
 * canonicalLink(SEITE.pfad) ersetzen, den Eintrag aus
 * NICHT_INDEXIERBARE_SEITEN_DEF nehmen und die Seite in NUR_ROUTE_SEITEN
 * aufnehmen.
 *
 * TRACKING-NAHT: kein neuer Cookie, kein neuer Identitäts- oder
 * Tracking-Schlüssel. Die Einladung ist ein mailto-Link; die Tracking-Kette
 * hängt pfad-agnostisch im root-Layout.
 */
export function links() {
  return [{rel: 'stylesheet', href: forschungStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * Zweite, vom HTML unabhängige Sperre desselben Signals: greift auch bei einem
 * Bot, der den head nicht parst.
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function ForschungRoute() {
  return <ForschungSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
