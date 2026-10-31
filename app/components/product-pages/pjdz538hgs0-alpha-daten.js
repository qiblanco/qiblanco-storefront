/*
 * DATENSTELLE des Angebots /products/pjdz538hgs0 („Angebot: QiOne® 2 Pro +
 * Necklace“, Ziel verschickter Angebotslinks, noindex) im Apple-Stil der
 * Qi-Alpha-Seite (Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab, s13-r3; Christian Zx 29.10.2026: „die anderen Shop-Seiten …
 * sehr, sehr, sehr ähnlich bauen“). Das Gerüst ist AlphaVorlage.jsx, die
 * Seite rendert AngebotKonfigurator.jsx.
 *
 * Grundlage der Texte: die A-Texte von /products/qione-2-pro (PR + Sales frei,
 * qione-2-pro-alpha-daten.js) und von /products/qione-kette (Längen, Stahl).
 * Nichts dazuerfunden. Die heutige Seite bleibt im Code und kommt per
 * Schalter zurück (KONFIGURATOR_PJDZ538HGS0, Default aus).
 *
 * LÄNGE (offene Produktfrage s13, gemessen 31.10.2026): Shopify führt das Set
 * mit EINER Variante. Die alte Seite sagte „Die Länge kannst du dir nach
 * Belieben aussuchen“, eine Wahl gab es aber nicht: 3 von 12 Bestellungen
 * nannten die Länge selbst in der Notiz, 9 gar nicht. Jetzt wählt der Kunde
 * die Länge hier; sie geht als Zeilenattribut „Kettenlänge“ an die Bestellung.
 * Die Lieferbarkeit je Länge kommt live von der Kette qione-kette.
 * Vorwahl 60 cm: die meistverkaufte Länge seit 2024 (696 von 1946,
 * s13/mess/r3/kette-laengen-verkauf.json).
 *
 * PREISE kommen aus Shopify (Seite und Kasse nennen dieselbe Zahl), der
 * Streichpreis aus compareAtPrice. Kein Baumwollband in der Box: ob es im Set
 * liegt, ist nicht belegt (Bestellung #6810 fragte danach).
 */

// Band: ein Satz über den Kunden, kein Fachbegriff (Kanon Kaufüberzeugung:
// „kohärentes Wasser“ nicht als Einstieg; PR-Manager s13-r3 Durchgang 2).
export const BAND = {
  titel: 'Immer bei dir.',
  unter: '- Always On Mode -',
  drehung: 'qione',
};

export const PRODUKT = {
  overline: null,
  modus: null,
  name: 'QiOne® 2 Pro + Necklace',
  claim: 'Lifetime Wearable',
  kurzzeile: '2. Generation · mit Kette aus Chirurgenstahl',
  // Elinas Kernpunkte wie auf /products/qione-2-pro (EL-20261027-c05a2273).
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  vergleichLink: null,
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

export const VARIANTE = null;

/* Die Kette liegt bei: kein Zusatz-Schritt, nur die Länge (KETTE_IM_SET). */
export const KETTE = null;
export const KETTE_GOLD = null;

export const KETTE_IM_SET = {
  handle: 'qione-kette',
  vorwahl: 60,
  auszeichnung: 'Länge.',
  titel: 'Wähle, wo er liegen soll.',
  anleitung:
    'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein QiOne® liegen soll. Die Zahl an dieser Stelle ist deine Länge.',
  zeilen: {
    40: 'Eng am Hals',
    45: 'Am Schlüsselbein',
    50: 'Knapp unter dem Schlüsselbein',
    60: 'Auf dem Brustbein',
    75: 'Lang, gut über der Kleidung',
  },
  grenzregel: 'Zwischen zwei Längen? Nimm die kürzere. Dann liegt er nah an der Haut.',
  name: (cm) => `Kette ${cm} cm`,
  box: (cm) => `Kette aus Chirurgenstahl, ${cm} cm`,
  bilder: [
    {
      url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/products/necklace_06.png?v=1698259307',
      alt: 'Kette von Qi Blanco aus Chirurgenstahl mit Karabinerverschluss',
    },
  ],
};

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
  auszeichnung: 'Dein QiOne® 2 Pro mit Kette.',
  titel: 'Genau so, wie du ihn trägst.',
  zeilen: [
    'Kostenloser, versicherter Versand innerhalb Deutschlands',
    'Versand am nächsten Werktag',
    '20 Tage zu Hause testen, voller Kaufpreis zurück',
  ],
  knopf: 'In den Warenkorb legen',
  ruecknahme: null,
};

/* Box: das Gerät (erstes Shopify-Bild des Sets) und die Kette in der gewählten Länge. */
export const BOX = {
  titel: "What's in the Box",
  haupt: 'QiOne® 2 Pro',
  kacheln: [],
};

export const FAKTEN = {
  ueberschrift: null,
  kacheln: [
    {
      icon: 'generationen',
      zahl: 'Jahrzehnte',
      titel: 'Vererbbar',
      satz: 'Erst trägst du ihn. Dann die nächste Generation.',
    },
    {
      icon: 'material',
      zahl: '316L',
      titel: 'Chirurgenstahl',
      satz: 'Kette und Gehäuse sind aus demselben Stahl. Er läuft nicht an.',
    },
    {
      icon: 'wellen',
      zahl: 'Wasserfest',
      titel: 'Überall mit dir',
      satz: 'Sauna, Meer, Chlor, Schweiß, Sonne. Er bleibt dran.',
    },
  ],
};

export const RISIKOFREI = {
  zeile: '20 Tage zu Hause testen. Passt er nicht, bekommst du den vollen Kaufpreis zurück.',
  details: ['Die 20 Tage beginnen, wenn er bei dir ankommt.', 'Die Rücksendung kostet dich nichts.'],
  link: {
    vor: 'Alles zu Rückgabe, Widerruf und Gewährleistung findest du unter',
    text: 'Neu oder gebraucht',
    href: '/pages/neu-oder-gebraucht#ruecknahme',
  },
};

export const VERGLEICH = null;

/* Slot „Wissen“: die Studie (Beweis als Closer) und das Tragen an der Kette. `bild`: Index des Shopify-Bilds des Sets. */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Wissenschaft',
      titel: '84,7 statt 60,5 Prozent.',
      absaetze: [
        'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
        'Ohne QiOne® 2 Pro behielten sie 60,5 Prozent ihrer Abwehrleistung, mit ihm 84,7 Prozent.',
      ],
      bild: 6,
    },
    {
      etikett: 'Tragen',
      titel: 'Den ganzen Tag bei dir.',
      absaetze: [
        'An der Kette liegt dein QiOne® dort, wo du ihn haben willst: unter dem Hemd, über dem Pullover, beim Sport.',
        'Die Kette ist 1,6 mm stark und passt durch seine 2,5-mm-Öse. Der Karabiner schließt mit einer Hand.',
      ],
      bild: 1,
    },
  ],
  studien: {
    ueberschrift: 'Die ganze Studie',
    link_text: 'Zur Studie',
    href: '/pages/studie-immunzellen',
  },
};

export const STIMMEN_GOOGLE = {
  ueberschrift: '{bewertung} ★ bei Google',
  note: '4,8',
  instagram: null,
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
export const STIMMEN = null;

export const FAQ = {
  ueberschrift: 'Deine Fragen zum Set.',
  fragen: [
    {
      f: 'Welche Länge passt zu mir?',
      a: 'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein QiOne® liegen soll. 45 cm liegen am Schlüsselbein, 60 cm auf dem Brustbein. Zwischen zwei Längen nimmst du die kürzere.',
    },
    {
      f: 'Warum kostet das Set {preis}?',
      a: 'Du bekommst den QiOne® 2 Pro und seine Kette in einem Paket. Sein Gitterchip® entsteht in unserer Fertigung in Bayern, aus einer eigenen 750er Goldlegierung. Goldschmiede vollenden jedes Detail von Hand. Du kaufst ihn einmal und trägst ihn jahrzehntelang. In Raten zahlst du 12 × {rate12} €, mit 0 % Finanzierung über PayPal oder Klarna.',
    },
    {
      f: 'Wie trage ich den QiOne® 2 Pro?',
      a: 'An der Kette um den Hals, unter oder über der Kleidung. So ist er den ganzen Tag bei dir.',
    },
    {
      f: 'Kann ich das Set zurückgeben, wenn es nicht zu mir passt?',
      a: 'Ja. Du testest es 20 Tage zu Hause, ab dem Tag, an dem es bei dir ankommt. Passt es nicht, schickst du es kostenlos zurück. Du bekommst den vollen Kaufpreis erstattet.',
    },
    {
      f: 'Wie lange hält der QiOne® 2 Pro?',
      a: 'Jahrzehnte. Ohne Akku und ohne Elektronik gibt es nichts, das leer wird. Du trägst ihn, solange du willst, und vererbst ihn dann.',
    },
    {
      f: 'Wie funktioniert der QiOne®?',
      a: 'Im Kern sitzt der Gitterchip® aus einer eigenen 750er Goldlegierung. Seine Atome stehen in fester Ordnung. Diese Ordnung gibt er an das Wasser in deinem Körper weiter.',
    },
  ],
};
