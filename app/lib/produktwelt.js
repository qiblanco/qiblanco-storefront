/**
 * produktwelt — ordnet eine Google-Bewertung einer Produktwelt zu: 'kakao'
 * (Crystal Cacao) oder 'qi' (QiOne, QiHome Air, QiBracelet, Qi Alpha, Qi Blanco).
 *
 * Christian 21.11.2026 (Job 20261121-prio1-bewertungs-widget-kakao-
 * bewertungen-nicht-auf-qione-seiten-de-und-us): „Wenn Leute den Kakao
 * bewerten, sollte das nicht bei unserer 5-Sterne-Anzeige auf den Seiten
 * angezeigt werden."
 *
 * Der Business-API-Export (rezensionen/src/produktwelt.py) trägt je Bewertung
 * das Feld `produktwelt` und je Welt einen Block: business[0] = 'qi',
 * business[1] = 'kakao'. Das Feld gewinnt. Ohne Feld (Reputon-Rückfall,
 * Schnappschuss) entscheiden dieselben Wörter wie im Export: Kakao-Wort =
 * 'kakao'; trinken ohne Schmuck-/Gerätewort = 'kakao'; sonst 'qi'.
 * Spiegel derselben Ausdrücke: rezensionen/src/produktwelt.py und
 * assets/qb-reviews.js im Global Englisch-Shop.
 */

export const KAKAO_RE =
  /(ka[ck]ao|cacao|cocoa|crystal[\s-]*cacao|hot[\s-]+chocolate|hei(ss|ß)e[nr]?\s+schokolade|trinkschokolade)/i;
export const TRINKEN_RE =
  /\b(trinke\w*|trinkt|getrunken|drink(s|ing)?|drank|becher|tasse|mug|sip\w*)\b/i;
export const SCHMUCK_RE =
  /(qi\s*-?\s*one|qione|qihome|qi\s*home|qibracelet|bracelet|armband|kette|necklace|anh[aä]nger|pendant|qi\s*alpha|schmuck|jewel|tr[aä]g(e|t|en|st)\b|wear\w*|chip|ger[aä]t|device|strahlung|radiation|elektrosmog|emf)/i;

/** Welt einer Bewertung (Feed-Eintrag oder normalisierte Karte mit `text`). */
export function weltVon(r) {
  if (r && (r.produktwelt === 'qi' || r.produktwelt === 'kakao')) {
    return r.produktwelt;
  }
  const t = String((r && r.text) || '');
  if (KAKAO_RE.test(t)) return 'kakao';
  if (TRINKEN_RE.test(t) && !SCHMUCK_RE.test(t)) return 'kakao';
  return 'qi';
}

/** Der Block der Welt aus einem Feed im Reputon-Format; sonst business[0]. */
export function blockFuerWelt(data, welt) {
  const bs = Array.isArray(data?.business) ? data.business : [];
  return bs.find((b) => b && b.produktwelt === welt) || bs[0];
}
