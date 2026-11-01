import {Link} from 'react-router';
import {KursApple} from './KursApple';

/*
 * APPLE-FASSUNG /pages/quellen (Grossjob 20261029-GROSSJOB-alle-shop-seiten-
 * apple-niveau-ausser-seo-geo, s07-r4). Dieselbe Nachschlage-Fläche wie C
 * (routes/pages.quellen.jsx): dieselben Daten aus app/data/werk.js, kein
 * Angebot, keine Wirkungsaussage. Neu ist nur der Satzspiegel der Apple-
 * Lesefassung (KursApple: Lesebreite, Typo-Skala, ein Bild-Radius), der Weg
 * zurück in die Fachartikel als Knopf (Kurs-Navigation, kein zweiter H2-Stil)
 * und Anna am Ende.
 *   return appleSeite?.an ? <QuellenApple seite={appleSeite.seite} quellen={QUELLEN} /> : <C />;
 */

/* Eine vollständige Angabe wie in C: wer, wo, wann, Hinweis. Fehlt ein Teil,
   fällt genau dieser Teil weg, nie ein Platzhalter. */
export function angabeTeile(quelle) {
  const jahr = quelle.jahr && String(quelle.jahr);
  const jahrSchonDa =
    quelle.fundstelle?.includes(jahr) || quelle.autoren?.includes(`(${jahr})`);
  return [
    quelle.autoren,
    quelle.fundstelle,
    jahr && !jahrSchonDa ? jahr : null,
    quelle.hinweis,
  ].filter(Boolean);
}

function Eintrag({quelle}) {
  const teile = angabeTeile(quelle);
  return (
    <li>
      <p>
        <strong>{quelle.titel}</strong>
        <br />
        {teile.join(' · ')}
        {quelle.doi ? (
          <>
            {teile.length ? ' · ' : null}
            <a
              href={`https://doi.org/${quelle.doi}`}
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              doi.org/{quelle.doi}
            </a>
          </>
        ) : null}
        {quelle.zitiert_in?.length ? (
          <>
            <br />
            Benutzt in:{' '}
            {quelle.zitiert_in.map((a, i) => (
              <span key={a.slug}>
                {i > 0 ? ', ' : null}
                <Link to={`/blogs/wissen/${a.slug}`}>{a.titel}</Link>
              </span>
            ))}
          </>
        ) : null}
      </p>
    </li>
  );
}

export function QuellenApple({seite, quellen}) {
  return (
    <KursApple seite={seite}>
      <article className="course-lesson">
        <h1>Quellen</h1>
        <div className="course-lesson-body">
          <p>
            Alle Studien und Arbeiten, die unsere Fachartikel zitieren, mit
            vollständiger Angabe und dem Artikel, in dem sie vorkommen.
          </p>
          <h2>Alle Arbeiten, auf die wir uns berufen</h2>
          <ul>
            {quellen.map((q) => (
              <Eintrag key={`${q.titel}-${q.jahr ?? ''}`} quelle={q} />
            ))}
          </ul>
        </div>
        <p className="course-lesson__nav">
          <a
            className="btn btn--primary as-knopf"
            href="/blogs/wissen"
            data-as-cta="primary"
          >
            Zu den Fachartikeln
          </a>
        </p>
      </article>
    </KursApple>
  );
}

export default QuellenApple;
