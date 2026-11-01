import {useEffect, useState} from 'react';
import {buyerCountry, policyForCountry} from '~/lib/consent-policy';
import {EINWILLIGUNG_FASSUNG} from '~/lib/einwilligung-texte';

/**
 * Tor für Hydrogens Shopify-Analytik (Auftrag einwilligung-scanner-20261023T144303Z, Segment s03).
 *
 * GEMESSEN AM 2026-11-01 (claude-jobs/einwilligung-scanner-20261023T144303Z-s03/herkunft-vorher.json):
 * Vor der Wahl steht Shopify.customerPrivacy auf "unset", shouldShowBanner() ist false und
 * analyticsProcessingAllowed() true. Hydrogen behandelt den Besucher deshalb als einwilligend,
 * und drei Dinge entstehen, alle im Teilbaum ShopifyAnalytics von Analytics.Provider:
 *   1. der Abruf POST /api/unstable/graphql.json (consentManagement) setzt per Set-Cookie
 *      _shopify_analytics und _shopify_marketing (httpOnly, 365 Tage);
 *   2. useShopifyCookies schreibt _shopify_y/_s auf .qiblanco.com;
 *   3. sendShopifyAnalytics schickt page_viewed an monorail-edge.shopifysvc.com.
 * Analytics.Provider montiert diesen Teilbaum nur, wenn `shop` gesetzt ist.
 * Ein vierter Weg liegt am Server (gemessen herkunft-live-mehr.json, 3 von 5 Seiten): Hydrogens
 * createRequestHandler hängt die Set-Cookie-Zeilen der ersten UNGECACHTEN Storefront-API-
 * Unterabfrage an das Dokument (storefront.setCollectedSubrequestHeaders), darunter
 * _shopify_analytics/_marketing. Ob das passiert, hängt an der Cache-Lage, nicht an der Seite.
 *
 * DAS TOR: in Regionen mit Einwilligungspflicht bekommt der Provider `shop` erst nach einer
 * Wahl (gleich welcher), und `canTrack` folgt der Kategorie Statistik. Vor der Wahl wird
 * Shopify-Analytik also gar nicht geladen; es wird keine Wahl vorgetäuscht, kein
 * setTrackingConsent, kein Cookie. Nach „Notwendige“ lädt sie, damit die Brücke in
 * /qb-einwilligung.js Shopify das „nein“ übergeben kann (daran hängt die Kasse), sendet aber
 * nichts. In 'optout'-Regionen bleibt es wie bisher, nur eine Ablehnung der Statistik zählt.
 * Die Region-Regel ist dieselbe wie in MetaPixel.jsx (regionPolicy) und consent-policy.js;
 * ändert sich eine, gehört die andere in denselben Commit.
 *
 * DER SERVERTEIL: shopifyServerTorEinbauen (aufgerufen in lib/context.js) filtert an genau diesen
 * zwei Stellen (Dokument und Browser-Proxy storefront.forward) _shopify_analytics und
 * _shopify_marketing heraus, solange das CookieConsent-Cookie der Anfrage die Kategorie nicht
 * erlaubt. Gelesen wie in /qb-einwilligung.js (leseCookie): abgelaufen oder ältere Hauptnummer
 * der Fassung zählt als keine Wahl. _shopify_essential und alle anderen Zeilen bleiben.
 *
 * Rückweg: in root.jsx `shop={hydriert ? data.shop : null}` und ohne `canTrack` (Stand
 * vor diesem Commit) und in lib/context.js den Aufruf shopifyServerTorEinbauen entfernen,
 * oder `git revert` dieses Commits.
 * Probe: homepage-bauer/pruefungen/probe_shopify_vor_der_wahl.py (shared-state).
 */

const EREIGNISSE = [
  'CookiebotOnConsentReady',
  'CookiebotOnAccept',
  'CookiebotOnDecline',
  'CookiebotOnLoad',
];

/** 'consent' (Einwilligungspflicht) oder 'optout'; ohne Angaben immer 'consent'. */
export function regionPolitik(doc) {
  const de = doc && doc.documentElement;
  if (!de) return 'consent';
  const strikt = (de.getAttribute('data-qb-consent-strict') || '')
    .toUpperCase()
    .split(',')
    .map((c) => c.trim())
    .filter((c) => /^[A-Z]{2}$/.test(c));
  if (!strikt.length) return 'consent';
  const region = (de.getAttribute('data-qb-region') || '').toUpperCase();
  if (!region) return 'consent';
  return strikt.includes(region) ? 'consent' : 'optout';
}

/**
 * @param {Window} win
 * @returns {{montieren: boolean, tracken: boolean}}
 *   montieren: Shopify-Analytik darf laden; tracken: sie darf zählen und Cookies setzen.
 */
export function shopifyTorStand(win) {
  const cb = win && win.Cookiebot;
  const entschieden = Boolean(cb && cb.hasResponse && cb.consent);
  const statistik = entschieden && cb.consent.statistics === true;
  if (regionPolitik(win && win.document) === 'optout') {
    return {montieren: true, tracken: !entschieden || statistik};
  }
  return {montieren: entschieden, tracken: statistik};
}

/** `canTrack` für Analytics.Provider. Am Server und im Fehlerfall: false. */
export function shopifyDarfTracken() {
  if (typeof window === 'undefined') return false;
  try {
    return shopifyTorStand(window).tracken;
  } catch {
    return false;
  }
}

const ZU = {montieren: false, tracken: false};

/** Stand des Tors; rendert neu, wenn der Besucher wählt oder seine Wahl ändert. */
export function useShopifyTrackingTor() {
  const [stand, setStand] = useState(ZU);
  useEffect(() => {
    const neu = () => {
      let s = ZU;
      try {
        s = shopifyTorStand(window);
      } catch {
        s = ZU;
      }
      setStand((alt) =>
        alt.montieren === s.montieren && alt.tracken === s.tracken ? alt : s,
      );
    };
    neu();
    document.addEventListener('qb:einwilligung', neu);
    EREIGNISSE.forEach((n) => window.addEventListener(n, neu));
    return () => {
      document.removeEventListener('qb:einwilligung', neu);
      EREIGNISSE.forEach((n) => window.removeEventListener(n, neu));
    };
  }, []);
  return stand;
}

const JAHR_MS = 31536000000;

function hauptnummer(v) {
  const n = parseInt(String(v || '').split('.')[0], 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Die gültige Wahl aus dem Cookie-Kopf einer Anfrage, oder null (keine, abgelaufen, alte Fassung).
 * Dieselben Regeln wie leseCookie() in /qb-einwilligung.js.
 * @param {string | null | undefined} cookieKopf
 * @param {number} [jetzt]
 * @returns {{statistics: boolean, marketing: boolean} | null}
 */
export function wahlAusCookie(cookieKopf, jetzt = Date.now()) {
  const m = String(cookieKopf || '').match(/(?:^|;\s*)CookieConsent=([^;]*)/);
  if (!m) return null;
  let s = m[1];
  try {
    s = decodeURIComponent(s);
  } catch {
    // Rohwert lesen
  }
  const bool = (k) => {
    const r = s.match(new RegExp(`(?:^|[,{])\\s*${k}\\s*:\\s*(true|false)`));
    return r ? r[1] === 'true' : null;
  };
  const marketing = bool('marketing');
  const utc = s.match(/(?:^|[,{])\s*utc\s*:\s*(\d+)/);
  if (marketing === null || !utc) return null;
  if (jetzt - Number(utc[1]) > JAHR_MS) return null;
  const qbv = s.match(/(?:^|[,{])\s*qbv\s*:\s*'([^']*)'/);
  if ((qbv ? hauptnummer(qbv[1]) : 1) < hauptnummer(EINWILLIGUNG_FASSUNG)) return null;
  return {statistics: bool('statistics') === true, marketing};
}

/**
 * Darf der Server Shopifys Statistik- bzw. Marketing-Cookie durchreichen?
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 */
export function shopifyServerErlaubt(request, env) {
  const wahl = wahlAusCookie(request.headers.get('Cookie'));
  if (policyForCountry(buyerCountry(request), env) === 'optout') {
    return {
      _shopify_analytics: !wahl || wahl.statistics,
      _shopify_marketing: !wahl || wahl.marketing,
    };
  }
  return {
    _shopify_analytics: Boolean(wahl && wahl.statistics),
    _shopify_marketing: Boolean(wahl && wahl.marketing),
  };
}

/**
 * Entfernt nicht erlaubte _shopify_analytics/_marketing-Zeilen aus den Set-Cookie-Köpfen.
 * @returns {number} Zahl der entfernten Zeilen
 */
export function filtereShopifyCookies(headers, erlaubt) {
  const zeilen = headers.getSetCookie ? headers.getSetCookie() : [];
  const bleibt = zeilen.filter((z) => {
    const name = z.split('=')[0].trim();
    return !(name in erlaubt) || erlaubt[name];
  });
  if (bleibt.length === zeilen.length) return 0;
  headers.delete('Set-Cookie');
  bleibt.forEach((z) => headers.append('Set-Cookie', z));
  return zeilen.length - bleibt.length;
}

/**
 * Hängt den Filter an die zwei Stellen, an denen Hydrogen Shopifys Set-Cookie an den Browser gibt.
 * Wirft nie: ein Fehler hier darf keine Seite und keinen Warenkorb berühren.
 */
export function shopifyServerTorEinbauen(storefront, request, env) {
  if (!storefront) return;
  const erlaubt = () => shopifyServerErlaubt(request, env);
  const sammeln = storefront.setCollectedSubrequestHeaders;
  if (typeof sammeln === 'function') {
    storefront.setCollectedSubrequestHeaders = (response) => {
      sammeln(response);
      try {
        filtereShopifyCookies(response.headers, erlaubt());
      } catch {
        // unveränderliche Köpfe (Umleitung): nichts zu filtern
      }
    };
  }
  const weiter = storefront.forward;
  if (typeof weiter === 'function') {
    storefront.forward = async (...args) => {
      const response = await weiter(...args);
      try {
        filtereShopifyCookies(response.headers, erlaubt());
      } catch {
        // wie oben
      }
      return response;
    };
  }
}
