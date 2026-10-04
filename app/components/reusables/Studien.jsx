import {StudienSlider} from '~/components/reusables/StudienSlider';

/*
 * Studien — der Studien-Block der 14 LP-/Produktseiten.
 *
 * ── 2026-08-15, Job 20260814-studien-slider-5-... s03 ───────────────────────
 * Bis hierher stand hier ein hartkodiertes 2x2-GITTER mit vier Studien: vier
 * <h3>, vier PDF-Links, vier <img>, alles als Markup ausgeschrieben. Eine
 * fuenfte Publikation haette bedeutet, dieses Gitter von Hand umzubauen — und
 * dieselbe Arbeit in vier weiteren Dateien noch einmal.
 *
 * Jetzt rendert diese Datei den geteilten <StudienSlider>: dieselbe
 * Kachel-Ansicht wie /pages/exclusive-solutions und /pages/qione-2-pro-2x,
 * gespeist aus `app/data/studien`. Damit erreicht EINE Aenderung an der
 * Registry alle 14 Konsumenten dieser Komponente, ohne dass eine einzige
 * Konsumenten-Datei angefasst werden muss.
 *
 * WAS BEWUSST ERHALTEN BLEIBT (steckt jetzt im Slider):
 *   - der Button "Zelluntersuchungen ansehen" -> /pages/studien
 * Die fette Schlusszeile unter den Kacheln ist am 04.10.2026 gestrichen, die
 * Überschrift im selben Zug auf "Wirkung an Zellkulturen untersucht" gesenkt
 * (Job 20261004-studien-slider-a-h-vollzug-aiceo): e0002 misst an porzinen
 * IPEC-J2-Zellen, "menschliche Zellen" stimmte für diese Arbeit nicht.
 *
 * `data-section` bleibt AUF DIESEM aeusseren Element, exakt dort, wo es vorher
 * stand — der Watch-/Heatmap-Anker von HomepageSections (`dataSection="studien"`)
 * darf durch den Umbau nicht eine Ebene tiefer wandern.
 *
 * `headline` HAT einen Default, aber als echter JS-Default: er greift nur, wenn
 * das Prop WEGGELASSEN wird. Das ist Absicht und gemessen begründet — sechs
 * Konsumenten (ESmogSchutz, Partner, QiOneZellschutz, SchlafZellenSchutz,
 * TieferSchlaf, ZellSchutz) uebergeben `headline=""`, und zwar jeder INNERHALB
 * einer <section>, die schon eine eigene Ueberschrift trägt. Würde man ""
 * auf den Default abbilden, bekaemen diese sechs Seiten eine zweite,
 * doppelte H2. Leeres headline heißt deshalb weiterhin: keine Ueberschrift.
 */
export function Studien({headline = 'Wirkung an Zellkulturen untersucht', dataSection}) {
  return (
    <div className="Studien NormalSectionSize" data-section={dataSection}>
      <StudienSlider headline={headline} />
    </div>
  );
}
