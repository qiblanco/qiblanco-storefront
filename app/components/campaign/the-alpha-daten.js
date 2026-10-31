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
  // Lucas Reveal (26.10.2026), stumm, drei Einblendungen im Bild; CDN-VIDEO, 720p.
  video: {
    src: 'https://cdn.shopify.com/videos/c/vp/5340638831464e8183e235969c14de05/5340638831464e8183e235969c14de05.HD-720p-3.0Mbps-98929943.mp4',
    poster:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-reveal-poster.jpg?v=1793023786',
  },
  videoStandbild: {
    url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
    alt: 'Qi Alpha® mit Diamant, Vorderseite',
    width: 2048,
    height: 2048,
  },
};

/**
 * FILM OHNE TEXT IM BILD, nur Variante A (Christian 29.10.2026: „der text ist
 * immer noch im Video zu sehen anstatt darunter - kann man das nicht
 * ändern?“; Job 20261029-qi-alpha-lp-text-unter-video-abspann-zeilenweise-
 * offene-wuensche). Derselbe Reveal von Luca, neu aus dem Original
 * (Drive QiAlpha_Reveal_16x9.mp4, 1920x1080) auf ax41 aufbereitet: ohne die
 * eingebrannten Sätze, ohne Tonspur (das Original ist stumm, -70 LUFS), das
 * Schlussbild „Qi Alpha®“ steht 2,6 s, dann blendet es auf Schwarz (die
 * Schleife beginnt auf Schwarz). 19,9 s.
 *
 * `texte`: die Sätze als echter Text UNTER dem Video, im Takt des Films
 * (Sekunden der Videozeit). Einer nach dem anderen, der neue erst, wenn der
 * alte weg ist („wie im Film“). Der letzte kommt erst, wenn das Logo voll
 * sichtbar ist (gemessen: Logo ab 15,8 s, voll ab 16,75 s). Wortlaut: Christians
 * drei Sätze vom 26.10.; der Schluss-Satz in seiner Fassung vom 28.10.
 * („Qi Alpha – die nächste Dimension.“), mit ® wie überall beim Qi Alpha.
 * B behält THE_ALPHA_VIDEO (Sätze im Bild) unverändert.
 */
export const THE_ALPHA_FILM_OHNE_TEXT = {
  video: {
    // CDN-VIDEO (cdn-publish 29.10.2026, gid://shopify/Video/77517194297612), 720p.
    src: 'https://cdn.shopify.com/videos/c/vp/89a8e35542a04522913ab13cb2c7b738/89a8e35542a04522913ab13cb2c7b738.HD-720p-4.5Mbps-99309506.mp4',
    poster: THE_ALPHA_VIDEO.video.poster,
    ton: false,
  },
  videoStandbild: THE_ALPHA_VIDEO.videoStandbild,
  texte: [
    {von: 1.2, bis: 5.2, text: '„The One Eye“ – Hochreiner Natur Diamant.'},
    {
      von: 5.6,
      bis: 10.6,
      text: 'Die finale Politur wird per Hand von Goldschmieden mit meisterhafter Genauigkeit durchgeführt.',
    },
    {von: 16.8, bis: 19.3, text: 'Qi Alpha® – die nächste Dimension.'},
  ],
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
        url: `${CDN}/the-alpha-rohdiamant-1200.jpg?v=1793414852`,
        alt: 'Rohdiamant mit Spitze auf hellem Grund',
        etikett: 'RAW',
        width: 1200,
        height: 1200,
      },
      {
        url: `${CDN}/the-alpha-brillant-1200.jpg?v=1793414856`,
        alt: 'Geschliffener Brillant von oben',
        etikett: 'DIAMANT',
        width: 1200,
        height: 1200,
      },
    ],
  },
  {
    id: 'protection',
    titel: 'Protection',
    zeilen: ['Starker Schutz.', 'Starke Zellen.', 'Starker Wille.'],
    bilder: [
      {
        url: `${CDN}/qi-alpha-01-front.jpg?v=1792849253`,
        alt: 'Qi Alpha® mit Diamant und Logo',
        etikett: 'ENDLESS',
        width: 2048,
        height: 2048,
      },
      {
        url: `${CDN}/qi-alpha-02-detail.jpg?v=1792849261`,
        alt: 'Nahaufnahme des Diamanten im Qi Alpha® mit Strahlengravur',
        etikett: 'POSSIBILITY',
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
      alt: 'Seitenband des Qi Alpha® mit Gravur Qi Alpha®',
      width: 1720,
      height: 405,
    },
  },
];

/**
 * WÖRTERBUCH-SZENE nach dem Titel (Christian 26.10.2026, Nachtrag Z13–Z23 und
 * Z41–Z57): „und dann der Text … wie aus dem film pulb fiction wie als wäre es
 * aus einem dictionary und das wird erst eingeblendet wenn mand as scroolen
 * anfängt“; Quelle: „ich habe das aus Google AI rauskopiert … die richtige
 * Quelle wäre Google AI“. Wortlaut wie THE_ALPHA_KOPF.absaetze, nur in
 * Wörterbuch-Form gesetzt (Lemma, Lautschrift, Wortart, 1., 2.).
 */
export const THE_ALPHA_WOERTERBUCH = {
  lemma: 'Ultra High Vibe Mode',
  laut: '/ˈʌltrə haɪ vaɪb moʊd/',
  wortart: 'n.',
  // Je Bedeutung Teile; `fett: true` wie in Christians Vorlage (THE_ALPHA_KOPF
  // oben, vorlage/kopf-text.png) und wie im Original (Pulp Fiction, Christian
  // 27.10. Z289: „die wichtigen Wörter in der Definition fett“). Der Wortlaut
  // ist unverändert; nur die Auszeichnung ist neu.
  bedeutungen: [
    [{text: 'extrem positive Ausstrahlung.', fett: true}],
    [
      {text: 'Es beschreibt einen Zustand, in dem du '},
      {text: 'voller Lebensenergie, Freude, innerem Frieden und Dankbarkeit', fett: true},
      {
        text:
          ' bist. Der Begriff kommt aus der modernen Psychologie und Spiritualität. ' +
          'Die Grundidee ist: Alles im Universum (auch unsere Gedanken und Gefühle) ' +
          'hat eine bestimmte Schwingung oder Frequenz. Wenn du im „High Vibe ' +
          'Mode“ bist, bist du auf einer Wellenlänge, die positive ',
      },
      {text: 'Erlebnisse, Erfolg und gesunde Beziehungen wie ein Magnet anzieht.', fett: true},
    ],
  ],
  quelle: 'Google AI',
};

/** Seitenansicht mit Etikett, danach poppt der Name auf Schwarz auf
 * (Christian 26.10.: „dann kommt der G1 von der Seite, G-Alpha, und dann poppt
 * schwarz auf, D-Alpha“ = THE ALPHA, Figma-Ausschnitt christian-szene-3). */
export const THE_ALPHA_MARKE = 'Qi Alpha®';

/** Das schwarze Kästchen unter dem quer gezeigten Qi Alpha (Seitenband,
 * TapMarke) in Variante A. Christian 28.10.2026 (Z11): „da steht ja unten
 * drunter in einem schwarzen Kästchen Qi Alpha. Da hätte ich gern THE ALPHA
 * stehen.“ Großbuchstaben wie das Etikett vorher, ohne ®. NICHT die Leiste
 * links oben (QI_ALPHA_LEISTE), das ist eine andere Stelle. */
export const THE_ALPHA_ETIKETT = 'THE ALPHA';

/** Das Etikett links oben in der Kaufleiste. Christian 27.10.2026 (Z1): „Und
 * links oben das THE ALPHA machen wir zu QI ALPHA mit dem Registry-Zeichen.“
 * Am selben Vormittag: die Schluss-Szene zeigt „Qi Alpha®“ statt „THE ALPHA“
 * (THE_ALPHA_MARKE oben); „The Alpha“ als sichtbarer Name fällt weg. */
export const QI_ALPHA_LEISTE = 'QI ALPHA®';

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
 * UMGESTELLT 2026-10-26 (s06-r2) im selben PR wie die Route: der alte Wert
 * führte nach dem Umzug per 301 auf genau dieselbe Seite, der neue spart nur
 * den Sprung. Die Seite dahinter ist die kaufbare Produktseite des Qi Alpha
 * (bis dahin /products/qi-alpha); die neue Shopseite im Apple-Stil (Z9) zieht
 * an dieselbe Adresse ein. Rückweg: '/products/qi-master'.
 */
// UMZUG QI ALPHA 27.10.2026 (Christian Z1): wieder /products/qi-alpha;
// /products/the-alpha ist eine 301-Hülle. Rückweg: '/products/the-alpha'.
export const THE_ALPHA_KAUF_ZIEL = '/products/qi-alpha';
