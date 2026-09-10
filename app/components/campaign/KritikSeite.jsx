import {
  BEFUNDE,
  EINRAEUMUNGEN,
  URTEIL,
  VORWUERFE,
} from '~/data/kritik-vorwuerfe';

/**
 * /pages/kritik — die Beweis-Fläche.
 *
 * ABGRENZUNG (SSoT homepage-bauer/konzepte/abgrenzung-flaechen.json, Fläche
 * `kritik`): diese Seite trägt BEWEISFÜHRUNG. Sie beantwortet Vorwürfe — mit
 * Fundstelle, Urteil und Beleg. Sie nutzt KEINE Kundenstimme als Beweis; das
 * ist der Gegenstand von /pages/erfahrungen. Die Erkennungsfrage im Zweifel:
 * beginnt diese Seite, mit einem Erlebnis zu überzeugen statt mit einem Beleg,
 * ist sie die falsche Seite geworden.
 *
 * WAS DER SUCHENDE HIER BEKOMMT, und was deshalb weggelassen ist: wer
 * „Qi Blanco Kritik" googelt, hat die Kritik gelesen und will wissen, was davon
 * stimmt. Er will kein Produkt vorgestellt bekommen — deshalb gibt es hier
 * keinen Kaufknopf, kein Produktbild, keinen Einstieg über das Hauswort
 * „kohärentes Wasser". Jeder Vorwurf steht wörtlich da, mit Fundstelle, und
 * bekommt eines von genau drei Urteilen: Das stimmt. Das stimmt zum Teil. Das
 * stimmt nicht. Was danach kommt, ist die Begründung — und wo die Begründung
 * eine Grenze hat, steht die Grenze.
 *
 * SPRACHE: der Shop duzt, durchgehend (Abnahme-Checkliste aus s04 — genau am
 * Anrede-Mix ist /pages/wirkt-das gescheitert). Echte Umlaute, ß nach
 * Hauskonvention. Kein Satz über unser eigenes Material, der nur Haltung trägt
 * und keine prüfbare Angabe (Brain-Regel „ehrlich oder selbstabwertend").
 */
export function KritikSeite() {
  return (
    <div className="krit">
      <section className="krit__kopf">
        <div className="krit__inhalt">
          <p className="krit__vorspann">Qi Blanco Kritik</p>
          <h1>Was an Qi Blanco kritisiert wird – und was davon stimmt</h1>
          <p className="krit__lead">
            Wer nach Kritik an Qi Blanco sucht, findet einen Beitrag des
            Wissenschaftsmagazins Quarks und eine Podcast-Folge dazu. Die
            Vorwürfe daraus stehen hier wörtlich, mit Fundstelle. Von den sieben
            stimmen zwei, drei stimmen zum Teil, zwei stimmen nicht.
          </p>

          <div className="krit__hinweis">
            <p>
              <strong>Wie diese Seite gemacht ist.</strong> Jeder Vorwurf ist
              ein wörtliches Zitat aus der genannten Quelle, nichts ist
              umformuliert. Jede Zahl in unseren Antworten stammt aus den
              veröffentlichten Arbeiten selbst; Zahlen, die dort nicht stehen,
              stehen auch hier nicht. Was wir nicht belegen können, nennen wir
              als offene Frage und nicht als Befund.
            </p>
            <p>
              <strong>Was hier fehlt, mit Absicht.</strong> Keine Kundenstimme
              als Beweis, kein Produktbild, kein Kaufknopf. Du sollst prüfen
              können, ob die Kritik trägt – nicht überredet werden.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="krit__inhalt">
          <h2>Die Vorwürfe, Punkt für Punkt</h2>
          <p className="krit__einleitung">
            Sortiert nach Gewicht: zuerst der Sachvorwurf, der am meisten
            trifft, zuletzt der Ton.
          </p>

          <ol className="krit__liste">
            {VORWUERFE.map((v, i) => (
              <li key={v.id} className="krit__vorwurf" id={v.id.toLowerCase()}>
                <p className="krit__nummer">{i + 1}</p>
                <h3>{v.frage}</h3>
                <blockquote className="krit__zitat">
                  <p>„{v.woertlich}“</p>
                  <cite>{v.fundstelle}</cite>
                </blockquote>
                <p
                  className={`krit__urteil krit__urteil--${URTEIL[v.urteil].kuerzel}`}
                >
                  {URTEIL[v.urteil].text}
                </p>
                <div className="krit__antwort">
                  {v.antwort.map((absatz) => (
                    <p key={absatz.slice(0, 48)}>{absatz}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="krit__einraeumen">
        <div className="krit__inhalt">
          <h2>Was wir selbst einräumen</h2>
          <p className="krit__einleitung">
            Vier Dinge, die jede Kritik zu Recht sagen darf. Sie stehen so auch
            auf unseren Studienseiten.
          </p>
          <ol className="krit__einraeumungen">
            {EINRAEUMUNGEN.map((e) => (
              <li key={e.titel}>
                <h3>{e.titel}</h3>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="krit__inhalt">
          <h2>Was in den Studien wirklich steht</h2>
          <p className="krit__einleitung">
            Fünf Arbeiten, je mit dem, was gemessen wurde – und mit der Grenze,
            die die Arbeit selbst nennt. Jede ist im Original nachlesbar.
          </p>
          <ul className="krit__befunde">
            {BEFUNDE.map((b) => (
              <li key={b.id} className="krit__befund">
                <h3>{b.titel}</h3>
                <p className="krit__quelle">{b.quelle}</p>
                <p>{b.befund}</p>
                <p className="krit__grenze">
                  <strong>Grenze:</strong> {b.grenze}
                </p>
                <a className="krit__link" href={`/pages/${b.slug}`}>
                  Zur Studie im Detail
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="krit__abschluss">
        <div className="krit__inhalt">
          <h2>Du musst uns nichts glauben</h2>
          <p>
            Die Kritik stellt eine berechtigte Frage: Ist das plausibel? Ein
            klinischer Wirknachweis am Menschen, der sie entscheiden würde,
            liegt nicht vor. Was es gibt, ist die Prüfung an dir selbst: 20 Tage
            tragen, und wenn es nichts für dich ist, ohne Angabe von Gründen
            zurück. Wenn nichts passiert, hast du deine Antwort.
          </p>
          <p>
            Alle fünf Arbeiten mit Methode, Zahlen und Original-PDF findest du
            auf der <a href="/pages/studien">Übersicht unserer Studien</a>. Die
            häufigsten Fragen dazu beantwortet die <a href="/pages/faq">FAQ</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
