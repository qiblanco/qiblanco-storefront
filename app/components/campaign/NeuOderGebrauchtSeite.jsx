import {useGoogleRating} from '~/lib/googleRating';
import {FRAGEN, VORTEILE} from '~/data/kauf-tatsachen';
import {TrustpilotStimmen} from '~/components/reusables/TrustpilotStimmen';

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
 * danach falsch. UND SIE SAGT, WAS SIE IST: Google-Bewertungen FÜR QI BLANCO,
 * also das Unternehmen, kein Produkt. Seit 2026-11-01 in Christians eigener
 * Form („441 Google-Bewertungen, im Schnitt 4,8 von 5 Sterne") und ohne die
 * Antithese „…, nicht ein einzelnes Produkt": Christian hat dieselbe Form
 * („X, nicht Y") am 28.09. als AI-Sprache verworfen.
 *
 * POSITIV SEIT 2026-11-01 (Grossjob 20260928-GROSSJOB-frageseiten-menschlich-
 * …, s14, Christians Nachtrag vom 28.09.): die Seite sagt, warum man direkt
 * bei uns kauft. Der Katalog „Was ein Kauf von privat nicht enthält" und der
 * Kleinanzeigen-Kommentar sind ersatzlos weg, ebenso der Satz „Die Stimmen
 * stehen bei Google, nicht bei uns …", den Christian als AI-Sprache zitiert
 * hat. Die GEO-Tatsache 20 statt 14 Tage steht als EINE Aussage mit Quelle
 * in der Liste der Gründe (Datenmodul VORTEILE, id widerruf).
 * Keine Kauf- oder Landingpage verlinkt hierher (weglink-sperre, Gate 23).
 *
 * WAS HIER BEWUSST NICHT STEHT:
 *  - KEINE Kritik, kein Zitat, kein Vorwurf, kein Name. Wer die Vorwürfe
 *    nachdruckt, verstärkt die Verbindung. Diese Seite beantwortet die
 *    Unsicherheit, sie streitet nicht.
 *  - KEIN Satz über Privatverkäufer, Kleinanzeigen oder den Gebrauchtmarkt.
 *    Jede Zeile ist eine Aussage über UNSER Angebot (Datenmodul
 *    app/data/kauf-tatsachen.js).
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
          <p className="nog__vorspann">Direkt bei Qi Blanco</p>
          <h1>
            Neu oder gebraucht: was du bekommst, wenn du direkt bei uns kaufst
          </h1>
        </div>
      </section>

      <section className="nog__fristen" data-section="nog-vorteile">
        <div className="nog__inhalt">
          <h2>Warum direkt bei Qi Blanco kaufen</h2>
          <dl className="nog__fristenliste">
            {VORTEILE.map((f) => (
              <div className="nog__frist" key={f.id} id={f.id}>
                <dt>{f.titel}</dt>
                <dd>
                  {f.text ? <p>{f.text}</p> : null}
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

      <section data-section="nog-zufriedenheit">
        <div className="nog__inhalt">
          <h2>So bewerten uns unsere Kunden</h2>
          <p>
            {g.total} Google-Bewertungen für Qi Blanco, im Schnitt {g.komma} von
            5 Sternen.
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

      {/* Trustpilot-Stimmen (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq). */}
      <TrustpilotStimmen praefix="nog-" />

      <section className="nog__kurz" data-section="nog-kurz">
        <div className="nog__inhalt">
          <h2>Kurz gefragt</h2>
          <dl className="nog__fragen">
            {FRAGEN.map((f) => (
              <div className="nog__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>
                  <p>{f.a}</p>
                  {f.beleg ? (
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
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="nog__weiter">
            <a className="nog__link" href="/pages/faq">
              Die häufigsten Fragen zum Kauf
            </a>{' '}
            ·{' '}
            <a className="nog__link" href="/pages/erfahrungen">
              Erfahrungen unserer Kunden
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
