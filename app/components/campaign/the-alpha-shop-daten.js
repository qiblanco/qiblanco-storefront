/*
 * DATENSTELLE der Shopseite /products/the-alpha (Christian 25.10.2026 Z9:
 * „so habe im gleichen link nochmal einen neue shopseite gebaut, sie soll sehr
 * nahe an dem hier gebaut werden aber eben nur mit den inhalten die ich
 * definiert habe“ + Apple-Kaufseite als Vorbild; Grossjob 20261025-prio1-the-
 * alpha-landingpage-figma-vorlage-a-server-b-ki-c, Segment s12).
 *
 * TEXTE sind Christians Figma-Spalte „Shopseite /products/the-alpha“, Wort für
 * Wort (zwei Tippfehler berichtigt: „individuel“, „einzigartie“). Eigene
 * Zeilen gibt es nur dort, wo die Vorlage Apples Platzhalter trägt (Bezahlart,
 * Ratenweg); sie sagen nur, was geht (Z34/Z35, kein „0 % APR“).
 *
 * PREISE stehen hier NICHT. Sie kommen aus Shopify, damit Seite und Kasse
 * dieselbe Zahl nennen. Christians Kettenpreise aus der Figma (60 cm 4.979 €,
 * 50 cm 4.579 €, 45 cm 4.379 €) zieht ein eigener Shopify-Write nach.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const KOPF = {
  titel: 'Kohärentes Licht',
  unter: '- Ultra High Vibe Mode -',
  /*
   * 360-GRAD-LOOP im schwarzen Band (Christian 27.10.2026 Z218: „wir brauchen
   * hier im schwarzen Bereich noch die 360 Gradanimation, das muss rein“).
   * Lucas Loop 1:1, 9 s, stumm, ohne Text, auf dem Shopify-CDN (Übergabe #16
   * im jobmem des Grossjobs 20261026). Grund des Films ist reines Schwarz;
   * die Seite legt ihn per `mix-blend-mode: lighten` auf das Schwarz des
   * Bandes, so bleibt kein Viereck sichtbar.
   */
  loop: {
    src: 'https://cdn.shopify.com/videos/c/vp/719017d4447d42eabe22c203cb6a3f51/719017d4447d42eabe22c203cb6a3f51.HD-720p-1.6Mbps-98929981.mp4',
    poster: `${CDN}/files/qi-alpha-360-poster.jpg?v=1793023790`,
    alt: 'Qi Alpha®, 360-Grad-Ansicht',
  },
};

/*
 * PRODUKTKOPF genau in Christians Folge und Wortlaut (27.10.2026 Z237–Z252):
 * „Qi Alpha® / Ultimate Wearable / 1st. Edition · 111 Stück“, drei Punkte je
 * mit eigenem, ruhig bewegtem roten Zeichen, Preis, Herkunft. Gestrichen:
 * „Weltneuheit“, der lange Claim, die Steuerzeile und der Knopf unter dem
 * Preis (Z229, Z232, Z237: „nicht sagen sondern zeigen“). Gekauft wird im
 * Konfigurator darunter.
 */
export const PRODUKT = {
  name: 'Qi Alpha®',
  claim: 'Ultimate Wearable',
  edition: '1st. Edition · 111 Stück',
  punkte: [
    {zeichen: 'gitter', text: 'Zweiteiliger Gitterchip®'},
    {
      zeichen: 'diamant',
      text: 'Hochreiner Natur Diamant eingelassen in den Gitterchip®',
    },
    {
      zeichen: 'licht-wasser',
      text: 'Kohärentes Licht vereinigt sich mit Kohärentem Wasser',
    },
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
  // Kein Sprung „Jetzt konfigurieren ↓“ mehr (Christian Z231: nur wenn der
  // Designmeister ihn für nötig hält): die erste Option steht seit dem
  // Kopf-Umbau (Z2, 27.10.) im ersten Fenster direkt unter dem Preis.
};

/*
 * GALERIE: Renderings mit neuem Logo (keine QiOne-2-Pro-Fotos). Das große Feld
 * ist zuerst die Bühne mit dem 360-Grad-Loop aus KOPF (schwarzes Band, Z218);
 * die Daumen darunter wechseln auf die Renderings und zurück auf den Loop.
 */
export const GALERIE = {
  bilder: [
    {
      url: `${CDN}/files/qi-alpha-01-front.jpg?v=1792849253`,
      alt: 'Qi Alpha®, Vorderseite mit Diamant in goldener Fassung',
    },
    {
      url: `${CDN}/files/qi-alpha-02-detail.jpg?v=1792849261`,
      alt: 'Qi Alpha®, Nahaufnahme des Diamanten mit Strahlengravur',
    },
    {
      url: `${CDN}/files/qi-alpha-03-rueckseite.jpg?v=1792849267`,
      alt: 'Qi Alpha®, Rückseite mit Qi-Blanco-Logo',
    },
    {
      url: `${CDN}/files/qi-alpha-04-unterseite.jpg?v=1792849274`,
      alt: 'Qi Alpha®, Unterseite mit Gravur „Made in Germany“',
    },
    {
      url: `${CDN}/files/qi-alpha-05-seite.jpg?v=1792849280`,
      alt: 'Qi Alpha®, Seitenansicht mit Namensgravur',
    },
  ],
};

/*
 * SERIENNUMMER (Figma: „Mach Ihn individuel“ / „Hole Dir jetzt Deine
 * einzigartie Nummer.“, Optionen 100/111, 1/111, 69/111, „Freie Auswahl“).
 * Darunter zwei Bilder (Christian 26.10.: „das diese zwei bilder utnen drunter
 * zu dsehen sind, und beim rechtne wo qi alpha steth die serien nummer je nach
 * auswahl ändert“). Links die Seitenansicht: der Schriftzug „Qi Alpha ®“ ist
 * per Retusche entfernt (Übergang bis zum richtigen Rendering, Christian:
 * „es ist aktuell noch die falsche seite auf dem bild“), die gewählte Nummer
 * liegt live in Gravur-Optik darüber. `gravur` = Mitte und Größe der Fläche in
 * Anteilen des Bildes (gemessen an der 2048-px-Datei).
 */
export const NUMMER = {
  auszeichnung: 'Mach ihn individuell.',
  titel: 'Hole Dir jetzt Deine einzigartige Nummer.',
  vorschlaege: [100, 1, 69],
  ohneTitel: 'Ohne Wunschnummer',
  // Kurz, weil die Karte im ersten Fenster steht (Z2, 27.10.) und der Titel
  // „Ohne Wunschnummer“ den Rest schon sagt. Nicht aus der Figma-Spalte.
  ohneHinweis: 'Zufällige freie Nummer beim Versand.',
  freiTitel: 'Freie Auswahl',
  /*
   * Das ganze Stück, Bohrung rechts (Christian 29.10.2026: „den qione um 180°
   * gedreht, also das die Borung rechts ist. und das man eben den ganzen qioen
   * sihet und weniger von oben und unten, so dass er näher an der auswahl
   * liegt“). Gedreht wird um die Hochachse (Spiegelung im CSS), oben und unten
   * bleiben, wie sie sind: Licht und Schatten stehen wie im Foto. Der
   * Ausschnitt kommt vom CDN (crop=region, gemessen an der 2048-px-Datei:
   * Stück x 159–1772, y 862–1146), 3:1 mit dem Stück mittig. `gravur` = Mitte
   * der Nummer in Anteilen des AUSSCHNITTS, nach der Spiegelung gemessen:
   * mittig auf dem Band.
   */
  bildGravur: {
    url: `${CDN}/files/qi-alpha-05-seite-gravurflaeche.jpg?v=1793021845&crop=region&crop_left=102&crop_top=716&crop_width=1728&crop_height=576`,
    alt: 'Qi Alpha®, das ganze Stück mit deiner Seriennummer als Gravur',
    breite: 1200,
    hoehe: 400,
    gravur: {x: 0.375, y: 0.503},
  },
};

/*
 * KETTENBILDER als Paar je Aufnahme (Christian 26.10.: „bei der asuwahl an
 * godl sich die kettenfarbe in gold ändert … das gold von der umrandung beim
 * diamten ist sehr gut getroffen“). Beide Fassungen sind aus derselben
 * Aufnahme gerechnet (claude-jobs/20261026-prio1-the-alpha-variante-a-
 * designmeister-premium-gestaltung/bin/s04_kette_gold.py): Kette freigestellt,
 * Grund flach #f5f5f7 (die Seitenfläche) und in beiden Bildern pixelgleich,
 * Gold als Gradient Map auf die Graustufen der Stahlaufnahme mit der Rampe,
 * die an der Diamant-Fassung gemessen ist. Die Wahl blendet nur zwischen den
 * beiden Bildern über, so ändert sich nur die Kette und nichts springt.
 */
export const KETTE = {
  auszeichnung: 'Trage ihn luxuriös.',
  titel:
    'Hole Dir jetzt Deine Qi Blanco Goldkette - 750er ethisches Vollgold',
  bilder: [
    {
      stahl: `${CDN}/files/the-alpha-kette-verschluss-stahl-f5.jpg?v=1793037744`,
      gold: `${CDN}/files/the-alpha-kette-verschluss-gold-f5.jpg?v=1793037748`,
      alt: 'Kette von Qi Blanco, Verschluss in Nahaufnahme',
    },
    {
      stahl: `${CDN}/files/the-alpha-kette-ganz-stahl-f5.jpg?v=1793037752`,
      gold: `${CDN}/files/the-alpha-kette-ganz-gold-f5.jpg?v=1793037756`,
      alt: 'Kette von Qi Blanco, ganze Kette mit Karabinerverschluss',
    },
  ],
};

/**
 * Christians drei Goldlängen, in seiner Reihenfolge; `titel` = Shopify-Variante,
 * `box` = Bildunterschrift in „What's in the Box“ (Christian 26.10.: „so wie
 * "60 cm - 750er ethisches Vollgold"“).
 */
export const KETTE_LAENGEN = [
  {
    titel: '60 cm',
    name: '60 cm - 750er ethisches Vollgold',
    box: '60 cm - 750er ethisches Vollgold',
  },
  {
    titel: '50 cm',
    name: '50 cm - 750er ethisches Vollgold',
    box: '50 cm - 750er ethisches Vollgold',
  },
  {
    titel: '45 cm',
    name: '45 cm - 750er ethisches Vollgold',
    box: '45 cm - 750er ethisches Vollgold',
  },
];

/** Die Kette, die ohne Aufpreis dabei ist (Figma: „60 cm Kette aus Chirurgenstahl - 0€“). */
export const KETTE_STAHL = {
  titel: 'stahl',
  name: '60 cm Kette aus Chirurgenstahl',
  box: '60 cm - Kette aus Chirurgenstahl',
};

/*
 * DIE STAHLKETTE ALS EIGENE WARENKORBZEILE (Elina 30.10.2026,
 * EL-20261030-ae569366, Punkt 1+2): bis dahin stand die inklusive Kette nur
 * auf der Seite, im Warenkorb kam allein der Qi Alpha an und Monta bekam keine
 * Kette. Seit 31.10. ist sie ein eigenes Shopify-Produkt zu 0 € (nur im
 * Hydrogen-Kanal) mit den Längen 40/45/50/60 cm und den SKUs der QiOne-Kette
 * (5555..5558), damit Monta denselben Artikel zieht. Alle Längen ohne
 * Aufpreis, 60 cm vorausgewählt („alle verfügbaren Längen als inklusive 0 EUR
 * anbieten, vorausgewählt 60 cm“; vier Längen wie im US-Laden). 60 cm behält
 * den Titel 'stahl' (Vorwahl, und die Kombinations-Probe wählt
 * `data-tas-kette="stahl"`). Im Warenkorb bindet sie
 * lib/qi-master-addons.server.js wie eine Goldkette an den Qi Alpha.
 */
export const QM_STAHLKETTE = 'qi-alpha-stahlkette';
export const KETTE_STAHL_LAENGEN = ['60 cm', '50 cm', '45 cm', '40 cm'].map(
  (laenge) => ({
    laenge,
    titel: laenge === '60 cm' ? 'stahl' : `stahl-${laenge}`,
    name: `${laenge} Kette aus Chirurgenstahl`,
    box: `${laenge} - Kette aus Chirurgenstahl`,
  }),
);

/** Eigene Abfrage der Kaufseite für die Stahlkette (fail-soft im Loader). */
export const STAHLKETTE_QUERY = `#graphql
  query QiAlphaStahlkette($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    stahlkette: product(handle: "qi-alpha-stahlkette") {
      id
      handle
      title
      variants(first: 10) {
        nodes {
          id
          title
          product {
            id
            handle
            title
          }
          selectedOptions {
            name
            value
          }
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const BEZAHLUNG = {
  titel: 'Bezahlart.',
  unter: 'Zahle direkt oder bequem in Raten.',
  direkt: {
    name: 'Direkt bezahlen',
    text: 'PayPal, Klarna, Karte oder Überweisung',
  },
  // Markt ohne geteilte Zahlung (CHF, USD): nur die direkte Zahlung.
  unterDirekt: 'Zahle sicher an der Kasse.',
  raten: {
    // Christian 27.10.2026 Z13: „Und das Feld könnte ja Ratenzahlung heißen,
    // zahle 10.000 Euro der Gesamtsumme in Raten zum Beispiel.“
    name: 'Ratenzahlung',
    text: 'Zahle 10.000\u00a0€ der Gesamtsumme in Raten',
    // Summe bis 10.000 € (heute baulich nicht erreichbar): normaler Ratenweg.
    textGanz: 'PayPal oder Klarna, direkt an der Kasse',
  },
};

/*
 * GETEILTE ZAHLUNG (Christian 27.10.2026 Z1–Z4; Grossjob 20261027-qi-alpha-
 * geteilte-zahlung-10000-raten-rest-sofort, s03). PayPal Ratenzahlung und
 * Klarna Finanzierung gehen bis 10.000 €. Liegt die Konfiguration darüber,
 * zahlt der Kunde 10.000 € in Raten (Schritt 1, eigener Checkout) und den
 * Rest sofort (Schritt 2, Link per E-Mail nach der Genehmigung). Der
 * Ratencode 9.999 € mit „Code von Anna“ ist damit am Qi Alpha weg; Wunsch-
 * nummer und Goldkette gehen jetzt auch mit Ratenzahlung.
 * Beträge rechnet lib/qi-alpha-teilzahlung.js aus derselben Summe wie die
 * Zusammenfassung; hier stehen nur Wörter.
 */
export const TEILZAHLUNG_TEXT = {
  hinweis: (sofort, raten) =>
    `Zahle jetzt sofort ${sofort} und ${raten} bequem in Raten.`,
  sofort: 'Zahle jetzt sofort',
  raten: 'Bequem in Raten',
  ablauf: 'So läuft die Ratenzahlung',
  weiter: 'Weiter zur Ratenzahlung',
  fenster: {
    titel: 'In zwei Schritten zu deinem Qi Alpha®.',
    gesamt: 'Gesamt',
    schritte: [
      {
        marke: 'Schritt 1 von 2',
        titel: (raten) => `${raten} in Raten`,
        text: 'PayPal oder Klarna prüft deinen Antrag und genehmigt ihn. Ratenzahlung geht bis 10.000\u00a0€.',
      },
      {
        marke: 'Schritt 2 von 2',
        titel: (sofort) => `${sofort} sofort`,
        text: 'Direkt nach der Genehmigung kommt dein Zahlungslink per E-Mail. Er gilt 14 Tage.',
      },
    ],
    versand: 'Dein Qi Alpha® geht auf den Weg, sobald beide Zahlungen da sind.',
    rechnungen: 'Du bekommst zwei Rechnungen mit einer Vorgangsnummer.',
    knopf: (raten) => `Schritt 1: ${raten} in Raten beantragen`,
    fensterZu: 'Fenster schließen',
  },
};

export const ZUSAMMENFASSUNG = {
  titel: 'Dein neuer Qi Alpha®.',
  unter: 'Genau so, wie du ihn willst.',
  versand: ['Weltweit Kostenloser Versand', '100% Versicherter Versand'],
  frist: '20 Tage volles Rückgaberecht nach Erhalt der Ware',
  knopf: 'In den Warenkorb',
};

/*
 * „What's in the Box“ zeigt, was im Karton liegt: der Qi Alpha mit der
 * gewählten Nummer und die gewählte Kette. Weitere Teile (Etui, Zertifikat,
 * Ladegerät) nennen weder Shopify noch die Produkttexte; die Box zeigt deshalb
 * nur diese zwei, bis ein belegter Lieferumfang vorliegt.
 */
export const BOX = {
  titel: "What's in the Box",
  hauptBild: GALERIE.bilder[0],
};
