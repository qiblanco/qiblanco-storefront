import {useEffect, useRef} from 'react';
import {StarRating} from '~/components/reusables/StarRating';
import {useGoogleRating, useGoogleReviews} from '~/lib/googleRating';

/**
 * ReputonWidget — Google-Rezensions-Carousel + Gesamtbewertungs-Badge.
 *
 * Seit 2026-07-31 (Repair-Job „gecachte Bewertungszahl veraltet"): rendert
 * die NEUESTEN 5-Sterne-Google-Rezensionen aus dem server-gecachten
 * root-Loader (useGoogleReviews, Reputon-Feed, 6-h-Refresh) statt des
 * Reputon-Drittscripts (406 KB widget.js, Live-Fetch bei jedem Seitenladen,
 * Googles „bedeutendste"-Relevanzordnung statt neueste zuerst).
 * Der RAHMEN bleibt (Christian): nur 5-Sterne-Rezensionen im Carousel,
 * alle Bewertungen per Klick über das vollständige Google-Profil (Badge).
 * Komponentenname + Call-Sites (16 Seiten) bleiben unverändert.
 */
export function ReputonWidget() {
  return (
    <>
      <GoogleReviewsCarousel />
      <GoogleRatingBadge />
    </>
  );
}

const AUTOSCROLL_MS = 5000; // wie zuvor (Reputon data-delay=5)
const KARTEN_LUECKE_PX = 20;

function GoogleReviewsCarousel() {
  const {reviews, url} = useGoogleReviews();
  const trackRef = useRef(null);

  // Sanfter Autoscroll wie beim bisherigen Widget: alle 5 s eine Karte
  // weiter, am Ende zurück zum Anfang; pausiert bei Interaktion und
  // respektiert prefers-reduced-motion.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    let pausiert = false;
    const pause = () => {
      pausiert = true;
    };
    const weiter = () => {
      pausiert = false;
    };
    track.addEventListener('pointerenter', pause);
    track.addEventListener('pointerdown', pause);
    track.addEventListener('touchstart', pause, {passive: true});
    track.addEventListener('pointerleave', weiter);
    const intervall = setInterval(() => {
      if (pausiert || !track.isConnected) return;
      const karte = track.firstElementChild;
      if (!karte) return;
      const schritt = karte.getBoundingClientRect().width + KARTEN_LUECKE_PX;
      const amEnde =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({
        left: amEnde ? 0 : track.scrollLeft + schritt,
        behavior: 'smooth',
      });
    }, AUTOSCROLL_MS);
    return () => {
      clearInterval(intervall);
      track.removeEventListener('pointerenter', pause);
      track.removeEventListener('pointerdown', pause);
      track.removeEventListener('touchstart', pause);
      track.removeEventListener('pointerleave', weiter);
    };
  }, [reviews.length]);

  if (!reviews.length) return null;

  return (
    <div
      ref={trackRef}
      className="flex overflow-x-auto pb-4 snap-x snap-mandatory"
      style={{gap: KARTEN_LUECKE_PX, scrollbarWidth: 'thin'}}
      aria-label="Neueste Google-Rezensionen von Qi Blanco"
    >
      {reviews.map((review) => (
        <ReviewKarte key={review.id || review.name} review={review} url={url} />
      ))}
    </div>
  );
}

function ReviewKarte({review, url}) {
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
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-[#4285f4] flex items-center justify-center text-white font-medium text-sm">
              {(review.name || 'G').charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{review.name}</div>
            {review.zeitText ? (
              <div className="text-xs text-gray-500">{review.zeitText}</div>
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

      {/* Review-Text, geklammert; ganzer Text via Google-Profil */}
      <p
        className="text-sm! text-gray-700 leading-relaxed"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.text}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 underline mt-auto"
      >
        Auf Google lesen
      </a>
    </div>
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
