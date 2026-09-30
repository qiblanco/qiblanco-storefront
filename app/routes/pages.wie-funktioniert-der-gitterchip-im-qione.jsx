import {GitterChipSeite} from '~/components/campaign/GitterChipSeite';
import {canonicalLink} from '~/lib/seo';
import {teilbildTags} from '~/lib/seiten-seo';
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
 * ─── FREIGEGEBEN AM 2026-10-01 ────────────────────────────────────────────
 *
 * Gebaut ab 24.09. versteckt (noindex in meta und X-Robots-Tag, Sperreintrag
 * in NICHT_INDEXIERBARE_SEITEN_DEF, nicht in NUR_ROUTE_SEITEN), bis zur
 * Leitplanken-Frage 7 („Wie-funktioniert-Seite sichtbar schalten“, Business-
 * Growth-PDF vom 26.09.). Entschieden am 30.09. (AI-CEO im Mandat, Option a):
 * sichtbar schalten und im Video-Dialog der QiOne-Kaufseite verlinken. Job
 * growth-m-lp-produktseite-verkauft-s05, in EINEM PR an allen Stellen:
 * canonicalLink und Teilbild (og:image) statt noindex hier, Sperreintrag entfernt, Eintrag in
 * NUR_ROUTE_SEITEN (Sitemap), WIE_FUNKTIONIERT_LINK = true in
 * app/data/produkt-videos.js.
 *
 * RÜCKWEG, falls Christian Frage 7 anders beantwortet: denselben PR
 * zurücknehmen (hb-deploy revert). Nur den Link aus: WIE_FUNKTIONIERT_LINK
 * = false; dann bleibt die Seite indexierbar, aber ohne Link aus dem Dialog.
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
  canonicalLink(SEITE.pfad),
  ...teilbildTags(SEITE.pfad),
];

export default function WieFunktioniertDerGitterChipRoute() {
  return <GitterChipSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
