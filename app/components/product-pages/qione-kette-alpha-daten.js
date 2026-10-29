/*
 * DATENSTELLE der Kaufseite /products/qione-kette (Necklace für QiOne®) im
 * Apple-Stil der Qi-Alpha-Seite (Grossjob 20261027-GROSSJOB-apple-konfigurator-
 * qione-qihome-qibracelet-ab, s13; Christian Zx 29.10.2026: „die anderen
 * Shop-Seiten … sehr, sehr, sehr ähnlich bauen“). Das Gerüst ist
 * product-pages/AlphaVorlage.jsx wie bei QiOne® 2 Pro, QiHome® Air und
 * QiBracelet®; hier steht nur, was diese Seite hineingibt.
 *
 * Grundlage der Texte: die heutige Seite (Shopify-Beschreibung: 1,6 mm,
 * Chirurgenstahl 316L, Karabinerverschluss, Made in Germany) und die A-Texte
 * der QiOne-Seite (Öse 2,5 mm, Gehäuse aus Chirurgenstahl, 20 Tage). Nichts
 * dazuerfunden. Die heutige Seite bleibt im Code und kommt per Schalter zurück.
 *
 * PREISE und Längen kommen aus Shopify (Seite und Kasse nennen dieselbe Zahl).
 * Die Kette kostet unter 500 €: die Vorlage zeigt dann nur „Direkt bezahlen“
 * und keinen Raten-Titel. Unter 99 € ist der Versand nicht kostenlos, die
 * Zusammenfassung sagt deshalb nichts von kostenlosem Versand.
 */

/* Band oben: die 360-Grad-Drehung des QiOne® 2 Pro, für den die Kette gebaut ist. */
export const BAND = {
  titel: 'Für deinen QiOne®',
  unter: '- Always On Mode -',
  drehung: 'qione',
};

export const PRODUKT = {
  overline: null,
  modus: null,
  name: 'Necklace für QiOne®',
  claim: 'Chirurgenstahl 316L',
  kurzzeile: '1,6 mm · Karabinerverschluss',
  punkte: [
    {zeichen: 'schutz', text: 'Hält deinen QiOne® den ganzen Tag am Körper'},
    {zeichen: 'material', text: 'Derselbe Stahl wie sein Gehäuse'},
    {zeichen: 'wellen', text: 'Die Kette geht mit ins Meer und zum Sport'},
  ],
  // Bewachter SEO-Link der heutigen Seite (Grossjob 20261006-...-seo-strategie,
  // s02): die Kette verweist mit dem Produktnamen auf die Kaufseite des Geräts.
  vergleichLink: {text: 'Zubehör für den QiOne® 2 Pro', href: '/products/qione-2-pro'},
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/*
 * Länge: die fünf Shopify-Varianten („XS - 40 cm“ … „XL - 75 cm“). Der Name
 * zeigt nur die Länge, die Zeile sagt, wo der QiOne® dann liegt. Ausverkaufte
 * Längen markiert die Vorlage selbst.
 */
const LAENGEN = {
  'XS - 40 cm': ['40 cm', 'Eng am Hals'],
  'S - 45cm': ['45 cm', 'Am Schlüsselbein'],
  'M - 50 cm': ['50 cm', 'Knapp unter dem Schlüsselbein'],
  'L - 60 cm': ['60 cm', 'Auf dem Brustbein'],
  'XL - 75 cm': ['75 cm', 'Lang, gut über der Kleidung'],
};
const proLaenge = (i) =>
  Object.fromEntries(Object.entries(LAENGEN).map(([k, v]) => [k, v[i]]));

export const VARIANTE = {
  auszeichnung: 'Länge.',
  titel: 'Wähle, wo er liegen soll.',
  anleitung:
    'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein QiOne® liegen soll. Die Zahl an dieser Stelle ist deine Länge.',
  namen: proLaenge(0),
  zeilen: proLaenge(1),
  grenzregel: 'Zwischen zwei Längen? Nimm die kürzere. Dann liegt er nah an der Haut.',
  anpassen: null,
};

/* Diese Seite verkauft die Kette selbst: kein Ketten-Schritt. */
export const KETTE = null;
export const KETTE_GOLD = null;

export const BEZAHLART = {
  auszeichnung: 'Bezahlart.',
  titel: 'Zahle direkt oder bequem in Raten.',
  titelDirekt: null,
  optionen: [
    {id: 'direkt', titel: 'Direkt bezahlen', zeile: 'PayPal, Klarna, Karte oder Überweisung'},
  ],
  hinweis: null,
};

export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Deine neue Kette.',
  titel: 'Bereit für deinen QiOne®.',
  zeilen: [
    'Versicherter Versand, in 2 bis 3 Tagen bei dir',
    'Ab 99 € versenden wir kostenlos innerhalb Deutschlands',
    '20 Tage zu Hause testen, voller Kaufpreis zurück',
  ],
  knopf: 'In den Warenkorb legen',
  ruecknahme: null,
};

/* Box nur mit Bild und Bildunterschrift, ohne Liste darunter (Christian 29.10.: „wie beim
 * QiBracelet, da wird auch nichts drunter geschrieben“); 316L, 1,6 mm und Karabiner stehen im Kopf
 * und in den Fakten-Kacheln. */
export const BOX = {
  titel: "What's in the Box",
  kacheln: [],
};

export const FAKTEN = {
  ueberschrift: null,
  kacheln: [
    {
      icon: 'material',
      zahl: '316L',
      titel: 'Chirurgenstahl',
      satz: 'Aus demselben Stahl wie das Gehäuse deines QiOne®. Er läuft nicht an.',
    },
    {
      icon: 'kraft',
      zahl: '1,6 mm',
      titel: 'Fein und fest',
      satz: 'Passt durch die 2,5-mm-Öse deines QiOne® 2 Pro.',
    },
    {
      icon: 'wellen',
      zahl: 'Wasserfest',
      titel: 'Überall mit dir',
      satz: 'Meer, Chlor und Schweiß machen ihr nichts.',
    },
  ],
};

export const RISIKOFREI = {
  zeile: '20 Tage zu Hause testen. Passt sie nicht, bekommst du den vollen Kaufpreis zurück.',
  details: ['Die 20 Tage beginnen, wenn sie bei dir ankommt.'],
  link: {
    vor: 'Alles zu Rückgabe, Widerruf und Gewährleistung findest du unter',
    text: 'Neu oder gebraucht',
    href: '/pages/neu-oder-gebraucht#ruecknahme',
  },
};

/* Slot „Wissen“: ein Kapitel zum Tragen, mit dem Foto aus Bali (Shopify-Bild 4). */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Tragen',
      titel: 'Den ganzen Tag auf der Haut.',
      absaetze: [
        'An der Kette liegt dein QiOne® dort, wo du ihn haben willst: unter dem Hemd, über dem Pullover, beim Sport.',
        'Mit dem Karabinerverschluss legst du die Kette abends ab und morgens wieder an.',
        'Zum Reinigen genügen Wasser und ein weiches Tuch.',
      ],
      bild: 4,
    },
  ],
  studien: null,
};

/*
 * Slot „Stimmen“: Google-Bewertungen zum QiOne® im Wortlaut (dieselben wie
 * auf /products/qione-2-pro, s02/quellen/bewertungen-auszug.txt). Die Kette
 * trägt den QiOne®; wer sie kauft, liest, wie andere ihn tragen.
 */
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

/* Gerätevergleich entfällt: die Kette ist kein Gerät. */
export const VERGLEICH = null;

export const FAQ = {
  ueberschrift: 'Deine Fragen zur Kette.',
  fragen: [
    {
      f: 'Welche Länge passt zu mir?',
      a: 'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein QiOne® liegen soll. 45 cm liegen am Schlüsselbein, 60 cm auf dem Brustbein. Zwischen zwei Längen nimmst du die kürzere.',
    },
    {
      f: 'Passt die Kette an meinen QiOne® 2 Pro?',
      a: 'Ja. Die Kette ist 1,6 mm stark, die Öse des QiOne® 2 Pro misst 2,5 mm. Du fädelst sie durch und schließt den Karabiner.',
    },
    {
      f: 'Darf die Kette nass werden oder in die Sauna?',
      a: 'Ja. Chirurgenstahl 316L rostet nicht und läuft nicht an, darum bleibt die Kette im Meer, im Schwimmbad und in der Sauna dran. In der Sauna wird der Stahl warm: Trag sie dort mit Hautkontakt, dann merkst du rechtzeitig, wenn sie dir zu warm wird.',
    },
    {
      // PR-Manager s13 (G1/P5): kein Verträglichkeitsversprechen, nur der
      // Stahl und der Weg zum Hautarzt.
      f: 'Vertrage ich die Kette auf der Haut?',
      a: 'Die Kette ist aus Chirurgenstahl 316L, also aus demselben Stahl wie das Gehäuse deines QiOne®. Hast du eine Nickelallergie, sprich vorher mit deinem Hautarzt.',
    },
    {
      f: 'Kann ich die Kette zusammen mit dem QiOne® 2 Pro kaufen?',
      a: 'Ja. Auf der Seite des QiOne® 2 Pro wählst du die Kette in deiner Länge gleich mit. Beides kommt in einem Paket.',
    },
    {
      f: 'Kann ich sie zurückgeben?',
      a: 'Ja. Du testest sie 20 Tage zu Hause, ab dem Tag, an dem sie bei dir ankommt. Passt sie nicht, bekommst du den vollen Kaufpreis zurück.',
    },
  ],
};
