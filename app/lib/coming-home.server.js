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
 * Beide Mails tragen denselben Link, es ist ein wiederkehrendes Meeting.
 * Ändert sich das Meeting, wird der Link HIER nachgezogen. Die Wache dazu
 * vergleicht den Link der jüngsten Einladung mit diesem Wert
 * (growth-manager/pruefungen/probe_coming_home_seite.py).
 *
 * RÜCKWEG OHNE REVERT: LINK_AN = false. Die Seite nimmt weiter Anmeldungen
 * an, zeigt nach dem Absenden aber keinen Link, sondern verweist auf die
 * Einladung per E-Mail.
 */
export const LINK_AN = true;

export const TEILNAHME_LINK =
  'https://us02web.zoom.us/meetings/82933450465/invitations' +
  '?signature=7Ev807G9BEu6VRY_v6UZ4OncZPQye2LzHkYwSYe7Adc';

/**
 * @returns {string | null} der Link, oder null, wenn er abgeschaltet ist
 */
export function teilnahmeLink() {
  return LINK_AN ? TEILNAHME_LINK : null;
}
