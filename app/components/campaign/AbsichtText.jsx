import {ABSICHT} from '~/data/absicht';

/**
 * DIE VIER GEDANKEN — der Kern der Absicht, EINMAL gebaut.
 *
 * WARUM DAS EIN EIGENES BAUTEIL IST UND NICHT TEIL DER SEITE:
 * Derselbe Text wird an ZWEI Orten gebraucht — auf /pages/warum-qi-blanco als
 * eigene Seite und auf /pages/hypothesen als Abschnitt in der ersten Hälfte.
 * Stünde er in der Seite, gäbe es ihn zweimal, und die zweite Fassung driftet
 * ab dem Tag, an dem jemand eine der beiden anfasst. Als EIN Bauteil kann der
 * Text baulich nicht auseinanderlaufen: eine Änderung wirkt an beiden Orten.
 *
 * Das ist dieselbe Begründung, mit der app/lib/autorenkasten.js den
 * Autorenkasten in die Route statt in den Shopify-`body_html` legt.
 *
 * DIE ÜBERSCHRIFTENEBENE IST EIN PARAMETER, KEINE ANNAHME: auf der eigenen
 * Seite sind die vier Gedanken h2 unter der h1 der Seite. Im Abschnitt auf
 * /pages/hypothesen liegen sie eine Ebene tiefer, weil dort die h2 dem
 * Abschnitt selbst gehört. Eine fest verdrahtete Ebene erzeugte an einem der
 * beiden Orte eine kaputte Dokumentgliederung — und die liest eine Maschine
 * genauso wie ein Screenreader.
 *
 * @param {{ebene?: 2|3}} p
 */
export function AbsichtText({ebene = 2}) {
  const H = ebene === 3 ? 'h3' : 'h2';
  const {bruecke, sprachen, anliegen, einordnung} = ABSICHT;

  return (
    <>
      {/* ------------------------------------------------ Gedanke 1 */}
      <div className="ab-teil ab-teil-erst">
        <H className="ab-h2">{bruecke.titel}</H>
        {bruecke.absaetze.map((p) => (
          <p className="ab-p" key={p.slice(0, 48)}>
            {p}
          </p>
        ))}
      </div>

      {/* ------------------------------------------------ Gedanke 2 */}
      <div className="ab-teil">
        <H className="ab-h2">{sprachen.titel}</H>
        {sprachen.absaetze.map((p) => (
          <p className="ab-p" key={p.slice(0, 48)}>
            {p}
          </p>
        ))}

        <ul className="ab-paare">
          {sprachen.paare.map((paar) => (
            <li className="ab-paar" key={paar.links}>
              <p className="ab-paar-kopf">
                {paar.links}
                <span className="ab-paar-trenner" aria-hidden="true">
                  ·
                </span>
                {paar.rechts}
              </p>
              <p className="ab-paar-text">{paar.gemeinsam}</p>
            </li>
          ))}
        </ul>

        {sprachen.nachsatz.map((p) => (
          <p className="ab-p" key={p.slice(0, 48)} style={{marginTop: '32px'}}>
            {p}
          </p>
        ))}
      </div>

      {/* ------------------------------------------------ Gedanke 3 */}
      <div className="ab-teil">
        <H className="ab-h2">{anliegen.titel}</H>
        {anliegen.absaetze.map((p) => (
          <p className="ab-p" key={p.slice(0, 48)}>
            {p}
          </p>
        ))}
      </div>

      {/* ------------------------------------------------ Gedanke 4 */}
      <div className="ab-teil">
        <H className="ab-h2">{einordnung.titel}</H>
        {einordnung.absaetze.map((p) => (
          <p className="ab-p" key={p.slice(0, 48)}>
            {p}
          </p>
        ))}
      </div>
    </>
  );
}
