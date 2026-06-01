(function () {
  var GTM_CONTAINER_ID = 'GTM-N7DRSN5';
  var CLARITY_PROJECT_ID = 'wpfx9m2wf0';
  var lastConsentSignature = '';
  var lastPageViewUrl = '';

  function getConsent() {
    return window.Cookiebot && window.Cookiebot.consent
      ? window.Cookiebot.consent
      : null;
  }

  function hasStatisticsConsent() {
    var consent = getConsent();
    return !!(consent && consent.statistics);
  }

  function hasMarketingConsent() {
    var consent = getConsent();
    return !!(consent && consent.marketing);
  }

  function hasPreferencesConsent() {
    var consent = getConsent();
    return !!(consent && consent.preferences);
  }

  function loadScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function ensureGoogleDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
  }

  function setDefaultGoogleConsent() {
    if (window._qiblancoGoogleConsentDefaultSet) return;
    window._qiblancoGoogleConsentDefaultSet = true;

    ensureGoogleDataLayer();
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
    });
  }

  function updateGoogleConsent() {
    ensureGoogleDataLayer();

    var state = {
      ad_storage: hasMarketingConsent() ? 'granted' : 'denied',
      ad_user_data: hasMarketingConsent() ? 'granted' : 'denied',
      ad_personalization: hasMarketingConsent() ? 'granted' : 'denied',
      analytics_storage: hasStatisticsConsent() ? 'granted' : 'denied',
      functionality_storage: hasPreferencesConsent() ? 'granted' : 'denied',
      personalization_storage: hasPreferencesConsent() ? 'granted' : 'denied',
      security_storage: 'granted',
    };

    window.gtag('consent', 'update', state);
    return state;
  }

  function bootGtm() {
    if (!hasStatisticsConsent() || window._qiblancoGtmBooted) return;

    window._qiblancoGtmBooted = true;
    ensureGoogleDataLayer();
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    loadScript(
      'qiblanco-gtm',
      'https://www.googletagmanager.com/gtm.js?id=' +
        encodeURIComponent(GTM_CONTAINER_ID),
    );
  }

  function bootClarity() {
    if (!hasStatisticsConsent() || window._qiblancoClarityBooted) return;

    window._qiblancoClarityBooted = true;
    window.clarity =
      window.clarity ||
      function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };

    loadScript(
      'qiblanco-clarity',
      'https://www.clarity.ms/tag/' + encodeURIComponent(CLARITY_PROJECT_ID),
    );
  }

  function pushCookieConsentUpdate(state) {
    if (!hasStatisticsConsent()) return;

    var signature = JSON.stringify(state);
    if (signature === lastConsentSignature) return;
    lastConsentSignature = signature;

    window.dataLayer.push({
      event: 'cookie_consent_update',
      qiblanco_consent: {
        statistics: hasStatisticsConsent(),
        marketing: hasMarketingConsent(),
        preferences: hasPreferencesConsent(),
      },
    });
  }

  function pushPageView() {
    if (!hasStatisticsConsent() || !window._qiblancoGtmBooted) return;
    if (window.location.href === lastPageViewUrl) return;
    lastPageViewUrl = window.location.href;

    window.dataLayer.push({
      event: 'shopify_page_view',
      url: window.location.href,
      referrer: document.referrer,
    });
  }

  function ready() {
    setDefaultGoogleConsent();
    var state = updateGoogleConsent();
    bootGtm();
    bootClarity();
    pushCookieConsentUpdate(state);
    pushPageView();
  }

  function trackRouteChanges() {
    if (window._qiblancoRouteTrackingInstalled) return;
    window._qiblancoRouteTrackingInstalled = true;

    var pushState = window.history.pushState;
    var replaceState = window.history.replaceState;

    window.history.pushState = function () {
      pushState.apply(window.history, arguments);
      window.setTimeout(pushPageView, 0);
    };

    window.history.replaceState = function () {
      replaceState.apply(window.history, arguments);
      window.setTimeout(pushPageView, 0);
    };

    window.addEventListener('popstate', function () {
      window.setTimeout(pushPageView, 0);
    });
  }

  trackRouteChanges();
  ready();
  window.addEventListener('CookiebotOnAccept', ready);
  window.addEventListener('CookiebotOnConsentReady', ready);
  window.addEventListener('CookiebotOnDecline', ready);
  window.addEventListener('CookiebotOnLoad', ready);
})();
