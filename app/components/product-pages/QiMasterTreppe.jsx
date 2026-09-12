/**
 * QiMasterTreppe — die Vorverkaufstreppe als EIN Baustein.
 *
 * Steht auf ZWEI Flächen: im `priceLabel`-Slot der Produktseite
 * /products/qi-master (zwischen Preiszeile und Kaufknopf) und auf der
 * Landingpage /pages/qi-master-vorverkauf. Beide bekommen dieselben Zahlen aus
 * demselben Aufruf — `treppe()` aus ~/lib/qi-master-preisstufen, gespeist aus
 * app/data/qi-master-preisstufen.json.
 *
 * RECHNET NICHTS. Die Komponente bekommt fertige Zeilen und stellt sie dar.
 * Wer hier anfängt zu rechnen, hat die zweite Wahrheit gebaut.
 *
 * WIRD SERVERSEITIG GERENDERT: die Zeilen kommen aus dem Loader, nicht aus
 * einem Effekt. Nur so steht die laufende Stufe im ausgelieferten HTML — und
 * nur so kann die Abnahme-Probe sie am Rand überhaupt sehen.
 *
 * WAS HIER AUSDRÜCKLICH NICHT STEHT (Auftrag, wörtlich): keine Countdown-Uhr,
 * keine Restmenge, kein „nur noch heute", kein Ausrufezeichen in der
 * Überschrift. Der Negativ-Arm A7 der Abnahme-Probe wird rot, wenn es doch
 * jemand einbaut.
 */

/**
 * @param {{
 *   treppe: {
 *     zeilen: Array<{id: string, prozent: number, zeitraum: string,
 *                    preisText: string, ersparnisText: string,
 *                    satzText: string, aktiv: boolean}>,
 *     aktivId: string|null,
 *     vorlaufHinweis: string,
 *     spannweiteText: string,
 *   },
 *   titelId?: string,
 *   kompakt?: boolean,
 * }} props
 *
 * `kompakt` schaltet nur die Dichte um (Produktseite: neben dem Kaufknopf,
 * wenig Platz; Landingpage: eigener Abschnitt). Es ändert KEINE Zahl und
 * KEINEN Satz — sonst trüge die Fläche eine eigene Aussage.
 */
export function QiMasterTreppe({treppe, titelId = 'qm-treppe-titel', kompakt = false}) {
  const {zeilen, vorlaufHinweis, spannweiteText} = treppe;

  return (
    <section
      className={`qm-treppe${kompakt ? ' qm-treppe--kompakt' : ''}`}
      aria-labelledby={titelId}
    >
      <h3 id={titelId} className="qm-treppe__titel">
        Der QiMaster geht nie in eine Rabattaktion.
      </h3>

      <p className="qm-treppe__grund">
        Kein Black Friday, keine Aktion, keine Ausnahme. Ein von Hand
        gefertigtes, nummeriertes Einzelstück hat einen Preis, keinen
        Aktionspreis — wer später kauft, soll nicht das Gefühl haben, zu früh
        gekauft zu haben.
      </p>

      <p className="qm-treppe__ausnahme">
        Bis Ende des Jahres gibt es eine Ausnahme, und sie wird jeden Monat
        kleiner.
      </p>

      {vorlaufHinweis ? (
        <p className="qm-treppe__vorlauf">{vorlaufHinweis}</p>
      ) : null}

      <table className="qm-treppe__tabelle">
        <caption className="qm-treppe__caption">
          Die Vorverkaufstreppe des QiMaster — alle vier Stufen und der
          reguläre Preis danach.
        </caption>
        <thead>
          <tr>
            <th scope="col">Zeitraum</th>
            <th scope="col">Rabatt</th>
            <th scope="col">Preis</th>
            <th scope="col">Ersparnis</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr
              key={z.id}
              className={
                z.aktiv
                  ? 'qm-treppe__zeile qm-treppe__zeile--aktiv'
                  : 'qm-treppe__zeile'
              }
            >
              <th scope="row" data-spalte="Zeitraum">
                {z.zeitraum}
                {z.aktiv ? (
                  <span className="qm-treppe__marke">läuft jetzt</span>
                ) : null}
              </th>
              <td data-spalte="Rabatt">
                {z.prozent > 0 ? `${z.satzText} %` : '—'}
              </td>
              <td data-spalte="Preis">
                <span className="qm-treppe__preis">{`${z.preisText} €`}</span>
              </td>
              <td data-spalte="Ersparnis">
                {z.ersparnisCent === 0 ? '—' : `${z.ersparnisText} €`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {spannweiteText ? (
        <p className="qm-treppe__fazit">
          Wer im September kauft, zahlt{' '}
          <strong>{`${spannweiteText} € weniger`}</strong> als im Dezember.
        </p>
      ) : null}

      <p className="qm-treppe__ende">
        <strong>Ab dem 01.01.2027 gilt dauerhaft der reguläre Preis</strong> —
        und danach gibt es keine Aktion mehr.
      </p>

      <p className="qm-preishinweis">
        Alle Preise inkl. 19 % MwSt., inklusive versichertem weltweitem Versand
        mit UPS.
      </p>
    </section>
  );
}

export default QiMasterTreppe;
