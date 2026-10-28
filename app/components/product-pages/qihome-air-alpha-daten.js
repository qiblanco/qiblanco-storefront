/*
 * DATENSTELLE der QiHome-Air-Kaufseite im Konfigurator (Alpha-Vorlage, A-Fassung).
 * Schnittstelle: claude-jobs/20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab/s05/SCHNITTSTELLE.md (Pflicht/optional je Schlüssel). Das
 * Gerüst ist product-pages/AlphaVorlage.jsx, die Slots AlphaVorlageSlots.jsx;
 * hier steht nur, was die Seite hineingibt.
 *
 * STAND s07 (2026-10-28): die neuen Texte aus s04 (texte-qihome-air.json,
 * Runde 3, PR + Sales frei, Challenger ax41), ohne Umformulieren. Herkunft je
 * Aussage: s04/TEXTE-qihome-air.md. Wo s04 einen Block als `null` führt oder
 * ausblendet, steht hier `null`. Die heutige Seite mit den alten Texten bleibt
 * B (/products/qihome-air-b).
 *
 * PREISE und Varianten stehen hier NICHT: sie kommen aus Shopify. `{rate12}`
 * rechnet die Logik live aus dem Preis (nur Markt DE, ab 500 €), `{bewertung}`
 * kommt nie fest getippt in die Seite.
 */

/** Bühne: die vorhandene 360-Grad-Drehung (ImgixVideo mit Ersatzbild, Rand-Maske). */
export const BAND = {
  // Kicker und Modus-Zeile aus s04 stehen im Band neben der Drehung (wie
  // der Qi-Alpha-Endstand und s08), einmal, nicht doppelt im Kopf.
  titel: 'Kohärente Atmosphäre',
  unter: '- Whole Home Mode -',
  drehung: 'qihome',
  videoPath: '360-QiHome-1x1.mov',
};

export const PRODUKT = {
  // overline/modus stehen im Band darüber (einmal, nicht doppelt).
  overline: null,
  modus: null,
  name: 'QiHome® Air',
  claim: 'Ultimate Home.',
  kurzzeile: 'Ein Gerät · bis 160 m Radius · ohne Strom',
  // Preisanker-Dreizeiler (Christian 25.10.): 4,8 ★ Google-Bewertungen mit
  // Link / Nutzer / Preis, Banner am Preis.
  preisanker: {nutzer: '+ 14.000 Nutzer', banner: 'Ultimate Power'},
  punkte: [
    {zeichen: 'zuhause', text: 'Wohlfühlatmosphäre'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/* Shopify führt nur „Default Title“: der Schritt Variante entfällt (s04 variante: null). */
export const VARIANTE = null;

/*
 * BEZAHLART (s04 bezahlart): zwei Karten, direkt und in Raten. Ohne
 * Ratenangebot (Markt nicht DE, unter 500 €) bleibt nur „Direkt bezahlen“ und
 * kein Titel (nie ein Raten-Versprechen ohne Angebot).
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

/* Zusammenfassung mit EINEM Kaufknopf (s04 zusammenfassung). */
export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Dein neues QiHome® Air.',
  titel: 'Ein Gerät. Jedes Zimmer.',
  zeilen: ['Versand am nächsten Werktag. Kostenlos in Deutschland und voll versichert.'],
  knopf: 'In den Warenkorb',
  ruecknahme: '20 Tage zu Hause testen. Voller Kaufpreis zurück.',
};

/*
 * What's in the Box entfällt (s04 R2b, PR + Sales): der Lieferumfang des
 * QiHome® Air ist im Bestand nicht belegt, erfunden wird nichts. Holzkappe
 * und Holzstecker sind Teile des Geräts (Shopify-Medien-Alt), kein
 * Lieferumfang.
 */
export const BOX = null;

/* Keine Kette: der Schritt entfällt. */
export const KETTE = null;
export const KETTE_GOLD = null;

/* Faktenkacheln (s04 fakten): Zahl groß, ein Satz, Zeichen statt Listenpunkt. */
export const FAKTEN = {
  ueberschrift: 'Das QiHome® Air in Zahlen.',
  kacheln: [
    {icon: 'radius', zahl: '160 m', satz: 'Radius. Rund 8 Hektar.'},
    {icon: 'kraft', zahl: '100×', satz: 'die Stärke eines QiOne® 2 Pro.'},
    {icon: 'ohne-strom', zahl: '0 Watt', satz: 'Kein Strom. Keine Wartung.'},
    {icon: 'haus', zahl: 'Über 400', satz: 'QiHome® Air im Einsatz.'},
    {icon: 'bayern', zahl: '100 %', satz: 'in Bayern entwickelt und gefertigt. Deutsche Eiche.'},
  ],
};

/* 20-Tage-Element (s04 risikofrei): eine Zeile mit Zeichen, Details aufklappbar. */
export const RISIKOFREI = {
  zeile:
    '20 Tage zu Hause testen. Überzeugt es dich nicht, bekommst du den vollen Kaufpreis zurück.',
  details: [
    'Die 20 Tage zählen ab Ankunft.',
    'Einen Grund brauchst du nicht.',
    'Die Rücksendung ist für dich kostenlos.',
  ],
  link: null,
};

/*
 * EINSATZ (s04 einsatz, nur QiHome Air): steht an der Stelle eines
 * Varianten-Schritts, ohne Auswahl. Die Route gibt ihn vor dem Vergleich in
 * den Slot `vergleich`.
 */
export const EINSATZ = {
  ueberschrift: 'Wohnung. Haus. Praxis. Ein Gerät reicht.',
  zeilen: [
    {titel: 'Wohnung', zeile: 'Jedes Zimmer, auf jeder Etage.'},
    {titel: 'Haus', zeile: 'Alle Stockwerke. Alle, die darin leben.'},
    {titel: 'Büro und Praxis', zeile: 'Eine Atmosphäre für dein ganzes Team.'},
  ],
};

/*
 * Modelle vergleichen (s04 vergleich): Gewinner-Kandidat Gerätevergleich
 * (AmazonStil, s02 Z40), Spalten und Preise aus amazonstil-daten.js/Shopify.
 */
export const VERGLEICH = {
  ueberschrift: 'QiOne® oder QiHome® Air?',
  intro: 'Der QiOne® ist für unterwegs. Das QiHome® Air ist für dein Zuhause.',
  zeilen: {
    'qione-2-pro': 'Am Hals. Dein Schutz, wohin du gehst.',
    qibracelet: 'Am Handgelenk. Dieselbe Wirkung wie der QiOne® 2 Pro.',
    'qihome-air': 'Im Raum. Für alle unter deinem Dach.',
  },
};

/*
 * Wissens-Strecke im Qi-Alpha-Stil (s04 wissen + studien). `bild` = Index in
 * die Shopify-Produktbilder (Alt-Texte dort): 3 Tablett mit Kerze, 6 Hände vor
 * Grünpflanzen, 5 Nachttisch an der Leselampe.
 */
export const WISSEN = {
  kapitel: [
    {
      etikett: 'Raum',
      bild: 3,
      titel: 'Hinstellen. Fertig.',
      absaetze: [
        'Stell das QiHome® Air in den Raum, in dem du am meisten Zeit verbringst.',
        'Kein Strom, kein Kabel, keine Wartung.',
        'In einigen Stunden hat sich sein Feld aufgebaut.',
      ],
    },
    {
      etikett: 'Zelle',
      bild: 6,
      titel: 'Nervenzellen im Labor: 53,3 % mehr Regeneration.',
      absaetze: [
        'Prof. Dr. Peter C. Dartsch hat das QiHome® Air an menschlichen Nervenzellen getestet.',
        'Unter oxidativem Stress überlebten 34 % mehr Zellen.',
      ],
      quellen: [
        'Peter C. Dartsch: Beneficial Effect of the QiHome® Air on Cultured Neuronal and Inflammation-Mediating Cells. Neurodegenerative Diseases: Current Research 6(1), 2026. DOI 10.53043/NDCR-6-001.',
      ],
    },
    {
      etikett: 'Erde',
      bild: 5,
      titel: 'Wasserader unter dem Schlafzimmer?',
      absaetze: [
        'Erdstrahlen, Gitternetze, Gesteinsbrüche: Geopathogene Strahlung hat viele Namen.',
        'Sensible Menschen spüren sie, zum Beispiel im Schlaf.',
        'Sie kommt zu Handy, WLAN und 5G hinzu.',
        'Deshalb gehört das QiHome® Air ins Schlafzimmer.',
      ],
    },
  ],
  studien: {
    ueberschrift: 'Fünf Veröffentlichungen.',
    link_text: 'Alle Studien ansehen',
    href: '/pages/studien',
  },
};

/*
 * Stimmen (s04 stimmen.bewertungen_ueberschrift): kein Bewertungstext nennt das
 * QiHome® Air (s02, 0 Treffer), Instagram ist auf dieser Seite seit dem
 * 19.09.2026 gestrichen (Christian). Deshalb drei wörtliche Sätze aus echten
 * Google-Bewertungen über Qi Blanco, die kein anderes Gerät nennen (Feed
 * s02/quellen/bewertungen-auszug.txt, 5 ★). Note 4,8 wie im Preisanker.
 */
export const STIMMEN = null;
export const STIMMEN_GOOGLE = {
  ueberschrift: '{bewertung} ★ auf Google. Lies selbst.',
  note: '4,8',
  stimmen: [
    {
      text: 'Insgesamt fühle ich mich ausgeglichener, entspannter und mehr bei mir.',
      quelle: 'Google-Bewertung, Oktober 2026',
    },
    {
      text: 'Danke an das gesamte QiBlanco Team und besonders an Anna und Christian. Ich bin sehr glücklich damit.',
      quelle: 'Google-Bewertung, April 2026',
    },
    {
      text: 'Auch in meinem Bekanntenkreis gibt es 4 Leute, die total begeistert sind.',
      quelle: 'Google-Bewertung, Dezember 2025',
    },
  ],
};

/* Fragen (s04 faq). Fragen mit `{rate12}` entfallen ohne Ratenangebot. */
export const FAQ = {
  ueberschrift: 'Deine Fragen zum QiHome® Air.',
  fragen: [
    {
      f: 'Für welche Raumgröße ist das QiHome® Air gemacht?',
      a: 'Für dein ganzes Zuhause. Es ist auf einen Radius von bis zu 160 m ausgelegt, rund 8 Hektar. Das reicht für Wohnung, Haus und Büro, auch über mehrere Stockwerke.',
    },
    {
      f: 'Brauche ich ein QiHome® Air pro Zimmer?',
      a: 'Nein. Ein Gerät ist für dein ganzes Zuhause ausgelegt. Stell es dorthin, wo du am meisten Zeit verbringst.',
    },
    {
      f: 'QiOne® 2 Pro oder QiHome® Air?',
      a: 'Der QiOne® 2 Pro begleitet dich am Körper, wohin du gehst. Das QiHome® Air schützt den Raum und alle, die darin leben. Zusammen decken sie deinen ganzen Tag ab.',
    },
    {
      f: 'Warum kostet das QiHome® Air mehr als ein QiOne® 2 Pro?',
      a: 'Es ist deutlich stärker als QiOne® und QiBracelet® und auf einen Radius von bis zu 160 m ausgelegt. Ein Gerät reicht für alle, die bei dir wohnen. Es arbeitet ohne Strom und ohne Wartung.',
    },
    {
      f: 'Wie funktioniert das QiHome® Air?',
      a: 'Sein Herz ist der Gitterchip® aus einer eigens entwickelten Goldlegierung. Sein statisches Feld prägt die Wassermoleküle in deinem Raum. Wir nennen diesen Zustand kohärentes Wasser. Strom und Elektronik braucht es dafür keine.',
    },
    {
      f: 'Muss das QiHome® Air in die Steckdose?',
      a: 'Nein. Es arbeitet ohne Strom. Einstecken kannst du es trotzdem, in jede europäische Steckdose vom Typ C.',
    },
    {
      f: 'Wo stelle ich das QiHome® Air auf?',
      a: 'Auf eine stabile Fläche in dem Raum, in dem du am meisten Zeit verbringst: ins Schlafzimmer oder in den zentralen Raum. Halte einen halben Meter Abstand zu starken Elektrogeräten. In einigen Stunden hat sich das Feld aufgebaut.',
    },
    {
      f: 'Kann ich mit dem QiHome® Air reisen?',
      a: 'Ja. Es passt in jedes Gepäck und arbeitet überall, im Hotel wie im Ferienhaus.',
    },
    {
      f: 'Wirkt das QiHome® Air auch im Freien?',
      a: 'Seine volle Kraft entfaltet es in geschlossenen Räumen. Für draußen trägst du den QiOne® 2 Pro oder das QiBracelet® am Körper.',
    },
    {
      f: 'Lässt die Wirkung mit der Zeit nach?',
      a: 'Nein. Der Gitterchip® arbeitet ohne Akku und nutzt sich nicht ab. Du gewöhnst dich nur an das Gefühl: Was am Anfang neu ist, wird nach einigen Tagen Alltag.',
    },
    {
      f: 'Aus welchem Material ist das QiHome® Air?',
      a: 'Gehäuse aus Chirurgenstahl, Gitterchip® aus einer eigenen Goldlegierung, Holz aus regionaler deutscher Eiche. Den letzten Schliff geben Goldschmiede von Hand.',
    },
    {
      f: 'Wie zahle ich in Raten?',
      a: 'Wähle im Schritt Bezahlart „In Raten zahlen“ und an der Kasse PayPal oder Klarna. Du zahlst 12 Monatsraten à {rate12} €, bei Klarna auch bis zu 24. Klarna und PayPal bestätigen die Raten bei der Bestellung. Voraussetzung ist ein Wohnsitz in Deutschland.',
    },
  ],
};
