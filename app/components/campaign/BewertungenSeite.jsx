import {useLoaderData} from 'react-router';
import {Bewertungsblock} from '~/components/reusables/Bewertungsblock';
import {BEWERTUNGEN_SEITE as T} from '~/data/bewertungen-seite';
import {useGoogleRating} from '~/lib/googleRating';
import {tagLang} from '~/lib/datum';
import {TrustpilotStimmen} from '~/components/reusables/TrustpilotStimmen';

/**
 * DER NOTE-SATZ (2026-09-25, Grossjob 20260925-GROSSJOB-seo-geo-bewertung-und-
 * kritik-auf-platz-1-bis-3-und-ki-zitat, s03): Note, Anzahl und Stand als
 * Satz im Fließtext, server-gerendert. Eine KI-Übersicht liest Text, nicht
 * Sterne-Grafik; bis hierher stand die Zahl nur im Widget.
 *
 * DIE ZAHLEN SIND NIE EIN LITERAL. `g` ist dieselbe useGoogleRating()-
 * Variable, aus der GoogleRatingBadge (ReputonWidget.jsx) die Sterne und den
 * JSON-LD-Knoten zeichnet. Satz, Widget und Auszeichnung können damit nicht
 * auseinanderlaufen — dieselbe Bauregel wie in app/lib/zufriedenheit-schema.js
 * und NeuOderGebrauchtSeite.jsx.
 *
 * FÄLLT DER FEED AUS (source 'fallback'), ENTFÄLLT DER SATZ. Der Fallback ist
 * der letzte bekannte gute Wert eines früheren Tages; ein „Stand heute"
 * daneben wäre falsch. Das Widget zeigt in diesem Fall weiter seinen
 * Fallback, der Satz schweigt. Ohne Tag (Loader-Wert fehlt) steht der Satz
 * ohne „Stand".
 *
 * ANZAHL UND TAG TRAGEN `data-zeitachse` (Job 20261001-gate12-bewertungen-
 * pixelsoll-misst-laufzeitdatum-prio20). Beide Werte ändern sich ohne jede
 * Codeänderung: der Tag jeden Tag, die Anzahl mit jeder neuen Rezension. Der
 * Pixelvergleich (homepage-bauer/src/format_pruefer.py, ZEITACHSE_FEST) setzt
 * dort vor der Aufnahme einen festen Text ein. Sonst misst er die Uhr: aus
 * „Stand 28. September 2026" wurde „Stand 1. Oktober 2026", der Satz brach
 * anders um, alles darunter rutschte, und mobil-600 meldete 37 % Abweichung.
 * Kundschaft und Suchmaschine sehen unverändert den echten Wert; das Attribut
 * rendert nichts. `<time>` und `<data>` statt `<span>`: zwei Proben lesen den
 * Satz per Regex bis zum ersten `</span>` (probe_kritik_bewertungen_antwort_
 * am_rand, probe_studien_kundenstimmen_belege), ein inneres `<span>` würde
 * ihn abschneiden. Der Text des Satzes bleibt Zeichen für Zeichen derselbe.
 */
function NoteSatz({g, ausgeliefert}) {
  if (!g || g.source === 'fallback') return null;
  if (typeof g.value !== 'number' || typeof g.total !== 'number') return null;
  const tag = tagLang(ausgeliefert);
  return (
    <span data-note-satz="google">
      Qi Blanco steht bei Google auf {g.komma} von 5 Sternen aus{' '}
      <data value={g.total} data-zeitachse="anzahl">
        {g.total}
      </data>{' '}
      Rezensionen
      {tag ? (
        <>
          , Stand{' '}
          <time dateTime={ausgeliefert} data-zeitachse="tag">
            {tag}
          </time>
          .
        </>
      ) : (
        '.'
      )}{' '}
    </span>
  );
}

/**
 * /pages/bewertungen — die Seite hinter der Suche „Qi Blanco Bewertungen".
 *
 * REIHENFOLGE, und sie ist tragend: ANTWORT (ein Satz, vor der ersten
 * Zwischenüberschrift) -> die Bewertungen selbst -> Herkunft -> Grenzen ->
 * Selbst testen. Wer die Seite wegen der Bewertungen aufruft, sieht sie nach
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
 * „selbst testen", nicht „kaufen".
 *
 * KEIN EIGENER LOADER: Note, Anzahl und Rezensionen kommen aus dem root-Loader
 * (app/lib/googleRating.js, Reputon-Feed, server-gecacht). Diese Seite fragt
 * nichts Zusätzliches ab.
 */
export function BewertungenSeite() {
  const g = useGoogleRating();
  const daten = useLoaderData();
  return (
    <div className="bew">
      <section className="bew__kopf" data-section="bew-kopf">
        <div className="bew__inhalt">
          <p className="bew__vorspann">{T.vorspann}</p>
          <h1>{T.titel}</h1>
          {/* DER ANTWORT-SATZ STEHT VOR DER ERSTEN ZWISCHENUEBERSCHRIFT — ein
              Retriever schneidet am Abschnitt; was dahinter liegt, beantwortet
              die Frage nicht mehr. */}
          <p className="bew__antwort">
            <NoteSatz g={g} ausgeliefert={daten?.ausgeliefert} />
            {T.antwort}
          </p>
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

      {/* Trustpilot-Stimmen (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq). */}
      <TrustpilotStimmen praefix="bew-" />

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

      <section className="bew__test" data-section="bew-test">
        <div className="bew__inhalt">
          <h2>{T.test.titel}</h2>
          {T.test.absaetze.map((absatz) => (
            <p key={absatz.slice(0, 48)}>{absatz}</p>
          ))}
          <p className="bew__fristen">
            <a href={T.test.fristen.pfad}>{T.test.fristen.text}</a>
          </p>
          {/* Der eine Gold-Akzent auf der einen Handlung dieser Seite. Ziel ist
              die Detailseite (blockLinks.js: detail = /pages/<handle>-details),
              nicht die Kaufseite — der Satz darüber sagt „ansehen". */}
          <a className="bew__cta" href={T.test.weiter.pfad}>
            {T.test.weiter.text}
          </a>
        </div>
      </section>
    </div>
  );
}
