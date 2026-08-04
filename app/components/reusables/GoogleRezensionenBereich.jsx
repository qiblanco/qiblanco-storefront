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

/** Scroll-Ziel des 4,8-Klicks, in Reihenfolge der Nähe zum Nutzer-Wunsch:
 *  1. die obere „Beeindruckende Kundenerfahrungen"-Sektion (Shop-Seiten/LPs),
 *  2. sonst der Rezensionsbereich (organische PDPs tragen NUR diesen),
 *  3. sonst das Bestands-Widget über den GoogleRatingBadge (LPs ohne Anker;
 *     seit PR #149 gibt es keinen .reputon-google-reviews-widget-Container). */
export function findeRezensionsZiel() {
  if (typeof document === 'undefined') return null;
  return (
    document.getElementById(GOOGLE_KUNDENERFAHRUNGEN_ANKER_ID) ||
    document.getElementById(GOOGLE_REZENSIONEN_ANKER_ID) ||
    document.querySelector('.google-rating-badge')
  );
}

/**
 * Kopf-Höhe LIVE messen statt hart zu kodieren: der Mobil-Kopf ist niedriger
 * als der Desktop-Kopf, und das schwarze Banner verschwindet beim Scrollen.
 * Ein fester Wert (bisher `scroll-margin-top: 150px`, Desktop-Maß) sitzt auf
 * 360–414 px zwangsläufig daneben. Gemessen wird die Unterkante aller
 * tatsächlich oben klebenden fixed/sticky-Kopfelemente.
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
    if (kasten.height > 0 && kasten.top <= 5) {
      unten = Math.max(unten, kasten.bottom);
    }
  }
  return unten;
}

/** Scrollt das Ziel unter den Kopf — mit gemessenem, NICHT geerbtem Offset.
 *  Ersetzt scrollIntoView({block:'start'}), das den fixen Kopf ignoriert. */
export function scrolleZuRezensionen(ziel) {
  if (!ziel || typeof window === 'undefined') return;
  const abstand = 12; // kleine Luft, damit die Überschrift nicht klebt
  const zielOben = ziel.getBoundingClientRect().top + window.scrollY;

  /*
   * Der Kopf blendet sich beim ABWÄRTS-Scrollen selbst aus (Header.jsx
   * scroll-hide ab 100 px) und beim Aufwärts-Scrollen wieder ein. Deshalb
   * ist die richtige Korrektur richtungsabhängig — ein pauschaler Abzug
   * (oder das feste `scroll-margin-top: 150px`) erzeugt sonst genau das
   * Doppel-Offset, das der Auftrag ausschließt:
   *   • abwärts (Normalfall: Klick oben im Banner) → Kopf ist am Ziel weg,
   *     die Überschrift gehört an den oberen Rand (gemessen kopfUnten = 0),
   *   • aufwärts → Kopf bleibt stehen und verdeckt sonst die Überschrift.
   */
  const nachUnten = zielOben > window.scrollY;
  const kopf = nachUnten ? 0 : messeKopfHoehe();

  window.scrollTo({
    top: Math.max(0, zielOben - kopf - abstand),
    behavior: 'smooth',
  });
}

export function GoogleRezensionenBereich({dataSection, mitAnker = true}) {
  return (
    <section
      id={mitAnker ? GOOGLE_REZENSIONEN_ANKER_ID : undefined}
      className="GoogleRezensionenBereich NormalSectionSize"
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
