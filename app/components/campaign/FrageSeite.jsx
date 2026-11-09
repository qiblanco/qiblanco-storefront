import {Fragment} from 'react';
import {quellenFuer} from '~/data/fragen';
import {HUB_PFAD, HUB_ANKER} from '~/lib/fragen-schema';
import {TrustpilotStimmen} from '~/components/reusables/TrustpilotStimmen';
import {adresse} from '~/lib/zusammenlegungen';

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
/** `seite.trustpilot` (data/fragen.js): Trustpilot-Stimmen nach dem Beleg-
 *  Abschnitt — nur auf den Frageseiten, deren Frage die Seriosität selbst ist
 *  (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq). Im Datensatz statt
 *  als Routen-Prop: der Bau ändert so keine Route. */
export function FrageSeite({seite, anhang = null}) {
  const quellen = quellenFuer(seite);
  // DER QUOTIERTE SCHLUESSEL IST ABSICHT, NICHT UMSTAENDLICHKEIT: das
  // Umlaut-Gate (homepage-bauer/src/umlaut_gate.py) liest einen Bezeichner in
  // Punkt-Form als deutschen Fließtext und verlangt dort einen echten Umlaut —
  // der wäre in einem Feldnamen der Fehler. Die quotierte Form ist die
  // Schreibweise, die es bereits als Code-Kontext erkennt. Die Klasse ist
  // gemeldet (fünfte Instanz), der Feldname selbst bleibt unverändert.
  const {"begruendung": absaetze, "begruendung_links": absatzLinks} = seite;
  return (
    <div className="frg">
      <section className="frg__kopf" data-section="frg-kopf">
        <div className="frg__inhalt">
          <p className="frg__vorspann">
            {/* Die Sammelstelle der Frageseiten ist seit 2026-09-25 der
                Abschnitt #einzelfragen der FAQ (/pages/fragen leitet per 301
                dorthin) — direkt verlinkt, nicht über die Weiterleitung. */}
            <a className="frg__vorspann-link" href={`${HUB_PFAD}#${HUB_ANKER}`}>
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
          {/* TEILFRAGEN (app/data/fragen.js, seit 2026-10-16): die Frage, die
              ein Absatz beantwortet, steht als Zwischenüberschrift darüber —
              im H2-Stil der Seite, kein zweiter. Der Antwortsatz bleibt vor
              der ersten Überschrift. Ohne das Feld ist die Ausgabe gleich. */}
          {absaetze.map((absatz, i) => {
            const teilfrage = seite.teilfragen?.[i];
            return teilfrage ? (
              <Fragment key={absatz.slice(0, 48)}>
                <h2 data-geo="teilfrage">{teilfrage}</h2>
                <p>{mitTextLink(absatz, absatzLinks)}</p>
              </Fragment>
            ) : (
              <p key={absatz.slice(0, 48)}>{mitTextLink(absatz, absatzLinks)}</p>
            );
          })}
        </div>
      </section>

      <section data-geo="beleg" data-section="frg-beleg">
        <div className="frg__inhalt">
          <h2>{seite.beleg_titel || 'Was gemessen ist'}</h2>
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

      {/* RAND (gemessen 2026-10-06 live, 390 px): `.frg section` in fragen.css
          setzt das seitliche Padding JEDER Section auf 0, auch das der
          Trustpilot-Section; Titel und Karten standen bei x=0. Der Rahmen gibt
          den Seitenrand der Frageseite (--frg-s3) zurück. */}
      {seite.trustpilot ? (
        <div style={{paddingInline: 'var(--frg-s3)'}}>
          <TrustpilotStimmen praefix="frg-" />
        </div>
      ) : null}

      {/* „GUT ZU WISSEN" STATT „WAS WIR NICHT WISSEN" (Christian 2026-09-28,
          Grossjob 20260928-GROSSJOB-frageseiten-menschlich-schreiben-und-
          bestmoegliches-licht): der Abschnitt gibt dem Leser eine Präzision
          oder etwas, das er selbst prüfen kann — keine Note auf unser eigenes
          Material. Er darf leer sein; dann entfällt er ganz, statt als leere
          Überschrift stehenzubleiben. */}
      {seite.offen?.length > 0 && (
        <section
          className="frg__offen"
          data-geo="offen"
          data-section="frg-offen"
        >
          <div className="frg__inhalt">
            <h2>Gut zu wissen</h2>
            {seite.offen.map((absatz) => (
              <p key={absatz.slice(0, 48)}>
                {mitTextLink(absatz, seite.offen_links)}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ANHANG: eine Frageseite, die in DIESE Seite aufgegangen ist
          (app/lib/zusammenlegungen.js), steht hier als eigener Abschnitt
          mit Anker, nach „Gut zu wissen" und vor den Begriffen. */}
      {anhang}

      {seite.weiter.length > 0 && (
        <section data-geo="weiter" data-section="frg-weiter">
          <div className="frg__inhalt">
            <h2>Die Begriffe dazu</h2>
            <ul className="frg__weiter">
              {seite.weiter.map((z) => (
                <li key={z.pfad}>
                  <a href={adresse(z.pfad)}>{z.text}</a>
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

/**
 * `seite.offen_links` (data/fragen.js, optional, seit 2026-11-08): macht in
 * einem Absatz von „Gut zu wissen" genau EINE Wortgruppe zum Link. Der Absatz
 * bleibt im Datenmodul reiner Text, damit jeder andere Leser von `offen`
 * (FrageAbschnitt auf FAQ und Studien, Proben, Stilprüfung) unverändert
 * dasselbe liest. Gilt nur auf der eigenen Frageseite.
 * Anlass: SEO-Maßnahme M-SP-20261017-erfahrungen (Grossjob seo-2026-w43-l26-
 * erfahrungen-d285-…, s02): der Satz „… haben wir bei den Erfahrungen mit
 * Elektrosmog-Schutz gesammelt." verlinkt auf /pages/erfahrungen.
 * Steht die Wortgruppe nicht (mehr) im Absatz, bleibt er unverlinkter Text.
 *
 * Dasselbe gilt seit 2026-11-09 für die Begründungsabsätze über das Feld
 * `"begruendung_links"` (Hebel GS-139, Auftrag 20261109-gs139-kritik-
 * inhaltslinks-bau): auf /pages/ist-qi-blanco-serioes verlinkt der Satz zu den
 * fünf Arbeiten auf /pages/kritik, Ankertext aus deren Titel ohne das Wort
 * „Kritik“. Das FAQPage-Schema liest weiter den reinen Absatztext.
 */
function mitTextLink(absatz, links) {
  for (const l of links || []) {
    const i = absatz.indexOf(l.text);
    if (i < 0) continue;
    return (
      <>
        {absatz.slice(0, i)}
        <a href={adresse(l.pfad)}>{l.text}</a>
        {absatz.slice(i + l.text.length)}
      </>
    );
  }
  return absatz;
}
