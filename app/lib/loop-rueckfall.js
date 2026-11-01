/**
 * LOOP-RÜCKFALL: ein stummer Endlos-Film (360-Grad-Loop) meldet, wenn das
 * Gerät ihn nicht abspielt, damit die Seite eine Bildfolge an seine Stelle
 * setzen kann.
 *
 * Job 20261101-prio1-qi-alpha-shopseite-360-grad-iphone-spielt-nicht.
 * Christian 01.11.2026 auf Annas iPhone (Chrome): „360-Grad-Animation, das
 * spielt gar nicht ab“. Ursache: iOS lehnt das Abspielen ohne Berührung ab
 * (Stromsparmodus, „Video-Vorschauen automatisch abspielen“ aus), das
 * `autoplay`-Attribut greift dann nicht, und `play()` endet mit
 * NotAllowedError. Das gilt für Safari und Chrome gleich, beide sind WebKit.
 * Eine animierte Bildfolge unterliegt dieser Regel nicht.
 *
 * Rückfall nur, wenn das Gerät ABLEHNT, nie, weil der Film noch lädt:
 *   1. play() endet mit NotAllowedError, oder
 *   2. der Film hat Daten (canplay), steht aber nach `frist` ms noch,
 *      während Tab und Film sichtbar sind.
 * Ein langsames Netz löst also keinen Rückfall aus, ebenso wenig ein
 * Hintergrund-Tab oder ein Film außerhalb des Fensters (Chrome startet ihn
 * dort erst, wenn er ins Bild kommt). Android und Desktop spielen stumm
 * immer ab und sehen den Rückfall nie.
 *
 * Rückgabe: Aufräumfunktion (für useEffect).
 */
export const LOOP_FRIST_MS = 1500;

function sichtbarImFenster(video) {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden')
    return false;
  if (
    typeof video.getBoundingClientRect !== 'function' ||
    typeof window === 'undefined'
  )
    return true;
  const r = video.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

export function starteLoop(
  video,
  beiRueckfall,
  {frist = LOOP_FRIST_MS, uhr = globalThis, sichtbar = sichtbarImFenster} = {},
) {
  let ende = false;
  let wecker = null;

  const aufraeumen = () => {
    video.removeEventListener('timeupdate', beiZeit);
    video.removeEventListener('canplay', beiDaten);
    if (wecker !== null) uhr.clearTimeout(wecker);
    wecker = null;
  };
  const rueckfall = (grund) => {
    if (ende) return;
    ende = true;
    aufraeumen();
    beiRueckfall(grund);
  };
  // Erst eine fortschreitende Zeit zählt als „läuft“, das Ereignis
  // `playing` allein nicht.
  function beiZeit() {
    if (!video.paused && video.currentTime > 0) {
      ende = true;
      aufraeumen();
    }
  }
  function beiDaten() {
    if (ende || wecker !== null) return;
    wecker = uhr.setTimeout(() => {
      wecker = null;
      if (ende || (!video.paused && video.currentTime > 0)) return;
      // Unsichtbar ist keine Ablehnung: später noch einmal schauen.
      if (!sichtbar(video)) beiDaten();
      else rueckfall('steht');
    }, frist);
  }

  video.addEventListener('timeupdate', beiZeit);
  video.addEventListener('canplay', beiDaten);
  if (video.readyState >= 3) beiDaten();
  try {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch((e) => {
        if (e && e.name === 'NotAllowedError') rueckfall('abgelehnt');
      });
    }
  } catch (e) {
    if (e && e.name === 'NotAllowedError') rueckfall('abgelehnt');
  }

  return () => {
    ende = true;
    aufraeumen();
  };
}
