import {createContext, useContext} from 'react';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {bildSrcSet} from '~/components/reusables/shopifyBildQuellen';
import {THEMEN} from '~/lib/redesign3themen';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {mitStreichpreisFallback} from '~/lib/streichpreis-paritaet';

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

// M3 (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft): Preise im
// Markt-Kontext des Loaders (@inContext-Query) — EUR = netto*(1+Satz)
// (Warenkorb-Kanon), andere Waehrungen = Markets-Endbetrag. Satz/Rundung/
// Format kommen aus markt-pricing (die EINE Stelle, kein Doppelbau).
const waehrungVon = (p) => p?.priceRange?.minVariantPrice?.currencyCode || 'EUR';
const preisWert = (p) =>
  bruttoAnzeige(p?.priceRange?.minVariantPrice?.amount, p?.handle, waehrungVon(p));
const preisLabelVon = (p) => formatPreis(preisWert(p), waehrungVon(p));
const getCompareAtMoney = (p) => {
  const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
  return mitStreichpreisFallback(v?.compareAtPrice, p?.handle, waehrungVon(p));
};
// Streichpreis: API-Wert ist bereits der Anzeigewert (kein Steueraufschlag)
const compareLabelVon = (p) => {
  const money = getCompareAtMoney(p);
  const n = Number.parseFloat(money?.amount);
  if (!Number.isFinite(n)) return null;
  return formatPreis(Math.round(n), money.currencyCode || waehrungVon(p));
};

const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/*
 * BILD-LEITERN UND `sizes` (Job 20260906-…-prio20, s02).
 *
 * ANLASS: die Seite lieferte 14 Shopify-CDN-Bilder als UNSKALIERTE ORIGINALE
 * aus — zusammen 16,88 MB, gemessen am 2026-09-06 am Live-Dokument. Allein
 * QiBracelet1.webp 6.266.409 B bei einer Anzeigebreite von 200 px.
 * Die Mechanismus-Kacheln sind hier BEWUSST NICHT aufgefuehrt: sie haben ihre
 * Leiter bereits (#316), samt einer aus den CSS-Tokens hergeleiteten
 * `sizes`-Angabe und der Wache bin/probe_mech_sizes_naht.py.
 *
 * GEBAUT WIRD MIT DEM BESTAND: `bildSrcSet` aus shopifyBildQuellen ist die
 * EINE Stelle, an der eine Shopify-Leiter entsteht (P10) — hier kommen nur
 * je Bild passende Sprossen und die Layoutbreite dazu.
 *
 * `sizes` MUSS die Layoutbreite ehrlich nennen und darf sie nie
 * UNTERschaetzen: eine zu kleine Angabe lässt den Browser eine zu kleine
 * Sprosse wählen — sichtbare Unschaerfe, und genau das meldet das
 * Alle-Formate-Gate als `bild-aufloesung`. Zu große Angaben kosten nur Bytes.
 *
 * DIE ANZEIGEBREITEN SIND ÜBER DIE GANZE FORMAT-MATRIX GEMESSEN, NICHT ÜBER
 * ZWEI VIEWPORTS — und das Maximum liegt MITTEN darin, nicht an den Raendern:
 * die Seite ist bis 767 px einspaltig, das Hero-Bild waechst dort MIT dem
 * Viewport und erreicht bei 600 px Breite 552 CSS-px, mehr als auf jedem
 * Desktop (423). Gemessen über 11 Formate von 360 bis 1440 px:
 *   Hero/Final-CTA  312 · 366 · 552 · 273 · … · 423  -> Maximum 552
 *   Produktkarten   konstant 200 (158 bei 768)
 *   Zahlarten-Logos konstant 48 (Klarna) bzw. 52 (PayPal)
 * Wer nur Telefon und Desktop misst, sieht das 552er-Maximum baulich nie.
 */
const SIZES_HERO =
  '(max-width: 767px) calc(100vw - 48px), min(40vw, 423px)';
/* Die Zahlarten-Logos bekommen eine EIGENE, kurze Leiter: die Standard-Leiter
   beginnt bei 320 px und würde für eine 48-px-Flaeche mehr Bytes holen als
   das Original hat. Gemessen: klarna 17.675 B im Original, 4.866 B bei 100 px;
   paypal 75.518 B im Original, 5.176 B bei 110 px. Genau das meint die
   s01-Falle „kein pauschaler Wert" — sie verbietet nicht das Skalieren,
   sondern das UNGEMESSENE Skalieren. */
const LEITER_LOGO = [100, 150, 220];

/* ───────── Hero (Drei-Ebenen-Versprechen) ───────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const heroImg = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const fallback = priceAmount ? null : fallbackPreis('qione-2-pro');
  const waehrung = waehrungVon(product);
  const priceNum = priceAmount ? preisWert(product) : fallback.bruttoWert;
  const priceLabel = priceAmount ? preisLabelVon(product) : fallback.label;
  const compareLabel = compareLabelVon(product);
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
              {compareLabel && <s>{compareLabel}</s>} {priceLabel}
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
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
            srcSet={bildSrcSet(heroImg)}
            sizes={SIZES_HERO}
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
              {/* sizes bildet die ECHTE Kachelbreite ab (schlaf-zellen-schutz.css):
                  <=767px eine Spalte, section-padding 2x24px; darueber drei
                  Spalten in max 1080px mit 2x24px Gap, also (min(1080,100vw-48)
                  -48)/3 — ab 1128px konstant 344px. NICHT frei waehlbar: der
                  Wert wird von bin/probe_mech_sizes_naht.py aus genau diesen
                  CSS-Tokens hergeleitet und faerbt sich rot, sobald Geometrie
                  und Abschrift auseinanderlaufen. Wortgleich zur zweiten
                  Instanz Partner.jsx, die dieselbe Sektion rendert. */}
              <img
                src={thema.bild}
                srcSet={bildSrcSet(thema.bild)}
                sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1127px) calc((100vw - 96px) / 3), 344px"
                alt={thema.alt}
                loading="lazy"
              />
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
      {/* Das Scroll-Scrub-Video belegt bauartbedingt mehrere Bildschirmhoehen
          und war nach dem ersten Einbau die laengste verbliebene Durststrecke.
          Der Knopf steht deshalb DAVOR, solange der Beweis aus den Zahlen
          darüber noch frisch ist. */}
      <WeiterCta nr={6} label="20 Nächte risikofrei testen" imBlock />
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
      {/* Zweiter Knopf im Wissenschafts-Block: zwischen Video und Studien-
          Slider liegt sonst erneut eine volle Bildschirmhoehe ohne Weg. */}
      <WeiterCta nr={5} label="QiOne® 2 Pro ansehen" imBlock />
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── Social Proof (quer durch alle Themen) ─────────
   Stilles YouTube-Poster: seit YT-THUMB-MAXRES (2026-07-21, GL-DES-0009) der
   gemeinsame Baustein YoutubeTimestamp im Seiten-Kleid lp-a-yt (maxres-Kette). */

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
            <YoutubeTimestamp videoId={v.id} titel={v.title} className="lp-a-yt" />
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
      body: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand innerhalb Deutschlands.',
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
  const priceOf = (p) => preisLabelVon(p);
  const qioneCompare = compareLabelVon(qione);
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
                <img
                  src={c.p.featuredImage.url}
                  srcSet={bildSrcSet(c.p.featuredImage.url)}
                  sizes="200px"
                  alt={c.name}
                  loading="lazy"
                />
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
              href={produktLink(c.handle, BLOCK_LP, c.featured ? 'kauf' : 'detail')}
            >
              {c.featured ? 'Jetzt risikofrei testen' : 'Mehr erfahren'}
            </a>
          </article>
        ))}
      </div>
      <p className="lp-vp-pricing__fineprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
        kostenloser Versand innerhalb Deutschlands · Käuferschutz
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
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section className="lp-vp-final-cta" data-section="lp-a-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img
            src={image}
            srcSet={bildSrcSet(image)}
            sizes={SIZES_HERO}
            alt="QiOne® 2 Pro"
            loading="lazy"
          />
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
                <img
                  src={KLARNA_IMG}
                  srcSet={bildSrcSet(KLARNA_IMG, LEITER_LOGO)}
                  sizes="48px"
                  alt="Klarna"
                />
                <img
                  src={PAYPAL_IMG}
                  srcSet={bildSrcSet(PAYPAL_IMG, LEITER_LOGO)}
                  sizes="52px"
                  alt="PayPal"
                />
              </div>
            </div>
          )}
          <a className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg" href="/pages/qione-2-pro">
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="lp-vp-final-cta__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand innerhalb Deutschlands</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Weiter-Knopf (schließt die Knopf-Luecke) ─────────
   Job 20260906-…-prio20, Segment s02.

   GEMESSEN, NICHT VERMUTET (Hit-Test am gerenderten DOM,
   bin/lp-falz-hittest.py): zwischen dem Hero-CTA bei Falz 0,71 und dem
   nächsten klickbaren Kaufweg-Knopf bei Falz 18,70 lagen 15.181 px = 18,0
   Falzen mobil (12.625 px = 14,0 desktop) OHNE einen einzigen Weg zum
   Produkt. Wer Mechanismus, Wissenschaft, Bewertungen und Video liest, hatte
   dazwischen keinen nächsten Klick.

   Diese Landingpage wird am NÄCHSTEN KLICK gemessen, nicht an der Bestellung
   (qi-brain brain/Marketing/landingpage-trichter-und-messregel-2026-08-26.md) —
   eine solche Durststrecke ist damit kein Schoenheitsfehler, sondern der
   Defekt. Deshalb steht hier ein KNOPF und kein neuer Fließtext: die Luecke
   war das Problem, nicht die Textmenge.

   BEWUSST NICHTS NEUES: Ziel, Klassen und Farbe kommen aus dem Bestand
   (`lp-vp-btn lp-vp-btn--primary` -> /pages/qione-2-pro, derselbe Knopf wie im
   Hero). Kein zweiter Gold-Ton, keine neue Schriftgroesse, kein Preis. Auch
   der ABSTAND ist geerbt: zwischen zwei <section> tragen die 96 px
   Sektions-Polsterung den Knopf, er bringt keinen eigenen Rhythmus mit.
   `imBlock` gilt nur INNERHALB einer Sektion, wo diese Polsterung fehlt. */
function WeiterCta({nr, label, imBlock = false}) {
  return (
    <div
      className={`lp-a-weiter${imBlock ? ' lp-a-weiter--im-block' : ''}`}
      data-section={`lp-a-weiter-${nr}`}
    >
      <a className="lp-vp-btn lp-vp-btn--primary" href="/pages/qione-2-pro">
        {label}
      </a>
    </div>
  );
}

/* ───────── Root ───────── */
export function SchlafZellenSchutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-a3">
        <Hero />
        <DreiThemenBand dataSection="lp-a-drei-themen" block="lp" />
        <IntroSection />
        <MechanismSection />
        <WeiterCta nr={1} label="QiOne® 2 Pro ansehen" />
        <ScienceSection />
        <WeiterCta nr={2} label="20 Nächte risikofrei testen" />
        <div data-section="lp-a-google-reviews">
          <LpGoogleReviews />
        </div>
        <InfoSlider dataSection="lp-a-info-slider" />
        <div className="NormalSectionSize" data-section="lp-a-reputon-reviews">
          <ReputonWidget />
        </div>
        <WeiterCta nr={3} label="QiOne® 2 Pro ansehen" />
        <VideoSection />
        <WeiterCta nr={4} label="20 Nächte risikofrei testen" />
        <GuaranteeSection />
        <PricingSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
