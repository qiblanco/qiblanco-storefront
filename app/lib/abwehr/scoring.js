/**
 * scoring.js — Missbrauchs-Score 0..100 aus AUSSCHLIESSLICH objektiven Signalen.
 *
 * JS-PORTIERUNG der Python-SSoT `shared-state/sicherheitsmeister/src/scoring.py`
 * (T1-Kern, Job 20260715-abwehr-scraping-content-schutz-deepdive). Die Python-
 * Version bleibt die Regel-Wahrheit; Aenderungen dort MUESSEN hier nachgezogen
 * werden. Der Paritaets-Test (scripts/abwehr/paritaet.mjs) beweist die
 * Deckungsgleichheit ueber dieselben Vektoren.
 *
 * INV-2 STRUKTURELL ERZWUNGEN: Whitelist der 6 objektiven Verhaltenssignale —
 * jedes unbekannte Feld (insbesondere jedes denkbare Identitaets-Feld) wirft.
 * ASN geht NUR als Netz-TYP ein, NIE als Akteur-Identitaet.
 *
 * INV-6: gleiche Signale => gleicher Score — die Funktion kennt kein
 * Besucher-Feld.
 */

// Die EINZIGEN zulaessigen Eingabe-Felder (S_objektiv). Kein Identitaets-Feld.
export const ERLAUBTE_SIGNALE = new Set([
  'rate_over_pct', // 0..N: Prozent UEBER der Rate-Schwelle (0 = im Limit)
  'header_anomaly', // bool: fehlende/inkonsistente Header (signals.js)
  'asn_type', // 'datacenter'|'residential'|'mobile'|'business'|'unknown'
  'missing_behavior_token', // bool: uniform ausgeliefertes Verhaltens-Token fehlt
  'waf_severity', // 0..3: hoechste getroffene WAF-Regel-Severity
  'vollkatalog_ratio', // 0.0..1.0: Anteil des Katalogs, den der Schluessel abgriff
]);

export const ASN_TYPEN = new Set([
  'datacenter',
  'residential',
  'mobile',
  'business',
  'unknown',
]);

// Gewichte — MUESSEN mit scoring.py identisch bleiben (Paritaets-Test).
const MAX_RATE = 35;
const W_HEADER = 15;
const W_DATACENTER = 15;
const W_NO_TOKEN = 10;
const W_WAF = {0: 0, 1: 10, 2: 20, 3: 30};
const MAX_VOLLKATALOG = 45;

/**
 * Python-`round()` ist Banker's Rounding (half-to-even); JS `Math.round()`
 * rundet half-up. Fuer bit-genaue Paritaet mit der Python-SSoT wird hier
 * half-to-even nachgebildet (beide Runtimes rechnen IEEE-754 double).
 * @param {number} x  (x >= 0)
 */
function rundeHalbZuGerade(x) {
  const unten = Math.floor(x);
  const rest = x - unten;
  if (rest > 0.5) return unten + 1;
  if (rest < 0.5) return unten;
  return unten % 2 === 0 ? unten : unten + 1;
}

const istBool = (v) => typeof v === 'boolean';
const istZahl = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * Missbrauchs-Score 0..100. Wirft Error bei unbekannten Feldern (INV-2)
 * und bei Werten ausserhalb des Definitionsbereichs. Fehlende Felder = 0.
 * @param {Record<string, unknown>} signale
 * @returns {number}
 */
export function score(signale) {
  if (
    signale === null ||
    typeof signale !== 'object' ||
    Array.isArray(signale)
  ) {
    throw new Error('signale muss ein Objekt sein');
  }
  const unbekannt = Object.keys(signale).filter(
    (k) => !ERLAUBTE_SIGNALE.has(k),
  );
  if (unbekannt.length) {
    throw new Error(
      'unzulaessige Signal-Felder (INV-2, nur S_objektiv erlaubt): ' +
        unbekannt.sort().join(', '),
    );
  }

  let punkte = 0.0;

  const rate = signale.rate_over_pct ?? 0;
  if (!istZahl(rate) || rate < 0) {
    throw new Error('rate_over_pct muss Zahl >= 0 sein');
  }
  // 100% ueber Schwelle = volle Rate-Punkte; darunter linear.
  punkte += MAX_RATE * Math.min(1.0, rate / 100.0);

  const header = signale.header_anomaly ?? false;
  if (!istBool(header)) {
    throw new Error('header_anomaly muss bool sein');
  }
  if (header) punkte += W_HEADER;

  const asnType = signale.asn_type ?? 'unknown';
  if (!ASN_TYPEN.has(asnType)) {
    throw new Error(
      'asn_type muss Netz-TYP aus ' +
        JSON.stringify([...ASN_TYPEN].sort()) +
        ' sein (eine ASN-Nummer/Identitaet ist kein gueltiger Wert, INV-2)',
    );
  }
  if (asnType === 'datacenter') punkte += W_DATACENTER;

  const keinToken = signale.missing_behavior_token ?? false;
  if (!istBool(keinToken)) {
    throw new Error('missing_behavior_token muss bool sein');
  }
  if (keinToken) punkte += W_NO_TOKEN;

  const waf = signale.waf_severity ?? 0;
  if (!Number.isInteger(waf) || !(waf in W_WAF)) {
    throw new Error('waf_severity muss int 0..3 sein');
  }
  punkte += W_WAF[waf];

  const ratio = signale.vollkatalog_ratio ?? 0.0;
  if (!istZahl(ratio) || ratio < 0.0 || ratio > 1.0) {
    throw new Error('vollkatalog_ratio muss 0.0..1.0 sein');
  }
  punkte += MAX_VOLLKATALOG * ratio;

  return Math.min(100, rundeHalbZuGerade(punkte));
}
