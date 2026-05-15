import {useEffect, useState} from 'react';
import tenYearsStyles from '~/styles/ten-years-sale.css?url';
import {
  TEN_YEARS_COUNTDOWN_TARGET,
  TEN_YEARS_DEALS,
} from '~/data/ten-years-deals';

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
        <div className="ten-years-sale__hero-content">
          <h1>10 Jahre Jubiläums Sale</h1>
          <SaleCountdown />
        </div>
      </div>

      <div className="ten-years-inner">
        <div className="ten-years-sale__headline">
          <span className="ten-years-eyebrow">10 Jahre Qi Blanco</span>
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

function SaleCountdown() {
  const [remaining, setRemaining] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const update = () => setRemaining(getRemaining(TEN_YEARS_COUNTDOWN_TARGET));

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="ten-years-sale__countdown" aria-label="Pre-Sale Countdown">
      <time>
        <strong suppressHydrationWarning>{remaining.hours}</strong>
        Stunden
      </time>
      <time>
        <strong suppressHydrationWarning>{remaining.minutes}</strong>
        Minuten
      </time>
      <time>
        <strong suppressHydrationWarning>{remaining.seconds}</strong>
        Sekunden
      </time>
    </div>
  );
}

function getRemaining(target) {
  const diff = Math.max(new Date(target).getTime() - Date.now(), 0);
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    hours: String(days * 24 + hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
  };
}
