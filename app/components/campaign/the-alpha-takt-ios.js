/*
 * SCROLL-TAKT AM IPHONE (Qi Alpha A). Job 20261106-prio1-qi-alpha-lp-designer-
 * feedback-roter-button-hochwertig-scroll-iphone-video-autostart. Profidesigner,
 * von Christian am 06.11.2026 weitergegeben, wörtlich: „dass bei mir auf einem
 * iPhone jedenfalls das viel zu schnell scrollt. Also dass man da sehr
 * feinfühlig scrollen muss, ansonsten überspringt man die ganzen Sektionen
 * direkt. Deswegen würde ich das auf jeden Fall verlangsamen“.
 *
 * URSACHE (gemessen live 06.11., iPhone-Profil, iOS-Schwung 0,998/ms): ein
 * langer natürlicher Wisch trägt 946 px. Die Bühnen der Szenen-Kette waren
 * 48 bis 160 px je Schritt lang, also oft kürzer als ein Wisch. Der erste
 * Wisch landete am Video, Titel und Wörterbuch waren übersprungen, 17 von 26
 * Details nie zu sehen. Kein Einrasten und kein Hijacking im Spiel: die Seite
 * ist schlicht kurz, das Tempo des Fingers bestimmt iOS.
 *
 * WAS HILFT, OHNE GEGEN DEN SCHWUNG ZU ARBEITEN: mehr Scrollweg. Kein
 * Scroll-Snap, kein JS-Rast (Kanon scrollgefuehl-apple-iphone-pro Regel 10,
 * Revert #1200: am iPhone federt das), die Trägheit bleibt die von iOS.
 *  - Mittleres Tempo als Grundtakt (CSS .tap-ios-takt): 185 px je Zeile, Wort,
 *    Absatz und Bild im Verhältnis des Urzustands. Das ist Elinas gemessene
 *    Mitte (EL-20261101-242cff9c); 130svh je Schritt war zu langsam (Anna),
 *    96 px zu schnell.
 *  - Mindest-Laufbahn je Bühne (iosSchrittPx): auch eine Bühne mit wenigen
 *    Schritten steht länger, als ein langer Wisch trägt. Sie kann deshalb nicht
 *    in einem Wisch vorbeiziehen.
 * Nur iPhone/iPad (Safari und Chrome, beide WebKit). Android bleibt, wie es
 * ist (Christian: Samsung ist die Referenz), Desktop ebenso. Der Halt am Video
 * (the-alpha-stopper.js) bleibt unverändert. Prüfschalter: ?takt=alt zeigt den
 * alten Takt, ?takt=NNN (300 bis 3000) setzt die Laufbahn in Pixeln.
 */

// Länger als ein langer natürlicher Wisch (gemessen 946 px, iPhone-Profil).
export const IOS_LAUFBAHN_PX = 1000;

/** `?takt=` lesen: false = alter Takt, sonst die Laufbahn in Pixeln. */
export function iosLaufbahn(suche) {
  const wert = new URLSearchParams(String(suche || '')).get('takt');
  if (wert === 'alt') return false;
  const n = Number(wert);
  return n >= 300 && n <= 3000 ? n : IOS_LAUFBAHN_PX;
}

/** Schrittlänge einer Bühne: der Grundtakt, oder länger, wenn die Bühne sonst
 * kürzer als `laufbahn` stünde. `zahl` = Schritte nach den Anfangs-Schritten;
 * die Bühne steht (zahl + 1) Schritte lang (--tap-schritte, useTapFilm). */
export function iosSchrittPx(grundPx, zahl, laufbahn = IOS_LAUFBAHN_PX) {
  const n = Math.max(0, Number(zahl) || 0) + 1;
  return Math.max(grundPx, Math.ceil(laufbahn / n));
}
