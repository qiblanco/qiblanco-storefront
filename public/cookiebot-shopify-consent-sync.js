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

  // --- CSP: inline onclick feuert auf dieser Seite NIE --------------------
  //
  // DER BEFUND. Diese Seite liefert eine Content-Security-Policy mit
  // script-src-attr aus. Damit führt der Browser KEINEN inline
  // Event-Handler mehr aus - jedes onclick="..." im Cookiebot-Markup ist tot.
  //
  // GEMESSEN am 2026-08-22 an https://www.qiblanco.com/ (Chromium 151, echter
  // Mausklick auf die gemessene Elementmitte, frischer Kontext ohne Consent):
  //   - Ein FRISCH eingehängtes Testelement mit onclick="..." feuerte
  //     ebenfalls nicht (in beiden Läufen) -> es liegt nicht am Bedienelement,
  //     sondern an der Policy. Dazu je 3 securitypolicyviolation-Ereignisse
  //     mit violatedDirective "script-src-attr".
  //   - Klick auf #cookie-banner-button-edit: capture- UND bubble-Listener
  //     feuern, elementFromPoint trifft das Ziel, das Element ist unveraendert
  //     - aber cookieBannerToggle() wird NIE gerufen. Der
  //     Einstellungs-Bereich #edit-cookie-consent bleibt display:none.
  //   - window.cookieBannerToggle() direkt gerufen öffnet ihn sofort
  //     (600x810). Die Funktion ist also in Ordnung, ihr AUFRUF fehlt.
  //
  // WAS DAS FÜR DEN KUNDEN BEDEUTET. "Cookies verwalten" tut nichts. Der
  // gesamte Einstellungs-Bereich - Auswahl je Kategorie, "Speichern",
  // "Alle ablehnen", "Alle erlauben" - war für JEDEN Kunden unerreichbar.
  // Der Vorgängerjob hat das als "Knöpfe haben width=0" gesehen; das war die
  // FOLGE (ein Kind von display:none hat kein Rect), nicht die Ursache.
  //
  // WARUM DIE HAUPT-KNÖPFE TROTZDEM WIRKEN. Sie tragen Cookiebots eigene IDs
  // (#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll & Co.); Cookiebot
  // bindet die selbst und setzt den Consent über seinen eigenen Weg. Gemessen:
  // Klick -> CookiebotOnAccept, Cookie nach 0,22 s, überlebt den Reload -
  // und zwar OHNE dass unser hideCookieBanner() über das inline onclick lief.
  // #cookie-banner-button-edit ist die einzige EIGENE ID im Banner und deshalb
  // der einzige Knopf, den niemand bindet.
  //
  // WARUM NICHT DIE CSP LOCKERN. script-src-attr wieder zu erlauben, macht
  // jedes inline onclick der Seite wieder ausfuehrbar - das ist eine
  // Abschwächung der Sicherheitslage für ein Bedienproblem. Die Bindung
  // gehört in diese Datei, die wir ohnehin ausliefern.
  function cspKnopfNachruesten() {
    // (1) "Cookies verwalten" - der Aufruf, den die CSP verschluckt.
    var edit = document.getElementById('cookie-banner-button-edit');
    if (edit && edit.getAttribute('data-qb-csp') !== 'gebunden') {
      edit.setAttribute('data-qb-csp', 'gebunden');
      // Das tote Attribut entfernen: sollte die CSP je gelockert werden,
      // liefe sonst BEIDES (inline + diese Bindung) und der Bereich klappte
      // sofort wieder zu. Die ID ist unsere eigene, Cookiebot liest sie nicht.
      edit.removeAttribute('onclick');
      edit.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (typeof window.cookieBannerToggle === 'function') {
          window.cookieBannerToggle();
        }
      });
      // Die Tastatur-Nachrüstung oben ruft k.click(); das trifft ab jetzt
      // diese Bindung. Vorher lief sie ebenfalls ins Leere.
    }

    // (2) "Alle erlauben" IM Einstellungs-Bereich erlaubte nicht alles.
    //
    // GEMESSEN (Bereich zum Messen kuenstlich geöffnet, dann echter
    // Mausklick): der Knopf setzt zwar einen dauerhaften Consent, aber mit
    // statistics:false und marketing:false - also exakt dasselbe wie
    // "Speichern" mit den Vorgabewerten. changeConsentToAll() lief dabei nicht
    // (CSP, siehe oben); gehandelt hat Cookiebots eigene ID-Bindung, und die
    // behandelt #CybotCookiebotDialogBodyButtonAccept wie "Auswahl speichern".
    // Ein Knopf mit der Aufschrift "Alle erlauben", der Statistik und Werbung
    // ablehnt, ist eine falsche Einwilligungs-Auskunft - in beide Richtungen.
    //
    // WARUM DIE RADIOS UND NICHT submitCustomConsent. Direkt gegeneinander
    // gemessen, je mit Gegenprobe ohne Fix (die statistics:false ergab):
    //   setTimeout(0) + submitCustomConsent(true,true,true) -> BLIEB
    //     statistics:false. Cookiebots eigene Bindung gewinnt das Rennen; ein
    //     zweiter Consent-Weg daneben ist nicht durchsetzbar.
    //   Radios auf "Ja" + Cookiebots eigenem Weg das Speichern überlassen
    //     -> statistics:true, marketing:true, überlebt den Reload.
    // Der zweite Weg baut keine zweite Consent-Mechanik, sondern benutzt die
    // vorhandene - und er hält die ANZEIGE ehrlich: wer den Bereich danach
    // wieder öffnet, sieht überall "Ja" stehen und nicht "Nein".
    // capture:true, damit die Auswahl steht, BEVOR Cookiebot sie liest.
    var alle = document.getElementById('CybotCookiebotDialogBodyButtonAccept');
    if (alle && alle.getAttribute('data-qb-csp') !== 'gebunden') {
      alle.setAttribute('data-qb-csp', 'gebunden');
      alle.addEventListener('click', function () {
        var ids = ['CybotCookiebotDialogBodyLevelButtonNecessary',
                   'CybotCookiebotDialogBodyLevelButtonStatistics',
                   'CybotCookiebotDialogBodyLevelButtonMarketing'];
        for (var i = 0; i < ids.length; i++) {
          var r = document.getElementById(ids[i]);
          if (r && !r.checked) {
            r.checked = true;
            r.dispatchEvent(new Event('change', {bubbles: true}));
          }
        }
      }, true);
    }
  }

  function belebeBanner() {
    var wurzel = document.getElementById('cookiebanner');
    if (!wurzel) return;
    cspKnopfNachruesten();
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

  // ---- Hydration-Wettlauf: Banner erscheint nicht zuverlaessig ------------
  // BEFUND (gemessen 2026-08-23 am Live-Shop, Job 20260823-verkauft-der-laden):
  // Hydrogen hydratisiert das GANZE Dokument. Cookiebot fuegt #cookiebanner
  // asynchron in <body> ein (~1,2 s). Landet er VOR dem Hydration-Commit,
  // löscht ihn Reacts Reconciler ~150 ms später wieder -- belegt über
  // removeChild aus dem Oxygen-Client-Bundle (index-*.js, Funktion `qf`,
  // Kette lc/Qn/ea). Späte Einfügungen überleben, frühe nicht; daher der
  // Zufall. FOLGE: in rund einem Viertel der frischen Sitzungen bekommt der
  // Kunde GAR KEINE Einwilligungs-Wahl vorgelegt, und es wird nichts
  // gespeichert (hasResponse bleibt false).
  //
  // HEILUNG, bewusst additiv und ohne Inhalt/Design anzufassen: NACH der
  // Hydration nachsehen, ob eine Antwort aussteht und trotzdem kein Banner
  // steht. Nur dann Cookiebot den Dialog neu aufbauen lassen. Wer bereits
  // geantwortet hat, sieht nichts (hasResponse-Riegel) -- die Heilung darf
  // niemandem einen zweiten Banner vorlegen.
  //
  // Warum nicht einfach Cookiebot später laden: `data-blockingmode=auto`
  // muss FRÜH laufen, sonst feuern Tracker vor der Einwilligung. Der Loader
  // bleibt darum unangetastet; geheilt wird nur der Verlust danach.
  function bannerNachHydrationHeilen() {
    var versuche = 0, heilungen = 0;
    var MAX = 60;              // ~15 s bei 250 ms Takt, dann still aufgeben
    var MAX_HEILUNGEN = 3;     // gegen eine Endlosschleife, falls renew() nie greift
    var iv = setInterval(function () {
      versuche++;
      var cb = window.Cookiebot;
      if (versuche > MAX) { clearInterval(iv); return; }
      if (!cb) return;                                   // Skript noch nicht da
      if (cb.hasResponse) { clearInterval(iv); return; } // Kunde hat gewählt
      // Banner steht: NICHT aufhören zu beobachten. Er kann auch später noch
      // wegreconciled werden -- ein einmaliger Blick würde das verpassen.
      if (document.getElementById('cookiebanner')) return;
      if (heilungen >= MAX_HEILUNGEN) { clearInterval(iv); return; }
      heilungen++;
      if (typeof cb.renew === 'function') {
        try { cb.renew(); } catch (e) { /* nie den Kaufweg blockieren */ }
      }
    }, 250);
  }
  // Start so früh wie sicher möglich. NICHT an `load` hängen: auf Mobil feuert
  // `load` spät (viele Bilder), gemessen 2026-08-23 kam die Heilung dort erst
  // zwischen 9 s und 15 s -- 8/10 statt 10/10 im 9-s-Fenster. Die gemessene
  // Löschung liegt bei ~1,1-1,3 s und die Hydration ist bei ~1,6 s durch;
  // DOMContentLoaded + 2,5 s hält sicheren Abstand und ist auf Mobil um ein
  // Vielfaches früher als `load`.
  function heilungStarten() { setTimeout(bannerNachHydrationHeilen, 2500); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', heilungStarten);
  } else {
    heilungStarten();
  }
})();
