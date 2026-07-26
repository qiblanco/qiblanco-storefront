/**
 * LP-A/B-SPLIT V1 gegen V2 (Grossjob 20260726-scoring-standortbestimmung-lp-v2-
 * psychobuild, Segment s07 nach Konzept §E).
 *
 * Der Split sitzt im Loader der ALT-Route /pages/schlaf-zellen-schutz. Der
 * Ad-Einstieg bleibt damit unveraendert auf der Alt-URL (Auftrags-Vorgabe
 * „oberen Link beibehalten"), und weil die AD-TRAFFIC-WEICHE weiterhin auf
 * LP A zielt, greift der Split automatisch für den gesamten bezahlten
 * Traffic — ohne eine einzige Ad-Config anzufassen.
 *
 *   GET /pages/schlaf-zellen-schutz?…
 *     └─ root-Loader: ad-weiche → LP A ausgeschlossen → kein Redirect
 *     └─ LP-A-Loader:
 *           LP_AB_V2_MODE !== 'on'  ──────────────► LP A rendern (200)
 *           Wuerfel < LP_AB_V2_SPLIT (Default 50) ─► 302 auf V2 + no-store
 *           sonst ─────────────────────────────────► LP A rendern (200)
 *
 * ENTSCHEIDE (Konzept §E.2, je begründet):
 *  - COOKIE-LOS: Zuweisung per Request-Zufall, KEIN qb_lp_ab-Cookie.
 *    (a) §25 TTDSG — ein A/B-Cookie ist nicht „unbedingt erforderlich";
 *    (b) Haus-Regel: go-router setzt qb_lp_hist NUR bei consentOk, ein
 *        consent-freier Split-Cookie wäre ein Bruch;
 *    (c) die eigene Abnahme-Probe feuert cookie-lose curl-Requests.
 *    PREIS, offen deklariert: Analyse-Einheit ist der LP-EINTRITT (Pageview),
 *    nicht der Besucher. Die Randomisierung bleibt gültig (Zuweisung ist
 *    unabhängig vom Ergebnis), die Messung zählt Eintritte.
 *  - 302 + Cache-Control: no-store (Konvention aller drei Bestands-Weichen —
 *    KEIN 301, das würde dauerhaft gecacht).
 *  - zielUrl() WIEDERVERWENDET (go-router-logic.js): Ziel + ROHER url.search
 *    + lp_m=v. Damit kommt fbclid/gclid/UTM byte-identisch auf V2 an — genau
 *    die eine Stelle, an der sonst Tracking-Verlust entstuende.
 *  - KILL LP_AB_V2_MODE: nur der explizite Wert 'on' aktiviert, alles andere
 *    und Abwesenheit = 100 % Alt-LP (ROTATION_MODE-Muster; die Fail-Richtung
 *    zeigt auf die bewaehrte LP A, nie in den Split).
 *  - KEINE zuteilung.json-Kopplung: das wäre ein Netz-Hop im Hot-Path der
 *    Haupt-Einstiegsseite, und ein Fetch-Ausfall würde das Experiment STILL
 *    auf 100 % A stellen und die Messung verderben.
 *
 * Reine Funktionen auf einfachen Werten, KEIN Remix-/Hydrogen-Import — damit
 * ohne Build-Toolchain per `node --test test/lp-ab-v2.test.mjs` pruefbar
 * (Hausmuster go-router-logic.js / ad-weiche.server.js).
 *
 * CROSS-BOUNDARY-LINKAGE: KEIN neuer Identitaets-Key, kein Set-Cookie, keine
 * Aenderung an TRACKING_COOKIE_NAMES — der Split reicht den rohen Query
 * unveraendert weiter (zielUrl-Invariante) und ist damit für die
 * Storefront→Checkout→Backend-Kette transparent.
 */
import {zielUrl} from './go-router-logic.js';

/** Ziel-Route der Variante B. EINE Definition im Code (Q14 Slug-Konsistenz). */
export const LP_V2_PFAD = '/pages/schlaf-zellen-schutz-v2-18ef';

/** Marker in der Ziel-URL: v = Variante (unterscheidbar von w/r/h/p/b/f). */
export const LP_V2_MARKER = 'v';

/** Ohne gesetzten Wert läuft der Split 50/50 (Konzept §F: gleiche Power). */
export const SPLIT_DEFAULT_PROZENT = 50;

/**
 * Kill-Schalter. NUR der explizite Wert 'on' aktiviert den Split; jeder andere
 * Wert und die Abwesenheit der Variablen bedeuten 100 % Alt-LP.
 */
export function splitAktiv(env) {
  return (env && env.LP_AB_V2_MODE) === 'on';
}

/**
 * Anteil (0–100) der Eintritte, die auf V2 gehen. Unlesbare/fehlende Werte
 * fallen auf den Default zurück, ausserhalb liegende werden geklemmt —
 * eine kaputte Env-Zeile darf den Split nie in einen undefinierten Zustand
 * bringen (fail-soft in Richtung eines gueltigen Experiments).
 */
export function leseSplitProzent(env) {
  const roh = env && env.LP_AB_V2_SPLIT;
  if (roh === undefined || roh === null || roh === '') return SPLIT_DEFAULT_PROZENT;
  const n = Number.parseInt(String(roh), 10);
  if (!Number.isFinite(n)) return SPLIT_DEFAULT_PROZENT;
  return Math.max(0, Math.min(100, n));
}

/**
 * Reine Entscheidungsfunktion (hermetisch testbar): liefert {ziel, prozent}
 * wenn dieser Request auf V2 umgeleitet werden soll, sonst null.
 *
 * Ausgeschlossen sind (Muster pruefeAdWeiche):
 *  - andere Methoden als GET/HEAD,
 *  - React-Router-Datenrequests (*.data bzw. ?_data=) — sonst zerreisst der
 *    Redirect die Client-Navigation,
 *  - der abgeschaltete Zustand und ein Split-Anteil von 0.
 */
export function entscheideLpAbV2(request, env, zufall = Math.random) {
  if (!request || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  if (!splitAktiv(env)) return null;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.data')) return null;
  if (url.searchParams.has('_data')) return null;
  const prozent = leseSplitProzent(env);
  if (prozent <= 0) return null;
  if (zufall() * 100 >= prozent) return null;
  return {ziel: zielUrl(LP_V2_PFAD, url.search, LP_V2_MARKER), prozent};
}
