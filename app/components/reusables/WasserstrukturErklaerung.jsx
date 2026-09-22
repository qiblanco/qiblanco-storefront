import {ErklaerPopup} from './ErklaerPopup';
import {BildWinkel, BildStruktur, BildDomaene} from './WasserstrukturBilder';
import {wasserstruktur} from '~/data/kohaerente-wasserstruktur';

/**
 * DER ERKLÄR-KNOPF „kohärenten Wasserstruktur" — einmal gebaut, zweimal
 * ausgeliefert (Startseite und /pages/schlaf-zellen-schutz).
 *
 * WARUM EIN BAUTEIL UND NICHT ZWEI ABSÄTZE: die Erklärung ist an beiden Stellen
 * dieselbe. Als zwei Abschnitte wäre sie zweimal zu pflegen und driftete ab dem
 * Tag, an dem jemand einen davon anfasst — dieselbe Begründung wie beim
 * AbsichtHinweis und beim Autorenkasten.
 *
 * DIE WENDUNG BLEIBT EIN ZUSAMMENHÄNGENDER TEXT. Sie steht als einziges Kind des
 * Auslösers, mit echten Umlauten und ohne Zwischenelement. Segment s01 hat
 * gemessen, dass die Abnahme-Probe sie als geschlossenen Textknoten sucht: wer
 * sie in zwei Spans zerreißt oder auf ASCII umschreibt, macht die Messung
 * dauerhaft blind, und die Blindheit liest sich wie ein Befund.
 *
 * KEINE EIGENE TYPO-SKALA. Die beiden Gastgeberseiten haben eigene
 * Token-Systeme (.home und .lp-a3); ein Baustein mit eigenen Schriftgrößen
 * addierte auf jeder davon Größen und erzeugte genau den Befund, den die
 * Design-Rubrik als „zu viele Schriftgrößen" meldet. Er erbt Größe und Farbe
 * und bringt nur Struktur mit (app/styles/qb-erklaer-popup.css).
 */
export function WasserstrukturErklaerung({wendung = 'kohärenten Wasserstruktur'}) {
  const {titel, einleitung, bilder, gegenueberstellung, einordnung, quelle} =
    wasserstruktur;
  const [winkel, struktur, domaene] = bilder;

  return (
    <ErklaerPopup ausloeser={wendung} titel={titel} ausrichtung="links">
      <span className="qb-erklaer__inhalt" data-wasser-erklaerung>
        <strong className="qb-erklaer__titel">{titel}</strong>
        <span className="qb-erklaer__einleitung">{einleitung}</span>

        <span className="qb-erklaer__bilder">
          <span className="qb-erklaer__bild" data-bild={winkel.id}>
            <BildWinkel von={winkel.von} nach={winkel.nach} />
            <strong className="qb-erklaer__bildtitel">{winkel.titel}</strong>
            <span className="qb-erklaer__bildtext">{winkel.text}</span>
            <span className="qb-erklaer__folge">{winkel.folge}</span>
          </span>

          <span className="qb-erklaer__bild" data-bild={struktur.id}>
            <BildStruktur von={struktur.von} nach={struktur.nach} />
            <strong className="qb-erklaer__bildtitel">{struktur.titel}</strong>
            <span className="qb-erklaer__bildtext">{struktur.text}</span>
            <span className="qb-erklaer__folge">{struktur.folge}</span>
          </span>

          <span className="qb-erklaer__bild" data-bild={domaene.id}>
            <BildDomaene
              schwellen={domaene.schwellen}
              energie={domaene.energie}
            />
            <strong className="qb-erklaer__bildtitel">{domaene.titel}</strong>
            <span className="qb-erklaer__bildtext">{domaene.text}</span>
            <span className="qb-erklaer__werte">
              {domaene.schwellen.map((s) => (
                <span className="qb-erklaer__wert" key={s.was}>
                  <strong>{s.anzeige}</strong> {s.was}
                </span>
              ))}
              <span className="qb-erklaer__wert" key={domaene.energie.was}>
                <strong>{domaene.energie.anzeige}</strong> {domaene.energie.was}
              </span>
            </span>
          </span>
        </span>

        <span className="qb-erklaer__tabelle" role="table" aria-label={titel}>
          <span className="qb-erklaer__zeile qb-erklaer__zeile--kopf" role="row">
            <span className="qb-erklaer__zelle" role="columnheader" />
            <span
              className="qb-erklaer__zelle qb-erklaer__zelle--links"
              role="columnheader"
            >
              {gegenueberstellung.spalteLinks}
            </span>
            <span className="qb-erklaer__zelle" role="columnheader">
              {gegenueberstellung.spalteRechts}
            </span>
          </span>
          {gegenueberstellung.zeilen.map((z) => (
            <span className="qb-erklaer__zeile" role="row" key={z.id}>
              <span className="qb-erklaer__zelle qb-erklaer__zelle--label" role="rowheader">
                {z.label}
              </span>
              <span
                className="qb-erklaer__zelle qb-erklaer__zelle--links"
                role="cell"
              >
                {z.links}
              </span>
              <span className="qb-erklaer__zelle" role="cell">
                {z.rechts}
              </span>
            </span>
          ))}
        </span>

        <span className="qb-erklaer__einordnung">
          <strong>{einordnung.titel}</strong>
          <span>{einordnung.text}</span>
        </span>
        <span className="qb-erklaer__quelle" data-wasser-quelle>
          {quelle}
        </span>
      </span>
    </ErklaerPopup>
  );
}

export default WasserstrukturErklaerung;
