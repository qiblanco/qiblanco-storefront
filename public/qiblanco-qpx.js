/*! qpx.js — ERZEUGT aus receiver/pixel/qpx.js (v2.15) per bin/qpx-ausliefern. NICHT VON HAND AENDERN. */
(function (w, d) {
  "use strict";
  var CFG = w.QPX_CONFIG || {};
  var ENDPOINT = CFG.endpoint || "/collect";
  var COOKIE = "_qpx_anon";
  var SES = "_qpx_ses";
  var STORE = "_qpx_attr";
  var DAYS = 365;
  var CLICK_KEYS = ["gclid","gbraid","wbraid","fbclid","msclid","msclkid","ttclid","twclid","epik","sccid","gad_campaignid","h_ad_id"];

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

  var EH = "_qpx_eh";
  var EH_RX = /^[0-9a-f]{16}$/;
  function mailZeiger() {
    try {
      var roh = String(params()["qpx_eh"] || "").toLowerCase();
      if (EH_RX.test(roh)) { sessionStorageSet(EH, roh); return roh; }
    } catch (e) {}
    var gespeichert = String(sessionStorageGet(EH) || "").toLowerCase();
    return EH_RX.test(gespeichert) ? gespeichert : "";
  }

  function params() {
    var q = {}, s = w.location.search.replace(/^\?/, "");
    if (s) s.split("&").forEach(function (p) { var kv = p.split("="); if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ""); });
    return q;
  }
  function captureAttr() {
    var existing; try { existing = JSON.parse(ls(STORE) || "null"); } catch (e) { existing = null; }
    var q = params(), click_ids = {}, utm = {}, found = false;
    CLICK_KEYS.forEach(function (k) { if (q[k]) { click_ids[k] = q[k]; found = true; } });
    ["source","medium","campaign","content","term"].forEach(function (k) { if (q["utm_" + k]) { utm[k] = q["utm_" + k]; } });
    if (found || Object.keys(utm).length) {
      var attr = { click_ids: click_ids, utm: utm, ts: Date.now() };
      if (!existing) { ls(STORE, JSON.stringify(attr)); existing = attr; }
      return { click_ids: click_ids, utm: utm };
    }
    return existing ? { click_ids: existing.click_ids || {}, utm: existing.utm || {} } : { click_ids: {}, utm: {} };
  }
  function refHost() {
    try { return d.referrer ? new URL(d.referrer).host : ""; } catch (e) { return ""; }
  }

  function matchSignals() {
    if (CFG.match === false) return {};
    var out = {};
    try {
      var fbp = getCookie("_fbp"), fbc = getCookie("_fbc");
      if (fbp && fbp.indexOf("fb.") === 0) out.fbp = fbp;
      if (fbc && fbc.indexOf("fb.") === 0) out.fbc = fbc;
    } catch (e) {}
    return out;
  }
  function consentState() {
    if (CFG.consent_report === false) return null;
    try {
      var cb = w.Cookiebot;
      if (cb && cb.consent && typeof cb.consent.marketing !== "undefined") {
        if (typeof cb.hasResponse !== "undefined" && !cb.hasResponse) {
          return { ad_storage: "pending", ad_user_data: "pending" };
        }
        var mk = cb.consent.marketing ? "granted" : "denied";
        return { ad_storage: mk, ad_user_data: mk };
      }
    } catch (e) {}
    return null;
  }
  function region() {
    if (CFG.region) return String(CFG.region);
    try {
      return d.documentElement.getAttribute("data-qb-region") || "";
    } catch (e) { return ""; }
  }

  var FP_MODI = /*__QPX_FP_MODI_START__*/{"DACH":"aus","USA":"aus","notaus":true}/*__QPX_FP_MODI_END__*/;

  function fpMarkt() {
    var h = "";
    try { h = String(w.location.hostname || "").toLowerCase(); } catch (e) { return ""; }
    if (h === "qi-blanco.com" || h === "www.qi-blanco.com") return "USA";
    if (h === "qiblanco.com" || h === "www.qiblanco.com" || h === "qi-blanco.de" ||
        h === "www.qi-blanco.de" || h === "t.qiblanco.com") return "DACH";
    return "";
  }

  function fpErlaubt() {
    try {
      if (FP_MODI && FP_MODI.notaus) return false;
      var stufe = (FP_MODI && FP_MODI[fpMarkt()]) || "aus";
      if (stufe === "full") return true;
      if (stufe !== "konservativ") return false;
      var cs = consentState();
      return !!(cs && cs.ad_storage === "granted");
    } catch (e) { return false; }
  }

  function fpSignals() {
    if (!fpErlaubt()) return null;
    var o = {};
    try { if (w.screen) o.sr = String(w.screen.width) + "x" + String(w.screen.height); } catch (e) {}
    try { if (w.screen && w.screen.colorDepth) o.sd = String(w.screen.colorDepth); } catch (e) {}
    try { o.tz = String(new Date().getTimezoneOffset()); } catch (e) {}
    try { if (navigator.language) o.lang = String(navigator.language); } catch (e) {}
    try { if (navigator.platform) o.plat = String(navigator.platform); } catch (e) {}
    try { if (navigator.hardwareConcurrency) o.hc = String(navigator.hardwareConcurrency); } catch (e) {}
    try { if (navigator.deviceMemory) o.dm = String(navigator.deviceMemory); } catch (e) {}
    try { o.tp = String(navigator.maxTouchPoints || 0); } catch (e) {}
    for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) return o; }
    return null;
  }

  function gpcGilt() {
    var an = false;
    try { an = navigator.globalPrivacyControl === true; } catch (e) { return false; }
    if (!an) return false;
    return fpMarkt() === "USA" || CFG.gpc === true;
  }

  var FP2_KEY = "_qpx_fp2";
  var FP2_SCHRIFTEN = ["Arial", "Arial Black", "Calibri", "Cambria", "Comic Sans MS",
    "Consolas", "Courier New", "Georgia", "Helvetica Neue", "Impact", "Lucida Console",
    "Lucida Grande", "Menlo", "Monaco", "Palatino", "Segoe UI", "Tahoma",
    "Times New Roman", "Trebuchet MS", "Verdana", "Roboto", "Ubuntu", "Noto Sans",
    "Futura", "Gill Sans", "Avenir", "Optima", "Didot", "Garamond",
    "Franklin Gothic Medium", "Century Gothic", "Segoe UI Emoji"];
  function fnv(s) {
    var h = 0x811c9dc5, i;
    s = String(s);
    for (i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul ? Math.imul(h, 16777619) : (h * 16777619) | 0;
    }
    return ("0000000" + (h >>> 0).toString(16)).slice(-8);
  }
  function fp2Gespeichert() {
    var o = null;
    try { o = JSON.parse(sessionStorageGet(FP2_KEY) || "null"); } catch (e) { o = null; }
    return (o && typeof o === "object") ? o : null;
  }
  function fp2Canvas() {
    var c = d.createElement("canvas"), x;
    c.width = 240; c.height = 60;
    x = c.getContext && c.getContext("2d");
    if (!x) return "";
    x.textBaseline = "top";
    x.font = "14px Arial";
    x.fillStyle = "#f60"; x.fillRect(125, 1, 62, 20);
    x.fillStyle = "#069"; x.fillText("Qi qpx \u00e9\u03a9 1.0", 2, 15);
    x.fillStyle = "rgba(102,204,0,0.7)"; x.fillText("Qi qpx \u00e9\u03a9 1.0", 4, 17);
    x.globalCompositeOperation = "multiply";
    x.fillStyle = "rgb(255,0,255)";
    x.beginPath(); x.arc(50, 30, 25, 0, Math.PI * 2, true); x.closePath(); x.fill();
    return fnv(c.toDataURL());
  }
  function fp2Webgl() {
    var c = d.createElement("canvas"), g = null, t = [], ext = null, i, v, l;
    var ps = ["MAX_TEXTURE_SIZE", "MAX_RENDERBUFFER_SIZE", "MAX_VERTEX_ATTRIBS",
      "MAX_VARYING_VECTORS", "MAX_VERTEX_UNIFORM_VECTORS", "MAX_FRAGMENT_UNIFORM_VECTORS",
      "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "MAX_CUBE_MAP_TEXTURE_SIZE", "MAX_VIEWPORT_DIMS",
      "ALIASED_LINE_WIDTH_RANGE", "ALIASED_POINT_SIZE_RANGE"];
    try { g = c.getContext("webgl") || c.getContext("experimental-webgl"); } catch (e) { g = null; }
    if (!g) return "";
    try { ext = g.getExtension("WEBGL_debug_renderer_info"); } catch (e) { ext = null; }
    try { t.push(String(ext ? g.getParameter(ext.UNMASKED_VENDOR_WEBGL) : g.getParameter(g.VENDOR))); } catch (e) { t.push(""); }
    try { t.push(String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER))); } catch (e) { t.push(""); }
    for (i = 0; i < ps.length; i++) {
      try {
        v = g.getParameter(g[ps[i]]);
        t.push(v && typeof v === "object" && v.length !== undefined ? [].slice.call(v).join("x") : String(v));
      } catch (e) { t.push(""); }
    }
    try { t.push((g.getSupportedExtensions() || []).join(",")); } catch (e) {}
    try { l = g.getExtension("WEBGL_lose_context"); if (l) l.loseContext(); } catch (e) {}
    return fnv(t.join("|"));
  }
  function fp2SchriftenMesser() {
    var c = d.createElement("canvas"), x = c.getContext && c.getContext("2d");
    var probe = "mmmmmmmmmmlli1WwQ@#", basen = ["monospace", "sans-serif", "serif"];
    var bw = [], j, m = 0;
    if (x) for (j = 0; j < basen.length; j++) { x.font = "72px " + basen[j]; bw.push(x.measureText(probe).width); }
    return {
      teil: function (von, bis) {
        var i, k;
        if (!x) return;
        for (i = von; i < bis && i < FP2_SCHRIFTEN.length; i++) {
          for (k = 0; k < basen.length; k++) {
            x.font = "72px '" + FP2_SCHRIFTEN[i] + "'," + basen[k];
            if (x.measureText(probe).width !== bw[k]) { m |= (1 << i); break; }
          }
        }
      },
      wert: function () { return x ? ("0000000" + (m >>> 0).toString(16)).slice(-8) : ""; }
    };
  }
  function fp2Audio(fertig) {
    var AC = w.OfflineAudioContext || w.webkitOfflineAudioContext, ctx, o, k, p, erledigt = false;
    function ende(v) { if (!erledigt) { erledigt = true; fertig(v); } }
    if (!AC) { ende(""); return; }
    try {
      ctx = new AC(1, 5000, 44100);
      o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = 10000;
      k = ctx.createDynamicsCompressor();
      k.threshold.value = -50; k.knee.value = 40; k.ratio.value = 12;
      k.attack.value = 0; k.release.value = 0.25;
      o.connect(k); k.connect(ctx.destination); o.start(0);
      ctx.oncomplete = function (e) {
        try {
          var b = e.renderedBuffer.getChannelData(0), s = 0, i;
          for (i = 4500; i < 5000; i++) s += Math.abs(b[i]);
          ende(fnv(s.toFixed(6)));
        } catch (x) { ende(""); }
      };
      p = ctx.startRendering();
      if (p && p.then) p.then(null, function () { ende(""); });
      w.setTimeout(function () { ende(""); }, 1500);
    } catch (e) { ende(""); }
  }
  function fp2Leicht(o) {
    try { if (w.devicePixelRatio) o.dpr = String(Math.round(w.devicePixelRatio * 100) / 100); } catch (e) {}
    try { o.tzn = String(Intl.DateTimeFormat().resolvedOptions().timeZone || "").slice(0, 64); } catch (e) {}
    try { if (navigator.languages) o.langs = [].slice.call(navigator.languages).join(",").slice(0, 64); } catch (e) {}
  }
  function fp2Starten() {
    if (CFG.fp2 === false || !fpErlaubt() || fp2Gespeichert()) return;
    var o = {}, i = 0, fo = null;
    var schritte = [
      function () { o.cv = fp2Canvas(); },
      function () { o.gl = fp2Webgl(); },
      function () { fo = fp2SchriftenMesser(); fo.teil(0, 8); },
      function () { fo.teil(8, 16); },
      function () { fo.teil(16, 24); },
      function () { fo.teil(24, 32); o.fo = fo.wert(); },
      function () { fp2Leicht(o); }
    ];
    function leerlauf(fn) {
      if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 4000 });
      else w.setTimeout(fn, 200);
    }
    function weiter(dl) {
      if (dl && !dl.didTimeout && typeof dl.timeRemaining === "function" && dl.timeRemaining() < 8) {
        leerlauf(weiter);
        return;
      }
      if (i < schritte.length) {
        try { schritte[i](); } catch (e) {}
        i++;
        leerlauf(weiter);
        return;
      }
      fp2Audio(function (au) {
        o.au = au;
        o.v = "1";
        try { sessionStorageSet(FP2_KEY, JSON.stringify(o)); } catch (e) {}
      });
    }
    function los() { leerlauf(weiter); }
    if (d.readyState === "complete") los();
    else w.addEventListener("load", los);
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
    var ms = matchSignals();
    if (ms.fbp) ev.fbp = ms.fbp;
    if (ms.fbc) ev.fbc = ms.fbc;
    var cs = consentState();
    if (cs) ev.consent = cs;
    var rg = region();
    if (rg) ev.region = rg;
    var fps = fpSignals();
    if (fps) ev.fp = fps;
    if (fps && CFG.fp2 !== false) {
      var f2 = fp2Gespeichert();
      if (f2) ev.fp2 = f2;
    }
    var eh = mailZeiger();
    if (eh) ev.email_hash = eh;
    for (var k in props) { if (Object.prototype.hasOwnProperty.call(props, k)) ev[k] = props[k]; }
    return ev;
  }
  function send(ev) {
    if (gpcGilt()) return;
    var body = JSON.stringify(ev);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch (e) {}
    try { fetch(ENDPOINT, { method: "POST", body: body, headers: { "Content-Type": "application/json" }, keepalive: true, mode: "cors" }); } catch (e) {}
  }

  var pvIdent = null;
  function sichtBeimSenden() {
    var o = {};
    try { if (d.visibilityState) o.visibility_state = String(d.visibilityState); } catch (e) {}
    try { o.prerendering = d.prerendering === true; } catch (e) {}
    return o;
  }
  function identFest(ev) {
    if (CFG.pv_ident === false || !pvIdent) return;
    if (ev.consent && ev.consent.ad_storage === "denied") return;
    if (ev.anon_id === pvIdent.anon_id && ev.session_id === pvIdent.session_id) return;
    ev.anon_id = pvIdent.anon_id;
    ev.session_id = pvIdent.session_id;
    ev.ident_wechsel = 1;
  }
  function track(name, props) {
    if (name === "page_view") {
      var p = {}, sv = sichtBeimSenden(), k;
      for (k in sv) { if (Object.prototype.hasOwnProperty.call(sv, k)) p[k] = sv[k]; }
      if (props) { for (k in props) { if (Object.prototype.hasOwnProperty.call(props, k)) p[k] = props[k]; } }
      props = p;
    }
    var ev = base(name, props);
    if (name === "page_view") pvIdent = { anon_id: ev.anon_id, session_id: ev.session_id };
    else if (name === "behavior") identFest(ev);
    send(ev);
  }
  function identify(email, props) { props = props || {}; if (email) props.email = email; send(base("identify", props)); }

  function kundeIdentify() {
    var k = CFG.kunde, mail, tel, sig;
    if (CFG.identity === false || !k || typeof k !== "object") return;
    mail = String(k.email || "").trim().toLowerCase();
    tel = String(k.phone || "").trim();
    if (mail && (mail.indexOf("@") < 1 || mail.length > 254)) mail = "";
    if (tel.length > 32) tel = "";
    if (!mail && !tel) return;
    sig = "k" + fnv(mail + "|" + tel);
    if (sessionStorageGet("_qpx_idk") === sig) return;
    sessionStorageSet("_qpx_idk", sig);
    identify(mail || null, tel ? { phone: tel } : {});
  }

  var q = (w.qpx && w.qpx.q) || [];
  function api() {
    var args = [].slice.call(arguments), cmd = args.shift();
    if (cmd === "track") return track(args[0], args[1]);
    if (cmd === "identify") return identify(args[0], args[1]);
    if (cmd === "purchase") return track("purchase", args[0]);
  }
  w.qpx = api; w.qpx.track = track; w.qpx.identify = identify;
  q.forEach(function (a) { api.apply(null, a); });

  function initBehavior() {
    if (CFG.behavior === false) return;
    var PV_ID = uuid();
    var seq = 0;
    var scrollMax = 0;
    var attentionMs = 0;
    var lastActivity = Date.now();
    var sections = {};
    var lastKey = "";
    var lastVoll = "";
    var hiddenUnterdrueckt = 0;
    var FRUST_ON = CFG.frust !== false;
    var DEAD_MS = 3000, RAGE_MS = 1000, RAGE_PX = 30, RAGE_MIN = 3, FRUST_MAX = 40;
    var frust = [];
    var lastClick = null;
    var rageChain = [], rageEmitted = false;
    var KLICK_ON = CFG.klicks !== false;
    var KLICK_MAX = 60;
    var KONTO_PFAD = /^\/account(\/|$)/;
    var klicks = [];
    var lastMutation = 0, lastScrollTs = 0, unloading = false;
    var FEIN_ON = CFG.heatmap_fein !== false;
    var scrollFein = 0;
    var attentionFeinMs = 0;
    var PV_T0 = Date.now();
    try {
      if (w.performance && typeof w.performance.now === "function") PV_T0 = Date.now() - w.performance.now();
    } catch (e) {}

    function sec(id) {
      if (!sections[id]) sections[id] = { seen: 0, dwellAcc: 0, visibleSince: 0, clicks: 0, vis: 0 };
      return sections[id];
    }
    function dwellOf(s, now) { return s.dwellAcc + (s.visibleSince ? now - s.visibleSince : 0); }
    function tabSichtbar() {
      try { return d.visibilityState !== "hidden"; } catch (e) { return true; }
    }
    function dwellAnhalten(now) {
      for (var id in sections) {
        if (!Object.prototype.hasOwnProperty.call(sections, id)) continue;
        var s = sections[id];
        if (s.visibleSince) { s.dwellAcc += now - s.visibleSince; s.visibleSince = 0; }
      }
    }
    function dwellFortsetzen(now) {
      for (var id in sections) {
        if (!Object.prototype.hasOwnProperty.call(sections, id)) continue;
        var s = sections[id];
        if (s.vis && !s.visibleSince) s.visibleSince = now;
      }
    }
    function device() {
      try { return (w.matchMedia && w.matchMedia("(pointer:coarse)").matches) ? "mobile" : "desktop"; }
      catch (e) { return "desktop"; }
    }
    function clamp01(n) { return n < 0 ? 0 : (n > 1 ? 1 : n); }
    var SICHERE_ID = /^[A-Za-z][A-Za-z0-9_-]*$/, LANGE_ZIFFERN = /[0-9]{5}/;
    function selOf(el) {
      try {
        if (!el || el.nodeType !== 1) return "";
        if (el.id && SICHERE_ID.test(el.id) && !LANGE_ZIFFERN.test(el.id)) return "#" + el.id;
        var t = el.tagName.toLowerCase(), da = el.getAttribute("data-section");
        if (da) return t + "[data-section=" + da + "]";
        var s = el, i = 1;
        while ((s = s.previousElementSibling)) i++;
        return t + ":nth-child(" + i + ")";
      } catch (e) { return ""; }
    }
    function relPos(el, cx, cy) {
      try {
        var r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0)
          return { rx: clamp01((cx - r.left) / r.width), ry: clamp01((cy - r.top) / r.height) };
      } catch (e) {}
      return { rx: null, ry: null };
    }
    var RAHMEN_ON = CFG.abschnitt_rahmen !== false;
    var RAHMEN_SEL = ".shopify-section[id^=\"shopify-section-\"]";
    var RAHMEN_KLASSE_GENERISCH = /^(shopify-section|index-section.*|shopify-section-group-.*)$/;
    var rahmenEl = [], rahmenNm = [];
    function rahmenBasis(el) {
      var k = String(el.id || "").replace(/^shopify-section-/, "")
                .replace(/^(template|sections)--\d+__/, "");
      var m = k.match(/^([A-Za-z][A-Za-z0-9_-]*?)_(?=[a-z0-9]*[A-Z0-9])[A-Za-z0-9]{6}$/);
      if (m) k = m[1];
      else if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(k) || /^\d{10}[0-9a-f]{6,10}$/i.test(k)) {
        var kl = String(el.className || "").split(/\s+/), hint = "";
        for (var i = 0; i < kl.length && !hint; i++)
          if (kl[i] && !RAHMEN_KLASSE_GENERISCH.test(kl[i])) hint = kl[i];
        k = hint || ("abschnitt-" + k.slice(0, 8));
      }
      k = k.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      return (k || "abschnitt").slice(0, 60);
    }
    function rahmenMarkiert(el) {
      try {
        return el.hasAttribute("data-section") || el.hasAttribute("data-section-type") ||
               !!el.querySelector("[data-section],[data-section-type]");
      } catch (e) { return true; }
    }
    function rahmenScan() {
      var out = [];
      if (!RAHMEN_ON) return out;
      try {
        var alle = d.querySelectorAll(RAHMEN_SEL), zahl = {};
        rahmenEl = []; rahmenNm = [];
        for (var i = 0; i < alle.length; i++) {
          if (rahmenMarkiert(alle[i])) continue;
          var b = rahmenBasis(alle[i]);
          zahl[b] = (zahl[b] || 0) + 1;
          rahmenEl.push(alle[i]); rahmenNm.push(zahl[b] > 1 ? b + "-" + zahl[b] : b);
          out.push(alle[i]);
        }
      } catch (e) {}
      return out;
    }
    function rahmenName(el) {
      for (var i = 0; i < rahmenEl.length; i++) if (rahmenEl[i] === el) return rahmenNm[i];
      rahmenScan();
      for (i = 0; i < rahmenEl.length; i++) if (rahmenEl[i] === el) return rahmenNm[i];
      return "";
    }
    function rueckfallAbschnitt(el) {
      try {
        var sc = el && el.closest ? el.closest("[data-section-type]") : null;
        if (sc) return sc.getAttribute("data-section-type") || "";
        if (!RAHMEN_ON) return "";
        sc = el && el.closest ? el.closest(RAHMEN_SEL) : null;
        return sc ? rahmenName(sc) : "";
      } catch (e) { return ""; }
    }
    function sectionOf(el) {
      try { var sc = el && el.closest ? el.closest("[data-section]") : null;
            return sc ? (sc.getAttribute("data-section") || "") : ""; }
      catch (e) { return ""; }
    }
    function klickZiel(el) {
      try {
        var a = el && el.closest ? el.closest("a,button,input,select,textarea,label,summary,[role=button],[role=link],[role=tab]") : null;
        return a || el;
      } catch (e) { return el; }
    }
    var KLICK_STUFEN = 8;
    function pfadOf(el) {
      var teile = [], n = el;
      try {
        while (n && n.nodeType === 1 && teile.length < KLICK_STUFEN && n.tagName !== "BODY" && n.tagName !== "HTML") {
          var st = selOf(n);
          if (!st) break;
          teile.unshift(st);
          if (st.charAt(0) === "#" || st.indexOf("[data-section=") >= 0) break;
          n = n.parentElement;
        }
      } catch (e) {}
      return teile.join(" > ");
    }
    function r3(n) { return n == null ? null : Math.round(n * 1000) / 1000; }
    function feinNachmessen(pv) {
      try {
        if (!FEIN_ON || pv !== PV_ID) return;
        var de = d.documentElement, h = Math.max(1, de.scrollHeight || 1);
        var pct = ((w.pageYOffset || de.scrollTop || 0) + (w.innerHeight || de.clientHeight || 0)) / h * 100;
        var pf = Math.round(Math.max(0, Math.min(100, pct)));
        if (pf > scrollFein) scrollFein = pf;
      } catch (e) {}
    }
    function klickSectionOf(el) {
      if (!FEIN_ON) return sectionOf(el);
      try {
        var sc = el && el.closest ? el.closest("[data-section]") : null;
        if (sc) return sc.getAttribute("data-section") || "";
        return rueckfallAbschnitt(el);
      } catch (e) { return ""; }
    }
    var ZIEL_LOCALE = /^\/[a-z]{2}(-[a-z]{2})?(?=\/)/i;
    function hostOhneWww(h) { return String(h || "").toLowerCase().replace(/^www\./, ""); }
    function zielAusPfad(p) {
      p = String(p || "/").replace(ZIEL_LOCALE, "").toLowerCase();
      if (/^\/cart\/add(\/|\.js|$)/.test(p)) return "kauf";
      if (/^\/(checkouts?|cart\/c|cart\/attribution)(\/|$)/.test(p) || /^\/cart\/[0-9]+:[0-9]+/.test(p)) return "kasse";
      if (/^\/cart(\/|$)/.test(p)) return "warenkorb";
      if (/^\/(collections\/[^\/]+\/)?products\/./.test(p)) return "produkt";
      if (/^\/pages\/./.test(p)) return "lp";
      return "navigation";
    }
    function zielKlasse(el) {
      try {
        if (!el || el.nodeType !== 1 || !el.closest) return "sonst";
        var hier = hostOhneWww(w.location.hostname), u;
        var a = el.closest("a"), href = a ? a.getAttribute("href") : null;
        if (href != null) {
          href = String(href).trim();
          if (href.charAt(0) === "#") return "anker";
          var sch = /^([a-z][a-z0-9+.-]*):/i.exec(href);
          if (sch && !/^https?$/i.test(sch[1])) return /^javascript$/i.test(sch[1]) ? "sonst" : "extern";
          u = new URL(href, w.location.href);
          var dort = hostOhneWww(u.hostname);
          if (dort !== hier) {
            if (dort.indexOf("checkout.") === 0 || /^\/checkouts?(\/|$)/.test(u.pathname)) return "kasse";
            if (/\.myshopify\.com$/.test(dort) && /^\/cart\/c(\/|$)/.test(u.pathname)) return "kasse";
            return "extern";
          }
          if (u.hash && u.pathname === w.location.pathname) return "anker";
          return zielAusPfad(u.pathname);
        }
        var tag = el.tagName, typ = String(el.getAttribute("type") || "").toLowerCase();
        var absenden = (tag === "BUTTON" && (typ === "" || typ === "submit")) ||
                       (tag === "INPUT" && (typ === "submit" || typ === "image"));
        if (!absenden) return "sonst";
        if (String(el.getAttribute("name") || "").toLowerCase() === "checkout") return "kasse";
        var f = el.closest("form"), act = f ? f.getAttribute("action") : null;
        if (!act) return "sonst";
        u = new URL(String(act), w.location.href);
        if (hostOhneWww(u.hostname) !== hier) return "extern";
        var z = zielAusPfad(u.pathname);
        if (z === "warenkorb" && el.closest("[data-qb-kaufknopf]")) return "kauf";
        return (z === "kauf" || z === "warenkorb" || z === "kasse") ? z : "sonst";
      } catch (e) { return "sonst"; }
    }
    function pushKlick(tgt, cx, cy) {
      if (!KLICK_ON || klicks.length >= KLICK_MAX) return;
      if (KONTO_PFAD.test(w.location.pathname || "")) return;
      var el = klickZiel(tgt);
      if (!el || el.nodeType !== 1) return;
      var rp = (cx != null) ? relPos(el, cx, cy) : { rx: null, ry: null };
      var kl = { section_id: klickSectionOf(el), sel: pfadOf(el), rx: r3(rp.rx), ry: r3(rp.ry) };
      if (FEIN_ON) { kl.z = zielKlasse(el); kl.t = Math.max(0, Math.round((Date.now() - PV_T0) / 100) * 100); }
      klicks.push(kl);
    }
    function pushFrust(typ, el, cx, cy, meta) {
      if (!FRUST_ON || frust.length >= FRUST_MAX) return;
      var rp = (el && cx != null) ? relPos(el, cx, cy) : { rx: null, ry: null };
      frust.push({ typ: typ, section_id: sectionOf(el), sel: selOf(el),
                   rx: rp.rx, ry: rp.ry, meta: meta || {} });
    }
    function exempt(el) {
      try {
        if (el.tagName === "A") {
          var h = el.getAttribute("href") || "";
          if (/^(mailto:|tel:)/i.test(h) || el.hasAttribute("download") ||
              el.getAttribute("target") === "_blank") return true;
        }
        if (el.tagName === "INPUT" && (el.getAttribute("type") || "").toLowerCase() === "file") return true;
      } catch (e) {}
      return false;
    }
    function onError(msg, src, ch, san, tr) {
      if (!FRUST_ON) return;
      try {
        msg = ("" + (msg || "")).slice(0, 120);
        src = ("" + (src || "")).slice(0, 120);
        var meta = { msg: msg, src: src };
        if (ch) meta.ch = ch;
        if (san != null) meta.san = san;
        if (tr != null) meta.tr = tr;
        if (lastClick && Date.now() - lastClick.t <= RAGE_MS)
          pushFrust("error_click", lastClick.el, lastClick.x, lastClick.y, meta);
        else if (frust.length < FRUST_MAX)
          frust.push({ typ: "js_error", section_id: "", sel: "", rx: null, ry: null, meta: meta });
      } catch (e) {}
    }
    var MEDIEN_ON = CFG.medien !== false;
    var MED_MRC_MS = 2000;
    var MED_SEG_MAX = 6 * 3600000;
    var MED_VIDEO_MAX = 20, MED_BILD_MAX = 40, MED_EINTRAG_MAX = 55;
    var MED_UMKEHR_PCT = 5, MED_UMKEHR_MAX = 20, MED_BILD_MIN_MS = 500;
    var MED_EXTERN_MAX = 40;
    var MED_EXTERN_STAND = { video_stand: 1, video_scrub: 1, bild_gesehen: 1, ausstieg: 1 };
    var MED_FAMILIEN = { imgix: 1, youtube: 1, scrub: 1, "360": 1, unbekannt: 1 };
    var MED_ARTEN = { video_start: 1, video_quartil: 1, video_stand: 1,
                      video_scrub: 1, bild_gesehen: 1, scroll_umkehr: 1, ausstieg: 1 };
    var medien = {};
    var medN = 0, medBildN = 0;
    var medIo = null, medObserved = [];
    var medExtern = [];
    var medExternVerworfen = 0;
    var scrollPct = 0, scrollWende = null, scrollUmkehrN = 0, scrollUmkehrListe = [];
    var letzterAnker = "";
    var ausstiegAn = 0;
    var MED_T0 = Date.now();
    var MED_STOCK_FENSTER_MS = 10000;
    var medBootFertig = 0;
    var medTipp = null;
    var MED_ZUSATZ = MEDIEN_ON && CFG.medien_zusatz !== false;
    if (MED_ZUSATZ) { MED_ARTEN.video_sicht = 1; MED_ARTEN.video_bewusst = 1; }
    var MED_PERF = false;
    try { MED_PERF = !!(w.performance && typeof w.performance.now === "function"); } catch (e) {}

    function medSanit(s) {
      try {
        s = String(s || "").toLowerCase().replace(/[^a-z0-9_.:-]+/g, "-")
             .replace(/^-+|-+$/g, "");
        return s.slice(0, 64);
      } catch (e) { return ""; }
    }
    function medBasename(u) {
      try {
        u = String(u || "");
        if (!u || u.indexOf("blob:") === 0 || u.indexOf("data:") === 0) return "";
        u = u.split("?")[0].split("#")[0];
        return medSanit(u.substring(u.lastIndexOf("/") + 1));
      } catch (e) { return ""; }
    }
    function medObjekt(el) {
      var v = el.getAttribute && el.getAttribute("data-video");
      if (v) return { id: medSanit(v), q: "anker" };
      var b = medBasename(el.currentSrc || el.src);
      if (b) return { id: b, q: "quelle" };
      b = medBasename(el.getAttribute && el.getAttribute("poster"));
      if (b) return { id: b, q: "poster" };
      try {
        var sc = el.closest ? el.closest("[data-section]") : null;
        if (sc) { var sid = medSanit(sc.getAttribute("data-section"));
                  if (sid) return { id: sid, q: "sektion" }; }
      } catch (e) {}
      return { id: "", q: "" };
    }
    function medFamilie(el) {
      var f = el.getAttribute && el.getAttribute("data-video-familie");
      if (f && MED_FAMILIEN[f]) return { f: f, q: "anker" };
      return { f: "unbekannt", q: "abgeleitet" };
    }
    function medTon(el, k) {
      if (!k.tonBekannt || !k.tonHoerbar) return false;
      try {
        if (el.muted) return false;
        if (typeof el.volume === "number" && el.volume <= 0) return false;
      } catch (e) { return false; }
      return true;
    }
    function medCt(el) {
      try { var c = el.currentTime; return (typeof c === "number" && c >= 0) ? c : 0; }
      catch (e) { return 0; }
    }
    function medGespielt(el) {
      try { return !!(el.played && el.played.length > 0); } catch (e) { return true; }
    }
    function medDauer(el) {
      try { var dd = el.duration; return (typeof dd === "number" && dd > 0 && dd < 86400) ? dd : 0; }
      catch (e) { return 0; }
    }
    function medS1(x) { return Math.round((x || 0) * 10) / 10; }
    function medAuto(el) {
      try { return (el.autoplay === true || (el.hasAttribute && el.hasAttribute("autoplay"))) ? 1 : 0; }
      catch (e) { return 0; }
    }
    function medStumm(el) {
      try { return (el.muted || (typeof el.volume === "number" && el.volume <= 0)) ? 1 : 0; }
      catch (e) { return 1; }
    }
    function medSichtbarZ(z) { return z === "sichtbar_ton" || z === "sichtbar_stumm"; }
    function medVerdeckt(el) {
      try {
        if (typeof el.checkVisibility === "function" &&
            el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) === false) return true;
      } catch (e) {}
      try {
        if (typeof d.elementFromPoint !== "function" || !el.getBoundingClientRect) return false;
        var r = el.getBoundingClientRect(), vh = w.innerHeight || 0, vw = w.innerWidth || 0;
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (!(r.width > 0 && r.height > 0) || x < 0 || y < 0 || (vw && x > vw) || (vh && y > vh)) return false;
        var hit = d.elementFromPoint(x, y);
        if (!hit || hit === el) return false;
        var h = el.parentNode;
        return !(h && h.contains && h.contains(hit)) && !(el.contains && el.contains(hit));
      } catch (e2) { return false; }
    }
    function medSichtPruef(k, now, lief) {
      if (!MED_ZUSATZ || k.svMarke || k.art === "bild") return;
      var an = k.vis && tabSichtbar();
      if (an && k.sv && medVerdeckt(k.sichtEl || k.el)) { k.sv = 0; return; }
      if (k.sv && now - k.sv >= MED_MRC_MS) {
        k.svMarke = 1; k.svT = Math.max(0, k.sv + MED_MRC_MS - MED_T0); k.svLief = lief ? 1 : 0;
        return;
      }
      if (!an) { k.sv = 0; return; }
      if (!k.sv && !medVerdeckt(k.sichtEl || k.el)) k.sv = now;
    }
    function medZusatz(k, el, ct, lief, now) {
      medSichtPruef(k, now, lief);
      if (ct > k.ctMax) k.ctMax = ct;
      var rate = 1;
      try { if (typeof el.playbackRate === "number" && el.playbackRate > 0) rate = el.playbackRate; } catch (e) {}
      var wand = k.zEval ? (now - k.zEval) / 1000 : 0;
      var sprung = k.zEval && (ct - k.letztCt) > wand * rate + 1.5;
      if (sprung) k.sprungN++;
      else if (lief && medSichtbarZ(k.zustand) && ct > k.letztCt && ct > k.ctSichtMax) k.ctSichtMax = ct;
      k.zEval = now;
      var dur = medDauer(el);
      if (lief && dur && k.letztCt - ct > dur * 0.5) k.runden++;
    }
    function medBewusst(k, el, wert, nah) {
      if (!MED_ZUSATZ || k.bw[wert]) return;
      var lief = 0;
      try { lief = (!el.paused && !el.ended) ? 1 : 0; } catch (e) {}
      k.bw[wert] = { t: Date.now() - MED_T0, ct: medS1(medCt(el)), lief: lief,
                     auto: medAuto(el), nah: nah, sicht: k.vis ? 1 : 0 };
    }
    function medHuelleEng(el) {
      try {
        var h = el.parentNode;
        if (!h || h === d.body || h === d.documentElement || !h.getBoundingClientRect || !el.getBoundingClientRect) return null;
        var rh = h.getBoundingClientRect(), rv = el.getBoundingClientRect();
        var fv = rv.width * rv.height, fh = rh.width * rh.height;
        return (fv > 0 && fh > 0 && fh <= fv * 1.5) ? h : null;
      } catch (e) { return null; }
    }
    function medNah(el, x) {
      if (!x) return "";
      if (x === el) return "video";
      var h = medHuelleEng(el);
      try { return (h && h.contains && h.contains(x)) ? "huelle" : ""; } catch (e) { return ""; }
    }
    function medKnopf(x) {
      try { return !!(x && x.closest && x.closest("button, a, input, select, textarea, [role=button]")); }
      catch (e) { return true; }
    }
    function medTippVideo(tgt) {
      if (!MED_ZUSATZ || !tgt) return;
      if (medKnopf(tgt)) return;
      var kd = tgt.__qpxMed;
      if (kd && kd.art !== "bild" && medien[kd.id] === kd) { medBewusst(kd, tgt, 1, "video"); return; }
      var treffer = null, n = 0;
      for (var id in medien) {
        if (!Object.prototype.hasOwnProperty.call(medien, id)) continue;
        var k = medien[id];
        if (k.art === "bild" || !k.el) continue;
        var els = k.sichtEl && k.sichtEl !== k.el ? [k.el, k.sichtEl] : [k.el];
        for (var j = 0; j < els.length; j++) {
          if (medNah(els[j], tgt) === "huelle") { n++; treffer = { k: k, el: els[j] }; break; }
        }
      }
      if (n === 1) medBewusst(treffer.k, treffer.el, 1, "huelle");
    }
    function medTonAn(k, el) {
      var stumm = medStumm(el), war = k.tonStumm;
      k.tonStumm = stumm;
      if (!MED_ZUSATZ || !war || stumm) return;
      var x = medTipp;
      if (!x || medUhr() < x.t || medUhr() - x.t > 1000) return;
      medBewusst(k, el, 2, medNah(el, x.el) || "seite");
    }
    function medZustand(k, el) {
      if (!tabSichtbar()) return "hintergrund";
      var ton = medTon(el, k);
      if (k.vis) return ton ? "sichtbar_ton" : "sichtbar_stumm";
      return ton ? "unsichtbar_ton" : "unsichtbar_stumm";
    }
    function medLauf(k, el, now) {
      if (!k.spielt || !k.seit) return 0;
      if (k.zustand === "hintergrund") {
        var c = medCt(el);
        return (c > k.ctSeit) ? Math.round((c - k.ctSeit) * 1000) : 0;
      }
      var ms = now - k.seit;
      return ms > 0 ? ms : 0;
    }
    function medBuche(k, el, now) {
      var ms = medLauf(k, el, now);
      if (ms > 0 && ms <= MED_SEG_MAX) k.konten[k.zustand] = (k.konten[k.zustand] || 0) + ms;
      k.seit = 0; k.ctSeit = medCt(el);
    }
    function medKonten(k, el, now) {
      var o = {}, id;
      for (id in k.konten) { if (k.konten[id]) o[id] = k.konten[id]; }
      var lauf = medLauf(k, el, now);
      if (lauf > 0 && lauf <= MED_SEG_MAX) o[k.zustand] = (o[k.zustand] || 0) + lauf;
      return o;
    }
    function medSumme(o) { var s = 0, id; for (id in o) s += o[id]; return s; }
    function medMrc(k, el, now) {
      if (k.mrc) return;
      if (!k.spielt || !k.vis || !tabSichtbar()) { k.sichtSeit = 0; return; }
      if (!k.sichtSeit) { k.sichtSeit = now; return; }
      if (now - k.sichtSeit >= MED_MRC_MS) { k.mrc = 1; k.startOff = now - MED_T0; k.start = 1; }
    }
    function medQuartile(k, el, now) {
      if (!k.mrc) return;
      var dur = medDauer(el); if (!dur) return;
      var ct = medCt(el), p = ct / dur;
      if (k.letztP > 0.9 && p < 0.1) p = 1;
      var m = [25, 50, 75, 100], i;
      for (i = 0; i < m.length; i++) {
        if (p * 100 >= m[i] && !k.q[m[i]]) {
          k.q[m[i]] = { t: now - MED_T0, z: k.zustand, kn: medKonten(k, el, now) };
        }
      }
      k.letztP = p;
    }
    function medEval(el) {
      if (!MEDIEN_ON) return;
      var k = el && el.__qpxMed; if (!k) return;
      var now = Date.now();
      medBuche(k, el, now);
      var lief = k.spielt;
      try { k.spielt = !!(!el.paused && !el.ended && el.readyState > 1); }
      catch (e) { k.spielt = false; }
      var ct = medCt(el);
      if (!k.spielt && !lief && k.letztCt >= 0 && Math.abs(ct - k.letztCt) > 0.05) {
        var durS = medDauer(el);
        if (durS) {
          var pct = Math.round(ct / durS * 100);
          if (pct > k.scrubMax) k.scrubMax = pct;
          if (ct < k.letztCt - 0.05) k.scrubUmkehr++;
          k.scrubN++;
          if (k.famQ !== "anker") { k.fam = "scrub"; k.famQ = "laufzeit"; }
        }
      } else if (k.spielt && k.famQ !== "anker" && k.fam === "unbekannt") {
        k.fam = "imgix";
        k.famQ = "laufzeit";
      }
      if (MED_ZUSATZ) medZusatz(k, el, ct, lief, now);
      k.letztCt = ct;
      k.zustand = medZustand(k, el);
      if (k.spielt) { k.seit = now; k.ctSeit = ct; }
      medMrc(k, el, now);
      medQuartile(k, el, now);
    }
    function medRegistriere(el, art) {
      if (!MEDIEN_ON || !el || el.__qpxMed) return;
      if (art === "bild") { if (medBildN >= MED_BILD_MAX) return; }
      else if (medN >= MED_VIDEO_MAX) return;
      var o = medObjekt(el);
      if (!o.id) return;
      var k = medien[o.id];
      if (!k) {
        var f = art === "bild" ? { f: null, q: null } : medFamilie(el);
        var ton = el.getAttribute && el.getAttribute("data-video-ton");
        k = { art: art, id: o.id, objQ: o.q, fam: f.f, famQ: f.q, el: el,
              tonBekannt: ton === "hoerbar" || ton === "stumm",
              tonHoerbar: ton === "hoerbar",
              konten: {}, zustand: "sichtbar_stumm", spielt: false, vis: 0,
              seit: 0, ctSeit: 0, letztCt: medCt(el), letztP: 0,
              mrc: 0, sichtSeit: 0, start: 0, startOff: 0, q: {},
              scrubMax: 0, scrubUmkehr: 0, scrubN: 0,
              ldZ: 0, ldPlay: 0, ldAus: 0, ldRvfc: 0, stkT0: 0, stkSeit: 0, stkMs: 0, stkN: 0, stkZu: 0, stkAus: 0,
              stkBereit: (medCt(el) === 0 && !medGespielt(el)) ? 1 : 0,
              dwell: 0, dwellSeit: 0,
              sv: 0, svMarke: 0, svT: 0, svLief: 0,
              ctMax: 0, ctSichtMax: 0, ctPause: 0, pauseN: 0, runden: 0,
              sprungN: 0, zEval: 0, pauseBild: 0, ctStart: 0,
              bw: {}, tonStumm: medStumm(el) };
        medien[o.id] = k;
        if (art === "bild") medBildN++; else medN++;
      }
      el.__qpxMed = k;
      el.__qpxBoot = medBootFertig ? 0 : 1;
      if (art === "bild") return;
      try { el.__qpxLaeuft = (el.paused === false && el.readyState >= 3) ? 1 : 0; } catch (e) { el.__qpxLaeuft = 0; }
      var evs = ["play", "playing", "pause", "ended", "volumechange", "seeked", "emptied"];
      for (var i = 0; i < evs.length; i++) {
        el.addEventListener(evs[i], function () { try { medEval(el); } catch (e) {} },
                            { passive: true });
      }
      el.addEventListener("pause", function () {
        try { var kp = el.__qpxMed || k; if (MED_ZUSATZ) { kp.ctPause = medCt(el); kp.pauseN++; kp.pauseBild = (kp.vis && tabSichtbar()) ? 1 : 0; } } catch (e) {}
      }, { passive: true });
      el.addEventListener("volumechange", function () {
        try { medTonAn(el.__qpxMed || k, el); } catch (e) {}
      }, { passive: true });
      var lev = ["play", "playing", "waiting", "pause", "seeking", "ended", "emptied"];
      for (var i3 = 0; i3 < lev.length; i3++) {
        (function (typ) {
          el.addEventListener(typ, function () { try { medLadenEreignis(el, typ); } catch (e) {} },
                              { passive: true });
        })(lev[i3]);
      }
      el.addEventListener("timeupdate", function () {
        var n = Date.now();
        if (n - (el.__qpxTu || 0) < 1000) return;
        el.__qpxTu = n;
        try { medEval(el); } catch (e) {}
      }, { passive: true });
    }
    function medUhr() {
      if (MED_PERF) { try { return w.performance.now(); } catch (e) {} }
      return Date.now();
    }
    function medFcp() {
      if (!MED_PERF) return 0;
      try {
        var p = w.performance.getEntriesByName ? w.performance.getEntriesByName("first-contentful-paint") : null;
        return (p && p.length && p[0].startTime > 0) ? p[0].startTime : 0;
      } catch (e) { return 0; }
    }
    function medTippAn(el, t) {
      var x = medTipp;
      if (!x || t < x.t || t - x.t > 1000) return false;
      try {
        if (x.el === el) return true;
        if (x.el && x.el.closest && x.el.closest("button, a, input, select, textarea, [role=button]")) return false;
        var h = el.parentNode;
        return !!(h && h.contains && h.contains(x.el));
      } catch (e) { return false; }
    }
    function medZeit(x) {
      return (MED_PERF && typeof x === "number" && isFinite(x) && x > 0 && x < 1e11) ? x : medUhr();
    }
    function medPaintBekannt() {
      try { return MED_PERF && typeof w.PerformancePaintTiming !== "undefined"; } catch (e) { return false; }
    }
    function medGewollt(k, el) {
      try { if (el.autoplay === true || (el.hasAttribute && el.hasAttribute("autoplay"))) return "auto"; } catch (e) {}
      if (k.ldPlay) return "play";
      try { if (el.paused === false) return "play"; } catch (e) {}
      return "";
    }
    function medImErstenBild(en) {
      try {
        var r = en.boundingClientRect, vh = (en.rootBounds && en.rootBounds.height) || w.innerHeight || 0;
        if (!r || !vh) return false;
        var y = w.pageYOffset || (d.documentElement && d.documentElement.scrollTop) || 0;
        var oben = r.top + y, unten = r.bottom + y, sicht = Math.min(unten, vh) - Math.max(oben, 0);
        return sicht > 0 && (sicht >= (unten - oben) * 0.5 || sicht >= vh * 0.5);
      } catch (e) { return false; }
    }
    function medLadenStart(k, el, t0, art) {
      k.ldZ = 1; k.ldT0 = t0; k.ldT0Art = art; k.ldEl = el; k.ldAn = medGewollt(k, el) || "play";
      k.ldVorher = (medCt(el) > 0 || medGespielt(el)) ? 1 : 0;
      if (typeof el.requestVideoFrameCallback === "function") {
        try {
          el.requestVideoFrameCallback(function medBildCb(jetzt, md) {
            try {
              if (k.ldZ !== 1 || el !== k.ldEl) return;
              if (el.paused || !el.__qpxLaeuft) { el.requestVideoFrameCallback(medBildCb); return; }
              var t1 = medZeit(md && md.presentationTime);
              if (t1 < k.ldT0 - 1000) t1 = medUhr();
              medLadenBild(k, el, t1, "rvfc");
            } catch (e) {}
          });
          k.ldRvfc = 1;
          return;
        } catch (e) {}
      }
      try { if (el.__qpxLaeuft && el.paused === false) medLadenBild(k, el, t0, "schon"); } catch (e) {}
    }
    function medLadenBild(k, el, t1, art) {
      if (k.ldZ !== 1 || el !== k.ldEl) return;
      k.ldZ = 2; k.ldWert = Math.max(0, Math.round(t1 - k.ldT0)); k.ldT1Art = art;
    }
    function medRueck(k, el, t0, art, ct) {
      var jetzt = medUhr(), dur = medDauer(el), rate = 1;
      try { if (el.playbackRate > 0) rate = el.playbackRate; } catch (e) {}
      if (!dur || jetzt - t0 >= dur * 1000 / rate) return false;
      k.ldZ = 2; k.ldT0 = t0; k.ldT0Art = art; k.ldEl = el; k.ldAn = medGewollt(k, el);
      k.ldWert = Math.max(0, Math.round(jetzt - ct * 1000 / rate - t0)); k.ldT1Art = "rueck";
      return true;
    }
    function medLadenOhne(k, grund, t) {
      if (k.ldZ === 2) return;
      var el = k.ldEl || k.el;
      k.ldOffen = (k.ldZ === 1) ? Math.max(0, Math.round(t - k.ldT0)) : null;
      try { k.ldRs = el.readyState || 0; k.ldP = el.paused ? 1 : 0; } catch (e) { k.ldRs = 0; k.ldP = 1; }
      k.ldZ = 2; k.ldWert = null; k.ldGrund = grund; k.ldH = tabSichtbar() ? 0 : 1;
    }
    function medLadenPruefe(k, el, t) {
      if (k.ldZ !== 0 || k.ldAus || !el || el.__qpxMed !== k) return;
      if (!el.__qpxSicht || !tabSichtbar() || !medGewollt(k, el)) return;
      medLadenStart(k, el, t, "io");
    }
    function medLadenIo(k, el, en, vis, erst) {
      if (k.ldAus) return;
      var t = medZeit(en.time);
      if (vis) k.sichtEl = el;
      if (k.ldZ === 1 && el === k.ldEl && !vis) { medLadenOhne(k, "weg", t); return; }
      if (k.ldZ !== 0 || !vis) return;
      if (erst && el.__qpxBoot && tabSichtbar() && medGewollt(k, el)) {
        var fcp = medFcp();
        if (fcp ? fcp > t : medPaintBekannt()) {
          var ct0 = medCt(el), lauf0 = false;
          try { lauf0 = !!(el.__qpxLaeuft && el.paused === false && el.readyState >= 3); } catch (e) {}
          if (ct0 > 0 && lauf0 && medRueck(k, el, t, "io", ct0)) return;
          medLadenStart(k, el, t, "io");
          return;
        }
        if (!fcp || !medImErstenBild(en)) { medLadenOhne(k, "vor_pixel", t); return; }
        var ct = medCt(el), spielt = false;
        try { spielt = el.paused === false && el.readyState >= 3; } catch (e) {}
        if (ct > 0 || spielt) {
          if (!spielt || !medRueck(k, el, fcp, "fcp", ct)) medLadenOhne(k, "vor_pixel", t);
          return;
        }
        medLadenStart(k, el, fcp, "fcp");
        return;
      }
      medLadenPruefe(k, el, t);
    }
    function medStockenEnde(k) { return k.stkZu || (k.stkT0 + MED_STOCK_FENSTER_MS); }
    function medStockenMs(k, t) {
      var ms = k.stkMs;
      if (k.stkSeit) { var e = Math.min(t, medStockenEnde(k)); if (e > k.stkSeit) ms += e - k.stkSeit; }
      return Math.round(ms);
    }
    function medStockenBuche(k, t) {
      if (!k.stkSeit) return;
      var e = Math.min(t, medStockenEnde(k));
      if (e > k.stkSeit) k.stkMs += e - k.stkSeit;
      k.stkSeit = 0;
    }
    function medStockenSchliesse(k, t) {
      if (!k.stkT0 || k.stkZu) return;
      medStockenBuche(k, t);
      k.stkZu = Math.min(t, k.stkT0 + MED_STOCK_FENSTER_MS);
    }
    function medLadenEreignis(el, typ) {
      if (!MEDIEN_ON) return;
      var k = el && el.__qpxMed; if (!k || k.art === "bild") return;
      var t = medUhr();
      if (typ === "play") {
        k.ldPlay = 1;
        if (k.ldZ === 1 && k.ldAn === "auto" && el === k.ldEl && medTippAn(el, t)) {
          k.ldT0 = t; k.ldT0Art = "tipp"; k.ldAn = "tipp";
        }
      }
      if (typ === "playing") el.__qpxLaeuft = 1;
      else if (typ === "waiting" || typ === "pause" || typ === "emptied") el.__qpxLaeuft = 0;
      if (typ === "playing") {
        if (k.stkBereit) { k.stkBereit = 0; if (!k.stkT0 && !k.stkAus && tabSichtbar()) k.stkT0 = t; }
        medStockenBuche(k, t);
      } else if (typ === "waiting") {
        var sk = false, pa = true;
        try { sk = !!el.seeking; pa = !!el.paused; } catch (e) {}
        if (k.stkT0 && !k.stkZu && !k.stkSeit && !sk && !pa && t < medStockenEnde(k)) { k.stkSeit = t; k.stkN++; }
      } else if (typ === "pause" || typ === "seeking" || typ === "ended" || typ === "emptied") {
        medStockenBuche(k, t);
      }
      if (k.ldZ === 0) medLadenPruefe(k, el, t);
      if (k.ldZ === 1 && !k.ldRvfc && el === k.ldEl && typ === "playing")
        medLadenBild(k, el, t, "pl");
    }
    function medLadenTab() {
      var t = medUhr(), id;
      for (id in medien) {
        if (!Object.prototype.hasOwnProperty.call(medien, id)) continue;
        var k = medien[id];
        if (k.art === "bild" || k.ldZ !== 0) continue;
        medLadenPruefe(k, k.sichtEl || k.el, t);
      }
    }
    function medLadenSchluss() {
      var t = medUhr(), id;
      for (id in medien) {
        if (!Object.prototype.hasOwnProperty.call(medien, id)) continue;
        var k = medien[id];
        if (k.art === "bild") continue;
        if (k.ldZ === 1) medLadenOhne(k, "abbruch", t);
        medStockenSchliesse(k, t);
      }
    }
    function medObserve() {
      if (!MEDIEN_ON || !w.IntersectionObserver) return;
      if (!medIo) {
        medIo = new w.IntersectionObserver(function (entries) {
          var now = Date.now();
          for (var i = 0; i < entries.length; i++) {
            var en = entries[i], el = en.target, k = el.__qpxMed;
            if (!k) continue;
            var vis = en.isIntersecting && visEnough(en);
            if (k.art === "bild") {
              if (vis && tabSichtbar()) { if (!k.dwellSeit) k.dwellSeit = now; }
              else if (k.dwellSeit) { k.dwell += now - k.dwellSeit; k.dwellSeit = 0; }
              k.vis = vis ? 1 : 0;
              continue;
            }
            if (k.vis !== (vis ? 1 : 0)) { k.vis = vis ? 1 : 0; medEval(el); }
            var erstIo = !el.__qpxIo; el.__qpxIo = 1; el.__qpxSicht = vis ? 1 : 0;
            try { medLadenIo(k, el, en, vis, erstIo); } catch (e) {}
          }
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      }
      var nodes = d.querySelectorAll("video, [data-bild]"), i2;
      for (i2 = 0; i2 < nodes.length; i2++) {
        var n2 = nodes[i2], bekannt = false, j;
        for (j = 0; j < medObserved.length; j++) { if (medObserved[j] === n2) { bekannt = true; break; } }
        if (bekannt) continue;
        medRegistriere(n2, n2.hasAttribute("data-bild") && n2.tagName !== "VIDEO" ? "bild" : "video");
        medObserved.push(n2);
        if (n2.__qpxMed) medIo.observe(n2);
      }
    }
    function medTabWechsel() {
      if (!MEDIEN_ON) return;
      var id;
      for (id in medien) {
        var k = medien[id];
        if (k.art === "bild") {
          var now = Date.now();
          if (!tabSichtbar()) { if (k.dwellSeit) { k.dwell += now - k.dwellSeit; k.dwellSeit = 0; } }
          else if (k.vis && !k.dwellSeit) { k.dwellSeit = now; }
          continue;
        }
        try { medEval(k.el); } catch (e) {}
      }
      try { if (tabSichtbar()) medLadenTab(); } catch (e) {}
    }
    function medScroll(pct) {
      if (!MEDIEN_ON) return;
      if (pct > scrollPct + 0.5) { scrollWende = null; }
      else if (pct < scrollPct - 0.5) {
        if (scrollWende === null) scrollWende = scrollPct;
        if (scrollWende - pct >= MED_UMKEHR_PCT && scrollUmkehrN < MED_UMKEHR_MAX) {
          scrollUmkehrN++;
          scrollUmkehrListe.push({ nr: scrollUmkehrN, von: Math.round(scrollWende),
                                   bis: Math.round(pct), anker: letzterAnker,
                                   t: Date.now() - MED_T0 });
          scrollWende = null;
        }
      }
      scrollPct = pct;
    }
    function medienExtern(e) {
      try {
        if (!MEDIEN_ON || !e || !MED_ARTEN[e.art]) return false;
        var obj = medSanit(e.obj); if (!obj) return false;
        var fam = MED_FAMILIEN[e.fam] ? e.fam : "unbekannt";
        var eintrag = { art: e.art, obj: obj, fam: fam, toff: Date.now() - MED_T0 };
        if (typeof e.wert === "number" && isFinite(e.wert)) eintrag.wert = e.wert;
        if (typeof e.zus === "string") eintrag.zus = e.zus;
        if (e.meta && typeof e.meta === "object") eintrag.meta = e.meta;
        var stand = MED_EXTERN_STAND[e.art] === 1, i;
        for (i = 0; i < medExtern.length; i++) {
          var v = medExtern[i];
          if (v.art !== eintrag.art || v.obj !== eintrag.obj) continue;
          if (stand) { medExtern[i] = eintrag; return true; }
          if (v.wert === eintrag.wert) return true;
        }
        if (medExtern.length >= MED_EXTERN_MAX) { medExternVerworfen++; return false; }
        medExtern.push(eintrag);
        return true;
      } catch (e2) { return false; }
    }
    function medienListe(now) {
      if (!MEDIEN_ON) return [];
      var out = [], neu = [], id, i;
      for (id in medien) {
        if (!Object.prototype.hasOwnProperty.call(medien, id)) continue;
        var k = medien[id], el = k.el;
        if (k.art === "bild") {
          var dw = k.dwell + (k.dwellSeit ? now - k.dwellSeit : 0);
          if (dw >= MED_BILD_MIN_MS)
            out.push({ art: "bild_gesehen", obj: id, wert: Math.round(dw),
                       toff: 0, meta: { obj_q: k.objQ } });
          continue;
        }
        if (k.start)
          out.push({ art: "video_start", obj: id, fam: k.fam, wert: 1, toff: k.startOff,
                     meta: { obj_q: k.objQ, fam_q: k.famQ, dauer_s: Math.round(medDauer(el)),
                             ton_bekannt: k.tonBekannt ? 1 : 0 } });
        if (MED_ZUSATZ) {
          medSichtPruef(k, now, k.spielt);
          if (k.svMarke)
            neu.push({ art: "video_sicht", obj: id, fam: k.fam, wert: 1, toff: k.svT,
                       meta: { lief: k.svLief, auto: medAuto(el), obj_q: k.objQ, fam_q: k.famQ } });
          for (var bwW in k.bw) {
            if (!Object.prototype.hasOwnProperty.call(k.bw, bwW)) continue;
            var bw = k.bw[bwW];
            neu.push({ art: "video_bewusst", obj: id, fam: k.fam, wert: Number(bwW), toff: bw.t,
                       meta: { ct_s: bw.ct, lief: bw.lief, auto: bw.auto, nah: bw.nah,
                               sicht: bw.sicht, obj_q: k.objQ, fam_q: k.famQ } });
          }
        }
        if (k.ldZ === 2 && !k.ldAus) {
          var stkBis = k.stkZu || medUhr(), stkVoll = (k.stkT0 && stkBis >= k.stkT0 + MED_STOCK_FENSTER_MS) ? 1 : 0;
          var ml = { t0: k.ldT0Art || "", stk: stkVoll, obj_q: k.objQ, fam_q: k.famQ };
          if (k.stkT0 && !stkVoll) ml.stk_ms = Math.max(0, Math.round(stkBis - k.stkT0));
          if (k.ldWert != null) { ml.t1 = k.ldT1Art; ml.an = k.ldAn; if (k.ldVorher) ml.vorher = 1; }
          else { ml.g = k.ldGrund; ml.rs = k.ldRs; ml.p = k.ldP; ml.h = k.ldH;
                 if (k.ldOffen != null) ml.offen_ms = k.ldOffen; }
          out.push({ art: "video_laden", obj: id, fam: k.fam, wert: k.ldWert, toff: 0, meta: ml });
        }
        if (k.stkT0 && !k.stkAus) {
          var tSt = medUhr(), msSt = medStockenMs(k, tSt);
          if (msSt > 0)
            out.push({ art: "video_stocken", obj: id, fam: k.fam, wert: msSt, toff: 0,
                       meta: { n: k.stkN, zu: (k.stkZu || tSt >= medStockenEnde(k)) ? 1 : 0,
                               obj_q: k.objQ, fam_q: k.famQ } });
        }
        for (i in k.q) {
          if (!Object.prototype.hasOwnProperty.call(k.q, i)) continue;
          var qq = k.q[i], mq = { zustand_marke: qq.z };
          for (var zk in qq.kn) mq[zk] = qq.kn[zk];
          out.push({ art: "video_quartil", obj: id, fam: k.fam, wert: Number(i),
                     zus: qq.z, toff: qq.t, meta: mq });
        }
        var kn = medKonten(k, el, now), summe = medSumme(kn);
        if (summe > 0 || k.start) {
          var mm = { mrc: k.mrc ? 1 : 0, obj_q: k.objQ, fam_q: k.famQ,
                     ton_bekannt: k.tonBekannt ? 1 : 0 };
          for (var zk2 in kn) mm[zk2] = kn[zk2];
          if (MED_ZUSATZ) {
            var ctJ = medCt(el);
            mm.ct_max_s = medS1(Math.max(k.ctMax, ctJ)); mm.ct_sicht_max_s = medS1(k.ctSichtMax);
            mm.ct_ende_s = medS1(ctJ); mm.dauer_s = Math.round(medDauer(el));
            if (k.pauseN) { mm.ct_pause_s = medS1(k.ctPause); mm.pause_n = k.pauseN; }
            if (k.runden) mm.runden = k.runden;
            if (k.pauseN) mm.pause_bild = k.pauseBild;
            if (k.sprungN) mm.sprung_n = k.sprungN;
            if (k.ctStart) mm.ct_start_s = medS1(k.ctStart);
          }
          out.push({ art: "video_stand", obj: id, fam: k.fam, wert: summe,
                     zus: k.zustand, toff: 0, meta: mm });
        }
        if (k.scrubN)
          out.push({ art: "video_scrub", obj: id, fam: k.fam, wert: k.scrubMax, toff: 0,
                     meta: { umkehr: k.scrubUmkehr, schritte: k.scrubN, obj_q: k.objQ } });
      }
      for (i = 0; i < scrollUmkehrListe.length; i++) {
        var u = scrollUmkehrListe[i];
        out.push({ art: "scroll_umkehr", obj: u.anker || "seite", nr: u.nr,
                   wert: u.bis, toff: u.t, meta: { von_pct: u.von, bis_pct: u.bis } });
      }
      if (ausstiegAn && letzterAnker)
        out.push({ art: "ausstieg", obj: letzterAnker, wert: Math.round(scrollPct),
                   toff: Date.now() - MED_T0, meta: { scroll_pct: Math.round(scrollPct) } });
      for (i = 0; i < medExtern.length; i++) out.push(medExtern[i]);
      if (medExternVerworfen)
        out.push({ art: "video_stand", obj: "naht-deckel", fam: "unbekannt",
                   wert: 0, toff: 0, meta: { extern_verworfen: medExternVerworfen } });
      for (i = 0; i < neu.length; i++) out.push(neu[i]);
      return out.slice(0, MED_EINTRAG_MAX);
    }
    function medSchluessel(liste) {
      var k = [], i;
      for (i = 0; i < liste.length; i++) {
        var e = liste[i], stufe = 0;
        if (e.art === "video_quartil") stufe = e.wert;
        else if (e.art === "video_start") stufe = 1;
        else if (e.art === "video_sicht") stufe = 1;
        else if (e.art === "video_bewusst") stufe = e.wert;
        else if (e.art === "video_scrub") stufe = Math.round((e.wert || 0) / 5);
        else if (e.art === "scroll_umkehr") stufe = e.nr;
        else if (e.art === "ausstieg") stufe = 1;
        else if (e.art === "video_laden") stufe = (e.wert == null ? 1 : 2) + (e.meta && e.meta.stk ? 10 : 0);
        else if (e.art === "video_stocken") stufe = e.meta ? (e.meta.n || 0) * 10 + (e.meta.zu ? 1 : 0) : 0;
        k.push({ a: e.art, o: e.obj, s: stufe, z: e.zus || "" });
      }
      return k;
    }
    function snapshot() {
      var now = Date.now(), list = [];
      for (var id in sections) {
        if (!Object.prototype.hasOwnProperty.call(sections, id)) continue;
        var s = sections[id], dw = Math.round(dwellOf(s, now));
        if (dw >= 1000) s.seen = 1;
        list.push({ id: id, seen: s.seen, dwell_ms: dw, clicks: s.clicks });
      }
      list.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
      var snap = { attention_ms: attentionMs, scroll_max_pct: scrollMax,
               device: device(), sections: list, frust: frust, klicks: klicks,
               medien: medienListe(now) };
      if (FEIN_ON) { snap.scroll_fein_pct = scrollFein; snap.attention_fein_ms = attentionFeinMs; }
      return snap;
    }
    function schluessel(snap) {
      var kern = [];
      for (var i = 0; i < snap.sections.length; i++) {
        var s = snap.sections[i];
        kern.push({ id: s.id, seen: s.seen, clicks: s.clicks });
      }
      var key = { attention_ms: snap.attention_ms, scroll_max_pct: snap.scroll_max_pct,
                              device: snap.device, sections: kern, frust: snap.frust,
                              klicks: (snap.klicks || []).length,
                              medien: medSchluessel(snap.medien || []) };
      if (FEIN_ON) key.scroll_fein_stufe = Math.floor((snap.scroll_fein_pct || 0) / 10) * 10;
      return JSON.stringify(key);
    }
    function flush(force, url) {
      if (!url && lastPath && w.location.pathname !== lastPath) {
        try { routeChanged(); } catch (e) {}
      }
      if (force) ausstiegAn = 1;
      if (force) { try { medLadenSchluss(); } catch (e) {} }
      var snap = snapshot();
      var sig = JSON.stringify(snap);
      var key = schluessel(snap);
      if (force ? (sig === lastVoll) : (key === lastKey)) {
        if (force) hiddenUnterdrueckt++;
        return;
      }
      lastKey = key; lastVoll = sig;
      snap.pv_id = PV_ID; snap.seq = seq++;
      if (hiddenUnterdrueckt) snap.hidden_unterdrueckt = hiddenUnterdrueckt;
      if (url) snap.url = url;
      track("behavior", snap);
    }

    var secIo = null, secObserved = [];
    function anchorId(el) {
      return el.getAttribute("data-section") ||
             el.getAttribute("data-section-type") ||
             (RAHMEN_ON ? rahmenName(el) : "");
    }
    var secRueckfall = 0;
    function visEnough(en) {
      if (en.intersectionRatio >= 0.5) return true;
      try {
        var vh = (en.rootBounds && en.rootBounds.height) || w.innerHeight || 0;
        return vh > 0 && en.intersectionRect &&
               en.intersectionRect.height >= vh * 0.5;
      } catch (e) { return false; }
    }
    function observeSections() {
      if (!w.IntersectionObserver) return;
      var nodes = d.querySelectorAll("[data-section]");
      secRueckfall = nodes.length ? 0 : 1;
      if (!nodes.length && RAHMEN_ON) {
        var frei = rahmenScan(), kand = d.querySelectorAll("[data-section-type], " + RAHMEN_SEL);
        nodes = [];
        for (var k = 0; k < kand.length; k++)
          if (kand[k].hasAttribute("data-section-type") || frei.indexOf(kand[k]) >= 0) nodes.push(kand[k]);
      } else if (!nodes.length) nodes = d.querySelectorAll("[data-section-type]");
      if (!nodes.length) return;
      if (!secIo) {
        var thr = []; for (var t = 0; t <= 20; t++) thr.push(t / 20);
        secIo = new w.IntersectionObserver(function (entries) {
          var now = Date.now();
          for (var i = 0; i < entries.length; i++) {
            var en = entries[i], id = anchorId(en.target);
            if (!id) continue;
            var weg = false;
            try { weg = en.target.isConnected === false; } catch (e) {}
            if (weg) {
              try { secIo.unobserve(en.target); } catch (e) {}
              if (!Object.prototype.hasOwnProperty.call(sections, id)) continue;
            }
            var s = sec(id), vis = en.isIntersecting && visEnough(en);
            s.vis = vis ? 1 : 0;
            if (vis) letzterAnker = id;
            if (vis && tabSichtbar()) { if (!s.visibleSince) s.visibleSince = now; }
            else if (s.visibleSince) { s.dwellAcc += now - s.visibleSince; s.visibleSince = 0; }
          }
        }, { threshold: thr });
      }
      for (var i = 0; i < nodes.length; i++) {
        var bekannt = false;
        for (var j = 0; j < secObserved.length; j++) {
          if (secObserved[j] === nodes[i]) { bekannt = true; break; }
        }
        if (!bekannt) { secIo.observe(nodes[i]); secObserved.push(nodes[i]); }
      }
    }
    observeSections();
    try { medObserve(); } catch (e) {}
    medBootFertig = 1;
    try {
      if (w.MutationObserver) {
        var secScanPending = false;
        new w.MutationObserver(function () {
          if (secScanPending) return;
          secScanPending = true;
          (w.requestAnimationFrame || w.setTimeout)(function () {
            secScanPending = false;
            try { observeSections(); } catch (e) {}
            try { medObserve(); } catch (e) {}
          });
        }).observe(d.documentElement, { childList: true, subtree: true });
      }
    } catch (e) {}

    d.addEventListener("click", function (e) {
      lastActivity = Date.now();
      try { medTipp = { t: medUhr(), el: e.target }; } catch (e6) {}
      try { medTippVideo(e.target); } catch (e7) {}
      try {
        var el = e.target && e.target.closest ? e.target.closest("[data-section]") : null;
        if (el) { var id = el.getAttribute("data-section"); if (id) sec(id).clicks++; }
        else if (RAHMEN_ON && secRueckfall) {
          var rid = rueckfallAbschnitt(e.target);
          if (rid && Object.prototype.hasOwnProperty.call(sections, rid)) sec(rid).clicks++;
        }
      } catch (e2) {}
      try { pushKlick(e.target, e.clientX, e.clientY); } catch (e5) {}
      if (!FRUST_ON) return;
      try {
        var now = Date.now(), tgt = e.target, cx = e.clientX, cy = e.clientY;
        lastClick = { t: now, x: cx, y: cy, el: tgt };
        rageChain = rageChain.filter(function (c) {
          return now - c.t <= RAGE_MS && Math.abs(c.x - cx) <= RAGE_PX && Math.abs(c.y - cy) <= RAGE_PX;
        });
        rageChain.push({ t: now, x: cx, y: cy });
        if (rageChain.length === 1) rageEmitted = false;
        if (rageChain.length >= RAGE_MIN && !rageEmitted) {
          pushFrust("rage_click", tgt, cx, cy, { clicks: rageChain.length, span_ms: now - rageChain[0].t });
          rageEmitted = true;
        }
        var act = tgt && tgt.closest ? tgt.closest("button,input,a,[role=button]") : null;
        if (act && !exempt(act)) {
          var t0 = now, a0 = act, ax = cx, ay = cy;
          w.setTimeout(function () {
            try {
              if (unloading || lastMutation > t0 || lastScrollTs > t0) return;
              pushFrust("dead_click", a0, ax, ay, { waited_ms: DEAD_MS });
            } catch (e3) {}
          }, DEAD_MS);
        }
      } catch (e4) {}
    }, { passive: true, capture: true });

    try {
      if (w.MutationObserver && FRUST_ON) {
        new w.MutationObserver(function () { lastMutation = Date.now(); })
          .observe(d.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
      }
    } catch (e) {}

    w.addEventListener("error", function (ev) {
      try {
        onError(ev && ev.message, ev && ev.filename, "e",
                (ev && ev.error == null) ? 1 : 0,
                (ev && ev.isTrusted === false) ? 0 : 1);
      } catch (e) {}
    }, { passive: true });
    w.addEventListener("unhandledrejection", function (ev) {
      try {
        var r = ev && ev.reason;
        onError(r && (r.message || r), "", "r", null,
                (ev && ev.isTrusted === false) ? 0 : 1);
      } catch (e) {}
    }, { passive: true });

    var scrollPending = false;
    function measureScroll() {
      scrollPending = false;
      try {
        var de = d.documentElement;
        var h = Math.max(1, de.scrollHeight || 1);
        var pct = ((w.pageYOffset || de.scrollTop || 0) + (w.innerHeight || de.clientHeight || 0)) / h * 100;
        var marks = [25, 50, 75, 100];
        for (var i = 0; i < marks.length; i++) { if (pct >= marks[i] && marks[i] > scrollMax) scrollMax = marks[i]; }
        medScroll(Math.max(0, Math.min(100, pct)));
        if (FEIN_ON) {
          var pf = Math.round(Math.max(0, Math.min(100, pct)));
          if (pf > scrollFein) scrollFein = pf;
        }
      } catch (e) {}
    }
    w.addEventListener("scroll", function () {
      lastActivity = lastScrollTs = Date.now();
      if (!scrollPending) { scrollPending = true; (w.requestAnimationFrame || w.setTimeout)(measureScroll); }
    }, { passive: true });
    measureScroll();

    var acts = ["keydown", "mousemove", "touchstart"];
    for (var a = 0; a < acts.length; a++) {
      w.addEventListener(acts[a], function () { lastActivity = Date.now(); }, { passive: true });
    }
    w.setInterval(function () {
      try {
        if (d.visibilityState === "visible" && Date.now() - lastActivity < 30000) attentionMs += 5000;
      } catch (e) {}
    }, 5000);
    if (FEIN_ON) w.setInterval(function () {
      try {
        if (d.visibilityState === "visible" && Date.now() - lastActivity < 30000) attentionFeinMs += 1000;
      } catch (e) {}
    }, 1000);

    w.setInterval(function () { try { flush(false); } catch (e) {} }, 15000);
    d.addEventListener("visibilitychange", function () {
      var now = Date.now();
      if (d.visibilityState === "hidden") {
        dwellAnhalten(now);
        try { medTabWechsel(); } catch (e) {}
        try { flush(true); } catch (e) {}
      } else {
        lastActivity = now;
        dwellFortsetzen(now);
        try { medTabWechsel(); } catch (e) {}
      }
    });
    w.addEventListener("pagehide", function () {
      unloading = true; dwellAnhalten(Date.now());
      try { medTabWechsel(); } catch (e) {}
      try { flush(true); } catch (e) {}
    });
    function medienRouteReset() {
      var now = Date.now(), id, i, keep = [];
      for (id in medien) {
        if (!Object.prototype.hasOwnProperty.call(medien, id)) continue;
        var k = medien[id], tot = false;
        try { tot = !!(k.el && k.el.isConnected === false); } catch (e) {}
        if (tot) {
          try { k.el.__qpxMed = null; } catch (e) {}
          delete medien[id];
          if (k.art === "bild") { if (medBildN > 0) medBildN--; }
          else if (medN > 0) medN--;
          continue;
        }
        k.konten = {}; k.q = {}; k.mrc = 0; k.start = 0; k.startOff = 0;
        k.sichtSeit = k.vis ? now : 0;
        k.dwell = 0; k.dwellSeit = (k.art === "bild" && k.vis && tabSichtbar()) ? now : 0;
        k.scrubMax = 0; k.scrubUmkehr = 0; k.scrubN = 0;
        k.seit = k.spielt ? now : 0; k.letztP = 0;
        k.ldAus = 1; k.stkAus = 1; k.stkSeit = 0;
        k.sv = (k.vis && tabSichtbar()) ? now : 0; k.svMarke = 0; k.svT = 0; k.svLief = 0;
        k.ctMax = 0; k.ctSichtMax = 0; k.ctPause = 0; k.pauseN = 0; k.runden = 0; k.bw = {};
        k.sprungN = 0; k.zEval = 0; k.pauseBild = 0; k.ctStart = k.el ? medCt(k.el) : 0;
      }
      for (i = 0; i < medObserved.length; i++) {
        var n = medObserved[i];
        if (n && n.isConnected !== false) keep.push(n);
      }
      medObserved = keep;
      medExtern = []; medExternVerworfen = 0;
      scrollPct = 0; scrollWende = null; scrollUmkehrN = 0; scrollUmkehrListe = [];
      letzterAnker = ""; ausstiegAn = 0;
      MED_T0 = now;
    }
    var lastPath = w.location.pathname, lastHref = w.location.href;
    function routeChanged() {
      try {
        var p = w.location.pathname, altHref = lastHref;
        lastHref = w.location.href;
        if (p === lastPath) return;
        lastPath = p;
        try { flush(true, altHref); } catch (e) {}
        PV_ID = uuid(); seq = 0; lastKey = ""; lastVoll = ""; hiddenUnterdrueckt = 0;
        scrollMax = 0; attentionMs = 0; lastActivity = Date.now();
        scrollFein = 0; attentionFeinMs = 0; PV_T0 = Date.now();
        if (FEIN_ON) { var pvNeu = PV_ID; try { w.setTimeout(function () { feinNachmessen(pvNeu); }, 1500); } catch (e) {} }
        sections = {}; frust = []; klicks = []; lastClick = null;
        rageChain = []; rageEmitted = false;
        var keep = [];
        for (var i = 0; i < secObserved.length; i++) {
          var n = secObserved[i];
          if (n && n.isConnected !== false) keep.push(n);
        }
        secObserved = keep;
        try { medienRouteReset(); } catch (e) {}
        track("page_view");
        try { observeSections(); } catch (e) {}
        try { medObserve(); } catch (e) {}
      } catch (e) {}
    }
    var histM = ["pushState", "replaceState"];
    for (var hm = 0; hm < histM.length; hm++) {
      (function (m) {
        try {
          var orig = w.history && w.history[m];
          if (typeof orig !== "function") return;
          w.history[m] = function () {
            var r = orig.apply(this, arguments);
            try { routeChanged(); } catch (e) {}
            return r;
          };
        } catch (e) {}
      })(histM[hm]);
    }
    w.addEventListener("popstate", function () { routeChanged(); });

    try { w.qpx.medien = medienExtern; } catch (e) {}
  }

  function initIdentify() {
    if (CFG.identity === false) return;
    function djb2(s) {
      var h = 5381, i;
      for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
      return String(h);
    }
    d.addEventListener("submit", function (e) {
      try {
        var form = e.target;
        if (!form || !form.querySelectorAll) return;
        var inputs = form.querySelectorAll("input[type=email],input[name*=email i]");
        var mail = "", tel = "", i, v;
        for (i = 0; i < inputs.length; i++) {
          v = (inputs[i].value || "").trim();
          if (!v || v.indexOf("@") < 1 || v.length > 254) continue;
          mail = v.toLowerCase();
          break;
        }
        var tels = form.querySelectorAll("input[type=tel],input[name*=phone i]");
        for (i = 0; i < tels.length; i++) {
          v = (tels[i].value || "").trim();
          if (v && v.replace(/[^0-9]/g, "").length >= 6 && v.length <= 32) { tel = v; break; }
        }
        if (!mail && !tel) return;
        var sig = djb2(mail + "|" + tel);
        if (sessionStorageGet("_qpx_idf") === sig) return;
        sessionStorageSet("_qpx_idf", sig);
        identify(mail || null, tel ? { phone: tel } : {});
      } catch (e2) {}
    }, { passive: true, capture: true });
  }

  function boot() {
    if (gpcGilt()) return;
    track("page_view");
    try { initBehavior(); } catch (e) {}
    try { initIdentify(); } catch (e) {}
    try { kundeIdentify(); } catch (e) {}
    try { fp2Starten(); } catch (e) {}
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
