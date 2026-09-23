import {BalkenDiagramm} from '../reusables/BalkenDiagramm';

/*
 * Die drei Studien-Diagramme (Startseite, QiOne®- und QiBracelet®-Detailseite).
 *
 * Bis 23.09.2026 waren das drei Bilder (Diagram_Website_1..3.webp) mit den
 * Werten 24,4/95,3 · 6,0/72,2 · 40,0/95,0. Beim Umbau auf wachsende Balken
 * wurden die Werte gegen die Studienseiten geprüft (Job-RESULT „Studienbalken“
 * vom 23.09.2026, Tabelle alt/neu). Jede Zahl unten ist aus der Studie herleitbar:
 *
 * 1 Zellregeneration — Dartsch 2021, Abb. 3 (/pages/studie-darmbarriere):
 *   verbleibende zellfreie Fläche 43,7 % ungeschützt, 14,5 % geschützt,
 *   13,8 % Kontrolle. Geschlossene Fläche = 100 − Rest: 56,3 / 85,5 / 86,2.
 * 2 Barrierefunktion — dieselbe Studie, Abb. 5: TEER relativ zur Kontrolle
 *   6,0 ± 3,2 % ungeschützt, 72,6 ± 14,5 % geschützt.
 * 3 Zellviabilität — Dartsch 2024, Abb. 3A/3B (/pages/studie-oxidativer-stress),
 *   Hep G2: vitale Zellen ohne Schutz ~41 %, mit QiBracelet® ~88 %, aus der
 *   Abbildung abgelesen (deshalb ganzzahlig). Gegenprobe: die Differenz 47
 *   entspricht dem publizierten Schutzeffekt 47,3 ± 7,1 %.
 */
export function ZellDiagramme({dataSection}) {
  return (
    <div className="ZellDiagramme NormalSectionSize" data-section={dataSection}>
      <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p">
        <div className="ZellDiagramm">
          <BalkenDiagramm
            titel={<>Zellregeneration<br />unter E-Smog Stress</>}
            messgroesse={'Geschlossene Fläche nach 8 h, ohne E-Smog 86,2\u00a0%'}
            balken={[
              {bezeichnung: 'Ungeschützt', wert: 56.3, ton: 'ohne'},
              {bezeichnung: 'Mit QiOne® 2 Pro', wert: 85.5, ton: 'mit'},
            ]}
            studieHref="/pages/studie-darmbarriere"
            studieZeile="Studie zu QiOne® 2 Pro mit Darmepithelzellen."
          />
        </div>
        <div className="ZellDiagramm">
          <BalkenDiagramm
            titel={<>Barrierefunktion der Zelle<br />unter E-Smog Stress</>}
            messgroesse={'Barriere-Widerstand, ohne E-Smog = 100\u00a0%'}
            balken={[
              {bezeichnung: 'Ungeschützt', wert: 6.0, ton: 'ohne'},
              {bezeichnung: 'Mit QiOne® 2 Pro', wert: 72.6, ton: 'mit'},
            ]}
            studieHref="/pages/studie-darmbarriere"
            studieZeile="Studie zu QiOne® 2 Pro mit Darmepithelzellen."
          />
        </div>
        <div className="ZellDiagramm">
          <BalkenDiagramm
            titel={<>Zellviabilität<br />unter oxidativem Stress</>}
            messgroesse="Lebende Leberzellen nach 24 Stunden"
            balken={[
              {bezeichnung: 'Ungeschützt', wert: 41, stellen: 0, ton: 'ohne'},
              {bezeichnung: 'Mit QiBracelet®', wert: 88, stellen: 0, ton: 'mit'},
            ]}
            studieHref="/pages/studie-oxidativer-stress"
            studieZeile="Studie zu QiBracelet® mit Leberzellen."
          />
        </div>
      </div>
    </div>
  );
}
