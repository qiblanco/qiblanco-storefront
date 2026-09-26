import {useEffect} from 'react';
import {
  DOCK_KLASSE,
  KAUFKNOPF_SELEKTOR,
  RAHMEN_ID,
  UEBERDECKUNG_ATTRIBUT,
  ueberdecktKaufknopf,
} from '~/lib/kaufknopf-chat';

/**
 * CHAT-WIDGET UEBER DEM KAUFKNOPF — DERSELBE LEITSATZ, VIERTER FALL.
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
 * DIE AUFLOESUNG GEHT NACH UNTEN, wie bei den drei Fällen davor (app.css,
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
 * DER OFFENE CHAT WIRD NIE UNTERDRUECKT. Der Loader lebt im Seitenkontext
 * und verrät seinen Zustand nicht als Attribut; drei beobachtbare Merkmale
 * schliessen die Unterdrückung einzeln aus, jedes für sich genügt:
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
 * aussen (`html[data-chat-ueber-kaufknopf] #qiblanco-salesbot-widget-frame`
 * in app.css). Der Loader setzt `visibility` nicht inline (nachgemessen
 * 2026-09-26 an route.ts). Nebenwirkung, die passt: Annas Auftritt wartet,
 * solange ihre Ecke verdeckt ist (eckeVerdeckt im Loader trifft dann den
 * Kaufknopf statt des Rahmens) — die Blase läuft nicht ungesehen ab.
 *
 * RUECKWEG: <KaufknopfChatSignal /> in root.jsx entfernen, oder die Regel
 * in app.css löschen. Ohne das Attribut ist alles wie vor dem Bau.
 */

// Modulweit statt je Effekt: der Rahmen überlebt Client-Navigationen (er hängt
// an <body>, SalesbotWidget sitzt in root.jsx), also auch die Berührung.
let chatBeruehrt = false;

export function KaufknopfChatSignal() {
  useEffect(() => {
    const wurzel = document.documentElement;

    const knopfRechtecke = () => {
      const liste = [];
      document.querySelectorAll(KAUFKNOPF_SELEKTOR).forEach((k) => {
        const r = k.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) liste.push(r);
      });
      return liste;
    };

    // Der Rahmen erscheint erst, wenn der Loader gelaufen ist, und kann
    // ersetzt werden (Nachzug in SalesbotWidget.jsx) — beobachtet wird immer
    // der aktuelle.
    let beobachteterRahmen = null;
    const rahmenWaechter = new MutationObserver(() => anfordern());

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
      const unterdruecken = ueberdecktKaufknopf({
        rahmen: rahmen ? rahmen.getBoundingClientRect() : null,
        knoepfe: rahmen ? knopfRechtecke() : [],
        fensterHoehe: window.innerHeight,
        angedockt: wurzel.classList.contains(DOCK_KLASSE),
        beruehrt: chatBeruehrt,
      });
      if (unterdruecken === wurzel.hasAttribute(UEBERDECKUNG_ATTRIBUT)) return;
      if (unterdruecken) wurzel.setAttribute(UEBERDECKUNG_ATTRIBUT, '');
      else wurzel.removeAttribute(UEBERDECKUNG_ATTRIBUT);
    };

    // Ein Urteil pro Bild, egal wie viele Ereignisse es anstossen.
    let angefordert = 0;
    const anfordern = () => {
      if (angefordert) return;
      angefordert = window.requestAnimationFrame(() => {
        angefordert = 0;
        schreibe();
      });
    };

    schreibe();

    /**
     * Klick in den Chat: das Dokument verliert den Fokus an das iframe.
     * `blur` am window ist der einzige Weg, einen Klick in ein
     * Cross-Origin-iframe von aussen zu bemerken.
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
     *    (Bilder) und schiebt ihn, ohne dass gescrollt wird.
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
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(anfordern);
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
    };
  }, []);

  return null;
}
