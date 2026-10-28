/*
 * DATENSTELLE der QiOne-2-Pro-Kaufseite im Konfigurator (Alpha-Vorlage).
 * Schnittstelle: claude-jobs/20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab/s05/SCHNITTSTELLE.md. Das Gerüst ist product-pages/AlphaVorlage.jsx,
 * die Slots stehen in AlphaVorlageSlots.jsx; hier steht nur, was die Seite
 * hineingibt.
 *
 * STAND s06 (2026-10-28): die neuen Texte der A-Fassung, wörtlich aus
 * s03/texte-qione-2-pro.json (r4 final: PR + Sales frei, Challenger s11
 * gegengeprüft). Nicht umformuliert. Wo ein s03-Feld auf zwei Felder der
 * Vorlage verteilt wird (Überschrift = Auszeichnung + Titel), ist der Wortlaut
 * an der Satzgrenze geteilt. Gitterchip® statt ™ (main #1071, Christian
 * 28.10.2026 „ja Gitterchip machen wir ab jetzt überall mit ®“). Die alten
 * Texte bleiben in B (/products/qione-2-pro-b).
 *
 * PREISE stehen hier NICHT: Gerät und Ketten kommen aus Shopify (Seite und
 * Kasse nennen dieselbe Zahl). `{preis}` füllt die Route aus Shopify,
 * `{rate12}` die Vorlage (Hausformel ceil(Preis / 12), nur Markt DE).
 */

/*
 * Band oben (wie /products/qi-alpha „Kohärentes Licht / - Ultra High Vibe
 * Mode -“): s03 kopf.overline als Titel, kopf.modus als Unterzeile, dazu die
 * vorhandene 360-Grad-Drehung des QiOne® 2 Pro (Produkt360Video, Ersatzbild
 * zuerst, nie Schwarz).
 */
export const BAND = {
  titel: 'Kohärentes Wasser',
  unter: '- Always On Mode -',
  drehung: 'qione',
};

export const PRODUKT = {
  // overline/modus stehen im Band darüber (einmal, nicht doppelt).
  overline: null,
  modus: null,
  name: 'QiOne® 2 Pro',
  claim: 'Lifetime Wearable',
  kurzzeile: '2. Generation · 8× Leistungsvolumen',
  // Elinas Kernpunkte (EL-20261027-c05a2273, „von Elina entschieden“).
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  // Kundenfrage Nr. 1 „Welches passt zu mir?“ (s02, Anna 24 von 106): Weg
  // zum Vergleich weiter unten (id in der Route). Ein Textlink, kein Knopf.
  vergleichLink: {text: 'Welches passt zu mir? Modelle vergleichen', href: '#geraetevergleich'},
  preisanker: {nutzer: '+ 14.000 Nutzer', banner: 'Ultimate Power'},
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/* Shopify führt nur „Default Title“: der Schritt Variante entfällt. */
export const VARIANTE = null;

/*
 * KETTE (Christian Z6 „man qione 2 pro könnte man auch gleich die Kette mit
 * verkaufen“; Elina Punkt 6): die Chirurgenstahl-Kette `qione-kette` in jeder
 * Länge, die Shopify als kaufbar meldet (XS 40 · S 45 · M 50 · L 60 · XL 75 cm).
 * Gerät und Kette gehen in EINER LinesAdd-Aktion in den Warenkorb.
 */
export const KETTE = {
  handle: 'qione-kette',
  auszeichnung: 'Kette.',
  titel: 'Trag ihn an seiner eigenen.',
  zeile: 'Edelstahl, im selben Glanz wie sein Gehäuse. So trägst du ihn jeden Tag auf der Haut.',
  ohne: {
    titel: 'Ohne Kette',
    text: 'Das Baumwollband liegt bei.',
  },
  // Kachelname aus der Länge der Shopify-Variante („S - 45cm“ -> 45 cm).
  name: (cm) => `${cm} cm Kette aus Chirurgenstahl`,
  box: (cm) => `${cm} cm Kette aus Chirurgenstahl`,
  bilder: [
    {
      url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/products/necklace_06.png?v=1698259307',
      alt: 'Kette von Qi Blanco aus Chirurgenstahl mit Karabinerverschluss',
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/products/2021-04-qiblanco-bali-16_e66b45ce-857c-4bd8-a123-05e0b2d4229e.jpg?v=1698259307',
      alt: 'QiOne-Kette in der Hand',
    },
  ],
};

/*
 * GOLDKETTE FÜR DEN QIONE — VORBEREITET, AUSGEBLENDET (Elina Punkt 6).
 * Solange `sichtbar` false ist, fragt der Loader nichts ab und die Seite
 * rendert keine Goldkachel. Zum Einschalten: Shopify-Produkt anlegen, hier
 * `handle` eintragen und `sichtbar: true` setzen (ein Deploy, nach Elinas GO).
 */
export const KETTE_GOLD = {
  sichtbar: false,
  handle: 'qione-goldkette',
  name: (cm) => `${cm} cm - 750iger ethisches Vollgold`,
  box: (cm) => `${cm} cm - 750iger ethisches Vollgold`,
  bilder: null,
};

/*
 * BEZAHLART (s03: drei Karten direkt / PayPal / Klarna). {rate12} setzt die
 * Logik aus dem Preis ein (ceil(Preis / 12), nur Markt DE, ab 500 €). Ohne
 * Ratenangebot bleibt nur „Direkt bezahlen“ und kein Raten-Titel.
 * `hinweis` ist der Kaufbox-Bestand (KaufZusage.jsx), s03 unverändert.
 */
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

/* Zusammenfassung mit EINEM Kaufknopf. Die 20 Tage stehen als dritte Zeile. */
export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Dein neuer QiOne® 2 Pro.',
  titel: 'Genau so, wie du ihn willst.',
  zeilen: [
    'Kostenloser, versicherter Versand innerhalb Deutschlands',
    'Versand am nächsten Werktag',
    '20 Tage zu Hause testen, voller Kaufpreis zurück',
  ],
  knopf: 'In den Warenkorb legen',
  rueckgabe: null,
};

/*
 * What's in the Box: feste Teile. Die gewählte Kette setzt die Vorlage selbst
 * dazu (boxInhalt), deshalb steht s03 „Deine Kette, wenn du sie gewählt hast“
 * nicht als feste Zeile da.
 */
export const BOX = {
  titel: "What's in the Box",
  teile: ['QiOne® 2 Pro mit Gitterchip® 2.0', 'Baumwollband, damit du ihn sofort trägst'],
};

/* Faktenkacheln (s03 kacheln: groß, Titel, Satz). */
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
      zahl: '8×',
      titel: 'Der größere Gegenwert',
      satz: 'Achtmal so viel Leistungsvolumen wie der QiOne® 1. Für jeden Euro bekommst du fast dreimal so viel.',
    },
  ],
};

/* 20-Tage-Element: eine Zeile mit Zeichen, Details aufklappbar (s03 vertrauen). */
export const RISIKOFREI = {
  zeile: '20 Tage zu Hause testen. Passt er nicht, bekommst du den vollen Kaufpreis zurück.',
  details: ['Die 20 Tage beginnen, wenn er bei dir ankommt.', 'Die Rücksendung kostet dich nichts.'],
  // Bewachter Inhaltslink (probe_neue_seiten_inhaltslinks__20260925.py, s02-Falle).
  link: {
    vor: 'Alles zu Rückgabe, Widerruf und Gewährleistung findest du unter',
    text: 'Neu oder gebraucht',
    href: '/pages/neu-oder-gebraucht#ruecknahme',
  },
};

/*
 * Slot „Modelle vergleichen“ (Gewinner Gerätevergleich, s02 Z40). Überschrift
 * = s03 kopf.vergleich_link („Welches passt zu mir?“), die Zeilen je Gerät
 * sind die s04-Zeilen der QiBracelet-Seite (PR + Sales frei), damit alle drei
 * Seiten dieselbe Sprache führen.
 */
export const VERGLEICH = {
  ueberschrift: 'Welches passt zu mir?',
  intro: null,
  zeilen: {
    'qione-2-pro': 'Am Hals. Unter oder über der Kleidung.',
    qibracelet: 'Am Handgelenk. Den ganzen Tag.',
    'qihome-air': 'Im Raum. Für alle unter deinem Dach.',
  },
};

/* Nutzen-Raster (s03 nutzen): vier Spalten im Slot „Wissen“, über dem Kapitel. */
export const NUTZEN = {
  ueberschrift: 'Ruhe, die du immer bei dir trägst.',
  spalten: [
    {
      etikett: 'Technologie',
      titel: 'Er wirkt, solange du ihn trägst.',
      text: 'Im Kern sitzt der Gitterchip® 2.0 aus einer eigenen 750er Goldlegierung. Seine Atome stehen in fester Ordnung. Diese Ordnung gibt er an das Wasser in deinem Körper weiter.',
    },
    {
      etikett: 'Wissenschaft',
      titel: 'Im Labor bleiben Immunzellen stark.',
      text: 'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet. Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
      link: {text: 'Zur Studie', href: '/pages/studie-immunzellen'},
    },
    {
      etikett: 'Erfahrungen',
      titel: 'Endlich wieder durchschlafen.',
      text: 'Das schreiben Nutzer über ihn. Sie erzählen auch von mehr Ruhe und mehr Energie.',
      // {sterne}: Google-Note live (useGoogleRating, wie der Preisanker).
      link: {text: '{sterne} ★ bei Google', href: 'google'},
    },
    {
      etikett: 'Service',
      titel: 'Eine Frage? Frag Anna.',
      text: 'Anna antwortet dir sofort im Chat. Per E-Mail antwortet dir unser Team persönlich, werktags.',
    },
  ],
};

/* Slot „Wissen“ (Qi-Alpha-Stil). `bild`: Index des Shopify-Produktbilds. */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Erdstrahlung',
      titel: 'Ruhig schlafen, egal was unter dir liegt.',
      absaetze: [
        'Wasseradern, Gesteinsbrüche, Gitternetze: Erdstrahlung hat viele Namen.',
        'Sensible Menschen kennen sie aus der Nacht. Der Schlaf wird flach, der Morgen schwer.',
        'Auch Erdstrahlung ist elektromagnetische Strahlung. Sie kommt zu Handy und WLAN dazu.',
        'Der QiOne® 2 Pro hält das Wasser in deinem Körper in Ordnung, Tag und Nacht. Egal, wo dein Bett steht.',
      ],
      bild: 1,
    },
  ],
  studien: null,
};

/*
 * Weltrekord (s03 weltrekord): „Weltrekordhalter im Kraftsport“ ohne Zahl,
 * bis Christian Z49 beantwortet (Rückfrage 2026-10-27, Empfehlung ohne Zahl).
 * Video über die Fassade YoutubeIframe (kein Player vorab, kein Schwarz).
 */
export const WELTREKORD = {
  siegel: 'Weltrekordhalter im Kraftsport',
  titel: 'Frank Delventhal sagt Danke.',
  text: 'Er bog 16 mm Rundstahl über seinen Nasenrücken. Er sprengte eine Kette fünfmal mit dem Brustkorb. Hör selbst, wofür er dankt.',
  quellen: [
    {
      text: 'Weltrekord Nasenbiegen 16 mm (YouTube, Hamburg Kettlebell Club)',
      href: 'https://www.youtube.com/watch?v=c2hmIX75nmA',
    },
    {
      text: 'Weltrekord Kettensprengen 5× (YouTube, Hamburg Kettlebell Club)',
      href: 'https://www.youtube.com/watch?v=XrLInrRwWk0',
    },
  ],
  video: 'ugzSE3UXno4',
  videoTitel: 'Weltrekordhalter Frank Delventhal spricht über seine Erfahrungen mit dem QiOne®',
};

/*
 * Slot „Stimmen“: Überschrift = s03 „{sterne} ★ bei Google“ (Link auf
 * Google), darunter echte Google-Bewertungen zum QiOne® 2 Pro im Wortlaut
 * (s02/quellen/bewertungen-auszug.txt, Google, 5 Sterne). Nur Sätze, die kein
 * anderes Gerät nennen und für sich allein stehen.
 */
export const STIMMEN_GOOGLE = {
  ueberschrift: '{bewertung} ★ bei Google',
  note: '4,8',
  instagram: 'Auf Instagram.',
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
/* Daten-Slot STIMMEN der Vorlage bleibt leer: die Route gibt den Slot herein. */
export const STIMMEN = null;

export const FAQ = {
  ueberschrift: 'Deine Fragen zum QiOne® 2 Pro.',
  fragen: [
    {
      f: 'Welches passt zu mir: QiOne® 2 Pro, QiBracelet® oder QiHome® Air?',
      a: 'Der QiOne® 2 Pro ist für dich, wenn du deinen Schutz den ganzen Tag am Körper tragen willst, an der Kette um den Hals. Das QiBracelet® bringt dieselbe Wirkung ans Handgelenk. Das QiHome® Air ordnet dein ganzes Zuhause, bis 160 m im Umkreis.',
    },
    {
      f: 'Warum kostet der QiOne® 2 Pro {preis}?',
      a: 'Du kaufst ihn einmal und trägst ihn jahrzehntelang. Sein Gitterchip® entsteht in unserer Fertigung in Bayern, aus einer eigenen 750er Goldlegierung. Sein Gehäuse ist aus Chirurgenstahl. Goldschmiede vollenden jedes Detail von Hand. Gegenüber dem QiOne® 1 hat er achtmal so viel Leistungsvolumen, zum knapp dreifachen Preis. In Raten zahlst du 12 × {rate12} €, mit 0 % Finanzierung über PayPal oder Klarna.',
    },
    {
      f: 'Wie trage ich den QiOne® 2 Pro?',
      a: 'Du trägst ihn, wo du willst: an der Kette um den Hals oder in der Hosentasche, nah am Körper. Manche erleben die ersten Tage als intensiv. Dann trag ihn über der Kleidung oder leg ihn nachts ab, bis du dich an ihn gewöhnt hast. Seine Öse misst 2,5 mm, unsere Edelstahlkette passt dazu.',
    },
    {
      f: 'Kann ich ihn zurückgeben, wenn er nicht zu mir passt?',
      a: 'Ja. Du testest ihn 20 Tage zu Hause, ab dem Tag, an dem er bei dir ankommt. Passt er nicht, schickst du ihn kostenlos zurück. Du bekommst den vollen Kaufpreis erstattet.',
    },
    {
      f: 'Wie lange hält der QiOne® 2 Pro?',
      a: 'Jahrzehnte. Ohne Akku und ohne Elektronik gibt es nichts, das leer wird. Du trägst ihn, solange du willst, und vererbst ihn dann.',
    },
    {
      f: 'Wie funktioniert der QiOne®?',
      a: 'Über ein statisches Feld. Die Goldatome im Gitterchip® stehen in fester Ordnung und erzeugen dieses Feld. In ihm bilden Wassermoleküle mehr Wasserstoffbrücken. So entsteht kohärentes Wasser, in der Forschung EZ-Wasser genannt. Das geschieht in deinem Körper, solange du ihn trägst.',
    },
  ],
};
