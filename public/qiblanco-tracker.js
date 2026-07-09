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

  function collectTrackingParams(search) {
    if (!search) return null;
    var params = new URLSearchParams(search);
    var tracked = [];
    params.forEach(function (value, name) {
      if (value && isTrackingParamName(name)) tracked.push([name, value]);
    });
    return tracked.length ? tracked : null;
  }

  // Snapshot der Landing-Klick-IDs im Speicher, beim ersten Laden - VOR Consent.
  // Hier wird NICHTS persistiert (kein Cookie/Storage); der Wert lebt nur im
  // JS-Runtime, das die Hydrogen-SPA-Navigation uebersteht. Der Flush in den
  // dauerhaften Store passiert spaeter, nur wenn Marketing-Consent erteilt wird.
  var LANDING = {
    params: collectTrackingParams(window.location.search),
    href: window.location.href,
    referrer: document.referrer || '',
    savedAt: new Date().toISOString(),
  };

  function storeAttributionParams() {
    // Bevorzugt den gepufferten Landing-Snapshot; Fallback = aktuelle URL
    // (deckt den bereits eingewilligten Wiederkehrer-Fall ab).
    var tracked = LANDING.params || collectTrackingParams(window.location.search);
    if (!tracked || !tracked.length) return;

    var attribution = {
      params: tracked,
      href: LANDING.href,
      referrer: LANDING.referrer,
      savedAt: LANDING.savedAt,
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

  function readCookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function landingParam(name) {
    var p = LANDING.params || [];
    for (var i = 0; i < p.length; i++) {
      if (p[i][0] === name) return p[i][1];
    }
    return null;
  }

  function rootCookieDomain() {
    var host = window.location.hostname || '';
    if (/^[0-9.]+$/.test(host)) return null; // IP-Adresse -> keine Domain setzen
    var parts = host.split('.');
    if (parts.length < 2) return null;
    return '.' + parts.slice(-2).join('.');
  }

  // Setzt den ECHTEN _fbc-Cookie aus einer echten fbclid (Meta-Format
  // fb.1.<ts>.<fbclid>) - nur wenn das Meta-Pixel noch keinen gesetzt hat.
  // Domain = Root (.qiblanco.com), damit der Checkout-Subdomain-Kontext ihn liest.
  // So bekommt Shopifys nativer Meta-Kanal die Klick-ID. Kein Faken: nur aus fbclid.
  function ensureFbcCookie() {
    try {
      if (readCookie('_fbc')) return;
      var fbclid = landingParam('fbclid');
      if (!fbclid) return;
      var value = 'fb.1.' + new Date().getTime() + '.' + fbclid;
      var domain = rootCookieDomain();
      var secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie =
        '_fbc=' +
        value +
        '; Max-Age=' +
        ATTRIBUTION_COOKIE_MAX_AGE +
        '; Path=/' +
        (domain ? '; Domain=' + domain : '') +
        '; SameSite=Lax' +
        secure;
    } catch (e) {
      // Cookie writes can be unavailable in restricted browser contexts.
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
    if (hasMarketingConsent() || hasPreviewTrackingConsent()) {
      storeAttributionParams();
      ensureFbcCookie();
      boot();
    }
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

  ready();
  window.addEventListener('CookiebotOnAccept', ready);
  window.addEventListener('CookiebotOnConsentReady', ready);
  window.addEventListener('CookiebotOnLoad', ready);
})();
