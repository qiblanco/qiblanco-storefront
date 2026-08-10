import {useEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router';
import {
  TEN_YEARS_DEALS,
  getTenYearsCountdownRemaining,
} from '~/data/ten-years-deals';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {Studien} from '~/components/reusables/Studien';
import {useDragSwipe} from '~/components/reusables/useDragSwipe';

const wholeEuroFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const file = (name) =>
  `/campaigns/ten-years/template-assets/${encodeURIComponent(name)}`;

const NEUTRAL_HERO_BACKGROUND = file('j-sale-neutral-hero-desktop.png');
const NEUTRAL_HERO_MOBILE_BACKGROUND = file('j-sale-neutral-hero-mobile.png');

const shopifyFile = (path) =>
  `https://cdn.shopify.com/s/files/1/0279/3095/1750/files/${path}`;

const KAKAO_HERO_SAVINGS_IMAGE = shopifyFile(
  'kakao-sparen_e065a7fd-329e-423a-a285-ee9f20e8e099.png',
);

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
    galleryImages: [
      file('2xQiOne_2_Pro_Product_Only.png'),
      shopifyFile('QiOne1.webp?v=1732874828'),
      shopifyFile('QiOne2.webp?v=1732874829'),
      shopifyFile('QiOne3.webp?v=1732874828'),
      shopifyFile('productohoto_48a1ddae-fff5-4e7f-bc61-385f08a6ad26.png?v=1702472932'),
    ],
    purchaseTitle: 'Jubiläums Sale: 2x QiOne® 2 Pro',
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
    heroTitleLines: ['QiOne® 2 Pro', '+ Necklace'],
    heroSavings: 'Spare 250 €',
    purchaseImage: shopifyFile(
      'QiOne_NecklaceBundlev3Transparent_1.png?v=1719311888',
    ),
    galleryImages: [
      shopifyFile('QiOne_NecklaceBundlev3Transparent_1.png?v=1719311888'),
      shopifyFile('QiOne1.webp?v=1732874828'),
      shopifyFile('QiOne2.webp?v=1732874829'),
      shopifyFile('Necklace_07_fb5094a4-f6c8-4565-a5a8-5b86208cbb94.webp?v=1698259307'),
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/products/necklace_01.png?v=1698259307',
    ],
    purchaseTitle: 'Jubiläums Sale: QiOne® 2 Pro + Necklace',
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
    galleryImages: [
      file('QiBracelet_Pro_Product_Only.png'),
      shopifyFile('QiBracelet1.webp?v=1732874909'),
      shopifyFile('QiBracelet3.webp?v=1732874910'),
      shopifyFile('QiBracelet2.webp?v=1732874909'),
      shopifyFile('2023-03-01-qiblanco-milva-martin-1020737_1.png?v=1732476042'),
    ],
    purchaseTitle: 'Jubiläums Sale: QiBracelet®',
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
    galleryImages: [
      file('QiHome_Product_Only.png'),
      shopifyFile('QiHome1.webp?v=1732874979'),
      shopifyFile('QiHome2.webp?v=1732874979'),
      shopifyFile('QiHome3.webp?v=1732874981'),
      shopifyFile('2023-03-01-qiblanco-milva-martin-1020566_40c1ab65-8437-4303-841a-e2741fcaa3c7.png?v=1762975086'),
    ],
    purchaseTitle: 'Jubiläums Sale: QiHome® Air',
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
    heroTitleImage: shopifyFile('create-awake-kakao-text.png'),
    heroSavingsImage: KAKAO_HERO_SAVINGS_IMAGE,
    heroTitle: 'Crystal Cacao® Create + Awake',
    heroSavings: 'Spare 76 €',
    galleryImages: [
      file('Kakao_Bundle_71fcbd7f-174d-4e80-a046-b629e26467f3.png'),
      shopifyFile('Doypack_Mockup__v3-min.png?v=1765893937'),
      shopifyFile('Doypack_Mockup__v3_back-min.png?v=1766919082'),
      shopifyFile('7.png?v=1765893911'),
      shopifyFile('Kakao2.png?v=1766919082'),
      shopifyFile('3_1f81ca34-c281-4907-b36c-783b7c6a2cb3.png?v=1766919764'),
    ],
    purchaseTitle: '2x Crystal Cacao® CREATE + AWAKE - Bio',
    rating: '5.0 ★★★★★ über 1.000+ Nutzer',
    benefits:
      '<p><strong>✅ Wachmacher ohne Crash</strong></p><p><strong>✅ keine Zusätze, kein Zucker - volles Aroma</strong></p><p><strong>✅ nur 96 kcal pro Tasse (15g)</strong></p><p><strong>✅ Sehr ergiebig - 11× mehr Antioxidantien als industrieller Kakao</strong></p>',
  },
  'cacao-awake-duo': {
    heroBackground: file('2x-Awake.webp'),
    heroProductImage: file('2x_Awake_765a9f2f-20f0-4332-a3f3-d8fa01c63c77.png'),
    heroTitleImage: shopifyFile('awake-kakao-text.png'),
    heroSavingsImage: KAKAO_HERO_SAVINGS_IMAGE,
    heroTitle: '2x Crystal Cacao® Awake',
    heroSavings: 'Spare 76 €',
    galleryImages: [
      file('2x_Awake_765a9f2f-20f0-4332-a3f3-d8fa01c63c77.png'),
      shopifyFile('7.png?v=1765893911'),
      shopifyFile('Kakao2.png?v=1766919082'),
      shopifyFile('9.png?v=1766918956'),
      shopifyFile('Crystal_Cacao_Awake.png?v=1766919672'),
      shopifyFile('3_1f81ca34-c281-4907-b36c-783b7c6a2cb3.png?v=1766919764'),
    ],
    purchaseTitle: '2x Awake® - 28 Tage Fokus - Bio',
    rating: '5.0 ★★★★★ Über 1.000+ Nutzer',
    benefits:
      '<p><strong>✅ Präsenz, Verbindung & emotionale Tiefe</strong></p><p><strong>✅ keine Zusätze, kein Zucker - volles Aroma</strong></p><p><strong>✅ nur 96 kcal pro Tasse (15g)</strong></p><p><strong>✅ Sehr ergiebig - 11× mehr Antioxidantien als industrieller Kakao</strong></p>',
  },
  'cacao-create-duo': {
    heroBackground: file('2x-Create-BF.webp'),
    heroProductImage: file('2x_Create_2.png'),
    heroTitleImage: shopifyFile('create-kakao-text.png'),
    heroSavingsImage: KAKAO_HERO_SAVINGS_IMAGE,
    heroTitle: '2x Crystal Cacao® Create',
    heroSavings: 'Spare 76 €',
    galleryImages: [
      file('2x_Create_2.png'),
      shopifyFile('Doypack_Mockup__v3-min.png?v=1765893937'),
      shopifyFile('Doypack_Mockup__v3_back-min.png?v=1766919082'),
      shopifyFile('Kakao2.png?v=1766919082'),
      shopifyFile('Crystal_Cacao_-2-min.png?v=1766919764'),
      shopifyFile('3_1f81ca34-c281-4907-b36c-783b7c6a2cb3.png?v=1766919764'),
    ],
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

function toGrossPrice(value, deal) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  const vat = deal.theme === 'cacao' ? 1.07 : 1.19;
  return Math.round(numberValue * vat);
}

function formatWholeEuro(value) {
  const numberValue = Number(value);
  return wholeEuroFormatter.format(Number.isFinite(numberValue) ? Math.round(numberValue) : 0);
}

function formatDealPrice(value, deal) {
  return wholeEuroFormatter.format(toGrossPrice(value, deal));
}

function getProductVariantGid(id) {
  const value = String(id);
  return value.startsWith('gid://')
    ? value
    : `gid://shopify/ProductVariant/${value}`;
}

function getTemplateCopy(deal) {
  const template =
    deal.theme === 'cacao'
      ? CACAO_TEMPLATE_COPY[deal.key] || CACAO_TEMPLATE_COPY['cacao-create-awake']
      : FREQUENCY_TEMPLATE_COPY[deal.key] || FREQUENCY_TEMPLATE_COPY['qione-2-pro-duo'];

  return {
    ...template,
    heroBackground: NEUTRAL_HERO_BACKGROUND,
    heroMobileBackground: NEUTRAL_HERO_MOBILE_BACKGROUND,
  };
}

/*
 * `sektionen` (Default {} = jede Deal-Seite rendert unveraendert): Slot-Karte
 * für die seiten-spezifische Sektions-Wahl, Muster wie QiOne2Pro
 * (gitterchipAnimation/trustVorSlider) — Markup-Identitaets-Vertrag: fehlt ein
 * Slot, steht dort exakt der Bestand.
 *
 * WARUM ueberhaupt: dieser Baum trägt VIER frequency-Deals gleichzeitig
 * (/pages/qione-2-pro-2x + /products/734husd8hh + sale-qibracelet +
 * sale-qihome-air, s. app/data/ten-years-deals.js) und wird zusaetzlich aus
 * products.$handle.jsx gerendert. Ein Umbau direkt in
 * FrequencyTemplateSections würde alle vier aendern; der Elina-Wunsch vom
 * 2026-07-27 gilt ausdrücklich NUR der 2er-Set-Seite. Die Slots halten den
 * Blast-Radius bei genau einer Route.
 *
 *   studien       — Inhalt der Studien-Sektion (der Rahmen
 *                   j-sale-deal__studies-wrap bleibt stehen und trägt
 *                   Breite/Abstand; Default = <Studien> Kachel-Raster)
 *   wasserzustand — Default = <WaterStateSection> („Der Superzustand des Wassers")
 *   nachDealRail  — zusätzlicher Block direkt hinter der ersten Deal-Rail
 *                   („Wechsle direkt zum nächsten Jubiläumsangebot" + Angebote);
 *                   Default = nichts
 *   beweisStrecke — die Testimonial-/Social-Proof-Strecke zwischen der
 *                   Mikroskop-Sektion und dem Schluss-CTA; Default = der
 *                   Bestand aus <GoogleReviewVideoSection> + <CommunityProofSection>
 *                   + <YoutubeProofSlider>. EIN Slot für beide Richtungen:
 *                   wer ihn besetzt, ersetzt die Strecke (Entfernen) UND setzt
 *                   damit zugleich eigene Sektionen an genau diese Stelle,
 *                   also hinter „Mikroskop" und vor „Lass deinen QiOne® …".
 */
export function TenYearsDealPage({deal, sektionen = {}}) {
  const template = getTemplateCopy(deal);
  const [selectedVariantId, setSelectedVariantId] = useState(deal.variants[0].id);
  const selectedVariant = useMemo(
    () =>
      deal.variants.find((variant) => variant.id === selectedVariantId) ||
      deal.variants[0],
    [deal.variants, selectedVariantId],
  );

  return (
    <main className={`j-sale-deal j-sale-deal--${deal.theme} j-sale-deal--${deal.key}`}>
      <TemplateHero deal={deal} template={template} />

      <UrgencyText>
        - Jubiläums Sale - <br />
        {template.savingText || 'Jetzt sichern und im Pre-Sale sparen!'}
      </UrgencyText>

      <ProductPurchase
        deal={deal}
        template={template}
        selectedVariant={selectedVariant}
        setSelectedVariantId={setSelectedVariantId}
      />

      {deal.theme === 'frequency' ? (
        <FrequencyTemplateSections
          deal={deal}
          template={template}
          selectedVariant={selectedVariant}
          sektionen={sektionen}
        />
      ) : (
        <CacaoTemplateSections
          deal={deal}
          template={template}
          selectedVariant={selectedVariant}
        />
      )}
    </main>
  );
}

function TemplateHero({deal, template}) {
  return (
    <section className="j-sale-deal__template-hero">
      <picture className="j-sale-deal__template-hero-bg-picture">
        {template.heroMobileBackground && (
          <source
            media="(max-width: 900px)"
            srcSet={template.heroMobileBackground}
          />
        )}
        <img
          className="j-sale-deal__template-hero-bg"
          src={template.heroBackground}
          alt=""
        />
      </picture>
      <div className="j-sale-deal__template-hero-inner">
        <div className="j-sale-deal__template-hero-top">
          <h1>
            <span>10 Jahre</span>
            <strong>Jubiläums Sale</strong>
          </h1>
          <Countdown placement="hero" />
        </div>
        <div className="j-sale-deal__template-hero-side j-sale-deal__template-hero-side--deal">
          {template.heroTitleImage ? (
            <img
              className="j-sale-deal__template-hero-title-image"
              src={template.heroTitleImage}
              alt={template.heroTitle || deal.displayTitle}
            />
          ) : template.heroTitleLines ? (
            <span className="j-sale-deal__template-hero-title-lines">
              {template.heroTitleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          ) : (
            <span>{template.heroTitle || deal.displayTitle}</span>
          )}
        </div>
        <div className="j-sale-deal__template-hero-side j-sale-deal__template-hero-side--saving">
          {template.heroSavingsImage ? (
            <img
              className="j-sale-deal__template-hero-saving-image"
              src={template.heroSavingsImage}
              alt={template.heroSavings}
            />
          ) : (
            <span>{template.heroSavings}</span>
          )}
          <small>(*Angebot limitiert)</small>
        </div>
        {template.heroProductImage && !template.hideHeroProductImage && (
          <img
            className="j-sale-deal__template-hero-product"
            src={template.heroProductImage}
            alt={deal.displayTitle}
          />
        )}
      </div>
    </section>
  );
}

function ProductPurchase({
  deal,
  template,
  selectedVariant,
  setSelectedVariantId,
}) {
  const {open} = useAside();
  const compareAtPrice = selectedVariant.compareAtPrice;
  const productImage =
    template.purchaseImage || template.heroProductImage || deal.productImage;
  const cartLines = useMemo(() => {
    if (!selectedVariant) return [];

    const merchandiseId = getProductVariantGid(
      selectedVariant.cartVariantId || selectedVariant.id,
    );
    const cartProductHandle =
      selectedVariant.cartProductHandle || deal.cartProductHandle || deal.handle;
    const cartProductTitle =
      selectedVariant.cartProductTitle || deal.cartProductTitle || deal.displayTitle;
    // Referenzierender Set-Kauf (EL-20260724-9b18d2ba): cartQuantity legt N
    // Stück des EINEN kanonischen Produkts in den Warenkorb — der Set-Preis
    // entsteht dort per Automatic Discount. Default 1 hält alle übrigen
    // Deals byte-identisch.
    const cartQuantity =
      selectedVariant.cartQuantity || deal.cartQuantity || 1;

    return [
      {
        merchandiseId,
        quantity: cartQuantity,
        selectedVariant: {
          id: merchandiseId,
          title: selectedVariant.title,
          availableForSale: true,
          image: {
            url: productImage,
            altText: deal.displayTitle,
            width: 1000,
            height: 1000,
          },
          price: {
            // Optimistischer Cart-Flash: bei Set-Menge den Set-Bruttopreis
            // pro Stück anteilig zeigen (echte Zeile+Discount kommen aus
            // Shopify, sobald die Cart-Query antwortet).
            amount: String(toGrossPrice(selectedVariant.price, deal) / cartQuantity),
            currencyCode: 'EUR',
          },
          product: {
            handle: cartProductHandle,
            title: cartProductTitle,
          },
          selectedOptions:
            selectedVariant.title && selectedVariant.title !== 'Default Title'
              ? [{name: 'Variante', value: selectedVariant.title}]
              : [],
        },
      },
    ];
  }, [deal, productImage, selectedVariant]);
  const galleryImages = useMemo(
    () => normalizeGalleryImages(template.galleryImages, productImage, deal.displayTitle),
    [deal.displayTitle, productImage, template.galleryImages],
  );
  const galleryName = `deal-gallery-${deal.key}`;

  return (
    <section className="j-sale-deal__product-template" id="deal">
      <div className="j-sale-deal__product-gallery">
        <div className="j-sale-deal__product-thumbs" aria-label="Produktbilder">
          {galleryImages.map((image, index) => (
            <label
              className="j-sale-deal__product-thumb"
              key={image.src}
            >
              <input
                defaultChecked={index === 0}
                name={galleryName}
                type="radio"
                aria-label={`${image.alt} anzeigen`}
              />
              <span>
                <img src={image.src} alt="" loading="lazy" />
              </span>
            </label>
          ))}
        </div>
        <div className="j-sale-deal__product-main-image">
          {galleryImages.map((image, index) => (
            <img
              className="j-sale-deal__product-main-option"
              src={image.src}
              alt={image.alt}
              key={image.src}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
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
            {formatDealPrice(selectedVariant.price, deal)}
          </span>
          {compareAtPrice && (
            <span className="j-sale-deal__price-compare">
              {formatWholeEuro(compareAtPrice)}
            </span>
          )}
          <span className="j-sale-deal__price-label">Jubiläums Sale</span>
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
          clearDiscountCodes={!deal.discountCode}
          disabled={!selectedVariant}
          discountCode={deal.discountCode}
          lines={cartLines}
          onClick={() => open('cart')}
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

function normalizeGalleryImages(images, fallbackImage, fallbackAlt) {
  const sourceImages = images?.length ? images : [fallbackImage];
  const seen = new Set();

  return sourceImages
    .map((image, index) =>
      typeof image === 'string'
        ? {src: image, alt: `${fallbackAlt} Bild ${index + 1}`}
        : {src: image.src, alt: image.alt || `${fallbackAlt} Bild ${index + 1}`},
    )
    .filter((image) => {
      if (!image.src || seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    });
}

function Countdown({placement = 'default'}) {
  const [remaining, setRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const update = () => {
      setRemaining({
        days: '00',
        ...getTenYearsCountdownRemaining(),
      });
    };

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const totalHours = String(
    Number(remaining.days) * 24 + Number(remaining.hours),
  ).padStart(2, '0');

  return (
    <div
      className={
        placement === 'hero'
          ? 'j-sale-deal__countdown j-sale-deal__countdown--hero'
          : 'j-sale-deal__countdown'
      }
      aria-label="Pre-Sale Countdown"
    >
      <div>
        <time>
          <strong suppressHydrationWarning>{totalHours}</strong>
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

function FrequencyTemplateSections({deal, template, selectedVariant, sektionen = {}}) {
  return (
    <>
      <UrgencyText>- Angebot limitiert auf die ersten 300 Bestellungen! -</UrgencyText>
      <MainFeatures />
      <DealRail currentKey={deal.key} />
      {sektionen.nachDealRail ?? null}
      <FrequencyVideoScience />
      <GitterchipSection />
      <FounderSection />
      {sektionen.wasserzustand ?? <WaterStateSection />}
      <section className="j-sale-deal__studies-wrap">
        {sektionen.studien ?? (
          <Studien headline="Wirkung an menschlichen Zellen bestätigt!" />
        )}
      </section>
      <MicroscopeSection />
      {sektionen.beweisStrecke ?? (
        <>
          <GoogleReviewVideoSection />
          <CommunityProofSection />
          <YoutubeProofSlider />
        </>
      )}
      <DealFinalCta
        deal={deal}
        template={template}
        selectedVariant={selectedVariant}
      />
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
            Lösungen!
          </p>
        </article>
        <article>
          <h3>Für jeden Einsatzort</h3>
          <p>
            Du kannst den QiOne® 2 Pro mit in die Sauna oder ins Schwimmbad
            nehmen, denn er ist beständig gegen Hitze & Chlor. Wenn du ihn mal
            in der Sonne vergisst oder er in die Waschmaschine fällt - kein
            Problem. Du darfst ihn beim Sport tragen - Schweiß macht ihm nichts
            mehr aus.
          </p>
        </article>
        <article>
          <h3>Im idealen Preis-Leistungs-Verhältnis</h3>
          <p>
            Der QiOne® 2 Pro stellt gegenüber seinem Vorgänger mit seinem 8x
            Leistungsvolumen und nur dem 2x Anschaffungswert das ideale
            Investment dar.
          </p>
          <p>
            Leistung schlägt Preis. Mehr Power für deine Zukunft.
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

function GoogleReviewVideoSection() {
  return (
    <section className="j-sale-deal__google-reviews">
      <h2>Mehr als 14.000 zufriedene Kunden</h2>
      <ReputonWidget />
      <div className="j-sale-deal__google-video">
        <h3>Deutscher Leichtathlet-Meister erleichtert</h3>
        <ResponsiveIframe
          src="https://www.youtube-nocookie.com/embed/jyLyXZqHxaw?rel=0&controls=0&showinfo=0&vq=720"
          title="Deutscher Leichtathlet-Meister erleichtert"
        />
      </div>
    </section>
  );
}

function CommunityProofSection() {
  return (
    <section className="j-sale-deal__community-proof">
      <div className="j-sale-deal__community-video">
        <ResponsiveIframe
          src="https://www.youtube-nocookie.com/embed/o1LlHKc8eZY"
          title="Kundenfeedback Video"
        />
      </div>
      <div className="j-sale-deal__comment-slider">
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
      </div>
    </section>
  );
}

function YoutubeProofSlider() {
  const videos = [
    'https://www.youtube-nocookie.com/embed/OAVUdRYGoDA',
    'https://www.youtube-nocookie.com/embed/zIfDQ1N60fI',
    'https://www.youtube-nocookie.com/embed/bgsAHLaQRLU',
    'https://www.youtube-nocookie.com/embed/jyLyXZqHxaw',
    'https://www.youtube-nocookie.com/embed/pI9fdZYhVUA',
    'https://www.youtube-nocookie.com/embed/aG36zJKxDzg',
  ];

  const trackRef = useRef(null);
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});

  return (
    <section className="j-sale-deal__youtube-proof">
      <div
        className={`j-sale-deal__youtube-slider${isDragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        {...handlers}
      >
        {videos.map((video) => (
          <ResponsiveIframe src={video} title="Qi Blanco Erfahrung" key={video} />
        ))}
      </div>
    </section>
  );
}

function DealFinalCta({deal, template, selectedVariant}) {
  const compareAtPrice = selectedVariant?.compareAtPrice;

  return (
    <section className="j-sale-deal__final-cta">
      <div className="j-sale-deal__final-cta-media">
        <img
          src={template.heroProductImage || deal.productImage}
          alt={deal.displayTitle}
          loading="lazy"
        />
        <div className="j-sale-deal__final-cta-stamp" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <path
                id="j-sale-final-cta-arc"
                d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
              />
            </defs>
            <text className="j-sale-deal__final-cta-stamp-text">
              <textPath href="#j-sale-final-cta-arc" startOffset="0">
                JUBILAEUMSSALE - LIMITIERT -
              </textPath>
            </text>
          </svg>
          <div className="j-sale-deal__final-cta-stamp-core">
            <span>10</span>
            <small>Jahre</small>
          </div>
        </div>
      </div>
      <div className="j-sale-deal__final-cta-body">
        <h2>{template.ctaHeader || 'Sichere dir dein Jubiläumsangebot'}</h2>
        <HtmlBlock html="<p><strong>✅ 100% deutsche Produktion</strong></p><p><strong>✅ Hochwertigste Materialien</strong></p><p><strong>✅ Weltweiter Versand</strong></p>" />
        <div className="j-sale-deal__final-cta-price">
          <span>{formatDealPrice(selectedVariant.price, deal)}</span>
          {compareAtPrice && <sup>{formatWholeEuro(compareAtPrice)}</sup>}
        </div>
        <a className="j-sale-deal__button" href="#deal">
          {template.ctaButton || 'Jetzt sichern'}
        </a>
        <ul className="j-sale-deal__final-cta-trust">
          <li>Kostenloser Versand ab 99 Euro</li>
          <li>20 Tage risikofrei testen</li>
          <li>Käuferschutz</li>
        </ul>
      </div>
    </section>
  );
}

function CacaoTemplateSections({deal, template, selectedVariant}) {
  return (
    <>
      <DealRail currentKey={deal.key} />
      <CacaoStory />
      <DealFinalCta
        deal={deal}
        template={template}
        selectedVariant={selectedVariant}
      />
      <CacaoProductUpsell />
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
      <CenteredImage src={file('2024-06-qiblanco-bali-06550.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Wach. Verbunden. Ohne den Absturz.</strong></h2><ul><li><strong>1.050 mg Theobromin &amp; 140 mg Koffein</strong> erzeugen zusammen eine stabile, langanhaltende Wachheit. Das hohe natürliche Verhältnis von 7,5:1 wirkt aktivierend, aber ohne typischen Koffein-Crash.</li><li><strong>10 mg Phenylethylamin</strong> (PEA) ist bekannt als Teil des körpereigenen Glücks- &amp; Motivationssystems.</li><li><strong>61 µg Anandamid</strong> wird mit mentaler Klarheit und ruhiger Präsenz in Verbindung gebracht.</li><li><strong>20 mg freies L-Tryptophan</strong> unterstützt als Serotonin-Vorstufe emotionale Balance.</li><li><strong>5.620 mg Polyphenole &amp; Flavanole</strong> tragen zur allgemeinen kognitiven Vitalität bei.</li></ul><p><strong>Create enthält das stärkste aktivierende Profil aller Kristall Kakao® Sorten - für sanfte Wachheit, kognitive Klarheit und stabile innere Ausrichtung.</strong></p>"
        listMarkers
      />
      <FullImage src={file('2024-06-qiblanco-bali-1052459-kaffee.webp')} />
      <FullImage src={file('bohne-create.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Für wen ist Crystal Cacao® Awake ideal?</strong></h2><p>Wenn du ...</p><ul><li>✅ klare Gedanken und geistige Struktur brauchst</li><li>✅ kreative Ideen entwickeln willst - mit innerer Ruhe</li><li>✅ präsent sein willst - ohne Reizüberflutung oder Nervosität</li><li>✅ dich emotional stabil und mental wach fühlen möchtest</li><li>✅ bewusst auf Kaffee oder stimulierende Drinks verzichten willst</li><li>Dann ist Crystal Cacao® Create dein Ritual-Kakao für fokussierte Energie.</li></ul>"
      />
      <FullImage src={file('2024-06-qiblanco-bali-06610.jpg')} />
      <HtmlTextSection
        html="<h2><strong>Anwendung &amp; Tageszeiten</strong></h2><ul><li>🕓 Morgens: für einen ruhigen Start mit klarem Kopf und sanfter Wachheit</li><li>🕑 Nachmittags: für fokussierte Kreativarbeit ohne Koffein-Crash</li><li>🧘 Abends: zur Unterstützung von mentaler Klarheit &amp; emotionalem Ausklang</li><li>🍶 Zubereitung: 15 g in warmer Pflanzenmilch oder Wasser - abgestimmt auf dein Ritual</li></ul>"
      />
      <FullImage src={file('DSC02183.jpg')} />
      <HtmlTextSection
        html="<h2>Natürlich reich an über 20 wichtigen Mineralstoffen &amp; Spurenelementen</h2><p><strong>Crystal Cacao® Create liefert dir eine breite Palette an bioverfügbaren Mikronährstoffen - genau so, wie sie die Natur vorgesehen hat.</strong></p><p>Durch den schonenden Herstellungsprozess bleiben in Create viele essenzielle Mikronährstoffe erhalten, die dein Körper täglich braucht - in bioverfügbarer Form und perfekt abgestimmt durch die Natur.</p><p>🧬 Enthält u. a.:<br/>✅ Magnesium, Kalium, Calcium, Phosphor, Natrium<br/>✅ Eisen, Zink, Kupfer, Mangan, Kobalt, Nickel, Chrom<br/>✅ sowie natürlich vorkommende Spurenelemente wie Silizium, Bor, Vanadium und weitere</p><ul><li><strong>🛡️ Magnesium, Calcium, Eisen und Zink</strong> tragen zur normalen Funktion des Nervensystems, des Immunsystems und des Energiestoffwechsels bei.*</li><li><strong>❤️ Kupfer und Mangan</strong> unterstützen den Schutz der Zellen vor oxidativem Stress.*</li><li><strong>💡 Chrom</strong> trägt zur Aufrechterhaltung eines normalen Blutzuckerspiegels bei.*</li></ul>"
        className="is-mineral-overview"
      />
      <HtmlTextSection
        html="<p>*Diese Aussagen basieren auf den allgemeinen wissenschaftlich anerkannten Funktionen der enthaltenen Mikronährstoffe gemäß EU-Verordnung.</p>"
        compact
        className="is-footnote"
      />
      <HtmlTextSection
        html="<h2>Analyse der enthaltenen Mineralstoffe &amp; Spurenelemente</h2><h3><strong>Essentielle Mineralstoffe</strong></h3><ul><li>1. Magnesium (Mg) - Energiehaushalt, Nerven</li><li>2. Kalium (K) - Herzfunktion, Zellspannung</li><li>3. Calcium (Ca) - Knochen, Signalwege</li><li>4. Phosphor (P) - ATP-Bildung</li><li>5. Natrium (Na) - Elektrolytgleichgewicht</li></ul><h3><strong>Essentielle Spurenelemente</strong></h3><ul><li>6. Eisen (Fe) - Sauerstofftransport</li><li>7. Zink (Zn) - Immunsystem, Enzyme</li><li>8. Kupfer (Cu) - antioxidative Enzyme</li><li>9. Mangan (Mn) - antioxidative Cofaktoren</li><li>10. Chrom (Cr) - Glukosestoffwechsel</li><li>11. Nickel (Ni) - enzymatische Prozesse</li><li>12. Kobalt (Co) - Bestandteil von Vitamin B12</li></ul><h3><strong>Weitere natürliche Spurenelemente</strong></h3><ul><li>13. Silizium (Si) - Bindegewebe, Struktur</li><li>14. Bor (B) - Knochen, kognitive Funktionen</li><li>15. Strontium (Sr) - Mineralstoffwechsel</li><li>16. Rubidium (Rb) - intrazellulärer Marker</li><li>17. Vanadium (V) - Glukosestoffwechsel</li><li>18. Cäsium (Cs) - bioenergetische Spur</li></ul><ol><li><strong>Reine esoterische Bedeutung:</strong></li></ol><ul><li>19. Barium (Ba) - energetische Schutzschicht</li><li>20. Gallium (Ga) - Klärung des Energiefeldes</li><li>21. Lanthan (La) - tiefere Intuition</li><li>22. Tellur (Te) - feinstoffliche Leitfähigkeit</li><li>23. Hafnium (Hf) - energetische Zentrierung</li><li>24. Tantal (Ta) - Stabilisierung spiritueller Frequenzen</li></ul>"
      />
      <FullImage src={file('DSC01491_Kopie.webp')} />
      <HtmlTextSection
        html="<h2>Herkunft: Spüre die Kraft des Amazonas</h2><p>Aus dem geheimnisvollen Amazonas bringen wir dir eine heilige Pflanze in ihrer reinsten Form: unseren bio-zertifizierten <strong>Kristall Kakao® Create</strong>. Diese besonderen Kakaobohnen stammen aus nachhaltigem Anbau in den <strong>Bergwäldern des peruanischen Departamento Amazonas</strong>. Sie werden behutsam bei niedriger Temperatur vermahlen und anschließend in eine elegante, quadratische 420 g-Tafel gegossen - ein purer Block <strong>Bio Kristall Kakao®</strong>.</p><p>Nach der Formung geben wir dem Kakao die Zeit, die er braucht: In Ruhe kristallisiert er langsam und entwickelt dabei sein charakteristisches Kristallmuster - Sinnbild für naturbelassene Qualität, aromatische Tiefe und unsere tiefe Achtung vor dem Ursprung. Während dieser Reifephase setzen wir das <strong>QiHome® Air</strong> ein: Es schafft eine besondere Atmosphäre, die die Kristallisation begleitet und den Kakao auf seinem Weg zu seiner einzigartigen Struktur unterstützt.</p><p>So entsteht unser unverwechselbarer <strong>Kristall Kakao®</strong> - mit feiner Struktur, voller Kraft und lebendigem Geschmack. Versiegelt im Aroma-Schutzpack bleiben das volle Bouquet tropischer Früchte, feiner Kokosnoten und Zitrusnuancen sowie alle wertvollen Bestandteile optimal bewahrt.</p><p><strong>Brich dir ein Stück ab, bereite ein warmes Elixier zu und tauche ein in dein persönliches Ritual - voller Achtsamkeit, Herzöffnung und tiefer Verbundenheit.</strong></p>"
      />
      <FullImage src={file('montegrande.jpg')} margin={70} marginBottom={18} />
      <HtmlTextSection
        html="<ul><li>Copyright: QUIRINO OLIVERA NUÑEZ<br/>ASOCIACION PARA LA INVESTICAGION CIENTIFICA DE LA AMAZONIA DE PERU</li></ul><h2><strong>Crystal Cacao® - Ursprung, der 6.300 Jahre zurückreicht</strong></h2><p>Im Norden Perus, im Tal von Jaén und Bagua, erhebt sich der mystische <strong>Spiraltempel von Montegrande</strong> - ein Ort, an dem Archäologen Kakaorückstände in <strong>6.300 Jahre alten Keramiken entdeckt</strong> haben.</p><p>Diese Funde gelten heute als der <strong>älteste bekannte Nachweis von Kakao weltweit</strong> - der Beginn einer Geschichte, die bis in unsere Zeit fortlebt. Nur wenige Kilometer von diesem historischen Fundort entfernt, in denselben fruchtbaren Böden des oberen Amazonasbeckens, wachsen die Pflanzen, aus deren Früchten <strong>Crystal Cacao®</strong> entsteht.</p><p>Die Region bildet eine <strong>kontinuierliche Abstammungslinie:</strong> vom urzeitlichen Wildkakao über die ersten domestizierten Pflanzen des Montegrande-Kulturraums bis hin zu den heutigen, naturbelassenen Altlinien, die den genetischen Kern von <strong>Kristall Kakao®</strong> tragen.</p><p>Diese Verbindung aus Archäologie, Ökologie und Genetik zeichnet ein klares Bild: <strong>Crystal Cacao® wächst dort, wo die Geschichte des Kakaos begann</strong> - im selben Boden, unter derselben Sonne und in einer ununterbrochenen Linie, die seit über 6.000 Jahren fortbesteht.</p><p>Er trägt die Energie, Reinheit und Resonanz des ältesten bekannten Kakaos der Welt - und macht sie erlebbar für den Menschen von heute.</p><h2 class='j-sale-deal__guarantee-heading'><strong>🛡️ Unsere Garantie:</strong></h2><ul><li><strong>🔒 100% Kakao. 0% Risiko.</strong></li><li><strong>✔️ Wissenschaftlich analysiert</strong></li><li><strong>✔️ Rückgabe innerhalb von 20 Tagen - auch angebrochen</strong></li><li><strong>✔️ Bio-zertifiziert &amp; aromasicher verpackt</strong></li></ul>"
      />
      <FullImage src={file('DSC01953_Kopie.webp')} />
      <HtmlTextSection
        html="<h2><strong>Wusstest du?</strong></h2><p>Unser Kakao wird in einer strukturierten Umgebung mit der QiHome® Air-Technologie verarbeitet - einer innovativen Lösung, die ein harmonisches Feld erzeugt und die Qualität natürlicher Rohstoffe in ihrer feinen Struktur unterstützen kann.</p><p>👉 Erfahre mehr über unsere unterstützenden Tools - wie der QiOne® oder das QiBracelet® - und entdecke, wie du dein eigenes Umfeld energetisch stärken und bewusster gestalten kannst.</p>"
      />
    </>
  );
}

function CacaoProductUpsell() {
  const products = [
    {
      title: 'QiOne® 2 Pro',
      subtitle: 'Kohärentes Wasser für deinen Alltag.',
      image: file('2xQiOne_2_Pro_Product_Only.png'),
      href: '/products/qione-2-pro',
      detailHref: '/pages/qione-2-pro-details',
    },
    {
      title: 'QiBracelet®',
      subtitle: 'Trage dein kohärentes Feld direkt am Körper.',
      image: file('QiBracelet_Pro_Product_Only.png'),
      href: '/products/qibracelet',
      detailHref: '/pages/qibracelet-details',
    },
    {
      title: 'QiHome® Air',
      subtitle: 'Harmonisiere dein Zuhause und dein Umfeld.',
      image: file('QiHome_Product_Only.png'),
      href: '/products/qihome-air',
      detailHref: '/pages/qihome-details',
    },
  ];

  return (
    <section className="j-sale-deal__cacao-upsell">
      <div className="j-sale-deal__cacao-upsell-heading">
        <h2>Werde jetzt Teil der Revolution.</h2>
        <p>Über 300 neue Nutzer im Monat.</p>
      </div>
      <div className="j-sale-deal__cacao-upsell-grid">
        {products.map((product) => (
          <article className="j-sale-deal__cacao-product-card" key={product.title}>
            <a href={product.href}>
              <img src={product.image} alt={product.title} loading="lazy" />
            </a>
            <h3>{product.title}</h3>
            <p>{product.subtitle}</p>
            <a className="j-sale-deal__text-link" href={product.detailHref}>
              Mehr erfahren
            </a>
            <a className="j-sale-deal__text-link" href={product.href}>
              Jetzt Kaufen
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function CacaoFaq() {
  const faqs = [
    {
      title: 'Was ist zeremonieller Kakao?',
      html: '<p>Zeremonieller Kakao ist eine spezielle Form von Kakao, die absichtsvoll und bewusst zubereitet und konsumiert wird. Im Gegensatz zu gewöhnlichem Kakao wird dieser Kakao unter Einbeziehung ritueller Elemente, Achtsamkeit und Intentionalität zubereitet. Zeremonieller Kakao wird oft in ganzheitlichen Praktiken verwendet und kann eine tiefere Verbindung mit dem Selbst, der Natur oder anderen Menschen fördern. Die Zubereitung und der Konsum werden als eine Art Zeremonie betrachtet, die die psychoaktiven und energetischen Eigenschaften des Kakaos betont.</p>',
    },
    {
      title: 'Was bedeutet psychoaktiv in diesem Zusammenhang?',
      html: '<p>Psychoaktiver Kakao enthält natürliche Verbindungen wie Theobromin, Koffein, Phenylethylamin und Anandamid. Diese Substanzen können leichte Veränderungen in der Stimmung, Wachsamkeit und Entspannung auslösen. Der Ausdruck "psychoaktiv" wird hier verwendet, um darauf hinzuweisen, dass der Konsum von Kakao das zentrale Nervensystem beeinflussen kann, wodurch positive Veränderungen in Denken, Fühlen und Wahrnehmen auftreten können. Es ist wichtig zu betonen, dass diese Effekte subtil sind und nicht mit starken Rauschzuständen verglichen werden können.</p>',
    },
    {
      title: 'Wie wird zeremonieller Kakao zubereitet?',
      html: '<p>Die Zubereitung von zeremoniellem Kakao ist unkompliziert und kann nach den ersten Versuchen zu einer natürlichen und sogar freudigen Praxis werden. Eine Kurzanleitung dazu:</p><p>1. Erwärmen von etwa 150 ml Wasser oder pflanzlicher Milch (z.B. Hafermilch).</p><p>2. Zerkleinern der Kakaomasse.</p><p>3. Abmessen von 20 bis 25g für eine Alltagstasse und 30g für eine rituelle Tasse.</p><p>4. Auflösen der Kakaomasse in der warmen Flüssigkeit. Rühren kann dabei helfen!</p><p>5. Je nach Vorliebe den Kakao mit verschiedenen Gewürzen verfeinern.</p><p>6. Zeit nehmen, den Kakao spüren und genießen.</p>',
    },
    {
      title: 'Für wen ist Kakao (un)geeignet?',
      html: '<p>Kakao enthält Theobromin, ein natürliches Stimulans. Personen, die empfindlich auf Koffein reagieren, wird eine äußerst vorsichtige Dosierung von 5 bis 10 g pro Tasse empfohlen. Bei der Frage nach dem Konsum von reinem Kakao während der Schwangerschaft ist es ratsam, Gesundheitsfachleute zu konsultieren, da Ansichten dazu variieren können.</p><p>Kinder erleben oft eine positive Reaktion auf Kakao und genießen seine stimmungsaufhellende Wirkung. Hierbei ist eine behutsame Dosierung wichtig, und es ist ratsam, die Konsumzeit in Bezug auf die Schlafenszeiten der Kleinen zu beachten.</p><p>Für Personen, die Medikamente oder Antidepressiva (SSRIs) einnehmen, die die Wiederaufnahme von Serotonin hemmen, ist vor dem Genuss von zeremoniellem Kakao eine Rücksprache mit ihrem behandelnden Arzt äußerst empfehlenswert, um mögliche Wechselwirkungen zu klären.</p>',
    },
    {
      title: 'Was ist eine Kakaozeremonie und ist diese nötig?',
      html: '<p>Die Kakaozeremonie ist eine bewusste und absichtliche Praxis des Genießens von zeremoniellem Kakao an einem Ort der Wohlfühlatmosphäre. Diese einzigartige Art des Konsums verstärkt die tiefe und unterschwellige Wirkung des Kakaos, was sie für den Einnehmenden leichter erfahrbar macht.</p><p>Obwohl eine Kakaozeremonie keine zwingende Voraussetzung ist, bietet sie Raum für persönliche Entfaltung und Reflektion. Viele Menschen wählen bewusst, sich Zeit für ihren Kakao zu nehmen und ihn auf individuelle Weise zu zelebrieren, oft im Rahmen von Dankbarkeitspraktiken. Die Entscheidung, diese bewusste Form des Kakao-Konsums in den Alltag zu integrieren, liegt im freien Ermessen eines jeden Einzelnen.</p>',
    },
    {
      title: 'Wie oft darf man zeremoniellen Kakao trinken?',
      html: '<p>Die Häufigkeit des Konsums von zeremoniellem Kakao ist individuell und kann von Person zu Person variieren. Es wird empfohlen, auf die eigene körperliche und mentale Reaktion zu achten. Ein maßvoller Konsum, der das persönliche Wohlbefinden unterstützt, ist in der Regel angebracht.</p>',
    },
    {
      title: 'Welche Effekte entstehen durch die Kombination von Qi Blanco®-Produkten und zeremoniellem Kakao?',
      html: '<p>Die Verwendung von Qi Blanco®-Produkten in Verbindung mit psychoaktivem Kakao kann die psychoaktive Erfahrung intensivieren und klarer erlebbar machen. Die speziellen Eigenschaften des Gitterchips 2.0 fördert die Bildung kohärenter Strukturen, die dazu beitragen, die tiefgehende mentale Wirkung des Kakaos zu unterstützen.</p>',
    },
  ];

  return (
    <section className="j-sale-deal__faq">
      <details className="j-sale-deal__faq-shell">
        <summary>
          <h2>Häufig gestellte Fragen (FAQ)</h2>
        </summary>
        <div className="j-sale-deal__faq-list">
          {faqs.map((faq) => (
            <details key={faq.title}>
              <summary>{faq.title}</summary>
              <HtmlBlock html={faq.html} />
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}

function FullImage({src, margin = 100, marginBottom}) {
  return (
    <section
      className="j-sale-deal__fullscreen-image"
      style={{
        '--image-margin': `${margin}px`,
        '--image-margin-bottom': `${marginBottom ?? margin}px`,
      }}
    >
      <img src={src} alt="" loading="lazy" />
    </section>
  );
}

function CenteredImage({src, margin = 50, width = 100}) {
  return (
    <section
      className="j-sale-deal__centered-image"
      style={{
        '--image-margin': `${margin}px`,
        '--image-width': `${width}%`,
      }}
    >
      <img src={src} alt="" loading="lazy" />
    </section>
  );
}

function HtmlTextSection({
  html,
  className = '',
  compact = false,
  listMarkers = false,
  margin = 0,
  paddingTop = 0,
}) {
  return (
    <section
      className={
        [
          'j-sale-deal__html-section',
          className,
          compact ? 'is-compact' : '',
          listMarkers ? 'has-list-markers' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
      style={{
        '--section-margin': `${margin}px`,
        '--block-padding-top': `${paddingTop}px`,
      }}
    >
      <HtmlBlock html={html} />
    </section>
  );
}

function DealRail({currentKey, compact = false}) {
  const trackRef = useRef(null);
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});
  return (
    <section
      className={compact ? 'j-sale-deal__rail is-compact' : 'j-sale-deal__rail'}
      aria-label="Weitere 10 Jahre Jubiläums Sale Angebote"
    >
      <div className="j-sale-deal__section-heading">
        <span>Alle Deals</span>
        <h2>Wechsle direkt zum nächsten Jubiläumsangebot</h2>
      </div>
      <div
        className={`j-sale-deal__slider${isDragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        {...handlers}
      >
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
