import {ANNA, BILD, STIMMEN, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/zellstudien-ehrlich (s07). Die vier Arbeiten mit
 * Methode, Ergebnis und Grenze, jede als PDF. Aussortiert gegenüber C:
 * Badge-Reihe mit Google-Note, Bewertungs-Widget mit Sternen, Balkendiagramm,
 * Zahlenband, Produktkacheln, Funnel-Kacheln.
 */
const studie = (s, i) => ({
  art: 'kapitel',
  etikett: s.etikett,
  titel: `${s.titel}.`,
  absaetze: [`Methode: ${s.methode}`, `Ergebnis: ${s.ergebnis}`, `Grenze: ${s.grenze}`],
  quellen: [s.quelle],
  bild: i === 0 ? BILD.studie : null,
  link: {text: 'Publikation als PDF', href: s.pdf},
});

export const ZELLSTUDIEN_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Evidenz, mit Grenzen',
    titel: 'Die vier Zellstudien, eingeordnet.',
    unter: 'Was untersucht wurde, was herauskam und wo die Aussagekraft endet.',
    bild: BILD.denken,
    cta: ZIEL.qione,
    cta2: {text: 'Wie es wirkt', href: '/pages/so-wirkt-kohaerentes-wasser'},
  },
  {
    art: 'fakten',
    titel: 'Auf einen Blick.',
    kacheln: [
      {zahl: '4', titel: 'Publikationen', satz: 'In Fachjournalen, 2021 bis 2024.'},
      {zahl: '3', titel: 'In-vitro', satz: 'An Zellkulturen im Labor.'},
      {zahl: '171', titel: 'Berichte', satz: 'Erfahrungen, deskriptiv ausgewertet.'},
    ],
  },
  ...STUDIEN.map(studie),
  {
    art: 'band',
    etikett: 'Evidenzstufen',
    titel: 'Wo diese Studien stehen.',
    text: [
      'Von schwach nach stark: Laborzellen, Tierstudie, Studie am Menschen, Meta-Analyse.',
      'Unsere Arbeiten stehen auf der ersten Stufe. Eine randomisierte Studie am Menschen gibt es noch nicht.',
    ],
    bild: BILD.saft,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Fragen zur Evidenz.',
    fragen: [
      {f: 'Sind das Studien am Menschen?', a: 'Nein. Drei sind In-vitro-Studien an Zellkulturen, eine wertet Erfahrungsberichte deskriptiv aus.'},
      {f: 'Was bedeutet präklinisch?', a: 'Vor der Erprobung am Menschen, hier an Zellen im Labor.'},
      {f: 'Was belegen die Studien nicht?', a: 'Sie belegen keine Heilung und lassen sich nicht eins zu eins auf den Menschen übertragen.'},
      {f: 'Wie finde ich heraus, ob er mir etwas bringt?', a: 'Trag ihn 20 Tage. Überzeugt er dich nicht, bekommst du dein Geld zurück.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Die beste Evidenz ist deine eigene.',
    text: '20 Tage tragen. Nicht überzeugt, Geld zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
