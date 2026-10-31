import {useState, useEffect, useRef} from 'react';
import {NAEHE_RAND, NAEHE_RAND_BISHER, useNaeheLaden} from './useNaeheLaden';

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
 *  - Lazy-Load: die Quelle wird erst angehängt, wenn der Block in die
 *    Nähe kommt (useNaeheLaden, rootMargin 50 % = Oberkante 1,5
 *    Fensterhöhen unter dem oberen Rand) — vorher lädt nichts. Bis
 *    14.10.2026 galt 150 %; das lud mobil auf der Gitterchip-Seite 1,3 MB
 *    beim Seitenaufruf (Video-Standard s02). `laden="bisher"` stellt für
 *    eine einzelne Seite den alten Rand zurück (Schalter je Seite).
 *  - CLS = 0 per Konstruktion: die vh-Hoehe steht unabhaengig vom Ladezustand
 *
 * Apple-Geräte (31.10.2026, Christian: „die hälfte der animaitonen
 * funktioniert weider bei anna meiner frau auf apple produkten nicht“):
 *  - iOS lädt die Daten eines pausierten Videos erst nach `play()` (WebKit
 *    MediaElementSession, RequireUserGestureForLoad). Ein Video, das nur
 *    gescrubbt und nie gespielt wird, bleibt dort SCHWARZ. Deshalb: sobald die
 *    Quelle hängt, ein stummes play() und sofort pause() (stummes Inline-Play
 *    erlaubt iOS ohne Geste); lehnt iOS ab (Stromsparmodus, „Video-Vorschauen
 *    automatisch abspielen“ aus), wiederholt die erste Berührung es.
 *  - `posterDesktop`/`posterMobile` stehen, bis das erste Bild dekodiert ist.
 *  - `endbildDesktop`/`endbildMobile` sind der Rückfall: kann das Gerät das
 *    Video nicht abspielen (error, oder STANDBILD_NACH_MS im Bild ohne
 *    Daten) und bei reduzierter Bewegung steht das Endbild als <img> mit
 *    dem End-Text, nie ein schwarzes Feld (data-ssv-zustand="standbild").
 *  Ohne diese Props verhält sich der Baustein wie bisher.
 *
 * Encoding-Vertrag (homepage-bauer SKILL-SCROLL-ANIMATIONEN.md): Quellen
 * muessen H.264 8-bit yuv420p ALL-INTRA ohne Audio-Track sein — pruefbar via
 * `codemeister scroll-video probe`. Andere Encodings ruckeln beim Scrubbing
 * (GOP-Seeks) oder spielen nicht ueberall (HEVC/10-bit).
 */
const STANDBILD_NACH_MS = 4000;
// Über dem Video, unter den Texten (z-index 1), wie das Video selbst auf
// Fläche geschnitten. Inline, damit der Rückfall keine globale CSS braucht.
const STANDBILD_STIL = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

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
  laden = 'naehe',
  posterDesktop,
  posterMobile,
  endbildDesktop,
  endbildMobile,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState('');
  const [wenigerBewegung, setWenigerBewegung] = useState(false);
  const [mobil, setMobil] = useState(false);
  // 'wartet' bis Daten da sind, 'spielt' sobald ein Bild dekodiert ist,
  // 'standbild' wenn das Gerät das Video nicht abspielen kann.
  const [abspiel, setAbspiel] = useState('wartet');
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

  // Lazy-Gate: erst laden, wenn der Block in die Nähe kommt
  const nahDran = useNaeheLaden(containerRef, {
    rand: laden === 'bisher' ? NAEHE_RAND_BISHER : NAEHE_RAND,
  });

  // Quelle nach Viewport-Breite (Muster ScrollMikroskopVideo)
  useEffect(() => {
    const handleResize = () => {
      const istMobil = window.innerWidth <= breakpointPx;
      setMobil(istMobil);
      setVideoSrc(istMobil ? srcMobile : srcDesktop);
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
      setAbspiel('spielt');
      window.requestAnimationFrame(() => {
        handleScrollRef.current?.();
      });
    };

    // Kein abspielbares Format, Netzfehler, Datei fehlt: Endbild statt Schwarz.
    const onError = () => setAbspiel('standbild');

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
    };
  }, []);

  // Nach src-Wechsel neu laden, damit duration/seekable initialisieren (Safari)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || !nahDran) return;
    metadataLoadedRef.current = false;
    video.load();
    // iOS lädt erst nach play(): stumm anspielen und sofort anhalten. Lehnt
    // das Gerät ab, übernimmt die erste Berührung (Gesten-Prime unten).
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        gesturePrimedRef.current = true;
        video.pause();
        handleScrollRef.current?.();
      }).catch(() => {/* iOS ohne Geste: Prime bei der ersten Berührung */});
    }
  }, [videoSrc, nahDran]);

  // Rückfall: steht der Block im Bild und hat das Gerät nach
  // STANDBILD_NACH_MS noch kein Bild dekodiert, bleibt das Endbild stehen.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !nahDran || abspiel !== 'wartet' || !(endbildDesktop || endbildMobile)) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') return undefined;
    let uhr = null;
    const io = new IntersectionObserver((eintraege) => {
      if (eintraege.some((e) => e.isIntersecting)) {
        if (!uhr) {
          uhr = window.setTimeout(() => {
            const v = videoRef.current;
            if (!v || v.readyState < 2) setAbspiel('standbild');
          }, STANDBILD_NACH_MS);
        }
      }
    });
    io.observe(container);
    return () => {
      io.disconnect();
      if (uhr) window.clearTimeout(uhr);
    };
  }, [nahDran, abspiel, endbildDesktop, endbildMobile]);

  // Einmaliger Gesten-Prime fuer strengere Safari-Builds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS zählt ein touchend am Ende eines Wischs nicht als Geste; ein Tipp
    // (click/pointerup) schon. Deshalb alle drei, bis einer trägt.
    const GESTEN = ['touchend', 'pointerup', 'click'];
    const primeOnTouch = () => {
      if (gesturePrimedRef.current) return;
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          gesturePrimedRef.current = true;
          video.pause();
          handleScrollRef.current?.();
          GESTEN.forEach((g) => window.removeEventListener(g, primeOnTouch));
        }).catch(() => {/* nächste Geste versucht es erneut */});
      } else {
        try { video.play(); video.pause(); gesturePrimedRef.current = true; } catch { /* aeltere Browser */ }
      }
    };

    GESTEN.forEach((g) => window.addEventListener(g, primeOnTouch, {passive: true}));
    return () => GESTEN.forEach((g) => window.removeEventListener(g, primeOnTouch));
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
  const poster = (mobil ? posterMobile : posterDesktop) || undefined;
  const endbild = (mobil ? endbildMobile : endbildDesktop) || '';
  const standbild = Boolean(endbild) && (abspiel === 'standbild' || wenigerBewegung);
  // Im Standbild gilt die Strecke wie bei reduzierter Bewegung: ein Bildschirm,
  // End-Text sichtbar, keine Scroll-Aufforderung ins Leere.
  const kurz = wenigerBewegung || standbild;

  return (
    <div className="ScrollScrubVideoBlock" data-section={dataSection}>
      <div
        ref={containerRef}
        className="ScrollScrubVideo"
        data-ssv-zustand={standbild ? 'standbild' : abspiel}
        style={{
          '--ssv-hoehe-desktop': kurz ? '100vh' : `${heightVhDesktop}vh`,
          '--ssv-hoehe-mobil': kurz ? '100vh' : `${heightVhMobile}vh`,
        }}
      >
        <div className="VideoOverlay">
          {overlayStart && (
            <div className="TextContent-Start" style={{opacity: !standbild && progress < 25 ? 1 : 0}}>
              <h2>{overlayStart.titel}</h2>
              {overlayStart.text && <p>{overlayStart.text}</p>}
            </div>
          )}

          {Array.isArray(overlayEnd) && overlayEnd.length > 0 && (
            <div className="TextContent-End" style={{opacity: standbild || progress > 30 ? 1 : 0}}>
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
            poster={poster}
            preload={anhaengen ? 'auto' : 'none'}
          />

          {standbild ? (
            <img
              className="ScrollScrubVideo-standbild"
              src={endbild}
              alt=""
              decoding="async"
              style={STANDBILD_STIL}
            />
          ) : null}

          <div className="VideoProgressTrackerWrapper">
            <div className="VideoProgressTracker" style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>
      {fussnote && <p className="ScrollScrubVideo-fussnote">{fussnote}</p>}
    </div>
  );
}
