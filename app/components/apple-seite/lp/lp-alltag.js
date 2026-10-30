import {ANNA, BILD, STIMMEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/haelt-das-mein-leben-aus (s07). Message-Match-LP der
 * Ad-Welle B (qb45-b3 „Hält das mein Leben aus? Dusche, Sport, Sauna“): die
 * Kopfzeile bleibt die der Anzeige. Aussortiert gegenüber C: Badge-Reihe mit
 * Google-Note, Bewertungs-Widget mit Sternen, Zahlenband, Funnel-Kacheln.
 */
export const ALLTAG_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Im Alltag getestet',
    titel: '„Hält das mein Leben aus?“ Dusche, Sport, Sauna. Er bleibt dran.',
    unter: 'Kein Akku, keine Elektronik. Wasser, Hitze, Schweiß und Chlor machen ihm nichts.',
    bild: BILD.qione,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Gebaut für jeden Tag.',
    kacheln: [
      {zahl: '0', titel: 'Akku', satz: 'Kein Laden, keine App, keine Wartung.'},
      {zahl: '750er', titel: 'Gold im Gitterchip®', satz: 'In einem Körper aus Chirurgenstahl.'},
      {zahl: '24/7', titel: 'Tragbar', satz: 'Unter der Dusche, beim Sport, in der Nacht.'},
    ],
  },
  {
    art: 'band',
    etikett: 'Wasser und Hitze',
    titel: 'Sauna, Meer, Chlor, Schweiß.',
    text: [
      'Was keine Elektronik hat, fällt durch Wasser nicht aus.',
      'Du nimmst ihn nicht ab. Auch nicht in der Sauna.',
    ],
    bild: BILD.wasser,
  },
  {
    art: 'band',
    etikett: 'Über Jahrzehnte',
    titel: 'Einmal kaufen. Weitergeben.',
    text: [
      'Das Gold-Gitter ist fest und passiv. Verschleißteile gibt es keine.',
      'Erst trägst du ihn. Dann die nächste Generation.',
    ],
    bild: BILD.hand,
  },
  {
    art: 'kapitel',
    etikett: 'Und die Wirkung?',
    titel: 'Was im Labor gemessen wurde.',
    absaetze: [
      'Vier publizierte Arbeiten. Drei an Zellkulturen im Labor, eine wertet Erfahrungsberichte aus.',
      'Unter Stress zeigten die Zellen einen messbaren Schutzeffekt. Gemessen an Zellkulturen im Labor, nicht am Menschen.',
    ],
    link: {text: 'Die Studien im Detail', href: '/pages/zellstudien-ehrlich'},
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Antworten zum Alltag.',
    fragen: [
      {f: 'Kann ich damit in die Sauna und ins Schwimmbad?', a: 'Ja. Er ist beständig gegen Hitze und Chlor. Du behältst ihn an.'},
      {f: 'Muss ich ihn zum Duschen oder Sport abnehmen?', a: 'Nein. Es gibt keine Elektronik und keinen Akku, dem Wasser oder Schweiß schaden.'},
      {f: 'Muss ich ihn laden oder pflegen?', a: 'Nein. Der Chip arbeitet passiv. Anlegen und vergessen.'},
      {f: 'Ist das ein Medizinprodukt?', a: 'Nein. Der QiOne® 2 Pro ist kein Medizinprodukt. Die Studien liefen an Zellkulturen im Labor.'},
    ],
  },
  {
    art: 'cta',
    titel: '20 Tage im echten Alltag testen.',
    text: 'Nicht überzeugt? Du schickst ihn zurück und bekommst dein Geld. Ohne Grund.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
