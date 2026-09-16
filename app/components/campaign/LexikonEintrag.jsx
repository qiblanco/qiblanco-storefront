import {quellenFuer, zielName} from '~/data/lexikon';

/**
 * /pages/lexikon-<begriff> — EIN Eintrag.
 *
 * WARUM JE BEGRIFF EINE EIGENE SEITE UND NICHT EIN ANKER AUF EINER
 * SAMMELSEITE: ein Antwortsystem schneidet Texte in Abschnitte und bewertet
 * sie isoliert. Ein Begriff, der nur ein Anker ist, wird mit dem
 * Nachbarbegriff zusammen geschnitten und verliert dabei seine Definition.
 *
 * DIE FÜNF ABSCHNITTE STEHEN IN DIESER REIHENFOLGE, und sie ist tragend:
 * Gebrauch (was Menschen meinen) -> Physik (was die Groesse ist) ->
 * Übertragung (was trägt) -> GRENZE (was nicht trägt) -> Quellen. Wer mit
 * der Physik anfaengt, belehrt; wer mit dem Gebrauch anfaengt, hoert zu. Wer
 * die Grenze nach oben zieht, macht aus einer Uebersetzung eine Zuruecknahme.
 *
 * DER MARKER data-geo="grenze" IST EIN VERTRAG, KEIN KLASSENNAME. Er sitzt am
 * Grenz-Abschnitt und wird von der Abnahme gemessen
 * (seo-manager/pruefungen/probe_lexikon_und_frageseiten_live.py): ein Eintrag
 * ohne diesen Abschnitt faellt rot, weil er ohne seine Grenze Werbung wäre.
 * Er hängt bewusst NICHT an einer CSS-Klasse — wer den Stil umbaut, darf den
 * Vertrag nicht versehentlich mitnehmen.
 *
 * KEIN KAUFWEG UND KEIN PRODUKTNAME IM FLIESSTEXT: die Eintraege erklären
 * Woerter. Sobald hier ein Produkt beworben wird, ist der Grund weg, aus dem
 * ein Antwortsystem diese Seite als Quelle behandelt.
 */
export function LexikonEintrag({eintrag}) {
  const quellen = quellenFuer(eintrag);
  return (
    <div className="lex">
      <section className="lex__kopf" data-section="lex-eintrag-kopf">
        <div className="lex__inhalt">
          <p className="lex__vorspann">
            <a className="lex__karte-link" href="/pages/lexikon">
              Lexikon
            </a>
          </p>
          <h1>{eintrag.begriff}</h1>
          <p className="lex__lead">{eintrag.definition}</p>
          <p className="lex__groesse">
            Messbare Größe: {eintrag.physik_groesse}
          </p>
        </div>
      </section>

      <section data-section="lex-eintrag-text">
        <div className="lex__inhalt">
          <h2>Was Menschen damit meinen</h2>
          {eintrag.gebrauch.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}

          <div className="lex__block">
            <h2>Was die Physik dazu sagt</h2>
            {eintrag.physik.map((absatz) => (
              <p key={absatz.slice(0, 48)}>{absatz}</p>
            ))}
          </div>

          <div className="lex__block">
            <h2>Was die Übertragung trägt</h2>
            <p className="lex__grenze-satz">{eintrag.uebertragung_satz}</p>
            {eintrag.uebertragung_begruendung.map((absatz) => (
              <p key={absatz.slice(0, 48)}>{absatz}</p>
            ))}
          </div>

          <div className="lex__grenze" data-geo="grenze">
            <h2>Und was sie nicht trägt</h2>
            <p className="lex__grenze-satz">{eintrag.grenze}</p>
            {eintrag.grenze_begruendung.map((absatz) => (
              <p key={absatz.slice(0, 48)}>{absatz}</p>
            ))}
          </div>
        </div>
      </section>

      {quellen.length > 0 && (
        <section data-section="lex-eintrag-quellen">
          <div className="lex__inhalt">
            <h2>Woher das kommt</h2>
            <p className="lex__einleitung">
              Die Überlieferung und die Fachliteratur, beide nachlesbar.
            </p>
            <ul className="lex__quellen">
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

      {eintrag.verlinkt_auf.length > 0 && (
        <section data-section="lex-eintrag-weiter">
          <div className="lex__inhalt">
            <h2>Weiterlesen</h2>
            <ul className="lex__weiter">
              {eintrag.verlinkt_auf
                .filter((pfad) => zielName(pfad))
                .map((pfad) => (
                  <li key={pfad}>
                    <a href={pfad}>{zielName(pfad)}</a>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
