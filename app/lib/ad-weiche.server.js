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
  const entscheidung = entscheideAdWeiche(request.url);
  if (!entscheidung) return null;
  if (!(await adWeicheAktiv(fetchImpl))) return null;
  try {
    console.log(
      JSON.stringify({
        typ: 'ad-weiche',
        erkennung: entscheidung.erkennung,
        pfad: new URL(request.url).pathname,
      }),
    );
  } catch {
    // Logging darf die Weiche nie brechen.
  }
  return entscheidung.ziel;
}
