import {useState} from 'react';
import {stufen, vergleich} from '~/data/kohaerente-wasserstruktur';

/**
 * DIE STUFENTAFEL — normales Wasser, kohärente Domäne, EZ-Wasser im Vergleich.
 *
 * Christian, 23.09.2026: „Die Stufentafel gehört auf diese Seite", und für die
 * Info-Seite „Stufenvergleich als interaktive Tafel". Sie stand bis zum
 * 23.09.2026 im Wasserfenster der Landingpages (PR #594) und zog mit PR #602
 * hierher; ihr Raster-CSS (.qb-erklaer__tabelle in qb-erklaer-popup.css) stand
 * seitdem ohne Aufrufer und bekommt hier seinen Aufrufer zurück.
 *
 * KEINE ZAHL IN DIESER DATEI. Jeder Wert kommt aus `stufen` und `vergleich`
 * in app/data/kohaerente-wasserstruktur.js, dem Konsumenten des Brain-SSoT.
 * `null` heißt: keine Quelle sagt dazu etwas, gezeigt wird ein Strich.
 *
 * EINE DOM-STRUKTUR: zeilenweise (Merkmal, dann die drei Stufen), wie ein
 * Screenreader eine Tabelle liest. Auf dem Handy ordnet das CSS die Zellen per
 * `--qb-karte` zu drei Karten je Stufe um.
 *
 * DIE KNÖPFE heben eine Stufe hervor und zeigen den erklärenden Satz dazu.
 * Ohne JavaScript steht die ganze Tafel sichtbar da, keine Zelle hängt an der
 * Wahl.
 */
const KEINE_ANGABE = 'keine Angabe in den Quellen';

export function WasserStufentafel({titel, erklaerung, startStufe = 'ez'}) {
  const [aktiv, setAktiv] = useState(startStufe);
  const stufeZu = Object.fromEntries(stufen.map((s) => [s.id, s]));
  const spalten = vergleich.spalten.map((id) => stufeZu[id]);
  const block = vergleich.zeilen.length + 1;
  const markiert = (id) => (id === aktiv ? 'ja' : undefined);

  return (
    <div className="kw-stufen" data-kw-stufentafel={spalten.length}>
      <ul className="kw-stufen__wahl" aria-label="Stufe hervorheben">
        {spalten.map((st) => (
          <li key={st.id}>
            <button
              type="button"
              className="kw-stufen__knopf"
              aria-pressed={st.id === aktiv}
              onClick={() => setAktiv(st.id)}
            >
              {st.name}
            </button>
          </li>
        ))}
      </ul>
      <p className="kw-stufen__text" aria-live="polite">
        {erklaerung[aktiv]}
      </p>
      <div
        className="qb-erklaer__tabelle"
        role="table"
        aria-label={titel}
        data-wasser-stufen={spalten.length}
      >
        <div className="qb-erklaer__zeile qb-erklaer__zeile--kopf" role="row">
          <span className="qb-erklaer__zelle qb-erklaer__zelle--ecke" role="columnheader" />
          {spalten.map((st, s) => (
            <span
              className="qb-erklaer__zelle qb-erklaer__zelle--stufe"
              role="columnheader"
              key={st.id}
              data-stufe={st.id}
              data-aktiv={markiert(st.id)}
              style={{'--qb-karte': s * block}}
            >
              <strong>{st.name}</strong>
              {st.zusatz ? <span className="qb-erklaer__zusatz">{st.zusatz}</span> : null}
            </span>
          ))}
        </div>
        {vergleich.zeilen.map((z, f) => (
          <div className="qb-erklaer__zeile" role="row" key={z.feld}>
            <span className="qb-erklaer__zelle qb-erklaer__zelle--label" role="rowheader">
              {z.label}
            </span>
            {spalten.map((st, s) => {
              const wert = st[z.feld];
              const leer = wert === null || wert === undefined;
              return (
                <span
                  className={`qb-erklaer__zelle${leer ? ' qb-erklaer__zelle--leer' : ''}`}
                  role="cell"
                  key={st.id}
                  data-stufe={st.id}
                  data-aktiv={markiert(st.id)}
                  data-label={z.label}
                  aria-label={leer ? KEINE_ANGABE : undefined}
                  style={{'--qb-karte': s * block + f + 1}}
                >
                  {leer ? '–' : wert}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
