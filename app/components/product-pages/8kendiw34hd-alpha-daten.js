/*
 * DATENSTELLE des Angebots /products/8kendiw34hd („Angebot: 2x QiOne® 2 Pro“,
 * Ziel verschickter Angebotslinks, noindex) im Apple-Stil der Qi-Alpha-Seite
 * (Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab,
 * s13-r3; Christian Zx 29.10.2026). Das Gerüst ist AlphaVorlage.jsx, die Seite
 * rendert AngebotKonfigurator.jsx.
 *
 * Grundlage der Texte: die A-Texte von /products/qione-2-pro (PR + Sales frei,
 * qione-2-pro-alpha-daten.js). Nichts dazuerfunden. Die heutige Seite bleibt
 * im Code und kommt per Schalter zurück (KONFIGURATOR_8KENDIW34HD, Default aus).
 *
 * PREISE kommen aus Shopify, der Streichpreis aus compareAtPrice. Kein
 * Ketten-Schritt: eine Kette für zwei Geräte wäre eine halbe Wahl; wer Ketten
 * will, findet sie auf /products/qione-kette (FAQ). Kein Baumwollband in der
 * Box: ob es im Paket liegt, ist nicht belegt.
 */

// Band: ein Satz über den Kunden, kein Fachbegriff (Kanon Kaufüberzeugung:
// „kohärentes Wasser“ nicht als Einstieg; PR-Manager s13-r3 Durchgang 2).
export const BAND = {
  titel: 'Zu zweit.',
  unter: '- Always On Mode -',
  drehung: 'qione',
};

export const PRODUKT = {
  overline: null,
  modus: null,
  name: '2× QiOne® 2 Pro',
  claim: 'Lifetime Wearable',
  kurzzeile: '2. Generation · zwei Geräte in einem Paket',
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  vergleichLink: null,
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

export const VARIANTE = null;
export const KETTE = null;
export const KETTE_GOLD = null;
export const KETTE_IM_SET = null;

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
  auszeichnung: 'Deine zwei QiOne® 2 Pro.',
  titel: 'Einer für dich. Einer für einen Menschen, der dir wichtig ist.',
  zeilen: [
    'Kostenloser, versicherter Versand innerhalb Deutschlands',
    'Versand am nächsten Werktag',
    '20 Tage zu Hause testen, voller Kaufpreis zurück',
  ],
  knopf: 'In den Warenkorb legen',
  ruecknahme: null,
};

export const BOX = {
  titel: "What's in the Box",
  haupt: '2× QiOne® 2 Pro',
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
      icon: 'wellen',
      zahl: 'Wasserfest',
      titel: 'Überall mit dir',
      satz: 'Sauna, Meer, Chlor, Schweiß, Sonne. Er bleibt dran.',
    },
    {
      icon: 'kraft',
      zahl: '2×',
      titel: 'Ein Paket',
      satz: 'Zwei Geräte, ein Versand, ein Preis.',
    },
  ],
};

export const RISIKOFREI = {
  zeile: '20 Tage zu Hause testen. Passen sie nicht, bekommst du den vollen Kaufpreis zurück.',
  details: ['Die 20 Tage beginnen, wenn das Paket bei dir ankommt.', 'Die Rücksendung kostet dich nichts.'],
  link: {
    vor: 'Alles zu Rückgabe, Widerruf und Gewährleistung findest du unter',
    text: 'Neu oder gebraucht',
    href: '/pages/neu-oder-gebraucht#ruecknahme',
  },
};

export const VERGLEICH = null;

/* Slot „Wissen“: die Studie (Beweis als Closer). `bild`: Index des Shopify-Bilds des Pakets. */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Wissenschaft',
      titel: '84,7 statt 60,5 Prozent.',
      absaetze: [
        'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
        'Ohne QiOne® 2 Pro behielten sie 60,5 Prozent ihrer Abwehrleistung, mit ihm 84,7 Prozent.',
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
  ueberschrift: 'Deine Fragen zum Paket.',
  fragen: [
    {
      f: 'Warum kosten zwei QiOne® 2 Pro {preis}?',
      a: 'Im Paket zahlst du für zwei Geräte weniger als für zwei einzelne. Jeder Gitterchip® entsteht in unserer Fertigung in Bayern, aus einer eigenen 750er Goldlegierung. Goldschmiede vollenden jedes Detail von Hand. In Raten zahlst du 12 × {rate12} €, mit 0 % Finanzierung über PayPal oder Klarna.',
    },
    {
      f: 'Wie trage ich den QiOne® 2 Pro?',
      a: 'Du trägst ihn, wo du willst: an der Kette um den Hals oder in der Hosentasche, nah am Körper. So ist er den ganzen Tag bei dir.',
    },
    {
      f: 'Gibt es eine Kette dazu?',
      a: 'Die Kette gibt es einzeln, als Necklace für QiOne®: Chirurgenstahl, 1,6 mm stark, passend für die 2,5-mm-Öse. Du wählst sie in deiner Länge, je Gerät eine.',
    },
    {
      f: 'Kann ich das Paket zurückgeben, wenn es nicht zu mir passt?',
      a: 'Ja. Du testest beide 20 Tage zu Hause, ab dem Tag, an dem das Paket bei dir ankommt. Passen sie nicht, schickst du sie kostenlos zurück. Du bekommst den vollen Kaufpreis erstattet.',
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
