// Geschenk-Angabe am Kasse-Knopf (Job 20261001-s07-geschenkoption-warenkorb,
// AI-CEO-Entscheid zum forschungs-meister-Eintrag
// sequenz-m2-geschenkfeld-checkout).
//
// WOZU: wer einen zweiten QiOne kauft (Muster M2 im postkauf-manager), kauft
// ihn für sich oder verschenkt ihn. Aus der Order war das bis heute nicht zu
// lesen. Die Checkbox fragt es dort, wo der Kunde es ohnehin weiß.
//
// WAS AN DER ORDER ANKOMMT (Cart-Attribut -> note_attribute):
//   geschenk  'ja'   Haken gesetzt
//             'nein' Checkbox gesehen, Haken nicht gesetzt
// Fehlt der Schlüssel ganz, wurde die Frage NICHT gestellt (Kauf am
// Kasse-Formular vorbei, Order vor dem Deploy). Das ist ein dritter Zustand
// und kein 'nein'. Der Leser auf der anderen Seite der Grenze,
// postkauf-manager/src/geschenk_angabe.py, hält die drei auseinander.
//
// BEWUSST KEIN VERSPRECHEN AM HAKEN (etwa "keine Rechnung mit Preis"): der
// Versand läuft über einen Logistiker, und nichts belegt, dass er das
// Attribut liest. Eine Zusage, die das Lager nicht kennt, wäre an der
// Haustür des Beschenkten gebrochen.
//
// Die Angabe ist eine Auskunft des Kunden, kein Tracking. Sie wird deshalb
// unabhängig vom Cookie-Consent geschrieben, und sie trägt nie mehr als
// dieses eine Wort.

export const GESCHENK_FELD = 'geschenk';
export const GESCHENK_ANGEZEIGT_FELD = 'geschenk_angezeigt';
export const GESCHENK_KEY = 'geschenk';
export const GESCHENK_TEXT = 'Das ist ein Geschenk';

const WERTE = new Set(['ja', 'nein']);

/**
 * Ist am Warenkorb schon "Geschenk" vermerkt? Dann steht der Haken beim
 * nächsten Öffnen wieder da, statt still eine frühere Antwort zu kippen.
 *
 * @param {Array<{key?: string | null, value?: string | null}> | null | undefined} attribute
 * @returns {boolean}
 */
export function geschenkVermerkt(attribute) {
  return (attribute ?? []).some(
    (eintrag) => eintrag?.key === GESCHENK_KEY && eintrag?.value === 'ja',
  );
}

/**
 * Liest die Antwort aus dem Kasse-Formular.
 *
 * Eine leere Checkbox schickt der Browser gar nicht mit. Ob die Frage
 * gestellt WURDE, sagt erst das versteckte Feld. Ohne es ist die Antwort
 * null: nicht gefragt, also auch nicht verneint.
 *
 * @param {FormData | null | undefined} form
 * @returns {'ja' | 'nein' | null}
 */
export function geschenkAusFormular(form) {
  if (!form || typeof form.get !== 'function') return null;
  if (form.get(GESCHENK_ANGEZEIGT_FELD) !== '1') return null;
  return form.get(GESCHENK_FELD) === 'ja' ? 'ja' : 'nein';
}

/**
 * Cart-Attribut für die Antwort. Leer, wenn nicht gefragt wurde oder sich
 * nichts geändert hat: ein zweiter Klick auf den Kasse-Knopf kostet dann
 * keine Cart-Mutation. Ein entfernter Haken ersetzt ein früheres 'ja'; die
 * letzte Antwort gilt.
 *
 * @param {'ja' | 'nein' | null} wert
 * @param {{bestehendeAttribute?: Array<{key?: string | null, value?: string | null}> | null}} [optionen]
 * @returns {Array<{key: string, value: string}>}
 */
export function geschenkCartAttributes(wert, optionen = {}) {
  if (!WERTE.has(wert)) return [];
  const bisher = (optionen.bestehendeAttribute ?? []).find(
    (eintrag) => eintrag?.key === GESCHENK_KEY,
  );
  if (bisher?.value === wert) return [];
  return [{key: GESCHENK_KEY, value: wert}];
}
