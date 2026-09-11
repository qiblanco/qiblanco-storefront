import {
  ABGRENZUNG,
  BEWUSSTSEIN,
  GESCHICHTE,
  HYPOTHESEN,
  KETTE,
  STAND,
} from '~/data/hypothesen';
import {
  QUELLEN,
  QUELLENART,
  QUELLEN_NACH_ID,
  VIDEOS,
} from '~/data/hypothesen-quellen';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';

/**
 * /pages/hypothesen — die Modell-Fläche.
 *
 * ABGRENZUNG ZU /pages/kritik, und sie ist der Wert dieser beiden Seiten:
 *   kritik     = das ist gemessen, das nicht, mehr behaupten wir nicht.
 *   hypothesen = das ist unser Modell, das spricht dafür, das dagegen,
 *                und hier sind die Quellen.
 * Die Erkennungsfrage im Zweifel: fängt diese Seite an, etwas als BELEGT
 * darzustellen, was eine Annahme ist, ist sie die falsche Seite geworden.
 *
 * „HYPOTHESE" IST DIE ÜBERSCHRIFT, NICHT DAS KLEINGEDRUCKTE. Die Seite
 * entschuldigt sich nirgends dafür, ein Modell zu sein — sie erklärt es und
 * benennt seine Grenzen selbst. Deshalb steht `dagegen` VOR `bedeutet` und
 * nicht am Ende eines Absatzes, und deshalb trägt die schwächste Hypothese
 * (h3, der Gitter-Schritt) ihre Gegen-Arbeit im Wortlaut.
 *
 * AUFBAU — die Reihenfolge ist eine Entscheidung:
 *   1. Geschichte      warum es das gibt (Christians Worte, unverändert)
 *   2. Abgrenzung      was diese Seite ist und was nicht — im Kopf, nicht im Fuß
 *   3. Hypothesen      sechs Glieder, je vier Felder, als Kette von stark nach schwach
 *   4. Kette           wo sie hält und wo sie reißt
 *   5. Videos          mit Einordnung, nie nackt eingebettet
 *   6. Quellen         alle, je mit Reichweite und „sagt nichts über uns"
 *   7. Bewusstsein     Christians eigene Sicht, baulich getrennt, ohne Quellen
 *
 * KEIN KAUFKNOPF, KEIN PRODUKTBILD, KEIN PREIS. Wer ein Modell prüfen will,
 * will nicht verkauft bekommen; ein Kaufweg hier würde die Seite zu genau der
 * Werbefläche machen, als die ein Kritiker sie ohnehin lesen will. Ausgehende
 * Links gehen auf /pages/kritik, /pages/studien und /pages/superhuman.
 *
 * SPRACHE: der Shop duzt, durchgehend. Echte Umlaute (Hausregel für
 * kundensichtbaren Web-Content).
 *
 * KEIN LOADER: der Inhalt sind zwei committete Datenmodule (app/data/
 * hypothesen.js, app/data/hypothesen-quellen.js). Oxygen läuft am Edge und
 * kann shared-state zur Laufzeit nicht lesen — dieselbe Bauform wie
 * /pages/kritik und /pages/erfahrungen.
 */
export function HypothesenSeite() {
  return (
    <div className="hyp">
      {/* ---------------------------------------------------------------- 1 */}
      <section className="hyp__kopf">
        <div className="hyp__inhalt">
          <p className="hyp__vorspann">Qi Blanco – unsere Hypothesen</p>
          <h1>Unser Wirkmodell, mit Stärken und Schwächen</h1>
          <p className="hyp__lead">
            Das hier ist das Modell, nach dem wir bauen: sechs Annahmen, die
            aufeinander aufbauen. Zu jeder steht, was dafür spricht, was dagegen
            spricht und was sie für unser Produkt bedeutet – und was
            ausdrücklich nicht. Die schwächste Stelle sitzt in der Mitte der
            Kette, und wir zeigen sie, statt sie zu umgehen.
          </p>

          <ul className="hyp__abgrenzung">
            {ABGRENZUNG.map((a) => (
              <li key={a.titel}>
                <strong>{a.titel}.</strong> {a.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- Geschichte */}
      <section className="hyp__geschichte">
        <div className="hyp__inhalt">
          <p className="hyp__vorspann">{GESCHICHTE.vorspann}</p>
          <h2>{GESCHICHTE.titel}</h2>
          {GESCHICHTE.absaetze.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}

          <blockquote className="hyp__zitat">
            {GESCHICHTE.zitat.absaetze.map((p) => (
              <p key={p.slice(0, 48)}>„{p}“</p>
            ))}
            <cite>{GESCHICHTE.zitat.wer}</cite>
          </blockquote>

          {GESCHICHTE.nachsatz.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Hypothesen */}
      <section>
        <div className="hyp__inhalt">
          <h2>Die sechs Hypothesen</h2>
          <p className="hyp__einleitung">
            Sortiert als Kette: vorne das, was unabhängig von uns gut belegt
            ist, hinten unsere eigenen Messungen. Jede Hypothese hat denselben
            Aufbau, damit du sie vergleichen kannst.
          </p>

          <ol className="hyp__liste">
            {HYPOTHESEN.map((h, i) => (
              <li key={h.id} className="hyp__these" id={h.id}>
                <p className="hyp__nummer">
                  Hypothese {i + 1} · {h.kurz}
                </p>
                <h3>{h.satz}</h3>
                <p className={`hyp__stand hyp__stand--${STAND[h.stand].kuerzel}`}>
                  {STAND[h.stand].text}
                </p>

                <div className="hyp__feld">
                  <h4>Was dafür spricht</h4>
                  {h.dafuer.map((b) => (
                    <p key={b.text.slice(0, 48)}>
                      {b.text} <Belege ids={b.quellen} />
                    </p>
                  ))}
                </div>

                <div className="hyp__feld hyp__feld--dagegen">
                  <h4>Was dagegen spricht oder offen ist</h4>
                  {h.dagegen.map((b) => (
                    <p key={b.text.slice(0, 48)}>
                      {b.text} <Belege ids={b.quellen} />
                    </p>
                  ))}
                </div>

                <div className="hyp__folgt">
                  <p>
                    <strong>Was das für unser Produkt bedeutet.</strong>{' '}
                    {h.bedeutet}
                  </p>
                  <p className="hyp__folgt-nicht">
                    <strong>Und was nicht.</strong> {h.bedeutetNicht}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------------- Kette */}
      <section className="hyp__kette">
        <div className="hyp__inhalt">
          <h2>{KETTE.titel}</h2>
          {KETTE.absaetze.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          <p className="hyp__weiter">
            Was von alldem tatsächlich gemessen ist und was nicht, beantwortet{' '}
            <a href="/pages/kritik">die Seite zur Kritik an Qi Blanco</a> Punkt
            für Punkt. Die fünf Arbeiten im Original liegen auf{' '}
            <a href="/pages/studien">der Studienübersicht</a>.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- Videos */}
      <section className="hyp__videos">
        <div className="hyp__inhalt">
          <h2>Die Vorträge dazu, im Original</h2>
          <p className="hyp__einleitung">
            Gerald Pollack erklärt seine Messungen selbst. Zu jedem Vortrag
            steht, was er zeigt – und worüber er nichts sagt. Ein eingebettetes
            Video ohne Einordnung wäre ein Argument, das wir nicht geführt
            haben.
          </p>

          <ul className="hyp__videoliste">
            {VIDEOS.map((v) => (
              <li key={v.videoId} className="hyp__video">
                <div className="hyp__videorahmen">
                  <YoutubeTimestamp videoId={v.videoId} titel={v.titel} />
                </div>
                <div className="hyp__videotext">
                  <h3>{v.titel}</h3>
                  <p className="hyp__videometa">
                    {v.kanal} · {v.dauerText} · {v.sprache === 'en' ? 'englisch' : 'deutsch'}
                  </p>
                  <p>
                    <strong>Was er zeigt.</strong> {v.zeigt}
                  </p>
                  <p className="hyp__sagtnichts">
                    <strong>Worüber er nichts sagt.</strong> {v.sagtNichts}
                  </p>
                  {v.quellen?.length ? (
                    <p className="hyp__videoquellen">
                      Passende Arbeiten: <Belege ids={v.quellen} />
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ Quellen */}
      <section className="hyp__quellen" id="quellen">
        <div className="hyp__inhalt">
          <h2>Alle Quellen, je mit ihrer Reichweite</h2>
          <p className="hyp__einleitung">
            {QUELLEN.length} Arbeiten. Zu jeder steht, was untersucht wurde, was
            gezeigt wurde – und der Satz, auf den es ankommt: was sie über unser
            Produkt <em>nicht</em> aussagt. Keine davon hat unseren Anhänger
            untersucht; wo eine Arbeit gegen uns spricht, steht sie trotzdem
            hier.
          </p>

          <ol className="hyp__quellenliste">
            {QUELLEN.map((q) => (
              <li key={q.id} className="hyp__quelle" id={`q-${q.id}`}>
                <p className="hyp__quellenart">{QUELLENART[q.art]}</p>
                <h3>
                  {q.autor} ({q.jahr}): {q.titel}
                </h3>
                <p className="hyp__quellenort">{q.wo}</p>

                <dl className="hyp__reichweite">
                  <dt>Untersucht wurde</dt>
                  <dd>{q.untersucht}</dd>
                  <dt>Gezeigt wurde</dt>
                  <dd>{q.gezeigt}</dd>
                  <dt>Was das über unser Produkt nicht aussagt</dt>
                  <dd className="hyp__nichtueberuns">{q.nichtUeberUns}</dd>
                </dl>

                {q.zitat ? (
                  <blockquote className="hyp__quellenzitat">
                    <p>„{q.zitat}“</p>
                    {q.zitatOrt ? <cite>{q.zitatOrt}</cite> : null}
                  </blockquote>
                ) : null}

                {q.link ? (
                  <p>
                    <a
                      className="hyp__link"
                      href={q.link}
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                    >
                      {q.linkText || 'Zur Arbeit'}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- Bewusstsein */}
      <section className="hyp__bewusstsein">
        <div className="hyp__inhalt">
          <p className="hyp__vorspann">{BEWUSSTSEIN.vorspann}</p>
          <h2>{BEWUSSTSEIN.titel}</h2>

          <p className="hyp__hinweis">{BEWUSSTSEIN.hinweis}</p>

          {BEWUSSTSEIN.absaetze.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}

          <p>
            <a className="hyp__link" href={BEWUSSTSEIN.verweis.href}>
              {BEWUSSTSEIN.verweis.text}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * Beleg-Verweise hinter einer Aussage — Autor und Jahr, verlinkt auf den
 * Quelleneintrag weiter unten auf derselben Seite.
 *
 * BEWUSST KEIN ADJEKTIV UND KEINE ZAHL: der Auftrag verlangt „mit Quellen,
 * nicht mit Adjektiven". Eine leere Liste rendert nichts — das ist der Fall
 * h3/dagegen („für diesen Schritt haben wir keine Messung"), und dort wäre ein
 * erfundener Beleg genau der Fehler, den diese Seite vermeiden soll.
 */
const NAMENSPARTIKEL = new Set([
  'del', 'de', 'della', 'van', 'von', 'di', 'da', 'le', 'la', 'der', 'den',
]);

/**
 * Nachname des Erstautors fuer den Beleg-Verweis („Pollack 2013").
 *
 * ZWEI FALLEN, BEIDE AM ECHTEN BESTAND AUFGEFALLEN UND NICHT VERMUTET — das
 * naheliegende „letztes Wort vor dem Komma" ist fuer 6 der 23 Quellen falsch:
 *
 *  (a) KLAMMERZUSATZ: „Peter C. Dartsch (Dartsch Scientific GmbH)" ergibt
 *      „GmbH)" — betrifft alle fuenf Dartsch-Arbeiten, also genau unsere
 *      eigenen Studien. „Arbeitsgruppe … (Schweiz)" ergibt „(Schweiz)".
 *      Klammerinhalt ist Zugehoerigkeit, nie Name: er faellt zuerst weg.
 *
 *  (b) NAMENSPARTIKEL: „Emilio Del Giudice" ergibt „Giudice" — einen Namen,
 *      den es nicht gibt. Das Partikel gehoert zum Nachnamen.
 *
 * Ein falsch geschriebener Autorenname ist auf einer Quellenseite kein
 * Schoenheitsfehler: er ist genau die Sorte Fehler, die einem Leser zeigt,
 * dass die Quellen nicht geprueft wurden.
 */
function nachname(autor) {
  const ohneKlammer = autor.replace(/\([^)]*\)/g, ' ');
  const teile = ohneKlammer.split(',')[0].trim().split(/\s+/).filter(Boolean);
  if (!teile.length) return autor;
  let i = teile.length - 1;
  while (i > 0 && NAMENSPARTIKEL.has(teile[i - 1].toLowerCase())) i -= 1;
  return teile.slice(i).join(' ');
}

function Belege({ids}) {
  if (!ids?.length) return null;
  return (
    <span className="hyp__belege">
      {ids.map((id, i) => {
        const q = QUELLEN_NACH_ID[id];
        if (!q) return null;
        const name = nachname(q.autor);
        return (
          <span key={id}>
            {i > 0 ? ', ' : ''}
            <a href={`#q-${id}`}>
              {name} {q.jahr}
            </a>
          </span>
        );
      })}
    </span>
  );
}
