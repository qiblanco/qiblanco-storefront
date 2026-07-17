import {useRef} from 'react';
import {Link} from 'react-router';

/*
 * StudienCards — Studien-Slider im Karten-Layout (Journal-Cover + Quelle),
 * 1:1 aus der exclusive-solutions-LP übernommen, aber eigenständig mit
 * colocated + gescoptem CSS (.qione-studien-cards). So funktioniert die
 * Darstellung auf den QiOne-2-Pro-Seiten ohne das exclusive-solutions-
 * Stylesheet. Die btn--secondary/m-center-Klassen kommen aus dem globalen
 * app.css (auf diesen Seiten geladen).
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

const STUDIEN_CSS = `
.qione-studien-cards .ghx-studien { margin-top: 32px; }
.qione-studien-cards .ghx-studien__track {
  display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; padding: 4px 4px 14px; scrollbar-width: thin;
}
.qione-studien-cards .ghx-studie {
  flex: 0 0 min(340px, 78vw); scroll-snap-align: start; background: #fff;
  border: 1px solid rgba(28, 25, 23, 0.08); border-radius: 16px; padding: 20px;
  display: flex; flex-direction: column; gap: 14px; text-align: left;
  box-shadow: 0 10px 30px rgba(28, 25, 23, 0.06);
}
.qione-studien-cards .ghx-studie__title { font-size: 1.05rem; line-height: 1.35; margin: 0; text-align: left; }
.qione-studien-cards .ghx-studie__preview { display: block; }
.qione-studien-cards .ghx-studie__preview img { width: 100%; height: auto; border-radius: 10px; display: block; }
.qione-studien-cards .ghx-studie__source { margin: 0; margin-top: auto; font-size: 0.88rem; color: rgb(90, 90, 90); text-align: left; }
.qione-studien-cards .ghx-studien__nav { display: flex; gap: 10px; justify-content: center; margin-top: 28px; }
.qione-studien-cards .ghx-studien__arrow {
  width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(28, 25, 23, 0.15);
  background: #fff; cursor: pointer; font-size: 1.1rem; line-height: 1;
}
.qione-studien-cards .ghx-studien__arrow:hover { background: #f5f5f4; }
.qione-studien-cards .ghx-studien__footnote { text-align: center; margin: 30px 0 22px; }
.qione-studien-cards .btn--secondary { margin-top: 14px; }
`;

export function StudienCards({headline = 'Wirkung an menschlichen Zellen bestätigt!'}) {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ghx-studie');
    const step = card ? card.offsetWidth + 24 : 340;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  };

  return (
    <div className="qione-studien-cards NormalSectionSize">
      <style>{STUDIEN_CSS}</style>
      {headline && <h2 className="text-center">{headline}</h2>}
      <div className="ghx-studien">
        <div className="ghx-studien__track" ref={trackRef}>
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
    </div>
  );
}
