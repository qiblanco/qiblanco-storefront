/**
 * Geldbetrag für Kundentext: ganze Beträge ohne Nachkommastellen, echte Cents
 * bleiben centgenau (Brain-Regel ganze-betraege-ohne-nachkommastellen).
 *
 * Neutraler Ort seit 2026-10-28 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
 * qione-qihome-qibracelet-ab, s05): die Funktion stand bis dahin nur in
 * campaign/the-alpha-kauf-laden.js. Die Qi-Alpha-Kaufseite und die Alpha-
 * Vorlage der Produktseiten nutzen jetzt dieselbe Stelle; the-alpha-kauf-
 * laden.js reicht sie unverändert weiter. Kein Netz, kein React: testbar mit
 * node --test.
 */
export function betragText(wert, waehrung = 'EUR') {
  const zahl = Number(wert);
  if (!Number.isFinite(zahl)) return null;
  const ganz = Math.round(zahl * 100) % 100 === 0;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: waehrung,
    minimumFractionDigits: ganz ? 0 : 2,
    maximumFractionDigits: ganz ? 0 : 2,
  }).format(zahl);
}
