/**
 * LP-Registry — datengetriebene Ad-Landingpages (Stufe 1: 1:1-Startseite).
 *
 * Jeder Eintrag beschreibt eine Landingpage ueber ihren /pages/<handle>.
 * Eine neue LP = ein Registry-Eintrag hier + eine Duennroute
 * (app/routes/pages.<handle>.jsx), die HomepageSections rendert.
 *
 * `overrides` ist der Stufe-2-Hook: LP-spezifische Sektions-Anpassungen.
 * In Stufe 1 bewusst leer ({}) — der DOM ist byte-identisch zur Startseite.
 */
export const LANDING_PAGES = {
  'zell-schutz': {
    title:
      'Qi Blanco - Life Technology - Jetzt kennenlernen. - Qi Blanco UG (haftungsbeschränkt)',
    overrides: {},
  },
  'tiefer-schlaf': {
    title:
      'Qi Blanco - Life Technology - Jetzt kennenlernen. - Qi Blanco UG (haftungsbeschränkt)',
    overrides: {},
  },
};
