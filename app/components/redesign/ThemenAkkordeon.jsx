import {useState} from 'react';
import {THEMEN} from '~/lib/redesign3themen';

/**
 * ThemenAkkordeon (Konzept B3, Pos 2): horizontal expandierendes 3-Panel-
 * Bild-Akkordeon. Desktop flex mit flex-grow-Transition, Panel-Wechsel per
 * Klick UND Hover; Mobile (<768px, via CSS) vertikal gestapelt, tap-to-expand.
 * Panel 1 ist default offen. mechanismusText erscheint nur im offenen Zustand.
 *
 * Accessibility: die Panel-Kopfzeile ist ein <button> mit aria-expanded, das
 * die Sektion oeffnet/wechselt (tastatur-bedienbar). Der „Mehr erfahren"-Link
 * steht als eigener <a> AUSSERHALB des Buttons (kein verschachteltes
 * interaktives Element). Bei prefers-reduced-motion schaltet das CSS alle
 * Transitions ab (statisches 3er-Grid).
 *
 * Client-Komponente (useState) ohne Loader.
 *
 * @param {{dataSection?: string}} props
 */
export function ThemenAkkordeon({dataSection}) {
  const [offen, setOffen] = useState(THEMEN[0].id);

  return (
    <section className="rd3-akk-section" data-section={dataSection}>
      <div className="rd3-akk" role="group" aria-label="Drei Wirk-Themen">
        {THEMEN.map((thema) => {
          const istOffen = offen === thema.id;
          return (
            <div
              key={thema.id}
              className={`rd3-akk-panel${
                istOffen ? ' rd3-akk-panel--offen' : ''
              }`}
              onMouseEnter={() => setOffen(thema.id)}
            >
              <button
                type="button"
                className="rd3-akk-panel__btn"
                aria-expanded={istOffen}
                onClick={() => setOffen(thema.id)}
                onFocus={() => setOffen(thema.id)}
              >
                <img
                  className="rd3-akk-panel__img"
                  src={thema.bild}
                  alt={thema.alt}
                  loading="lazy"
                />
                <span className="rd3-akk-panel__scrim" aria-hidden="true" />
                <span className="rd3-akk-panel__content">
                  <span className="rd3-akk-panel__titel">{thema.titel}</span>
                  <span className="rd3-akk-panel__beweis">
                    <span className="rd3-akk-panel__zahl">
                      {thema.beweisZahl}
                    </span>
                    <span className="rd3-akk-panel__label">
                      {thema.beweisLabel}
                    </span>
                  </span>
                  <span className="rd3-akk-panel__text">
                    {thema.mechanismusText}
                  </span>
                </span>
              </button>
              <a className="rd3-akk-panel__link" href={thema.link}>
                Mehr erfahren
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
