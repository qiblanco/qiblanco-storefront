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

  function collectTrackedParams() {
    if (!window.location.search) return null;

    var params = new URLSearchParams(window.location.search);
    var tracked = [];

    params.forEach(function (value, name) {
      if (value && isTrackingParamName(name)) tracked.push([name, value]);
    });

    return tracked.length ? tracked : null;
  }

  function buildAttributionRecord(tracked) {
    return {
      params: tracked,
      href: window.location.href,
      referrer: document.referrer || '',
      savedAt: new Date().toISOString(),
    };
  }

  // Puffert Klick-IDs SOFORT beim Seitenaufruf in sessionStorage — auch VOR der
  // Cookie-Zustimmung. sessionStorage ist kein Cookie, verlässt den Browser-Tab
  // nicht und verfällt mit der Session: reiner technischer Zwischenspeicher,
  // damit die Zuordnung nicht verloren ist, wenn der Besucher erst später im
  // Funnel zustimmt oder per SPA-Navigation weitergeklickt hat, bevor er
  // zustimmt. Ein Cookie entsteht erst NACH Marketing-Consent (persist…).
  function bufferAttributionParams() {
    var tracked = collectTrackedParams();
    if (!tracked) return;

    try {
      window.sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify(buildAttributionRecord(tracked)),
      );
    } catch {
      // Session storage can be unavailable in restricted browser contexts.
    }
  }

  function readBufferedAttribution() {
    try {
      return window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  // Nur mit Consent: gepufferte (oder aktuelle) Klick-IDs als Cookie sichern,
  // damit der Server sie in die Order-note_attributes schreiben kann.
  function persistAttributionParams() {
    var serialized = readBufferedAttribution();

    if (!serialized) {
      var tracked = collectTrackedParams();
      if (!tracked) return;
      serialized = JSON.stringify(buildAttributionRecord(tracked));
      try {
        window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, serialized);
      } catch {
        // Session storage can be unavailable in restricted browser contexts.
      }
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
    } catch {
      return null;
    }
  }

  function getBufferedParam(name) {
    try {
      var record = JSON.parse(readBufferedAttribution() || '{}');
      var params = Array.isArray(record.params) ? record.params : [];
      for (var i = 0; i < params.length; i++) {
        if (params[i] && params[i][0] === name) return params[i][1];
      }
    } catch {
      // fällt unten auf die aktuelle URL zurück
    }
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch {
      return null;
    }
  }

  function rootCookieDomain() {
    var host = window.location.hostname || '';
    if (/^[0-9.]+$/.test(host)) return null; // IP-Adresse -> keine Domain setzen
    var parts = host.split('.');
    if (parts.length < 2) return null;
    return '.' + parts.slice(-2).join('.');
  }

  // Setzt den ECHTEN _fbc-Cookie aus einer echten fbclid (Meta-Format
  // fb.1.<ts>.<fbclid>) — nur wenn das Meta-Pixel noch keinen gesetzt hat.
  // Deckt die Lücke, in der fbevents.js kein _fbc mehr setzen kann, weil die
  // fbclid zum Consent-Zeitpunkt nicht mehr in der URL steht (Puffer greift).
  // Domain = Root (.qiblanco.com), damit der Checkout-Kontext ihn liest.
  function ensureFbcCookie() {
    try {
      if (readCookie('_fbc')) return;
      var fbclid = getBufferedParam('fbclid');
      if (!fbclid) return;
      var value = 'fb.1.' + new Date().getTime() + '.' + fbclid;
      var domain = rootCookieDomain();
      var secure = window.location.protocol === 'https:' ? '; Secure' : '';
      var suffix =
        '; Max-Age=' +
        ATTRIBUTION_COOKIE_MAX_AGE +
        '; Path=/; SameSite=Lax' +
        secure;
      if (domain) {
        document.cookie = '_fbc=' + value + suffix + '; Domain=' + domain;
      }
      // Fallback ohne Domain: greift auf Public-Suffix-Hosts (z. B.
      // *.myshopify.dev Previews), wo Browser Domain-Cookies verwerfen.
      if (!readCookie('_fbc')) {
        document.cookie = '_fbc=' + value + suffix;
      }
    } catch {
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
      persistAttributionParams();
      ensureFbcCookie();
      boot();
    }
  }

  // SPA-Navigation: falls eine client-seitige Route neue Klick-IDs in der URL
  // trägt (z.B. interne Kampagnen-Links), nachpuffern — und bei vorhandenem
  // Consent direkt persistieren.
  function hookSpaNavigation() {
    if (window._qiblancoAttrSpaHooked) return;
    window._qiblancoAttrSpaHooked = true;

    function onNavigate() {
      window.setTimeout(function () {
        bufferAttributionParams();
        if (hasMarketingConsent() || hasPreviewTrackingConsent()) {
          persistAttributionParams();
          ensureFbcCookie();
        }
      }, 0);
    }

    var pushState = window.history.pushState;
    var replaceState = window.history.replaceState;

    window.history.pushState = function () {
      pushState.apply(window.history, arguments);
      onNavigate();
    };

    window.history.replaceState = function () {
      replaceState.apply(window.history, arguments);
      onNavigate();
    };

    window.addEventListener('popstate', onNavigate);
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

  bufferAttributionParams();
  hookSpaNavigation();
  ready();
  window.addEventListener('CookiebotOnAccept', ready);
  window.addEventListener('CookiebotOnConsentReady', ready);
  window.addEventListener('CookiebotOnLoad', ready);
})();
