/*
 * trage-bereich-daten.js — Fotos und Texte des Bereichs „So sieht es an dir aus“
 * (TrageBereich.jsx). Job 20261116-prio2-produktseiten-tragebereich-swipe-echte-fotos-und-bewertungen-hoch-de-us.
 * Echte Fotos aus unseren Shootings (Google Drive, QB - Produkte Content):
 *   QiOne 2 Pro: Shooting Canggu/Bali 2025 · QiBracelet: Kitzbühel 2023 + Canggu 2025 · QiHome Air: Kitzbühel 2023.
 * Zuschnitt 1080×1350 (4:5), selbst gehostet per medien-hosting/bin/cdn-publish (Bereich produkt-trage-bereich).
 * Alt-Texte beschreiben nur, was zu sehen ist (kein Wirkversprechen).
 */

const ETIKETT = 'Aus unseren Shootings';
const ZURUECK = 'Vorheriges Foto';
const WEITER = 'Nächstes Foto';

const BEREICHE = {
  'qione-2-pro': {
    titel: 'So trägst du den QiOne 2 Pro.',
    bahnLabel: 'Fotos: so tragen andere den QiOne 2 Pro',
    fotos: [
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-1--1b72cda6acc3.jpg?v=1794801606', alt: 'Frau hält den QiOne 2 Pro an seiner Kette vor die Kamera', zeile: 'An der Kette, ganz nah bei dir.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-2--a092cf556cea.jpg?v=1794801616', alt: 'QiOne 2 Pro an der Kette über einem weißen T-Shirt', zeile: 'Über dem T-Shirt getragen.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-3--c6eca9d7102d.jpg?v=1794801626', alt: 'Lachender Mann mit dem QiOne 2 Pro an der Kette', zeile: 'Schlicht genug für jeden Tag.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-4--7a4b94f1318c.jpg?v=1794801638', alt: 'Mann am Laptop, den QiOne 2 Pro an der Kette unter dem offenen Hemd', zeile: 'Auch am Laptop immer dabei.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qione-2-pro-5--f2601d8d6b0f.jpg?v=1794801648', alt: 'Frau auf dem Sofa mit dem QiOne 2 Pro an der Kette', zeile: 'Auch zu Hause auf dem Sofa.'},
    ],
  },
  'qibracelet': {
    titel: 'So trägst du das QiBracelet.',
    bahnLabel: 'Fotos: so tragen andere das QiBracelet',
    fotos: [
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qibracelet-1--1e7fc7c91e76.jpg?v=1794801658', alt: 'Hand mit dem QiBracelet vor einem Bergtal', zeile: 'Am Handgelenk, auch in den Bergen.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qibracelet-2--59bc19141e81.jpg?v=1794801667', alt: 'QiBracelet am Handgelenk einer Frau mit einem Glas in der Hand', zeile: 'Schmal genug für jedes Outfit.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qibracelet-3--867b940c428d.jpg?v=1794801680', alt: 'Mann mit dem QiBracelet am Handgelenk hält eine Trinkflasche', zeile: 'Unterwegs immer dabei.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qibracelet-4--3686e9b1625a.jpg?v=1794801689', alt: 'QiBracelet am Handgelenk, Hand auf dem Rasen', zeile: 'Offen gebogen, es passt sich an.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qibracelet-5--fa021dce9fbd.jpg?v=1794801699', alt: 'Frau mit dem QiBracelet am Handgelenk auf dem Mountainbike', zeile: 'Auch auf dem Rad.'},
    ],
  },
  'qihome-air': {
    titel: 'So steht der QiHome Air bei dir.',
    bahnLabel: 'Fotos: wo der QiHome Air steht',
    fotos: [
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qihome-air-1--3a4a6be2b5dd.jpg?v=1794801709', alt: 'QiHome Air in einer Steckdose in schwarzem Rahmen', zeile: 'In der Steckdose.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qihome-air-2--dbd017a853be.jpg?v=1794801718', alt: 'QiHome Air in der Wandsteckdose unter dem Lichtschalter', zeile: 'In der Wandsteckdose unter dem Lichtschalter.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qihome-air-3--2afd99818525.jpg?v=1794801730', alt: 'QiHome Air auf dem Tisch in einem Raum mit Holzwänden', zeile: 'Auf dem Tisch am Arbeitsplatz.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qihome-air-4--e4db8029b0ea.jpg?v=1794801742', alt: 'QiHome Air auf einem Holztisch draußen vor einem Bergtal', zeile: 'Draußen auf der Terrasse.'},
      {url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produkt-trage-bereich--trage-qihome-air-5--6bfadc17f6b1.jpg?v=1794801752', alt: 'QiHome Air auf dem Couchtisch im Wohnzimmer', zeile: 'Auf dem Couchtisch im Wohnzimmer.'},
    ],
  },
};

/** Bereich je Produkt-Handle, oder null (dann rendert TrageBereich nichts). */
export function trageBereich(handle) {
  const b = BEREICHE[handle];
  if (!b) return null;
  return {etikett: ETIKETT, zurueck: ZURUECK, weiter: WEITER, ...b};
}
