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
    unter: 'Gib deinem Schlaf 20 Nächte. Den Rest entscheidest du.',
    bild: BILD.ruhe,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Drei Momente, die du nicht vermissen wirst.',
    kacheln: [
      {zahl: '23 Uhr', titel: 'Der Kopf macht weiter', satz: 'Das Licht ist aus, der Tag war lang. Das Handy liegt neben dem Kissen.'},
      {zahl: '3 Uhr', titel: 'Hellwach', satz: 'Kein Lärm, kein Stress. Und doch kommst du nicht zur Ruhe.'},
      {zahl: '7 Uhr', titel: 'Erholt? Nein.', satz: 'Der Schlaf war da, aber flach. Der Tag beginnt im Minus.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Was nachts passiert',
    titel: 'Was nachts in deinem Körper passiert.',
    absaetze: [
      'Der Gitterchip® im QiOne® 2 Pro erzeugt ein statisches Feld, ohne Batterie und ohne Magnet. Es ordnet das Wasser an deinen Zellen.',
      'In Zellstudien puffert diese geordnete Grenzschicht E-Smog ab und senkt oxidativen Stress. Ein Körper, der weniger im Abwehrmodus ist, fährt nachts leichter herunter.',
      'In rund 20 Nächten stellt sich ein neues Gleichgewicht ein. Die meisten Träger berichten von Veränderungen in den ersten drei Wochen.',
    ],
  },
  {
    art: 'band',
    etikett: 'Dein Abend',
    titel: 'Ein Ritual, kein Kraftakt.',
    text: [
      'Du legst den QiOne® 2 Pro an, so wie andere die Zähne putzen. Kein Knopf, keine App, keine Einstellung.',
      'Er arbeitet leise im Hintergrund, während du das Licht dimmst und das Handy weglegst.',
    ],
    bild: BILD.hand,
  },
  {
    art: 'kapitel',
    etikett: 'An Zellen gemessen',
    titel: 'Nicht nur gefühlt. An Zellen gemessen.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet. Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
      'Gemessen an Zellkulturen im Labor, veröffentlicht im Japan Journal of Medicine.',
    ],
    quellen: [`${STUDIEN[0].titel}. ${STUDIEN[0].quelle}.`],
    link: {text: 'Alle Studien mit Methode und Grenzen', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'band',
    etikett: '171 Erfahrungsberichte',
    titel: 'Erholt aufwachen. Darum geht es.',
    text: [
      '171 Menschen haben aufgeschrieben, was sich bei ihnen verändert hat. Jeder Fünfte beschreibt mehr Ruhe und besseren Schlaf.',
      'Viele erzählen, dass der Übergang in den Schlaf wieder leichter fällt.',
    ],
    bild: BILD.paar,
  },
  {
    art: 'stimmen',
    titel: 'Echte Menschen. Echte Erfahrungen.',
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
      {f: 'Brauche ich Strom oder eine App?', a: 'Nein. Kein Akku, keine Elektronik, keine App. Du legst ihn an, fertig.'},
      {f: 'Und wenn es mir nichts bringt?', a: 'Dann schickst du ihn innerhalb von 20 Tagen zurück und bekommst den vollen Kaufpreis erstattet.'},
      {f: 'Kann ich in Raten zahlen?', a: 'Ja. Über Klarna oder PayPal in Monatsraten mit 0 % Finanzierung, inklusive Käuferschutz.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Bereit für ruhigere Nächte?',
    text: 'Teste ihn 20 Nächte in deinem Alltag. Überzeugt er dich nicht, bekommst du dein Geld zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
