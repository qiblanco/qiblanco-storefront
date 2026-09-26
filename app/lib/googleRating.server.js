/**
 * googleRating.server — der SERVER-Teil der Google-Gesamtbewertung: Abruf,
 * Normalisierung, Ausschluss, Notfall-Schnappschuss, Cache. Läuft nur im
 * root-Loader (app/root.jsx).
 *
 * WARUM EIN EIGENES .server-MODUL (Job 20260926-rezensions-ausschluss-
 * serverseitig): bis hierher stand all das in googleRating.js, und das Modul
 * wird über `useGoogleRating` (Header.jsx und viele campaign/*.jsx) in den
 * CLIENT gebündelt. Mit ihm reisten googleReviewsAusschluss.js und
 * googleReviewsFallback.js ins öffentliche Asset
 * cdn.shopify.com/oxygen-v2/…/assets/googleRating-*.js — gemessen 2026-09-26
 * mit Verfassername und Grund jedes Ausschlusses. Eine Liste, die eine
 * Rezension verbergen soll, veröffentlichte so den Namen ihres Verfassers.
 *
 * Die Endung `.server` ist die Sperre, nicht bloß ein Name: der React-Router-
 * Build bricht ab, sobald Client-Code ein `.server`-Modul importiert. Dasselbe
 * gilt für googleReviewsAusschluss.server.js und googleReviewsFallback.server.js.
 * Der Client braucht keins davon: auch bei Feed-Ausfall rendert der root-
 * Loader den (gefilterten) Schnappschuss, der Client bekommt ihn als Daten.
 *
 * Architektur, Quellen, Cache und Fail-safe: siehe Kopf von googleRating.js.
 */

import {
  GOOGLE_PLACE_ID,
  GOOGLE_RATING_FALLBACK,
  istPlausibel,
} from '~/lib/googleRating';
import {
  GOOGLE_REVIEWS_FALLBACK,
  GOOGLE_AI_SUMMARY_FALLBACK,
} from '~/lib/googleReviewsFallback.server';
import {wendeAusschlussAn} from '~/lib/googleReviewsAusschluss.server';

// Reputon-Storefront-Feed: öffentlicher, unauthentifizierter JSON-Endpunkt,
// den das bisherige Widget-Script client-seitig nutzte — jetzt serverseitig
// gecacht abgerufen (Anbindung erhalten, nur der Ort des Abrufs wandert).
export const REPUTON_FEED_URL =
  'https://grw.reputon.com/app/storefront/widget?shop=qi-blanco.myshopify.com';

/**
 * Der Notfall-Schnappschuss läuft DURCH DEN AUSSCHLUSS, bevor er irgendwo
 * ausgeliefert wird. Bis 2026-09-26 tat er das nicht: googleRating.js
 * reichte GOOGLE_REVIEWS_FALLBACK an vier Stellen ungefiltert durch. Ein aus
 * dem Feed neu erzeugter Schnappschuss hätte eine ausgeschlossene Rezension
 * bei jedem Feed-Ausfall still zurückgebracht.
 *
 * Verglichen wird AUCH PER NAME: der Schnappschuss trägt nur Reputons
 * wandernde hashId, keine Google-id (googleReviewsAusschluss.server.js,
 * `perName`). Ein Namensvetter fiele mit heraus — im Notfall eine Karte
 * weniger, nie eine zu viel.
 */
export function schnappschussMitAusschluss(liste) {
  return wendeAusschlussAn(liste, {perName: true}).reviews;
}

export const GOOGLE_REVIEWS_FALLBACK_GEFILTERT = schnappschussMitAusschluss(
  GOOGLE_REVIEWS_FALLBACK,
);

/** Der vollständige Fallback des Loaders: Zahl aus googleRating.js + Texte. */
export const GOOGLE_RATING_FALLBACK_VOLL = {
  ...GOOGLE_RATING_FALLBACK,
  reviews: GOOGLE_REVIEWS_FALLBACK_GEFILTERT,
  aiSummary: GOOGLE_AI_SUMMARY_FALLBACK,
};

// v3 (2026-09-26): neues Payload-Format ohne `ausschlussTreffer`. Der
// Key-Wechsel verwirft zugleich jeden v2-Eintrag, der das Feld noch trägt.
const CACHE_KEY = 'https://qpx.internal/google-rating-v3/' + GOOGLE_PLACE_ID;
const CACHE_TTL_S = 21600; // 6 h — „periodischer Refresh", nie je Seitenaufruf
const MAX_REVIEWS = 50; // Deckel: die NEUESTEN 50 Fünf-Sterne-Reviews
// (Christian 2026-08-01). Hinweis: der Reputon-Storefront-Feed liefert
// real nur wenige Dutzend Fünf-Sterne-Reviews (keine Pagination; gemessen
// 2026-09-18: 38 vor Ausschluss, 37 danach) — mehr gibt die Quelle derzeit
// nicht her; NICHT auffüllen/erfinden. Die Zahl ist eine Messung, keine
// Konstante: sie wächst mit jeder neuen Google-Rezension.

/**
 * Was den Server verlassen darf. `ausschlussTreffer` bleibt drinnen: seine
 * Schlüssel sind die Google-ids der ausgeschlossenen Rezensionen, und der
 * Loader-Wert steht als Turbo-Stream im HTML jeder Seite. Die Trefferzahl
 * misst die Probe am Feed selbst (probe_review_ausschluss_wirkt.py --arm
 * quelle), nicht am ausgelieferten Wert.
 */
export function auslieferbar(wert) {
  if (!wert || typeof wert !== 'object') return wert;
  const {ausschlussTreffer: _intern, ...rest} = wert;
  return rest;
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
    reviews: GOOGLE_REVIEWS_FALLBACK_GEFILTERT, // Places liefert keine sortierbaren Reviews
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
  const sortiert = (Array.isArray(b.reviews) ? b.reviews : [])
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
      // STABILE GOOGLE-KENNUNG, getrennt von `id` geführt. `id` ist die
      // Reputon-`hashId` und WANDERT: gemessen 2026-09-20 sprang sie bei
      // völlig unverändertem Text (1954 Zeichen) von -582554336 auf
      // -1130994804 — sie hängt nicht nur am Text, sondern auch an der
      // mitlaufenden Relativzeit („vor 9 Monaten" -> „vor 10 Monaten").
      // Die Google-`id` blieb dabei gleich und ist zusätzlich
      // shopübergreifend stabil (DACH/US, gemessen 2026-09-18).
      // Ein Ausschluss darf deshalb NUR an dieser Kennung hängen.
      quellId: String(rv.id || ''),
      name: rv.authorName || 'Google-Nutzer',
      foto: rv.profilePhotoUrl || '',
      // KUNDENFOTOS (Feed-Feld `images`) — NICHT mit `foto` verwechseln:
      // `foto`/profilePhotoUrl ist das Google-PROFILBILD des Verfassers
      // (37/37 Rezensionen), `bilder`/images sind die vom Kunden GEPOSTETEN
      // Fotos (gemessen 2026-08-08: 3/37). Das Feld wurde bis hierher gar
      // nicht durchgereicht — genau deshalb rendert der Slider bisher keine.
      bilder: Array.isArray(rv.images)
        ? rv.images
            .filter((b) => b && typeof b.url === 'string' && b.url)
            .map((b) => ({url: b.url, thumb: b.thumbnailUrl || b.url}))
        : [],
      rating: 5,
      text: rv.text.trim(),
      zeitText: rv.relativeTimeDescription || '',
      alterTage: relativZeitInTagen(rv.relativeTimeDescription, rv.time),
      zeit: typeof rv.time === 'number' ? rv.time : 0,
    }))
    .sort((a, c) => a.alterTage - c.alterTage || c.zeit - a.zeit);
  // AUSSCHLUSS vor dem Deckel, nie danach: eine ausgeschlossene Rezension
  // darf keinen der MAX_REVIEWS Plätze verbrauchen, sonst zeigt das Widget
  // je Ausschluss eine Karte weniger, obwohl der Feed sie hätte.
  // Die Trefferzahlen gehen an den Aufrufer (Tests); ausgeliefert werden sie
  // nicht (auslieferbar()). Wer 0 liest, hat einen Eintrag, der sein Objekt
  // nicht mehr findet (googleReviewsAusschluss.server.js).
  const {reviews: sichtbar, treffer: ausschlussTreffer} =
    wendeAusschlussAn(sortiert);
  const reviews = sichtbar.slice(0, MAX_REVIEWS);
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
    reviews: reviews.length > 0 ? reviews : GOOGLE_REVIEWS_FALLBACK_GEFILTERT,
    ausschlussTreffer,
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

  // Cache-Key ohne Secrets.
  const cacheReq = new Request(CACHE_KEY);
  const hatCaches = typeof caches !== 'undefined';

  try {
    let cache = null;
    if (hatCaches) {
      try {
        cache = await caches.open('hydrogen');
        const hit = await cache.match(cacheReq);
        if (hit) {
          const j = await hit.json();
          if (istPlausibel(j)) return auslieferbar(j);
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
    if (!istPlausibel(wert)) return {...GOOGLE_RATING_FALLBACK_VOLL};
    wert = auslieferbar(wert);

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
    return {...GOOGLE_RATING_FALLBACK_VOLL};
  }
}
