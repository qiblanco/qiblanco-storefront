import {quellenFuer} from '~/data/fragen';

/**
 * Eine Frage aus app/data/fragen.js als ABSCHNITT einer anderen Seite.
 *
 * Seit 07.10.2026 sind mehrere Frageseiten in stärkere Seiten aufgegangen
 * (Job 20261007-seo-zusammenlegung-duenne-seiten-301-umsetzen; Liste in
 * app/lib/zusammenlegungen.js). Ihr Inhalt zieht unverändert mit: Antwort,
 * Begründung, Beleg, „Gut zu wissen" und Quellen, in derselben Reihenfolge
 * wie auf der früheren Frageseite. Die Antwort steht vor der ersten
 * Zwischenüberschrift; ein Antwortsystem schneidet am Abschnitt, und genau
 * dieser Abschnitt ist jetzt das Ziel des 301 (Anker = Slug).
 *
 * KEINE EIGENE TYPOGRAFIE. Überschriften und Absätze erben die Stile der
 * Gastseite; frage-abschnitt.css setzt nur Abstand, Lesemaß, die Linie am
 * Antwortsatz und die Quellenliste. Eine eigene Schriftskala würde die
 * Design-Rubrik jeder Gastseite verschieben. Wo die Gastseite schon die
 * Frageseiten-Stile hat (was-ist-elektrosmog), übergibt sie deren Klassen.
 *
 * Der Marker data-geo sitzt wie auf der Frageseite an Frage und Antwort.
 *
 * ÜBERSCHRIFT UND ANTWORTSATZ JE GASTSEITE (seit 21.10.2026, SEO-Maßnahme
 * M-SP-20261017-studien, Job seo-2026-w43-l26-studien-3fbe-...): `frage` und
 * `antwort` ersetzen nur auf DIESER Gastseite die zwei Zeilen aus
 * app/data/fragen.js. Der Datensatz bleibt, weil andere Seiten (FAQ-Liste,
 * Lexikon-Verweise) dieselbe Frage im alten Wortlaut führen; eine
 * Gewinnerseite wie /pages/faq soll sich nicht mitbewegen, weil eine andere
 * Seite einen Suchbegriff braucht. Ohne die zwei Props rendert der Abschnitt
 * wie bisher.
 *
 * @param {{
 *   seite: import('~/data/fragen').FrageSeite,
 *   klassen?: {abschnitt?: string, inhalt?: string, antwort?: string,
 *     quellen?: string},
 *   frage?: string,
 *   antwort?: string,
 * }} props
 */
export function FrageAbschnitt({seite, klassen = {}, frage, antwort}) {
  if (!seite) return null;
  const quellen = quellenFuer(seite);
  const {"begruendung": absaetze} = seite;
  const titelId = `${seite.slug}-titel`;
  return (
    <section
      id={seite.slug}
      className={klassen.abschnitt || 'frage-abschnitt'}
      data-section={`frage-abschnitt-${seite.slug}`}
      aria-labelledby={titelId}
    >
      <div className={klassen.inhalt || 'frage-abschnitt__inhalt'}>
        <h2 id={titelId} data-geo="frage">
          {frage || seite.frage}
        </h2>
        <p
          className={klassen.antwort || 'frage-abschnitt__antwort'}
          data-geo="antwort"
        >
          {antwort || seite.antwort}
        </p>
        {absaetze.map((absatz) => (
          <p key={absatz.slice(0, 48)}>{absatz}</p>
        ))}

        <h3>{seite.beleg_titel || 'Was gemessen ist'}</h3>
        {seite.beleg.map((absatz) => (
          <p key={absatz.slice(0, 48)}>{absatz}</p>
        ))}

        {seite.offen?.length > 0 ? (
          <>
            <h3>Gut zu wissen</h3>
            {seite.offen.map((absatz) => (
              <p key={absatz.slice(0, 48)}>{absatz}</p>
            ))}
          </>
        ) : null}

        {quellen.length > 0 ? (
          <>
            <h3>Woher das kommt</h3>
            <ul className={klassen.quellen || 'frage-abschnitt__quellen'}>
              {quellen.map((q) => (
                <li key={q.url}>
                  <a href={q.url} rel="noopener noreferrer" target="_blank">
                    {q.zitat}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
