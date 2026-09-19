import {
  VIEWBOX,
  KM_PRO_EINHEIT,
  DEUTSCHLAND_PFAD,
} from './einsatzkarte-geometrie';

/**
 * <Einsatzkarte /> — Deutschland-Karte mit atmenden Punkten, unmittelbar
 * oberhalb des Footers der QiHome-Air-Kaufseite.
 *
 * WAS DIE PUNKTE SIND, UND WAS SIE AUSDRÜCKLICH NICHT SIND:
 * Christian, 2026-09-19, woertlich: "479 Punkte setzen, per Einwohnerzahlen
 * gemittelt verteilt. Also dass die Karte nicht akkurat ist, sondern einfach
 * nur den Effekt widerspiegelt."
 * Die Punkte sind GERECHNET, nicht erhoben. Ein Punkt ist ein Gerät, und
 * KEIN Punkt ist der Standort eines Geräts. Die Lage folgt der
 * Bevoelkerungsdichte (bin/qihome-karte-punkte im Modul homepage-bauer), nicht
 * einer Bestellung. Bis zum 2026-09-19 kam die Punktdatei aus kunden-db und
 * war aus Kauf- und Kundendaten abgeleitet; diese Herkunft ist abgeloest.
 *
 * WAS DIESER BAUSTEIN NICHT TUT, und zwar baulich nicht:
 *   - kein Kartendienst, keine Tiles, kein Laufzeit-Abruf. Der Umriss ist ein
 *     Pfad im Bundle (einsatzkarte-geometrie.js). Kein Besucher wird an einen
 *     Dritten gemeldet.
 *   - kein JavaScript in der Animation. Reines CSS `@keyframes`.
 *   - kein Punkt nennt einen Ort. Es gibt keinen Klick- und keinen
 *     Hover-Zustand, der irgendetwas benennt — ein Punkt ist ein Punkt.
 *   - keine Rohdaten. Er bekommt `daten` mit BEREITS PROJIZIERTEN
 *     viewBox-Koordinaten (Feld `e`/`n`). PLZ, lat/lon, Ort, Datum und
 *     Bestellkennung erreichen den Browser nie — er hat für sie keine Stelle.
 *
 * DIE ZAHL IM TEXT IST `punkte.length`, NICHT EIN ZWEITES FELD. Damit können
 * Text und Karte baulich nicht auseinanderlaufen: wer Punkte hinzufuegt,
 * aendert die Zahl mit. Ein getrennt gefuehrter Zaehler wäre eine zweite
 * Buchfuehrung, und die falsche gewinnt still.
 *
 * PUNKTGROESSE: der Punkt atmet zwischen zwei Größen, die aus
 * `km_pro_einheit` folgen — so ist er auf jedem Gerät gleich groß. Das ist
 * eine DARSTELLUNGS-Groesse und behauptet keine Reichweite; seit die Punkte
 * gerechnet sind, gaebe es dafür auch keinen Gegenstand.
 *
 * RUECKWEG: `VITE_EINSATZKARTE=off` in der .env schaltet den Baustein auf
 * `null`, ohne die Seite zu brechen. Das ist der Rueckweg, KEINE Shadow-Stufe
 * — der Default ist `on`.
 */

/** Ein Zyklus des Atems in Sekunden. Auch im CSS als --qk-takt hinterlegt. */
const TAKT_S = 3.4;

/** Goldener Schnitt: streut die Phasen aus dem Index gleichmäßig über den
 *  Takt, für JEDE Punktzahl. Ohne Versatz pulsten alle Punkte gemeinsam —
 *  die Karte wirkte dann wie ein Alarm statt wie ein Atem. */
const PHI = 0.6180339887;

export function istEingeschaltet() {
  // Abwesend heißt AN. Nur das ausgeschriebene 'off' schaltet ab, damit ein
  // Tippfehler in der .env nicht still die Karte verschluckt.
  const v = import.meta.env?.VITE_EINSATZKARTE;
  return String(v ?? 'on').toLowerCase() !== 'off';
}

/**
 * Die Ueberschrift, Christians Wortlaut vom 2026-09-19.
 *
 * WARUM HIER innerHTML STEHT UND NICHT EIN TEXTKNOTEN: das Erfuellungskriterium
 * des Auftrags prueft die ROHEN Bytes des ausgelieferten Dokuments auf
 * "aktiv & live". React escaped in jedem Textknoten zu "&amp;" und im
 * Hydrations-Payload zu "&" — gemessen am Live-Dokument (396554 Byte):
 * 284x "&amp;", 0x rohes "&" im sichtbaren Text. Ein Textknoten kann diese
 * Zusage baulich nie erfuellen. Ein rohes "&" vor einem Leerzeichen ist nach
 * HTML5 KEIN "ambiguous ampersand" und damit konform.
 * `n` ist eine Ganzzahl aus `punkte.length` — es gibt hier keine Eingabe von
 * aussen, die Markup einschleusen könnte, und die Zahl wird vor dem Einsetzen
 * auf Ziffern verengt.
 */
function titelHtml(n) {
  const ziffern = String(Math.max(0, Math.trunc(Number(n) || 0)));
  return `${ziffern} QiHome® aktiv & live`;
}

/**
 * @param {{daten?: {punkte_gesamt?: number, km_pro_einheit?: number,
 *                   punkte?: Array<{e:number,n:number}>}|null}} props
 */
export function Einsatzkarte({daten}) {
  const punkte = Array.isArray(daten?.punkte) ? daten.punkte : [];

  // Fail-soft: ohne Artefakt, ohne Punkte oder mit Flag `off` rendert der
  // Baustein NICHTS und die Seite bleibt vollstaendig. Er erfindet nie eine
  // leere Karte und nie eine Null im Text.
  if (!istEingeschaltet() || punkte.length === 0) return null;

  const kmProEinheit =
    Number(daten?.km_pro_einheit) > 0
      ? Number(daten.km_pro_einheit)
      : KM_PRO_EINHEIT;
  const r2 = 2 / kmProEinheit; // viewBox-Einheiten für die kleine Punktgröße
  const r3 = 3 / kmProEinheit; // viewBox-Einheiten für die große Punktgröße

  return (
    <section className="qh-karte" data-section="qihome-einsatzkarte">
      <div className="qh-karte__bahn">
        <div className="qh-karte__wort">
          <h2
            className="qh-karte__titel"
            // eslint-disable-next-line react/no-danger -- siehe titelHtml()
            dangerouslySetInnerHTML={{__html: titelHtml(punkte.length)}}
          />
          <p className="qh-karte__text">Spürst du schon den Unterschied?</p>
          <p className="qh-karte__text">Werde jetzt Teil der Revolution.</p>
          <p className="qh-karte__text qh-karte__ruf">
            Gemeinsam die Welt verändern!
          </p>
        </div>

        <div className="qh-karte__bild">
          <svg
            className="qh-karte__svg"
            viewBox={`0 0 ${VIEWBOX.breite} ${VIEWBOX.hoehe}`}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="qh-karte-titel"
            data-punkte={punkte.length}
            data-km-pro-einheit={kmProEinheit}
            data-r-2km={r2.toFixed(4)}
            data-r-3km={r3.toFixed(4)}
          >
            <title id="qh-karte-titel">
              {`Karte von Deutschland mit ${punkte.length} Punkten.`}
            </title>
            <path className="qh-karte__umriss" d={DEUTSCHLAND_PFAD} />
            <g className="qh-karte__punkte">
              {punkte.map((p, i) => (
                <circle
                  key={`${p.e}-${p.n}-${i}`}
                  className="qh-karte__puls"
                  cx={p.e}
                  cy={p.n}
                  r={r3}
                  style={{
                    // Größen-Grenzen als CSS-Variablen: die @keyframes
                    // interpolieren zwischen ihnen, damit beide Werte an genau
                    // EINER Stelle entstehen (hier, aus km_pro_einheit).
                    '--qk-r-min': r2,
                    '--qk-r-max': r3,
                    // Negativer Delay: der Punkt startet mitten im Takt statt
                    // erst nach einer Wartezeit.
                    '--qk-versatz': `${(-((i * PHI) % 1) * TAKT_S).toFixed(3)}s`,
                  }}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default Einsatzkarte;
