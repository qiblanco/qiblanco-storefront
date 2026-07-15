/**
 * qb-verhalten.js — Sicherheitsmeister Verhaltens-Token (T2, uniform).
 *
 * Wird an ALLE Besucher identisch ausgeliefert (Anti-Cloaking-Leitplanke:
 * gleiche Pruefung fuer jeden, kein Identitaets-Judgment). Prueft zwei
 * OBJEKTIVE Automations-Artefakte (navigator.webdriver, CDP-Stack-
 * Serialisierung) und misst grob gebucketed die Zeit bis zur ersten
 * Interaktion — KEIN Mouse-Tracking, KEIN Profil, KEINE persistente ID
 * (Datensparsamkeit: ein Boolean + ein Timing-Bucket, Cookie lebt 24 h).
 *
 * Das Cookie qb_vt ist ein technisch notwendiges Sicherheits-Signal
 * (Art. 6 Abs. 1 lit. f DSGVO, ErwGr 49 — Netz-/Informationssicherheit).
 * Ausgeliefert wird das Script NUR bei SM_VERHALTEN=on (root.jsx).
 */
(function () {
  'use strict';
  try {
    if (document.cookie.indexOf('qb_vt=') !== -1) return;

    var artefakt = 0;
    try {
      if (navigator.webdriver === true) artefakt = 1;
      // CDP-Artefakt (Headless-Detection 2026): ist ein DevTools-Protokoll
      // aktiv, serialisiert die Konsole das Error-Objekt inkl. stack —
      // der Getter feuert. Fuer normale Browser bleibt er stumm.
      var e = new Error();
      Object.defineProperty(e, 'stack', {
        get() {
          artefakt = 1;
          return '';
        },
      });
      // eslint-disable-next-line no-console -- der debug-Call IST der Detektor
      console.debug(e);
    } catch {
      /* Artefakt-Pruefung darf nie stoeren */
    }

    var start = Date.now();
    var gesetzt = false;
    var setzen = function (bucket) {
      if (gesetzt) return;
      gesetzt = true;
      try {
        document.cookie =
          'qb_vt=v1.' +
          artefakt +
          '.' +
          bucket +
          '; Max-Age=86400; Path=/; SameSite=Lax; Secure';
      } catch {
        /* noop */
      }
      ereignisse.forEach(function (ev) {
        removeEventListener(ev, beiInteraktion, true);
      });
    };
    var beiInteraktion = function () {
      var dt = Date.now() - start;
      setzen(dt < 1000 ? 't0' : dt < 5000 ? 't1' : 't2');
    };
    var ereignisse = ['pointermove', 'scroll', 'keydown', 'touchstart'];
    ereignisse.forEach(function (ev) {
      addEventListener(ev, beiInteraktion, true);
    });
    // Ohne jede Interaktion nach 8 s: Bucket 'none' (objektives Signal).
    setTimeout(function () {
      setzen('none');
    }, 8000);
  } catch {
    /* never-break: das Snippet darf die Seite nie stoeren */
  }
})();
