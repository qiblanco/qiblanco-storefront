// Einwilligung in eine Bewertungsanfrage per E-Mail, erhoben am Kasse-Knopf
// (E1, Job 20261001-aiceo-s08-i-checkout-optin-bewertung; Entscheid in
// review.db, Schluessel ...-s06:vorlage:s06-vorlage-drittquellen-e1-e3).
//
// DIE VIER BEDINGUNGEN DES ENTSCHEIDS, und wo jede im Code steht:
//   separat           eigenes Feld, eigenes Cart-Attribut, nie mit etwas anderem
//                     zusammen erhoben (CartSummary.jsx)
//   unvorausgefuellt  die Checkbox hat weder `checked` noch `defaultChecked`
//   nicht gekoppelt   der Kasse-Knopf funktioniert mit und ohne Haken gleich;
//                     die Route liest den Wert, sie verlangt ihn nie
//   alle gleich       die Checkbox steht in JEDEM Warenkorb, ohne Bedingung
//
// WAS AN DER ORDER ANKOMMT (Cart-Attribut -> note_attribute):
//   bewertungsanfrage_optin       'ja' | 'nein'
//   bewertungsanfrage_optin_text  Version des gezeigten Wortlauts ('v1')
//   bewertungsanfrage_optin_at    ISO-Zeitpunkt der letzten ÄNDERUNG
// Fehlt `bewertungsanfrage_optin` ganz, wurde die Frage NICHT gestellt (Kauf am
// Kasse-Formular vorbei, z. B. ueber einen Direkt-zur-Kasse-Link). Das ist ein
// dritter Zustand und kein 'nein': eine Frage, die niemand gesehen hat, hat
// niemand verneint.
//
// Der Wert ist eine Willenserklaerung des Kunden, kein Tracking. Er wird
// deshalb unabhaengig vom Cookie-Consent geschrieben.
//
// Der Leser auf der anderen Seite der Grenze ist
// postkauf-manager/src/review_anstoss.py: nur wer am LETZTEN Kauf 'ja' trägt,
// wird überhaupt Kandidat.

export const BEWERTUNGSANFRAGE_FELD = 'bewertungsanfrage_optin';
export const BEWERTUNGSANFRAGE_ANGEZEIGT_FELD = 'bewertungsanfrage_angezeigt';

export const BEWERTUNGSANFRAGE_KEY = 'bewertungsanfrage_optin';
export const BEWERTUNGSANFRAGE_TEXT_KEY = 'bewertungsanfrage_optin_text';
export const BEWERTUNGSANFRAGE_ZEIT_KEY = 'bewertungsanfrage_optin_at';

// Der Wortlaut ist Teil des Nachweises: an der Order steht nur die Version,
// der Text dazu steht hier. Wer ihn aendert, vergibt eine NEUE Version und
// laesst die alte in WORTLAUTE stehen.
export const BEWERTUNGSANFRAGE_VERSION = 'v1';
export const WORTLAUTE = {
  v1: 'Wir dürfen dich nach der Lieferung per E-Mail um eine Bewertung deiner Bestellung bitten. Freiwillig, jederzeit abbestellbar.',
};
export const BEWERTUNGSANFRAGE_TEXT = WORTLAUTE[BEWERTUNGSANFRAGE_VERSION];

/**
 * Liest die Antwort aus dem Kasse-Formular.
 *
 * Eine nicht angehakte Checkbox schickt der Browser gar nicht mit. Ob die
 * Frage gestellt WURDE, sagt deshalb erst das versteckte Feld mit der
 * Wortlaut-Version. Ohne dieses Feld (oder mit unbekannter Version) ist die
 * Antwort null: nicht gefragt, also auch nicht verneint.
 *
 * @param {FormData | null | undefined} form
 * @returns {{version: string, wert: 'ja' | 'nein'} | null}
 */
export function bewertungsanfrageAusFormular(form) {
  if (!form || typeof form.get !== 'function') return null;
  const version = form.get(BEWERTUNGSANFRAGE_ANGEZEIGT_FELD);
  if (typeof version !== 'string' || !(version in WORTLAUTE)) return null;
  const haken = form.get(BEWERTUNGSANFRAGE_FELD);
  return {version, wert: haken === 'ja' ? 'ja' : 'nein'};
}

/**
 * Cart-Attribute für die Antwort. Leer, wenn nicht gefragt wurde oder sich
 * nichts geaendert hat: so bleibt der Zeitpunkt der ERSTEN Erklaerung stehen,
 * und ein zweiter Klick auf den Kasse-Knopf kostet keine Cart-Mutation.
 * Eine geaenderte Antwort (Haken wieder entfernt) ersetzt die alte samt
 * Zeitpunkt; die letzte Erklaerung gilt.
 *
 * @param {{version: string, wert: 'ja' | 'nein'} | null} antwort
 * @param {{bestehendeAttribute?: Array<{key?: string | null, value?: string | null}> | null,
 *          jetzt?: Date}} [optionen]
 * @returns {Array<{key: string, value: string}>}
 */
export function bewertungsanfrageCartAttributes(antwort, optionen = {}) {
  if (!antwort) return [];
  const {bestehendeAttribute = null, jetzt = new Date()} = optionen;
  const bisher = new Map();
  for (const eintrag of bestehendeAttribute ?? []) {
    if (eintrag?.key) bisher.set(eintrag.key, eintrag.value ?? '');
  }
  if (
    bisher.get(BEWERTUNGSANFRAGE_KEY) === antwort.wert &&
    bisher.get(BEWERTUNGSANFRAGE_TEXT_KEY) === antwort.version &&
    bisher.get(BEWERTUNGSANFRAGE_ZEIT_KEY)
  ) {
    return [];
  }
  return [
    {key: BEWERTUNGSANFRAGE_KEY, value: antwort.wert},
    {key: BEWERTUNGSANFRAGE_TEXT_KEY, value: antwort.version},
    {key: BEWERTUNGSANFRAGE_ZEIT_KEY, value: jetzt.toISOString()},
  ];
}
