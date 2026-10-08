/**
 * SEITEN-EXPERIMENTE (Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-
 * startseite, Segment s05, Christian 06.10.2026): 15 % der Besucher der
 * Startseite / und der Shopseite /pages/qione-2-pro sehen je eine Rookie-Seite.
 * SSoT des Verhaltens: claude-jobs/<job>/KONZEPT.md Abschnitt 2 und 7.
 *
 *   GET /            -> Loader _index.jsx           -> 302 /pages/start-b       (15 %)
 *   GET /pages/qione-2-pro -> Loader pages.qione-2-pro.jsx -> 302 /pages/qione-2-pro-b (15 %)
 *   GET /pages/produktberatung -> Loader pages.produktberatung.jsx
 *                                 -> 302 /pages/produktberatung-b       (50 %)
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
 * Zuteilung: Eimer = fnv1a(salz|ip|ua) % 100, Eimer < anteil -> B. Nichts wird
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
    anteil_prozent: 15,
    pin_param: 'start_exp',
    env_kill: 'EXP_START_MODE',
    marker: 's',
    aktiv: true,
  }),
  'q2p-e1-gs080': Object.freeze({
    id: 'q2p-e1-gs080',
    hypothese_id: 'GS-080',
    pfad_a: '/pages/qione-2-pro',
    pfad_b: '/pages/qione-2-pro-b',
    salz: 'q2p-e1-gs080',
    anteil_prozent: 15,
    pin_param: 'shop_exp',
    env_kill: 'EXP_SHOP_MODE',
    marker: 'q',
    aktiv: true,
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
  if (eimer >= exp.anteil_prozent) return null;
  return {ziel: ziel(), eimer, id: exp.id};
}
