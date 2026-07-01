import * as React from 'react';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {ReputonWidget as LpReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo as LpScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {InfoSlider as LpInfoSlider} from '~/components/index-components/InfoSlider';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {YoutubeIframe as LpYoutubeIframe} from '~/components/reusables/YoutubeIframe';

/* ════════════════════════════════════════════════════════════
   GELDHELDEN × QI BLANCO — Entwurf aus Figma
   3 neue Sektionen, eingesetzt OBERHALB der bestehenden
   Sections, ohne das alte zu verändern.
   ════════════════════════════════════════════════════════════ */

/* ───────── 1. Geldhelden-Hero (ersetzt Hero) ───────── */
function HeroStackedVisuals() {
  const slides = [
    {
      label: "QiBracelet®",
      tag: "GitterChip™ — am Handgelenk",
      img: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/JjGdCuv.webp?v=1747927956",
    },
    {
      label: "QiHome® Air",
      tag: "Schützt dein Zuhause",
      img: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/3d-animation-qi-home-preview.webp?v=1740224642",
    },
  ];
  return (
    <div className="ghx-hero__visual">
      {slides.map((s) => (
        <figure key={s.label} className="ghx-hero__tile">
          <img src={s.img} alt={s.label} loading="lazy" />
        </figure>
      ))}
    </div>
  );
}

function GeldheldenHero() {
  const kpis = [
    { value: "10×",      label: "Barrierefunktion der Zellen" },
    { value: "84,7%",    label: "geschützte Immunzellen" },
    { value: "14.000+",  label: "zufriedene Nutzer" },
  ];
  const trust = [
    "Wirkung in Zellstudien gemessen",
    "20 Tage risikofrei",
    "0% Finanzierung",
  ];
  return (
    <section className="ghx-section ghx-section--bg-1" aria-labelledby="ghx-hero-title">
      <div className="ghx-inner ghx-hero">
        <div className="ghx-hero__copy">
          <span className="ghx-pill ghx-pill--gold-soft">★ GELDHELDEN-EXKLUSIV</span>
          <h1 className="ghx-h1" id="ghx-hero-title">
            Schütz dein Umfeld.<br />
            Schärf deinen Fokus.<br />
            Sichere deine Leistung.
          </h1>
          <p className="ghx-lead">
            Drei Pakete für alle, die nicht einsteigen, sondern ankommen wollen.
            Die gesamte proprietäre Gitterchip<sup>®</sup>-Technologie als komplettes Set
            für dich und deine Familie.
          </p>
          <div className="ghx-hero__trust-row">
            {trust.map((t) => <span key={t} className="ghx-hero__trust">{t}</span>)}
          </div>
          <div className="ghx-hero__trifecta">
            {kpis.map((k) => (
              <div key={k.value}>
                <div className="ghx-hero__kpi-value">{k.value}</div>
                <div className="ghx-hero__kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroStackedVisuals />
      </div>
    </section>
  );
}

/* ───────── 2. Drei Pakete (ersetzt PricingSection) ───────── */
const KETTE_SIZES = ["40 cm", "45 cm", "50 cm", "60 cm", "75 cm"];
const BRACELET_SIZES = ["S", "M", "L"];
const SIZE_OPTIONS = { kette: KETTE_SIZES, bracelet: BRACELET_SIZES };
const DEFAULT_SIZE = { kette: "50 cm", bracelet: "M" };
const PACKAGE_HANDLE_BY_KIND = {
  qihome: 'qihome-air',
  qione: 'qione-2-pro',
  bracelet: 'qibracelet',
  kette: 'qione-kette',
};

const PRODUCT_IMG = {
  "QiHome® Air":        "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329",
  "QiOne® 2 Pro":        "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196",
  "QiBracelet®":         "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638",
  "Kette für den QiOne®": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Necklace_07_fb5094a4-f6c8-4565-a5a8-5b86208cbb94.webp?v=1698259307",
};
const findProductImg = (label) => {
  const clean = label.replace(/^1 × /, '').trim();
  return PRODUCT_IMG[clean];
};
function ItemLabel({ label }) {
  const img = findProductImg(label);
  if (!img) {
    return (
      <span className="ghx-pak__item-label">
        <span className="ghx-pak__item-text">{label}</span>
      </span>
    );
  }

  return (
    <button type="button" className="ghx-pak__item-label ghx-pak__item-label--button">
      <span className="ghx-pak__item-text">{label}</span>
      <span className="ghx-pak__item-preview" aria-hidden="true">
        <img src={img} alt="" loading="lazy" />
      </span>
    </button>
  );
}

function normalizeVariantText(value = '') {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[–—]/g, '-');
}

function getProductsByHandle(products = []) {
  return products.reduce((lookup, product) => {
    if (product?.handle) lookup[product.handle] = product;
    return lookup;
  }, {});
}

function getPackageHandle(item) {
  if (item.handle) return item.handle;
  if (item.kind) return PACKAGE_HANDLE_BY_KIND[item.kind];

  const label = normalizeVariantText(item.label);
  if (label.includes('qihome')) return PACKAGE_HANDLE_BY_KIND.qihome;
  if (label.includes('qibracelet')) return PACKAGE_HANDLE_BY_KIND.bracelet;
  if (label.includes('kette')) return PACKAGE_HANDLE_BY_KIND.kette;
  if (label.includes('qione')) return PACKAGE_HANDLE_BY_KIND.qione;

  return null;
}

function getLineImage(product, variant) {
  const image = variant?.image || product?.featuredImage;
  if (!image?.url) return undefined;

  return {
    url: image.url,
    altText: image.altText || product?.title || variant?.title || '',
    width: image.width || 1000,
    height: image.height || 1000,
  };
}

function findPackageVariant(product, item, size) {
  const variants = product?.variants || [];
  if (!variants.length) return null;

  if (!item.kind) {
    return variants.find((variant) => variant.availableForSale) || variants[0];
  }

  const target = normalizeVariantText(size);
  return (
    variants.find((variant) => {
      const haystack = normalizeVariantText(
        [
          variant.title,
          ...(variant.selectedOptions || []).map((option) => option.value),
        ].join(' '),
      );

      if (item.kind === 'bracelet') {
        return haystack.startsWith(target) || haystack.includes(`${target}-`);
      }

      return haystack.includes(target);
    }) || null
  );
}

function buildPackageCartState(p, productsByHandle, sizes) {
  const linesByKey = new Map();
  const unavailable = [];

  p.items.forEach((item, index) => {
    const handle = getPackageHandle(item);
    const product = productsByHandle[handle];
    const size = item.kind ? sizes[index] || item.defaultSize || DEFAULT_SIZE[item.kind] : null;
    const variant = findPackageVariant(product, item, size);

    if (!product || !variant || !variant.availableForSale) {
      unavailable.push({item, size});
      return;
    }

    const key = [variant.id, p.title, item.kind ? size : ''].join('|');
    const existing = linesByKey.get(key);

    if (existing) {
      existing.quantity += 1;
      return;
    }

    linesByKey.set(key, {
      merchandiseId: variant.id,
      quantity: 1,
      attributes: [
        {key: 'Paket', value: p.title},
        ...(item.kind ? [{key: 'Auswahl', value: size}] : []),
      ],
      selectedVariant: {
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        image: getLineImage(product, variant),
        price: variant.price,
        product: {
          handle: product.handle,
          title: product.title,
        },
        selectedOptions: [
          ...(variant.selectedOptions || []),
          {name: 'Paket', value: p.title},
        ],
      },
    });
  });

  return {
    lines: [...linesByKey.values()],
    unavailable,
  };
}

function isPackageSizeAvailable(productsByHandle, item, size) {
  const handle = getPackageHandle(item);
  const variant = findPackageVariant(productsByHandle[handle], item, size);
  return Boolean(variant?.availableForSale);
}

function Pak({ p, productsByHandle, onChoose }) {
  const {open} = useAside();
  const [sizes, setSizes] = React.useState({});
  const setSize = (i, v) => setSizes((s) => ({ ...s, [i]: v }));
  const getSize = (i) => {
    if (sizes[i] != null) return sizes[i];
    const it = p.items[i];
    return it.defaultSize || DEFAULT_SIZE[it.kind];
  };
  const configIndices = p.items.map((it, i) => (it.kind ? i : -1)).filter((i) => i >= 0);
  const cartState = React.useMemo(
    () => buildPackageCartState(p, productsByHandle, sizes),
    [p, productsByHandle, sizes],
  );
  const isDisabled = cartState.lines.length === 0 || cartState.unavailable.length > 0;

  const onClick = () => {
    const selections = configIndices.map((i) => ({
      kind: p.items[i].kind,
      label: p.items[i].label.replace(/^1 × /, ''),
      value: getSize(i),
    }));
    onChoose(p, selections, cartState);
    if (!isDisabled) open('cart');
  };

  return (
    <article className={`ghx-pak${p.featured ? ' ghx-pak--featured' : ''}`}>
      <span className={`ghx-pill ${p.pillCls} ghx-pak__pill`}>{p.pill}</span>
      <h3 className="ghx-h3">{p.title}</h3>
      <p className="ghx-pak__lead">{p.lead}</p>
      <ul className="ghx-pak__items">
        {p.items.map((it, i) => (
          it.kind ? (
            <li key={i} className="ghx-pak__item ghx-pak__item--config">
              <ItemLabel label={it.label} />
              <select
                className="ghx-pak__size"
                value={getSize(i)}
                onChange={(e) => setSize(i, e.target.value)}
                aria-label={it.kind === 'kette' ? 'Kettenlänge' : 'Bracelet-Größe'}
              >
                {SIZE_OPTIONS[it.kind].map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={!isPackageSizeAvailable(productsByHandle, it, s)}
                  >
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ) : (
            <li key={i} className="ghx-pak__item">
              <ItemLabel label={it.label} />
            </li>
          )
        ))}
      </ul>
      <div className="ghx-pak__divider" />
      <div className="ghx-pak__compare">
        <span className="ghx-pak__compare-label">Gesamtwert:</span>
        <span className="ghx-pak__compare-value">{p.compare}</span>
      </div>
      <div className="ghx-pak__price">{p.price}</div>
      <span className="ghx-pill ghx-pill--gold-soft ghx-pak__save">{p.save}</span>
      <div className="ghx-pak__cta-form">
        <CartForm
          route="/cart"
          inputs={{lines: cartState.lines}}
          action={CartForm.ACTIONS.LinesAdd}
        >
          {(fetcher) => (
            <>
              <input
                name="analytics"
                type="hidden"
                value={JSON.stringify({
                  package: p.title,
                  products: cartState.lines.map((line) => ({
                    id: line.merchandiseId,
                    quantity: line.quantity,
                    title: line.selectedVariant?.product?.title,
                  })),
                })}
              />
              <button
                type="submit"
                className={`ghx-pak__cta${p.featured ? ' ghx-pak__cta--gold' : ''}`}
                onClick={onClick}
                disabled={isDisabled || fetcher.state !== 'idle'}
              >
                {isDisabled ? 'Paket aktuell nicht verfÃ¼gbar' : p.cta}
              </button>
            </>
          )}
        </CartForm>
      </div>
      <p className="ghx-pak__fineprint">{p.fine}</p>
    </article>
  );
}

function GeldheldenPakete({products}) {
  const productsByHandle = React.useMemo(() => getProductsByHandle(products), [products]);
  const pakete = [
    {
      pill: "★ Stabiles Fundament",
      pillCls: "ghx-pill--gold",
      title: "Fundament",
      lead: "Der Einstieg in die volle Lösung — Schutz für dich und dein Zuhause. Hausstation und Anhänger bieten ein perfektes Preis-Leistungsverhältnis.",
      items: [
        { label: "1 × QiHome® Air" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "60 cm" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "50 cm" },
      ],
      compare: "7.345 €",
      price: "6.757 €",
      save: "Du sparst 588 €",
      cta: "Dieses Paket wählen",
      fine: "oder ab 563 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      featured: false,
    },
    {
      pill: "★ BELIEBTESTE WAHL",
      pillCls: "ghx-pill--gold",
      title: "Unabhängig",
      lead: "Die vollständige Lösung — Hausstation, Anhänger und Armreif erzeugen ein neues, bereinigtes Lebensgefühl. Preis-Leistungs-Sieger.",
      items: [
        { label: "1 × QiHome® Air" },
        { label: "1 × QiBracelet®", kind: "bracelet", defaultSize: "M" },
        { label: "1 × QiBracelet®", kind: "bracelet", defaultSize: "S" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "60 cm" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "50 cm" },
      ],
      compare: "10.501 €",
      price: "9.241 €",
      save: "Du sparst 1.260 €",
      cta: "Dieses Paket wählen",
      fine: "oder ab 770 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      featured: true,
    },
    {
      pill: "★ Gelebter Exklusiver Luxus",
      pillCls: "ghx-pill--gold",
      title: "Erholungs-Residenz",
      lead: "Maximaler Schutz — 3 leistungsstarke QiHome® Air erzeugen ein gigantisches kohärentes Feld für dein Zuhause und Büro. Begleitet mit dem portablen QiOne® 2 Pro und dem edlen QiBracelet® entsteht ein absolutes Luxusgefühl.",
      items: [
        { label: "1 × QiHome® Air" },
        { label: "1 × QiHome® Air" },
        { label: "1 × QiHome® Air" },
        { label: "1 × QiBracelet®", kind: "bracelet", defaultSize: "M" },
        { label: "1 × QiBracelet®", kind: "bracelet", defaultSize: "S" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "60 cm" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "50 cm" },
      ],
      compare: "20.467 €",
      price: "17.397 €",
      save: "Du sparst 3.070 €",
      cta: "Dieses Paket wählen",
      fine: "oder ab 1.450 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      featured: false,
    },
  ];

  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const onChoose = (p, selections, cartState) => {
    clearTimeout(toastTimer.current);
    setToast({
      title: p.title,
      count: cartState.lines.reduce((sum, line) => sum + line.quantity, 0),
      selections,
      price: p.price,
      save: p.save,
      unavailable: cartState.unavailable.length > 0,
    });
    toastTimer.current = setTimeout(() => setToast(null), 5500);
  };
  React.useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <section className="ghx-section ghx-section--bg-2" id="pakete" aria-labelledby="ghx-pakete-title">
      <div className="ghx-inner">
        <div className="ghx-pakete__head">
          <span className="ghx-pill ghx-pill--white">DIE DREI PAKETE</span>
          <h2 className="ghx-h2" id="ghx-pakete-title">Für diejenigen, die die volle Lösung wollen.</h2>
          <p className="ghx-sub">Diese Pakete gehen weiter — ein Bündel, das spürbar mehr spart und alles auf einmal liefert.</p>
        </div>
        <div className="ghx-pakete__grid">
          {pakete.map((p) => (
            <Pak
              key={p.title}
              p={p}
              productsByHandle={productsByHandle}
              onChoose={onChoose}
            />
          ))}
        </div>
        <p className="ghx-pakete__footnote">
          Alle Preise inkl. MwSt. Einmalig, kein Abo, kein Verschleiß. 20 Tage risikofrei. 100% Versicherter Versand
        </p>
      </div>
      {toast && (
        <div className="ghx-toast" role="status" aria-live="polite">
          <div className="ghx-toast__head">
            <span className="ghx-toast__check">✓</span>
            <div>
              <strong>{toast.count} Produkte im Warenkorb</strong>
              <span className="ghx-toast__sub">
                {toast.unavailable
                  ? 'Eine Auswahl ist aktuell nicht verfügbar.'
                  : `${toast.title}-Paket · ${toast.price} · Paket wurde dem Warenkorb hinzugefügt`}
              </span>
            </div>
            <button className="ghx-toast__x" onClick={() => setToast(null)} aria-label="Schließen">×</button>
          </div>
          {toast.selections.length > 0 && (
            <ul className="ghx-toast__sel">
              {toast.selections.map((s, i) => (
                <li key={i}><span>{s.label}</span><strong>{s.value}</strong></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/* ───────── 3. Authority / Wissenschaft (ersetzt ScienceSection) ───────── */
function GeldheldenAuthority() {
  const stats = [
    { value: "12×",   label: "Barrierefunktion der Zellen", cite: "TEER 1.837 vs. 152 Ω·cm² · Dartsch 2021" },
    { value: "84,7%", label: "geschützte Immunzellen",      cite: "vs. 60,5% unter Mobilfunk · Dartsch 2021" },
    { value: "50%",   label: "weniger oxidativer Stress",   cite: "5 Zelltypen · Dartsch 2024" },
  ];
  return (
    <section className="ghx-section ghx-section--bg-3" aria-labelledby="ghx-authority-title">
      <div className="ghx-inner ghx-authority">
        <span className="ghx-pill ghx-pill--white">DIE WISSENSCHAFT</span>
        <h2 className="ghx-h2" id="ghx-authority-title">10 Jahre Forschung. In Zellstudien gemessen.</h2>
        <div className="ghx-authority__stats">
          {stats.map((s) => (
            <div key={s.label} className="ghx-authority__stat">
              <div className="ghx-authority__value">{s.value}</div>
              <div className="ghx-authority__label">{s.label}</div>
              <div className="ghx-authority__cite">{s.cite}</div>
            </div>
          ))}
        </div>
        <p className="ghx-authority__footnote">
          4 Peer-Review-Studien (Dartsch Scientific, Deutschland) · Mechanismus „kohärentes Wasser“ nach Prof. Dr. Gerald H. Pollack (USA) &amp; Dr. rer. nat. Ulrich Warnke (DE)
        </p>
      </div>
    </section>
  );
}

/* ───────── HRV-Cards ───────── */
function HRVSection() {
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Messbare Ergebnisse</span>
      <h2>Biologisches Alter unter E-Smog.</h2>
      <p className="lp-vp-section__lede">
        Kurzzeit-HRV-Messung zeigt: Die Gitterchip<sup>®</sup>-Technologie kann das biologische
        Alter unter WLAN-Belastung nicht nur ausgleichen, sondern sogar verbessern.
      </p>
      <div className="lp-vp-hrv-row lp-vp-hrv-row--two">
        <div className="lp-vp-hrv-card lp-vp-hrv-card--alarm">
          <span className="lp-vp-hrv-card__label">Unter E-Smog</span>
          <span className="lp-vp-hrv-card__value">5 Jahre älter</span>
          <span className="lp-vp-hrv-card__sub">biol. HRV-Alter (Kurzzeit-HRV)</span>
        </div>
        <div className="lp-vp-hrv-card lp-vp-hrv-card--win">
          <span className="lp-vp-hrv-card__label">Mit Gitterchip®-Technologie</span>
          <span className="lp-vp-hrv-card__value">9 Jahre jünger</span>
          <span className="lp-vp-hrv-card__sub">biol. HRV-Alter (Kurzzeit-HRV)</span>
        </div>
      </div>
    </section>
  );
}

/* ───────── Stat 4.8/5 (atomar) ───────── */
function Stat485({ value, label }) {
  return (
    <div className="lp-vp-stat-item">
      <span className="lp-vp-stat-item__value">{value}</span>
      <span className="lp-vp-stat-item__label">{label}</span>
    </div>
  );
}

/* ───────── Social Proof / Reviews ───────── */
function SocialProofSection() {
  const stats = [
    { value: "4.8/5",   label: "Durchschnittliche Bewertung" },
    { value: "14.000+", label: "Aktive Nutzer weltweit" },
    { value: "427",     label: "Verifizierte Bewertungen" },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Bewertungen</span>
      <h2>Erfahrungen, die für sich sprechen.</h2>
      <div className="lp-vp-stats-row">
        {stats.map((s) => <Stat485 key={s.value} {...s} />)}
      </div>
    </section>
  );
}

/* ───────── Benefits ───────── */
function BenefitsSection() {
  const items = [
    { icon: "🌙", title: "Erholsamerer\nSchlaf" },
    { icon: "🛡️", title: "Schutz vor\nE-Smog & 5G" },
    { icon: "🧠", title: "Mehr Klarheit\n& Fokus" },
    { icon: "⚡", title: "Spürbar mehr\nEnergie" },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Vorteile</span>
      <h2>Vier spürbare Veränderungen.</h2>
      <div className="lp-vp-benefits-grid lp-vp-benefits-grid--row lp-vp-benefits-grid--2x2">
        {items.map((b) => (
          <article className="lp-vp-benefit lp-vp-benefit--compact" key={b.title}>
            <span className="lp-vp-benefit__icon" aria-hidden="true">{b.icon}</span>
            <h3 className="lp-vp-benefit__title" style={{whiteSpace: 'pre-line'}}>{b.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

/* InfoSlider als eigene Section (extrahiert aus Benefits) */
function InfoSliderSection() {
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <LpInfoSlider />
    </section>
  );
}

/* ───────── Wissenschaft / Studies — Original PeerReviewStudies ───────── */
function ScienceSection() {
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt – messbar bestätigt.</h2>
      <LpScrollMikroskopVideo />
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── Video Testimonials ───────── */
function VideoSection() {
  const videos = [
    { tag: "🏅 Profi-Athlet",         title: "Deutscher Leichtathlet-Meister", quote: "Höhere Regeneration und mehr Leistung mit dem QiOne®.", id: "jyLyXZqHxaw" },
    { tag: "🕉️ Spirituelle Mentoren",  title: "Nada & Kurt – Mentoren",          quote: "Mehr Fokus, weniger Brain Fog – im Alltag spürbar.",              id: "aG36zJKxDzg" },
    { tag: "🧘 Meditation Coach",     title: "Holistic Coach",                  quote: "Tiefere Meditation und mehr Energie – direkt am ersten Tag.",            id: "zIfDQ1N60fI" },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Geschichten.</h2>
      <p className="lp-vp-section__lede">
        Sieh dir an, wie die Gitterchip<sup>®</sup>-Technologie den Alltag unserer Nutzer verändert hat.
      </p>
      <div className="lp-vp-videos-grid">
        {videos.map((v) => (
          <article className="lp-vp-video" key={v.id}>
            <div className="lp-vp-video__thumb lp-vp-video__thumb--iframe">
              <LpYoutubeIframe link={`https://www.youtube.com/embed/${v.id}?si=2ZVH9xtaSaEMmfTQ&controls=0`} />
            </div>
            <span className="lp-vp-video__tag">{v.tag}</span>
            <h3 className="lp-vp-video__title">{v.title}</h3>
            <p className="lp-vp-video__quote">{v.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Urgency Banner ───────── */
function UrgencyBanner() {
  return (
    <div className="lp-vp-urgency" role="region" aria-label="Community-Hinweis">
      Werde Teil der Qi Blanco<sup>®</sup> Community
    </div>
  );
}

/* ───────── Trust / About ───────── */
function TrustSection() {
  const items = [
    { icon: <span style={{display:'inline-flex'}}><svg width="48" height="32" viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="1" y="0" fill="#000"/><rect width="5" height="1" y="1" fill="#DD0000"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg></span>, title: "Deutsche Produktion",
      body: "100% entwickelt und hergestellt in Deutschland mit hochwertigsten Materialien." },
    { icon: "🔬", title: "Peer-Reviewed Studien",
      body: "Wirkung an menschlichen Zellen bestätigt und in Fachzeitschriften veröffentlicht." },
    { icon: "🛡️", title: "20 Tage risikofrei",
      body: "Nicht überzeugt? Volle Rückerstattung ohne Wenn und Aber. Inkl. Käuferschutz." },
    { icon: "👥", title: "14.000+ zufriedene Nutzer",
      body: "Eine wachsende Community von über 300 neuen Nutzern jeden Monat." },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--cream">
      <span className="eyebrow">Warum Qi Blanco</span>
      <h2>10 Jahre Forschung. 100% Made in Germany.</h2>
      <div className="lp-vp-trust-grid">
        {items.map((t) => (
          <article className="lp-vp-trust-item" key={t.title}>
            <span className="lp-vp-trust-item__icon" aria-hidden="true">{t.icon}</span>
            <h3 className="lp-vp-trust-item__title">{t.title}</h3>
            <p className="lp-vp-trust-item__body">{t.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Closing CTA → scrollt zurück zu den 3 Paketen ───────── */
function ClosingCTA() {
  const onClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('pakete');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section className="ghx-section ghx-section--bg-2 ghx-closing">
      <div className="ghx-inner ghx-closing__inner">
        <span className="ghx-pill ghx-pill--white">JETZT ENTSCHEIDEN</span>
        <h2 className="ghx-h2">Sicher dir jetzt dein Paket.</h2>
        <p className="ghx-sub">
          10 Jahre Forschung, deutsche Produktion, peer-reviewed Studien — alles in einem Bündel.
          Einmalig, kein Abo, 20 Tage risikofrei.
        </p>
        <a href="#pakete" className="ghx-closing__cta" onClick={onClick}>
          Paket wählen
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
        <span className="ghx-closing__fineprint">100% Versicherter Versand · Klarna & PayPal · Käuferschutz</span>
      </div>
    </section>
  );
}


export function ExclusiveSolutions({products = []}) {
  return (
    <div className="lp-vp lp-exclusive-solutions">
      <GeldheldenHero />
      <GeldheldenPakete products={products} />
      <GeldheldenAuthority />
      <InfoSliderSection />
      <HRVSection />
      <BenefitsSection />
      <SocialProofSection />
      <LpReputonWidget />
      <ScienceSection />
      <VideoSection />
      <UrgencyBanner />
      <TrustSection />
      <ClosingCTA />
    </div>
  );
}
