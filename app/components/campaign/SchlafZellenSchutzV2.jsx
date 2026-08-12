import {createContext, useContext} from 'react';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {THEMEN} from '~/lib/redesign3themen';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {mitStreichpreisFallback} from '~/lib/streichpreis-paritaet';
import {useGoogleRating} from '~/lib/googleRating';

/*
 * LP-V2 /pages/schlaf-zellen-schutz-v2-18ef — Variante B des A/B-Tests gegen
 * LP A (Grossjob 20260726-scoring-standortbestimmung-lp-v2-psychobuild, s07
 * nach Konzept §A). LP A bleibt BYTE-UNVERAENDERT — das ist die Kontrolle.
 *
 * WAS V2 ANDERS MACHT (jede Aenderung mit Evidenz-Anker aus s02–s05):
 *  R1 KUERZEN 14 -> 9 Sektionen. Auf LP A erreichen 7 von 14 Sektionen nur
 *     5–10 % der Besucher (Klasse A). Alles, was verkauft, muss nach oben.
 *  R2 KAUF-MATERIAL VOR DEN KLIFF. Auf LP A steht der Preis auf Position 12
 *     und wird von 8,5 % gesehen; hier ist er Position 5 (~37 % erwartet).
 *  R3 DREI SOCIAL-PROOF-WIDGETS -> EIN kuratierter Beweisblock. Die Widgets
 *     trugen auf LP A 1,0 % Interaktion bei n = 791 — und zugleich die halbe
 *     Design-Schuld (zweiter Goldton, Fremd-Skripte, z-index-Hack).
 *  R4 KLIFF ZWEIGLEISIG: Scrub-Strecke auf 320vh gekappt (Durchleitung am
 *     Mikroskop-Ausgang war 33,9 % = schlechtester Uebergang der Seite) UND
 *     die Belohnung (Video-Stimmen) direkt dahinter statt der schwaechsten Zone.
 *  R5 INLINE-TIEFE STATT AUSLEITUNG: die Themen-Auswahl springt in die
 *     Wirkkette derselben Seite, statt auf Themen-LPs auszuleiten (die
 *     verhungern: 230/46/27 Besuche bei 1,3–2,0 % Eigenklick).
 *
 * MESS-DISZIPLIN (qpx zählt JEDEN Klick im nächsten [data-section]-Vorfahr,
 * public/qiblanco-qpx.js Z. 376-380): Sektionen, die in die Zwischen-Conversion
 * eingehen (hero, kaufblock, haltung, final), enthalten ausschließlich
 * Produkt-CTAs. Aufklapper sitzen in eigenen, verschachtelten data-section-
 * Ankern (lp-v2-garantie) — sonst haette jeder Aufklapp-Klick die V2-Rate
 * gegen LP A nach oben verzerrt, ohne dass ein Produkt-Klick mehr passiert.
 *
 * CLAIM-DISZIPLIN: Zellstudien-Zahlen in-vitro gelabelt, Erfahrungsberichte
 * deskriptiv, Geld-zurück an den ZEITRAUM gebunden (nie ans Spüren).
 * Alle Zahlen/Texte stammen aus dem Bestand (THEMEN, LP A) bzw. dem
 * STUDIEN-FAKTENBLATT — hier wird NICHTS erfunden. Insbesondere bleiben die
 * zwei Evidenz-Kategorien getrennt: VIER Zellstudien (e0001/2/3/5, in vitro)
 * und EINE Kundenerfahrungs-Auswertung (e0004, 171 Berichte, deskriptiv).
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel —
 * die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (D-006).
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;
const themaById = (id) => THEMEN.find((t) => t.id === id);

// Preis-Helfer identisch zu LP A (Auftrag 20260718-lp-preise-dynamisch-binden-
// gestuft): EUR = netto*(1+Satz) aus markt-pricing, andere Waehrungen =
// Markets-Endbetrag. KEINE Hartpreise — Preis-SSoT ist Shopify.
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

// Kuratiertes ECHTES Shooting-Foto (bilder_kuratiert.jsonl: „QiOne2Pro-Anhaenger
// an Kette am Hals der Frau, klar erkennbar", visuell verifiziert 2026-07-14).
// Deckt die GELB-Luecke im Hero mit einem echten Menschen — kein generiertes
// Gesicht (BAU-PROFIL C.13, FEHLER-DB F-006/F-007).
const HERO_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001190-Kopie-1024x589_jpg.webp?v=1666617198';
const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

const KAUF_ZIEL = '/pages/qione-2-pro';

/* ───────── 1 HERO ─────────────────────────────────────────────────────────
   Eyebrow „Technologie. Kein Schmuck." = woertlicher Match zur staerksten
   DACH-Ad (Unternehmer-Hook 2, beste Kontaktqualitaet: 26 % aufmerksam).
   Dreizeiler mit „Mehr Energie." ZUERST — s02-Mismatch 1: der häufigste
   Ad-Nutzen stand auf LP A gar nicht im Sichtfeld. E-Smog wandert in die
   Subline. Preis + Raten stehen ab Position 1 (R2). */
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
  const trust = [
    '14.000+ Träger',
    '4 Zellstudien, peer-reviewed',
    'Made in Germany',
    '20 Nächte risikofrei',
  ];
  return (
    <section className="v2-hero" aria-labelledby="v2-hero-title" data-section="lp-v2-hero">
      <div className="v2-hero__inner">
        <div>
          <span className="v2-hero__eyebrow">Technologie. Kein Schmuck.</span>
          <h1 id="v2-hero-title" className="v2-hero__title">
            Wirkt auf drei Ebenen.
          </h1>
          <ul className="v2-hero__dreizeiler">
            {dreizeiler.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
          <p className="v2-hero__subline">
            Dein Körper besteht zu über 70&nbsp;% aus Wasser. Der QiOne<sup>®</sup>&nbsp;2
            Pro bringt es in kohärente Ordnung — er stabilisiert deine Zellen, puffert
            eingestrahlten E-Smog ab und hilft dem Nervensystem, nachts herunterzufahren.
            In Zellstudien gemessen, von 14.000+ Trägern getragen.
          </p>
          <div className="v2-hero__cta-row">
            <a className="v2-btn" data-qa="cta" href={KAUF_ZIEL}>
              Jetzt 20 Nächte risikofrei testen
            </a>
            <span className="v2-hero__preis">
              {compareLabel && <s>{compareLabel}</s>} <b>{priceLabel}</b>
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
            </span>
          </div>
          <ul className="v2-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <figure>
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
      </div>
    </section>
  );
}

/* ───────── 2 EBENEN (JTBD-Selector, R5: inline statt ausleiten) ───────────
   Beste Durchleitung der ganzen Seite (86,5 % bei n = 703) — deshalb bleibt
   das Drei-Themen-Band, aber der Klick führt NICHT mehr auf eine Themen-LP,
   sondern in die Wirkkette derselben Seite (Anker). Micro-Commitment
   (Cialdini Konsistenz) + trennscharfes Feature für den s03-Recluster. */
const EBENEN = [
  {id: 'zellen', ebene: 'Ebene 1 · Zelle', anker: 'v2-mech-zellen'},
  {id: 'esmog', ebene: 'Ebene 2 · Feld', anker: 'v2-mech-esmog'},
  {id: 'schlaf', ebene: 'Ebene 3 · Schlaf', anker: 'v2-mech-schlaf'},
];

function EbenenSection() {
  const karten = EBENEN.map((e) => ({...e, thema: themaById(e.id)})).filter((e) => e.thema);
  return (
    <section data-section="lp-v2-ebenen">
      <span className="v2-eyebrow">Drei Ebenen</span>
      <h2>Was betrifft dich gerade am meisten?</h2>
      <p className="v2-lede">
        Ein Wirkprinzip, drei Wirkungen. Wähle die Ebene, die dich am meisten betrifft —
        du bleibst dabei auf dieser Seite.
      </p>
      <div className="v2-ebenen">
        {karten.map(({thema, ebene, anker}) => (
          <article className="v2-ebene" key={thema.id}>
            <figure className="v2-ebene__figur">
              <img src={thema.bild} alt={thema.alt} width="800" height="450" loading="lazy" />
            </figure>
            <div className="v2-ebene__body">
              <h3>{thema.titel}</h3>
              <p className="v2-ebene__kurz">{thema.kurz}</p>
              <a className="v2-btn v2-btn--still" href={`#${anker}`}>
                Wie das wirkt
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 3 MECHANISMUS (LP-A-`intro` eingeschmolzen) ────────────────────
   Eisenberg-Layering: je Ebene ZUERST eine Nutzen-Zeile (Skim-Layer, ROT),
   darunter die Beweiszahl (BLAU), Details erst auf Klick. Auf LP A war die
   `intro`-Sektion 6,7 s lang, hatte kein Klickziel und verlor 32 %.
   Nutzen-Zeilen sind Kurzform der Bestands-Mechanismen, Zahlen unveraendert
   aus THEMEN (redesign3themen.js). */
const NUTZEN = {
  zellen: 'Deine Zellen halten Alltagsstress besser aus.',
  esmog: 'Funkstrahlung trifft deine Zellen weniger hart.',
  schlaf: 'Dein Nervensystem darf abends leichter herunterfahren.',
};

function MechanismusSection() {
  const bloecke = EBENEN.map((e) => ({...e, thema: themaById(e.id)})).filter((e) => e.thema);
  return (
    <section data-section="lp-v2-mechanismus">
      <span className="v2-eyebrow">Ein Wirkprinzip</span>
      <h2>Kein Wunder. Ein Prinzip mit drei Wirkungen.</h2>
      <p className="v2-lede">
        Fast alle biologischen Prozesse laufen an wasserumhüllten Grenzflächen ab. Ist
        dieses Wasser geordnet — kohärent —, arbeiten Zellen, Membranen und Nervensystem
        ruhiger.
      </p>
      <div className="v2-mechs">
        {bloecke.map(({thema, ebene, anker}) => (
          <article className="v2-mech" id={anker} key={thema.id}>
            <span className="v2-eyebrow" style={{textAlign: 'left'}}>
              {ebene}
            </span>
            <p className="v2-mech__nutzen">{NUTZEN[thema.id]}</p>
            <span className="v2-mech__zahl">{thema.beweisZahl}</span>
            <span className="v2-mech__zahl-label">{thema.beweisLabel}</span>
            <details>
              <summary>Wirkkette im Detail</summary>
              <p>{thema.mechanismusText}</p>
            </details>
          </article>
        ))}
      </div>
      <p className="v2-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── 4 BEWEIS (R3: aus drei Widgets wird EIN kuratierter Block) ─────
   Enthält in dieser Reihenfolge: gemessene Zellstudien-Zahlen (Dwell-Sieger
   der LP A mit 13,0 s), die benannte Pruefinstanz (Autoritaets-Luecke KH-4),
   das staerkste Video-Testimonial VORGEZOGEN (Constantin Preis: getrackter
   Tiefschlaf = Emotion + Zahl + Beweis zugleich), kuratierte Kundenstimmen mit
   Namen und zuletzt die Studien-PDFs als Mitnahme (Reziprozitaet).
   Die Google-Gesamtbewertung kommt als ZAHL aus dem root-Loader — das
   Fremd-Widget selbst faellt weg (es brachte einen zweiten Goldton mit). */
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

// Echte Google-Rezensionen aus dem Bestand (index-components/GoogleReviews):
// derselbe Inhalt, nur ohne das Fremd-Widget-Kleid.
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
    <section data-section="lp-v2-beweis">
      <span className="v2-eyebrow">Beweis</span>
      <h2>Nicht nur gefühlt — an Zellen gemessen.</h2>
      <p className="v2-lede">
        Vier peer-review-publizierte Zellstudien belegen die Wirkung der
        Qi-Blanco-Technologie experimentell — alle in vitro, also an lebenden
        Zellkulturen im Labor. Dazu eine deskriptive Auswertung von 171
        Erfahrungsberichten und über 14.000 Menschen, die den QiOne<sup>®</sup> täglich
        tragen.
      </p>

      <div className="v2-stats">
        {STATS.map((s) => (
          <div className="v2-stat" key={s.label}>
            <div className="v2-stat__wert">{s.value}</div>
            <div className="v2-stat__label">{s.label}</div>
            <p className="v2-stat__desc">{s.desc}</p>
            <p className="v2-stat__cite">{s.cite}</p>
          </div>
        ))}
      </div>

      {/* Autoritaet MIT NAMEN (KH-4). Bewusst OHNE Portrait und OHNE erfundenes
          Zitat: ein Experten-Gesicht lag nicht rechtegeklaert vor, und ein
          Zitat ohne Transkript-Beleg wäre ein Claim-Verstoss (F-003/F-007).
          Genannt wird, was belegbar ist: Labor, Leitung, Prueflast, Journale. */}
      <div className="v2-autoritaet">
        <h3>Geprüft von einem unabhängigen Labor</h3>
        <p className="v2-autoritaet__zitat">
          Alle Zelluntersuchungen wurden von der Dartsch Scientific GmbH unter Leitung
          von Prof. Dr. P. C. Dartsch durchgeführt — an kultivierten menschlichen und
          tierischen Zellen, mit Kontrollgruppen und mehrfach wiederholten Messreihen.
        </p>
        <p className="v2-autoritaet__quelle">
          Publiziert im Japan Journal of Medicine (2021), im Applied Cell Biology Journal
          (2021 und 2024) sowie in Neurodegenerative Diseases: Current Research (2026).
        </p>
      </div>

      <div className="v2-video-solo">
        <YoutubeTimestamp
          videoId="jyLyXZqHxaw"
          titel="Constantin Preis — getrackter Tiefschlaf"
          className="v2-yt"
        />
        <span className="v2-video__tag">Deutscher Leichtathletik-Meister</span>
        <h3>Constantin Preis — getrackter Tiefschlaf</h3>
        <p className="v2-video__zitat">
          „Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt."
        </p>
      </div>

      <div className="v2-bewertung">
        <span className="v2-bewertung__wert">{rating.komma} / 5</span>
        <span className="v2-bewertung__meta">
          Google-Gesamtbewertung aus {rating.total} Rezensionen
        </span>
      </div>
      <div className="v2-stimmen">
        {STIMMEN.map((s) => (
          <article className="v2-stimme" key={s.name}>
            <p className="v2-stimme__text">„{s.text}"</p>
            <p className="v2-stimme__name">{s.name}, Google-Rezension</p>
          </article>
        ))}
      </div>

      {/* Studien-PDFs als Mitnahme statt als Behauptung (Reziprozitaet). */}
      <LpStudien headline="Nimm die Studien mit" />
    </section>
  );
}

/* ───────── 5 KAUFBLOCK (DER Hebel-1-Zug) ─────────────────────────────────
   Auf LP A steht dieses Material auf Position 12 und erreicht 8,5 % — obwohl
   es mit 16,2 s Dwell und 15,4 % Klick die staerkste Sektion der Seite ist.
   Hier steht es auf Position 5. Preise dynamisch aus der Storefront-API,
   QiBracelet ist EIN Produkt (drei Größen) = genau EINE Karte.
   Der Garantie-Aufklapper hängt in einem EIGENEN data-section-Anker, damit
   die Klickzahl dieser Sektion CTA-rein bleibt (Mess-Disziplin oben). */
function KaufblockSection() {
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
    <section data-section="lp-v2-kaufblock">
      <span className="v2-eyebrow">Deine Entscheidung</span>
      <h2>Finde deinen Begleiter für kohärentes Wasser</h2>
      <div className="v2-preise">
        {karten.map((c) => (
          <article
            className={`v2-produkt${c.held ? ' v2-produkt--held' : ''}`}
            key={c.handle}
          >
            {c.held && <span className="v2-produkt__badge">Bestseller</span>}
            <div className="v2-produkt__bild">
              {c.p?.featuredImage?.url ? (
                <img src={c.p.featuredImage.url} alt={c.name} loading="lazy" />
              ) : (
                <img src={QIONE_FALLBACK_IMG} alt={c.name} loading="lazy" />
              )}
            </div>
            <h3 className="v2-produkt__name">{c.name}</h3>
            <p className="v2-produkt__tagline">{c.tagline}</p>
            <div>
              <span className="v2-produkt__preis">{preisLabelVon(c.p) || '—'}</span>
              {c.held && qioneCompare && (
                <s className="v2-produkt__streich">{qioneCompare}</s>
              )}
            </div>
            <ul className="v2-produkt__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`v2-btn${c.held ? '' : ' v2-btn--still'}`}
              data-qa={c.held ? 'cta' : undefined}
              href={c.ziel}
            >
              {c.held ? 'Jetzt risikofrei testen' : 'Ansehen'}
            </a>
          </article>
        ))}
      </div>

      <div className="v2-garantie" data-section="lp-v2-garantie">
        <h3>Dein Risiko: keins</h3>
        <p className="v2-garantie__kern">
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
            gefertigt in Deutschland, inklusive Käuferschutz und kostenlosem Versand innerhalb Deutschlands.
          </p>
        </details>
      </div>

      <p className="v2-feinprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
        kostenloser Versand innerhalb Deutschlands · Käuferschutz
      </p>
    </section>
  );
}

/* ───────── 6 MIKROSKOP (Scrub auf 320vh gekappt, R4) ──────────────────────
   Dreifach belegte Kappung: Verhalten (33,9 % Durchleitung = der Kliff),
   Design-Rubrik (Sektions-Ausreisser 7 168 px bei Median 741 px) und die
   Design-Meister-Lernkarte jubi2x („320vh erhält den Scrub-Effekt und passt
   unter die Grenze"). Auf LP A steckte dieser Block IN der Wissenschafts-
   Sektion und blaehte sie auf 7 168 px — hier ist er eine eigene Sektion. */
function MikroskopSection() {
  return (
    <ScrollScrubVideo
      dataSection="lp-v2-mikroskop"
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

/* ───────── 7 STIMMEN (die Belohnung direkt nach dem Hoehepunkt, R4) ───────
   Auf LP A stand das beste GELB-Material auf Position 10 und erreichte 9 %.
   Hier folgt es unmittelbar auf den visuellen Hoehepunkt. Zitate wortgleich
   aus LP A uebernommen (dort content-match-geprueft, F-003). */
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
    title: 'Michelle Christin Guse — „wie ein kleines Wunder"',
    quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
  },
];

function StimmenSection() {
  return (
    <section data-section="lp-v2-stimmen">
      <span className="v2-eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Erfahrungen.</h2>
      <p className="v2-lede">
        Berichte einzelner Nutzer, deskriptiv wiedergegeben — keine Heilaussage und kein
        garantiertes Ergebnis.
      </p>
      <div className="v2-videos">
        {VIDEOS.map((v) => (
          <article key={v.id}>
            <YoutubeTimestamp videoId={v.id} titel={v.title} className="v2-yt" />
            <span className="v2-video__tag">{v.tag}</span>
            <h3>{v.title}</h3>
            <p className="v2-video__zitat">„{v.quote}"</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── 8 HALTUNG (Marken-Abbinder, jetzt MIT Klickziel) ───────────────
   s02-Mismatch 2: Das Status-Versprechen der staerksten Ad wird auf LP A für
   94,6 % der Besucher nie eingeloest, weil die Sektion ganz unten steht und
   strukturell blind ist (kein Klickziel). Der Kernsatz steht in V2 bereits im
   Hero-Eyebrow (Position 1); hier ist er der Abbinder — mit CTA. */
function HaltungSection() {
  return (
    <section data-section="lp-v2-haltung">
      <span className="v2-eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="v2-haltung__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der eigentliche
        Wert ist unsichtbar: kohärentes Wasser in deinem Körper, Zellen, die besser
        geschützt sind, ein Nervensystem, das abends herunterfahren darf. Der Schmuck ist
        nur das Vehikel.
      </p>
      <p className="v2-haltung__sign">— Dein Qi Blanco® Team</p>
      <p className="v2-mitte">
        <a className="v2-btn" data-qa="cta" href={KAUF_ZIEL}>
          QiOne® 2 Pro ansehen
        </a>
      </p>
    </section>
  );
}

/* ───────── 9 FINAL ───────────────────────────────────────────────────────── */
function FinalSection() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section data-section="lp-v2-final">
      <div className="v2-final__inner">
        <figure>
          <img src={image} alt="QiOne® 2 Pro" width="800" height="800" loading="lazy" />
        </figure>
        <div>
          <span className="v2-eyebrow">Bereit für alle drei Ebenen?</span>
          <h2>Gib deinem Körper 20 Nächte. Den Rest entscheidest du.</h2>
          <p>
            Trage den QiOne<sup>®</sup>&nbsp;2 Pro 20 Nächte lang. Bist du danach nicht
            überzeugt, erstatten wir dir den vollen Kaufpreis.
          </p>
          {price && (
            <div className="v2-final__preis-zeile">
              <span className="v2-final__preis">{price}</span>
              {compare && <s className="v2-final__streich">{compare}</s>}
            </div>
          )}
          <div className="v2-final__pay">
            <img src={KLARNA_IMG} alt="Klarna" width="120" height="28" loading="lazy" />
            <img src={PAYPAL_IMG} alt="PayPal" width="120" height="28" loading="lazy" />
          </div>
          <a className="v2-btn v2-btn--lg" data-qa="cta" href={KAUF_ZIEL}>
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="v2-final__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand innerhalb Deutschlands</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Root: neun Sektionen, Namespace lp-v2-* ──────────────────────── */
export function SchlafZellenSchutzV2({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-v2">
        <Hero />
        <EbenenSection />
        <MechanismusSection />
        <BeweisSection />
        <KaufblockSection />
        <MikroskopSection />
        <StimmenSection />
        <HaltungSection />
        <FinalSection />
      </div>
    </LiveDataCtx.Provider>
  );
}
