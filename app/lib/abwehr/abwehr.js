/**
 * abwehr.js — Sicherheitsmeister T2: Abwehr-Vorfilter fuer den Oxygen-Worker
 * (Job 20260715-abwehr-scraping-content-schutz-deepdive, Segment s04).
 *
 * BINDENDE LEITPLANKE (Anti-Cloaking, INV-1): dieser Layer aendert
 * AUSSCHLIESSLICH den HTTP-Statuscode / die Challenge-Antwort. Er schreibt
 * NIEMALS den body einer 200-Antwort um und verzweigt NIE nach
 * Besucher-Attribut. Score nur aus objektiven Signalen (INV-2, scoring.js).
 * Challenge-/Block-Seiten sind Konstanten — fuer JEDEN Besucher identisch.
 *
 * BETRIEBSMODI (env.SM_MODE):
 *   fehlend/'shadow'  -> SHADOW (Default): Verdikte werden nur berechnet und
 *                        als structured console.log in den Oxygen-Log-Drain
 *                        geschrieben. Nach aussen passiert NICHTS.
 *   'on'              -> scharf (Christian-Flip, siehe LIVEFLIP.md).
 *   'off'             -> Kill-Switch: kompletter Passthrough, keine Rechnung,
 *                        kein Log.
 *
 * NEVER-BREAK (homepage-bauer F-002): der gesamte Vorfilter laeuft in
 * try/catch — jeder Fehler fuehrt zum normalen Passthrough. Ein Abwehr-Bug
 * darf den Shop nie brechen.
 *
 * STATE (ehrlich best-effort, Konzept F-2): Oxygen/workerd hat kein KV/DO.
 * Rate-/Katalog-Fenster leben in-memory pro Isolate; zusaetzlich haelt die
 * Cache API ein schwaches per-Datacenter-Minuten-Aggregat. Die harte globale
 * Grenze bleibt Shopifys Layer-1-Bot-Mitigation.
 *
 * PRIVACY (INV-3): Schluessel = SHA-256(ip|ua|utc-tag|isolate-salt)[:16].
 * Der Salt ist per-Isolate-zufaellig und rotiert taeglich; es gibt keine
 * Platte — nichts wird persistiert, geloggt wird nur das Hash-Praefix.
 */

import {score as scoreBerechnen} from './scoring.js';
import {aktion as aktionBerechnen, HYSTERESE_N} from './eskalation.js';
import {headerSignale, pfadSignale, vollkatalogRatio} from './signals.js';
import {bewerte as laneBewerte, capsAusEnv, laneAktiv} from './kundenpfad.js';
import {
  ausWorkerZustand,
  istIntent,
  istSweep,
  LANE_MAX_PFADE_GEMERKT,
} from './kundenpfad_signale.js';

// ---- Konfiguration (env-overridebar, Defaults konservativ) -----------------

const RATE_FENSTER_MS = 60_000; // Sliding-Window fuer die Rate
const RATE_LIMIT_DEFAULT = 120; // zaehlbare Requests/min pro Schluessel
const KATALOG_FENSTER_MS = 600_000; // Fenster des Vollkatalog-Detektors
const KATALOG_N_DEFAULT = 80; // angenommene Katalog-Groesse (distinct URLs)
const MAX_SCHLUESSEL = 2000; // Memory-Deckel (128-MB-Isolate)
const KATALOG_PRAEFIXE = ['/products/', '/pages/'];
const ASSET_RE =
  /\.(js|mjs|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|txt|xml|json|webmanifest)$/i;

// ---- In-Memory-State (pro Isolate; F-2 ehrlich: best-effort) ---------------

// Beobachtungsfenster der Erlaub-Lane. BEWUSST identisch mit
// KATALOG_FENSTER_MS: `katalog_ratio` (Lane) und `vollkatalog_ratio` (Score)
// sind DIESELBE Groesse — verschiedene Fenster wuerden Score und Lane ueber
// "Breite" verschiedener Meinung sein lassen.
const LANE_FENSTER_MS = KATALOG_FENSTER_MS;

/**
 * @typedef {{anfragen: number, pfade: Set<string>, intent: number,
 *            sweep: boolean, seit: number}} LaneState
 */
/**
 * @typedef {{fenster: number[], katalog: Set<string>, verlauf: number[],
 *            zuletzt: number, lane: LaneState}} KeyState
 */
/** @type {Map<string, KeyState>} */
const zustand = new Map();
let salz = {tag: '', wert: ''};

function utcTag(jetzt) {
  return new Date(jetzt).toISOString().slice(0, 10);
}

function salzFuerTag(jetzt) {
  const tag = utcTag(jetzt);
  if (salz.tag !== tag) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    salz = {
      tag,
      wert: [...b].map((x) => x.toString(16).padStart(2, '0')).join(''),
    };
    // Tagesrotation: alte Schluessel sind ohnehin nicht mehr adressierbar.
    zustand.clear();
  }
  return salz.wert;
}

/** Tages-gesalzener Besucher-Schluessel, 16 hex (Muster receiver/basis.py). */
async function besucherSchluessel(request, jetzt) {
  const ip =
    request.headers.get('oxygen-buyer-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '';
  const ua = request.headers.get('user-agent') || '';
  const roh = `${ip}|${ua}|${utcTag(jetzt)}|${salzFuerTag(jetzt)}`;
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(roh),
  );
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

/** @returns {LaneState} */
function leeresLaneFenster(jetzt) {
  return {anfragen: 0, pfade: new Set(), intent: 0, sweep: false, seit: jetzt};
}

/**
 * Traegt einen Abruf ins Lane-Fenster ein (Achsen VOLUMEN/BREITE/INTENT/MUSTER).
 * Der Schluessel ist Pfad + Query: `?page=7` ist ein anderer Abruf als
 * `?page=1`, und die Sweep-Erkennung braucht den Query ohnehin.
 * @param {LaneState} l
 */
function laneErfassen(l, pfadMitQuery, jetzt) {
  if (jetzt - l.seit > LANE_FENSTER_MS) {
    const frisch = leeresLaneFenster(jetzt);
    l.anfragen = frisch.anfragen;
    l.pfade = frisch.pfade;
    l.intent = frisch.intent;
    l.sweep = frisch.sweep;
    l.seit = jetzt;
  }
  l.anfragen += 1;
  // Memory-Deckel: die Menge saettigt OBERHALB von BULK_PFADE (40), ein
  // saturierter Zaehler faellt also nach `bulk` = weniger Schutz, nie mehr.
  if (l.pfade.size < LANE_MAX_PFADE_GEMERKT) l.pfade.add(pfadMitQuery);
  if (istIntent(pfadMitQuery)) l.intent += 1;
  if (istSweep(pfadMitQuery)) l.sweep = true;
}

/** @returns {KeyState} */
function keyState(schluessel, jetzt) {
  let st = zustand.get(schluessel);
  if (!st) {
    if (zustand.size >= MAX_SCHLUESSEL) {
      // Memory-Deckel: aeltesten Eintrag verdraengen (LRU-artig).
      let aeltester = null;
      let aeltesteZeit = Infinity;
      for (const [k, v] of zustand) {
        if (v.zuletzt < aeltesteZeit) {
          aeltesteZeit = v.zuletzt;
          aeltester = k;
        }
      }
      if (aeltester) zustand.delete(aeltester);
    }
    st = {
      fenster: [],
      katalog: new Set(),
      verlauf: [],
      zuletzt: jetzt,
      lane: leeresLaneFenster(jetzt),
    };
    zustand.set(schluessel, st);
  }
  st.zuletzt = jetzt;
  return st;
}

function intAusEnv(env, name, fallback) {
  const v = parseInt(env?.[name], 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// ---- Cache-API-Aggregat (best-effort, per-Datacenter; Konzept F-2) ---------

async function cacheAggregat(schluessel, inMemoryZahl, jetzt, ctx) {
  // Nur bemuehen, wenn die lokale Zahl schon auffaellig ist (Kostenpfad).
  try {
    if (typeof caches === 'undefined' || !caches.default) return inMemoryZahl;
    const minute = Math.floor(jetzt / 60_000);
    const url = `https://sm-abwehr.internal/agg/${schluessel}/${minute}`;
    const alt = await caches.default.match(url);
    const altZahl = alt ? parseInt(await alt.text(), 10) || 0 : 0;
    const neu = Math.max(altZahl, 0) + 1;
    const put = caches.default.put(
      url,
      new Response(String(neu), {
        headers: {'Cache-Control': 'public, max-age=120'},
      }),
    );
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(put);
    return Math.max(inMemoryZahl, neu);
  } catch {
    return inMemoryZahl; // best-effort: Cache-Fehler ist kein Abwehr-Fehler
  }
}

// ---- Signal-Sammlung + Verdikt ---------------------------------------------

function cookieWert(request, name) {
  const roh = request.headers.get('cookie') || '';
  for (const teil of roh.split(';')) {
    const [k, ...rest] = teil.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

function modus(env) {
  const m = (env?.SM_MODE || '').toLowerCase();
  if (m === 'on') return 'on';
  if (m === 'off') return 'off';
  return 'shadow';
}

/**
 * Bewertet einen Request. Liefert das Verdikt — blockiert selbst NICHTS.
 * @param {Request} request
 * @param {Record<string, string|undefined>} env
 * @param {{waitUntil?: Function}} [ctx]
 * @param {Record<string, unknown>} [testSignale] NUR fuer Tests: ersetzt die
 *        gesammelten Signale (die Entscheidungs-/Antwort-Kette bleibt echt).
 * @param {Record<string, unknown>} [testLaneSignale] NUR fuer Tests: ersetzt
 *        die aus dem Isolate-Zustand abgeleiteten LANE-Signale. Symmetrisch zu
 *        `testSignale` — ein Test, der eine bestimmte Eskalations-Stufe
 *        erzwingen will, muss die Lane-Lage explizit benennen statt sie zu
 *        umgehen (`{evasion: true}` = bulk = kein Deckel).
 */
export async function pruefe(request, env, ctx, testSignale, testLaneSignale) {
  const jetzt = Date.now();
  const url = new URL(request.url);
  const pfad = url.pathname;

  const schluessel = await besucherSchluessel(request, jetzt);
  const st = keyState(schluessel, jetzt);

  // Challenge bestanden (qb_ch, gesetzt von der uniformen Challenge-Seite):
  // Score-Reset — Fenster/Verlauf des Schluessels werden geleert (Konzept 4).
  let challengeBestanden = false;
  if (cookieWert(request, 'qb_ch')) {
    challengeBestanden = true;
    st.fenster = [];
    st.katalog.clear();
    st.verlauf = [];
    // Das Lane-Fenster gehoert zum selben Reset: wer die Challenge geloest
    // hat, startet auf ALLEN Achsen frisch. Ein stehenbleibendes Lane-Fenster
    // waere die einzige Achse, auf der ihn seine Vorgeschichte weiter belastet.
    st.lane = leeresLaneFenster(jetzt);
  }

  // Lane-Fenster IMMER fuehren — auch im Test-Signal-Pfad. Die Erfassung ist
  // von der Score-Berechnung unabhaengig; wer sie an `testSignale` haengt,
  // baut sich eine Test-Umgebung, in der die Lane nie laeuft.
  const pfadMitQuery = pfad + url.search;
  laneErfassen(st.lane, pfadMitQuery, jetzt);

  /** @type {Record<string, unknown>} */
  let signale;
  let gruende = [];
  if (testSignale) {
    signale = testSignale;
  } else {
    // 1) Rate (Sliding-Window ueber zaehlbare = Nicht-Asset-Requests).
    const zaehlbar = !ASSET_RE.test(pfad);
    let rateOverPct = 0;
    if (zaehlbar) {
      st.fenster.push(jetzt);
      while (st.fenster.length && st.fenster[0] < jetzt - RATE_FENSTER_MS) {
        st.fenster.shift();
      }
      const limit = intAusEnv(env, 'SM_RATE_LIMIT_PRO_MIN', RATE_LIMIT_DEFAULT);
      let zahl = st.fenster.length;
      if (zahl >= limit / 2) {
        zahl = await cacheAggregat(schluessel, zahl, jetzt, ctx);
      }
      rateOverPct = zahl > limit ? ((zahl - limit) / limit) * 100 : 0;
    }

    // 2) Header-Heuristik (in-memory, nichts davon wird gespeichert).
    const headerObj = Object.fromEntries(request.headers.entries());
    const hs = headerSignale(headerObj);
    gruende = hs.gruende;

    // 3) WAF-Regeln gegen Pfad + fluechtigen Query-String.
    const ps = pfadSignale(pfad, url.search.replace(/^\?/, ''));

    // 4) Verhaltens-Token (qb_vt): nur bewerten, wenn das uniforme Snippet
    //    ueberhaupt ausgeliefert wird (SM_VERHALTEN=on) — sonst neutral.
    const tokenAktiv = (env?.SM_VERHALTEN || '').toLowerCase() === 'on';
    const missingToken = tokenAktiv && !cookieWert(request, 'qb_vt');

    // 5) Vollkatalog-Detektor (OWASP OAT-011): distinct Katalog-Pfade des
    //    Schluessels im Fenster. Fenster-Reset erfolgt zeitbasiert grob.
    if (KATALOG_PRAEFIXE.some((p) => pfad.startsWith(p))) {
      st.katalog.add(pfad);
    }
    if (
      st.fenster.length &&
      jetzt - st.fenster[0] > KATALOG_FENSTER_MS &&
      st.katalog.size
    ) {
      st.katalog.clear();
    }
    const katalogN = intAusEnv(env, 'SM_KATALOG_N', KATALOG_N_DEFAULT);
    const ratio = vollkatalogRatio(st.katalog.size, katalogN);

    // 6) ASN-Typ: auf Oxygen NICHT verfuegbar (kein MMDB/ASN-Header im
    //    Worker) — ehrlich 'unknown'. Datacenter-Erkennung leistet der
    //    T1-Kern offline bzw. der Eigenserver (T3).
    signale = {
      rate_over_pct: Math.round(rateOverPct * 100) / 100,
      header_anomaly: hs.header_anomaly,
      asn_type: 'unknown',
      missing_behavior_token: missingToken,
      waf_severity: ps.waf_severity,
      vollkatalog_ratio: Math.round(ratio * 1000) / 1000,
    };
    if (ps.treffer.length) gruende = gruende.concat(ps.treffer);
  }

  const scRoh = scoreBerechnen(signale);

  // ---- ERLAUB-LANE: der monotone Daempfer VOR der Eskalation --------------
  // Die Reihenfolge ist tragend: der Deckel muss VOR `st.verlauf.push()`
  // greifen. Die Eskalation urteilt ueber `stufeMitHysterese(st.verlauf)` —
  // ein erst danach gedeckelter Score liesse die ROHEN Werte in der Historie
  // stehen, und der naechste Request eskaliert daran vorbei.
  const laneSignale =
    testLaneSignale || ausWorkerZustand(st, signale.vollkatalog_ratio ?? 0);
  let laneVerdikt = null;
  let laneFehler = null;
  let sc = scRoh;
  if (laneAktiv(env)) {
    try {
      laneVerdikt = laneBewerte(scRoh, laneSignale, capsAusEnv(env));
      sc = laneVerdikt.score_nachher;
    } catch (e) {
      // Ein Lane-Fehler faellt auf den ROHEN Score zurueck — den Zustand VOR
      // dieser Lane, nie auf einen erfundenen Deckel. Er wird aber SICHTBAR
      // (Shadow-Log), statt den Schutz still abzuschalten.
      laneFehler = String(e?.message || e);
      sc = scRoh;
    }
  }

  st.verlauf.push(sc);
  if (st.verlauf.length > HYSTERESE_N) {
    st.verlauf = st.verlauf.slice(-HYSTERESE_N);
  }
  const akt = aktionBerechnen(sc, pfad, st.verlauf);

  return {
    modus: modus(env),
    score: sc,
    score_roh: scRoh,
    stufe: akt.stufe,
    aktion: akt,
    signale,
    lane: laneVerdikt
      ? {
          verdikt: laneVerdikt.lane,
          max_stufe: laneVerdikt.max_stufe,
          gedaempft_um: laneVerdikt.gedaempft_um,
          begruendung: laneVerdikt.begruendung,
          belege: laneVerdikt.belege,
          signale: laneVerdikt.signale,
        }
      : null,
    lane_aktiv: laneAktiv(env),
    lane_fehler: laneFehler,
    gruende,
    schluessel,
    pfad,
    challengeBestanden,
    verhaltensToken: cookieWert(request, 'qb_vt') || '',
  };
}

// ---- Uniforme Antworten (Konstanten — fuer JEDEN identisch, INV-1) ---------

// Die Challenge-Seite ist bewusst selbst-enthalten (inline JS, kein CSP-
// Header auf dieser Nicht-200-Antwort): sie setzt nach kurzer uniformer
// Wartezeit das qb_ch-Cookie und laedt neu — gleiche Huerde fuer jeden
// (Anubis-Prinzip). Kein Identitaets-Judgment, keine Daten-Erhebung.
const CHALLENGE_HTML = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Einen Moment bitte — Qi Blanco</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf8f5;color:#222}main{text-align:center;padding:2rem}</style>
</head><body><main>
<h1>Einen kurzen Moment bitte &hellip;</h1>
<p>Wir pr&uuml;fen deine Verbindung. Du wirst gleich automatisch weitergeleitet.</p>
<noscript><p>Bitte aktiviere JavaScript und lade die Seite neu.</p></noscript>
<script>
setTimeout(function () {
  var abl = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
  document.cookie = 'qb_ch=1; expires=' + abl + '; Path=/; SameSite=Lax; Secure';
  location.reload();
}, 2000);
</script>
</main></body></html>`;

const BLOCK_HTML = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Zu viele Anfragen — Qi Blanco</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf8f5;color:#222}main{text-align:center;padding:2rem}</style>
</head><body><main>
<h1>Zu viele Anfragen</h1>
<p>Bitte versuche es in einigen Minuten erneut.</p>
</main></body></html>`;

/**
 * Uniforme Nicht-200-Antwort fuer S2 (Challenge) / S3 (Temp-Block).
 * Baut die Antwort AUSSCHLIESSLICH aus dem Aktions-Objekt (das strukturell
 * kein body-Feld kennt) + konstanten Seiten — nie aus Besucher-Attributen.
 * @param {Awaited<ReturnType<typeof pruefe>>} verdikt
 */
export function antwort(verdikt) {
  const a = verdikt.aktion;
  const html = a.typ === 'challenge' ? CHALLENGE_HTML : BLOCK_HTML;
  return new Response(html, {
    status: a.status_code,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': String(a.retry_after_s),
      'Cache-Control': 'no-store',
    },
  });
}

function shadowLog(verdikt) {
  // Structured Log in den Oxygen-Log-Drain — die einzige Shadow-Sichtbarkeit
  // (kein DB-Zugriff aus workerd). Nur Hash-Praefix + objektive Signale,
  // keine IP/UA (INV-3). Rueckfluss in die sicherheitsmeister-Signal-DB =
  // deklarierte offene Flanke (s05/s06).
  try {
    if (
      verdikt.stufe !== 'S0' ||
      verdikt.challengeBestanden ||
      verdikt.lane_fehler ||
      // Eine wirksame Daempfung ist das interessanteste Ereignis der
      // Lane — sie faellt oft AUF S0 und waere sonst unsichtbar.
      (verdikt.lane && verdikt.lane.gedaempft_um > 0)
    ) {
      // eslint-disable-next-line no-console -- structured Shadow-Log ist der Zweck
      console.log(
        JSON.stringify({
          sm_abwehr: 1,
          modus: verdikt.modus,
          stufe: verdikt.stufe,
          score: verdikt.score,
          score_roh: verdikt.score_roh,
          lane: verdikt.lane
            ? {
                verdikt: verdikt.lane.verdikt,
                max_stufe: verdikt.lane.max_stufe,
                gedaempft_um: verdikt.lane.gedaempft_um,
                signale: verdikt.lane.signale,
              }
            : null,
          lane_aktiv: verdikt.lane_aktiv,
          lane_fehler: verdikt.lane_fehler,
          gruende: verdikt.gruende,
          signale: verdikt.signale,
          schluessel: verdikt.schluessel,
          pfad: verdikt.pfad,
          challenge_bestanden: verdikt.challengeBestanden,
        }),
      );
    }
  } catch {
    // Logging darf nie werfen.
  }
}

/**
 * DER Einbau-Punkt fuer server.js: fuehrt den Abwehr-Vorfilter aus und ruft
 * sonst den unveraenderten Bestands-Handler (`next`).
 *
 * Garantien:
 *  - SM_MODE=off/fehlerhaft/Exception  -> exakt `await next()` (never-break).
 *  - shadow (Default)                  -> `await next()` + Log, 0 Wirkung.
 *  - on: S2/S3 -> uniforme Challenge-/Block-Antwort (NIE auf Checkout-Block,
 *    eskalation.js kappt auf Challenge); S1 -> Retry-After-Header + tarpit
 *    auf der UNVERAENDERTEN Antwort (Body-Bytes identisch, INV-1); S0 -> pur.
 *  - Die ERLAUB-LANE (kundenpfad.js) deckelt den Score VOR der Eskalation.
 *    Sie kann eine Stufe nur SENKEN (INV-8), nie anheben — die obigen
 *    Garantien bleiben davon unberuehrt.
 *
 * @param {Request} request
 * @param {Record<string, string|undefined>} env
 * @param {{waitUntil?: Function}} ctx
 * @param {() => Promise<Response>} next
 * @param {Record<string, unknown>} [testSignale] NUR fuer Tests (INV-1-Test).
 * @param {Record<string, unknown>} [testLaneSignale] NUR fuer Tests (Lane-Lage).
 */
export async function mitAbwehr(request, env, ctx, next, testSignale, testLaneSignale) {
  let verdikt = null;
  try {
    if (modus(env) === 'off') return await next();
    verdikt = await pruefe(request, env, ctx, testSignale, testLaneSignale);
    shadowLog(verdikt);
    if (
      verdikt.modus === 'on' &&
      (verdikt.aktion.typ === 'challenge' || verdikt.aktion.typ === 'temp_block')
    ) {
      return antwort(verdikt);
    }
  } catch {
    verdikt = null; // never-break: Abwehr-Fehler => normaler Passthrough
  }

  const response = await next();

  try {
    if (
      verdikt &&
      verdikt.modus === 'on' &&
      verdikt.aktion.typ === 'retry_after_hint'
    ) {
      // S1 Soft-Drossel: NUR Transport (Header + tarpit-light) — die
      // Body-Bytes bleiben byte-identisch (INV-1).
      if (verdikt.aktion.tarpit_ms > 0) {
        await new Promise((r) => setTimeout(r, verdikt.aktion.tarpit_ms));
      }
      const r = new Response(response.body, response);
      r.headers.set('Retry-After', String(verdikt.aktion.retry_after_s));
      return r;
    }
  } catch {
    return response;
  }
  return response;
}

/** NUR fuer Tests: setzt den In-Memory-State zurueck (hermetische Laeufe). */
export function _testReset() {
  zustand.clear();
  salz = {tag: '', wert: ''};
}
