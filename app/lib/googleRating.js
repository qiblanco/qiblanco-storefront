/**
 * googleRating — dynamische Google-Gesamtbewertung (Sterne + Wert + Anzahl)
 * PLUS die neuesten 5-Sterne-Rezensionen, SITEWIDE serverseitig geladen +
 * gecacht (Fix-Runde v2, Christian 2026-07-24, Punkt 5; Repair-Job 2026-07-31
 * „gecachte Bewertungszahl veraltet + neueste Reviews zuerst").
 *
 * ARCHITEKTUR:
 *  - ladeGoogleRating(context) läuft im root-Loader EINMAL je Request und
 *    liefert {rating,total,source,reviews} an ALLE Routen (root data →
 *    useGoogleRating / useGoogleReviews).
 *  - PRIMÄRQUELLE: Reputon-Storefront-Feed (dieselbe Quelle, die das
 *    Rezensions-Widget schon immer nutzte — echte Google-Daten des
 *    Business-Profils „Qi Blanco", inkl. Anzahl, Rating und Review-Texten).
 *    Kein API-Key nötig. SEKUNDÄR: Google Places „Place Details", falls
 *    GOOGLE_PLACES_API_KEY gesetzt ist (liefert nur rating+total).
 *  - CACHE = „periodischer Refresh": Ergebnis wird 6 h im Oxygen-Cache
 *    (caches.open('hydrogen')) gehalten → max. 4 Abrufe/Tag/Edge, KEIN
 *    Abruf je Seitenaufruf (schnelles Seitenladen bleibt).
 *  - REVIEWS-RAHMEN (Christian 2026-07-31): nur 5-Sterne-Rezensionen,
 *    sortiert nach NEUESTE zuerst (Googles Relativzeit-Angabe, nicht die
 *    „bedeutendste"-Relevanzordnung des Roh-Feeds); der Rest ist per Klick
 *    über das vollständige Google-Profil erreichbar (GOOGLE_REVIEWS_URL).
 *  - FAIL-SAFE (Muster mmProducts/campaign-fallback-prices): scheitert der
 *    Abruf ODER ist der Wert unplausibel → letzter bekannter guter Wert
 *    (GOOGLE_RATING_FALLBACK) + statischer Review-Schnappschuss
 *    (googleReviewsFallback.js, echte Rezensionen). NIE 0/leer/erfunden,
 *    NIE ein 500 aus dem root-Loader.
 *
 * MONITORING: bauten-wache Check `google-rating-live-frisch` (homepage-bauer
 * Registry) alarmiert, wenn die Live-Seite wieder dauerhaft den Fallback
 * serviert oder die servierte Zahl von der Live-Quelle wegdriftet.
 */

import {useRouteLoaderData} from 'react-router';
import {GOOGLE_REVIEWS_FALLBACK, GOOGLE_AI_SUMMARY_FALLBACK} from '~/lib/googleReviewsFallback';

// Place-ID identisch zu StarRating.GOOGLE_REVIEWS_URL (Business-Profil „Qi Blanco")
export const GOOGLE_PLACE_ID = 'ChIJafc6o-z3okcRPlf__D3fDBM';
export const GOOGLE_REVIEWS_URL =
  'https://search.google.com/local/reviews?placeid=' + GOOGLE_PLACE_ID;

// Reputon-Storefront-Feed: öffentlicher, unauthentifizierter JSON-Endpunkt,
// den das bisherige Widget-Script client-seitig nutzte — jetzt serverseitig
// gecacht abgerufen (Anbindung erhalten, nur der Ort des Abrufs wandert).
export const REPUTON_FEED_URL =
  'https://grw.reputon.com/app/storefront/widget?shop=qi-blanco.myshopify.com';

// Letzter bekannter guter Wert (aktualisiert 2026-07-31: live 437; davor 429
// vom 2026-07-24 — die Zahl stand fest, weil der Places-Key nie gesetzt wurde
// und es damit nie einen Live-Abruf gab).
export const GOOGLE_RATING_FALLBACK = {
  rating: 4.8,
  total: 437,
  source: 'fallback',
  reviews: GOOGLE_REVIEWS_FALLBACK,
  aiSummary: GOOGLE_AI_SUMMARY_FALLBACK,
};

const CACHE_TTL_S = 21600; // 6 h — „periodischer Refresh", nie je Seitenaufruf
const MAX_REVIEWS = 10; // Deckel für die root-Loader-Payload (sitewide)

function istPlausibel(v) {
  return (
    v &&
    typeof v.rating === 'number' &&
    v.rating >= 1 &&
    v.rating <= 5 &&
    (v.total == null || (typeof v.total === 'number' && v.total >= 0))
  );
}

/**
 * Googles deutsche Relativzeit („vor 3 Tagen", „vor 1 Monat") → Alter in
 * Tagen. Sie ist die verlässlichere Sortier-Achse: der epoch im Feed weicht
 * nachweislich von Googles eigener Anzeige ab (Feed 2026-07-30: „vor 1 Tag"
 * bei epoch 2026-06-15). Fallback: epoch, sonst „uralt".
 */
export function relativZeitInTagen(zeitText, epochSekunden) {
  const m = /vor\s+(\d+)\s+(Minute|Stunde|Tag|Woche|Monat|Jahr)/i.exec(
    zeitText || '',
  );
  if (m) {
    const faktor = {
      minute: 1 / 1440,
      stunde: 1 / 24,
      tag: 1,
      woche: 7,
      monat: 30,
      jahr: 365,
    }[m[2].toLowerCase()];
    return parseInt(m[1], 10) * (faktor || 1);
  }
  if (typeof epochSekunden === 'number' && epochSekunden > 0) {
    return Math.max(0, (Date.now() / 1000 - epochSekunden) / 86400);
  }
  return 99999;
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
    reviews: GOOGLE_REVIEWS_FALLBACK, // Places liefert keine sortierbaren Reviews
    aiSummary: GOOGLE_AI_SUMMARY_FALLBACK,
  };
}

/**
 * Rohantwort des Reputon-Feeds → normalisiertes
 * {rating,total,source,reviews[]} oder null. Reviews: nur 5 Sterne, nicht
 * versteckt, mit Text; sortiert neueste zuerst; auf MAX_REVIEWS gedeckelt.
 */
export function normalisiereReputonAntwort(data) {
  const b = data?.business?.[0];
  const r = b?.rating;
  if (typeof r !== 'number' || r < 1 || r > 5) return null;
  const reviews = (Array.isArray(b.reviews) ? b.reviews : [])
    .filter(
      (rv) =>
        rv &&
        rv.rating === 5 &&
        !rv.hide &&
        typeof rv.text === 'string' &&
        rv.text.trim().length > 0,
    )
    .map((rv) => ({
      id: String(rv.hashId || rv.id || ''),
      name: rv.authorName || 'Google-Nutzer',
      foto: rv.profilePhotoUrl || '',
      rating: 5,
      text: rv.text.trim(),
      zeitText: rv.relativeTimeDescription || '',
      alterTage: relativZeitInTagen(rv.relativeTimeDescription, rv.time),
      zeit: typeof rv.time === 'number' ? rv.time : 0,
    }))
    .sort((a, c) => a.alterTage - c.alterTage || c.zeit - a.zeit)
    .slice(0, MAX_REVIEWS);
  // Fix #1: Googles KI-Zusammenfassung der Rezensionen (business.summary.items)
  const aiSummary = Array.isArray(b?.summary?.items)
    ? b.summary.items
        .map((s) => (typeof s === 'string' ? s.replace(/[;.\s]+$/, '').trim() : ''))
        .filter(Boolean)
    : [];
  return {
    rating: Math.round(r * 10) / 10,
    total:
      typeof b.reviewsNumber === 'number' && b.reviewsNumber > 0
        ? Math.round(b.reviewsNumber)
        : GOOGLE_RATING_FALLBACK.total,
    source: 'reputon',
    reviews: reviews.length > 0 ? reviews : GOOGLE_REVIEWS_FALLBACK,
    aiSummary: aiSummary.length > 0 ? aiSummary : GOOGLE_AI_SUMMARY_FALLBACK,
  };
}

async function holeReputon() {
  const res = await fetch(REPUTON_FEED_URL, {
    headers: {accept: 'application/json'},
  });
  if (!res || !res.ok) return null;
  return normalisiereReputonAntwort(await res.json());
}

async function holePlaces(key) {
  const url =
    'https://maps.googleapis.com/maps/api/place/details/json' +
    `?place_id=${encodeURIComponent(GOOGLE_PLACE_ID)}` +
    '&fields=rating,user_ratings_total&language=de' +
    `&key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res || !res.ok) return null;
  return normalisiereGoogleAntwort(await res.json());
}

/**
 * Lädt Gesamtbewertung + neueste 5-Sterne-Reviews fail-safe. Wirft NIE
 * (root-Loader darf nicht 500en).
 * @param {any} context Hydrogen-AppLoadContext (mit .env, optional .waitUntil)
 * @returns {Promise<{rating:number,total:number,source:string,reviews:Array}>}
 */
export async function ladeGoogleRating(context) {
  const env = context?.env || {};
  const key = env.GOOGLE_PLACES_API_KEY || env.PUBLIC_GOOGLE_PLACES_API_KEY;

  // Cache-Key ohne Secrets; v2 = neues Payload-Format (mit reviews).
  const cacheReq = new Request(
    'https://qpx.internal/google-rating-v2/' + GOOGLE_PLACE_ID,
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

    // Primär Reputon (echte Google-Daten inkl. Reviews, kein Key nötig),
    // sekundär Places (falls der Key je gesetzt wird), sonst Fallback.
    let wert = await holeReputon().catch(() => null);
    if (!istPlausibel(wert) && key) {
      wert = await holePlaces(key).catch(() => null);
    }
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
 * Rückgabe-Form ist STABIL (Naht-Kontrakt, auch der Rezensionsbereich-Job
 * 20260731 konsumiert sie): {value,total,source,komma,url}.
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

/**
 * Hook: die neuesten 5-Sterne-Google-Rezensionen aus dem root-Loader
 * (server-gecacht, neueste zuerst). Nie leer: fällt auf den statischen
 * Schnappschuss echter Reviews zurück.
 * @returns {{reviews:Array<{id:string,name:string,foto:string,rating:number,text:string,zeitText:string}>,url:string}}
 */
export function useGoogleReviews() {
  const root = useRouteLoaderData('root');
  const g = root?.googleRating;
  const reviews =
    g && Array.isArray(g.reviews) && g.reviews.length > 0
      ? g.reviews
      : GOOGLE_REVIEWS_FALLBACK;
  const aiSummary =
    g && Array.isArray(g.aiSummary) && g.aiSummary.length > 0
      ? g.aiSummary
      : GOOGLE_AI_SUMMARY_FALLBACK;
  return {reviews, aiSummary, url: GOOGLE_REVIEWS_URL};
}
