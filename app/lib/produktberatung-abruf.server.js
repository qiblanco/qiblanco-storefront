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
    r = await holeJson(url, init, ms, holer);
    if (brauchbar(r)) break;
  }
  return {...r, versuche: n};
}
