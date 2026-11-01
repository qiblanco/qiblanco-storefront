/**
 * VIDEO AM SCROLLWEG (nur Variante A, Szenen-Kette; Elina 01.11.2026, Vorgang
 * EL-20261101-ead0cb14, Punkt 4: „Video: kein Einrasten und kein Stopp. Das
 * Video läuft durch das Wischen weiter (an das Scrollen gekoppelt), und man
 * braucht etwa zwei lange Wische, um am Video vorbeizukommen. Das ersetzt den
 * Video-Stopp aus #1201.“)
 *
 * Das Video steht in einer eigenen Bühne (.tap-film-buehne), zwei lange
 * Schritte hoch (CSS). Solange es dort steht, gehört zu jeder Scrolllage eine
 * Videozeit: Anfang der Bühne = 0 s, Ende = `ende` (das Logo samt letztem
 * Satz). Das Video läuft immer weiter, nie rückwärts gespult und nie
 * angehalten, solange die Bühne zu sehen ist:
 * - Ruht der Daumen, läuft es in normaler Geschwindigkeit.
 * - Wischt er vorwärts, liegt die Videozeit der Scrolllage vorne; dann spielt
 *   das Video schneller (playbackRate bis MAX_RATE), bis es aufgeholt hat.
 *   So treibt das Wischen das Video voran, ohne zu spulen: Spulen (currentTime
 *   je Bild) ruckelt auf dem iPhone, weil jedes Springen ab dem letzten
 *   Schlüsselbild neu dekodiert.
 * - Zurück über mehr als ZURUECK_S springt es einmal auf die Videozeit der Lage.
 * - Am Ende hält es das Logo (kein Sprung zurück auf Schwarz).
 *
 * Prüfschalter ?video=spulen: echtes Spulen (Bild am Daumen, Video steht, wenn
 * der Daumen steht), zum Vergleich in der Vorschau.
 *
 * tapVideoLauf(buehne, figur, video, win) → Aufräumfunktion.
 */

export const MAX_RATE = 6;
export const ZURUECK_S = 1.5;
// Bis hierhin vor dem Dateiende: Logo voll (16,75 s) und letzter Satz
// (16,8–19,3 s) stehen, die Abblende auf Schwarz (19,9 s) bleibt weg.
export const ENDE_VOR_SCHLUSS_S = 0.8;
const TAKT_MS = 120;

/** Anteil 0..1 des Wegs durch die Bühne, aus zwei Rechtecken: das Video steht
 * (sticky) und rutscht in der Bühne nach unten, bis es ihr Ende erreicht. */
export function anteil(buehneRect, figurRect) {
  const weg = buehneRect.height - figurRect.height;
  if (!(weg > 0)) return 0;
  return Math.min(1, Math.max(0, (figurRect.top - buehneRect.top) / weg));
}

/** Wiedergabe-Tempo für einen Vorsprung der Scrolllage (Sekunden). */
export function tempo(vorsprung) {
  if (!(vorsprung > 0.25)) return 1;
  const roh = Math.min(MAX_RATE, 1 + vorsprung * 1.2);
  return Math.round(roh * 2) / 2;
}

export function tapVideoLauf(buehne, figur, video, win = window) {
  if (!buehne || !figur || !video) return () => {};
  const spulen = new URLSearchParams(win.location.search).get('video') === 'spulen';
  video.loop = false;
  let angefordert = false;
  let letzterTakt = 0;
  let letzterSprung = 0;
  const ende = () => {
    const d = video.duration;
    return Number.isFinite(d) && d > 0 ? Math.max(0, d - ENDE_VOR_SCHLUSS_S) : 0;
  };
  const sichtbar = () =>
    figur.classList.contains('tap-sichtbar') &&
    !figur.classList.contains('tap-aus') &&
    !figur.classList.contains('tap-wartet');

  const takt = () => {
    angefordert = false;
    const e = ende();
    if (!e || !sichtbar()) {
      if (video.playbackRate !== 1) video.playbackRate = 1;
      return;
    }
    const p = anteil(buehne.getBoundingClientRect(), figur.getBoundingClientRect());
    const ziel = p * e;
    const jetzt = win.performance.now();
    if (spulen) {
      if (!video.paused) video.pause();
      if (!video.seeking && Math.abs(video.currentTime - ziel) > 0.04) video.currentTime = ziel;
      return;
    }
    const vorsprung = ziel - video.currentTime;
    if (vorsprung < -ZURUECK_S && jetzt - letzterSprung > 400) {
      letzterSprung = jetzt;
      video.currentTime = ziel;
    }
    if (jetzt - letzterTakt >= TAKT_MS || vorsprung > 0.25 !== video.playbackRate > 1) {
      letzterTakt = jetzt;
      // Kurz vor dem Logo wieder Normaltempo, sonst liefe es über das Ende.
      const r = e - video.currentTime < 1.5 ? 1 : tempo(vorsprung);
      if (video.playbackRate !== r) video.playbackRate = r;
    }
    zeit();
    // Zurück vom Logo: weiterlaufen lassen.
    if (video.paused && video.dataset.tapLaufEnde && video.currentTime < e - 0.1) {
      delete video.dataset.tapLaufEnde;
      const lauf = video.play();
      if (lauf && lauf.catch) lauf.catch(() => {});
    }
    // Holt es noch auf, weiter nachsehen, auch wenn der Daumen schon ruht.
    if (video.playbackRate > 1) anfordern();
  };
  const anfordern = () => {
    if (angefordert) return;
    angefordert = true;
    win.requestAnimationFrame(takt);
  };
  // Am Ende das Logo halten, nie auf Schwarz und nie von vorn.
  const zeit = () => {
    const e = ende();
    if (spulen || !e || video.currentTime < e) return;
    video.dataset.tapLaufEnde = '1';
    if (video.playbackRate !== 1) video.playbackRate = 1;
    if (!video.paused) video.pause();
  };
  const gestartet = () => {
    if (spulen) video.pause();
    else zeit();
    anfordern();
  };
  win.addEventListener('scroll', anfordern, {passive: true});
  video.addEventListener('timeupdate', zeit);
  video.addEventListener('playing', gestartet);
  video.addEventListener('loadedmetadata', anfordern);
  anfordern();
  return () => {
    win.removeEventListener('scroll', anfordern);
    video.removeEventListener('timeupdate', zeit);
    video.removeEventListener('playing', gestartet);
    video.removeEventListener('loadedmetadata', anfordern);
    video.loop = true;
    video.playbackRate = 1;
    delete video.dataset.tapLaufEnde;
  };
}
