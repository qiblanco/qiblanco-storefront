import {BEWERTUNGEN_SEITE} from '~/data/bewertungen-seite';
import {useGoogleRating} from '~/lib/googleRating';
import {PROFIL, STAND_TEXT} from '~/data/trustpilot-tatsachen';

const T = BEWERTUNGEN_SEITE.elektrosmog;

/**
 * /pages/bewertungen, Abschnitt „Bewertungen von Elektrosmog-Schutz: worauf es
 * ankommt" (2026-11-10, Grossjob seo-2026-w44-l26-bewertungen-4afb-sollseite-
 * ohne-begriff-ohne-, s02, Maßnahme M-SP-20261017-bewertungen).
 *
 * WARUM EINE EIGENE KOMPONENTE UND NICHT IN BewertungenSeite.jsx: Dateien unter
 * app/components/campaign gelten im Pool als harte Fläche „kaufweg"
 * (worker-pool/config/harte-flaechen.json). Ein Maschinenauftrag fasst sie
 * nicht an. Die Route rendert diesen Abschnitt deshalb direkt nach
 * <BewertungenSeite />, mit eigenem `.bew`-Wrapper (gleiche Tokens aus
 * app/styles/bewertungen.css, kein neuer Wert).
 *
 * DIE ZAHLEN SIND NIE EIN LITERAL. Google: dieselbe useGoogleRating()-
 * Variable wie Widget und NoteSatz; bei Feed-Ausfall (source 'fallback') oder
 * fehlenden Zahlen entfällt NUR der Google-Satz. Die Anzahl trägt
 * `data-zeitachse="anzahl"` (Pixelvergleich setzt dort einen festen Text ein,
 * siehe Kopf von NoteSatz). Trustpilot: TrustScore und Stand aus
 * app/data/trustpilot-tatsachen.js. KEINE Trustpilot-Anzahl (Christian
 * 2026-10-06), und der TrustScore heißt TrustScore, nicht Durchschnitt.
 *
 * `<data>` statt `<span>` um die Anzahl: Proben lesen Sätze per Regex bis zum
 * ersten `</span>` (siehe NoteSatz).
 */
function GoogleSatz({g}) {
  if (!g || g.source === 'fallback') return null;
  if (typeof g.value !== 'number' || typeof g.total !== 'number') return null;
  return (
    <>
      Bei Google steht Qi Blanco auf {g.komma} von 5 Sternen aus{' '}
      <data value={g.total} data-zeitachse="anzahl">
        {g.total}
      </data>{' '}
      Rezensionen.{' '}
    </>
  );
}

export function BewertungenElektrosmog() {
  const g = useGoogleRating();
  return (
    <div className="bew">
      <section className="bew__elektrosmog" data-section="bew-elektrosmog">
        <div className="bew__inhalt">
          <h2>{T.titel}</h2>
          <p>
            <GoogleSatz g={g} />
            Auf{' '}
            <a href={PROFIL.url} target="_blank" rel="noopener noreferrer">
              Trustpilot
            </a>{' '}
            hat Qi Blanco einen TrustScore von {PROFIL.trustscore} von 5, Stand{' '}
            {STAND_TEXT}.
          </p>
          <p>{T.pruefbar}</p>
          <p>
            {T.googleKonto}{' '}
            {PROFIL.einladungen === 0 ? <>{T.ohneEinladung} </> : null}
            {T.freiwillig}
          </p>
          <p>{T.vergleich}</p>
          <ul className="bew__weiter">
            <li>
              <a href={T.link.pfad}>{T.link.text}</a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
