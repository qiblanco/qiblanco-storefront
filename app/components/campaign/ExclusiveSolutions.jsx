import * as React from 'react';
import {Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {ReputonWidget as LpReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo as LpScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {InfoSlider as LpInfoSlider} from '~/components/index-components/InfoSlider';
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
const BUNDLE_HANDLE_BY_PACKAGE = {
  Fundament: 'bundle-fundament',
  Unabhängig: 'bundle-unabhangig',
  'Erholungs-Residenz': 'bundle-erholungs-residenz',
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

function getKindCounts(items) {
  return items.reduce((counts, item) => {
    if (item.kind) counts[item.kind] = (counts[item.kind] || 0) + 1;
    return counts;
  }, {});
}

function countKindOptions(product, kind) {
  const options = product?.variants?.[0]?.selectedOptions || [];
  return options.filter((option) => {
    if (!option || option.name === 'Title') return false;
    const isLength = /cm/i.test(option.value || '');
    return kind === 'kette' ? isLength : !isLength;
  }).length;
}

// Pro Typ eigene Selektoren nur, wenn das Bundle genug Optionen dafür hat
// (z. B. „Kette 1"/„Kette 2" als getrennte Shopify-Optionen). Hat das Bundle
// nur EINE Größen-Option pro Typ (heutiger Stand), gibt es EINEN gemeinsamen
// Selektor — die Größe gilt dann für alle Exemplare des Typs. Rüstet sich
// automatisch auf, sobald das Shopify-Bundle umgebaut ist.
function getSelectorIndices(p, product) {
  const counts = getKindCounts(p.items);
  const perInstance = {};
  Object.keys(counts).forEach((kind) => {
    perInstance[kind] =
      counts[kind] <= 1 || countKindOptions(product, kind) >= counts[kind];
  });
  const seen = new Set();
  return p.items
    .map((item, index) => {
      if (!item.kind) return -1;
      if (perInstance[item.kind]) return index;
      if (seen.has(item.kind)) return -1;
      seen.add(item.kind);
      return index;
    })
    .filter((index) => index >= 0);
}

function getPackageSelections(p, product, sizes) {
  const indices = getSelectorIndices(p, product);
  const selectorKindCounts = indices.reduce((counts, index) => {
    const kind = p.items[index].kind;
    counts[kind] = (counts[kind] || 0) + 1;
    return counts;
  }, {});
  const seen = {};
  return indices.map((index) => {
    const item = p.items[index];
    seen[item.kind] = (seen[item.kind] || 0) + 1;
    const ordinal = seen[item.kind];
    const baseLabel = item.label.replace(/^1 × /, '');
    const multiple = selectorKindCounts[item.kind] > 1;
    return {
      index,
      kind: item.kind,
      ordinal,
      multiple,
      label: multiple ? `${baseLabel} ${ordinal}` : baseLabel,
      value: sizes[index] || item.defaultSize || DEFAULT_SIZE[item.kind],
    };
  });
}

function optionMatchesSelection(option, selection) {
  const rawValue = option?.value || '';
  // Typ-Wächter: Ketten-Größen nur gegen Längen-Optionen („… cm") matchen,
  // Bracelet-Größen nur gegen Nicht-Längen-Optionen — sonst matcht z. B.
  // Bracelet „L" fälschlich die Ketten-Option „L - 60 cm".
  const isLength = /cm/i.test(rawValue);
  if (selection.kind === 'kette' && !isLength) return false;
  if (selection.kind === 'bracelet' && isLength) return false;

  const target = normalizeVariantText(selection.value);
  const value = normalizeVariantText(rawValue);

  if (selection.kind === 'bracelet') {
    return value.startsWith(target) || value.includes(`${target}-`);
  }

  return value.includes(target);
}

function variantMatchesSelections(variant, selections) {
  // Jede Options-Position darf nur EINE Auswahl bedienen — sonst würde bei
  // zwei getrennten Ketten-Optionen (z. B. „60 cm" / „50 cm") die Auswahl
  // „50 + 50" fälschlich über die einzelne 50er-Option doppelt matchen.
  const options = variant.selectedOptions || [];
  const used = new Set();
  return selections.every((selection) => {
    for (let k = 0; k < options.length; k++) {
      if (used.has(k)) continue;
      if (optionMatchesSelection(options[k], selection)) {
        used.add(k);
        return true;
      }
    }
    return false;
  });
}

function findBundleVariant(product, selections) {
  const variants = product?.variants || [];
  return (
    variants.find(
      (variant) =>
        variant.availableForSale &&
        variantMatchesSelections(variant, selections),
    ) || null
  );
}

function buildPackageCartState(p, productsByHandle, sizes) {
  const product = productsByHandle[p.bundleHandle];
  const selections = getPackageSelections(p, product, sizes);
  const variant = findBundleVariant(product, selections);

  if (!product || !variant) {
    return {
      lines: [],
      selections,
      unavailable: [{item: {label: p.title}, size: ''}],
    };
  }

  return {
    lines: [
      {
        merchandiseId: variant.id,
        quantity: 1,
        attributes: [
          {key: 'Paket', value: p.title},
          ...selections.map((selection) => ({
            // Eindeutige Keys pro Exemplar — gleiche Keys würden sich in
            // Shopify-Cart-Attributes gegenseitig überschreiben.
            key:
              (selection.kind === 'kette' ? 'Kettenlänge' : 'Bracelet-Größe') +
              (selection.multiple ? ` ${selection.ordinal}` : ''),
            value: selection.value,
          })),
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
      },
    ],
    selections,
    unavailable: [],
  };
}

function isPackageSizeAvailable(productsByHandle, p, itemIndex, size, sizes) {
  const product = productsByHandle[p.bundleHandle];
  const nextSizes = {...sizes, [itemIndex]: size};
  const selections = getPackageSelections(p, product, nextSizes);
  const variant = findBundleVariant(product, selections);
  return Boolean(variant);
}

function computeInitialSizes(p, productsByHandle) {
  const indices = getSelectorIndices(p, productsByHandle[p.bundleHandle]);
  const defaults = {};
  indices.forEach((i) => {
    defaults[i] = p.items[i].defaultSize || DEFAULT_SIZE[p.items[i].kind];
  });
  if (buildPackageCartState(p, productsByHandle, defaults).lines.length) {
    return defaults;
  }

  // Fallback: Unterstützt das Shopify-Bundle (noch) keine unterschiedlichen
  // Größen pro Exemplar, alle Exemplare eines Typs auf die erste Default-Größe
  // angleichen, statt "nicht verfügbar" als Startzustand zu zeigen.
  const firstByKind = {};
  const aligned = {};
  indices.forEach((i) => {
    const kind = p.items[i].kind;
    if (firstByKind[kind] == null) firstByKind[kind] = defaults[i];
    aligned[i] = firstByKind[kind];
  });
  if (buildPackageCartState(p, productsByHandle, aligned).lines.length) {
    return aligned;
  }
  return defaults;
}

function Pak({ p, productsByHandle, onChoose }) {
  const {open} = useAside();
  const [sizes, setSizes] = React.useState(() =>
    computeInitialSizes(p, productsByHandle),
  );
  const setSize = (i, v) => setSizes((s) => ({ ...s, [i]: v }));
  const getSize = (i) => {
    if (sizes[i] != null) return sizes[i];
    const it = p.items[i];
    return it.defaultSize || DEFAULT_SIZE[it.kind];
  };
  const configIndices = React.useMemo(
    () => getSelectorIndices(p, productsByHandle[p.bundleHandle]),
    [p, productsByHandle],
  );
  const kindCounts = React.useMemo(() => getKindCounts(p.items), [p.items]);
  const selectorCountOf = (kind) =>
    configIndices.filter((j) => p.items[j].kind === kind).length;
  const ordinalOf = (index) =>
    configIndices.filter(
      (j) => j <= index && p.items[j].kind === p.items[index].kind,
    ).length;
  const sizeLabel = (index) => {
    const kind = p.items[index].kind;
    const base = kind === 'kette' ? 'Kettenlänge' : 'Bracelet-Größe';
    if (selectorCountOf(kind) > 1) return `${base} ${ordinalOf(index)}`;
    if (kindCounts[kind] > 1) return `${base} (beide)`;
    return base;
  };
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
    onChoose(p, cartState.selections || selections, cartState);
    if (!isDisabled) open('cart');
  };

  return (
    <article className={`ghx-pak${p.featured ? ' ghx-pak--featured' : ''}`}>
      <span className={`ghx-pill ${p.pillCls} ghx-pak__pill`}>{p.pill}</span>
      <h3 className="ghx-h3">{p.title}</h3>
      <p className="ghx-pak__lead">{p.lead}</p>
      <ul className="ghx-pak__items">
        {p.items.map((it, i) => (
          it.kind && configIndices.includes(i) ? (
            <li key={i} className="ghx-pak__item ghx-pak__item--config">
              <ItemLabel label={it.label} />
              <select
                className="ghx-pak__size"
                value={getSize(i)}
                onChange={(e) => setSize(i, e.target.value)}
                aria-label={sizeLabel(i)}
              >
                {SIZE_OPTIONS[it.kind].map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={!isPackageSizeAvailable(productsByHandle, p, i, s, sizes)}
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
                {isDisabled ? 'Paket aktuell nicht verfügbar' : p.cta}
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
      bundleHandle: BUNDLE_HANDLE_BY_PACKAGE.Fundament,
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
      bundleHandle: 'bundle-unabhangig',
      featured: true,
    },
    {
      pill: "★ Gelebter Exklusiver Luxus",
      pillCls: "ghx-pill--gold",
      title: "Erholungs-Residenz",
      bundleHandle: BUNDLE_HANDLE_BY_PACKAGE['Erholungs-Residenz'],
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
      itemLabel: 'Paket',
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
              <strong>{toast.count} {toast.itemLabel} im Warenkorb</strong>
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

/* ───────── Studien-Slider (Elina-Layout: Titel oben links, Quelle unten links) ───────── */
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

function StudienSlider() {
  const trackRef = React.useRef(null);
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ghx-studie');
    const step = card ? card.offsetWidth + 24 : 340;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  };
  return (
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
  );
}

/* ───────── Wissenschaft / Studies — Studien im Slider ───────── */
function ScienceSection() {
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt – messbar bestätigt.</h2>
      <LpScrollMikroskopVideo />
      <StudienSlider />
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
