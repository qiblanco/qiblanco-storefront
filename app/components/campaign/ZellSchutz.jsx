import {createContext, useContext, useState} from 'react';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {claim} from '~/lib/claims';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';

/*
 * Landingpage /pages/zell-schutz — ZELLSCHUTZ „Der Zellversuch als Held".
 *
 * LP B der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 B):
 * ERSATZ des frueheren Startseiten-Klons durch eine echte Zellschutz-Campaign-
 * Route an derselben URL — Ads, die heute auf /pages/zell-schutz zeigen (TOF
 * Therapeutin/Praktikerin-Strecke), profitieren ohne Ad-Edit vom echten Thema.
 *
 * Dramaturgie (11-Sektionen-Tiefschlaf-Skelett + B-Schwerpunkte): Hero (der
 * Zellversuch als Held) -> Problem (oxidativer Stress/Zellalterung) ->
 * Wirkmechanismus MIT Schema-Grafik (kohaerentes Wasser -> Zellmembran/
 * Zellspannung, SHOW IT) -> Wissenschaft/Laborevidenz prominent (der Zellversuch)
 * -> Skeptiker-Einwand („Physik, kein Wunder") als eigene Sektion -> Social Proof
 * -> Video-Erfahrungen -> Anwendung + 20-Tage-Erlebnisfenster (Handlungs-Anker)
 * -> Garantie -> Pricing -> QB-Signatur -> Final CTA.
 *
 * DESIGN: uebernimmt das 93/100-Token-System der LP A (styles/zell-schutz.css,
 * Scope .lp-b3). EIN Gold-Akzent (#c9a14b), warmes Neutral-Kontinuum, Beweis vor
 * Behauptung. KEINE DreiThemenBand — B ist Einzelthema, kein Allrounder.
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel —
 * die R1/R2/R3-Kette haengt pfad-agnostisch im root-Layout (D-006, keine
 * Doppelzaehlung).
 *
 * CLAIM-DISZIPLIN: Zellstudien-Zahlen sind in-vitro gelabelt (Beweis-Zahlen aus
 * dem Bestand: Tiefschlaf-ScienceSection + THEMEN in redesign3themen.js — hier
 * wird NICHTS Neues erfunden); Erfahrungsberichte deskriptiv (kein Kausal-Claim);
 * Geld-zurueck an Zeitraum + Ueberzeugung gebunden, NIE ans Spueren (Spuer-Regel).
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;

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
  return v?.compareAtPrice || null;
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
// ECHTES Shooting-Foto (Shopify-CDN), kein KI-Motiv (Bild-Ehrlichkeits-Lehre
// homepage-bauer D-013). Produktidentitaet gegen bildmaterial/_db/bilder.jsonl
// verifiziert: QiOne2Pro-Anhaenger an duenner Kette getragen — die Sektion
// heisst "Ein Anhaenger", das Bild MUSS den QiOne zeigen (Christian 2026-07-14).
const ZELLEN_SZENE_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-05984.webp?v=1738529250';

/* ───────── Hero (der Zellversuch als Held) ───────── */
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
  const trust = [
    '14.000+ Träger',
    'Zellstudien, peer-reviewed',
    'Made in Germany',
    '20 Nächte risikofrei',
  ];
  return (
    <section
      className="lp-b-hero"
      aria-labelledby="lp-b-hero-title"
      data-section="lp-b-hero"
    >
      <div className="lp-b-hero__inner">
        <div className="lp-b-hero__copy">
          <span className="lp-b-hero__eyebrow">Was im Labor an Zellen gemessen wurde</span>
          <h1 id="lp-b-hero-title" className="lp-b-hero__title">
            Zellschutz, den man messen kann.
          </h1>
          <p className="lp-b-hero__subline">
            Deine Zellen sind von Wasser umhüllt — und an genau diesem Wasser entscheidet
            sich, wie stabil ihre Membran bleibt. Der QiOne<sup>®</sup>&nbsp;2 Pro bringt
            dieses Grenzflächen-Wasser in kohärente Ordnung. In peer-review-kontrollierten
            Zellstudien (in&nbsp;vitro) sank die Belastung durch oxidativen Stress um{' '}
            <strong>75,0&nbsp;%</strong>, die Zell-Barriere hielt bis zu <strong>10×</strong>{' '}
            besser stand.
          </p>
          <div className="lp-b-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/pages/qione-2-pro">
              Jetzt 20 Nächte risikofrei testen
            </a>
            <span className="lp-b-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel}
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
            </span>
          </div>
          <ul className="lp-b-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <figure className="lp-b-hero__visual">
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

/* ───────── Problem / Empathie (oxidativer Stress) ───────── */
function ProblemSection() {
  return (
    <section className="lp-vp-section" data-section="lp-b-problem">
      <span className="eyebrow">Das stille Problem</span>
      <h2>Deine Zellen altern — jeden Tag ein Stück.</h2>
      <p className="lp-vp-section__lede">
        Oxidativer Stress gilt als einer der anerkannten Treiber der Zellalterung: Wenn
        freie Radikale schneller entstehen, als der Körper sie abfängt, leiden Zellmembran
        und Zellfunktion. Handystrahlung, Dauerstress, schlechter Schlaf und Umwelt-
        belastung befeuern ihn — meist, ohne dass du es merkst. Genau dort setzen wir an:
        nicht am Symptom, sondern eine Ebene tiefer, am Wasser rund um deine Zellen.
      </p>
    </section>
  );
}

/* ───────── Wirkmechanismus + Schema-Grafik (SHOW IT) ─────────
   Nordstern: konkret ERKLAEREN, WO und WIE kohaerentes Wasser wirkt.
   Das Schema zeigt zwei Zustaende des Grenzflaechen-Wassers an der Zellmembran
   (gestoert vs. kohaerent) samt Zellspannung — SHOW IT statt Claim-Plakat. */
function MembraneSchema({variant, label, hint, spannung}) {
  const gestoert = variant === 'gestoert';
  // Fixe Molekuel-Positionen (deterministisch): kohaerent = geordnetes Gitter,
  // gestoert = versetzte, unregelmaessige Lage. Kein Math.random.
  const kohaerent = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      kohaerent.push({x: 26 + col * 30, y: 26 + row * 24});
    }
  }
  const chaotisch = [
    {x: 30, y: 22}, {x: 62, y: 40}, {x: 88, y: 20}, {x: 120, y: 46}, {x: 150, y: 24},
    {x: 178, y: 44}, {x: 40, y: 58}, {x: 96, y: 64}, {x: 138, y: 62}, {x: 176, y: 70},
    {x: 58, y: 78}, {x: 112, y: 30}, {x: 158, y: 76}, {x: 74, y: 20},
  ];
  const molekuele = gestoert ? chaotisch : kohaerent;
  return (
    <figure className={`lp-b-schema__panel${gestoert ? ' lp-b-schema__panel--gestoert' : ''}`}>
      <svg viewBox="0 0 210 150" role="img" aria-label={`${label}: ${hint}`}>
        {/* Wasser-Zone (Grenzflaeche) */}
        <rect x="0" y="0" width="210" height="96" className="lp-b-schema__wasser" />
        {molekuele.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r="5"
            className="lp-b-schema__mol"
          />
        ))}
        {/* Zellmembran (Lipid-Doppelschicht, schematisch) */}
        <rect x="0" y="96" width="210" height="7" className="lp-b-schema__membran" />
        <rect x="0" y="115" width="210" height="7" className="lp-b-schema__membran" />
        {/* Zellinneres */}
        <rect x="0" y="122" width="210" height="28" className="lp-b-schema__zelle" />
        {/* Zellspannung-Marke */}
        <text x="105" y="140" className="lp-b-schema__span" textAnchor="middle">
          Zellspannung {spannung}
        </text>
      </svg>
      <figcaption>
        <strong>{label}</strong>
        <span>{hint}</span>
      </figcaption>
    </figure>
  );
}

function MechanismSection() {
  const schritte = [
    {
      n: '1',
      titel: 'Grenzflächen-Wasser ordnen',
      text: 'Fast jede Zellreaktion läuft an wasserumhüllten Grenzflächen ab. Die QiOne®-Technologie bringt genau dieses Wasser in eine kohärente, geordnete Struktur.',
    },
    {
      n: '2',
      titel: 'Zellmembran stabilisieren',
      text: 'Geordnetes Grenzflächen-Wasser stützt die Lipid-Doppelschicht der Membran. In vitro zeigte sich unter Stress eine bis zu 10× bessere Barrierefunktion (TEER-Messung).',
    },
    {
      n: '3',
      titel: 'Zellspannung halten',
      text: 'Eine stabile Membran hält ihr Membranpotential — die „Zellspannung" — leichter aufrecht. Das ist die messbare Grundlage, nicht ein Gefühl.',
    },
  ];
  return (
    <section className="lp-vp-section lp-b-mech-section" data-section="lp-b-mechanismus">
      <span className="eyebrow">Der Mechanismus</span>
      <h2>Alles beginnt am Wasser um deine Zellen.</h2>
      <p className="lp-vp-section__lede">
        Wir verkaufen dir keine Traum-Stimmung, sondern eine nachvollziehbare Wirkkette.
        Das Schema zeigt, was den Unterschied macht: die Ordnung des Wassers direkt an der
        Zellmembran.
      </p>
      <div className="lp-b-schema" aria-hidden="false">
        <MembraneSchema
          variant="gestoert"
          label="Gestörtes Grenzflächen-Wasser"
          hint="Unruhig, ungeordnet — die Membran wird schlechter gestützt, die Zellspannung schwankt."
          spannung="instabil"
        />
        <span className="lp-b-schema__pfeil" aria-hidden="true">→</span>
        <MembraneSchema
          variant="kohaerent"
          label="Kohärentes Grenzflächen-Wasser"
          hint="Geordnet — die Membran ist gestützt, die Zellspannung bleibt stabiler."
          spannung="stabil"
        />
      </div>
      <div className="lp-b-mech-steps">
        {schritte.map((s) => (
          <article className="lp-b-mech-step" key={s.n}>
            <span className="lp-b-mech-step__num">{s.n}</span>
            <h3 className="lp-b-mech-step__title">{s.titel}</h3>
            <p className="lp-b-mech-step__text">{s.text}</p>
          </article>
        ))}
      </div>
      <p className="lp-b-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Wissenschaft / Der Zellversuch (in-vitro gelabelt) ───────── */
function ScienceSection() {
  const stats = [
    {
      value: '75,0 %',
      label: 'Weniger oxidativer Zellstress',
      desc: 'Die Belastung der Zellen durch oxidativen Stress sank messbar — der anerkannte Treiber der Zellalterung.',
      cite: 'Peer-review-kontrolliert · in vitro',
    },
    {
      value: '10×',
      label: 'Zell-Barrierefunktion',
      desc: 'Bessere Barriere-Integrität gestresster Zellen (TEER-Messung) unter elektromagnetischer Belastung.',
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
    <section className="lp-vp-section" data-section="lp-b-wissenschaft">
      <span className="eyebrow">Der Zellversuch</span>
      <h2>Nicht gefühlt — an lebenden Zellen gemessen.</h2>
      <p className="lp-vp-section__lede">
        Mehrere peer-review-publizierte Zellstudien (Dartsch Scientific, unabhängiges
        Labor) belegen die Wirkung der Qi-Blanco-Technologie experimentell. Alle Studien
        in vitro — messbare, reproduzierbare Effekte auf lebende Zellen. Ergänzt durch
        über 14.000 Menschen, die den QiOne<sup>®</sup> täglich tragen.
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
        dataSection="lp-b-mikroskop-video"
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

/* ───────── Skeptiker-Einwand („Physik, kein Wunder") ─────────
   Eigene Sektion (Konzept 3.3 B): den „Das ist doch Eso"-Einwand offen
   aufgreifen und ehrlich beantworten — Physik-Frame statt Wunder-Versprechen. */
function SkeptikerSection() {
  const qa = [
    {
      frage: '„Klingt nach Esoterik."',
      antwort:
        'Verstehen wir. Deshalb reden wir nicht über Energien, sondern über Grenzflächen-Wasser und Membranpotential — messbare Physik. Und wir zeigen die Labormessung, statt sie zu behaupten.',
    },
    {
      frage: '„Wo ist der Beleg?"',
      antwort:
        'In peer-review-kontrollierten Zellstudien (in vitro) an lebenden Zellkulturen — Dartsch Scientific, ein unabhängiges Labor. Reproduzierbare Effekte, kein Erfahrungsbericht.',
    },
    {
      frage: '„Warum spüre ich nichts?"',
      antwort:
        'Zellschutz ist kein Effekt, den man wie eine Kopfschmerztablette spürt. Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie bewusst wahrnimmst — deshalb bindest du dein Urteil an den Zeitraum, nicht ans Gefühl.',
    },
    {
      frage: '„Und wenn es doch nichts bringt?"',
      antwort:
        '20 Nächte risikofrei. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
  ];
  return (
    <section className="lp-vp-section lp-b-skeptiker-section" data-section="lp-b-skeptiker">
      <span className="eyebrow">Für Skeptiker</span>
      <h2>Kein Wunder. Physik — und ein Labor, das misst.</h2>
      <p className="lp-vp-section__lede">
        Gesunde Skepsis ist genau richtig. Hier sind die vier Fragen, die wir am häufigsten
        hören — offen beantwortet.
      </p>
      <div className="lp-b-skeptiker">
        {qa.map((item) => (
          <article className="lp-b-einwand" key={item.frage}>
            <h3 className="lp-b-einwand__frage">{item.frage}</h3>
            <p className="lp-b-einwand__antwort">{item.antwort}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Social Proof: Video-Erfahrungen ─────────
   CONTENT-MATCH (Christian-Regel 2026-07-11, F-003): Tag/Titel/Zitat MÜSSEN das
   tatsächlich Gesagte im Video treffen (Transkript-belegt). Diese drei Videos +
   Zitate sind wortgleich aus der bestehenden, content-match-geprüften Tiefschlaf-/
   LP-A-Strecke übernommen — deskriptive Träger-Erfahrungen, keine Zell-Kausal-
   Claims, keine erfundenen Themen. */
function LiteYt({id, title}) {
  const [laueft, setLaueft] = useState(false);
  if (laueft) {
    return (
      <div className="lp-b-yt">
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
      className="lp-b-yt"
      onClick={() => setLaueft(true)}
      aria-label={`Video abspielen: ${title}`}
    >
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="lp-b-yt__play" aria-hidden="true">
        <span>▶</span>
      </span>
    </button>
  );
}

function VideoSection() {
  const videos = [
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
    {
      tag: 'Deutscher Leichtathletik-Meister',
      title: 'Constantin Preis — getrackter Tiefschlaf',
      quote: 'Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.',
      id: 'jyLyXZqHxaw',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-b-videos">
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Menschen, die den QiOne® tragen.</h2>
      <p className="lp-vp-section__lede">
        Drei Träger, drei Geschichten — von spürbarer Stabilität im Alltag bis zum
        getrackten Tiefschlaf des Leistungssportlers. Berichte einzelner Nutzer,
        deskriptiv.
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

/* ───────── Anwendung + 20-Tage-Erlebnisfenster (Handlungs-Anker) ───────── */
function AnwendungSection() {
  const schritte = [
    {
      tag: 'Tag 1',
      titel: 'Anlegen und vergessen',
      text: 'Du trägst den QiOne® 2 Pro als Anhänger — schlicht, den ganzen Tag und die Nacht. Kein Ritual, kein Aufwand.',
    },
    {
      tag: 'Tag 1–20',
      titel: 'Dein echter Alltag',
      text: 'Arbeit, Schlaf, Sport, Familie. Das Grenzflächen-Wasser arbeitet im Hintergrund — genau dort, wo es im Labor gemessen wurde.',
    },
    {
      tag: 'Tag 20',
      titel: 'Du entscheidest',
      text: 'Nach 20 Nächten entscheidest du in Ruhe. Nicht überzeugt? Voller Kaufpreis zurück, ohne Wenn und Aber.',
    },
  ];
  return (
    <section className="lp-b-anwendung-section" data-section="lp-b-anwendung">
      <div className="lp-b-anwendung__inner">
        <figure className="lp-b-anwendung__media">
          <img src={ZELLEN_SZENE_IMG} alt="Den QiOne® als Anhänger im Alltag tragen" loading="lazy" />
        </figure>
        <div className="lp-b-anwendung__copy">
          <span className="eyebrow">So einfach ist es</span>
          <h2>20 Tage. Ein Anhänger. Dein Alltag.</h2>
          <p className="lp-b-anwendung__lede">
            Das 20-Tage-Fenster ist dein Handlungs-Anker: lange genug, um es im echten
            Leben zu tragen — kurz genug, um jetzt anzufangen.
          </p>
          <ol className="lp-b-fenster">
            {schritte.map((s) => (
              <li className="lp-b-fenster__step" key={s.tag}>
                <span className="lp-b-fenster__tag">{s.tag}</span>
                <span className="lp-b-fenster__titel">{s.titel}</span>
                <span className="lp-b-fenster__text">{s.text}</span>
              </li>
            ))}
          </ol>
          <a className="lp-vp-btn lp-vp-btn--primary" href="/pages/qione-2-pro">
            Jetzt die 20 Nächte starten
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── Garantie ───────── */
function GuaranteeSection() {
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
    <section className="lp-vp-section" data-section="lp-b-garantie">
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt es dich — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort bewusst
        wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl, sondern an den
        Zeitraum: 20 Nächte, dann entscheidest du.
      </p>
      <div className="lp-vp-benefits-grid">
        {items.map((b) => (
          <article className="lp-b-benefit" key={b.title}>
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
  // Claims kommen aus dem Claims-SSoT (fakten-basis.yaml claims[] ->
  // app/lib/claims.js, generiert) — Texte hier NIE hardcoden (Lehre Defekt 3:
  // dieselbe Aussage darf nur EINMAL leben, sonst driftet sie).
  const cards = [
    {
      p: bracelet,
      name: 'QiBracelet®',
      handle: 'qibracelet',
      tagline: claim('WM-qibracelet-zellschutz-unterwegs'),
      features: [
        claim('WM-design-elegant-luxurioes'),
        claim('WM-zellwasser-ganzer-koerper'),
        claim('WM-qibracelet-gleiche-leistung'),
      ],
      featured: false,
    },
    {
      p: qione,
      name: 'QiOne® 2 Pro',
      handle: 'qione-2-pro',
      tagline: claim('WM-qione-allrounder-tag-nacht'),
      features: [
        claim('WM-zellwasser-ganzer-koerper'),
        claim('WM-qione-tragbar-anhaenger'),
        claim('WM-design-elegant-luxurioes'),
        claim('WM-qione-bestseller'),
      ],
      featured: true,
    },
    {
      p: qihome,
      name: 'QiHome® Air',
      handle: 'qihome-air',
      tagline: claim('WM-qihome-atmosphaere-raum'),
      features: [
        claim('WM-qihome-zellschutz-raum'),
        claim('WM-qihome-staerker'),
        claim('WM-qihome-schlafzimmer-buero'),
      ],
      featured: false,
    },
  ];
  return (
    <section className="lp-b-pricing" aria-labelledby="lp-b-pricing-title" data-section="lp-b-pricing">
      <span className="eyebrow">Unsere Produkte</span>
      <h2 id="lp-b-pricing-title">Finde deinen Begleiter für kohärentes Wasser</h2>
      <div className="lp-b-pricing-grid">
        {cards.map((c) => (
          <article
            className={`lp-b-product${c.featured ? ' lp-b-product--featured' : ''}`}
            key={c.handle}
          >
            {c.featured && <span className="lp-b-product__badge">Bestseller</span>}
            <div className="lp-b-product__image">
              {c.p?.featuredImage?.url ? (
                <img src={c.p.featuredImage.url} alt={c.name} loading="lazy" />
              ) : (
                <span className="lp-b-product__ph">{c.name}</span>
              )}
            </div>
            <h3 className="lp-b-product__name">{c.name}</h3>
            <p className="lp-b-product__tagline">{c.tagline}</p>
            <div className="lp-b-product__price-row">
              <span className="lp-b-product__price">{priceOf(c.p) || '—'}</span>
              {c.featured && qioneCompare && (
                <sup className="lp-b-product__compare">{qioneCompare}</sup>
              )}
            </div>
            <ul className="lp-b-product__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`lp-vp-btn ${c.featured ? 'lp-vp-btn--primary' : 'lp-vp-btn--secondary'} lp-b-product__cta`}
              href={produktLink(c.handle, BLOCK_LP, c.featured ? 'kauf' : 'detail')}
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
    <section className="lp-b-signature" data-section="lp-b-signatur">
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="lp-b-signature__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der eigentliche Wert
        ist unsichtbar: kohärentes Wasser rund um deine Zellen, eine Membran, die besser
        gestützt ist, eine Zellspannung, die stabiler bleibt. Der Schmuck ist nur das
        Vehikel. Was du wirklich mitnimmst, ist Schutz auf der Ebene, an der alles beginnt.
      </p>
      <p className="lp-b-signature__sign">— Dein Qi Blanco® Team</p>
    </section>
  );
}

/* ───────── Final CTA ───────── */
function FinalCTA() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section className="lp-vp-final-cta" data-section="lp-b-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img src={image} alt="QiOne® 2 Pro" loading="lazy" />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-b-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-b-cta-arc" startOffset="0">
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
          <span className="eyebrow">Bereit, deine Zellen zu schützen?</span>
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
export function ZellSchutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-b3">
        <Hero />
        <ProblemSection />
        <MechanismSection />
        <ScienceSection />
        <SkeptikerSection />
        <div data-section="lp-b-google-reviews">
          <LpGoogleReviews />
        </div>
        <InfoSlider dataSection="lp-b-info-slider" />
        <div className="NormalSectionSize" data-section="lp-b-reputon-reviews">
          <ReputonWidget />
        </div>
        <VideoSection />
        <AnwendungSection />
        <GuaranteeSection />
        <PricingSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
