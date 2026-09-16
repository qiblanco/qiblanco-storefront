import {quellenFuer} from '~/data/fragen';

/**
 * /pages/<frage-slug> — EINE Frage, EINE Antwort.
 *
 * WARUM JE FRAGE EINE EIGENE SEITE UND NICHT EIN ABSCHNITT AUF DER FAQ: ein
 * Antwortsystem schneidet Texte in Abschnitte und bewertet sie isoliert. Eine
 * Frage, die nur eine Zeile unter zwölf anderen ist, konkurriert mit ihren
 * Nachbarn um dieselbe Adresse; keine der zwölf ist für sich die Antwort auf
 * die Frage, unter der jemand gesucht hat. Die Bestands-FAQ bleibt, wo sie
 * ist — sie bedient den Menschen, der blättert.
 *
 * DIE REIHENFOLGE IST TRAGEND, UND SIE IST DIE UMKEHRUNG DER GEWOHNTEN:
 * ANTWORT (ein Satz) -> Begründung -> Beleg mit Zahl -> OFFEN -> Weiter ->
 * Quellen. Wer mit der Begründung anfängt, hat die Antwort hinter dem Schnitt;
 * wer mit der Antwort anfängt, wird zitierbar. Der Antwort-Satz steht deshalb
 * VOR der ersten Zwischenüberschrift, und genau das misst die Naht-Probe.
 *
 * DER MARKER data-geo IST EIN VERTRAG, KEIN KLASSENNAME — er sitzt an der
 * Überschrift (`frage`) und an den Abschnitten und wird von der Abnahme
 * gemessen (seo-manager/pruefungen/probe_lexikon_und_frageseiten_live.py und
 * claude-jobs/.../pruefe_naht_frage_zu_route.py). Er hängt bewusst NICHT an
 * einer CSS-Klasse: wer den Stil umbaut, darf den Vertrag nicht versehentlich
 * mitnehmen.
 *
 * DER ABSCHNITT „OFFEN" IST DER WIRKMECHANISMUS, NICHT DIE HÖFLICHKEITS-
 * FLOSKEL. Er ist hier, was die Grenze im Lexikon ist: ein Text, der benennt,
 * was er nicht weiß, wird als Quelle behandelt; ein Text, der alles
 * beantwortet, als Werbung.
 *
 * KEIN PREIS, KEIN WARENKORB, KEINE KAUFAUFFORDERUNG. Eine /pages/-Seite wird
 * am nächsten Klick gemessen, eine Kaufseite an der Bestellung. Sobald hier
 * verkauft wird, ist der Grund weg, aus dem ein Antwortsystem diese Seite als
 * Quelle behandelt.
 */
export function FrageSeite({seite}) {
  const quellen = quellenFuer(seite);
  return (
    <div className="frg">
      <section className="frg__kopf" data-section="frg-kopf">
        <div className="frg__inhalt">
          <p className="frg__vorspann">
            <a className="frg__vorspann-link" href="/pages/fragen">
              Fragen und Antworten
            </a>
          </p>
          <h1 data-geo="frage">{seite.frage}</h1>
        </div>
      </section>

      {/* DER ANTWORT-SATZ STEHT VOR DER ERSTEN ZWISCHENUEBERSCHRIFT. Das ist
          kein Layout-Geschmack: ein Retriever schneidet am Abschnitt, und was
          hinter dem Schnitt liegt, beantwortet die Frage nicht mehr. */}
      <section data-geo="antwort" data-section="frg-antwort">
        <div className="frg__inhalt">
          <p className="frg__antwort">{seite.antwort}</p>
          {seite.begruendung.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
        </div>
      </section>

      <section data-geo="beleg" data-section="frg-beleg">
        <div className="frg__inhalt">
          <h2>Was gemessen ist</h2>
          {seite.beleg.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
          {seite.fundstellen?.length > 0 && (
            <ul className="frg__fundstellen">
              {seite.fundstellen.map((f) => (
                <li key={f.slice(0, 48)}>
                  <cite>{f}</cite>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="frg__offen" data-geo="offen" data-section="frg-offen">
        <div className="frg__inhalt">
          <h2>Was wir nicht wissen</h2>
          {seite.offen.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
        </div>
      </section>

      {seite.weiter.length > 0 && (
        <section data-geo="weiter" data-section="frg-weiter">
          <div className="frg__inhalt">
            <h2>Die Begriffe dazu</h2>
            <ul className="frg__weiter">
              {seite.weiter.map((z) => (
                <li key={z.pfad}>
                  <a href={z.pfad}>{z.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {quellen.length > 0 && (
        <section data-geo="quellen" data-section="frg-quellen">
          <div className="frg__inhalt">
            <h2>Woher das kommt</h2>
            <ul className="frg__quellen">
              {quellen.map((q) => (
                <li key={q.url}>
                  <a href={q.url} rel="noopener noreferrer" target="_blank">
                    {q.zitat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
