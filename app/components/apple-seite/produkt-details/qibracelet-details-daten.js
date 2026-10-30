/*
 * APPLE-FASSUNG /pages/qibracelet-details (Grossjob 20261029-GROSSJOB-alle-
 * shop-seiten-apple-niveau-ausser-seo-geo, s05). Erklärt das Gerät, die
 * Kaufseite /products/qibracelet verkauft es; jeder Kaufknopf mit Preis.
 *
 * Texte: Bestand der live Apple-Kaufseite (product-pages/qibracelet-alpha-
 * daten.js, PR + Sales frei), Kopfzeile der heutigen Seite („Tragbares
 * Hightech mit messbaren Effekten auf Zellebene“). Kein Preisanker.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const KAUFSEITE = '/products/qibracelet';

const BILD = Object.freeze({
  qibracelet: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qibracelet-winkel--a26b001f0816.jpg?v=1790809401`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qibracelet',
    alt: 'QiBracelet® aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1080,
    hoehe: 1080,
  },
  wasser: {
    url: `${CDN}/files/2025-05-qiblanco-canggu-1054658.jpg?v=1762974785`,
    alt: 'Arm mit QiBracelet® am Handgelenk über dunklem Wasser',
    breite: 3500,
    hoehe: 2336,
  },
  gravur: {
    url: `${CDN}/files/QiBracelet2.webp?v=1732874909`,
    alt: 'QiBracelet® in Draufsicht mit Seriennummer und Gravur Made in Germany',
    breite: 2056,
    hoehe: 2056,
  },
  pool: {
    url: `${CDN}/files/2025-05-qiblanco-canggu-06482_77a81201-88cb-4974-9f34-5e02555464df.jpg?v=1762974851`,
    alt: 'Verschränkte Hände über einem Pool, beide Handgelenke mit QiBracelet®',
    breite: 3500,
    hoehe: 2333,
  },
});

export const QIBRACELET_DETAILS = Object.freeze([
  {
    art: 'hero',
    overline: 'QiBracelet® im Detail',
    titel: 'Tragbares Hightech mit messbaren Effekten auf Zellebene',
    unter: 'Den ganzen Tag an deinem Handgelenk, mit derselben Leistung wie der QiOne® 2 Pro.',
    bild: BILD.qibracelet,
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {
    art: 'fakten',
    titel: 'Einmal kaufen. An die Familie weitergeben.',
    kacheln: [
      {zahl: 'Jahrzehnte', titel: 'Lebensdauer', satz: 'Erst trägst du es, dann die nächste Generation.'},
      {zahl: '316L', titel: 'Material', satz: 'Implantatstahl aus der Orthopädie.'},
      {zahl: '750er', titel: 'Gold im Gitterchip®', satz: 'Von Goldschmieden von Hand vollendet.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Zelle',
    titel: 'Fünf von fünf Zelltypen geschützt.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat das QiBracelet® im Labor an fünf Typen menschlicher Zellen getestet. Er setzte sie oxidativem Stress aus.',
      'Bei Leberzellen lag der Schutz bei 47,3 %.',
    ],
    quellen: [
      'Peter C. Dartsch: Protective Effect of the QiBracelet® Against Oxidative Stress. Applied Cell Biology 12(1), 2024. DOI 10.53043/2320-1991.acb12001.',
    ],
    link: {text: 'Alle Studien ansehen', href: '/pages/studien'},
  },
  {
    art: 'band',
    etikett: 'Gitterchip®',
    titel: 'Gleiche Leistung wie der QiOne® 2 Pro.',
    text: [
      'Im Ende des Reifs sitzt der Gitterchip® aus 750er Gold.',
      'Er ist rund 10 % stärker gebaut als im QiOne® 2 Pro, denn das Handgelenk liegt weiter von deiner Körpermitte entfernt.',
    ],
    bild: BILD.gravur,
  },
  {
    art: 'band',
    etikett: 'Alltag',
    titel: 'Sauna, Meer, Pool. Es bleibt dran.',
    text: [
      'Das QiBracelet® trägst du Tag und Nacht. Es ist immer an deiner Seite.',
    ],
    bild: BILD.pool,
  },
  {
    art: 'cta',
    titel: '20 Tage zu Hause testen.',
    text: 'Passt es nicht, bekommst du den vollen Kaufpreis zurück.',
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {art: 'anna'},
]);
