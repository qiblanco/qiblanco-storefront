/**
 * googleReviewsAusschluss — die Rezensionen aus dem LIVE-Google-Feed, die
 * nicht ausgeliefert werden, je mit Grund und Belegdatum.
 *
 * WARUM ES DIESE DATEI GIBT (Job 20260918-startseite-fünf-sterne-review-ist-satire):
 * Die Entscheidung gegen Satire stand schon — sie stand nur im falschen Kanal.
 * googleReviewsCurated.js trägt sie seit dem 2026-08-01 im Dateikopf
 * („Ironie/Satire … ausgeschlossen", Christian) und hält sie, weil dort ein
 * Mensch 12 Texte von Hand ausgewählt hat. Der zweite Kanal — der
 * server-gecachte Live-Abruf in googleRating.js, den ReputonWidget auf 16
 * Seiten rendert — kannte sie nie: er filterte auf `rating === 5`, `!hide`
 * und „Text nicht leer", und mehr nicht. Beide Kanäle zeigen dieselbe Quelle,
 * nur einer kannte die Regel.
 *
 * WARUM AUSSCHLUSS PER ID UND NICHT PER STICHWORT: Unernsthaftigkeit ist
 * nicht an Wörtern messbar. Gemessen am Feed vom 2026-09-18 tragen 37 der 38
 * Rezensionen echte Begeisterung, viele davon in genau der Sprache, die eine
 * Satire-Heuristik treffen würde (Superlative, Ausrufezeichen, Emojis,
 * körperliche Wirkung). Eine Wortliste hätte die Kundschaft zensiert, die uns
 * gelobt hat. Ausgeschlossen wird deshalb ein NAMENTLICH BENANNTER Einzelfall
 * nach menschlichem Urteil — nie eine Eigenschaft von Text.
 *
 * SCHLÜSSEL ist `hashId` aus dem Reputon-Feed (in googleRating.js zu `id`
 * normalisiert). Er ist stabil, solange der Verfasser den Text nicht ändert.
 * ÄNDERT ER IHN, PASST DIE ID NICHT MEHR — und der Ausschluss liefe still ins
 * Leere, während der Text wieder ausgeliefert wird. Genau dagegen zählt
 * `wendeAusschlussAn` mit und meldet die Trefferzahl: ein Eintrag, der im
 * Live-Feed NICHTS mehr trifft, ist ein Alarm über diese Datei und kein
 * Normalzustand (bewacht von pruefungen/probe_review_ausschluss_wirkt.py).
 *
 * REICHWEITE, ehrlich: diese Datei wirkt NUR im DACH-Hydrogen-Shop
 * qiblanco.com, den unser Deploy erreicht. qi-blanco.com (US, fremdes
 * Liquid-Theme) lädt denselben Feed client-seitig über cdn.grw.reputon.com —
 * dorthin reicht kein Code von hier. Der einzige Ort, der beide Shops zugleich
 * deckt, ist das Feld `hide` an der Quelle (Reputon-Konto).
 */

/**
 * @typedef {Object} AusgeschlosseneRezension
 * @property {string} id       hashId aus dem Reputon-Feed
 * @property {string} autor    Anzeigename, nur zur Wiedererkennung
 * @property {string} grund    warum sie nicht ausgeliefert wird
 * @property {string} belegtAm ISO-Datum der Messung, auf der das Urteil beruht
 */

/** @type {AusgeschlosseneRezension[]} */
export const GOOGLE_REVIEWS_AUSSCHLUSS = [
  {
    id: '-582554336',
    autor: 'Ma Pe',
    grund:
      'Durchgehende Satire: der Text schreibt dem Anhänger Wirkungen zu, die ' +
      'als Übertreibung gemeint sind (Sprachen ohne Lernen, Atmen wird ' +
      'überflüssig, ein Hund habilitiert). Eine Stelle parodiert eine ' +
      'Heilungsgeschichte im Rollstuhl. Ausgeliefert unter 5 Sternen und ' +
      'Verifiziert-Haken liest sie sich als Tatsachenbericht.',
    belegtAm: '2026-09-18',
  },
];

/** Nur die IDs, als Menge — für den Filter. */
export const AUSSCHLUSS_IDS = new Set(
  GOOGLE_REVIEWS_AUSSCHLUSS.map((e) => e.id),
);

/**
 * Wendet den Ausschluss auf eine normalisierte Rezensionsliste an.
 *
 * Gibt die gefilterte Liste zurück UND, je Ausschluss-Eintrag, wie oft er
 * gegriffen hat. Die Trefferzahl ist der Punkt: eine 0 heißt nicht „sauber",
 * sondern „dieser Eintrag findet sein Objekt nicht mehr" — der Text kann
 * gelöscht sein (gut) oder geändert und damit wieder unterwegs (schlecht).
 * Die beiden sind hier nicht unterscheidbar, deshalb urteilt diese Funktion
 * nicht, sie berichtet.
 *
 * @param {{id?: string}[]} reviews normalisierte Rezensionen
 * @returns {{reviews: {id?: string}[], treffer: Record<string, number>}}
 */
export function wendeAusschlussAn(reviews) {
  const treffer = {};
  for (const e of GOOGLE_REVIEWS_AUSSCHLUSS) treffer[e.id] = 0;
  if (!Array.isArray(reviews)) return {reviews: [], treffer};
  const behalten = reviews.filter((rv) => {
    const id = rv && rv.id != null ? String(rv.id) : '';
    if (id && AUSSCHLUSS_IDS.has(id)) {
      treffer[id] += 1;
      return false;
    }
    return true;
  });
  return {reviews: behalten, treffer};
}
