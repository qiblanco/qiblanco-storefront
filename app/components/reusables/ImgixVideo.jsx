import {useEffect, useRef, useState} from 'react';
import Hls from 'hls.js';

/*
 * ImgixVideo — Sound-Toggle (Job bl-20260803T232952Z-b702ec, 2026-08-03).
 *
 * Browser-Autoplay-Policy erlaubt Video-Autoplay NUR stummgeschaltet, darum
 * bleibt das `muted`-HTML-ATTRIBUT unten hart gesetzt (das ist es, was der
 * Browser VOR jedem JS für die Autoplay-Erlaubnis prueft). Der sichtbare
 * Button togglet danach NUR die `.muted`-DOM-PROPERTY per Klick (= die
 * geforderte User-Geste) — kein Versuch, gegen die Policy anzuautoplayen.
 * Konzept + Abgrenzung: homepage-bauer/SKILL-VIDEO-SOUND-TOGGLE.md.
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
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = stumm;
  }, [stumm]);

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
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        poster={fallbackImage}
      />
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
    </div>
  );
}
