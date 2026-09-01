/**
 * Deutsche Klartexte für die Konto-Fläche.
 *
 * WARUM: Die Customer Account API liefert Status als englische Enums
 * (PAID, FULFILLED, UNFULFILLED). Das Hydrogen-Scaffold hat sie roh ausgegeben —
 * ein Kunde las dort "UNFULFILLED" in seiner Bestellübersicht.
 *
 * FAIL-SOFT MIT ABSICHT: Ein unbekannter Status wird NICHT verschluckt und
 * nicht zu "Unbekannt" geglättet, sondern unverändert durchgereicht. Ein neuer
 * Shopify-Enum-Wert erscheint dann sichtbar als englisches Wort — hässlich,
 * aber auffindbar. Die Alternative (stiller Fallback) würde eine wachsende
 * Lücke unsichtbar machen: genau die Klasse "Software, die still das Falsche
 * anzeigt". Wer hier ein englisches Wort sieht, hat einen Befund, keinen Bug.
 */

const ZAHLUNG = {
  PENDING: 'Zahlung ausstehend',
  AUTHORIZED: 'Zahlung autorisiert',
  PARTIALLY_PAID: 'Teilweise bezahlt',
  PAID: 'Bezahlt',
  PARTIALLY_REFUNDED: 'Teilweise erstattet',
  REFUNDED: 'Erstattet',
  VOIDED: 'Storniert',
  EXPIRED: 'Abgelaufen',
};

const VERSAND = {
  SUCCESS: 'Versandt',
  FULFILLED: 'Versandt',
  IN_PROGRESS: 'Wird versandfertig gemacht',
  OPEN: 'In Vorbereitung',
  PENDING: 'In Vorbereitung',
  UNFULFILLED: 'Noch nicht versandt',
  SCHEDULED: 'Versand geplant',
  ON_HOLD: 'Zurückgestellt',
  CANCELLED: 'Storniert',
  ERROR: 'Versandproblem',
  FAILURE: 'Versandproblem',
};

/** @param {string|null|undefined} wert */
export function zahlungsText(wert) {
  if (!wert) return null;
  return ZAHLUNG[wert] ?? wert;
}

/** @param {string|null|undefined} wert */
export function versandText(wert) {
  if (!wert) return null;
  return VERSAND[wert] ?? wert;
}

/** Datum einheitlich deutsch — ein Ort statt drei Aufrufe im Baum. */
export function datumText(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
