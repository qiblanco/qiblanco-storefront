(function () {
  function hideBanner() {
    var el = document.getElementById('cookiebanner');
    if (el) el.style.display = 'none';
    var edit = document.getElementById('edit-cookie-consent');
    if (edit) edit.style.display = 'none';
    document.body.style.overflow = '';
  }
  window.hideCookieBanner = hideBanner;
  window.changeConsentToAll = function () {
    if (window.Cookiebot && typeof window.Cookiebot.submitCustomConsent === 'function') {
      window.Cookiebot.submitCustomConsent(true, true, true);
    }
    hideBanner();
  };
  window.cookieBannerToggle = function () {
    var main = document.getElementById('cookie-consent-banner');
    var edit = document.getElementById('edit-cookie-consent');
    if (!main || !edit) return;
    var showingEdit = edit.style.display === 'block';
    edit.style.display = showingEdit ? 'none' : 'block';
    main.style.display = showingEdit ? 'block' : 'none';
  };

  // --- Tote Bedienelemente im Consent-Banner beleben ----------------------
  //
  // WOZU. Der Erklärabsatz der Cookiebot-Vorlage nennt die Knopfnamen und
  // wickelt sie in NACKTE Anker:
  //   "Du kannst alle Cookies akzeptieren, indem du auf <a>Akzeptieren</a>
  //    klickst, oder sie einzeln verwalten, indem du auf
  //    <a>Cookies verwalten</a> klickst, ..."
  // Diese <a> tragen weder href noch onclick noch einen Klick-Handler. Das
  // Cookiebot-Stylesheet gibt ihnen unter :hover cursor:pointer und eine
  // Unterstreichung - sie SEHEN also aus wie Bedienelemente und tun nichts.
  //
  // GEMESSEN am 2026-08-22 an https://www.qiblanco.com/ (Chromium 151, echte
  // Browserkennung, 1440x900 UND 390x844, je frischer Kontext ohne Consent):
  //   Klick auf <a>Akzeptieren</a> -> Banner bleibt stehen, KEIN
  //     CookieConsent-Cookie, 0 von 7 Kaufbuttons per elementFromPoint frei.
  //   Klick auf den echten Knopf   -> Banner weg nach 0,0 s, Cookie gesetzt,
  //     7 von 7 frei, nach Reload kein Banner mehr im DOM.
  // Beide tragen dieselbe Beschriftung. Wer das falsche trifft, kommt nicht
  // zum Kauf und erfährt auch nicht, warum - er klickt, nichts passiert.
  //
  // WARUM HIER UND NICHT AN DER WURZEL. Die erzeugende Stelle ist die
  // Cookiebot-Custom-Vorlage: weder 'cookie-content-wrapper' noch der Satz
  // oben kommen irgendwo in diesem Repo vor (gerendert wird das Markup erst
  // von consent.cookiebot.com/uc.js). Die Vorlage liegt im Cookiebot-Konto und
  // ist damit Perimeter. Dieses Skript läuft auf jeder Seite und ist die
  // nächstgelegene Stelle, die WIR besitzen.
  //
  // WARUM STELLVERTRETUNG STATT EIGENER CONSENT-LOGIK. Der belebte Anker
  // KLICKT DEN ECHTEN KNOPF. Er baut keine zweite Zustimmungs-Mechanik: was
  // immer der echte Knopf tut - heute Cookiebots eigene Bindung an die ID plus
  // hideCookieBanner() - tut der Anker dann auch, und zwar auch nach einer
  // Änderung der Vorlage. Ein Nachbau der Consent-Logik wäre von einem
  // korrekten nicht zu unterscheiden, sobald er fail-open driftet.
  //
  // WARUM NICHT PER CSS VERSTECKEN. Ein verstecktes Element bleibt per Tastatur
  // erreichbar; es wäre dann nur unsichtbar kaputt und träfe genau die
  // Nutzer, die ohnehin Mühe haben. Die Zuordnung Wort -> Knopf ist zudem
  // nicht erfunden: sie steht wörtlich im Satz des Banners.
  var AKZEPT_ZIELE = [
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '#CybotCookiebotDialogBodyButtonAccept',
  ];
  var VERWALT_ZIELE = ['#cookie-banner-button-edit'];
  var RX_AKZEPT = /^(alle[sn]?\s+)?(akzeptieren|erlauben|zustimmen|accept|allow)$/i;
  var RX_VERWALT = /^(cookies?\s+verwalten|einstellungen|manage\s+cookies?)$/i;

  // Nur der EIGENE Text: sonst erbt jeder Container den Text seiner Kinder,
  // und der Banner selbst gälte als "Akzeptieren"-Element.
  function eigenText(el) {
    var t = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) t += el.childNodes[i].textContent;
    }
    return t.trim();
  }

  function ersterVorhandener(selektoren) {
    for (var i = 0; i < selektoren.length; i++) {
      var el = document.querySelector(selektoren[i]);
      if (el) return el;
    }
    return null;
  }

  // Die echten Knöpfe der Vorlage sind <a> OHNE href - baulich nicht
  // fokussierbar. Gemessen am 2026-08-22: 250 Tab-Schritte, im Banner nur
  // Impressum und Datenschutz erreichbar (die einzigen mit href), KEIN
  // Zustimmen- und KEIN Ablehnen-Knopf. Ein Tastatur-Kunde kommt damit zu gar
  // keiner Consent-Entscheidung. role/tabindex/Enter/Space ändern nichts am
  // Aussehen - das Design bleibt wie es ist.
  function tastaturFaehig(el, tun) {
    if (!el.getAttribute('role')) el.setAttribute('role', 'button');
    if (el.getAttribute('tabindex') === null) el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      tun();
    });
  }

  function belebeAnker(a, art) {
    function tun() {
      // DER ANKER KLICKT DEN ECHTEN KNOPF. Nicht, weil das eleganter wäre,
      // sondern weil es der einzige Weg ist, der im ECHTEN Klick-Kontext
      // gemessen funktioniert. Die Fassung dazwischen (e51898b) rief statt
      // dessen changeConsentToAll() - das war in zwei Stufen falsch:
      //
      //   Der ANLASS war ein Messfehler. Meine Probe wartete nach dem Klick
      //   fest 800 ms; das Schließen des Banners ist synchron, das Schreiben
      //   des Consent-Cookies asynchron (~0,3 s). Auf Mobil fiel die Messung
      //   in dieses Fenster und meldete "Banner zu, kein Cookie".
      //
      //   Die ERSATZLÖSUNG war ihrerseits kaputt, nur unauffälliger. Gemessen
      //   am 2026-08-22 mit Spionen am Live-Shop: aus dem Klick-Handler heraus
      //   läuft changeConsentToAll(), läuft hideCookieBanner() - und der Cookie
      //   kommt NIE (12 s gewartet). Derselbe Aufruf ausserhalb eines
      //   Klick-Handlers setzt ihn in 0,3 s. Der Banner ging also zu, ohne dass
      //   eine Einwilligung gespeichert wurde - schlimmer als der
      //   Ausgangsdefekt, weil es erledigt aussieht.
      //
      // Im echten Klick-Kontext gegeneinander gemessen, beide grün über den
      // Reload hinweg: Anker -> echter Knopf .click() (Cookie nach 0,34 s,
      // Banner zu) und Anker -> submitCustomConsent direkt (0,26 s, Banner
      // bleibt offen). Gewählt ist der erste: er schließt den Banner mit und
      // tut per Definition dasselbe wie der Knopf daneben.
      var ziele = art === 'akzeptieren' ? AKZEPT_ZIELE : VERWALT_ZIELE;
      var ziel = ersterVorhandener(ziele);
      // ziel !== a schließt aus, dass ein Anker sich selbst anklickt.
      if (ziel && ziel !== a) {
        ziel.click();
        return;
      }
      // Letzter Rückfall, falls die Vorlage die Knopf-IDs umbenennt: nie
      // schweigen. Ein Klick, der nichts tut, ist genau der Defekt, der hier
      // behoben wird.
      // ACHTUNG bei changeConsentToAll: aus einem Klick-Handler heraus setzt es
      // GEMESSEN keinen Cookie (siehe oben). Es steht hier trotzdem, weil
      // "der Knopf ist weg" ein anderer Zustand ist als der heutige - dann ist
      // ein halber Versuch besser als gar keiner, und die Wache
      // bin/probe_consent_bedienbarkeit.py schlägt in diesem Fall an.
      if (art === 'akzeptieren') {
        if (typeof window.changeConsentToAll === 'function') {
          window.changeConsentToAll();
        }
      } else if (typeof window.cookieBannerToggle === 'function') {
        window.cookieBannerToggle();
      }
    }
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      tun();
    });
    tastaturFaehig(a, tun);
  }

  function belebeBanner() {
    var wurzel = document.getElementById('cookiebanner');
    if (!wurzel) return;
    var anker = wurzel.getElementsByTagName('a');
    for (var i = 0; i < anker.length; i++) {
      var el = anker[i];
      if (el.getAttribute('data-qb-consent') === 'belebt') continue;
      var klasse = ' ' + (el.className || '') + ' ';
      if (klasse.indexOf(' cookie-banner-button ') !== -1) {
        // Echter Knopf: NUR die Tastatur nachrüsten. Das Klickverhalten
        // bleibt unberührt - hier wird nichts umgebaut, was funktioniert.
        el.setAttribute('data-qb-consent', 'belebt');
        (function (k) {
          tastaturFaehig(k, function () { k.click(); });
        })(el);
        continue;
      }
      // Impressum/Datenschutz tragen ein href und sind in Ordnung.
      if (el.getAttribute('href') || el.getAttribute('onclick')) continue;
      var txt = eigenText(el);
      var art = RX_AKZEPT.test(txt) ? 'akzeptieren'
        : RX_VERWALT.test(txt) ? 'verwalten' : null;
      if (!art) continue;
      el.setAttribute('data-qb-consent', 'belebt');
      belebeAnker(el, art);
    }
  }

  function beobachteBanner() {
    belebeBanner();
    if (typeof MutationObserver !== 'function') return;
    // Cookiebot hängt den Banner erst nach ~2 s ein, und
    // cookieBannerToggle() tauscht später die zweite Tafel dazu. Der
    // Beobachter bleibt deshalb stehen; belebeBanner() steigt bei fehlendem
    // #cookiebanner sofort wieder aus, und die Arbeit wird je Tick gebündelt
    // statt je Mutation ausgeführt.
    var geplant = false;
    var mo = new MutationObserver(function () {
      if (geplant) return;
      geplant = true;
      setTimeout(function () {
        geplant = false;
        belebeBanner();
      }, 0);
    });
    mo.observe(document.documentElement, {childList: true, subtree: true});

    // ZUSÄTZLICH EIN KURZER TAKT ÜBER DIE ERSTEN 15 SEKUNDEN.
    // Gemessen am 2026-08-22 auf Mobil: der Banner stand bereits im DOM, der
    // Anker "Akzeptieren" trug aber noch handler=0 und kein tabindex - es gibt
    // also ein Fenster, in dem der Banner sichtbar und noch nicht belebt ist.
    // Der Beobachter allein schließt es nicht zuverlässig, weil Cookiebot den
    // Banner auch ersetzen kann (ein frischer Knoten trägt die Markierung
    // nicht). In diesem Fenster sähe der Kunde genau den Defekt, der hier
    // behoben wird. belebeBanner() ist idempotent und steigt ohne #cookiebanner
    // sofort aus, der Takt kostet also praktisch nichts - und er endet.
    var takte = 0;
    var iv = setInterval(function () {
      belebeBanner();
      if (++takte > 60) clearInterval(iv);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', beobachteBanner);
  } else {
    beobachteBanner();
  }

  function syncShopifyConsent() {
    var cb = window.Cookiebot;
    if (!cb || !cb.consent) return false;
    var sp = window.Shopify && window.Shopify.customerPrivacy;
    if (!sp || typeof sp.setTrackingConsent !== 'function') return false;
    sp.setTrackingConsent(
      {
        analytics: !!cb.consent.statistics,
        marketing: !!cb.consent.marketing,
        preferences: !!cb.consent.preferences,
        sale_of_data: !!cb.consent.marketing,
      },
      function () {},
    );
    return true;
  }
  function trySync() {
    if (syncShopifyConsent()) return;
    var attempts = 0;
    var iv = setInterval(function () {
      attempts++;
      if (syncShopifyConsent() || attempts > 40) clearInterval(iv);
    }, 250);
  }
  window.addEventListener('CookiebotOnAccept', trySync);
  window.addEventListener('CookiebotOnDecline', trySync);
  window.addEventListener('CookiebotOnConsentReady', trySync);
})();
