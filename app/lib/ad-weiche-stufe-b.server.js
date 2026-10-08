/**
 * STUFE-B-ARM DER AD-WEICHE (Funnel-Manager, Grossjob 20261007-GROSSJOB-
 * funnel-manager-customer-journey-ad-lp, Segment s02; Christian 07.10.2026:
 * „… eine Page, die sprachlich in eine ganz andere Richtung geht als Zelle
 * Schlafschutz … und die muss sich aber dann auch immer erst beweisen …
 * eventuell auch schon mal mit 15 Prozent").
 *
 * WAS ER TUT: ein Teil des bezahlten Verkehrs, den die Ad-Weiche heute auf
 * LP A (/pages/schlaf-zellen-schutz) schickt, landet stattdessen auf der
 * Stufe-B-Seite /pages/menschen-alltag („Menschen und Alltag statt Zellen").
 * Der Rest bleibt auf LP A und ist der Kontrollarm. Gemessen und geurteilt
 * wird im Kreislauf des Heatmap-Managers (config/experimente.yaml, Regel
 * vorab festgelegt in funnel-manager/config/stufen.yaml B.regel).
 *
 * ER STEHT AUS, BIS SEGMENT s04 IHN EINSCHALTET (frühestens 20.10.2026, nach
 * dem Urteil bzw. Teiltest-Deckel von szs-e1-gs050). Ein laufender Test wird
 * damit nie verlangsamt: solange der Schalter fehlt, schickt die Weiche genau
 * so viel Verkehr auf LP A wie vorher.
 *
 * SCHALTER: zuteilung.json, Roh-Feld `ad_weiche_b` — gelesen in
 * ad-weiche.server.js (stufeBAktivAusRoh), weil die ARM-NAHT-Probe von
 * lp-rotation jedes Roh-Feld nur in der Datei findet, die die Zuteilung
 * selbst holt, und es gegen HAND_FELDER hält. Diese Datei holt nichts und
 * nennt deshalb auch den Namen der Adress-Konstante nicht: schon der Name im
 * Kommentar machte sie für die Probe zu einem Leser ohne erkennbare Bauform
 * (gemessen beim Bau, MESSAUSFALL). NUR der Wert 'an' aktiviert. Abwesenheit,
 * Fetch-Fehler, Timeout und kaputtes JSON heißen AUS, also LP A wie heute
 * (Polarität wie ad_weiche_mm). Umschalten ohne Deploy, ~5 Minuten
 * Cloudflare-Cache.
 *
 * ZUTEILUNG — STABIL JE BESUCHER STATT WÜRFEL JE LANDUNG. Der Stufenplan
 * nennt den Mechanismus des Message-Match-Arms („cookieloser Würfel je
 * Landung"). Übernommen sind seine tragenden Eigenschaften: zufällig, ohne
 * Cookie, ohne Speicher auf dem Gerät, ohne Deploy umkehrbar. Geändert ist
 * die Einheit: Eimer = fnv1a(salz|ip|ua) % 100 wie bei E1 und den Seiten-
 * Experimenten (besucherEimer aus lp-ab-v2.server.js, nicht nachgebaut).
 * Grund: die Weiche feuert bei JEDEM Anzeigenklick neu. Mit einem Würfel je
 * Landung sähe derselbe Mensch beim zweiten Klick mit 85 % Wahrscheinlichkeit
 * die andere Seite und pendelte zwischen den Armen — genau das, was E1
 * ausdrücklich ausschließt. Ein eigenes Salz macht die Zuteilung unabhängig
 * von E1 und vom späteren Stufe-1-Paket (zwei Zufallsaufteilungen, faktoriell).
 *
 * ALLE BEZAHLTEN QUELLEN (Erkennungen meta-paid, google-paid, weitere-paid),
 * also genau der Verkehr, den die Weiche heute auf LP A schickt. Grund ist die
 * Messung: der Kreislauf trennt die Arme nur am Einstiegspfad, ohne
 * Quellenfilter. Auf LP A kamen in den 14 Tagen bis 07.10.2026 96,6 % der
 * Einstiege von Meta und 2,8 % aus der Google-Markensuche, die zu 57 %
 * weiterklickt (Meta: 16 %). Bekäme B nur Meta, startete B mit gut einem
 * Punkt Rückstand (A alle Quellen 17,07 %, A nur Meta 15,95 %), ohne dass die
 * Seite etwas dafür kann. Mit allen Quellen haben beide Arme denselben Mix;
 * die KPI hm_lp_weiterklick_kaufseite (nur Meta) steht je Arm in
 * je_quelle.meta. Eine künftige, hier nicht genannte Erkennung bleibt auf A,
 * bis sie in STUFE_B.erkennungen steht.
 *
 * AUSNAHMEN (Muster entscheideSeitenExperiment, experiment-weiche.server.js):
 * Such- und Vorschau-Crawler sehen immer A, auch mit Pin. Generische Bots und
 * eigener Verkehr (Server-IP, Marker-UA) bleiben auf A. Ohne Client-IP gibt
 * es keine stabile Zuteilung, dann A.
 *
 * PIN für Messwerkzeuge: ?fm_b=a | ?fm_b=b. Wirkt nur bei eingeschaltetem
 * Arm; der Schalter dominiert (Hausmuster E1, MM-Arm).
 *
 * KAUFWEG: B ändert Sprache und Inhalt, nicht den Kaufweg (Lehre GS-078). Die
 * Seite B führt mit demselben Knopf auf dieselbe Kaufseite wie LP A.
 *
 * CROSS-BOUNDARY-LINKAGE: kein neuer Identitäts-Key, kein Set-Cookie. Der
 * rohe Query reist über zielUrl() byte-gleich mit, dazu lp_m=n.
 */
import {isbot} from 'isbot';
import {buyerIpAusRequest, istInternerZugriff} from './interner-verkehr.js';
import {besucherEimer} from './lp-ab-v2.server.js';
import {istSuchOderVorschauCrawler} from './experiment-weiche.server.js';

/**
 * Das vorbereitete Experiment. Neuer Test = neue id + neues Salz. Die Werte
 * stehen gleichlautend in funnel-manager/config/stufen.yaml (B) und in der
 * Experiment-Vorlage, die Segment s04 beim Start nach heatmap-manager/config/
 * experimente.yaml übernimmt.
 * marker: Buchstabe für lp_m (belegt sind w r f v x m h p b s q).
 */
export const STUFE_B = Object.freeze({
  id: 'fm-b1-menschen-alltag',
  hypothese_id: 'GS-101',
  pfad_b: '/pages/menschen-alltag',
  salz: 'fm-b1-menschen-alltag',
  anteil_prozent: 15,
  erkennungen: Object.freeze(['meta-paid', 'google-paid', 'weitere-paid']),
  pin_param: 'fm_b',
  marker: 'n',
});

/** Ziel-Route des Arms. EINE Definition (ad-weiche importiert sie). */
export const STUFE_B_PFAD = STUFE_B.pfad_b;

/** Marker in der Ziel-URL: n = neue Richtung (Stufe B). */
export const STUFE_B_MARKER = STUFE_B.marker;

/**
 * Reine Entscheidungsfunktion: liefert den Pfad der Seite B, wenn dieser
 * Request B sehen soll, sonst null (= die Weiche bleibt bei LP A).
 *
 * @param {Request} request    der ankommende Dokument-Request
 * @param {boolean} aktiv      Ergebnis von stufeBAktivAusRoh() (ad-weiche.server.js)
 * @param {string} erkennung   klassifizierePaid(): 'meta-paid' | 'google-paid' | …
 * @param {object} [exp]       nur für Tests
 * @returns {string | null}
 */
export function stufeBZielPfad(request, aktiv, erkennung, exp = STUFE_B) {
  if (!aktiv || !request) return null;
  if (!exp.erkennungen.includes(erkennung)) return null;
  const url = new URL(request.url);
  if (url.pathname === exp.pfad_b) return null; // Schleifenschutz
  const ua = request.headers?.get?.('user-agent') || '';
  if (istSuchOderVorschauCrawler(ua)) return null;
  const pin = url.searchParams.get(exp.pin_param);
  if (pin === 'a') return null;
  if (pin === 'b') return exp.pfad_b;
  if (isbot(ua)) return null;
  const ip = request.headers?.get ? buyerIpAusRequest(request) : '';
  if (istInternerZugriff({userAgent: ua, ip})) return null;
  if (!ip) return null;
  if (besucherEimer(ip, ua, exp.salz) >= exp.anteil_prozent) return null;
  return exp.pfad_b;
}
