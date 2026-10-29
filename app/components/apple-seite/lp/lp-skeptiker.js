import {ANNA, BILD, STIMMEN, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/wir-machen-ihn-auf (s07). Message-Match-LP der
 * Ad-Welle C (qb45-c1 „Ist das nicht ein Scam? Machen wir ihn auf.“).
 * Drei prüfbare Ebenen: Aufbau, Messung, Erfahrung. Aussortiert gegenüber C:
 * Badge-Reihe mit Google-Note, Bewertungs-Widget mit Sternen, Balkendiagramm,
 * Zahlenband, Funnel-Kacheln.
 */
export const SKEPTIKER_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Für Skeptiker',
    titel: '„Ist das Einbildung?“ Gute Frage. Machen wir ihn auf.',
    unter: 'Was im Chip steckt, was gemessen wurde, was Menschen berichten. Mit Quellen und mit Grenzen.',
    bild: BILD.qione,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Drei Ebenen. Du prüfst selbst.',
    kacheln: [
      {zahl: '1', titel: 'Aufbau', satz: 'Gitterchip® aus 750er Gold in Chirurgenstahl.'},
      {zahl: '2', titel: 'Messung', satz: 'Vier publizierte Arbeiten, offen als PDF.'},
      {zahl: '3', titel: 'Erfahrung', satz: '171 ausgewertete Berichte.'},
    ],
  },
  {
    art: 'band',
    etikett: 'Ebene 1 · Aufbau',
    titel: 'Was physisch im Chip steckt.',
    text: [
      'Ein Gitter aus 750er Gold mit 22,61 mm³ Wirkvolumen, eingefasst in Chirurgenstahl.',
      'Kein Akku, keine Elektronik, keine App. Er arbeitet passiv, solange du ihn trägst.',
    ],
    bild: BILD.gitter,
  },
  {
    art: 'kapitel',
    etikett: 'Ebene 2 · Messung',
    titel: 'Was in Zellkulturen gemessen wurde.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet. Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
      'Das sind Studien an Zellen im Labor, nicht am Menschen.',
    ],
    quellen: STUDIEN.map((s) => `${s.titel}. ${s.quelle}.`),
    link: {text: 'Alle Studien mit Methode und Grenzen', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'band',
    etikett: 'Ebene 3 · Erfahrung',
    titel: 'Was 171 Menschen berichtet haben.',
    text: [
      'Jeder Fünfte beschreibt mehr Ruhe und besseren Schlaf. Jeder Sechste mehr Energie.',
      'Das ist eine Auswertung von Berichten, ohne Kontrollgruppe.',
    ],
    bild: BILD.ruhe,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Antworten auf die häufigsten Zweifel.',
    fragen: [
      {f: 'Ist das ein Medizinprodukt?', a: 'Nein. Der QiOne® 2 Pro ist kein Medizinprodukt. Du prüfst drei Ebenen: Aufbau, Zellstudien und Erfahrungsberichte.'},
      {f: 'Muss ich etwas spüren, damit es wirkt?', a: 'Nein. Der Effekt in den Studien hängt nicht an einer bewussten Wahrnehmung. Manche spüren eine Veränderung, andere nicht.'},
      {f: 'Was heißt präklinisch?', a: 'Die Studien liefen an Zellkulturen im Labor, nicht am Menschen.'},
      {f: 'Kann ich die Studien selbst lesen?', a: 'Ja. Alle vier Arbeiten stehen als PDF bereit, mit Journal und Datum.'},
      {f: 'Und wenn es mir nichts bringt?', a: 'Dann schickst du ihn innerhalb von 20 Tagen zurück und bekommst dein Geld.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Prüf es an dir selbst. 20 Tage.',
    text: 'Nicht überzeugt? Geld zurück, ohne Grund.',
    cta: ZIEL.qione,
    cta2: {text: 'Erst den Mechanismus verstehen', href: '/pages/so-wirkt-kohaerentes-wasser'},
  },
  ANNA,
]);
