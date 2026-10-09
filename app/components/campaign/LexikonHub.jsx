import {LEXIKON, quellenFuer, zielName} from '~/data/lexikon';
import {adresse, zusammenlegungFuer} from '~/lib/zusammenlegungen';

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
            zu jedem Wort beides: was Menschen damit meinen, und welche messbare
            Größe dahinter liegt. Und jedes Mal auch der Satz, an dem das Bild
            aufhört zu tragen.
          </p>
          <p>
            Den Anfang machen vier Ausdrücke, die fast jeder schon benutzt hat:
            hohe Frequenz, High Vibe, Low Vibe und spirituell angebunden. Dazu
            kommen die Wörter, die wir selbst verwenden und die deshalb erklärt
            gehören.
          </p>
        </div>
      </section>

      <section data-section="lex-begriffe">
        <div className="lex__inhalt">
          <h2>Die Begriffe</h2>
          <p className="lex__einleitung">
            Zu jedem Begriff steht hier die ganze Herleitung, mit allen Quellen
            zum Nachlesen.
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
            {/* SEIT 2026-10-07 IST DER HUB DIE SEITE DER MEISTEN BEGRIFFE
                (Job 20261007-seo-zusammenlegung-duenne-seiten-301-umsetzen,
                Entscheidung vom selben Tag: dünne Seiten per 301 in starke
                zusammenlegen). Ist die eigene Seite eines Begriffs hierher
                aufgegangen (app/lib/zusammenlegungen.js), trägt seine Karte
                den VOLLEN Eintrag: Gebrauch, alle Physik-Absätze, Übertragung
                und Grenze mit Begründung, Quellen und Weiterlesen. Die Karte
                ist dann selbst das Ziel des 301 (Anker = Slug) und verlinkt
                nicht auf sich. Begriffe mit eigener Seite (Elektrosmog) oder
                mit anderem Ziel (kohärentes Wasser) behalten die Kurzfassung
                und den Link. Kein neuer Text: alles kommt aus
                app/data/lexikon.js. */}
            {LEXIKON.map((e) => {
              const hier =
                zusammenlegungFuer(e.pfad)?.ziel === '/pages/lexikon';
              return (
                <li key={e.slug} id={e.slug} className="lex__karte">
                  <h3>
                    {hier ? (
                      e.begriff
                    ) : (
                      <a className="lex__karte-link" href={adresse(e.pfad)}>
                        {e.begriff}
                      </a>
                    )}
                  </h3>
                  <p>{e.definition}</p>
                  <p className="lex__groesse">
                    Messbare Größe: {e.physik_groesse}
                  </p>
                  {hier ? (
                    <LexikonKarteVoll eintrag={e} />
                  ) : (
                    <>
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
                    </>
                  )}
                  {/* Die Grundfrage zum Begriff, wo es eine eigene Frageseite
                    gibt (Feld `frage` in app/data/lexikon.js). Ankertext ist
                    die Frage selbst. Seit 2026-10-06: Elektrosmog -> „Was ist
                    Elektrosmog?" (Großjob 20261006-GROSSJOB-seo-strategie-…,
                    s06). Ohne belegte Beschriftung kein Link. */}
                  {e.frage && zielName(e.frage) ? (
                    <p className="lex__karte-frage">
                      <a className="lex__karte-link" href={adresse(e.frage)}>
                        {zielName(e.frage)}
                      </a>
                    </p>
                  ) : null}
                </li>
              );
            })}
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
          {/* 2026-10-09: Christians Selbstpositionierung steht wieder da, in
              seinen Worten vom 15.09. („dass wir uns selbst als Plattform
              verstehen, als Bindeglied zwischen Spiritualität, Physik und
              Metaphysik. Und dass es uns am Herzen liegt, hier eine
              gemeinsame Sprache zu finden"). Gestrichen hatte sie PR #642
              ohne sein Wort; nachgezogen von
              zusagen-nachzug-20260915-GEO-lexikon-…-82a667, Rand-Probe
              auftragstreue/pruefungen/probe_nachzug_lexikon_positionierung.py.
              Kein Satz über diese Seite, sondern eine Angabe, wer spricht. */}
          <h2>Zwei Sprachen für dieselbe Erfahrung</h2>
          <p>
            Qi Blanco versteht sich als Plattform und als Bindeglied zwischen
            Spiritualität, Physik und Metaphysik. Uns liegt am Herzen, für alle
            drei eine gemeinsame Sprache zu finden.
          </p>
          <p>
            Zwischen Spiritualität und Physik liegt kein Widerspruch, sondern
            ein Übersetzungsproblem. Beide Seiten beschreiben Erfahrungen, und
            beide haben dafür eigene Wörter. Wer die Wörter der einen Seite in
            die andere trägt, ohne zu sagen wie weit sie reichen, erzeugt
            Missverständnisse in beide Richtungen.
          </p>
          <p>Deshalb steht bei jedem Begriff hier auch, wie weit er trägt.</p>
        </div>
      </section>
    </div>
  );
}

/**
 * Der volle Eintrag in der Karte eines Begriffs, dessen eigene Seite in den
 * Hub aufgegangen ist. Dieselben Abschnitte wie LexikonEintrag, als Absätze
 * mit fettem Etikett statt eigener Überschriften: die Karte ist schon ein
 * Abschnitt unter „Die Begriffe", eine weitere Überschriftenebene je Karte
 * hätte den Hub in 35 Zwischenüberschriften zerlegt. Der Grenz-Abschnitt
 * trägt den Marker data-geo="grenze" wie auf der früheren Begriffsseite.
 * @param {{eintrag: import('~/data/lexikon').LexikonEintrag}} props
 */
function LexikonKarteVoll({eintrag: e}) {
  const quellen = quellenFuer(e);
  const weiter = e.verlinkt_auf.filter(
    (pfad) => zielName(pfad) && adresse(pfad) !== `/pages/lexikon#${e.slug}`,
  );
  return (
    <div className="lex__karte-voll">
      {e.gebrauch.map((absatz, i) => (
        <p key={absatz.slice(0, 48)}>
          {i === 0 ? <strong>Was Menschen damit meinen: </strong> : null}
          {absatz}
        </p>
      ))}
      {e.physik.map((absatz, i) => (
        <p key={absatz.slice(0, 48)}>
          {i === 0 ? <strong>Was die Physik dazu sagt: </strong> : null}
          {absatz}
        </p>
      ))}
      <p>
        <strong>Was die Übertragung trägt:</strong> {e.uebertragung_satz}
      </p>
      {e.uebertragung_begruendung.map((absatz) => (
        <p key={absatz.slice(0, 48)}>{absatz}</p>
      ))}
      <div className="lex__karte-grenze" data-geo="grenze">
        <p>
          <strong>Und was sie nicht trägt:</strong> {e.grenze}
        </p>
        {e.grenze_begruendung.map((absatz) => (
          <p key={absatz.slice(0, 48)}>{absatz}</p>
        ))}
      </div>
      {quellen.length > 0 ? (
        <ul className="lex__quellen" aria-label={`Quellen zu ${e.begriff}`}>
          {quellen.map((q) => (
            <li key={q.url}>
              <a href={q.url} rel="noopener noreferrer" target="_blank">
                {q.zitat}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {weiter.length > 0 ? (
        <ul className="lex__weiter" aria-label={`Weiterlesen zu ${e.begriff}`}>
          {weiter.map((pfad) => (
            <li key={pfad}>
              <a href={adresse(pfad)}>{zielName(pfad)}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
