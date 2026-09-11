import {AbsichtHinweis} from '~/components/reusables/AbsichtHinweis';
import {BEFUNDE, EINRAEUMUNGEN, FRAGEN, PLUSPUNKTE} from '~/data/kritik-vorwuerfe';

/**
 * /pages/kritik — die Beweis-Fläche.
 *
 * UMGEBAUT 2026-09-11. Die Seite trug sieben fremde Vorwürfe als wörtliche
 * Zitate mit Fundstelle und behauptete im Vorspann eine Kritik-Landschaft
 * („öffentliche Kritik … auch Videos von Wissenschaftlern"). Beides ist weg.
 * Christian: „Es wirkt so, als wäre die Kritik so groß — ist sie aber nicht."
 *
 * DAS LEITPRINZIP, aus dem jeder Satz hier geschrieben ist: DIE WISSENSCHAFT
 * IST SICH ÜBER UNS NICHT EINIG — UND ZWAR IN KEINE RICHTUNG. Das schneidet
 * nach beiden Seiten: kein Urteil der Wissenschaft gegen uns, aber eben auch
 * keine Bestätigung. Fünf Arbeiten aus einem Labor, von uns bezahlt, das Modell
 * als Hypothese geführt — das ist ein Anfang, kein Beleg. Wer hier je
 * „wissenschaftlich bestätigt" o. ä. einbaut, bricht die Seite von der anderen
 * Seite her auf.
 *
 * DIE FRAGE, DIE DIE SEITE BEANTWORTET, ist nicht „was sagen Kritiker", sondern
 * „ist das echt, oder werde ich verschaukelt?". Die lässt sich vollständig
 * beantworten, ohne eine einzige fremde Anklage zu wiederholen. Alle sieben
 * Themen sind da, in derselben Reihenfolge nach Gewicht — nur die Worte sind
 * unsere.
 *
 * DIE REIHENFOLGE DER ABSCHNITTE IST TRAGEND, nicht Geschmack:
 *   Fragen → Einräumungen → was in den Studien steht → STÄRKEN → Abschluss.
 * Erst die offenen Punkte, dann die Stärken. Wer mit den Stärken anfängt, wirkt
 * ausweichend; wer mit ihnen aufhört, wirkt souverän. Wer die Stärken nach oben
 * zieht, dreht die Wirkung der Seite um.
 *
 * DAS WORT „KRITIK" trägt im <title> und in der H1 (dort holt es die Suche ab)
 * und sonst NIRGENDS im Fließtext. Jede weitere Nennung bringt keine Position
 * mehr, sie verstärkt nur im Entitätengraph die Verbindung Qi Blanco ↔ Kritik.
 * Vor dem 2026-09-11 stand es 9-mal im ausgelieferten Text. Auch die
 * Beschriftung des Verweises in Menü und Fuß ist deshalb neutral („Belege und
 * offene Fragen") — wie ein Link beschriftet ist, lehrt die Suchmaschine, worum
 * es beim Ziel geht. Die ADRESSE /pages/kritik bleibt, damit Verweise und
 * Rangpositionen nicht verfallen.
 *
 * KEIN FREMDER NAME: kein Redaktions-, Sendungs- oder Domainname, kein Datum
 * eines fremden Beitrags, keine Zählung von Vorwürfen, kein „es gibt Kritik".
 * Das ist keine Aussage ÜBER irgendjemanden — wir hören einfach auf zu
 * zitieren. Ein Seitenhieb würde die Stärke kleiner machen, nicht größer.
 *
 * ABGRENZUNG (SSoT homepage-bauer/konzepte/abgrenzung-flaechen.json, Fläche
 * `kritik`): diese Seite trägt BEWEISFÜHRUNG, /pages/erfahrungen trägt
 * ERLEBNISSE. Der Verweis auf die Erfahrungen in PLUSPUNKTE sagt ausdrücklich
 * dazu, dass er KEIN Wirkungsbeweis ist — sobald hier ein Erlebnis überzeugen
 * soll statt eines Belegs, ist die Abgrenzung gebrochen.
 *
 * SPRACHE: der Shop duzt, durchgehend. Echte Umlaute, ß nach Hauskonvention.
 * Kein Satz über unser eigenes Material, der nur Haltung trägt und keine
 * prüfbare Angabe.
 */
export function KritikSeite() {
  return (
    <div className="krit">
      <section className="krit__kopf">
        <div className="krit__inhalt">
          <p className="krit__vorspann">Belege und offene Fragen</p>
          <h1>
            Qi Blanco Kritik: was belegt ist, was nicht – und was du selbst
            prüfen kannst
          </h1>
          <p className="krit__lead">
            Du willst wissen, ob hinter Qi Blanco etwas Belegtes steckt oder ob
            du verschaukelt wirst. Das ist die richtige Frage. Hier stehen die
            sieben härtesten Fragen zu unseren Produkten, jede mit einer geraden
            Antwort: was gemessen ist, was offen ist, und was du selbst
            nachprüfen kannst.
          </p>

          <div className="krit__hinweis">
            <p>
              <strong>Wie diese Seite gemacht ist.</strong> Jede Zahl stammt aus
              den veröffentlichten Arbeiten selbst; Zahlen, die dort nicht
              stehen, stehen auch hier nicht. Was wir nicht belegen können,
              nennen wir als offene Frage und nicht als Befund.
            </p>
            <p>
              <strong>Was hier fehlt, mit Absicht.</strong> Keine Kundenstimme
              als Beweis, kein Produktbild, kein Kaufknopf. Du sollst prüfen
              können – nicht überredet werden.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="krit__inhalt">
          <h2>Die sieben Fragen, der Reihe nach</h2>
          <p className="krit__einleitung">
            Sortiert nach Gewicht: zuerst die Frage, die am schwersten wiegt,
            zuletzt die, die am wenigsten mit Messwerten zu tun hat.
          </p>

          <ol className="krit__liste">
            {FRAGEN.map((f, i) => (
              <li key={f.id} className="krit__vorwurf" id={f.id.toLowerCase()}>
                <p className="krit__nummer">{i + 1}</p>
                <h3>{f.frage}</h3>
                <p className={`krit__urteil krit__urteil--${f.ton}`}>
                  {f.kurz}
                </p>
                <div className="krit__antwort">
                  {f.antwort.map((absatz) => (
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
            Vier Punkte, die gegen uns sprechen. Sie stehen so auch auf unseren
            Studienseiten.
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

      {/* Der Verweis auf die Absicht. Er steht auf DIESER Seite, weil hier
          die Zweifel stehen: wer wissen will, warum jemand das trotzdem
          macht, findet die Antwort einen Klick weiter.
          NACH DEM ZUSAMMENFUEHREN MIT PR #373 (2026-09-11) steht er als eigene
          Section VOR dem Plusbereich, nicht mehr in ihm: der Plusbereich
          beantwortet "was spricht dafuer", der Verweis beantwortet "warum
          macht das ueberhaupt jemand". Zwei Fragen, zwei Flaechen — sie
          ineinanderzuschieben haette beide unscharf gemacht. */}
      <section>
        <div className="krit__inhalt">
          <AbsichtHinweis einleitung="Warum wir trotz dieser offenen Fragen weitermachen:" />
        </div>
      </section>

      <section className="krit__plusbereich">
        <div className="krit__inhalt">
          <h2>Was für uns spricht</h2>
          <p className="krit__einleitung">
            Die offenen Punkte stehen oben, ungekürzt. Das hier steht daneben –
            jeder Punkt so, dass du ihn nachprüfen kannst.
          </p>
          <ul className="krit__plusliste">
            {PLUSPUNKTE.map((s) => (
              <li key={s.titel} className="krit__plus">
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
                {s.pfad ? (
                  <a className="krit__link" href={s.pfad}>
                    {s.link}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="krit__abschluss">
        <div className="krit__inhalt">
          <h2>Du musst uns nichts glauben</h2>
          <p>
            Ob das plausibel ist, entscheidest du nicht an unserem Text. Ein
            klinischer Wirknachweis am Menschen, der die Frage entscheiden
            würde, liegt nicht vor. Was es gibt, ist die Prüfung an dir selbst:
            20 Tage tragen, und wenn es nichts für dich ist, ohne Angabe von
            Gründen zurück. Wenn nichts passiert, hast du deine Antwort.
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
