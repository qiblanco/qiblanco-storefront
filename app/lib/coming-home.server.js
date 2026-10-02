/**
 * coming-home.server — der Teilnahme-Link für „Coming Home live"
 * (Auftrag growth-m-lp-coming-home-anmeldeseite, Route
 * app/routes/pages.coming-home.jsx).
 *
 * NUR SERVER: die Endung .server.js hält diese Datei aus dem Browser-Bundle.
 * Der Link steht deshalb weder im ausgelieferten HTML noch im JavaScript der
 * Seite. Ihn liefert allein die Action der Route, und zwar erst, nachdem das
 * Anmeldeformular abgeschickt wurde.
 *
 * WOHER DER LINK STAMMT: aus Elinas Einladungen an die DACH-Liste
 * (ActiveCampaign, Kampagnen 1049 vom 18.09.2026 und 1051 vom 24.09.2026).
 * Beide Mails tragen denselben Link, es ist ein wiederkehrendes Meeting
 * (Meeting-ID 82933450465).
 *
 * BEITRITTS-LINK STATT EINLADUNGSSEITE (Elina, EL-20261002-4328e3fe: der
 * Knopf soll „wirklich das Zoom-Meeting öffnen"): die Mails verlinken
 * zoom.us/meetings/82933450465/invitations?signature=… . Das ist Zooms
 * Einladungs-Infoseite (Titel „Coming Home", Kalender-Datei, Einwahlnummern),
 * erst dort steht der Beitritt. Die Seite gibt deshalb den Link heraus, den
 * Zoom auf genau dieser Einladungsseite als „Join Zoom Meeting" nennt:
 * zoom.us/j/82933450465 (Seitentitel „Launch Meeting - Zoom", gelesen am
 * 2026-10-02). Das Meeting hat keinen Kenncode, der Link ist vollständig.
 *
 * Ändert sich das Meeting, wird der Link HIER nachgezogen. Die Wache dazu
 * vergleicht die Meeting-ID der jüngsten Einladung mit der dieses Links
 * (growth-manager/pruefungen/probe_coming_home_seite.py, Arm D).
 *
 * RÜCKWEG OHNE REVERT: LINK_AN = false. Die Seite nimmt weiter Anmeldungen
 * an, zeigt nach dem Absenden aber keinen Link, sondern verweist auf die
 * Einladung per E-Mail.
 */
export const LINK_AN = true;

export const TEILNAHME_LINK = 'https://us02web.zoom.us/j/82933450465';

/**
 * @returns {string | null} der Link, oder null, wenn er abgeschaltet ist
 */
export function teilnahmeLink() {
  return LINK_AN ? TEILNAHME_LINK : null;
}
