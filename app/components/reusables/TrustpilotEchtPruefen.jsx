import {ECHT} from '~/data/trustpilot-tatsachen';

/**
 * „Woran du echte Trustpilot-Bewertungen erkennst" — Abschnitt am Ende von
 * /pages/qi-blanco-auf-trustpilot (SEO-Massnahme L26-qi-blanco-auf-trustpil-
 * 8b09, Begriff „sind trustpilot bewertungen echt").
 *
 * EIGENE reusables-Komponente statt Eingriff in campaign/ (harte Flaeche
 * Kaufweg): die Route rendert sie direkt nach <TrustpilotTatsachenSeite />.
 * Eigene Huelle `.tpt`, damit die Seiten-Tokens (trustpilot-tatsachen.css)
 * greifen; gleiche Bauteile wie die Profil-Punkte (nummerierte Liste, EIN
 * Gold-Akzent als Linie am Punkt-Titel).
 *
 * Text und Daten kommen aus `ECHT` (app/data/trustpilot-tatsachen.js), keine
 * Anzahl, keine Fremdnote. Externer Link mit nofollow wie im Bestand.
 * TRACKING-NAHT: keine Cookies, kein Key, kein Kaufknopf.
 */
function BeiUns({b}) {
  if (!b) return null;
  return (
    <p className="tpt__beiuns">
      {b.vor}
      {b.link ? (
        b.link.extern ? (
          <a
            className="tpt__link"
            href={b.link.pfad}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {b.link.text}
          </a>
        ) : (
          <a className="tpt__link" href={b.link.pfad}>
            {b.link.text}
          </a>
        )
      ) : null}
      {b.nach || null}
    </p>
  );
}

export function TrustpilotEchtPruefen() {
  return (
    <div className="tpt tpt--echt">
      <section className="tpt__echt" data-section="tpt-echt">
        <div className="tpt__inhalt">
          <h2>{ECHT.titel}</h2>
          <p className="tpt__einleitung">{ECHT.einleitung}</p>
          <ol className="tpt__punkte">
            {ECHT.punkte.map((p) => (
              <li className="tpt__punkt" key={p.id} id={p.id}>
                <h3>{p.titel}</h3>
                <p>{p.pruefen}</p>
                <BeiUns b={p.beiUns} />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
