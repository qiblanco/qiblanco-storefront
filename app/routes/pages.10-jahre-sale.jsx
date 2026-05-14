import tenYearsStyles from '~/styles/ten-years-sale.css?url';
import {TEN_YEARS_DEALS} from '~/data/ten-years-deals';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsStyles}];
}

export const meta = () => [
  {title: '10 Jahre Jubiläums Sale - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

const DEAL_TILES = TEN_YEARS_DEALS.map((deal) => ({
  key: deal.key,
  src: deal.tileSrc,
  alt: `Jubiläums Sale Angebot: ${deal.displayTitle}`,
  href: deal.listingHref,
}));


export default function TenYearsSale() {
  return (
    <div className="ten-years-page ten-years-sale">
      <div className="ten-years-sale__hero">
        <img
          src="/campaigns/ten-years/j-sale-hero-all-products.jpg"
          alt="10 Jahre Jubiläums Sale - Sale des Jahres"
          width="2880"
          height="975"
        />
      </div>

      <div className="ten-years-inner">
        <div className="ten-years-sale__headline">
          <span className="ten-years-eyebrow">10 Jahre Qi Blanco</span>
          <h1>10 Jahre Jubiläums Sale</h1>
          <p>- Alle Angebote im Überblick -</p>
        </div>

        <div
          className="ten-years-sale__grid"
          aria-label="10 Jahre Jubiläums Sale Angebote"
        >
          {DEAL_TILES.map((tile) => {
            const tileImage = (
              <img
                src={tile.src}
                alt={tile.alt}
                width="714"
                height="918"
                loading="lazy"
              />
            );

            return tile.href ? (
              <a className="ten-years-sale__tile" href={tile.href} key={tile.key}>
                {tileImage}
              </a>
            ) : (
              <div
                className="ten-years-sale__tile ten-years-sale__tile--placeholder"
                data-deal-key={tile.key}
                key={tile.key}
              >
                {tileImage}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
