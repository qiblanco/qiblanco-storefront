import {claim} from '~/lib/claims';
import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
import {
  QiOneBuyBox,
  QiOneBenefitList,
} from '~/components/product-pages/QiOneBuyBox';
import {QiOneHeroBulletsPages} from '~/components/product-pages/QiOneHeroBulletsPages';
import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';

const GITTERCHIP_VIDEO_DESKTOP = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-desktop-16x9.mp4?v=1784313940';
const GITTERCHIP_VIDEO_MOBILE = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-mobile-9x16.mp4?v=1784313946';

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
            <div className="product-rating">
              <span>{claim('WM-bewertung-4-8-sterne')}</span>{' '}
              <span>{claim('WM-nutzer-ueber-14000')}</span>
            </div>
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
      <DreiThemenBand dataSection="shopq-drei-themen" />
      {/* Trust-Elemente 1:1 aus der Startseite (Job 20260717-trust-elemente):
          Einzel-Bewertungen VOR dem bestehenden InfoSlider, Reputon-Widget
          danach — Slider-REUSE via Slots statt Zweitinstanz (D-045). */}
      <QiOne2Pro
        ctaHref="#shopq-buybox"
        ctaAnchor="#shopq-buybox"
        gitterchipAnimation={
          GITTERCHIP_VIDEO_DESKTOP && GITTERCHIP_VIDEO_MOBILE ? (
            <ScrollScrubVideo
              dataSection="shopq-gitterchip-video"
              srcDesktop={GITTERCHIP_VIDEO_DESKTOP}
              srcMobile={GITTERCHIP_VIDEO_MOBILE}
              overlayStart={{
                titel: 'Der GitterChipâ„¢ in Aktion',
                text: 'Scrolle: der Blick ins Innere des QiOneÂ® 2 Pro.',
              }}
              overlayEnd={[
                {
                  titel: 'KohÃ¤rente Ordnung',
                  text: 'Der GitterChipâ„¢ hilft WassermolekÃ¼len, in den kohÃ¤renten, geordneten Zustand Ã¼berzugehen.',
                },
              ]}
            />
          ) : null
        }
        trustVorSlider={<GoogleReviews dataSection="shopq-google-reviews" />}
        trustNachSlider={
          <div
            className="NormalSectionSize"
            data-section="shopq-reputon-reviews"
          >
            <ReputonWidget />
          </div>
        }
      />
    </div>
  );
}
