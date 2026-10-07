import {Bewertungsblock} from '~/components/reusables/Bewertungsblock';
import {CdnBild} from '~/components/reusables/CdnBild';
import {PeerReviewStudies} from '~/components/reusables/PeerReviewStudies';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {bildQuelle} from '~/components/reusables/shopifyBildQuellen';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {GuaranteeSection} from '~/components/campaign/SchlafZellenSchutz';
import {ERFAHRUNGS_BEITRAEGE} from '~/data/erfahrungen-beitraege';
import {MENSCHEN_ALLTAG_TEXTE as T} from '~/components/campaign/menschenAlltagTexte';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {useLpPreis, waehrungVon} from '~/lib/lp-preis';

/*
 * /pages/menschen-alltag — STUFE B des Funnel-Managers: „Menschen und Alltag
 * statt Zellen" (Grossjob 20261007-GROSSJOB-funnel-manager-customer-journey-
 * ad-lp, Segment s02; Christian 07.10.2026: „eine Page, die sprachlich in eine
 * ganz andere Richtung geht als Zelle Schlafschutz … und die muss sich aber
 * dann auch immer erst beweisen").
 *
 * WAS ANDERS IST ALS BEIM CHAMPION /pages/schlaf-zellen-schutz: Sprache und
 * Inhalt. Der Einstieg kommt im Kundenwort, Menschen und ihr Alltag stehen
 * vorn, die Frage „Wirkt das überhaupt?" bekommt eine offene Antwort, die
 * Studienzahlen folgen erst danach als Abschluss-Argument (Kanon: MENSCHEN
 * ZIEHEN, BEWEIS IST EIN CLOSER). Zell-Mechanik, Scroll-Animationen und der
 * Fachbegriff stehen nicht auf der Seite.
 *
 * WAS GLEICH BLEIBT, MIT ABSICHT (Lehre aus GS-078: eigene Message-Match-
 * Seiten verteilten Besucher auf Info-Seiten und verloren 21,3 % gegen
 * 33,2 %): der KAUFWEG. Derselbe Knopf „Jetzt kaufen" auf dasselbe Ziel
 * /pages/qione-2-pro an denselben Stellen wie bei A — Kopf, direkt unter den
 * Studienzahlen, Preisblock, Schluss —, derselbe Preis mit Raten, dieselbe
 * Vertrauenszeile mit Klarna und PayPal unter dem Kopf-Knopf, dieselben drei
 * Produktkarten. KEIN Link auf eine Info-Unterseite. Kein Sticky-Knopf (A hat
 * keinen; der wird in E1 getestet). Den Gleichlauf mit A bewacht
 * menschen-alltag.test.mjs am Quelltext beider Seiten.
 *
 * A BLEIBT UNBERÜHRT: SchlafZellenSchutz.jsx ist nicht verändert. Von dort
 * kommt nur GuaranteeSection, die seit dem 2026-07 per Export geteilt wird.
 * Kopf-Kaufzeile, Preisblock und Schluss sind Abschriften der Bauform von A
 * mit B's Überschriften; der Preis kommt aus denselben Helfern (lp-preis.js).
 *
 * TEXTE: jeder neue Satz steht in components/campaign/menschenAlltagTexte.js,
 * kommt aus der Text-Werkstatt und trägt dort seine Herkunft. Jede Textstelle trägt
 * `data-textplatz` — dort setzt Christian seinen eigenen Wortlaut ein, ohne die
 * Seite umzubauen (marken-stimme: „Den Seitentext schreibt Christian selbst:
 * baue Platz für seinen Wortlaut").
 *
 * MENSCHEN: echte, schon veröffentlichte Videoberichte aus
 * app/data/erfahrungen-beitraege.js (dieselbe Quelle wie /pages/erfahrungen).
 * Die Karten zeigen die dort schon veröffentlichte, von Hand geschriebene
 * Zusammenfassung unverändert: kein wörtliches Zitat, kein neuer Satz über
 * einen Menschen (Herkunftsregeln im Kopf jenes Moduls).
 *
 * DESIGN: das Token-System von A (styles/schlaf-zellen-schutz.css, Scope
 * .lp-a3) plus styles/menschen-alltag.css (Scope .lp-ma, nur Tokens).
 *
 * TRACKING: hängt pfad-agnostisch im root-Layout; der Loader fragt nur
 * Produktdaten ab. Kein neuer Identitäts-Key.
 */

/* Kaufweg von A: dasselbe Ziel aus derselben Quelle (blockLinks), derselbe
   Knopftext wie QIONE_CTA in SchlafZellenSchutz.jsx (Christian 21.09.2026:
   „Jetzt kaufen"). Der Gleichlauf ist getestet, nicht nur kommentiert. */
export const KAUF_ZIEL = produktLink('qione-2-pro', BLOCK_LP, 'kauf');
export const KAUF_TEXT = 'Jetzt kaufen';

/* Die drei Menschen in Seitenreihenfolge (Video-ID aus erfahrungen-beitraege):
   Constantin Preis, Yann Sura, André Stern. Alle drei Videos handeln vom
   QiOne 2 Pro — der Bericht von Marion Engelbrecht (2019, erste Generation)
   steht deshalb nicht hier, obwohl er der stärkste Alltag-Bericht ist. */
export const PERSONEN_VIDEOS = ['jyLyXZqHxaw', 'EjXTIldVrk4', 'Ay7tFOpqGVU'];

const KOPF_BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp';
const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/* Bild-Leitern wie bei A (dort über die ganze Format-Matrix gemessen). */
const LEITER_HERO = [400, 600, 800, 900, 1200];
const LEITER_KARTE = [200, 400];
const LEITER_KLARNA = [100, 150];
const LEITER_PAYPAL = [110, 160];
const SIZES_HERO = '(max-width: 767px) calc(100vw - 48px), min(40vw, 423px)';

const findeProdukt = (products, handle) =>
  products?.find((product) => product?.handle === handle) || null;

/** Überschrift + Absätze eines Werkstatt-Blocks, mit Textplatz-Anker. */
function TextBlock({block, platz, ebene = 'h2', idUeberschrift, absatzKlasse}) {
  const Ueberschrift = ebene;
  return (
    <div className="lp-ma-text" data-textplatz={`menschen-alltag.${platz}`}>
      <Ueberschrift id={idUeberschrift}>{block.ueberschrift}</Ueberschrift>
      {block.absaetze.map((absatz) => (
        <p className={absatzKlasse} key={absatz}>
          {absatz}
        </p>
      ))}
    </div>
  );
}

/** Derselbe Knopf wie bei A (Klassen, Ziel, Text). */
function Kaufknopf({lg = false}) {
  return (
    <a
      className={`lp-vp-btn lp-vp-btn--primary${lg ? ' lp-vp-btn--lg' : ''}`}
      href={KAUF_ZIEL}
    >
      {KAUF_TEXT}
    </a>
  );
}

/* ───────── Kopf ───────── */
function Kopf({products}) {
  const {preisWert, preisLabelVon, compareLabelVon} = useLpPreis();
  const product = findeProdukt(products, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const fallback = priceAmount ? null : fallbackPreis('qione-2-pro');
  const waehrung = waehrungVon(product);
  const priceNum = priceAmount ? preisWert(product) : fallback.bruttoWert;
  const priceLabel = priceAmount ? preisLabelVon(product) : fallback.label;
  const compareLabel = compareLabelVon(product);
  const monthly = Math.ceil(priceNum / 12);
  return (
    <section
      className="lp-a-hero lp-ma-kopf"
      aria-labelledby="lp-ma-kopf-titel"
      data-section="lp-ma-hero"
    >
      <div className="lp-a-hero__inner">
        <div className="lp-a-hero__copy">
          <div className="lp-ma-text" data-textplatz="menschen-alltag.kopf">
            <h1 id="lp-ma-kopf-titel" className="lp-a-hero__title">
              {T.kopf.ueberschrift}
            </h1>
            {T.kopf.absaetze.map((absatz) => (
              <p className="lp-a-hero__subline" key={absatz}>
                {absatz}
              </p>
            ))}
          </div>
          {/* Die Kaufzeile von A: Knopf, Preis, Ratenzeile. */}
          <div className="lp-a-hero__cta-row">
            <Kaufknopf />
            <span className="lp-a-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel}
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
            </span>
          </div>
          {/* Die Risikoumkehr direkt am Knopf: Christians Wortlaut von A
              (21.09.2026, Zeichensetzung 06.10.2026), unverändert. */}
          <p className="micro-text mt-1 lp-a-hero__vertrauen">
            <strong>
              {' '}
              Jetzt 20 Tage nach Erhalt testen, mit 0&nbsp;% Finanzierung &amp;
              Käuferschutz. 100&nbsp;% Geld-zurück-Garantie.{' '}
            </strong>
          </p>
          <p className="lp-a-hero__zahlarten">
            <CdnBild
              style={{margin: '20px 20px 20px 0'}}
              breite={75}
              hoehe={42}
              loading="lazy"
              anzeigeBreite={75}
              src={KLARNA_IMG}
              alt="Klarna"
            />
            <CdnBild
              style={{margin: '20px 20px 20px 0'}}
              breite={75}
              hoehe={38}
              loading="lazy"
              anzeigeBreite={75}
              src={PAYPAL_IMG}
              alt="PayPal"
            />
          </p>
        </div>
        <figure className="lp-a-hero__visual lp-ma-kopf__bild">
          <CdnBild
            src={KOPF_BILD}
            alt="Eine Frau arbeitet zu Hause auf dem Sofa am Laptop und trägt den QiOne 2 Pro als Kette"
            breite={2400}
            hoehe={1471}
            masterBreite={2400}
            anzeigeBreite={552}
            sizes={SIZES_HERO}
            loading="eager"
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>
  );
}

/* ───────── Menschen zuerst ───────── */
function Menschen() {
  const beitraege = PERSONEN_VIDEOS.map((id) =>
    ERFAHRUNGS_BEITRAEGE.find((b) => b.videoId === id),
  ).filter(Boolean);
  return (
    <section className="lp-vp-section lp-ma-menschen" data-section="lp-ma-menschen">
      {/* Überschrift, Eyebrow und Einleitung sind der Wortlaut des Video-
          Abschnitts von A (SchlafZellenSchutz.jsx, VideoSection), unverändert:
          er beschreibt genau diese drei Menschen (der Leistungssportler mit
          dem getrackten Tiefschlaf, zwei Veränderungen im Alltag). Kein neuer
          Satz — die Werkstatt-Fassungen dieses Abschnitts trugen alle den
          Nutzerzahl-Satz, der auf der Seite schon im Einwand-Block steht. */}
      <div className="lp-ma-schmal" data-textplatz="menschen-alltag.menschen">
        <span className="eyebrow">Video-Erfahrungen</span>
        <h2>Echte Menschen. Echte Erfahrungen.</h2>
        <p className="lp-vp-section__lede">
          Drei Träger erzählen ihre Geschichte, vom getrackten Tiefschlaf des
          Leistungssportlers bis zur spürbaren Veränderung im Alltag. Berichte einzelner
          Nutzer, deskriptiv.
        </p>
      </div>
      <div className="lp-vp-videos-grid">
        {beitraege.map((b) => (
          <article className="lp-vp-video lp-ma-person" key={b.videoId}>
            <YoutubeTimestamp
              videoId={b.videoId}
              titel={b.titel}
              posterAlt={`Videostandbild: ${b.sprecher} erzählt von der eigenen Erfahrung mit Qi Blanco`}
              className="lp-a-yt"
              sizes="(min-width: 900px) 340px, 100vw"
            />
            <h3 className="lp-vp-video__title">{b.sprecher}</h3>
            <p className="lp-ma-person__text">{b.zusammenfassung}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Wirkt das überhaupt? — dann die Studien als Abschluss ───────── */
function Einwand() {
  return (
    <section className="lp-vp-section lp-ma-einwand" data-section="lp-ma-einwand">
      <div className="lp-ma-schmal">
        <TextBlock block={T.einwand} platz="einwand" />
      </div>
      {/* Der Block „6 Jahre Forschung" von Startseite und A, unverändert und
          ohne Link: Beweis als Abschluss, kein Weg weg vom Kauf. */}
      <PeerReviewStudies dataSection="lp-ma-peer-review-studien" />
      {/* Wie lp-a-weiter-6 bei A: der Knopf direkt unter den Studienzahlen. */}
      <div className="lp-a-weiter lp-a-weiter--im-block" data-section="lp-ma-weiter-1">
        <Kaufknopf />
      </div>
    </section>
  );
}

/* ───────── Produkte (Karten und Ziele wie A) ───────── */
const KARTEN = [
  {handle: 'qibracelet', name: 'QiBracelet®', featured: false},
  {handle: 'qione-2-pro', name: 'QiOne® 2 Pro', featured: true},
  {handle: 'qihome-air', name: 'QiHome® Air', featured: false},
];

function Produkte({products}) {
  const {preisLabelVon, compareLabelVon} = useLpPreis();
  const qioneCompare = compareLabelVon(findeProdukt(products, 'qione-2-pro'));
  return (
    <section
      className="lp-a-pricing lp-ma-produkte"
      aria-labelledby="lp-ma-produkte-titel"
      data-section="lp-ma-produkte"
    >
      <div className="lp-ma-schmal">
        <TextBlock
          block={T.produkte}
          platz="produkte"
          idUeberschrift="lp-ma-produkte-titel"
          absatzKlasse="lp-vp-section__lede"
        />
      </div>
      <div className="lp-a-pricing-grid">
        {KARTEN.map((c) => {
          const p = findeProdukt(products, c.handle);
          return (
            <article
              className={`lp-a-product${c.featured ? ' lp-a-product--featured' : ''}`}
              key={c.handle}
            >
              {c.featured && <span className="lp-a-product__badge">Bestseller</span>}
              <div className="lp-a-product__image">
                {p?.featuredImage?.url ? (
                  <img
                    {...bildQuelle(p.featuredImage.url, LEITER_KARTE)}
                    sizes="200px"
                    alt={c.name}
                    loading="lazy"
                  />
                ) : (
                  <span className="lp-a-product__ph">{c.name}</span>
                )}
              </div>
              <h3 className="lp-a-product__name">{c.name}</h3>
              <div className="lp-a-product__price-row">
                <span className="lp-a-product__price">{preisLabelVon(p) || '—'}</span>
                {c.featured && qioneCompare && (
                  <sup className="lp-a-product__compare">{qioneCompare}</sup>
                )}
              </div>
              <a
                className={`lp-vp-btn ${c.featured ? 'lp-vp-btn--primary' : 'lp-vp-btn--secondary'} lp-a-product__cta`}
                href={produktLink(c.handle, BLOCK_LP, c.featured ? 'kauf' : 'detail')}
              >
                {c.featured ? KAUF_TEXT : 'Mehr erfahren'}
              </a>
            </article>
          );
        })}
      </div>
      <p className="lp-vp-pricing__fineprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna und PayPal ·
        kostenloser Versand innerhalb Deutschlands · Käuferschutz
      </p>
    </section>
  );
}

/* ───────── Schluss (Bauform von A, Überschrift und Absatz von B) ───────── */
function Schluss({products}) {
  const {preisLabelVon, compareLabelVon} = useLpPreis();
  const product = findeProdukt(products, 'qione-2-pro');
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section className="lp-vp-final-cta" data-section="lp-ma-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img
            {...bildQuelle(image, LEITER_HERO)}
            sizes={SIZES_HERO}
            alt="QiOne® 2 Pro"
            loading="lazy"
          />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-ma-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-ma-cta-arc" startOffset="0">
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
          <div className="lp-ma-text" data-textplatz="menschen-alltag.schluss">
            <h2>{T.schluss.ueberschrift}</h2>
            {T.schluss.absaetze.map((absatz) => (
              <p className="lp-vp-final-cta__lede" key={absatz}>
                {absatz}
              </p>
            ))}
          </div>
          {price && (
            <div className="lp-vp-final-cta__price">
              <span className="lp-vp-final-cta__users">+ 14.000 aktive Nutzer</span>
              <div className="lp-vp-final-cta__price-row">
                <span className="lp-vp-final-cta__price-value">{price}</span>
                {compare && <sup className="lp-vp-final-cta__compare">{compare}</sup>}
              </div>
              <span className="lp-vp-final-cta__price-meta">einmalig · inkl. MwSt.</span>
              <div className="lp-vp-final-cta__pay">
                <img {...bildQuelle(KLARNA_IMG, LEITER_KLARNA)} sizes="48px" alt="Klarna" />
                <img {...bildQuelle(PAYPAL_IMG, LEITER_PAYPAL)} sizes="52px" alt="PayPal" />
              </div>
            </div>
          )}
          <Kaufknopf lg />
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

/* ───────── Seite ───────── */
export function MenschenAlltag({products}) {
  const liste = products || [];
  return (
    <div className="lp-vp lp-a3 lp-ma">
      <Kopf products={liste} />
      <Menschen />
      {/* Der Bewertungsblock der Startseite und von A, unverändert: echte
          Google-Bewertungen, keine ausgewählt, keine verändert. */}
      <Bewertungsblock praefix="lp-ma-" wrapperKlasse="lp-a-bewertungen" />
      <Einwand />
      <GuaranteeSection />
      <Produkte products={liste} />
      <Schluss products={liste} />
    </div>
  );
}
