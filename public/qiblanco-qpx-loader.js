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

  function boot() {
    if (window._qiblancoQpxBooted) return;
    if (!(hasMarketingConsent() || hasPreviewTrackingConsent())) return;
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
