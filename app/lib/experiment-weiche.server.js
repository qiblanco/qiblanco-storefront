/**
 * SEITEN-EXPERIMENTE (Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-
 * startseite, Segment s05, Christian 06.10.2026): gestartet mit 15 % der
 * Besucher der Startseite / und der Shopseite /pages/qione-2-pro, die je eine
 * Rookie-Seite sahen. SSoT des Verhaltens: claude-jobs/<job>/KONZEPT.md
 * Abschnitt 2 und 7.
 *
 *   GET /            -> Loader _index.jsx           -> 302 /pages/start-b       (50 %)
 *   GET /pages/qione-2-pro -> beendet 21.10.2026 (aktiv: false), alle sehen A
 *   GET /pages/produktberatung -> Loader pages.produktberatung.jsx
 *                                 -> 302 /pages/produktberatung-b       (50 %)
 *
 * SHOPSEITE SEIT 14.10.2026 AUF 50 % (Fix-Segment s08 desselben Grossjobs;
 * Entscheidung Coworker A 07.10. im Auftrag Christians: nach 7 Tagen ohne
 * Schaden von 15 auf 50 %, je Experiment nach vorab festgeschriebener Regel).
 * q2p-e1-gs080 erfüllte sie an Tag 7 (P(B < A) 0,59 unter 0,80, Schutz
 * Kassenstart greift nicht), die Startseite nicht (P(B < A) 0,89): sie bleibt
 * bei 15 %. Salz und id bleiben, also bleiben die Eimer 0-14 auf B und die
 * Eimer 15-49 wechseln von A nach B. Die Auswertung schichtet deshalb nach
 * Epochen konstanter Zuteilung (heatmap-manager, anteil_verlauf). Rückweg auf
 * 15 % reiht der Heatmap-Kreislauf selbst ein, sobald die Anhebungsregel nicht
 * mehr trägt (experimente.yaml anteil_ruecklauf).
 *
 * STAND 21.10.2026 (Fix-Segment s09, Eigner-Entscheidung s07-r2; Anlass
 * Christians Auftrag 15.10. „kein Test ohne Entscheidung länger als 14 Tage“):
 *  - Startseite start-e1-gs081: mobil und Tablet von 15 auf 50 % (Desktop
 *    steht seit 18.10. auf 50 %). Bei 15 % käme mobil vor dem Deckel kein
 *    Urteil. Regel #52 am 21.10. erfüllt: P(B < A) 0,25 unter 0,80, Schutz
 *    Warenkorb greift nicht. Salz und id bleiben: Eimer 0-14 bleiben B, Eimer
 *    15-49 wechseln von A nach B.
 *  - Shopseite q2p-e1-gs080: beendet wegen Aussichtslosigkeit, A bleibt
 *    (vorgezogene Folge „nach 42 Tagen ohne Urteil: kein nachweisbarer
 *    Unterschied“; bei diesem Verkehr bringen 42 Tage rechnerisch kein Urteil).
 *    Code-Schalter aktiv: false, die Zeile bleibt als Beleg stehen; auch der
 *    Pin ?shop_exp=b lenkt nicht mehr um. /pages/qione-2-pro-b bleibt dunkel
 *    erreichbar (noindex).
 *
 * EIGENER DESKTOP-ANTEIL DER STARTSEITE (Grossjob vom 10.10.2026 „LP-Tests
 * Geräte getrennt", Fix-Segment s06; Christian
 * 10.10.2026: „dass Desktop und Responsive immer getrennt voneinander bewertet
 * wird"). Mit 15 % erreicht Desktop auf der Startseite bis zum Deckel rund 62
 * von 100 B-Sitzungen, also nie ein eigenes Urteil. start-e1-gs081 teilt
 * Desktop deshalb mit anteil_prozent_desktop 50, mobil und Tablet bleiben bei
 * anteil_prozent 15. Herleitung: die Anhebungsregel #52 des Rookie-Grossjobs
 * (nach 7 Tagen ohne Schaden, P(B < A) < 0,80) je Gerät; Desktop stand am
 * 17.10. bei P(B < A) 0,36. Die Geräteklasse ist dieselbe wie in der
 * anonymen Zählung (geraeteKlasse in entry.server.jsx, Receiver
 * basis.device_class): Tablet zählt zu mobil. Salz und id bleiben, also bleiben
 * die Desktop-Eimer 0-14 auf B und die Eimer 15-49 wechseln von A nach B. Die
 * Auswertung schichtet nach Epoche x Gerät, das SRM prüft je Gerät
 * (heatmap-manager experimente.yaml: anteil_verlauf mit Gerätefeld desktop).
 * KILL nur für Desktop: Env EXP_START_DESKTOP_MODE=off, dann gilt auch auf
 * Desktop wieder anteil_prozent. SSoT: KONZEPT-s06 im Job-Ordner des
 * Grossjobs (Desktop-Testdesign).
 *
 * DRITTER EINTRAG pb-e1-gs107 (Grossjob 20261008-GROSSJOB-produktberatung-
 * christians-text-und-seite-optimieren, s02; Christian 08.10.2026: „Live heißt
 * Test-Kreislauf, nicht nur Bericht"): die Beratungsseite, A = Christians Text +
 * heutiger Rest, B = Christians Text gleich + umgebauter Rest. 50 % statt 15 %,
 * weil die Seite rund 15 Aufrufe am Tag hat: bei zwei Armen gibt die gleiche
 * Aufteilung bei gleichem Verkehr die kleinste Unsicherheit über den Unterschied.
 * Der Loader von A lenkt NIE um, wenn ?b=, ?verwalten oder ?status anliegt
 * (Mail-Link, Verwalten, Bestätigung nach dem Buchen). pin_param ist bewusst
 * dasselbe `shop_exp` wie bei q2p: Pins sind nur für Messwerkzeuge, jeder Loader
 * fragt seine EIGENE id ab, und die Aufträge der Segmente s05/s06 messen B mit
 * ?shop_exp=b.
 *
 * NICHT DOPPELT GEBAUT: Hash (fnv1a/besucherEimer) kommt aus lp-ab-v2.server.js,
 * das Ziel aus zielUrl() (go-router-logic.js), der eigene Verkehr aus
 * interner-verkehr.js, die Bot-Erkennung aus isbot (schon in entry.server.jsx).
 * lp-ab-v2.server.js (LP-Experiment E1) bleibt unberührt. Neu sind nur die
 * Tabelle der Seiten-Experimente und zwei Unterschiede zur LP-Weiche:
 *
 *  1. CRAWLER UND VORSCHAU-BOTS SEHEN IMMER A. / ist die wichtigste Seite der
 *     Markensuche; ein Suchmaschinen-Crawler darf nie einen 302 auf eine
 *     noindex-Seite sehen. Die Liste SUCH_UND_VORSCHAU_CRAWLER greift sogar vor
 *     dem Pin. Generische Bots (isbot, auch HeadlessChrome) sehen ebenfalls A,
 *     aber erst nach dem Pin, damit unsere Messwerkzeuge B per Pin erreichen.
 *  2. .data-REQUESTS SIND NICHT AUSGESCHLOSSEN. React Router gibt dem Loader bei
 *     Client-Navigation eine URL ohne .data, aber mit ?_routes=… (gemessen an
 *     react-router 7.16.0, handleSingleFetchRequest). Der Ausschluss der
 *     LP-Weiche greift deshalb nie. Hier ist das gewollt: ein B-Besucher, der
 *     auf Logo oder Kaufknopf klickt, bleibt in B (Arm-Treue). Aus dem Ziel
 *     werden _routes und index gestrichen; der übrige Query fährt byte-gleich
 *     mit (fbclid, gclid, gad_*, utm_*), dazu der Marker lp_m=<buchstabe>.
 *
 * Zuteilung: Eimer = fnv1a(salz|ip|ua) % 100, Eimer < anteil -> B; anteil ist
 * anteil_prozent_desktop für Desktop, wenn die Zeile ihn trägt, sonst
 * anteil_prozent. Nichts wird
 * gesetzt oder gespeichert, kein Cookie. Ohne Client-IP gibt es keine stabile
 * Zuteilung, dann A. Eigener Verkehr (Server-IP, Marker-UA) bleibt auf A.
 * Pin für Messwerkzeuge: ?start_exp=a|b bzw. ?shop_exp=a|b.
 *
 * KILL je Experiment: Code-Schalter `aktiv` (PR) ODER Env EXP_START_MODE=off,
 * EXP_SHOP_MODE=off bzw. EXP_PB_MODE=off (Handgriff). Nur 'off' schaltet ab.
 * Antwort: 302 + Cache-Control no-store (wie E1), gesetzt im Loader.
 *
 * Die Werte jeder Zeile stehen gleichlautend in
 * heatmap-manager/config/experimente.yaml (aktiv[].weiche); die Naht-Probe
 * heatmap-manager/pruefungen/probe_seiten_weiche_naht.py vergleicht beide.
 *
 * CROSS-BOUNDARY-LINKAGE: kein neuer Identitäts-Key, kein Set-Cookie, keine
 * Änderung an TRACKING_COOKIE_NAMES. Der rohe Query reist unverändert mit.
 */
import {isbot} from 'isbot';
import {zielUrl} from './go-router-logic.js';
import {buyerIpAusRequest, istInternerZugriff} from './interner-verkehr.js';
import {besucherEimer} from './lp-ab-v2.server.js';

/**
 * Laufende Seiten-Experimente. Neuer Test = neue id + neues Salz.
 * marker: Buchstabe für lp_m (belegt sind w r f v x m h p b n s q k).
 */
export const SEITEN_EXPERIMENTE = Object.freeze({
  'start-e1-gs081': Object.freeze({
    id: 'start-e1-gs081',
    hypothese_id: 'GS-081',
    pfad_a: '/',
    pfad_b: '/pages/start-b',
    salz: 'start-e1-gs081',
    anteil_prozent: 50,
    anteil_prozent_desktop: 50,
    pin_param: 'start_exp',
    env_kill: 'EXP_START_MODE',
    env_kill_desktop: 'EXP_START_DESKTOP_MODE',
    marker: 's',
    aktiv: true,
  }),
  'q2p-e1-gs080': Object.freeze({
    id: 'q2p-e1-gs080',
    hypothese_id: 'GS-080',
    pfad_a: '/pages/qione-2-pro',
    pfad_b: '/pages/qione-2-pro-b',
    salz: 'q2p-e1-gs080',
    anteil_prozent: 50,
    pin_param: 'shop_exp',
    env_kill: 'EXP_SHOP_MODE',
    marker: 'q',
    aktiv: false, // beendet 21.10.2026 (Aussichtslosigkeit, A bleibt), Zeile bleibt als Beleg
  }),
  'pb-e1-gs107': Object.freeze({
    id: 'pb-e1-gs107',
    hypothese_id: 'GS-107',
    pfad_a: '/pages/produktberatung',
    pfad_b: '/pages/produktberatung-b',
    salz: 'pb-e1-gs107',
    anteil_prozent: 50,
    pin_param: 'shop_exp',
    env_kill: 'EXP_PB_MODE',
    marker: 'k',
    aktiv: true,
  }),
});

/**
 * Such- und Vorschau-Crawler (KONZEPT 2.3), Teilstring, Groß/klein egal.
 * Sie sehen A auch mit Pin. Die generischen Muster bot/crawler/spider deckt
 * isbot ab, ohne Gerätenamen wie CUBOT zu treffen.
 */
export const SUCH_UND_VORSCHAU_CRAWLER = Object.freeze([
  'googlebot',
  'google-inspectiontool',
  'adsbot',
  'mediapartners',
  'apis-google',
  'storebot-google',
  'bingbot',
  'duckduckbot',
  'yandexbot',
  'baiduspider',
  'applebot',
  'facebookexternalhit',
  'facebot',
  'meta-externalagent',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'whatsapp',
  'telegrambot',
  'petalbot',
  'semrush',
  'ahrefs',
  'gptbot',
  'claudebot',
  'ccbot',
]);

/** true für einen Such- oder Vorschau-Crawler aus der Liste. */
export function istSuchOderVorschauCrawler(userAgent) {
  const u = (userAgent || '').toLowerCase();
  if (!u) return false;
  return SUCH_UND_VORSCHAU_CRAWLER.some((m) => u.includes(m));
}

/** Code-Schalter UND Env-Kill: nur der Env-Wert 'off' schaltet ab. */
export function seitenExperimentAktiv(exp, env) {
  if (!exp || !exp.aktiv) return false;
  return !(env && env[exp.env_kill] === 'off');
}

/**
 * Grobe Geräteklasse wie die anonyme Zählung (geraeteKlasse in
 * entry.server.jsx, Receiver basis.device_class): mobile | tablet | desktop.
 * Der Rumpf ist zeichengleich mit dem in entry.server.jsx; der Test
 * experiment-weiche.test.js hält beide gleich, sonst zählte das SRM je Gerät
 * eine andere Klasse als die, nach der die Weiche teilt.
 * @param {string} ua
 */
export function geraeteKlasse(ua) {
  const u = ua.toLowerCase();
  if (/ipad|tablet|playbook|kindle|silk|nexus [79]/.test(u)) return 'tablet';
  if (u.includes('android') && !u.includes('mobi')) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|windows phone|opera mini/.test(u)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Anteil B in Prozent für diesen Besucher: anteil_prozent_desktop für die
 * Klasse desktop, wenn die Zeile ihn trägt und EXP_*_DESKTOP_MODE nicht 'off'
 * ist; sonst anteil_prozent (mobil, Tablet, jede Zeile ohne eigenen Anteil).
 */
export function anteilProzentFuer(exp, userAgent, env) {
  const eigen = exp.anteil_prozent_desktop;
  if (typeof eigen !== 'number') return exp.anteil_prozent;
  if (exp.env_kill_desktop && env && env[exp.env_kill_desktop] === 'off') return exp.anteil_prozent;
  return geraeteKlasse(userAgent || '') === 'desktop' ? eigen : exp.anteil_prozent;
}

const INTERNE_PARAMETER = new Set(['_routes', 'index']);

function parameterName(teil) {
  const roh = teil.split('=')[0];
  try {
    return decodeURIComponent(roh.replace(/\+/g, ' '));
  } catch {
    return roh;
  }
}

/**
 * Roher Query ohne die React-Router-Parameter _routes und index. Ohne diese
 * Parameter kommt der Query byte-gleich zurück; sonst bleiben alle übrigen
 * Teile in Reihenfolge und Schreibweise erhalten.
 */
export function zielSuche(search) {
  if (!search || search === '?') return '';
  const roh = search.startsWith('?') ? search.slice(1) : search;
  const teile = roh.split('&');
  const behalten = teile.filter((teil) => !INTERNE_PARAMETER.has(parameterName(teil)));
  if (behalten.length === teile.length) return search.startsWith('?') ? search : `?${search}`;
  const rest = behalten.filter((teil) => teil !== '');
  return rest.length ? `?${rest.join('&')}` : '';
}

/**
 * Reine Entscheidungsfunktion: {ziel, eimer, id} wenn dieser Request die
 * Rookie-Seite sehen soll, sonst null (= A rendert unverändert).
 *
 * @param {Request} request
 * @param {Record<string, string> | undefined} env
 * @param {string} experimentId  Schlüssel in SEITEN_EXPERIMENTE
 * @param {Record<string, object>} [tabelle]  nur für Tests
 */
export function entscheideSeitenExperiment(request, env, experimentId, tabelle = SEITEN_EXPERIMENTE) {
  const exp = tabelle[experimentId];
  if (!exp) return null;
  if (!request || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  if (!seitenExperimentAktiv(exp, env)) return null;
  const ua = request.headers?.get?.('user-agent') || '';
  if (istSuchOderVorschauCrawler(ua)) return null;
  const url = new URL(request.url);
  const ziel = () => zielUrl(exp.pfad_b, zielSuche(url.search), exp.marker);
  const pin = url.searchParams.get(exp.pin_param);
  if (pin === 'a') return null;
  if (pin === 'b') return {ziel: ziel(), eimer: -1, id: exp.id};
  if (isbot(ua)) return null;
  const ip = request.headers?.get ? buyerIpAusRequest(request) : '';
  if (istInternerZugriff({userAgent: ua, ip})) return null;
  if (!ip) return null;
  const eimer = besucherEimer(ip, ua, exp.salz);
  if (eimer >= anteilProzentFuer(exp, ua, env)) return null;
  return {ziel: ziel(), eimer, id: exp.id};
}
