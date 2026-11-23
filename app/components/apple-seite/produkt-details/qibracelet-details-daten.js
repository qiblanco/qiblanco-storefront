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
    bildZuerst: true,
    overline: 'QiBracelet® im Detail',
    titel: 'Tragbares Hightech mit messbaren Effekten auf Zellebene',
    unter: 'Den ganzen Tag an deinem Handgelenk, mit derselben Leistung wie der QiOne® 2 Pro.',
    bild: BILD.qibracelet,
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {
    art: 'fakten',
    titel: 'Einmal kaufen. Für ein Leben gebaut.',
    kacheln: [
      {zahl: 'Jahrzehnte', titel: 'Lebensdauer', satz: 'Ohne Akku und ohne Elektronik.'},
      {zahl: '316L', titel: 'Material', satz: 'Implantatstahl aus der Orthopädie.'},
      {zahl: '750er', titel: 'Gold im Gitterchip®', satz: 'Von Goldschmieden von Hand vollendet.'},
    ],
  },
  {
    art: 'kapitel',
    etikett: 'Zelle',
    titel: 'Das QiBracelet® schützte im Labor fünf von fünf Zelltypen.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat das QiBracelet® im Labor an fünf Zelltypen getestet. Er setzte sie oxidativem Stress aus.',
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
    titel: 'Am Handgelenk so stark wie der QiOne® 2 Pro am Hals.',
    text: [
      'Im Ende des Reifs sitzt der Gitterchip® aus 750er Gold.',
      'Er ist rund 10 % stärker gebaut als im QiOne® 2 Pro, weil dein Handgelenk weiter von deiner Körpermitte entfernt ist. So kommt bei dir dieselbe Wirkung an.',
    ],
    bild: BILD.gravur,
  },
  // KUNDENFRAGE (KI-Lernschleife, Job 20261123-ki-lernschleife-bau-dach-bd394f):
  // DE-Gegenstück zu „How does an EMF protection bracelet actually protect you?“
  // auf qi-blanco.com/pages/page-qibracelet (Regel R3: DE zuerst, US spiegelt).
  // Zahlen je mit Fundstelle: e0001 /pages/studie-immunzellen 60,5/84,7 %,
  // e0002 /pages/studie-darmbarriere 6,0/72,6 % (beide QiOne® 2 Pro, wie
  // qione-2-pro-details-daten.js), e0003 /pages/studie-oxidativer-stress
  // (QiBracelet®, Wasserstoffperoxid, kein Handy: e0003 misst keinen
  // Elektrosmog-Schutz, deshalb steht das Armband nur mit seiner eigenen
  // Studie und dem Gitterchip® im Satz).
  // Ohne Forschernamen im Fließtext, damit der US-Spiegel dieselbe Aussage trägt
  // (Elina EL-20261112-0a9978b4: Global Englisch-Shop nennt keine Forscher).
  // Kein Link auf die Bewertungsseite (WEGLINK R3, Christian 28.09.2026).
  // Challenger cm-20261123T121824-e102e1 (Job 20261123-m4d-challenger-e102e1-qibracelet-text):
  // „menschliche Zellen“ gestrichen (e0002 IPEC-J2 Schwein; e0003 Hund, Mensch, Schwein, Mensch, Maus),
  // Satz „In Zellstudien puffert diese geordnete Schicht …“ gestrichen (die Studien messen
  // Zellreaktionen, nicht die Ordnung des Wassers), „Dichte“ -> „Dichtigkeit“ (TEER),
  // 10-%-Angabe hier nicht wiederholt (ohne Fundstelle im Bestand; Band oben unverändert),
  // „Das Ergebnis ist deutlich.“ gestrichen (Schutzeffekt e0003 reicht von 3,9 % bis 47,3 %).
  {
    art: 'frage',
    anker: 'armband-schutz-elektrosmog',
    titel: 'Wie schützt dich ein Armband gegen Elektrosmog?',
    antwort:
      'Das QiBracelet® arbeitet mit dem Wasser in deinem Körper. Es blockiert kein Signal, und dein Handy funktioniert weiter.',
    absaetze: [
      'Viele Produkte gegen Elektrosmog wollen das Signal abschirmen. Eine Abschirmung, die stark genug dafür ist, nimmt aber auch dein Handy vom Netz. Mit dem QiBracelet® gehen wir deshalb einen anderen Weg.',
      'Im Reif sitzt der Gitterchip® aus 750er Gold. Er erzeugt ein statisches Feld, das an deinem Handgelenk ständig wirkt.',
      'Dieses Feld ordnet das Wasser an deinen Zellen, Fachleute nennen das den kohärenten Zustand.',
      'Was das bewirkt, haben wir im Labor an Zellen messen lassen.',
    ],
    teile: [
      {
        titel: 'Was gemessen ist',
        absaetze: [
          'Immunzellen: Menschliche Immunzellen standen vier Stunden lang unter Handystrahlung. Ohne Schutz behielten sie 60,5 % ihrer Abwehrleistung, mit einem QiOne® 2 Pro daneben waren es 84,7 %.',
          'Darmbarriere: Unter E-Smog hielt eine Schicht aus Darmzellen nur 6,0 % ihrer Dichtigkeit. Mit dem QiOne® 2 Pro waren es 72,6 %.',
          'Das QiBracelet® selbst: In einer Studie von 2024 kamen fünf Zelltypen mit Wasserstoffperoxid unter oxidativen Stress. Mit dem QiBracelet® hielten alle fünf besser stand.',
          'Im QiBracelet® sitzt der Gitterchip® des QiOne® 2 Pro.',
        ],
      },
    ],
    quellen: [
      {text: 'Studie Immunzellen: Abwehrzellen unter Handystrahlung (2021)', href: '/pages/studie-immunzellen'},
      {text: 'Studie Darmbarriere: Darmzellen unter Handystrahlung (2021)', href: '/pages/studie-darmbarriere'},
      {text: 'Studie oxidativer Stress: fünf Zelltypen mit dem QiBracelet® (2024)', href: '/pages/studie-oxidativer-stress'},
    ],
  },
  {
    art: 'band',
    etikett: 'Alltag',
    titel: 'Sauna, Meer, Pool. Du legst es nie ab.',
    text: [
      'Das QiBracelet® trägst du Tag und Nacht. So wirkt es auch, während du schläfst.',
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
