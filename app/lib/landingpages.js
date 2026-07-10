/**
 * LP-Registry — datengetriebene Ad-Landingpages (Stufe 1: 1:1-Startseite).
 *
 * Jeder Eintrag beschreibt eine Landingpage ueber ihren /pages/<handle>.
 * Eine neue LP = ein Registry-Eintrag hier + eine Duennroute
 * (app/routes/pages.<handle>.jsx), die HomepageSections rendert.
 *
 * `overrides` ist der Stufe-2-Hook: LP-spezifische Sektions-Anpassungen.
 * In Stufe 1 bewusst leer ({}) — der DOM ist byte-identisch zur Startseite.
 *
 * Hinweis: /pages/tiefer-schlaf ist seit 2026-07 KEIN Stufe-1-Klon der
 * Startseite mehr, sondern eine eigene, verkaufspsychologisch optimierte
 * Campaign-Route (app/routes/pages.tiefer-schlaf.jsx +
 * app/components/campaign/TieferSchlaf.jsx) und daher hier nicht mehr
 * registriert.
 */
export const LANDING_PAGES = {
  'zell-schutz': {
    title:
      'Qi Blanco - Life Technology - Jetzt kennenlernen. - Qi Blanco UG (haftungsbeschränkt)',
    overrides: {},
  },
};
