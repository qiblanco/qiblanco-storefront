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
 * DIE FRAGELISTE IST MASCHINELL ABGEGRENZT (data-geo="frageliste"), und das
 * ist kein Klassenname. Die Abnahme
 * (seo-manager/pruefungen/probe_lexikon_und_frageseiten_live.py) folgt den
 * Links dieses Hubs und verlangt von jedem Ziel den Marker data-geo="frage".
 * Ohne die Abgrenzung wäre JEDER Link dieser Seite eine Frageseite — auch
 * /pages/kritik und /pages/hypothesen, die keine sind. Die Trennung steht
 * deshalb im Markup und nicht in einer Ausnahmeliste der Probe: eine
 * Ausnahmeliste wächst mit jedem Querverweis, eine Abgrenzung nicht.
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
      <section className="frg__kopf" data-section="frg-hub-kopf">
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

      <section data-section="frg-hub-zweifel">
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
                Unser Wirkmodell, mit Stärken und Schwächen
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

      <section data-section="frg-hub-haltung">
        <div className="frg__inhalt">
          <h2>Warum hier auch steht, was wir nicht wissen</h2>
          <p>
            Zwischen Erfahrung und Messung liegt kein Widerspruch, sondern ein
            Übersetzungsproblem. Menschen berichten uns Wirkungen, und
            gleichzeitig gibt es Fragen, auf die wir keine Messung haben. Beides
            aufzuschreiben kostet uns jedes Mal ein Stück Behauptung und ist es
            wert.
          </p>
          <p>
            Wer nur sagt, was für ihn spricht, ist nicht zu widerlegen und
            deshalb auch nicht zu glauben. Du sollst bei uns sehen, woran du
            bist.
          </p>
        </div>
      </section>
    </div>
  );
}
