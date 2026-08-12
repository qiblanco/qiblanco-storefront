import {createContext, useContext} from 'react';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {THEMEN} from '~/lib/redesign3themen';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {mitStreichpreisFallback} from '~/lib/streichpreis-paritaet';

/*
 * Landingpage /pages/partner — Empfehlungs-/Vertrauensseite für Partner-Traffic
 * (Grossjob 20260726-partner-affiliate-manager-programm s05).
 *
 * Dramaturgie (Evergreen-Basisprinzip: Qualifizierung vor Pitch, klarer
 * nächster Schritt): Hero (Empfehlungs-Kontext) -> Code-Einlöse-Hinweis ->
 * Wirkmechanismus kohärenten Wassers (drei Ebenen, aus dem Bestand THEMEN) ->
 * Wissenschaft (Zellstudien, in-vitro gelabelt) -> Erfahrungen (deskriptiv) ->
 * ehrliche Qualifizierung („Passt Qi Blanco zu dir?") -> Garantie -> Produkte
 * (Live-Preise, LP-Block-Links) -> Signatur -> Final CTA (drei Schritte).
 *
 * CLAIM-DISZIPLIN: Alle Beweis-Zahlen und Mechanismus-Texte stammen wörtlich
 * aus dem Bestand (THEMEN in redesign3themen.js, ScienceSection der LP A,
 * STUDIEN_FAKTENBLATT e0004) — hier wird NICHTS Neues erfunden. Kein
 * Rabatt-Prozentsatz wird versprochen (Code-Konditionen sind Partner-Sache).
 * Zellstudien sind in vitro gelabelt, Erfahrungsberichte deskriptiv,
 * Geld-zurück an den Zeitraum gebunden, nie ans Spüren (Spür-Regel #7).
 *
 * DESIGN: Token-Welt der LP A (Scope .lp-a3, geteilte Token-Quelle) +
 * additive lp-pt-*-Klassen (styles/partner.css). KEINE Videos/Fremd-Widgets —
 * ruhige Vertrauensseite, wenige Requests.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;
const themaById = (id) => THEMEN.find((t) => t.id === id);

// Preis-Helfer wie LP A (M3, 20260718-lp-preise-dynamisch-binden-gestuft):
// Markt-Kontext kommt aus der @inContext-Query, Satz/Rundung/Format aus
// markt-pricing (die EINE Stelle, kein Doppelbau).
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

const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/* ───────── Hero: Empfehlungs-Kontext, ruhig, ohne Druck ───────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const heroImg = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  const dreizeiler = [
    'Verstehen, was dahintersteckt.',
    'Sehen, was gemessen wurde.',
    'In Ruhe entscheiden.',
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
      aria-labelledby="lp-pt-hero-title"
      data-section="lp-pt-hero"
    >
      <div className="lp-a-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">Persönliche Empfehlung</span>
          <h1 id="lp-pt-hero-title" className="lp-a-hero__title">
            Du kommst auf Empfehlung.
          </h1>
          <ul className="lp-a-hero__dreizeiler" aria-hidden="false">
            {dreizeiler.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
          <p className="lp-a-hero__subline">
            Jemand, dem du vertraust, hat dir Qi Blanco empfohlen — schön, dass
            du hier bist. Auf dieser Seite bekommst du das Wichtigste kompakt:
            was kohärentes Wasser ist, was Zellstudien dazu messen und wie du
            deinen Empfehlungs-Code einlöst. Kein Druck — lies in Ruhe.
          </p>
          <div className="lp-a-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href="#produkte">
              Produkte &amp; Preise ansehen
            </a>
            <a className="lp-vp-btn lp-vp-btn--secondary" href="#code">
              So löst du deinen Code ein
            </a>
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
            QiOne<sup>®</sup>&nbsp;2 Pro — der Allrounder, getragen Tag und Nacht.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────── Empfehlungs-Code: Einlöse-Hinweis (Code + Link) ───────── */
function CodeSection() {
  const wege = [
    {
      title: 'Mit Empfehlungs-Code',
      body: 'Lege dein Produkt in den Warenkorb und trage den Code beim Bezahlen in das Feld für Rabatt- bzw. Gutscheincodes ein. Dein Vorteil wird direkt abgezogen — und deine Bestellung wird deinem Empfehler zugeordnet.',
    },
    {
      title: 'Über einen persönlichen Link',
      body: 'Bist du über den Empfehlungs-Link hierher gekommen? Dann ist dein Besuch bereits zugeordnet — du musst nichts weiter tun. Hast du zusätzlich einen Code, kannst du ihn beim Bezahlen ganz normal einlösen.',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-pt-code" id="code">
      <span className="eyebrow">Empfehlungs-Code</span>
      <h2>Dein Code, dein Vorteil — so einfach geht es.</h2>
      <p className="lp-vp-section__lede">
        Dein Empfehler hat einen persönlichen Code oder Link für dich. Beides
        führt zum selben Ziel: Du bekommst deinen Vorteil, und die Empfehlung
        kommt dort an, wo sie hingehört.
      </p>
      <div className="lp-vp-benefits-grid lp-pt-grid-2">
        {wege.map((w) => (
          <article className="lp-a-benefit" key={w.title}>
            <h3 className="lp-vp-benefit__title">{w.title}</h3>
            <p className="lp-vp-benefit__body">{w.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Wirkmechanismus: kohärentes Wasser auf drei Ebenen ─────────
   Nordstern: konkret ERKLÄREN, wo und wie kohärentes Wasser wirkt — Inhalt
   (mechanismusText, beweisZahl/Label, bild) wörtlich aus dem Bestand (THEMEN),
   Anker-Link je Ebene auf die bestehende Themen-LP. */
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
    <section className="lp-vp-section" data-section="lp-pt-mechanismus">
      <span className="eyebrow">Was dahintersteckt</span>
      <h2>Kohärentes Wasser — ein Prinzip, drei Ebenen.</h2>
      <p className="lp-vp-section__lede">
        Dein Körper besteht zu über 70&nbsp;% aus Wasser, und fast alle
        biologischen Prozesse laufen an wasserumhüllten Grenzflächen ab. Ist
        dieses Wasser geordnet — kohärent —, arbeiten Zellen, Membranen und
        Nervensystem ruhiger. Genau da setzt die GitterChip™-Technologie an.
        Jede Ebene hat ihre eigene Seite, wenn du tiefer einsteigen willst.
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
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die
        genannten Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie
        erklären den Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Wissenschaft (in-vitro gelabelt, wie LP A) ───────── */
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
    <section className="lp-vp-section" data-section="lp-pt-wissenschaft">
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur empfohlen — an Zellen gemessen.</h2>
      <p className="lp-vp-section__lede">
        Vier peer-review-publizierte Zellstudien (Dartsch Scientific,
        unabhängiges Labor) belegen die Wirkung der Qi-Blanco-Technologie
        experimentell. Alle Studien in vitro — messbare, reproduzierbare
        Effekte auf lebende Zellen. Du kannst jede Publikation selbst lesen.
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
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── Erfahrungen (deskriptiv, e0004 — kein Kausal-Claim) ───────── */
function ErfahrungenSection() {
  const stats = [
    {
      value: '~20 %',
      label: 'Ruhe & tieferer Schlaf',
      desc: 'Häufigste Nennung in 171 ausgewerteten Erfahrungsberichten.',
      cite: 'Deskriptive Auswertung, 2024',
    },
    {
      value: '~17 %',
      label: 'Energie & Vitalität',
      desc: 'Zweithäufigste Nennung — mehr Energie im Alltag.',
      cite: 'Deskriptive Auswertung, 2024',
    },
    {
      value: '14.000+',
      label: 'Trägerinnen und Träger',
      desc: 'Menschen, die den QiOne® heute im Alltag tragen.',
      cite: 'Qi Blanco, Bestand',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-pt-erfahrungen">
      <span className="eyebrow">Erfahrungen</span>
      <h2>Was Trägerinnen und Träger berichten.</h2>
      <p className="lp-vp-section__lede">
        171 Erfahrungsberichte wurden 2024 als deskriptive Auswertung
        publiziert. Am häufigsten genannt: Ruhe und tieferer Schlaf, danach
        mehr Energie. Das ist kein Kausal-Beweis — aber ein ehrliches Bild
        dessen, was Menschen erleben. Berichte einzelner Nutzer, deskriptiv.
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
    </section>
  );
}

/* ───────── Ehrliche Qualifizierung: Passt es zu dir? ─────────
   Evergreen-Basisprinzip (Setter/Closer fail-soft): Qualifizierung vor Pitch —
   die Seite sortiert ehrlich, statt jedem alles zu verkaufen. */
function PasstSection() {
  const ja = [
    'du abends schwer abschaltest oder unruhig schläfst',
    'du viel zwischen WLAN, Handy und Bildschirm lebst',
    'du Grenzforschung offen gegenüberstehst, wenn Labor-Daten dahinterstehen',
    'du einen passiven Begleiter willst — ohne App, Akku oder neue Routine',
  ];
  const nein = [
    'du ein Medizinprodukt oder ein Heilversprechen erwartest — beides sind wir nicht',
    'du eine Wirkung erwartest, die du garantiert sofort spürst — wir binden dein Urteil an 20 Nächte, nicht an ein Gefühl',
    'du nur gelten lässt, was etablierte Schulmedizin ist — kohärentes Wasser ist Grenzforschung',
  ];
  return (
    <section className="lp-vp-section" data-section="lp-pt-passt">
      <span className="eyebrow">Ehrliche Einordnung</span>
      <h2>Passt Qi Blanco zu dir?</h2>
      <p className="lp-vp-section__lede">
        Eine gute Empfehlung verdient eine ehrliche Antwort — in beide
        Richtungen. Deshalb sagen wir dir auch, wann Qi Blanco nichts für dich
        ist.
      </p>
      <div className="lp-vp-benefits-grid lp-pt-grid-2">
        <article className="lp-a-benefit">
          <h3 className="lp-vp-benefit__title">Gut möglich, wenn …</h3>
          <ul className="lp-pt-liste lp-pt-liste--ja">
            {ja.map((punkt) => (
              <li key={punkt}>{punkt}</li>
            ))}
          </ul>
        </article>
        <article className="lp-a-benefit">
          <h3 className="lp-vp-benefit__title">Eher nicht, wenn …</h3>
          <ul className="lp-pt-liste lp-pt-liste--nein">
            {nein.map((punkt) => (
              <li key={punkt}>{punkt}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ───────── Garantie (Texte wörtlich aus dem Bestand, LP A) ───────── */
function GarantieSection() {
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
    <section className="lp-vp-section" data-section="lp-pt-garantie">
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt es dich — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort
        bewusst wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl,
        sondern an den Zeitraum: 20 Nächte, dann entscheidest du.
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

/* ───────── Produkte (Live-Preise, LP-Block-Links) ───────── */
function ProdukteSection() {
  const {data} = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione = findLp(data, 'qione-2-pro');
  const qihome = findLp(data, 'qihome-air');
  // Fallback strikt je Karten-Handle (nie fremden Fallback-Preis anzeigen):
  // nur qione-2-pro hat einen zentralen Fallback-Wert (campaign-fallback-prices).
  const priceOf = (c) => {
    const label = preisLabelVon(c.p);
    if (label) return label;
    if (c.handle === 'qione-2-pro') return fallbackPreis('qione-2-pro')?.label || null;
    return null;
  };
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
    <section
      className="lp-a-pricing"
      aria-labelledby="lp-pt-produkte-title"
      data-section="lp-pt-produkte"
      id="produkte"
    >
      <span className="eyebrow">Unsere Produkte</span>
      <h2 id="lp-pt-produkte-title">Finde deinen Begleiter für kohärentes Wasser</h2>
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
              <span className="lp-a-product__price">{priceOf(c) || '—'}</span>
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
        kostenloser Versand innerhalb Deutschlands · Käuferschutz. Tipp: Deinen Empfehlungs-Code löst
        du beim Bezahlen im Feld für Rabatt- bzw. Gutscheincodes ein.
      </p>
    </section>
  );
}

/* ───────── Signatur (dunkler Akt, Botschaft aus dem Bestand) ───────── */
function SignatureSection() {
  return (
    <section className="lp-a-signature" data-section="lp-pt-signatur">
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="lp-a-signature__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der
        eigentliche Wert ist unsichtbar: kohärentes Wasser in deinem Körper,
        Zellen, die besser geschützt sind, ein Nervensystem, das abends
        herunterfahren darf. Der Schmuck ist nur das Vehikel. Was du wirklich
        mitnimmst, ist die Ruhe auf allen drei Ebenen.
      </p>
      <p className="lp-a-signature__sign">— Dein Qi Blanco® Team</p>
    </section>
  );
}

/* ───────── Final CTA: klarer nächster Schritt in drei Schritten ───────── */
function FinalCTA() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const fallback = priceAmount ? null : fallbackPreis('qione-2-pro');
  const price = priceAmount ? preisLabelVon(product) : fallback?.label;
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  const schritte = [
    'Produkt wählen — der QiOne® 2 Pro ist der Allrounder für Tag und Nacht.',
    'Empfehlungs-Code beim Bezahlen einlösen, falls du einen hast.',
    'Das Produkt 20 Nächte im echten Alltag testen — nicht überzeugt heißt: voller Kaufpreis zurück.',
  ];
  return (
    <section className="lp-vp-final-cta" data-section="lp-pt-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img src={image} alt="QiOne® 2 Pro" loading="lazy" />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-pt-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-pt-cta-arc" startOffset="0">
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
          <span className="eyebrow">Dein nächster Schritt</span>
          <h2>In drei Schritten in Ruhe entschieden.</h2>
          <ol className="lp-pt-schritte">
            {schritte.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
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
          <a
            className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg"
            href={produktLink('qione-2-pro', BLOCK_LP, 'kauf')}
          >
            Jetzt QiOne® 2 Pro ansehen
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

/* ───────── Root ───────── */
export function Partner({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-a3 lp-pt">
        <Hero />
        <CodeSection />
        <MechanismSection />
        <ScienceSection />
        <ErfahrungenSection />
        <PasstSection />
        <GarantieSection />
        <ProdukteSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
