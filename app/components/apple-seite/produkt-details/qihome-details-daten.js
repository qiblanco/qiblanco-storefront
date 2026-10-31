/*
 * APPLE-FASSUNG /pages/qihome-details (Grossjob 20261029-GROSSJOB-alle-shop-
 * seiten-apple-niveau-ausser-seo-geo, s05). Erklärt das Gerät, die Kaufseite
 * /products/qihome-air verkauft es; jeder Kaufknopf mit Preis daneben.
 *
 * Texte: Bestand der live Apple-Kaufseite (product-pages/qihome-air-alpha-
 * daten.js, PR + Sales frei), Kopfzeile der heutigen Seite („Erschaffe dir
 * deine Wohlfühloase“). Kein Preisanker, keine Note, keine Nutzerzahl.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const KAUFSEITE = '/products/qihome-air';

const BILD = Object.freeze({
  qihome: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qihome-front-1440--d19c273efe67.jpg?v=1793414663`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qihome',
    alt: 'QiHome® Air aus Eiche und Edelstahl mit goldenem Gitterchip®',
    breite: 1440,
    hoehe: 1440,
  },
  tablett: {
    url: `${CDN}/files/2023-03-01-qiblanco-milva-martin-1020566_40c1ab65-8437-4303-841a-e2741fcaa3c7.png?v=1762975086`,
    alt: 'QiHome® Air auf einem Tablett neben Glasdosen und Kerze',
    breite: 2383,
    hoehe: 2383,
  },
  haende: {
    url: `${CDN}/files/2025-05-qiblanco-canggu-1055384.jpg?v=1762975086`,
    alt: 'Hände halten den QiHome® Air vor Grünpflanzen',
    breite: 3500,
    hoehe: 2336,
  },
  nachttisch: {
    url: `${CDN}/files/16-L1011283_fa25da2a-e5f4-433b-be0c-bc8f109beed4.png?v=1762975086`,
    alt: 'QiHome® Air auf dem Nachttisch am Fuß einer Leselampe',
    breite: 3657,
    hoehe: 3657,
  },
});

/** Das Video der heutigen Seite, mit Vorschaubild. */
export const VIDEO = Object.freeze({
  titel: 'Deine Wohlfühloase.',
  pfad: '240417_QIHome_Wohlfuehloase_16x9_EN.mov',
  poster: `${CDN}/files/wohlfuehl-preview.webp?v=1739746356`,
});

export const QIHOME_DETAILS = Object.freeze([
  {
    art: 'hero',
    overline: 'QiHome® Air im Detail',
    titel: 'Erschaffe dir deine Wohlfühloase.',
    unter: 'Ein Gerät für dein ganzes Zuhause. Ohne Strom.',
    bild: BILD.qihome,
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {
    art: 'fakten',
    titel: 'Das QiHome® Air in Zahlen.',
    kacheln: [
      {zahl: '160 m', titel: 'Radius', satz: 'Rund 8 Hektar.'},
      {zahl: '100×', titel: 'Stärke', satz: 'die Stärke eines QiOne® 2 Pro.'},
      {zahl: '0 Watt', titel: 'Ohne Strom', satz: 'Kein Strom. Keine Wartung.'},
    ],
  },
  {art: 'video'},
  {
    art: 'band',
    etikett: 'Raum',
    titel: 'Hinstellen. Fertig.',
    text: [
      'Stell das QiHome® Air in den Raum, in dem du am meisten Zeit verbringst.',
      'Kein Strom, kein Kabel, keine Wartung. In einigen Stunden hat sich sein Feld aufgebaut.',
    ],
    bild: BILD.tablett,
  },
  {
    art: 'kapitel',
    etikett: 'Zelle',
    titel: 'Nervenzellen im Labor: 53,3 % mehr Regeneration.',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat das QiHome® Air an menschlichen Nervenzellen getestet.',
      'Unter oxidativem Stress überlebten 34 % mehr Zellen.',
    ],
    quellen: [
      'Peter C. Dartsch: Beneficial Effect of the QiHome® Air on Cultured Neuronal and Inflammation-Mediating Cells. Neurodegenerative Diseases: Current Research 6(1), 2026. DOI 10.53043/NDCR-6-001.',
    ],
    bild: BILD.haende,
    link: {text: 'Alle Studien ansehen', href: '/pages/studien'},
  },
  {
    art: 'band',
    etikett: 'Schlaf',
    titel: 'Ruhig schlafen, egal was unter dem Haus liegt.',
    text: [
      'Erdstrahlen, Gitternetze, Gesteinsbrüche: Geopathogene Strahlung hat viele Namen.',
      'Sie kommt zu Handy, WLAN und 5G hinzu. Deshalb gehört das QiHome® Air ins Schlafzimmer.',
    ],
    bild: BILD.nachttisch,
  },
  {
    art: 'cta',
    titel: '20 Tage zu Hause testen.',
    text: 'Passt es nicht, bekommst du den vollen Kaufpreis zurück.',
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {art: 'anna'},
]);
