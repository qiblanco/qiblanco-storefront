import {createContext, useContext, useEffect, useRef} from 'react';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {THEMEN} from '~/lib/redesign3themen';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {mitStreichpreisFallback} from '~/lib/streichpreis-paritaet';
import {useGoogleRating} from '~/lib/googleRating';

/*
 * LP-V3 /pages/schlaf-zellen-schutz-v3-67a7 — Review-Artefakt im Apple/
 * Microsoft-Stil (Grossjob 20260726-lp-v3-apple-microsoft-scrollanim).
 * Aufgebaut aus der LP-V2 (92/100): INHALTE (Claims, Zahlen, Zitate, Preise)
 * stammen 1:1 aus V2/Bestand — hier wird NICHTS erfunden (Claim-Disziplin,
 * STUDIEN-FAKTENBLATT; in-vitro-Label bleiben). NEU ist die Präsentation
 * (VORBILD-ANALYSE M1–M10, Muster gelernt, nicht kopiert):
 *  M1 zentrierter Hero mit Riesen-Headline + Subline (Apple-Moment).
 *  M2 Highlights-Band: die Trust-Fakten als gestaffelte Beweis-Kacheln.
 *  M3 Mechanismus als Kapitel im alternierenden Text/Bild-Rhythmus mit
 *     SELF-BUILT Illustrationen (Pillow lokal, Shopify-CDN, 0 EUR).
 *  M4 Reveal-on-Scroll: IntersectionObserver + CSS (opacity/transform,
 *     einmalig, gestaffelt). NAHT: versteckt wird NUR unter .lp-v3--js —
 *     die Klasse setzt useRevealRoot NACH Mount. SSR/no-JS/Bots sehen die
 *     komplette Seite; prefers-reduced-motion zeigt alles sofort.
 *  M5 EIN Scrub-Moment (Bestands-ScrollScrubVideo, 320vh-Deckel).
 *  M6 Produkt-Grid mit Detailwegen auf /pages/* (MS-Muster; CTA-Schnitt
 *     bleibt der bewaehrte V2-Kaufblock — Mess-Disziplin unten).
 *  M8 durchgehend HELLE Buehne (Auftrag) — dunkel ist nur der Video-Block.
 *
 * HANDY-ANALOGIE zweifach (Auftrag „Allrounder-LP, Handy-Analogie"):
 *  (a) Praesentations-Analogie im Ebenen-Intro (ein Geraet, drei Wirkungen —
 *      wie das Smartphone viele Geraete gebündelt hat; KEIN Wirk-Claim).
 *  (b) Kopfkissen-Experiment aus dem BESTAND (TieferSchlaf/PodcastSection,
 *      Video + Zitat wortlaut-belegt, content-match; startSeconds=817).
 *
 * MESS-DISZIPLIN (qpx zählt jeden Klick im nächsten [data-section]-
 * Vorfahr): CTA-Sektionen (hero, produkte, final) enthalten ausschließlich
 * Produkt-CTAs; Aufklapper hängen in eigenen Ankern (lp-v3-garantie).
 * Ebenen-Anker-Klicks bleiben in lp-v3-ebenen (Selector, bewusst).
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen
 * Pixel — Messung hängt pfad-agnostisch im root-Layout (D-006). KEIN neuer
 * Identitaets-Key, KEINE Aenderung an TRACKING_COOKIE_NAMES; Varianten-
 * Trennung allein über url_path + Namespace lp-v3-*.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;
const themaById = (id) => THEMEN.find((t) => t.id === id);

/* Preis-Helfer identisch zu V2/LP A: EUR = netto*(1+Satz) aus markt-pricing,
   andere Waehrungen = Markets-Endbetrag. KEINE Hartpreise — SSoT Shopify. */
const waehrungVon = (p) => p?.priceRange?.minVariantPrice?.currencyCode || 'EUR';
const preisWert = (p) =>
  bruttoAnzeige(p?.priceRange?.minVariantPrice?.amount, p?.handle, waehrungVon(p));
const preisLabelVon = (p) => formatPreis(preisWert(p), waehrungVon(p));
const getCompareAtMoney = (p) => {
  const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
  return mitStreichpreisFallback(v?.compareAtPrice, p?.handle, waehrungVon(p));
};
const compareLabelVon = (p) => {
  const money = getCompareAtMoney(p);
  const n = Number.parseFloat(money?.amount);
  if (!Number.isFinite(n)) return null;
  return formatPreis(Math.round(n), money.currencyCode || waehrungVon(p));
};

/* Kuratiertes ECHTES Shooting-Foto (bilder_kuratiert.jsonl, V2-Erbe) —
   kein generiertes Gesicht (BAU-PROFIL C.13, F-006/F-007). */
const HERO_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001190-Kopie-1024x589_jpg.webp?v=1666617198';
const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/* SELF-BUILT Illustrationen (Job s02: Pillow lokal, helle Token-Palette,
   textfrei, EIN Gold-Akzent; medien-hosting cdn-publish, content-addressed).
   Abstrakte Schema-Illustrationen, ehrlich als solche beschriftet —
   KEINE Foto-Imitate (Bild-Ehrlichkeit D-013). */
const ILLU_BASIS = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
const ILLU = {
  zellen: `${ILLU_BASIS}qb-lpv3--lp-v3-ebene-zelle--007272cfb09a.png?v=1785103047`,
  esmog: `${ILLU_BASIS}qb-lpv3--lp-v3-ebene-feld--b03d091a32e6.png?v=1785103050`,
  schlaf: `${ILLU_BASIS}qb-lpv3--lp-v3-ebene-schlaf--267a6e79306d.png?v=1785103053`,
  wasser: `${ILLU_BASIS}qb-lpv3--lp-v3-wasser-ordnung--3d121925a5de.png?v=1785103056`,
};
const ILLU_ALT = {
  zellen: 'Schema-Illustration: Zelle mit geordneter Wasserschicht an der Membran',
  esmog: 'Schema-Illustration: Funkwellen treffen auf ein Gitter und werden zu ruhigen, parallelen Linien',
  schlaf: 'Schema-Illustration: eine Welle klingt zur Ruhelinie ab, darüber ein Mondbogen',
  wasser: 'Schema-Illustration: ungeordnete Wassermoleküle werden zu einem geordneten, hexagonalen Raster',
};

const KAUF_ZIEL = '/pages/qione-2-pro';

/* ───────── Scroll-Reveal (M4) ──────────────────────────────────────────────
   Setzt NACH Mount die Klasse lp-v3--js (erst ab dann versteckt CSS etwas)
   und lässt [data-reveal]-Elemente beim Viewport-Eintritt einmalig
   einfahren. reduced-motion/fehlender IO => alles sofort sichtbar. */
function useRevealRoot() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    ) {
      return undefined; // Klasse nie gesetzt -> CSS versteckt nichts
    }
    root.classList.add('lp-v3--js');
    const ziele = root.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      {threshold: 0.15, rootMargin: '0px 0px -8% 0px'},
    );
    ziele.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* Stagger-Helfer: Kachel i faehrt 90ms nach Kachel i-1 ein (Deckel 4). */
const stagger = (i) => ({'--rv-d': `${Math.min(i, 4) * 90}ms`});

/* ───────── 1 HERO (M1, ohne Reveal — LCP-Schutz) ────────────────────────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const fallback = priceAmount ? null : fallbackPreis('qione-2-pro');
  const waehrung = waehrungVon(product);
  const priceNum = priceAmount ? preisWert(product) : fallback.bruttoWert;
  const priceLabel = priceAmount ? preisLabelVon(product) : fallback.label;
  const compareLabel = compareLabelVon(product);
  const monthly = Math.ceil(priceNum / 12);
  const dreizeiler = ['Mehr Energie.', 'Tiefer schlafen.', 'Auf Zellebene stabil.'];
  return (
    <section className="v3-hero" aria-labelledby="v3-hero-title" data-section="lp-v3-hero">
      <div className="v3-hero__inner">
        <span className="v3-eyebrow">Technologie. Kein Schmuck.</span>
        <h1 id="v3-hero-title" className="v3-hero__title">
          Wirkt auf drei Ebenen.
        </h1>
        <ul className="v3-hero__dreizeiler">
          {dreizeiler.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
        <p className="v3-hero__subline">
          Dein Körper besteht zu über 70&nbsp;% aus Wasser. Der QiOne<sup>®</sup>&nbsp;2
          Pro bringt es in kohärente Ordnung — er stabilisiert deine Zellen, puffert
          eingestrahlten E-Smog ab und hilft dem Nervensystem, nachts herunterzufahren.
        </p>
        <div className="v3-hero__cta-row">
          <a className="v3-btn" data-qa="cta" href={KAUF_ZIEL}>
            Jetzt 20 Nächte risikofrei testen
          </a>
          <span className="v3-hero__preis">
            {compareLabel && <s>{compareLabel}</s>} <b>{priceLabel}</b>
            {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
          </span>
        </div>
      </div>
      <figure className="v3-hero__figur">
        <img
          src={HERO_IMG}
          alt="Frau trägt den QiOne® 2 Pro als Anhänger an einer Kette"
          width="1024"
          height="589"
          loading="eager"
        />
        <figcaption>
          QiOne<sup>®</sup>&nbsp;2 Pro — getragen, Tag und Nacht.
        </figcaption>
      </figure>
    </section>
  );
}

/* ───────── 2 HIGHLIGHTS (M2/M7: belegte Trust-Fakten als Kacheln) ───────── */
const HIGHLIGHTS = [
  {wert: '14.000+', label: 'Träger im Alltag'},
  {wert: '4 Zellstudien', label: 'peer-reviewed publiziert (in vitro)'},
  {wert: 'Made in Germany', label: 'entwickelt und gefertigt'},
  {wert: '20 Nächte', label: 'risikofrei testen — volle Erstattung'},
];

function HighlightsSection() {
  return (
    <section data-section="lp-v3-highlights" aria-label="Fakten im Überblick">
      <div className="v3-highlights">
        {HIGHLIGHTS.map((h, i) => (
          <div className="v3-highlight" data-reveal style={stagger(i)} key={h.wert}>
            <span className="v3-highlight__wert">{h.wert}</span>
            <span className="v3-highlight__label">{h.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── 3 EBENEN (Handy-Analogie (a) + typografische JTBD-Kacheln) ─────
   V2-R5 bleibt: der Klick springt in die Wirkkette DERSELBEN Seite (Anker),
   keine Ausleitung. Kacheln bewusst OHNE Bild — die Illustrationen haben
   ihren großen Moment in den Mechanismus-Kapiteln (dup-harmonie). */
const EBENEN = [
  {id: 'zellen', ebene: 'Ebene 1 · Zelle', anker: 'v3-mech-zellen'},
  {id: 'esmog', ebene: 'Ebene 2 · Feld', anker: 'v3-mech-esmog'},
  {id: 'schlaf', ebene: 'Ebene 3 · Schlaf', anker: 'v3-mech-schlaf'},
];

function EbenenSection() {
  const karten = EBENEN.map((e) => ({...e, thema: themaById(e.id)})).filter((e) => e.thema);
  return (
    <section data-section="lp-v3-ebenen">
      <div data-reveal>
        <span className="v3-eyebrow">Ein Begleiter, drei Wirkungen</span>
        <h2>Wie dein Smartphone: ein Gerät, das mehrere ersetzt.</h2>
        <p className="v3-lede">
          Dein Smartphone hat Kamera, Navi und Telefon in einem Gerät gebündelt. Der
          QiOne<sup>®</sup>&nbsp;2 Pro bündelt drei Wirkungen in einem Begleiter —
          wähle die Ebene, die dich am meisten betrifft. Du bleibst auf dieser Seite.
        </p>
      </div>
      <div className="v3-ebenen">
        {karten.map(({thema, ebene, anker}, i) => (
          <a className="v3-ebene" href={`#${anker}`} data-reveal style={stagger(i)} key={thema.id}>
            <span className="v3-ebene__nr">{ebene}</span>
            <h3>{thema.titel}</h3>
            <p className="v3-ebene__kurz">{thema.kurz}</p>
            <span className="v3-ebene__mehr">Wie das wirkt&nbsp;↓</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────── 4 MECHANISMUS (M3: Kapitel, alternierend Text/Illustration) ────
   Nutzen-Zeilen/Zahlen/Detailtexte 1:1 aus V2/THEMEN. Illustrationen =
   self-built Schemata (s02), ehrlich als Schema beschriftet. */
const NUTZEN = {
  zellen: 'Deine Zellen halten Alltagsstress besser aus.',
  esmog: 'Funkstrahlung trifft deine Zellen weniger hart.',
  schlaf: 'Dein Nervensystem darf abends leichter herunterfahren.',
};

function MechanismusSection() {
  const bloecke = EBENEN.map((e) => ({...e, thema: themaById(e.id)})).filter((e) => e.thema);
  return (
    <section data-section="lp-v3-mechanismus">
      <div data-reveal>
        <span className="v3-eyebrow">Ein Wirkprinzip</span>
        <h2>Kein Wunder. Ein Prinzip mit drei Wirkungen.</h2>
        <p className="v3-lede">
          Fast alle biologischen Prozesse laufen an wasserumhüllten Grenzflächen ab. Ist
          dieses Wasser geordnet — kohärent —, arbeiten Zellen, Membranen und Nervensystem
          ruhiger.
        </p>
      </div>
      <figure className="v3-wasser-figur" data-reveal>
        <img
          src={ILLU.wasser}
          alt={ILLU_ALT.wasser}
          width="1600"
          height="700"
          loading="lazy"
        />
        <figcaption>
          Schema: links ungeordnetes Wasser, rechts kohärent geordnet — der
          GitterChip™ gibt die Ordnung vor.
        </figcaption>
      </figure>
      <div className="v3-kapitel">
        {bloecke.map(({thema, ebene, anker}, i) => (
          <article
            className={`v3-kap${i % 2 === 1 ? ' v3-kap--tausch' : ''}`}
            id={anker}
            data-reveal
            key={thema.id}
          >
            <div className="v3-kap__text">
              <span className="v3-kap__eyebrow">{ebene}</span>
              <p className="v3-kap__nutzen">{NUTZEN[thema.id]}</p>
              <span className="v3-kap__zahl">{thema.beweisZahl}</span>
              <span className="v3-kap__zahl-label">{thema.beweisLabel}</span>
              <details>
                <summary>Wirkkette im Detail</summary>
                <p>{thema.mechanismusText}</p>
              </details>
            </div>
            <figure className="v3-kap__figur">
              <img
                src={ILLU[thema.id]}
                alt={ILLU_ALT[thema.id]}
                width="1200"
                height="675"
                loading="lazy"
              />
            </figure>
          </article>
        ))}
      </div>
      <p className="v3-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── 5 BEWEIS (V2-R3-Block 1:1, hellere Buehne) ───────────────────── */
const STATS = [
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

const STIMMEN = [
  {
    name: 'Peter Pütz',
    text: 'Die erste Nacht nach dem Anlegen des QiOne 2 Pro war ungewöhnlich. Seitdem fühlt es sich viel entspannter an. Nach dieser Erfahrung hat meine Frau nun ebenfalls einen bekommen.',
  },
  {
    name: 'Jin C.',
    text: 'Meine Schlafergebnisse sind viel besser, ich bin ausgeglichener und meine Meditationen sind tiefer. Seit Jahren bin ich am Meditieren, aber Qi Blanco hat mich nochmals auf ein anderes Level gebracht.',
  },
  {
    name: 'Meike Fuhrmann',
    text: 'Ich trage den QiOne jetzt seit einer Woche und hab bereits am ersten Tag gemerkt, dass ich mich sehr viel ruhiger und entspannter fühle. Möchte ihn auch nicht mehr ablegen.',
  },
];

function BeweisSection() {
  const rating = useGoogleRating();
  return (
    <section data-section="lp-v3-beweis">
      <div data-reveal>
        <span className="v3-eyebrow">Beweis</span>
        <h2>Nicht nur gefühlt — an Zellen gemessen.</h2>
        <p className="v3-lede">
          Vier peer-review-publizierte Zellstudien belegen die Wirkung der
          Qi-Blanco-Technologie experimentell — alle in vitro, also an lebenden
          Zellkulturen im Labor. Dazu eine deskriptive Auswertung von 171
          Erfahrungsberichten und über 14.000 Menschen, die den QiOne<sup>®</sup> täglich
          tragen.
        </p>
      </div>

      <div className="v3-stats">
        {STATS.map((s, i) => (
          <div className="v3-stat" data-reveal style={stagger(i)} key={s.label}>
            <div className="v3-stat__wert">{s.value}</div>
            <div className="v3-stat__label">{s.label}</div>
            <p className="v3-stat__desc">{s.desc}</p>
            <p className="v3-stat__cite">{s.cite}</p>
          </div>
        ))}
      </div>

      {/* Autoritaet MIT NAMEN (KH-4), bewusst ohne Portrait/erfundenes Zitat
          (F-003/F-007) — nur Belegbares: Labor, Leitung, Journale. */}
      <div className="v3-autoritaet" data-reveal>
        <h3>Geprüft von einem unabhängigen Labor</h3>
        <p className="v3-autoritaet__zitat">
          Alle Zelluntersuchungen wurden von der Dartsch Scientific GmbH unter Leitung
          von Prof. Dr. P. C. Dartsch durchgeführt — an kultivierten menschlichen und
          tierischen Zellen, mit Kontrollgruppen und mehrfach wiederholten Messreihen.
        </p>
        <p className="v3-autoritaet__quelle">
          Publiziert im Japan Journal of Medicine (2021), im Applied Cell Biology Journal
          (2021 und 2024) sowie in Neurodegenerative Diseases: Current Research (2026).
        </p>
      </div>

      <div className="v3-video-solo" data-reveal>
        <YoutubeTimestamp
          videoId="jyLyXZqHxaw"
          titel="Constantin Preis — getrackter Tiefschlaf"
          className="v3-yt"
        />
        <span className="v3-video__tag">Deutscher Leichtathletik-Meister</span>
        <h3>Constantin Preis — getrackter Tiefschlaf</h3>
        <p className="v3-video__zitat">
          „Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.“
        </p>
      </div>

      <div className="v3-bewertung" data-reveal>
        <span className="v3-bewertung__wert">{rating.komma} / 5</span>
        <span className="v3-bewertung__meta">
          Google-Gesamtbewertung aus {rating.total} Rezensionen
        </span>
      </div>
      <div className="v3-stimmen">
        {STIMMEN.map((s, i) => (
          <article className="v3-stimme" data-reveal style={stagger(i)} key={s.name}>
            <p className="v3-stimme__text">„{s.text}“</p>
            <p className="v3-stimme__name">{s.name}, Google-Rezension</p>
          </article>
        ))}
      </div>

      {/* Studien-PDFs als Mitnahme statt Behauptung (Reziprozitaet). */}
      <LpStudien headline="Nimm die Studien mit" />
    </section>
  );
}

/* ───────── 6 PRODUKTE (M6) + GARANTIE (eigener Anker, Mess-Disziplin) ───── */
function ProdukteSection() {
  const {data} = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione = findLp(data, 'qione-2-pro');
  const qihome = findLp(data, 'qihome-air');
  const qioneCompare = compareLabelVon(qione);
  const karten = [
    {
      p: bracelet,
      name: 'QiBracelet®',
      handle: 'qibracelet',
      ziel: '/pages/qibracelet',
      tagline: 'Eleganz & Schutz für unterwegs',
      features: ['GitterChip™ integriert', 'E-Smog- & 5G-Puffer', 'Drei Größen'],
      held: false,
    },
    {
      p: qione,
      name: 'QiOne® 2 Pro',
      handle: 'qione-2-pro',
      ziel: KAUF_ZIEL,
      tagline: 'Der Allrounder — Tag und Nacht',
      features: [
        'Wirkt auf allen drei Ebenen',
        'Tragbar als Anhänger',
        'Kohärente Wasserstruktur',
        'Unser Bestseller',
      ],
      held: true,
    },
    {
      p: qihome,
      name: 'QiHome® Air',
      handle: 'qihome-air',
      ziel: '/pages/qihome-air',
      tagline: 'Kohärentes Wasser für den ganzen Raum',
      features: ['E-Smog- & 5G-Raumschutz', 'Wirkt im ganzen Raum', 'Ideal fürs Schlafzimmer'],
      held: false,
    },
  ];
  return (
    <section data-section="lp-v3-produkte">
      <div data-reveal>
        <span className="v3-eyebrow">Deine Entscheidung</span>
        <h2>Finde deinen Begleiter für kohärentes Wasser.</h2>
        <p className="v3-lede">
          Drei Wege zum selben Prinzip — jede Karte führt auf die Detailseite mit
          allen Fakten, Studien und Größen.
        </p>
      </div>
      <div className="v3-preise">
        {karten.map((c, i) => (
          <article
            className={`v3-produkt${c.held ? ' v3-produkt--held' : ''}`}
            data-reveal
            style={stagger(i)}
            key={c.handle}
          >
            {c.held && <span className="v3-produkt__badge">Bestseller</span>}
            <div className="v3-produkt__bild">
              {c.p?.featuredImage?.url ? (
                <img src={c.p.featuredImage.url} alt={c.name} loading="lazy" />
              ) : (
                <img src={QIONE_FALLBACK_IMG} alt={c.name} loading="lazy" />
              )}
            </div>
            <h3 className="v3-produkt__name">{c.name}</h3>
            <p className="v3-produkt__tagline">{c.tagline}</p>
            <div>
              <span className="v3-produkt__preis">{preisLabelVon(c.p) || '—'}</span>
              {c.held && qioneCompare && (
                <s className="v3-produkt__streich">{qioneCompare}</s>
              )}
            </div>
            <ul className="v3-produkt__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`v3-btn${c.held ? '' : ' v3-btn--still'}`}
              data-qa={c.held ? 'cta' : undefined}
              href={c.ziel}
            >
              {c.held ? 'Jetzt risikofrei testen' : 'Mehr erfahren'}
            </a>
          </article>
        ))}
      </div>

      <div className="v3-garantie" data-section="lp-v3-garantie" data-reveal>
        <h3>Dein Risiko: keins</h3>
        <p className="v3-garantie__kern">
          Binde dein Urteil nicht an ein Gefühl, sondern an den Zeitraum: Trage den
          QiOne<sup>®</sup>&nbsp;2 Pro 20 Nächte in deinem echten Alltag. Bist du nicht
          überzeugt, bekommst du den vollen Kaufpreis zurück.
        </p>
        <details>
          <summary>Was genau heißt das?</summary>
          <p>
            20 Nächte, dein Alltag: keine Bedingung, keine Begründung — du schickst das
            Produkt zurück und bekommst den vollen Kaufpreis erstattet. Zahlen kannst du
            in Raten über Klarna oder PayPal mit 0&nbsp;% Finanzierung. Entwickelt und
            gefertigt in Deutschland, inklusive Käuferschutz und kostenlosem Versand.
          </p>
        </details>
      </div>

      <p className="v3-feinprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
        kostenloser Versand · Käuferschutz
      </p>
    </section>
  );
}

/* ───────── 7 MIKROSKOP (M5: Scrub 320vh — gemessener Deckel) ────────────── */
function MikroskopSection() {
  return (
    <ScrollScrubVideo
      dataSection="lp-v3-mikroskop"
      heightVhDesktop={320}
      heightVhMobile={280}
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
  );
}

/* ───────── 8 KOPFKISSEN (Handy-Analogie (b), Bestand 1:1) ─────────────────
   Video + Zitat wortlaut-belegt (content-match; TieferSchlaf/PodcastSection,
   startSeconds=817 ms-Transkript-belegt, Geldhelden EP01). */
function KopfkissenSection() {
  return (
    <section data-section="lp-v3-kopfkissen">
      <div data-reveal>
        <span className="v3-eyebrow">Der Alltags-Beweis</span>
        <h2>Das Kopfkissen-Experiment.</h2>
        <p className="v3-lede">
          Das Kopfkissen-Experiment: Was dein Handy nachts mit deinem Schlaf zu tun
          hat — Christian erzählt es im Geldhelden-Podcast. Das Video startet direkt
          an der Stelle.
        </p>
      </div>
      <div className="v3-kopfkissen__video" data-reveal>
        <YoutubeTimestamp
          videoId="BQxzbXqREWE"
          startSeconds={817}
          titel="Das Kopfkissen-Experiment: Handy und Schlaf — Christian Bauer im Geldhelden-Podcast"
          className="v3-yt"
        />
      </div>
      <blockquote className="v3-kopfkissen__zitat" data-reveal>
        <p>
          „Das schönste Praxisbeispiel: eingeschaltetes Handy unters Kopfkissen
          legen — und dann gucken, schläft man besser oder schlechter.“
        </p>
        <cite>Christian Bauer im Geldhelden-Podcast (EP 01)</cite>
      </blockquote>
    </section>
  );
}

/* ───────── 9 STIMMEN (Belohnung nach dem Hoehepunkt, V2-R4 1:1) ─────────── */
const VIDEOS = [
  {
    id: 'aG36zJKxDzg',
    tag: 'Nada & Kurt Tepperwein',
    title: 'Spürbar stabiler im Alltag',
    quote: 'So wie ich es trage und erlebe: Es stabilisiert.',
  },
  {
    id: 'zIfDQ1N60fI',
    tag: 'Erste Tage mit dem QiOne®',
    title: 'Michelle Christin Guse — „wie ein kleines Wunder“',
    quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
  },
];

function StimmenSection() {
  return (
    <section data-section="lp-v3-stimmen">
      <div data-reveal>
        <span className="v3-eyebrow">Video-Erfahrungen</span>
        <h2>Echte Menschen. Echte Erfahrungen.</h2>
        <p className="v3-lede">
          Berichte einzelner Nutzer, deskriptiv wiedergegeben — keine Heilaussage und kein
          garantiertes Ergebnis.
        </p>
      </div>
      <div className="v3-videos">
        {VIDEOS.map((v, i) => (
          <article data-reveal style={stagger(i)} key={v.id}>
            <YoutubeTimestamp videoId={v.id} titel={v.title} className="v3-yt" />
            <span className="v3-video__tag">{v.tag}</span>
            <h3>{v.title}</h3>
            <p className="v3-video__zitat">„{v.quote}“</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 10 FINAL (Apple-Finale, HELL) ────────────────────────────────── */
function FinalSection() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section data-section="lp-v3-final">
      <div className="v3-final__inner" data-reveal>
        <figure>
          <img src={image} alt="QiOne® 2 Pro" width="800" height="800" loading="lazy" />
        </figure>
        <div>
          <span className="v3-eyebrow">Bereit für alle drei Ebenen?</span>
          <h2>Gib deinem Körper 20 Nächte. Den Rest entscheidest du.</h2>
          <p>
            Trage den QiOne<sup>®</sup>&nbsp;2 Pro 20 Nächte lang. Bist du danach nicht
            überzeugt, erstatten wir dir den vollen Kaufpreis.
          </p>
          {price && (
            <div className="v3-final__preis-zeile">
              <span className="v3-final__preis">{price}</span>
              {compare && <s className="v3-final__streich">{compare}</s>}
            </div>
          )}
          <div className="v3-final__pay">
            <img src={KLARNA_IMG} alt="Klarna" width="120" height="28" loading="lazy" />
            <img src={PAYPAL_IMG} alt="PayPal" width="120" height="28" loading="lazy" />
          </div>
          <a className="v3-btn v3-btn--lg" data-qa="cta" href={KAUF_ZIEL}>
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="v3-final__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Root: zehn Sektionen, Namespace lp-v3-* ──────────────────────── */
export function SchlafZellenSchutzV3({products}) {
  const data = {products: products || []};
  const revealRef = useRevealRoot();

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-v3" ref={revealRef}>
        <Hero />
        <HighlightsSection />
        <EbenenSection />
        <MechanismusSection />
        <BeweisSection />
        <ProdukteSection />
        <MikroskopSection />
        <KopfkissenSection />
        <StimmenSection />
        <FinalSection />
      </div>
    </LiveDataCtx.Provider>
  );
}
