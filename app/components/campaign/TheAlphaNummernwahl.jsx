/*
 * NUMMERNWAHL 1 BIS 111 — das Raster hinter „Freie Auswahl“ der Shopseite
 * /products/the-alpha (Übergabe s03, uebergabe-s06/TheAlphaNummernwahl.jsx,
 * hier ohne eigenen Warenkorbknopf: den trägt die Zusammenfassung).
 *
 * Vergebene Nummern stehen sichtbar als vergeben da und sind nicht wählbar
 * (Shopify-Sperre ODER Christians Liste THE_ALPHA_VERGEBEN); fehlt die
 * Shopify-Variante, ist die Nummer ebenfalls nicht wählbar.
 */
export function TheAlphaNummernwahl({nummern, gewaehlt, onWaehle}) {
  return (
    <div className="tas-raster" role="group" aria-label="Seriennummer frei wählen">
      {nummern.map((x) => {
        const frei = x.status === 'frei';
        return (
          <button
            key={x.n}
            type="button"
            className="tas-nr"
            data-nummer={x.n}
            data-status={x.status}
            disabled={!frei}
            aria-pressed={gewaehlt === x.n}
            aria-label={frei ? `Nummer ${x.n}` : `Nummer ${x.n}, vergeben`}
            onClick={() => onWaehle(x.n)}
          >
            {x.n}
          </button>
        );
      })}
    </div>
  );
}

export default TheAlphaNummernwahl;
