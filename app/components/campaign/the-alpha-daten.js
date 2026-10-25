/**
 * THE ALPHA, Variante A: Christians Figma-Vorlage vom 25.10.2026 (Board
 * „The Alpha“), 1:1 (Grossjob 20261025-prio1-the-alpha-landingpage-figma-
 * vorlage-a-server-b-ki-c, Segment s03).
 *
 * Christian, wörtlich: „diese vorlage in eine landingpage bauen“ (Z1), „link
 * wird sein https://qiblanco.com/pages/The-Alpha“ (Z2), „Und shop wird sein
 * https://qiblanco.com/pages/The-Alpha“ (Z3), „das bie Figma ist meine vorgab
 * … das ist Variante A“ (Z5), „Vergeben sind bei den nummern übrings 88, 44,
 * 2, 99 und 111“ (Z7).
 *
 * EINE DATENSTELLE für Text, Bilder und das Video-Feld. Die Texte sind
 * Christians Wortlaut aus der Vorlage und werden nicht umformuliert (Seitentext
 * schreibt Christian selbst). Vorlage im Jobordner: vorlage/the-alpha-figma-x3.png.
 */

/**
 * VIDEO-FELD („Platzhalter Video Luca“ in der Vorlage). Luca dreht am
 * 25.10.2026. Solange `video` null ist, zeigt die Seite das ruhige Standbild
 * `videoStandbild` — nie einen Platzhalter, nie ein leeres Video-Viereck.
 *
 * EINSETZEN, sobald die Datei da ist: Datei per
 * `medien-hosting/bin/cdn-upload upload <datei> --shop dach` aufs CDN, dann
 * HIER `video: {src: '<cdn-url .mp4>', poster: '<optional>'}` setzen. Sonst
 * nichts — die Seite rendert dann ein stummes, inline spielendes Video mit dem
 * Standbild als Poster.
 */
export const THE_ALPHA_VIDEO = {
  video: null,
  videoStandbild: {
    url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
    alt: 'Qi Alpha mit Diamant, Vorderseite',
    width: 2048,
    height: 2048,
  },
};

/** Kopf, schwarz (Vorlage Punkt 1). Fettungen wie in vorlage/kopf-text.png. */
export const THE_ALPHA_KOPF = {
  titel: 'Kohärentes Licht',
  untertitel: '- Ultra High Vibe Mode -',
  // Absätze aus Teilen; `fett: true` = in der Vorlage fett gesetzt.
  absaetze: [
    [
      {text: 'Ultra High Vibe Mode -extrem positive Ausstrahlung', fett: true, zeile: true},
      {text: 'Definition:', fett: true},
      {text: ' Es beschreibt einen Zustand, in dem du '},
      {text: 'voller Lebensenergie, Freude, innerem Frieden und Dankbarkeit', fett: true},
      {
        text:
          ' bist. Der Begriff kommt aus der modernen Psychologie und Spiritualität. ' +
          'Die Grundidee ist: Alles im Universum (auch unsere Gedanken und Gefühle) ' +
          'hat eine bestimmte Schwingung oder Frequenz.',
      },
    ],
    [
      {text: 'Wenn du im „High Vibe Mode“ bist, bist du auf einer Wellenlänge, die positive '},
      {text: 'Erlebnisse, Erfolg und gesunde Beziehungen wie ein Magnet anzieht.', fett: true},
    ],
  ],
};

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';

/**
 * Abschnitte in der Reihenfolge der Vorlage. `bilder` steht UNTER dem Text
 * des Abschnitts (Vorlage: Manifestation -> Diamant-Paar, Protection ->
 * Produkt-Paar, Longevity -> Breitbanner). Bildzuordnung: bilder/BILDER.md im
 * Jobordner.
 */
export const THE_ALPHA_ABSCHNITTE = [
  {
    id: 'manifestation',
    titel: 'Manifestation',
    zeilen: ['Klare Eingebung.', 'Klare Entscheidung.', 'Klarer Erfolg.'],
    bilder: [
      {
        url: `${CDN}/the-alpha-rohdiamant.jpg?v=1792922800`,
        alt: 'Rohdiamant mit Spitze auf hellem Grund',
        width: 604,
        height: 604,
      },
      {
        url: `${CDN}/the-alpha-brillant.jpg?v=1792922804`,
        alt: 'Geschliffener Brillant von oben',
        width: 604,
        height: 604,
      },
    ],
  },
  {
    id: 'protection',
    titel: 'Protection',
    zeilen: ['Starker Schutz.', 'Starke Zellen.', 'Starker Willen.'],
    bilder: [
      {
        url: `${CDN}/qi-alpha-01-front.jpg?v=1792849253`,
        alt: 'Qi Alpha mit Diamant und Logo',
        width: 2048,
        height: 2048,
      },
      {
        url: `${CDN}/qi-alpha-02-detail.jpg?v=1792849261`,
        alt: 'Nahaufnahme des Diamanten im Qi Alpha mit Strahlengravur',
        width: 2048,
        height: 2048,
      },
    ],
  },
  {
    id: 'longevity',
    titel: 'Longevity',
    zeilen: ['Starkes Leben.', 'Starke Ausstrahlung.', 'Starke Anziehung.'],
    banner: {
      url: `${CDN}/the-alpha-banner-seite.jpg?v=1792922808`,
      alt: 'Seitenband des Qi Alpha mit Gravur Qi Alpha',
      width: 1720,
      height: 405,
    },
  },
];

/** Schluss der Vorlage (Punkt 9 und 10). */
export const THE_ALPHA_SCHLUSS = {
  edition: 'Limited 1st. Edition',
  auflage: '111/111',
  knopf: 'Jetzt Exklusiv Reservieren',
};

/**
 * WOHIN DER ROTE KNOPF FÜHRT (TheAlphaKauf, alle drei Varianten). Christian
 * 25.10.2026 (Z9/Z10, Nachtrag Coworker BS 09:32Z): der Kauf lebt auf der
 * neuen Shopseite /products/the-alpha. Solange die nicht live ist, zeigt der
 * Knopf auf die heute kaufbare Produktseite des Qi Alpha (Shopify-Handle
 * qi-master, Vorbestellung). UMSTELLEN, sobald /products/the-alpha mit
 * Kaufknopf live antwortet (s06): hier '/products/the-alpha' eintragen, sonst
 * nichts. Auch ohne Umstellung bleibt der Knopf heil: s06 leitet
 * /products/qi-master per 301 auf /products/the-alpha.
 */
export const THE_ALPHA_KAUF_ZIEL = '/products/qi-master';
