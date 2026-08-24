/**
 * Die EINE Stelle, an der steht, welche Flaeche zur KAKAO-Welt gehoert und
 * welche Kennzahlen dort gelten.
 *
 * WARUM ES DIESE DATEI GIBT (Christian 2026-08-24, Job
 * 20260824-kakao-bewertung-49-und-1000-nutzer-drei-domains-prio12):
 * Auf den Kakaoseiten standen die Qi-Blanco-Zahlen — "4.8 Sterne" und
 * "ueber 14.000 aktive Nutzer". Woertlich: "Das 14.000 wurde faelschlicherweise
 * von Qi Blanco uebernommen." Die Zahlen sind beim Uebertragen der Seiten aus
 * der Qi-Blanco-Welt mitgewandert, weil die Vorlage von dort stammte.
 *
 * ZWEI PRODUKTWELTEN, ZWEI KENNZAHL-SAETZE — das ist der ganze Punkt:
 *   Qi Blanco (Energieprodukte): 14.000 aktive Nutzer, Bewertung LIVE aus
 *                                Google (siehe unten), heute 4,8.
 *   Crystal Cacao:               1.000 aktive Nutzer, Bewertung 4,9.
 * Eine Zahl aus der einen Welt auf einer Seite der anderen ist ein Fehler,
 * auch wenn sie fuer sich genommen stimmt.
 *
 * WARUM EINE LISTE UND NICHT EIN SUBSTRING: geprueft und verworfen.
 * /pages/kakao-anwendung traegt "kakao" im Pfad, ist aber ein KURS der
 * Qi-Blanco-Welt und zeigt live korrekt die Qi-Blanco-Leiste. Eine Regel
 * `pathname.includes('kakao')` haette genau diese Seite umgehaengt.
 *
 * WARUM DIE LISTE HIERHER GEHOERT UND NICHT IN DIE HEADER-KOMPONENTE:
 * Am 2026-08-24 live gemessen zeigten FUENF Pfade die Kakao-Leiste
 * (crystal-cacao, kristall-kakao, zeremonie-kakao, crystal-cacao-create,
 * crystal-cacao-awake), waehrend die Liste in Header.jsx nur DREI davon
 * kannte. Der naechste Deploy aus main haette /pages/kristall-kakao und
 * /products/zeremonie-kakao auf die Qi-Blanco-Leiste gekippt — "ueber 14.000
 * zufriedene Kunden" auf einer Kakaoseite, entstanden durch einen voellig
 * unbeteiligten Deploy. Eine Liste, die in einer Komponente mitwohnt, wird
 * beim naechsten Seitenbau vergessen; eine Liste mit eigenem Namen und
 * eigener Probe nicht.
 *
 * WENN DU EINE NEUE KAKAOSEITE BAUST: trag ihren Pfad in KAKAO_PFADE ein.
 * Das ist der einzige Handgriff — Leiste, Sterne und Nutzerzahl folgen dann
 * von selbst. Die Probe
 *   homepage-bauer/pruefungen/probe_kakao_zone.py
 * haelt Quelltext und ausgelieferte Seite gegeneinander.
 */

/** Pfade, die zur Kakao-Produktwelt gehoeren. */
export const KAKAO_PFADE = Object.freeze([
  '/pages/crystal-cacao',
  '/pages/kristall-kakao',
  '/products/crystal-cacao-create',
  '/products/crystal-cacao-awake',
  '/products/zeremonie-kakao',
]);

/**
 * Kennzahlen der Kakao-Welt.
 *
 * BELEGLAGE, ehrlich (Christian: "Halte im RESULT fest, worauf die 4,9 und
 * die 1.000 sich stuetzen"): Beide Werte sind eine REDAKTIONELLE ANGABE, keine
 * gemessene Groesse. Fuer Crystal Cacao werden am Produkt keine Bewertungen
 * erhoben — es gibt also keine Quelle, aus der sich ein Sternewert rechnen
 * liesse. Christian hat am 2026-08-24 von 5,0 auf 4,9 korrigiert, also nach
 * unten in die vorsichtigere Richtung.
 *
 * DESHALB STEHEN DIESE ZAHLEN BEWUSST NICHT IM STRUKTURIERTEN DATENSATZ:
 * app/lib/produkt-schema.js laesst `aggregateRating` ausdruecklich weg, weil
 * Google verlangt, dass eine ausgezeichnete Bewertung aus echten Bewertungen
 * stammt. Diese Zahl hier ist eine Anzeige auf der Seite und darf NICHT ins
 * JSON-LD wandern.
 */
export const KAKAO_KENNZAHLEN = Object.freeze({
  bewertung: '4,9',
  bewertungSkala: '4,9/5,0',
  nutzer: '1.000',
});

/**
 * Kennzahlen der Qi-Blanco-Welt (Energieprodukte).
 *
 * Die BEWERTUNG steht hier bewusst NICHT: sie wird live geholt
 * (app/components/reusables/ReviewCount.jsx zieht den echten Google-
 * Haendlerscore, Fallback 4,7). Sie ist damit die einzige der vier Zahlen,
 * die auf einer Messung beruht — eine feste Zahl daneben waere eine zweite
 * Wahrheit ueber dieselbe Groesse.
 */
export const QIBLANCO_KENNZAHLEN = Object.freeze({
  nutzer: '14.000',
});

/**
 * Gehoert dieser Pfad zur Kakao-Welt?
 * @param {string} pathname
 * @returns {boolean}
 */
export function istKakaoPfad(pathname) {
  if (!pathname) return false;
  // Trailing Slash abschneiden, damit /pages/crystal-cacao/ nicht durchfaellt.
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return KAKAO_PFADE.includes(p);
}
