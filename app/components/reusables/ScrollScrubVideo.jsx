import {useState, useEffect, useRef} from 'react';

/*
 * ScrollScrubVideo — generalisierte Scroll-Down-Animation (Scroll-Scrub).
 *
 * Mechanik = ScrollMikroskopVideo (Bestand, bleibt unangetastet): ein langer
 * Container (Hoehe via CSS-Variablen) mit sticky 100vh-Overlay; waehrend der
 * Container den Viewport schneidet, wird video.currentTime aus dem
 * Scroll-Fortschritt gesetzt. Kein Autoplay, der Nutzer behaelt die
 * Scroll-Kontrolle.
 *
 * Neu gegenueber dem Bestand:
 *  - Quellen/Overlay-Texte/Hoehen als Props (wiederverwendbar je Seite)
 *  - Lazy-Load: die Quelle wird erst angehaengt, wenn der Block ~1,5
 *    Viewports entfernt ist (IntersectionObserver) — vorher laedt nichts
 *  - CLS = 0 per Konstruktion: die vh-Hoehe steht unabhaengig vom Ladezustand
 *
 * Encoding-Vertrag (homepage-bauer SKILL-SCROLL-ANIMATIONEN.md): Quellen
 * muessen H.264 8-bit yuv420p ALL-INTRA ohne Audio-Track sein — pruefbar via
 * `codemeister scroll-video probe`. Andere Encodings ruckeln beim Scrubbing
 * (GOP-Seeks) oder spielen nicht ueberall (HEVC/10-bit).
 */
export function ScrollScrubVideo({
  srcDesktop,
  srcMobile,
  breakpointPx = 749,
  heightVhDesktop = 500,
  heightVhMobile = 400,
  overlayStart = null,
  overlayEnd = null,
  fussnote = null,
  dataSection,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState('');
  const [nahDran, setNahDran] = useState(false);
  const [wenigerBewegung, setWenigerBewegung] = useState(false);
  const metadataLoadedRef = useRef(false);
  // Der Scroll-Handler wird EINMAL registriert; ein Ref trägt die aktuelle
  // Präferenz hinein, ohne den Listener neu aufzuhaengen.
  const wenigerBewegungRef = useRef(false);
  const gesturePrimedRef = useRef(false);
  const handleScrollRef = useRef(null);

  /*
   * prefers-reduced-motion — die Einstellung gehört in den EFFEKT, nicht in
   * die Attributwahl (design-meister, Lernkarte
   * hero-bewegtbild-statt-standbild-poster-und-scope-20260919): ein Server
   * weiss nicht, was am Gerät eingestellt ist. Der Startwert ist deshalb
   * `false` und wird erst NACH der Hydration korrigiert — SSR-HTML, no-JS und
   * Bots sehen unverändert den vollstaendigen Block, die Degradation heißt
   * also weiterhin „Inhalt sichtbar".
   * Wirkung bei `reduce`: der Scroll-Scrub entfällt, die vh-Strecke schrumpft
   * auf EINEN Bildschirm und das Video steht auf seinem letzten Bild still.
   * Bewusst das LETZTE und nicht das erste: der Block erzählt einen Vorgang,
   * und sein Ergebnis ist die Aussage („Kohärente Ordnung"). Der Start-Text
   * ist eine Scroll-Aufforderung und wäre ohne Scrubbing eine Anweisung ins
   * Leere — er blendet über dieselbe Opazitäts-Regel aus, die auch beim
   * Scrollen greift, es entsteht kein zweiter Mechanismus.
   * Die Präferenz wird MITGEHÖRT (addEventListener), nicht einmalig gelesen:
   * wer sie während des Besuchs umstellt, bekommt sofort das Passende.
   */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const anwenden = () => setWenigerBewegung(mq.matches);
    anwenden();
    // Safari <14 kennt addEventListener auf MediaQueryList nicht.
    if (mq.addEventListener) {
      mq.addEventListener('change', anwenden);
      return () => mq.removeEventListener('change', anwenden);
    }
    mq.addListener(anwenden);
    return () => mq.removeListener(anwenden);
  }, []);

  // Lazy-Gate: erst laden, wenn der Block ~1,5 Viewports entfernt ist
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNahDran(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNahDran(true);
          io.disconnect();
        }
      },
      {rootMargin: '150% 0px 150% 0px'},
    );
    io.observe(container);
    return () => io.disconnect();
  }, []);

  // Quelle nach Viewport-Breite (Muster ScrollMikroskopVideo)
  useEffect(() => {
    const handleResize = () => {
      setVideoSrc(window.innerWidth <= breakpointPx ? srcMobile : srcDesktop);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpointPx, srcDesktop, srcMobile]);

  // iOS-Safari-Haerten + Metadata-Listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;
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

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
    };
  }, []);

  // Nach src-Wechsel neu laden, damit duration/seekable initialisieren (Safari)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || !nahDran) return;
    metadataLoadedRef.current = false;
    video.load();
  }, [videoSrc, nahDran]);

  // Einmaliger Gesten-Prime fuer strengere Safari-Builds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const primeOnTouch = () => {
      if (gesturePrimedRef.current) return;
      gesturePrimedRef.current = true;
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.then(() => video.pause()).catch(() => {/* ignore */});
      } else {
        try { video.play(); video.pause(); } catch { /* aeltere Browser */ }
      }
    };

    window.addEventListener('touchend', primeOnTouch, {once: true, passive: true});
    return () => window.removeEventListener('touchend', primeOnTouch);
  }, []);

  // Scroll-Scrub, solange der lange sticky Container den Viewport schneidet
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleScroll = () => {
      /*
       * Standbild-Zweig: kein Scrubbing, ein fester Frame.
       * Er steht VOR der Metadata-Wache, und das ist der ganze Punkt — gemessen
       * 2026-09-19 an genau diesem Bau: stand er dahinter, kehrte der Handler
       * bei noch nicht angehängter Quelle vorher um, `progress` blieb 0, und
       * der Block zeigte die Start-Einblendung „Scrolle: …" über einem Video,
       * das nie scrubben wird. Sichtbar wurde das NUR mobil (390x844), weil das
       * Lazy-Gate die Quelle dort nicht anhängt — auf dem Desktop war
       * derselbe Fehler gruen. Die Text-Umblendung braucht die Metadaten nicht,
       * nur das Setzen von `currentTime` braucht sie.
       */
      if (wenigerBewegungRef.current) {
        setProgress(100);
        if (
          metadataLoadedRef.current &&
          Number.isFinite(video.duration) &&
          video.duration > 0
        ) {
          const endTime = Math.max(video.duration - 0.05, 0);
          if (Math.abs(video.currentTime - endTime) > 0.03) {
            try { video.currentTime = endTime; } catch { /* Safari vor Datenempfang */ }
          }
        }
        if (!video.paused) video.pause();
        return;
      }

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

          if (Math.abs(video.currentTime - targetTime) > 0.03) {
            try { video.currentTime = targetTime; } catch { /* Safari vor Datenempfang */ }
          }
        }

        if (!video.paused) video.pause();
      }
    };

    handleScrollRef.current = handleScroll;
    handleScroll();

    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll, {passive: true});

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      handleScrollRef.current = null;
    };
  }, []);

  wenigerBewegungRef.current = wenigerBewegung;

  // Die Präferenz kann sich mitten im Besuch aendern. Der Scroll-Handler
  // hängt bewusst an [] und würde dann bis zur nächsten Scroll-Bewegung das
  // Alte zeigen -- also einmal anstoßen. Ohne das bleibt das Video bei einem
  // Wechsel auf `reduce` auf dem Frame stehen, auf dem es gerade war.
  useEffect(() => {
    handleScrollRef.current?.();
  }, [wenigerBewegung]);

  const anhaengen = Boolean(nahDran && videoSrc);

  return (
    <div className="ScrollScrubVideoBlock" data-section={dataSection}>
      <div
        ref={containerRef}
        className="ScrollScrubVideo"
        style={{
          '--ssv-hoehe-desktop': wenigerBewegung ? '100vh' : `${heightVhDesktop}vh`,
          '--ssv-hoehe-mobil': wenigerBewegung ? '100vh' : `${heightVhMobile}vh`,
        }}
      >
        <div className="VideoOverlay">
          {overlayStart && (
            <div className="TextContent-Start" style={{opacity: progress < 25 ? 1 : 0}}>
              <h2>{overlayStart.titel}</h2>
              {overlayStart.text && <p>{overlayStart.text}</p>}
            </div>
          )}

          {Array.isArray(overlayEnd) && overlayEnd.length > 0 && (
            <div className="TextContent-End" style={{opacity: progress > 30 ? 1 : 0}}>
              {overlayEnd.map((eintrag) => (
                <div key={eintrag.titel}>
                  <div className="content">
                    <h2>{eintrag.titel}</h2>
                    {eintrag.text && <p>{eintrag.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <video
            ref={videoRef}
            src={anhaengen ? videoSrc : undefined}
            playsInline
            muted
            preload={anhaengen ? 'auto' : 'none'}
          />

          <div className="VideoProgressTrackerWrapper">
            <div className="VideoProgressTracker" style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>
      {fussnote && <p className="ScrollScrubVideo-fussnote">{fussnote}</p>}
    </div>
  );
}
