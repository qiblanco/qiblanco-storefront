/*
 * APPLE-FASSUNG /pages/qione-2-pro-details (Grossjob 20261029-GROSSJOB-alle-
 * shop-seiten-apple-niveau-ausser-seo-geo, s05; Christian Z3 nennt die Seite).
 *
 * Die Seite erklärt das Gerät, die Kaufseite /products/qione-2-pro verkauft
 * es. Deshalb: wenige Abschnitte, ein Gedanke je Abschnitt, jeder Kaufknopf
 * führt auf die Kaufseite (mit Preis daneben, Sicht-Tor kaufknopf_kontext).
 *
 * Texte: Bestand der live Apple-Kaufseite (product-pages/qione-2-pro-alpha-
 * daten.js, PR + Sales frei) und die Expertenstimmen der heutigen Seite im
 * Wortlaut (ganze Sätze, nichts umgestellt). Kein Preisanker, keine Note,
 * keine Nutzerzahl (Christian 29.10.2026).
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const KAUFSEITE = '/products/qione-2-pro';

const BILD = Object.freeze({
  qione: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qione-front-1440--f0024fcab5ec.jpg?v=1793414659`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qione',
    alt: 'QiOne® 2 Pro von vorn, Gehäuse aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1440,
    hoehe: 1440,
  },
  gitterchip: {
    url: `${CDN}/files/QiOne_Gitterchip-1680.webp?v=1793415850`,
    alt: 'Gitterchip® des QiOne® 2 Pro: goldfarbene Scheibe mit gleichmäßigem, wabenartigem Gittermuster',
    breite: 1680,
    hoehe: 1680,
  },
  hand: {
    url: `${CDN}/products/2021-04-qiblanco-bali-16_e66b45ce-857c-4bd8-a123-05e0b2d4229e.jpg?v=1698259307`,
    alt: 'QiOne® 2 Pro an der Kette in einer offenen Hand',
    breite: 2579,
    hoehe: 2579,
  },
});

/** Das Video der heutigen Seite (60 s), mit Vorschaubild. */
export const VIDEO = Object.freeze({
  titel: 'Der QiOne® 2 Pro in 60 Sekunden.',
  pfad: 'VIDEO-QiOne60s-DE-2021.mov',
  poster: `${CDN}/files/fallback-image-qione-detail.webp?v=1747735933`,
});

/** Platzhalter für die zwei Videos (eigene Kinder, kein Baukasten-Typ). */
export const VIDEO_PLATZ = Object.freeze({art: 'video'});
export const MIKROSKOP_PLATZ = Object.freeze({art: 'mikroskop'});

export const QIONE_2_PRO_DETAILS = Object.freeze([
  {
    art: 'hero',
    overline: 'QiOne® 2 Pro im Detail',
    titel: 'Der QiOne® 2 Pro',
    unter: 'Messbare Effekte auf Zellebene.',
    bild: BILD.qione,
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {
    art: 'fakten',
    titel: 'Gebaut für ein ganzes Leben.',
    kacheln: [
      {zahl: 'Jahrzehnte', titel: 'Vererbbar', satz: 'Erst trägst du ihn. Dann die nächste Generation.'},
      {zahl: 'Wasserfest', titel: 'Überall mit dir', satz: 'Sauna, Meer, Chlor, Schweiß, Sonne. Er bleibt dran.'},
      {zahl: '8×', titel: 'Leistungsvolumen', satz: 'Achtmal so viel wie der QiOne® 1.'},
    ],
  },
  VIDEO_PLATZ,
  {
    art: 'kapitel',
    etikett: 'Technologie',
    titel: 'Das Herz: der Gitterchip® 2.0.',
    absaetze: [
      'Im Kern sitzt der Gitterchip® 2.0 aus einer eigenen 750er Goldlegierung. Seine Atome stehen in fester Ordnung.',
      'Diese Ordnung erzeugt ein statisches Feld. In ihm bilden Wassermoleküle mehr Wasserstoffbrücken. So entsteht kohärentes Wasser, in der Forschung EZ-Wasser genannt.',
      'Das geschieht in deinem Körper, solange du ihn trägst. Ohne Akku und ohne Elektronik.',
    ],
    bild: BILD.gitterchip,
  },
  {
    art: 'band',
    etikett: 'Wissenschaft',
    titel: 'Im Labor bleiben Immunzellen stark.',
    text: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
      'Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
    ],
    bild: BILD.hand,
    cta: {text: 'Zur Studie', href: '/pages/studie-immunzellen'},
  },
  {
    art: 'stimmen',
    titel: 'Was Menschen sagen, die damit arbeiten.',
    stimmen: [
      {
        text: 'Der QiOne® spielte von Anfang an in einer anderen Liga.',
        quelle: 'Matthias Cebula, Dipl. Ernährungspädagoge',
      },
      {
        text: 'Der QiOne gibt mir gerade in Gebäuden, in denen ich mich nicht vor Elektrosmogbelastung oder Fremdenergien schützen kann, das Gefühl der maximalen Sicherheit.',
        quelle: 'Daniela Cebula',
      },
      {
        text: 'Ich hab damit vom ersten Tag an eine Veränderung gespürt.',
        quelle: 'Patrick Thiele, Mentaltrainer für Spitzensportler',
      },
    ],
  },
  {
    art: 'faq',
    titel: 'Deine Fragen zum QiOne® 2 Pro.',
    fragen: [
      {
        f: 'Wie trage ich den QiOne® 2 Pro?',
        a: 'Du trägst ihn, wo du willst: an der Kette um den Hals oder in der Hosentasche, nah am Körper. Manche erleben die ersten Tage als intensiv. Dann trag ihn über der Kleidung oder leg ihn nachts ab, bis du dich an ihn gewöhnt hast.',
      },
      {
        f: 'Wie lange hält der QiOne® 2 Pro?',
        a: 'Jahrzehnte. Ohne Akku und ohne Elektronik gibt es nichts, das leer wird. Du trägst ihn, solange du willst, und vererbst ihn dann.',
      },
      {
        f: 'Kann ich ihn zurückgeben, wenn er nicht zu mir passt?',
        a: 'Ja. Du testest ihn 20 Tage zu Hause, ab dem Tag, an dem er bei dir ankommt. Passt er nicht, schickst du ihn kostenlos zurück. Du bekommst den vollen Kaufpreis erstattet.',
      },
    ],
  },
  {
    art: 'cta',
    titel: '20 Tage zu Hause testen.',
    text: 'Passt er nicht, bekommst du den vollen Kaufpreis zurück.',
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {art: 'anna'},
]);
