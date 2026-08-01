/**
 * StarRating — geteilte 5-Sterne-Darstellung der 4,8-Google-Bewertung
 * (Block Landingpage; Job 20260718-lp-sterne-reputon-googlelink).
 *
 * Immer 5 sichtbare gelbe Sterne; der Wert (z.B. 4,8) wird wie bei
 * Google-Rezensionen ueblich als fraktionale Fuellung gerendert
 * (4 volle Sterne + 5. Stern zu 80 %). Overlay-Clip statt SVG-Gradient:
 * SSR-safe ohne id-Kollisionen (Hydrogen streamt serverseitig).
 *
 * GOOGLE_REVIEWS_URL ist die EINE Quelle fuer das Klickziel: die
 * Rezensionen-Ansicht des Google-Business-Profils »Qi Blanco«
 * (Place-ID aus der Reputon-Widget-Config, die auch die 4,8 liefert).
 */

export const GOOGLE_REVIEWS_URL =
  'https://search.google.com/local/reviews?placeid=ChIJafc6o-z3okcRPlf__D3fDBM&sortby=ratingHigh';

const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function Star({fill, size}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export function StarRating({value = 4.8, size = 18}) {
  const label = `${String(value).replace('.', ',')} von 5 Sternen`;
  return (
    <span className="star-rating" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => {
        const anteil = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="star-rating__star">
            <Star fill="#dadce0" size={size} />
            {anteil > 0 && (
              <span
                className="star-rating__fill"
                style={{width: `${anteil * 100}%`}}
              >
                <Star fill="#F4B400" size={size} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
