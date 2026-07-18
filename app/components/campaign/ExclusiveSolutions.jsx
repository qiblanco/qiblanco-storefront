import * as React from 'react';
import {Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {anzeigeSatz, formatPreis} from '~/lib/markt-pricing';
import {ReputonWidget as LpReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo as LpScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {InfoSlider as LpInfoSlider} from '~/components/index-components/InfoSlider';
import {YoutubeIframe as LpYoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';

/* ════════════════════════════════════════════════════════════
   GELDHELDEN × QI BLANCO — Entwurf aus Figma
   3 neue Sektionen, eingesetzt OBERHALB der bestehenden
   Sections, ohne das alte zu verändern.
   ════════════════════════════════════════════════════════════ */

/* ───────── 1. Geldhelden-Hero (ersetzt Hero) ───────── */
function HeroStackedVisuals() {
  // 360°-Animationen (Imgix/HLS) statt statischer Bilder;
  // das bisherige Bild dient als Poster/Fallback.
  const slides = [
    {
      label: "QiBracelet®",
      tag: "GitterChip™ — am Handgelenk",
      video: "new-360-QiBracelet-1x1.mov",
      img: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/JjGdCuv.webp?v=1747927956",
    },
    {
      label: "QiHome® Air",
      tag: "Schützt dein Zuhause",
      video: "360-QiHome-1x1.mov",
      img: "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/3d-animation-qi-home-preview.webp?v=1740224642",
    },
  ];
  return (
    <div className="ghx-hero__visual">
      {slides.map((s) => (
        <figure key={s.label} className="ghx-hero__tile">
          <ImgixVideo
            videoPath={s.video}
            fallbackImage={s.img}
            className="ghx-hero__tile-video"
          />
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
          </p>
          <p className="ghx-lead">
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

/* ───────── 2. Drei Pakete (ersetzt PricingSection) ─────────
   Shopify-Bundle-Produkte werden hier bewusst UMGANGEN:
   Jede Paket-Komponente wird als eigenes Line Item mit eigener Variante in
   den Warenkorb gelegt. Dadurch hat JEDES QiBracelet und JEDE Kette einen
   eigenen Größen-Dropdown. Der Paketpreis entsteht über einen automatisch
   angewendeten Prozent-Rabattcode (Prozent wirkt auf Netto- wie Bruttopreise
   identisch — die Shopify-Preise sind netto, die 19% MwSt. kommen erst im
   Checkout dazu, der Brutto-Endpreis stimmt trotzdem). */
const KETTE_SIZES = ["40 cm", "45 cm", "50 cm", "60 cm", "75 cm"];
const BRACELET_SIZES = ["S", "M", "L"];
const SIZE_OPTIONS = { kette: KETTE_SIZES, bracelet: BRACELET_SIZES };
const DEFAULT_SIZE = { kette: "50 cm", bracelet: "M" };

const COMPONENT_HANDLES = {
  'QiHome® Air': 'qihome-air',
  'QiOne® 2 Pro': 'qione-2-pro',
  'QiBracelet®': 'qibracelet',
  'Kette für den QiOne®': 'qione-kette',
};

const cleanLabel = (label = '') => label.replace(/^1 × /, '').trim();

const PRODUCT_IMG = {
  "QiHome® Air":        "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329",
  "QiOne® 2 Pro":        "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196",
  "QiBracelet®":         "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638",
  "Kette für den QiOne®": "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Necklace_07_fb5094a4-f6c8-4565-a5a8-5b86208cbb94.webp?v=1698259307",
};
const findProductImg = (label) => PRODUCT_IMG[cleanLabel(label)];
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

function findComponentProduct(productsByHandle, item) {
  const handle = COMPONENT_HANDLES[cleanLabel(item.label)];
  return handle ? productsByHandle[handle] : null;
}

// Größen-Matching gegen die Einzelprodukt-Varianten:
// Kette: UI "50 cm" → Variante "M - 50 cm" (Substring auf normalisiertem Text)
// Bracelet: UI "M" → Variante "M – 19" (Prefix "m-" auf normalisiertem Text)
function variantMatchesSize(variant, kind, size) {
  const haystacks = [
    variant?.title || '',
    ...(variant?.selectedOptions || []).map((option) => option?.value || ''),
  ].map(normalizeVariantText);
  const target = normalizeVariantText(size);
  if (!target) return false;

  if (kind === 'kette') {
    return haystacks.some((value) => value.includes(target));
  }
  return haystacks.some(
    (value) => value === target || value.startsWith(`${target}-`),
  );
}

function findComponentVariant(product, item, size) {
  const variants = product?.variants || [];
  if (!item.kind) {
    // Einzelprodukte ohne Größenwahl (QiHome® Air, QiOne® 2 Pro)
    return variants.find((variant) => variant.availableForSale) || variants[0] || null;
  }
  return (
    variants.find((variant) => variantMatchesSize(variant, item.kind, size)) ||
    null
  );
}

// Jede Komponente mit Größenwahl bekommt einen EIGENEN Selektor —
// keine geteilten Dropdowns mehr, da jedes Exemplar ein eigenes Line Item ist.
function getSelectorIndices(p) {
  return p.items
    .map((item, index) => (item.kind ? index : -1))
    .filter((index) => index >= 0);
}

function getPackageSelections(p, sizes) {
  const counts = getKindCounts(p.items);
  const seen = {};
  return getSelectorIndices(p).map((index) => {
    const item = p.items[index];
    seen[item.kind] = (seen[item.kind] || 0) + 1;
    const ordinal = seen[item.kind];
    const multiple = counts[item.kind] > 1;
    const baseLabel = cleanLabel(item.label);
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

function buildPackageCartState(p, productsByHandle, sizes) {
  const selections = getPackageSelections(p, sizes);
  const sizeByIndex = {};
  selections.forEach((selection) => {
    sizeByIndex[selection.index] = selection.value;
  });

  const lineByVariant = new Map();
  const unavailable = [];

  p.items.forEach((item, index) => {
    const product = findComponentProduct(productsByHandle, item);
    const size = sizeByIndex[index];
    const variant = product ? findComponentVariant(product, item, size) : null;

    if (!variant || !variant.availableForSale) {
      unavailable.push({item, size: size || ''});
      return;
    }

    const existing = lineByVariant.get(variant.id);
    if (existing) {
      // Identische Varianten (z. B. 2 × QiOne® 2 Pro oder zwei Ketten in
      // derselben Länge) werden zu EINER Line mit höherer Menge gebündelt.
      existing.quantity += 1;
      return;
    }

    lineByVariant.set(variant.id, {
      merchandiseId: variant.id,
      quantity: 1,
      attributes: [{key: 'Paket', value: p.title}],
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

  if (unavailable.length > 0) {
    return {lines: [], selections, unavailable};
  }

  return {lines: [...lineByVariant.values()], selections, unavailable: []};
}

function isPackageSizeAvailable(productsByHandle, p, itemIndex, size) {
  const item = p.items[itemIndex];
  const product = findComponentProduct(productsByHandle, item);
  const variant = product ? findComponentVariant(product, item, size) : null;
  return Boolean(variant && variant.availableForSale);
}

function computeInitialSizes(p, productsByHandle) {
  const sizes = {};
  getSelectorIndices(p).forEach((index) => {
    const item = p.items[index];
    const preferred = item.defaultSize || DEFAULT_SIZE[item.kind];
    if (isPackageSizeAvailable(productsByHandle, p, index, preferred)) {
      sizes[index] = preferred;
      return;
    }
    // Fallback: Ist die Default-Größe ausverkauft, die erste verfügbare
    // Größe vorwählen, statt "nicht verfügbar" als Startzustand zu zeigen.
    const fallback = SIZE_OPTIONS[item.kind].find((size) =>
      isPackageSizeAvailable(productsByHandle, p, index, size),
    );
    sizes[index] = fallback || preferred;
  });
  return sizes;
}


/* ───────── M2: Paket-Preise DYNAMISCH aus der Storefront-API ─────────
   (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft) Die Karten zeigen
   exakt den Warenkorb: der Prozent-Rabatt (Rabattcode) wird wie von Shopify
   PRO EINHEIT centgenau abgeschnitten (Cart-Probe 2026-07-18: 78,99 x 8 %
   = 6,3192 -> 6,31), die Brutto-Anzeige rundet danach PRO LINE
   (cart-display-pricing-Kanon). Line-Struktur == buildPackageCartState
   (identische Varianten buendeln) — nur ohne Verfuegbarkeits-Filter,
   denn der Gesamtwert gilt unabhaengig vom Lagerstand. */
function paketPreisLines(p, productsByHandle, sizes) {
  const selections = getPackageSelections(p, sizes);
  const sizeByIndex = {};
  selections.forEach((selection) => {
    sizeByIndex[selection.index] = selection.value;
  });
  const byVariant = new Map();
  for (let index = 0; index < p.items.length; index += 1) {
    const item = p.items[index];
    const product = findComponentProduct(productsByHandle, item);
    const variant = product
      ? findComponentVariant(product, item, sizeByIndex[index])
      : null;
    const einzelNetto = Number.parseFloat(variant?.price?.amount);
    if (!variant || !Number.isFinite(einzelNetto)) return null; // fail-closed
    const line = byVariant.get(variant.id);
    if (line) {
      line.quantity += 1;
    } else {
      byVariant.set(variant.id, {
        quantity: 1,
        einzelNetto,
        waehrung: variant.price?.currencyCode || 'EUR',
        handle: product.handle,
      });
    }
  }
  return [...byVariant.values()];
}

function paketAnzeige(p, productsByHandle, sizes) {
  const lines = paketPreisLines(p, productsByHandle, sizes);
  if (!lines || lines.length === 0) return null;
  const waehrung = lines[0].waehrung;
  let compare = 0;
  let preis = 0;
  for (const line of lines) {
    const satz = anzeigeSatz(line.handle, line.waehrung);
    const rabattProEinheit =
      Math.floor(line.einzelNetto * p.rabatt * 100) / 100;
    compare += Math.round(line.einzelNetto * line.quantity * (1 + satz));
    preis += Math.round(
      (line.einzelNetto - rabattProEinheit) * line.quantity * (1 + satz),
    );
  }
  return {
    compare: formatPreis(compare, waehrung),
    price: formatPreis(preis, waehrung),
    save: `Du sparst ${formatPreis(compare - preis, waehrung)}`,
    fine: `oder ab ${formatPreis(Math.round(preis / 12), waehrung)}/Mon. · Klarna & Paypal · 100% Versicherter Versand`,
  };
}

// FAIL-CLOSED: ohne API-Preise den letzten bekannten guten Stand zeigen
// (Literale unten in den Paket-Definitionen) — nie 0/leer/falsch.
function paketFallback(p) {
  if (typeof console !== 'undefined') {
    console.warn(
      `[preis-fallback] Paket ${p.title}: API-Preise fehlen — letzter bekannter Stand wird gezeigt.`,
    );
  }
  return p.fallback;
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
  const configIndices = React.useMemo(() => getSelectorIndices(p), [p]);
  const kindCounts = React.useMemo(() => getKindCounts(p.items), [p.items]);
  const ordinalOf = (index) =>
    configIndices.filter(
      (j) => j <= index && p.items[j].kind === p.items[index].kind,
    ).length;
  const sizeLabel = (index) => {
    const kind = p.items[index].kind;
    const base = kind === 'kette' ? 'Kettenlänge' : 'Bracelet-Größe';
    if (kindCounts[kind] > 1) return `${base} ${ordinalOf(index)}`;
    return base;
  };
  const cartState = React.useMemo(
    () => buildPackageCartState(p, productsByHandle, sizes),
    [p, productsByHandle, sizes],
  );
  const isDisabled = cartState.lines.length === 0 || cartState.unavailable.length > 0;

  // M2: Anzeige-Preise dynamisch aus den API-Preisen der aktuellen Auswahl;
  // fail-closed auf den letzten bekannten guten Stand (p.fallback).
  const anzeige = React.useMemo(
    () => paketAnzeige(p, productsByHandle, sizes),
    [p, productsByHandle, sizes],
  );
  const labels = anzeige || paketFallback(p);

  const onClick = () => {
    onChoose(p, cartState.selections, cartState, labels);
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
                aria-label={sizeLabel(i)}
              >
                {SIZE_OPTIONS[it.kind].map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={!isPackageSizeAvailable(productsByHandle, p, i, s)}
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
        <span className="ghx-pak__compare-value">{labels.compare}</span>
      </div>
      <div className="ghx-pak__price">{labels.price}</div>
      <span className="ghx-pill ghx-pill--gold-soft ghx-pak__save">{labels.save}</span>
      <div className="ghx-pak__cta-form">
        <CartForm
          route="/cart"
          inputs={{lines: cartState.lines, discountCode: p.discountCode}}
          action={CartForm.ACTIONS.LinesAdd}
        >
          {(fetcher) => (
            <>
              <input
                name="analytics"
                type="hidden"
                value={JSON.stringify({
                  package: p.title,
                  discountCode: p.discountCode,
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
      <p className="ghx-pak__fineprint">{labels.fine}</p>
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
      discountCode: 'PAKET-FUNDAMENT',
      lead: "Der Einstieg in die volle Lösung — Schutz für dich und dein Zuhause. Hausstation und Anhänger bieten ein perfektes Preis-Leistungsverhältnis.",
      items: [
        { label: "1 × QiHome® Air" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × QiOne® 2 Pro" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "60 cm" },
        { label: "1 × Kette für den QiOne®", kind: "kette", defaultSize: "50 cm" },
      ],
      rabatt: 0.08,
      fallback: {
        compare: "7.345 €",
        price: "6.757 €",
        save: "Du sparst 588 €",
        fine: "oder ab 563 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      },
      cta: "Dieses Paket wählen",
      featured: false,
    },
    {
      pill: "★ BELIEBTESTE WAHL",
      pillCls: "ghx-pill--gold",
      title: "Unabhängig",
      discountCode: 'PAKET-UNABHAENGIG',
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
      rabatt: 0.12,
      fallback: {
        compare: "10.501 €",
        price: "9.241 €",
        save: "Du sparst 1.260 €",
        fine: "oder ab 770 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      },
      cta: "Dieses Paket wählen",
      featured: true,
    },
    {
      pill: "★ Gelebter Exklusiver Luxus",
      pillCls: "ghx-pill--gold",
      title: "Erholungs-Residenz",
      discountCode: 'PAKET-RESIDENZ',
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
      rabatt: 0.15,
      fallback: {
        compare: "20.467 €",
        price: "17.397 €",
        save: "Du sparst 3.070 €",
        fine: "oder ab 1.450 €/Mon. · Klarna & Paypal · 100% Versicherter Versand",
      },
      cta: "Dieses Paket wählen",
      featured: false,
    },
  ];

  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const onChoose = (p, selections, cartState, labels) => {
    clearTimeout(toastTimer.current);
    setToast({
      title: p.title,
      count: cartState.lines.reduce((sum, line) => sum + line.quantity, 0),
      itemLabel: 'Produkte',
      selections,
      price: labels.price,
      save: labels.save,
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
                  : `${toast.title}-Paket · ${toast.price} · Rabatt wird im Warenkorb angewendet`}
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
          4 Peer-Review-Studien (Dartsch Scientific, Deutschland) · Mechanismus „kohärentes Wasser" nach Prof. Dr. Gerald H. Pollack (USA) &amp; Dr. rer. nat. Ulrich Warnke (DE)
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
      {/* Produkt-Demo direkt nach dem Gitterchip-Wirk-Erklaerblock
          (erklaeren -> zeigen, GL-DES-0009 SHOW IT). IN der Section
          (LP-Muster Job 20260716-scroll-animationen): erbt die
          Cormorant-H2-Typo, erzeugt keine neue Sektionsgrenze.
          BEWUSST ohne dataSection: diese Seite traegt sonst ihren ERSTEN
          data-section-Anker und der Design-Rubrik-Collector saehe nur noch
          1 Sektion statt der section-Elemente (Watch-Regression). */}
      <GitterchipMoleculesScrub />
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
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </a>
        <span className="ghx-closing__fineprint">100% Versicherter Versand · Klarna & PayPal · Käuferschutz</span>
      </div>
    </section>
  );
}


/* Design-Feinschliff (Overrides zur exclusive-solutions.css):
   1) Hero-KPIs (10x, 84,7%, 14.000+) im Gold-Akzent des CTA-Buttons
   2) Studien-Footnote: mehr Luft zu Pfeilen (davor) und Button (danach)
   3) Cream-Sektion ("Warum Qi Blanco") vollflaechig ohne weissen Rand;
      Inhalt bleibt auf 1280px zentriert (wie im Hero) */
const GHX_STYLE_OVERRIDES = `
.ghx-hero__kpi-value { color: rgb(201,163,78); }
.lp-vp-stat-item__value { color: rgb(201,163,78); }
/* Weisser Streifen zwischen Header und Hero: main-Padding-Bereich
   in Hero-Beige einfaerben (nur auf dieser LP via :has). */
main:has(.lp-exclusive-solutions) { background: rgb(253,251,247); }
/* HRV-Karten (5 Jahre aelter / 9 Jahre juenger): Inhalt komplett zentrieren */
.lp-vp-hrv-row { justify-content: center; justify-items: center; }
.lp-vp-hrv-card {
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}
.lp-vp-hrv-card > * { text-align: center !important; }
.ghx-hero__tile { background: #000; }
.ghx-hero__tile-video,
.ghx-hero__tile-video video {
  width: 100%;
  height: 100%;
  display: block;
}
/* Produkt nicht bis an den Kachelrand: Video komplett zeigen (contain)
   und leicht verkleinern — schwarzer Kachel-Hintergrund fuellt den Rest. */
.ghx-hero__tile-video video {
  object-fit: contain;
  transform: scale(0.82);
}
.ghx-studien__footnote { margin: 30px 0 22px; }
.lp-exclusive-solutions { background: #fff; }
.lp-exclusive-solutions .lp-vp-section {
  max-width: none;
  padding-left: max(24px, calc(50% - 616px));
  padding-right: max(24px, calc(50% - 616px));
}
`;

export function ExclusiveSolutions({products = []}) {
  return (
    <div className="lp-vp lp-exclusive-solutions">
      <style dangerouslySetInnerHTML={{__html: GHX_STYLE_OVERRIDES}} />
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
