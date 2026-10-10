/**
 * Meta-Pixel-Ereignis je LP-Abschnitt (GS-076, rz-0679; Job
 * 20261010-aiceo-s04-lp-abschnitt-pixel-ereignis, Urkunde
 * z3://auftrag/CW-20261010-7804594e).
 *
 * WOZU. Retargeting „Ads-LP bis zum Mechanismus gelesen, Kaufseite nicht
 * besucht". Meta baut Zielgruppen aus Website-Ereignissen nach Name und
 * Parametern; dafür braucht der Pixel ein Ereignis je gesehenem Abschnitt.
 *
 * WAS ES SENDET. fbq('trackCustom', 'LPAbschnitt', {abschnitt, seite}):
 *   abschnitt = data-section des Abschnitts (z. B. 'lp-a-mechanismus'),
 *   seite     = Pfad der LP (z. B. '/pages/schlaf-zellen-schutz').
 * Genau eines je Abschnitt und Seitenaufruf, erst nach VERWEIL_MS mit
 * mindestens halber Sichtbarkeit (dieselbe Schwelle wie qpx visEnough).
 * KEIN value, keine Währung: das Ereignis ist ein Zielgruppen-Baustein, nie
 * ein Optimierungs- oder Wertsignal (Konzept heatmap-manager
 * KONZEPT-NUTZUNG.md Satz 6: „Verhalten wird nie zum Gebotssignal").
 *
 * EINWILLIGUNG. Strenger als das Tor des Pixels selbst: das Ereignis verlangt
 * die AUSDRÜCKLICHE Cookiebot-Marketing-Einwilligung. Die Region-Regel
 * 'optout' (Pixel lädt ohne Ablehnung) reicht hier nicht, das
 * Vorschau-Attribut auch nicht. Ohne Einwilligung: 0 Ereignisse, auch kein
 * Schatten-Eintrag.
 *
 * SCHALTER META_ABSCHNITT_MODUS:
 *   'aus'      nichts beobachten, nichts senden.
 *   'schatten' beobachten und in window.__qbMetaAbschnitt notieren, NICHT an
 *              Meta senden (Evidenz-Stufe).
 *   'an'       notieren UND an Meta senden.
 * Rückweg: Wert auf 'aus' (ein Commit über hb-deploy) oder hb-deploy revert.
 * Messung: homepage-bauer/pruefungen/meta-abschnitt/probe_meta_abschnitt_live.py
 */
export const META_ABSCHNITT_MODUS = 'schatten';
export const META_ABSCHNITT_EREIGNIS = 'LPAbschnitt';
export const VERWEIL_MS = 1000;

const MODI = new Set(['aus', 'schatten', 'an']);

/** Nur Landingpages (/pages/<handle>), nie Kaufseiten oder Startseite. */
export function istLpPfad(pfad) {
  return typeof pfad === 'string' && /^\/pages\/[^/?#]+\/?$/.test(pfad);
}

/** Pfad ohne Schluss-Schrägstrich, so wie er im Parameter `seite` steht. */
export function seiteAusPfad(pfad) {
  return pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
}

/**
 * Mindestens halb sichtbar: halber Abschnitt ODER halbe Fensterhöhe (für
 * Abschnitte, die höher als das Fenster sind). Spiegel von visEnough in
 * public/qiblanco-qpx.js.
 */
export function sichtbarGenug(eintrag, fensterHoehe) {
  if (!eintrag || !eintrag.isIntersecting) return false;
  if (eintrag.intersectionRatio >= 0.5) return true;
  const vh =
    (eintrag.rootBounds && eintrag.rootBounds.height) || fensterHoehe || 0;
  const h = (eintrag.intersectionRect && eintrag.intersectionRect.height) || 0;
  return vh > 0 && h >= vh * 0.5;
}

/**
 * Zählt je Seitenaufruf jeden Abschnitt höchstens einmal.
 *
 * Ein Abschnitt, der ohne Einwilligung gesehen wird, gilt NICHT als gesehen:
 * willigt der Besucher später ein und sieht ihn erneut, zählt er dann.
 *
 * @param {{modus: string, einwilligung: () => boolean,
 *          senden: (p: object) => void, notieren: (e: object) => void}} o
 */
export function erstelleErfasser({modus, einwilligung, senden, notieren}) {
  const m = MODI.has(modus) ? modus : 'aus';
  const gesehen = new Set();
  return {
    modus: m,
    gesehen,
    melde(abschnitt, seite) {
      if (m === 'aus' || !abschnitt || gesehen.has(abschnitt)) return false;
      let ok = false;
      try {
        ok = Boolean(einwilligung());
      } catch {
        ok = false;
      }
      if (!ok) return false;
      gesehen.add(abschnitt);
      const parameter = {abschnitt, seite};
      try {
        notieren({...parameter, modus: m});
      } catch {
        // Notizbuch ist nur Evidenz, nie Bedingung.
      }
      if (m === 'an') senden(parameter);
      return true;
    },
  };
}
