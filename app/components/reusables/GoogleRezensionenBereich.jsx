import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';

/*
 * Google-Rezensionen-Bereich — DIE eine geteilte Sektion "echte Google-
 * Bewertungen" (Job 20260731-google-rezensionen-bereich-produktseiten).
 *
 * Christian-Referenz (Screenshot 2): "4,8 Sterne · N Bewertungen · Google"
 * + Rezensions-Karussell. Genau das liefert der BESTEHENDE ReputonWidget
 * (seit PR #149: server-gecachter Reputon-Feed, neueste 5-Sterne-Reviews,
 * + GoogleRatingBadge aus useGoogleRating — volle Wahrheit, KEINE
 * statischen/erfundenen Reviews; Klarstellung Christian 2026-07-31:
 * Live-Anbindung erhalten und nutzen).
 *
 * NEU ist nur der Rahmen: verkaufsstarke Überschrift darüber (Ergänzung
 * Christian) + stabiler Anker für den 4,8-Klick im Header-Banner.
 *
 * FAKTEN-GATE der Überschrift: "Über 14.000" ist kennzahlen-kanonisch
 * (claims-SSoT-Eintrag WM-nutzer-*-14000 in claims.js, fakten-basis.yaml Social-Proof-
 * Bestand >14.000 QiOnes im Einsatz); "zufriedene Kunden" ist etablierter
 * Live-Bestand (Header-Banner, TenYearsDealPage, QiHomeLanding) und von
 * Christian für diese Überschrift ausdrücklich vorgegeben.
 *
 * dataSection: NUR setzen, wo die Seite bereits data-section-Anker trägt —
 * die organische PDP ist BEWUSST anker-frei (sonst sähe der Design-Rubrik-
 * Collector nur noch 1 Sektion, Watch-Regression; siehe Kommentar in
 * products.qione-2-pro.jsx).
 */

export const GOOGLE_REZENSIONEN_ANKER_ID = 'google-rezensionen';

/*
 * Responsive-Repair 2026-08-04 (Job bl-20260804T022554Z-a0de0e, Christian:
 * der 4,8-Klick „scrollt zu weit nach unten").
 *
 * Wurzel war KEIN Pixel-Offset, sondern das ZIEL: Seiten wie
 * /pages/qione-2-pro tragen ZWEI Rezensions-Sektionen — oben
 * „Beeindruckende Kundenerfahrungen" (GoogleReviews, war anker-los) und
 * weiter unten „Über 14.000 zufriedene Kunden" (#google-rezensionen).
 * findeRezensionsZiel() kannte nur die untere, der Klick sprang also an
 * der oberen VORBEI. Gemessen (vorher_live.json): die Überschrift landete
 * 857–874 px ÜBER der Kopfkante — auf allen Breiten, auch Desktop.
 * Christians Soll: oben am sichtbaren Rand steht „Beeindruckende
 * Kundenerfahrungen".
 */
export const GOOGLE_KUNDENERFAHRUNGEN_ANKER_ID = 'kundenerfahrungen';

/** Stabiler Sektions-Marker (Job 20260820-wurzel-sterne-klick-scroll, s03).
 *  Ersetzt `.google-rating-badge` als dritten Rueckfall — Begründung an
 *  findeRezensionsZiel(). */
export const REVIEWS_SEKTION_ATTR = 'data-qb-reviews-section';

/** Scroll-Ziel des 4,8-Klicks, in Reihenfolge der Nähe zum Nutzer-Wunsch:
 *  1. die obere „Beeindruckende Kundenerfahrungen"-Sektion (Shop-Seiten/LPs),
 *  2. sonst der Rezensionsbereich (organische PDPs tragen NUR diesen),
 *  3. sonst die per Marker ausgezeichnete Rezensions-Sektion (LPs ohne Anker).
 *
 *  KOLLISION A4, AUFGELOEST 2026-08-22 (Job 20260820, Segment s03): der dritte
 *  Rueckfall war bis hierher `.google-rating-badge` — ausgerechnet das
 *  Klasse-G-Element. Dasselbe Element wäre damit Sprung-ZIEL und
 *  Google-LINK zugleich gewesen: der Klick darauf soll zu Google fuehren, der
 *  Sprung soll dorthin fuehren. Der Badge war nie das Ziel, sondern nur sein
 *  zufaellig erreichbarer Nachbar — wo ein Badge steht, steht ohnehin eine
 *  Sektion. Der Rueckfall zeigt deshalb jetzt auf den Sektions-Container
 *  selbst; die beiden Anker-IDs bleiben unveraendert davor. */
export function findeRezensionsZiel() {
  if (typeof document === 'undefined') return null;
  return (
    document.getElementById(GOOGLE_KUNDENERFAHRUNGEN_ANKER_ID) ||
    document.getElementById(GOOGLE_REZENSIONEN_ANKER_ID) ||
    document.querySelector(`[${REVIEWS_SEKTION_ATTR}]`)
  );
}

/**
 * Kopf-Höhe LIVE messen statt hart zu kodieren: der Mobil-Kopf ist niedriger
 * als der Desktop-Kopf, und das schwarze Banner verschwindet beim Scrollen.
 * Ein fester Wert (bisher `scroll-margin-top: 150px`, Desktop-Maß) sitzt auf
 * 360–414 px zwangsläufig daneben. Gemessen wird die Unterkante aller
 * tatsächlich oben klebenden fixed/sticky-Kopfelemente.
 *
 * GEMESSEN WIRD DIE RUHELAGE, NICHT DIE MOMENTANE LAGE — das ist die
 * Korrektur vom 2026-09-03 (Job 20260831-storefront-kopf-reserve-sternesprung):
 *
 *   `.header-wrapper.header--hidden { transform: translateY(-100%) }` schiebt
 *   den Kopf aus dem Bild. `getBoundingClientRect()` bildet Transformationen ab
 *   — die Unterkante ist dann ~0, und diese Funktion lieferte 0 statt der
 *   Kopfhöhe. Live nachgemessen 2026-09-03 auf qiblanco.com, alle drei
 *   Viewports, eingefahren gegen ausgefahren:
 *
 *     vw=360   top -84  bottom 0  dy -84   |  top 0  bottom  84
 *     vw=768   top -103 bottom 0  dy -103  |  top 0  bottom 103
 *     vw=1440  top -95  bottom 0  dy -95   |  top 0  bottom  95
 *
 *   Wer daraus 0 macht, rechnet eine Sprung-Landung ohne jede Kopf-Reserve:
 *   fährt der Kopf danach aus — und das tut er bei JEDER Aufwärts-Bewegung,
 *   Header.jsx kennt keine Totzone — liegt die Überschrift dahinter. Genau
 *   das war der gemeldete Defekt (Probe `probe_sterne_kopf_zustaende.py`,
 *   Verdikt `keine_kopf_reserve`, versatz −71/−90/−82).
 *
 *   Herausgerechnet wird deshalb das EIGENE translateY des Elements. Der Wert
 *   ist danach vom Kopfzustand unabhängig (Spalte links == Spalte rechts oben),
 *   und die Landung wettet nicht mehr darauf, dass der Kopf eingefahren bleibt.
 *
 * NICHT geändert wurde Header.jsx: eine Totzone im Scroll-Listener senkt nur
 * die Häufigkeit des selbst ausgelösten Falls — ein Besucher, der bewusst nach
 * oben scrollt, fährt den Kopf weiter aus, und die Überschrift wäre wieder
 * verdeckt. Die Reserve trägt gegen BEIDE Zustände; die Totzone gegen einen.
 */
export function messeKopfHoehe() {
  if (typeof document === 'undefined') return 0;
  let unten = 0;
  for (const el of document.querySelectorAll(
    'header, .header-wrapper, .announcement-bar',
  )) {
    const stil = window.getComputedStyle(el);
    if (stil.position !== 'fixed' && stil.position !== 'sticky') continue;
    const kasten = el.getBoundingClientRect();
    if (kasten.height <= 0) continue;
    /* Eigenes translateY herausrechnen (0, wenn keine Transformation läuft).
       DOMMatrixReadOnly steht in jedem Browser, der Hydrogen ausführt; der
       try/catch ist der Rückfall auf „keine Verschiebung" statt auf einen
       Absturz im Scroll-Pfad. */
    let versatzY = 0;
    if (stil.transform && stil.transform !== 'none') {
      try {
        versatzY = new DOMMatrixReadOnly(stil.transform).m42 || 0;
      } catch {
        versatzY = 0;
      }
    }
    const ruheOben = kasten.top - versatzY;
    const ruheUnten = kasten.bottom - versatzY;
    if (ruheOben <= 5) {
      unten = Math.max(unten, ruheUnten);
    }
  }
  return unten;
}

const SCROLL_LUFT_PX = 12; // kleine Luft, damit die Überschrift nicht klebt
const STILL_FRAMES = 3; // so viele Frames ohne Bewegung = Animation fertig
const MAX_WARTE_MS = 2500; // Notbremse, KEIN Taktgeber
const TOLERANZ_PX = 3;
const KORREKTUREN = 3; // erster Sprung + höchstens zwei Nachzüge

/** Soll-Position mit LIVE gemessener Kopfhöhe. */
function sollPosition(ziel) {
  const zielOben = ziel.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, zielOben - messeKopfHoehe() - SCROLL_LUFT_PX);
}

/** Scrollt das Ziel unter den Kopf — mit gemessenem, NICHT geerbtem Offset.
 *  Ersetzt scrollIntoView({block:'start'}), das den fixen Kopf ignoriert.
 *
 *  KORRIGIERT WIRD AUF STILLSTAND, NICHT NACH GESCHAETZTER DAUER (Lehre aus
 *  dem 08-15-Lauf, im US-Stack seit Wochen verankert — Uebertragungsrichtung
 *  US -> DACH): eine laufende `behavior:'smooth'`-Animation trägt ihr Ziel
 *  intern und schlaegt jede zeitgesteuerte Nachkorrektur. Erst den Zustand
 *  herstellen, dann messen. */
export function scrolleZuRezensionen(ziel) {
  if (!ziel || typeof window === 'undefined') return;

  const sanft = !(
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const y = () => window.pageYOffset || window.scrollY || 0;
  const naechsterFrame = (fn) =>
    window.requestAnimationFrame ? window.requestAnimationFrame(fn) : setTimeout(fn, 16);

  /* Wartet, bis die Scrollposition über STILL_FRAMES Frames steht — oder bis
     die Notbremse greift. Erst danach ist eine Neumessung aussagekräftig. */
  function beiStillstand(weiter) {
    let letzte = null;
    let ruhig = 0;
    const start = Date.now();
    naechsterFrame(function tick() {
      const jetzt = y();
      ruhig = letzte !== null && Math.abs(jetzt - letzte) < 1 ? ruhig + 1 : 0;
      letzte = jetzt;
      if (ruhig >= STILL_FRAMES || Date.now() - start > MAX_WARTE_MS) {
        weiter();
        return;
      }
      naechsterFrame(tick);
    });
  }

  function fahre(rest) {
    const soll = sollPosition(ziel);
    if (Math.abs(soll - y()) <= TOLERANZ_PX) return; // sitzt
    if (sanft) window.scrollTo({top: soll, behavior: 'smooth'});
    else window.scrollTo(0, soll);
    if (rest <= 1) return;
    beiStillstand(() => fahre(rest - 1));
  }

  /*
   * ERSTER SPRUNG NICHT MEHR RICHTUNGSABHÄNGIG (Korrektur 2026-09-03,
   * Job 20260831-storefront-kopf-reserve-sternesprung).
   *
   * Bis hierher stand hier `nachUnten ? 0 : messeKopfHoehe()` — mit der
   * Begründung, der Kopf blende sich beim Abwärts-Scrollen ohnehin aus, ein
   * Abzug springe also zu kurz. Die Begründung stimmte, solange
   * `messeKopfHoehe()` die MOMENTANE Unterkante lieferte: nach der Landung war
   * sie 0, der Abzug also unbegründet.
   *
   * Seit die Messung die RUHELAGE liefert (Kommentar dort), ist der Wert vom
   * Kopfzustand unabhängig — und der Abzug ist die Reserve, die genau dann
   * gebraucht wird, wenn der Kopf nach der Landung wieder ausfährt. Die
   * Fallunterscheidung wäre jetzt der Fehler: sie würde in der einen Richtung
   * eine Reserve lassen und in der anderen nicht.
   *
   * WAS DAS KOSTET, offen benannt: am Seitenanfang ist der Kopf höher als im
   * gescrollten Zustand (gemessen 2026-09-03: 124/135/127 bei scrollY=0 gegen
   * 84/103/95 danach). Der erste Sprung reserviert deshalb ~32 px zu viel, und
   * die Konvergenzschleife zieht sie nach. Das ist ein kleiner Nachzug NACH
   * UNTEN — er lässt den Kopf eingefahren, statt ihn erneut auszufahren.
   */
  const zielOben = ziel.getBoundingClientRect().top + window.scrollY;
  const ersterKopf = messeKopfHoehe();

  if (sanft) {
    window.scrollTo({
      top: Math.max(0, zielOben - ersterKopf - SCROLL_LUFT_PX),
      behavior: 'smooth',
    });
  } else {
    window.scrollTo(0, Math.max(0, zielOben - ersterKopf - SCROLL_LUFT_PX));
  }
  beiStillstand(() => fahre(KORREKTUREN - 1));
}

/**
 * Kopfhöhe als CSS-Variable zurückspeisen (`--qb-kopf-hoehe`).
 *
 * `scroll-margin-top: 150px` (app.css) ist ein DESKTOP-Maß und sitzt auf
 * 360–414 px zwangsläufig daneben; ob das Banner eingeblendet ist, ändert die
 * Höhe zusätzlich. Der Festwert bleibt als No-JS-Rückfall im Stylesheet
 * stehen — diese Variable überschreibt ihn, sobald JS läuft.
 *
 * Nachgeführt wird bei Scroll (Banner ein/aus), Resize und
 * Orientierungswechsel. Die Messung ist billig (wenige Elemente), wird aber
 * über requestAnimationFrame entprellt, damit sie den Scroll nicht bremst.
 *
 * SEIT 2026-09-03 trägt die Variable die RUHELAGE des Kopfes, nicht seine
 * momentane Unterkante (siehe messeKopfHoehe). Für `scroll-margin-top` ist das
 * der richtige Wert: der native Hash-Sprung landet sonst mit 0 px Reserve und
 * schiebt die Überschrift hinter den Kopf, sobald dieser wieder ausfährt. Die
 * Variable springt dadurch beim Scrollen nicht mehr zwischen 0 und Kopfhöhe.
 */
export function useKopfHoeheVariable() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    let offen = false;
    const schreibe = () => {
      offen = false;
      const h = messeKopfHoehe();
      document.documentElement.style.setProperty(
        '--qb-kopf-hoehe',
        `${Math.round(h)}px`,
      );
    };
    const anfordern = () => {
      if (offen) return;
      offen = true;
      window.requestAnimationFrame(schreibe);
    };
    schreibe();
    window.addEventListener('scroll', anfordern, {passive: true});
    window.addEventListener('resize', anfordern);
    window.addEventListener('orientationchange', anfordern);
    return () => {
      window.removeEventListener('scroll', anfordern);
      window.removeEventListener('resize', anfordern);
      window.removeEventListener('orientationchange', anfordern);
    };
  }, []);
}

/**
 * Dokumentweite Delegation für JEDE Klasse-S-Sterne-Ansicht.
 *
 * WARUM DELEGIERT UND NICHT PRO KOMPONENTE: (1) ein Import der Scroll-Logik in
 * StarRating wäre der Zyklus StarRating -> GoogleRezensionenBereich ->
 * ReputonWidget -> StarRating; (2) es ist das Muster, das der US-Stack bereits
 * fährt (qb-reviews.js) — geprüft am MARKER, nicht am Selektor, damit später
 * hinzugefügte Sterne-Ansichten das Verhalten ohne Codeänderung erben.
 *
 * KEIN keydown-HANDLER: die Träger sind echte <button> (bzw. der Banner-<a>),
 * dort lösen Enter/Leertaste nativ ein click aus. Ein eigener keydown-Handler
 * würde auf genau diesen Elementen doppelt feuern.
 */
export function useSterneSprungDelegation(aufSprung) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onClick = (e) => {
      /* Der Banner-<a> trägt bereits einen React-onClick, der preventDefault
         aufruft. React hängt seine Listener am Root-Container, der IM document
         liegt — beim Bubbling läuft der Container-Listener also VOR diesem
         hier. `defaultPrevented` ist damit ein exakter, kein heuristischer
         Schnitt gegen die Doppelauslösung. */
      if (e.defaultPrevented) return;
      const knoten = e.target?.closest?.('[data-qb-rating="s"]');
      if (!knoten) return;
      aufSprung(e);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [aufSprung]);
}

export function GoogleRezensionenBereich({dataSection, mitAnker = true}) {
  /* Sektions-Marker NUR zusammen mit dem Anker: das Fallback-Popup rendert
     denselben Bereich mit mitAnker=false und darf nicht zum eigenen
     Sprungziel werden — gleiche Regel wie „nie zwei Anker-IDs im Dokument". */
  return (
    <section
      id={mitAnker ? GOOGLE_REZENSIONEN_ANKER_ID : undefined}
      className="GoogleRezensionenBereich NormalSectionSize"
      {...(mitAnker ? {[REVIEWS_SEKTION_ATTR]: ''} : {})}
      {...(dataSection ? {'data-section': dataSection} : {})}
    >
      <h2 className="GoogleRezensionenBereich-titel">
        Über 14.000 zufriedene Kunden – entscheide dich jetzt!
      </h2>
      <ReputonWidget />
    </section>
  );
}

/*
 * Fallback-Popup: zeigt GENAU denselben Bereich, wenn die aktuelle Seite
 * keinen Rezensionsbereich trägt (Auftrag Punkt 3). Portal auf <body>,
 * weil der Header (fixed + transform beim Ausblenden) sonst der Containing
 * Block wäre. mitAnker=false — nie zwei Anker-IDs im Dokument.
 */
export function GoogleRezensionenPopup({offen, onSchliessen}) {
  useEffect(() => {
    if (!offen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onSchliessen();
    };
    document.addEventListener('keydown', onKey);
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = vorher;
    };
  }, [offen, onSchliessen]);

  if (!offen || typeof document === 'undefined') return null;

  return createPortal(
    /* Backdrop-Klick schließt; Tastatur-Äquivalent ist der dokumentweite
       Escape-Listener oben + der fokussierbare Schließen-Button. */
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      className="GoogleRezensionenPopup"
      role="dialog"
      aria-modal="true"
      aria-label="Google-Rezensionen von Qi Blanco"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSchliessen();
      }}
    >
      <div className="GoogleRezensionenPopup-inhalt">
        <button
          type="button"
          className="GoogleRezensionenPopup-close"
          aria-label="Schließen"
          onClick={onSchliessen}
        >
          ×
        </button>
        <GoogleRezensionenBereich mitAnker={false} />
      </div>
    </div>,
    document.body,
  );
}
