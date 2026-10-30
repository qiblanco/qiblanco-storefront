/*
 * WANN STEHT DIE SCHLUSSLEISTE? Reine Regel zu reusables/Schlussleiste.jsx,
 * ohne Browser prüfbar (schlussleiste.test.mjs).
 *
 * Die Konfigurator-Kaufseiten (AlphaVorlage: /products/qibracelet,
 * /products/qione-2-pro, /products/qihome-air, /products/qione-kette) und
 * /products/qi-alpha (TheAlphaShop) haben genau EINEN Kaufknopf: in der
 * Zusammenfassung nach der Auswahl. Danach folgen Box, Wissen, Stimmen, Fragen
 * und der Fuß (live mobil gut 3.000 px hoch). Am Seitenende war deshalb kein
 * Kaufknopf mehr im Bild (Geräteprobe echtgeraet_probe.py, 30.10.2026: „am
 * Seitenende kein aktiver Kaufknopf“; Christian 30.10.2026: „Das müsste doch
 * eigentlich Standard sein beim Homepage Bauer.“).
 *
 * DIE REGEL: die Leiste steht, sobald der Knopf der Zusammenfassung nach OBEN
 * aus dem Bild gescrollt ist, also wer die Auswahl hinter sich hat. Davor nie:
 * Shop-Regel S2 (kein Kaufknopf im Kopf vor den preisrelevanten Optionen,
 * „eine klebende Kaufleiste ist erlaubt“). Steht der Knopf im Bild, ist sie
 * weg (kein zweiter Knopf daneben). Ohne gemessenen Knopf bleibt sie weg.
 * Die Lage kommt aus lib/kaufleiste-sicht.js (100svh + Hysterese), damit das
 * Ein- und Ausklappen der iPhone-Browserleisten nichts umschaltet.
 */

/** Je Gerät: mobil an, Desktop aus (dort steht der Knopf neben der Galerie). */
export const SCHLUSSLEISTE_AN = {desktop: false, mobil: true};

/**
 * @param {{geraetAn: boolean, knopf: {da: boolean, imBild: boolean, darueber: boolean}}} lage
 * @returns {boolean}
 */
export function schlussleisteSichtbar({geraetAn, knopf}) {
  if (!geraetAn || !knopf?.da) return false;
  return !knopf.imBild && knopf.darueber;
}
