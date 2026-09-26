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
 * SCHLÜSSELWAHL — warum hier die Google-`id` steht und NICHT die `hashId`:
 * die `hashId` des Reputon-Feeds ist nicht stabil. Gemessen 2026-09-20 sprang
 * sie für genau diese Rezension von `-582554336` auf `-1130994804`, bei
 * unverändertem Text (1954 Zeichen) — sie wird offenbar über die mitlaufende
 * Relativzeit mitgebildet („vor 9 Monaten" → „vor 10 Monaten"). Zwischen Bau
 * (2026-09-18) und Merge lagen 51 h Gate-Sperre; in dieser Zeit ist der erste
 * Schlüssel verfallen. Ein Ausschluss auf `hashId` wäre still wirkungslos
 * geworden — und das Rot am Kundenrand hätte sich bequem dem 6-h-Cache
 * zuschreiben lassen (FEHLER-DB F-2462), also der falschen Ursache.
 * Die Google-`id` blieb dabei unverändert und ist zusätzlich
 * shopübergreifend dieselbe (DACH/US, gemessen 2026-09-18).
 *
 * @typedef {Object} AusgeschlosseneRezension
 * @property {string} googleId Google-Rezensions-id (stabil) — der Schlüssel
 * @property {string} autor    Anzeigename, nur zur Wiedererkennung
 * @property {string} grund    warum sie nicht ausgeliefert wird
 * @property {string} belegtAm ISO-Datum der Messung, auf der das Urteil beruht
 */

/** @type {AusgeschlosseneRezension[]} */
export const GOOGLE_REVIEWS_AUSSCHLUSS = [
  {
    googleId:
      'AbFvOqkWRIIM8yOy-0FFxmTmreXg0oH00TuOFc-QMusa9jFGJJi9RMQM0-tHrIJ0tGRAWVEdRaSt9w',
    autor: 'Ma Pe',
    grund:
      'Durchgehende Satire: der Text schreibt dem Anhänger Wirkungen zu, die ' +
      'als Übertreibung gemeint sind (Sprachen ohne Lernen, Atmen wird ' +
      'überflüssig, ein Hund habilitiert). Eine Stelle parodiert eine ' +
      'Heilungsgeschichte im Rollstuhl. Ausgeliefert unter 5 Sternen und ' +
      'Verifiziert-Haken liest sie sich als Tatsachenbericht.',
    belegtAm: '2026-09-18',
  },
  {
    googleId:
      'AbFvOqmMxYyt68DNpOEVH3QphP4lh7c9HyT9WsAtqKpVdKoB-pSR25I8g_gYvmRXeRzjYSUjmXxm',
    autor: 'Christian Froitzheim',
    grund:
      "Heilungsschilderung (Gehirntumor, 'Lebensretter'); Kuratier-Regel " +
      'Christian 2026-08-01, explizite Krankheits-Heilungsversprechen ' +
      'ausgeschlossen (Dateikopf googleReviewsCurated.js); AI-CEO-Entscheid ' +
      '2026-09-26 (review-Item live-feed-heilungsschilderung-hwg-' +
      'froitzheim-20260920). Aus demselben Grund aus dem Fallback-' +
      'Schnappschuss googleReviewsFallback.js entfernt.',
    belegtAm: '2026-09-26',
  },
];

/** Nur die stabilen Google-ids, als Menge — für den Filter. */
export const AUSSCHLUSS_IDS = new Set(
  GOOGLE_REVIEWS_AUSSCHLUSS.map((e) => e.googleId),
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
 * GEPRÜFT WIRD `quellId` (die stabile Google-id), NICHT `id` (die wandernde
 * Reputon-hashId) — Begründung oben bei der Schlüsselwahl. `id` wird als
 * Rückfall mitgelesen, weil `normalisiereReputonAntwort` dort die Google-id
 * ablegt, wenn der Feed einmal keine hashId liefert; ein Eintrag greift also
 * auch dann, und ein Feld-Ausfall auf der einen Seite macht den Ausschluss
 * nicht still wirkungslos.
 *
 * @param {{id?: string, quellId?: string}[]} reviews normalisierte Rezensionen
 * @returns {{reviews: {id?: string}[], treffer: Record<string, number>}}
 */
export function wendeAusschlussAn(reviews) {
  const treffer = {};
  for (const e of GOOGLE_REVIEWS_AUSSCHLUSS) treffer[e.googleId] = 0;
  if (!Array.isArray(reviews)) return {reviews: [], treffer};
  const behalten = reviews.filter((rv) => {
    if (!rv) return true;
    const kandidaten = [rv.quellId, rv.id]
      .filter((k) => k != null && String(k) !== '')
      .map(String);
    const treffer_id = kandidaten.find((k) => AUSSCHLUSS_IDS.has(k));
    if (treffer_id) {
      treffer[treffer_id] += 1;
      return false;
    }
    return true;
  });
  return {reviews: behalten, treffer};
}
