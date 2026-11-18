import {ANNA, BILD, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/E-Smog-Schutz (s07-r4, Text neu in Grossjob
 * 20261118-de-shop-apple-rest-z3-z20 s03). LP D der A/B/C/D-Struktur.
 *
 * TEXTVERTRAG: jeder Satz steht WORTGLEICH in der C-Fassung
 * (components/campaign/ESmogSchutz.jsx, Christians Seitentext). Neu ist nur
 * Auswahl, Reihenfolge und Gestaltung. Die erste Fassung (s07-r4) hatte 21 von
 * 38 Sätzen umformuliert und fiel durch die KI-Klang-Prüfung; deshalb hier kein
 * eigener Satz. Wer einen Satz ändert, lässt ihn vorher durch die KI-Klang-Prüfung
 * mit Richter laufen (Werkzeug im Modul menschlichkeit). Auswahl nach dem
 * Richter-Urteil vom 18.11.: die Fragen, die er bei C als gedrechselt verwarf
 * (Eso, Spüren, „nicht abschließend geklärt“), sind durch C-Sätze aus Garantie
 * und Zahlung ersetzt.
 * Die Einordnungen aus C (keine Panik, Grenzforschung, keine Heilaussage) bleiben
 * wortgleich drin, auch wenn der Richter sie als gedrechselt einstuft: sie
 * grenzen die Laboraussage ab (K3-Gegenprüfung 18.11.).
 * Aussortiert gegenüber C: Trust-Leiste, Zell-Schema, Scroll-Videos,
 * Video-Stimmen, Drei-Produkte-Preistabelle, Zahlungs-Logos. Die Stimmen kommen
 * aus der Google-Bewertungsleiste des Baukastens.
 */
export const ESMOGSCHUTZ_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Handy, WLAN, Homeoffice: Der Alltag strahlt',
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
      {zahl: '2', titel: 'Der WLAN-Router', satz: 'Funkt rund um die Uhr, oft die ganze Nacht, und zwar genau dort, wo dein Körper eigentlich regenerieren soll.'},
      {zahl: '3', titel: 'Das Homeoffice', satz: 'Laptop, Bildschirme, Docking-Station, Bluetooth-Kopfhörer.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Der Mechanismus',
    titel: 'Was E-Smog am Wasser tut und wie Ordnung dagegen puffert.',
    absaetze: [
      'Fast jede Zellreaktion läuft an wasserumhüllten Grenzflächen ab. Die QiOne®-Technologie bringt genau dieses Wasser in eine kohärente, geordnete Struktur.',
      'Geordnetes Grenzflächen-Wasser stützt die Lipid-Doppelschicht der Membran. In vitro hielt die Barrierefunktion unter elektromagnetischer Belastung bis zu 10× besser stand (TEER-Messung).',
      'Eine stabile Membran hält ihr Membranpotential, die „Zellspannung“, leichter aufrecht. Das ist die messbare Grundlage.',
      'Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten Zellstudien sind in vitro (an Zellkulturen) durchgeführt. Sie erklären den Mechanismus, sie sind keine Heilaussage und kein Schutzversprechen gegen Strahlung.',
    ],
    quellen: [`${STUDIEN[1].titel}. ${STUDIEN[1].quelle}.`],
    bild: BILD.gitter,
  },
  {
    art: 'band',
    etikett: 'So einfach ist es',
    titel: '20 Tage. Ein Anhänger. Dein ganz normaler Alltag.',
    text: [
      'Der QiOne® 2 Pro ist als Anhänger dabei: unterwegs, im Call, in der Hosentasche. Kein Ritual, kein Aufwand.',
      'Genau dort, wo der Router die Nacht durchfunkt, arbeitet das kohärente Wasser im Hintergrund, die ganze Nacht lang.',
    ],
    bild: BILD.hand,
  },
  {art: 'stimmen'},
  {
    art: 'faq',
    titel: 'Für Skeptiker',
    fragen: [
      {f: 'Ist E-Smog überhaupt ein echtes Problem?', a: 'Wir machen keine Panik: Wie stark alltägliche Felder wirken, ist wissenschaftlich nicht abschließend geklärt. Im Labor hielt die Zell-Barriere unter EM-Last mit kohärentem Wasser messbar besser stand.'},
      {f: 'Und wenn es doch nichts bringt?', a: '20 Nächte risikofrei. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück, ohne Wenn und Aber.'},
      {f: 'In Raten, wenn du willst', a: 'Über Klarna oder PayPal geht das in bequemen Monatsraten mit 0 % Finanzierung. Du entscheidest, wie du zahlst.'},
      {f: 'Made in Germany', a: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand innerhalb Deutschlands.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Gib deinem Körper 20 Nächte. Den Rest entscheidest du.',
    text: 'Trage den QiOne® 2 Pro 20 Nächte lang durch deinen ganz normalen Alltag. Bist du danach nicht überzeugt, erstatten wir dir den vollen Kaufpreis.',
    cta: ZIEL.qione,
  },
  ANNA,
]);
