import {AbsichtHinweis} from '~/components/reusables/AbsichtHinweis';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {ERFAHRUNGS_BEITRAEGE} from '~/data/erfahrungen-beitraege';
import {gruppenNachSprache} from '~/lib/erfahrungen-gruppen';
import {TrustpilotStimmen} from '~/components/reusables/TrustpilotStimmen';

/**
 * /pages/erfahrungen — die Erlebnis-Flaeche.
 *
 * ABGRENZUNG (festgelegt VOR dem Bau, homepage-bauer/konzepte/
 * ABGRENZUNG-ERFAHRUNGEN-KRITIK.md, SSoT abgrenzung-flaechen.json):
 * Diese Seite trägt ERLEBNISSE. Sie beantwortet KEINEN Vorwurf und nennt KEINE
 * Studienzahl — das ist der Gegenstand der Kritik-Flaeche. Die Erkennungsfrage
 * im Zweifel: beginnt diese Seite, einen Vorwurf zu beantworten, ist sie die
 * falsche Seite geworden.
 *
 * VIDEO-LADESTRATEGIE (SKILL-VIDEO-LADESTRATEGIE.md, Stufe 0 und 3): 17 Videos
 * als Fassade. Beim Seitenaufbau entsteht KEIN Player und KEINE Verbindung zu
 * YouTube — nur das Vorschaubild, `loading="lazy"`. Erst der Klick lädt den
 * Player. Der alte, eager ladende `YoutubeIframe` wäre hier ein Befund: bei 17
 * Einbettungen kostete er rund 6,8 MB Player-Infrastruktur auf JEDEM Aufruf.
 *
 * EIN MENSCH, EIN EINTRAG (Christian 2026-09-11): gerendert wird eine Gruppe je
 * SPRECHER, nicht je Video. Wer zwei oder drei Videos hat, steht einmal da und
 * trägt sie alle. Die Gruppierung selbst liegt in app/lib/erfahrungen-gruppen.js
 * — hier steht nur ihre Darstellung. Der Grund, warum das keine Kosmetik ist,
 * steht im Kopf jenes Moduls: zwei Abschnitte zu derselben Person lesen sich wie
 * zwei Stimmen und sind eine.
 *
 * SPRACHE: der Shop duzt — durchgehend, kein Anrede-Mix (Abnahme-Checkliste
 * Punkt 1; genau daran ist /pages/wirkt-das gescheitert). Eingestiegen wird mit
 * dem Kundenwort (Schlaf, Energie, Schutz, Ruhe), nicht mit dem Hauswort
 * "kohärentes Wasser" — das sagen Kunden gemessen fast nie von sich aus.
 *
 * SUCHBEGRIFF UND KURZ GEFRAGT (2026-10-07, Grossjob 20261007-GROSSJOB-seo-
 * keyword-beobachtung-erweitern-nach-beliebtheit, s05, Massnahme M-20261007-
 * erfahrungen-antwort-faq): „qi blanco erfahrung" ist mit 63 Impressionen der
 * beliebteste Begriff unter Ziel (Search Console 06.09.-04.10., Position 6,6,
 * keine eigene Seite in den Top 3). Der Vorspann über der H1 trägt deshalb den
 * Begriff in der Reihenfolge, in der gesucht wird (Hausmuster wie
 * /pages/bewertungen), und der Abschnitt „Kurz gefragt" beantwortet die vier
 * Fragen, die hinter der Suche stehen. Aus genau diesen Strings baut die Route
 * das FAQPage-Schema: Schema und sichtbarer Text sind dieselbe Liste.
 * ABGRENZUNG BLEIBT: keine Antwort nennt eine Studienzahl oder beantwortet
 * einen Vorwurf. Die Fragen betreffen Erlebnisse, ihre Herkunft und den
 * eigenen Test.
 */

/**
 * Die Fragen des Abschnitts „Kurz gefragt" — EINE Liste für Seite und Schema.
 * `q`/`a` sind reiner Text (buildFaqPageJsonLd liest genau diese Felder), die
 * Verweise stehen getrennt in `weiter`, damit der Antworttext im Schema und auf
 * der Seite Zeichen für Zeichen derselbe ist. Jede Angabe stammt aus dem
 * Bestand: Herkunft der Videos aus app/data/erfahrungen-beitraege.js
 * (eigener YouTube-Kanal, kein wörtliches Zitat), der 20-Tage-Test wortgleich
 * aus app/data/bewertungen-seite.js (Abschnitt test).
 */
export function erfahrungenFragen() {
  const menschen =
    gruppenNachSprache('de').length + gruppenNachSprache('en').length;
  return [
    {
      id: 'frage-was-berichten-menschen',
      q: 'Was berichten Menschen über Qi Blanco?',
      a:
        `In ${ERFAHRUNGS_BEITRAEGE.length} Videos erzählen ${menschen} Menschen, ` +
        'was sie mit QiOne®, QiBracelet® und QiHome® Air erlebt haben. Es geht ' +
        'um Schlaf, Energie und Ruhe im Alltag und darum, was sich für sie ' +
        'verändert hat.',
    },
    {
      id: 'frage-sind-die-berichte-echt',
      q: 'Sind die Erfahrungsberichte echt?',
      a:
        'Ja. Jedes Video ist das Original von unserem YouTube-Kanal, und alle ' +
        'sprechen selbst und unter ihrem Namen. Der Text neben dem Video fasst ' +
        'zusammen, was darin gesagt wird, und zitiert nicht wörtlich.',
    },
    {
      id: 'frage-wo-stehen-bewertungen',
      q: 'Wo finde ich Bewertungen zu Qi Blanco?',
      a:
        'Die Google-Bewertungen stehen mit Note und Anzahl auf unserer ' +
        'Bewertungsseite, so wie Google sie zählt. Was auf Reddit über Qi Blanco ' +
        'steht, haben wir Faden für Faden nachgelesen.',
      weiter: [
        {pfad: '/pages/bewertungen', text: 'Qi Blanco Bewertungen und Reviews'},
        {
          pfad: '/pages/was-auf-reddit-ueber-qi-blanco-steht',
          text: 'Was auf Reddit über Qi Blanco steht',
        },
      ],
    },
    {
      id: 'frage-selbst-ausprobieren',
      q: 'Kann ich es selbst ausprobieren?',
      a:
        'Ja. Du kannst den QiOne® 2 Pro 20 Tage ab Erhalt tragen und ihn ' +
        'zurückgeben, ohne einen Grund zu nennen. Die Rücksendung ist für dich ' +
        'kostenlos, und das gilt zusätzlich zum gesetzlichen Widerrufsrecht von ' +
        '14 Tagen.',
      weiter: [
        {
          pfad: '/pages/neu-oder-gebraucht',
          text: 'Was du beim Kauf bei uns bekommst',
        },
      ],
    },
  ];
}

export function ErfahrungenSeite() {
  const deutsch = gruppenNachSprache('de');
  const englisch = gruppenNachSprache('en');
  const menschen = deutsch.length + englisch.length;
  const fragen = erfahrungenFragen();

  return (
    <div className="erf">
      <section className="erf__kopf" data-section="erf-kopf">
        <div className="erf__schmal">
          <p className="erf__vorspann">Qi Blanco Erfahrungen</p>
          <h1>Was Menschen mit Qi Blanco erlebt haben</h1>
          <p className="erf__lead">
            Hier sprechen {menschen} Menschen selbst. In{' '}
            {ERFAHRUNGS_BEITRAEGE.length} Videos erzählen sie von Schlaf, Energie
            und Ruhe im Alltag und davon, was sich für sie verändert hat. Jedes Video ist
            das Original. Der Text daneben fasst zusammen, was darin gesagt
            wird.
          </p>
        </div>
      </section>

      <section data-section="erf-deutsch">
        <div className="erf__mitte">
          <h2>Auf Deutsch</h2>
          <p>
            {deutsch.length} Menschen, nach Reichweite geordnet. Wer mehr als
            ein Video aufgenommen hat, steht einmal hier, mit allen Videos.
          </p>
          <BeitragsRaster gruppen={deutsch} />
        </div>
      </section>

      <section data-section="erf-english">
        <div className="erf__mitte">
          <h2>In English</h2>
          <p>
            {englisch.length} Menschen haben auf Englisch aufgenommen. Die
            Zusammenfassung daneben ist auf Deutsch.
          </p>
          <BeitragsRaster gruppen={englisch} />
        </div>
      </section>

      {/* Trustpilot-Stimmen (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-faq). */}
      <TrustpilotStimmen praefix="erf-" />

      {/* Kurz gefragt (2026-10-07, s05): die vier Fragen hinter der Suche
          „qi blanco erfahrungen". Dieselbe Liste speist das FAQPage-Schema der
          Route. Bauform wie „Kurz gefragt" auf /pages/neu-oder-gebraucht. */}
      <section className="erf__kurz" data-section="erf-fragen">
        <div className="erf__schmal">
          <h2>Kurz gefragt</h2>
          <dl className="erf__fragen">
            {fragen.map((f) => (
              <div className="erf__frage" key={f.id} id={f.id}>
                <dt>{f.q}</dt>
                <dd>
                  <p>{f.a}</p>
                  {f.weiter ? (
                    <p className="erf__auch">
                      {f.weiter.map((w, i) => (
                        <span key={w.pfad}>
                          {i > 0 ? ' · ' : null}
                          <a href={w.pfad}>{w.text}</a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Der Verweis auf die Absicht — nach den Erfahrungen anderer die
          Frage, warum es das Ganze überhaupt gibt. */}
      <section data-section="erf-absicht">
        <div className="erf__schmal">
          <AbsichtHinweis einleitung="Und warum es das alles gibt:" />
        </div>
      </section>

      <section className="erf__abschluss" data-section="erf-abschluss">
        <div className="erf__schmal">
          <h2>Worum es geht</h2>
          <p>
            Alle hier tragen etwas oder haben es zu Hause stehen: den QiOne® 2
            Pro, das QiBracelet® oder den QiHome® Air. Wenn du wissen willst, was
            das ist und wie es getragen wird, fängst du am besten hier an.
          </p>
          {/* ZIEL UMGEBOGEN AM 2026-09-14 (offener Vollzug ov90ac04c6c8).
              Vorher /pages/qione-2-pro — die Landingpage-Fassung aus dem
              noindex-Paid-Funnel. Diese Seite hier ist crawlbar, der Link war
              damit ein Eingang in den Landing-Bereich und hat dessen
              Ads-Zuordnung als Ganze entwertet.
              Das Ziel ist NICHT frei gewählt: blockLinks.js führt für
              BLOCK_PUBLIC genau zwei Gegenstücke je Produkt, kauf =
              /products/<handle> und detail = /pages/<handle>-details. Der Satz
              darüber sagt „wenn du wissen willst, was das ist und wie es
              getragen wird" — das ist detail, nicht kauf. */}
          <a className="erf__weiter" href="/pages/qione-2-pro-details">
            Den QiOne® 2 Pro ansehen
          </a>
        </div>
      </section>
    </div>
  );
}

/**
 * Das Raster. Reihenfolge und Inhalt kommen vollstaendig aus dem Datenmodul —
 * hier steht KEIN Beitragstext, damit die Herkunftsregeln (nur vorveroeffent-
 * lichte Sprecher, kein Wortlaut, keine Doppelung) an EINER Stelle gelten.
 *
 * EIN `<article>` JE MENSCH, darin ein Block je Video. Der Name steht als
 * einziges `h3` GANZ OBEN in der Gruppe und genau einmal — daran ist die
 * Dublettenfreiheit am ausgelieferten HTML nachzaehlbar (`h3.erf__name` muss
 * die Zahl der Menschen ergeben, nicht die der Videos).
 */
function BeitragsRaster({gruppen}) {
  return (
    <div className="erf__raster">
      {gruppen.map((g) => (
        <article className="erf__beitrag" key={g.slug} id={g.slug}>
          <h3 className="erf__name">{g.sprecher}</h3>
          {g.videos.map((b) => (
            <div className="erf__video" key={b.videoId}>
              <YoutubeTimestamp
                videoId={b.videoId}
                titel={b.titel}
                posterAlt={`Videostandbild: ${g.sprecher} erzählt von seiner Erfahrung mit Qi Blanco`}
                className="erf-yt"
                playClassName="erf-yt__play"
                sizes="(min-width: 900px) 540px, 100vw"
                noscriptFallback
              />
              {/* Der Videotitel ist vom Haus geschrieben, NICHT vom Sprecher
                  gesagt — er steht deshalb als Titel da und nie in
                  Anfuehrungszeichen als Aeusserung. data-fremdtext: er ist der
                  veroeffentlichte Titel des Videos auf unserem Kanal und wird
                  1:1 zitiert, damit man das Video wiederfindet; umgeschrieben
                  wird er am Kanal, nicht hier (2026-10-06, s02 neue-seiten-pr). */}
              <p className="erf__videotitel" data-fremdtext="videotitel">
                {b.titel}
              </p>
              <p className="erf__text">{b.zusammenfassung}</p>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}
