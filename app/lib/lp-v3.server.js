/**
 * LP-V3 Kill-Entscheidung (Grossjob 20260726-lp-v3-apple-microsoft-scrollanim).
 *
 * /pages/schlaf-zellen-schutz-v3-67a7 ist ein REVIEW-ARTEFAKT: live, aber
 * nicht crawlbar (noindex/X-Robots/robots-Disallow, keine internen Links)
 * und OHNE Traffic-Split — die A/B-Logik (lp-ab-v2.server.js) bleibt
 * unberuehrt.
 *
 * KILL-SEMANTIK (bewusst invers zu LP_AB_V2_MODE): LP_V3_MODE ist ein
 * KILL-Flag, kein Arm-Flag. Nur der explizite Wert 'off' nimmt die Seite
 * vom Netz (Loader wirft 404); Abwesenheit/andere Werte = Seite rendert.
 * Grund: Das Review-Artefakt soll ohne Oxygen-Env-Handgriff erreichbar
 * sein — ein Arm-Flag wäre bei Abwesenheit tot und niemand merkte es.
 * Kill ohne Deploy: LP_V3_MODE=off im Oxygen-Env-File des Deploy-Workflows.
 * Kompletter Rueckbau: hb-deploy revert --sha <merge-sha> (squash-Merges).
 *
 * Pure Funktion ohne Imports — hermetisch testbar (test/lp-v3.test.mjs,
 * Muster test/lp-ab-v2.test.mjs).
 */

export const LP_V3_PFAD = '/pages/schlaf-zellen-schutz-v3-67a7';

/** true NUR bei explizitem LP_V3_MODE='off' (case-/whitespace-tolerant). */
export function istV3Aus(env) {
  return String(env?.LP_V3_MODE ?? '').trim().toLowerCase() === 'off';
}
