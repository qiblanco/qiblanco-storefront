import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {viewContentPayload, addToCartPayload} from '~/lib/pixel-content';
import {
  eventIdFuer,
  META_EVENT_VIEW_CONTENT,
  META_EVENT_ADD_TO_CART,
} from '~/lib/meta-event-id';

/**
 * Meta-Pixel (Browser) für qiblanco.com — Pixel „Qi Blanco Germany Pixel 2023".
 *
 * Consent-gated über Cookiebot (Marketing), wie qiblanco-tracker.js: ohne
 * Zustimmung wird weder fbevents.js geladen noch ein Event gefeuert.
 *
 * Events: PageView (jede Route, auch SPA-Navigation), ViewContent (Produktseite),
 * AddToCart. ViewContent und AddToCart tragen seit 2026-10-31 eine eventID aus
 * app/lib/meta-event-id.js; dieselbe Id geht über QpxCommerce.jsx an den eigenen
 * Receiver, und capi-rueckspeisung meldet das Ereignis damit server-seitig
 * (Meta bereinigt Browser und Server über event_name + eventID).
 * InitiateCheckout kommt NICHT vom Storefront, sondern von der Shopify-Meta-App
 * an der Kasse (Browser + Server, gemeinsame Id); CartSummary.jsx feuert es
 * nicht mehr (Konstante STOREFRONT_IC_FBQ, Job 20261031-meta-capi-luecken-dach-
 * bau-ai-server-prio10).
 * KEIN Browser-Purchase: der Purchase kommt server-seitig per Conversions API
 * mit event_id = Shopify-Order-ID; ein Browser-Purchase würde ohne dieselbe
 * eventID doppelt zählen.
 *
 * Nebeneffekt (gewollt): fbevents.js setzt die First-Party-Cookies _fbp/_fbc.
 * qiblanco-tracker.js schreibt sie in die Order-note_attributes, die
 * Server-CAPI sendet sie mit — erst dadurch kann Meta Käufe attribuieren.
 */
const META_PIXEL_ID = '9450046881736733';

function hasMarketingConsent() {
  return Boolean(
    window.Cookiebot &&
      window.Cookiebot.consent &&
      window.Cookiebot.consent.marketing,
  );
}

function hasPreviewTrackingConsent() {
  return (
    document.documentElement.getAttribute('data-qiblanco-tracking-preview') ===
    'true'
  );
}

// Region-aware Consent-Policy (Job 20260718, Spiegel consent-policy.js):
// ohne html[data-qb-consent-strict] strict fuer ALLE (heutiges Verhalten,
// fail-closed); 'optout'-Regionen laden das Pixel ab Seitenaufruf, eine
// AKTIV erklaerte Ablehnung wird immer respektiert.
function regionPolicy() {
  const de = document.documentElement;
  const strict = (de.getAttribute('data-qb-consent-strict') || '')
    .toUpperCase()
    .split(',')
    .filter((c) => /^[A-Z]{2}$/.test(c.trim()));
  if (!strict.length) return 'consent';
  const region = (de.getAttribute('data-qb-region') || '').toUpperCase();
  if (!region) return 'consent';
  return strict.includes(region) ? 'consent' : 'optout';
}

function hasDeclined() {
  return Boolean(
    window.Cookiebot &&
      window.Cookiebot.hasResponse &&
      window.Cookiebot.consent &&
      !window.Cookiebot.consent.marketing,
  );
}

/**
 * Das Marketing-Consent-Tor dieses Shops (Cookiebot + Region-Policy + das
 * Preview-Attribut). Seit 2026-08-24 EXPORTIERT, weil UpPromoteTracking.jsx
 * genau dasselbe Tor braucht: ein zweiter, abgeschriebener Gate wäre die Drift,
 * die wir bei den public/-Skripten schon einmal hatten. Logik unverändert.
 */
export function trackingAllowed() {
  if (hasPreviewTrackingConsent()) return true;
  if (regionPolicy() === 'optout') return !hasDeclined();
  return hasMarketingConsent();
}

/**
 * Ruft `boot` sofort auf und danach bei jeder Cookiebot-Consent-Meldung erneut.
 *
 * Der Sofort-Aufruf deckt „Zustimmung lag beim Seitenaufruf schon vor" ab
 * (Cookiebot-Cookie aus einer früheren Sitzung), die drei Events decken
 * „Besucher entscheidet sich erst jetzt" ab. `boot` muss deshalb selbst
 * idempotent sein UND das Tor selbst prüfen.
 *
 * Ebenfalls seit 2026-08-24 exportiert — dies ist die CookiebotOnAccept-Logik,
 * die UpPromoteTracking.jsx mitbenutzt statt sie nachzubauen. Herausgezogen aus
 * dem useEffect unten; Verhalten des Meta-Pixels dadurch unverändert.
 *
 * @param {() => void} boot
 * @returns {() => void} Cleanup für useEffect
 */
export function subscribeConsentChanges(boot) {
  boot();
  const onConsent = () => boot();
  window.addEventListener('CookiebotOnAccept', onConsent);
  window.addEventListener('CookiebotOnConsentReady', onConsent);
  window.addEventListener('CookiebotOnLoad', onConsent);
  return () => {
    window.removeEventListener('CookiebotOnAccept', onConsent);
    window.removeEventListener('CookiebotOnConsentReady', onConsent);
    window.removeEventListener('CookiebotOnLoad', onConsent);
  };
}

function bootMetaPixel() {
  if (window._qiblancoMetaPixelBooted) return;
  if (!trackingAllowed()) return;
  window._qiblancoMetaPixelBooted = true;

  // Offizieller Meta-Basecode (fbq-Stub + fbevents.js-Loader).
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js',
  );

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  window._qiblancoMetaPixelLastUrl = window.location.href;
}

function fbqTrack(eventName, params, eventId) {
  if (!window._qiblancoMetaPixelBooted) return;
  if (typeof window.fbq !== 'function') return;
  try {
    if (eventId) {
      window.fbq('track', eventName, params, {eventID: eventId});
    } else {
      window.fbq('track', eventName, params);
    }
  } catch {
    // Ein Tracking-Fehler darf nie den Shop brechen.
  }
}

function trackPageView(url) {
  if (!window._qiblancoMetaPixelBooted) return;
  if (url && url === window._qiblancoMetaPixelLastUrl) return;
  window._qiblancoMetaPixelLastUrl = url || window.location.href;
  fbqTrack('PageView');
}

export function MetaPixel() {
  const {subscribe} = useAnalytics();
  const subscribed = useRef(false);

  useEffect(() => subscribeConsentChanges(bootMetaPixel), []);

  useEffect(() => {
    if (subscribed.current) return;
    subscribed.current = true;

    subscribe('page_viewed', (data) => {
      trackPageView(data?.url);
    });

    subscribe('product_viewed', (data) => {
      // Payload inkl. `contents` aus app/lib/pixel-content.js (s05, da_checks).
      const payload = viewContentPayload(data);
      if (!payload) return;
      fbqTrack(
        'ViewContent',
        payload,
        eventIdFuer(data, META_EVENT_VIEW_CONTENT),
      );
    });

    subscribe('product_added_to_cart', (data) => {
      // Payload inkl. `contents` und Mengen-Delta aus app/lib/pixel-content.js.
      const payload = addToCartPayload(data);
      if (!payload) return;
      fbqTrack(
        'AddToCart',
        payload,
        eventIdFuer(data, META_EVENT_ADD_TO_CART),
      );
    });
  }, [subscribe]);

  return null;
}
