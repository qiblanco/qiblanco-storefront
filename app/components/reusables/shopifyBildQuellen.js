/**
 * shopifyBildQuellen — srcset-Leiter für Bilder vom Shopify-Datei-CDN.
 *
 * WOZU
 * Ein nacktes <img src="https://cdn.shopify.com/.../foto.webp"> lädt IMMER die
 * Masterdatei, egal wie klein die Fläche ist. Gemessen am 2026-09-01 auf
 * /pages/schlaf-zellen-schutz: 1714 px / 362 KB für eine Kachel von 342 CSS-px.
 * Mit `&width=344` liefert dasselbe CDN 344 px / 21 KB — dieselbe Datei, 94 %
 * weniger Bytes. Diese Funktion baut daraus die Leiter fürs srcset.
 *
 * WARUM DIE LEITER NICHT AUF DIE MASTERBREITE GEDECKELT WIRD
 * Shopify skaliert NIE hoch: eine angefragte Breite über der Masterbreite
 * liefert die Masterdatei zurück (nachgemessen — `&width=1376` auf einen
 * 668-px-Master gibt 668 px, byte-gleich zum Original). Eine Sprosse oberhalb
 * des Masters überzeichnet damit ihren w-Deskriptor. Das ist unschädlich und
 * ausdrücklich gewollt:
 *   - Der Browser wählt die kleinste Sprosse >= Bedarf. Ist der Bedarf <=
 *     Master, bekommt er mindestens den Bedarf. Ist der Bedarf > Master,
 *     bekommt er den Master — also genau das, was er ohne srcset auch bekommen
 *     hätte. Schlechter als vorher wird es in keinem Fall.
 *   - Wird später ein größerer Master hochgeladen (der offene Asset-Weg (a)
 *     des Jobs 20260901-lp-a-mechanismus-bilder-zu-klein-asset-entscheid),
 *     liefert die Leiter die höhere Auflösung SOFORT aus, ohne Code-
 *     Änderung. Eine hart gedeckelte Leiter müsste dafür nachgezogen werden
 *     und würde es erfahrungsgemäß nicht.
 *
 * Die Leiter ist bewusst KEINE Zusage über die Bildschärfe: ob eine Quelle
 * für eine Fläche groß genug ist, entscheidet der Master, nicht das Markup.
 */

/** Sprossen in CSS-/Gerätepixeln. Deckt 320..1440 breite Kacheln bis dpr 3. */
export const BILD_LEITER = [320, 480, 640, 800, 1100, 1440];

const CDN_RX = /^https?:\/\/cdn\.shopify\.com\//i;

/**
 * srcset-Wert für eine Shopify-CDN-URL.
 *
 * Gibt `undefined` zurück, wenn die URL nicht vom Shopify-Datei-CDN stammt
 * (lokale /campaigns/*.jpg, YouTube-Poster, Google-Avatare). Ein `srcSet={undefined}`
 * rendert React gar nicht — das Bild verhaelt sich dann exakt wie vorher.
 * Fail-soft ist hier Absicht: ein falsch umgeschriebener Fremd-Host wäre ein
 * 404 statt eines nicht optimierten Bildes.
 *
 * @param {string} url    Bildquelle
 * @param {number[]} [leiter=BILD_LEITER]
 * @returns {string|undefined}
 */
export function bildSrcSet(url, leiter = BILD_LEITER) {
  if (!url || !CDN_RX.test(url)) return undefined;
  const trenner = url.includes('?') ? '&' : '?';
  return leiter.map((w) => `${url}${trenner}width=${w} ${w}w`).join(', ');
}
