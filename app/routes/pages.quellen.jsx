import {Link} from 'react-router';
import {QUELLEN} from '~/data/werk';
import {canonicalLink, absoluteCanonical, CANONICAL_ORIGIN} from '~/lib/seo';
import quellenStyles from '~/styles/werk-quellen.css?url';
import {teilbildTags} from '~/lib/seiten-seo';

const PFAD = '/pages/quellen';

/**
 * Quellenuebersicht des Wissensforums.
 *
 * WARUM DIESE SEITE EXISTIERT — gemessen, nicht vermutet: Kunden fragen im
 * Chat woertlich "Warum nicht einfach einen Link zu den Studien
 * bereitstellen?", und bis zum 2026-09-08 gab es im ganzen Baum keine
 * Quellenuebersicht (0 Treffer). Die Artikel nennen ihre Quellen einzeln —
 * wer eine Angabe nachschlagen will, musste sie im Fliesstext suchen.
 *
 * DIE DATEN KOMMEN AUS `app/data/werk.js` UND WERDEN HIER NICHT GEPFLEGT.
 * Erzeuger ist homepage-bauer/bin/werk-snapshot aus der täglichen Ableitung
 * von blog-redaktion. Es gibt deshalb keine Liste, die jemand nachtragen
 * müsste, und keine, die veralten kann, ohne dass es auffaellt
 * (Frische-Traeger: pruefungen/probe_werk_snapshot_frisch.py).
 *
 * ZWEI ZAEUNE STEHEN SCHON IM ERZEUGER, nicht hier: aufgenommen ist
 * ausschließlich, was ein VEROEFFENTLICHTER Artikel zitiert, und nichts mit
 * totem DOI. Die Begründung für beide steht im Kopf von bin/werk-snapshot.
 *
 * WAS HIER BEWUSST NICHT STEHT: keine Wirkungsaussage, keine Deutung, kein
 * Angebot. Eine Nachschlage-Flaeche, auf der verkauft wird, ist als Beleg
 * nichts mehr wert — und der Leser kommt mit genau einer Absicht hierher.
 */
export const links = () => [{rel: 'stylesheet', href: quellenStyles}];

const TITEL = 'Quellen — alle Arbeiten, auf die wir uns berufen | Qi Blanco';
const BESCHREIBUNG =
  'Jede Studie und jede Arbeit, die in unseren Fachartikeln zitiert wird — ' +
  'mit vollständiger Angabe und dem Weg zurück in den Artikel, der sie benutzt.';

export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  ...teilbildTags(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {
    // CollectionPage statt ItemList mit 56 Eintraegen: die strukturierten
    // Daten sollen beschreiben, WAS die Seite ist. Jede einzelne Quelle als
    // Entitaet auszuzeichnen wäre eine Aussage über fremde Arbeiten, die
    // wir nicht verantworten — und Google zeigt sie ohnehin nicht an.
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteCanonical(PFAD)}#quellen`,
      name: 'Quellenübersicht',
      description: BESCHREIBUNG,
      url: absoluteCanonical(PFAD),
      inLanguage: 'de-DE',
      isPartOf: {'@id': `${CANONICAL_ORIGIN}/#website`},
    },
  },
];

export function loader() {
  return {};
}

/**
 * Eine vollstaendige Angabe, so wie sie ein Leser braucht: wer, wann, was,
 * und wo er es findet. Fehlt ein Teil, faellt genau dieser Teil weg — nie ein
 * Platzhalter und nie eine erfundene Ergänzung.
 */
function Angabe({quelle}) {
  const teile = [quelle.autoren, quelle.jahr && String(quelle.jahr)].filter(
    Boolean,
  );
  return (
    <li className="qb-qu__eintrag">
      <span className="qb-qu__titel">{quelle.titel}</span>
      <span className="qb-qu__angabe">
        {teile.join(' · ')}
        {quelle.doi ? (
          <>
            {teile.length ? ' · ' : null}
            <a
              className="qb-qu__doi"
              href={`https://doi.org/${quelle.doi}`}
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              doi.org/{quelle.doi}
            </a>
          </>
        ) : null}
      </span>
      {quelle.zitiert_in?.length ? (
        <span className="qb-qu__belegt">
          Benutzt in:{' '}
          {quelle.zitiert_in.map((a, i) => (
            <span key={a.slug}>
              {i > 0 ? ', ' : null}
              <Link to={`/blogs/wissen/${a.slug}`}>{a.titel}</Link>
            </span>
          ))}
        </span>
      ) : null}
    </li>
  );
}

export default function QuellenSeite() {
  return (
    <div className="qb-qu">
      <div className="qb-qu__inhalt">
        <h1>Quellen</h1>
        <p className="qb-qu__vorspann">
          Wenn in einem unserer Artikel eine Zahl oder eine Studie vorkommt,
          steht sie hier mit vollständiger Angabe — damit Sie sie nachschlagen
          können, statt sie glauben zu müssen. Jeder Eintrag nennt den Artikel,
          der ihn benutzt.
        </p>

        <h2>Alle Arbeiten, auf die wir uns berufen</h2>
        <ul className="qb-qu__liste">
          {QUELLEN.map((q) => (
            <Angabe key={`${q.titel}-${q.jahr ?? ''}`} quelle={q} />
          ))}
        </ul>

        <p className="qb-qu__zu-den-artikeln">
          <Link to="/blogs/wissen">Zurück zu den Fachartikeln</Link>
        </p>
      </div>
    </div>
  );
}
