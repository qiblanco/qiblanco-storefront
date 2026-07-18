/**
 * LP-Pause-Weiche (Auftrag 20260718-ads-alle-auf-lp-a-redirect-pause):
 * Solange der LP-A/B-Test pausiert ist (zuteilung.json modus='aus'), leiten die
 * pausierten Ad-Landingpages (LP B /pages/zell-schutz, /pages/qione-zellschutz)
 * serverseitig auf LP A /pages/schlaf-zellen-schutz um — die bestehenden
 * Meta-Ads bleiben UNANGETASTET (Redirect-Layer statt Ad-URL-Umbau,
 * Engagement-/Lernphasen-Erhalt).
 *
 * EIN Hebel: dasselbe Hand-Feld 'modus', das die /go-Kaskade steuert.
 * modus='aus'  => Pause => Redirect aktiv.
 * modus!='aus' => Test laeuft => LP B wieder normal erreichbar (reversibel,
 * KEIN 301 — 302 wird nicht browserseitig dauerhaft gecacht).
 *
 * Fail-soft wie go-router.server.js: Tabelle nicht ladbar/unguelig =>
 * DEFAULT_ZUTEILUNG (modus='aus') => Redirect aktiv — faellt bewusst Richtung
 * Standard-Ad-Ziel LP A (Christian-Vorgabe 2026-07-18), nie Richtung Split.
 */
import {ZUTEILUNG_URL} from './go-router.server.js';
import {DEFAULT_ZUTEILUNG, validiereZuteilung, zielUrl} from './go-router-logic.js';

export const LP_A_PFAD = DEFAULT_ZUTEILUNG.default; // '/pages/schlaf-zellen-schutz'
const FETCH_TIMEOUT_MS = 1500;

/** true, wenn der LP-Test pausiert ist (modus='aus' bzw. Tabelle nicht ladbar). */
export async function lpTestPausiert(fetchImpl) {
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
    const zuteilung = validiereZuteilung(await res.json()) || DEFAULT_ZUTEILUNG;
    return zuteilung.modus === 'aus';
  } catch {
    return true;
  }
}

/**
 * Redirect-Ziel: LP A + KOMPLETTER Original-Query (roh, fbclid byte-identisch —
 * zielUrl-Invariante aus go-router-logic) + Marker lp_m=r (r = Route-Redirect,
 * unterscheidbar von /go-Gruenden f/h/p/b in der Attribution).
 */
export function lpAZiel(requestUrl) {
  const url = new URL(requestUrl);
  return zielUrl(LP_A_PFAD, url.search, 'r');
}
