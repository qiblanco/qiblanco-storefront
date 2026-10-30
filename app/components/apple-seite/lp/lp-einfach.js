import {ANNA, BILD, STIMMEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/so-funktioniert-der-qione (s07). Die einfache
 * Erklärung in drei Schritten: Wasser, Gold-Gitter, tragen. Aussortiert
 * gegenüber C: Badge-Reihe mit Google-Note, Zeile „Über 14.000 zufriedene
 * Kunden“ (Preisanker), Funnel-Kacheln, Produktkacheln.
 */
export const EINFACH_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'In 20 Sekunden',
    titel: 'So funktioniert der QiOne® 2 Pro. Ganz einfach erklärt.',
    unter: 'Ein Gitter aus 750er Gold ordnet das Wasser in deinem Körper. Ohne Batterie, ohne App.',
    bild: BILD.qione,
    cta: ZIEL.qione,
  },
  {
    art: 'fakten',
    titel: 'Drei Schritte.',
    kacheln: [
      {zahl: 'Über 70 %', titel: 'Wasser', satz: 'So viel von dir ist Wasser. In den Zellen, im Blut, überall.'},
      {zahl: '750er', titel: 'Gold-Gitter', satz: 'Wie eine Stimmgabel gibt es dem Wasser eine feine Ordnung.'},
      {zahl: '24/7', titel: 'Tragen', satz: 'Kette umhängen. Er wirkt Tag und Nacht.'},
    ],
  },
  {
    art: 'band',
    etikett: 'Schlaf',
    titel: 'Ruhiger schlafen.',
    text: [
      'Nachts soll dein Körper runterfahren.',
      'Ist das Wasser in deinen Zellen geordnet, kommt dein Nervensystem leichter zur Ruhe. Die meisten merken zuerst genau das.',
    ],
    bild: BILD.ruhe,
  },
  {
    art: 'band',
    etikett: 'Zellschutz',
    titel: 'Weniger Stress für deine Zellen.',
    text: [
      'Oxidativer Stress setzt Zellen jeden Tag zu, wie leichtes Rosten in der Zelle.',
      'Geordnetes Wasser an der Zellhülle federt das ab. In Zellstudien blieben geschützte Zellen stabiler.',
    ],
    bild: BILD.saft,
  },
  {
    art: 'band',
    etikett: 'E-Smog',
    titel: 'Ein Puffer gegen Funk.',
    text: [
      'Handy, WLAN, Bildschirm: den ganzen Tag umgibt uns Funk.',
      'Die geordnete Wasserschicht wirkt wie ein Puffer und hält die Zellhülle stabiler.',
    ],
    bild: BILD.laptop,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Kurze Antworten.',
    fragen: [
      {f: 'Ist das ein Medizinprodukt?', a: 'Nein. Er ist Schmuck mit Gitterchip®. Belegt sind Effekte in Zellkulturen im Labor.'},
      {f: 'Muss ich etwas spüren, damit es wirkt?', a: 'Nein. Manche merken eine Veränderung, andere nicht. Beides ist normal.'},
      {f: 'Was heißt Zellstudie?', a: 'Die Studien liefen an Zellen im Labor, nicht am Menschen.'},
      {f: 'Braucht er Strom oder Pflege?', a: 'Nein. Kein Akku, keine Elektronik, keine App. Du trägst ihn, über Jahre.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Am einfachsten verstehst du ihn, wenn du ihn trägst.',
    text: '20 Tage testen. Nicht überzeugt, Geld zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'Den Mechanismus genauer', href: '/pages/so-wirkt-kohaerentes-wasser'},
  },
  ANNA,
]);
