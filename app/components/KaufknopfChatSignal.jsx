import {useEffect} from 'react';
import {
  AUSWEICH_SELEKTOR,
  BEREIT_ATTRIBUT,
  chatHub,
  DOCK_KLASSE,
  HUB_ATTRIBUT,
  HUB_VARIABLE,
  KAUFKNOPF_SELEKTOR,
  LP_KAUFAUSGANG_VORFILTER,
  OEFFENTLICH_KNOPF_VORFILTER,
  RAHMEN_ID,
  farbeDeckt,
  hatKnopfOptik,
  istLpKaufausgang,
  istOeffentlichesProduktziel,
  OFFEN_ATTRIBUT,
  PFEIL_SELEKTOR,
  rahmenOffen,
  ruhelage,
  UEBERDECKUNG_ATTRIBUT,
  ueberdecktKaufknopf,
  verschiebungY,
  verschoben,
} from '~/lib/kaufknopf-chat';

/**
 * CHAT-WIDGET ÜBER DEM KAUFKNOPF — DERSELBE LEITSATZ, VIERTER FALL.
 * Job 20260926-chat-widget-verdeckt-kaufknopf-desktop.
 *
 * Live gemessen am 2026-09-26 (Chromium, Zustimmung gesetzt, Ruhelage 6 s):
 * auf /products/qione-2-pro trafen von 20 Punkten entlang der Mittellinie
 * des Knopfs „In den Warenkorb legen" nur 12 (1280x800), 13 (1366x768) und
 * 15 (1440x900) den Knopf — der Rest traf
 * iframe#qiblanco-salesbot-widget-frame (z 200, pointer-events auto), auf
 * dem die Anna-Einladung mit Sprechblase stand. Wer die rechte Knopfhälfte
 * klickte, öffnete den Chat statt den Warenkorb.
 *
 * DIE AUFLÖSUNG GEHT NACH UNTEN, wie bei den drei Fällen davor (app.css,
 * Blöcke „CHAT-WIDGET ..."): solange das GESCHLOSSENE Widget einen Kaufknopf
 * überdeckt, wird es nicht dargestellt. Sobald der Kunde weiterscrollt und
 * die Überdeckung endet, steht es wieder da. Der Chat bleibt erreichbar
 * (Konzept Growth 4.6: Live-Chat +16 % Kaufwahrscheinlichkeit), nur nicht
 * ÜBER dem Kaufknopf. Leitsatz (design-meister web-soll.yaml
 * overlay_ordnung.leitsatz): kein Bedienelement darf sichtbar und zugleich
 * nicht treffbar sein.
 *
 * WARUM EIN SIGNAL AUS JS UND KEINE CSS-REGEL: die Überdeckung ist eine
 * Frage der LAGE zweier Rechtecke, und die hängt am Scrollstand. Keine
 * Media-Query kann sie beantworten — dieselbe Seite auf demselben Fenster
 * ist beim Laden verdeckt und 200 px tiefer frei.
 *
 * DER OFFENE CHAT WIRD NIE UNTERDRÜCKT. Der Loader lebt im Seitenkontext
 * und verrät seinen Zustand nicht als Attribut; drei beobachtbare Merkmale
 * schließen die Unterdrückung einzeln aus, jedes für sich genügt:
 *   (1) `html.qb-chat-docked` — der Loader setzt die Klasse, solange das
 *       Fenster als Spalte angedockt ist (Desktop ab 1024 px). Dann schiebt
 *       er den Shop selbst zur Seite; es gibt keine Überdeckung.
 *   (2) iframe höher als 60 % des Fensters — eine GESCHLOSSENE Fläche darf
 *       das laut Loader nie werden (Deckel maxHoehe in
 *       qi-salesbot/src/app/embed/qiblanco-widget.js/route.ts,
 *       resizeWidget). Das offene Fenster auf dem Handy ist fast so hoch
 *       wie der Schirm.
 *   (3) der Kunde hat in den Chat geklickt (Fokus wandert ins iframe). Ab
 *       dann bleibt das Widget für die Lebensdauer des Dokuments stehen. Das
 *       deckt das offene Overlay auf Tablets (561–1023 px), das weder angedockt
 *       noch höher als 60 % ist. Der Preis ist gewollt: wer den Chat benutzt
 *       hat, bekommt ihn nicht mehr weggenommen.
 *
 * `visibility`, NICHT `display` wie in den Blöcken davor: die Überdeckung
 * wird am Rechteck des iframe gemessen, und ein Element ohne Layout-Kasten
 * hat keins. Mit `display:none` wüsste dieses Signal nach dem Ausblenden
 * nicht mehr, wann die Überdeckung endet, und das Widget käme nie zurück.
 * `visibility:hidden` behält den Kasten, zeichnet nichts und nimmt am
 * Hit-Test nicht teil. Das iframe behält seinen Browsing-Kontext; der Verlauf
 * überlebt.
 *
 * DIE NAHT ZU qi-salesbot IST EINSEITIG: die Storefront unterdrückt von
 * außen (`html[data-chat-über-kaufknopf] #qiblanco-salesbot-widget-frame`
 * in app.css). Der Loader setzt `visibility` nicht inline (nachgemessen
 * 2026-09-26 an route.ts). Nebenwirkung: Annas Auftritt wartet, solange
 * ihre Ecke verdeckt ist (eckeVerdeckt im Loader trifft dann den Kaufknopf
 * statt des Rahmens) — aber nicht unbegrenzt. Gemessen 2026-10-01 auf
 * /pages/E-Smog-Schutz (390x844, Hero-Knopf unter der Einladungsblase): die
 * Blase blieb 3,5 s ausgeblendet und fiel dann zur Pille zusammen, ohne
 * gesehen worden zu sein; live ohne Unterdrückung stand sie 7,5 s. Gewollt:
 * der Knopf geht vor der Einladung. Der Chat selbst bleibt als Pille da.
 *
 * DER ÖFFENTLICHE BLOCK (Job 20261001-oeffentlicher-block-chatblase-verdeckt-
 * produktknoepfe): auch die Knöpfe der öffentlichen Seiten zur Produkt- bzw.
 * Kaufseite zählen, erkannt an Ziel und Knopf-Optik. Zensus, Schnitt und die
 * Abwägung gegen Annas Einstieg stehen in lib/kaufknopf-chat.js bei
 * OEFFENTLICH_KNOPF_VORFILTER. Dieselbe Nebenwirkung wie oben: wo der erste
 * Knopf beim Laden in der Zone der Einladungsblase liegt
 * (/pages/qione-2-pro-details, /pages/qibracelet-details), läuft die
 * Einladung ungesehen ab und die Pille steht danach.
 *
 * VOR DER HYDRATION (Nachzug 2026-09-28, Vollzug ov1f0335e4ad): der Loader
 * läuft als defer-Skript vor dem React-Entry, dieser Effekt erst danach.
 * Dazwischen stand das Widget ungeprüft über dem Knopf — ohne Last rund
 * 1 s, unter Last bis zu 10 s (/products/qihome-air, 1024x768). Deshalb
 * blendet app.css das Widget aus, bis hier `data-chat-signal-bereit` steht.
 * Das Attribut wird im selben synchronen Schritt wie die erste Messung
 * gesetzt, also nie vor ihr.
 *
 * RÜCKWEG: beide Regeln in app.css löschen (die zu data-chat-deckt-kaufknopf
 * und die zu data-chat-signal-bereit). <KaufknopfChatSignal /> allein aus
 * root.jsx zu nehmen genügt NICHT mehr: das Widget bliebe dann unsichtbar.
 *
 * ÜBER DER KAUFLEISTE WEICHT ES NACH OBEN AUS (s03 des Grossjobs vom
 * 25.10.2026, Christian: „dann sollte das gesicht nicht verschweinden sondern
 * hochrutschen“). Steht eine Leiste mit data-qb-chat-weicht unter dem
 * geschlossenen Widget, setzt dieses Signal `data-chat-rutscht` und die
 * Strecke `--qb-chat-hub` an <html>; app.css verschiebt den Rahmen per
 * transform. Die Überdeckung oben wird gegen die ZIELLAGE beurteilt, nicht
 * gegen das gemessene Rechteck: das enthält die Transformation und läge
 * mitten im Übergang noch über dem Knopf der Leiste. Regel, Falle und
 * Rückweg: lib/kaufknopf-chat.js, chatHub.
 */

// Modulweit statt je Effekt: der Rahmen überlebt Client-Navigationen (er hängt
// an <body>, SalesbotWidget sitzt in root.jsx), also auch die Berührung.
let chatBeruehrt = false;

export function KaufknopfChatSignal() {
  useEffect(() => {
    const wurzel = document.documentElement;

    // Gemerkt wird nur das Ja: ein Nein kann an einem Stylesheet liegen, das
    // nach einer Client-Navigation noch lädt, und darf deshalb nicht haften.
    const alsKnopfErkannt = new WeakSet();
    const knopfOptik = (a, r) => {
      if (alsKnopfErkannt.has(a)) return true;
      const stil = window.getComputedStyle(a);
      const rahmenDeckt = farbeDeckt(stil.borderTopColor);
      const ja = hatKnopfOptik({
        display: stil.display,
        flaeche:
          farbeDeckt(stil.backgroundColor) || stil.backgroundImage !== 'none',
        raender: ['Top', 'Right', 'Bottom', 'Left'].map((seite) =>
          rahmenDeckt ? parseFloat(stil[`border${seite}Width`]) || 0 : 0,
        ),
        hoehe: r.height,
        hatBild: !!a.querySelector('img, picture, video'),
      });
      if (ja) alsKnopfErkannt.add(a);
      return ja;
    };

    const knopfRechtecke = () => {
      const liste = [];
      const nimm = (k) => {
        const r = k.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) liste.push(r);
      };
      document.querySelectorAll(KAUFKNOPF_SELEKTOR).forEach(nimm);
      // Landingpage-Knöpfe zur Kaufseite (lib/kaufknopf-chat.js): der
      // Vorfilter trifft auch Nachbarpfade, entschieden wird am Pfad.
      document.querySelectorAll(LP_KAUFAUSGANG_VORFILTER).forEach((a) => {
        if (istLpKaufausgang(a.pathname)) nimm(a);
      });
      // Knöpfe des öffentlichen Blocks zur Produkt- bzw. Kaufseite: Ziel am
      // Pfad, Knopf an der Optik (lib/kaufknopf-chat.js). Die Optik wird nur
      // für Links im Fenster gelesen; außerhalb kann der Rahmen nichts decken.
      document.querySelectorAll(OEFFENTLICH_KNOPF_VORFILTER).forEach((a) => {
        if (!istOeffentlichesProduktziel(a.pathname)) return;
        const r = a.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return;
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        if (knopfOptik(a, r)) liste.push(r);
      });
      return liste;
    };

    // Der Rahmen erscheint erst, wenn der Loader gelaufen ist, und kann
    // ersetzt werden (Nachzug in SalesbotWidget.jsx) — beobachtet wird immer
    // der aktuelle.
    let beobachteterRahmen = null;
    // Sofort und nicht über requestAnimationFrame (seit s03): öffnet der
    // Kunde den Chat, schreibt der Loader die neue Größe inline, und im
    // selben Bild muss die Verschiebung fallen. Ein Bild später stünde das
    // offene Fenster um die Leistenhöhe nach oben geschoben. Der Rückruf
    // eines MutationObservers läuft vor dem Zeichnen.
    const rahmenWaechter = new MutationObserver(() => sofort());

    const schreibe = () => {
      const rahmen = document.getElementById(RAHMEN_ID);
      if (rahmen !== beobachteterRahmen) {
        rahmenWaechter.disconnect();
        if (rahmen) {
          rahmenWaechter.observe(rahmen, {attributes: true, attributeFilter: ['style']});
        }
        beobachteterRahmen = rahmen;
      }
      if (rahmen && document.activeElement === rahmen) chatBeruehrt = true;
      const angedockt = wurzel.classList.contains(DOCK_KLASSE);
      const fensterHoehe = window.innerHeight;
      // Ruhelage = gemessenes Rechteck ohne die eigene Verschiebung (die
      // Falle getBoundingClientRect, lib/kaufknopf-chat.js).
      const ruhe = rahmen
        ? ruhelage(
            rahmen.getBoundingClientRect(),
            verschiebungY(window.getComputedStyle(rahmen).transform),
          )
        : null;
      const leisten = [];
      if (ruhe) {
        document.querySelectorAll(AUSWEICH_SELEKTOR).forEach((l) => {
          leisten.push(l.getBoundingClientRect());
        });
      }
      const hub = chatHub({ruhe, leisten, fensterHoehe, angedockt});
      const offen = rahmenOffen({rahmen: ruhe, fensterHoehe, angedockt});
      const knoepfe = rahmen ? knopfRechtecke() : [];
      // Hochgerutscht deckt die Kugel auch keine Slider-Pfeile (lib, PFEIL_SELEKTOR).
      if (hub > 0) {
        document.querySelectorAll(PFEIL_SELEKTOR).forEach((b) => {
          const r = b.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < fensterHoehe) {
            knoepfe.push(r);
          }
        });
      }
      const unterdruecken = ueberdecktKaufknopf({
        rahmen: verschoben(ruhe, hub),
        knoepfe,
        fensterHoehe,
        angedockt,
        beruehrt: chatBeruehrt,
      });
      // Strecke vor dem Attribut: im selben synchronen Schritt, ohne Bild
      // dazwischen. Ohne Verschiebung bleibt keine Variable stehen.
      const hubWert = hub > 0 ? `${hub}px` : '';
      if (wurzel.style.getPropertyValue(HUB_VARIABLE) !== hubWert) {
        if (hubWert) wurzel.style.setProperty(HUB_VARIABLE, hubWert);
        else wurzel.style.removeProperty(HUB_VARIABLE);
      }
      if ((hub > 0) !== wurzel.hasAttribute(HUB_ATTRIBUT)) {
        if (hub > 0) wurzel.setAttribute(HUB_ATTRIBUT, '');
        else wurzel.removeAttribute(HUB_ATTRIBUT);
      }
      if (offen !== wurzel.hasAttribute(OFFEN_ATTRIBUT)) {
        if (offen) wurzel.setAttribute(OFFEN_ATTRIBUT, '');
        else wurzel.removeAttribute(OFFEN_ATTRIBUT);
      }
      if (unterdruecken === wurzel.hasAttribute(UEBERDECKUNG_ATTRIBUT)) return;
      if (unterdruecken) wurzel.setAttribute(UEBERDECKUNG_ATTRIBUT, '');
      else wurzel.removeAttribute(UEBERDECKUNG_ATTRIBUT);
    };

    // Ein Urteil pro Bild, egal wie viele Ereignisse es anstoßen.
    let angefordert = 0;
    const anfordern = () => {
      if (angefordert) return;
      angefordert = window.requestAnimationFrame(() => {
        angefordert = 0;
        schreibe();
      });
    };

    /**
     * Ein Layout-Sprung wird im selben Bild beurteilt, nicht im nächsten.
     * Der ResizeObserver meldet NACH dem Layout und VOR dem Zeichnen; ein
     * Umweg über requestAnimationFrame hätte das Urteil auf das folgende Bild
     * geschoben, und dieses eine Bild zeigte die Pille über dem Knopf. Gemessen
     * 2026-10-09 (Job 20261009-schluss-cta-rand-unter-chatpille-prio45): ein
     * nachladendes Bild schob den Schluss-CTA um 358 px unter die Pille, das
     * Signal folgte 20 bis 60 ms später, und ein Hit-Test in dieser Lücke traf
     * den Chat. Scroll braucht das nicht: das Ereignis kommt vor den
     * rAF-Rückrufen desselben Bilds.
     */
    const sofort = () => {
      if (angefordert) {
        window.cancelAnimationFrame(angefordert);
        angefordert = 0;
      }
      schreibe();
    };

    schreibe();
    // Erst jetzt gibt app.css das Widget frei. Beim Abbau bleibt das Attribut
    // stehen: ohne Signal gilt wieder der Stand vor dem Bau (Widget sichtbar),
    // nicht ein dauerhaft verschwundener Chat.
    wurzel.setAttribute(BEREIT_ATTRIBUT, '');

    /**
     * Klick in den Chat: das Dokument verliert den Fokus an das iframe.
     * `blur` am window ist der einzige Weg, einen Klick in ein
     * Cross-Origin-iframe von außen zu bemerken.
     */
    const beiBlur = () => {
      window.setTimeout(() => {
        if (document.activeElement?.id === RAHMEN_ID) {
          chatBeruehrt = true;
          schreibe();
        }
      }, 0);
    };

    /**
     * Was die Lage ändert:
     *  - scroll / resize: der Knopf wandert, das Fenster ändert sich;
     *  - `style` am Rahmen (Beobachter oben): der Loader schreibt JEDE
     *    Grössen- und Lageänderung inline (Pille, Blase, offen, angedockt);
     *  - `class` am <html>: die Docked-Klasse;
     *  - childList an <body>: der Rahmen erscheint erst nach dem Loader, und
     *    Kaufknöpfe kommen per Client-Navigation;
     *  - ResizeObserver an <body>: Inhalt oberhalb des Knopfs lädt nach
     *    (Bilder) und schiebt ihn, ohne dass gescrollt wird. Er urteilt
     *    sofort (siehe `sofort` oben), alle anderen über `anfordern`.
     */
    window.addEventListener('scroll', anfordern, {passive: true});
    window.addEventListener('resize', anfordern);
    window.addEventListener('blur', beiBlur);

    // Nur childList: `style` im ganzen Baum zu beobachten hiesse, bei jedem
    // Bild eines Scroll-Videos neu zu messen.
    const waechter = new MutationObserver(anfordern);
    waechter.observe(document.body, {subtree: true, childList: true});
    const wurzelWaechter = new MutationObserver(anfordern);
    wurzelWaechter.observe(wurzel, {attributes: true, attributeFilter: ['class']});
    const groesse =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sofort);
    groesse?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', anfordern);
      window.removeEventListener('resize', anfordern);
      window.removeEventListener('blur', beiBlur);
      waechter.disconnect();
      rahmenWaechter.disconnect();
      wurzelWaechter.disconnect();
      groesse?.disconnect();
      if (angefordert) window.cancelAnimationFrame(angefordert);
      // Ein hängendes Attribut würde den Chat dauerhaft abschalten.
      wurzel.removeAttribute(UEBERDECKUNG_ATTRIBUT);
      // ... bzw. dauerhaft verschoben stehen lassen.
      wurzel.removeAttribute(HUB_ATTRIBUT);
      wurzel.removeAttribute(OFFEN_ATTRIBUT);
      wurzel.style.removeProperty(HUB_VARIABLE);
    };
  }, []);

  return null;
}
