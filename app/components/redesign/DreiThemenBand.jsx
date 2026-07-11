import {THEMEN} from '~/lib/redesign3themen';

/**
 * DreiThemenBand (Konzept B4.1): kompakter Streifen „Wirkt auf drei Ebenen" —
 * drei typografische Chips (icon-frei), je mit Beweis-Mikrozahl + Link.
 * Das via `aktiv` markierte Thema (z.B. 'schlaf' auf der Schlaf-LP) wird
 * hervorgehoben und OHNE Link gerendert (man ist bereits dort).
 *
 * @param {{dataSection?: string, aktiv?: string}} props
 */
export function DreiThemenBand({dataSection, aktiv}) {
  return (
    <section className="rd3-band" data-section={dataSection}>
      <div className="rd3-band__inner">
        <span className="rd3-band__label">Wirkt auf drei Ebenen</span>
        <ul className="rd3-band__chips">
          {THEMEN.map((thema) => {
            const istAktiv = aktiv === thema.id;
            const inhalt = (
              <>
                <span className="rd3-band__chip-titel">{thema.titel}</span>
                <span className="rd3-band__chip-zahl">{thema.beweisZahl}</span>
              </>
            );
            return (
              <li
                key={thema.id}
                className={`rd3-band__chip${
                  istAktiv ? ' rd3-band__chip--aktiv' : ''
                }`}
              >
                {istAktiv ? (
                  <span className="rd3-band__chip-inner" aria-current="true">
                    {inhalt}
                  </span>
                ) : (
                  <a className="rd3-band__chip-inner" href={thema.link}>
                    {inhalt}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
