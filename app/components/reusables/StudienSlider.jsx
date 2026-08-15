import {useRef} from 'react';
import {Link} from 'react-router';
import {useDragSwipe} from './useDragSwipe';
import {STUDIEN, kachelZeilen, studienPfad} from '~/data/studien';

/*
 * StudienSlider -- die EINE Definition der Studien-KACHEL-Ansicht (Elina-Layout:
 * Titel oben links, Vorschau-Bild, Quelle unten links; horizontal scroll-snap +
 * Desktop-Maus-Drag nach GL-DES-0012). Bis 2026-07-27 lag sie als lokale
 * Funktion in campaign/ExclusiveSolutions.jsx; seit dem Elina-Wunsch
 * "Studien-Kachel-Ansicht auch auf /pages/qione-2-pro-2x" ist sie hierher
 * gezogen und wird von BEIDEN Seiten referenziert -- KEINE Kopie, damit eine
 * künftige Änderung an den Studien (neue Publikation, korrigierte Quelle)
 * überall zugleich durchschlägt. Gleiches Muster wie
 * GitterchipMoleculesScrub: Zentralisierung macht Text-Drift baulich unmöglich.
 *
 * Die Kachel-Optik hängt an den `.ghx-studien*`-Regeln, die mit diesem Umzug
 * nach app/styles/app.css gewandert sind -- dieselbe Heimat, die .InfoSlider
 * und .ScrollScrubVideo als geteilte Bausteine schon haben. app.css lädt das
 * root-Layout global, deshalb braucht KEINE Route einen Extra-Stylesheet-Link.
 *
 * `dataSection` (Default undefined = Attribut fällt weg): Watch-/Heatmap-Anker
 * je Seite. Der Bestands-Aufruf auf /pages/exclusive-solutions übergibt ihn
 * bewusst NICHT -- so bleibt dessen Markup byte-identisch zum Vorzustand.
 *
 * ── 2026-08-15, Job 20260814-studien-slider-5-... s03: DATENGETRIEBEN ────────
 * Die vier Studien lagen bis hierher als hartkodiertes Array UNTEN in dieser
 * Datei -- und in vier weiteren Dateien noch einmal. Eine fuenfte Publikation
 * (QiHome® Air, e0005) haette also an fuenf Stellen nachgezogen werden müssen,
 * jede für sich stimmig, die Naht offen. Seitdem ist `app/data/studien` die
 * EINE Quelle: dieselbe Registry, aus der die Detailseiten und das Schema
 * lesen. Eine neue Studie erscheint damit ueberall zugleich, ohne dass jemand
 * eine Liste pflegt.
 *
 * ZWEI VERHALTENSAENDERUNGEN, beide bewusst:
 *  1. KLICKZIEL ist jetzt die DETAILSEITE, nicht mehr das PDF. Ein direkter
 *     PDF-Sprung verlaesst die Seite und verliert den Kontext; die interne
 *     Verlinkung trägt den SEO-Wert der Sektion. Das PDF öffnet weiterhin --
 *     eine Ebene tiefer, auf der Detailseite über das klickbare Deckblatt.
 *  2. Die Kachel trägt zwei Zeilen: WORAN gemessen wurde, dann WO/WANN
 *     veroeffentlicht (kachelZeilen()). Der Zweifler bekommt zuerst die
 *     Antwort auf seine Frage, nicht die Bibliografie.
 *
 * KEIN Autoplay: eine Beweisflaeche, die sich selbst weiterschiebt, nimmt dem
 * Leser die Kontrolle über genau den Moment, in dem er überzeugt wird.
 *
 * `headline` bleibt bewusst OHNE Default -- ExclusiveSolutions ruft
 * <StudienSlider /> ganz ohne Props und haette sonst ploetzlich eine H2, die es
 * nie hatte. Den Default trägt der Wrapper Studien.jsx.
 */
export function StudienSlider({dataSection, studien = STUDIEN, headline}) {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ghx-studie');
    const step = card ? card.offsetWidth + 24 : 340;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  };
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});

  // Tastatur: der Track ist fokussierbar, Pfeiltasten blaettern kartenweise.
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByCard(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <div className="ghx-studien" data-section={dataSection}>
      {headline ? <h2 className="text-center">{headline}</h2> : null}
      <div
        className={`ghx-studien__track${isDragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        role="group"
        aria-label="Wissenschaftliche Publikationen — horizontal scrollbar"
        tabIndex={0}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        {studien.map((s) => {
          const e = s.eckdaten || {};
          const {zeile1, zeile2} = kachelZeilen(s);
          return (
            <article className="ghx-studie" key={s.id}>
              {/*
                Die ganze Kachel ist EIN echtes <a> im SSR-Markup: ohne
                JavaScript bleibt eine scrollbare, crawlbare Liste stehen
                (progressive enhancement). Kein Inhalt entsteht erst per JS.
              */}
              <Link
                className="ghx-studie__link"
                prefetch="intent"
                to={studienPfad(s.slug)}
              >
                <h3 className="ghx-studie__title">{zeile1}</h3>
                <span className="ghx-studie__preview">
                  <img
                    src={e.coverUrl}
                    alt={`Titelseite der Publikation „${e.titelOriginal}“ im ${e.journal}`}
                    loading="lazy"
                  />
                </span>
                <span className="ghx-studie__source">{zeile2}</span>
              </Link>
            </article>
          );
        })}
      </div>
      <div className="ghx-studien__nav">
        <button
          type="button"
          className="ghx-studien__arrow"
          onClick={() => scrollByCard(-1)}
          aria-label="Vorherige Studie"
        >
          ←
        </button>
        <span className="ghx-studien__wischhinweis" aria-hidden="true">
          weiterwischen →
        </span>
        <button
          type="button"
          className="ghx-studien__arrow"
          onClick={() => scrollByCard(1)}
          aria-label="Nächste Studie"
        >
          →
        </button>
      </div>
      <p className="ghx-studien__footnote">
        <strong>Wissenschaftlich getestet und in internationalen Fachpublikationen bestätigt.</strong>
      </p>
      <Link prefetch="intent" to="/pages/studien" className="btn--secondary m-center">
        Zelluntersuchungen ansehen
      </Link>
    </div>
  );
}
