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
};

export const PRODUKT = {
  name: 'Qi Alpha®',
  edition: '1st. Edition · 111 Stück',
  claim: '- Das ultimative Wearable der Zukunft -',
  punkte: [
    'Zweiteiliger Gitterchip®',
    'Hochreiner Natur Diamant eingelassen in den Gitterchip®',
    'Kohärentes Licht & Kohärentes Wasser',
  ],
  preisZusatz: 'Weltneuheit',
  herkunft: 'Designed in Germany. Made in Germany.',
};

/*
 * GALERIE: Renderings mit neuem Logo (keine QiOne-2-Pro-Fotos). Das große Feld
 * ist in der Vorlage eine 360-Grad-Animation. Die gibt es noch nicht: solange
 * `animation360` null ist, zeigt das Feld das gewählte Rendering. Liegt die
 * Animation vor, hier `{src: '<cdn .mp4>', poster: '<bild>'}` setzen; die Seite
 * spielt sie dann stumm, inline, in Schleife, ohne Bedienleiste.
 */
export const GALERIE = {
  animation360: null,
  bilder: [
    {
      url: `${CDN}/files/qi-alpha-01-front.jpg?v=1792849253`,
      alt: 'Qi Alpha, Vorderseite mit Diamant in goldener Fassung',
    },
    {
      url: `${CDN}/files/qi-alpha-02-detail.jpg?v=1792849261`,
      alt: 'Qi Alpha, Nahaufnahme des Diamanten mit Strahlengravur',
    },
    {
      url: `${CDN}/files/qi-alpha-03-rueckseite.jpg?v=1792849267`,
      alt: 'Qi Alpha, Rückseite mit Qi-Blanco-Logo',
    },
    {
      url: `${CDN}/files/qi-alpha-04-unterseite.jpg?v=1792849274`,
      alt: 'Qi Alpha, Unterseite mit Gravur „Made in Germany“',
    },
    {
      url: `${CDN}/files/qi-alpha-05-seite.jpg?v=1792849280`,
      alt: 'Qi Alpha, Seitenansicht mit Namensgravur',
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
  ohneHinweis:
    'Ohne Wunschnummer bekommst du beim Versand eine zufällige noch freie Nummer.',
  freiTitel: 'Freie Auswahl',
  bildGravur: {
    url: `${CDN}/files/qi-alpha-05-seite-gravurflaeche.jpg?v=1793021845`,
    alt: 'Qi Alpha, Seitenansicht mit deiner Seriennummer als Gravur',
    gravur: {x: 0.552, y: 0.491, breite: 0.2},
  },
  bildRueckseite: {
    url: `${CDN}/files/qi-alpha-04-unterseite.jpg?v=1792849274`,
    alt: 'Qi Alpha, Unterseite mit Gravur „Made in Germany“',
  },
};

export const KETTE = {
  auszeichnung: 'Trage ihn luxuriös.',
  titel:
    'Hole Dir jetzt Deine Qi Blanco Goldkette - 750iger ethisches Vollgold',
  bilder: [
    {
      url: `${CDN}/products/necklace_06.png?v=1698259307`,
      alt: 'Kette von Qi Blanco, Verschluss in Nahaufnahme',
    },
    {
      url: `${CDN}/files/Necklace_07_fb5094a4-f6c8-4565-a5a8-5b86208cbb94.webp?v=1698259307`,
      alt: 'Kette von Qi Blanco, ganze Kette mit Karabinerverschluss',
    },
  ],
};

/** Christians drei Goldlängen, in seiner Reihenfolge; `titel` = Shopify-Variante. */
export const KETTE_LAENGEN = [
  {titel: '60 cm', name: '60 cm - 750iger ethisches Vollgold'},
  {titel: '50 cm', name: '50 cm - 750iger ethisches Vollgold'},
  {titel: '45 cm', name: '45 cm - 750iger ethisches Vollgold'},
];

/** Die Kette, die ohne Aufpreis dabei ist (Figma: „60 cm Kette aus Chirurgenstahl - 0€“). */
export const KETTE_STAHL = {
  titel: 'stahl',
  name: '60 cm Kette aus Chirurgenstahl',
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
  text: 'Mit PayPal und Klarna zum Ratenpreis von 9.999 €',
  code: 'Deinen Ratencode bekommst du von Anna, unten rechts im Chat.',
  mitExtras:
    'Ratenzahlung gibt es für den Qi Alpha ohne Wunschnummer und mit der Kette aus Chirurgenstahl.',
  extrasAbwaehlen: 'Wunschnummer und Goldkette abwählen',
};

export const ZUSAMMENFASSUNG = {
  titel: 'Dein neuer Qi Alpha.',
  unter: 'Genau so, wie du ihn willst.',
  versand: ['Weltweit Kostenloser Versand', '100% Versicherter Versand'],
  rueckgabe: '20 Tage volles Rückgaberecht nach Erhalt der Ware',
  knopf: 'In den Warenkorb',
};

export const BOX = {
  titel: "What's in the Box",
  geraetBild: GALERIE.bilder[0],
};
