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
 * keine Restmenge, kein „nur noch heute". Der Negativ-Arm A7 der Abnahme-Probe
 * wird rot, wenn es doch jemand einbaut.
 *
 * NACHTRAG 2026-09-16 — DER TEXT IST JETZT CHRISTIANS FASSUNG, und eine Zeile
 * dieses Kommentars war vorher weiter als der Code: hier stand zusätzlich
 * „kein Ausrufezeichen in der Überschrift". Nachgemessen am Arm selbst
 * (probe_produktseite_live.py, VERBOTEN) prüft A7 ausschließlich die vier
 * Verknappungsmuster oben — ein Ausrufezeichen fällt durch keines davon. Die
 * Überschrift trägt seit heute Christians Ausrufezeichen; A7 bleibt grün. Wer
 * den alten Satz liest und daraus eine Sperre ableitet, sperrt etwas, das nie
 * gesperrt war.
 *
 * DIE ZAHLEN IM ANGEBOTSSATZ RECHNET DIESE DATEI WEITERHIN NICHT: „spare
 * 2.650 € bei einem Rabatt von 24,9 %" kommt als `treppe.angebot` aus
 * ~/lib/qi-master-preisstufen — dieselbe Quelle wie die Tabelle darunter.
 */

/**
 * @param {{
 *   treppe: {
 *     zeilen: Array<{id: string, prozent: number, zeitraum: string,
 *                    preisText: string, ersparnisText: string,
 *                    satzText: string, aktiv: boolean}>,
 *     aktivId: string|null,
 *     vorlaufHinweis: string,
 *     angebot: {id: string, satzText: string, ersparnisText: string,
 *               preisText: string}|null,
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
  const {zeilen, vorlaufHinweis, angebot} = treppe;

  return (
    <section
      className={`qm-treppe${kompakt ? ' qm-treppe--kompakt' : ''}`}
      aria-labelledby={titelId}
    >
      <h3 id={titelId} className="qm-treppe__titel">
        Hole dir jetzt ein einmaliges Angebot, das es danach nie wieder geben
        wird!
      </h3>

      <p className="qm-treppe__grund">
        Den Qi Master® wird es nie in einem Sale geben wie Black Friday, Sommer
        Sale oder ähnliches. Durch seine sehr aufwendige Herstellung ist der
        Preis fixiert. Jeder Qi Master® wird von Spezialisten mit
        jahrzehntelanger Erfahrung Stück für Stück durch die Fertigung
        begleitet. Die finale Politur wird per Hand von Goldschmieden mit
        meisterhafter Genauigkeit durchgeführt. Dadurch können wir stolz von
        einer Herstellqualität sprechen, die weltweit den höchsten Standard
        übertrifft.
      </p>

      <p className="qm-treppe__herkunft">Designed in Germany. Made in Germany.</p>

      {vorlaufHinweis ? (
        <p className="qm-treppe__vorlauf">{vorlaufHinweis}</p>
      ) : null}

      <table className="qm-treppe__tabelle">
        {/* Die Beschriftung bleibt der zugängliche Name der Tabelle, steht
            aber nicht mehr als sichtbarer Satz über ihr: der sichtbare Text
            über der Tabelle ist seit 2026-09-16 Christians Fassung. Löschen
            wäre kein Textumbau, sondern ein Rückschritt für Screenreader. */}
        <caption className="qm-treppe__caption qm-treppe__caption--nur-sr">
          Die Vorverkaufstreppe des Qi Master® — alle vier Stufen und der
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

      {angebot ? (
        <p className="qm-treppe__angebot">
          Sichere dir jetzt dieses einmalige Angebot zum Spitzenpreis und spare{' '}
          {`${angebot.ersparnisText} €`} bei einem Rabatt von{' '}
          {`${angebot.satzText} %`}. Unser höchster Rabatt, den wir jemals
          gegeben haben. Exklusiv für unsere treuesten Kunden.
        </p>
      ) : null}

      <p className="qm-treppe__versand">
        Inklusive zu 100 % versichertem weltweitem Versand. Versand startet ab
        Mitte Januar 2027.
      </p>
    </section>
  );
}

export default QiMasterTreppe;
