/*
 * GEMEINSAMES DER APPLE-LANDINGPAGES (Grossjob 20261029-GROSSJOB-alle-shop-
 * seiten-apple-niveau-ausser-seo-geo, s07). Bilder aus dem Bestand des Shops
 * (Shopify-CDN, Breite und Höhe gemessen am Original), Kaufseiten-Ziele und
 * die Kundenstimmen der Startseite (Google-Bewertungen im Wortlaut, ohne Note
 * und ohne Sterne: Christian 29.10.2026, kein Preisanker).
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

/** Die Apple-Kaufseiten (live seit dem Konfigurator-Grossjob 20261027). */
export const ZIEL = Object.freeze({
  qione: {text: 'Zum QiOne® 2 Pro', href: '/products/qione-2-pro'},
  qibracelet: {text: 'Zum QiBracelet®', href: '/products/qibracelet'},
  qihome: {text: 'Zum QiHome® Air', href: '/products/qihome-air'},
});

export const BILD = Object.freeze({
  qione: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qione-front-1440--f0024fcab5ec.jpg?v=1793414659`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qione',
    alt: 'QiOne® 2 Pro von vorn, Gehäuse aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1440,
    hoehe: 1440,
  },
  qibracelet: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qibracelet-winkel--a26b001f0816.jpg?v=1790809401`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qibracelet',
    alt: 'QiBracelet® aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1080,
    hoehe: 1080,
  },
  gitter: {
    url: `${CDN}/files/QiOne_Gitterchip-1680.webp?v=1793415850`,
    alt: 'Der Gitterchip® aus 750er Gold in Nahaufnahme',
    breite: 1680,
    hoehe: 1680,
  },
  hand: {
    url: `${CDN}/products/2021-04-qiblanco-bali-16_e66b45ce-857c-4bd8-a123-05e0b2d4229e.jpg?v=1698259307`,
    alt: 'QiOne® 2 Pro an der Kette in einer offenen Hand',
    breite: 2579,
    hoehe: 2579,
  },
  wasser: {
    url: `${CDN}/files/2025-05-qiblanco-canggu-1054658.jpg?v=1762974785`,
    alt: 'QiBracelet® am Handgelenk im Wasser',
    breite: 3500,
    hoehe: 2336,
  },
  paar: {
    url: `${CDN}/files/2024-06-qiblanco-bali-06610.jpg`,
    alt: 'Zwei Menschen am Frühstückstisch, entspannt im Gespräch',
    breite: 6000,
    hoehe: 4000,
  },
  ruhe: {
    url: `${CDN}/files/2024-06-qiblanco-bali-06589_1.jpg`,
    alt: 'Frau liest ruhig am Tisch in der Morgensonne',
    breite: 4000,
    hoehe: 4000,
  },
  denken: {
    url: `${CDN}/files/2024-06-qiblanco-bali-06550.jpg`,
    alt: 'Mann liest konzentriert am Laptop',
    breite: 3417,
    hoehe: 3636,
  },
  studie: {
    url: `${CDN}/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510`,
    alt: 'Titelseite einer publizierten Studie im Japan Journal of Medicine',
    breite: 957,
    hoehe: 1024,
  },
  laptop: {
    url: `${CDN}/files/qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp`,
    alt: 'Frau arbeitet am Laptop im hellen Wohnzimmer',
    breite: 2400,
    hoehe: 1471,
  },
  saft: {
    url: `${CDN}/files/qb-themen--themen-zellen-qibracelet-gruensaft-canggu-06390--b4ab3f9b62c8.webp`,
    alt: 'Hand mit QiBracelet® hält ein Glas grünen Saft',
    breite: 2400,
    hoehe: 1600,
  },
});

/** Google-Bewertungen im Wortlaut (dieselben wie auf der Startseite, s04). */
export const STIMMEN = Object.freeze([
  {
    text: 'In herausfordernden Momenten fasse ich den QiOne kurz an und schon kehrt Ruhe ein.',
    quelle: 'Google-Bewertung, Oktober 2026',
  },
  {
    text: 'Insgesamt fühle ich mich ausgeglichener, entspannter und mehr bei mir.',
    quelle: 'Google-Bewertung, Oktober 2026',
  },
  {
    text: 'Seit ich den QiOne®2Pro trage, habe ich mehr Klarheit bei Entscheidungen und fühle mich selbstsicherer.',
    quelle: 'Google-Bewertung, November 2025',
  },
]);

/** Die vier publizierten Arbeiten (Bestand der Message-Match-LPs). */
export const STUDIEN = Object.freeze([
  {
    etikett: 'In-vitro · Immunzellen',
    titel: 'Schutzeffekt an Immunzellen',
    quelle: 'Japan Journal of Medicine, 30. April 2021',
    methode: 'Kultivierte menschliche Immunzellen unter Belastung.',
    ergebnis: 'Messbarer Schutzeffekt in der behandelten Gruppe.',
    grenze: 'Zellkultur im Labor, keine Aussage über den Menschen.',
    pdf: `${CDN}/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705`,
  },
  {
    etikett: 'In-vitro · Darmzellen',
    titel: 'Schutzeffekt an Darmzellen',
    quelle: 'Applied Cell Biology Journal, 2021',
    methode: 'Kultivierte Darmzellen (intestinale Epithelzellen) unter Belastung.',
    ergebnis: 'Schutzeffekt in der behandelten Gruppe messbar.',
    grenze: 'Reine Zellkultur, kein Nachweis am Menschen und kein Heileffekt.',
    pdf: `${CDN}/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844`,
  },
  {
    etikett: 'In-vitro · Oxidativer Stress',
    titel: 'QiBracelet® gegen oxidativen Stress',
    quelle: 'Applied Cell Biology Journal, 12. Januar 2024',
    methode: 'Kultivierte Zellen unter oxidativem Stress, getestet mit dem QiBracelet®.',
    ergebnis: 'Messbarer Schutz der behandelten Zellen.',
    grenze: 'In-vitro im Labor, keine Übertragung auf den Menschen.',
    pdf: `${CDN}/files/qb-studien--e0003--98a5ee2d2b49.pdf?v=1791640835`,
  },
  {
    etikett: 'Nutzererfahrung',
    titel: 'Forschungsartikel zur Nutzererfahrung',
    quelle: 'Advances in Bioengineering & Biomedical Science Research, 10. Mai 2024',
    methode: 'Auswertung berichteter Nutzererfahrungen.',
    ergebnis: 'Wiederkehrend beschriebene positive Erfahrungen.',
    grenze: 'Deskriptiv und ohne Kontrollgruppe, deshalb kein Wirknachweis.',
    pdf: `${CDN}/files/ABBSR-24_-31_3.pdf?v=1717500318`,
  },
]);

export const ANNA = Object.freeze({art: 'anna'});
