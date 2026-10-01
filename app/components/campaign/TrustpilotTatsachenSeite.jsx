import {useGoogleRating} from '~/lib/googleRating';
import {
  FRAGEN,
  FREMD,
  KOPF,
  PROFIL,
  PROFIL_ABSCHNITT,
  SELBST,
  STIMMEN,
  VERTEILUNG,
  ZAHL,
} from '~/data/trustpilot-tatsachen';

/**
 * /pages/qi-blanco-auf-trustpilot — eine Nachlese mit Quelle und Stand, als
 * FLIESSTEXT.
 *
 * WAS DER SUCHENDE WILL: wer „Qi Blanco Trustpilot" eingibt, prüft, ob er
 * dem Unternehmen trauen kann, und sucht Bewertungen, die nicht von uns
 * kommen. Die Seite beantwortet zuerst, was auf Trustpilot steht und wer es
 * geschrieben hat (Hausstimme: Antwort zuerst), danach, wo es mehr Stimmen
 * gibt.
 *
 * ALLE ZAHLEN KOMMEN AUS DEM DATENMODUL (Anzahl und Verteilung aus
 * `PROFIL.sterne`), die Google-Note aus `useGoogleRating()`, derselben
 * Variablen wie das sichtbare Badge. Ein Literal wäre am Tag seiner
 * Niederschrift richtig und danach falsch.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * Kaufknopf. Externe Links öffnen mit rel="noopener noreferrer nofollow".
 */
export function TrustpilotTatsachenSeite() {
  const g = useGoogleRating();

  return (
    <div className="tpt">
      <section className="tpt__kopf" data-section="tpt-kopf">
        <div className="tpt__inhalt">
          <p className="tpt__vorspann">{KOPF.vorspann}</p>
          <h1>{KOPF.titel}</h1>
          <p className="tpt__lead">{KOPF.lead}</p>
          <p className="tpt__quelle">Quelle: {KOPF.quelle}</p>
        </div>
      </section>

      <section data-section="tpt-profil">
        <div className="tpt__inhalt">
          <h2>{PROFIL_ABSCHNITT.titel}</h2>
          <p className="tpt__einleitung">{PROFIL_ABSCHNITT.einleitung}</p>
          <ul className="tpt__verteilung" aria-label="Bewertungen nach Sternen">
            {VERTEILUNG.map((v) => (
              <li className="tpt__zeile" key={v.sterne} data-sterne={v.sterne}>
                <p>
                  {v.sterne === 1 ? 'Ein Stern' : `${v.sterne} Sterne`}:{' '}
                  {v.anzahl === 0
                    ? 'keine Bewertung'
                    : v.anzahl === 1
                      ? 'eine Bewertung'
                      : `${v.anzahl} Bewertungen`}
                </p>
              </li>
            ))}
          </ul>
          <ol className="tpt__punkte">
            {PROFIL_ABSCHNITT.punkte.map((p) => (
              <li className="tpt__punkt" key={p.id} id={p.id}>
                <h3>{p.titel}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <p className="tpt__quelle">
            Quelle:{' '}
            <a
              className="tpt__link"
              href={PROFIL.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Alle {ZAHL.alle} Bewertungen bei Trustpilot lesen
            </a>
          </p>
        </div>
      </section>

      <section className="tpt__fremd" data-section="tpt-fremd">
        <div className="tpt__inhalt">
          <h2>{FREMD.titel}</h2>
          <p>{FREMD.text}</p>
          <p className="tpt__quelle">{FREMD.quelle}</p>
        </div>
      </section>

      <section data-section="tpt-stimmen">
        <div className="tpt__inhalt">
          <h2>{STIMMEN.titel}</h2>
          <p>
            Qi Blanco steht bei Google auf {g.komma} von 5 Sternen aus{' '}
            {g.total} Rezensionen. Bewertet wird das Unternehmen, nicht ein
            einzelnes Produkt. Die Stimmen stehen bei Google, nicht bei uns,
            und du kannst jede einzeln lesen.
          </p>
          <p className="tpt__quelle">
            Quelle: Google-Rezensionen über Qi Blanco.{' '}
            <a
              className="tpt__link"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Alle {g.total} Bewertungen ansehen
            </a>
          </p>
          <p className="tpt__absatz">{STIMMEN.studie.text}</p>
          <p className="tpt__quelle">
            Quelle:{' '}
            <a className="tpt__link" href={STIMMEN.studie.belegPfad}>
              {STIMMEN.studie.beleg}
            </a>
          </p>
          <p className="tpt__absatz">
            {STIMMEN.videos.text}{' '}
            <a className="tpt__link" href={STIMMEN.videos.pfad}>
              {STIMMEN.videos.linktext}
            </a>
          </p>
        </div>
      </section>

      <section className="tpt__kurz" data-section="tpt-kurz">
        <div className="tpt__inhalt">
          <h2>Kurz gefragt</h2>
          <dl className="tpt__fragen">
            {FRAGEN.map((f) => (
              <div className="tpt__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="tpt__selbst" data-section="tpt-selbst">
        <div className="tpt__inhalt">
          <h2>{SELBST.titel}</h2>
          <p>{SELBST.text}</p>
          <p className="tpt__weiter">
            <a className="tpt__link" href="/pages/bewertungen">
              Alle Google-Bewertungen live
            </a>{' '}
            ·{' '}
            <a className="tpt__link" href="/pages/neu-oder-gebraucht">
              Beide Fristen mit Quelle
            </a>{' '}
            ·{' '}
            <a className="tpt__link" href="/pages/kritik">
              Was belegt ist und was nicht
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
