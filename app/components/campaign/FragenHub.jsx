import {FRAGEN} from '~/data/fragen';

/**
 * /pages/fragen — der Hub.
 *
 * WAS DIESE FLÄCHE IST: die Stelle, an der sichtbar wird, dass hinter den
 * einzelnen Antworten eine Ordnung steht. Jede Frage hat eine eigene Seite,
 * jede Seite fängt mit ihrer Antwort an, und jede sagt am Ende, was sie nicht
 * weiß. Der Hub zeigt beides auf einmal: die Frage und den Satz, der sie
 * beantwortet.
 *
 * ZWEI MARKER GRENZEN AB, WAS DIE ABNAHME HIER MESSEN DARF, und beide sind
 * Verträge, keine Klassennamen:
 *   data-geo="frageliste"  die Liste der Frageseiten. Jedes Ziel darin muss
 *                          den Marker data-geo="frage" tragen.
 *   data-geo="hub-inhalt"  jede eigene Inhalts-Sektion dieser Seite. Links
 *                          darin sind Querverweise und werden auf
 *                          Erreichbarkeit geprüft, nicht auf den Frage-Marker.
 *
 * WARUM DIE ZWEITE ABGRENZUNG NÖTIG IST, und das ist gemessen: am gerenderten
 * Hub stehen 26 /pages/-Links, davon 6 in der Frageliste und 3 als eigene
 * Querverweise — die übrigen 17 kommen aus Kopf und Fuß der Storefront (AGB,
 * Impressum, Podcasts, die fünf Studienseiten …). Ohne diese Grenze würde die
 * Abnahme fremde Seiten mitmessen und wäre aus Gründen rot, die mit dieser
 * Fläche nichts zu tun haben. Eine Wache, die aus fremden Gründen rot steht,
 * kann die Frage „hält DIESE Fläche?" nicht mehr beantworten.
 *
 * Die Trennung steht im Markup und nicht in einer Ausnahmeliste der Probe:
 * eine Ausnahmeliste wächst mit jedem Querverweis, eine Abgrenzung nicht.
 *
 * DIE ZWEIFELSFLÄCHEN GEHÖREN DAZU UND STEHEN TROTZDEM NICHT IN DER LISTE.
 * /pages/kritik und /pages/hypothesen beantworten keine einzelne Frage, sie
 * tragen die Einwände und das Wirkmodell im Ganzen. Wer sie weglässt, versteckt
 * genau das, was diese Flaeche glaubwürdig macht; wer sie in die Frageliste
 * stellt, behauptet eine Form, die sie nicht haben.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/fragen.js).
 * Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht lesen.
 *
 * KEIN KAUFWEG, KEIN PREIS, KEIN KNOPF. Diese Flaeche verkauft nichts; sie
 * erzeugt höchstens den nächsten Klick.
 */
export function FragenHub() {
  return (
    <div className="frg">
      <section className="frg__kopf" data-geo="hub-inhalt" data-section="frg-hub-kopf">
        <div className="frg__inhalt">
          <p className="frg__vorspann">Fragen und Antworten</p>
          <h1>Die Fragen, die uns gestellt werden</h1>
          <p className="frg__lead">
            Zu jeder Frage hier gibt es eine eigene Seite, und jede fängt mit
            der Antwort an. Danach steht, worauf sie sich stützt — mit Zahlen
            und Fundstellen, die nachlesbar sind.
          </p>
          <p>
            Am Ende jeder Seite steht, was wir nicht wissen. Das ist der Teil,
            den man sonst selten findet, und uns ist er der wichtigste: eine
            Antwort ist erst dann etwas wert, wenn auch ihre Lücken dabeistehen.
          </p>
        </div>
      </section>

      {/* DIE FRAGELISTE. Der Marker grenzt die Frageseiten von den
          Querverweisen ab — siehe Kopf dieser Datei. */}
      <section data-geo="frageliste" data-section="frg-hub-liste">
        <div className="frg__inhalt">
          <h2>Fragen</h2>
          <ul className="frg__liste">
            {FRAGEN.map((s) => (
              <li key={s.slug} className="frg__karte">
                <h3>
                  <a className="frg__karte-link" href={s.pfad}>
                    {s.frage}
                  </a>
                </h3>
                <p className="frg__karte-antwort">{s.antwort}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-geo="hub-inhalt" data-section="frg-hub-zweifel">
        <div className="frg__inhalt">
          <h2>Wo wir uns prüfen lassen</h2>
          <p>
            Manche Einwände lassen sich nicht in einer Frage abhandeln. Für die
            gibt es zwei eigene Flächen, und beide sind älter als diese hier.
          </p>
          <ul className="frg__weiter">
            <li>
              <a href="/pages/kritik">
                Kritik: was belegt ist, was nicht, und was du selbst prüfen
                kannst
              </a>
            </li>
            <li>
              <a href="/pages/hypothesen">
                Unser Wirkmodell: sechs Hypothesen mit ihren Quellen
              </a>
            </li>
            <li>
              <a href="/pages/lexikon">
                Lexikon: unsere Begriffe in der Sprache der Physik
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section data-geo="hub-inhalt" data-section="frg-hub-haltung">
        <div className="frg__inhalt">
          <h2>Erfahrung und Messung sind zwei verschiedene Fragen</h2>
          <p>
            Ob jemand eine Wirkung spürt, und ob ein Messgerät sie zeigt, sind
            zwei Fragen mit zwei Antworten. Die erste beantwortet jeder für
            sich, die zweite ein Versuchsaufbau. Sie können verschieden
            ausfallen, ohne dass eine von beiden falsch wird.
          </p>
          <p>
            Für die eigene Lage heißt das zweierlei. Was du spürst, bleibt deine
            Erfahrung, auch wenn ein Messgerät nichts anzeigt. Und was ein
            Messgerät anzeigt, bleibt messbar, auch wenn du nichts davon spürst.
          </p>
        </div>
      </section>
    </div>
  );
}
