import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {useDragSwipe} from './useDragSwipe';
import {STUDIEN, kachelZeilen, studienPfad} from '~/data/studien';
import {bildQuelle} from '~/components/reusables/shopifyBildQuellen';

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

/*
 * FLÄCHEN-NORM DER BELEGBILDER (Job 20260818-studien-grafiken-…).
 *
 * Die Titelbilder sind Montagen auf verschieden gerahmten Leinwänden. Wer sie
 * über die Leinwand normiert (`width:100%`), normiert den transparenten Rand
 * mit -- der sichtbare Beleg streute dadurch live um 35,0 % in der Fläche.
 * Normiert wird deshalb über die CONTENT-Box aus `eckdaten.coverNorm`
 * (dieselbe Quelle, aus der der Fächer auf /pages/studien seine Norm zieht --
 * KEINE zweite Messung, keine zweite Wahrheit).
 *
 * Bezugsgröße ist durchweg die Content-HÖHE in Bühnenbreiten (`hc`):
 *   Leinwand-Höhe  = hc * kH      Content-Breite = hc * kBox
 *   Leinwand-Breite = hc * kW     Rand links/oben = hc * kX bzw. hc * kY
 * Gleiche Fläche heißt kBox * hc² = ZIEL_FLAECHE, also hc = sqrt(A / kBox).
 *
 * Beide Zahlen unten sind Design-Tokens, keine Naturkonstanten -- sie stehen
 * hier an EINER Stelle, damit eine spätere Studie sie nicht einzeln aufweicht.
 */
const BUEHNE_HOEHE = 1.25; // Bühnenhöhe in Bühnenbreiten
const ZIEL_FLAECHE = 0.93; // Content-Fläche in (Bühnenbreite)²

/*
 * BILD-LEITER DER TITELBILDER (Job 20260906-lp-erzeugt-den-…
 * -prio20, s02).
 *
 * Die fünf Cover kamen bis hier als UNSKALIERTE ORIGINALE über die Leitung:
 * gemessen am 2026-09-06 zusammen 5.392.089 B, allein
 * Cell_Biology_Cover_Remake_Seite_3.png 2.717.627 B (natürlich 2480x3508) —
 * bei einer Anzeigebreite von 232 px mobil und 264 px auf dem Desktop. Weil
 * ALLE fünf an diesem EINEN <img> hängen, deckt ein Aufruf hier sie alle, und
 * mit ihnen die 14 Seiten, die diesen Block einbinden.
 *
 * Die Leiter ist an der breitesten gemessenen Kachel ausgerichtet (328 px auf
 * 1440 px Viewport) plus eine Stufe DPR-2-Reserve — bewusst nicht an der
 * schmalsten: `sizes` gilt für ALLE Konsumenten dieses geteilten Bausteins,
 * und zu klein geraten hieße hier, auf einer fremden Seite ein unscharfes
 * Belegbild auszuliefern. Zu groß geraten kostet nur Bytes auf genau dieser
 * einen Stufe.
 *
 * Oberhalb der natürlichen Breite deckelt Shopify von selbst und gibt das
 * Original byte-identisch zurück (gemessen an Cell-Biology-Seite-4, natürlich
 * 620 px: width=680 und width=800 liefern beide exakt 348.188 B). Die
 * 680er-Stufe ist deshalb für die kleineren Montagen gefahrlos.
 */
const LEITER_COVER = [340, 680];
const SIZES_COVER = '(max-width: 767px) 74vw, 328px';

/**
 * Liefert die CSS-Variablen der Flächen-Norm -- oder null, wenn die Studie
 * keine coverNorm trägt. null heißt: Bestandspfad, unverändertes Rendering.
 * Fail-soft ist hier richtig, weil eine neue Studie ohne vermessene Content-Box
 * sonst gar nicht erschiene; sichtbar bleibt sie so in jedem Fall.
 */
function flaechenNorm(eckdaten) {
  const cn = eckdaten && eckdaten.coverNorm;
  if (!cn) return null;
  const {kH, kW, kX, kY, kBox} = cn;
  if (![kH, kW, kX, kY, kBox].every((v) => typeof v === 'number' && isFinite(v))) {
    return null;
  }
  if (kBox <= 0 || kH <= 0 || kW <= 0) return null;
  return {
    '--ghx-buehne-h': String(BUEHNE_HOEHE),
    '--ghx-hc': Math.sqrt(ZIEL_FLAECHE / kBox).toFixed(5),
    '--ghx-kh': String(kH),
    '--ghx-kw': String(kW),
    '--ghx-kx': String(kX),
    '--ghx-ky': String(kY),
    '--ghx-kbox': String(kBox),
  };
}

/*
 * Die Pfeil-Grafik des Standards, unveraendert aus dem Bestand uebernommen
 * (InfoSlider.jsx, dort zweimal inline). Sie steht hier als eigene kleine Marke
 * und NICHT als Import aus einem Nachbarn: die Anwendungsregel des Bausatzes
 * (homepage-bauer/baukasten/qb-standard-slider/README.md, Abschnitt 0) hält
 * ausdrücklich fest, dass der Standard ein MARKUP-VERTRAG ist und kein Bauteil
 * zum Importieren -- `InfoSlider` nimmt genau eine Prop und trägt seine fünf
 * Karten als Literale. Der zweite Traeger der Anzeige (ReputonWidget) hält
 * dieselbe Grafik aus demselben Grund lokal; sein `PfeilIcon` ist zudem nicht
 * exportiert, und ein Import haette die 814 Zeilen des Bewertungs-Bausteins in
 * jede Seite gezogen, die nur Studien zeigt.
 *
 * Die Richtung macht das CSS: .ButtonPrev dreht -90 Grad, .ButtonNext +90.
 */
function PfeilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  );
}

export function StudienSlider({dataSection, studien = STUDIEN, headline}) {
  const trackRef = useRef(null);
  const fortschrittRef = useRef(null);
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ghx-studie');
    const step = card ? card.offsetWidth + 24 : 340;
    // Punkt 3 des Standards: „weiter" wickelt am Ende auf die erste Karte,
    // „zurück" klemmt am Anfang (so hält es InfoSlider, Christians Vorlage:
    // canNext liefert dort immer true, canPrev nur oberhalb von 0). Das
    // Klemmen erledigt der Browser bei einem negativen scrollBy von selbst.
    if (dir > 0) {
      const amEnde = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({
        left: amEnde ? 0 : track.scrollLeft + step,
        behavior: 'smooth',
      });
      return;
    }
    track.scrollBy({left: -step, behavior: 'smooth'});
  };
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});

  /*
   * FORTSCHRITTSBALKEN DIESER BAHN -- und die eine Stelle, an der dieser Umbau
   * eine Entscheidung treffen musste.
   *
   * Der Standard kennt zwei Herkuenfte des Fortschritts (Anwendungsregel,
   * Abschnitt 1). Springt die Bahn in ganze Karten (mode 'transform'), kommt er
   * aus dem diskreten Index. DIESE Bahn gleitet frei (mode 'scroll'), also aus
   * den Scroll-Massen. Genau dafür gibt es im Haus bereits einen Traeger:
   * ReputonWidget.jsx rechnet seit dem 21.09. live
   *     (scrollLeft + Sichtbreite) / Gesamtbreite
   * also den GESEHENEN Anteil. Diese Formel ist hier UEBERNOMMEN, nicht
   * nachgebaut -- eine zweite Bedeutung derselben Anzeige wäre der Anfang des
   * nächsten Wildwuchses.
   *
   * Sie hat einen zweiten, baulichen Vorzug: passen alle Kacheln nebeneinander
   * (Desktop, fünf Studien), ist der Scrollweg null. Die Lesart „zurück-
   * gelegter Weg" müsste dann durch null teilen; diese faellt sauber auf
   * 100 Prozent -- „du siehst alles" ist dort die richtige Aussage.
   *
   * Kein Boden-Wert: der Nachbar hält seine Marke ab 8 Prozent sichtbar, weil
   * 38 Bewertungskarten sonst bei rund 3 Prozent anfingen. Fünf Kacheln
   * starten mobil bei rund 24 Prozent. Eine Konstante, die nie bindet, wäre
   * hier abgeschrieben statt uebernommen.
   *
   * Geschrieben wird direkt am DOM statt über React-State: sonst rendert die
   * ganze Kachelreihe bei jedem Bildschirmbild des Scrollens neu.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    const schreibe = () => {
      frame = 0;
      const balken = fortschrittRef.current;
      if (!balken) return;
      const gesamt = track.scrollWidth || 1;
      const anteil = ((track.scrollLeft + track.clientWidth) / gesamt) * 100;
      balken.style.width = `${Math.min(100, Math.max(0, anteil))}%`;
    };
    const plane = () => {
      if (!frame) frame = window.requestAnimationFrame(schreibe);
    };
    schreibe();
    track.addEventListener('scroll', plane, {passive: true});
    window.addEventListener('resize', plane);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      track.removeEventListener('scroll', plane);
      window.removeEventListener('resize', plane);
    };
  }, []);

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
        // qb-wischbahn (app.css): diese Bahn trägt bereits zwei eigene Pfeile
        // und den Wischhinweis darunter. Die native Leiste war das vierte
        // Bedienelement auf derselben Bahn und fällt deshalb weg — dieselbe
        // Entscheidung wie im Bewertungsblock, aus derselben Klasse gezogen.
        className={`ghx-studien__track qb-wischbahn${isDragging ? ' is-dragging' : ''}`}
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
          const norm = flaechenNorm(e);
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
                <span
                  className={
                    norm
                      ? 'ghx-studie__preview ghx-studie__preview--norm'
                      : 'ghx-studie__preview'
                  }
                  style={norm || undefined}
                >
                  <img
                    {...bildQuelle(e.coverUrl, LEITER_COVER)}
                    sizes={SIZES_COVER}
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
      {/*
        Die Bedienung des Standards, aus dem Bestand uebernommen: ein
        Fortschrittsbalken und zwei Pfeile, mehr nicht. Vorher standen hier
        zwei TEXT-Pfeile und der Hinweis „weiterwischen" -- zusammen mit der
        nativen Leiste vier Bedienelemente auf einer Bahn, wo Christians
        Standard zwei zeigt.

        DER HINWEISTEXT FAELLT WEG, und das ist keine Sparsamkeit: die
        Anwendungsregel führt ihn unter „wird nicht dazugestellt" (der Balken
        sagt dasselbe, und die Pfeile zeigen es), und der Bewertungsblock hat
        ihn am selben Tag aus demselben Grund weggelassen. Der Leser will nicht
        lesen, wie man ein Karussell bedient.

        Der Name .ghx-studien__nav bleibt absichtlich stehen: die
        Kundenrand-Wache ordnet Bahn und Bedienung über die BEM-Naht
        (block__nav) einander zu. Wer ihn hier gegen einen neuen Namen tauscht,
        macht die Wache für genau diese Bahn blind -- und zwar lautlos.
      */}
      <div className="ghx-studien__nav">
        <div className="ProgressWrapper" aria-hidden="true">
          <div ref={fortschrittRef} className="ProgressTracker" style={{width: '0%'}} />
        </div>
        <div className="SliderButtonWrapper">
          <button
            type="button"
            className="ButtonPrev SliderButton"
            onClick={() => scrollByCard(-1)}
            aria-label="Vorherige Studie"
          >
            <PfeilIcon />
          </button>
          <button
            type="button"
            className="ButtonNext SliderButton"
            onClick={() => scrollByCard(1)}
            aria-label="Nächste Studie"
          >
            <PfeilIcon />
          </button>
        </div>
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
