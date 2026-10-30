/*
 * Abgelehntes Video-Autoplay nachholen: die reinen Teile zu useVideoNachholen
 * (video360-ersatzbild.jsx). Ohne JSX, damit
 * `node --test` sie prüft (video-nachholen.test.mjs).
 */

/*
 * Ereignisse, in deren Rahmen ein Browser play() als Geste zählt: iOS
 * touchend/click, Chrome pointerup (Touch) bzw. pointerdown (Maus), Tastatur.
 * Dieselbe Liste wie GESTEN in TheAlphaTon.jsx (Qi Alpha), plus pointerdown.
 */
export const GESTEN = Object.freeze(['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']);

/**
 * play() ohne Wurf. true = läuft an, false = abgelehnt oder geworfen.
 * Manche iOS-Fassungen werfen synchron statt abzulehnen (WebKit-Bug 216887);
 * ein ungefangener Wurf bräche den Gesten-Handler ab.
 * @param {{play: () => any, paused: boolean}} video
 * @returns {Promise<boolean>}
 */
export function spieleSicher(video) {
  let p;
  try {
    p = video.play();
  } catch {
    return Promise.resolve(false);
  }
  if (!p || typeof p.then !== 'function') return Promise.resolve(!video.paused);
  return p.then(
    () => true,
    () => false,
  );
}
