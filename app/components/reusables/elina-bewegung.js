/* elina-bewegung.js: Scroll-Effekte nach Elinas Design-Dauerregel (EL-20261108-5bf00bf2).
 *
 * Kopie aus elina-design-regel/baukasten (shared-state), angepasst nur für ESLint und das
 * Umlaut-Tor des Deploys (echte Umlaute, Bezeichner ohne ae/oe/ue)
 * (catch ohne Bindung, Kurzschreibweise im api-Objekt).
 *
 * Gehört zu elina-bewegung.css. Nachgebaut aus dem Hausrezept (homepage-bauer
 * SKILL-SCROLL-ANIMATIONEN 1b, Qi-Alpha-Landingpages useTapFilm / tacScrollFilm):
 *  - versteckt wird nur unter html.eb-an, und die Klasse kommt erst, wenn dieses Skript läuft
 *    (Server-HTML, Bots und Browser ohne JavaScript sehen alles);
 *  - Einblenden einmalig per IntersectionObserver (threshold 0.15, rootMargin -8 % unten), danach unobserve;
 *  - der erste Bildschirm ist sofort da (Hero, Preis, Kaufknopf: kein LCP-Schaden);
 *  - Zoom und Linien: ein passiver Scroll-Zuhörer, je Bild höchstens eine Rechnung in requestAnimationFrame,
 *    erst alles lesen, dann nur die CSS-Variable --eb-p schreiben; nur sichtbare Elemente werden gerechnet
 *    (bewusst ohne CSS animation-timeline: in Safari erst ab 26 und im WebKit-Prüfstand nicht verlässlich);
 *  - "Bewegung reduzieren": html.eb-an wird nicht gesetzt, alles steht still und ist sofort da;
 *  - nie preventDefault, nie scrollTo, kein Einrasten.
 *
 * Einbinden:
 *   Liquid/HTML:  <script src="elina-bewegung.js" defer></script>   (startet von selbst für document)
 *   Hydrogen:     useElinaBewegung.jsx daneben legen, im Abschnitt useElinaBewegung(wurzelRef) aufrufen
 *                 (starte() gibt die Aufräum-Funktion zurück, der Hook ruft sie beim Verlassen)
 */
(function (global) {
  'use strict';

  var VERSATZ_MAX = 4; // Hausrezept: Stagger bei 4 deckeln
  var EIN = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' };

  function klemme(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function ruhig() {
    try { return global.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  }

  /* Fortschritt 0..1 je Art. zoom: von "Oberkante erreicht den unteren Rand" bis "Element verlässt oben".
   * linie: füllt sich, während sie von 90 % auf 45 % der Bildschirmhöhe wandert (sie ist voll, solange man
   * sie liest). Reine Funktion, damit der Selbsttest sie ohne Browser prüfen kann. */
  function fortschritt(art, oben, hoch, bild) {
    if (art === 'zoom') return klemme((bild - oben) / (bild + hoch));
    if (art === 'linie-senkrecht') return klemme((bild * 0.9 - oben) / (hoch + bild * 0.45));
    return klemme((bild * 0.9 - oben) / (bild * 0.45));
  }

  function starte(wurzel) {
    wurzel = wurzel || global.document;
    var html = global.document.documentElement;
    // Träger der Klasse eb-an: bei document das html-Element, sonst die Wurzel selbst. stop() nimmt
    // sie wieder ab, damit nach einem Seitenwechsel (Hydrogen) nichts versteckt hängen bleibt.
    var halter = wurzel.nodeType === 9 ? html : wurzel;
    if (!('IntersectionObserver' in global) || ruhig()) return function () {};

    var alle = wurzel.querySelectorAll('[data-eb]');
    if (!alle.length) return function () {};
    var bild = global.innerHeight || html.clientHeight;
    var einblenden = [], laufend = [];
    var i, el, art;
    for (i = 0; i < alle.length; i++) {
      el = alle[i];
      art = el.getAttribute('data-eb') || '';
      if (art === 'zoom' || art === 'linie' || art === 'linie-senkrecht') laufend.push(el);
      else einblenden.push(el);
      if (art === 'gruppe') {
        for (var k = 0; k < el.children.length; k++) {
          el.children[k].style.setProperty('--eb-i', String(Math.min(k, VERSATZ_MAX)));
        }
      }
    }

    // Erster Bildschirm: sofort sichtbar, ohne Übergang (vor dem Setzen von eb-an, also kein Aufblitzen).
    for (i = 0; i < einblenden.length; i++) {
      el = einblenden[i];
      if (el.getBoundingClientRect().top < bild * 0.92) el.classList.add('eb-da', 'eb-sofort');
    }
    halter.classList.add('eb-an');
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        var s = wurzel.querySelectorAll('.eb-sofort');
        for (var j = 0; j < s.length; j++) s[j].classList.remove('eb-sofort');
      });
    });

    var io = new IntersectionObserver(function (befunde) {
      for (var j = 0; j < befunde.length; j++) {
        if (befunde[j].isIntersecting) {
          befunde[j].target.classList.add('eb-da');
          io.unobserve(befunde[j].target);
        }
      }
    }, EIN);
    for (i = 0; i < einblenden.length; i++) {
      if (!einblenden[i].classList.contains('eb-da')) io.observe(einblenden[i]);
    }

    var abbau = [function () {
      io.disconnect();
      halter.classList.remove('eb-an');
    }];

    if (laufend.length) {
      var sichtbar = new Set();
      var wartet = false;
      var sicht = new IntersectionObserver(function (befunde) {
        for (var j = 0; j < befunde.length; j++) {
          if (befunde[j].isIntersecting) sichtbar.add(befunde[j].target);
          else sichtbar.delete(befunde[j].target);
        }
        anfordern();
      }, { rootMargin: '10% 0px 10% 0px' });
      var rechne = function () {
        wartet = false;
        var h = global.innerHeight || html.clientHeight;
        var werte = [];
        sichtbar.forEach(function (e) { // erst lesen ...
          var r = e.getBoundingClientRect();
          werte.push([e, fortschritt(e.getAttribute('data-eb'), r.top, r.height, h)]);
        });
        for (var j = 0; j < werte.length; j++) { // ... dann schreiben
          werte[j][0].style.setProperty('--eb-p', werte[j][1].toFixed(4));
        }
      };
      var anfordern = function () {
        if (!wartet) { wartet = true; global.requestAnimationFrame(rechne); }
      };
      for (i = 0; i < laufend.length; i++) sicht.observe(laufend[i]);
      global.addEventListener('scroll', anfordern, { passive: true });
      global.addEventListener('resize', anfordern, { passive: true });
      abbau.push(function () {
        sicht.disconnect();
        global.removeEventListener('scroll', anfordern);
        global.removeEventListener('resize', anfordern);
      });
    }

    return function stop() {
      for (var j = 0; j < abbau.length; j++) abbau[j]();
    };
  }

  var api = { starte, fortschritt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.ElinaBewegung = api;

  // Klassisch eingebunden (<script src>, Liquid/HTML): von selbst starten; im Shopify-Editor neu geladene Sections
  // mitnehmen. Als Modul importiert (Hydrogen) gibt es kein currentScript: dann startet useElinaBewegung.
  if (global.document && global.document.currentScript && !global.ELINA_BEWEGUNG_KEIN_AUTOSTART) {
    var los = function () { starte(global.document); };
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', los);
    else los();
    global.document.addEventListener('shopify:section:load', function (e) { starte(e.target); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
