/*
 * PRE-ACCESS SCHALTET SICH ZUM BLACK-FRIDAY-START AB (Elina EL-20261125-b4b99e96, Teil A):
 * „Pre-Sale-Seiten … schalten sich am 27.11. 00:00 automatisch ab und leiten auf die BF-Deal-Seite weiter.“
 * Ab BF_PRESALE_ENDE (Fr 27.11.2026 00:00 Berlin = 2026-11-26T23:00:00Z) antworten /pages/pre-access und
 * /pages/pre-access-b mit einer dauerhaften Weiterleitung (301) auf /pages/bf-deals, alle Abfrageparameter
 * (utm_*, fbclid, el, markt …) kommen mit. Die Adresse bleibt bestehen und führt nie auf eine Fehlerseite
 * (Elina EL-20261125-490a83e2: „dauerhafte Weiterleitung auf die Nachfolgeseite, niemals eine Fehlerseite“,
 * Schutzliste adressen-schutzliste erlaubt den Endpfad /pages/bf-deals). Kein Ablaufdatum: auch nach dem Sale bleibt
 * die Weiterleitung, der Inhalt von bf-deals wechselt.
 * Cache-Control no-store: der Browser merkt sich die 301 nicht, ein Rückweg (alter Deploy) wirkt sofort.
 * Vorschau eines anderen Zeitpunkts: ?pab_jetzt=<ISO> (wie der Countdown), auf Server und im offenen Tab.
 * Rückweg: diese Datei und die Aufrufe in pages.pre-access-b.tsx / pages.pre-access.tsx entfernen.
 */
import {BF_PRESALE_ENDE} from './bf-deals-daten.js';

export const PRE_ACCESS_ZIEL = '/pages/bf-deals';
export const PRE_ACCESS_STATUS = 301;

/** Zeitpunkt (ms) mit Vorschau-Zeit ?pab_jetzt=, sonst `jetzt`. */
export function preAccessJetzt(suche, jetzt = Date.now()) {
  try {
    const q = new URLSearchParams(suche || '').get('pab_jetzt');
    if (q && Number.isFinite(Date.parse(q))) return Date.parse(q);
  } catch {
    /* ohne Vorschau-Zeit gilt die Uhr */
  }
  return jetzt;
}

/** true ab dem Black-Friday-Start. */
export function preAccessVorbei(jetzt = Date.now()) {
  return jetzt >= Date.parse(BF_PRESALE_ENDE);
}

/** Ziel mit allen Abfrageparametern der alten Adresse. */
export function preAccessZiel(suche) {
  const s = String(suche || '');
  if (!s || s === '?') return PRE_ACCESS_ZIEL;
  return PRE_ACCESS_ZIEL + (s.startsWith('?') ? s : '?' + s);
}

/**
 * Weiterleitung für den Loader: `null` vor dem Start, sonst {pfad, status, headers}.
 * @param {string} requestUrl volle Adresse der Anfrage
 * @param {number} [jetzt]
 */
export function preAccessUmleitung(requestUrl, jetzt = Date.now()) {
  let suche = '';
  try {
    suche = new URL(requestUrl).search;
  } catch {
    suche = '';
  }
  if (!preAccessVorbei(preAccessJetzt(suche, jetzt))) return null;
  return {
    pfad: preAccessZiel(suche),
    status: PRE_ACCESS_STATUS,
    headers: {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow'},
  };
}

/**
 * Offener Tab um Mitternacht: springt zum Start selbst auf bf-deals (location.replace, kein Eintrag im Verlauf).
 * Gibt eine Aufräumfunktion zurück. `fenster` nur für Tests.
 */
export function preAccessTabWache(fenster = typeof window !== 'undefined' ? window : null) {
  if (!fenster) return () => {};
  let versatz = 0;
  const suche = fenster.location.search;
  const vorschau = preAccessJetzt(suche, NaN);
  if (Number.isFinite(vorschau)) versatz = vorschau - Date.now();
  const ende = Date.parse(BF_PRESALE_ENDE);
  let id = null;
  const springe = () => fenster.location.replace(preAccessZiel(suche));
  const pruefe = () => {
    if (id !== null) fenster.clearTimeout(id);
    id = null;
    const rest = ende - (Date.now() + versatz);
    if (rest <= 0) return springe();
    // setTimeout trägt höchstens ~24,8 Tage; länger wartet die nächste Prüfung (Sichtbarkeit/neuer Aufruf).
    if (rest < 2147483647) id = fenster.setTimeout(pruefe, rest + 250);
  };
  // Schläft der Tab (Handy gesperrt), feuert der Zeitgeber spät: beim Zurückkommen sofort neu prüfen.
  const sichtbar = () => {
    if (fenster.document?.visibilityState !== 'hidden') pruefe();
  };
  fenster.document?.addEventListener?.('visibilitychange', sichtbar);
  pruefe();
  return () => {
    if (id !== null) fenster.clearTimeout(id);
    fenster.document?.removeEventListener?.('visibilitychange', sichtbar);
  };
}
