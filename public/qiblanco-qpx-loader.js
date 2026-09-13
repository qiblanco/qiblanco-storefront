(function () {
  // Loader für den First-Party-Pixel (qpx). Doppelt gegated:
  // 1. Dieses Script wird überhaupt nur gerendert, wenn PUBLIC_QPX_ENDPOINT
  //    gesetzt ist (root.jsx) — der Rollout-Schalter liegt beim Server-Team.
  // 2. qpx setzt First-Party-Cookies → lädt nur nach Cookiebot-Marketing-Consent
  //    (gleiche Regel wie qiblanco-tracker.js).
  function endpoint() {
    var el = document.querySelector('script[data-qpx-endpoint]');
    return el ? el.getAttribute('data-qpx-endpoint') : '';
  }

  function hasMarketingConsent() {
    return (
      window.Cookiebot &&
      window.Cookiebot.consent &&
      window.Cookiebot.consent.marketing
    );
  }

  function hasPreviewTrackingConsent() {
    return (
      document.documentElement.getAttribute(
        'data-qiblanco-tracking-preview',
      ) === 'true'
    );
  }

  // Region-aware Policy (Job 20260718, Spiegel von consent-policy.js):
  // ohne html[data-qb-consent-strict] strict fuer ALLE (heutiges Verhalten);
  // 'optout'-Region laedt qpx sofort, aktive Ablehnung wird respektiert.
  function regionPolicy() {
    var de = document.documentElement;
    var strict = (de.getAttribute('data-qb-consent-strict') || '')
      .toUpperCase()
      .split(',')
      .filter(function (c) {
        return /^[A-Z]{2}$/.test(c.trim());
      });
    if (!strict.length) return 'consent';
    var region = (de.getAttribute('data-qb-region') || '').toUpperCase();
    if (!region) return 'consent';
    return strict.indexOf(region) >= 0 ? 'consent' : 'optout';
  }

  function hasDeclined() {
    return Boolean(
      window.Cookiebot &&
        window.Cookiebot.hasResponse &&
        window.Cookiebot.consent &&
        !window.Cookiebot.consent.marketing,
    );
  }

  // ---- Cookiebot-Stempel aus dem COOKIE (Job 20260914-mailnaht) ----------
  // DER BEFUND (gemessen 2026-09-13, Order 11438980890892): dieselbe Größe —
  // "hat der Besucher Marketing erlaubt?" — wird an zwei Stellen aus ZWEI
  // VERSCHIEDENEN QUELLEN gelesen.
  //   SERVER  (consent-policy.js, hasCookiebotMarketingConsent): liest das
  //           COOKIE `CookieConsent` aus dem Request-Header.
  //   CLIENT  (dieser Loader, hasMarketingConsent): liest das JS-OBJEKT
  //           `window.Cookiebot`.
  // Ein Cookie überlebt einen blockierten Script-Download, ein JS-Objekt nicht.
  // Wird Cookiebots Script geblockt (Adblocker, Tracking-Schutz, CSP, Netz),
  // ist `window.Cookiebot` undefined, dieser Loader lädt qpx.js NIE und es
  // entsteht KEIN `_qpx_anon` — während der Server aus demselben, noch
  // vorhandenen Cookie `consent_state=granted` in die Bestellung schreibt.
  // Genau diese Signatur trug die Order oben: Consent erteilt, Herkunfts-Marker
  // da, und WEDER `_qpx_anon` NOCH `_fbp`.
  //
  // *** DEFAULT AUS — ABSICHT, KEIN UNFERTIGER ZUSTAND. ***
  // Die Änderung bewirkt, dass in genau diesem Fall getrackt wird, wo heute
  // nicht getrackt wird. Das ist eine ERWEITERUNG DER ERFASSUNG und steht unter
  // Christians ausdrücklichem Vorbehalt (Auftrag 20260914). Sie liegt als
  // entscheidungsreife Vorlage vor (forschungs-meister:
  // mailnaht-consent-cookie-fallback). Scharf per Attribut:
  //   <html data-qb-consent-cookie-fallback="true">
  // Rückweg: Attribut weg = byte-identisches Verhalten von vorher.
  function consentCookieFallbackAktiv() {
    return (
      document.documentElement.getAttribute(
        'data-qb-consent-cookie-fallback',
      ) === 'true'
    );
  }

  // Spiegel von checkout-tracking.js hasCookiebotMarketingConsent/-Declined.
  // BEWUSST DIESELBEN REGEXE: weichen die Lesarten in der FORM voneinander ab,
  // ist die Divergenz nur an eine andere Stelle verschoben.
  function cookieConsentRoh() {
    try {
      var m = document.cookie.match('(^|;)\\s*CookieConsent\\s*=\\s*([^;]+)');
      if (!m) return '';
      try {
        return decodeURIComponent(m.pop());
      } catch (e) {
        return m.pop();
      }
    } catch (e) {
      return '';
    }
  }

  function cookieSagtErlaubt() {
    return /(?:^|[,{]\s*|["'])marketing["']?\s*:\s*true(?:[,}]|$)/i.test(
      cookieConsentRoh(),
    );
  }

  function cookieSagtAbgelehnt() {
    return /(?:^|[,{]\s*|["'])marketing["']?\s*:\s*false(?:[,}]|$)/i.test(
      cookieConsentRoh(),
    );
  }

  function trackingAllowed() {
    if (hasPreviewTrackingConsent()) return true;
    if (regionPolicy() === 'optout') {
      if (hasDeclined()) return false;
      return !(consentCookieFallbackAktiv() && cookieSagtAbgelehnt());
    }
    if (hasMarketingConsent()) return true;
    // Nur wenn das JS-Objekt GAR NICHT da ist, entscheidet der Cookie. Ist
    // Cookiebot geladen und sagt nein, bleibt nein — der Cookie darf eine
    // Ablehnung nie überstimmen.
    if (!consentCookieFallbackAktiv()) return false;
    if (window.Cookiebot) return false;
    return cookieSagtErlaubt() && !cookieSagtAbgelehnt();
  }

  function boot() {
    if (window._qiblancoQpxBooted) return;
    if (!trackingAllowed()) return;
    var ep = endpoint();
    if (!ep) return;
    window._qiblancoQpxBooted = true;
    window.QPX_CONFIG = {endpoint: ep};
    var s = document.createElement('script');
    s.async = true;
    s.src = '/qiblanco-qpx.js';
    document.head.appendChild(s);
  }

  boot();
  window.addEventListener('CookiebotOnAccept', boot);
  window.addEventListener('CookiebotOnConsentReady', boot);
  window.addEventListener('CookiebotOnLoad', boot);
})();
