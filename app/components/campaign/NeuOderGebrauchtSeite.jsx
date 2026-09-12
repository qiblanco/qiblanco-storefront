import {useGoogleRating} from '~/lib/googleRating';
import {
  FRAGEN,
  FRISTEN,
  IM_PREIS,
  NICHT_ENTHALTEN,
  PREIS_HINWEIS,
  RUECKWEG,
} from '~/data/kauf-tatsachen';

/**
 * /pages/neu-oder-gebraucht — die nachprüfbaren Tatsachen des Kaufs als
 * FLIESSTEXT.
 *
 * WARUM FLIESSTEXT UND NICHT NUR MARKUP: `merchantReturnDays: 20` steht seit
 * langem korrekt im Produkt-Markup, und Googles KI-Antwort nennt für uns
 * trotzdem 14 Tage. Strukturdaten haben das nicht gedreht. Das FAQPage-Schema
 * dieser Seite entsteht deshalb AUS dem sichtbaren Text (siehe Route) und
 * nicht neben ihm — die Beigabe ist das Markup, der Gegenstand ist der Satz.
 *
 * JEDE ZAHL NENNT IHRE QUELLE, und zwar sichtbar: `beleg` steht unter der
 * Angabe, `belegPfad` verlinkt den Ort zum Nachlesen. Eine Zahl ohne Herkunft
 * ist von einer erfundenen nicht zu unterscheiden.
 *
 * DIE ZUFRIEDENHEITSZAHL KOMMT AUS `useGoogleRating()` — derselben Variablen,
 * aus der das sichtbare Badge und der Organization-Knoten im JSON-LD der
 * Produktseiten entstehen (Segment s04). Sie bewegt sich real (438 → 439 →
 * 440 an einem Tag); ein Literal wäre am Tag seiner Niederschrift richtig und
 * danach falsch. UND SIE SAGT, WAS SIE IST: eine Bewertung des Unternehmens,
 * nicht eines einzelnen Produkts. Ohne diesen Halbsatz wäre die Zahl auf
 * einer Kaufseite eine Produktbewertung mit falschem Subjekt.
 *
 * WAS HIER BEWUSST NICHT STEHT:
 *  - KEINE Kritik, kein Zitat, kein Vorwurf, kein Name. Wer die Vorwürfe
 *    nachdruckt, verstärkt die Verbindung. Diese Seite beantwortet die
 *    Unsicherheit, sie streitet nicht.
 *  - KEINE Bewertung fremder Verkäufer und keine Rechtsauslegung für deren
 *    Geschäfte. Jede Zeile über den Gebrauchtkauf ist eine Aussage über
 *    UNSER Angebot (Datenmodul app/data/kauf-tatsachen.js).
 *  - KEINE Wirkaussage. Was in Zellstudien gemessen wurde, gehört auf
 *    /pages/studien und /pages/kritik, nicht hierher.
 *  - KEINE Rückgabequote. Sie ist heute nicht belastbar messbar; die
 *    Begründung steht im Kopf des Datenmoduls.
 */
export function NeuOderGebrauchtSeite() {
  const g = useGoogleRating();

  return (
    <div className="nog">
      <section className="nog__kopf" data-section="nog-kopf">
        <div className="nog__inhalt">
          <p className="nog__vorspann">Was im Preis steckt</p>
          <h1>Neu oder gebraucht: was du beim Kauf bei uns bekommst</h1>
          <p className="nog__lead">
            Ein gebrauchtes Stück kostet weniger und bringt weniger mit. Beim
            Kauf bei uns gehören 20 Tage Rücknahme, das gesetzliche
            Widerrufsrecht und mindestens zwei Jahre Gewährleistung dazu. Beim
            Kauf von privat gilt davon nichts, und der Unterschied lässt sich
            beziffern.
          </p>
        </div>
      </section>

      <section data-section="nog-zufriedenheit">
        <div className="nog__inhalt">
          <h2>Die Zahl, die du selbst nachsehen kannst</h2>
          <p>
            Qi Blanco steht bei Google auf {g.komma} von 5 Sternen aus{' '}
            {g.total} Rezensionen. Bewertet wird das Unternehmen, nicht ein
            einzelnes Produkt. Die Stimmen stehen bei Google, nicht bei uns,
            und du kannst sie einzeln lesen.
          </p>
          <p className="nog__quelle">
            Quelle: Google-Rezensionen über Qi Blanco.{' '}
            <a
              className="nog__link"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Alle {g.total} Bewertungen ansehen
            </a>
          </p>
        </div>
      </section>

      <section className="nog__fristen" data-section="nog-fristen">
        <div className="nog__inhalt">
          <h2>Zwei Fristen, und sie meinen nicht dasselbe</h2>
          <p className="nog__einleitung">
            Du hast zwei Wege zurück, und sie laufen nebeneinander. Deshalb
            stehen im Shop zwei Zahlen, ohne dass eine davon falsch ist.
          </p>
          <dl className="nog__fristenliste">
            {FRISTEN.map((f) => (
              <div className="nog__frist" key={f.id} id={f.id}>
                <dt>{f.titel}</dt>
                <dd>
                  <p>{f.text}</p>
                  <p className="nog__quelle">
                    Quelle:{' '}
                    {f.belegPfad ? (
                      <a className="nog__link" href={f.belegPfad}>
                        {f.beleg}
                      </a>
                    ) : (
                      f.beleg
                    )}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section data-section="nog-preis">
        <div className="nog__inhalt">
          <h2>Was im Preis enthalten ist</h2>
          <p className="nog__einleitung">
            Der Preis auf der Produktseite ist der Preis, den du zahlst.
            Folgendes steckt darin.
          </p>
          <ul className="nog__preisliste">
            {IM_PREIS.map((p) => (
              <li className="nog__posten" key={p.id}>
                <p>{p.text}</p>
                <p className="nog__quelle">
                  Quelle:{' '}
                  {p.belegPfad ? (
                    <a className="nog__link" href={p.belegPfad}>
                      {p.beleg}
                    </a>
                  ) : (
                    p.beleg
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="nog__gebraucht" data-section="nog-gebraucht">
        <div className="nog__inhalt">
          <h2>Was ein Kauf von privat nicht enthält</h2>
          <p className="nog__einleitung">
            Ein gebrauchtes Stück ist dasselbe Produkt und ein anderer Kauf.
            Die Technik im Inneren altert nicht, sie hat keine Batterie und
            keine Elektronik. Was fehlt, sind die Rechte, die am Kauf hängen.
          </p>
          <ol className="nog__gebrauchtliste">
            {NICHT_ENTHALTEN.map((n) => (
              <li className="nog__fehlt" key={n.id}>
                <h3>{n.titel}</h3>
                <p>{n.text}</p>
              </li>
            ))}
          </ol>
          <p className="nog__preishinweis">{PREIS_HINWEIS}</p>
        </div>
      </section>

      <section className="nog__kurz" data-section="nog-kurz">
        <div className="nog__inhalt">
          <h2>Kurz gefragt</h2>
          <dl className="nog__fragen">
            {FRAGEN.map((f) => (
              <div className="nog__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="nog__rueckweg" data-section="nog-rueckweg">
        <div className="nog__inhalt">
          <h2>So gibst du zurück</h2>
          <ol className="nog__schritte">
            {RUECKWEG.map((s) => (
              <li key={s.slice(0, 32)}>{s}</li>
            ))}
          </ol>
          <p>
            Ein Grund ist nicht nötig, und du musst nichts gespürt haben. Die
            Rücknahme hängt an der Frist und an deiner Entscheidung.
          </p>
          <p className="nog__weiter">
            <a className="nog__link" href="/pages/faq">
              Die häufigsten Fragen zum Kauf
            </a>{' '}
            ·{' '}
            <a className="nog__link" href="/pages/kritik">
              Was belegt ist und was nicht
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
