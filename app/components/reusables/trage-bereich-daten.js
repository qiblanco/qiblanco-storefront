/*
 * trage-bereich-daten.js — Fotos und Texte des Bereichs „So sieht es an dir aus“
 * (TrageBereich.jsx). Job 20261116-prio2-produktseiten-tragebereich-swipe-echte-fotos-und-bewertungen-hoch-de-us.
 * Echte Fotos aus unseren Shootings (Google Drive, QB - Produkte Content):
 *   QiOne 2 Pro: Shooting Canggu/Bali 2025 · QiBracelet: Kitzbühel 2023 + Canggu 2025 · QiHome Air: Kitzbühel 2023.
 * Zuschnitt 1080×1350 (4:5), selbst gehostet per medien-hosting/bin/cdn-publish (Bereich produkt-trage-bereich).
 * Alt-Texte beschreiben nur, was zu sehen ist (kein Wirkversprechen).
 * r2 17.11.2026 (Christian 16.11. 17:30/17:40): immer die ganze Person, Style wie QiOne, verschiedene Models;
 * QiHome Air erst EIN Solo-Foto mit Steckdose, dann Personen, keine Terrasse. Auswahl: gross/<r2-job>/galerie/auswahl.json.
 */

const ETIKETT = 'Aus unseren Shootings';
const ZURUECK = 'Vorheriges Foto';
const WEITER = 'Nächstes Foto';

const BEREICHE = {
  'qione-2-pro': {
    titel: 'So trägst du den QiOne® 2 Pro.',
    bahnLabel: 'Fotos: so tragen andere den QiOne 2 Pro',
    fotos: [
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qione-2-pro-n1--4bb68ac74b99.jpg?v=1794875744", alt: "Mann im offenen Leinenhemd mit dem QiOne 2 Pro an der Kette zwischen Palmblättern", zeile: "Zum offenen Leinenhemd."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qione-2-pro-n2--8035de6e389f.jpg?v=1794875758", alt: "Frau im weißen Hemd mit dem QiOne 2 Pro an der Kette im Abendlicht", zeile: "Passt zum weißen Hemd."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qione-2-pro-n3--9dfe3ea4b035.jpg?v=1794875771", alt: "Paar auf einem Motorrad, er trägt den QiOne 2 Pro an der Kette über dem weißen T-Shirt", zeile: "Auch auf dem Motorrad dabei."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-3--c6eca9d7102d.jpg?v=1794801626", alt: "Lachender Mann mit dem QiOne 2 Pro an der Kette", zeile: "Schlicht genug für jeden Tag."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-5--f2601d8d6b0f.jpg?v=1794801648", alt: "Frau auf dem Sofa mit dem QiOne 2 Pro an der Kette", zeile: "Auch zu Hause auf dem Sofa."},
    ],
  },
  'qibracelet': {
    titel: 'So trägst du das QiBracelet®.',
    bahnLabel: 'Fotos: so tragen andere das QiBracelet',
    fotos: [
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qibracelet-n1--84705b657bd4.jpg?v=1794875781", alt: "Lachende Frau im weißen Hemd mit dem QiBracelet am Handgelenk", zeile: "Schmal genug für jedes Outfit."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qibracelet-n2--88ce05da4c5a.jpg?v=1794875792", alt: "Mann im Leinenhemd auf einem Sessel mit dem QiBracelet am Handgelenk", zeile: "Dezent am Handgelenk."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qibracelet-n3--d64bf2fa75b1.jpg?v=1794875803", alt: "Frau am Laptop mit einer Kaffeetasse, das QiBracelet am Handgelenk", zeile: "Auch bei der Arbeit dabei."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qibracelet-n4--d095129d6ede.jpg?v=1794875813", alt: "Lachender Mann im weißen Hemd mit verschränkten Armen, das QiBracelet am Handgelenk", zeile: "Passt neben jede Uhr."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qibracelet-n5--4bd635b277a8.jpg?v=1794875823", alt: "Frau auf einem Holzstuhl am Fenster mit dem QiBracelet am Handgelenk", zeile: "Zu Hause ganz entspannt."},
    ],
  },
  'qihome-air': {
    titel: 'So steht der QiHome® Air bei dir.',
    bahnLabel: 'Fotos: wo der QiHome Air steht',
    fotos: [
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qihome-air-n1--b103a3eec555.jpg?v=1794875837", alt: "QiHome Air in einer weißen Steckdose an einer Betonwand", zeile: "Einfach in die Steckdose."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qihome-air-n2--98f952641550.jpg?v=1794875852", alt: "Paar auf dem Sofa im Wohnzimmer, er hält den QiHome Air in der Hand", zeile: "Klein genug für eine Hand."},
      {url: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--r2-qihome-air-n3--3b2920dd213b.jpg?v=1794875865", alt: "Lachendes Paar auf einem grauen Sofa, er hält den QiHome Air in der Hand", zeile: "Zu Hause auf dem Sofa."},
    ],
  },
};

/** Bereich je Produkt-Handle, oder null (dann rendert TrageBereich nichts). */
export function trageBereich(handle) {
  const b = BEREICHE[handle];
  if (!b) return null;
  return {etikett: ETIKETT, zurueck: ZURUECK, weiter: WEITER, ...b};
}
