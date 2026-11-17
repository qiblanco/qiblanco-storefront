/* mm-mailcheck.js -- Tippfehler-Pruefung fuer E-Mail-Adressen in allen Mail-Manager-Formularen
 * (Elina EL-20261117-d53e6265: "vor dem Absenden typische Domain-Vertipper erkennen ... auch Domains ohne Mailserver ...
 * dezent fragen 'Meintest du ...@gmail.com?' mit Ein-Klick-Korrektur, Absenden bleibt moeglich; Look wie das Formular,
 * mobil zuerst").
 *
 * EINE Datei fuer alle Formulare: Mail-Manager-Snippet (klassisches Theme, US-Laden, Nachbauten), Hydrogen-Komponente
 * MailManagerFormular und die Anmeldeweiche der Storefront. Kein Fremd-Skript, keine Abhaengigkeit.
 *
 *   vorschlag(adresse)  -> {adresse, domain, grund} oder null   (rein, ohne Netz; auch unter Node pruefbar)
 *   anbinden(form, opt) -> haengt die Pruefung an das E-Mail-Feld des Formulars
 *        opt.sprache   'de' | 'en' (Standard: aus <html lang>)
 *        opt.endpunkt  Basis-URL des Anmelde-Endpunkts fuer die Mailserver-Frage GET /w?d=<domain> (nur die Domain,
 *                      nie die Adresse); ohne endpunkt keine Mailserver-Frage
 *        opt.vorschau  true = Absenden wird abgefangen (Vorschauseite), sonst unveraendert
 *
 * Absenden bleibt moeglich: steht beim Klick ein Hinweis, den die Person noch nicht sehen konnte (eben erst erschienen,
 * z. B. weil der Tipp auf den Knopf das Feld verlaesst), haelt die Pruefung GENAU DIESEN einen Klick an und zeigt den
 * Hinweis. Der naechste Klick sendet, egal ob korrigiert wurde. Ein Hinweis, der schon stand, haelt nichts an.
 */
(function (wurzel) {
  'use strict';

  // ------------------------------------------------------------------ Wissen (gleiche Quelle wie mm_listenpflege.py)
  // Feste Vertipper -> gemeinte Domain (am Bestand gesehen, plus Elinas Beispiele vom 17.11.2026)
  var FEST = {
    'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com',
    'gnail.com': 'gmail.com', 'gamial.com': 'gmail.com', 'gmail.de': 'gmail.com', 'gmail.con': 'gmail.com',
    'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com', 'gmail.comm': 'gmail.com',
    'gmaill.com': 'gmail.com', 'gmeil.com': 'gmail.com', 'gimail.com': 'gmail.com', 'gmali.com': 'gmail.com',
    'googlemail.de': 'googlemail.com', 'googlmail.com': 'googlemail.com', 'gogglemail.com': 'googlemail.com',
    'tonline.de': 't-online.de', 't-onlin.de': 't-online.de', 't-onine.de': 't-online.de', 't-online.com': 't-online.de',
    't-online.dee': 't-online.de', 't.online.de': 't-online.de', 't_online.de': 't-online.de', 't-onlie.de': 't-online.de',
    'telekom.de': 't-online.de',
    'wed.de': 'web.de', 'we.de': 'web.de', 'eeb.de': 'web.de', 'web.dw': 'web.de', 'web.dee': 'web.de', 'web.d': 'web.de',
    'web.ded': 'web.de', 'wbe.de': 'web.de', 'weeb.de': 'web.de', 'web.com': 'web.de',
    'gmx.dee': 'gmx.de', 'gmx.ed': 'gmx.de', 'gmx.d': 'gmx.de', 'gmx.dw': 'gmx.de', 'gmx.ded': 'gmx.de', 'gxm.de': 'gmx.de',
    'gmc.de': 'gmx.de', 'gmy.de': 'gmx.de', 'gmx.ne': 'gmx.net', 'gmx.nett': 'gmx.net',
    'hotmailmail.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com', 'hotamil.com': 'hotmail.com', 'homail.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
    'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'outloo.com': 'outlook.com',
    'otlook.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlock.com': 'outlook.com',
    'icloud.co': 'icloud.com', 'icloud.con': 'icloud.com', 'icoud.com': 'icloud.com', 'iclod.com': 'icloud.com',
    'icluod.com': 'icloud.com', 'icloud.de': 'icloud.com', 'iclould.com': 'icloud.com',
    'yahoo.con': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com',
    'yhoo.com': 'yahoo.com', 'yaoo.com': 'yahoo.com', 'aol.con': 'aol.com', 'aol.co': 'aol.com',
    'freenet.dee': 'freenet.de', 'frenet.de': 'freenet.de', 'online.dee': 'online.de'
  };
  // Grosse Anbieter: Name -> Stammdomain (ein verschriebener NAME ist ein Tippfehler; kurze Namen nur ueber FEST).
  var ANBIETER = {
    'gmail': 'gmail.com', 'googlemail': 'googlemail.com', 't-online': 't-online.de', 'yahoo': 'yahoo.com',
    'hotmail': 'hotmail.com', 'outlook': 'outlook.com', 'icloud': 'icloud.com', 'freenet': 'freenet.de',
    'bluewin': 'bluewin.ch', 'posteo': 'posteo.de', 'protonmail': 'protonmail.com', 'comcast': 'comcast.net',
    'verizon': 'verizon.net', 'sbcglobal': 'sbcglobal.net', 'charter': 'charter.net', 'bellsouth': 'bellsouth.net',
    'arcor': 'arcor.de', 'vodafone': 'vodafone.de', 'ymail': 'ymail.com', 'rocketmail': 'rocketmail.com'
  };
  // Echte Endungen je Anbieter-Name. Steht der Name mit einer anderen Endung da, ist die Endung vertippt.
  var ENDUNGEN = {
    'gmail': ['com'], 'googlemail': ['com'], 'icloud': ['com'], 't-online': ['de'], 'web': ['de'],
    'gmx': ['de', 'net', 'at', 'ch', 'com', 'fr', 'es', 'us', 'co.uk'], 'outlook': ['com', 'de', 'fr', 'es', 'it', 'at', 'com.au', 'co.uk', 'jp', 'be', 'cl', 'dk', 'ie', 'kr', 'pt', 'sa', 'sg', 'com.br', 'com.ar', 'com.tr', 'com.vn', 'co.th', 'co.id', 'co.il', 'cz', 'hu', 'in', 'lv', 'my', 'ph', 'sk'],
    'hotmail': ['com', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at', 'co.uk', 'ca', 'se', 'no', 'dk', 'fi', 'gr', 'com.ar', 'com.br', 'com.mx', 'co.jp', 'co.th', 'com.au', 'com.tr', 'cl', 'cz', 'hu', 'my', 'ph', 'rs', 'sg'],
    'yahoo': ['com', 'de', 'fr', 'it', 'es', 'co.uk', 'ca', 'com.au', 'co.jp', 'com.br', 'com.mx', 'com.ar', 'in', 'co.in', 'gr', 'ie', 'se', 'dk', 'no', 'fi', 'at', 'ch', 'nl', 'be', 'pl', 'ro', 'com.sg', 'com.tw', 'com.hk', 'com.ph', 'co.id', 'co.nz', 'co.za', 'cn'],
    'aol': ['com', 'de', 'fr', 'co.uk', 'it', 'es', 'nl', 'be', 'at', 'ch', 'ca', 'com.au', 'com.br', 'com.mx', 'jp', 'se'],
    'freenet': ['de'], 'posteo': ['de', 'net', 'at', 'ch', 'eu', 'org', 'jp', 'us', 'uk', 'es', 'me', 'be', 'fi', 'ie', 'it', 'lu', 'nl', 'no', 'pt', 'se', 'si'],
    'arcor': ['de'], 'bluewin': ['ch'], 'live': ['com', 'de', 'fr', 'it', 'nl', 'be', 'at', 'ch', 'co.uk', 'ca', 'com.au', 'se', 'dk', 'no', 'fi', 'ie', 'cl', 'com.ar', 'com.mx', 'jp', 'in', 'ru', 'com.pt', 'com.sg', 'hk', 'cn', 'co.za', 'nl']
  };
  // Echte, eigenstaendige Domains, die einem Anbieter nur aehneln (am Bestand durchgesehen, MX nachgesehen).
  var ECHT = {
    'myyahoo.com': 1, 'onmail.com': 1, 'wobline.de': 1, 'charter.com': 1, 'mail.de': 1, 'email.de': 1, 'email.com': 1,
    'my.com': 1, 'life.com': 1, 'online.nl': 1, 'posteo.net': 1, 'protonmail.ch': 1, 'yahoo.de': 1, 'imail.de': 1,
    'o2online.de': 1, 'fmail.com': 1, 'gmx.net': 1, 'gmx.at': 1, 'gmx.ch': 1, 'proton.me': 1, 'me.com': 1, 'mac.com': 1
  };
  // Endungen, die es nicht gibt, aber oft getippt werden.
  var ENDUNG_FEST = {
    'con': 'com', 'cmo': 'com', 'cpm': 'com', 'comm': 'com', 'coom': 'com', 'ocm': 'com', 'vom': 'com', 'xom': 'com',
    'c0m': 'com', 'comn': 'com', 'cim': 'com', 'coml': 'com', 'cok': 'com', 'clm': 'com', 'dee': 'de', 'ded': 'de',
    'dde': 'de', 'dw': 'de', 'ed': 'de', 'ner': 'net', 'nte': 'net', 'nett': 'net', 'orgg': 'org'
  };
  // Domains, fuer die nie nach dem Mailserver gefragt wird (bekannt gut, spart Anfragen).
  var BEKANNT = ['gmail.com', 'googlemail.com', 'web.de', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch', 't-online.de', 'icloud.com',
    'me.com', 'mac.com', 'hotmail.com', 'hotmail.de', 'outlook.com', 'outlook.de', 'live.com', 'live.de', 'yahoo.com',
    'yahoo.de', 'aol.com', 'aol.de', 'freenet.de', 'posteo.de', 'mail.de', 'online.de', 'arcor.de', 'vodafone.de',
    'protonmail.com', 'proton.me', 'bluewin.ch', 'comcast.net', 'verizon.net', 'msn.com', 'ymail.com', 'qiblanco.com',
    'sbcglobal.net', 'att.net', 'icloud.de', 'email.de', 'kabelmail.de', 'magenta.de', 'mailbox.org', 'aim.com'];

  function abstand(a, b, deckel) {   // Damerau-Levenshtein mit Deckel (Vertauschung zaehlt 1: gmial -> gmail)
    deckel = deckel || 3;
    if (Math.abs(a.length - b.length) >= deckel) return deckel;
    var z = [], i, j;
    for (i = 0; i <= a.length; i++) { z[i] = [i]; }
    for (j = 0; j <= b.length; j++) { z[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var k = a[i - 1] === b[j - 1] ? 0 : 1;
        z[i][j] = Math.min(z[i - 1][j] + 1, z[i][j - 1] + 1, z[i - 1][j - 1] + k);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) z[i][j] = Math.min(z[i][j], z[i - 2][j - 2] + 1);
      }
    }
    return Math.min(z[a.length][b.length], deckel);
  }

  function naechste(wert, liste) {   // naechster Eintrag der Liste mit Abstand <= 1 (bei >= 3 Zeichen <= 2), sonst null
    var best = null, bd = 9;
    for (var i = 0; i < liste.length; i++) {
      var d = abstand(wert, liste[i]);
      if (d < bd) { bd = d; best = liste[i]; }
    }
    if (best && (bd <= 1 || (bd <= 2 && best.length >= 3 && wert.length >= 2))) return best;
    if (best && liste[0] && liste[0].indexOf(wert) === 0) return liste[0];   // abgebrochene Endung: gmx.d -> de, icloud.co -> com
    return null;
  }

  function domainVorschlag(dom) {
    if (FEST[dom]) return FEST[dom];
    if (ECHT[dom]) return null;
    var p = dom.indexOf('.');
    if (p < 1) return null;
    var name = dom.slice(0, p), endung = dom.slice(p + 1);
    // 1) unmoegliche Endung (gmx.dee, web.con)
    var neuEndung = ENDUNG_FEST[endung] || null;
    // 2) Anbieter-Name mit fremder Endung (gmail.co, icloud.de, gmx.d)
    if (ENDUNGEN[name]) {
      if (ENDUNGEN[name].indexOf(endung) >= 0) return null;
      var e2 = neuEndung && ENDUNGEN[name].indexOf(neuEndung) >= 0 ? neuEndung : naechste(endung, ENDUNGEN[name]);
      if (!e2 && neuEndung && ENDUNGEN[name].length === 1) e2 = ENDUNGEN[name][0];   // web.con -> web.de
      return e2 ? name + '.' + e2 : null;
    }
    // 3) verschriebener Anbieter-Name (gmial, hotmial, outlok)
    if (name === 'mail' || name === 'email' || name === 'online') return neuEndung ? name + '.' + neuEndung : null;
    var best = null, bd = 9;
    for (var a in ANBIETER) {
      if (!Object.prototype.hasOwnProperty.call(ANBIETER, a)) continue;
      var d = abstand(name, a);
      if (d < bd) { bd = d; best = a; }
    }
    if (best && bd <= (best.length < 7 ? 1 : 2) && bd > 0) {
      var stamm = ANBIETER[best];
      var gesehen = endung && ENDUNGEN[best] && ENDUNGEN[best].indexOf(neuEndung || endung) >= 0;
      return gesehen ? best + '.' + (neuEndung || endung) : stamm;
    }
    return neuEndung ? name + '.' + neuEndung : null;
  }

  function vorschlag(adresse) {
    var a = String(adresse || '').trim();
    var at = a.lastIndexOf('@');
    if (at < 1 || at === a.length - 1) return null;
    var lokal = a.slice(0, at), dom = a.slice(at + 1).toLowerCase().replace(/\.+$/, '').replace(/^\.+/, '');
    if (!/^[a-z0-9._-]+\.[a-z0-9.-]+$/.test(dom)) return null;
    var neu = domainVorschlag(dom);
    if (!neu || neu === dom) return null;
    return {adresse: lokal + '@' + neu, domain: neu, alt: dom, grund: 'tippfehler'};
  }

  // ------------------------------------------------------------------ Texte
  var TEXT = {
    de: {frage: 'Meintest du ', frage_ende: '?', nein: 'Nein, stimmt so', korrigiert: 'Korrigiert.',
         kein_mx: 'Bei dieser Adresse finden wir kein Postfach. Bitte prüf sie noch einmal.',
         vorschau: 'Vorschau: hier wird nichts abgeschickt.', knopf_titel: 'Adresse übernehmen'},
    en: {frage: 'Did you mean ', frage_ende: '?', nein: 'No, it’s correct', korrigiert: 'Corrected.',
         kein_mx: 'We can’t find a mailbox for this address. Please double-check it.',
         vorschau: 'Preview: nothing is sent from here.', knopf_titel: 'Use this address'}
  };

  var STIL = '.mm-mailcheck{margin:6px 0 0;font-size:.875em;line-height:1.4;opacity:.92;text-align:left}' +
    '.mm-mailcheck[hidden]{display:none}' +
    '.mm-mailcheck__vorschlag{all:unset;cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px;' +
    'color:inherit;word-break:break-all;padding:6px 0;margin:-6px 0;display:inline}' +
    '.mm-mailcheck__nein{all:unset;cursor:pointer;margin-left:12px;font-size:.92em;opacity:.75;text-decoration:underline;' +
    'text-underline-offset:2px;color:inherit;padding:6px 0;margin-top:-6px;margin-bottom:-6px;display:inline-block}' +
    '.mm-mailcheck__vorschlag:focus-visible,.mm-mailcheck__nein:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:2px}' +
    '@media (prefers-reduced-motion:no-preference){.mm-mailcheck{animation:mm-mailcheck-ein .18s ease-out}}' +
    '@keyframes mm-mailcheck-ein{from{opacity:0}to{opacity:.92}}';

  function stilEinmal(doc) {
    if (!doc || doc.getElementById('mm-mailcheck-stil')) return;
    var s = doc.createElement('style');
    s.id = 'mm-mailcheck-stil';
    s.textContent = STIL;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function wertSetzen(feld, wert) {   // auch fuer React-gesteuerte Felder (nativer Setter + input-Ereignis)
    var proto = Object.getPrototypeOf(feld);
    var d = proto && Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(feld, wert); else feld.value = wert;
    feld.dispatchEvent(new Event('input', {bubbles: true}));
    feld.dispatchEvent(new Event('change', {bubbles: true}));
  }

  var MX_CACHE = {};
  function mxFrage(endpunkt, dom) {
    if (!endpunkt || BEKANNT.indexOf(dom) >= 0 || typeof fetch !== 'function') return Promise.resolve('ja');
    if (MX_CACHE[dom]) return MX_CACHE[dom];
    var p = fetch(endpunkt.replace(/\/+$/, '') + '/w?d=' + encodeURIComponent(dom), {credentials: 'omit'})
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { return (j && j.mx) || 'unklar'; })
      .catch(function () { return 'unklar'; });
    MX_CACHE[dom] = p;
    return p;
  }

  function anbinden(form, opt) {
    opt = opt || {};
    if (!form || form.__mmMailcheck) return form && form.__mmMailcheck;
    var feld = form.querySelector('input[type="email"], input[name="email"]');
    if (!feld) return null;
    var doc = form.ownerDocument || document;
    var sprache = (opt.sprache || (doc.documentElement.getAttribute('lang') || 'de')).slice(0, 2).toLowerCase();
    var T = TEXT[sprache] || TEXT.de;
    stilEinmal(doc);
    var box = doc.createElement('p');
    box.className = 'mm-mailcheck';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.hidden = true;
    var ziel = feld.closest('label') || feld;
    var anker = ziel.parentNode === form || form.contains(ziel) ? ziel : feld;
    anker.parentNode.insertBefore(box, anker.nextSibling);

    var zustand = {vorschlag: null, abgelehnt: {}, gezeigt_um: 0, stand: '', gehalten: false};

    function leeren() { box.hidden = true; box.textContent = ''; zustand.vorschlag = null; zustand.stand = ''; }

    function zeigeVorschlag(v) {
      box.textContent = '';
      box.appendChild(doc.createTextNode(T.frage));
      var k = doc.createElement('button');
      k.type = 'button';
      k.className = 'mm-mailcheck__vorschlag';
      k.title = T.knopf_titel;
      k.textContent = v.adresse;
      k.addEventListener('click', function () {
        wertSetzen(feld, v.adresse);
        zustand.vorschlag = null;
        box.textContent = T.korrigiert;
        zustand.stand = 'korrigiert';
        setTimeout(function () { if (zustand.stand === 'korrigiert') leeren(); }, 2200);
        try { feld.focus({preventScroll: true}); } catch (e) { /* alt */ }
      });
      box.appendChild(k);
      box.appendChild(doc.createTextNode(T.frage_ende));
      var n = doc.createElement('button');
      n.type = 'button';
      n.className = 'mm-mailcheck__nein';
      n.textContent = T.nein;
      n.addEventListener('click', function () { zustand.abgelehnt[v.alt] = 1; leeren(); });
      box.appendChild(n);
      box.hidden = false;
      zustand.vorschlag = v;
      zustand.stand = 'vorschlag';
      zustand.gezeigt_um = Date.now();
    }

    function zeigeKeinMx(dom) {
      box.textContent = T.kein_mx;
      box.hidden = false;
      zustand.vorschlag = {alt: dom, kein_mx: true};
      zustand.stand = 'kein_mx';
      zustand.gezeigt_um = Date.now();
    }

    function pruefen() {
      var wert = (feld.value || '').trim();
      var at = wert.lastIndexOf('@');
      var dom = at > 0 ? wert.slice(at + 1).toLowerCase().replace(/\.+$/, '') : '';
      if (!dom || !/^[^\s@]+@[^\s@]+\.[^\s@]{1,}$/.test(wert)) { leeren(); return Promise.resolve(null); }
      if (zustand.abgelehnt[dom]) { leeren(); return Promise.resolve(null); }
      var v = vorschlag(wert);
      if (v) {
        if (!(zustand.stand === 'vorschlag' && zustand.vorschlag && zustand.vorschlag.adresse === v.adresse)) zeigeVorschlag(v);
        return Promise.resolve(v);
      }
      if (zustand.stand === 'vorschlag') leeren();
      return mxFrage(opt.endpunkt, dom).then(function (mx) {
        if ((feld.value || '').trim() !== wert) return null;   // inzwischen weitergetippt
        if (mx === 'nein' && !zustand.abgelehnt[dom]) { if (zustand.stand !== 'kein_mx') zeigeKeinMx(dom); return {kein_mx: true}; }
        if (zustand.stand === 'kein_mx') leeren();
        return null;
      });
    }

    var uhr = null;
    feld.addEventListener('input', function () {
      if (zustand.stand === 'korrigiert') return;
      clearTimeout(uhr);
      if (zustand.stand) leeren();
      uhr = setTimeout(pruefen, 900);
    });
    feld.addEventListener('blur', function () { clearTimeout(uhr); pruefen(); });

    // Absenden: Erfassung VOR den Formular-Handlern (Erfassungsphase am Formular). Haelt hoechstens einen Klick an.
    form.addEventListener('submit', function (ev) {
      if (opt.vorschau) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
      var jung = zustand.stand && zustand.stand !== 'korrigiert' && Date.now() - zustand.gezeigt_um < 1200;
      var v = vorschlag(feld.value || '');
      var neu = v && !zustand.abgelehnt[v.alt] && !(zustand.stand === 'vorschlag' && !jung);
      if (!zustand.gehalten && (jung || neu)) {
        if (neu) zeigeVorschlag(v);
        zustand.gehalten = true;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        try { box.scrollIntoView({block: 'nearest'}); } catch (e) { /* alt */ }
        return;
      }
      if (opt.vorschau) {
        var m = form.querySelector('.mm-formular__meldung, [role="status"]:not(.mm-mailcheck)');
        if (m) m.textContent = T.vorschau; else box.textContent = T.vorschau, box.hidden = false;
      }
    }, true);

    var api = {pruefen: pruefen, zustand: zustand, box: box};
    form.__mmMailcheck = api;
    return api;
  }

  function alleAnbinden(opt, wurzelEl) {
    var r = wurzelEl || document;
    var fs = r.querySelectorAll('form');
    for (var i = 0; i < fs.length; i++) {
      if (fs[i].querySelector('input[type="email"], input[name="email"]')) anbinden(fs[i], opt);
    }
  }

  var MM = {vorschlag: vorschlag, anbinden: anbinden, alleAnbinden: alleAnbinden, _abstand: abstand, _domain: domainVorschlag};
  if (typeof module === 'object' && module.exports) module.exports = MM;
  if (wurzel) wurzel.qbMailcheck = MM;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
