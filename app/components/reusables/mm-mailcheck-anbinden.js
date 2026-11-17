// app/components/reusables/mm-mailcheck-anbinden.js
// Bindet die Tippfehler-Pruefung (mm-mailcheck.js, Elina EL-20261117-d53e6265) an ein Formular. Nur im Browser; beim
// Serverrendern und ohne Formular tut es nichts. mm-mailcheck.js ist dieselbe Datei wie im Mail Manager
// (mail-manager/src/static/mm-mailcheck.js); wer sie aendert, aendert beide.
import './mm-mailcheck.js';

export function mailcheckAnbinden(form, opt) {
  if (typeof window === 'undefined' || !form || !window.qbMailcheck) return null;
  return window.qbMailcheck.anbinden(form, opt || {});
}
