/*
 * TEXTE DER BLACK-FRIDAY-SEITEN 2026 (s04, Entwurf: s04/texte.md im Job-Ordner).
 * Beträge und Daten stehen hier nicht, sie kommen aus data/black-friday-2026.js.
 * Sätze mit Marke FREIGEGEBEN stehen wortgleich auf den live Apple-Kaufseiten.
 * Neue Sätze durchlaufen die Textprüfkette (s04/texte.md). Keine Rechtshinweise.
 */
import {bf2026Zeitpunkt, BF2026, bf2026Zeitraum} from '../../data/black-friday-2026.js';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

/** Produktbilder der Karten und der Szene (Bestand, Shopify-CDN). */
export const BF2026_BILDER = {
  qihome: {
    url: `${CDN}/files/QiHome1.webp?v=1732874979`,
    alt: 'QiHome® Air von vorn, gebürstetes Aluminium mit Holzkappe',
    breite: 2048,
    hoehe: 2048,
  },
  qibracelet: {
    url: `${CDN}/files/QiBracelet1.webp?v=1732874909`,
    alt: 'QiBracelet®, offener Armreif aus Chirurgenstahl',
    breite: 2056,
    hoehe: 2056,
  },
  'qione-2x': {
    url: `${CDN}/files/2xQiOne2Profreistehend_1.png?v=1731614283`,
    alt: 'Zwei QiOne® 2 Pro nebeneinander',
    breite: 2056,
    hoehe: 1773,
  },
  'qione-kette': {
    url: `${CDN}/products/necklace_01.png?v=1698259307`,
    alt: 'QiOne® 2 Pro an der Kette aus Chirurgenstahl',
    breite: 2160,
    hoehe: 2160,
  },
};

/** Ein Satz je Karte. */
export const BF2026_KARTENSATZ = {
  // FREIGEGEBEN: qihome-air-alpha-daten PRODUKT.kurzzeile
  qihome: 'Ein Gerät · bis 160 m Radius · ohne Strom',
  // FREIGEGEBEN: qibracelet-alpha-daten BAND.titel
  qibracelet: 'Zellschutz für unterwegs',
  'qione-2x': 'Zwei QiOne® 2 Pro, einer für dich und einer zum Verschenken.',
  // FREIGEGEBEN: qione-2-pro-alpha-daten KETTE.titel
  'qione-kette': 'Trag ihn an seiner eigenen Kette.',
};

export const BF2026_KOPF = {
  overline: `Black Friday · ${bf2026Zeitraum()}`,
  titel: 'Vier Angebote an vier Tagen.',
  unter: 'Der Rabatt wird im Warenkorb automatisch abgezogen, du brauchst keinen Code.',
  knopf: 'Zu den Angeboten',
  vorbeiTitel: 'Black Friday ist vorbei.',
  vorbeiUnter: 'QiHome® Air, QiBracelet® und QiOne® 2 Pro findest du weiter im Shop.',
};

export const BF2026_UHR = {
  vor: 'Beginnt in',
  waehrend: 'Endet in',
  vorbei: 'Black Friday ist vorbei',
};

/**
 * Leistungsgrafik: Elinas Kernpunkte, FREIGEGEBEN wortgleich aus
 * qione-2-pro-alpha-daten PRODUKT.punkte (Reihenfolge Zelle · Schutz · Feld).
 */
export const BF2026_LEISTUNG = {
  titel: 'Was du davon hast.',
  stufen: ['Gesteigerte Zellleistung', 'Schutz vor E-Smog, 5G & 6G', 'Gesteigerte Anbindung zum Quantenfeld'],
};

export const BF2026_SO_GEHT_ES = {
  titel: 'So einfach geht es.',
  kacheln: [
    {zahl: 'Ohne Code', satz: 'Der Rabatt wird im Warenkorb automatisch abgezogen.'},
    // FREIGEGEBEN: qione-2-pro-alpha-daten ZUSAMMENFASSUNG.zeilen[2]
    {zahl: '20 Tage', satz: '20 Tage zu Hause testen, voller Kaufpreis zurück'},
    // FREIGEGEBEN: BEZAHLART.titel
    {zahl: 'In Raten', satz: 'Zahle direkt oder bequem in Raten.'},
  ],
};

const WANN = {
  f: 'Wann gilt das Angebot?',
  a: `Von ${bf2026Zeitpunkt(BF2026.fenster.start_utc)}, bis ${bf2026Zeitpunkt(BF2026.fenster.ende_utc)}.`,
};
const CODE = {
  f: 'Brauche ich einen Code?',
  a: 'Nein, du musst nichts eingeben.',
};

/** Fragen, die jede Seite der Aktion stellt. */
export const BF2026_FRAGEN_AKTION = [WANN, CODE];

export const BF2026_FAQ_LANDING = {
  titel: 'Deine Fragen zum Black Friday.',
  fragen: [
    WANN,
    CODE,
    {
      // FREIGEGEBEN: pjdz538hgs0-alpha-daten KETTE_IM_SET.anleitung
      f: 'Welche Kettenlänge passt zu mir?',
      a: 'Leg ein Maßband locker um deinen Hals und lass es so tief fallen, wie dein QiOne® liegen soll. Die Zahl an dieser Stelle ist deine Länge.',
    },
    {
      // FREIGEGEBEN: qibracelet-alpha-daten VARIANTE.anleitung
      f: 'Welche Größe hat mein QiBracelet®?',
      a: 'Leg ein Lineal an die breiteste Stelle deines Handgelenks, dort, wo du an beiden Seiten die Knöchel spürst. Schließ ein Auge und lies ab, auf den halben Zentimeter gerundet.',
    },
    {
      // FREIGEGEBEN: qihome-air-alpha-daten ZUSAMMENFASSUNG.zeilen[0]
      f: 'Wie schnell kommt es an?',
      a: 'Versand am nächsten Werktag. Kostenlos in Deutschland und voll versichert.',
    },
  ],
};

export const BF2026_SCHLUSS = {
  vor: {titel: `Ab ${bf2026Zeitpunkt(BF2026.fenster.start_utc)}.`, knopf: 'Zu den Angeboten'},
  waehrend: {titel: `Bis ${bf2026Zeitpunkt(BF2026.fenster.ende_utc)}.`, knopf: 'Zu den Angeboten'},
  vorbei: null,
};

export const BF2026_ZUM_UEBERBLICK = 'Alle vier Angebote';
