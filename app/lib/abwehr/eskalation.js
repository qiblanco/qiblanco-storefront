/**
 * eskalation.js — Score -> Stufe S0..S3 + uniforme Aktion.
 *
 * JS-PORTIERUNG der Python-SSoT `shared-state/sicherheitsmeister/src/eskalation.py`
 * (T1-Kern). Die Python-Version bleibt die Regel-Wahrheit; der Paritaets-Test
 * (scripts/abwehr/paritaet.mjs) beweist die Deckungsgleichheit.
 *
 * INV-1 STRUKTURELL ERZWUNGEN: Eine Aktion beschreibt AUSSCHLIESSLICH
 * Statuscode/Transport (Retry-After, Challenge, befristeter Block). Das
 * Aktions-Objekt hat KEIN 'body'-Feld und KEINEN Content-Transformer — der
 * Abwehr-Layer KANN den Inhalt einer 200-Antwort baulich nicht veraendern.
 *
 * INV-6: stufe() ist eine reine Funktion des Scores — sie kennt keinen
 * Besucher, keinen Hash, keine Identitaet.
 */

// Stufen-Baender (Konzept Kap. 4) — fuer JEDEN Besucher identisch.
const S1_AB = 40;
const S2_AB = 60;
const S3_AB = 80;

// Hysterese: die letzten N Scores muessen die Schwelle halten.
export const HYSTERESE_N = 3;

// Befristung des Temp-Blocks (S3). NIE permanent, NIE IP-Dauerbann.
export const TEMP_BLOCK_MINUTEN = 15;

// Checkout-/Zahlungs-Pfade (Prefix-Match auf den Request-Pfad).
export const CHECKOUT_PFADE = [
  '/checkout',
  '/cart',
  '/warenkorb',
  '/kasse',
  '/pay',
  '/payments',
];

// Die EINZIGEN Felder, die eine Aktion tragen darf (kein 'body'!).
export const AKTION_FELDER = new Set([
  'stufe',
  'typ',
  'status_code',
  'retry_after_s',
  'tarpit_ms',
  'block_minuten',
  'geloggt',
]);
export const AKTION_TYPEN = new Set([
  'none',
  'retry_after_hint',
  'challenge',
  'temp_block',
]);

/**
 * Score -> 'S0'|'S1'|'S2'|'S3'. Rein, besucher-agnostisch (INV-6).
 * @param {number} score
 */
export function stufe(score) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new Error('score muss int 0..100 sein');
  }
  if (score >= S3_AB) return 'S3';
  if (score >= S2_AB) return 'S2';
  if (score >= S1_AB) return 'S1';
  return 'S0';
}

/**
 * Effektive Stufe aus dem Score-VERLAUF (juengster zuletzt): das MINIMUM der
 * letzten HYSTERESE_N Beobachtungen — ueberschreiten UND halten. Ein
 * einzelner Ausreisser eskaliert nicht.
 * @param {number[]} scoreVerlauf
 */
export function stufeMitHysterese(scoreVerlauf) {
  if (!scoreVerlauf || !scoreVerlauf.length) return 'S0';
  const fenster = scoreVerlauf.slice(-HYSTERESE_N);
  return stufe(Math.min(...fenster));
}

/** @param {string} pfad */
function istCheckout(pfad) {
  const pf = (pfad || '').toLowerCase();
  return CHECKOUT_PFADE.some((c) => pf.startsWith(c));
}

/**
 * Uniforme Eskalations-Aktion fuer einen Score (+optional Verlauf/Hysterese).
 * Liefert NUR Transport-Anweisungen — KEIN 'body', KEIN Content (INV-1).
 * Never-block-Checkout: auf Checkout-Pfaden maximal Challenge (S2).
 * @param {number} score
 * @param {string} [pfad]
 * @param {number[]|null} [scoreVerlauf]
 */
export function aktion(score, pfad = '', scoreVerlauf = null) {
  let st =
    scoreVerlauf && scoreVerlauf.length
      ? stufeMitHysterese(scoreVerlauf)
      : stufe(score);

  if (st === 'S3' && istCheckout(pfad)) {
    st = 'S2';
  }

  let a;
  if (st === 'S1') {
    a = {
      stufe: 'S1',
      typ: 'retry_after_hint',
      status_code: 200,
      retry_after_s: 5,
      tarpit_ms: 250,
      block_minuten: 0,
      geloggt: true,
    };
  } else if (st === 'S2') {
    a = {
      stufe: 'S2',
      typ: 'challenge',
      status_code: 429,
      retry_after_s: 30,
      tarpit_ms: 0,
      block_minuten: 0,
      geloggt: true,
    };
  } else if (st === 'S3') {
    a = {
      stufe: 'S3',
      typ: 'temp_block',
      status_code: 503,
      retry_after_s: TEMP_BLOCK_MINUTEN * 60,
      tarpit_ms: 0,
      block_minuten: TEMP_BLOCK_MINUTEN,
      geloggt: true,
    };
  } else {
    a = {
      stufe: 'S0',
      typ: 'none',
      status_code: null,
      retry_after_s: 0,
      tarpit_ms: 0,
      block_minuten: 0,
      geloggt: true,
    };
  }

  const felder = Object.keys(a);
  if (
    felder.length !== AKTION_FELDER.size ||
    !felder.every((f) => AKTION_FELDER.has(f)) ||
    !AKTION_TYPEN.has(a.typ)
  ) {
    throw new Error('interner Fehler: Aktions-Felder verletzen INV-1-Schema');
  }
  return a;
}

/**
 * Wendet den Betriebsmodus auf eine Aktion an (INV-5): shadow (Default) =
 * NUR berechnen/loggen, nach aussen passiert nichts. Erst der explizite
 * Christian-Flip SM_MODE=on macht die Aktion wirksam.
 * @param {ReturnType<typeof aktion>} a
 * @param {string} smMode
 */
export function anwenden(a, smMode) {
  const scharf = smMode === 'on';
  return {
    berechnet: a,
    angewendet: scharf,
    wirk_typ: scharf ? a.typ : 'none',
    wirk_status_code: scharf ? a.status_code : null,
  };
}
