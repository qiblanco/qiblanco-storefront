import {useEffect} from 'react';

/**
 * DIE NAHT ZWISCHEN STOREFRONT UND CHAT-WIDGET, als EIN Signal am <html>.
 *
 * Christians Befund war: "man kommt nicht gescheit aufs X". Live gemessen am
 * 2026-09-01 (iPhone 14 Pro 393x852, Warenkorb-Schublade offen) war das
 * Chat-Widget SICHTBAR (325x275) und `document.elementFromPoint` traf auf
 * seiner Mitte UND auf seiner X-Ecke `div.cart-details`. Ein Kreuz, das man
 * sieht und nicht treffen kann.
 *
 * Der Leitsatz der Overlay-Ordnung (SSoT: design-meister
 * db/webdesign/web-soll.yaml, Abschnitt `overlay_ordnung`) loest das bewusst
 * NACH UNTEN auf: kein Bedienelement darf sichtbar und zugleich nicht
 * treffbar sein — entweder es liegt oben und der Hit-Test trifft es, oder es
 * wird nicht dargestellt. Das Widget wird deshalb UNTERDRUECKT, solange ein
 * modaler Dialog offen ist, statt über ihn gehoben zu werden: ein Chat über
 * der offenen Warenkorb-Schublade verdeckt den KAUFWEG.
 *
 * WARUM EIN ATTRIBUT UND NICHT `body:has(...)` IM CSS. Die reine CSS-Fassung
 * wäre kuerzer und braeuchte diese Datei nicht. Sie faellt aber auf genau
 * den Geräten aus, um die es hier geht: ein Browser ohne `:has()` verwirft
 * die GESAMTE Regel als ungueltigen Selektor, still und ohne Fehlermeldung.
 * `:has()` gibt es ab iOS/Safari 15.4, Chrome 105 und Firefox 121 — das sind
 * heute weit über 95 %, aber der Rest sind ALTE Handys, und der Auftrag
 * heißt "auf JEDEM Handy". Eine Loesung, die ausgerechnet dort stumm
 * ausfaellt, wo der Fehler am wahrscheinlichsten auffiel, ist der falsche
 * Rest. Ein Attribut lesen kann jeder Browser.
 *
 * WAS DIE NAHT NICHT IST: das Widget selbst liest dieses Attribut NICHT und
 * kann es nicht — es lebt in einem Cross-Origin-iframe und sieht unser
 * Dokument baulich nie. Die Naht ist EINSEITIG: die Storefront unterdrueckt
 * von aussen (`html[data-dialog-offen] #qiblanco-salesbot-widget-frame` in
 * app.css). Nachgemessen 2026-09-04 an
 * qi-salesbot/src/app/embed/qiblanco-widget.js/route.ts: der Loader setzt 24
 * Eigenschaften an `iframe.style` und KEINE davon ist `display` — unser
 * `!important` gewinnt konfliktfrei. Wer das Attribut trotzdem lesen KANN,
 * ist der Loader (er läuft im Seitenkontext, nicht im iframe); dass er es
 * nicht muss, ist der Sinn der Einseitigkeit.
 */

/**
 * Die Dialog-Stufe der Ebenenleiter, als Selektorliste.
 *
 * EINE Wahrheit, an EINER Stelle: dieselben Selektoren tragen in den
 * Stylesheets `z-index: var(--z-dialog)`. Waechst eine sechste modale Flaeche
 * hinzu, wird sie hier UND dort eingetragen — der Waechter
 * `design-meister/bin/overlay-ordnung pruefe` faellt auf, wenn sie ihren
 * z-index frei greift, und die Probe `probe_overlay_schliesskreuz` faellt
 * auf, wenn das Widget darunter sichtbar und tot stehen bleibt.
 *
 * `.overlay.expanded` und nicht `.overlay`: die drei Schubladen (Warenkorb,
 * Suche, Menue) stehen IMMER im DOM und tragen ihren Zustand in der Klasse.
 * Die vier uebrigen Flaechen werden nur im offenen Zustand gerendert.
 */
export const DIALOG_SELEKTOREN = [
  '.overlay.expanded',
  '.ImageGalleryModal',
  '.video360-overlay',
  '.GoogleRezensionenPopup',
  '.qb-st-lightbox',
].join(', ');

/** Das Attribut am <html>, auf das die Unterdrueckungs-Regel in app.css hängt. */
export const DIALOG_ATTRIBUT = 'data-dialog-offen';

export function DialogSignal() {
  useEffect(() => {
    const wurzel = document.documentElement;

    const schreibe = () => {
      const offen = !!document.querySelector(DIALOG_SELEKTOREN);
      // Nur schreiben, wenn sich etwas aendert: ein setAttribute in einem
      // MutationObserver, der auf Attribute hoert, ist sonst seine eigene
      // Ursache. Der Observer beobachtet zwar nicht <html>, aber die
      // Bedingung kostet nichts und macht die Schleife baulich unmöglich
      // statt nur unwahrscheinlich.
      if (offen === wurzel.hasAttribute(DIALOG_ATTRIBUT)) return;
      if (offen) wurzel.setAttribute(DIALOG_ATTRIBUT, '');
      else wurzel.removeAttribute(DIALOG_ATTRIBUT);
    };

    // Erster Lauf VOR dem Beobachten: bei einer Client-Navigation kann eine
    // modale Flaeche schon stehen, bevor dieser Effekt läuft.
    schreibe();

    /**
     * WARUM EIN MutationObserver UND KEIN REACT-ZUSTAND: die fünf modalen
     * Flaechen liegen in fünf Komponenten mit fünf unabhaengigen Zustaenden
     * (Aside, ProductImageList, Video360Viewer, GoogleRezensionenBereich,
     * StudienUebersicht). Sie an einen gemeinsamen Context zu hängen wäre
     * ein Umbau an fünf kundensichtbaren Flaechen für ein Signal — und
     * `Aside.jsx` ist eine Bestandskomponente, um die man herum baut, nicht
     * in sie hinein. Der Observer sitzt an EINER Stelle und kennt die
     * Flaechen nur über die Selektorliste oben.
     *
     * `attributeFilter: ['class']` ist nötig, weil `.overlay` seinen Zustand
     * NUR in der Klasse trägt und nie aus dem DOM verschwindet; `childList`
     * für die vier uebrigen, die per Portal an <body> hängen.
     */
    let angefordert = 0;
    const waechter = new MutationObserver(() => {
      // Zusammenfassen: React setzt bei einem Zustandswechsel viele
      // Mutationen in einem Rutsch ab. Ein querySelector pro Bild statt pro
      // Mutation.
      if (angefordert) return;
      angefordert = window.requestAnimationFrame(() => {
        angefordert = 0;
        schreibe();
      });
    });
    waechter.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      waechter.disconnect();
      if (angefordert) window.cancelAnimationFrame(angefordert);
      // Das Attribut mit zuruecknehmen: ein haengendes `data-dialog-offen`
      // würde das Widget dauerhaft unterdruecken — also genau den Chat
      // abschalten, den es schuetzen soll.
      wurzel.removeAttribute(DIALOG_ATTRIBUT);
    };
  }, []);

  return null;
}
