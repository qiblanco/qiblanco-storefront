/**
 * Orchestrierung des /go-Loaders — bewusst OHNE @shopify/remix-oxygen-Import, damit
 * sie ohne Build-Toolchain per `node --test` prüfbar ist (app/routes/go.jsx bleibt ein
 * duenner Adapter, der handleGoRequest() in ein redirect() uebersetzt).
 *
 * Fail-soft-Vertrag (Konzept Kap. 8 #3): handleGoRequest() wirft NIE — jeder Fehler
 * (Tabelle nicht ladbar, kaputte Params, Timeout) liefert den Default-Deskriptor.
 */
import {
  DEFAULT_ZUTEILUNG,
  validiereZuteilung,
  kaskadeEntscheiden,
  parseHistCookie,
  serialisiereHistCookie,
  hatMarketingConsent,
  zielUrl,
} from './go-router-logic.js';

export const ZUTEILUNG_URL = 'https://lp.65-108-150-121.sslip.io/zuteilung.json';
const FETCH_TIMEOUT_MS = 1500;

// Klick-ID-Parameter -> Ad-Plattform-KLASSE (nie die ID selbst) — identische
// Tabelle wie public/qiblanco-qpx-basis.js und der Receiver (_CLICK_PLATFORM_KEYS).
const PLATTFORM_KLASSE = {
  gclid: 'google', gbraid: 'google', wbraid: 'google',
  fbclid: 'meta', msclid: 'bing', msclkid: 'bing',
  ttclid: 'tiktok', twclid: 'twitter', epik: 'pinterest', sccid: 'snapchat',
};

/**
 * Cookieloser Basis-Hit fuer /go — SERVERSEITIG, weil diese Route ein reiner
 * 302-Loader ohne DOM ist: qpx-basis.js (root.jsx) kann hier baulich nie feuern,
 * /go-Durchlaeufe waeren in basis_hit sonst unsichtbar (die Ziel-LP zaehlt zwar,
 * aber nicht der Router-Durchlauf selbst).
 *
 * Gleiches Gate wie der Browser-Beacon: env PUBLIC_QPX_BASIS_ENDPOINT, leer = aus.
 * Gleiche Datenminimierung: Pfad OHNE Query, Referrer, nur die Plattform-KLASSE.
 * Client-UA und oxygen-buyer-ip werden durchgereicht, damit der Receiver
 * visitor_day/device_class/Bot-Filter wie beim Browser-Hit ableiten kann.
 *
 * Liefert {endpoint, init} fuer fetch() oder null (kein Env / Fehler) —
 * bewusst OHNE eigenes fetch, damit die Funktion per node --test pruefbar
 * bleibt und der Aufrufer sie in context.waitUntil haengen kann. Wirft NIE.
 */
export function baueBasisHit(request, env) {
  try {
    const endpoint = env?.PUBLIC_QPX_BASIS_ENDPOINT || '';
    if (!endpoint) return null;
    const url = new URL(request.url);
    let platform = '';
    for (const key of url.searchParams.keys()) {
      if (PLATTFORM_KLASSE[key]) {
        platform = PLATTFORM_KLASSE[key];
        break;
      }
    }
    const headers = {'Content-Type': 'application/json'};
    const ua = request.headers.get('User-Agent');
    if (ua) headers['User-Agent'] = ua;
    const buyerIp = request.headers.get('oxygen-buyer-ip');
    if (buyerIp) headers['X-Forwarded-For'] = buyerIp;
    return {
      endpoint,
      init: {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: url.origin + url.pathname,
          referrer: request.headers.get('Referer') || '',
          platform,
        }),
      },
    };
  } catch {
    return null; // fail-soft: die Zaehlung bricht den Redirect NIE
  }
}

async function holeZuteilung(fetchImpl) {
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
        : undefined;
    // cf.cacheTtl: Oxygen-Sub-Request-Cache (~5-Min-TTL, Kap. 4.4) — no-op ausserhalb
    // von Cloudflare/Oxygen-Runtimes (z.B. im Node-Test), fetch ignoriert unbekannte Optionen nicht,
    // deshalb hier nur gesetzt, wenn ein Fetch mit Erfolg auch tatsaechlich HTTP macht.
    const res = await fetchImpl(ZUTEILUNG_URL, {
      signal,
      cf: {cacheTtl: 300, cacheEverything: true},
    });
    if (!res || !res.ok) throw new Error(`zuteilung-fetch status ${res && res.status}`);
    const daten = await res.json();
    return validiereZuteilung(daten) || DEFAULT_ZUTEILUNG;
  } catch {
    return DEFAULT_ZUTEILUNG;
  }
}

function baueHeaderListe(setCookie) {
  const headers = [
    ['Cache-Control', 'no-store'],
    ['X-Robots-Tag', 'noindex, nofollow'],
  ];
  if (setCookie) headers.push(['Set-Cookie', setCookie]);
  return headers;
}

function fallback(url) {
  return {
    location: zielUrl(DEFAULT_ZUTEILUNG.default, url.search, 'f'),
    headers: baueHeaderListe(null),
  };
}

/**
 * @param {{request: Request, env: object, fetchImpl?: typeof fetch}} args
 * @returns {Promise<{location: string, headers: Array<[string,string]>}>}
 */
export async function handleGoRequest({request, env, fetchImpl}) {
  const url = new URL(request.url);
  try {
    // Kill-Switch (Kap. 8 #7 / 9 P2): ABWESEND oder != 'on' => sofort Default MIT
    // vollem Query-Forwarding, KEINE Kaskade. Ein Deploy schaltet die ganze Schicht.
    const rotationAn = env?.ROTATION_MODE === 'on';
    if (!rotationAn) return fallback(url);

    const zuteilung = await holeZuteilung(fetchImpl || fetch);
    const cookieHeader = request.headers.get('Cookie');
    const gesehen = parseHistCookie(cookieHeader);
    const consentOk = hatMarketingConsent(cookieHeader);

    const entscheidung = kaskadeEntscheiden(url.searchParams, zuteilung, gesehen, consentOk);

    let setCookie = null;
    const profilAktiv = zuteilung.modus === 'herkunft+profil' || zuteilung.modus === 'voll';
    if (profilAktiv && consentOk && entscheidung.kuerzelGezeigt) {
      const bisher = gesehen || [];
      if (!bisher.includes(entscheidung.kuerzelGezeigt)) {
        setCookie = serialisiereHistCookie([...bisher, entscheidung.kuerzelGezeigt].slice(-4));
      }
    }

    return {
      location: zielUrl(entscheidung.pfad, url.search, entscheidung.grund),
      headers: baueHeaderListe(setCookie),
    };
  } catch {
    return fallback(url);
  }
}
