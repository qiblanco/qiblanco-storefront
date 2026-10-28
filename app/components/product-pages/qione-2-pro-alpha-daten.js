/*
 * DATENSTELLE der QiOne-2-Pro-Kaufseite im Konfigurator (Alpha-Vorlage).
 * Schnittstelle: claude-jobs/20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab/s05/SCHNITTSTELLE.md (Pflicht/optional je Schlüssel). Das
 * Gerüst ist product-pages/AlphaVorlage.jsx; hier steht nur, was die Seite
 * hineingibt.
 *
 * STAND s05 (2026-10-28): Wortlaut von heute bzw. aus Elinas Vorschau
 * (EL-20261027-c05a2273: Name, Claim, drei Merkmale „von Elina entschieden“).
 * Die neuen Texte (s03, nach der Challenger-Gegenprobe s11) setzt s06 ein.
 *
 * PREISE stehen hier NICHT: Gerät und Ketten kommen aus Shopify (Seite und
 * Kasse nennen dieselbe Zahl).
 */

/** Bühne: die vorhandene 360-Grad-Drehung des QiOne® 2 Pro (Produkt360Video). */
export const BAND = {
  titel: null,
  unter: null,
  drehung: 'qione',
};

export const PRODUKT = {
  // „QiOne 2 Pro“ mit kleinem hochgestelltem ® wie im Qi-Blanco-Logo. Das
  // Zeichen steht am geschützten Wort (QiOne®), wie im Shop-Titel
  // „QiOne® 2 Pro“; MarkenName setzt es klein und hoch.
  name: 'QiOne® 2 Pro',
  claim: 'Essential Wearable',
  // Kurzzeile: heutiger Satz der Seite (Shopify-Beschreibung, s02 B01 #8).
  kurzzeile: 'Für Superhumans – dank zweiter Chip Generation und 8-facher Stärke.',
  // Preisanker-Dreizeiler (reusables/Preisanker.jsx): 4.8 ★ Google
  // Bewertungen (Link), Nutzer, Preis. Heute ohne Banner.
  preisanker: {nutzer: '+ 14.000 Nutzer', banner: null},
  punkte: [
    {zeichen: 'wachstum', text: 'Persönliches Wachstum'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog, 5G & 6G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/* Shopify führt heute nur „Default Title“: der Schritt Variante entfällt. */
export const VARIANTE = null;

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

/*
 * BEZAHLART: direkt, PayPal, Klarna. `{rate}` setzt die Logik aus dem Preis
 * ein (Hausformel ceil(Preis / 12), nur Markt DE, ab 500 €); ohne Raten-
 * angebot steht nur „direkt“. Wortlaut heute: KaufZusage.jsx („In 12 Raten à
 * 91 € zahlen, mit 0 % Finanzierung mit PayPal und Klarna“).
 */
export const BEZAHLART = {
  auszeichnung: 'Bezahlart.',
  titel: 'In Raten zahlen, mit 0 % Finanzierung mit PayPal und Klarna.',
  titelDirekt: null,
  optionen: [
    {id: 'direkt', titel: 'Direkt bezahlen', zeile: null},
    {id: 'paypal', titel: 'PayPal', zeile: 'In 12 Raten à {rate} € zahlen'},
    {id: 'klarna', titel: 'Klarna', zeile: 'In 12 Raten à {rate} € zahlen'},
  ],
  hinweis: 'In 12 Raten à {rate} € zahlen, mit 0 % Finanzierung mit PayPal und Klarna.',
};

/* Zusammenfassung mit EINEM Kaufknopf. Zeilen: heutige Versandpunkte. */
export const ZUSAMMENFASSUNG = {
  auszeichnung: 'Deine Auswahl.',
  titel: null,
  zeilen: [
    'Kostenloser Versand innerhalb Deutschlands',
    'In 2-3 Tagen bei Dir',
    '100% Versicherter Versand',
  ],
  knopf: 'In den Warenkorb legen',
  rueckgabe: '20 Tage zu Hause testen, 100% Geld-zurück-Garantie',
};

export const BOX = {
  titel: "What's in the Box",
  // Heute: „Inklusive Baumwollband | Sofort umhängen!“ (QiOneBuyBox).
  teile: ['QiOne® 2 Pro', 'Baumwollband zum Sofort-Umhängen'],
};

/* Slots unter der Box: in s05 leer, der heutige Seiteninhalt steht darunter. */
export const FAKTEN = null;
export const RISIKOFREI = null;
export const STIMMEN = null;
export const FAQ = null;
