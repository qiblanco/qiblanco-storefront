import {ANNA, BILD, STIMMEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/das-20-tage-versprechen (s07). Trust-Hub Risiko-
 * Umkehr: die Rückgabe hängt an Frist und Überzeugung, nie am Spüren.
 * Aussortiert gegenüber C: Badge-Reihe mit Google-Note, Bewertungs-Widget mit
 * Sternen, Zahlenband, doppelte Abschlussblöcke.
 */
export const VERSPRECHEN_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Das 20-Tage-Versprechen',
    titel: '20 Tage. Kein Kleingedrucktes. Kein „nur wenn“.',
    unter: 'Du testest in Ruhe. Überzeugt er dich nicht, bekommst du dein Geld zurück.',
    bild: BILD.paar,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Was gilt.',
    kacheln: [
      {zahl: '20', titel: 'Tage ab Erhalt', satz: 'Zeit für deinen echten Alltag.'},
      {zahl: '0', titel: 'Gründe nötig', satz: 'Nicht überzeugt genügt.'},
      {zahl: '0 %', titel: 'Finanzierung', satz: 'Auch in Raten über Klarna oder PayPal, mit Käuferschutz.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'So läuft es',
    titel: 'Rückgabe in vier Schritten.',
    absaetze: [
      'Bestellen. Auf Wunsch in Raten über Klarna oder PayPal.',
      '20 Tage tragen. Ohne Eile, ohne Countdown.',
      'Nicht überzeugt? Melde dich innerhalb von 20 Tagen ab Erhalt. Ein Grund ist nicht nötig.',
      'Zurücksenden. Du bekommst den Betrag erstattet.',
    ],
  },
  {
    art: 'band',
    etikett: 'Frist statt Gefühl',
    titel: 'Die Rückgabe hängt an der Frist. Nicht am Spüren.',
    text: [
      'Der beschriebene Effekt hängt nicht davon ab, ob du ihn spürst.',
      'Deshalb zählt nur deine Überzeugung. Fehlt sie, bekommst du dein Geld.',
    ],
    bild: BILD.ruhe,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Fragen zur Rückgabe.',
    fragen: [
      {f: 'Wie lange habe ich Zeit?', a: '20 Tage ab Erhalt. In dieser Frist meldest du dich, wenn er dich nicht überzeugt.'},
      {f: 'Muss ich einen Grund angeben?', a: 'Nein. Nicht überzeugt genügt.'},
      {f: 'Gilt das auch bei Ratenzahlung?', a: 'Ja. Auch mit Klarna oder PayPal in Raten gilt dieselbe Rückgabe samt Käuferschutz.'},
      {f: 'Muss ich etwas gespürt haben?', a: 'Nein. Die Rückgabe hängt nur an der Frist und an deiner Überzeugung.'},
      {f: 'Wie bekomme ich mein Geld zurück?', a: 'Du meldest die Rückgabe, sendest zurück und bekommst den Betrag erstattet.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Das Risiko liegt bei uns.',
    text: 'Starte in Ruhe. 20 Tage, Geld zurück ohne Grund.',
    cta: ZIEL.qione,
    cta2: {text: 'Erst die Belege ansehen', href: '/pages/wir-machen-ihn-auf'},
  },
  ANNA,
]);
