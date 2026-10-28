/*
 * DATENSTELLE der QiOne-2-Pro-Kaufseite in der ALPHA-VORLAGE (Elina
 * EL-20261027-c05a2273, 27.10.2026, NUR VORSCHAU: kein Livegang ohne ihr GO).
 *
 * Elina: „Neue Produktseiten-Vorlage nach Qi Alpha … zuerst als Testseite auf
 * QiOne 2 Pro“. Die Vorlage selbst ist product-pages/AlphaVorlage.jsx; hier
 * steht nur, was die QiOne-2-Pro-Seite hineingibt. Wortlaut der Zeilen 1–5 ist
 * Elinas Auftrag, Wort für Wort („von Elina entschieden“).
 *
 * PREISE stehen hier NICHT: Gerät und Ketten kommen aus Shopify (Seite und
 * Kasse nennen dieselbe Zahl).
 */

export const PRODUKT = {
  // „QiOne 2 Pro“ mit kleinem hochgestelltem ® wie im Qi-Blanco-Logo. Das
  // Zeichen steht am geschützten Wort (QiOne®), wie im Shop-Titel
  // „QiOne® 2 Pro“; MarkenName setzt es klein und hoch.
  name: 'QiOne® 2 Pro',
  claim: 'Essential Wearable',
  // Ersetzt „1st. Edition · 111 Stück“ der Alpha (Elina Punkt 3).
  bewertung: {wert: '4,8', nutzer: '+14.000 Nutzer'},
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/*
 * KETTE (Elina Punkt 6): „die normale Chirurgenstahl-Kette in allen
 * verfügbaren Größen; die Gold-Varianten im Code vorbereiten, aber ausblenden
 * bis verfügbar“. Shopify-Produkt `qione-kette` (Necklace für QiOne®, 316L,
 * Größen XS 40 · S 45 · M 50 · L 60 · XL 75 cm). Gezeigt wird jede Größe, die
 * Shopify als kaufbar meldet; eine ausverkaufte erscheint von selbst wieder,
 * sobald sie nachgefüllt ist.
 */
export const KETTE = {
  handle: 'qione-kette',
  auszeichnung: 'Trage ihn jeden Tag.',
  titel: 'Wähle Deine Qi Blanco Kette aus Chirurgenstahl.',
  ohne: {
    titel: 'Ohne Kette',
    text: 'Mit Baumwollband zum Sofort-Umhängen',
  },
  // Kachelname aus der Länge der Shopify-Variante („S - 45cm“ -> 45 cm).
  name: (cm) => `${cm} cm Kette aus Chirurgenstahl`,
  box: (cm) => `${cm} cm - Kette aus Chirurgenstahl`,
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
 * Auch dann erscheinen nur Größen, die Shopify als kaufbar meldet.
 * `bilder` (optional, gleiche Form wie KETTE.bilder): eigene Goldaufnahmen;
 * ohne sie zeigt die Seite die Stahlbilder.
 */
export const KETTE_GOLD = {
  sichtbar: false,
  handle: 'qione-goldkette',
  name: (cm) => `${cm} cm - 750iger ethisches Vollgold`,
  box: (cm) => `${cm} cm - 750iger ethisches Vollgold`,
  bilder: null,
};

export const BOX = {
  titel: "What's in the Box",
};
