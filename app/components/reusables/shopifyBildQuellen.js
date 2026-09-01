/**
 * shopifyBildQuellen — srcset-Leiter fuer Bilder vom Shopify-Datei-CDN.
 *
 * WOZU
 * Ein nacktes <img src="https://cdn.shopify.com/.../foto.webp"> laedt IMMER die
 * Masterdatei, egal wie klein die Flaeche ist. Gemessen am 2026-09-01 auf
 * /pages/schlaf-zellen-schutz: 1714 px / 362 KB fuer eine Kachel von 342 CSS-px.
 * Mit `&width=344` liefert dasselbe CDN 344 px / 21 KB — dieselbe Datei, 94 %
 * weniger Bytes. Diese Funktion baut daraus die Leiter fuers srcset.
 *
 * WARUM DIE LEITER NICHT AUF DIE MASTERBREITE GEDECKELT WIRD
 * Shopify skaliert NIE hoch: eine angefragte Breite ueber der Masterbreite
 * liefert die Masterdatei zurueck (nachgemessen — `&width=1376` auf einen
 * 668-px-Master gibt 668 px, byte-gleich zum Original). Eine Sprosse oberhalb
 * des Masters ueberzeichnet damit ihren w-Deskriptor. Das ist unschaedlich und
 * ausdruecklich gewollt:
 *   - Der Browser waehlt die kleinste Sprosse >= Bedarf. Ist der Bedarf <=
 *     Master, bekommt er mindestens den Bedarf. Ist der Bedarf > Master,
 *     bekommt er den Master — also genau das, was er ohne srcset auch bekommen
 *     haette. Schlechter als vorher wird es in keinem Fall.
 *   - Wird spaeter ein groesserer Master hochgeladen (der offene Asset-Weg (a)
 *     des Jobs 20260901-lp-a-mechanismus-bilder-zu-klein-asset-entscheid),
 *     liefert die Leiter die hoehere Aufloesung SOFORT aus, ohne Code-
 *     Aenderung. Eine hart gedeckelte Leiter muesste dafuer nachgezogen werden
 *     und wuerde es erfahrungsgemaess nicht.
 *
 * Die Leiter ist bewusst KEINE Zusage ueber die Bildschaerfe: ob eine Quelle
 * fuer eine Flaeche gross genug ist, entscheidet der Master, nicht das Markup.
 */

/** Sprossen in CSS-/Geraetepixeln. Deckt 320..1440 breite Kacheln bis dpr 3. */
export const BILD_LEITER = [320, 480, 640, 800, 1100, 1440];

const CDN_RX = /^https?:\/\/cdn\.shopify\.com\//i;

/**
 * srcset-Wert fuer eine Shopify-CDN-URL.
 *
 * Gibt `undefined` zurueck, wenn die URL nicht vom Shopify-Datei-CDN stammt
 * (lokale /campaigns/*.jpg, YouTube-Poster, Google-Avatare). Ein `srcSet={undefined}`
 * rendert React gar nicht — das Bild verhaelt sich dann exakt wie vorher.
 * Fail-soft ist hier Absicht: ein falsch umgeschriebener Fremd-Host waere ein
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
