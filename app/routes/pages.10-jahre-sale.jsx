import tenYearsStyles from '~/styles/ten-years-sale.css?url';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsStyles}];
}

export const meta = () => [
  {title: '10 Jahre Jubiläums Sale - Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

const DEAL_TILES = [
  {
    src: '/campaigns/ten-years/j-sale-price-tile-2x-q2pro-de.png',
    alt: 'Jubiläums Sale Angebot: 2x QiOne 2 Pro - spare 500 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-q2pro-necklace-de.png',
    alt: 'Jubiläums Sale Angebot: QiOne 2 Pro und Necklace - spare 250 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-qibracelet-de.png',
    alt: 'Jubiläums Sale Angebot: QiBracelet - spare 200 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-qihome-de.png',
    alt: 'Jubiläums Sale Angebot: QiHome - spare 400 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-create-awake-de.png',
    alt: 'Jubiläums Sale Angebot: Crystal Cacao Create und Awake - spare 76 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-2x-create-de.png',
    alt: 'Jubiläums Sale Angebot: 2x Crystal Cacao Create - spare 76 Euro',
  },
  {
    src: '/campaigns/ten-years/j-sale-price-tile-2x-awake-de.png',
    alt: 'Jubiläums Sale Angebot: 2x Crystal Cacao Awake - spare 76 Euro',
  },
];

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
          {DEAL_TILES.map((tile) => (
            <div
              className="ten-years-sale__tile ten-years-sale__tile--placeholder"
              key={tile.src}
            >
              <img
                src={tile.src}
                alt={tile.alt}
                width="714"
                height="918"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
