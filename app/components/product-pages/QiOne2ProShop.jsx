import {claim} from '~/lib/claims';
import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
import {
  QiOneBuyBox,
  QiOneBenefitList,
} from '~/components/product-pages/QiOneBuyBox';
import {QiOneHeroBulletsPages} from '~/components/product-pages/QiOneHeroBulletsPages';
import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {
  StarRating,
  SterneSprung,
} from '~/components/reusables/StarRating';

/*
 * Campaign-PDP /pages/qione-2-pro — die kaufbereite Fortsetzung der Paid-
 * Strecke (Ad → LP → Campaign-PDP), seit 2026-07-16 im SHOP-DESIGN
 * (Job qione-shopniveau-design-qa, Christian: „optisch/qualitativ WIRKLICH
 * auf das Niveau der echten Shopseite"). Der LP-A-Vorgänger (Rubrik 92,
 * optisch NO-GO, 24 % der PDP-Dichte) ist ersetzt.
 *
 * SHOP-NIVEAU PER KONSTRUKTION: dieselben Komponenten wie die organische
 * PDP /products/qione-2-pro — geteilte QiOneBuyBox MIT den PDP-Slots
 * (Social-Proof via Claims-SSoT, descriptionHtml, Bestseller-Label,
 * BenefitList) + kompletter QiOne2Pro-Inhalt (Features/Studien/Gitterchip/
 * Finanzierung/FAQ). Kein Nachbau, kein Text-Duplikat. Einziger Delta:
 * CTA-Ziele ankern auf #shopq-buybox (EINE Kauflogik auf der Seite, kein
 * Funnel-Bounce zur SEO-PDP; die PDP behält ihre Defaults byte-identisch).
 *
 * CLAIMS (Korrektur Christian 2026-07-16): »4,8 ★« + »Über 14.000 Nutzer«
 * sind kennzahlen-kanonisch (fakten-basis.yaml, Direktive 2026-06-11) und
 * als kennzahl_ref-Claims legitimiert — sie SOLLEN hier erscheinen. Die
 * frühere Einstufung als »unbelegt« (F-007/D-032-Anwendung) war falsch;
 * fact_gate._check_kennzahl_bruecke macht die Fehlerklasse baulich
 * unmöglich.
 *
 * HERO-BLOCK ENTKOPPELT (Job 20260716-bauer-homepage-verstaendnis-hero-
 * nachbau-qione): Der description-Slot rendert hier NICHT mehr das geteilte
 * Shopify-Feld descriptionHtml (das traf bei Admin-Änderungen immer /pages
 * UND /products zugleich), sondern den unabhängig editierbaren 1:1-Nachbau
 * QiOneHeroBulletsPages (eigene Bullet-Texte für die Paid-Strecke). Die
 * organische PDP /products/qione-2-pro rendert descriptionHtml unverändert
 * weiter — ihr DOM bleibt byte-identisch.
 *
 * TRACKING (D-006): KEIN Pixel-Code hier. ViewContent kommt aus der
 * geteilten QiOneBuyBox (<Analytics.ProductView>, exakt der PDP-Payload);
 * R1/R2/R3 hängen pfad-agnostisch im root-Layout.
 *
 * DESIGN-QA-GATE: Diese Seite läuft als Klasse `shop-spiegel` mit Referenz
 * /products/qione-2-pro (design_gate_seiten.yaml) — Struktur + Referenz-
 * Parität fail-closed via design-qa (Bauakte-Pflicht design_qa_pass).
 */
export function QiOne2ProShop({product}) {
  return (
    <div className="shopq2">
      <section id="shopq-buybox" data-section="shopq-buybox">
        <QiOneBuyBox
          product={product}
          socialProof={
            /* Claims-SSoT liefert »4,8 ★« als TEXT (ein Stern-Zeichen) —
               die 5-Sterne-Darstellung uebernimmt StarRating; die Zeile
               springt zum Bewertungsbereich dieser Seite (Klasse S seit Job
               20260820-wurzel-sterne-klick-scroll). Der früher hier
               haengende EXTERNE Google-Link ist bewusst entfallen — er ist
               die AUSNAHME und sitzt genau einmal je Seite am
               GoogleRatingBadge im Bewertungsbereich. */
            <SterneSprung className="product-rating">
              <span>{claim('WM-bewertung-4-8-sterne').replace(/\s*★\s*$/, '')}</span>{' '}
              <StarRating value={4.8} />{' '}
              <span>{claim('WM-nutzer-ueber-14000')}</span>
            </SterneSprung>
          }
          description={<QiOneHeroBulletsPages />}
          topBadge={
            <p className="mt-2">
              <b>{claim('WM-nutzer-ueber-14000')}</b>
            </p>
          }
          priceLabel={<div className="BestsellerLabel">Bestseller Angebot</div>}
          benefitList={<QiOneBenefitList />}
        />
      </section>
      {/* Scent-Anker der 4 LP-Herkünfte (global gestylt, shop-kompatibel) */}
      <DreiThemenBand dataSection="shopq-drei-themen" block="lp" />
      {/* Trust-Elemente 1:1 aus der Startseite (Job 20260717-trust-elemente):
          Einzel-Bewertungen VOR dem bestehenden InfoSlider, Reputon-Widget
          danach — Slider-REUSE via Slots statt Zweitinstanz (D-045). */}
      <QiOne2Pro
        block="lp"
        ctaHref="#shopq-buybox"
        ctaAnchor="#shopq-buybox"
        gitterchipAnimation={
          // Quellen+Overlays zentral im Wrapper (Mojibake-/Drift-Schutz)
          <GitterchipMoleculesScrub dataSection="shopq-gitterchip-video" />
        }
        trustVorSlider={<GoogleReviews dataSection="shopq-google-reviews" />}
        trustNachSlider={
          /* Geteilte Rezensions-Sektion (Job 20260731-google-rezensionen):
             gleicher Inhalt wie vorher (Live-Reputon) + verkaufsstarke
             Überschrift + Anker für den 4,8-Banner-Klick; data-section
             bleibt shopq-reputon-reviews (Design-Watch-Kontinuität). */
          <GoogleRezensionenBereich dataSection="shopq-reputon-reviews" />
        }
      />
    </div>
  );
}
