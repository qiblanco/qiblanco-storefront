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
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {
  StarRating,
  SterneSprung,
} from '~/components/reusables/StarRating';

/*
 * Campaign-PDP /pages/qione-2-pro-2x — die 2er-Set-Variante der kaufbereiten
 * Paid-Strecke (Ad → LP → Campaign-PDP). Sie ersetzt das Preis-Klon-Produkt
 * „Sale: 2x QiOne® 2 Pro" (Handle jhsdhze783, draft/unlisted) durch den
 * referenzierenden Campaign-PDP-Ansatz aus Konzept „Shopseite nach LP"
 * (2026-07-16): EIN Produkt (qione-2-pro), referenziert statt dupliziert; der
 * SET-PREIS entsteht über einen Automatic Discount am Warenkorb, NICHT über ein
 * zweites Produkt mit geklontem Preis (Kap. 5, Lean-Produkt-Management).
 *
 * SHOP-NIVEAU + EINE KAUFLOGIK PER KONSTRUKTION: dieselbe geteilte QiOneBuyBox
 * wie die organische PDP und wie /pages/qione-2-pro — kein Nachbau, kein zweiter
 * AddToCart-Pfad (Konzept Kap. 3: „eine Kauflogik, ein zweiter AddToCart-Pfad
 * wäre eine Fehlerquelle"). Der EINZIGE Kauf-Delta gegenüber /pages/qione-2-pro:
 *   - quantity={2}  → die eine Add-to-Cart-Zeile legt 2 Stück ins Warenkorb,
 *   - ctaLabel      → „2er-Set in den Warenkorb",
 * beides additive Buy-Box-Props (Default 1 lässt PDP + Einzel-Campaign-PDP
 * byte-identisch). Kein Query-Delta: geteilte PRODUCT_QUERY, Handle „qione-2-pro"
 * (Ware identisch dargestellt, Code-Invariante).
 *
 * SET-PREIS = AUTOMATIC DISCOUNT (nicht im Code): Die Buy-Box zeigt den echten
 * Shopify-Einzelpreis (ProductPrice, live). Der 2er-Set-Rabatt wird am Warenkorb
 * automatisch abgezogen (Shopify Automatic Discount, Mindestmenge 2 auf
 * qione-2-pro). Deshalb stehen hier BEWUSST keine hartcodierten Preis-/Spar-
 * Zahlen (Konzept Kap. 2: „Claims: null hardcodiert" — Preis lebt im Katalog,
 * Rabatt im Discount, nicht in JSX). Der Discount selbst ist Christian-Gate
 * (Geld, Konzept M4); diese Seite ist nur die Referenz-Fassade.
 *
 * CLAIMS: »4,8 ★« + »Über 14.000 Nutzer« sind kennzahlen-kanonisch
 * (fakten-basis.yaml) und als kennzahl_ref-Claims legitimiert — via claim(),
 * identisch zu /pages/qione-2-pro.
 *
 * TRACKING (D-006): KEIN Pixel-Code hier. ViewContent kommt aus der geteilten
 * QiOneBuyBox (<Analytics.ProductView>, quantity 1 = Produkt-View, Parität zur
 * PDP); AddToCart feuert als Cart-Event mit der echten Set-Menge. R1/R2/R3
 * hängen pfad-agnostisch im root-Layout.
 */
export function QiOne2Pro2xShop({product}) {
  return (
    <div className="shopq2x">
      {/* Kampagnen-Eyebrow: Scent „2er-Set" + Mechanik-Hinweis (kein Preis-
          Claim, keine Zahl — der Setpreis wird am Warenkorb automatisch
          abgezogen). */}
      <div className="shopq2x-eyebrow" data-section="shopq2x-eyebrow">
        <span className="shopq2x-eyebrow__tag">2er-Set Aktion</span>
        <p>
          Zwei&nbsp;× QiOne® 2 Pro sichern — der Set-Vorteil wird im Warenkorb
          automatisch abgezogen.
        </p>
      </div>

      <section id="shopq2x-buybox" data-section="shopq2x-buybox">
        <QiOneBuyBox
          product={product}
          quantity={2}
          ctaLabel="2er-Set in den Warenkorb"
          socialProof={
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
          priceLabel={
            <div className="BestsellerLabel">2er-Set — Set-Vorteil im Warenkorb</div>
          }
          benefitList={<QiOneBenefitList />}
        />
      </section>
      {/* Scent-Anker der 4 LP-Herkünfte (global gestylt, shop-kompatibel) */}
      <DreiThemenBand dataSection="shopq2x-drei-themen" block="lp" />
      <QiOne2Pro
        block="lp"
        ctaHref="#shopq2x-buybox"
        ctaAnchor="#shopq2x-buybox"
        gitterchipAnimation={
          <GitterchipMoleculesScrub dataSection="shopq2x-gitterchip-video" />
        }
        trustVorSlider={<GoogleReviews dataSection="shopq2x-google-reviews" />}
        trustNachSlider={
          <div
            className="NormalSectionSize"
            data-section="shopq2x-reputon-reviews"
          >
            <ReputonWidget />
          </div>
        }
      />
    </div>
  );
}
