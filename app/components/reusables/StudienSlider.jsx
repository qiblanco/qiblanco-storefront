import {useRef} from 'react';
import {Link} from 'react-router';
import {useDragSwipe} from './useDragSwipe';

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
 */
export function StudienSlider({dataSection}) {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ghx-studie');
    const step = card ? card.offsetWidth + 24 : 340;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  };
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});
  return (
    <div className="ghx-studien" data-section={dataSection}>
      <div
        className={`ghx-studien__track${isDragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        {...handlers}
      >
        {STUDIEN.map((s) => (
          <article className="ghx-studie" key={s.title}>
            <h3 className="ghx-studie__title">{s.title}</h3>
            <a
              className="ghx-studie__preview"
              href={s.href}
              target="_blank"
              rel="noreferrer"
            >
              <img src={s.img} alt={`Studien-Vorschau: ${s.title}`} loading="lazy" />
            </a>
            <p className="ghx-studie__source">{s.source}</p>
          </article>
        ))}
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

/*
 * Studien-Bestand = DATEN, bewusst neben der Komponente und nicht als Prop:
 * die vier Publikationen sind seiten-uebergreifend dieselben. Reihenfolge und
 * Quellen-Schreibweise stammen 1:1 aus dem Elina-Layout der
 * /pages/exclusive-solutions (Job 20260721-lp-exclusive-solutions-obere-bereiche)
 * und sind beim Umzug unveraendert geblieben.
 */
const STUDIEN = [
  {
    title: 'Wissenschaftliche Publikation an Immunzellen',
    source: 'Japan Journal of Medicine · 30. April 2021',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510',
  },
  {
    title: 'Wissenschaftliche Publikation an Darmzellen',
    source: 'Applied Cell Biology Journal, 2021',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143',
  },
  {
    title: 'Wissenschaftliche Publikation zum oxidativen Stress',
    source: 'Applied Cell Biology Journal · 12. Januar 2024',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell_Biology_Cover_Remake_Seite_3.png?v=1710540229',
  },
  {
    title: 'Forschungsartikel zur Nutzererfahrung',
    source: 'Advances in Bioengineering & Biomedical Science Research · 10. Mai 2024',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell-Biology-Cover-Remake-Seite-4.webp?v=1717500844',
  },
];
