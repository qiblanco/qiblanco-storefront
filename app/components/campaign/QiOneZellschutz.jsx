import {createContext, useContext} from 'react';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget as LpReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo as LpScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {InfoSlider as LpInfoSlider} from '~/components/index-components/InfoSlider';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {YoutubeIframe as LpYoutubeIframe} from '~/components/reusables/YoutubeIframe';

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) => data?.products?.find((product) => product?.handle === handle) || null;

const VAT = 1.19;
const brutto = (a) => parseFloat(a || 0) * VAT;
const fmtBrutto = (a) => {
  if (!a) return null;
  const n = Math.round(brutto(a));
  return n.toLocaleString('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtRaw = (a) => {
  if (!a) return null;
  const n = Math.round(parseFloat(a));
  return n.toLocaleString('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const getCompareAt = (p) => {
  const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
  return v?.compareAtPrice?.amount;
};

/* ───────── Hero ───────── */
function Hero() {
  const { data } = useLp();
  const product = findLp(data, 'qione-2-pro');
  const heroImg = product?.featuredImage?.url
    || 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const compareAt = getCompareAt(product);
  const priceNum = priceAmount ? brutto(priceAmount) : 1087;
  const priceLabel = fmtBrutto(priceAmount) || '1.087,00 €';
  const compareLabel = fmtRaw(compareAt);
  const monthly = Math.ceil(priceNum / 12);
  const trust = [
    "✅ Wirkung in Zellstudien bestätigt",
    "✅ 20 Tage risikofrei",
    "✅ 0% Finanzierung",
  ];
  return (
    <section className="lp-vp-hero" aria-labelledby="lp-vp-hero-title">
      <div className="lp-vp-hero__inner">
        <div className="lp-vp-hero__copy">
          <span className="lp-vp-hero__badge">🏆 Von Maxim als bestes EMF-Tool ausgezeichnet</span>
          <h1 id="lp-vp-hero-title">
            Schlafe tiefer.<br />
            Fühle dich klarer.<br />
            Schütze deine Zellen.
          </h1>
          <div className="lp-vp-hero__visual lp-vp-hero__visual--mobile">
            <img src={heroImg} alt="QiOne® 2 Pro" loading="eager" />
          </div>
          <p className="lead">
            Der QiOne<sup>®</sup> 2 Pro nutzt proprietäre GitterChip™-Technologie,
            um dein Wohlbefinden auf Zellebene messbar zu verbessern.
            Über 14.000 Menschen tragen ihn bereits täglich.
          </p>
          <ul className="lp-vp-hero__trust">
            {trust.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <div className="lp-vp-hero__ctas">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/products/qione-2-pro">Jetzt ab {monthly}€/Monat starten →</a>
            <div className="lp-vp-hero__pay">
              <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816" alt="Klarna" />
              <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082" alt="PayPal" />
            </div>
          </div>
          <p className="lp-vp-hero__fineprint">
            <span className="lp-vp-hero__users">+ 14.000 aktive Nutzer</span>
            <span className="lp-vp-hero__price-line">
              {compareLabel && <span className="lp-vp-hero__strike">{compareLabel}</span>}{' '}{priceLabel} · oder 12 Raten à {monthly}€ mit Klarna · Inkl. Käuferschutz
            </span>
          </p>
        </div>
        <div className="lp-vp-hero__visual lp-vp-hero__visual--desktop">
          <img src={heroImg} alt="QiOne® 2 Pro" loading="eager" />
        </div>
      </div>
    </section>
  );
}

/* ───────── HRV-Cards ───────── */
function HRVSection() {
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Messbare Ergebnisse</span>
      <h2>Dein biologisches Alter unter E-Smog – und mit QiOne<sup>®</sup></h2>
      <p className="lp-vp-section__lede">
        Kurzzeit-HRV-Messung zeigt: Der QiOne<sup>®</sup> 2 Pro kann das biologische
        Alter unter WLAN-Belastung nicht nur ausgleichen, sondern sogar verbessern.
      </p>
      <div className="lp-vp-hrv-row lp-vp-hrv-row--two">
        <div className="lp-vp-hrv-card lp-vp-hrv-card--alarm">
          <span className="lp-vp-hrv-card__label">Unter E-Smog</span>
          <span className="lp-vp-hrv-card__value">5 Jahre älter</span>
          <span className="lp-vp-hrv-card__sub">biol. HRV-Alter (Kurzzeit-HRV)</span>
        </div>
        <div className="lp-vp-hrv-card lp-vp-hrv-card--win">
          <span className="lp-vp-hrv-card__label">Mit QiOne® 2 Pro</span>
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
    { icon: "🌙", title: "Erholsamerer Schlaf" },
    { icon: "🛡️", title: "Schutz vor E-Smog & 5G" },
    { icon: "🧠", title: "Mehr Klarheit & Fokus" },
    { icon: "⚡", title: "Spürbar mehr Energie" },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--stone">
      <span className="eyebrow">Vorteile</span>
      <h2>Ein Begleiter. Vier spürbare Veränderungen.</h2>
      <div className="lp-vp-benefits-grid lp-vp-benefits-grid--row">
        {items.map((b) => (
          <article className="lp-vp-benefit lp-vp-benefit--compact" key={b.title}>
            <span className="lp-vp-benefit__icon" aria-hidden="true">{b.icon}</span>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
          </article>
        ))}
      </div>
      <LpInfoSlider />
    </section>
  );
}

/* ───────── Wissenschaft / Studies — Original PeerReviewStudies ───────── */
function ScienceSection() {
  const stats = [
    { value: "2×",    label: "Zellviabilität",   desc: "Doppelte Zellüberlebensfähigkeit unter oxidativem Stress",      cite: "Applied Cell Biology, 2024" },
    { value: "97,6%", label: "Zellschutz",        desc: "Schutzwirkung der Zellregeneration unter Handystrahlung",       cite: "Applied Cell Biology, 2021" },
    { value: "12,1×", label: "Barrierefunktion\n\n",  desc: "Verbesserung der Zell-Barrierefunktion unter E-Smog",            cite: "Applied Cell Biology, 2021" },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt – messbar bestätigt.</h2>
      <div className="lp-vp-peer-stats">
        {stats.map((s) => (
          <div className="lp-vp-peer-stat" key={s.label}>
            <div className="lp-vp-peer-stat__value">{s.value}</div>
            <div className="lp-vp-peer-stat__label">{s.label}</div>
            {s.desc && <div className="lp-vp-peer-stat__desc">{s.desc}</div>}
            {s.cite && <div className="lp-vp-peer-stat__cite">{s.cite}</div>}
          </div>
        ))}
      </div>
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
        Sieh dir an, wie der QiOne<sup>®</sup> 2 Pro den Alltag unserer Nutzer verändert hat.
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

/* ───────── Pricing ───────── */
function PricingSection() {
  const { data } = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione    = findLp(data, 'qione-2-pro');
  const qihome   = findLp(data, 'qihome-air');
  const priceOf = (p) => fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
  const compareOf = (p) => fmtRaw(getCompareAt(p));
  const qioneCompare = compareOf(qione);
  return (
    <section className="lp-vp-pricing" aria-labelledby="lp-vp-pricing-title">
      <div className="lp-vp-pricing__inner">
        <span className="eyebrow" style={{display:'block', textAlign:'center'}}>Unsere Produkte</span>
        <h2 id="lp-vp-pricing-title" style={{textAlign:'center'}}>Finde deinen perfekten Begleiter</h2>
        <div className="lp-vp-pricing-grid">
          {/* QiBracelet */}
          <article className="lp-vp-product">
            <div className="lp-vp-product__image">
              {bracelet?.featuredImage?.url
                ? <img src={bracelet.featuredImage.url} alt="QiBracelet®" />
                : '[ QiBracelet® ]'}
            </div>
            <h3 className="lp-vp-product__name">QiBracelet®</h3>
            <p className="lp-vp-product__tagline">Eleganz & Schutz</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">{priceOf(bracelet) || '—'}</span>
            </div>
            <ul className="lp-vp-product__features">
              <li>✓  Eleganter Gitterchip™ integriert</li>
              <li>✓  Reduziert E-Smog & 5G</li>
              <li>✓  Wohlbefinden & Klarheit für unterwegs</li>
            </ul>
            <a className="lp-vp-btn lp-vp-btn--ghost-dark lp-vp-product__cta" href="/products/qibracelet" style={{textAlign:'center'}}>Mehr erfahren</a>
          </article>

          {/* QiOne 2 Pro – featured */}
          <article className="lp-vp-product lp-vp-product--featured">
            <span className="lp-vp-product__bestseller">⭐ BESTSELLER</span>
            <div className="lp-vp-product__image">
              {qione?.featuredImage?.url
                ? <img src={qione.featuredImage.url} alt="QiOne® 2 Pro" />
                : '[ QiOne® 2 Pro ]'}
            </div>
            <h3 className="lp-vp-product__name">QiOne® 2 Pro</h3>
            <p className="lp-vp-product__tagline">Kompakt. Innovativ. Stark.</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">{priceOf(qione) || '—'}</span>
              {qioneCompare && <sup className="lp-vp-product__compare">{qioneCompare}</sup>}
            </div>
            <ul className="lp-vp-product__features">
              <li>✓  Tragbar als Anhänger</li>
              <li>✓  E-Smog & 5G Schutz</li>
              <li>✓  Kohärente Wasserstruktur</li>
              <li>✓  Unser Bestseller</li>
            </ul>
            <a className="lp-vp-btn lp-vp-btn--primary lp-vp-product__cta" href="/products/qione-2-pro" style={{textAlign:'center'}}>Jetzt risikofrei testen</a>
          </article>

          {/* QiHome Air */}
          <article className="lp-vp-product">
            <div className="lp-vp-product__image">
              {qihome?.featuredImage?.url
                ? <img src={qihome.featuredImage.url} alt="QiHome® Air" />
                : '[ QiHome® Air ]'}
            </div>
            <h3 className="lp-vp-product__name">QiHome® Air</h3>
            <p className="lp-vp-product__tagline">Für dein Zuhause</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">{priceOf(qihome) || 'auf Anfrage'}</span>
            </div>
            <ul className="lp-vp-product__features">
              <li>✓  E-Smog & 5G Raumschutz</li>
              <li>✓  Produktives Arbeitsumfeld</li>
              <li>✓  Ideal für Familien</li>
            </ul>
            <a className="lp-vp-btn lp-vp-btn--ghost-dark lp-vp-product__cta" href="/products/qihome-air" style={{textAlign:'center'}}>Mehr erfahren</a>
          </article>
        </div>
        <p className="lp-vp-pricing__fineprint">
          Alle Produkte: 20 Tage risikofrei testen · 0% Finanzierung über Klarna · Kostenloser Versand · Käuferschutz
        </p>
      </div>
    </section>
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

/* ───────── Final CTA ───────── */
function FinalCTA() {
  const { data } = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const compareAmount = getCompareAt(product);
  const price = fmtBrutto(priceAmount);
  const compare = fmtRaw(compareAmount);
  const image = product?.featuredImage?.url || product?.images?.[0]?.url;
  return (
    <section className="lp-vp-final-cta">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          {image && <img src={image} alt="QiOne® 2 Pro" loading="lazy" />}
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="lp-vp-cta-arc" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-vp-cta-arc" startOffset="0">
                  20 TAGE RISIKOFREI · GELD ZURÜCK · 
                </textPath>
              </text>
            </svg>
            <div className="lp-vp-final-cta__stamp-core">
              <span className="lp-vp-final-cta__stamp-num">20</span>
              <span className="lp-vp-final-cta__stamp-unit">Tage</span>
            </div>
          </div>
        </div>
        <div className="lp-vp-final-cta__body">
          <span className="eyebrow">Bereit?</span>
          <h2>Spür den Unterschied — oder bekomm dein Geld zurück.</h2>
          <p className="lp-vp-final-cta__lede">
            Teste den QiOne® 2 Pro 20 Tage in deinem Alltag. Überzeugt er dich nicht, erstatten wir dir den vollen Kaufpreis. Ohne Wenn und Aber.
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
                <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816" alt="Klarna" />
                <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082" alt="PayPal" />
              </div>
            </div>
          )}
          <a className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg" href="/products/qione-2-pro">
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="lp-vp-final-cta__trust">
            <li>0% Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Root ───────── */
export function QiOneZellschutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp">
        <Hero />
        <HRVSection />
        <BenefitsSection />
        <SocialProofSection />
        <LpGoogleReviews />
        <LpReputonWidget />
        <ScienceSection />
        <VideoSection />
        <UrgencyBanner />
        <PricingSection />
        <TrustSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
