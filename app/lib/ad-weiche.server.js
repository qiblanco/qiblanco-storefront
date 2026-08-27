/**
 * AD-TRAFFIC-WEICHE (Auftrag 20260724-ads-umleiten-schlafzellen-v2, Christian
 * 2026-07-24: ALLE Ads landen auf LP A /pages/schlaf-zellen-schutz — real live):
 * Erkennt Ad-Klick-Traffic am ANKOMMENDEN Request (URL-Marker) auf JEDER
 * Dokument-Route und leitet ihn serverseitig 302 auf LP A um — die Ad-Configs
 * (Meta/Google) bleiben UNANGETASTET (Redirect-Layer-Praezisierung wie
 * lp-pause.server.js, Engagement-/Lernphasen-Erhalt). Die lp-pause-Weiche
 * (2 LP-B-Routen, unkonditional solange modus='aus') bleibt unveraendert
 * bestehen; diese Weiche deckt zusaetzlich alle uebrigen Ad-Eintritte
 * (Startseite = 16 aktive Meta-Ads, Google-Brand, Story-Ads, kuenftige Ziele).
 *
 * ERKENNUNG (gemessen events.db Erstlandungen 7T, jobmem s01 dieses Auftrags):
 *  - VETOS zuerst (NIE umleiten, Richtung Vorsicht = normale Seite zeigen):
 *    utm_source=r3check (synthetische Healthcheck-Probe), utm_content=
 *    link_in_bio (IG-Bio, organisch), utm_medium social/email/referral/
 *    company_profile (organische Kanaele).
 *  - meta-paid: utm_medium=paid — das EINE Meta-URL-Template aller Konten
 *    (utm_source=facebook&utm_campaign={campaign.id}&utm_content={ad.id});
 *    1.599 Erstlandungen/7T allein auf '/'.
 *  - google-paid: gclid/gbraid/wbraid (Auto-Tagging; 38/7T auf '/').
 *  - weitere-paid: ttclid/msclkid (Dekret "ggf. weitere Kanaele", vorbereitet).
 *  - fbclid ALLEIN ist KEIN Paid-Marker: organische FB-Shares tragen ihn
 *    (56/7T, referrer l.facebook.com) — bewusst NICHT umleiten.
 *
 * AUSSCHLUESSE:
 *  - LP A selbst + /go (Ziel bzw. eigener Router — Loop unmöglich).
 *  - /products/* NUR für google-paid: Google-Shopping/PMax MÜSSEN auf der
 *    PDP landen (Merchant-Center-Policy Landing=Produktdaten, Suspend-Risiko;
 *    Shopping-Ad 645809256666 = größter Google-Traffic). meta-paid auf PDP
 *    wird umgeleitet (Dekret ALLE).
 *  - Infra/Nicht-Dokument: *.data (React-Router-Datenrequests), _data-Query,
 *    /collect, /b, /api, /cart, /checkouts, /account, /policies, /assets,
 *    /build, /cdn, /.well-known sowie Prefixe /__qb, /sitemap, /robots,
 *    /favicon, /apple-. Segment-genau gematcht — /blogs faellt NICHT unter /b.
 *  - ZIELSEITEN-AUSNAHME (AUSNAHME_ZIELSEITEN, s.u.): die Anzeige hat DIESE
 *    Seite ausdruecklich versprochen — die Weiche haelt das Versprechen.
 *
 * SCHALTER (dynamisch, ohne Deploy): zuteilung.json ROH-Feld "ad_weiche".
 * NUR der explizite Wert 'aus' deaktiviert; Abwesenheit/Fetch-Fehler = AKTIV
 * (fail-soft Richtung des dekretierten Zustands, wie lp-pause Richtung LP A).
 * ACHTUNG: validiereZuteilung() normalisiert und strippt unbekannte Felder —
 * deshalb liest die Weiche das ROH-JSON, nicht das validierte Objekt.
 * Kill-Kaskade: (1) zuteilung.json "ad_weiche":"aus" (~5 Min Cloudflare-Cache,
 * kein Deploy), (2) hb-deploy revert --sha <merge-sha>.
 *
 * Marker lp_m=w (w = Weiche; unterscheidbar von r/f/h/p/b in der Attribution);
 * kompletter Original-Query byte-identisch (zielUrl-Invariante) — fbclid/
 * gclid/UTM kommen auf LP A an, qpx/Pixel/fbc-Synthese greifen unveraendert.
 * Cross-Boundary-Linkage: KEIN neuer Identitaets-Key, Allowlist unberuehrt.
 */
import {ZUTEILUNG_URL} from './go-router.server.js';
import {DEFAULT_ZUTEILUNG, zielUrl} from './go-router-logic.js';
import {LP_V2_PFAD} from './lp-ab-v2.server.js';
import {LP_V3_PFAD} from './lp-v3.server.js';

export const LP_A_PFAD = DEFAULT_ZUTEILUNG.default; // '/pages/schlaf-zellen-schutz'
const FETCH_TIMEOUT_MS = 1500;

const VETO_UTM_MEDIUM = new Set(['social', 'email', 'referral', 'company_profile']);
const GOOGLE_CLICK_IDS = ['gclid', 'gbraid', 'wbraid'];
const WEITERE_CLICK_IDS = ['ttclid', 'msclkid'];

// Segment-genaue Ausschluesse: Treffer nur bei exakt gleichem Pfad oder
// '<eintrag>/...' — '/b' schließt den Beacon-Pfad aus, NICHT /blogs.
//
// LP_V2_PFAD ist SCHLEIFEN-KRITISCH (Konzept §0.3, Segment s06): LP A splittet
// seit s07 einen Teil der Eintritte per 302 auf V2, und der Original-Query
// faehrt dabei byte-identisch mit — also AUCH utm_medium=paid. Stuende V2 hier
// nicht drin, wuerfe der root-Loader den Besucher sofort wieder auf LP A, LP A
// splittete erneut auf V2, ... = Endlosschleife über den GESAMTEN bezahlten
// Traffic (seit der Weiche vom 24.07. praktisch alle Ads). Der Suffix-Slug
// wird vom LP-A-Eintrag NICHT mitgedeckt: istAusgeschlossen matcht nur exakt
// oder '<eintrag>/...' — '/pages/schlaf-zellen-schutz-v2-18ef' ist beides
// nicht. Verallgemeinerte Regel (DEV-DB): jede neue Dokument-Route gegen diese
// Liste prüfen — und jede Route, die ihrerseits weiterleitet, doppelt.
export const AUSSCHLUSS_SEGMENTE = [
  LP_A_PFAD,
  LP_V2_PFAD,
  // LP-V3 (Review-Artefakt, 20260726-lp-v3-apple-microsoft-scrollanim):
  // NICHT schleifen-kritisch (nichts leitet auf V3), aber ein GETEILTER
  // Review-Link trägt schnell fbclid/utm (Messenger/WhatsApp-Klicks) —
  // ohne Ausschluss wuerfe die Weiche den Betrachter auf LP A und die
  // Review-URL saehe „kaputt" aus. Genau die DEV-DB-Regel oben.
  LP_V3_PFAD,
  '/go',
  '/collect',
  '/b',
  '/api',
  '/cart',
  '/checkouts',
  '/account',
  '/policies',
  '/assets',
  '/build',
  '/cdn',
  '/.well-known',
];

// Echte Prefix-Ausschluesse (Dateinamens-Familien ohne Segmentgrenze).
export const AUSSCHLUSS_PREFIXE = ['/__qb', '/sitemap', '/robots', '/favicon', '/apple-'];

/**
 * ZIELSEITEN-AUSNAHME (Auftrag 20260827-ad-weiche-ausnahme-mof-beweis-ad-prio40).
 *
 * WARUM ES DIESEN ZAUN GIBT — erst lesen, dann beschneiden. Christians Dekret
 * vom 2026-07-24 lautet "ALLE Ads landen auf LP A", und es wurde als
 * REDIRECT-Layer gebaut, damit die Ad-Configs unangetastet bleiben (Meta-
 * Lernphase/Engagement). Zum Zeitpunkt des Dekrets zeigte KEINE Anzeige
 * absichtlich auf eine Beweis-Seite: die Ziele waren Startseite, PDPs und
 * generische Seiten, bei denen LP A nachweislich das bessere Ziel ist. Genau
 * dieser Fall ist hier NICHT gemeint.
 *
 * WAS NEU IST. Die vier Anzeigen zu ads.db qb45-c12 ("So entsteht kohaerentes
 * Wasser") versprechen im Text UND auf der Endkarte woertlich "Vier Studien
 * offen einsehbar — lies sie selbst". Ihr link_url zeigt deshalb auf
 * /pages/studien. Ohne diese Ausnahme loest der Klick das Versprechen nicht
 * ein: gemessen am 2026-08-27 landete derselbe Abruf mit fbclid+utm auf LP A.
 * Ein Versprechen im Creative, das der Klick nicht einloest, ist ein Bruch im
 * Kaufweg — und der Bruch ist teurer als der Zielseiten-Vorteil von LP A,
 * denn er trifft genau das Vertrauen, das eine Beweis-Anzeige verdienen will.
 *
 * NAECHSTER PRAEZEDENZFALL IM SELBEN BESTAND: LP_V3_PFAD oben. Auch dort ist
 * der Grund nicht "Technik", sondern "die URL wurde bewusst geteilt und muss
 * sich selbst zeigen". Diese Liste ist dieselbe Klasse, nur benannt — sie
 * steht bewusst NICHT in AUSSCHLUSS_SEGMENTE, weil dort "die Weiche geht uns
 * nichts an" steht (Infra, Loop, Ziel), hier aber "die Weiche hat erkannt und
 * bewusst durchgelassen". Der Unterschied ist im Log sichtbar (entscheidung:
 * 'ausnahme-zielseite') statt still.
 *
 * SO ENG WIE MOEGLICH: nur der versprochene Pfad, nicht die Kampagne. Eine
 * Kampagnen-Allowlist waere breiter (sie liesse DIESE Kampagne auf JEDE Seite)
 * und zugleich schwaecher: utm_campaign traegt {campaign.id}, und die ID
 * wechselt beim Re-Launch — die Ausnahme waere nach dem naechsten Neustart
 * still weg, ohne dass jemand etwas merkt. Das Versprechen haengt am ZIEL,
 * also haengt die Ausnahme am Ziel.
 *
 * WAS DAS AN DER MESSUNG VERSCHIEBT (bewusst, nicht still — arch-context
 * fallen ads, Zirkularitaets-Falle): bisher galt baulich "jeder bezahlte
 * Erst-Einstieg ist LP A" (Ausnahme google-paid auf /products/*). Ab hier
 * kann auch /pages/studien bezahlte Erst-Einstiege sehen. Das kippt die
 * LP-Ad-Signal-Sprosse NICHT: /pages/studien steht bewusst nicht in
 * hyros-eigenbau/journey/lp_registry.json (crawlbare Front-Seite, bleibt ohne
 * weiteres Signal 'direct'), und weil hier GAR NICHT umgeleitet wird, kommen
 * fbclid/gclid/utm unveraendert an — channel.infer entscheidet also am
 * Klick-Signal, nicht am Pfad. Die 6 Message-Match-LPs bleiben unberuehrt.
 *
 * JEDER NEUE EINTRAG BRAUCHT: eine Anzeige, die diese Seite woertlich
 * verspricht, und einen Blick in lp_registry.json (steht der Pfad dort, wird
 * er zum Paid-Beleg — dann ist die Ausnahme eine Messverschiebung und keine
 * Kaufweg-Reparatur mehr).
 */
export const AUSNAHME_ZIELSEITEN = ['/pages/studien'];

/** true, wenn die Anzeige genau diesen Pfad versprochen hat (Segment-genau). */
export function istAusnahmeZielseite(pfad) {
  for (const seg of AUSNAHME_ZIELSEITEN) {
    if (pfad === seg || pfad.startsWith(`${seg}/`)) return true;
  }
  return false;
}

/** true, wenn die Weiche auf diesem Pfad grundsaetzlich nie feuert. */
export function istAusgeschlossen(pfad) {
  for (const seg of AUSSCHLUSS_SEGMENTE) {
    if (pfad === seg || pfad.startsWith(`${seg}/`)) return true;
  }
  for (const pre of AUSSCHLUSS_PREFIXE) {
    if (pfad.startsWith(pre)) return true;
  }
  return false;
}

/**
 * Klassifiziert die Query-Marker: 'meta-paid' | 'google-paid' | 'weitere-paid'
 * oder null (kein Paid-Klick bzw. Veto).
 */
export function klassifizierePaid(searchParams) {
  if (searchParams.get('utm_source') === 'r3check') return null;
  if (searchParams.get('utm_content') === 'link_in_bio') return null;
  const medium = (searchParams.get('utm_medium') || '').toLowerCase();
  if (VETO_UTM_MEDIUM.has(medium)) return null;
  if (medium === 'paid') return 'meta-paid';
  for (const key of GOOGLE_CLICK_IDS) {
    if (searchParams.get(key)) return 'google-paid';
  }
  for (const key of WEITERE_CLICK_IDS) {
    if (searchParams.get(key)) return 'weitere-paid';
  }
  return null;
}

/**
 * Volle Entscheidung (hermetisch testbar). Drei unterscheidbare Ausgaenge —
 * die Unterscheidung ist der Zweck, siehe AUSNAHME_ZIELSEITEN:
 *   null                                  kein Paid-Klick / Veto / Ausschluss
 *   {erkennung, ziel}                     umleiten auf LP A
 *   {erkennung, ziel:null, ausnahme:...}  Paid ERKANNT und bewusst durchgelassen
 * Ziel = LP A + kompletter Original-Query byte-identisch + lp_m=w.
 */
export function entscheideAdWeicheDetail(requestUrl) {
  const url = new URL(requestUrl);
  const pfad = url.pathname;
  if (pfad.endsWith('.data')) return null;
  if (url.searchParams.has('_data')) return null;
  if (istAusgeschlossen(pfad)) return null;
  const erkennung = klassifizierePaid(url.searchParams);
  if (!erkennung) return null;
  // Die Anzeige hat diese Seite versprochen -> sie bekommt sie, unveraendert.
  if (istAusnahmeZielseite(pfad)) {
    return {erkennung, ziel: null, ausnahme: 'zielseite'};
  }
  if (erkennung === 'google-paid' && (pfad === '/products' || pfad.startsWith('/products/'))) {
    return {erkennung, ziel: null, ausnahme: 'shopping-pdp'};
  }
  return {erkennung, ziel: zielUrl(LP_A_PFAD, url.search, 'w')};
}

/**
 * Bestands-Vertrag (unveraendert): {erkennung, ziel} NUR wenn wirklich
 * umgeleitet wird, sonst null. Ein bewusst durchgelassener Paid-Klick ist
 * hier — wie jeder andere Nicht-Redirect — null; wer den Grund braucht,
 * nimmt entscheideAdWeicheDetail.
 */
export function entscheideAdWeiche(requestUrl) {
  const detail = entscheideAdWeicheDetail(requestUrl);
  return detail && detail.ziel ? {erkennung: detail.erkennung, ziel: detail.ziel} : null;
}

/**
 * Dynamischer Schalter: zuteilung.json ROH-Feld ad_weiche. Nur der explizite
 * Wert 'aus' deaktiviert; Abwesenheit/Fehler/Timeout = aktiv (fail-soft
 * Richtung dekretiertes Standard-Ziel LP A, Muster lpTestPausiert).
 */
export async function adWeicheAktiv(fetchImpl) {
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
        : undefined;
    const res = await (fetchImpl || fetch)(ZUTEILUNG_URL, {
      signal,
      cf: {cacheTtl: 300, cacheEverything: true},
    });
    if (!res || !res.ok) throw new Error(`zuteilung-fetch status ${res && res.status}`);
    const roh = await res.json();
    return !(roh && roh.ad_weiche === 'aus');
  } catch {
    return true;
  }
}

/**
 * Glue für den root-Loader: prueft Methode + Entscheidung + Schalter und
 * liefert das Redirect-Ziel (String) oder null. Der Schalter-Fetch läuft
 * NUR bei erkanntem Paid-Marker — organischer Traffic kostet nichts.
 * Jeder Treffer wird strukturiert nach stdout geloggt (Oxygen-Logs,
 * Messbarkeits-Muster catchall.server.js).
 */
export async function pruefeAdWeiche(request, fetchImpl) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const entscheidung = entscheideAdWeicheDetail(request.url);
  if (!entscheidung) return null;
  // Bewusst durchgelassener Paid-Klick: kein Redirect, aber der Schalter-Fetch
  // entfaellt — 'aus' und 'an' fuehren hier zum selben Ergebnis.
  if (!entscheidung.ziel) {
    protokolliere(request, entscheidung);
    return null;
  }
  if (!(await adWeicheAktiv(fetchImpl))) return null;
  protokolliere(request, entscheidung);
  return entscheidung.ziel;
}

/**
 * Eine Zeile je erkanntem Paid-Klick nach stdout (Oxygen-Logs, Muster
 * catchall.server.js). Das Feld 'entscheidung' macht den Unterschied zwischen
 * "umgeleitet" und "erkannt und bewusst gelassen" ablesbar — ohne es waere
 * eine Ausnahme von "war nie bezahlt" nicht zu unterscheiden.
 */
function protokolliere(request, entscheidung) {
  try {
    console.log(
      JSON.stringify({
        typ: 'ad-weiche',
        erkennung: entscheidung.erkennung,
        entscheidung: entscheidung.ausnahme ? `ausnahme-${entscheidung.ausnahme}` : 'umgeleitet',
        pfad: new URL(request.url).pathname,
      }),
    );
  } catch {
    // Logging darf die Weiche nie brechen.
  }
}
