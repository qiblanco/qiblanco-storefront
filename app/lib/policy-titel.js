/**
 * Deutsche Anzeige-Titel der Shopify-Policies — EINE Quelle für
 * /policies (Übersicht) und /policies/<handle> (Detailseite).
 *
 * WARUM: Der Rumpf dieser Seiten ist deutsch gepflegt, die Titel kommen aus
 * dem Shopify-Admin aber unuebersetzt englisch zurück. Live gemessen
 * 2026-08-15 stand auf allen vier Policy-Seiten eine englische Überschrift
 * über deutschem Rechtstext ("Refund Policy" über "Sie haben das Recht ...").
 *
 * Abgebildet wird ausschließlich der ANZEIGE-Titel. Der rechtlich wirksame
 * Rumpf (policy.body) bleibt unangetastet und kommt weiter aus dem Admin.
 *
 * Unbekannte Handles fallen bewusst auf den Shopify-Titel zurück: so
 * erfindet diese Tabelle nie einen Titel für eine Police, die sie nicht
 * kennt — eine neu im Admin angelegte Police erscheint dann mit ihrem
 * Original-Titel statt mit einer falschen Uebersetzung.
 */
export const POLICY_TITEL_DE = {
  'refund-policy': 'Rückerstattungsrichtlinie',
  'privacy-policy': 'Datenschutzerklärung',
  'terms-of-service': 'Nutzungsbedingungen',
  'shipping-policy': 'Versandrichtlinie',
  'subscription-policy': 'Abonnementbedingungen',
  'contact-information': 'Kontaktinformationen',
};

/**
 * Ein Satz je Police — was der Leser dort für sich findet.
 *
 * Bewusst aus SEINER Sicht formuliert (Kundenwert-Doktrin KWD-0001: jede
 * Aussage ist sein Zustand, nicht unser Dokumenttyp). Auf der Übersicht stand
 * vorher nur eine nackte Titelliste; wer wissen wollte, wo die Rückgabe steht,
 * musste raten.
 *
 * Rein beschreibend — diese Zeilen sind KEIN Rechtstext und ersetzen keine
 * Aussage der jeweiligen Police.
 */
export const POLICY_BESCHREIBUNG_DE = {
  'refund-policy': 'Wie Sie zurückgeben und Ihr Geld zurückerhalten.',
  'privacy-policy': 'Welche Daten wir verarbeiten und wie Sie widersprechen.',
  'terms-of-service': 'Die Bedingungen, unter denen Sie diese Website nutzen.',
  'shipping-policy': 'Wann Ihre Bestellung ankommt und was der Versand kostet.',
  'subscription-policy': 'Laufzeit, Verlängerung und Kündigung Ihres Abonnements.',
  'contact-information': 'Wie Sie uns erreichen.',
};

/**
 * @param {string|undefined} handle
 * @param {string|undefined} fallback  Titel aus dem Shopify-Admin
 * @returns {string}
 */
export function policyTitelDe(handle, fallback) {
  return POLICY_TITEL_DE[handle] ?? fallback ?? '';
}

/**
 * @param {string|undefined} handle
 * @returns {string} Leerstring, wenn die Police hier nicht beschrieben ist —
 *   die Karte rendert dann nur ihren Titel, statt etwas zu behaupten.
 */
export function policyBeschreibungDe(handle) {
  return POLICY_BESCHREIBUNG_DE[handle] ?? '';
}
