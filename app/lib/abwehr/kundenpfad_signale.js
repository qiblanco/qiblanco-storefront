/**
 * kundenpfad_signale.js — Lane-Signale aus einem Abruf-Verlauf ableiten.
 *
 * JS-PORTIERUNG der Python-SSoT
 * `shared-state/sicherheitsmeister/src/kundenpfad_signale.py`.
 * Die Python-Version bleibt Regel-Wahrheit; Paritaets-Test:
 * scripts/abwehr/paritaet.mjs, Kategorie `lane_signale`.
 *
 * WARUM DIE ABLEITUNG NEBEN DER LANE STEHT und nicht im Vollzugs-Pfad: die
 * Ableitung ist der Ort, an dem man aus Versehen Identitaet einschmuggelt
 * ("diese IP kennen wir doch"). Sie gehoert deshalb unter dieselbe Whitelist-
 * Disziplin — `ausVerlauf()` gibt AUSSCHLIESSLICH Felder aus
 * `ERLAUBTE_LANE_SIGNALE` zurueck.
 *
 * ---------------------------------------------------------------------------
 * WAS AUF OXYGEN EHRLICH NICHT HERLEITBAR IST  (der Kern dieser Datei)
 * ---------------------------------------------------------------------------
 * Der Worker hat kein KV, kein Durable Object, keine Platte, kein ausgehendes
 * TCP im Request-Pfad und keinen ASN-/Reverse-DNS-Zugriff. Drei der acht
 * Lane-Signale sind damit baulich unbestimmbar. Sie werden hier NICHT
 * erfunden, sondern auf ihren konservativen Wert gesetzt und in
 * `NICHT_HERLEITBAR` benannt, damit der Shadow-Log und jede spaetere
 * Kalibrierung wissen, welche Achse gar nicht gemessen wurde:
 *
 *   netz_klasse  -> 'unbestimmt'  kein Reverse-DNS/FCrDNS, kein ASN-Header.
 *                   FOLGE: der good_bot-Zweig in kundenpfad.entscheide() ist
 *                   auf Oxygen UNERREICHBAR. Die Lane schuetzt hier
 *                   ausschliesslich ueber VERHALTEN. Ein verifizierter
 *                   Good-Bot mit breitem Durchlauf faellt auf 'bulk' und
 *                   bekommt keinen Deckel — deklarierte Grenze, siehe
 *                   SEAM-erlaub-lane.md §4.
 *   tage_aktiv   -> 1             der Besucher-Schluessel ist tages-gesalzen
 *                   (abwehr.js: `salzFuerTag`, `zustand.clear()` bei
 *                   Tagesrotation). Ein Schluessel kann eine Tagesgrenze
 *                   baulich nicht ueberleben, "an wie vielen Tagen gesehen"
 *                   ist im Worker also immer 1. Das ist der PERMISSIVE Wert
 *                   (Bulk verlangt >= 3) — INV-8-konform.
 *   evasion      -> false         UA-Rotation ist unsichtbar, weil der UA
 *                   TEIL des Schluessels ist: wer den UA wechselt, bekommt
 *                   einen frischen Schluessel mit leerem Verlauf. robots.txt-
 *                   Verstoesse und Honeypots werden im Worker nicht verfolgt.
 *                   Ebenfalls der permissive Wert.
 *
 * Alle drei fehlen in der Richtung "weniger Abwehr, nie ein getroffener
 * Kunde" (INV-8). Das ist Absicht: `unbestimmt` deckelt immer noch den harten
 * Block weg, und Nichtwissen fuehrt nie nach `bulk`.
 *
 * REIN, kein I/O.
 */

/** Signale, die der Oxygen-Worker baulich nicht bestimmen kann. */
export const NICHT_HERLEITBAR = Object.freeze({
  netz_klasse: 'kein Reverse-DNS/ASN im Worker (good_bot-Zweig unerreichbar)',
  tage_aktiv: 'Schluessel ist tages-gesalzen und ueberlebt keine Tagesgrenze',
  evasion: 'UA-Rotation erzeugt einen neuen Schluessel; kein robots/Honeypot-Tracking',
});

// Pfad-Praefixe, die KAUF-/INFO-INTENT tragen (Achse INTENT).
export const INTENT_PRAEFIXE = [
  '/products',
  '/produkte',
  '/collections',
  '/kollektionen',
  '/pages',
  '/seiten',
  '/blogs',
  '/blog',
  '/cart',
  '/warenkorb',
  '/checkout',
  '/kasse',
  '/search',
  '/suche',
];

// Pfade, die einen systematischen Durchlauf verraten (Achse INTENT/MUSTER).
export const SWEEP_MARKER = [
  '/sitemap',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/feed',
  '/rss',
  '/atom',
  '/products.json',
  '/collections.json',
  '/cart.js',
  '/admin',
  '/wp-',
  '/.env',
  '/.git',
];

// Query-Parameter, die auf paginiertes Abgrasen hindeuten.
export const SWEEP_PARAMETER = ['page=', 'cursor=', 'offset=', 'limit=', 'after='];

/**
 * Bildet Pythons `int(str)` nach — bewusst STRIKT: `parseInt` wuerde "3abc"
 * als 3 lesen, Python wirft dort. Ein grosszuegigerer Parser wuerde hier
 * Sweeps erfinden, die keine sind.
 * @param {string} text
 * @returns {number|null} null = Python haette ValueError geworfen
 */
function pythonInt(text) {
  const t = String(text).trim();
  // Python erlaubt Unterstriche als Tausender-Trenner zwischen Ziffern.
  if (!/^[+-]?\d(?:_?\d)*$/.test(t)) return null;
  const n = Number(t.replace(/_/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** @param {string} pfad */
export function istIntent(pfad) {
  const p = String(pfad || '').toLowerCase();
  return INTENT_PRAEFIXE.some((x) => p.startsWith(x));
}

/** @param {string} pfad */
export function istSweep(pfad) {
  const p = String(pfad || '').toLowerCase();
  if (SWEEP_MARKER.some((x) => p.includes(x))) return true;
  // Paginierung zaehlt erst ab Seite 3 als Sweep — Seite 1/2 blaettert auch
  // ein Mensch durch.
  for (const param of SWEEP_PARAMETER) {
    const i = p.indexOf(param);
    if (i === -1) continue;
    const wert = p.slice(i + param.length).split('&', 1)[0];
    const n = pythonInt(wert);
    if (n !== null && n >= 3) return true;
  }
  return false;
}

/**
 * Leitet die Lane-Signale aus einem Abruf-Verlauf ab.
 *
 * `abrufe` ist eine Sequenz von [pfad, tag]-Paaren oder von Objekten mit den
 * Schluesseln `pfad` und `tag`. `tag` ist ein beliebiger Tages-Marker — nur
 * seine DISTINKTHEIT zaehlt, nie sein Wert.
 *
 * Ein leerer Verlauf ergibt neutrale Signale -> Verdikt 'unbestimmt'
 * (konservativ geschuetzt, nie 'bulk').
 *
 * @param {Iterable<any>} abrufe
 * @param {number} [katalogGroesse]
 * @param {string} [netzKlasse]
 * @param {boolean} [evasion]
 */
export function ausVerlauf(
  abrufe,
  katalogGroesse = 60,
  netzKlasse = 'unbestimmt',
  evasion = false,
) {
  const pfade = [];
  const tage = new Set();
  for (const eintrag of abrufe || []) {
    let pfad;
    let tag;
    if (eintrag && typeof eintrag === 'object' && !Array.isArray(eintrag)) {
      pfad = 'pfad' in eintrag ? eintrag.pfad : '';
      tag = 'tag' in eintrag ? eintrag.tag : '';
    } else {
      const liste = [...(eintrag || []), '', ''];
      pfad = liste[0];
      tag = liste[1];
    }
    pfade.push(String(pfad));
    if (tag) tage.add(String(tag));
  }

  const n = pfade.length;
  if (n === 0) {
    return {
      anfragen: 0,
      distinkte_pfade: 0,
      katalog_ratio: 0.0,
      intent_ratio: 0.0,
      sweep_marker: false,
      tage_aktiv: 1,
      evasion: Boolean(evasion),
      netz_klasse: netzKlasse,
    };
  }

  const distinkt = new Set(pfade).size;
  const groesse = Math.max(1, Math.trunc(katalogGroesse));
  const intent = pfade.filter((p) => istIntent(p)).length;

  return {
    anfragen: n,
    distinkte_pfade: distinkt,
    // Breite wird an DISTINKTEN Pfaden gemessen, nicht an Abrufen: wer
    // dieselbe Produktseite zehnmal laedt, grast nichts ab.
    katalog_ratio: Math.min(1.0, distinkt / groesse),
    intent_ratio: intent / n,
    sweep_marker: pfade.some((p) => istSweep(p)),
    tage_aktiv: Math.max(1, tage.size),
    evasion: Boolean(evasion),
    netz_klasse: netzKlasse,
  };
}

// ---------------------------------------------------------------------------
// Worker-Adapter — aus dem, was der Isolate-Zustand REAL hat
// ---------------------------------------------------------------------------

/** Deckel fuer die Pfad-Menge je Schluessel (128-MB-Isolate). */
export const LANE_MAX_PFADE_GEMERKT = 64;

/**
 * Baut die Lane-Signale aus dem Lane-Fenster eines Schluessels.
 *
 * Zwei bewusste Kopplungen:
 *
 *  (a) `katalog_ratio` kommt aus DERSELBEN Groesse, die der Score als
 *      `vollkatalog_ratio` sieht (`st.katalog`/`katalogGroesse`). Score und
 *      Lane koennen ueber "Breite" damit baulich nicht verschiedener Meinung
 *      sein — genau die Drift, an der solche Naehte sonst reissen.
 *  (b) `LANE_MAX_PFADE_GEMERKT` saettigt bei 64 und damit OBERHALB von
 *      `BULK_PFADE` (40). Ein saturierter Zaehler faellt also nach `bulk` =
 *      weniger Schutz, nie mehr — die INV-8-sichere Richtung.
 *
 * @param {{lane?: {anfragen:number, pfade:Set<string>, intent:number,
 *          sweep:boolean}}} st Isolate-Zustand des Schluessels
 * @param {number} katalogRatio bereits berechnete Vollkatalog-Ratio (Score-Sicht)
 */
export function ausWorkerZustand(st, katalogRatio) {
  const l = st?.lane;
  const anfragen = l?.anfragen || 0;
  if (!anfragen) {
    return {
      anfragen: 0,
      distinkte_pfade: 0,
      katalog_ratio: 0.0,
      intent_ratio: 0.0,
      sweep_marker: false,
      tage_aktiv: 1,
      evasion: false,
      netz_klasse: 'unbestimmt',
    };
  }
  return {
    anfragen,
    distinkte_pfade: l.pfade.size,
    katalog_ratio: Math.max(0, Math.min(1, katalogRatio || 0)),
    intent_ratio: Math.max(0, Math.min(1, l.intent / anfragen)),
    sweep_marker: Boolean(l.sweep),
    // --- ab hier: NICHT_HERLEITBAR, konservativ gesetzt (siehe Kopf) -------
    tage_aktiv: 1,
    evasion: false,
    netz_klasse: 'unbestimmt',
  };
}
