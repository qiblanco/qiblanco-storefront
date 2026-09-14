import {
  VIEWBOX,
  KM_PRO_EINHEIT,
  DEUTSCHLAND_PFAD,
} from './einsatzkarte-geometrie';

/**
 * <Einsatzkarte /> — Deutschland-Karte mit atmenden Standort-Kreisen,
 * unmittelbar oberhalb des Footers der QiHome-Air-Kaufseite.
 *
 * WAS DIESER BAUSTEIN NICHT TUT, und zwar baulich nicht:
 *   - kein Kartendienst, keine Tiles, kein Laufzeit-Abruf. Der Umriss ist ein
 *     Pfad im Bundle (einsatzkarte-geometrie.js). Kein Besucher wird an einen
 *     Dritten gemeldet — genau deshalb faellt Leaflet/MapLibre/Mapbox weg, ihr
 *     tragendes Merkmal wäre hier der Defekt.
 *   - kein JavaScript in der Animation. Reines CSS `@keyframes`.
 *   - keine Rohdaten. Er bekommt `daten` mit BEREITS PROJIZIERTEN
 *     viewBox-Koordinaten (Feld `e`/`n`) und rechnet nichts zurück. PLZ,
 *     lat/lon, Ort, Datum und Bestellkennung erreichen den Browser nie —
 *     der Baustein hat für sie keine Stelle.
 *
 * MASSSTABSTREUE (der eine Punkt, an dem man hier schummeln könnte):
 * Der Kreis waechst von 2 km auf 3 km. Der Radius wird aus
 * `daten.km_pro_einheit` gerechnet, nie als Pixelzahl gesetzt. Ein fester
 * Pixelradius wäre eine ANDERE AUSSAGE (er behauptete eine Entfernung, die
 * es nicht gibt), und er wäre auf jedem Gerät eine andere.
 * Ehrlich dazu: 3 km sind auf einer Deutschlandkarte wenige Pixel. Das ist
 * die richtige Darstellung und nicht ein Mangel. Der einzige zulaessige Hebel
 * gegen "zu klein" ist ein GROESSERER Kartenausschnitt (mehr Bildschirm je
 * Kilometer) — der steht im CSS, nicht hier.
 *
 * ZAHLEN: Die Zahl im Text ist `daten.geraete_gesamt`. Sie ist nie
 * hartkodiert und wird hier nie gerechnet.
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

/** 1234 -> "1.234". Kundensichtbare Zahl in deutscher Schreibweise. */
function zahl(n) {
  return new Intl.NumberFormat('de-DE').format(n);
}

/**
 * @param {{daten?: {geraete_gesamt?: number, km_pro_einheit?: number,
 *                   punkte?: Array<{e:number,n:number,z:number,s?:number}>}|null}} props
 */
export function Einsatzkarte({daten}) {
  const punkte = Array.isArray(daten?.punkte) ? daten.punkte : [];
  const gesamt = Number(daten?.geraete_gesamt) || 0;

  // Fail-soft: ohne Artefakt, ohne Punkte oder mit Flag `off` rendert der
  // Baustein NICHTS und die Seite bleibt vollstaendig. Er erfindet nie eine
  // leere Karte und nie eine Null im Text.
  if (!istEingeschaltet() || punkte.length === 0 || gesamt <= 0) return null;

  // Das Artefakt hat Vorrang: s02 faehrt die Projektion wirklich, die
  // Konstante hier ist nur der Rückfall für ein Artefakt ohne das Feld.
  const kmProEinheit =
    Number(daten?.km_pro_einheit) > 0
      ? Number(daten.km_pro_einheit)
      : KM_PRO_EINHEIT;
  const r2 = 2 / kmProEinheit; // viewBox-Einheiten für 2 km
  const r3 = 3 / kmProEinheit; // viewBox-Einheiten für 3 km

  return (
    <section className="qh-karte" data-section="qihome-einsatzkarte">
      <div className="qh-karte__bahn">
        <div className="qh-karte__wort">
          <h2 className="qh-karte__titel">
            Mindestens {zahl(gesamt)} QiHome Air sind schon in Deutschland.
          </h2>
          <p className="qh-karte__text">
            Jeder Punkt auf der Karte steht für drei Geräte oder mehr.
            Vielleicht ist einer in deiner Nähe. Lass uns gemeinsam die Welt
            updaten.
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
              {`Karte von Deutschland mit ${punkte.length} Standortpunkten.`}
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
                    // Radius-Grenzen als CSS-Variablen: die @keyframes
                    // interpolieren zwischen ihnen, damit die 2/3-km-Werte an
                    // genau EINER Stelle entstehen (hier, aus km_pro_einheit).
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
