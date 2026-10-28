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

/**
 * Code-Schalter des Experiments; false = 100 % LP A.
 *
 * BEENDET am 20.10.2026 (Urteil des Heatmap-Managers 06:27Z: B gewinnt,
 * P(B > A) = 95 % nach 13,8 Tagen und 391 B-Sitzungen; mobil 0,977, desktop
 * 0,17). Seite A trägt seitdem mobil fest, was B mobil zeigte
 * (traegtChampionMobil in components/campaign/SchlafZellenSchutz.jsx), und
 * die Eimer 0..14 sind frei. id und Salz bleiben stehen: das Salz trägt B2 und
 * jeder weitere Arm dieser Seite (ausschließende Eimer), und ein neuer Test auf
 * /pages/schlaf-zellen-schutz-b bekommt eine neue id, nie diese.
 */
export const E1_AKTIV = false;

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

/* ═══════════════════════════════════════════════════════════════════════════
 * ZWEITER ARM B2 NEBEN E1 (Grossjob „LP-Tests je Gerät, Sticky isoliert“,
 * s02; Christian 10.10.2026: „Vielleicht ist der feste Kaufknopf zu
 * aggressiv, das muss dann mobil auch nochmal mit der alten Ansicht und mehr
 * Knöpfen getestet werden … die Tests können gleichzeitig laufen").
 *
 * B2 = Seite A plus die Weiter-Knöpfe an ihren Stellen von vor dem 20.09.2026
 * (nach dem Mechanismus, im und nach dem Wissenschaftsblock), ohne festen
 * Kaufknopf (Hypothese GS-126). Definition vollständig in
 * heatmap-manager/config/experimente.yaml (szs-e2-gs126).
 *
 * ENTSCHEIDE, je begründet:
 *  - DASSELBE SALZ WIE E1, ANDERE EIMER: B nimmt die untersten Eimer
 *    (< E1.anteil_prozent), B2 die obersten (>= 100 - E2.anteil_prozent). Ein
 *    Besucher hat genau einen Eimer, also höchstens einen Arm; A ist die
 *    gemeinsame Kontrolle beider Tests (70/15/15). Ein eigenes Salz machte die
 *    Arme unabhängig statt ausschließend: rund 2 % der Besucher stünden in
 *    beiden, und B rendert immer B.
 *  - B BLEIBT, WIE ER IST: dieselbe Eimer-Funktion, dieselbe Grenze, dieselbe
 *    Prüfreihenfolge. Ein laufender Test wird nicht umgedeutet; die Unit-Tests
 *    halten das an einer festen Stichprobe fest.
 *  - HARTE BEDINGUNG E1 + E2 <= 100 IM CODE: wer einen der beiden Anteile
 *    hochzieht und den anderen vergisst, schaltet B2 ab (Fail-Richtung auf den
 *    Bestand), statt Eimer doppelt zu vergeben.
 *  - EIGENER SCHALTER, EIGENER KILL: E2_AKTIV (PR) und Env
 *    LP_EXP_SZS_B2_MODE=off (Handgriff). Der Kill von E1 lässt B2 laufen und
 *    umgekehrt: zwei Tests, zwei Entscheidungen.
 *  - Ausnahmen, 302 + no-store, zielUrl() und Pin wie E1: ?lp_exp=b2.
 *    Marker z (belegt: w r h p b f v m x s q k n).
 *  - Die Ad-Weiche schließt LP_EXP_B2_PFAD aus (ad-weiche.server.js). Ohne
 *    diese Zeile schickte sie bezahlten Verkehr von B2 zurück auf A, A würfelte
 *    denselben Eimer und schickte ihn wieder auf B2: eine Schleife.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Ziel-Route der Variante B2. EINE Definition (ad-weiche importiert sie). */
export const LP_EXP_B2_PFAD = '/pages/schlaf-zellen-schutz-b2';

/** Marker in der Ziel-URL: z = zweiter Arm (unterscheidbar von allen belegten). */
export const LP_EXP_B2_MARKER = 'z';

/** Zweiter Arm. Gleiches Salz wie E1 (ausschließend), oberste Eimer. */
export const E2 = Object.freeze({
  id: 'szs-e2-gs126',
  hypothese_id: 'GS-126',
  salz: E1.salz,
  anteil_prozent: 15,
});

/** Code-Schalter von B2; false = kein Besucher auf B2. */
export const E2_AKTIV = true;

/**
 * B2 läuft nur, wenn der Code-Schalter steht, die Env ihn nicht abschaltet
 * (NUR 'off' schaltet ab), beide Arme dasselbe Salz tragen und zusammen
 * höchstens 100 Eimer brauchen. Jede verletzte Bedingung heißt: B2 aus.
 */
export function experimentB2Aktiv(env, codeSchalter = E2_AKTIV, e1 = E1, e2 = E2) {
  if (!codeSchalter) return false;
  if (env && env.LP_EXP_SZS_B2_MODE === 'off') return false;
  if (e2.salz !== e1.salz) return false;
  if (!(e1.anteil_prozent + e2.anteil_prozent <= 100)) return false;
  return e2.anteil_prozent > 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * KURZ-ARME K50 UND K25 (Job 20261017-ads-lp-radikal-kurz-tests-gs079-durch-
 * sim-tor; Christian 17.10.2026: „und auch mal radikale Ideen testen, wo die
 * LP für die Ads deutlich kürzer ist. Also eine Gewinner-LP dann kürzen, um
 * zu schauen, wie die Effekte sind.").
 *
 * K50 = Stufe-1-Paket GS-079 (rund 50 % der Seite), K25 = Radikal-Kurz GS-174
 * (rund 25 %: Kopf, Bewertungen, Garantie, Preisblock). Definition und
 * Begründung vollständig in heatmap-manager/config/experimente.yaml
 * (szs-e3-gs079, szs-e4-gs174; Namen K50/K25 statt B3/B4, weil „B3“ im Stufenplan
 * schon den Sticky-Arm GS-127 meint).
 *
 * ENTSCHEIDE, je begründet:
 *  - SCHARF SEIT DEM MERGE VOM 28.10.2026: E3_AKTIV und E4_AKTIV stehen auf
 *    true. Bedingung war, dass das Sim-Tor die Fassung je Gerät bestanden hat
 *    (heatmap-manager kreislauf start-freigabe <id> exit 0, beide am
 *    2026-10-28T05:20Z) und B von szs-e1-gs050 sein Urteil hat (20.10.).
 *    Zurück: Schalter auf false (PR) oder Env-Kill unten.
 *  - DASSELBE SALZ WIE E1, EIGENE EIMER: K50 übernimmt die Eimer von B
 *    (< 15), K25 die nächsten (15 bis 29). B2 behält die obersten. Ein Besucher
 *    hat genau einen Eimer, also höchstens einen Arm.
 *  - K50 UND B ZUGLEICH GEHT NICHT: K50 nimmt die Eimer von B. Steht E1 noch,
 *    ist K50 aus (Fail-Richtung auf den laufenden Test). Ein laufender Test wird
 *    nicht gestoppt, nur weil ein neuer bereitsteht.
 *  - HARTE BEDINGUNG IM CODE: die Eimer der Kurz-Arme dürfen die von B2 nicht
 *    berühren (E4-Ende <= 100 - E2.anteil_prozent). Sonst ist K25 aus.
 *  - EIGENE SCHALTER, EIGENE KILLS: Env LP_EXP_SZS_K50_MODE=off bzw.
 *    LP_EXP_SZS_K25_MODE=off. Pins ?lp_exp=k50 | k25. Marker c (K50) und d (K25) (belegt:
 *    w r h p b f v m x s q k n z).
 *  - Die Ad-Weiche schließt beide Pfade aus (ad-weiche.server.js), sonst
 *    schickte sie bezahlten Verkehr zurück auf A: dieselbe Schleife wie bei B2.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Ziel-Route der Variante K50 (GS-079). EINE Definition (ad-weiche importiert sie). */
export const LP_EXP_K50_PFAD = '/pages/schlaf-zellen-schutz-k50';

/** Ziel-Route der Variante K25 (Radikal-Kurz). EINE Definition. */
export const LP_EXP_K25_PFAD = '/pages/schlaf-zellen-schutz-k25';

/** Marker in der Ziel-URL: c = K50, d = K25 (unterscheidbar von allen belegten). */
export const LP_EXP_K50_MARKER = 'c';
export const LP_EXP_K25_MARKER = 'd';

/** K50: Eimer [0, 15) desselben Salzes, also die Eimer von B. */
export const E3 = Object.freeze({
  id: 'szs-e3-gs079',
  hypothese_id: 'GS-079',
  salz: E1.salz,
  eimer_ab: 0,
  anteil_prozent: 15,
});

/** K25: Eimer [15, 30) desselben Salzes. */
export const E4 = Object.freeze({
  id: 'szs-e4-gs174',
  hypothese_id: 'GS-174',
  salz: E1.salz,
  eimer_ab: 15,
  anteil_prozent: 15,
});

/** Code-Schalter der Kurz-Arme; false = kein Besucher auf K50 bzw. K25. */
export const E3_AKTIV = true;
export const E4_AKTIV = true;

/**
 * Ein Kurz-Arm läuft nur, wenn sein Code-Schalter steht, die Env ihn nicht
 * abschaltet (NUR 'off'), er dasselbe Salz trägt wie E1, seine Eimer in
 * [0, 100 - E2.anteil_prozent) liegen und B (E1) diese Eimer nicht mehr belegt.
 */
export function experimentKurzAktiv(
  env,
  e,
  codeSchalter,
  envName,
  e1An = experimentAktiv(env),
  e2 = E2,
) {
  if (!codeSchalter) return false;
  if (env && env[envName] === 'off') return false;
  if (e.salz !== E1.salz) return false;
  if (!(e.anteil_prozent > 0)) return false;
  if (e.eimer_ab < 0 || e.eimer_ab + e.anteil_prozent > 100 - e2.anteil_prozent) return false;
  if (e1An && e.eimer_ab < E1.anteil_prozent) return false;
  return true;
}

/**
 * Reine Entscheidungsfunktion: {ziel, eimer, arm} wenn dieser Request
 * Variante B (arm 'b'), B2 (arm 'b2'), K50 (arm 'k50') oder K25 (arm 'k25')
 * sehen soll, sonst null. Ohne
 * Client-IP gibt es keine stabile Zuteilung — dann A (Fail-Richtung auf den
 * Bestand). Pins: ?lp_exp=a | b | b2 | k50 | k25; ein Pin auf einen abgeschalteten Arm
 * zeigt A.
 */
export function entscheideLpExperiment(
  request,
  env,
  codeSchalter = E1_AKTIV,
  codeSchalterB2 = E2_AKTIV,
  codeSchalterK50 = E3_AKTIV,
  codeSchalterK25 = E4_AKTIV,
) {
  if (!request || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  const bAn = experimentAktiv(env, codeSchalter);
  const b2An = experimentB2Aktiv(env, codeSchalterB2);
  const k50An = experimentKurzAktiv(env, E3, codeSchalterK50, 'LP_EXP_SZS_K50_MODE', bAn);
  const k25An = experimentKurzAktiv(env, E4, codeSchalterK25, 'LP_EXP_SZS_K25_MODE', bAn);
  if (!bAn && !b2An && !k50An && !k25An) return null;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.data')) return null;
  if (url.searchParams.has('_data')) return null;
  const nachB = () => zielUrl(LP_EXP_B_PFAD, url.search, LP_EXP_MARKER);
  const nachB2 = () => zielUrl(LP_EXP_B2_PFAD, url.search, LP_EXP_B2_MARKER);
  const nachK50 = () => zielUrl(LP_EXP_K50_PFAD, url.search, LP_EXP_K50_MARKER);
  const nachK25 = () => zielUrl(LP_EXP_K25_PFAD, url.search, LP_EXP_K25_MARKER);
  const pin = url.searchParams.get('lp_exp');
  if (pin === 'a') return null;
  if (pin === 'b') return bAn ? {ziel: nachB(), eimer: -1, arm: 'b'} : null;
  if (pin === 'b2') return b2An ? {ziel: nachB2(), eimer: -1, arm: 'b2'} : null;
  if (pin === 'k50') return k50An ? {ziel: nachK50(), eimer: -1, arm: 'k50'} : null;
  if (pin === 'k25') return k25An ? {ziel: nachK25(), eimer: -1, arm: 'k25'} : null;
  const ua = request.headers?.get?.('user-agent') || '';
  const ip = request.headers?.get ? buyerIpAusRequest(request) : '';
  if (istInternerZugriff({userAgent: ua, ip})) return null;
  if (!ip) return null;
  const eimer = besucherEimer(ip, ua, E1.salz);
  if (bAn && eimer < E1.anteil_prozent) return {ziel: nachB(), eimer, arm: 'b'};
  if (b2An && eimer >= 100 - E2.anteil_prozent) return {ziel: nachB2(), eimer, arm: 'b2'};
  const imArm = (e) => eimer >= e.eimer_ab && eimer < e.eimer_ab + e.anteil_prozent;
  if (k50An && imArm(E3)) return {ziel: nachK50(), eimer, arm: 'k50'};
  if (k25An && imArm(E4)) return {ziel: nachK25(), eimer, arm: 'k25'};
  return null;
}
