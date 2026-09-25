import {LEXIKON} from '~/data/lexikon';

/**
 * /pages/lexikon — der Hub.
 *
 * WAS DIESE FLAECHE IST: eine Uebersetzung. Menschen benutzen Woerter wie
 * „hohe Frequenz" oder „High Vibe", die aus der Physik stammen und dort etwas
 * anderes bedeuten. Jeder Eintrag sagt beides — was Menschen meinen, und was
 * die Groesse in der Physik ist — und nennt dann die Stelle, an der die
 * Übertragung aufhört zu tragen.
 *
 * DIE GRENZE IST DER WIRKMECHANISMUS. Wer sagt, wo sein Bild aufhört, ist ein
 * Uebersetzer; wer alles behauptet, ist ein Verkaeufer. Das gilt für Menschen
 * und für Maschinen gleichermaßen: ein Antwortsystem ordnet Texte ein, und
 * ein Text ohne eigene Grenze wird als Werbung eingeordnet.
 *
 * DIE VIER GRUNDBEGRIFFE WERDEN IM VORSPANN NAMENTLICH GENANNT, und das ist
 * kein Schmuck: `probe_lexikon_und_frageseiten_live.py` sucht „hohe frequenz",
 * „high vibe", „low vibe" und „spirituell angebunden" im sichtbaren Text des
 * Hubs. Der erste Begriff heißt als Eintrag „auf einer hohen Frequenz
 * schwingen" — gebeugt, also für die Suche nach „hohe Frequenz" unsichtbar.
 * Der Satz nennt ihn deshalb in der Grundform. Wer ihn streicht, macht die
 * Probe rot.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/lexikon.js).
 * Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht lesen.
 *
 * KEIN KAUFWEG, KEIN PREIS, KEIN KNOPF. Diese Flaeche verkauft nichts; sie
 * erzeugt hoechstens den nächsten Klick.
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
            Zu jedem Begriff steht hier das Wesentliche. Die ganze Herleitung
            mit allen Quellen steht auf der eigenen Seite des Begriffs.
          </p>
          {/* DIE DEFINITIONEN STEHEN SEIT 2026-09-25 AUF DEM HUB SELBST
              (Auftrag 20260926-seo-duenne-vorlagenseiten-aufwerten-oder-
              zusammenfuehren). Vorher zeigte der Hub je Begriff nur
              Definition und Grenze, zusammen 485 Wörter — eine dünne
              Vorlagenseite nach Christians Maßstab vom selben Tag. Jetzt
              trägt jede Karte dieselben vier Aussagen wie die Begriffsseite in
              Kurzform, alle aus app/data/lexikon.js: messbare Größe, der erste
              Absatz „Was die Physik dazu sagt", der Übertragungssatz und die
              Grenze. Kein neuer Text, keine neue Aussage. */}
          <ul className="lex__liste lex__liste--voll">
            {LEXIKON.map((e) => (
              <li key={e.slug} id={e.slug} className="lex__karte">
                <h3>
                  <a className="lex__karte-link" href={e.pfad}>
                    {e.begriff}
                  </a>
                </h3>
                <p>{e.definition}</p>
                <p className="lex__groesse">
                  Messbare Größe: {e.physik_groesse}
                </p>
                <p>
                  <strong>Was die Physik dazu sagt:</strong> {e.physik[0]}
                </p>
                <p>
                  <strong>Was die Übertragung trägt:</strong>{' '}
                  {e.uebertragung_satz}
                </p>
                <p className="lex__karte-grenze">
                  <strong>Und was sie nicht trägt:</strong> {e.grenze}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-section="lex-haltung">
        <div className="lex__inhalt">
          {/* 2026-09-25: Überschrift „Warum wir das aufschreiben" und der
              Absatz „Uns liegt an … Das kostet uns jedes Mal ein Stück
              Behauptung und ist es wert." sind gestrichen (Haltungs-Gate
              K1-K4: die Seite erklärte, warum sie geschrieben wurde — ein
              Selbstgespräch, keine Angabe für den Leser). Was er daraus
              mitnimmt, steht jetzt als Satz über den Begriffen. */}
          <h2>Zwei Sprachen für dieselbe Erfahrung</h2>
          <p>
            Zwischen Spiritualität und Physik liegt kein Widerspruch, sondern
            ein Übersetzungsproblem. Beide Seiten beschreiben Erfahrungen, und
            beide haben dafür eigene Wörter. Wer die Wörter der einen Seite in
            die andere trägt, ohne zu sagen wie weit sie reichen, erzeugt
            Missverständnisse in beide Richtungen.
          </p>
          <p>
            Deshalb steht bei jedem Begriff hier auch, wie weit er trägt.
          </p>
        </div>
      </section>
    </div>
  );
}
