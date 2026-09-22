/*
 * StandardSlider — die EINE Hülle des Haus-Sliders (Bausatz/Component Library).
 *
 * ANLASS, Christian am 2026-09-21: „Bei ‚Erholsame Naechte' haben wir auch noch
 * einen Slider. Der gefaellt mir optisch am besten, und das sollte unser
 * Standard sein für alle Slider." Und am 2026-09-22 zum Studienblock: „Hier
 * den Standard einfügen wie bei den Bewertungen."
 *
 * WARUM ES DIESE DATEI GIBT — die Sackgasse, die sie aufloest. Der
 * Registry-Eintrag `qb-standard-slider` hält seit dem 2026-09-21 fest:
 * „DER STANDARD IST KEINE KOMPONENTE ZUM IMPORTIEREN, sondern ein Markup- und
 * Bedien-Vertrag … Wer ‚auf den Standard ziehen' als ‚InfoSlider importieren'
 * liest, läuft in eine Sackgasse." Das stimmte und stimmt für
 * `index-components/InfoSlider.jsx`: der ist ein INHALTS-Baustein
 * (cardCount = 5 als harte Konstante, fünf Karten als Literale im JSX, eine
 * einzige Prop). Ein Vertrag, den jeder von Hand abschreibt, wird aber genau
 * so oft abgeschrieben, wie er gebraucht wird — GEMESSEN am 2026-09-22 stand
 * das Bedien-Markup DREIMAL unabhängig im Baum: InfoSlider.jsx,
 * UpsellLineUp.jsx, ReputonWidget.jsx. Der Studienblock wäre die vierte
 * Abschrift geworden.
 *
 * Deshalb wird aus dem Vertrag hier eine Vorlage: EINE Definition der Bühne
 * (`.InfoSlider`), des Fortschrittsbalkens (`.ProgressWrapper`) und der zwei
 * Pfeile (`.SliderButtonWrapper`). Die CSS-Klassen bleiben die des Bestands —
 * sie stehen ungescopt in app/styles/app.css und werden NICHT umbenannt: eine
 * Umbenennung wäre ein zweites Klassensystem neben dem, das schon trägt.
 *
 * ZWEI BAUARTEN, weil es im Haus zwei gibt:
 *   variante="transform" (Voreinstellung) — index-basierte Bahn, die per
 *     translateX geschoben wird. Die Bühne maskiert (`overflow: hidden`) und
 *     überlässt dem Hook die waagerechte Geste (`touch-action: pan-y`).
 *   variante="scroll" — die Bahn scrollt SELBST (`overflow-x: auto` +
 *     scroll-snap). Dafür setzt der Modifier `.InfoSlider--scroll` genau die
 *     drei Zusagen der Transform-Bühne zurück, die hier schaden würden:
 *     `overflow: hidden` (beschnitte Kartenschatten und Snap-Polster),
 *     `touch-action: pan-y` (nimmt der Bahn das Fingerwischen — das ist
 *     GENAU der Mangel, den Christian gemeldet hat) und `user-select: none`
 *     (eine Bahn aus Text und Links darf markierbar bleiben).
 *
 * DIE BEDIENUNG IST ABSCHLIESSEND, NICHT ADDITIV. Wer diese Hülle nimmt,
 * nimmt Fortschrittsbalken UND zwei Pfeile — und legt seine eigenen
 * Bedienelemente AB, statt sie danebenzustellen. Am 2026-09-22 sind am
 * Bewertungsblock zwei Leisten uebereinander entstanden, weil ein für sich
 * richtiger Zusatz auf vier schon vorhandene Bedienelemente gesetzt wurde.
 * Der Standard zeigt zwei Bedienelemente; das ist der ganze Unterschied.
 *
 * Die Hülle rendert BEWUSST kein aeusseres Element: der umgebende Block
 * (`.NormalSectionSize`, `.ghx-studien`, …) und sein `data-section`-Anker
 * gehören dem Aufrufer und dürfen durch den Umbau keine Ebene wandern.
 */

/* Die Pfeil-Grafik des Standards. Eine Definition, zwei Knoepfe — die Richtung
   macht `.SliderButtonWrapper .ButtonPrev/.ButtonNext` per Drehung in app.css,
   nicht ein zweites SVG. */
function StandardSliderPfeil() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <path fill="currentColor" d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z" className="clr-i-outline clr-i-outline-path-1"/>
      <path fill="none" d="M0 0h36v36H0z"/>
    </svg>
  );
}

/**
 * @param {object} props
 * @param {'transform'|'scroll'} [props.variante]  Bauart der Bahn.
 * @param {number} [props.fortschritt]             0..100, Breite des Balkens.
 * @param {() => void} [props.onPrev]
 * @param {() => void} [props.onNext]
 * @param {string} [props.prevLabel]               aria-label des linken Knopfs.
 * @param {string} [props.nextLabel]               aria-label des rechten Knopfs.
 * @param {string} [props.buehneKlasse]            Zusatzklassen der Bühne (z. B. 'is-dragging').
 * @param {object} [props.buehneAttribute]         role/aria/Drag-Handler der Bühne.
 * @param {string} [props.bahnKlasse]              Klassen der Bahn; Vorgabe 'InfoSliderTrack'.
 * @param {object} [props.bahnRef]
 * @param {object} [props.bahnStil]
 * @param {object} [props.bahnAttribute]           role/aria/tabIndex/Handler der Bahn.
 * @param {React.ReactNode} props.children         die Karten.
 */
export function StandardSlider({
  variante = 'transform',
  fortschritt = 0,
  onPrev,
  onNext,
  prevLabel = 'Vorheriger Slide',
  nextLabel = 'Nächster Slide',
  buehneKlasse = '',
  buehneAttribute = {},
  bahnKlasse = 'InfoSliderTrack',
  bahnRef = null,
  bahnStil,
  bahnAttribute = {},
  children,
}) {
  const buehne =
    'InfoSlider' +
    (variante === 'scroll' ? ' InfoSlider--scroll' : '') +
    (buehneKlasse ? ' ' + buehneKlasse : '');

  return (
    <>
      <div className={buehne} {...buehneAttribute}>
        <div className={bahnKlasse} ref={bahnRef} style={bahnStil} {...bahnAttribute}>
          {children}
        </div>
      </div>
      <div className="ProgressWrapper">
        <div className="ProgressTracker" style={{width: fortschritt + '%'}}></div>
      </div>
      <div className="SliderButtonWrapper">
        <button type="button" onClick={onPrev} className="ButtonPrev SliderButton" aria-label={prevLabel}><StandardSliderPfeil /></button>
        <button type="button" onClick={onNext} className="ButtonNext SliderButton" aria-label={nextLabel}><StandardSliderPfeil /></button>
      </div>
    </>
  );
}
