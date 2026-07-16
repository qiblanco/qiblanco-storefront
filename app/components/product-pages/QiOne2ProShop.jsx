import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {GuaranteeSection} from '~/components/campaign/SchlafZellenSchutz';
import {ProductFAQ} from '~/components/ProductFAQ';
import {FAQ_QIONE_2_PRO} from '~/data/product-faqs';
import {THEMEN} from '~/lib/redesign3themen';
import {claim} from '~/lib/claims';
import {
  QiOneBuyBox,
  QiOneBenefitList,
} from '~/components/product-pages/QiOneBuyBox';

/*
 * Campaign-PDP /pages/qione-2-pro — die kaufbereite Fortsetzung der Paid-Strecke
 * im LP-A-Design (Konzept „Shopseite nach LP" 2026-07-16). Erste Campaign-PDP:
 * Ad → LP → Campaign-PDP. Die organische PDP /products/qione-2-pro bleibt
 * unverändert die SEO-Seite; diese Seite ist noindex (Route-Meta + X-Robots).
 *
 * DRAMATURGIE (Konzept Kap. 3 — Kauf-Substanz statt zweiter Edukationsstufe):
 *   BuyBox-Hero (geteilte QiOneBuyBox, echter Preis/Varianten/ATC + Versand-
 *   Nutzen + Zahlarten) → DreiThemenBand (Scent-Anker aller 4 LP-Herkünfte) →
 *   Mechanismus-Kurzfassung (3 Kacheln aus THEMEN-Bestand) → GoogleReviews →
 *   GuaranteeSection (aus LP A, geteilt) → Kauf-FAQ (ProductFAQ-Reuse, nur
 *   Kauf-Fragen) → Final-CTA (scrollt zur Buy-Box, KEINE zweite Kauflogik).
 *
 * CLAIMS-DISZIPLIN (F-007/D-032, hart): 0 hardcodierte Werbe-/Zahlen-/Vergleichs-
 * Claims. Erlaubte Textquellen: claim(id) [nur legitimierte qione-Claims:
 * WM-design-elegant-luxurioes, WM-zellwasser-ganzer-koerper] · geteilte
 * Bestands-Komponenten (BenefitList, GuaranteeSection, DreiThemenBand, THEMEN,
 * GoogleReviews, ProductFAQ) · neutrale Funktions-Copy (Überschriften). KEINE
 * 4.8★/„14.000"-Social-Proof-Zeile, KEIN descriptionHtml (Konzept Kap. 2).
 *
 * TRACKING (D-006): KEIN Pixel-Code hier. Der ViewContent-Event kommt aus der
 * geteilten QiOneBuyBox (<Analytics.ProductView>, exakt der PDP-Payload); R1/R2/R3
 * hängen pfad-agnostisch im root-Layout. Ein zusätzlicher Pixel wäre Doppelzählung.
 */

// Zahlarten-Badges (Shopify-CDN-Assets, aus LP A übernommen — CSP-safe, keine
// Repo-Binaries, GL-PRO-0015).
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

// Kauf-FAQ: ausschließlich Kauf-/Handhabungs-Fragen aus dem Bestand
// (FAQ_QIONE_2_PRO) — Tragen, Pflege/Nässe, Kette, Klarna-Finanzierung. Die
// Wirk-/Edukations-Fragen (Funktionsweise, Messbarkeit, Gewöhnung) bleiben der
// organischen PDP; hier KEINE Wirk-Edukation (Konzept Kap. 3.6).
const KAUF_FAQ_FRAGEN = [
  'Wie sollte ich den QiOne® tragen?',
  'Kann ich den QiOne® an einer anderen Kette tragen?',
  'Darf der QiOne® in die Sauna bzw. nass werden?',
  'Aus welchem Material bestehen die Qi Blanco® Produkte?',
  'Wie funktioniert die Finanzierung über Klarna?',
];
const KAUF_FAQ = KAUF_FAQ_FRAGEN.map((frage) =>
  FAQ_QIONE_2_PRO.find((item) => item.q === frage),
).filter(Boolean);

/* ───────── BuyBox-Hero ───────── */
function BuyBoxHero({product}) {
  return (
    <section id="shopq-buybox" className="shopq-hero" data-section="shopq-buybox">
      {/* Dach-Kurzversprechen (Scent zur LP) — nur legitimierte qione-Claims. */}
      <p className="shopq-hero__scent">
        {claim('WM-zellwasser-ganzer-koerper')} ·{' '}
        {claim('WM-design-elegant-luxurioes')}
      </p>
      <QiOneBuyBox product={product} benefitList={<QiOneBenefitList />} />
      <div className="shopq-hero__pay" aria-label="Zahlarten">
        <img src={KLARNA_IMG} alt="Klarna" loading="lazy" />
        <img src={PAYPAL_IMG} alt="PayPal" loading="lazy" />
      </div>
    </section>
  );
}

/* ───────── Mechanismus-Kurzfassung (3 Kacheln, THEMEN-Bestandstexte) ───────── */
function MechanismusKurz() {
  return (
    <section className="shopq-mechs" data-section="shopq-mechanismus">
      <span className="eyebrow">Was der QiOne® bewirkt</span>
      <h2>Ein Prinzip, drei Ebenen.</h2>
      <p className="lp-vp-section__lede">
        Kohärentes Wasser an den Grenzflächen deiner Zellen — kurz zusammengefasst,
        bevor du dich entscheidest.
      </p>
      <div className="shopq-mechs__grid">
        {THEMEN.map((thema) => (
          <article className="shopq-mech" key={thema.id}>
            <span className="shopq-mech__zahl">{thema.beweisZahl}</span>
            <h3 className="shopq-mech__titel">{thema.titel}</h3>
            <p className="shopq-mech__text">{thema.mechanismusText}</p>
          </article>
        ))}
      </div>
      <p className="shopq-mechs__note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die genannten
        Zellstudien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den
        Mechanismus, sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Kauf-FAQ (ProductFAQ-Reuse, nur Kauf-Fragen) ───────── */
function KaufFAQ() {
  return (
    <section className="shopq-faq" data-section="shopq-faq">
      <span className="eyebrow">Vor dem Kauf</span>
      <h2>Häufige Fragen</h2>
      <ProductFAQ items={KAUF_FAQ} />
    </section>
  );
}

/* ───────── Final-CTA (scrollt zur Buy-Box — KEINE zweite Kauflogik) ───────── */
function FinalCTA() {
  return (
    <section className="shopq-final" data-section="shopq-final">
      <div className="shopq-final__inner">
        <span className="eyebrow">Bereit?</span>
        <h2>Dein QiOne® 2 Pro wartet oben.</h2>
        <p className="lp-vp-section__lede">
          Wähle deine Variante und leg ihn in den Warenkorb — 20 Nächte risikofrei,
          kostenloser Versand, 0 % Finanzierung über Klarna und PayPal.
        </p>
        {/* Reiner Anker zur Buy-Box: eine Kauflogik, eine Fehlerquelle
            (Konzept Kap. 3.7). Kein zweiter AddToCart-Pfad. */}
        <a className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg" href="#shopq-buybox">
          Zur Auswahl
        </a>
      </div>
    </section>
  );
}

/* ───────── Root ───────── */
export function QiOne2ProShop({product}) {
  return (
    <div className="lp-vp lp-a3 shopq">
      <BuyBoxHero product={product} />
      <DreiThemenBand dataSection="shopq-drei-themen" />
      <MechanismusKurz />
      <div data-section="shopq-google-reviews">
        <LpGoogleReviews />
      </div>
      <GuaranteeSection />
      <KaufFAQ />
      <FinalCTA />
    </div>
  );
}
