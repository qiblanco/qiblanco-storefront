(function () {
  var ATTRIBUTION_STORAGE_KEY = 'qiblanco_checkout_attribution';
  var TRACKING_PARAM_NAMES = {
    fbclid: true,
    fbc: true,
    fbp: true,
    _fbc: true,
    _fbp: true,
    gclid: true,
    gbraid: true,
    wbraid: true,
    msclkid: true,
    ttclid: true,
    twclid: true,
    li_fat_id: true,
    epik: true,
    scclid: true,
    sccid: true,
    rdt_cid: true,
    irclickid: true,
    click_id: true,
    clickid: true,
    h_ad_id: true,
    h_click_id: true,
  };

  function isTrackingParamName(name) {
    return TRACKING_PARAM_NAMES[name] || /^utm_[a-z0-9_]+$/i.test(name);
  }

  function storeAttributionParams() {
    if (!window.sessionStorage || !window.location.search) return;

    var params = new URLSearchParams(window.location.search);
    var tracked = [];

    params.forEach(function (value, name) {
      if (value && isTrackingParamName(name)) tracked.push([name, value]);
    });

    if (!tracked.length) return;

    try {
      window.sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify({
          params: tracked,
          href: window.location.href,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Session storage can be unavailable in restricted browser contexts.
    }
  }

  function boot() {
    if (window._qiblancoBooted) return;
    window._qiblancoBooted = true;
    var s = document.createElement('script');
    s.async = true;
    s.src =
      'https://t.qiblanco.com/v1/lst/universal-script?ph=5d7ec374b760de265c8e689aea1de481d066f670ad78f9970f2c407e375dcdb6&tag=!clicked&ref_url=' +
      encodeURIComponent(location.href);
    document.head.appendChild(s);
  }
  function ready() {
    if (
      window.Cookiebot &&
      window.Cookiebot.consent &&
      window.Cookiebot.consent.marketing
    ) {
      storeAttributionParams();
      boot();
    }
  }
  ready();
  window.addEventListener('CookiebotOnAccept', ready);
  window.addEventListener('CookiebotOnConsentReady', ready);
  window.addEventListener('CookiebotOnLoad', ready);
})();
