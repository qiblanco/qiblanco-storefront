/**
 * VIDEO IN SEINER BÜHNE (nur Variante A, Szenen-Kette).
 *
 * Elina 01.11.2026, Vorgang EL-20261101-ce2055f2 (ersetzt Punkt 4 aus
 * EL-20261101-ead0cb14): „Man soll gezwungen werden, das Video anzuschauen,
 * aber ohne hartes Einrasten und ohne Scroll-Sperre. Stattdessen braucht man
 * MEHRERE lange Wische (ca. 3), um am Video vorbeizukommen: das Video bleibt
 * dafür im Bild stehen (sticky über eine lange Scrollstrecke). Während man
 * scrollt, läuft das Video FLÜSSIG in normaler Geschwindigkeit weiter – kein
 * Stocken, kein Anhalten, kein Springen, keine Bild-für-Bild-Kopplung.“
 *
 * Das Video steht in einer eigenen Bühne (.tap-film-buehne, CSS: am
 * Touch-Gerät drei lange Schritte hoch) und ist dort sticky. Das Scrollen
 * steuert das Video NICHT: kein playbackRate, kein currentTime, kein Pausieren
 * beim Wischen. Abspielen und Ruhen außerhalb des Bildes regelt TheAlphaTon.
 * Hier bleibt nur:
 * - Am Ende hält es das Logo (kein Sprung zurück auf Schwarz, keine Schleife).
 * - Ist es am Ende und steht man wieder VOR dem Video (tap-wartet, die Szene
 *   davor ist zu sehen), geht es unsichtbar an den Anfang: kommt man erneut
 *   hin, läuft es von vorn.
 *
 * Prüfschalter ?video=spulen: Bild am Daumen (Video steht, wenn der Daumen
 * steht), nur zum Vergleich in der Vorschau; Elina will es ausdrücklich nicht.
 *
 * tapVideoLauf(buehne, figur, video, win) → Aufräumfunktion.
 */

// Bis hierhin vor dem Dateiende: Logo voll (16,75 s) und letzter Satz
// (16,8–19,3 s) stehen, die Abblende auf Schwarz (19,9 s) bleibt weg.
export const ENDE_VOR_SCHLUSS_S = 0.8;

/** Anteil 0..1 des Wegs durch die Bühne, aus zwei Rechtecken: das Video steht
 * (sticky) und rutscht in der Bühne nach unten, bis es ihr Ende erreicht. */
export function anteil(buehneRect, figurRect) {
  const weg = buehneRect.height - figurRect.height;
  if (!(weg > 0)) return 0;
  return Math.min(1, Math.max(0, (figurRect.top - buehneRect.top) / weg));
}

export function tapVideoLauf(buehne, figur, video, win = window) {
  if (!buehne || !figur || !video) return () => {};
  const spulen = new URLSearchParams(win.location.search).get('video') === 'spulen';
  video.loop = false;
  let angefordert = false;
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
    if (!e) return;
    if (spulen) {
      if (!sichtbar()) return;
      const ziel = anteil(buehne.getBoundingClientRect(), figur.getBoundingClientRect()) * e;
      if (!video.paused) video.pause();
      if (!video.seeking && Math.abs(video.currentTime - ziel) > 0.04) video.currentTime = ziel;
      return;
    }
    // Wieder vor dem Video, nachdem es das Logo gezeigt hat: unsichtbar an den
    // Anfang, damit es beim nächsten Mal von vorn läuft.
    if (video.dataset.tapLaufEnde && figur.classList.contains('tap-wartet')) {
      delete video.dataset.tapLaufEnde;
      video.currentTime = 0;
    }
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
    delete video.dataset.tapLaufEnde;
  };
}
