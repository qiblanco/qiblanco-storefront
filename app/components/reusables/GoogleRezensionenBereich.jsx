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

/** Scroll-Ziel des 4,8-Klicks: eigener Anker, sonst das Bestands-Widget
 *  (deckt die LPs ab, die den ReputonWidget schon ohne Anker tragen —
 *  stabiler Marker dort ist der GoogleRatingBadge, seit PR #149 gibt es
 *  keinen .reputon-google-reviews-widget-Container mehr). */
export function findeRezensionsZiel() {
  if (typeof document === 'undefined') return null;
  return (
    document.getElementById(GOOGLE_REZENSIONEN_ANKER_ID) ||
    document.querySelector('.google-rating-badge')
  );
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
