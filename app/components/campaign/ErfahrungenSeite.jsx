import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {ERFAHRUNGS_BEITRAEGE} from '~/data/erfahrungen-beitraege';
import {gruppenNachSprache} from '~/lib/erfahrungen-gruppen';

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
 */
export function ErfahrungenSeite() {
  const deutsch = gruppenNachSprache('de');
  const englisch = gruppenNachSprache('en');
  const menschen = deutsch.length + englisch.length;

  return (
    <div className="erf">
      <section className="erf__kopf">
        <div className="erf__schmal">
          <h1>Was Menschen mit Qi Blanco erlebt haben</h1>
          <p className="erf__lead">
            Hier sprechen {menschen} Menschen selbst – in{' '}
            {ERFAHRUNGS_BEITRAEGE.length} Videos über Schlaf, Energie, Ruhe im
            Alltag und darüber, was sich für sie verändert hat. Jedes Video ist
            das Original. Der Text daneben fasst zusammen, was darin gesagt
            wird.
          </p>

          <div className="erf__hinweis">
            <p>
              <strong>Warum hier niemand wörtlich zitiert wird.</strong> Die
              Untertitel unserer Videos entstehen maschinell und geben Namen und
              einzelne Sätze nachweislich falsch wieder – aus „QiOne“ wird dort
              schon mal „the G1“. Ein Satz in Anführungszeichen aus dieser Quelle
              wäre ein Satz, den der Mensch so nie gesagt hat. Deshalb steht
              neben jedem Video eine Zusammenfassung in indirekter Rede. Den
              Wortlaut hörst du im Video.
            </p>
            <p>
              <strong>Was du hier liest.</strong> Persönliche Erfahrungen
              einzelner Menschen, wiedergegeben so, wie sie erzählt wurden – auch
              dort, wo jemand von einem schwierigen Anfang berichtet. Es sind
              ihre Beobachtungen, nicht unsere Behauptungen, und sie sagen nichts
              darüber, wie es bei dir sein wird.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="erf__mitte">
          <h2>Auf Deutsch</h2>
          <p>
            {deutsch.length} Menschen, nach Reichweite geordnet. Wer mehr als
            ein Video aufgenommen hat, steht einmal hier – mit allen.
          </p>
          <BeitragsRaster gruppen={deutsch} />
        </div>
      </section>

      <section>
        <div className="erf__mitte">
          <h2>In English</h2>
          <p>
            {englisch.length} Menschen haben auf Englisch aufgenommen – die
            Zusammenfassung daneben ist auf Deutsch.
          </p>
          <BeitragsRaster gruppen={englisch} />
        </div>
      </section>

      <section className="erf__abschluss">
        <div className="erf__schmal">
          <h2>Worum es geht</h2>
          <p>
            Alle hier tragen etwas oder haben es zu Hause stehen: den QiOne® 2
            Pro, das QiBracelet® oder den QiHome® Air. Wenn du wissen willst, was
            das ist und wie es getragen wird, fängst du am besten hier an.
          </p>
          <a className="erf__weiter" href="/pages/qione-2-pro">
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
                  Anfuehrungszeichen als Aeusserung. */}
              <p className="erf__videotitel">{b.titel}</p>
              <p className="erf__text">{b.zusammenfassung}</p>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}
