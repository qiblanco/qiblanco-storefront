import {useEffect, useId, useRef} from 'react';
import {createPortal} from 'react-dom';
import {TEILZAHLUNG_TEXT} from './the-alpha-shop-daten';

/*
 * FENSTER DER GETEILTEN ZAHLUNG (Christian 27.10.2026 Z1: „wenn einer auf
 * Ratenzahlung klickt, dass dann Fenster aufgeht und dass man dann sagt …
 * Ratenzahlung nur bis 10.000 Euro“; Z2: „das ist ein Zwei-Stufen-Prozess
 * und du musst jetzt zwei Rechnungen der Reihe nach bezahlen“). Grossjob
 * 20261027-qi-alpha-geteilte-zahlung-10000-raten-rest-sofort, s03.
 *
 * Zeigt die Aufteilung der gewählten Konfiguration (Gesamt -> in Raten +
 * sofort), die zwei Schritte in Christians Reihenfolge und führt mit EINEM
 * Knopf in den Schritt-1-Checkout (nur der Ratenanteil, routes/cart.$lines).
 *
 * EBENE (HB-OVERLAY-0001): das Fenster hängt per Portal direkt an <body>,
 * nicht im Baum der Kaufseite. Die Galerie dort steht `position: sticky`,
 * und jeder Vorfahr mit transform/filter/contain würde ein `position: fixed`
 * einfangen. Vorhang und Fenster tragen GEMEINSAM var(--z-dialog)
 * (styles/overlay-ordnung.css). Gemessen wird Rect gegen Rect im Sicht-Tor.
 *
 * BEDIENUNG wie das Video-Fenster (reusables/ProduktVideos.jsx): Kreuz, Esc
 * und Klick daneben schließen; Tab bleibt im Fenster; der Fokus geht danach
 * auf den Auslöser zurück; der Seitenhintergrund scrollt nicht mit.
 * Kein eigener Pixel-Code: der Knopf ist ein Link, der Warenkorb entsteht auf
 * dem Server (Begründung im Kopf von lib/qi-alpha-teilzahlung.js).
 */
export function TeilzahlungFenster({teilung, betrag, link, onClose}) {
  const fensterRef = useRef(null);
  const titelId = useId();
  const T = TEILZAHLUNG_TEXT.fenster;

  useEffect(() => {
    const ausloeser = document.activeElement;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Fokus aufs Fenster selbst (tabIndex -1): der Leser startet beim Titel,
    // Tab führt zum Kreuz und zum Knopf.
    fensterRef.current?.focus({preventScroll: true});
    function taste(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !fensterRef.current) return;
      const ziele = [
        ...fensterRef.current.querySelectorAll('button, a[href]'),
      ].filter((el) => !el.disabled && el.getClientRects().length > 0);
      if (!ziele.length) return;
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    }
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('keydown', taste);
      document.body.style.overflow = vorher;
      if (ausloeser && typeof ausloeser.focus === 'function') {
        ausloeser.focus({preventScroll: true});
      }
    };
  }, [onClose]);

  const raten = betrag(teilung.raten);
  const sofort = betrag(teilung.sofort);
  // Anteil der Raten am Ganzen, für den Balken (auf ganze Prozent).
  const anteil = Math.round((teilung.raten / teilung.gesamt) * 100);

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="qat-ebene"
      data-qat-ebene=""
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={fensterRef}
        className="qat-fenster"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titelId}
        tabIndex={-1}
        data-qat-fenster=""
      >
        <button
          type="button"
          className="qat-zu"
          aria-label={T.schliessen}
          data-qat-zu=""
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id={titelId} className="qat-titel">
          {T.titel}
        </h2>

        <div className="qat-aufteilung">
          <p className="qat-gesamt">
            <span>{T.gesamt}</span>
            <span data-qat-gesamt="">{betrag(teilung.gesamt)}</span>
          </p>
          <div
            className="qat-balken"
            style={{'--qat-anteil': `${anteil}%`}}
            aria-hidden="true"
          >
            <span className="qat-balken-raten" />
            <span className="qat-balken-sofort" />
          </div>
          <dl className="qat-teile">
            <div className="qat-teil qat-teil--raten">
              <dt>{TEILZAHLUNG_TEXT.raten}</dt>
              <dd data-qat-raten="">{raten}</dd>
            </div>
            <div className="qat-teil qat-teil--sofort">
              <dt>{TEILZAHLUNG_TEXT.sofort}</dt>
              <dd data-qat-sofort="">{sofort}</dd>
            </div>
          </dl>
        </div>

        <ol className="qat-schritte">
          {T.schritte.map((s, i) => (
            <li key={s.marke} className="qat-schritt">
              <span className="qat-nr" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="qat-marke">{s.marke}</p>
                <h3 className="qat-schritt-titel">
                  {s.titel(i === 0 ? raten : sofort)}
                </h3>
                <p className="qat-schritt-text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="qat-zusagen">
          <p>{T.versand}</p>
          <p>{T.rechnungen}</p>
        </div>

        <div className="qat-fuss">
          <a
            className="btn--primary qat-knopf"
            href={link}
            data-qat-schritt1=""
            data-qb-kaufknopf=""
          >
            {T.knopf(raten)}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default TeilzahlungFenster;
