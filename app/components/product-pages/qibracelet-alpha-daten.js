/*
 * DATENSTELLE der QiBracelet-Kaufseite im Konfigurator (Alpha-Vorlage).
 * Schnittstelle: claude-jobs/20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab/s05/SCHNITTSTELLE.md. Das Gerüst ist product-pages/AlphaVorlage.jsx,
 * die Slots stehen in AlphaVorlageSlots.jsx; hier steht nur, was die Seite
 * hineingibt.
 *
 * STAND s08 (2026-10-28): die neuen Texte der A-Fassung, wörtlich aus
 * s04/texte-qibracelet.json (Runde 3, PR + Sales frei, Challenger
 * gegengeprüft). Nicht umformuliert. Wo ein s04-Feld auf zwei Felder der
 * Vorlage verteilt wird (Überschrift = Auszeichnung + Titel), ist der Wortlaut
 * an der Satzgrenze geteilt. Die alten Texte bleiben in B (/products/qibracelet-b).
 *
 * PREISE, Varianten und Lieferbarkeit stehen hier NICHT: sie kommen aus Shopify.
 */

/*
 * Band oben (wie /products/qi-alpha „Kohärentes Licht / - Ultra High Vibe
 * Mode -“): s04 kopf.kicker als Titel, kopf.modus als Unterzeile, dazu die
 * 360-Grad-Drehung des Reifs (Ersatzbild zuerst, nie Schwarz).
 */
export const BAND = {
  titel: 'Zellschutz für unterwegs',
  unter: '- All Day Mode -',
  drehung: 'qibracelet',
  videoPath: 'new-360-QiBracelet-1x1.mov',
};

export const PRODUKT = {
  // overline/modus stehen im Band darüber (einmal, nicht doppelt).
  overline: null,
  modus: null,
  name: 'QiBracelet®',
  claim: 'Entwickelt für Superhumans.',
  kurzzeile: 'Drei Größen · Chirurgenstahl 316L · Gitterchip® aus 750er Gold',
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/*
 * GRÖSSE: Werte aus Shopify (heute „S – 17“, „M – 19“, „L – 21“). Angezeigt
 * wird EIN Maßsystem: S/M/L mit der Breite des Handgelenks (Repair
 * 20261023-repair-qibracelet-groessenhilfe-eindeutig-machen, Peggy; s04
 * variante). `namen` und `zeilen` tragen beide Schreibweisen des Strichs und
 * den nackten Buchstaben, damit die Anzeige stimmt, wenn der Repair die
 * Shopify-Titel auf S/M/L kürzt.
 */
const BREITEN = {
  S: '4,5 bis 5 cm breit',
  M: '6 cm breit',
  L: '7 bis 7,5 cm breit',
};
const SHOPIFY_WERTE = {S: '17', M: '19', L: '21'};
const proWert = (f) =>
  Object.fromEntries(
    Object.keys(BREITEN).flatMap((g) => [
      [`${g} – ${SHOPIFY_WERTE[g]}`, f(g)],
      [`${g} - ${SHOPIFY_WERTE[g]}`, f(g)],
      [g, f(g)],
    ]),
  );

export const VARIANTE = {
  auszeichnung: 'Größe.',
  titel: 'Miss die Breite, nicht den Umfang.',
  anleitung:
    'Leg ein Lineal an die breiteste Stelle deines Handgelenks, dort, wo du an beiden Seiten die Knöchel spürst. Schließ ein Auge und lies ab, auf den halben Zentimeter gerundet.',
  namen: proWert((g) => g),
  zeilen: proWert((g) => BREITEN[g]),
  grenzregel: '5,5 oder 6,5 cm? Nimm die kleinere Größe. Sie liegt an.',
  anpassen:
    'Der Reif ist dafür gebaut, dass du ihn anpasst: Mit beiden Händen drückst du ihn enger oder dehnst ihn weiter. Das darfst du.',
};

/*
 * BEZAHLART (Qi-Alpha-Form: zwei Karten). {rate12} setzt die Logik aus dem
 * Preis ein (ceil(Preis / 12), nur Markt DE, ab 500 €). Ohne Ratenangebot
 * bleibt nur „Direkt bezahlen“ und kein Raten-Titel (titelDirekt null).
 */
export const BEZAHLART = {
  auszeichnung: 'Bezahlart.',
  titel: 'Zahle direkt oder bequem in Raten.',
  titelDirekt: null,
  optionen: [
    {id: 'direkt', titel: 'Direkt bezahlen', zeile: 'PayPal, Klarna, Karte oder Überweisung'},
    {
      id: 'raten',
      titel: 'In Raten zahlen',
      zeile: '12 Monatsraten à {rate12} €. 0 % Finanzierung mit PayPal und Klarna.',
    },
  ],
  hinweis:
    'Den Anbieter wählst du an der Kasse. Klarna und PayPal bestätigen die Raten direkt bei der Bestellung. Voraussetzung ist ein Wohnsitz in Deutschland.',
};

/* Zusammenfassung mit EINEM Kaufknopf. */
export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Dein neues QiBracelet®.',
  titel: 'In deiner Größe.',
  zeilen: ['Versand am nächsten Werktag. Kostenlos in Deutschland und voll versichert.'],
  knopf: 'In den Warenkorb',
  ruecknahme: '20 Tage tragen und testen. Voller Kaufpreis zurück.',
};

/*
 * What's in the Box: der Reif selbst (Bild + Name). Weitere Teile (Schachtel,
 * Ständer) sind nicht als Lieferumfang belegt (s04 offene Flanke): keine Liste.
 */
export const BOX = {
  titel: "What's in the Box",
  kacheln: [],
};

/* Keine Kette: der Schritt entfällt. */
export const KETTE = null;
export const KETTE_GOLD = null;

export const FAKTEN = {
  ueberschrift: 'Einmal kaufen. An die Familie weitergeben.',
  kacheln: [
    {icon: 'generationen', zahl: 'Jahrzehnte', satz: 'Lebensdauer. Aus Chirurgenstahl 316L.'},
    {icon: 'wellen', zahl: 'Sauna · Meer · Pool', satz: 'Es bleibt dran.'},
    {icon: 'material', zahl: '316L', satz: 'Implantatstahl aus der Orthopädie.'},
    {icon: 'handgelenk', zahl: 'Über 1.000', satz: 'QiBracelet® im Einsatz.'},
    {
      icon: 'bayern',
      zahl: '100 %',
      satz: 'in Bayern entwickelt und gefertigt. Von Goldschmieden von Hand vollendet.',
    },
  ],
};

export const RISIKOFREI = {
  zeile: '20 Tage tragen. Passt es nicht, bekommst du den vollen Kaufpreis zurück.',
  details: [
    'Die 20 Tage zählen ab Ankunft.',
    'Einen Grund brauchst du nicht.',
    'Die Rücksendung ist für dich kostenlos.',
  ],
  // Kein Link auf /pages/neu-oder-gebraucht (Christian 28.09.2026, kein
  // Weglink von Kaufseiten; Grossjob 20260928-…-licht s14, weglink-sperre Gate 23).
};

/* Slot „Modelle vergleichen“ (Gewinner Gerätevergleich, s02 Z40). */
export const VERGLEICH = {
  ueberschrift: 'Kette oder Armband?',
  intro: 'Dieselbe Wirkung. Du entscheidest, wo du sie trägst.',
  zeilen: {
    'qione-2-pro': 'Am Hals. Unter oder über der Kleidung.',
    qibracelet: 'Am Handgelenk. Den ganzen Tag.',
    'qihome-air': 'Im Raum. Für alle unter deinem Dach.',
  },
};

/* Slot „Wissen“ (Qi-Alpha-Stil). `bild`: Index des Shopify-Produktbilds. */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Zelle',
      titel: 'Fünf von fünf Zelltypen geschützt.',
      absaetze: [
        'Prof. Dr. Peter C. Dartsch hat das QiBracelet® im Labor an fünf Typen menschlicher Zellen getestet. Er setzte sie oxidativem Stress aus.',
        'Bei Leberzellen lag der Schutz bei 47,3 %.',
      ],
      quellen: [
        'Peter C. Dartsch: Protective Effect of the QiBracelet® Against Oxidative Stress. Applied Cell Biology 12(1), 2024. DOI 10.53043/2320-1991.acb12001.',
      ],
      bild: null,
    },
    {
      etikett: 'Gitterchip®',
      titel: 'Gleiche Leistung wie der QiOne® 2 Pro.',
      absaetze: [
        'Im Ende des Reifs sitzt der Gitterchip® aus 750er Gold.',
        'Er ist rund 10 % stärker gebaut als im QiOne® 2 Pro, denn das Handgelenk liegt weiter von deiner Körpermitte entfernt.',
      ],
      bild: 2,
    },
    {
      etikett: 'Erde',
      // s09-r2 (Christian Zy 29.10.2026, s09-r2: keine Angst-Sprache, kein Zurueckschrecken): Titel als Zustand, ohne Spür-
      // Satz und ohne "wirkt dem entgegen" (Abwehr-Rahmen).
      titel: 'Ruhig schlafen, egal wo du bist.',
      absaetze: [
        'Wasseradern, Erdstrahlen, Gitternetze: Geopathogene Strahlung hat viele Namen. Sie kommt zu Handy, WLAN und 5G hinzu.',
        'Das QiBracelet® trägst du Tag und Nacht. Es ist immer an deiner Seite.',
      ],
      bild: 5,
    },
  ],
  studien: {
    ueberschrift: 'Fünf Veröffentlichungen.',
    link_text: 'Alle Studien ansehen',
    href: '/pages/studien',
  },
};

/*
 * Slot „Stimmen“: s04 stimmen.bewertungen_ueberschrift, darunter echte
 * Google-Bewertungen zum QiBracelet® im Wortlaut (s02/quellen/
 * bewertungen-auszug.txt, Google, 5 Sterne). Die Zeile zu den ersten Nächten
 * aus derselben Bewertung steht NICHT da (Fakten-Basis F-TRAGEN, s04-Flanke).
 * Der Satz „Würde ich auf jeden Fall weiterempfehlen!“ ist ersetzt (s09-r2,
 * Christian Zy 29.10.2026: kein Konjunktiv, homepage-bauer/bin/sprach-pruefe 0 Treffer).
 */
export const STIMMEN_GOOGLE = {
  ueberschrift: '{bewertung} ★ auf Google. Lies selbst.',
  note: '4,8',
  instagram: 'Auf Instagram.',
  stimmen: [
    {
      text: 'Seither wache ich mit einem klaren Kopf auf und fühle mich fokussierter, strukturierter und einfach ausgeglichener.',
      quelle: 'Google-Bewertung, Dezember 2025',
    },
    {
      text: 'Ich bin viel ruhiger und selbst in stressigen Situationen viel gelassener.',
      quelle: 'Google-Bewertung, Dezember 2025',
    },
    {
      text: 'Auch in meinem Bekanntenkreis gibt es 4 Leute, die total begeistert sind.',
      quelle: 'Google-Bewertung, Dezember 2025',
    },
  ],
};
/* Daten-Slot STIMMEN der Vorlage bleibt leer: die Route gibt den Slot herein. */
export const STIMMEN = null;

export const FAQ = {
  ueberschrift: 'Deine Fragen zum QiBracelet®.',
  fragen: [
    {
      f: 'Kette oder Armband: Was ist der Unterschied?',
      a: 'Die Wirkung ist dieselbe, der Ort ist ein anderer: der QiOne® 2 Pro am Hals, das QiBracelet® am Handgelenk. Der Gitterchip® im QiBracelet® ist rund 10 % stärker gebaut. So gleicht er den weiteren Weg zur Körpermitte aus.',
    },
    {
      f: 'Welche Größe brauche ich?',
      a: 'Miss die Breite deines Handgelenks an der breitesten Stelle, nicht den Umfang. 4,5 bis 5 cm: S. 6 cm: M. 7 bis 7,5 cm: L. Liegst du bei 5,5 oder 6,5 cm, nimm die kleinere Größe. Mit beiden Händen drückst du den Reif enger oder dehnst ihn weiter. Das darfst du.',
    },
    {
      f: 'Was bekomme ich für den Preis?',
      a: 'Einen Gitterchip® aus 750er Gold, rund 10 % stärker gebaut als im QiOne® 2 Pro, in einem Reif aus Chirurgenstahl 316L. Entwickelt und gefertigt in Bayern, von Goldschmieden von Hand vollendet. Gebaut für Jahrzehnte.',
    },
    {
      f: 'Darf das QiBracelet® in die Sauna und ins Wasser?',
      a: 'Ja. Wasser, Chlor, Salzwasser, Schweiß und Sonne machen ihm nichts. Auch in die Sauna darf es mit. Dort wird der Stahl so warm wie die Luft.',
    },
    {
      f: 'Ist das QiBracelet® für Allergiker geeignet?',
      a: 'Das Gehäuse ist aus Chirurgenstahl 316L. Denselben Stahl nutzt die Orthopädie für Implantate. Allergische Reaktionen sind äußerst selten. Bist du empfindlich, trag es über dem Ärmel.',
    },
    {
      f: 'Lässt die Wirkung mit der Zeit nach?',
      a: 'Nein. Der Gitterchip® arbeitet ohne Akku und nutzt sich nicht ab. Du gewöhnst dich nur an das Gefühl: Was am Anfang neu ist, wird nach einigen Tagen Alltag.',
    },
    {
      f: 'Wie zahle ich in Raten?',
      a: 'Wähle im Schritt Bezahlart „In Raten zahlen“ und an der Kasse PayPal oder Klarna. Du zahlst 12 Monatsraten à {rate12} €, bei Klarna auch bis zu 24. Klarna und PayPal bestätigen die Raten bei der Bestellung. Voraussetzung ist ein Wohnsitz in Deutschland.',
    },
  ],
};
