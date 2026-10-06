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
import {buyerIpAusRequest, istInternerZugriff} from './interner-verkehr.js';

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
  // VARIANTEN-PIN (s08, nach einem real beobachteten Kollateral-Defekt): ein
  // Redirect-Split macht die Quell-URL für JEDES Mess-Werkzeug mehrdeutig —
  // der Design-Scorer folgte der Weiche und lieferte für LP A eine V2-Messung.
  // Der taegliche Design-Watch haette damit LP As Beleg-Datei ueberschrieben,
  // und hb-deploy Gate 9 liest genau die. Deshalb muss JEDE Variante
  // deterministisch adressierbar bleiben:
  //   ?lp_ab=a -> immer LP A   ?lp_ab=b -> immer V2
  // Nur für QA/Monitoring gedacht; der Kill-Schalter dominiert weiterhin
  // (steht oben), und die Wuerfel-Zuteilung bleibt für echten Traffic
  // unveraendert. Contamination: der Watch erzeugt 1 gepinnten Aufruf/Tag.
  const pin = url.searchParams.get('lp_ab');
  if (pin === 'a') return null;
  if (pin === 'b') return {ziel: zielUrl(LP_V2_PFAD, url.search, LP_V2_MARKER), prozent: 100};
  const prozent = leseSplitProzent(env);
  if (prozent <= 0) return null;
  if (zufall() * 100 >= prozent) return null;
  return {ziel: zielUrl(LP_V2_PFAD, url.search, LP_V2_MARKER), prozent};
}

/* ═══════════════════════════════════════════════════════════════════════════
 * EXPERIMENT-KREISLAUF E1 (Grossjob 20261006-GROSSJOB-lp-experimente-schlaf-
 * zellen-schutz-variante-b-15pct-kreislauf, Christian 06.10.2026):
 * 15 % der Eintritte auf LP A sehen Variante B (/pages/schlaf-zellen-schutz-b).
 *
 * WARUM EIN ZWEITER SPLIT NEBEN V2 UND NICHT V2 UMGEBOGEN: V2 ist ein eigenes,
 * abgeschlossenes Experiment mit eigener Route und Env-Schalter (LP_AB_V2_MODE,
 * heute aus). E1 hat eine andere Frage (eine Hypothese aus
 * geschaeftssteuerung/data/hypothesen.json je Test), einen anderen Anteil und
 * eine andere Zuteilung. Laufen beide, entscheidet V2 zuerst (Reihenfolge im
 * Loader); E1 teilt dann nur den Rest von A.
 *
 * ENTSCHEIDE, je begründet:
 *  - ANTEIL IM CODE, NICHT IN DER ENV: Oxygen-Env setzt nur Christians Hand.
 *    Ein Test, dessen Anteil nur per Handgriff änderbar ist, kann der
 *    Kreislauf nie selbst beenden. Mehr Anteil = ein PR mit Christians Wort
 *    (Auftrag: "nicht eigenmächtig erhöhen").
 *  - STABIL JE BESUCHER, OHNE SPEICHER AUF DEM GERÄT: der Arm folgt aus einem
 *    Hash über (Experiment-Salz | Client-IP | User-Agent). Nichts wird gesetzt,
 *    nichts gespeichert, nichts gemeldet — der Hash lebt nur in diesem Request.
 *    Derselbe Mensch auf demselben Gerät und Netz sieht beim zweiten
 *    Anzeigen-Klick dieselbe Variante. Wechselt das Netz (Mobilfunk), kann der
 *    Arm wechseln: das ist der Preis ohne Cookie, er verdünnt den Unterschied
 *    (konservativ), verfälscht ihn nicht.
 *  - UNABHÄNGIG VON DER QUELLE: der Hash sieht weder Query noch Referrer.
 *    Meta, Google, Markensuche und direkt teilen sich gleich 85/15 — der
 *    Markensuche-Holdout bis 11.10. bleibt in seiner Grundmenge unberührt.
 *  - EIGENER VERKEHR BLEIBT AUF A (interner-verkehr.js, IP + UA-Marker): der
 *    Server hat EINE IP; ohne diese Ausnahme sähen ALLE Mess-Werkzeuge
 *    (Design-Watch, Kaufweg-Nachlauf, Formate) dauerhaft denselben Arm.
 *    Für gezielte Messungen: ?lp_exp=a | ?lp_exp=b.
 *  - 302 + no-store + zielUrl() (roher Query + lp_m=x) wie V2: fbclid/gclid/UTM
 *    kommen byte-identisch auf B an. Die anonyme Zählung meldet nur Status
 *    200 — der 302 auf A zählt nicht, B zählt unter seinem eigenen Pfad.
 *    Damit trennen sich die Arme in events.db UND anon_zaehlung.db am Pfad.
 *  - KILL: E1_AKTIV = false (PR) oder Env LP_EXP_SZS_MODE=off (Handgriff).
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Ziel-Route der Variante B. EINE Definition (ad-weiche importiert sie). */
export const LP_EXP_B_PFAD = '/pages/schlaf-zellen-schutz-b';

/** Marker in der Ziel-URL: x = Experiment (unterscheidbar von w/r/h/p/b/f/v/m). */
export const LP_EXP_MARKER = 'x';

/** Laufendes Experiment. Neuer Test = neue id + neues Salz (neue Zuteilung). */
export const E1 = Object.freeze({
  id: 'szs-e1-gs050',
  hypothese_id: 'GS-050',
  salz: 'szs-e1-gs050',
  anteil_prozent: 15,
});

/** Code-Schalter des Experiments; false = 100 % LP A. */
export const E1_AKTIV = true;

/** Kill per Env: NUR der Wert 'off' schaltet ab (Abwesenheit = Code-Schalter gilt). */
export function experimentAktiv(env, codeSchalter = E1_AKTIV) {
  if (!codeSchalter) return false;
  return !(env && env.LP_EXP_SZS_MODE === 'off');
}

/**
 * FNV-1a, 32 Bit: deterministisch, ohne Krypto-API, in node und workerd
 * gleich. Gleichverteilung reicht für eine 85/15-Zuteilung; Sicherheit ist
 * hier keine Anforderung (nichts wird gespeichert oder offengelegt).
 */
export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Eimer 0..99 je Besucher (IP + UA) und Experiment. */
export function besucherEimer(ip, userAgent, salz = E1.salz) {
  return fnv1a(`${salz}|${ip || ''}|${userAgent || ''}`) % 100;
}

/**
 * Reine Entscheidungsfunktion: {ziel, eimer} wenn dieser Request Variante B
 * sehen soll, sonst null. Ohne Client-IP gibt es keine stabile Zuteilung —
 * dann A (Fail-Richtung auf den Bestand).
 */
export function entscheideLpExperiment(request, env, codeSchalter = E1_AKTIV) {
  if (!request || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  if (!experimentAktiv(env, codeSchalter)) return null;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.data')) return null;
  if (url.searchParams.has('_data')) return null;
  const pin = url.searchParams.get('lp_exp');
  if (pin === 'a') return null;
  if (pin === 'b') return {ziel: zielUrl(LP_EXP_B_PFAD, url.search, LP_EXP_MARKER), eimer: -1};
  const ua = request.headers?.get?.('user-agent') || '';
  const ip = request.headers?.get ? buyerIpAusRequest(request) : '';
  if (istInternerZugriff({userAgent: ua, ip})) return null;
  if (!ip) return null;
  const eimer = besucherEimer(ip, ua);
  if (eimer >= E1.anteil_prozent) return null;
  return {ziel: zielUrl(LP_EXP_B_PFAD, url.search, LP_EXP_MARKER), eimer};
}
