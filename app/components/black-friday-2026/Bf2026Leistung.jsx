import {BF2026_LEISTUNG} from './bf2026-texte';

/*
 * LEISTUNGSGRAFIK (Visualisierung 2): drei Stufen von innen nach außen, Zelle ·
 * Schutz · Quantenfeld. Ruhig und ohne Bewegung, Linien im einen Gold. Die Sätze
 * stehen als Liste daneben, die Grafik ist für Screenreader ausgeblendet.
 */
export function Bf2026Leistung() {
  return (
    <section className="as-sektion bf-leistung" data-section="bf-leistung">
      <h2 className="as-h2">{BF2026_LEISTUNG.titel}</h2>
      <div className="bf-leistung-raster">
        <svg className="bf-leistung-grafik" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <circle className="bf-ring bf-ring--feld" cx="200" cy="200" r="184" />
          <circle className="bf-ring bf-ring--feld" cx="200" cy="200" r="150" />
          <circle className="bf-ring bf-ring--schutz" cx="200" cy="200" r="104" />
          <circle className="bf-kern" cx="200" cy="200" r="44" />
          <text className="bf-marke bf-marke--kern" x="200" y="200">1</text>
          <circle className="bf-punkt" cx="200" cy="96" r="18" />
          <text className="bf-marke" x="200" y="96">2</text>
          <circle className="bf-punkt" cx="200" cy="16" r="16" />
          <text className="bf-marke" x="200" y="16">3</text>
        </svg>
        <ol className="bf-stufen">
          {BF2026_LEISTUNG.stufen.map((satz, i) => (
            <li key={satz} className="bf-stufe">
              <span className="bf-stufe-zahl" aria-hidden="true">
                {i + 1}
              </span>
              <span className="bf-stufe-satz">{satz}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
