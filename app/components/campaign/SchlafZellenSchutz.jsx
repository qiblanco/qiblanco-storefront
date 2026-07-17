import {createContext, useContext, useState} from 'react';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {THEMEN} from '~/lib/redesign3themen';

/*
 * Landingpage /pages/schlaf-zellen-schutz — ALLROUNDER „Wirkt auf drei Ebenen".
 *
 * LP A der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 A):
 * breiter/generischer Erst-Kontakt, Perspektiven-Einstieg fuer die spaetere
 * Rotation. Dramaturgie: Hero (Drei-Ebenen-Versprechen) -> DreiThemenBand
 * (Struktur-Anker, aus dem Bestand) -> je Ebene ein Mechanismus-Block
 * (Zelle / Feld / Schlaf) mit Evidenz-Kachel + Anker-Link auf die Themen-LP ->
 * gemeinsamer Wissenschafts-Block -> Social Proof quer -> Garantie -> Pricing ->
 * QB-Signatur -> Final CTA.
 *
 * DESIGN: eigenes Token-System (styles/schlaf-zellen-schutz.css, Scope .lp-a3),
 * abgeleitet aus dem 93/100-Rezept der Tiefschlaf-v3 (Design-Meister-Pfad:
 * web-brief -> Token-Bau -> design-rubrik >= 80). EIN Gold-Akzent (#c9a14b),
 * warmes Neutral-Kontinuum, ruhige Akte, kein Scroll-Jacking.
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel —
 * die R1/R2/R3-Kette haengt pfad-agnostisch im root-Layout (D-006, keine
 * Doppelzaehlung).
 *
 * CLAIM-DISZIPLIN: Zellstudien-Zahlen sind in-vitro gelabelt; Erfahrungs-
 * berichte deskriptiv (kein Kausal-Claim); Geld-zurueck an Zeitraum +
 * Ueberzeugung gebunden, NIE ans Spueren (Spuer-Regel #7). Beweis-Zahlen und
 * Mechanismus-Texte stammen aus dem Bestand (THEMEN in redesign3themen.js +
 * Tiefschlaf-ScienceSection) — hier wird NICHTS Neues erfunden.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;
const themaById = (id) => THEMEN.find((t) => t.id === id);

const VAT = 1.19;
const brutto = (a) => parseFloat(a || 0) * VAT;
const fmtBrutto = (a) => {
  if (!a) return null;
  const n = Math.round(brutto(a));
  return n.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
const fmtRaw = (a) => {
  if (!a) return null;
  const n = Math.round(parseFloat(a));
  return n.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
const getCompareAt = (p) => {
  const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
  return v?.compareAtPrice?.amount;
};

const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/* ───────── Hero (Drei-Ebenen-Versprechen) ───────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const heroImg = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const priceNum = priceAmount ? brutto(priceAmount) : 1087;
  const priceLabel = fmtBrutto(priceAmount) || '1.087,00 €';
  const compareLabel = fmtRaw(getCompareAt(product));
  const monthly = Math.ceil(priceNum / 12);
  const dreizeiler = [
    'Tiefer schlafen.',
    'Geschützt vor E-Smog.',
    'Auf Zellebene stabil.',
  ];
  const trust = [
    '14.000+ Träger',
    'Zellstudien, peer-reviewed',
    'Made in Germany',
    '20 Nächte risikofrei',
  ];
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-a-hero-title"
      data-section="lp-a-hero"
    >
      <div className="lp-a-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">
            Ein Begleiter für den ganzen Körper
          </span>
          <h1 id="lp-a-hero-title" className="lp-a-hero__title">
            Wirkt auf drei Ebenen.
          </h1>
          <ul className="lp-a-hero__dreizeiler" aria-hidden="false">
            {dreizeiler.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
          <p className="lp-a-hero__subline">
            Dein Körper besteht zu über 70&nbsp;% aus Wasser. Der QiOne<sup>®</sup>&nbsp;2
            Pro bringt es in kohärente Ordnung — genau dort, wo es zählt: er stabilisiert
            deine Zellen, puffert eingestrahlten E-Smog ab und hilft dem Nervensystem,
            nachts herunterzufahren. In Zellstudien gemessen, von 14.000+ Trägern getragen.
          </p>
          <div className="lp-a-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/pages/qione-2-pro">
              Jetzt 20 Nächte risikofrei testen
            </a>
            <span className="lp-a-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel} · oder 12 Raten à{' '}
              {monthly}&nbsp;€
            </span>
          </div>
          <ul className="lp-a-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <figure className="lp-a-hero__visual">
          <img
            src={heroImg}
            alt="QiOne® 2 Pro — kohärentes Wasser auf Zellebene"
            loading="eager"
          />
          <figcaption>
            QiOne<sup>®</sup>&nbsp;2 Pro — getragen, Tag und Nacht.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────── Intro / Brücke (ein Wirkprinzip, drei Ebenen) ───────── */
function IntroSection() {
  return (
    <section className="lp-vp-section" data-section="lp-a-intro">
      <span className="eyebrow">Ein Wirkprinzip</span>
      <h2>Kein Wunder. Ein Prinzip mit drei Wirkungen.</h2>
      <p className="lp-vp-section__lede">
        Fast alle biologischen Prozesse laufen an wasserumhüllten Grenzflächen ab. Ist
        dieses Wasser geordnet — kohärent —, arbeiten Zellen, Membranen und Nervensystem
        ruhiger. Aus diesem einen Prinzip folgen drei Ebenen, auf denen der QiOne<sup>®</sup>
        &nbsp;2 Pro ansetzt. Wähle die, die dich gerade am meisten betrifft.
      </p>
    </section>
  );
}

/* ───────── Mechanismus-Blöcke: Zelle / Feld / Schlaf ─────────
   Nordstern: konkret ERKLAEREN, WO und WIE kohärentes Wasser je Ebene wirkt.
   Inhalt (mechanismusText, beweisZahl/Label, bild) aus dem Bestand (THEMEN),
   Anker-Link je Ebene auf die Themen-LP (Konzept 3.3 A). E-Smog-LP existiert
   noch nicht (s04 baut sie VOR dem Router) — Link wird trotzdem gesetzt. */
function MechanismSection() {
  const ebenen = [
    {
      thema: themaById('zellen'),
      ebene: 'Ebene 1 · Zelle',
      link: '/pages/zell-schutz',
    },
    {
      thema: themaById('esmog'),
      ebene: 'Ebene 2 · Feld',
      link: '/pages/E-Smog-Schutz',
    },
    {
      thema: themaById('schlaf'),
      ebene: 'Ebene 3 · Schlaf',
      link: '/pages/tiefer-schlaf',
    },
  ].filter((e) => e.thema);
  return (
    <section
      className="lp-vp-section lp-a-mechs-section"
      data-section="lp-a-mechanismus"
    >
      <span className="eyebrow">Drei Ebenen im Detail</span>
      <h2>Was kohärentes Wasser auf jeder Ebene bewirkt.</h2>
      <p className="lp-vp-section__lede">
        Wir verkaufen dir keine Traum-Stimmung, sondern eine nachvollziehbare Wirkkette —
        pro Ebene mit einem messbaren Beweis aus dem Labor. Willst du tiefer einsteigen,
        führt jede Ebene zu ihrer eigenen Seite.
      </p>
      <div className="lp-a-mechs">
        {ebenen.map(({thema, ebene, link}) => (
          <article className="lp-a-mech" key={thema.id}>
            <figure className="lp-a-mech__media">
              <img src={thema.bild} alt={thema.alt} loading="lazy" />
            </figure>
            <div className="lp-a-mech__body">
              <span className="lp-a-mech__ebene">{ebene}</span>
              <h3 className="lp-a-mech__title">{thema.titel}</h3>
              <p className="lp-a-mech__text">{thema.mechanismusText}</p>
              <div className="lp-a-mech__evidenz">
                <span className="lp-a-mech__evidenz-zahl">{thema.beweisZahl}</span>
                <span className="lp-a-mech__evidenz-label">{thema.beweisLabel}</span>
              </div>
              <a className="lp-a-mech__link" href={link}>
                Tiefer eintauchen: {thema.titel} →
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="lp-a-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Wissenschaft (gemeinsam, in-vitro gelabelt) ───────── */
function ScienceSection() {
  const stats = [
    {
      value: '84,7 %',
      label: 'Immunzell-Aktivität',
      desc: 'Radikalbildung der Immunzellen bleibt unter Handystrahlung nahezu erhalten (ohne Schutz: 60,5 %).',
      cite: 'Japan Journal of Medicine, 2021 · in vitro',
    },
    {
      value: '10×',
      label: 'Zell-Barrierefunktion',
      desc: 'Bessere Barriere-Integrität gestresster Zellen (TEER-Messung) unter E-Smog-Belastung.',
      cite: 'Applied Cell Biology, 2021 · in vitro',
    },
    {
      value: '5 / 5',
      label: 'Zelltypen geschützt',
      desc: 'Weniger oxidativer Stress in fünf verschiedenen Zelltypen — von Leber bis Lunge.',
      cite: 'Applied Cell Biology, 2024 · in vitro',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-a-wissenschaft">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt — an Zellen gemessen.</h2>
      <p className="lp-vp-section__lede">
        Vier peer-review-publizierte Zellstudien (Dartsch Scientific, unabhängiges Labor)
        belegen die Wirkung der Qi-Blanco-Technologie experimentell. Alle Studien in vitro —
        messbare, reproduzierbare Effekte auf lebende Zellen. Ergänzt durch über 14.000
        Menschen, die den QiOne<sup>®</sup> täglich tragen.
      </p>
      <div className="lp-vp-peer-stats">
        {stats.map((s) => (
          <div className="lp-vp-peer-stat" key={s.label}>
            <div className="lp-vp-peer-stat__value">{s.value}</div>
            <div className="lp-vp-peer-stat__label">{s.label}</div>
            <div className="lp-vp-peer-stat__desc">{s.desc}</div>
            <div className="lp-vp-peer-stat__cite">{s.cite}</div>
          </div>
        ))}
      </div>
      {/* Mikroskop-Beweis als Scroll-Scrub-Video (ersetzt die typografische
          Karte, gleiche Botschaften — Job 20260716-bauer-scroll-down-
          animationen-capability; SHOW IT statt Behauptung) */}
      <ScrollScrubVideo
        dataSection="lp-a-mikroskop-video"
        srcDesktop="https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov"
        srcMobile="https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov"
        overlayStart={{
          titel: 'Zellbiologisch geprüft',
          text: 'Entdecke die Effekte auf Zellebene.',
        }}
        overlayEnd={[
          {
            titel: 'Ohne GitterChip™',
            text: 'Zellen unter Mobilfunk-Stress zeigen eine geschwächte Barriere und mehr oxidative Belastung.',
          },
          {
            titel: 'Mit GitterChip™',
            text: 'Dieselben Zellen halten ihre Barrierefunktion messbar besser aufrecht (TEER-Messung, in vitro).',
          },
        ]}
        fussnote="Gegenüberstellung aus den in-vitro-Zellstudien — kein Erfahrungsbericht, keine Heilaussage."
      />
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── Social Proof (quer durch alle Themen) ───────── */
function LiteYt({id, title}) {
  const [laueft, setLaueft] = useState(false);
  if (laueft) {
    return (
      <div className="lp-a-yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      className="lp-a-yt"
      onClick={() => setLaueft(true)}
      aria-label={`Video abspielen: ${title}`}
    >
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="lp-a-yt__play" aria-hidden="true">
        <span>▶</span>
      </span>
    </button>
  );
}

/*
 * CONTENT-MATCH (Christian-Regel 2026-07-11, F-003): Tag/Titel/Zitat MÜSSEN
 * das tatsächlich Gesagte im Video treffen (Transkript-belegt). Diese drei
 * Videos + Zitate sind wortgleich aus der bestehenden Tiefschlaf-LP übernommen
 * (dort content-match-geprüft) — keine erfundenen Themen.
 */
function VideoSection() {
  const videos = [
    {
      tag: 'Deutscher Leichtathletik-Meister',
      title: 'Constantin Preis — getrackter Tiefschlaf',
      quote: 'Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.',
      id: 'jyLyXZqHxaw',
    },
    {
      tag: 'Nada & Kurt Tepperwein',
      title: 'Spürbar stabiler im Alltag',
      quote: 'So wie ich es trage und erlebe: Es stabilisiert.',
      id: 'aG36zJKxDzg',
    },
    {
      tag: 'Erste Tage mit dem QiOne®',
      title: 'Michelle Christin Guse — „wie ein kleines Wunder"',
      quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
      id: 'zIfDQ1N60fI',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-a-videos">
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Erfahrungen.</h2>
      <p className="lp-vp-section__lede">
        Drei Träger, drei Geschichten — vom getrackten Tiefschlaf des Leistungssportlers
        bis zur spürbaren Veränderung im Alltag. Berichte einzelner Nutzer, deskriptiv.
      </p>
      <div className="lp-vp-videos-grid">
        {videos.map((v) => (
          <article className="lp-vp-video" key={v.id}>
            <LiteYt id={v.id} title={v.title} />
            <span className="lp-vp-video__tag">{v.tag}</span>
            <h3 className="lp-vp-video__title">{v.title}</h3>
            <p className="lp-vp-video__quote">{v.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Garantie ─────────
   T2 (Konzept „Shopseite nach LP"): per reinem `export` freigegeben, damit die
   Campaign-PDP /pages/qione-2-pro dieselbe Garantie-Sektion reusen kann
   (Scent-Kontinuität LP↔Shopseite). GuaranteeSection ist self-contained (keine
   Props/Context) — NULL Markup-/Verhaltens-Delta für LP A durch den Export. */
export function GuaranteeSection() {
  const items = [
    {
      title: '20 Nächte, dein Alltag',
      body: 'Trage den QiOne® 2 Pro 20 Tage und Nächte in deinem echten Alltag. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
    {
      title: 'In Raten, wenn du willst',
      body: 'Über Klarna oder PayPal in bequemen Monatsraten — 0 % Finanzierung. Du entscheidest, wie du zahlst.',
    },
    {
      title: 'Made in Germany',
      body: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand.',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-a-garantie">
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt es dich — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort bewusst
        wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl, sondern an den
        Zeitraum: 20 Nächte, dann entscheidest du.
      </p>
      <div className="lp-vp-benefits-grid">
        {items.map((b) => (
          <article className="lp-a-benefit" key={b.title}>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
            <p className="lp-vp-benefit__body">{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Pricing (Live-Preise, QiOne 2 Pro als Held) ───────── */
function PricingSection() {
  const {data} = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione = findLp(data, 'qione-2-pro');
  const qihome = findLp(data, 'qihome-air');
  const priceOf = (p) => fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
  const qioneCompare = fmtRaw(getCompareAt(qione));
  const cards = [
    {
      p: bracelet,
      name: 'QiBracelet®',
      handle: 'qibracelet',
      tagline: 'Eleganz & Schutz für unterwegs',
      features: ['Eleganter GitterChip™ integriert', 'E-Smog- & 5G-Puffer', 'Ruhe für unterwegs'],
      featured: false,
    },
    {
      p: qione,
      name: 'QiOne® 2 Pro',
      handle: 'qione-2-pro',
      tagline: 'Der Allrounder — Tag und Nacht',
      features: [
        'Wirkt auf allen drei Ebenen',
        'Tragbar als Anhänger',
        'Kohärente Wasserstruktur',
        'Unser Bestseller',
      ],
      featured: true,
    },
    {
      p: qihome,
      name: 'QiHome® Air',
      handle: 'qihome-air',
      tagline: 'Kohärentes Wasser für den ganzen Raum',
      features: ['E-Smog- & 5G-Raumschutz', 'Kohärentes Wasser im Raum', 'Ideal fürs Schlafzimmer'],
      featured: false,
    },
  ];
  return (
    <section className="lp-a-pricing" aria-labelledby="lp-a-pricing-title" data-section="lp-a-pricing">
      <span className="eyebrow">Unsere Produkte</span>
      <h2 id="lp-a-pricing-title">Finde deinen Begleiter für kohärentes Wasser</h2>
      <div className="lp-a-pricing-grid">
        {cards.map((c) => (
          <article
            className={`lp-a-product${c.featured ? ' lp-a-product--featured' : ''}`}
            key={c.handle}
          >
            {c.featured && <span className="lp-a-product__badge">Bestseller</span>}
            <div className="lp-a-product__image">
              {c.p?.featuredImage?.url ? (
                <img src={c.p.featuredImage.url} alt={c.name} loading="lazy" />
              ) : (
                <span className="lp-a-product__ph">{c.name}</span>
              )}
            </div>
            <h3 className="lp-a-product__name">{c.name}</h3>
            <p className="lp-a-product__tagline">{c.tagline}</p>
            <div className="lp-a-product__price-row">
              <span className="lp-a-product__price">{priceOf(c.p) || '—'}</span>
              {c.featured && qioneCompare && (
                <sup className="lp-a-product__compare">{qioneCompare}</sup>
              )}
            </div>
            <ul className="lp-a-product__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`lp-vp-btn ${c.featured ? 'lp-vp-btn--primary' : 'lp-vp-btn--secondary'} lp-a-product__cta`}
              href={`/products/${c.handle}`}
            >
              {c.featured ? 'Jetzt risikofrei testen' : 'Mehr erfahren'}
            </a>
          </article>
        ))}
      </div>
      <p className="lp-vp-pricing__fineprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
        kostenloser Versand · Käuferschutz
      </p>
    </section>
  );
}

/* ───────── QB-Signatur ───────── */
function SignatureSection() {
  return (
    <section className="lp-a-signature" data-section="lp-a-signatur">
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="lp-a-signature__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der eigentliche Wert
        ist unsichtbar: kohärentes Wasser in deinem Körper, Zellen, die besser geschützt
        sind, ein Nervensystem, das abends herunterfahren darf. Der Schmuck ist nur das
        Vehikel. Was du wirklich mitnimmst, ist die Ruhe auf allen drei Ebenen.
      </p>
      <p className="lp-a-signature__sign">— Dein Qi Blanco® Team</p>
    </section>
  );
}

/* ───────── Final CTA ───────── */
function FinalCTA() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const price = fmtBrutto(priceAmount);
  const compare = fmtRaw(getCompareAt(product));
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section className="lp-vp-final-cta" data-section="lp-a-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img src={image} alt="QiOne® 2 Pro" loading="lazy" />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-a-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-a-cta-arc" startOffset="0">
                  20 NÄCHTE RISIKOFREI · GELD ZURÜCK ·{' '}
                </textPath>
              </text>
            </svg>
            <div className="lp-vp-final-cta__stamp-core">
              <span className="lp-vp-final-cta__stamp-num">20</span>
              <span className="lp-vp-final-cta__stamp-unit">Nächte</span>
            </div>
          </div>
        </div>
        <div className="lp-vp-final-cta__body">
          <span className="eyebrow">Bereit für alle drei Ebenen?</span>
          <h2>Gib deinem Körper 20 Nächte. Den Rest entscheidest du.</h2>
          <p className="lp-vp-final-cta__lede">
            Trage den QiOne® 2 Pro 20 Nächte lang. Bist du danach nicht überzeugt, erstatten
            wir dir den vollen Kaufpreis. Ohne Wenn und Aber.
          </p>
          {price && (
            <div className="lp-vp-final-cta__price">
              <span className="lp-vp-final-cta__users">+ 14.000 aktive Nutzer</span>
              <div className="lp-vp-final-cta__price-row">
                <span className="lp-vp-final-cta__price-value">{price}</span>
                {compare && <sup className="lp-vp-final-cta__compare">{compare}</sup>}
              </div>
              <span className="lp-vp-final-cta__price-meta">einmalig · inkl. MwSt.</span>
              <div className="lp-vp-final-cta__pay">
                <img src={KLARNA_IMG} alt="Klarna" />
                <img src={PAYPAL_IMG} alt="PayPal" />
              </div>
            </div>
          )}
          <a className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg" href="/pages/qione-2-pro">
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="lp-vp-final-cta__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Root ───────── */
export function SchlafZellenSchutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-a3">
        <Hero />
        <DreiThemenBand dataSection="lp-a-drei-themen" />
        <IntroSection />
        <MechanismSection />
        <ScienceSection />
        <div data-section="lp-a-google-reviews">
          <LpGoogleReviews />
        </div>
        <InfoSlider dataSection="lp-a-info-slider" />
        <div className="NormalSectionSize" data-section="lp-a-reputon-reviews">
          <ReputonWidget />
        </div>
        <VideoSection />
        <GuaranteeSection />
        <PricingSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
