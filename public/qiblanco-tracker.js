(function () {
  var ATTRIBUTION_STORAGE_KEY = 'qiblanco_checkout_attribution';
  var ATTRIBUTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
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
    if (!window.location.search) return;

    var params = new URLSearchParams(window.location.search);
    var tracked = [];

    params.forEach(function (value, name) {
      if (value && isTrackingParamName(name)) tracked.push([name, value]);
    });

    if (!tracked.length) return;

    var attribution = {
      params: tracked,
      href: window.location.href,
      referrer: document.referrer || '',
      savedAt: new Date().toISOString(),
    };
    var serialized = JSON.stringify(attribution);

    try {
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, serialized);
    } catch {
      // Session storage can be unavailable in restricted browser contexts.
    }

    try {
      writeAttributionCookie(serialized);
    } catch {
      // Cookie writes can be unavailable in restricted browser contexts.
    }
  }

  function writeAttributionCookie(serialized) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      ATTRIBUTION_STORAGE_KEY +
      '=' +
      encodeURIComponent(serialized) +
      '; Max-Age=' +
      ATTRIBUTION_COOKIE_MAX_AGE +
      '; Path=/; SameSite=Lax' +
      secure;
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
