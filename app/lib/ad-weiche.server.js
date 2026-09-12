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
import {MM_MARKER, mmZielPfad, stehtAufEigenemMmZiel} from './ad-weiche-ziele.js';

export const LP_A_PFAD = DEFAULT_ZUTEILUNG.default; // '/pages/schlaf-zellen-schutz'
const FETCH_TIMEOUT_MS = 1500;

/**
 * AD-SCHARFER RABATTCODE (Grossjob 20260905-ads-rabattcode-sonde s03).
 *
 * ZWECK: eine Bestellung soll GENAU EINER Anzeige zugeordnet werden können.
 * Der Traeger dafür ist ein Rabattcode je Anzeige (shop-manager, Segment s02).
 * Er muss beim Kunden ankommen, OHNE dass eine Anzeige verändert wird.
 *
 * WARUM HIER UND NICHT IN DER ANZEIGE (gemessen 2026-09-05, nicht angenommen):
 *  - AdCreative ist unveraenderlich. POST /{creative_id} mit url_tags gibt
 *    HTTP 400 (subcode 1815573): der Update-Pfad kennt nur name/status/
 *    adlabels. Jede Text- oder Link-Aenderung erzwingt ein NEUES Creative
 *    -> Freigabe-Gate (net-neue Kreation) + Ad-Review + Lernphasen-Risiko.
 *  - Die Ad-ID kommt an der Landeflaeche OHNEHIN an: 14 Tage, 177.738
 *    paid-Meta-Landungen, davon 175.468 mit utm_content (98,7 %) und 96.209
 *    mit h_ad_id (54,1 %). Die beiden Traeger sind UNABHÄNGIG (Ad
 *    120251220869070704 liefert nur utm_content, Ad 120243903213670443 nur
 *    h_ad_id) — ihre VEREINIGUNG deckt 10 von 10 aktiven Anzeigen.
 *  - Ein im Anzeigentext sichtbarer Code wäre öffentlich abgreifbar; danach
 *    hiesse "Order trägt Code X" nicht mehr "Kunde kam über Ad X". Das
 *    Instrument wäre per Konstruktion keins mehr.
 *
 * MECHANIK: statt direkt auf LP A geht der Klick über die (bestehende,
 * unveraenderte) Hydrogen-Route /discount/<CODE>?redirect=<LP A>&<Original-
 * Query>. Jene Route legt den Code auf den Cart und leitet 303 auf
 * `${redirect}?${restliche Query}` weiter — der Original-Query kommt also
 * VOLLSTAENDIG auf LP A an (nur `redirect` selbst faellt weg). Gemessen:
 * 303 -> /pages/..., Cart trägt den Code, nach Warenkorb-Zeile
 * applicable=true und 4187,40 -> 3978,03 EUR. NEGATIV-KONTROLLE: ein
 * erfundener Code liefert die EXAKT gleiche 303 und denselben Cart-Cookie,
 * aber applicable=false und unveraenderten Betrag — die Weiterleitung allein
 * ist also KEIN Wirkungsbeleg.
 *
 * SCHALTER + RUECKWEG: ad-codes.json (dieselbe Herkunft wie zuteilung.json,
 * Aenderung ohne Deploy, ~5 Min Cloudflare-Cache). Feld "aktiv": nur der
 * explizite Wert true schaltet ein — Abwesenheit, Fetch-Fehler, Timeout und
 * kaputtes JSON bedeuten AUS (fail-safe in die Richtung "kein Rabatt", denn
 * der Rabatt ist eine Geldwirkung; die Weiche selbst faellt weiterhin
 * fail-soft auf LP A). Zweite Stufe: hb-deploy revert --sha <merge-sha>.
 *
 * CROSS-BOUNDARY: kein neuer Identitaets-Key in dieser Datei; der Query
 * bleibt bis auf `redirect` unveraendert und erreicht LP A wie bisher.
 */
export const AD_CODES_URL = 'https://lp.65-108-150-121.sslip.io/ad-codes.json';

/** Plattform-Ad-ID: rein numerisch, 10-20 Stellen. Gleiche Regel wie
 * hyros-eigenbau/journey/own_source.py:_AD_ID_RE — Freitext-utm_content
 * ('Facebook_UA', 'linktree', 'link_in_bio') faellt damit heraus, und zwar
 * bevor er irgendwo als Ad-ID gelesen werden kann. */
const AD_ID_RE = /^[0-9]{10,20}$/;
/** Rabattcodes sind vom Shop-Manager erzeugt (QB + Base32); alles, was hier
 * nicht passt, wird NICHT in eine URL geschrieben. */
const CODE_RE = /^[A-Za-z0-9_-]{4,32}$/;
/** Query-Schluessel, die die Zielroute selbst verbraucht. Trägt der
 * Original-Query einen davon, würde er beim Weiterleiten geloescht — dann
 * wird der Code-Weg NICHT genommen (lieber kein Rabatt als ein stiller
 * Parameter-Verlust). */
const ROUTEN_EIGENE_KEYS = ['redirect', 'return_to'];

/**
 * Die Ad-ID aus dem ankommenden Query. utm_content zuerst (98,7 % Deckung),
 * h_ad_id als zweiter, unabhaengiger Traeger (54,1 %).
 * @param {URLSearchParams} searchParams
 * @returns {string | null}
 */
export function adIdAusQuery(searchParams) {
  for (const key of ['utm_content', 'h_ad_id']) {
    const wert = (searchParams.get(key) || '').trim();
    if (AD_ID_RE.test(wert)) return wert;
  }
  return null;
}

/**
 * Reine Entscheidungsfunktion (hermetisch testbar): baut aus dem normalen
 * Weichen-Ziel das Code-Ziel — oder null, wenn irgendetwas nicht passt.
 * @param {string} weichenZiel  z.B. '/pages/schlaf-zellen-schutz?utm_...&lp_m=w'
 * @param {string | null} adId
 * @param {{aktiv?: unknown, codes?: Record<string, string>} | null} karte
 * @returns {string | null}
 */
export function rabattZiel(weichenZiel, adId, karte) {
  if (!adId || !karte || karte.aktiv !== true) return null;
  const codes = karte.codes;
  if (!codes || typeof codes !== 'object') return null;
  const code = codes[adId];
  if (typeof code !== 'string' || !CODE_RE.test(code)) return null;

  const fragezeichen = weichenZiel.indexOf('?');
  const pfad = fragezeichen === -1 ? weichenZiel : weichenZiel.slice(0, fragezeichen);
  const query = fragezeichen === -1 ? '' : weichenZiel.slice(fragezeichen + 1);
  // Schutz gegen die Phishing-Bremse der Zielroute: sie wirft jeden
  // redirect-Wert mit '//' weg und landet dann auf '/'. Ein Ziel, das dort
  // nicht ankaeme, wird hier gar nicht erst gebaut.
  if (!pfad.startsWith('/') || pfad.includes('//')) return null;
  const vorhandene = new URLSearchParams(query);
  for (const key of ROUTEN_EIGENE_KEYS) {
    if (vorhandene.has(key)) return null;
  }
  // `redirect` steht bewusst ZUERST: URLSearchParams.get liefert das erste
  // Vorkommen, und der Rest des Query faehrt unveraendert mit.
  const suffix = query ? `&${query}` : '';
  return `/discount/${encodeURIComponent(code)}?redirect=${pfad}${suffix}`;
}

/**
 * Holt die Ad->Code-Karte. Fail-SAFE (nicht fail-soft): jeder Fehler bedeutet
 * "keine Karte" und damit "kein Rabatt" — eine Geldwirkung darf nicht aus
 * einem Netzfehler entstehen.
 * @param {typeof fetch} [fetchImpl]
 */
export async function holeAdCodes(fetchImpl) {
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
        : undefined;
    const res = await (fetchImpl || fetch)(AD_CODES_URL, {
      signal,
      cf: {cacheTtl: 300, cacheEverything: true},
    });
    if (!res || !res.ok) return null;
    const roh = await res.json();
    if (!roh || typeof roh !== 'object') return null;
    return roh;
  } catch {
    return null;
  }
}

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
 * Reine Entscheidungsfunktion (hermetisch testbar): liefert
 * {erkennung, ziel} wenn dieser Request umgeleitet werden soll, sonst null.
 * Ziel = LP A + kompletter Original-Query byte-identisch + lp_m=w.
 */
export function entscheideAdWeiche(requestUrl) {
  const url = new URL(requestUrl);
  const pfad = url.pathname;
  if (pfad.endsWith('.data')) return null;
  if (url.searchParams.has('_data')) return null;
  if (istAusgeschlossen(pfad)) return null;
  const erkennung = klassifizierePaid(url.searchParams);
  if (!erkennung) return null;
  if (erkennung === 'google-paid' && (pfad === '/products' || pfad.startsWith('/products/'))) {
    return null;
  }
  return {erkennung, ziel: zielUrl(LP_A_PFAD, url.search, 'w')};
}

/**
 * Dynamischer Schalter: zuteilung.json ROH-Feld ad_weiche. Nur der explizite
 * Wert 'aus' deaktiviert; Abwesenheit/Fehler/Timeout = aktiv (fail-soft
 * Richtung dekretiertes Standard-Ziel LP A, Muster lpTestPausiert).
 */
export async function holeZuteilungRoh(fetchImpl) {
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
    return roh && typeof roh === 'object' ? roh : null;
  } catch {
    return null;
  }
}

/**
 * Kill-Schalter der Weiche selbst. Nur 'aus' deaktiviert; null (Fehler,
 * Timeout, kaputtes JSON) bedeutet AKTIV — unveraendert fail-soft in Richtung
 * des dekretierten Ziels LP A.
 * @param {unknown} roh
 */
export function adWeicheAktivAusRoh(roh) {
  return !(roh && roh.ad_weiche === 'aus');
}

export async function adWeicheAktiv(fetchImpl) {
  return adWeicheAktivAusRoh(await holeZuteilungRoh(fetchImpl));
}

/**
 * Kill-Schalter des MESSAGE-MATCH-ARMS (s04), Feld `ad_weiche_mm`.
 * NUR der explizite Wert 'an' aktiviert; Abwesenheit, Fetch-Fehler, Timeout
 * und kaputtes JSON bedeuten AUS — und "aus" heißt hier exakt das am
 * 2026-07-24 dekretierte Verhalten: alles auf LP A. Die Fail-Richtung zeigt
 * damit auf den menschlich entschiedenen Zustand, nie in das Experiment
 * hinein (Muster splitAktiv / adWeicheAktivAusRoh).
 *
 * DER FELDZUGRIFF STEHT BEWUSST IN DIESER DATEI und nicht in
 * ad-weiche-ziele.js: lp-rotation/pruefungen/probe_handfelder_ueberleben_tick.py
 * (ARM-NAHT) erzwingt, dass jedes ROH gelesene Feld drueben in HAND_FELDER
 * steht — sonst raeumt der tägliche Tick es um 05:35 weg. Ihr Detektor
 * durchsucht nur Dateien mit ZUTEILUNG_URL. Anderswo wäre das Feld
 * ungeschuetzt UND die Schutzluecke unsichtbar.
 * @param {unknown} roh
 */
export function mmAktivAusRoh(roh) {
  return Boolean(roh) && roh.ad_weiche_mm === 'an';
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
  const entscheidung = entscheideAdWeiche(request.url);
  if (!entscheidung) return null;
  // EIN Fetch für BEIDE Schalter der Zuteilung (ad_weiche = Kill der Weiche,
  // ad_weiche_mm = Kill des Message-Match-Arms). Zwei Fetches wären zwei
  // Momentaufnahmen derselben Datei und könnten sich widersprechen.
  const zuteilungRoh = await holeZuteilungRoh(fetchImpl);
  if (!adWeicheAktivAusRoh(zuteilungRoh)) return null;

  // DER KLICK IST SCHON DA, WO ER HINSOLL — dann feuert hier gar nichts mehr.
  // Ohne diese Zeile unterdrueckt der Schleifenschutz in mmZielPfad() zwar das
  // MM-Ziel, der Rest dieser Funktion läuft aber weiter, findet die
  // Paid-Marker noch im Query und wirft den Besucher mit dem Default-Ziel auf
  // LP A. Am Rand gemessen 2026-09-12 mit ad_weiche_mm='an':
  //   / -> /discount -> /pages/haelt-das-mein-leben-aus -> /discount -> LP A
  // Der Arm war damit wirkungslos, obwohl Schalter, Zielkarte und Pfadliterale
  // stimmten. Geprueft wird AD-SCHARF (stehtAufEigenemMmZiel), nicht über
  // AUSSCHLUSS_SEGMENTE: ein Eintrag dort schaltete die Weiche auf den
  // MM-Seiten für ALLE Anzeigen ab, auch für die nicht zugeordneten — das
  // wollte der Schleifenschutz bewusst vermeiden, und daran aendert sich
  // nichts. Und NUR wenn der Arm aktiv ist: steht der Schalter aus, bleibt es
  // beim dekretierten Zustand vom 2026-07-24 (alles auf LP A), auch für eine
  // zugeordnete Anzeige, die direkt auf ihrer MM-Seite landet.
  const angefragt = new URL(request.url);
  if (
    mmAktivAusRoh(zuteilungRoh) &&
    stehtAufEigenemMmZiel(angefragt.pathname, adIdAusQuery(angefragt.searchParams))
  ) {
    return null;
  }

  let ziel = entscheidung.ziel;
  let mm_pfad = null;
  let code_ziel = null;
  try {
    const url = new URL(request.url);
    const adId = adIdAusQuery(url.searchParams);
    if (adId) {
      // MESSAGE-MATCH (s04): dieselbe Ad-ID, dieselbe Weiche, anderes ZIEL.
      // Steht die Anzeige in keiner Karte, ist der Schalter nicht 'an' oder
      // faellt der Wuerfel in den Kontrollarm, bleibt es bei LP A — also bei
      // exakt dem heutigen, dekretierten Verhalten.
      mm_pfad = mmZielPfad(url.pathname, adId, url.searchParams, mmAktivAusRoh(zuteilungRoh));
      if (mm_pfad) ziel = zielUrl(mm_pfad, url.search, MM_MARKER);

      // Ad-scharfer Rabattcode (s03): NUR ein anderes Ziel derselben Weiche.
      // Er setzt bewusst AUF dem bereits gewaehlten Ziel auf — der Rabatt
      // gehört zur Anzeige, nicht zur Landeflaeche, und muss deshalb auch
      // auf der Message-Match-Seite ankommen.
      code_ziel = rabattZiel(ziel, adId, await holeAdCodes(fetchImpl));
      if (code_ziel) ziel = code_ziel;
    }
  } catch {
    // Weder Message-Match noch Rabattweg duerfen die Weiche brechen:
    // im Zweifel LP A wie bisher.
    ziel = entscheidung.ziel;
  }

  try {
    console.log(
      JSON.stringify({
        typ: 'ad-weiche',
        erkennung: entscheidung.erkennung,
        pfad: new URL(request.url).pathname,
        mm: mm_pfad || 'nein',
        rabatt: code_ziel ? 'ja' : 'nein',
      }),
    );
  } catch {
    // Logging darf die Weiche nie brechen.
  }
  return ziel;
}
