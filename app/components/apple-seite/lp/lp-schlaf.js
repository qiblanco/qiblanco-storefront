import {ANNA, BILD, STIMMEN, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/tiefer-schlaf (s07-r3). Schlaf-LP der Ads: drei
 * Nacht-Momente, was nachts passiert, das Abend-Ritual, die Zellstudie, die
 * Erfahrungsberichte und die 20 Nächte. Die Sätze stammen aus der C-Fassung
 * (components/campaign/TieferSchlaf.jsx), gekürzt und ohne Gedankenstriche.
 * Aussortiert gegenüber C: Zahlenreihe, Mikroskop-Videos, Podcast-Block,
 * Video-Stimmen-Karussell, QiHome-Raum-Block, Zahlungs-Logos, Signatur-Siegel.
 */
export const SCHLAF_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Tiefer Schlaf',
    titel: 'Endlich wieder tief schlafen.',
    unter: 'Gib deinem Schlaf 20 Nächte, über den Rest entscheidest du danach.',
    bild: BILD.ruhe,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Drei Momente, die du nicht vermissen wirst.',
    kacheln: [
      {zahl: '23 Uhr', titel: 'Der Kopf macht weiter', satz: 'Das Licht ist aus und der Tag war lang, aber das Handy liegt noch neben dem Kissen.'},
      {zahl: '3 Uhr', titel: 'Hellwach', satz: 'Es gibt keinen Lärm und keinen Stress, und trotzdem kommt dein Körper nicht zur Ruhe.'},
      {zahl: '7 Uhr', titel: 'Nicht erholt', satz: 'Geschlafen hast du schon, aber der Schlaf war flach und der Tag beginnt im Minus.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Was nachts passiert',
    titel: 'Was nachts in deinem Körper passiert.',
    absaetze: [
      'Der Gitterchip® im QiOne® 2 Pro erzeugt ein statisches Feld und braucht dafür weder Batterie noch Magnet. Dieses Feld ordnet das Wasser an deinen Zellen. In Zellstudien puffert diese geordnete Grenzschicht E-Smog ab und senkt oxidativen Stress.',
      'Ein Körper, der weniger im Abwehrmodus ist, fährt nachts leichter herunter. In rund 20 Nächten stellt sich ein neues Gleichgewicht ein, und die meisten Träger berichten von Veränderungen in den ersten drei Wochen.',
    ],
  },
  {
    art: 'band',
    etikett: 'Dein Abend',
    titel: 'Der Abend ist ein Ritual, kein Kraftakt.',
    text: [
      'Du legst den QiOne® 2 Pro an, so wie andere die Zähne putzen. Du musst nichts einstellen, und eine App braucht es dafür auch nicht.',
      'Er arbeitet leise im Hintergrund, während du das Licht dimmst und das Handy weglegst.',
    ],
    bild: BILD.hand,
  },
  {
    art: 'kapitel',
    etikett: 'An Zellen gemessen',
    titel: 'Was an Zellen gemessen wurde.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet. Ohne Schutz fiel ihre Abwehrleistung auf 60,5 Prozent, mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
      'Gemessen an Zellkulturen im Labor, veröffentlicht im Japan Journal of Medicine.',
    ],
    quellen: [`${STUDIEN[0].titel}. ${STUDIEN[0].quelle}.`],
    link: {text: 'Alle Studien mit Methode und Grenzen', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'band',
    etikett: '171 Erfahrungsberichte',
    titel: 'Erholt aufwachen, darum geht es.',
    text: [
      '171 Menschen haben aufgeschrieben, was sich bei ihnen verändert hat.',
      'Jeder Fünfte beschreibt mehr Ruhe und besseren Schlaf, und viele erzählen, dass ihnen der Übergang in den Schlaf wieder leichter fällt.',
    ],
    bild: BILD.paar,
  },
  {
    art: 'stimmen',
    titel: 'Echte Menschen und echte Erfahrungen.',
    stimmen: [
      {text: 'Meine Tiefschlafphase hat sich deutlich verbessert. Das habe ich getrackt.', quelle: 'Constantin Preis, Deutscher Leichtathletik-Meister'},
      STIMMEN[0],
    ],
  },
  {
    art: 'faq',
    titel: 'Fragen zu den 20 Nächten.',
    fragen: [
      {f: 'Wann merke ich etwas?', a: 'Die meisten Träger berichten von Veränderungen in den ersten drei Wochen.'},
      {f: 'Brauche ich Strom oder eine App?', a: 'Nein, im QiOne® 2 Pro steckt weder ein Akku noch Elektronik, und eine App gibt es dafür auch nicht.'},
      {f: 'Und wenn es mir nichts bringt?', a: 'Dann schickst du ihn innerhalb von 20 Tagen zurück, und der volle Kaufpreis wird erstattet.'},
      {f: 'Kann ich in Raten zahlen?', a: 'Ja, das geht in Monatsraten mit 0 % Finanzierung über Klarna oder PayPal, und der Käuferschutz ist inklusive.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Bereit für ruhigere Nächte?',
    text: 'Teste ihn 20 Nächte in deinem Alltag, und wenn er dich nicht überzeugt, bekommst du dein Geld zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
