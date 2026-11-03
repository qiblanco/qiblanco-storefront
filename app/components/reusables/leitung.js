/*
 * LEITUNG DES BESUCHERS (Grossjob Ladezeiten s13, M3; Christian Z11
 * 26.10.2026: „dass man mit Slow Resolution lädt ... in Abhängigkeit von
 * der Ladegeschwindigkeit des Users“, Z13: „Wenn eben nicht geladen, dann
 * Standbild, Thumbnail“).
 *
 * Drei Stufen aus navigator.connection (Network Information API), einmal
 * beim Laden des Videos gelesen:
 *   'sparen'   saveData === true (ausdrücklicher Wunsch des Besuchers) oder
 *              effectiveType '2g'/'slow-2g' (die Leitung trägt kein Video).
 *              Die 360-Drehung lädt nicht, das Standbild bleibt.
 *   'langsam'  effectiveType '3g'. hls.js deckelt die Stufe auf die
 *              CSS-Größe des Kastens (maxDevicePixelRatio 1, im 332-px-Kasten
 *              480p statt 720p).
 *   'normal'   alles andere, auch ohne API (Safari, Firefox): wie bisher.
 *
 * Gemessen am 02.11.2026 (Prüfstand s13, echtes QiBracelet-HLS, 332-px-
 * Kasten, Pixel 7, je 6 Läufe, Median): bei 300 ms / 1,6 Mbit/s (Chrome
 * meldet '3g') kam das erste Bild mit Deckel nach 3,2 s ohne Stocken, ohne
 * Deckel nach 5,1 s mit einem Stocken, danach fiel hls.js ohnehin auf 480p.
 * Auf 4G bleibt der Deckel wie er ist: 480p war dort am Chip-Rand sichtbar
 * weicher (Bildvergleich am selben Einzelbild).
 *
 * Fail-safe-Richtung wie SKILL-VIDEO-LADESTRATEGIE §3: kennt der Browser
 * die API nicht, lädt alles wie bisher.
 */

export function leitungAus(verbindung) {
  if (!verbindung) return 'normal';
  const typ = verbindung.effectiveType;
  if (verbindung.saveData === true || typ === '2g' || typ === 'slow-2g') return 'sparen';
  if (typ === '3g') return 'langsam';
  return 'normal';
}

export function leitung() {
  if (typeof navigator === 'undefined') return 'normal';
  return leitungAus(navigator.connection);
}
