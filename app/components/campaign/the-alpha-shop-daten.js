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
  bildGravur: {
    url: `${CDN}/files/qi-alpha-05-seite-gravurflaeche.jpg?v=1793021845`,
    alt: 'Qi Alpha®, Seitenansicht mit deiner Seriennummer als Gravur',
    gravur: {x: 0.552, y: 0.491, breite: 0.2},
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
    'Hole Dir jetzt Deine Qi Blanco Goldkette - 750iger ethisches Vollgold',
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
 * "60 cm - 750iger ethisches Vollgold"“).
 */
export const KETTE_LAENGEN = [
  {
    titel: '60 cm',
    name: '60 cm - 750iger ethisches Vollgold',
    box: '60 cm - 750iger ethisches Vollgold',
  },
  {
    titel: '50 cm',
    name: '50 cm - 750iger ethisches Vollgold',
    box: '50 cm - 750iger ethisches Vollgold',
  },
  {
    titel: '45 cm',
    name: '45 cm - 750iger ethisches Vollgold',
    box: '45 cm - 750iger ethisches Vollgold',
  },
];

/** Die Kette, die ohne Aufpreis dabei ist (Figma: „60 cm Kette aus Chirurgenstahl - 0€“). */
export const KETTE_STAHL = {
  titel: 'stahl',
  name: '60 cm Kette aus Chirurgenstahl',
  box: '60 cm - Kette aus Chirurgenstahl',
};

export const BEZAHLUNG = {
  titel: 'Bezahlart.',
  unter: 'Zahle direkt oder bequem in Raten.',
  direkt: {
    name: 'Direkt bezahlen',
    text: 'PayPal, Klarna, Karte oder Überweisung',
  },
  raten: {
    name: 'In Raten zahlen',
  },
};

/*
 * RATEN (Christian 25.10.2026, Ratenzahlungs-Job und Folgejob): PayPal
 * Ratenzahlung und Klarna Finanzierung gehen bis 10.000 €. Für den Qi Alpha
 * gibt es deshalb einen persönlichen Ratencode, Endpreis glatt 9.999 €, nicht
 * mit Wunschnummer oder Goldkette. Anna stellt ihn im Chat aus
 * (qi-salesbot/config/ratencode-anna.conf RATENCODE_ANNA=an).
 */
export const RATEN = {
  ratenpreis: 9999,
  grenze: 10000,
  // Geschütztes Leerzeichen: „9.999 €“ bricht nicht um (Challenger s04).
  text: 'Mit PayPal und Klarna zum Ratenpreis von 9.999\u00a0€',
  code: 'Deinen Ratencode bekommst du von Anna, unten rechts im Chat.',
  mitExtras:
    'Den Qi Alpha® ohne Wunschnummer und mit der Kette aus Chirurgenstahl kannst du auch in Raten zahlen.',
  extrasAbwaehlen: 'Wunschnummer und Goldkette abwählen',
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
