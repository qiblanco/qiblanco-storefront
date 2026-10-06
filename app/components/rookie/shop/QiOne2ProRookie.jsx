import {QiOneBuyBox, QiOneBenefitList} from '~/components/product-pages/QiOneBuyBox';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {KaufZusagePunkte} from '~/components/reusables/KaufZusage';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import {Geraetevergleich, Kundenfragen} from '~/components/reusables/AmazonStil';
import {teileFragen} from '~/components/reusables/amazonstil-daten';
import {BLOCK_LP} from '~/components/reusables/blockLinks';
import {QiOneHeroBulletsPages} from '~/components/product-pages/QiOneHeroBulletsPages';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {HeroBannerParallax} from '~/components/reusables/HeroBannerParallaxButton';
import {RatenzahlungHerobanner} from '~/components/reusables/RatenzahlungHerobanner';
import {ProductFAQ} from '~/components/ProductFAQ';
import {FAQ_QIONE_2_PRO} from '~/data/product-faqs';
import {RisikofreiErleben, MassgeschneiderteTechnologie} from './bestandsbloecke';
import {StickyWarenkorb} from './StickyWarenkorb';

/*
 * ROOKIE DER SHOPSEITE: /pages/qione-2-pro-b (Experiment q2p-e1-gs080,
 * Hypothese GS-080 = Stufe-1-Paket des Stufenplans
 * heatmap-manager/config/hypothesen-stufenplan.yaml, Christian 06.10.2026).
 * Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-startseite, s02;
 * Spezifikation KONZEPT.md Abschnitt 3 und 3a.
 *
 * Champion A ist /pages/qione-2-pro (QiOne2ProSeite.jsx). B ist dieselbe Ware
 * aus denselben Bausteinen, nur andere Auswahl und Reihenfolge. A bleibt
 * unberührt; keine Datei von A wird hier geändert.
 *
 * DAS PAKET (drei Bestandteile, ein Test):
 *  1. Knöpfe: Sticky "In den Warenkorb legen" mobil, sobald die Buybox aus dem
 *     Bild ist, mit Rücknahme-, Raten- und Bewertungszeile (StickyWarenkorb).
 *     Die vier "Hole dir jetzt deinen QiOne 2 Pro"-Wiederholungen von A
 *     (50/55/72/78 % der Seite) werden zwei: Ratenbanner und Schlussbanner.
 *  2. Animationen raus: kein GitterChip-Scrollvideo, kein Mikroskop-
 *     Scrollvideo, der Schlussbanner ohne Parallax. Die Video-Kachel in der
 *     Buybox bleibt (nur auf Klick, keine Scrollbindung).
 *  3. Kürzen: A misst mobil 39,2 Bildschirme (390x844, 06.10.). Raus sind
 *     Studien-Karten, Gründerinterview, Chip-Design und Chip-Vergleich,
 *     Gitterchip-Erklärung, Kohärenz-Banner, geopathogene Strahlung,
 *     Delventhal-Video, Upsell-Reihe, "Einmal investieren", Main Features,
 *     Logo-Leiste und der zweite Ratenblock. A und /pages/qione-2-pro-details
 *     behalten sie.
 *
 * REIHENFOLGE: Buybox, dann der Beweis an der Entscheidung (Google-
 * Bewertungen, Kundenfragen direkt darunter wie auf A seit Christian
 * 28.09.2026, die 20-Tage-Garantie), dann Menschen (Instagram), Nutzen
 * (InfoSlider), Herstellung (Preis), Raten mit Knopf, der Gerätevergleich
 * HINTER den Belegen (GS-068: erst das eine Produkt, dann die Auswahl), der
 * Schlussbanner mit Knopf und die übrigen Fragen.
 *
 * MESSANKER WIE A: dieselben data-section-Namen für dieselben Blöcke
 * (shopq-buybox, shopq-reputon-reviews) und dasselbe Sprungziel
 * #shopq-buybox, damit der Heatmap-Manager Block gegen Block vergleicht. Neu
 * ist nur shopq-b-sticky-warenkorb (der Sticky-Knopf, den A nicht hat).
 * shopq-gitterchip-video entfällt mit dem Block.
 */

const ANKER_BUYBOX = 'shopq-buybox';
const ANKER_REZENSIONEN = 'shopq-reputon-reviews';

export function QiOne2ProRookie({product, vergleichsPreise}) {
  const fragen = teileFragen('qione-2-pro', FAQ_QIONE_2_PRO);
  const zurBuybox = `#${ANKER_BUYBOX}`;

  return (
    <div className="qb-rookie-shop">
      {/* Buybox mit denselben Slots wie A (QiOne2ProSeite.jsx). Die
          SSR-Gleichheit beider Buyboxen misst die Naht-Probe des Segments. */}
      <QiOneBuyBox
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        ankerId={ANKER_BUYBOX}
        dataSection={ANKER_BUYBOX}
        product={product}
        gewaehrleistungsHinweis={false}
        socialProof={
          <SterneSprung className="product-rating"><span style={{color: 'var(--color-accent-ink)'}}>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        }
        description={<QiOneHeroBulletsPages />}
        topBadge={
          <p className="mt-2">
            <b>Mehr als 14.000+ aktive Nutzer</b>
          </p>
        }
        priceLabel={<div className="BestsellerLabel">Bestseller Angebot</div>}
        benefitList={
          <QiOneBenefitList
            vorPunkte={
              <KaufZusagePunkte
                preis={product?.selectedOrFirstAvailableVariant?.price}
                handle={product?.handle}
              />
            }
            zusatzPunkt={<EuGewaehrleistungsListenpunkt />}
          />
        }
      />
      <div data-qb-block="zufriedene-kunden" style={{display: 'contents'}}>
        <GoogleRezensionenBereich dataSection={ANKER_REZENSIONEN} />
      </div>
      <Kundenfragen handle="qione-2-pro" oben={fragen.oben} alle={FAQ_QIONE_2_PRO} />
      <div className="ProductPageQiOne qb-rookie-teil">
        <RisikofreiErleben />
      </div>
      <IgTestimonialSlideshow produkt="QiOne 2 Pro" />
      <div className="ProductPageQiOne qb-rookie-teil">
        <InfoSlider />
        <MassgeschneiderteTechnologie />
        <RatenzahlungHerobanner
          link={zurBuybox}
          linkText={'Hole dir jetzt deinen QiOne® 2 Pro'}
          img={'ratenzahlungs-banner.webp?v=1752531325'}
          text={
            <>
              <h2>Dein Wunsch. Deine Freiheit <br />
              Jetzt mit 0% Finanzierung.²
              </h2>
            </>
          }
          paypal={true}
          klarna={true}
        />
      </div>
      <Geraetevergleich
        handle="qione-2-pro"
        block={BLOCK_LP}
        preise={vergleichsPreise}
        eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
      />
      <div className="ProductPageQiOne qb-rookie-teil">
        {/* Derselbe Banner wie auf A, ohne Parallax (Bestandteil
            "Animationen raus"). */}
        <HeroBannerParallax
          backgroundImage={'/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'}
          headline={<>Dein QiOne® 2 Pro sorgt für dich<br />Tag und Nacht.</>}
          subheadline={"Navigiere klar und ruhig durch's Leben."}
          link={zurBuybox}
          linkStyling={'primary'}
          linkText={'Hole dir jetzt deinen QiOne® 2 Pro'}
        />
        <ProductFAQ items={fragen.unten} />
      </div>
      <StickyWarenkorb product={product} buyboxSelektor={`#${ANKER_BUYBOX}`} />
    </div>
  );
}
