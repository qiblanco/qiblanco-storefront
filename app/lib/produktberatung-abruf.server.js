/**
 * Abruf des Buchungs-Endpunkts der Produktberatung mit EINEM zweiten Versuch.
 *
 * Repair 20261017-repair-prio1-produktberatung-termine-laden-nicht-kundenrand-
 * fehlerwache, s02 (Christian 17.10.2026, Prio 1): bis dahin holte der Loader
 * von pages.produktberatung.jsx die Termine mit EINEM Versuch und 4 s Frist.
 * Jeder einzelne flüchtige Fehlschlag (Zeitüberschreitung, DNS von sslip.io,
 * Antwort != 200) wurde so zum Satz „Die Termine laden gerade nicht" bei der
 * Kundin (belegt 2026-10-17T11:40:51Z auf Arm B, Desktop; der Endpunkt
 * antwortete davor und danach in 45 Proben immer 200).
 *
 * Jetzt: erster Versuch 3500 ms, bei Fehlschlag ein zweiter mit 3000 ms. Die
 * Seite hängt so höchstens ~6,5 s am Endpunkt (vorher 4 s, aber mit Fehlersatz).
 * Was „Fehlschlag" heißt, sagt der Aufrufer (`brauchbar`): für /api/termine
 * alles außer 200 mit termine-Array, für /api/buchung nur Netzfehler und 5xx
 * (ein 404 „Diesen Link kennen wir nicht" ist eine Antwort, kein Fehlschlag).
 *
 * POST (Buchen, Absagen, Umbuchen) wird NIE wiederholt: ein zweites Buchen
 * nach einer verlorenen Antwort könnte doppelt buchen.
 */
export const FRISTEN_MS = [3500, 3000];

function signal(ms) {
  return typeof AbortSignal !== 'undefined' &&
    typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(ms)
    : undefined;
}

/** Ein Abruf: {status, body}; Netzfehler und Zeitüberschreitung geben status 0. */
export async function holeJson(url, init, ms, holer = fetch) {
  try {
    const res = await holer(url, {...init, signal: signal(ms)});
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return {status: res.status, body};
  } catch {
    return {status: 0, body: null};
  }
}

/** Netzfehler oder Serverfehler: das darf ein zweiter Versuch heilen. */
export function istFluechtig(r) {
  return r.status === 0 || r.status >= 500;
}

/** Brauchbare Antwort von /api/termine: 200 mit termine-Array. */
export function termineBrauchbar(r) {
  return r.status === 200 && Array.isArray(r.body?.termine);
}

/**
 * GET mit höchstens einem zweiten Versuch. Rückgabe wie holeJson, dazu
 * `versuche` (1 oder 2), damit der Loader es der Seite mitgeben kann.
 */
export async function holeMitWiederholung(
  url,
  init,
  brauchbar,
  {fristen = FRISTEN_MS, holer = fetch} = {},
) {
  let r = {status: 0, body: null};
  let n = 0;
  for (const ms of fristen) {
    n += 1;
    // X-PB-Versuch: der Endpunkt protokolliert damit, wie oft der erste Versuch scheiterte (Ereignis termine_abruf).
    const headers = {...(init?.headers || {}), 'X-PB-Versuch': String(n)};
    r = await holeJson(url, {...init, headers}, ms, holer);
    if (brauchbar(r)) break;
  }
  return {...r, versuche: n};
}

// ─── Messfixtur des Formate-Prüfers (Gate 12) ───────────────────────────────
//
// Job 20261110-gate12-messfixtur-produktberatung-termine (Folgeauftrag zu
// 20261019-repair-gate12-live-pixelsoll-datengetrieben-terminwechsel, #9).
// /pages/produktberatung und /pages/produktberatung-b zeigen die freien Termine
// des Endpunkts, dazu die Browser-Uhr (Abdaten) und die Zeitzone der Kundin.
// Datum und Zahl der Zeiten wechseln jede Woche; ein Pixel-Soll mit Terminen
// veraltete damit wie bei /pages/live und Gate 12 sperrte fremde Merges.
// Der Formate-Prüfer schickt den Kopf x-hbfmt-messfixtur: 1 NUR an den
// Ursprung der Bank; istMessfixtur (gemeinsam mit /pages/live, nicht kopiert)
// nimmt ihn nur an localhost/127.0.0.1/::1 an. Auf Oxygen ist der Host nie
// einer davon: ein Kunde mit dem Kopf sieht weiter die echten Termine.
// Dann gilt: kein Abruf von /api/termine, feste Termine, festes `jetzt` im
// Loader UND im Browser, feste Zone Europe/Berlin, und die Termin-Bereiche
// tragen data-messfixtur="produktberatung" (der Prüfer schreibt das in den Beleg).
// WER ZEITPUNKT ODER TERMINE ÄNDERT, ÄNDERT DAS PIXEL-SOLL BEIDER SEITEN
// (per PR + hb-pixelsoll deklariere --pr ... --seite produktberatung[-b]).
export {istMessfixtur} from './coming-home-live.server.js';

export const PB_MESSFIXTUR_NAME = 'produktberatung';
/** Fester Zeitpunkt der Messung: ein Dienstag, die Termine liegen an den drei folgenden Donnerstagen. */
export const PB_MESSFIXTUR_JETZT = '2026-11-10T08:00:00Z';
/** Feste Zone der Messung (die Bank hat sonst die Zone ihres Rechners). */
export const PB_MESSFIXTUR_ZONE = 'Europe/Berlin';
/** Buchungsschluss wie der Endpunkt ihn heute meldet (8 Stunden). */
export const PB_MESSFIXTUR_SCHLUSS_MIN = 480;

const FIX_TAGE = ['2026-11-12', '2026-11-19', '2026-11-26'];
const FIX_ZEITEN = ['13:00', '13:30', '14:00'];

function fixSlot(datum, zeit) {
  const [h, m] = zeit.split(':').map(Number);
  const ende = `${String(h + Math.floor((m + 20) / 60)).padStart(2, '0')}:${String((m + 20) % 60).padStart(2, '0')}`;
  // November: Berlin = UTC+1.
  const utc = `${datum}T${String(h - 1).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`;
  return {
    slot_start: `${datum}T${zeit}:00+01:00`,
    slot_ende: `${datum}T${ende}:00+01:00`,
    utc,
    datum,
    zeit,
  };
}

/**
 * Feste Termine der Messfixtur in der Form von /api/termine (neun Zeiten an drei
 * Donnerstagen, wie der Endpunkt sie heute liefert). Neue Objekte je Aufruf.
 */
export function messfixturTermine() {
  return {
    termine: FIX_TAGE.flatMap((d) => FIX_ZEITEN.map((z) => fixSlot(d, z))),
    buchungMoeglich: true,
    buchungsschlussMin: PB_MESSFIXTUR_SCHLUSS_MIN,
    jetzt: PB_MESSFIXTUR_JETZT,
  };
}
