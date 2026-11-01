import {ANNA, BILD, STIMMEN, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/E-Smog-Schutz (s07-r4). LP D der A/B/C/D-Struktur:
 * E-Smog ruhig erklärt. Die Sätze stammen aus der C-Fassung
 * (components/campaign/ESmogSchutz.jsx), gekürzt und ohne Gedankenstriche.
 * Aussortiert gegenüber C: Trust-Leiste, Bewertungsblock mit Google-Note,
 * Zell-SVG, Scroll-Video, Video-Stimmen, Drei-Produkte-Preistabelle,
 * Zahlungs-Logos. Ein Produkt im Mittelpunkt, der Rest bleibt eine Frage an Anna.
 */
export const ESMOGSCHUTZ_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Handy, WLAN, Homeoffice',
    titel: 'E-Smog ist unsichtbar. Deine Ruhe muss ihm nicht ausgeliefert sein.',
    unter: 'Der QiOne® 2 Pro bringt das Wasser rund um deine Zellen in kohärente Ordnung, als ruhiger Puffer, den du einfach trägst.',
    bild: BILD.laptop,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Du lebst mitten im Feld, meist ohne es zu merken.',
    kacheln: [
      {zahl: '1', titel: 'Das Handy', satz: 'Stunden am Tag direkt am Kopf, dazu ständig in der Hosentasche.'},
      {zahl: '2', titel: 'Der WLAN-Router', satz: 'Er funkt rund um die Uhr, oft die ganze Nacht, genau dort, wo dein Körper regenerieren soll.'},
      {zahl: '3', titel: 'Das Homeoffice', satz: 'Laptop, Bildschirme und Kopfhörer: acht Stunden im Feld, ohne es zu merken.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Der Mechanismus',
    titel: 'Was E-Smog am Wasser tut und wie Ordnung dagegen puffert.',
    absaetze: [
      'Fast jede Zellreaktion läuft an wasserumhüllten Grenzflächen ab. Der Gitterchip® im QiOne® 2 Pro bringt genau dieses Wasser in eine kohärente, geordnete Struktur.',
      'Geordnetes Grenzflächen-Wasser stützt die Membran der Zelle. In vitro hielt ihre Barrierefunktion unter elektromagnetischer Belastung bis zu zehnmal besser stand (TEER-Messung), und eine stabile Membran hält ihre Zellspannung leichter aufrecht.',
    ],
    quellen: [`${STUDIEN[1].titel}. ${STUDIEN[1].quelle}.`],
    bild: BILD.gitter,
    link: {text: 'Alle Studien mit Methode und Grenzen', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'band',
    titel: 'Ein Puffer, den du einfach trägst.',
    text: [
      'Der QiOne® 2 Pro ist als Anhänger dabei: unterwegs, im Call, in der Hosentasche.',
      'Er braucht weder Strom noch Ritual und arbeitet, solange du ihn trägst.',
    ],
    bild: BILD.hand,
  },
  {
    art: 'stimmen',
    titel: 'Das erzählen unsere Kunden.',
    stimmen: [
      {text: 'Meine Tiefschlafphase hat sich deutlich verbessert. Das habe ich getrackt.', quelle: 'Constantin Preis, Deutscher Leichtathletik-Meister'},
      STIMMEN[0],
    ],
  },
  {
    art: 'faq',
    titel: 'Fragen zu E-Smog.',
    fragen: [
      {f: 'Ist E-Smog-Schutz nicht Esoterik?', a: 'Ging uns ähnlich. Deshalb reden wir über Grenzflächen-Wasser und Membranpotential, also über messbare Physik, und zeigen die Labormessung unter elektromagnetischer Last.'},
      {f: 'Ist E-Smog überhaupt ein echtes Problem?', a: 'Handy, Router und Homeoffice umgeben dich rund um die Uhr mit Feldern. Im Labor hielt die Zell-Barriere unter elektromagnetischer Last mit kohärentem Wasser messbar besser stand.'},
      {f: 'Muss ich etwas spüren?', a: 'Ein Puffer auf Zellebene ist kein Effekt, den man wie eine Kopfschmerztablette spürt. Deshalb bindest du dein Urteil an einen Zeitraum von 20 Nächten.'},
      {f: 'Und wenn er mich nicht überzeugt?', a: 'Dann bekommst du den vollen Kaufpreis zurück, ohne Wenn und Aber.'},
    ],
  },
  {
    art: 'cta',
    titel: '20 Nächte im echten Alltag.',
    text: 'Mit Arbeit, Schlaf, Homeoffice und Familie. Überzeugt er dich nicht, bekommst du den vollen Kaufpreis zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
