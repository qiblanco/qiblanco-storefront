/* eslint-disable no-unused-vars, no-empty, object-shorthand */
/*!
 * qpx.js — Qi-Blanco First-Party Tracking-Pixel (v2.0)
 * ====================================================
 * Erst-Party (laeuft auf eigener Domain, sendet an den eigenen Receiver).
 * Erfasst: anon_id (First-Party-Cookie+localStorage), Klick-IDs (gclid/fbclid/
 * msclid/ttclid...), UTM, Referrer-Host, Events (page_view/view_content/
 * add_to_cart/initiate_checkout/purchase/lead/identify). Versand via
 * navigator.sendBeacon (Fallback fetch keepalive).
 *
 * NEU in v2.0 (Verhaltens-Schicht, E1 2026-07-10): Sektions-Tracker —
 * data-section-Anker (IntersectionObserver 50%, seen ab 1s kumulativ),
 * Scroll-Marken 25/50/75/100, attention_ms (sichtbar + aktiv), device.
 * EIN kumulatives 'behavior'-Event je Pageview (pv_id, wachsende seq),
 * Flush alle 15s nur bei Aenderung + IMMER bei hidden/pagehide.
 * Abschaltbar via window.QPX_CONFIG = { behavior: false }. Keine neue PII,
 * kein neuer Speicher (kein zusaetzliches Cookie). v1-Verhalten unveraendert.
 *
 * EINBAU = CHRISTIAN-HAND (Website). Diese Datei ist fertig + ausgeliefert.
 * Konfiguration via window.QPX_CONFIG =
 *   { endpoint: "https://qpx.65-108-150-121.sslip.io/collect" }.
 * Standard-Endpoint unten ist ein PLATZHALTER, bis die Domain/Proxy steht.
 */
(function (w, d) {
  "use strict";
  var CFG = w.QPX_CONFIG || {};
  var ENDPOINT = CFG.endpoint || "/collect"; // gleicher Origin via Reverse-Proxy
  var COOKIE = "_qpx_anon";
  var SES = "_qpx_ses";
  var STORE = "_qpx_attr"; // persistiertes erstes Klick-Attribut (first-touch)
  var DAYS = 365;
  var CLICK_KEYS = ["gclid","gbraid","wbraid","fbclid","msclid","msclkid","ttclid","twclid","epik","sccid"];

  function uuid() {
    if (w.crypto && w.crypto.randomUUID) { try { return w.crypto.randomUUID(); } catch (e) {} }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  function setCookie(k, v, days) {
    var e = ""; if (days) { var dt = new Date(); dt.setTime(dt.getTime() + days * 864e5); e = "; expires=" + dt.toUTCString(); }
    d.cookie = k + "=" + encodeURIComponent(v) + e + "; path=/; SameSite=Lax";
  }
  function getCookie(k) {
    var m = d.cookie.match("(^|;)\\s*" + k + "\\s*=\\s*([^;]+)"); return m ? decodeURIComponent(m.pop()) : "";
  }
  function ls(k, v) {
    try { if (v === undefined) return w.localStorage.getItem(k); w.localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function anonId() {
    var id = getCookie(COOKIE) || ls(COOKIE);
    if (!id) { id = uuid(); }
    setCookie(COOKIE, id, DAYS); ls(COOKIE, id); return id;
  }
  function sessionId() {
    var s = sessionStorageGet(SES); if (!s) { s = uuid(); sessionStorageSet(SES, s); } return s;
  }
  function sessionStorageGet(k){ try { return w.sessionStorage.getItem(k);}catch(e){return null;} }
  function sessionStorageSet(k,v){ try { w.sessionStorage.setItem(k,v);}catch(e){} }

  function params() {
    var q = {}, s = w.location.search.replace(/^\?/, "");
    if (s) s.split("&").forEach(function (p) { var kv = p.split("="); if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ""); });
    return q;
  }
  function captureAttr() {
    // First-touch-Attribut persistieren: erste bekannte Klick-ID/UTM gewinnt.
    var existing; try { existing = JSON.parse(ls(STORE) || "null"); } catch (e) { existing = null; }
    var q = params(), click_ids = {}, utm = {}, found = false;
    CLICK_KEYS.forEach(function (k) { if (q[k]) { click_ids[k] = q[k]; found = true; } });
    ["source","medium","campaign","content","term"].forEach(function (k) { if (q["utm_" + k]) { utm[k] = q["utm_" + k]; } });
    if (found || Object.keys(utm).length) {
      var attr = { click_ids: click_ids, utm: utm, ts: Date.now() };
      if (!existing) { ls(STORE, JSON.stringify(attr)); existing = attr; } // first-touch bleibt
      return { click_ids: click_ids, utm: utm }; // aktueller Touch (last-touch fuer dieses Event)
    }
    return existing ? { click_ids: existing.click_ids || {}, utm: existing.utm || {} } : { click_ids: {}, utm: {} };
  }
  function refHost() {
    try { return d.referrer ? new URL(d.referrer).host : ""; } catch (e) { return ""; }
  }

  function base(name, props) {
    props = props || {};
    var attr = captureAttr();
    var ev = {
      event_id: uuid(),
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      anon_id: anonId(),
      session_id: sessionId(),
      url: w.location.href,
      referrer: d.referrer || "",
      click_ids: attr.click_ids,
      utm: attr.utm,
      referrer_host: refHost()
    };
    for (var k in props) { if (Object.prototype.hasOwnProperty.call(props, k)) ev[k] = props[k]; }
    return ev;
  }
  function send(ev) {
    var body = JSON.stringify(ev);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch (e) {}
    try { fetch(ENDPOINT, { method: "POST", body: body, headers: { "Content-Type": "application/json" }, keepalive: true, mode: "cors" }); } catch (e) {}
  }

  function track(name, props) { send(base(name, props)); }
  function identify(email, props) { props = props || {}; if (email) props.email = email; send(base("identify", props)); }

  // Queue-Replay (falls qpx vor Laden aufgerufen wurde: window.qpx.q)
  var q = (w.qpx && w.qpx.q) || [];
  function api() {
    var args = [].slice.call(arguments), cmd = args.shift();
    if (cmd === "track") return track(args[0], args[1]);
    if (cmd === "identify") return identify(args[0], args[1]);
    if (cmd === "purchase") return track("purchase", args[0]);
  }
  w.qpx = api; w.qpx.track = track; w.qpx.identify = identify;
  q.forEach(function (a) { api.apply(null, a); });

  // ---- Verhaltens-Schicht (v2.0): Sektions-Tracker -----------------------
  // EIN kumulativer Snapshot je Pageview (pv_id, seq waechst je Flush).
  // KOMPLETT in try/catch — ein Pixel-Fehler darf die Seite NIE brechen.
  // Alle Listener passive. Kein neuer Speicher: pv_id lebt nur im RAM.
  function initBehavior() {
    if (CFG.behavior === false) return;                 // Tracker-Flag (Konzept E1)
    var PV_ID = uuid();                                  // Pageview-UUID (kein Cookie)
    var seq = 0;                                         // waechst je Flush, Server: letzter Stand gewinnt
    var scrollMax = 0;                                   // erreichte Marke 25/50/75/100
    var attentionMs = 0;                                 // sichtbar + aktiv (5s-Raster)
    var lastActivity = Date.now();
    var sections = {};                                   // id -> {seen,dwellAcc,visibleSince,clicks}
    var lastSent = "";                                   // Signatur des letzten Flushs

    function sec(id) {
      if (!sections[id]) sections[id] = { seen: 0, dwellAcc: 0, visibleSince: 0, clicks: 0 };
      return sections[id];
    }
    function dwellOf(s, now) { return s.dwellAcc + (s.visibleSince ? now - s.visibleSince : 0); }
    function device() {
      try { return (w.matchMedia && w.matchMedia("(pointer:coarse)").matches) ? "mobile" : "desktop"; }
      catch (e) { return "desktop"; }
    }
    function snapshot() {
      var now = Date.now(), list = [];
      for (var id in sections) {
        if (!Object.prototype.hasOwnProperty.call(sections, id)) continue;
        var s = sections[id], dw = Math.round(dwellOf(s, now));
        if (dw >= 1000) s.seen = 1;                      // seen ab >=1s kumulativ sichtbar
        list.push({ id: id, seen: s.seen, dwell_ms: dw, clicks: s.clicks });
      }
      list.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
      return { attention_ms: attentionMs, scroll_max_pct: scrollMax, device: device(), sections: list };
    }
    function flush(force) {
      var snap = snapshot();
      var sig = JSON.stringify(snap);
      if (!force && sig === lastSent) return;            // 15s-Flush nur bei Aenderung
      lastSent = sig;
      snap.pv_id = PV_ID; snap.seq = seq++;              // kumulativer Stand, Server-Upsert monoton
      track("behavior", snap);
    }

    // Sektionen: data-section-Anker, 50%-Sichtbarkeits-Schwelle.
    var nodes = d.querySelectorAll("[data-section]");
    if (w.IntersectionObserver && nodes.length) {
      var io = new w.IntersectionObserver(function (entries) {
        var now = Date.now();
        for (var i = 0; i < entries.length; i++) {
          var en = entries[i], id = en.target.getAttribute("data-section");
          if (!id) continue;
          var s = sec(id);
          if (en.isIntersecting) { if (!s.visibleSince) s.visibleSince = now; }
          else if (s.visibleSince) { s.dwellAcc += now - s.visibleSince; s.visibleSince = 0; }
        }
      }, { threshold: 0.5 });
      for (var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
    }

    // Klicks: delegiert (capture, passive) -> naechster data-section-Vorfahr.
    d.addEventListener("click", function (e) {
      lastActivity = Date.now();
      try {
        var el = e.target && e.target.closest ? e.target.closest("[data-section]") : null;
        if (el) { var id = el.getAttribute("data-section"); if (id) sec(id).clicks++; }
      } catch (e2) {}
    }, { passive: true, capture: true });

    // Scroll-Marken 25/50/75/100 (passive + rAF-throttled).
    var scrollPending = false;
    function measureScroll() {
      scrollPending = false;
      try {
        var de = d.documentElement;
        var h = Math.max(1, de.scrollHeight || 1);
        var pct = ((w.pageYOffset || de.scrollTop || 0) + (w.innerHeight || de.clientHeight || 0)) / h * 100;
        var marks = [25, 50, 75, 100];
        for (var i = 0; i < marks.length; i++) { if (pct >= marks[i] && marks[i] > scrollMax) scrollMax = marks[i]; }
      } catch (e) {}
    }
    w.addEventListener("scroll", function () {
      lastActivity = Date.now();
      if (!scrollPending) { scrollPending = true; (w.requestAnimationFrame || w.setTimeout)(measureScroll); }
    }, { passive: true });
    measureScroll();                                     // initiale Marke (kurze Seiten = 100)

    // Aktivitaets-Signale fuer attention (nur Zeitstempel, keine Inhalte/PII).
    var acts = ["keydown", "mousemove", "touchstart"];
    for (var a = 0; a < acts.length; a++) {
      w.addEventListener(acts[a], function () { lastActivity = Date.now(); }, { passive: true });
    }
    // attention_ms: alle 5s +5000, wenn Tab sichtbar UND Aktivitaet <30s her.
    w.setInterval(function () {
      try {
        if (d.visibilityState === "visible" && Date.now() - lastActivity < 30000) attentionMs += 5000;
      } catch (e) {}
    }, 5000);

    // Flush: alle 15s nur bei Aenderung; bei hidden/pagehide IMMER.
    w.setInterval(function () { try { flush(false); } catch (e) {} }, 15000);
    d.addEventListener("visibilitychange", function () {
      if (d.visibilityState === "hidden") { try { flush(true); } catch (e) {} }
    });
    w.addEventListener("pagehide", function () { try { flush(true); } catch (e) {} });
  }

  // Auto page_view (v1-Verhalten unveraendert) + Verhaltens-Tracker (v2.0).
  function boot() { track("page_view"); try { initBehavior(); } catch (e) {} }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
