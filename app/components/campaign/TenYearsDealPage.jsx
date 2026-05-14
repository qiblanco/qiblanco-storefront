import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  TEN_YEARS_COUNTDOWN_TARGET,
  TEN_YEARS_DEALS,
} from '~/data/ten-years-deals';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {Studien} from '~/components/reusables/Studien';

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
          <Countdown placement="hero" />
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

      {deal.theme === 'frequency' ? (
        <FrequencyTemplateSections deal={deal} />
      ) : (
        <CacaoTemplateSections deal={deal} />
      )}

      <ProductGuaranteeBanner deal={deal} />
      <DealRail currentKey={deal.key} compact />
    </main>
  );
}

function Countdown({placement = 'default'}) {
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
    <div
      className={
        placement === 'hero'
          ? 'j-sale-deal__countdown j-sale-deal__countdown--hero'
          : 'j-sale-deal__countdown'
      }
      aria-label="Pre-Sale Countdown"
    >
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

function FrequencyTemplateSections({deal}) {
  return (
    <>
      <section className="j-sale-deal__main-features">
        <div className="j-sale-deal__science-badge">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/sticker_raten2_2.png?v=1656891097"
            alt=""
            aria-hidden="true"
          />
          <span>Zellbiologisch geprüft</span>
        </div>
        <div>
          <h2>MAIN FEATURES</h2>
          <div className="j-sale-deal__feature-columns">
            <div>
              <h3>Noch mehr POWER. Noch mehr FOCUS. Und noch mehr KOHÄRENZ.</h3>
              <p>
                {deal.displayTitle} ist dein täglicher Begleiter für ein
                bewusst gestaltetes Umfeld, persönliche Klarheit und spürbare
                Unterstützung im Alltag.
              </p>
            </div>
            <div>
              <h3>Spürbare Unterstützung für deinen Alltag.</h3>
              <p>
                Die optimierte Gitterchip-Technologie unterstützt Balance,
                Körper-Geist-Verbindung und einen klaren Zugang zu deinem
                inneren Potenzial.
              </p>
            </div>
          </div>
        </div>
      </section>

      <DealRail currentKey={deal.key} />

      <section className="j-sale-deal__video-grid">
        <div>
          <h3>Superwasser die Grundlage unserer Evolution</h3>
          <YoutubeIframe link="https://www.youtube.com/embed/6rNuQoIrdZQ" />
        </div>
        <div>
          <h3>Schutz vor E-Smog: kohärente Wasserstruktur</h3>
          <YoutubeIframe link="https://www.youtube.com/embed/aG36zJKxDzg" />
        </div>
      </section>

      <section className="j-sale-deal__gitterchip">
        <div>
          <span>Gitterchip 2.0</span>
          <h2>Der revolutionäre Gitterchip™ 2.0</h2>
          <p>
            Das neue Chipdesign ist auf Jahrzehnte ausgelegt und für den
            täglichen Einsatz gemacht: Zuhause, unterwegs, beim Sport und in
            intensiven Phasen.
          </p>
        </div>
        <div className="j-sale-deal__feature-cards">
          <article>
            <h3>Vererbbar</h3>
            <p>
              Das Herstellungsverfahren ist auf lange Lebensdauer ausgelegt,
              damit dein Investment langfristig wirken kann.
            </p>
          </article>
          <article>
            <h3>Für jeden Einsatzort</h3>
            <p>
              Entwickelt für Alltag, Schlafplatz, Arbeitsplatz und bewusste
              Routinen in einer stark vernetzten Umgebung.
            </p>
          </article>
          <article>
            <h3>Starkes Verhältnis aus Leistung und Preis</h3>
            <p>
              Mehr Leistungsvolumen, mehr Präsenz und ein Sale-Angebot, das
              den Einstieg besonders attraktiv macht.
            </p>
          </article>
        </div>
      </section>

      <section className="j-sale-deal__founder">
        <div>
          <h2>Gründerinterview zum QiOne® 2 Pro</h2>
          <p>
            Welche Geschichte und Beweggründe stecken hinter Qi Blanco und was
            hat das Quantenfeld mit all dem zu tun?
          </p>
        </div>
        <YoutubeIframe link="https://www.youtube.com/embed/jyLyXZqHxaw" />
      </section>

      <section className="j-sale-deal__water-state">
        <h2>Der Superzustand des Wassers</h2>
        <div>
          <article>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/InkohaerentesWasser-2_transparent.png?v=1670949073"
              alt=""
              aria-hidden="true"
            />
            <h3>Inkohärentes Wasser</h3>
            <p>
              Wassermoleküle stoßen gelegentlich aneinander und erzeugen
              thermisches Rauschen, das positive Frequenzen überlagern kann.
            </p>
          </article>
          <article>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/KohaerentesWasser-2_transparent.png?v=1670949081"
              alt=""
              aria-hidden="true"
            />
            <h3>Kohärentes Wasser</h3>
            <p>
              Zusätzliche Wasserstoffbrücken können eine geordnetere Struktur
              begünstigen, in der Signale besser übertragen werden.
            </p>
          </article>
        </div>
      </section>

      <Studien headline="Wirkung an menschlichen Zellen bestätigt!" />
      <ScrollMikroskopVideo />

      <section className="j-sale-deal__reviews">
        <span>Social Proof</span>
        <h2>Mehr als 14.000 zufriedene Kunden</h2>
        <div className="j-sale-deal__review-card">
          <strong>4.7 ★★★★★</strong>
          <p>
            Tausende Kundinnen und Kunden nutzen Qi Blanco Produkte bereits im
            Alltag für mehr Klarheit, Balance und ein bewusst gestaltetes
            Umfeld.
          </p>
        </div>
      </section>
    </>
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

function CacaoTemplateSections({deal}) {
  return (
    <>
      <DealRail currentKey={deal.key} />

      <section className="j-sale-deal__cacao-proof">
        <div>
          <span>Crystal Cacao®</span>
          <h2>Wach. Klar. Im Flow.</h2>
          <p>
            Naturreiner Bio-Kakao als bewusster Begleiter für Fokus, Energie
            und klare Rituale im Alltag.
          </p>
        </div>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06610.jpg?v=1763050714"
          alt="Crystal Cacao Ritual"
          loading="lazy"
        />
      </section>

      <section className="j-sale-deal__cacao-grid">
        <article>
          <h2>Crystal Cacao® Create</h2>
          <h3>Klarheit. Fokus. Kreative Energie.</h3>
          <p>
            Viele Nutzer berichten, dass Create geistige Klarheit fördert,
            Konzentration verbessert und gleichzeitig innere Ausgeglichenheit
            bewahrt.
          </p>
        </article>
        <article>
          <h2>Wach. Verbunden. Ohne den Absturz.</h2>
          <ul>
            <li>Natürliches Theobromin für stabile Wachheit.</li>
            <li>Antioxidantien und Polyphenole aus reiner Pflanzenkraft.</li>
            <li>Bewusstes Ritual statt klassischem Koffein-Crash.</li>
          </ul>
        </article>
      </section>

      <section className="j-sale-deal__cacao-text">
        <h2>Für wen ist Crystal Cacao® ideal?</h2>
        <div className="j-sale-deal__feature-cards">
          <article>
            <h3>Klarer Kopf</h3>
            <p>Für kreative Ideen, fokussierte Arbeit und präsente Routinen.</p>
          </article>
          <article>
            <h3>Bewusste Energie</h3>
            <p>Für sanfte Wachheit ohne nervöse Spitzen im Alltag.</p>
          </article>
          <article>
            <h3>Ritual & Balance</h3>
            <p>Für Morgen, Nachmittag oder bewusstes Runterkommen am Abend.</p>
          </article>
        </div>
      </section>

      <section className="j-sale-deal__cacao-minerals">
        <div>
          <h2>Natürlich reich an Mineralstoffen & Spurenelementen</h2>
          <p>
            Crystal Cacao® liefert dir eine breite Palette natürlich
            vorkommender Mikronährstoffe in einer naturbelassenen, aromatischen
            Form.
          </p>
        </div>
        <ul>
          <li>Magnesium, Kalium, Calcium und Phosphor</li>
          <li>Eisen, Zink, Kupfer und Mangan</li>
          <li>Schonend verarbeitet und bio-zertifiziert</li>
        </ul>
      </section>

      <section className="j-sale-deal__cacao-origin">
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DSC00308_Kopie.webp?v=1763062180"
          alt="Crystal Cacao Herkunft"
          loading="lazy"
        />
        <div>
          <h2>Herkunft: Spüre die Kraft des Amazonas</h2>
          <p>
            Aus dem Norden Perus kommt eine besondere Kakaolinie mit tiefer
            Geschichte. Schonend verarbeitet, aromadicht verpackt und gemacht
            für bewusste Rituale.
          </p>
        </div>
      </section>

      <section className="j-sale-deal__cacao-guarantee">
        <h2>Unsere Garantie</h2>
        <ul>
          <li>100% Kakao. 0% Risiko.</li>
          <li>Rückgabe innerhalb von 20 Tagen, auch angebrochen.</li>
          <li>Bio-zertifiziert und aromasicher verpackt.</li>
        </ul>
      </section>

      <section className="j-sale-deal__faq">
        <h2>Häufig gestellte Fragen</h2>
        <details>
          <summary>Was ist zeremonieller Kakao?</summary>
          <p>
            Zeremonieller Kakao ist naturbelassener, hochwertiger Kakao, der
            bewusst zubereitet und als Ritualgetränk genutzt wird.
          </p>
        </details>
        <details>
          <summary>Wie bereite ich Crystal Cacao® zu?</summary>
          <p>
            15g Kakao in warmer Pflanzenmilch oder Wasser auflösen und bewusst
            genießen.
          </p>
        </details>
      </section>
    </>
  );
}
