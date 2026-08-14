/**
 * REGISTRY der Studien-Sektion (/pages/studien + Einzelseiten).
 *
 * WARUM EINE REGISTRY UND KEIN HARDCODE JE SEITE: die Sektion hat vier
 * Konsumenten, die sonst auseinanderdriften — die vier Einzelrouten, die
 * Uebersichtskarten, die Querverlinkung "verwandte Studien" und das
 * BreadcrumbList-/ItemList-Schema. Eine fuenfte Studie ist absehbar (das
 * SEO-Master-Konzept Kap. 6.4 St-1 nennt eine Publikation von 2026 als
 * Frische-Signal): sie kommt hier als EIN Eintrag dazu, und alle vier
 * Konsumenten ziehen automatisch nach.
 *
 * INHALTS-HERKUNFT (K3, nicht verhandelbar): die JSON-Dateien sind aus den
 * Volltext-Extraktionen der Original-PDFs uebersetzt und gegen den
 * faktengeprueften Kurz-Korpus gegengerechnet. Feld `factGate` haelt fest, wo
 * eine auf der ALTEN Seite kursierende Zahl in der Primaerquelle NICHT steht —
 * solche Zahlen werden nicht gerendert. Wer hier Zahlen ergaenzt, ohne sie im
 * PDF zu belegen, bricht die Kontrollstufe.
 */

import e0001 from './e0001.json';
import e0002 from './e0002.json';
import e0003 from './e0003.json';
import e0004 from './e0004.json';

/** Reihenfolge = Reihenfolge auf der Uebersicht und im Dropdown (chronologisch). */
export const STUDIEN = [e0001, e0002, e0003, e0004];

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
