/**
 * kundenpfad.js — die ERLAUB-LANE ("feiner Pfad") fuer legitime Kunden-AI.
 *
 * JS-PORTIERUNG der Python-SSoT `shared-state/sicherheitsmeister/src/kundenpfad.py`
 * (Job 20260729-anti-scraping-feiner-pfad-kunden-ai-guardrail). Die Python-
 * Version bleibt die Regel-Wahrheit; der Paritaets-Test (scripts/abwehr/
 * paritaet.mjs, Kategorien lane_entscheide/lane_deckel/lane_bewerte) beweist
 * die Deckungsgleichheit ueber dieselben Vektoren.
 *
 * WARUM ES DIESE DATEI GIBT (Konzept-Luecke, gemessen 2026-08-01/-04):
 * `SEAM-erlaub-lane.md` §4 schrieb die Integration als EINE Python-Zeile im
 * Storefront-Hook vor. Diese Anleitung war an beiden Enden unbrauchbar: der
 * einzige Pfad, der je einen Storefront-Request sieht, ist DIESER Worker, und
 * es gibt (und kann auf Oxygen geben) keine HTTP-Bruecke JS->Python. Portiert
 * waren `scoring.py`, `eskalation.py`, `signals.py` — die Lane nicht. Die
 * Eskalations-Stelle in `abwehr.js` nahm den ROHEN Score.
 *
 * INV-8 (die tragende Invariante): MONOTONIE. `deckelScore()` ist ein `min()`.
 * Die Lane kann eine Eskalation AUSSCHLIESSLICH SENKEN, niemals anheben. Ein
 * Fehler in dieser Datei kostet Abwehr, niemals einen Kunden.
 *
 * REIN: keine Netz-/Storage-/Zeit-Zugriffe. Die einzige Betriebs-Kante
 * (`capsAusEnv`) ist unten klar markiert und wird von den reinen Funktionen
 * nie aufgerufen.
 */

// ---- Verdikte --------------------------------------------------------------

export const LANE_KUNDE = 'kunden_pfad'; // belegt klein + gezielt -> stark geschuetzt
export const LANE_UNBESTIMMT = 'unbestimmt'; // nichts Belastendes -> mild geschuetzt
export const LANE_BULK = 'bulk'; // Bulk POSITIV belegt -> kein Schutz

export const VERDIKTE = new Set([LANE_KUNDE, LANE_UNBESTIMMT, LANE_BULK]);

// ---- Eingabe-Whitelist (dieselbe Disziplin wie INV-2 in scoring.js) --------
// Identitaet darf NUR als grobe, verifizierte Netz-KLASSE eintreten, nie als
// Roh-IP, nie als User-Agent-String.
export const ERLAUBTE_LANE_SIGNALE = new Set([
  'anfragen', // int >=0
  'distinkte_pfade', // int >=0
  'katalog_ratio', // 0.0..1.0
  'intent_ratio', // 0.0..1.0
  'sweep_marker', // bool
  'tage_aktiv', // int >=1
  'evasion', // bool
  'netz_klasse', // str (Bonus, optional)
]);

// Vokabular von `netzherkunft.py`. Bewusst als Literale gefuehrt statt
// importiert — diese Lane darf nicht ausfallen, wenn das Netz-Modul fehlt.
// Ein unbekannter Wert ist ein Fehler, kein stiller Durchlauf.
export const NETZ_KLASSEN = new Set([
  'good_bot',
  'bot_behauptet',
  'cdn_proxy',
  'rechenzentrum',
  'endkunde',
  'unbestimmt',
]);

// ---- Schwellen — Kunden-Pfad (ALLE muessen erfuellt sein) ------------------
// EHRLICH: begruendete Startwerte, keine kalibrierten Schwellen (Forschungs-
// Frage `erlaub-lane-schwellen-kalibrierung`). INV-8 macht Fehl-Schwellen in
// der Richtung ungefaehrlich, die zaehlt: zu grosszuegig = weniger Abwehr.
export const KUNDE_MAX_ANFRAGEN = 12;
export const KUNDE_MAX_PFADE = 8;
export const KUNDE_MAX_KATALOG = 0.25;
export const KUNDE_MIN_INTENT = 0.6;

// ---- Schwellen — Bulk (EINE genuegt: positive Evidenz) ---------------------
export const BULK_KATALOG = 0.5;
export const BULK_PFADE = 40;
export const BULK_SWEEP_ANFRAGEN = 30;
export const BULK_TAGE = 3;
export const BULK_TAGE_KATALOG = 0.25;

// ---- Stufen-Deckel je Verdikt ---------------------------------------------
//   kunden_pfad -> hoechstens S1: Drosseln mit Status 200 ist erlaubt, ein
//                  429/503 NIE. Eine Kunden-AI bekommt nie einen Statuscode,
//                  aus dem sie sich nicht selbst befreien kann.
//   unbestimmt  -> hoechstens S2: Challenge erlaubt, harter Block nie.
//   bulk        -> kein Deckel.
export const STANDARD_DECKEL = {
  [LANE_KUNDE]: 'S1',
  [LANE_UNBESTIMMT]: 'S2',
  [LANE_BULK]: null,
};

// ---------------------------------------------------------------------------
// Python-kompatible Formatierung (Paritaets-kritisch)
// ---------------------------------------------------------------------------
/**
 * Bildet Pythons `f"{x:.2f}"` nach: Rundung des EXAKTEN Binaerwerts,
 * half-to-EVEN. `Number.prototype.toFixed` rundet half-UP und weicht damit
 * genau dort ab, wo ein Gleichstand exakt darstellbar ist — also bei
 * x = j/8 (0.125, 0.375, 0.625, 0.875). `katalog_ratio = 10/80 = 0.125` ist
 * ein voellig realistischer Wert, die Abweichung waere also kein Randfall,
 * sondern Betrieb. `toFixed(20)` liefert fuer diese Groessenordnung die
 * exakte Dezimal-Expansion, an der sich der Gleichstand erkennen laesst.
 * @param {number} x  0.0..1.0
 */
export function fmt2(x) {
  const roh = x.toFixed(20); // "0.12500000000000000000"
  const [ganz, nach = ''] = roh.split('.');
  const behalten = nach.slice(0, 2).padEnd(2, '0');
  const rest = nach.slice(2);
  const ersteRest = rest.charCodeAt(0) - 48; // NaN-sicher: '' -> negativ
  let aufrunden;
  if (!(ersteRest >= 0)) {
    aufrunden = false;
  } else if (ersteRest > 5) {
    aufrunden = true;
  } else if (ersteRest < 5) {
    aufrunden = false;
  } else if (/[1-9]/.test(rest.slice(1))) {
    aufrunden = true; // > Gleichstand
  } else {
    aufrunden = (behalten.charCodeAt(1) - 48) % 2 === 1; // half-to-even
  }
  let n = parseInt(ganz, 10) * 100 + parseInt(behalten, 10);
  if (aufrunden) n += 1;
  return `${Math.floor(n / 100)}.${String(n % 100).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Stufen-Baender: aus eskalation.stufe() HERGELEITET, nicht dupliziert.
// Verschiebt jemand die Baender, wandert dieser Deckel automatisch mit — die
// Naht heilt sich selbst, statt still zu driften.
// ---------------------------------------------------------------------------
import {stufe as eskalationStufe} from './eskalation.js';

/**
 * Groesster Score, der noch hoechstens `maxStufe` ergibt.
 * Der Ersatzpfad entspricht dem Stand 2026-07-29 und ist im Zweifel zu
 * NIEDRIG, also ueber-schuetzend — die sichere Richtung (INV-8).
 * @param {string} maxStufe
 */
export function hoechsterScoreFuer(maxStufe) {
  try {
    let best = null;
    for (let s = 0; s <= 100; s++) {
      if (eskalationStufe(s) <= maxStufe) best = s;
    }
    if (best !== null) return best;
  } catch {
    // Ersatzpfad unten.
  }
  const ersatz = {S0: 39, S1: 59, S2: 79, S3: 100};
  return maxStufe in ersatz ? ersatz[maxStufe] : 100;
}

/** True, wenn die Deckel aus eskalation.stufe() stammen (nicht aus Ersatz). */
export function baenderHergeleitet() {
  try {
    return eskalationStufe(0) === 'S0';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Verdikt
// ---------------------------------------------------------------------------

const istEchtInt = (v) => typeof v === 'number' && Number.isInteger(v);
const istEchtZahl = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * Validiert die Lane-Signale (Whitelist + Wertebereiche) und fuellt auf.
 * @param {Record<string, unknown>} signale
 */
function pruefeSignale(signale) {
  if (!signale || typeof signale !== 'object' || Array.isArray(signale)) {
    throw new Error('signale muss ein dict sein');
  }
  const unbekannt = Object.keys(signale)
    .filter((k) => !ERLAUBTE_LANE_SIGNALE.has(k))
    .sort();
  if (unbekannt.length) {
    throw new Error(
      'unzulaessige Lane-Signal-Felder (nur Verhalten + grobe Netz-Klasse; ' +
        'keine Roh-IP, kein User-Agent-String): ' +
        unbekannt.join(', '),
    );
  }

  /** @type {Record<string, any>} */
  const s = {};

  for (const [feld, minimum] of [
    ['anfragen', 0],
    ['distinkte_pfade', 0],
    ['tage_aktiv', 1],
  ]) {
    const wert = feld in signale ? signale[feld] : minimum;
    if (!istEchtInt(wert) || wert < minimum) {
      throw new Error(`${feld} muss int >= ${minimum} sein`);
    }
    s[feld] = wert;
  }

  for (const feld of ['katalog_ratio', 'intent_ratio']) {
    const wert = feld in signale ? signale[feld] : 0.0;
    if (!istEchtZahl(wert) || !(wert >= 0.0 && wert <= 1.0)) {
      throw new Error(`${feld} muss 0.0..1.0 sein`);
    }
    s[feld] = wert;
  }

  for (const feld of ['sweep_marker', 'evasion']) {
    const wert = feld in signale ? signale[feld] : false;
    if (typeof wert !== 'boolean') throw new Error(`${feld} muss bool sein`);
    s[feld] = wert;
  }

  const netz = 'netz_klasse' in signale ? signale.netz_klasse : 'unbestimmt';
  if (!NETZ_KLASSEN.has(netz)) {
    throw new Error(
      `netz_klasse muss aus ${JSON.stringify([...NETZ_KLASSEN].sort())} sein ` +
        '(eine Roh-IP oder ein User-Agent-String ist kein gueltiger Wert)',
    );
  }
  s.netz_klasse = netz;
  return s;
}

/** Positive Bulk-Evidenz. Leere Liste = KEIN Bulk-Verdikt (konservativ). */
function bulkBelegt(s) {
  const gruende = [];
  if (s.evasion) gruende.push('evasion (UA-Rotation/robots-Verstoss/Honeypot)');
  if (s.katalog_ratio >= BULK_KATALOG) {
    gruende.push(`katalog_ratio ${fmt2(s.katalog_ratio)} >= ${BULK_KATALOG}`);
  }
  if (s.distinkte_pfade >= BULK_PFADE) {
    gruende.push(`distinkte_pfade ${s.distinkte_pfade} >= ${BULK_PFADE}`);
  }
  if (s.sweep_marker && s.anfragen >= BULK_SWEEP_ANFRAGEN) {
    gruende.push(
      `sweep_marker + ${s.anfragen} Anfragen >= ${BULK_SWEEP_ANFRAGEN}`,
    );
  }
  if (s.tage_aktiv >= BULK_TAGE && s.katalog_ratio >= BULK_TAGE_KATALOG) {
    gruende.push(
      `${s.tage_aktiv} Tage aktiv bei katalog_ratio ` +
        `${fmt2(s.katalog_ratio)} >= ${BULK_TAGE_KATALOG}`,
    );
  }
  return gruende;
}

/** Positive Kunden-Evidenz (ALLE Bedingungen). Leere Liste = nicht belegt. */
function kundeBelegt(s) {
  if (s.anfragen > KUNDE_MAX_ANFRAGEN) return [];
  if (s.distinkte_pfade > KUNDE_MAX_PFADE) return [];
  if (s.katalog_ratio > KUNDE_MAX_KATALOG) return [];
  if (s.sweep_marker) return [];
  if (s.intent_ratio < KUNDE_MIN_INTENT) return [];
  return [
    `${s.anfragen} Anfragen auf ${s.distinkte_pfade} Pfaden, ` +
      `katalog_ratio ${fmt2(s.katalog_ratio)}, ` +
      `intent_ratio ${fmt2(s.intent_ratio)}, kein Sweep`,
  ];
}

function verdiktObjekt(lane, begruendung, s, gruende) {
  if (!VERDIKTE.has(lane)) throw new Error('interner Fehler: unbekannte Lane');
  return {
    lane,
    begruendung,
    belege: gruende,
    max_stufe: STANDARD_DECKEL[lane],
    signale: s,
  };
}

/**
 * Lane-Verdikt aus VOLUMEN + BREITE + INTENT + MUSTER (+ Identitaets-Bonus).
 *
 * Reihenfolge ist bedeutungstragend:
 *   1. EVASION schlaegt alles.
 *   2. VERIFIZIERTE Assistenz/Suchmaschine (`good_bot`) ist geschuetzt, auch
 *      bei Breite.  ACHTUNG (Oxygen): dieser Zweig ist HIER UNERREICHBAR —
 *      `netz_klasse` kann im Worker nicht bestimmt werden und ist immer
 *      'unbestimmt' (siehe kundenpfad_signale.js, NICHT_HERLEITBAR). Der
 *      Zweig bleibt portiert, damit die Paritaet zur SSoT vollstaendig ist.
 *   3. Positive BULK-Evidenz -> kein Schutz.
 *   4. Positive KUNDEN-Evidenz -> voller Schutz.
 *   5. Sonst `unbestimmt` -> milder Schutz. Nichtwissen fuehrt NIE nach bulk.
 * @param {Record<string, unknown>} signale
 */
export function entscheide(signale) {
  const s = pruefeSignale(signale);

  if (s.evasion) {
    return verdiktObjekt(
      LANE_BULK,
      'evasion belegt — schlaegt jede Identitaet',
      s,
      bulkBelegt(s),
    );
  }

  if (s.netz_klasse === 'good_bot') {
    return verdiktObjekt(
      LANE_KUNDE,
      'verifizierte Netz-Klasse good_bot (Assistenz/Suchmaschine); ' +
        'Mengen-Steuerung gehoert hier zu robots.txt/TDMRep, nicht zum Block',
      s,
      [],
    );
  }

  const bulk = bulkBelegt(s);
  if (bulk.length) {
    return verdiktObjekt(LANE_BULK, 'Bulk positiv belegt', s, bulk);
  }

  const kunde = kundeBelegt(s);
  if (kunde.length) {
    return verdiktObjekt(LANE_KUNDE, 'Kunden-Muster positiv belegt', s, kunde);
  }

  return verdiktObjekt(
    LANE_UNBESTIMMT,
    'weder Kunden- noch Bulk-Muster belegt — konservativ geschuetzt ' +
      '(im Zweifel NICHT blocken)',
    s,
    [],
  );
}

// ---------------------------------------------------------------------------
// Der monotone Daempfer — DIE Stelle, die der Vollzugs-Pfad braucht.
// ---------------------------------------------------------------------------
/**
 * Deckelt einen Missbrauchs-Score gemaess Lane-Verdikt. STRENG MONOTON:
 * die Rueckgabe ist IMMER <= `score` (INV-8).
 * @param {number} score
 * @param {string} lane
 * @param {string|null} [maxStufe] weglassen = Standard-Deckel des Verdikts,
 *        `null` schaltet den Deckel ab (Bulk).
 */
export function deckelScore(score, lane, maxStufe = '__standard__') {
  if (!istEchtInt(score) || score < 0 || score > 100) {
    throw new Error('score muss int 0..100 sein');
  }
  if (!VERDIKTE.has(lane)) {
    throw new Error(`lane muss aus ${JSON.stringify([...VERDIKTE].sort())} sein`);
  }

  let ms = maxStufe;
  if (ms === '__standard__') ms = STANDARD_DECKEL[lane];
  if (ms === null) return score;
  if (!['S0', 'S1', 'S2', 'S3'].includes(ms)) {
    throw new Error("max_stufe muss None oder 'S0'..'S3' sein");
  }
  return Math.min(score, hoechsterScoreFuer(ms));
}

/**
 * Komfort-Fassade: Verdikt + gedeckelter Score in einem Aufruf.
 * @param {number} score
 * @param {Record<string, unknown>} signale
 * @param {Record<string, string|null>|null} [caps] Deckel je Lane ueberschreiben
 */
export function bewerte(score, signale, caps = null) {
  const v = entscheide(signale);
  const quelle = caps || STANDARD_DECKEL;
  const deckel = v.lane in quelle ? quelle[v.lane] : STANDARD_DECKEL[v.lane];
  const neu = deckelScore(score, v.lane, deckel);
  v.score_vorher = score;
  v.score_nachher = neu;
  v.gedaempft_um = score - neu;
  v.max_stufe = deckel;
  return v;
}

// ---------------------------------------------------------------------------
// Betriebs-Kante (das EINZIGE Env-Lesen dieser Datei; die reinen Funktionen
// oben rufen das nie auf).
// ---------------------------------------------------------------------------

/**
 * Kill-Switch `SM_ERLAUB_LANE`. Bei ABWESENHEIT AN (Muster INV-4): das Fehlen
 * einer Env-Zeile darf einen SCHUTZ nicht still abschalten.
 *
 * WARUM DAS HIER EINEN AUFRUFER HAT: auf der Python-Seite ist `lane_aktiv()`
 * ein Kill-Switch ohne Enforcer — die Funktion hat im ganzen Modul genau ein
 * Vorkommen, ihre eigene Definition (repair-Fall `…:killswitch`). Wer dort
 * `off` setzt, glaubt die Lane sei aus, und sie daempft weiter. Damit sich
 * das im JS-Port nicht wiederholt, ruft `abwehr.js` diese Funktion an der
 * einzigen Einbau-Stelle auf, und `scripts/abwehr/lane-test.mjs` beweist
 * dass `off` wirklich nicht daempft.
 * @param {Record<string, string|undefined>} env
 */
export function laneAktiv(env) {
  return String(env?.SM_ERLAUB_LANE ?? 'on').toLowerCase() !== 'off';
}

/**
 * Deckel je Lane aus der Env (Default = STANDARD_DECKEL).
 * @param {Record<string, string|undefined>} env
 */
export function capsAusEnv(env) {
  const caps = {...STANDARD_DECKEL};
  for (const [lane, key] of [
    [LANE_KUNDE, 'SM_LANE_KUNDE_MAX_STUFE'],
    [LANE_UNBESTIMMT, 'SM_LANE_UNBESTIMMT_MAX_STUFE'],
  ]) {
    const wert = String(env?.[key] ?? '')
      .trim()
      .toUpperCase();
    if (['S0', 'S1', 'S2', 'S3'].includes(wert)) caps[lane] = wert;
    else if (wert === 'NONE' || wert === 'AUS') caps[lane] = null;
  }
  return caps;
}
