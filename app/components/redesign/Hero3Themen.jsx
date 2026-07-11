import {DREIZEILER, SUBLINE, HERO} from '~/lib/redesign3themen';

/**
 * Hero v2 (Konzept B3, Pos 1): Dreizeiler-H1 + Mechanismus-Subline +
 * EIN goldener Primaer-CTA + Trust-Row. Hero-Bild rechts/hinten ruhig,
 * poster-first geladen (loading="eager", fetchpriority="high") fuer LCP.
 *
 * @param {{dataSection?: string}} props
 */
export function Hero3Themen({dataSection}) {
  return (
    <section className="rd3-hero NormalSectionSize" data-section={dataSection}>
      <div className="rd3-hero__inner">
        <div className="rd3-hero__copy">
          <h1 className="rd3-hero__title">
            {DREIZEILER.map((zeile) => (
              <span className="rd3-hero__title-line" key={zeile}>
                {zeile}
              </span>
            ))}
          </h1>
          <p className="rd3-hero__subline">{SUBLINE}</p>
          <a className="btn--primary rd3-hero__cta" href={HERO.cta.link}>
            {HERO.cta.label}
          </a>
          <ul className="rd3-hero__trust">
            {HERO.trustRow.map((fakt) => (
              <li className="rd3-hero__trust-item" key={fakt}>
                {fakt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rd3-hero__visual">
          <img
            className="rd3-hero__img"
            src={HERO.bild}
            alt={HERO.bildAlt}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
