import {Bewertungsblock} from '~/components/reusables/Bewertungsblock';
import {BEWERTUNGEN_SEITE as T} from '~/data/bewertungen-seite';

/**
 * /pages/bewertungen — die Seite hinter der Suche „Qi Blanco Bewertungen".
 *
 * REIHENFOLGE, und sie ist tragend: ANTWORT (ein Satz, vor der ersten
 * Zwischenüberschrift) -> die Bewertungen selbst -> Herkunft -> Grenzen ->
 * Selbst prüfen. Wer die Seite wegen der Bewertungen aufruft, sieht sie nach
 * dem ersten Satz; wer wissen will, ob sie echt sind, liest direkt darunter,
 * woher sie kommen. Beweis ist ein Closer, kein Hook (Kaufüberzeugungs-Kanon):
 * die Studien stehen deshalb als Weiterweg am Ende, nicht oben.
 *
 * DER BEWERTUNGSBLOCK IST DER STANDARD-BAUSTEIN (Christian 2026-09-20, Gate 19
 * homepage-bauer/src/bewertungsblock_standard.py): beide Hälften in EINEM
 * Wrapper, Block-Eigenschaften (Fläche, Polsterung, Breite) auf dem Wrapper
 * `.bew__bewertungen`, nie auf einer Hälfte. Die data-section-Namen tragen den
 * Präfix `bew-`, weil sie der Schlüssel in verhalten.db sind und diese Seite
 * ihre eigene Historie bekommt.
 *
 * KEIN PREIS, KEIN WARENKORB. Eine /pages/-Seite wird am nächsten Klick
 * gemessen, eine Kaufseite an der Bestellung. Der Ausgang ist „ansehen" und
 * „selbst prüfen", nicht „kaufen".
 *
 * KEIN EIGENER LOADER: Note, Anzahl und Rezensionen kommen aus dem root-Loader
 * (app/lib/googleRating.js, Reputon-Feed, server-gecacht). Diese Seite fragt
 * nichts Zusätzliches ab.
 */
export function BewertungenSeite() {
  return (
    <div className="bew">
      <section className="bew__kopf" data-section="bew-kopf">
        <div className="bew__inhalt">
          <p className="bew__vorspann">{T.vorspann}</p>
          <h1>{T.titel}</h1>
          {/* DER ANTWORT-SATZ STEHT VOR DER ERSTEN ZWISCHENUEBERSCHRIFT — ein
              Retriever schneidet am Abschnitt; was dahinter liegt, beantwortet
              die Frage nicht mehr. */}
          <p className="bew__antwort">{T.antwort}</p>
          {T.einleitung.map((absatz) => (
            <p className="bew__lead" key={absatz.slice(0, 48)}>
              {absatz}
            </p>
          ))}
        </div>
      </section>

      {/* DIE BEWERTUNGEN SELBST — der Standard-Baustein, beide Hälften, ein
          Wrapper. Note und Anzahl kommen unverändert aus dem Widget. */}
      <section className="bew__bewertungen" data-section="bew-bewertungen">
        <Bewertungsblock praefix="bew-" wrapperKlasse="bew__block" />
      </section>

      <section className="bew__herkunft" data-section="bew-herkunft">
        <div className="bew__inhalt">
          <h2>{T.herkunft.titel}</h2>
          {T.herkunft.absaetze.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
        </div>
      </section>

      <section data-section="bew-grenzen">
        <div className="bew__inhalt">
          <h2>{T.grenzen.titel}</h2>
          {T.grenzen.absaetze.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
          <ul className="bew__weiter">
            {T.grenzen.links.map((l) => (
              <li key={l.pfad}>
                <a href={l.pfad}>{l.text}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bew__pruefen" data-section="bew-pruefen">
        <div className="bew__inhalt">
          <h2>{T.pruefen.titel}</h2>
          {T.pruefen.absaetze.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
          <p className="bew__fristen">
            <a href={T.pruefen.fristen.pfad}>{T.pruefen.fristen.text}</a>
          </p>
          {/* Der eine Gold-Akzent auf der einen Handlung dieser Seite. Ziel ist
              die Detailseite (blockLinks.js: detail = /pages/<handle>-details),
              nicht die Kaufseite — der Satz darüber sagt „ansehen". */}
          <a className="bew__cta" href={T.pruefen.weiter.pfad}>
            {T.pruefen.weiter.text}
          </a>
        </div>
      </section>
    </div>
  );
}
