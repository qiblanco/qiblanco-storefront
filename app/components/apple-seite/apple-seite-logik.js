/*
 * REINE REGELN DES APPLE-SEITENBAUKASTENS (Grossjob 20261029-GROSSJOB-alle-
 * shop-seiten-apple-niveau-ausser-seo-geo, s03). Ohne React, ohne Build:
 *   node --test app/components/apple-seite/apple-seite.test.mjs
 *
 * Die Sektionen in AppleSektionen.jsx rufen nur diese Helfer. Ein Bau-Segment
 * prüft seine Seitendaten vor dem Bau mit `pruefeSeite(sektionen)`: jede Zeile
 * der Rückgabe ist ein Mangel, eine leere Liste heißt sauber.
 */

/** Shopify-CDN-Bild in einer Breite (wie alpha-vorlage-logik.mitBreite). */
export function mitBreite(url, breite) {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}width=${breite}`;
}

/** srcSet über die festen Breiten des Baukastens. */
export const BILD_BREITEN = Object.freeze([480, 750, 1080, 1500, 2048]);

export function bildSrcSet(url, breiten = BILD_BREITEN) {
  if (!url) return undefined;
  return breiten.map((b) => `${mitBreite(url, b)} ${b}w`).join(', ');
}

/** Text oder Liste von Texten -> Liste ohne leere Einträge. */
export function absaetze(text) {
  const liste = Array.isArray(text) ? text : [text];
  return liste.filter((t) => typeof t === 'string' && t.trim() !== '');
}

/** Bild-Text-Band: abwechselnd links/rechts, ausdrücklich gesetzt gewinnt. */
export function bandSeite(index, gesetzt) {
  if (gesetzt === 'links' || gesetzt === 'rechts') return gesetzt;
  return index % 2 ? 'rechts' : 'links';
}

/**
 * Was auf keiner Apple-Seite stehen darf (Christian 29.10.2026; Folgejob
 * 20261029-apple-seiten-box-foto-band-preisanker-weg-raten-mit-kette, Shop-
 * Regel S6): kein Preisanker, kein Schild. Geprüft wird jeder sichtbare Text.
 */
export const VERBOTEN = Object.freeze([
  {muster: /ultimate\s+power/i, grund: 'Schild „Ultimate Power“ (Christian 29.10.)'},
  {muster: /\bbestseller\b/i, grund: 'Schild „Bestseller“ (Shop-Regel S6)'},
  {muster: /\+\s?\d{1,3}([.,]\d{3})+\s*(nutzer|kunden|users)/i, grund: 'Nutzerzahl als Preisanker'},
  {muster: /\d[.,]\d\s*(★|sterne)?\s*(bei\s+)?google/i, grund: 'Google-Note als Preisanker'},
]);

/** Kein Konjunktiv-Rückzug (pr-manager/wissen/ohne-konjunktiv-flucht.md). */
export const KONJUNKTIV = /\b(könnte|könnten|würde|würden|dürfte|dürften|möglicherweise|eventuell)\b/i;

/** Alle sichtbaren Texte eines Datenobjekts (Strings in beliebiger Tiefe). */
export function texteVon(wert, aus = new Set(['href', 'url', 'src', 'bild', 'seite', 'art', 'id'])) {
  if (typeof wert === 'string') return [wert];
  if (Array.isArray(wert)) return wert.flatMap((w) => texteVon(w, aus));
  if (wert && typeof wert === 'object') {
    return Object.entries(wert).flatMap(([k, w]) => (aus.has(k) ? [] : texteVon(w, aus)));
  }
  return [];
}

/** Pflichtfelder je Sektion. */
export const PFLICHT = Object.freeze({
  hero: ['titel', 'bild'],
  fakten: ['kacheln'],
  band: ['titel', 'text', 'bild'],
  kapitel: ['etikett', 'titel', 'absaetze'],
  stimmen: ['titel', 'stimmen'],
  faq: ['titel', 'fragen'],
  cta: ['titel', 'cta'],
  anna: [],
});

function leer(w) {
  return w == null || w === '' || (Array.isArray(w) && w.length === 0);
}

/**
 * Prüft die Daten einer Seite. sektionen: [{art: 'hero'|…, …props}].
 * @returns {string[]} Mängel, leer = sauber
 */
export function pruefeSeite(sektionen) {
  const maengel = [];
  if (!Array.isArray(sektionen) || sektionen.length === 0) return ['keine Sektionen'];
  const h1 = sektionen.filter((s) => s?.art === 'hero').length;
  if (h1 !== 1) maengel.push(`genau eine Hero-Sektion (H1) verlangt, gefunden ${h1}`);
  if (sektionen[0]?.art !== 'hero') maengel.push('die erste Sektion ist nicht der Hero');
  if (!sektionen.some((s) => s?.art === 'anna')) maengel.push('Anna-Einbindung fehlt');
  sektionen.forEach((s, i) => {
    const pflicht = PFLICHT[s?.art];
    if (!pflicht) {
      maengel.push(`#${i}: unbekannte Sektion '${s?.art}'`);
      return;
    }
    for (const feld of pflicht) if (leer(s[feld])) maengel.push(`#${i} ${s.art}: Feld '${feld}' fehlt`);
    for (const t of texteVon(s)) {
      for (const v of VERBOTEN) if (v.muster.test(t)) maengel.push(`#${i} ${s.art}: ${v.grund}: „${t}“`);
      if (KONJUNKTIV.test(t)) maengel.push(`#${i} ${s.art}: Konjunktiv: „${t}“`);
    }
  });
  return maengel;
}
