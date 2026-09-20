import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';

/*
 * Bewertungsblock — DER STANDARD-BAUSTEIN (Christian 2026-09-20: „den 1:1 auf
 * der Schlaf-Zellen-Schutz-Seite übernehmen und das beim Homepagebauer als
 * Standard abspeichern … damit ein neu angelegter Bewertungsblock ihn
 * mitbringt").
 *
 * EIN BLOCK, ZWEI HÄLFTEN:
 *   oben  die Kartenreihe        (GoogleReviews)
 *   unten die Google-Zusammenfassung (ReputonWidget) unter der Überschrift
 *         „Alle Google Bewertungen"
 * und beide tragen DASSELBE BREITENSYSTEM, weil sie in DEMSELBEN Wrapper
 * hängen. Genau das ist der Punkt dieses Bausteins.
 *
 * WARUM ES IHN GIBT — die Bauform war bis heute eine HANDKOPIE. Auf der
 * Startseite stehen die beiden Hälften als zwei Geschwister ohne gemeinsamen
 * Eltern, von Hand hingeschrieben (HomepageSections.jsx). Wer den Block
 * woanders wollte, schrieb ihn ab — gemessen am 2026-09-20 an sieben Stellen
 * im Repo. Jede Abschrift ist eine neue Gelegenheit, eine Hälfte zu vergessen.
 *
 * WAS DAS GEKOSTET HAT, gemessen am Live-DOM (Job s01/s02, 2026-09-20):
 * auf /pages/schlaf-zellen-schutz lief die Kartenspur oben 1032 px, unten
 * 1248 px — 108 px Überhang je Seite, Christians „die untere Reihe schwebt
 * außerhalb". Ursache waren drei Sonderregeln, die Fläche, Polsterung und
 * Breite auf [data-section='lp-a-google-reviews'] setzten, also auf die OBERE
 * HÄLFTE ALLEIN; für die untere gab es keine einzige Regel. Dieselbe Bauform
 * steht am selben Tag auf /pages/tiefer-schlaf (Spur 1080 gegen 1280).
 *
 * DIE ZWEITE WURZEL, die man im Stylesheet nicht sieht: die obere Hälfte ist
 * ein <section> (GoogleReviews rendert `GoogleKundenerfahrungen
 * NormalSectionSize`), die untere ein <div>. Eine generische Elementregel wie
 * `.scope section` trifft deshalb NUR EINE der beiden und gibt ihr eine eigene
 * Fläche und Polsterung — die hellere Kachel mitten im Block, Christians
 * „schmaler weißer Kasten". Die Regel sieht symmetrisch aus und ist es nicht.
 *
 * DARAUS DIE BAUREGEL, die dieser Baustein durchsetzt:
 *   Block-Eigenschaften (Fläche, Polsterung, Breite, Abstand) gehören auf den
 *   WRAPPER — nie auf eine Hälfte. Der Abstand zwischen den Hälften kommt aus
 *   dessen `gap`, nicht aus Eigenpolsterung der Hälften.
 * Durchgesetzt am Deploy-Chokepoint: hb-deploy Gate 19
 * (homepage-bauer/src/bewertungsblock_standard.py). Doku:
 * homepage-bauer/SKILL-TRUST-ELEMENTE.md
 *
 * KEINE BEWERTUNG WIRD HIER AUSGEWÄHLT, GEFILTERT ODER ERFUNDEN. Beide
 * Hälften sind die bestehenden, live angebundenen Widgets; die Note und die
 * Anzahl kommen unverändert aus ihnen.
 *
 * `praefix` trägt die data-section-Namen der Seite (Startseite: kein Präfix,
 * LP-Seiten: 'lp-a-'). Sie sind der Schlüssel in verhalten.db — eine
 * Umbenennung hängt die Historie einer Sektion an einen neuen Namen, deshalb
 * werden sie übergeben und nicht vom Baustein vergeben.
 */

export const BEWERTUNGSBLOCK_UEBERSCHRIFT = 'Alle Google Bewertungen';

export function Bewertungsblock({
  praefix = '',
  wrapperKlasse = 'qb-bewertungsblock',
  ueberschrift = BEWERTUNGSBLOCK_UEBERSCHRIFT,
}) {
  return (
    <div className={wrapperKlasse}>
      <GoogleReviews dataSection={`${praefix}google-reviews`} />
      <div className="NormalSectionSize" data-section={`${praefix}reputon-reviews`}>
        <h2 className="text-[1.6rem] sm:text-4xl font-semibold text-center mb-6 mt-2">
          {ueberschrift}
        </h2>
        <ReputonWidget />
      </div>
    </div>
  );
}
