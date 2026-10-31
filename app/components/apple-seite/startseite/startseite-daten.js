/*
 * APPLE-FASSUNG DER STARTSEITE, beide Arme von start-e1-gs081 (Grossjob
 * 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo, s04).
 *
 * EIN Sektionssatz, abgeleitet aus der Gewinner-Fassung nach Messstand
 * 28.10.2026 (B = /pages/start-b führt: P(B > A) Weiterklick 0,73, Warenkorb
 * P(B besser) 0,96, noch kein Urteil). Der Test läuft weiter: Weiche, id,
 * Salz und Anteile bleiben unverändert. Damit er weiter etwas misst, behält
 * jeder Arm den Unterschied der Hypothese GS-081:
 *   B (start-b)  ein Knopf im Kopf, Kaufknopf direkt nach dem Laborbefund
 *                (GS-061), die drei Geräte direkt danach (GS-062), mobil
 *                Sticky-Kaufknopf.
 *   A (/)        zwei Knöpfe im Kopf („Jetzt kaufen“, „Mehr erfahren“), nach
 *                dem Laborbefund der Weg zur Studie, die Geräte weiter unten,
 *                kein Sticky.
 *
 * Texte: Bestand der live Apple-Kaufseiten (product-pages/*-alpha-daten.js,
 * PR + Sales frei), dazu die Kopfzeile der Startseite. Kein Preisanker (keine
 * Google-Note, keine Nutzerzahl), keine Sterne (Christian 29.10.2026).
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
  qibracelet: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qibracelet-winkel--a26b001f0816.jpg?v=1790809401`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qibracelet',
    alt: 'QiBracelet® aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1080,
    hoehe: 1080,
  },
  qihome: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qihome-front-1440--d19c273efe67.jpg?v=1793414663`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qihome',
    alt: 'QiHome® Air aus Eiche und Edelstahl mit goldenem Gitterchip®',
    breite: 1440,
    hoehe: 1440,
  },
  hand: {
    url: `${CDN}/products/2021-04-qiblanco-bali-16_e66b45ce-857c-4bd8-a123-05e0b2d4229e.jpg?v=1698259307`,
    alt: 'QiOne® 2 Pro an der Kette in einer offenen Hand',
    breite: 2579,
    hoehe: 2579,
  },
  wasser: {
    url: `${CDN}/files/2025-05-qiblanco-canggu-1054658.jpg?v=1762974785`,
    alt: 'QiBracelet® am Handgelenk im Wasser',
    breite: 3500,
    hoehe: 2336,
  },
});

/** Die drei Geräte (Zeilen wie im Gerätevergleich der Kaufseiten). */
export const MODELLE = Object.freeze({
  titel: 'Welches passt zu mir?',
  liste: [
    {
      name: 'QiOne® 2 Pro',
      zeile: 'Am Hals. Unter oder über der Kleidung.',
      bild: BILD.qione,
      kaufen: KAUFSEITE,
      details: '/pages/qione-2-pro-details',
    },
    {
      name: 'QiBracelet®',
      zeile: 'Am Handgelenk. Den ganzen Tag.',
      bild: BILD.qibracelet,
      kaufen: '/products/qibracelet',
      details: '/pages/qibracelet-details',
    },
    {
      name: 'QiHome® Air',
      zeile: 'Im Raum. Für alle unter deinem Dach.',
      bild: BILD.qihome,
      kaufen: '/products/qihome-air',
      details: '/pages/qihome-details',
    },
  ],
});

const KOPF = {
  art: 'hero',
  overline: 'QiOne® 2 Pro',
  titel: 'Tragbares Hightech mit messbaren Effekten auf Zellebene',
  unter: 'Schutz vor E-Smog, 5G und 6G. Gebaut für Jahrzehnte.',
  bild: BILD.qione,
  cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
};

const FAKTEN = {
  art: 'fakten',
  titel: 'Einmal kaufen. An die Familie weitergeben.',
  kacheln: [
    {zahl: 'Jahrzehnte', titel: 'Vererbbar', satz: 'Erst trägst du ihn. Dann die nächste Generation.'},
    {zahl: '8×', titel: 'Leistungsvolumen', satz: 'Achtmal so viel wie der QiOne® 1.'},
    {zahl: '750er', titel: 'Gold im Gitterchip®', satz: 'In Bayern gefertigt. Von Goldschmieden von Hand vollendet.'},
  ],
};

const LABOR = {
  art: 'band',
  etikett: 'Wissenschaft',
  titel: 'Im Labor bleiben Immunzellen stark.',
  text: [
    'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
    'Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
  ],
  bild: BILD.hand,
};

const ALLTAG = {
  art: 'band',
  etikett: 'Alltag',
  titel: 'Wasserfest. Überall mit dir.',
  text: ['Sauna, Meer, Chlor, Schweiß, Sonne.', 'QiOne® 2 Pro und QiBracelet® bleiben dran.'],
  bild: BILD.wasser,
};

const STIMMEN = {
  art: 'stimmen',
  titel: 'Das sagen Menschen, die ihn tragen.',
  stimmen: [
    {
      text: 'In herausfordernden Momenten fasse ich den QiOne kurz an und schon kehrt Ruhe ein.',
      quelle: 'Google-Bewertung, Oktober 2026',
    },
    {
      text: 'Insgesamt fühle ich mich ausgeglichener, entspannter und mehr bei mir.',
      quelle: 'Google-Bewertung, Oktober 2026',
    },
    {
      text: 'Seit ich den QiOne®2Pro trage, habe ich mehr Klarheit bei Entscheidungen und fühle mich selbstsicherer.',
      quelle: 'Google-Bewertung, November 2025',
    },
  ],
};

const ABSCHLUSS = {
  art: 'cta',
  titel: '20 Tage zu Hause testen.',
  text: 'Passt er nicht, bekommst du den vollen Kaufpreis zurück. Mit 0 % Finanzierung zahlst du in 12 Raten.',
  cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
};

const ANNA = {art: 'anna'};

/** Platzhalter für die Gerätereihe (eigene Komponente, kein Baukasten-Typ). */
export const MODELL_PLATZ = Object.freeze({art: 'modelle'});

/**
 * Sektionsliste je Arm. `arm` 'b' = /pages/start-b, sonst A = /.
 * @param {'a'|'b'} arm
 */
export function startseiteSektionen(arm) {
  if (arm === 'b') {
    return [
      KOPF,
      FAKTEN,
      {...LABOR, cta: {text: 'Jetzt kaufen', href: KAUFSEITE}},
      MODELL_PLATZ,
      ALLTAG,
      STIMMEN,
      ABSCHLUSS,
      ANNA,
    ];
  }
  return [
    {...KOPF, cta2: {text: 'Mehr erfahren', href: '/pages/qione-2-pro-details'}},
    FAKTEN,
    {...LABOR, cta: {text: 'Zur Studie', href: '/pages/studie-immunzellen'}},
    ALLTAG,
    STIMMEN,
    MODELL_PLATZ,
    ABSCHLUSS,
    ANNA,
  ];
}
