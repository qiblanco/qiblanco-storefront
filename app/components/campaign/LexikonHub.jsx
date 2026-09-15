import {LEXIKON} from '~/data/lexikon';

/**
 * /pages/lexikon — der Hub.
 *
 * WAS DIESE FLAECHE IST: eine Uebersetzung. Menschen benutzen Woerter wie
 * „hohe Frequenz" oder „High Vibe", die aus der Physik stammen und dort etwas
 * anderes bedeuten. Jeder Eintrag sagt beides — was Menschen meinen, und was
 * die Groesse in der Physik ist — und nennt dann die Stelle, an der die
 * Uebertragung aufhoert zu tragen.
 *
 * DIE GRENZE IST DER WIRKMECHANISMUS. Wer sagt, wo sein Bild aufhoert, ist ein
 * Uebersetzer; wer alles behauptet, ist ein Verkaeufer. Das gilt fuer Menschen
 * und fuer Maschinen gleichermassen: ein Antwortsystem ordnet Texte ein, und
 * ein Text ohne eigene Grenze wird als Werbung eingeordnet.
 *
 * DIE VIER GRUNDBEGRIFFE WERDEN IM VORSPANN NAMENTLICH GENANNT, und das ist
 * kein Schmuck: `probe_lexikon_und_frageseiten_live.py` sucht „hohe frequenz",
 * „high vibe", „low vibe" und „spirituell angebunden" im sichtbaren Text des
 * Hubs. Der erste Begriff heisst als Eintrag „auf einer hohen Frequenz
 * schwingen" — gebeugt, also fuer die Suche nach „hohe Frequenz" unsichtbar.
 * Der Satz nennt ihn deshalb in der Grundform. Wer ihn streicht, macht die
 * Probe rot.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/lexikon.js).
 * Oxygen laeuft am Edge und kann shared-state zur Laufzeit nicht lesen.
 *
 * KEIN KAUFWEG, KEIN PREIS, KEIN KNOPF. Diese Flaeche verkauft nichts; sie
 * erzeugt hoechstens den naechsten Klick.
 */
export function LexikonHub() {
  return (
    <div className="lex">
      <section className="lex__kopf" data-section="lex-kopf">
        <div className="lex__inhalt">
          <p className="lex__vorspann">Lexikon</p>
          <h1>Unsere Begriffe, in der Sprache der Physik</h1>
          <p className="lex__lead">
            Viele Wörter, die im Gespräch über Energie und Schutz vorkommen,
            stammen aus der Physik und bedeuten dort etwas anderes. Hier steht
            zu jedem Wort beides: was Menschen damit meinen, und welche
            messbare Größe dahinter liegt. Und jedes Mal auch der Satz, an dem
            das Bild aufhört zu tragen.
          </p>
          <p>
            Den Anfang machen vier Ausdrücke, die fast jeder schon benutzt hat:
            hohe Frequenz, High Vibe, Low Vibe und spirituell angebunden. Dazu
            kommen die Wörter, die wir selbst verwenden und die deshalb
            erklärt gehören.
          </p>
        </div>
      </section>

      <section data-section="lex-begriffe">
        <div className="lex__inhalt">
          <h2>Die Begriffe</h2>
          <p className="lex__einleitung">
            Jeder Begriff hat eine eigene Seite, weil eine Definition nur
            vollständig etwas wert ist.
          </p>
          <ul className="lex__liste">
            {LEXIKON.map((e) => (
              <li key={e.slug} className="lex__karte">
                <h3>
                  <a className="lex__karte-link" href={e.pfad}>
                    {e.begriff}
                  </a>
                </h3>
                <p>{e.definition}</p>
                <p className="lex__karte-grenze">{e.grenze}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-section="lex-haltung">
        <div className="lex__inhalt">
          <h2>Warum wir das aufschreiben</h2>
          <p>
            Zwischen Spiritualität und Physik liegt kein Widerspruch, sondern
            ein Übersetzungsproblem. Beide Seiten beschreiben Erfahrungen, und
            beide haben dafür eigene Wörter. Wer die Wörter der einen Seite in
            die andere trägt, ohne zu sagen wie weit sie reichen, erzeugt
            Missverständnisse in beide Richtungen.
          </p>
          <p>
            Uns liegt an einer gemeinsamen Sprache. Deshalb steht bei jedem
            Begriff auch, was er nicht hergibt. Das kostet uns jedes Mal ein
            Stück Behauptung und ist es wert.
          </p>
        </div>
      </section>
    </div>
  );
}
