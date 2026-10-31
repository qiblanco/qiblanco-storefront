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
    unter: 'Hier zeigen wir dir offen, wie der Chip aufgebaut ist und was in Studien gemessen wurde. Dazu kommen die Berichte von Menschen, die ihn tragen.',
    // Kopf ohne 360-Drehung (s07-r3): Produkt360Video wirft im Dev-Render die
    // React-18-Warnung fetchPriority (reusables/video360-ersatzbild.jsx) -> Design 98.
    bild: BILD.hand,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Wir zeigen dir drei Ebenen, und du prüfst selbst.',
    kacheln: [
      {zahl: '1', titel: 'Aufbau', satz: 'Der Gitterchip® besteht aus 750er Gold in Chirurgenstahl.'},
      {zahl: '2', titel: 'Messung', satz: 'Vier publizierte Arbeiten liegen offen als PDF bereit.'},
      {zahl: '3', titel: 'Erfahrung', satz: 'Wir haben 171 Berichte ausgewertet.'},
    ],
  },
  {
    art: 'band',
    etikett: 'Ebene 1 · Aufbau',
    titel: 'Was physisch im Chip steckt.',
    text: [
      'Das Herzstück ist ein Gitter aus 750er Gold mit 22,61 mm³ Wirkvolumen, eingefasst in Chirurgenstahl.',
      'Der QiOne® 2 Pro braucht weder Akku noch Elektronik oder eine App, denn er arbeitet passiv, solange du ihn trägst.',
    ],
    bild: BILD.gitter,
  },
  {
    art: 'kapitel',
    etikett: 'Ebene 2 · Messung',
    titel: 'Was in Zellkulturen gemessen wurde.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet. Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent, mit dem QiOne® 2 Pro blieb sie bei 84,7 Prozent.',
      'Wichtig ist uns dabei: Das sind Studien an Zellen im Labor und nicht am Menschen.',
    ],
    quellen: STUDIEN.map((s) => `${s.titel}. ${s.quelle}.`),
    link: {text: 'Alle Studien mit Methode und Grenzen', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'band',
    etikett: 'Ebene 3 · Erfahrung',
    titel: 'Was 171 Menschen berichtet haben.',
    text: [
      'Jeder Fünfte beschreibt mehr Ruhe und besseren Schlaf, jeder Sechste spürt mehr Energie.',
      'Das ist eine Auswertung von Berichten, und es gab dabei keine Kontrollgruppe.',
    ],
    bild: BILD.ruhe,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Antworten auf die häufigsten Zweifel.',
    fragen: [
      {f: 'Ist das ein Medizinprodukt?', a: 'Nein, der QiOne® 2 Pro ist kein Medizinprodukt, und deshalb legen wir dir alle drei Ebenen offen, damit du sie selbst prüfen kannst.'},
      {f: 'Muss ich etwas spüren, damit es wirkt?', a: 'Nein, denn der Effekt in den Studien hängt nicht davon ab, dass man ihn wahrnimmt, und so spüren manche eine Veränderung und andere nichts.'},
      {f: 'Was heißt präklinisch?', a: 'Präklinisch bedeutet, dass die Studien an Zellkulturen im Labor liefen und nicht am Menschen.'},
      {f: 'Kann ich die Studien selbst lesen?', a: 'Ja, alle vier Arbeiten stehen als PDF bereit, und bei jeder findest du das Journal und das Datum.'},
      {f: 'Und wenn es mir nichts bringt?', a: 'Dann schickst du ihn innerhalb von 20 Tagen zurück und bekommst dein Geld wieder.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Prüf es an dir selbst, du hast dafür 20 Tage Zeit.',
    text: 'Wenn er dich nicht überzeugt, bekommst du dein Geld zurück, ganz ohne Begründung.',
    cta: ZIEL.qione,
    cta2: {text: 'Erst den Mechanismus verstehen', href: '/pages/so-wirkt-kohaerentes-wasser'},
  },
  ANNA,
]);
