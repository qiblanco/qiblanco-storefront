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

const file = (name) =>
  `/campaigns/ten-years/template-assets/${encodeURIComponent(name)}`;

const COMMON_FREQUENCY_ICONS = [
  {
    image: file('Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp'),
    html: '<p><strong>Persönliches Wachstum</strong></p>',
  },
  {
    image: file('WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp'),
    html: '<p><strong>Schutz vor E-Smog &amp; 5G</strong></p>',
  },
  {
    image: file('Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp'),
    html: '<p><strong>Gesteigerte Anbindung zum Quantenfeld</strong></p>',
  },
  {
    image: file('Green_Checkmark.webp'),
    html: '<p><strong>Wirkung in Zellstudien bestätigt</strong></p>',
    color: '#39682c',
  },
];

const FREQUENCY_TEMPLATE_COPY = {
  'qione-2-pro-duo': {
    heroBackground: file('03_2xQiOne_BF24-min.webp'),
    heroProductImage: file('2xQiOne_2_Pro_Product_Only.png'),
    heroTitle: '2x QiOne® 2 Pro',
    heroSavings: 'Spare 500 €',
    purchaseTitle: 'Jubiläumssale: 2x QiOne® 2 Pro',
    intro:
      'Für Superhumans - dank zweiter Chip Generation und 8-facher Stärke',
    signal:
      '<p>Vernetze jetzt <strong>100 000 000 000 000</strong> Signale</p>',
    savingText: 'Jetzt kaufen und 500€ sparen!',
    ctaHeader: 'Lass deinen QiOne® kohärentes Wasser für dich produzieren',
    ctaButton: 'Spare jetzt 500€',
  },
  'qione-2-pro-necklace': {
    heroBackground: file('02_qione_BF24-min.webp'),
    heroProductImage: file('QiOne_Necklace.png'),
    heroTitle: 'QiOne® 2 Pro + Necklace',
    heroSavings: 'Spare 250 €',
    purchaseTitle: 'Jubiläumssale: QiOne® 2 Pro + Necklace',
    intro:
      'Für Superhumans - dank zweiter Chip Generation und 8-facher Stärke.',
    extra:
      '<p><strong>Unsere hochwertige Necklace ist im Paket enthalten.</strong> Die Länge kannst du dir nach Belieben aussuchen.</p>',
    signal:
      '<p>Vernetze jetzt <strong>100 000 000 000 000</strong> Signale.</p>',
    savingText: 'Jetzt kaufen und 250€ sparen!',
    ctaHeader: 'Lass deinen QiOne® kohärentes Wasser für dich produzieren',
    ctaButton: 'Spare jetzt 250€',
  },
  qibracelet: {
    heroBackground: file('04_QiBracelet_BF24-min.webp'),
    heroProductImage: file('QiBracelet_Pro_Product_Only.png'),
    heroTitle: 'QiBracelet®',
    heroSavings: 'Spare 200 €',
    purchaseTitle: 'Jubiläumssale: QiBracelet®',
    intro: 'Für Superhumans - dank dritter Chip Generation und 10-facher Stärke.',
    signal:
      '<p>Vernetze jetzt <strong>100 000 000 000 000</strong> Signale.</p>',
    savingText: 'Jetzt kaufen und 200€ sparen!',
    ctaHeader: 'Trage dein kohärentes Feld direkt am Körper',
    ctaButton: 'Spare jetzt 200€',
  },
  qihome: {
    heroBackground: file('05_QiHome_BF24-min.webp'),
    heroProductImage: file('QiHome_Product_Only.png'),
    heroTitle: 'QiHome® Air',
    heroSavings: 'Spare 400 €',
    purchaseTitle: 'Jubiläumssale: QiHome® Air',
    intro: 'Der ultimative Schutz für dich & dein gesamtes Zuhause!',
    signal:
      '<p>Vernetze jetzt <strong>100 000 000 000 000</strong> Signale.</p>',
    savingText: 'Jetzt kaufen und 400€ sparen!',
    ctaHeader: 'Bring kohärente Technologie in dein Zuhause',
    ctaButton: 'Spare jetzt 400€',
  },
};

const CACAO_TEMPLATE_COPY = {
  'cacao-create-awake': {
    heroBackground: file('Create_Awake.png'),
    heroProductImage: file('Kakao_Bundle_71fcbd7f-174d-4e80-a046-b629e26467f3.png'),
    heroTitle: 'Crystal Cacao® Create + Awake',
    heroSavings: 'Bundle-Deal',
    purchaseTitle: '2x Crystal Cacao® CREATE + AWAKE - Bio',
    rating: '5.0 ★★★★★ über 1.000+ Nutzer',
    benefits:
      '<p><strong>✅ Wachmacher ohne Crash</strong></p><p><strong>✅ keine Zusätze, kein Zucker - volles Aroma</strong></p><p><strong>✅ nur 96 kcal pro Tasse (15g)</strong></p><p><strong>✅ Sehr ergiebig - 11× mehr Antioxidantien als industrieller Kakao</strong></p>',
  },
  'cacao-awake-duo': {
    heroBackground: file('2x-Awake.webp'),
    heroProductImage: file('2x_Awake_765a9f2f-20f0-4332-a3f3-d8fa01c63c77.png'),
    heroTitle: '2x Crystal Cacao® Awake',
    heroSavings: 'Bundle-Deal',
    purchaseTitle: '2x Awake® - 28 Tage Fokus - Bio',
    rating: '5.0 ★★★★★ Über 1.000+ Nutzer',
    benefits:
      '<p><strong>✅ Präsenz, Verbindung & emotionale Tiefe</strong></p><p><strong>✅ keine Zusätze, kein Zucker - volles Aroma</strong></p><p><strong>✅ nur 96 kcal pro Tasse (15g)</strong></p><p><strong>✅ Sehr ergiebig - 11× mehr Antioxidantien als industrieller Kakao</strong></p>',
  },
  'cacao-create-duo': {
    heroBackground: file('2x-Create-BF.webp'),
    heroProductImage: file('2x_Create_2.png'),
    heroTitle: '2x Crystal Cacao® Create',
    heroSavings: 'Bundle-Deal',
    purchaseTitle: '2x CREATE® - 28 Tage Fokus - Bio',
    rating: '5.0 ★★★★★ über 1.000+ Nutzer',
    benefits:
      '<p><strong>✅ Klarheit, Fokus & kreative Energie</strong></p><p><strong>✅ keine Zusätze, kein Zucker - volles Aroma</strong></p><p><strong>✅ nur 96 kcal pro Tasse (15g)</strong></p><p><strong>✅ Sehr ergiebig - 11× mehr Antioxidantien als industrieller Kakao</strong></p>',
  },
};

const SHIPPING_HTML =
  '<p><strong>Kostenloser Versand</strong> innerhalb Deutschlands</p><p>In 2-3 Tagen bei Dir</p><p>100% Versicherter Versand</p>';

const CACAO_SHIPPING_HTML =
  '<p>✅ Kostenloser Versand ab 99 €<br/>🚚 Lieferung in 1-3 Werktagen<br/>🔄 100% Geld-zurück-Garantie bei Unzufriedenheit<br/>🔬 Laboranalytisch geprüft (Dartsch Institut)<br/>🌿 Bio-zertifiziert nach DE-ÖKO-006</p>';

function toVariantGid(id) {
  return `gid://shopify/ProductVariant/${id}`;
}

function formatMoney(value) {
  return moneyFormatter.format(value);
}

function getTemplateCopy(deal) {
  if (deal.theme === 'cacao') {
    return CACAO_TEMPLATE_COPY[deal.key] || CACAO_TEMPLATE_COPY['cacao-create-awake'];
  }

  return FREQUENCY_TEMPLATE_COPY[deal.key] || FREQUENCY_TEMPLATE_COPY['qione-2-pro-duo'];
}

export function TenYearsDealPage({deal}) {
  const template = getTemplateCopy(deal);
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
      <TemplateHero deal={deal} template={template} />

      <UrgencyText>
        - Jubiläumssale - <br />
        {template.savingText || 'Jetzt sichern und im Presale sparen!'}
      </UrgencyText>

      <ProductPurchase
        deal={deal}
        template={template}
        selectedVariant={selectedVariant}
        setSelectedVariantId={setSelectedVariantId}
        openCart={() => open('cart')}
      />

      {deal.theme === 'frequency' ? (
        <FrequencyTemplateSections deal={deal} template={template} />
      ) : (
        <CacaoTemplateSections deal={deal} template={template} />
      )}
    </main>
  );
}

function TemplateHero({deal, template}) {
  return (
    <section className="j-sale-deal__template-hero">
      <img
        className="j-sale-deal__template-hero-bg"
        src={template.heroBackground}
        alt=""
        aria-hidden="true"
      />
      <div className="j-sale-deal__template-hero-inner">
        <div className="j-sale-deal__template-hero-copy">
          <span>10 Jahre Qi Blanco</span>
          <h1>Jubiläumssale</h1>
          <p>{template.heroTitle || deal.displayTitle}</p>
          <strong>{template.heroSavings}</strong>
        </div>
        <img
          className="j-sale-deal__template-hero-product"
          src={template.heroProductImage || deal.productImage}
          alt={deal.displayTitle}
        />
        <Countdown placement="hero" />
      </div>
    </section>
  );
}

function ProductPurchase({
  deal,
  template,
  selectedVariant,
  setSelectedVariantId,
  openCart,
}) {
  const compareAtPrice = selectedVariant.compareAtPrice;

  return (
    <section className="j-sale-deal__product-template" id="deal">
      <div className="j-sale-deal__product-gallery">
        <div className="j-sale-deal__product-main-image">
          <img
            src={template.heroProductImage || deal.productImage}
            alt={deal.displayTitle}
          />
        </div>
      </div>

      <div className="j-sale-deal__product-copy">
        <h2>{template.purchaseTitle || deal.displayTitle}</h2>
        <p className="j-sale-deal__rating">
          {template.rating || '4.8 ★★★★★ Über 14.000 zufriedene Kunden'}
        </p>
        {template.intro && <p className="j-sale-deal__lead">{template.intro}</p>}
        {template.extra && <HtmlBlock html={template.extra} />}

        {deal.theme === 'frequency' ? (
          <>
            <div className="j-sale-deal__icon-list">
              {COMMON_FREQUENCY_ICONS.map((item) => (
                <div className="j-sale-deal__icon-row" key={item.html}>
                  <img src={item.image} alt="" aria-hidden="true" />
                  <HtmlBlock html={item.html} style={{color: item.color}} />
                </div>
              ))}
            </div>
            <HtmlBlock className="j-sale-deal__signal" html={template.signal} />
          </>
        ) : (
          <>
            <HtmlBlock className="j-sale-deal__cacao-benefits" html={template.benefits} />
            <HtmlBlock
              className="j-sale-deal__cacao-profile"
              html="<p>Einzigartiges natürliches Pflanzenprofil:<br/>✅ wissenschaftlich belegt - direkt spürbar!<br/><br/>6.300 Jahre alte Kakaolinie aus Peru.</p>"
            />
          </>
        )}

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

        <div className="j-sale-deal__legacy-price">
          <span className="j-sale-deal__price-current">
            {formatMoney(selectedVariant.price)}
          </span>
          {compareAtPrice && (
            <span className="j-sale-deal__price-compare">
              {formatMoney(compareAtPrice)}
            </span>
          )}
          <span className="j-sale-deal__price-label">Jubiläumssale</span>
        </div>

        {template.savingText && (
          <p className="j-sale-deal__saving-text">{template.savingText}</p>
        )}

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
          onClick={openCart}
        >
          In den Warenkorb legen
        </AddToCartButton>

        <HtmlBlock
          className="j-sale-deal__shipping-list"
          html={deal.theme === 'cacao' ? CACAO_SHIPPING_HTML : SHIPPING_HTML}
        />
      </div>
    </section>
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
          <strong suppressHydrationWarning>{remaining.days}</strong>
          Tage
        </time>
        <time>
          <strong suppressHydrationWarning>{remaining.hours}</strong>
          Std.
        </time>
        <time>
          <strong suppressHydrationWarning>{remaining.minutes}</strong>
          Min.
        </time>
        <time>
          <strong suppressHydrationWarning>{remaining.seconds}</strong>
          Sek.
        </time>
      </div>
    </div>
  );
}

function UrgencyText({children}) {
  return (
    <section className="j-sale-deal__urgency">
      <p>{children}</p>
    </section>
  );
}

function FrequencyTemplateSections({deal, template}) {
  return (
    <>
      <UrgencyText>- Angebot limitiert auf die ersten 300 Bestellungen! -</UrgencyText>
      <MainFeatures />
      <DealRail currentKey={deal.key} />
      <FrequencyVideoScience />
      <GitterchipSection />
      <FounderSection />
      <WaterStateSection />
      <section className="j-sale-deal__studies-wrap">
        <Studien headline="Wirkung an menschlichen Zellen bestätigt!" />
      </section>
      <MicroscopeSection />
      <FrequencyProofSection />
      <ProductCta deal={deal} template={template} />
      <DealRail currentKey={deal.key} compact />
    </>
  );
}

function MainFeatures() {
  return (
    <section className="j-sale-deal__main-features">
      <h2>MAIN FEATURES</h2>
      <div className="j-sale-deal__main-features-grid">
        <div className="j-sale-deal__seal-image">
          <img src={file('Siegel_2021.png')} alt="Qi Blanco Siegel" loading="lazy" />
        </div>
        <div className="j-sale-deal__feature-copy">
          <article>
            <h3>Noch mehr POWER. Noch mehr FOCUS. Und noch mehr KOHÄRENZ.</h3>
            <p>
              Der QiOne® 2 Pro: Dein täglicher Begleiter für effektiven Schutz
              vor Mobilfunkstrahlung - ausgestattet mit der fortschrittlichen
              Gitterchip™-Technologie der zweiten Generation und 8-facher
              Stärke. Perfekt für eine Welt, die nie stillsteht.
            </p>
          </article>
          <article>
            <h3>Der QiOne® 2 Pro jetzt noch leistungsstärker.</h3>
            <p>
              Erlebe dank des optimierten Gitterchip™ eine bessere Balance,
              eine verbesserte Körper-Geist-Verbindung und einen klaren Zugang
              zu deinem inneren Potenzial.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function FrequencyVideoScience() {
  return (
    <section className="j-sale-deal__legacy-video-grid">
      <div>
        <h3>Superwasser <br />die Grundlage unserer Evolution</h3>
        <YoutubeIframe link="https://www.youtube.com/embed/6rNuQoIrdZQ?controls=0" />
        <YoutubeIframe link="https://www.youtube.com/embed/aG36zJKxDzg?controls=0" />
      </div>
      <div>
        <h3>Schutz vor E-Smog: <br />kohärente Wasserstruktur</h3>
        <YoutubeIframe link="https://www.youtube.com/embed/C3gd-ldFh-M?controls=0" />
        <YoutubeIframe link="https://www.youtube.com/embed/jyLyXZqHxaw?controls=0" />
      </div>
    </section>
  );
}

function GitterchipSection() {
  return (
    <section className="j-sale-deal__gitterchip">
      <h2>Der revolutionäre Gitterchip™ 2.0</h2>
      <h3>Dank neuartigem Chip Design ist dein QiOne® nun 8x stärker</h3>
      <div className="j-sale-deal__image-pair">
        <img
          src={file('QiOne_Gitterchip-1-1024x1024.jpg_1.webp')}
          alt=""
          loading="lazy"
        />
        <img
          src={file('QiOne2Pro_04.jpg_1.webp')}
          alt=""
          loading="lazy"
        />
      </div>
      <h4>28,28 mm³ Leistungsvolumen</h4>
      <div className="j-sale-deal__text-stack">
        <article>
          <h3>Vererbbar</h3>
          <p>
            Das neue Herstellungsverfahren ermöglicht eine Lebensdauer von
            Jahrzehnten. Somit ist der QiOne® 2 Pro nicht nur etwas für dich,
            sondern für die ganze Familie. Intensive Zeiten erfordern intensive
            Lösungen.
          </p>
        </article>
        <article>
          <h3>Für jeden Einsatzort</h3>
          <p>
            Du kannst den QiOne® 2 Pro mit in die Sauna oder ins Schwimmbad
            nehmen, denn er ist beständig gegen Hitze & Chlor. Du darfst ihn
            beim Sport tragen - Schweiß macht ihm nichts mehr aus.
          </p>
        </article>
        <article>
          <h3>Im idealen Preis-Leistungs-Verhältnis</h3>
          <p>
            Der QiOne® 2 Pro stellt gegenüber seinem Vorgänger mit seinem 8x
            Leistungsvolumen und nur dem 2x Anschaffungswert das ideale
            Investment dar. Leistung schlägt Preis. Mehr Power für deine
            Zukunft.
          </p>
        </article>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="j-sale-deal__founder">
      <div>
        <ResponsiveIframe
          src="https://player.vimeo.com/video/698551994?color&autopause=0&loop=0&muted=1&title=0&portrait=0&byline=0&h=cabbd1a6d1"
          title="Gründerinterview QiOne 2 Pro"
        />
      </div>
      <div>
        <h2>Gründerinterview zum QiOne® 2 Pro</h2>
        <h3>
          Wie kommt man denn auf die Idee, ein solch außergewöhnliches Produkt
          auf die Welt zu bringen?
        </h3>
        <p>
          Welche Geschichte und Beweggründe stecken hinter dem QiOne® und was
          hat eigentlich das Quantenfeld mit all dem zu tun?
        </p>
        <p>
          Hör&apos;s dir an und erfahre in diesem Video Christians und Annas Vision,
          Hintergründe und deren persönliche Erfahrungen mit dem QiOne® 2 Pro.
        </p>
      </div>
    </section>
  );
}

function WaterStateSection() {
  return (
    <section className="j-sale-deal__water-state">
      <h2>Der Superzustand des Wassers</h2>
      <div className="j-sale-deal__water-row">
        <img
          src={file('InkohaerentesWasser-2_transparent.png')}
          alt=""
          loading="lazy"
        />
        <div>
          <h3>Inkohärentes Wasser</h3>
          <p>
            Die Wassermoleküle stoßen gelegentlich aneinander und erzeugen ein
            thermisches Rauschen. Das Rauschen sind Störfrequenzen, da sie die
            positiven Frequenzen überlagern und damit die Kommunikation
            beeinflussen.
          </p>
        </div>
      </div>
      <div className="j-sale-deal__water-row">
        <img
          src={file('KohaerentesWasser-2_transparent.png')}
          alt=""
          loading="lazy"
        />
        <div>
          <h3>Kohärentes Wasser</h3>
          <p>
            Zusätzliche Wasserstoffbrücken führen dazu, dass sich die
            Wassermoleküle in einer kristallinen Struktur anordnen und sich
            stoßfrei zueinander bewegen. Somit kommen alle Signale optimal an.
          </p>
        </div>
      </div>
    </section>
  );
}

function MicroscopeSection() {
  return (
    <section className="j-sale-deal__microscope">
      <h2>Kann man den Effekt unter dem Mikroskop sehen? Ja!</h2>
      <ScrollMikroskopVideo />
    </section>
  );
}

function FrequencyProofSection() {
  const videos = [
    'https://www.youtube-nocookie.com/embed/OAVUdRYGoDA',
    'https://www.youtube-nocookie.com/embed/zIfDQ1N60fI',
    'https://www.youtube-nocookie.com/embed/bgsAHLaQRLU',
    'https://www.youtube-nocookie.com/embed/jyLyXZqHxaw',
    'https://www.youtube-nocookie.com/embed/pI9fdZYhVUA',
    'https://www.youtube-nocookie.com/embed/aG36zJKxDzg',
  ];

  return (
    <section className="j-sale-deal__proof">
      <h2>Erfahrungen aus der Community</h2>
      <div className="j-sale-deal__proof-grid">
        <img
          src={file('Bildschirmfoto-2022-05-02-um-13.28.12-631x1024.png_1.webp')}
          alt="Kundenfeedback"
          loading="lazy"
        />
        <img
          src={file('Bildschirmfoto-2022-05-02-um-13.30.52-631x1024.png_1.webp')}
          alt="Kundenfeedback"
          loading="lazy"
        />
        <ResponsiveIframe
          src="https://www.youtube-nocookie.com/embed/o1LlHKc8eZY"
          title="Kundenfeedback Video"
        />
      </div>
      <div className="j-sale-deal__youtube-slider">
        {videos.map((video) => (
          <ResponsiveIframe src={video} title="Qi Blanco Erfahrung" key={video} />
        ))}
      </div>
    </section>
  );
}

function ProductCta({deal, template}) {
  return (
    <section className="j-sale-deal__product-cta">
      <img
        src={template.heroProductImage || deal.productImage}
        alt={deal.displayTitle}
        loading="lazy"
      />
      <div>
        <h2>{template.ctaHeader || 'Sichere dir dein Jubiläumsangebot'}</h2>
        <HtmlBlock html="<p><strong>✅ 100% deutsche Produktion</strong></p><p><strong>✅ Hochwertigste Materialien</strong></p><p><strong>✅ Weltweiter Versand</strong></p>" />
        <a className="j-sale-deal__button" href="#deal">
          {template.ctaButton || 'Jetzt sichern'}
        </a>
      </div>
    </section>
  );
}

function CacaoTemplateSections({deal}) {
  return (
    <>
      <DealRail currentKey={deal.key} />
      <CacaoStory />
      <DealRail currentKey={deal.key} compact />
      <CacaoFaq />
    </>
  );
}

function CacaoStory() {
  return (
    <>
      <HtmlTextSection
        html="<h2><strong>Crystal Cacao® Create</strong></h2><h3><strong>💛 Klarheit. Fokus. Kreative Energie.</strong></h3><p>Viele Nutzer berichten, dass Create geistige Klarheit fördert, die Konzentration verbessert und gleichzeitig eine innere Ausgeglichenheit bewahrt - ohne nervös zu machen.</p>"
      />
      <FullImage src={file('2024-06-qiblanco-bali-06550.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Wach. Verbunden. Ohne den Absturz.</strong></h2><ul><li><strong>1.050 mg Theobromin &amp; 140 mg Koffein</strong> erzeugen zusammen eine stabile, langanhaltende Wachheit.</li><li><strong>10 mg Phenylethylamin</strong> ist bekannt als Teil des körpereigenen Glücks- &amp; Motivationssystems.</li><li><strong>61 µg Anandamid</strong> wird mit mentaler Klarheit und ruhiger Präsenz in Verbindung gebracht.</li><li><strong>20 mg freies L-Tryptophan</strong> unterstützt als Serotonin-Vorstufe emotionale Balance.</li><li><strong>5.620 mg Polyphenole &amp; Flavanole</strong> tragen zur allgemeinen kognitiven Vitalität bei.</li></ul><p><strong>Create enthält das stärkste aktivierende Profil aller Kristall Kakao® Sorten - für sanfte Wachheit, kognitive Klarheit und stabile innere Ausrichtung.</strong></p>"
      />
      <FullImage src={file('2024-06-qiblanco-bali-1052459-kaffee.webp')} />
      <FullImage src={file('bohne-create.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Für wen ist Crystal Cacao® Awake ideal?</strong></h2><p>Wenn du ...</p><ul><li>✅ klare Gedanken und geistige Struktur brauchst</li><li>✅ kreative Ideen entwickeln willst - mit innerer Ruhe</li><li>✅ präsent sein willst - ohne Reizüberflutung oder Nervosität</li><li>✅ dich emotional stabil und mental wach fühlen möchtest</li><li>✅ bewusst auf Kaffee oder stimulierende Drinks verzichten willst</li></ul><p>Dann ist Crystal Cacao® Create dein Ritual-Kakao für fokussierte Energie.</p>"
      />
      <FullImage src={file('2024-06-qiblanco-bali-06610.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Anwendung &amp; Tageszeiten</strong></h2><ul><li>🕓 Morgens: für einen ruhigen Start mit klarem Kopf und sanfter Wachheit</li><li>🕑 Nachmittags: für fokussierte Kreativarbeit ohne Koffein-Crash</li><li>🧘 Abends: zur Unterstützung von mentaler Klarheit &amp; emotionalem Ausklang</li><li>🍶 Zubereitung: 15 g in warmer Pflanzenmilch oder Wasser - abgestimmt auf dein Ritual</li></ul>"
      />
      <FullImage src={file('DSC02183.jpg')} />
      <HtmlTextSection
        html="<h2>Natürlich reich an über 20 wichtigen Mineralstoffen &amp; Spurenelementen</h2><p><strong>Crystal Cacao® Create liefert dir eine breite Palette an bioverfügbaren Mikronährstoffen - genau so, wie sie die Natur vorgesehen hat.</strong></p><p>Durch den schonenden Herstellungsprozess bleiben in Create viele essenzielle Mikronährstoffe erhalten, die dein Körper täglich braucht - in bioverfügbarer Form und perfekt abgestimmt durch die Natur.</p><p>🧬 Enthält u. a.:<br/>✅ Magnesium, Kalium, Calcium, Phosphor, Natrium<br/>✅ Eisen, Zink, Kupfer, Mangan, Kobalt, Nickel, Chrom<br/>✅ sowie natürlich vorkommende Spurenelemente wie Silizium, Bor, Vanadium und weitere</p>"
      />
      <HtmlTextSection
        html="<p>*Diese Aussagen basieren auf den allgemeinen wissenschaftlich anerkannten Funktionen der enthaltenen Mikronährstoffe gemäß EU-Verordnung.</p>"
        compact
      />
      <HtmlTextSection
        html="<h2>Analyse der enthaltenen Mineralstoffe &amp; Spurenelemente</h2><h3>Essentielle Mineralstoffe</h3><ul><li>1. Magnesium (Mg) - Energiehaushalt, Nerven</li><li>2. Kalium (K) - Herzfunktion, Zellspannung</li><li>3. Calcium (Ca) - Knochen, Signalwege</li><li>4. Phosphor (P) - ATP-Bildung</li><li>5. Natrium (Na) - Elektrolytgleichgewicht</li></ul><h3>Essentielle Spurenelemente</h3><ul><li>6. Eisen (Fe) - Sauerstofftransport</li><li>7. Zink (Zn) - Immunsystem, Enzyme</li><li>8. Kupfer (Cu) - antioxidative Enzyme</li><li>9. Mangan (Mn) - antioxidative Cofaktoren</li><li>10. Chrom (Cr) - Glukosestoffwechsel</li><li>11. Nickel (Ni) - enzymatische Prozesse</li><li>12. Kobalt (Co) - Bestandteil von Vitamin B12</li></ul><h3>Weitere natürliche Spurenelemente</h3><ul><li>13. Silizium (Si) - Bindegewebe, Struktur</li><li>14. Bor (B) - Knochen, kognitive Funktionen</li><li>15. Strontium (Sr) - Mineralstoffwechsel</li><li>16. Rubidium (Rb) - intrazellulärer Marker</li><li>17. Vanadium (V) - Glukosestoffwechsel</li></ul>"
      />
      <FullImage src={file('DSC01491_Kopie.webp')} />
      <HtmlTextSection
        html="<h2>Herkunft: Spüre die Kraft des Amazonas</h2><p>Aus dem geheimnisvollen Amazonas bringen wir dir eine heilige Pflanze in ihrer reinsten Form: unseren bio-zertifizierten <strong>Kristall Kakao® Create</strong>. Diese besonderen Kakaobohnen stammen aus nachhaltigem Anbau in den Bergwäldern des peruanischen Departamento Amazonas.</p><p>Sie werden behutsam bei niedriger Temperatur vermahlen und anschließend in eine elegante, quadratische 420 g-Tafel gegossen - ein purer Block Bio Kristall Kakao®.</p>"
      />
      <FullImage src={file('montegrande.jpg')} />
      <HtmlTextSection
        html="<p>Copyright: QUIRINO OLIVERA NUÑEZ<br/>ASOCIACION PARA LA INVESTICAGION CIENTIFICA DE LA AMAZONIA DE PERU</p><h2><strong>Crystal Cacao® - Ursprung, der 6.300 Jahre zurückreicht</strong></h2><p>Im Norden Perus, im Tal von Jaén und Bagua, erhebt sich der mystische Spiraltempel von Montegrande - ein Ort, an dem Archäologen Kakaorückstände in 6.300 Jahre alten Keramiken entdeckt haben.</p><p>Diese Verbindung aus Archäologie, Ökologie und Genetik zeichnet ein klares Bild: Crystal Cacao® wächst dort, wo die Geschichte des Kakaos ihren Ursprung hat.</p><h2><strong>🛡️ Unsere Garantie:</strong></h2><ul><li><strong>🔒 100% Kakao. 0% Risiko.</strong></li><li><strong>✔️ Wissenschaftlich analysiert</strong></li><li><strong>✔️ Rückgabe innerhalb von 20 Tagen - auch angebrochen</strong></li><li><strong>✔️ Bio-zertifiziert &amp; aromasicher verpackt</strong></li></ul>"
      />
      <FullImage src={file('DSC01953_Kopie.webp')} />
      <HtmlTextSection
        html="<h2><strong>Wusstest du?</strong></h2><p>Unser Kakao wird in einer strukturierten Umgebung mit der QiHome® Air-Technologie verarbeitet - einer innovativen Lösung, die ein harmonisches Feld erzeugt und die Qualität natürlicher Rohstoffe in ihrer feinen Struktur unterstützen kann.</p><p>👉 Erfahre mehr über unsere unterstützenden Tools - wie der QiOne® oder das QiBracelet® - und entdecke, wie du dein eigenes Umfeld energetisch stärken und bewusster gestalten kannst.</p>"
      />
    </>
  );
}

function CacaoFaq() {
  const faqs = [
    {
      title: 'Was ist zeremonieller Kakao?',
      text: 'Zeremonieller Kakao ist eine spezielle Form von Kakao, die absichtsvoll und bewusst zubereitet und konsumiert wird.',
    },
    {
      title: 'Was bedeutet psychoaktiv in diesem Zusammenhang?',
      text: 'Psychoaktiver Kakao enthält natürliche Verbindungen wie Theobromin, Koffein, Phenylethylamin und Anandamid. Diese Effekte sind subtil und nicht mit starken Rauschzuständen vergleichbar.',
    },
    {
      title: 'Wie wird zeremonieller Kakao zubereitet?',
      text: 'Etwa 20 bis 25g Kakao zerkleinern, in warmer Pflanzenmilch oder Wasser auflösen und bewusst genießen.',
    },
    {
      title: 'Für wen ist Kakao ungeeignet?',
      text: 'Personen mit hoher Empfindlichkeit gegenüber Koffein, Schwangerschaft oder bestimmten Medikamenten sollten vorher ärztlichen Rat einholen.',
    },
  ];

  return (
    <section className="j-sale-deal__faq">
      <h2>Häufig gestellte Fragen (FAQ)</h2>
      {faqs.map((faq) => (
        <details key={faq.title}>
          <summary>{faq.title}</summary>
          <p>{faq.text}</p>
        </details>
      ))}
    </section>
  );
}

function FullImage({src}) {
  return (
    <section className="j-sale-deal__fullscreen-image">
      <img src={src} alt="" loading="lazy" />
    </section>
  );
}

function HtmlTextSection({html, compact = false}) {
  return (
    <section
      className={
        compact
          ? 'j-sale-deal__html-section is-compact'
          : 'j-sale-deal__html-section'
      }
    >
      <HtmlBlock html={html} />
    </section>
  );
}

function DealRail({currentKey, compact = false}) {
  return (
    <section
      className={compact ? 'j-sale-deal__rail is-compact' : 'j-sale-deal__rail'}
      aria-label="Weitere 10 Jahre Jubiläumssale Angebote"
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

function ResponsiveIframe({src, title}) {
  return (
    <div className="j-sale-deal__iframe">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function HtmlBlock({html, className, style}) {
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{__html: html}}
    />
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
