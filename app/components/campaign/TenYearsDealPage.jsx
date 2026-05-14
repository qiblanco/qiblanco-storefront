import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  TEN_YEARS_COUNTDOWN_TARGET,
  TEN_YEARS_DEALS,
} from '~/data/ten-years-deals';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';

const moneyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function toVariantGid(id) {
  return `gid://shopify/ProductVariant/${id}`;
}

function formatMoney(value) {
  return moneyFormatter.format(value);
}

export function TenYearsDealPage({deal}) {
  const [selectedVariantId, setSelectedVariantId] = useState(deal.variants[0].id);
  const selectedVariant = useMemo(
    () =>
      deal.variants.find((variant) => variant.id === selectedVariantId) ||
      deal.variants[0],
    [deal.variants, selectedVariantId],
  );
  const {open} = useAside();

  return (
    <main className={`j-sale-deal j-sale-deal--${deal.theme}`}>
      <section className="j-sale-deal__hero">
        <img
          src="/campaigns/ten-years/j-sale-hero-products-edit.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="j-sale-deal__hero-content">
          <span>10 Jahre Qi Blanco</span>
          <h1>10 Jahre Jubiläums Sale</h1>
          <p>{deal.displayTitle}</p>
        </div>
      </section>

      <section className="j-sale-deal__intro" id="deal">
        <div className="j-sale-deal__product-visual">
          <img src={deal.productImage} alt={deal.displayTitle} />
        </div>

        <div className="j-sale-deal__purchase">
          <span className="j-sale-deal__eyebrow">{deal.eyebrow}</span>
          <h2>{deal.displayTitle}</h2>
          <p>{deal.shortCopy}</p>

          <Countdown />

          <ul className="j-sale-deal__benefits">
            {deal.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          {deal.variants.length > 1 && (
            <div className="j-sale-deal__variant-picker">
              <span>Variante wählen</span>
              <div>
                {deal.variants.map((variant) => (
                  <button
                    type="button"
                    className={
                      variant.id === selectedVariant.id
                        ? 'j-sale-deal__variant is-active'
                        : 'j-sale-deal__variant'
                    }
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="j-sale-deal__price">
            <strong>{formatMoney(selectedVariant.price)}</strong>
            {selectedVariant.compareAtPrice && (
              <s>{formatMoney(selectedVariant.compareAtPrice)}</s>
            )}
          </div>

          {deal.discountCode && (
            <p className="j-sale-deal__discount-note">
              Rabattcode {deal.discountCode} wird im Pre-Sale über den Deal-Link
              aktiviert.
            </p>
          )}

          <AddToCartButton
            lines={[
              {
                merchandiseId: toVariantGid(selectedVariant.id),
                quantity: 1,
              },
            ]}
            onClick={() => open('cart')}
          >
            {deal.displayTitle} sichern
          </AddToCartButton>

          <p className="j-sale-deal__finance-note">
            20 Tage risikofrei testen · Sicherer Checkout · 0% Finanzierung über
            Klarna und PayPal
          </p>
        </div>
      </section>

      <DealRail currentKey={deal.key} />

      {deal.theme === 'frequency' ? (
        <ScrollMikroskopVideo />
      ) : (
        <CacaoProofSection />
      )}

      <ProductGuaranteeBanner deal={deal} />
      <DealRail currentKey={deal.key} compact />
    </main>
  );
}

function Countdown() {
  const [remaining, setRemaining] = useState(() =>
    getRemaining(TEN_YEARS_COUNTDOWN_TARGET),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(TEN_YEARS_COUNTDOWN_TARGET));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="j-sale-deal__countdown" aria-label="Pre-Sale Countdown">
      <span>Pre-Sale endet in</span>
      <div>
        <time>
          <strong>{remaining.days}</strong>
          Tage
        </time>
        <time>
          <strong>{remaining.hours}</strong>
          Std.
        </time>
        <time>
          <strong>{remaining.minutes}</strong>
          Min.
        </time>
        <time>
          <strong>{remaining.seconds}</strong>
          Sek.
        </time>
      </div>
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
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
  };
}

function DealRail({currentKey, compact = false}) {
  return (
    <section
      className={compact ? 'j-sale-deal__rail is-compact' : 'j-sale-deal__rail'}
      aria-label="Weitere 10 Jahre Jubiläums Sale Angebote"
    >
      <div className="j-sale-deal__section-heading">
        <span>Alle Deals</span>
        <h2>Wechsle direkt zum nächsten Jubiläumsangebot</h2>
      </div>
      <div className="j-sale-deal__slider">
        {TEN_YEARS_DEALS.map((item) => (
          <Link
            className={
              item.key === currentKey
                ? 'j-sale-deal__slide is-active'
                : 'j-sale-deal__slide'
            }
            to={item.listingHref}
            key={item.key}
          >
            <img src={item.tileSrc} alt={item.title} loading="lazy" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductGuaranteeBanner({deal}) {
  return (
    <section className="j-sale-deal__guarantee">
      <div className="j-sale-deal__guarantee-media">
        <img src={deal.productImage} alt={deal.displayTitle} loading="lazy" />
        <div className="j-sale-deal__seal">
          <strong>20</strong>
          Tage
        </div>
      </div>
      <div className="j-sale-deal__guarantee-copy">
        <span>Bereit?</span>
        <h2>Spür den Unterschied - oder bekomm dein Geld zurück.</h2>
        <p>
          Teste {deal.displayTitle} 20 Tage in deinem Alltag. Überzeugt es dich
          nicht, erstatten wir dir den vollen Kaufpreis.
        </p>
        <a className="j-sale-deal__button" href="#deal">
          {deal.displayTitle} sichern
        </a>
      </div>
    </section>
  );
}

function CacaoProofSection() {
  return (
    <section className="j-sale-deal__cacao-proof">
      <div>
        <span>Crystal Cacao®</span>
        <h2>Wach. Klar. Im Flow.</h2>
        <p>
          Naturreiner Bio-Kakao als bewusster Begleiter für Fokus, Energie und
          klare Rituale im Alltag.
        </p>
      </div>
      <img
        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06610.jpg?v=1763050714"
        alt="Crystal Cacao Ritual"
        loading="lazy"
      />
    </section>
  );
}
