/**
 * googleRating — dynamische Google-Gesamtbewertung (Sterne + Wert + Anzahl),
 * SITEWIDE serverseitig geladen + gecacht (Fix-Runde v2, Christian 2026-07-24,
 * Punkt 5 „4,8 dynamisch von Google, nie hardcodiert").
 *
 * ARCHITEKTUR:
 *  - ladeGoogleRating(context) läuft im root-Loader EINMAL je Request und
 *    liefert {rating,total,source} an ALLE Routen (root data → useGoogleRating).
 *  - Quelle: Google Places „Place Details" (Place-ID der Business-Profil-Seite
 *    „Qi Blanco", dieselbe wie in StarRating.GOOGLE_REVIEWS_URL). Nur die zwei
 *    Felder rating + user_ratings_total.
 *  - CACHE = „täglicher Refresh": Ergebnis wird 24 h im Oxygen-Cache
 *    (caches.open('hydrogen')) gehalten → max. 1 Google-Abruf/Tag/Edge, kein
 *    Abruf je Seitenaufruf (Kosten/Rate-Limit-sicher, Free-Tier).
 *  - FAIL-SAFE (Muster mmProducts/campaign-fallback-prices): fehlt der API-Key
 *    ODER scheitert der Abruf ODER ist der Wert unplausibel → letzter bekannter
 *    guter Wert (GOOGLE_RATING_FALLBACK 4,8 / 429). NIE 0/leer/falsch, NIE ein
 *    erfundener Live-Wert. Ohne Key zeigt die Seite ehrlich den Fallback.
 *
 * INBETRIEBNAHME der Live-Dynamik: setze in der Oxygen-Runtime-Env den Key
 * GOOGLE_PLACES_API_KEY (Google-Cloud Places API, restringiert auf Place
 * Details). Ab dann zieht der Wert automatisch live + tagesaktuell. Ohne Key
 * bleibt es beim korrekten Fallback (kein Bruch). Der API-Key ist ein
 * Credential → Christian-Hand (wie PUBLIC_QPX_ENDPOINT & Co.).
 */

import {useRouteLoaderData} from 'react-router';

// Place-ID identisch zu StarRating.GOOGLE_REVIEWS_URL (Business-Profil „Qi Blanco")
export const GOOGLE_PLACE_ID = 'ChIJafc6o-z3okcRPlf__D3fDBM';
export const GOOGLE_REVIEWS_URL =
  'https://search.google.com/local/reviews?placeid=' + GOOGLE_PLACE_ID;

// Letzter bekannter guter Wert (Christian 2026-07-24: ~429 Google-Bewertungen).
export const GOOGLE_RATING_FALLBACK = {rating: 4.8, total: 429, source: 'fallback'};

const CACHE_TTL_S = 86400; // 24 h — „täglicher Refresh"

function istPlausibel(v) {
  return (
    v &&
    typeof v.rating === 'number' &&
    v.rating >= 1 &&
    v.rating <= 5 &&
    (v.total == null || (typeof v.total === 'number' && v.total >= 0))
  );
}

/** Rohantwort der Places-API → normalisiertes {rating,total,source} oder null. */
export function normalisiereGoogleAntwort(data) {
  const r = data?.result?.rating;
  const t = data?.result?.user_ratings_total;
  if (typeof r !== 'number' || r < 1 || r > 5) return null;
  return {
    rating: Math.round(r * 10) / 10, // eine Nachkommastelle wie Google
    total:
      typeof t === 'number' && t > 0 ? Math.round(t) : GOOGLE_RATING_FALLBACK.total,
    source: 'google',
  };
}

/**
 * Lädt die Gesamtbewertung fail-safe. Wirft NIE (root-Loader darf nicht 500en).
 * @param {any} context Hydrogen-AppLoadContext (mit .env, optional .waitUntil)
 * @returns {Promise<{rating:number,total:number,source:string}>}
 */
export async function ladeGoogleRating(context) {
  const env = context?.env || {};
  const key = env.GOOGLE_PLACES_API_KEY || env.PUBLIC_GOOGLE_PLACES_API_KEY;
  // Kein Key → sofort ehrlicher Fallback (kein Abruf, keine Latenz).
  if (!key) return {...GOOGLE_RATING_FALLBACK};

  const url =
    'https://maps.googleapis.com/maps/api/place/details/json' +
    `?place_id=${encodeURIComponent(GOOGLE_PLACE_ID)}` +
    '&fields=rating,user_ratings_total&language=de' +
    `&key=${encodeURIComponent(key)}`;

  // Cache-Key OHNE Key im Klartext (Cache-Poisoning/Leak vermeiden).
  const cacheReq = new Request(
    'https://qpx.internal/google-rating/' + GOOGLE_PLACE_ID,
  );
  const hatCaches = typeof caches !== 'undefined';

  try {
    let cache = null;
    if (hatCaches) {
      try {
        cache = await caches.open('hydrogen');
        const hit = await cache.match(cacheReq);
        if (hit) {
          const j = await hit.json();
          if (istPlausibel(j)) return j;
        }
      } catch {
        // Cache nicht verfügbar → einfach live abrufen
      }
    }

    const res = await fetch(url);
    if (!res || !res.ok) return {...GOOGLE_RATING_FALLBACK};
    const data = await res.json();
    const wert = normalisiereGoogleAntwort(data);
    if (!istPlausibel(wert)) return {...GOOGLE_RATING_FALLBACK};

    if (cache) {
      const store = new Response(JSON.stringify(wert), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${CACHE_TTL_S}`,
        },
      });
      const put = cache.put(cacheReq, store);
      if (context?.waitUntil) context.waitUntil(put);
      else await put;
    }
    return wert;
  } catch (fehler) {
    console.error(
      '[google-rating-fallback] Abruf fehlgeschlagen:',
      fehler?.message || fehler,
    );
    return {...GOOGLE_RATING_FALLBACK};
  }
}

/** Deutsche Komma-Schreibweise „4,8". */
export function ratingKomma(value) {
  return String(value).replace('.', ',');
}

/**
 * Hook: liest die im root-Loader geladene Gesamtbewertung. Fällt (SSR/Preview/
 * fehlende root-Daten) auf den Fallback zurück — nie undefined.
 * @returns {{value:number,total:number,source:string,komma:string,url:string}}
 */
export function useGoogleRating() {
  const root = useRouteLoaderData('root');
  const g =
    root && istPlausibel(root.googleRating)
      ? root.googleRating
      : GOOGLE_RATING_FALLBACK;
  return {
    value: g.rating,
    total: g.total,
    source: g.source || 'fallback',
    komma: ratingKomma(g.rating),
    url: GOOGLE_REVIEWS_URL,
  };
}
