/**
 * Zentrales Daten-Modul fuer das Redesign „Drei Themen" (Konzept B7).
 *
 * ALLE Texte, Beweis-Zahlen, Links und Asset-Pfade der neuen Redesign-Sektionen
 * (Hero3Themen, ThemenAkkordeon, PodcastStimmen, ProduktTrio, DreiThemenBand)
 * leben hier — eine einzige Quelle. Die Komponenten sind reine Praesentation.
 *
 * Claim-Disziplin (Konzept B2): Beweis-Zahlen stammen AUSSCHLIESSLICH aus dem
 * Bestand (TieferSchlaf.jsx + PeerReviewStudies in HomepageSections.jsx) — hier
 * wird NICHTS Neues erfunden. Zellstudien-Zahlen tragen ein erkennbares
 * in-vitro-/Zellstudien-Label im umgebenden Text.
 *
 * Bild-Pfade unter /images/redesign/ sind bewusste TODO-Platzhalter — sie
 * werden in Teiljob J4 mit den final exportierten WebP-Assets verdrahtet.
 * Video-Dateinamen unter /videos/podcast/ sind hingegen FINAL (J2-Contract).
 */

/** Hero-Dreizeiler (Konzept B2, Empfehlung E1) — drei einzelne Zeilen. */
export const DREIZEILER = [
  'Tiefer schlafen.',
  'Geschützt vor E-Smog.',
  'Auf Zellebene jung bleiben.',
];

/** Mechanismus-Subline unter dem Dreizeiler (Nordstern-Ton, 1 Satz). */
export const SUBLINE =
  'Dein Körper besteht zu über 70 % aus Wasser. Qi Blanco bringt es in kohärente Ordnung — in Zellstudien gemessen, von 14.000+ Trägern erlebt.';

/**
 * Hero-Daten fuer Hero3Themen.
 * `bild` ist ein J4-Platzhalter. `trustRow` enthaelt NUR belegte Fakten —
 * keine erfundenen Zahlen/Ratings.
 */
export const HERO = {
  bild: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196',
  bildAlt: 'QiOne® 2 Pro — kohärentes Wasser auf Zellebene',
  cta: {label: 'Jetzt QiOne® 2 Pro entdecken', link: '/products/qione-2-pro'},
  trustRow: ['14.000+ Träger', 'Made in Germany', '20 Tage risikofrei testen'],
};

/**
 * Die drei Kern-Themen (Konzept B2).
 * `beweisZahl` + `beweisLabel` sind aus dem Bestand belegt; `mechanismusText`
 * erklaert in genau zwei Saetzen den Wirkmechanismus (Nordstern-Ton).
 * `bild` ist je Thema ein J4-Platzhalter.
 */
export const THEMEN = [
  {
    id: 'schlaf',
    titel: 'Tiefer Schlaf',
    kurz: 'Endlich erholt aufwachen',
    beweisZahl: '~20 %',
    beweisLabel: 'nennen tieferen Schlaf als häufigstes Erlebnis (171 Berichte)',
    mechanismusText:
      'Kohärentes Wasser hilft dem Nervensystem, den nächtlichen Daueralarm zu verlassen und leichter herunterzufahren. In einer Auswertung von 171 Erfahrungsberichten war ruhigerer, tieferer Schlaf das mit Abstand häufigste Thema.',
    link: '/pages/tiefer-schlaf',
    bild: '/images/redesign/thema-schlaf-frau-schlafzimmer-kerze.webp',
    alt: 'Ruhiger, tiefer Schlaf — Thema Schlaf',
  },
  {
    id: 'esmog',
    titel: 'E-Smog-Schutz',
    kurz: 'Gelassen im Funk-Alltag',
    beweisZahl: '87,1 %',
    beweisLabel: 'geringere Zellschädigung durch EM-Strahlung (Zellstudie, in vitro)',
    mechanismusText:
      'Die kohärente Grenzschicht am Wasser puffert eingestrahlten E-Smog ab und stabilisiert die Zellmembran. In Zellstudien (in vitro) zeigte sich unter Mobilfunk-Stress eine bis zu zehnfach bessere Zell-Barrierefunktion.',
    link: '/products/qione-2-pro',
    bild: '/images/redesign/thema-esmog-schreibtisch-bildschirm.webp',
    alt: 'Schutz vor E-Smog und 5G — Thema E-Smog',
  },
  {
    id: 'zellen',
    titel: 'Zellgesundheit & Langlebigkeit',
    kurz: 'Länger jung bleiben',
    beweisZahl: '75,0 %',
    beweisLabel: 'weniger oxidativer Zellstress (Zellstudie, in vitro)',
    mechanismusText:
      'Oxidativer Stress gilt als anerkannter Treiber der Zellalterung — kohärentes Wasser senkt ihn an den Zellgrenzflächen. In peer-review-kontrollierten Zellstudien (in vitro) sank die Zellbelastung durch oxidativen Stress um 75,0 %.',
    link: '/pages/zell-schutz',
    bild: '/images/redesign/thema-zellen-dna-helix-wasser.webp',
    alt: 'Zellgesundheit und Langlebigkeit — Thema Zellen',
  },
];

/**
 * Podcast-Snippets „Christian im Gespräch" (Geldhelden EP01).
 * `src`/`poster`-Dateinamen sind FINAL (J2-Contract) — die Dateien selbst
 * liefert J2 nach public/videos/podcast/.
 */
export const VIDEOS = [
  {
    id: 'podcast-schlaf',
    src: '/videos/podcast/podcast-schlaf.mp4',
    poster: '/videos/podcast/podcast-schlaf.jpg',
    thema: 'schlaf',
    titel: 'Das Kopfkissen-Experiment: Handy und Schlaf',
  },
  {
    id: 'podcast-esmog',
    src: '/videos/podcast/podcast-esmog.mp4',
    poster: '/videos/podcast/podcast-esmog.jpg',
    thema: 'esmog',
    titel: 'Was E-Smog in den Zellen auslöst',
  },
  {
    id: 'podcast-wasser',
    src: '/videos/podcast/podcast-wasser.mp4',
    poster: '/videos/podcast/podcast-wasser.jpg',
    thema: 'zellen',
    titel: 'Kohärentes Wasser: der Bindungswinkel, einfach erklärt',
  },
];

/** Ueberschrift des Produkt-Trio-Closers. */
export const PRODUKT_TRIO_TITEL = 'Drei Wege, kohärentes Wasser zu erleben';

/**
 * Produkt-Trio-Closer (Konzept B3, Pos 24).
 * `bild` sind bestehende Shopify-CDN-URLs aus dem Bestand (HomepageSections
 * FeaturedProduct / TieferSchlaf) — bewusst wiederverwendet (kein neues Asset).
 * QiOne 2 Pro sitzt in der Mitte und traegt das Bestseller-Badge.
 */
export const PRODUKT_TRIO = [
  {
    id: 'qibracelet',
    handle: 'qibracelet',
    title: 'QiBracelet®',
    tagline: 'Eleganz und Schutz — dein Support für unterwegs.',
    bild:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638',
    alt: 'QiBracelet®',
    linkKauf: '/products/qibracelet',
    linkDetail: '/pages/qibracelet',
    bestseller: false,
  },
  {
    id: 'qione-2-pro',
    handle: 'qione-2-pro',
    title: 'QiOne® 2 Pro',
    tagline: 'Kompakt, innovativ, stark — dein Begleiter Tag und Nacht.',
    bild:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476',
    alt: 'QiOne® 2 Pro',
    linkKauf: '/products/qione-2-pro',
    linkDetail: '/pages/qione',
    bestseller: true,
  },
  {
    id: 'qihome-air',
    handle: 'qihome-air',
    title: 'QiHome® Air',
    tagline: 'Kohärentes Wasser für dein ganzes Zuhause.',
    bild:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329',
    alt: 'QiHome® Air',
    linkKauf: '/products/qihome-air',
    linkDetail: '/pages/qihome',
    bestseller: false,
  },
];
