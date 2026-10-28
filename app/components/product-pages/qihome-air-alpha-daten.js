/*
 * DATENSTELLE der QiHome-Air-Kaufseite im Konfigurator (Alpha-Vorlage).
 * Schnittstelle: claude-jobs/20261027-GROSSJOB-apple-konfigurator-qione-qihome-
 * qibracelet-ab/s05/SCHNITTSTELLE.md (Pflicht/optional je Schlüssel). Das
 * Gerüst ist product-pages/AlphaVorlage.jsx; hier steht nur, was die Seite
 * hineingibt.
 *
 * STAND s05 (2026-10-28): Wortlaut der heutigen Seite /products/qihome-air
 * (Inventar s02/alt-texte/qihome-air.md, Live-Abruf 27.10.2026). Die neuen
 * Texte (s04) setzt s07 ein.
 *
 * PREISE und Varianten stehen hier NICHT: sie kommen aus Shopify.
 */

/** Bühne: die vorhandene 360-Grad-Drehung (ImgixVideo mit Ersatzbild). */
export const BAND = {
  titel: null,
  unter: null,
  drehung: 'qihome',
  videoPath: '360-QiHome-1x1.mov',
};

export const PRODUKT = {
  name: 'QiHome® Air',
  claim: null,
  // Heutiger Satz der Seite (Shopify-Beschreibung, s02 B02).
  kurzzeile: 'Der ultimative Schutz für dich & dein gesamtes Zuhause!',
  preisanker: {nutzer: '+ 14.000 Nutzer', banner: 'Ultimate Power'},
  punkte: [
    {zeichen: 'zuhause', text: 'Wohlfühlatmosphäre'},
    {zeichen: 'schutz', text: 'Schutz vor E-Smog & 5G'},
    {zeichen: 'quantenfeld', text: 'Gesteigerte Anbindung zum Quantenfeld'},
  ],
  herkunft: ['Designed in Germany.', 'Made in Germany.'],
};

/* Shopify führt heute nur „Default Title“: der Schritt Variante entfällt. */
export const VARIANTE = null;

/*
 * BEZAHLART: direkt, PayPal, Klarna. `{rate}` setzt die Logik aus dem Preis
 * ein (Hausformel ceil(Preis / 12), nur Markt DE, ab 500 €). Wortlaut heute:
 * KaufZusage.jsx („In Raten zahlen, mit 0 % Finanzierung mit PayPal und
 * Klarna“).
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
  teile: ['QiHome® Air'],
};

/* Keine Kette: der Schritt entfällt. */
export const KETTE = null;
export const KETTE_GOLD = null;

/* Slots unter der Box: in s05 leer, der heutige Seiteninhalt steht darunter. */
export const FAKTEN = null;
export const RISIKOFREI = null;
export const STIMMEN = null;
export const FAQ = null;
