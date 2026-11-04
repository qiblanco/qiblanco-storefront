/*
 * DATENSTELLE der Kaufseite /products/necklace-2 (Necklace 2 für den Qi Alpha®
 * und QiOne®; Christian 04.11.2026, Job 20261104-prio5-neues-produkt-necklace-2).
 * Gerüst: product-pages/AlphaVorlage.jsx. Neu ist die STUFEN-WAHL: erst das
 * Material, dann die Länge, die es in diesem Material gibt.
 *
 * Wortlaut Christian: „Logo auf dem Verschluss“, „6-fache Laserung am
 * Verschluss“, „sehr stabil“, „sehr langlebig“, „ideal für den Qi Alpha“.
 * Durchmesser und Stahlsorte stehen hier nicht: sie sind für diese Kette nicht
 * genannt. PREISE und Längen kommen aus Shopify.
 */
const GOLD = '750er ethisches Vollgold';
const STAHL = 'Chirurgenstahl';

export const BAND = null;

export const PRODUKT = {
  overline: null,
  modus: null,
  name: 'Necklace 2 für den Qi Alpha® und QiOne®',
  claim: 'Das Logo deines Qi Alpha® auf dem Verschluss.',
  kurzzeile: '750er ethisches Vollgold oder Chirurgenstahl',
  punkte: [
    {zeichen: 'schutz', text: '6-fache Laserung am Verschluss'},
    {zeichen: 'material', text: 'Sehr stabil und sehr langlebig'},
    {zeichen: 'wellen', text: 'Ideal für den Qi Alpha®, passt auch zum QiOne®'},
  ],
  vergleichLink: null,
  herkunft: ['Designed and made in Germany.'],
};

const LAENGEN = {
  '40 cm': {zeile: 'Eng am Hals'},
  '45 cm': {zeile: 'Am Schlüsselbein'},
  '50 cm': {zeile: 'Knapp unter dem Schlüsselbein'},
  '60 cm': {zeile: 'Auf dem Brustbein'},
  '75 cm': {zeile: 'Lang, gut über der Kleidung'},
};

const ZEILEN_GEMEINSAM = [
  'Versicherter Versand, ab 99 € in Deutschland kostenlos',
  '20 Tage zu Hause testen, voller Kaufpreis zurück',
];

export const VARIANTE = {
  // Vorwahl wie beim Qi Alpha®: 60 cm.
  start: {Material: GOLD, Länge: '60 cm'},
  bildZurWahl: (bild, wahl) =>
    wahl?.Material === GOLD
      ? (bild?.altText ?? '').includes('Vollgold')
      : (bild?.altText ?? '').includes(STAHL),
  stufen: [
    {
      option: 'Material',
      name: 'material',
      auszeichnung: 'Material.',
      titel: 'Wähle dein Metall.',
      werte: {
        [GOLD]: {
          zeile: 'Lieferbar ab Januar 2027',
          liefertext: 'Vorbestellung: lieferbar ab Januar 2027',
          zusammenfassung: ['Vorbestellung: lieferbar ab Januar 2027', ...ZEILEN_GEMEINSAM],
          zeilenAttribute: [{key: 'Lieferbar', value: 'ab Januar 2027'}],
        },
        [STAHL]: {
          zeile: 'Lieferbar ab 1. Quartal 2027',
          liefertext: 'Vorbestellung: lieferbar ab 1. Quartal 2027',
          zusammenfassung: ['Vorbestellung: lieferbar ab 1. Quartal 2027', ...ZEILEN_GEMEINSAM],
          zeilenAttribute: [{key: 'Lieferbar', value: 'ab 1. Quartal 2027'}],
        },
      },
    },
    {
      option: 'Länge',
      name: 'laenge-kette',
      auszeichnung: 'Länge.',
      titel: 'Wähle, wo sie liegen soll.',
      anleitung:
        'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein Qi Alpha® liegen soll. Die Zahl an dieser Stelle ist deine Länge.',
      vorwahl: '60 cm',
      werte: LAENGEN,
      grenzregel: 'Zwischen zwei Längen? Nimm die kürzere. Dann liegt er nah an der Haut.',
    },
  ],
};

export const KETTE = null;
export const KETTE_GOLD = null;

export const BEZAHLART = {
  auszeichnung: 'Bezahlart.',
  titel: 'Zahle direkt oder bequem in Raten.',
  titelDirekt: null,
  optionen: [
    {id: 'direkt', titel: 'Direkt bezahlen', zeile: 'Einmal zahlen, fertig.'},
    {id: 'paypal', titel: 'PayPal Ratenzahlung', zeile: '12 × {rate12} € im Monat'},
    {id: 'klarna', titel: 'Klarna Ratenzahlung', zeile: '12 × {rate12} € im Monat'},
  ],
  hinweis: 'In 12 Raten à {rate12} € zahlen, mit 0 % Finanzierung mit PayPal und Klarna.',
};

export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Dein Necklace 2.',
  titel: 'Bereit für deinen Qi Alpha®.',
  zeilen: ZEILEN_GEMEINSAM,
  knopf: 'Vorbestellen',
  ruecknahme: null,
};

/* Box nur mit Bild und Bildunterschrift (Christian 29.10.2026); Bild 3 ist die ganze Kette. */
export const BOX = {
  titel: "What's in the Box",
  haupt: 'Necklace 2',
  bild: 2,
  kacheln: [],
};

export const FAKTEN = {
  ueberschrift: null,
  kacheln: [
    {
      icon: 'kraft',
      zahl: '6-fach',
      titel: 'Gelasert am Verschluss',
      satz: 'Sehr stabil und sehr langlebig.',
    },
    {
      icon: 'material',
      zahl: 'Logo',
      titel: 'Dasselbe wie auf dem Qi Alpha®',
      satz: 'Die feinen Striche laufen in Richtung der Kette.',
    },
    {
      icon: 'wellen',
      zahl: '2',
      titel: 'Metalle zur Wahl',
      satz: '750er ethisches Vollgold oder Chirurgenstahl.',
    },
  ],
};

export const RISIKOFREI = {
  zeile: '20 Tage zu Hause testen. Passt sie nicht, bekommst du den vollen Kaufpreis zurück.',
  details: ['Die 20 Tage beginnen, wenn sie bei dir ankommt.'],
};

export const WISSEN = null;
export const STIMMEN = null;
export const VERGLEICH = null;

export const FAQ = {
  ueberschrift: 'Deine Fragen zur Kette.',
  fragen: [
    {
      f: 'Wann wird meine Kette geliefert?',
      a: '750er ethisches Vollgold ist lieferbar ab Januar 2027, Chirurgenstahl ab dem 1. Quartal 2027.',
    },
    {
      f: 'Welche Längen gibt es?',
      a: 'In 750er ethischem Vollgold 45, 50 und 60 cm. In Chirurgenstahl 40, 45, 50, 60 und 75 cm.',
    },
    {
      f: 'Passt die Kette auch an meinen QiOne®?',
      a: 'Ja. Sie ist ideal für den Qi Alpha® und passt auch zum QiOne®.',
    },
  ],
};
