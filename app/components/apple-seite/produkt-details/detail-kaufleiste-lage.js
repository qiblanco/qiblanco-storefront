/*
 * WANN STEHT DIE KAUFLEISTE DER DETAILSEITEN? Reine Regel zu
 * DetailKaufleiste.jsx, ohne Browser prüfbar (detail-kaufleiste.test.mjs).
 *
 * ANLASS (Geräteprobe echtgeraet_probe.py, live 31.10./01.11.2026): auf
 * /pages/qione-2-pro-details, /pages/qihome-details und
 * /pages/qibracelet-details stand am Seitenende kein Kaufknopf im Bild. Der
 * letzte „Jetzt kaufen“ liegt rund 400 px über dem Fuß, und der Fuß ist mobil
 * 3.269 px hoch. Wer bis unten scrollt, sieht vier Bildschirme lang keinen Weg
 * zum Kauf. Gleicher Befund und gleiches Haus-Muster wie /pages/start-b (s08,
 * #1117) und die Konfigurator-Kaufseiten (s09, #1119).
 *
 * DIE REGEL (wie StickyKaufknopf auf start-b): die Leiste steht, sobald der
 * Kopf nach OBEN aus dem Bild ist. Im Kopf steht „Jetzt kaufen“ schon. Weg ist
 * sie, solange ein Kaufknopf der Seite im Bild ist (Kopf oder Abschluss): zwei
 * gleiche Knöpfe übereinander wären Doppelung. Am Seitenende bleibt sie
 * stehen. Der Fuß bekommt mobil ihre Höhe als festes Polster
 * (produkt-details-apple.css), damit Impressum, Datenschutz und Widerruf frei
 * bleiben. Ohne gemessenen Kopf bleibt sie weg.
 * Die Lage kommt aus lib/kaufleiste-sicht.js (100svh + Hysterese): das Ein-
 * und Ausklappen der iPhone-Browserleisten schaltet nichts um.
 */

/** Je Gerät: mobil an, Desktop aus (dort ist der Abschluss-Knopf breit im Bild). */
export const DETAIL_KAUFLEISTE_AN = {desktop: false, mobil: true};

/** Name in der Leiste je Seite (wie im Kopf). Seiten ohne Eintrag: keine Leiste. */
export const DETAIL_KAUFLEISTE_NAME = Object.freeze({
  'qione-2-pro-details': 'QiOne® 2 Pro',
  'qihome-details': 'QiHome® Air',
  'qibracelet-details': 'QiBracelet®',
});

/**
 * Name und Kaufseite der Leiste: die Kaufseite ist die des Kopf-Knopfs, so
 * führt die Leiste immer dorthin, wohin der Kopf führt.
 * @param {string} seite
 * @param {Array<any>} sektionen
 * @returns {{name: string, href: string}|null}
 */
export function detailKaufleiste(seite, sektionen) {
  const name = DETAIL_KAUFLEISTE_NAME[seite];
  const href = sektionen?.find((s) => s.art === 'hero')?.cta?.href;
  return name && href ? {name, href} : null;
}

/**
 * @param {{geraetAn: boolean,
 *   kopf: {da: boolean, imBild: boolean, darueber: boolean}|null|undefined,
 *   knoepfe: {da: boolean, imBild: boolean}|null|undefined}} lage
 * @returns {boolean}
 */
export function detailKaufleisteSichtbar({geraetAn, kopf, knoepfe}) {
  if (!geraetAn || !kopf?.da) return false;
  if (kopf.imBild || !kopf.darueber) return false;
  return !knoepfe?.imBild;
}
