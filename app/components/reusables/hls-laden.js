/*
 * hls.js ERST BEI BEDARF (Grossjob 20261026 Ladezeiten, Segment s13, M2;
 * Christian Z11 26.10.2026: „intelligentes Laden“).
 *
 * Bis 02.11.2026 importierten ImgixVideo.jsx und ProduktVideos.jsx hls.js
 * statisch. Gemessen (s04, MASSNAHMEN.md):
 * - Server-Bundle 4,33 MB, davon hls.js 561 kB (13 %). Auf dem Server läuft
 *   hls.js nie, es verlängert nur den Kaltstart des Isolates.
 * - Im Browser holte jede Kaufseite den hls-Chunk (157 kB am Netz) per
 *   modulepreload ab 235–490 ms, also vor dem LCP. Auch das iPhone, das
 *   hls.js nie benutzt (natives HLS, appleNativHls).
 *
 * Jetzt: `ladeHls()` holt den Chunk erst, wenn ein Video in Sichtweite kommt
 * UND der Browser kein natives HLS über Apple spielt UND Media Source
 * Extensions hat. Im Server-Build ist `import.meta.env.SSR` die Konstante
 * true, der Zweig mit dem import() fällt beim Bündeln weg (Beleg: metafile).
 *
 * Ein Ladefehler (Netz, Chunk nach einem Deploy weg) liefert eine
 * Ablehnung. Die Aufrufer fallen dann auf mp4 zurück. Das Versprechen wird
 * danach verworfen, das nächste Video versucht es neu.
 */

let hlsVersprechen = null;

export function ladeHls() {
  if (!import.meta.env.SSR && !hlsVersprechen) {
    hlsVersprechen = import('hls.js').then((modul) => modul.default);
    hlsVersprechen.catch(() => {
      hlsVersprechen = null;
    });
  }
  return hlsVersprechen ?? Promise.reject(new Error('hls.js läuft nur im Browser'));
}

/*
 * Kann hls.js hier überhaupt laufen? Dieselbe Bedingung, die hls.js selbst
 * zuerst prüft (MediaSource oder ManagedMediaSource). Ohne sie wird der Chunk
 * gar nicht erst geholt. Die genaue Prüfung (Codecs) bleibt
 * Hls.isSupported() nach dem Laden.
 */
export function mseVorhanden() {
  if (typeof window === 'undefined') return false;
  return (
    typeof window.MediaSource !== 'undefined' ||
    typeof window.ManagedMediaSource !== 'undefined' ||
    typeof window.WebKitMediaSource !== 'undefined'
  );
}

/*
 * APPLE-GERÄTE SPIELEN NATIVES HLS (Grossjob vom 30.10.2026 „Homepage gesamt
 * prüfen“, s03): navigator.vendor Apple, also Safari UND Chrome auf dem
 * iPhone (beide WebKit), sobald der eingebaute Spieler HLS kann. Seit
 * iOS 17.1 meldet hls.js dort über ManagedMediaSource zwar isSupported, das
 * Video blieb im Messlauf 30.10. aber bei readyState 1 stehen.
 * Begründung und Messung: Kopf von ImgixVideo.jsx.
 */
export function appleNativHls(video) {
  if (typeof navigator === 'undefined') return false;
  if (!/Apple/.test(navigator.vendor || '')) return false;
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}
