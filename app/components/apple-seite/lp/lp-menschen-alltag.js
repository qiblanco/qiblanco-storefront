import {ANNA, BILD, STIMMEN, ZIEL} from './lp-gemeinsam.js';
import {MENSCHEN_ALLTAG_TEXTE as T} from '../../campaign/menschenAlltagTexte.js';

/*
 * APPLE-FASSUNG /pages/menschen-alltag (s07-r19). Die Seite war Arm B des
 * Tests fm-b1 (GS-262, Stufe B „Menschen und Alltag statt Zellen“). GS-262 ist
 * seit dem 11.11.2026 verworfen, der Test lief nie (Triage 02.11., Christian:
 * A/B-Tests pausiert). Die Seite bleibt noindex und unverlinkt.
 *
 * TEXTE: aus demselben Textmodul wie C (components/campaign/menschenAlltagTexte.js,
 * Werkstatt-Blöcke mit Text-ID). Kein neuer Satz in den Absätzen; neu sind nur
 * die kurzen Überschriften und Etiketten. Gekürzt wurde nach dem Apple-Stil
 * (wenige Worte, kein Satz zweimal): der Revolutions-Aufruf aus dem
 * Produkt-Block, die Rückgabe-Zusage im Einwand-Block, die das CTA-Band
 * trägt, und der Absicherungssatz „kein Heilversprechen“ (sprach-pruefe,
 * Klasse absicherung; der Laborbezug steht im Satz davor).
 *
 * ZWEI KAUFKNÖPFE, nicht drei (Kopf und Schlussband): mit einem dritten
 * goldenen Knopf im Band „Drei Formen“ war Gold die häufigste Hintergrundfarbe
 * der Seite, und die Design-Rubrik maß den Haupttext gegen Gold (3,0:1,
 * Vorschau 96 am 11.11.). Die Marken tragen ® (Schreibweise der SEGMENT-GRUNDLAGE).
 *
 * AUSSORTIERT gegenüber C: Bewertungsblock mit Google-Note und Sternen,
 * „+ 14.000 aktive Nutzer“, Schild „Bestseller“ (Christian 29.10.2026, kein
 * Preisanker), Zahlarten-Logos im Kopf, Produktkarten-Raster und die drei
 * YouTube-Videos. Die Menschen stehen hier mit ihren eigenen Sätzen (Stimmen,
 * Google-Bewertungen im Wortlaut); die Videoberichte bleiben auf
 * /pages/erfahrungen.
 */
const MARKEN = [
  ['QiOne 2 Pro', 'QiOne® 2 Pro'],
  ['QiBracelet', 'QiBracelet®'],
  ['QiHome Air', 'QiHome® Air'],
];

/** Werkstatt-Text mit ® an den Marken, sonst Wort für Wort. */
export function mitMarken(text) {
  return MARKEN.reduce((t, [ohne, mit]) => t.split(ohne).join(mit), text);
}

/* Ein Punkt nach einer Abkürzung oder einem Einzelbuchstaben (Prof., Dr., C.)
   beendet keinen Satz. */
const ABKUERZUNG = /(?:^|\s)(?:Prof|Dr|bzw|ca|usw|[A-ZÄÖÜ])$/;

/** Die Sätze eines Werkstatt-Absatzes, je Satz unverändert. */
export function satzListe(absatz) {
  const teile = [];
  const re = /[.!?]+(?=\s|$)/g;
  let start = 0;
  let m;
  while ((m = re.exec(absatz))) {
    if (ABKUERZUNG.test(absatz.slice(start, m.index))) continue;
    const ende = m.index + m[0].length;
    teile.push(absatz.slice(start, ende).trim());
    start = ende;
  }
  const rest = absatz.slice(start).trim();
  if (rest) teile.push(rest);
  return teile;
}

/** Die ersten n Sätze eines Werkstatt-Absatzes. */
export function saetze(absatz, n) {
  return satzListe(absatz).slice(0, n).join(' ');
}

const kopf = T.kopf.absaetze.map(mitMarken);
const einwand = T.einwand.absaetze.map(mitMarken);
const produkte = T.produkte.absaetze.map(mitMarken);
const schluss = T.schluss.absaetze.map(mitMarken);

export const MENSCHEN_ALLTAG_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Menschen und Alltag',
    titel: `${T.kopf.ueberschrift}.`,
    unter: kopf[0],
    bild: BILD.laptop,
    cta: ZIEL.qione,
  },
  {
    art: 'band',
    etikett: 'Was Träger erzählen',
    titel: 'Die Sicherheit kommt zurück.',
    text: [kopf[1]],
    bild: BILD.ruhe,
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'kapitel',
    // Christians Wortlaut („das am besten untersuchte Energieprodukt der Welt“,
    // /pages/schlaf-zellen-schutz und Video-Ad Basic Facts). Vorher „Die ehrliche
    // Antwort“ (neue_seiten_pruefung: Selbstabwertung), Folgejob 20261113.
    etikett: 'Das am besten untersuchte Energieprodukt der Welt',
    titel: T.einwand.ueberschrift,
    absaetze: [einwand[0], saetze(einwand[1], 2), saetze(einwand[2], 1)],
    bild: BILD.studie,
  },
  {
    art: 'band',
    etikett: 'Drei Formen',
    titel: T.produkte.ueberschrift,
    text: [produkte[0], saetze(produkte[1], 1)],
    bild: BILD.hand,
  },
  {
    art: 'cta',
    titel: T.schluss.ueberschrift,
    text: saetze(schluss[1], 2),
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
