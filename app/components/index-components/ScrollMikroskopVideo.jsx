import { useState, useEffect, useRef } from "react";

export function ScrollMikroskopVideo({dataSection}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const metadataLoadedRef = useRef(false);
  const gesturePrimedRef = useRef(false);
  const handleScrollRef = useRef(null);

  // Pick source by viewport width (unchanged)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 749) {
        setVideoSrc("https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov");
      } else {
        setVideoSrc("https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Reload element when src changes so duration/seekable initialize correctly
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    metadataLoadedRef.current = false;
    video.load(); // important for Safari after src swap
  }, [videoSrc]);

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
              <h2>Gitterchip™</h2>
              <p>Deutlich gesteigerte Zellregeneration, trotz starkem E-Smog Einfluss</p>
            </div>
          </div>
        </div>

        <video
          ref={videoRef}
          src={videoSrc}
          // important attributes for iOS
          playsInline
          muted
          // remove native loop; we loop manually from 3s
          preload="auto"
        />

        <div className="VideoProgressTrackerWrapper">
          <div className="VideoProgressTracker" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
