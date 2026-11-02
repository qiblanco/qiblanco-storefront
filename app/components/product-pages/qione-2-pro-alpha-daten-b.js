/*
 * B-FASSUNG DES UNTEREN BEREICHS /products/qione-2-pro (Christian Zx 29.10.2026:
 * „kurz, lang, welche Texte, welche Beschreibungen, welche Videos“; Grossjob
 * 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s12).
 * Hypothese „kurz, Video zuerst“. Nur das Delta zu A: der Oberteil liest dieselben
 * Daten wie A, alle Sätze stammen aus den s03-Texten von A.
 */
import {NUTZEN} from './qione-2-pro-alpha-daten';

export * from './qione-2-pro-alpha-daten';

const [TECHNOLOGIE, WISSENSCHAFT] = NUTZEN.spalten;

const kapitelAus = (spalte) => ({
  etikett: spalte.etikett,
  titel: spalte.titel,
  absaetze: [spalte.text],
  bild: null,
});

/** Über dem Video: was das Video zeigt. */
export const VIDEO_KAPITEL = kapitelAus(TECHNOLOGIE);

/** Der Beleg kurz vor der FAQ, mit dem Weg zur Studie. */
export const BEWEIS = {
  kapitel: [kapitelAus(WISSENSCHAFT)],
  studien: {
    ueberschrift: 'Die Studie von Prof. Dr. Peter C. Dartsch.',
    link_text: WISSENSCHAFT.link.text,
    href: WISSENSCHAFT.link.href,
  },
};
