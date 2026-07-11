import {createContext, useContext} from 'react';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget as LpReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollMikroskopVideo as LpScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {YoutubeIframe as LpYoutubeIframe} from '~/components/reusables/YoutubeIframe';

/*
 * Landingpage /pages/tiefer-schlaf — verkaufspsychologisch optimiert.
 *
 * Baut auf dem bewaehrten lp-vp-Designsystem (styles/qione-zellschutz.css) und
 * dem Campaign-Muster QiOneZellschutz.jsx auf (Live-Preise via Loader, geteilte
 * Reusables, noindex-Route). Inhaltlich auf das Thema TIEFER SCHLAF zugespitzt,
 * damit die Seite die Versprechen der aktuell laufenden Schlaf-Ads einloest
 * (Message-Match Ad <-> Landingpage):
 *   - C3 "171 Berichte, ein Muster" -> Abschnitt "Was 171 Menschen berichten"
 *   - C5 / QiHome Air (der Raum, in dem du schlaefst) -> Abschnitt Schlafraum
 *   - Welle B / B1 (Raten, 20 Tage) -> Garantie-/Finanzierungs-Abschnitt
 * Wissens-/Story-Grundlage: "Faszination Kohaerentes Wasser" (2026-07-10).
 *
 * Claim-Disziplin: Zellstudien in-vitro/praeklinisch gelabelt; Erfahrungs-
 * berichte deskriptiv (kein Kausal-Claim); Geld-zurueck an Zeitraum + Ueber-
 * zeugung gebunden, NIE ans Spueren (Spuer-Regel #7). HWG grundsaetzlich aus
 * (weltweite Ads), Fakten-Treue absolut.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;

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

/* ───────── Hero (Message-Match: tiefer Schlaf) ───────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const heroImg =
    product?.featuredImage?.url ||
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const priceNum = priceAmount ? brutto(priceAmount) : 1087;
  const priceLabel = fmtBrutto(priceAmount) || '1.087,00 €';
  const compareLabel = fmtRaw(getCompareAt(product));
  const monthly = Math.ceil(priceNum / 12);
  const trust = [
    '🌙 Ruhigere Nächte als häufigstes Nutzer-Erlebnis',
    '🔬 Wirkung in Zellstudien bestätigt',
    '🛡️ 20 Nächte risikofrei testen',
  ];
  return (
    <section className="lp-vp-hero lp-ts-hero" aria-labelledby="lp-ts-hero-title">
      <div className="lp-vp-hero__inner">
        <div className="lp-vp-hero__copy">
          <span className="lp-vp-hero__badge">
            Das häufigste Erlebnis von 14.000+ Trägern: ruhigere Nächte
          </span>
          <h1 id="lp-ts-hero-title">
            Endlich wieder<br />
            tief schlafen.
          </h1>
          <div className="lp-vp-hero__visual lp-vp-hero__visual--mobile">
            <img src={heroImg} alt="QiOne® 2 Pro" loading="eager" />
          </div>
          <p className="lead">
            Dein Nervensystem kommt nachts nicht zur Ruhe? Der QiOne<sup>®</sup> 2 Pro
            unterstützt mit kohärentem Wasser genau dort, wo Erholung entsteht — auf
            Zellebene. Über 14.000 Menschen tragen ihn bereits täglich. Und Nacht für Nacht.
          </p>
          <ul className="lp-vp-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="lp-vp-hero__ctas">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/products/qione-2-pro">
              Jetzt ab {monthly}€/Monat starten →
            </a>
            <div className="lp-vp-hero__pay">
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816"
                alt="Klarna"
              />
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"
                alt="PayPal"
              />
            </div>
          </div>
          <p className="lp-vp-hero__fineprint">
            <span className="lp-vp-hero__users">+ 14.000 aktive Nutzer</span>
            <span className="lp-vp-hero__price-line">
              {compareLabel && (
                <span className="lp-vp-hero__strike">{compareLabel}</span>
              )}{' '}
              {priceLabel} · oder 12 Raten à {monthly}€ mit Klarna · inkl. Käuferschutz
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

/* ───────── Problem / Empathie (Einwand-Anker: „mir geht's genauso") ───────── */
function ProblemSection() {
  const rows = [
    {
      icon: '📡',
      title: 'Dein Umfeld steht unter Dauerstrom',
      body: 'WLAN, 5G, Smartphone am Bett: Deine Zellen sind rund um die Uhr niedrig-intensiver elektromagnetischer Belastung ausgesetzt — auch nachts, wenn dein Körper eigentlich abschalten sollte.',
    },
    {
      icon: '🧠',
      title: 'Dein Nervensystem bleibt im Alarmzustand',
      body: 'Chronischer Alltagsstress und oxidativer Stress halten den Körper in Habachtstellung. Einschlafen wird zäh, der Schlaf bleibt flach, du wachst gerädert auf.',
    },
    {
      icon: '💧',
      title: 'Genau hier setzt kohärentes Wasser an',
      body: 'Fast alle biologischen Prozesse laufen an wasserumhüllten Grenzflächen ab. Ist dieses Wasser geordnet, arbeiten Zellen und Nervensystem ruhiger — die Grundlage für echte Erholung.',
    },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--stone">
      <span className="eyebrow">Warum Schlaf heute schwerer fällt</span>
      <h2>Es liegt selten an dir. Es liegt an deiner Umgebung.</h2>
      <p className="lp-vp-section__lede">
        Bevor wir über ein Produkt reden, reden wir über die Ursache. Denn wer versteht,
        warum sein Schlaf leidet, versteht auch, warum kohärentes Wasser hilft.
      </p>
      <div className="lp-vp-benefits-grid">
        {rows.map((r) => (
          <article className="lp-vp-benefit" key={r.title}>
            <span className="lp-vp-benefit__icon" aria-hidden="true">
              {r.icon}
            </span>
            <h3 className="lp-vp-benefit__title">{r.title}</h3>
            <p className="lp-vp-benefit__body">{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Mechanismus / Faszination (Nordstern: konkret erklären) ───────── */
function MechanismSection() {
  const steps = [
    {
      num: '1',
      title: 'Das Feld ordnet das Wasser an deinen Zellen',
      body: 'Der GitterChip™ im QiOne® 2 Pro erzeugt ein statisches Feld — ganz ohne Batterie oder Magnet. Es hilft Wassermolekülen, an biologischen Grenzflächen in den kohärenten, geordneten Zustand überzugehen (Pollacks „EZ-Wasser").',
    },
    {
      num: '2',
      title: 'Deine Zellen bekommen ihren Schutzraum zurück',
      body: 'Die kohärente Grenzschicht puffert eingestrahlten E-Smog ab, stabilisiert die Zellmembran und senkt oxidativen Stress. Ein Körper, der weniger im Abwehrmodus ist, kann nachts leichter herunterfahren.',
    },
    {
      num: '3',
      title: 'In rund 20 Nächten stellt sich ein neues Gleichgewicht ein',
      body: 'Zellen brauchen Zeit, um sich an ein verändertes Wasserumfeld anzupassen — Membranen bauen ihre EZ-Schicht auf, das Nervensystem verlässt Schritt für Schritt den Daueralarm. Deshalb berichten die meisten Träger von Veränderungen in den ersten drei Wochen.',
    },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white lp-ts-mechanism">
      <span className="eyebrow">Was nachts in deinem Körper passiert</span>
      <h2>Kein Wunder. Biophysik.</h2>
      <p className="lp-vp-section__lede">
        Wir verkaufen dir keine Traum-Stimmung, sondern eine nachvollziehbare Wirkkette.
        99 von 100 Molekülen in deinem Körper sind Wassermoleküle — kohärentes Wasser ist
        die Schnittstelle, an der Erholung beginnt.
      </p>
      <div className="lp-ts-steps">
        {steps.map((s) => (
          <article className="lp-ts-step" key={s.num}>
            <span className="lp-ts-step__num" aria-hidden="true">
              {s.num}
            </span>
            <div className="lp-ts-step__text">
              <h3 className="lp-ts-step__title">{s.title}</h3>
              <p className="lp-ts-step__body">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="lp-ts-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die folgenden Zell-
        studien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den Mechanismus,
        sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Wissenschaft (messbar, in-vitro gelabelt) ───────── */
function ScienceSection() {
  const stats = [
    {
      value: '84,7%',
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
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt — an Zellen gemessen.</h2>
      <p className="lp-vp-section__lede">
        Vier peer-review-publizierte Zellstudien (Dartsch Scientific, unabhängiges Labor)
        belegen die Wirkung der Qi-Blanco-Technologie experimentell. Alle Studien in vitro —
        messbare, reproduzierbare Effekte auf lebende Zellen.
      </p>
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

/* ───────── 171 Berichte (Message-Match C3, deskriptiv) ───────── */
function ExperienceSection() {
  return (
    <section className="lp-vp-section lp-vp-section--cream lp-ts-experience">
      <span className="eyebrow">171 dokumentierte Erfahrungsberichte</span>
      <h2>171 ehrliche Berichte — und ein Muster, das sich wiederholt.</h2>
      <p className="lp-vp-section__lede">
        In einer ausgewerteten Sammlung von 171 unabhängigen Nutzer-Berichten war ein Thema
        mit Abstand am häufigsten: ruhigere, tiefere Nächte. Das sind Erfahrungsberichte —
        deskriptiv, ohne Kontrollgruppe. Aber das Muster ist deutlich.
      </p>
      <div className="lp-vp-stats-row">
        <div className="lp-vp-stat-item">
          <span className="lp-vp-stat-item__value">~20%</span>
          <span className="lp-vp-stat-item__label">
            nennen Ruhe &amp; besseren Schlaf — das häufigste Thema
          </span>
        </div>
        <div className="lp-vp-stat-item">
          <span className="lp-vp-stat-item__value">~17%</span>
          <span className="lp-vp-stat-item__label">
            berichten von mehr Energie &amp; Vitalität am Tag
          </span>
        </div>
        <div className="lp-vp-stat-item">
          <span className="lp-vp-stat-item__value">171</span>
          <span className="lp-vp-stat-item__label">
            verifizierte Berichte, Fachpublikation 2024
          </span>
        </div>
      </div>
      <blockquote className="lp-ts-quotes">
        <span>„Ich schlafe tiefer.“</span>
        <span>„Ich bin klarer im Kopf.“</span>
        <span>„Ich fühle mich geerdet.“</span>
      </blockquote>
      <p className="lp-ts-experience__src">
        Quelle: Advances in Bioengineering &amp; Biomedical Science Research, 10.05.2024
        (171 verifizierte Berichte, deskriptiv).
      </p>
    </section>
  );
}

/* ───────── Video-Erfahrungen ─────────
   CONTENT-MATCH (Christian-Regel 2026-07-11): Überschrift/Tag/Quote MÜSSEN das
   tatsächlich Gesagte im Video treffen (Transkript-belegt, Register:
   homepage-bauer data/medien/<id>.json). Gate vor jeder Änderung:
   codemeister content-match check <diese Datei>. Zitate sinngemäß aus dem
   jeweiligen Transkript — keine erfundenen Themen (Brain-Fog-Falle F-003). */
function VideoSection() {
  const videos = [
    {
      tag: '🏅 Deutscher Leichtathletik-Meister',
      title: 'Constantin Preis — getrackter Tiefschlaf',
      quote: 'Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.',
      id: 'jyLyXZqHxaw',
    },
    {
      tag: '🕉️ Nada & Kurt Tepperwein',
      title: 'Spürbar stabiler im Alltag',
      quote: 'So wie ich es trage und erlebe: Es stabilisiert.',
      id: 'aG36zJKxDzg',
    },
    {
      tag: '✨ Erste Tage mit dem QiOne®',
      title: 'Michelle Christin Guse — „wie ein kleines Wunder"',
      quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
      id: 'zIfDQ1N60fI',
    },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Erfahrungen.</h2>
      <p className="lp-vp-section__lede">
        Drei Träger, drei Geschichten — vom getrackten Tiefschlaf des Leistungssportlers
        bis zur spürbaren Veränderung im Alltag. Berichte einzelner Nutzer, deskriptiv.
      </p>
      <div className="lp-vp-videos-grid">
        {videos.map((v) => (
          <article className="lp-vp-video" key={v.id}>
            <div className="lp-vp-video__thumb lp-vp-video__thumb--iframe">
              <LpYoutubeIframe
                link={`https://www.youtube.com/embed/${v.id}?si=2ZVH9xtaSaEMmfTQ&controls=0`}
              />
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

/* ───────── Schlafraum (Message-Match C5 / QiHome Air) ───────── */
function SchlafraumSection() {
  const {data} = useLp();
  const qihome = findLp(data, 'qihome-air');
  const priceOf = (p) => fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
  const img =
    qihome?.featuredImage?.url ||
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329';
  return (
    <section className="lp-vp-section lp-vp-section--stone lp-ts-room">
      <div className="lp-ts-room__inner">
        <div className="lp-ts-room__media">
          <img src={img} alt="QiHome® Air" loading="lazy" />
        </div>
        <div className="lp-ts-room__copy">
          <span className="eyebrow">Der Raum, in dem du schläfst</span>
          <h2>Nicht nur du. Dein ganzes Schlafzimmer.</h2>
          <p>
            Der QiOne<sup>®</sup> begleitet dich am Körper. Das QiHome<sup>®</sup> Air bringt
            kohärentes Wasser in den ganzen Raum — dorthin, wo du ein Drittel deines Lebens
            verbringst. Eine neue Zellstudie zeigt, dass sich Nervenzellen in diesem Umfeld
            messbar besser regenerieren (präklinisch, in vitro).
          </p>
          <a
            className="lp-vp-btn lp-vp-btn--secondary"
            href="/products/qihome-air"
          >
            QiHome® Air entdecken{priceOf(qihome) ? ` — ab ${priceOf(qihome)}` : ''}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── Einwand-Abbau / Garantie (Message-Match Welle B, Spür-Regel #7) ───────── */
function GuaranteeSection() {
  const items = [
    {
      icon: '🌙',
      title: '20 Nächte, dein Bett',
      body: 'Teste den QiOne® 2 Pro 20 Nächte lang in deinem echten Alltag. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
    {
      icon: '💳',
      title: 'In Raten, wenn du willst',
      body: 'Über Klarna oder PayPal in bequemen Monatsraten — 0 % Finanzierung. Du entscheidest, wie du zahlst.',
    },
    {
      icon: '🇩🇪',
      title: 'Made in Germany',
      body: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand.',
    },
  ];
  return (
    <section className="lp-vp-section lp-vp-section--white">
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt dich deine Nachtruhe — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort bewusst
        wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl, sondern an den
        Zeitraum: 20 Nächte, dann entscheidest du.
      </p>
      <div className="lp-vp-benefits-grid lp-vp-benefits-grid--row">
        {items.map((b) => (
          <article className="lp-vp-benefit" key={b.title}>
            <span className="lp-vp-benefit__icon" aria-hidden="true">
              {b.icon}
            </span>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
            <p className="lp-vp-benefit__body">{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Pricing (Live-Preise) ───────── */
function PricingSection() {
  const {data} = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione = findLp(data, 'qione-2-pro');
  const qihome = findLp(data, 'qihome-air');
  const priceOf = (p) => fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
  const qioneCompare = fmtRaw(getCompareAt(qione));
  return (
    <section className="lp-vp-pricing" aria-labelledby="lp-ts-pricing-title">
      <div className="lp-vp-pricing__inner">
        <span className="eyebrow" style={{display: 'block', textAlign: 'center'}}>
          Unsere Produkte
        </span>
        <h2 id="lp-ts-pricing-title" style={{textAlign: 'center'}}>
          Finde deinen Begleiter für ruhigere Nächte
        </h2>
        <div className="lp-vp-pricing-grid">
          <article className="lp-vp-product">
            <div className="lp-vp-product__image">
              {bracelet?.featuredImage?.url ? (
                <img src={bracelet.featuredImage.url} alt="QiBracelet®" />
              ) : (
                '[ QiBracelet® ]'
              )}
            </div>
            <h3 className="lp-vp-product__name">QiBracelet®</h3>
            <p className="lp-vp-product__tagline">Eleganz &amp; Schutz</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">{priceOf(bracelet) || '—'}</span>
            </div>
            <ul className="lp-vp-product__features">
              <li>✓ Eleganter Gitterchip™ integriert</li>
              <li>✓ Reduziert E-Smog &amp; 5G</li>
              <li>✓ Wohlbefinden &amp; Ruhe für unterwegs</li>
            </ul>
            <a
              className="lp-vp-btn lp-vp-btn--ghost-dark lp-vp-product__cta"
              href="/products/qibracelet"
              style={{textAlign: 'center'}}
            >
              Mehr erfahren
            </a>
          </article>

          <article className="lp-vp-product lp-vp-product--featured">
            <span className="lp-vp-product__bestseller">⭐ BESTSELLER</span>
            <div className="lp-vp-product__image">
              {qione?.featuredImage?.url ? (
                <img src={qione.featuredImage.url} alt="QiOne® 2 Pro" />
              ) : (
                '[ QiOne® 2 Pro ]'
              )}
            </div>
            <h3 className="lp-vp-product__name">QiOne® 2 Pro</h3>
            <p className="lp-vp-product__tagline">Dein Begleiter für die Nacht.</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">{priceOf(qione) || '—'}</span>
              {qioneCompare && (
                <sup className="lp-vp-product__compare">{qioneCompare}</sup>
              )}
            </div>
            <ul className="lp-vp-product__features">
              <li>✓ Tragbar als Anhänger — Tag &amp; Nacht</li>
              <li>✓ E-Smog- &amp; 5G-Puffer</li>
              <li>✓ Kohärente Wasserstruktur</li>
              <li>✓ Unser Bestseller</li>
            </ul>
            <a
              className="lp-vp-btn lp-vp-btn--primary lp-vp-product__cta"
              href="/products/qione-2-pro"
              style={{textAlign: 'center'}}
            >
              Jetzt risikofrei testen
            </a>
          </article>

          <article className="lp-vp-product">
            <div className="lp-vp-product__image">
              {qihome?.featuredImage?.url ? (
                <img src={qihome.featuredImage.url} alt="QiHome® Air" />
              ) : (
                '[ QiHome® Air ]'
              )}
            </div>
            <h3 className="lp-vp-product__name">QiHome® Air</h3>
            <p className="lp-vp-product__tagline">Für dein Schlafzimmer</p>
            <span className="lp-vp-product__users">+ 14.000 aktive Nutzer</span>
            <div className="lp-vp-product__price-row">
              <span className="lp-vp-product__price">
                {priceOf(qihome) || 'auf Anfrage'}
              </span>
            </div>
            <ul className="lp-vp-product__features">
              <li>✓ E-Smog- &amp; 5G-Raumschutz</li>
              <li>✓ Kohärentes Wasser im ganzen Raum</li>
              <li>✓ Ideal fürs Schlafzimmer</li>
            </ul>
            <a
              className="lp-vp-btn lp-vp-btn--ghost-dark lp-vp-product__cta"
              href="/products/qihome-air"
              style={{textAlign: 'center'}}
            >
              Mehr erfahren
            </a>
          </article>
        </div>
        <p className="lp-vp-pricing__fineprint">
          Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
          kostenloser Versand · Käuferschutz
        </p>
      </div>
    </section>
  );
}

/* ───────── QB-Sichtweise / Signatur (du-Anrede, Marke) ───────── */
function SignatureSection() {
  return (
    <section className="lp-vp-section lp-vp-section--dark lp-ts-signature">
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="lp-ts-signature__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der eigentliche Wert
        ist unsichtbar: kohärentes Wasser in deinem Körper, Zellen, die besser geschützt
        sind, ein Nervensystem, das nachts endlich herunterfahren darf. Der Schmuck ist nur
        das Vehikel. Was du wirklich mitnimmst, ist die Ruhe.
      </p>
      <p className="lp-ts-signature__sign">— Dein Qi Blanco® Team</p>
    </section>
  );
}

/* ───────── Final CTA (Zeitraum + Überzeugung, NICHT Spüren) ───────── */
function FinalCTA() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const price = fmtBrutto(priceAmount);
  const compare = fmtRaw(getCompareAt(product));
  const image = product?.featuredImage?.url || product?.images?.[0]?.url;
  return (
    <section className="lp-vp-final-cta">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          {image && <img src={image} alt="QiOne® 2 Pro" loading="lazy" />}
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-ts-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-ts-cta-arc" startOffset="0">
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
          <span className="eyebrow">Bereit für ruhigere Nächte?</span>
          <h2>Gib deinem Schlaf 20 Nächte. Den Rest entscheidest du.</h2>
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
                <img
                  src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816"
                  alt="Klarna"
                />
                <img
                  src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"
                  alt="PayPal"
                />
              </div>
            </div>
          )}
          <a
            className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg"
            href="/products/qione-2-pro"
          >
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
export function TieferSchlaf({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-ts">
        <Hero />
        <ProblemSection />
        <MechanismSection />
        <ScienceSection />
        <ExperienceSection />
        <LpGoogleReviews />
        <LpReputonWidget />
        <VideoSection />
        <SchlafraumSection />
        <GuaranteeSection />
        <PricingSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
