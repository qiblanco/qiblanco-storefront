import {ErklaerPopup} from './ErklaerPopup';
import {BildWinkel, BildDomaene, BildStruktur} from './WasserstrukturBilder';
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
 *
 * DIE TABELLE HAT EINE DOM-STRUKTUR, NICHT ZWEI (Fassung 2, 23.09.2026). Sie
 * steht zeilenweise im Markup, so wie ein Screenreader eine Tabelle liest:
 * Merkmal, dann die drei Stufen. Auf dem Handy wird sie per CSS zu drei Karten
 * je Stufe umgeordnet (`--qb-karte` trägt die Reihenfolge, `data-label` das
 * Merkmal über dem Wert). Zwei Fassungen im Markup hätten denselben Inhalt
 * doppelt vorgelesen oder eine davon verstecken müssen.
 */

/** „kein Wert" im SSoT ist `null`: ein Strich, der sagt, dass nichts gemessen ist. */
const KEINE_ANGABE = 'keine Angabe in den Quellen';

export function WasserstrukturErklaerung({wendung = 'kohärenten Wasserstruktur'}) {
  const {titel, einleitung, bilder, stufen, vergleich, einordnung, quelle} =
    wasserstruktur;
  const bild = Object.fromEntries(bilder.map((b) => [b.id, b]));
  const {winkel, domaene, struktur} = bild;
  const stufeZu = Object.fromEntries(stufen.map((s) => [s.id, s]));
  const spalten = vergleich.spalten.map((id) => stufeZu[id]);
  // Reihenfolge der Handy-Karten: je Stufe ein Block, Kopf zuerst.
  const block = vergleich.zeilen.length + 1;

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
            <span className="qb-erklaer__folge">{domaene.folge}</span>
          </span>

          <span className="qb-erklaer__bild" data-bild={struktur.id}>
            <BildStruktur von={struktur.von} nach={struktur.nach} />
            <strong className="qb-erklaer__bildtitel">{struktur.titel}</strong>
            <span className="qb-erklaer__bildtext">{struktur.text}</span>
            <span className="qb-erklaer__folge">{struktur.folge}</span>
          </span>
        </span>

        <span
          className="qb-erklaer__tabelle"
          role="table"
          aria-label={`${titel}: die drei Stufen im Vergleich`}
          data-wasser-stufen={spalten.length}
        >
          <span className="qb-erklaer__zeile qb-erklaer__zeile--kopf" role="row">
            <span
              className="qb-erklaer__zelle qb-erklaer__zelle--ecke"
              role="columnheader"
            />
            {spalten.map((st, s) => (
              <span
                className="qb-erklaer__zelle qb-erklaer__zelle--stufe"
                role="columnheader"
                key={st.id}
                data-stufe={st.id}
                style={{'--qb-karte': s * block}}
              >
                <strong>{st.name}</strong>
                {st.zusatz ? (
                  <span className="qb-erklaer__zusatz">{st.zusatz}</span>
                ) : null}
              </span>
            ))}
          </span>
          {vergleich.zeilen.map((z, f) => (
            <span className="qb-erklaer__zeile" role="row" key={z.feld}>
              <span
                className="qb-erklaer__zelle qb-erklaer__zelle--label"
                role="rowheader"
              >
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
                    data-label={z.label}
                    aria-label={leer ? KEINE_ANGABE : undefined}
                    style={{'--qb-karte': s * block + f + 1}}
                  >
                    {leer ? '–' : wert}
                  </span>
                );
              })}
            </span>
          ))}
        </span>

        <span className="qb-erklaer__einordnung" data-wasser-einordnung>
          <strong>{einordnung.titel}</strong>
          <span>{einordnung.saetze.join(' ')}</span>
        </span>
        <span className="qb-erklaer__quelle" data-wasser-quelle>
          {quelle.map((q) => (
            <span className="qb-erklaer__quellzeile" key={q}>
              {q}
            </span>
          ))}
        </span>
      </span>
    </ErklaerPopup>
  );
}

export default WasserstrukturErklaerung;
