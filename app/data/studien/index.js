/**
 * REGISTRY der Studien-Sektion (/pages/studien + Einzelseiten).
 *
 * WARUM EINE REGISTRY UND KEIN HARDCODE JE SEITE: die Sektion hat vier
 * Konsumenten, die sonst auseinanderdriften — die vier Einzelrouten, die
 * Übersichtskarten, die Querverlinkung "verwandte Studien" und das
 * BreadcrumbList-/ItemList-Schema. Eine fuenfte Studie ist absehbar (das
 * SEO-Master-Konzept Kap. 6.4 St-1 nennt eine Publikation von 2026 als
 * Frische-Signal): sie kommt hier als EIN Eintrag dazu, und alle vier
 * Konsumenten ziehen automatisch nach.
 *
 * INHALTS-HERKUNFT (K3, nicht verhandelbar): die JSON-Dateien sind aus den
 * Volltext-Extraktionen der Original-PDFs übersetzt und gegen den
 * faktengeprueften Kurz-Korpus gegengerechnet. Feld `factGate` hält fest, wo
 * eine auf der ALTEN Seite kursierende Zahl in der Primaerquelle NICHT steht —
 * solche Zahlen werden nicht gerendert. Wer hier Zahlen ergänzt, ohne sie im
 * PDF zu belegen, bricht die Kontrollstufe.
 */

import e0001 from './e0001.json';
import e0002 from './e0002.json';
import e0003 from './e0003.json';
import e0004 from './e0004.json';
import e0005 from './e0005.json';

/** Reihenfolge = Reihenfolge auf der Übersicht und im Dropdown (chronologisch). */
export const STUDIEN = [e0001, e0002, e0003, e0004, e0005];

/** @type {Record<string, typeof e0001>} */
export const STUDIEN_NACH_SLUG = Object.fromEntries(
  STUDIEN.map((s) => [s.slug, s]),
);

/** @type {Record<string, typeof e0001>} */
export const STUDIEN_NACH_ID = Object.fromEntries(
  STUDIEN.map((s) => [s.id, s]),
);

export const UEBERSICHT_PFAD = '/pages/studien';

/** Pfad einer Einzelseite. Eine Stelle, damit Links und Schema nie auseinanderlaufen. */
export function studienPfad(slug) {
  return `/pages/${slug}`;
}

const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/**
 * `veroeffentlicht` als deutscher Fliesstext — und zwar GENAU so genau, wie das
 * Feld es hergibt. e0002 trägt in der Primaerquelle nur "2021" (kein
 * Tagesdatum); daraus ein Datum zu bauen wäre eine Erfindung. Volles Datum ->
 * "am 12. Januar 2024", nur Jahr -> "2024".
 */
export function veroeffentlichtLang(wert) {
  const s = String(wert || '');
  const voll = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (voll) return `am ${Number(voll[3])}. ${MONATE[Number(voll[2]) - 1]} ${voll[1]}`;
  const jahr = /^(\d{4})/.exec(s);
  return jahr ? jahr[1] : '';
}

/**
 * Die zwei Kachel-Zeilen des Studien-Sliders: Zeile 1 sagt, WORAN gemessen
 * wurde (Immunzellen, Darmepithel, neuronale Zellen), Zeile 2 WO und WANN
 * veroeffentlicht wurde. Diese Reihenfolge ist Absicht — die Kachel beantwortet
 * zuerst die Frage des Zweiflers, nicht die Bibliografie.
 *
 * WARUM MIT RUECKFALL: der redaktionelle Wortlaut steht je Studie in `kachel`
 * (Abschnitt 5 des gemeinsamen Konzepts). Fehlt er bei einer kuenftig
 * ergaenzten Studie, leitet diese Funktion eine wahrheitsgemaesse Zeile aus den
 * Eckdaten ab, statt die Kachel halb leer zu lassen — dieselbe Haltung wie bei
 * `zahlwort`: eine neue Studie darf nirgends eine stille Luecke hinterlassen.
 */
export function kachelZeilen(studie) {
  const e = studie.eckdaten || {};
  const k = studie.kachel || {};
  const wann = veroeffentlichtLang(e.veroeffentlicht);
  return {
    zeile1: k.zeile1 || e.titelDeutsch || studie.seo?.h1 || '',
    zeile2:
      k.zeile2 ||
      [e.journal ? `veröffentlicht in ${e.journal}` : '', wann]
        .filter(Boolean)
        .join(' '),
  };
}

/**
 * Die verwandten Studien EINER Studie, als volle Objekte.
 * Unbekannte IDs werden still verworfen — eine kaputte Querverlinkung darf die
 * Seite nicht abschiessen, sie darf nur fehlen.
 */
export function verwandteStudien(studie) {
  return (studie.verwandt || [])
    .map((id) => STUDIEN_NACH_ID[id])
    .filter(Boolean);
}

/**
 * ZAHLWORT — WARUM DAS HIER STEHT UND NICHT ALS WORT IM FLIESSTEXT:
 * Beim Anlegen der fuenften Studie stand "vier" an neun Stellen als Prosa
 * (Ueberschrift „Die vier Publikationen", „Alle vier Arbeiten sind
 * präklinisch", CollectionPage-description, og:description ...). Die Karten
 * rendern seit jeher generisch über STUDIEN.map — die ZAHL daneben tat es
 * nicht. Eine Studie zu ergänzen haette also die Ueberschrift „Die vier
 * Publikationen" über FUENF Karten gestellt: jede Seite für sich stimmig,
 * die Naht offen. Seitdem kommt jede Anzahl aus den Daten.
 */
const ZAHLWORTE = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht'];

export function zahlwort(n) {
  return ZAHLWORTE[n] || String(n);
}

/** Anzahl der Studien einer präklinischen Bauart (Feld `art` je Studie). */
export function anzahlNachArt(art) {
  return STUDIEN.filter((s) => s.art === art).length;
}

/**
 * Die untersuchten Produkte, absteigend nach Studienzahl.
 * Gezählt wird über `produkte` (Liste), NICHT über `eckdaten.produkt`: die
 * Nutzerbeobachtungs-Arbeit untersucht zwei Geraete, trägt als Anzeige-Kicker
 * aber nur eines. Wer `eckdaten.produkt` zählt, verliert genau diese Studie.
 * Link und Kurztext bleiben redaktionell — die ZAHL kommt aus den Daten.
 */
const PRODUKT_TEXTE = {
  'QiOne® 2 Pro': {
    pfad: '/pages/qione-2-pro',
    text: 'Immunzellen, Darmbarriere und Nutzerbeobachtungen',
  },
  'QiBracelet®': {
    pfad: '/products/qibracelet',
    text: 'Oxidativer Stress und Nutzerbeobachtungen',
  },
  'QiHome® Air': {
    pfad: '/pages/qihome-air',
    text: 'Zellregeneration und oxidativer Stress',
  },
};

export function untersuchteProdukte() {
  const zahl = new Map();
  for (const s of STUDIEN) {
    for (const p of s.produkte || []) zahl.set(p, (zahl.get(p) || 0) + 1);
  }
  return [...zahl.entries()]
    .filter(([name]) => PRODUKT_TEXTE[name])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, anzahl]) => ({name, anzahl, ...PRODUKT_TEXTE[name]}));
}
