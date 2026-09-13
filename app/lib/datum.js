/**
 * Datums-Anzeige für SSR-gerenderte Seiten — EIN Ort, EINE Zone.
 *
 * WARUM ES DIESE DATEI GIBT (Job 20260913-blog-hydration-bricht-bei-jedem-
 * dach-besucher-zeitzonen-datum): `Intl.DateTimeFormat` ohne `timeZone` nimmt
 * die Zone der UMGEBUNG. Auf dem Server ist das UTC, im Browser die Zone des
 * Kunden. Faellt ein Zeitstempel in das Fenster zwischen beiden Zonen, rendert
 * der Server einen anderen Tag als der Client — React findet beim Hydrieren
 * einen abweichenden Textknoten und wirft #418, in der Folge #423 und #425.
 *
 * Gemessen am 2026-09-13 live auf /blogs/wissen, die Zone als einzige Variable:
 *
 *     UTC                   0 Fehler      <- der Standort des Servers
 *     America/New_York      0
 *     Pacific/Honolulu     39
 *     Europe/Berlin        41             <- der Standort unserer Kundschaft
 *     Pacific/Kiritimati   45
 *
 * Der Defekt traf also nicht einen Randfall, sondern jeden Aufruf jeder
 * Blog-Seite durch einen DACH-Kunden.
 *
 * WARUM EUROPE/BERLIN UND NICHT DIE ZONE DES LESERS: ein Erscheinungs- oder
 * Bestelldatum ist ein Kalendertag, kein Zeitpunkt. Ein Artikel erscheint an
 * einem Tag — nicht an einem anderen, nur weil jemand ihn aus Honolulu liest.
 * Dieselbe Entscheidung ist im Haus schon zweimal so gefallen und steht in
 * app/lib/withdrawal.js (Widerrufs-Zeitstempel) und in
 * app/lib/qi-master-preisstufen.js (`tagIn`, Stufenwechsel). Genau
 * withdrawal.js nannten die beiden Blog-Routen im Kommentar als ihr
 * Hausmuster — sie hatten die SPRACHE daraus übernommen und die ZONE
 * daneben liegen lassen.
 *
 * Wer hier eine Zone braucht, die vom Leser abhängt, rendert sie NICHT im
 * SSR-Pfad, sondern nach der Hydration (useEffect) — sonst ist dieser Bruch
 * sofort zurück.
 */

/** Die redaktionelle Zone des Hauses. Ein Ort, damit sie nie zweimal driftet. */
export const HAUS_ZEITZONE = 'Europe/Berlin';

/**
 * Kalendertag, ausgeschrieben: "31. August 2026".
 *
 * @param {string|number|Date|null|undefined} wert ISO-Zeitstempel oder Date
 * @param {{zeitzone?: string}} [optionen]
 * @returns {string} leerer String, wenn nichts oder Unbrauchbares kommt —
 *   FAIL-SOFT, weil ein fehlendes Datum eine Seite nicht kosten darf.
 */
export function tagLang(wert, {zeitzone = HAUS_ZEITZONE} = {}) {
  const d = zuDatum(wert);
  if (!d) return '';
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zeitzone,
  }).format(d);
}

/**
 * Kalendertag mit fuehrender Null: "31. August 2026" mit zweistelligem Tag.
 * Eigene Funktion statt eines Schalters, weil die Konto-Ansicht die Daten
 * untereinander stellt und dort eine springende Spaltenbreite auffaellt.
 */
export function tagLangZweistellig(wert, {zeitzone = HAUS_ZEITZONE} = {}) {
  const d = zuDatum(wert);
  if (!d) return '';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: zeitzone,
  }).format(d);
}

/** Alles, was hereinkommt, auf ein brauchbares Date bringen — oder auf null. */
function zuDatum(wert) {
  if (wert === null || wert === undefined || wert === '') return null;
  const d = wert instanceof Date ? wert : new Date(wert);
  return Number.isNaN(d.getTime()) ? null : d;
}
