import { useState, useEffect, useRef } from "react";
import { useNaeheLaden } from "../reusables/useNaeheLaden";

const QUELLE_DESKTOP = "https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov";
const QUELLE_MOBIL = "https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov";
// Vorschaubild = Bild 0 der jeweiligen Datei, von Shopify beim Hochladen erzeugt
// (Admin-API Video.preview, 1920x1080 bzw. 1080x1920; als WebP 19 bzw. 24 kB).
const POSTER_DESKTOP =
  "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/preview_images/940d16da99a2452d9aadd57b9711b037.thumbnail.0000000000.jpg?v=1747048923";
const POSTER_MOBIL =
  "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/preview_images/d9d52d90d536415bbb6342ebadb2fe97.thumbnail.0000000000.jpg?v=1744579045";

/*
 * laden (Schalter je Seite, Video-Standard s02, 14.10.2026):
 *   "naehe"  (Standard) die Quelle hängt erst an, wenn der Block in die Nähe
 *            kommt (useNaeheLaden); bis dahin zeigt der Kasten Bild 0 als
 *            Vorschaubild statt des dunklen Grundes. Vorher luden die fünf
 *            Seiten, auf denen der Block tief steht, beim Aufruf 13,9-15,7 MB
 *            (Desktop) bzw. 1,5-2,5 MB (Mobil), auch wenn niemand bis hierher
 *            scrollte (videostandard, 14.10.2026 07:01Z).
 *   "bisher" exakt das Verhalten bis 14.10. (Quelle sofort, preload auto, kein
 *            Vorschaubild, SSR bytegleich) -- Rückweg für eine einzelne Seite.
 */
export function ScrollMikroskopVideo({dataSection, laden = "naehe"}) {
  const bisher = laden === "bisher";
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const [poster, setPoster] = useState(undefined);
  const nahDran = useNaeheLaden(containerRef, {sofort: bisher});
  const metadataLoadedRef = useRef(false);
  const gesturePrimedRef = useRef(false);
  const handleScrollRef = useRef(null);

  // Pick source (and its first frame as poster) by viewport width
  useEffect(() => {
    const handleResize = () => {
      const mobil = window.innerWidth <= 749;
      setVideoSrc(mobil ? QUELLE_MOBIL : QUELLE_DESKTOP);
      if (!bisher) setPoster(mobil ? POSTER_MOBIL : POSTER_DESKTOP);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bisher]);

  // Make the <video> iOS-friendly and listen for metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Hard-set attributes for iOS Safari
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.muted = true; // programmatic guarantee
    video.playsInline = true;

    const onLoadedMetadata = () => {
      metadataLoadedRef.current = true;
      window.requestAnimationFrame(() => {
        handleScrollRef.current?.();
      });
    };

    const onLoadedData = () => {
      window.requestAnimationFrame(() => {
        handleScrollRef.current?.();
      });
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onLoadedData);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, []);

  // Reload element when src changes (or is attached near the viewport) so
  // duration/seekable initialize correctly
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || !nahDran) return;
    metadataLoadedRef.current = false;
    video.load(); // important for Safari after src swap
  }, [videoSrc, nahDran]);

  // One-time user-gesture prime for stricter Safari builds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const primeOnTouch = () => {
      if (gesturePrimedRef.current) return;
      gesturePrimedRef.current = true;
      // Attempt a brief play/pause to unlock autoplay policy
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.then(() => video.pause()).catch(() => {/* ignore */});
      } else {
        // Older browsers
        try { video.play(); video.pause(); } catch { /* Older browsers can reject play/pause priming. */ }
      }
    };

    window.addEventListener("touchend", primeOnTouch, { once: true, passive: true });
    return () => window.removeEventListener("touchend", primeOnTouch);
  }, []);

  // Scroll-scrub the video while the long sticky container intersects the viewport.
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleScroll = () => {
      if (!metadataLoadedRef.current) return;

      const rect = container.getBoundingClientRect();

      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const scrollTop = window.scrollY;
        const start = container.offsetTop;
        const end = Math.max(start + container.offsetHeight - window.innerHeight, start + 1);

        const rawProgress = Math.min(Math.max((scrollTop - start) / (end - start), 0), 1);
        setProgress(rawProgress * 100);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          const maxTime = Math.max(video.duration - 0.05, 0);
          const targetTime = Math.min(video.duration * rawProgress, maxTime);

          // Avoid thrashing if value already close
          if (Math.abs(video.currentTime - targetTime) > 0.03) {
            try { video.currentTime = targetTime; } catch { /* Safari might ignore until more data */ }
          }
        }

        if (!video.paused) video.pause();
      }
    };

    handleScrollRef.current = handleScroll;
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      handleScrollRef.current = null;
    };
  }, []);

  const anhaengen = Boolean(nahDran && videoSrc);

  return (
    <div ref={containerRef} className="ScrollMikroskopvideo" data-section={dataSection}>
      <div className="VideoOverlay">
        <div className="TextContent-Start" style={{ opacity: progress < 25 ? 1 : 0 }}>
          <h2>Zellbiologisch geprüft</h2>
          <p>Entdecke die Effekte auf Zellebene.</p>
        </div>

        <div className="TextContent-End" style={{ opacity: progress > 30 ? 1 : 0 }}>
          <div><div className="content"><h2>Ohne Schutz</h2></div></div>
          <div>
            <div className="content">
              <h2>Gitterchip<sup>®</sup></h2>
              <p>Deutlich gesteigerte Zellregeneration, trotz starkem E-Smog Einfluss</p>
            </div>
          </div>
        </div>

        <video
          ref={videoRef}
          src={bisher ? videoSrc : anhaengen ? videoSrc : undefined}
          poster={bisher ? undefined : poster}
          // important attributes for iOS
          playsInline
          muted
          // remove native loop; we loop manually from 3s
          preload={bisher || anhaengen ? "auto" : "none"}
        />

        <div className="VideoProgressTrackerWrapper">
          <div className="VideoProgressTracker" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
