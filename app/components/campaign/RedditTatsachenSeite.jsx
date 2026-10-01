import {useGoogleRating} from '~/lib/googleRating';
import {
  FAEDEN,
  FRAGEN,
  FREMD,
  GENANNT,
  KOPF,
  SELBST,
  STIMMEN,
} from '~/data/reddit-tatsachen';

/**
 * /pages/was-auf-reddit-ueber-qi-blanco-steht — eine Zählung mit Quelle und
 * Stand, als FLIESSTEXT.
 *
 * WAS DER SUCHENDE WILL: wer „Qi Blanco Reddit" eingibt, sucht ungefilterte
 * Stimmen von Menschen, die das Produkt tragen. Die Seite beantwortet genau
 * das zuerst (Hausstimme: Antwort zuerst) und zeigt danach, wo solche Stimmen
 * tatsächlich stehen.
 *
 * ALLE ZAHLEN KOMMEN AUS DEM DATENMODUL (Anzahl der Fäden aus `FAEDEN`), die
 * Google-Note aus `useGoogleRating()`, derselben Variablen wie das sichtbare
 * Badge. Ein Literal wäre am Tag seiner Niederschrift richtig und danach
 * falsch.
 *
 * WAS HIER NICHT STEHT, und warum (Brain-Regel bestmoegliches-licht-kritik-
 * nicht-selbst-verbreiten): kein Zitat aus einem Faden, kein Link auf einen
 * Faden, dessen Beiträge spotten. Gezeigt wird, WAS dort steht, nicht, was
 * dort gesagt wird. Die Links auf die zwei unbeantworteten Fragen bleiben: sie
 * sind der Beleg dafür, dass dort nichts steht.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * Kaufknopf. Externe Links öffnen mit rel="noopener noreferrer nofollow".
 */
export function RedditTatsachenSeite() {
  const g = useGoogleRating();
  const fremd = FAEDEN.filter((f) => f.bezug === 'fremd');

  return (
    <div className="rdt">
      <section className="rdt__kopf" data-section="rdt-kopf">
        <div className="rdt__inhalt">
          <p className="rdt__vorspann">{KOPF.vorspann}</p>
          <h1>{KOPF.titel}</h1>
          <p className="rdt__lead">{KOPF.lead}</p>
          <p className="rdt__quelle">Quelle: {KOPF.quelle}</p>
        </div>
      </section>

      <section data-section="rdt-fremd">
        <div className="rdt__inhalt">
          <h2>{FREMD.titel}</h2>
          <p className="rdt__einleitung">{FREMD.einleitung}</p>
          <ul className="rdt__fremdliste">
            {fremd.map((f) => (
              <li className="rdt__faden" key={f.id} data-reddit-id={f.id}>
                <p>{f.text}</p>
                <p className="rdt__quelle">
                  {f.link ? (
                    <a
                      className="rdt__link"
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {f.forum}
                    </a>
                  ) : (
                    f.forum
                  )}
                  , {f.monat}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rdt__genannt" data-section="rdt-genannt">
        <div className="rdt__inhalt">
          <h2>{GENANNT.titel}</h2>
          <p className="rdt__einleitung">{GENANNT.einleitung}</p>
          <ol className="rdt__genanntliste">
            {GENANNT.eintraege.map((e) => (
              <li className="rdt__eintrag" key={e.id} id={e.id}>
                <h3>{e.titel}</h3>
                <p>{e.text}</p>
                {e.faeden ? (
                  <p className="rdt__quelle">
                    Quelle:{' '}
                    {e.faeden.map((f, i) => (
                      <span key={f.id} data-reddit-id={f.id}>
                        {i > 0 ? ' und ' : null}
                        <a
                          className="rdt__link"
                          href={f.link}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          {f.forum}
                        </a>
                      </span>
                    ))}
                    , {e.faeden[0].monat}
                  </p>
                ) : null}
                {e.weiter ? (
                  <p className="rdt__quelle">
                    <a className="rdt__link" href={e.weiter.pfad}>
                      {e.weiter.text}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-section="rdt-stimmen">
        <div className="rdt__inhalt">
          <h2>{STIMMEN.titel}</h2>
          <p>
            Qi Blanco steht bei Google auf {g.komma} von 5 Sternen aus{' '}
            {g.total} Rezensionen. Bewertet wird das Unternehmen, nicht ein
            einzelnes Produkt. Die Stimmen stehen bei Google, nicht bei uns,
            und du kannst jede einzeln lesen.
          </p>
          <p className="rdt__quelle">
            Quelle: Google-Rezensionen über Qi Blanco.{' '}
            <a
              className="rdt__link"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Alle {g.total} Bewertungen ansehen
            </a>
          </p>
          <p className="rdt__absatz">{STIMMEN.studie.text}</p>
          <p className="rdt__quelle">
            Quelle:{' '}
            <a className="rdt__link" href={STIMMEN.studie.belegPfad}>
              {STIMMEN.studie.beleg}
            </a>
          </p>
          <p className="rdt__absatz">
            {STIMMEN.videos.text}{' '}
            <a className="rdt__link" href={STIMMEN.videos.pfad}>
              {STIMMEN.videos.linktext}
            </a>
          </p>
        </div>
      </section>

      <section className="rdt__kurz" data-section="rdt-kurz">
        <div className="rdt__inhalt">
          <h2>Kurz gefragt</h2>
          <dl className="rdt__fragen">
            {FRAGEN.map((f) => (
              <div className="rdt__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rdt__selbst" data-section="rdt-selbst">
        <div className="rdt__inhalt">
          <h2>{SELBST.titel}</h2>
          <p>{SELBST.text}</p>
          <p className="rdt__weiter">
            <a className="rdt__link" href="/pages/neu-oder-gebraucht">
              Beide Fristen mit Quelle
            </a>{' '}
            ·{' '}
            <a className="rdt__link" href="/pages/kritik">
              Was belegt ist und was nicht
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
