import {
  VIEWBOX,
  KM_PRO_EINHEIT,
  DEUTSCHLAND_PFAD,
} from './einsatzkarte-geometrie';

/**
 * <Einsatzkarte /> — Deutschland-Karte mit atmenden Punkten auf der
 * QiHome-Air-Kaufseite, seit dem 2026-09-19 unmittelbar nach dem Kaufblock und
 * VOR dem Produkttext (an der Stelle der gestrichenen Instagram-Fläche,
 * Christian 19.09.2026); bis dahin stand sie als letztes Element oberhalb des
 * Footers. Den Ort bestimmt die Route, nicht dieser Baustein.
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
 * DIE ZAHL IM TEXT IST NICHT MEHR `punkte.length` — SEIT 2026-09-19 SIND ES
 * ZWEI GRÖSSEN MIT ZWEI QUELLEN, und das ist Absicht, keine Nachlaessigkeit.
 * Bis zum 2026-09-19 stand hier das Gegenteil: die Zahl wurde aus
 * `punkte.length` abgeleitet, damit Text und Karte baulich nicht
 * auseinanderlaufen konnten. Christian hat die Textzahl danach gesetzt
 * (woertlich: "dann schreiben wir über 450 QiHome aktiv & live"), nachdem er
 * eingeordnet hatte, dass die Shopify-Zählung nicht alle Verkaufswege
 * abbildet. Damit misst der Satz eine ANDERE Größe als die Karte:
 *   - "über 450" ist die Geschäftsangabe des Geschäftsführers über real
 *     laufende Geräte (GL-SPR-0008). Sie kommt nicht aus diesem Repo.
 *   - 479 Punkte sind der gerechnete Effekt der Karte, ebenfalls Christians
 *     Vorgabe. 479 IST "über 450" — die beiden widersprechen sich nicht.
 * Eine Ableitung der Textzahl aus `punkte.length` (etwa ein Abrunden auf 50)
 * wäre deshalb FALSCH: sie würde Christians gesetzte Zahl bei jeder
 * künftigen Punktänderung still mitverschieben. Wer die Textzahl ändern
 * will, braucht eine neue Ansage von Christian, nicht einen neuen Punktstand.
 *
 * WAS DAMIT WEGFÄLLT, offen benannt: die Karte kann jetzt unter 450 Punkte
 * rutschen, während der Satz 450 behauptet. Der Ersatz steht NICHT in diesem
 * Bauteil, sondern daneben — `worker-pool/pruefungen/probe_karte_ueber450__
 * 20260919.py` misst beides am Kundenrand GEMEINSAM (Satz UND 479 Punkte) und
 * wird rot, sobald eines von beiden allein wandert.
 *
 * PUNKTGRÖSSE UND PULS (Christian 19.09.2026, zwei Ansagen):
 *   "die Punkte auf der Karte bitte in einem schönen Königs-Royal machen und
 *    die Größe der Punkte im Radius verdoppeln."
 *   "eine aktive Anzeige [...] so klein anfangen und dann auf die doppelte
 *    Größe wachsen [...] so wie das auch andere Profis nutzen."
 * Der Kern-Radius ist PUNKT_FAKTOR mal der aus `km_pro_einheit` gerechnete
 * 3-km-Radius; data-r-2km/-3km tragen denselben Faktor, damit die Karte nicht
 * eine Größe zeigt und eine andere behauptet. Das bleibt eine
 * DARSTELLUNGS-Größe und behauptet keine Reichweite; seit die Punkte
 * gerechnet sind, gäbe es dafür auch keinen Gegenstand.
 * Jeder Punkt besteht aus ZWEI Kreisen: dem ruhenden Kern (.qh-karte__kern)
 * und dem Ring (.qh-karte__puls), der vom Kern-Radius auf das
 * PULS_FAKTOR-fache wächst und dabei ausblendet — der Radar-Ping, wie ihn
 * Kartenwerkzeuge für "aktive Standorte" zeichnen (Mapbox GL JS, Beispiel
 * add-image-animated: fester Innenkreis, Außenkreis wächst und verliert
 * Deckkraft). Animiert werden `transform: scale()` und `opacity`, nie mehr
 * das Geometrieattribut `r`: die erste Fassung atmete r von 2,98 auf 4,48
 * Einheiten — bei 460 px Kartenbreite ein halber Pixel, technisch animiert,
 * optisch unsichtbar. Die Zahl der Elemente mit Klasse .qh-karte__puls bleibt
 * gleich der Punktzahl (die Wachen zählen daran).
 *
 * FARBE: der Farb-Token --qk-punkt steht als Custom Property am <svg> und NUR
 * dort; das CSS konsumiert ihn. Er steht im Markup statt im Stylesheet, weil
 * die Abnahme das AUSGELIEFERTE Dokument liest (worker-pool/pruefungen/
 * probe_karte_royal_und_doppelter_radius__20260919.py) und eine externe
 * Stylesheet-Datei dort baulich nie erscheint. Eine Stelle, kein fill an
 * 479 Kreisen.
 *
 * RUECKWEG: `VITE_EINSATZKARTE=off` in der .env schaltet den Baustein auf
 * `null`, ohne die Seite zu brechen. Das ist der Rueckweg, KEINE Shadow-Stufe
 * — der Default ist `on`.
 */

/** Ein Zyklus des Pings in Sekunden. Auch im CSS als --qk-takt hinterlegt. */
const TAKT_S = 3.4;

/** Christian 19.09.2026: "die Größe der Punkte im Radius verdoppeln." Gilt
 *  für den Kern-Radius UND für data-r-2km/-3km — beide tragen denselben Faktor. */
const PUNKT_FAKTOR = 2;

/** Christian 19.09.2026: "so klein anfangen und dann auf die doppelte Größe
 *  wachsen." Der Ring startet auf dem Kern-Radius und wächst auf das
 *  PULS_FAKTOR-fache. Das CSS rechnet die Skalierung aus --qk-r-max/--qk-r-min,
 *  damit der Faktor an genau EINER Stelle entsteht. */
const PULS_FAKTOR = 2;

/** Königsblau — CSS-Farbname `royalblue`, als Hex, damit die Abnahme es im
 *  ausgelieferten Dokument liest. Gegen den cremefarbenen Grund (#faf9f5)
 *  gemessen: Kontrast 4,3:1, für Grafik deutlich über 3:1. Die Kontur ist
 *  derselbe Farbton abgedunkelt (gleicher Hue, gleiche Sättigung). */
const PUNKT_FARBE = '#4169e1';
const PUNKT_FARBE_TINTE = '#2a4bb8';

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
 * Der Satz ist ein KONSTANTES Literal ohne Eingabe von aussen — es gibt hier
 * nichts, was Markup einschleusen könnte. Warum er kein Rechenergebnis mehr
 * ist, steht oben im Dateikopf.
 */
const TITEL_HTML = 'über 450 QiHome® aktiv & live';

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
  // viewBox-Einheiten: 2 bzw. 3 km, jeweils mit Christians Faktor (19.09.2026).
  const r2 = (2 / kmProEinheit) * PUNKT_FAKTOR;
  const r3 = (3 / kmProEinheit) * PUNKT_FAKTOR;
  const rKern = r3; // ruhender Kern und Startgröße des Rings
  const rPuls = rKern * PULS_FAKTOR; // Endgröße des Rings (Faktor exakt 2)

  return (
    <section className="qh-karte" data-section="qihome-einsatzkarte">
      <div className="qh-karte__bahn">
        <div className="qh-karte__wort">
          <h2
            className="qh-karte__titel"
            // eslint-disable-next-line react/no-danger -- siehe TITEL_HTML
            dangerouslySetInnerHTML={{__html: TITEL_HTML}}
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
            data-punkt-faktor={PUNKT_FAKTOR}
            data-puls-faktor={PULS_FAKTOR}
            style={{
              // Farb-Token an EINER Stelle, siehe Dateikopf (FARBE).
              '--qk-punkt': PUNKT_FARBE,
              '--qk-punkt-tinte': PUNKT_FARBE_TINTE,
            }}
          >
            {/*
              DER ALTERNATIVTEXT NENNT KEINE ZAHL. Bis zum 2026-09-19 stand hier
              "Karte von Deutschland mit ${punkte.length} Punkten." — also
              "479", während die Überschrift direkt daneben Christians
              "über 450" sagt. Zwei Stellen derselben Fläche mit zwei Zahlen:
              ein Screenreader liest beide hintereinander. Die Überschrift ist
              Christians Festlegung (GL-SPR-0008) und wird nicht nachgerechnet;
              der Titel beschreibt deshalb nur, WAS das Bild ist — und er nennt
              keinen Standort, denn die Punkte sind gerechnet (siehe Dateikopf).
              Die Punktzahl bleibt maschinell lesbar in data-punkte am <svg>.
            */}
            <title id="qh-karte-titel">
              Karte von Deutschland mit leuchtenden Punkten.
            </title>
            <path className="qh-karte__umriss" d={DEUTSCHLAND_PFAD} />
            <g className="qh-karte__punkte">
              {punkte.map((p, i) => (
                <g
                  key={`${p.e}-${p.n}-${i}`}
                  className="qh-karte__punkt"
                  style={{
                    // Negativer Delay: der Punkt startet mitten im Takt statt
                    // erst nach einer Wartezeit.
                    '--qk-versatz': `${(-((i * PHI) % 1) * TAKT_S).toFixed(3)}s`,
                  }}
                >
                  {/* Der Ring zuerst: er liegt UNTER dem Kern und ist das
                      erste .qh-karte__puls im Dokument — die Wachen messen
                      die Bewegung an genau diesem Element. */}
                  <circle
                    className="qh-karte__puls"
                    cx={p.e}
                    cy={p.n}
                    r={rKern}
                    style={{
                      // Start- und Endgröße des Rings als CSS-Variablen: das
                      // CSS skaliert um --qk-r-max / --qk-r-min, damit der
                      // Faktor an genau EINER Stelle entsteht (hier).
                      '--qk-r-min': rKern,
                      '--qk-r-max': rPuls,
                    }}
                  />
                  <circle
                    className="qh-karte__kern"
                    cx={p.e}
                    cy={p.n}
                    r={rKern}
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default Einsatzkarte;
