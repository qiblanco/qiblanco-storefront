/**
 * googleRating — dynamische Google-Gesamtbewertung (Sterne + Wert + Anzahl)
 * PLUS die neuesten 5-Sterne-Rezensionen, SITEWIDE serverseitig geladen +
 * gecacht (Fix-Runde v2, Christian 2026-07-24, Punkt 5; Repair-Job 2026-07-31
 * „gecachte Bewertungszahl veraltet + neueste Reviews zuerst").
 *
 * ARCHITEKTUR:
 *  - ladeGoogleRating(context) (googleRating.server.js) läuft im root-Loader
 *    EINMAL je Request und liefert {rating,total,source,reviews} an ALLE Routen (root data →
 *    useGoogleRating / useGoogleReviews).
 *  - PRIMÄRQUELLE: Reputon-Storefront-Feed (dieselbe Quelle, die das
 *    Rezensions-Widget schon immer nutzte — echte Google-Daten des
 *    Business-Profils „Qi Blanco", inkl. Anzahl, Rating und Review-Texten).
 *    Kein API-Key nötig. SEKUNDÄR: Google Places „Place Details", falls
 *    GOOGLE_PLACES_API_KEY gesetzt ist (liefert nur rating+total).
 *  - CACHE = „periodischer Refresh": Ergebnis wird 6 h im Oxygen-Cache
 *    (caches.open('hydrogen')) gehalten → max. 4 Abrufe/Tag/Edge, KEIN
 *    Abruf je Seitenaufruf (schnelles Seitenladen bleibt).
 *  - AUSSCHLUSS (Job 20260918-…-review-ist-satire): namentlich benannte
 *    Einzelfälle aus googleReviewsAusschluss.server.js fallen raus — der
 *    Rahmen „nur 5 Sterne" lässt Satire durch, weil Satire gern 5 Sterne
 *    gibt. Die Kuration des oberen Widgets (googleReviewsCurated.js) trug
 *    diese Regel seit 2026-08-01, dieser Kanal kannte sie nicht.
 *  - REVIEWS-RAHMEN (Christian 2026-07-31): nur 5-Sterne-Rezensionen,
 *    sortiert nach NEUESTE zuerst (Googles Relativzeit-Angabe, nicht die
 *    „bedeutendste"-Relevanzordnung des Roh-Feeds); der Rest ist per Klick
 *    über das vollständige Google-Profil erreichbar (GOOGLE_REVIEWS_URL).
 *  - FAIL-SAFE (Muster mmProducts/campaign-fallback-prices): scheitert der
 *    Abruf ODER ist der Wert unplausibel → letzter bekannter guter Wert
 *    (GOOGLE_RATING_FALLBACK) + statischer Review-Schnappschuss
 *    (googleReviewsFallback.server.js, echte Rezensionen, durch den
 *    Ausschluss gefiltert). NIE 0/leer/erfunden, NIE ein 500 aus dem
 *    root-Loader.
 *  - CLIENT/SERVER-SCHNITT (Job 20260926-rezensions-ausschluss-serverseitig):
 *    DIESE Datei wird über `useGoogleRating` in den Client gebündelt. Sie
 *    trägt deshalb nur Konstanten, Hooks und Anzeige-Helfer. Abruf,
 *    Ausschlussliste und Rezensions-Schnappschuss stehen in *.server.js-
 *    Modulen — der Build bricht ab, wenn Client-Code sie importiert. Vorher
 *    stand die Ausschlussliste samt Verfassernamen im öffentlichen Asset
 *    assets/googleRating-*.js (bewacht von
 *    pruefungen/probe_ausschluss_nicht_im_asset.py).
 *
 * MONITORING: bauten-wache Check `google-rating-live-frisch` (homepage-bauer
 * Registry) alarmiert, wenn die Live-Seite wieder dauerhaft den Fallback
 * serviert oder die servierte Zahl von der Live-Quelle wegdriftet.
 */

import {useRouteLoaderData} from 'react-router';

// Place-ID identisch zu StarRating.GOOGLE_REVIEWS_URL (Business-Profil „Qi Blanco")
export const GOOGLE_PLACE_ID = 'ChIJafc6o-z3okcRPlf__D3fDBM';
export const GOOGLE_REVIEWS_URL =
  'https://search.google.com/local/reviews?placeid=' + GOOGLE_PLACE_ID;

// Letzter bekannter guter Wert (aktualisiert 2026-08-08: live 438; davor 437
// vom 2026-07-31 und 429 vom 2026-07-24 — die Zahl stand damals fest, weil der
// Places-Key nie gesetzt wurde und es damit nie einen Live-Abruf gab).
// NAHT: dieser Wert muss mit dem US-Fallback uebereinstimmen
// (us-qiblanco-2024 sections/qb-reviews-google.liquid, settings.fallback_total).
// Beide Shops zeigen dieselbe Google-Quelle (cid 1372717443771750206); divergente
// Fallbacks zeigen dieselbe Marke mit zwei Zahlen — und zwar genau im Ausfall,
// also wenn niemand hinschaut. Bewacht von pruefungen/probe_naht_variante_a_zahlen.py.
export const GOOGLE_RATING_FALLBACK = {
  rating: 4.8,
  total: 438,
  source: 'fallback',
  // Die Rezensionstexte des Notfalls liefert der root-Loader
  // (googleRating.server.js, GOOGLE_RATING_FALLBACK_VOLL). Hier, im Client,
  // steht nur die Zahl: fehlen root-Daten ganz, rendert das Widget keine
  // Karten statt eines ungefilterten Schnappschusses.
  reviews: [],
  aiSummary: [],
};

/** Ist ein Loader-Wert brauchbar? (auch von googleRating.server.js benutzt) */
export function istPlausibel(v) {
  return (
    v &&
    typeof v.rating === 'number' &&
    v.rating >= 1 &&
    v.rating <= 5 &&
    (v.total == null || (typeof v.total === 'number' && v.total >= 0))
  );
}

/**
 * Kundenfoto-URL → Thumbnail-URL in Anzeigegröße.
 *
 * Der Feed liefert `thumbnailUrl` IDENTISCH zur Vollbild-`url` (beide enden
 * auf `=k-no`) — der Feldname ist also kein Beleg für ein Thumbnail: gemessen
 * 2026-08-08 sind das 78 KB für ein 56×56-Bild. Googles Bild-Host akzeptiert
 * stattdessen ein Größensuffix; `=s112-c` (56 px bei DPR 2, quadratisch
 * beschnitten) sind 7,5 KB — dasselbe Muster, das der Avatar schon nutzt
 * (`=s120-c-rp-mo-br100`).
 *
 * Defensiv: nur bei Googles Bild-Host und nur, wenn im letzten Pfadsegment
 * wirklich ein `=`-Suffix steht. Alles andere bleibt unverändert — eine
 * fremde URL soll hier nie zerschnitten werden.
 */
export function bildThumbUrl(url, groesse = 112) {
  if (typeof url !== 'string' || !url.includes('googleusercontent.com/')) return url;
  const schnitt = url.lastIndexOf('=');
  if (schnitt <= url.lastIndexOf('/')) return url; // kein Suffix → nicht anfassen
  return `${url.slice(0, schnitt)}=s${groesse}-c`;
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
 * (server-gecacht, neueste zuerst). Bei Feed-Ausfall liefert schon der
 * Loader den gefilterten Schnappschuss; fehlen root-Daten ganz, ist die
 * Liste leer (das Widget rendert dann keine Karten).
 * `foto` = Avatar des Verfassers, `bilder` = vom Kunden gepostete Kundenfotos.
 * @returns {{reviews:Array<{id:string,name:string,foto:string,bilder:Array<{url:string,thumb:string}>,rating:number,text:string,zeitText:string}>,url:string}}
 */
export function useGoogleReviews() {
  const root = useRouteLoaderData('root');
  const g = root?.googleRating;
  const reviews =
    g && Array.isArray(g.reviews) && g.reviews.length > 0
      ? g.reviews
      : [];
  const aiSummary =
    g && Array.isArray(g.aiSummary) && g.aiSummary.length > 0
      ? g.aiSummary
      : [];
  return {reviews, aiSummary, url: GOOGLE_REVIEWS_URL};
}
