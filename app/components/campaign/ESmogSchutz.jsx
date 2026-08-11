import {createContext, useContext} from 'react';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {mitStreichpreisFallback} from '~/lib/streichpreis-paritaet';

/*
 * Landingpage /pages/E-Smog-Schutz — E-SMOG „Die unsichtbare Dauerbelastung,
 * ruhig erklaert".
 *
 * LP D der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 D):
 * NEUE Campaign-Route fuer die E-Smog-/Strahlungs-Ad-Strecke — heute ohne Ziel,
 * die Luecke, die die Perspektiven-Rotation erst sinnvoll macht. Ab jetzt ist der
 * interne Anker der LP A (/pages/schlaf-zellen-schutz -> E-Smog) nicht mehr tot.
 *
 * Dramaturgie (11-Sektionen-Tiefschlaf-Skelett + D-Schwerpunkte, Konzept 3.3 D):
 * Hero (die unsichtbare Dauerbelastung, ruhig) -> Alltags-Realitaet (Handy am Ohr,
 * WLAN im Schlafzimmer, Homeoffice — SHOW IT, KEIN Alarm-Rot, ruhiger Luxus statt
 * Angst) -> Wirkmechanismus MIT Schema-Grafik (was EM-Last mit dem Grenzflaechen-
 * Wasser macht + wie kohaerentes Wasser als Puffer wirkt, SHOW IT) -> Wissenschaft/
 * Laborevidenz (Barriere-Stabilitaet unter elektromagnetischer Last, in vitro) ->
 * Skeptiker-Frame („Ich dachte, das ist Eso") als eigene Sektion -> Social Proof ->
 * Video-Erfahrungen -> Alltags-Integration + 20-Tage-Erlebnisfenster -> Garantie ->
 * Pricing -> QB-Signatur -> Final CTA.
 *
 * DESIGN: uebernimmt das 93/100-Token-System der LP A/B (styles/esmog-schutz.css,
 * Scope .lp-d3). EIN Gold-Akzent (#c9a14b), warmes Neutral-Kontinuum, Beweis vor
 * Behauptung. BEWUSST KEIN Alarm-Rot/Angst-Aesthetik (Konzept 3.3 D: ruhiger Luxus).
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel —
 * die R1/R2/R3-Kette haengt pfad-agnostisch im root-Layout (D-006, keine
 * Doppelzaehlung).
 *
 * CLAIM-DISZIPLIN: E-Smog/EMF ist rechtlich sensibel. Der Mechanismus wird als
 * Physik/Grenzforschung erklaert, NICHT als Heilaussage; Laborzahlen sind in-vitro
 * gelabelt (Beweis-Zahlen aus dem Bestand: Tiefschlaf/LP-B-ScienceSection — hier
 * wird NICHTS Neues erfunden). Erfahrungsberichte deskriptiv (kein EMF-Kausal-
 * Claim, content-match-geprueft, F-003); Geld-zurueck an Zeitraum + Ueberzeugung
 * gebunden, NIE ans Spueren (Spuer-Regel).
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
// ECHTES Shooting-Foto (Shopify-CDN) — ruhiger Alltag, kein KI-Motiv, kein
// Alarm-Frame (Bild-Ehrlichkeits-Lehre homepage-bauer D-013; Konzept 3.3 D
// „ruhiger Luxus statt Alarm-Rot"). Produktidentitaet gegen
// bildmaterial/_db/bilder.jsonl verifiziert: QiOne2Pro-Anhaenger an duenner
// Kette getragen, Homeoffice-Szene am Laptop — das alt behauptet den QiOne,
// das Bild MUSS ihn zeigen (F-006-Klasse, bild-guard-Befund 2026-07-14).
const ALLTAG_SZENE_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-05984.webp?v=1738529250';

/* ───────── Hero (die unsichtbare Dauerbelastung, ruhig) ───────── */
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
      className="lp-d-hero"
      aria-labelledby="lp-d-hero-title"
      data-section="lp-d-hero"
    >
      <div className="lp-d-hero__inner">
        <div className="lp-d-hero__copy">
          <span className="lp-d-hero__eyebrow">Handy, WLAN, Homeoffice — der Alltag strahlt</span>
          <h1 id="lp-d-hero-title" className="lp-d-hero__title">
            E-Smog ist unsichtbar. Deine Ruhe muss ihm nicht ausgeliefert sein.
          </h1>
          <p className="lp-d-hero__subline">
            Elektromagnetische Felder umgeben uns rund um die Uhr — Handy am Ohr, WLAN
            im Schlafzimmer, das ganze Homeoffice. Kein Grund zur Panik, aber ein guter
            Grund, hinzuschauen. Der QiOne<sup>®</sup>&nbsp;2 Pro bringt das Wasser rund
            um deine Zellen in kohärente Ordnung — als ruhiger Puffer, den du einfach
            trägst. In peer-review-kontrollierten Zellstudien (in&nbsp;vitro) hielt die
            Zell-Barriere unter elektromagnetischer Last bis zu <strong>10×</strong>{' '}
            besser stand.
          </p>
          <div className="lp-d-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/pages/qione-2-pro">
              Jetzt 20 Nächte risikofrei testen
            </a>
            <span className="lp-d-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel}
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
            </span>
          </div>
          <ul className="lp-d-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <figure className="lp-d-hero__visual">
          <img
            src={heroImg}
            alt="QiOne® 2 Pro — kohärentes Wasser als ruhiger Puffer im Alltag"
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

/* ───────── Alltags-Realitaet (SHOW IT, KEIN Alarm-Rot) ─────────
   Konzept 3.3 D: die Alltags-Quellen ruhig zeigen (Handy am Ohr, WLAN im
   Schlafzimmer, Homeoffice) — ruhiger Luxus statt Warntafel. Faktisch, ohne
   Angst-Rhetorik: Geraete senden EM-Felder, das ist unstrittig; die Frage ist,
   wie man gelassen damit umgeht. */
function ProblemSection() {
  const quellen = [
    {
      tag: 'Am Ohr',
      titel: 'Das Handy',
      text: 'Stunden am Tag direkt am Kopf, dazu ständig in der Hosentasche. Der häufigste, nächste EM-Sender in deinem Leben.',
    },
    {
      tag: 'Im Schlafzimmer',
      titel: 'Der WLAN-Router',
      text: 'Funkt rund um die Uhr, oft die ganze Nacht — genau dort, wo dein Körper eigentlich regenerieren soll.',
    },
    {
      tag: 'Den ganzen Tag',
      titel: 'Das Homeoffice',
      text: 'Laptop, Bildschirme, Docking-Station, Bluetooth-Kopfhörer. Acht Stunden im Feld, ohne es zu merken.',
    },
  ];
  return (
    <section className="lp-vp-section lp-d-problem-section" data-section="lp-d-problem">
      <span className="eyebrow">Die Alltags-Realität</span>
      <h2>Du lebst mitten im Feld — meist, ohne es zu merken.</h2>
      <p className="lp-vp-section__lede">
        E-Smog ist kein Weltuntergang und keine Verschwörung. Er ist einfach die
        Summe der elektromagnetischen Felder, in denen wir heute leben. Wir zeigen
        dir nüchtern, wo sie herkommen — und danach, was du in Ruhe dagegen tun kannst.
      </p>
      <div className="lp-d-quellen">
        {quellen.map((q) => (
          <article className="lp-d-quelle" key={q.titel}>
            <span className="lp-d-quelle__tag">{q.tag}</span>
            <h3 className="lp-d-quelle__titel">{q.titel}</h3>
            <p className="lp-d-quelle__text">{q.text}</p>
          </article>
        ))}
      </div>
      <p className="lp-d-note">
        Kein Alarm, keine Angst: Diese Geräte gehören zum Leben und bleiben. Es geht
        nicht ums Abschaffen, sondern um einen ruhigen Ausgleich — eine Ebene tiefer,
        am Wasser rund um deine Zellen.
      </p>
    </section>
  );
}

/* ───────── Wirkmechanismus + Schema-Grafik (SHOW IT) ─────────
   Nordstern: konkret ERKLAEREN, WO und WIE kohaerentes Wasser wirkt. Das Schema
   zeigt zwei Zustaende des Grenzflaechen-Wassers an der Zellmembran (unter EM-Last
   gestoert vs. kohaerent gepuffert) samt Zellspannung — SHOW IT statt Claim-Plakat. */
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
    <figure className={`lp-d-schema__panel${gestoert ? ' lp-d-schema__panel--gestoert' : ''}`}>
      <svg viewBox="0 0 210 150" role="img" aria-label={`${label}: ${hint}`}>
        {/* Wasser-Zone (Grenzflaeche) */}
        <rect x="0" y="0" width="210" height="96" className="lp-d-schema__wasser" />
        {molekuele.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r="5"
            className="lp-d-schema__mol"
          />
        ))}
        {/* Zellmembran (Lipid-Doppelschicht, schematisch) */}
        <rect x="0" y="96" width="210" height="7" className="lp-d-schema__membran" />
        <rect x="0" y="115" width="210" height="7" className="lp-d-schema__membran" />
        {/* Zellinneres */}
        <rect x="0" y="122" width="210" height="28" className="lp-d-schema__zelle" />
        {/* Zellspannung-Marke */}
        <text x="105" y="140" className="lp-d-schema__span" textAnchor="middle">
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
      titel: 'Unter EM-Last puffern',
      text: 'Geordnetes Grenzflächen-Wasser stützt die Lipid-Doppelschicht der Membran. In vitro hielt die Barrierefunktion unter elektromagnetischer Belastung bis zu 10× besser stand (TEER-Messung).',
    },
    {
      n: '3',
      titel: 'Zellspannung halten',
      text: 'Eine stabile Membran hält ihr Membranpotential — die „Zellspannung" — leichter aufrecht. Das ist die messbare Grundlage, nicht ein Gefühl.',
    },
  ];
  return (
    <section className="lp-vp-section lp-d-mech-section" data-section="lp-d-mechanismus">
      <span className="eyebrow">Der Mechanismus</span>
      <h2>Was E-Smog am Wasser tut — und wie Ordnung dagegen puffert.</h2>
      <p className="lp-vp-section__lede">
        Wir verkaufen dir keine Angst und kein Wunder, sondern eine nachvollziehbare
        Wirkkette. Das Schema zeigt, was den Unterschied macht: die Ordnung des Wassers
        direkt an der Zellmembran — auch dann, wenn ein elektromagnetisches Feld daran zerrt.
      </p>
      <div className="lp-d-schema" aria-hidden="false">
        <MembraneSchema
          variant="gestoert"
          label="Grenzflächen-Wasser unter EM-Last"
          hint="Unruhig, ungeordnet — die Membran wird schlechter gestützt, die Zellspannung schwankt."
          spannung="instabil"
        />
        <span className="lp-d-schema__pfeil" aria-hidden="true">→</span>
        <MembraneSchema
          variant="kohaerent"
          label="Kohärentes Grenzflächen-Wasser"
          hint="Geordnet und gepuffert — die Membran ist gestützt, die Zellspannung bleibt stabiler."
          spannung="stabil"
        />
      </div>
      <div className="lp-d-mech-steps">
        {schritte.map((s) => (
          <article className="lp-d-mech-step" key={s.n}>
            <span className="lp-d-mech-step__num">{s.n}</span>
            <h3 className="lp-d-mech-step__title">{s.titel}</h3>
            <p className="lp-d-mech-step__text">{s.text}</p>
          </article>
        ))}
      </div>
      <p className="lp-d-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage und kein Schutzversprechen gegen Strahlung.
      </p>
    </section>
  );
}

/* ───────── Wissenschaft / Labor unter EM-Last (in-vitro gelabelt) ───────── */
function ScienceSection() {
  const stats = [
    {
      value: '10×',
      label: 'Zell-Barriere unter EM-Last',
      desc: 'Bessere Barriere-Integrität gestresster Zellen (TEER-Messung) unter elektromagnetischer Belastung — der für E-Smog relevanteste Laborbefund.',
      cite: 'Applied Cell Biology, 2021 · in vitro',
    },
    {
      value: '75,0 %',
      label: 'Weniger oxidativer Zellstress',
      desc: 'Die Belastung der Zellen durch oxidativen Stress sank messbar — ein anerkannter Treiber der Zellalterung.',
      cite: 'Peer-review-kontrolliert · in vitro',
    },
    {
      value: '5 / 5',
      label: 'Zelltypen geschützt',
      desc: 'Weniger oxidativer Stress in fünf verschiedenen Zelltypen — von Leber bis Lunge.',
      cite: 'Applied Cell Biology, 2024 · in vitro',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-d-wissenschaft">
      <span className="eyebrow">Im Labor gemessen</span>
      <h2>Nicht gefühlt — an lebenden Zellen unter EM-Last gemessen.</h2>
      <p className="lp-vp-section__lede">
        Mehrere peer-review-publizierte Zellstudien (Dartsch Scientific, unabhängiges
        Labor) belegen die Wirkung der Qi-Blanco-Technologie experimentell. Alle Studien
        in vitro — messbare, reproduzierbare Effekte auf lebende Zellen, teils gezielt
        unter elektromagnetischer Belastung. Ergänzt durch über 14.000 Menschen, die den
        QiOne<sup>®</sup> täglich tragen.
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
        dataSection="lp-d-mikroskop-video"
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
            text: 'Dieselben Zellen halten ihre Barrierefunktion unter Mobilfunk-Stress messbar besser aufrecht (TEER-Messung, in vitro).',
          },
        ]}
        fussnote="Gegenüberstellung aus den in-vitro-Zellstudien unter elektromagnetischer Last — kein Erfahrungsbericht, keine Heilaussage."
      />
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── Skeptiker-Einwand („Ich dachte, das ist Eso") ─────────
   Eigene Sektion (Konzept 3.3 D, US-Top-Format): den „Das ist doch Eso"-Einwand
   offen aufgreifen und ehrlich beantworten — Physik-Frame statt Wunder. */
function SkeptikerSection() {
  const qa = [
    {
      frage: '„Ich dachte, E-Smog-Schutz ist Eso."',
      antwort:
        'Ging uns ähnlich. Deshalb reden wir nicht über Strahlen-Angst oder Energien, sondern über Grenzflächen-Wasser und Membranpotential — messbare Physik. Und wir zeigen die Labormessung unter EM-Last, statt sie zu behaupten.',
    },
    {
      frage: '„Ist E-Smog überhaupt ein echtes Problem?"',
      antwort:
        'Wir machen keine Panik: Wie stark alltägliche Felder wirken, ist wissenschaftlich nicht abschließend geklärt. Unser Punkt ist bescheidener — im Labor hielt die Zell-Barriere unter EM-Last mit kohärentem Wasser messbar besser stand. Mehr behaupten wir nicht.',
    },
    {
      frage: '„Warum spüre ich nichts?"',
      antwort:
        'Ein Puffer auf Zellebene ist kein Effekt, den man wie eine Kopfschmerztablette spürt. Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie bewusst wahrnimmst — deshalb bindest du dein Urteil an den Zeitraum, nicht ans Gefühl.',
    },
    {
      frage: '„Und wenn es doch nichts bringt?"',
      antwort:
        '20 Nächte risikofrei. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
  ];
  return (
    <section className="lp-vp-section lp-d-skeptiker-section" data-section="lp-d-skeptiker">
      <span className="eyebrow">Für Skeptiker</span>
      <h2>Kein Wunder, keine Panik. Physik — und ein Labor, das misst.</h2>
      <p className="lp-vp-section__lede">
        Gesunde Skepsis ist bei diesem Thema genau richtig. Hier sind die vier Fragen, die
        wir am häufigsten hören — offen beantwortet.
      </p>
      <div className="lp-d-skeptiker">
        {qa.map((item) => (
          <article className="lp-d-einwand" key={item.frage}>
            <h3 className="lp-d-einwand__frage">{item.frage}</h3>
            <p className="lp-d-einwand__antwort">{item.antwort}</p>
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
   LP-A/B-Strecke übernommen — deskriptive Träger-Erfahrungen, KEINE E-Smog-Kausal-
   Claims, keine erfundenen Themen.
   Stilles YouTube-Poster: seit YT-THUMB-MAXRES (2026-07-21, GL-DES-0009) der
   gemeinsame Baustein YoutubeTimestamp im Seiten-Kleid lp-d-yt (maxres-Kette). */

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
    <section className="lp-vp-section" data-section="lp-d-videos">
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
            <YoutubeTimestamp videoId={v.id} titel={v.title} className="lp-d-yt" />
            <span className="lp-vp-video__tag">{v.tag}</span>
            <h3 className="lp-vp-video__title">{v.title}</h3>
            <p className="lp-vp-video__quote">{v.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Alltags-Integration + 20-Tage-Erlebnisfenster (Handlungs-Anker) ─────────
   Konzept 3.3 D: „Alltags-Integration (Traeger-Geschichten)" — genau die Szenen aus
   dem Problem-Block, jetzt als gelassener Umgang statt als Bedrohung. */
function AnwendungSection() {
  const schritte = [
    {
      tag: 'Am Handy',
      titel: 'Trägst du ihn einfach mit',
      text: 'Der QiOne® 2 Pro ist als Anhänger dabei — unterwegs, im Call, in der Hosentasche. Kein Ritual, kein Aufwand.',
    },
    {
      tag: 'Im Schlafzimmer',
      titel: 'Bringt Ruhe an den Ort der Regeneration',
      text: 'Genau dort, wo der Router die Nacht durchfunkt, arbeitet das kohärente Wasser im Hintergrund — die ganze Nacht.',
    },
    {
      tag: 'Nach 20 Tagen',
      titel: 'Entscheidest du',
      text: 'Arbeit, Schlaf, Homeoffice, Familie — 20 Nächte im echten Alltag. Nicht überzeugt? Voller Kaufpreis zurück, ohne Wenn und Aber.',
    },
  ];
  return (
    <section className="lp-d-anwendung-section" data-section="lp-d-anwendung">
      <div className="lp-d-anwendung__inner">
        <figure className="lp-d-anwendung__media">
          <img src={ALLTAG_SZENE_IMG} alt="Gelassen im Alltag — den QiOne® einfach tragen" loading="lazy" />
        </figure>
        <div className="lp-d-anwendung__copy">
          <span className="eyebrow">So einfach ist es</span>
          <h2>20 Tage. Ein Anhänger. Dein ganz normaler Alltag.</h2>
          <p className="lp-d-anwendung__lede">
            Das 20-Tage-Fenster ist dein Handlungs-Anker: lange genug, um es im echten
            Leben zu tragen — kurz genug, um jetzt anzufangen. Ohne dein Handy, dein WLAN
            oder dein Homeoffice ändern zu müssen.
          </p>
          <ol className="lp-d-fenster">
            {schritte.map((s) => (
              <li className="lp-d-fenster__step" key={s.tag}>
                <span className="lp-d-fenster__tag">{s.tag}</span>
                <span className="lp-d-fenster__titel">{s.titel}</span>
                <span className="lp-d-fenster__text">{s.text}</span>
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
    <section className="lp-vp-section" data-section="lp-d-garantie">
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt es dich — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort bewusst
        wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl, sondern an den
        Zeitraum: 20 Nächte, dann entscheidest du.
      </p>
      <div className="lp-vp-benefits-grid">
        {items.map((b) => (
          <article className="lp-d-benefit" key={b.title}>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
            <p className="lp-vp-benefit__body">{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Pricing (Live-Preise, QiOne 2 Pro als Held) ─────────
   E-Smog-Framing: QiHome Air fuers Schlafzimmer/WLAN, QiBracelet fuer unterwegs
   am Handy, QiOne 2 Pro als Allrounder Tag & Nacht. */
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
      tagline: 'Ruhiger Puffer für unterwegs',
      features: ['Eleganter GitterChip™ integriert', 'Kohärentes Wasser am Handgelenk', 'Dabei, wo das Handy ist'],
      featured: false,
    },
    {
      p: qione,
      name: 'QiOne® 2 Pro',
      handle: 'qione-2-pro',
      tagline: 'Der Allrounder — Tag und Nacht',
      features: [
        // Claim-Fix 20260718: „Stärkster GitterChip im Sortiment" ist unbelegt
        // (alle Produkte tragen denselben Gitterchip; Stärke-Ranking =
        // Christian/Legal-Gate, HARDWARE_ENTSCHEIDUNGSHILFE_V1) — ersetzt
        // durch das belegte Material-Merkmal.
        'GitterChip™ aus 750er Goldlegierung, von Hand veredelt',
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
      tagline: 'Für Schlafzimmer & Homeoffice',
      features: ['Kohärentes Wasser im ganzen Raum', 'Ideal neben Router & Schreibtisch', 'Ruhe fürs Schlafzimmer'],
      featured: false,
    },
  ];
  return (
    <section className="lp-d-pricing" aria-labelledby="lp-d-pricing-title" data-section="lp-d-pricing">
      <span className="eyebrow">Unsere Produkte</span>
      <h2 id="lp-d-pricing-title">Finde deinen Begleiter für kohärentes Wasser</h2>
      <div className="lp-d-pricing-grid">
        {cards.map((c) => (
          <article
            className={`lp-d-product${c.featured ? ' lp-d-product--featured' : ''}`}
            key={c.handle}
          >
            {c.featured && <span className="lp-d-product__badge">Bestseller</span>}
            <div className="lp-d-product__image">
              {c.p?.featuredImage?.url ? (
                <img src={c.p.featuredImage.url} alt={c.name} loading="lazy" />
              ) : (
                <span className="lp-d-product__ph">{c.name}</span>
              )}
            </div>
            <h3 className="lp-d-product__name">{c.name}</h3>
            <p className="lp-d-product__tagline">{c.tagline}</p>
            <div className="lp-d-product__price-row">
              <span className="lp-d-product__price">{priceOf(c.p) || '—'}</span>
              {c.featured && qioneCompare && (
                <sup className="lp-d-product__compare">{qioneCompare}</sup>
              )}
            </div>
            <ul className="lp-d-product__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`lp-vp-btn ${c.featured ? 'lp-vp-btn--primary' : 'lp-vp-btn--secondary'} lp-d-product__cta`}
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
    <section className="lp-d-signature" data-section="lp-d-signatur">
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keine Angst.</h2>
      <p className="lp-d-signature__body">
        Über E-Smog lässt sich viel Panik machen — wir machen keine. Der QiOne<sup>®</sup>{' '}
        ist schön, aber das ist nicht der Punkt. Der eigentliche Wert ist unsichtbar:
        kohärentes Wasser rund um deine Zellen, ein ruhiger Puffer, der einfach mitläuft,
        während du dein Handy, dein WLAN und dein Homeoffice ganz normal weiter nutzt. Der
        Schmuck ist nur das Vehikel. Was du wirklich mitnimmst, ist Gelassenheit.
      </p>
      <p className="lp-d-signature__sign">— Dein Qi Blanco® Team</p>
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
    <section className="lp-vp-final-cta" data-section="lp-d-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img src={image} alt="QiOne® 2 Pro" loading="lazy" />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-d-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-d-cta-arc" startOffset="0">
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
          <span className="eyebrow">Bereit für etwas mehr Ruhe im Feld?</span>
          <h2>Gib deinem Körper 20 Nächte. Den Rest entscheidest du.</h2>
          <p className="lp-vp-final-cta__lede">
            Trage den QiOne® 2 Pro 20 Nächte lang durch deinen ganz normalen Alltag. Bist
            du danach nicht überzeugt, erstatten wir dir den vollen Kaufpreis. Ohne Wenn und
            Aber.
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
export function ESmogSchutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-d3">
        <Hero />
        <ProblemSection />
        <MechanismSection />
        {/* Produkt-Demo direkt NACH dem Erklaer-Block (SKILL-SCROLL-
            ANIMATIONEN-Heuristik): der Blick ins Innere des QiOne 2 Pro.
            Christians „GitterChip scroll down" war auf den LPs nie eingebaut
            (kein IA-Regress; Read-First-Beleg 20260718) — hier ergaenzt. */}
        <GitterchipMoleculesScrub dataSection="lp-d-gitterchip-video" />
        <ScienceSection />
        <SkeptikerSection />
        <div data-section="lp-d-google-reviews">
          <LpGoogleReviews />
        </div>
        <InfoSlider dataSection="lp-d-info-slider" />
        <div className="NormalSectionSize" data-section="lp-d-reputon-reviews">
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
