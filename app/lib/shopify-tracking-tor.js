import {useEffect, useState} from 'react';

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
 * Rückweg: in root.jsx `shop={hydriert ? data.shop : null}` und ohne `canTrack` (Stand
 * vor diesem Commit), oder `git revert` dieses Commits.
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
  const gewaehlt = Boolean(cb && cb.hasResponse && cb.consent);
  const statistik = gewaehlt && cb.consent.statistics === true;
  if (regionPolitik(win && win.document) === 'optout') {
    return {montieren: true, tracken: !gewaehlt || statistik};
  }
  return {montieren: gewaehlt, tracken: statistik};
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
