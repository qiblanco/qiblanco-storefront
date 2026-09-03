import {useEffect, useRef, useState} from 'react';
import Hls from 'hls.js';
import {hatHoerbarenTon} from '~/lib/video-ton';

/*
 * ImgixVideo — Sound-Toggle (Job bl-20260803T232952Z-b702ec, 2026-08-03),
 * seit 2026-08-15 nur noch bei Videos MIT hörbarem Ton.
 *
 * Browser-Autoplay-Policy erlaubt Video-Autoplay NUR stummgeschaltet, darum
 * bleibt das `muted`-HTML-ATTRIBUT unten hart gesetzt (das ist es, was der
 * Browser VOR jedem JS für die Autoplay-Erlaubnis prueft). Der sichtbare
 * Button togglet danach NUR die `.muted`-DOM-PROPERTY per Klick (= die
 * geforderte User-Geste) — kein Versuch, gegen die Policy anzuautoplayen.
 * Konzept + Abgrenzung: homepage-bauer/SKILL-VIDEO-SOUND-TOGGLE.md.
 *
 * AENDERUNG 2026-08-15 (Christian, Screenshot-Befund): der Toggle war
 * BEDINGUNGSLOS eingebaut, also bekamen ihn auch stumme Hintergrund- und
 * 360-Grad-Produktvideos — ein Audio-Umschalter an einem Video ohne Ton.
 * Ob ein Video hörbaren Ton trägt, beantwortet jetzt ausschließlich das
 * gemessene Manifest `app/lib/video-ton.js`; ohne Eintrag wird KEINE
 * Audio-UI gerendert. Bewusst NICHT über Browser-Feature-Detection
 * gelöst: die stummen 360-Grad-Videos besitzen eine AAC-Spur (digitale
 * Stille, -91 dB), jede Existenzprüfung meldet dort faelschlich "hat Ton".
 */

const SOUND_STORAGE_PREFIX = 'qb-video-sound:';

function anfangsZustandStumm(videoPath) {
  // SSR/kein sessionStorage -> Default stumm (Policy-konform). Pro
  // videoPath geschluesselt: zwei verschiedene Videos auf einer Seite
  // entstummen sich nicht gegenseitig.
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(SOUND_STORAGE_PREFIX + videoPath) !== 'an';
  } catch {
    return true;
  }
}

export function ImgixVideo({videoPath, fallbackImage, className = ''}) {
  const videoRef = useRef(null);
  const hlsUrl = `https://qiblanco-video.imgix.video/${videoPath}?fm=hls`;
  const mp4Url = `https://qiblanco-video.imgix.video/${videoPath}?fm=mp4`;

  // Gemessene Ton-Wahrheit (SSoT app/lib/video-ton.js). Konstant je
  // videoPath, daher kein State und kein Effekt — das Video rendert
  // sofort im richtigen Zustand, der Button flackert nie auf.
  const zeigtTonSteuerung = hatHoerbarenTon(videoPath);

  const [stumm, setStumm] = useState(() => anfangsZustandStumm(videoPath));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari has native HLS support
      video.src = hlsUrl;
    } else {
      // Fallback to mp4
      video.src = mp4Url;
    }
  }, [hlsUrl, mp4Url]);

  // Ton-Zustand ans DOM-Element durchreichen (Property, nicht Attribut —
  // das Attribut bleibt für die Autoplay-Erlaubnis unveraendert `muted`).
  // Ohne Ton-Steuerung bleibt das Video HART stumm: ein Besucher kann aus
  // einer frueheren Sitzung noch ein `an` im sessionStorage für diesen
  // Pfad stehen haben (der Toggle war bis 2026-08-15 auch hier sichtbar) —
  // das darf ein stummes Video nicht entstummen.
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = zeigtTonSteuerung ? stumm : true;
  }, [stumm, zeigtTonSteuerung]);

  function toggleTon() {
    setStumm((vorher) => {
      const nachher = !vorher;
      try {
        window.sessionStorage.setItem(
          SOUND_STORAGE_PREFIX + videoPath,
          nachher ? 'aus' : 'an',
        );
      } catch {
        /* sessionStorage nicht verfuegbar (privat/blockiert) -> nur In-Memory-State */
      }
      // Safety-Net iOS/Safari: das Un-Muten geschieht IM Klick-Handler
      // (= die User-Geste) — falls das Video zwischenzeitlich pausiert
      // wurde, hier direkt weiterspielen lassen.
      const video = videoRef.current;
      if (video && !nachher) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      return nachher;
    });
  }

  return (
    <div className={`${className} ImgixVideo-wrap`}>
      {/* ANKER fuer die Medien-Erfassung (Grossjob 20260903-tracking-
          videowatchtime, s04). Ohne sie leitet der Pixel den Namen aus einer
          blob:-URL bzw. dem poster ab (hls.js haengt die Quelle nachtraeglich
          an, video.src ist dann bedeutungslos) und meldet die Herkunft als
          Notbehelf. `data-video-ton` kommt aus dem GEMESSENEN Manifest
          app/lib/video-ton.js, nicht aus einer Browser-Erkennung: die
          360-Grad-Videos tragen eine AAC-Spur mit digitaler Stille, auf die
          jede Feature-Detection hereinfaellt. Reine Attribute, kein Verhalten,
          keine Ladezeit. */}
      <video
        ref={videoRef}
        data-video={videoPath}
        data-video-familie="imgix"
        data-video-ton={zeigtTonSteuerung ? 'hoerbar' : 'stumm'}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        poster={fallbackImage}
      />
      {zeigtTonSteuerung && (
      <button
        type="button"
        className="ImgixVideo-sound-toggle"
        onClick={toggleTon}
        aria-pressed={!stumm}
        aria-label={stumm ? 'Ton einschalten' : 'Ton ausschalten'}
      >
        {stumm ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="4,9 8,9 12,5 12,19 8,15 4,15" fill="currentColor" stroke="none" />
            <line x1="16" y1="9" x2="22" y2="15" />
            <line x1="22" y1="9" x2="16" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="4,9 8,9 12,5 12,19 8,15 4,15" fill="currentColor" stroke="none" />
            <path d="M16 8a5 5 0 0 1 0 8" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        )}
      </button>
      )}
    </div>
  );
}
