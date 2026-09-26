/**
 * googleReviewsFallback — statischer Notfall-Schnappschuss echter Google-
 * Rezensionen (Quelle: Reputon-Storefront-Feed, Stand 2026-07-31, live 437
 * Bewertungen). Wird NUR gerendert, wenn der server-gecachte Live-Abruf
 * (googleRating.server.js) scheitert — nie erfundene Inhalte, nur echte Reviews.
 * Ausgeliefert wird er nur DURCH den Ausschluss (schnappschussMitAusschluss,
 * per Name — der Schnappschuss trägt keine Google-id).
 * zeitText ist bewusst leer (eine eingefrorene Relativzeit würde lügen).
 */
export const GOOGLE_REVIEWS_FALLBACK = [
  {
    "id": "597125765",
    "name": "A. Schmitz",
    "foto": "https://lh3.googleusercontent.com/a/ACg8ocKx3hAaWKtpC-JGyBn2GeFJGzB6cm_bPMaV8jp-1MDB2JQ1EA=s120-c-rp-mo-ba12-br100",
    "bilder": [],
    "rating": 5,
    "text": "Beim ersten Anlegen der Kette mit Qi Blanco 2 Pro kribbelte es v.a in den Armen, dann aber auch in den Beinen. Ich habe das Gefühl von mehr Leichtigkeit/Gelassenheit und Lächeln seitdem ich dies trage. Das Kribbeln trat später nicht mehr auf.",
    "zeitText": ""
  },
  {
    "id": "-162023605",
    "name": "Jes Sica",
    "foto": "https://lh3.googleusercontent.com/a/ACg8ocLB9Nnl3DxVlUkxSPLSXUX0MBBlAV-H7BV0b8kD6O-0njGNHg=s120-c-rp-mo-br100",
    "bilder": [],
    "rating": 5,
    "text": "Meine Tochter trägt sie ständig 😂obwohl es überhaupt nicht ihr Geschmack ist👍das will doch was heißen 😁",
    "zeitText": ""
  },
  {
    "id": "1399317545",
    "name": "Ray Miranda",
    "foto": "https://lh3.googleusercontent.com/a/ACg8ocJApco7aVs912Fbup6jVWZQmaE8q_HN7YmZS_xJFYuIHIg2AA=s120-c-rp-mo-br100",
    "bilder": [],
    "rating": 5,
    "text": "it change me a lot , sleep better and more calm",
    "zeitText": ""
  },
  {
    "id": "1596748244",
    "name": "Manuel",
    "foto": "https://lh3.googleusercontent.com/a/ACg8ocKprxQgr6y_a3TiNmHp7gQvRg9mC1xmITvWxybcxQsuC3_vZg=s120-c-rp-mo-br100",
    "bilder": [],
    "rating": 5,
    "text": "Meine Frau und ich haben die Wirkung direkt gespürt. Zum Teil in Form einer Entgiftung und in Form einer neuen Leichtigkeit. Nie wieder ohne.",
    "zeitText": ""
  },
  {
    "id": "-400900707",
    "name": "Stefania Stock",
    "foto": "https://lh3.googleusercontent.com/a/ACg8ocJ6iblD6KwlfXJ4p9LPQ6-BZJcwV2RGyMyAXITvAGqY-pZJMx4=s120-c-rp-mo-br100",
    "bilder": [],
    "rating": 5,
    "text": "Nach kürzester Zeit hat der QiOne 2 Pro mir bei einer emotionalen Herausforderung geholfen, mich wieder innerlich zu zentrieren und auch auszubalancieren.\nIch kann wieder durchschlafen und selbst bei wenigen Stunden Schlaf, bin ich am nächsten Tag erholt\nIch kann den QiOne 2 Pro jedem empfehlen, den es ruft 💖",
    "zeitText": ""
  }
];

/**
 * AI-Zusammenfassung von Google — statischer Fallback (Stand 2026-07-27,
 * Quelle: Reputon-Feed business.summary.items). Wird nur genutzt, wenn der
 * Live-Abruf keine Zusammenfassung liefert (nie erfunden, echte Kernthemen).
 */
export const GOOGLE_AI_SUMMARY_FALLBACK = [
  'Regeneration des Körpers',
  'Steigerung des Selbstbewusstseins',
  'Verbesserter Schlaf und innere Ruhe',
];
