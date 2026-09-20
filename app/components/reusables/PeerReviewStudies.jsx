/*
 * PeerReviewStudies — der Block „6 Jahre Forschung" mit den drei Kennzahlen
 * der Peer-Review-Zellstudien (75,0 % / 10-fach / 87,1 %).
 *
 * Bis zum 2026-09-19 war das eine lokale Funktion in
 * homepage/HomepageSections.jsx. Christian hat den Block an diesem Tag für
 * /pages/schlaf-zellen-schutz verlangt („das hier löschen und durch das hier
 * ersetzen" — gemeint war genau dieser Startseiten-Block). Er wird ÜBERNOMMEN,
 * nicht nachgebaut: eine Definition, zwei Konsumenten, und eine spätere
 * Korrektur an einer Kennzahl erreicht beide Seiten zugleich (dasselbe Muster
 * wie reusables/Studien). Das Markup ist byte-identisch zur vorherigen
 * Startseiten-Fassung; die Optik hängt an `.PeerReviewStudies*` in app.css.
 *
 * `dataSection` (Default: der Startseiten-Anker "peer-review-studien"): der
 * Watch-/Heatmap-Anker je Seite. Die Startseite übergibt nichts und bleibt
 * damit byte-identisch; eine Landingpage gibt ihren eigenen Anker mit.
 */
export function PeerReviewStudies({dataSection = 'peer-review-studien'}) {
  return (
    <div className='PeerReviewStudies NormalSectionSize text-center' data-section={dataSection}>
      <h2 className='text-center'>
        6 Jahre Forschung
      </h2>
      <p><b>Ergebnisse unserer Peer-Review kontrollierten Zellstudien</b></p>
      <div className="PeerReviewResults">
        <div className="PeerReviewResult">
          <h3>75,0 % Reduktion</h3>
          <p>der Zellbelastung durch oxidativen Stress.</p>
        </div>
        <div className="PeerReviewResult">
          <h3>10-fache Verbesserung</h3>
          <p>der Zell-Barrierefunktion (TEER-Wert).</p>
        </div>
        <div className="PeerReviewResult">
          <h3>87,1 % geringere</h3>
          <p>Zellschädigung und -zerstörung durch<br/>elektromagnetische Strahlung.</p>
        </div>
      </div>
    </div>
  )
}
