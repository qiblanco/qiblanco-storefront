/*
 * APPLE-FASSUNG DER ADS-LP /pages/schlaf-zellen-schutz UND IHRER TESTARME
 * (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo,
 * s06). Ein Sektionssatz für alle vier Arme, die heute Verkehr bekommen:
 *   a    /pages/schlaf-zellen-schutz       Kontrolle (Champion mobil)
 *   b2   /pages/schlaf-zellen-schutz-b2    szs-e2-gs126: Weiter-Knöpfe 1 und 2, kein fester Knopf
 *   k50  /pages/schlaf-zellen-schutz-k50   szs-e3-gs079: ohne beide Scroll-Videos, Stimmen-Videos und Schluss
 *   k25  /pages/schlaf-zellen-schutz-k25   szs-e4-gs174: Kopf, Stimmen, Garantie, Geräte
 * Welche Teile ein Arm weglässt, ist dieselbe Regel wie in
 * components/campaign/SchlafZellenSchutz.jsx (C). So misst jeder Test nach dem
 * Umbau weiter seine eigene Hypothese.
 *
 * TEXTE: Christians Wortlaut im Kopf unverändert (H1 „Leistung auf Zellebene“
 * seit 28.09., Overline, Dreizeiler, Absatz, Vertrauenszeile, Knopf „Jetzt
 * kaufen“ seit 21.09.). Die Zahlen der drei Ebenen und des Labors kommen aus
 * dem Bestand (lib/redesign3themen.js, apple-seite/startseite). Neu ist nur
 * die Kürzung.
 *
 * AUSSORTIERT gegenüber C (Christian 29.10.2026: kein Preisanker, Apple-Niveau):
 * der Startseiten-Block „4.8 / Mehr als 14.000+ aktive Nutzer“ im Kopf,
 * „+ 14.000 aktive Nutzer“ im Schluss, der Bewertungsblock mit Note und
 * Sternen (die Stimmen stehen im Wortlaut), die Drei-Themen-Leiste (die drei
 * Ebenen stehen als eigene Bänder), die Presse- und Podcast-Kacheln, die
 * Werbekacheln (InfoSlider) und das Schild „Bestseller“.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const VARIANTEN = Object.freeze(['a', 'b2', 'k50', 'k25']);

/** Seitenname in app/lib/apple-seiten.js je Arm. */
export const SEITE_JE_VARIANTE = Object.freeze({
  a: 'schlaf-zellen-schutz',
  b2: 'schlaf-zellen-schutz-b2',
  k50: 'schlaf-zellen-schutz-k50',
  k25: 'schlaf-zellen-schutz-k25',
});

export const KOPF = Object.freeze({
  overline: 'Tragbares Hightech mit messbaren Effekten auf Zellebene',
  titel: 'Leistung auf Zellebene',
  dreizeiler: ['Tiefer schlafen.', 'Starker Fokus.', 'Innere Ruhe.'],
  absatz:
    'Der QiOne® 2 Pro strukturiert dort Wasser, wo es darauf ankommt: In deinen Zellen. Mit seinen fünf international publizierten Peer-Review-Studien ist es das am besten untersuchte Energieprodukt der Welt.',
  beleg: 'Wirkung in Zellstudien bestätigt',
  aufruf: 'Erfahre es jetzt selbst.',
});

export const VERTRAUEN =
  'Jetzt 20 Tage nach Erhalt testen, mit 0 % Finanzierung & Käuferschutz. 100 % Geld-zurück-Garantie.';

export const ZAHLWEGE = Object.freeze([
  {
    src: `${CDN}/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816`,
    alt: 'Klarna',
    breite: 800,
    hoehe: 445,
  },
  {
    src: `${CDN}/files/paypal-784404_1280.webp?v=1708904082`,
    alt: 'PayPal',
    breite: 1280,
    hoehe: 640,
  },
]);

export const WIRKPRINZIP = Object.freeze({
  etikett: 'Wirkprinzip',
  titel: 'Kohärentes Wasser. In deinen Zellen.',
  absaetze: [
    'Der Gitterchip® ermöglicht es den umliegenden Wassermolekülen, in den kohärenten Zustand überzugehen, den Superzustand des Wassers.',
    'Aus normalem Wasser wird energetisch hoch aufgeladenes Wasser. Zellprozesse verfügen damit über mehr Energie, etwa die roten Blutkörperchen, die sich falten müssen, um die engen Kapillaren zu passieren.',
  ],
});

/** Die drei Ebenen. Bild, Zahl und Aussage aus lib/redesign3themen.js. */
export const EBENEN = Object.freeze([
  {
    etikett: 'Ebene 1 · Zelle',
    titel: 'Weniger oxidativer Stress.',
    text: [
      'In Zellstudien sank die Belastung durch oxidativen Stress um 75,0 %.',
      'Gemessen in vitro, an Zellkulturen im Labor.',
    ],
    bild: {
      url: `${CDN}/files/qb-themen--themen-zellen-qibracelet-gruensaft-canggu-06390--b4ab3f9b62c8.webp?v=1790161977`,
      alt: 'Hand mit QiBracelet® hält ein Glas grünen Saft, draußen im Grünen',
      breite: 2400,
      hoehe: 1600,
    },
  },
  {
    etikett: 'Ebene 2 · Feld',
    titel: 'Ruhig zwischen WLAN und Handy.',
    text: [
      'Unter Mobilfunk-Stress hielten Zellen ihre Barriere bis zu zehnfach besser.',
      '87,1 % geringere Zellschädigung durch EM-Strahlung, gemessen in vitro.',
    ],
    bild: {
      url: `${CDN}/files/qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp?v=1790161971`,
      alt: 'Frau arbeitet am Laptop im hellen Wohnzimmer',
      breite: 2400,
      hoehe: 1471,
    },
  },
  {
    etikett: 'Ebene 3 · Schlaf',
    titel: 'Leichter abschalten.',
    text: [
      'In 171 Erfahrungsberichten war ruhigerer, tieferer Schlaf das häufigste Thema.',
      'Rund 20 % nennen tieferen Schlaf als stärkstes Erlebnis.',
    ],
    bild: {
      url: `${CDN}/files/2023-03-01-qiblanco-milva-martin-1020791_1_0f03ee06-6ad1-4997-9182-3685335eb04c.webp?v=1738063344`,
      alt: 'Paar liegt entspannt im Bett',
      breite: 1714,
      hoehe: 964,
    },
  },
]);

export const LABOR = Object.freeze({
  etikett: 'Wissenschaft',
  titel: 'Im Labor bleiben Immunzellen stark.',
  kacheln: [
    {zahl: '60,5 %', titel: 'Ungeschützt', satz: 'Abwehrleistung nach vier Stunden Handystrahlung.'},
    {zahl: '84,7 %', titel: 'Mit QiOne® 2 Pro', satz: 'Dieselben Zellen, dieselbe Belastung.'},
    {zahl: '5', titel: 'Publikationen', satz: 'Alle in Fachjournalen veröffentlicht.'},
  ],
  satz: 'Prof. Dr. Peter C. Dartsch, Institut für zellbiologische Testsysteme. Gemessen an menschlichen Zellkulturen.',
  link: {text: 'Alle Studien lesen', href: '/pages/studien'},
});

export const MIKROSKOP = Object.freeze({
  srcDesktop: 'https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov',
  srcMobile: 'https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov',
  overlayStart: {titel: 'Zellbiologisch geprüft', text: 'So sehen die Effekte auf Zellebene aus.'},
  overlayEnd: [
    {
      titel: 'Ohne Gitterchip®',
      text: 'Zellen unter Mobilfunk-Stress zeigen eine geschwächte Barriere und mehr oxidative Belastung.',
    },
    {
      titel: 'Mit Gitterchip®',
      text: 'Dieselben Zellen halten ihre Barrierefunktion messbar besser aufrecht (TEER-Messung, in vitro).',
    },
  ],
  fussnote: 'Gegenüberstellung aus den in-vitro-Zellstudien. Kein Erfahrungsbericht, keine Heilaussage.',
});

/** Google-Bewertungen im Wortlaut, ohne Note und ohne Sterne (wie s04/s07). */
export const STIMMEN = Object.freeze({
  titel: 'Das sagen Menschen, die ihn tragen.',
  stimmen: [
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
  ],
});

/** Die drei Video-Erfahrungen aus C (content-match geprüft, Tiefschlaf-LP). */
export const VIDEOS = Object.freeze({
  titel: 'Echte Menschen. Echte Erfahrungen.',
  liste: [
    {
      id: 'jyLyXZqHxaw',
      tag: 'Deutscher Leichtathletik-Meister',
      titel: 'Constantin Preis: getrackter Tiefschlaf',
    },
    {
      id: 'aG36zJKxDzg',
      tag: 'Nada & Kurt Tepperwein',
      titel: 'Spürbar stabiler im Alltag',
    },
    {
      id: 'zIfDQ1N60fI',
      tag: 'Erste Tage mit dem QiOne®',
      titel: 'Michelle Christin Guse: „wie ein kleines Wunder“',
    },
  ],
});

export const GARANTIE = Object.freeze({
  titel: '100 % Geld-zurück-Garantie.',
  kacheln: [
    {zahl: '20', titel: 'Tage testen', satz: 'Im echten Alltag. Passt er nicht, bekommst du den vollen Kaufpreis zurück.'},
    {zahl: '0 %', titel: 'Raten', satz: 'Über Klarna oder PayPal, in bequemen Monatsraten.'},
    {zahl: '100 %', titel: 'Made in Germany', satz: 'Entwickelt und gefertigt in Deutschland. Versand innerhalb Deutschlands kostenlos.'},
  ],
});

export const MODELLE = Object.freeze({
  titel: 'Welches passt zu mir?',
  liste: [
    {handle: 'qione-2-pro', name: 'QiOne® 2 Pro', zeile: 'Am Hals. Für Tag und Nacht.'},
    {handle: 'qibracelet', name: 'QiBracelet®', zeile: 'Am Handgelenk. Den ganzen Tag.'},
    {handle: 'qihome-air', name: 'QiHome® Air', zeile: 'Im Raum. Für alle unter deinem Dach.'},
  ],
  zeile: 'Alle Geräte: 20 Tage testen · 0 % Finanzierung über Klarna und PayPal · Versand innerhalb Deutschlands kostenlos · Käuferschutz',
});

export const SCHLUSS = Object.freeze({
  titel: 'Teste jetzt den QiOne® 2 Pro. 20 Tage ohne Risiko.',
  text: 'Trage ihn 20 Nächte lang. Bist du danach nicht überzeugt, erstatten wir dir den vollen Kaufpreis.',
});

/**
 * Welche Teile ein Arm zeigt. Dieselbe Regel wie in C (SchlafZellenSchutz.jsx,
 * Root): K50 ohne beide Scroll-Videos, Video-Stimmen und Schluss; K25 nur
 * Kopf, Stimmen, Garantie und Geräte. Weiter-Knöpfe: 1 mobil in A und K50
 * (Champion szs-e1-gs050), 1 und 2 überall in B2; 6 nach dem Labor überall
 * außer K25. Fester Knopf mobil in A, K50 und K25, nicht in B2.
 * @param {'a'|'b2'|'k50'|'k25'} variante
 */
export function teileFuer(variante) {
  const v = VARIANTEN.includes(variante) ? variante : 'a';
  const k25 = v === 'k25';
  const kurz = v === 'k50' || k25;
  return Object.freeze({
    variante: v,
    gitterchipVideo: !kurz,
    wirkprinzip: !k25,
    ebenen: !k25,
    weiter1: k25 ? null : v === 'b2' ? 'immer' : 'mobil',
    labor: !k25,
    mikroskopVideo: !kurz,
    weiter6: !k25,
    stimmen: true,
    weiter2: v === 'b2',
    videos: !kurz,
    garantie: true,
    modelle: true,
    schluss: !kurz,
    sticky: v !== 'b2',
  });
}
