import {useEffect, useRef, useState} from 'react';
import {StarRating} from '~/components/reusables/StarRating';
import {useGoogleRating, useGoogleReviews} from '~/lib/googleRating';
import {useDragSwipe} from '~/components/reusables/useDragSwipe';

/**
 * ReputonWidget — Google-Rezensions-Carousel + Gesamtbewertungs-Badge.
 *
 * Seit 2026-07-31 (Repair-Job „gecachte Bewertungszahl veraltet"): rendert
 * die NEUESTEN 5-Sterne-Google-Rezensionen aus dem server-gecachten
 * root-Loader (useGoogleReviews, Reputon-Feed, 6-h-Refresh) statt des
 * Reputon-Drittscripts.
 *
 * Repair 2026-08-01 (Christian, vier Regressionen nach dem Update):
 *  (1) Die KI-/AI-Zusammenfassung von Google (business.summary aus dem Feed)
 *      steht wieder ganz oben — als erstes Element im Widget.
 *  (2) Das Carousel ist wieder mit der Maus greif- und ziehbar (Klick-Halten-
 *      Ziehen) und auf Touch nativ wischbar — via gemeinsamem useDragSwipe-
 *      Hook (Baustandard GL-DES-0012, mode 'scroll').
 *  (3) Unter jeder Rezension klappt „weiterlesen" den vollständigen Text
 *      INLINE im Widget auf (statt des externen „Auf Google lesen"-Links);
 *      alle Bewertungen bleiben zusätzlich über das Profil (Badge) erreichbar.
 *  (4) Der Badge-/Profil-Link öffnet Google nach HÖCHSTER Bewertung sortiert
 *      (sortby=ratingHigh in googleRating.js / StarRating.js).
 *
 * Der RAHMEN bleibt (Christian): nur 5-Sterne-Rezensionen im Carousel,
 * alle Bewertungen per Klick über das vollständige Google-Profil (Badge).
 * Komponentenname + Call-Sites (16 Seiten) bleiben unverändert.
 */
export function ReputonWidget() {
  const {reviews, aiSummary} = useGoogleReviews();
  return (
    <>
      <ReviewsSlider
        reviews={reviews}
        aiSummary={aiSummary}
        label="Neueste Google-Rezensionen von Qi Blanco"
      />
      <GoogleRatingBadge />
    </>
  );
}

/**
 * relativeVonDatum — rendert eine ISO-Datumsangabe (kuratierte Karten) LIVE
 * als deutsche Relativzeit („vor 3 Monaten"), self-updating (nie eingefroren).
 */
function relativeVonDatum(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const tage = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (tage < 7) return tage <= 1 ? 'vor 1 Tag' : `vor ${tage} Tagen`;
  if (tage < 30) {
    const w = Math.round(tage / 7);
    return w <= 1 ? 'vor 1 Woche' : `vor ${w} Wochen`;
  }
  if (tage < 365) {
    const m = Math.max(1, Math.round(tage / 30));
    return m === 1 ? 'vor 1 Monat' : `vor ${m} Monaten`;
  }
  const j = Math.max(1, Math.floor(tage / 365));
  return j === 1 ? 'vor 1 Jahr' : `vor ${j} Jahren`;
}

const AUTOSCROLL_MS = 4000; // Takt pro Karte (Christian: 3–4 s; ruhiger 4 s,
// gibt Lesezeit — WCAG: >5 s bewegte Inhalte brauchen Pause, hier zusätzlich
// Pause bei Hover/Drag)
const START_VERZOEGERUNG_MS = 3000; // erst 3 s nach Sichtbarkeit loslaufen,
// damit die AI-Zusammenfassung (erste Karte) in Ruhe gelesen werden kann
const SICHTBAR_SCHWELLE = 0.4; // Widget gilt ab 40 % im Viewport als „angekommen"
const KARTEN_LUECKE_PX = 20;
const CLAMP_ZEILEN = 6; // eingeklappte Höhe (wie zuvor)

// Responsive-Repair 2026-08-04 (Job bl-20260804T022554Z-a0de0e, Christian:
// „beim Lesen springt die Bewertung weg" — MOBIL).
// Die bisherige Pause hing allein an hoverRef (onPointerEnter/Leave) und
// dragRef (isDragging aus useDragSwipe). BEIDE sind auf Touch baulich
// wirkungslos:
//   • useDragSwipe.js:145 steigt im mode 'scroll' fuer jeden pointerType
//     ausser 'mouse' sofort aus (Touch scrollt nativ) -> isDragging bleibt
//     auf dem Handy IMMER false.
//   • pointerleave feuert auf Touch bereits beim Finger-Heben -> hoverRef
//     ist Sekundenbruchteile nach dem Wisch wieder false.
// Gemessen (vorher_live.json): Autoscroll laeuft nach echter Touch-Geste
// weiter @360/390/414/768, nur @1440 (Maus) stand er still.
// Deshalb zusaetzlich ein geraete-unabhaengiger Interaktions-Riegel:
// jede echte Nutzer-Geste setzt einen Zeitstempel, und der Takt ruht, bis
// WIEDERAUFNAHME_MS lang KEINE Geste mehr kam.
// WIEDERAUFNAHME — bewusst NICHT ueber einen Timer:
// Ein Zeit-Timeout („nach X s wieder loslaufen") stellt genau Christians
// Beschwerde wieder her, denn Lesen erzeugt keine Events — nach Ablauf
// springt die Karte mitten im Satz weg. Gemessen: mit 8-s-Timer war W2 auf
// 360/390/414/768 px weiterhin rot. Der Auftrag nennt die Wiederaufnahme
// ausdruecklich nur als „idealerweise"; verbindlich ist „geht aus".
// Deshalb: der Takt ruht, sobald der Nutzer die Steuerung uebernimmt, und
// wird erst wieder freigegeben, wenn der Slider den Viewport VERLASSEN hat
// (echte Inaktivitaet am Widget) — dann startet er beim naechsten
// „Ankommen" erneut mit der ueblichen Lese-Verzoegerung.
// Ein programmatischer scrollTo({behavior:'smooth'}) loest selbst scroll-
// Events aus. Innerhalb dieses Fensters gelten sie NICHT als Nutzer-Geste,
// sonst wuerde der Autoscroll sich mit dem ersten Schritt selbst abschalten.
const PROGRAMMATISCH_FENSTER_MS = 1500;

/**
 * Fix (1): AI-Zusammenfassung von Google — die von Google mit KI aus den
 * Rezensionen destillierten Kernthemen (business.summary.items im Reputon-
 * Feed, server-gecacht). Wird — wie zuvor — als eigene „Bewertungs"-Karte
 * IM Carousel gerendert und als ERSTE Karte in den Track gesetzt (gleicher
 * Kartenstil wie die Rezensions-Karten). Fehlt sie im Feed, greift der
 * statische Fallback aus googleReviewsFallback.js.
 */
function AiSummaryKarte({aiSummary}) {
  if (!Array.isArray(aiSummary) || aiSummary.length === 0) return null;

  return (
    <div
      className="snap-start flex-shrink-0 w-[85vw] sm:w-[340px] p-4! bg-[#f3f6f9] rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
      style={{minHeight: 220}}
      aria-label="Mit KI zusammengefasste Google-Rezensionen von Qi Blanco"
    >
      {/* Kopfzeile im Karten-Stil: Titel links, Google-Logo rechts */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SparkleIcon />
          <span className="text-sm font-medium text-gray-700 truncate">
            Zusammenfassung von Google
          </span>
        </div>
        <GoogleIcon />
      </div>
      <ul className="flex flex-col gap-1.5 m-0! p-0! list-none">
        {aiSummary.map((thema) => (
          <li
            key={thema}
            className="flex items-start gap-2 text-sm! text-gray-700 leading-relaxed"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4285f4] flex-shrink-0"
            />
            <span>{thema}</span>
          </li>
        ))}
      </ul>
      <span className="text-xs text-gray-400 mt-auto">Mit KI zusammengefasst</span>
    </div>
  );
}

/**
 * ReviewsSlider — der EINE geteilte Rezensions-Slider (Design + Verhalten).
 * Wird von BEIDEN Widgets genutzt: dem oberen „Beeindruckende Kundenerfahrungen"
 * (12 kuratierte Karten, ohne AI-Summary) und dem unteren „Alle Google
 * Bewertungen" (Live-Feed + AI-Summary als erste Karte). Gleiches Kartendesign,
 * gleiches Drag-/Autoscroll-/„weiterlesen"-Verhalten — kein zweites Layout.
 * @param {{reviews:Array, aiSummary?:Array, label?:string}} props
 */
export function ReviewsSlider({reviews, aiSummary, label = 'Google-Rezensionen von Qi Blanco'}) {
  const trackRef = useRef(null);
  const hoverRef = useRef(false);
  const dragRef = useRef(false);

  // Fix (2): Maus-Drag (Klick-Halten-Ziehen) + Touch-Swipe über den
  // gemeinsamen Slider-Hook. mode 'scroll' steuert genau so einen
  // overflow-x-Container: Maus setzt scrollLeft, Touch scrollt nativ.
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});

  useEffect(() => {
    dragRef.current = isDragging;
  }, [isDragging]);

  // Sanfter Autoscroll: pro Karte (4 s) eine weiter, am Ende zurück zum
  // Anfang; pausiert bei Hover/Drag und respektiert prefers-reduced-motion.
  // NEU (Christian): NICHT sofort loslaufen — erst wenn das Widget wirklich
  // im Viewport sichtbar ist (IntersectionObserver) UND dann noch 3 s
  // warten, damit die AI-Zusammenfassung (erste Karte) in Ruhe gelesen
  // werden kann. Verlässt das Widget den Viewport vor Ablauf, wird der
  // Start-Timer zurückgesetzt (nur bei echtem „Ankommen" starten).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    let gestartet = false;
    let startTimer = 0;
    let intervall = 0;
    let uebernommen = false; // Nutzer hat die Steuerung uebernommen
    let programmatischBis = 0;

    const stoppeTakt = () => {
      if (intervall) {
        window.clearInterval(intervall);
        intervall = 0;
      }
      if (startTimer) {
        window.clearTimeout(startTimer);
        startTimer = 0;
      }
      gestartet = false;
    };

    const merkeInteraktion = () => {
      if (uebernommen) return;
      uebernommen = true;
      stoppeTakt();
    };

    // Eigener Scroll-Zaehler: auf Touch ist das native Wischen die einzige
    // Spur der Nutzer-Geste (kein isDragging, kein bleibendes Hover).
    const onTrackScroll = () => {
      if (Date.now() < programmatischBis) return; // eigener smooth-Scroll
      merkeInteraktion();
    };

    const einenSchritt = () => {
      if (hoverRef.current || dragRef.current || !track.isConnected) return;
      if (uebernommen) return; // Nutzer liest gerade — nicht wegspringen
      const karte = track.firstElementChild;
      if (!karte) return;
      const schritt = karte.getBoundingClientRect().width + KARTEN_LUECKE_PX;
      const amEnde =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      programmatischBis = Date.now() + PROGRAMMATISCH_FENSTER_MS;
      track.scrollTo({
        left: amEnde ? 0 : track.scrollLeft + schritt,
        behavior: 'smooth',
      });
    };

    // Passive Listener: sie duerfen das native Wischen/Ziehen NICHT
    // beeinflussen (Baustandard GL-DES-0012 drag+swipe bleibt unberuehrt).
    const gesten = ['pointerdown', 'touchstart', 'dragstart', 'wheel', 'keydown'];
    for (const typ of gesten) {
      track.addEventListener(typ, merkeInteraktion, {passive: true});
    }
    track.addEventListener('scroll', onTrackScroll, {passive: true});

    const starteAutoscroll = () => {
      if (gestartet) return;
      gestartet = true;
      intervall = window.setInterval(einenSchritt, AUTOSCROLL_MS);
    };

    // Ohne IntersectionObserver (sehr alte Browser): konservativ sofort mit
    // der Lese-Verzögerung starten statt gar nicht.
    const loeseListenerAb = () => {
      for (const typ of gesten) track.removeEventListener(typ, merkeInteraktion);
      track.removeEventListener('scroll', onTrackScroll);
    };

    if (typeof IntersectionObserver === 'undefined') {
      startTimer = window.setTimeout(starteAutoscroll, START_VERZOEGERUNG_MS);
      return () => {
        loeseListenerAb();
        if (startTimer) window.clearTimeout(startTimer);
        if (intervall) window.clearInterval(intervall);
      };
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        const sichtbar = eintraege.some((e) => e.isIntersecting);
        if (sichtbar) {
          if (!uebernommen && !gestartet && !startTimer) {
            startTimer = window.setTimeout(() => {
              startTimer = 0;
              starteAutoscroll();
            }, START_VERZOEGERUNG_MS);
          }
        } else {
          // Widget ist aus dem Blick — das ist die einzige Inaktivität, die
          // sich sicher messen lässt: der Nutzer liest hier nicht mehr.
          // Riegel lösen, damit der Takt beim nächsten „Ankommen" wieder
          // starten darf (Wiederaufnahme ohne Weg-Springen beim Lesen).
          uebernommen = false;
          if (startTimer) {
            // Vor Ablauf wieder aus dem Blick → Start-Timer zurücksetzen
            window.clearTimeout(startTimer);
            startTimer = 0;
          }
        }
      },
      {threshold: SICHTBAR_SCHWELLE},
    );
    beobachter.observe(track);

    return () => {
      beobachter.disconnect();
      loeseListenerAb();
      if (startTimer) window.clearTimeout(startTimer);
      if (intervall) window.clearInterval(intervall);
    };
  }, [reviews.length]);

  if (!reviews.length) return null;

  return (
    <div
      ref={trackRef}
      {...handlers}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      className={`flex items-start overflow-x-auto pb-4 snap-x snap-mandatory select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{gap: KARTEN_LUECKE_PX, scrollbarWidth: 'thin'}}
      role="region"
      aria-label={label}
    >
      <AiSummaryKarte aiSummary={aiSummary} />
      {reviews.map((review) => (
        <ReviewKarte key={review.id || review.name} review={review} />
      ))}
    </div>
  );
}

function ReviewKarte({review}) {
  const [offen, setOffen] = useState(false);
  const [ueberlaeuft, setUeberlaeuft] = useState(false);
  const textRef = useRef(null);
  const text = review.text || '';
  // Live-Feed-Karten liefern zeitText („vor 3 Tagen"); kuratierte Karten
  // liefern ein ISO-datum, das hier LIVE zur Relativzeit gerendert wird.
  const datum = review.zeitText || relativeVonDatum(review.datum);

  // „weiterlesen" nur zeigen, wenn der geklammerte Text WIRKLICH überläuft
  // (im eingeklappten Zustand gemessen — robust gegen Kartenbreite/Zeilenhöhe,
  // statt einer Zeichenschwelle, die auf schmalen Karten daneben liegt).
  useEffect(() => {
    const messen = () => {
      const el = textRef.current;
      if (!el || offen) return;
      setUeberlaeuft(el.scrollHeight > el.clientHeight + 4);
    };
    messen();
    window.addEventListener('resize', messen);
    return () => window.removeEventListener('resize', messen);
  }, [text, offen]);

  return (
    <div
      className="snap-start flex-shrink-0 w-[85vw] sm:w-[340px] p-4! bg-[#f3f6f9] rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
      style={{minHeight: 220}}
    >
      {/* Kopfzeile: Avatar + Name + Zeit, Google-Logo rechts */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {review.foto ? (
            <img
              src={review.foto}
              alt=""
              width="36"
              height="36"
              loading="lazy"
              referrerPolicy="no-referrer"
              draggable="false"
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-[#4285f4] flex items-center justify-center text-white font-medium text-sm">
              {(review.name || 'G').charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{review.name}</div>
            {datum ? (
              <div className="text-xs text-gray-500">{datum}</div>
            ) : null}
          </div>
        </div>
        <GoogleIcon />
      </div>

      {/* Sterne + Verifiziert-Haken */}
      <div className="flex items-center gap-1.5">
        <StarRating value={review.rating} size={16} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" aria-hidden="true">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </div>

      {/* Fix (3): Review-Text — eingeklappt geklammert, „weiterlesen" klappt
          den GANZEN Text inline auf (kein externer Google-Link mehr). */}
      <p
        ref={textRef}
        className="text-sm! text-gray-700 leading-relaxed whitespace-pre-line"
        style={
          offen
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: CLAMP_ZEILEN,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {text}
      </p>
      {ueberlaeuft || offen ? (
        <button
          type="button"
          className="self-start text-xs font-medium text-[#1a73e8] hover:underline mt-auto bg-transparent border-0 p-0! cursor-pointer"
          aria-expanded={offen}
          onClick={(event) => {
            event.stopPropagation();
            setOffen((v) => !v);
          }}
        >
          {offen ? 'weniger anzeigen' : 'weiterlesen'}
        </button>
      ) : null}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#4285f4"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zM19 14l.95 2.55L22.5 17.5l-2.55.95L19 21l-.95-2.55L15.5 17.5l2.55-.95L19 14z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GoogleRatingBadge() {
  const g = useGoogleRating();
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noopener noreferrer"
      className="google-rating-badge"
      aria-label={`${g.komma} von 5 Sternen aus ${g.total} Google-Rezensionen von Qi Blanco ansehen`}
    >
      <img
        className="google-rating-badge__logo"
        src="https://lh3.googleusercontent.com/a-/ALV-UjXLeredYrnnfrvaFQ0ffKGgx-Ardf6CLqWTy4t4Tt7pn50g4MI"
        alt="Qi Blanco"
        width="48"
        height="48"
      />
      <div className="google-rating-badge__content">
        <div className="google-rating-badge__score">
          <span className="google-rating-badge__number">{g.komma}</span>
          <span className="google-rating-badge__stars">
            <StarRating value={g.value} size={20} />
          </span>
        </div>
        <div className="google-rating-badge__powered">
          {g.total} Bewertungen · <strong>Google</strong>
        </div>
      </div>
    </a>
  );
}
