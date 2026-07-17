import {THEMEN} from '~/lib/redesign3themen';
import {BLOCK_PUBLIC, themaLink} from '~/components/reusables/blockLinks';

/**
 * DreiThemenBand (Konzept B4.1): kompakter Streifen „Wirkt auf drei Ebenen" —
 * drei typografische Chips (icon-frei), je mit Beweis-Mikrozahl + Link.
 * Das via `aktiv` markierte Thema (z.B. 'schlaf' auf der Schlaf-LP) wird
 * hervorgehoben und OHNE Link gerendert (man ist bereits dort).
 *
 * @param {{dataSection?: string, aktiv?: string}} props
 */
/*
 * Zwei-Block-IA (Job 20260717-storefront-ia-zweiblock-umbau): der esmog-
 * Chip zeigte im LP-Block auf die PDP (/products/qione-2-pro) = Leak;
 * Ziele kommen jetzt block-abhaengig aus themaLink (blockLinks.js).
 * Default BLOCK_PUBLIC = Datenstand unveraendert (fail-safe).
 */
export function DreiThemenBand({dataSection, aktiv, block = BLOCK_PUBLIC}) {
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
                  <a className="rd3-band__chip-inner" href={themaLink(thema, block)}>
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
