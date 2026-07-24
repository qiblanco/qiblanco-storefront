import {Link} from 'react-router';
import LazyImage from '~/components/reusables/LazyImage';
import {LogoBar} from '~/components/reusables/LogoBar';
import {Richtext} from '~/components/reusables/Richtext';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {CallToAction} from '~/components/index-components/CallToAction';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {StarRating, GOOGLE_REVIEWS_URL} from '~/components/reusables/StarRating';

/*
 * US-Startseite /en-us (Vorabversion, Job 20260720-usa-seite-auf-dach-basis-
 * vorabversion s05): DACH-Startseiten-STRUKTUR als Traeger (dieselbe
 * Sektions-Dramaturgie + dieselben CSS-Klassen aus app.css), EN-Inhalt
 * destilliert aus der LIVE US-Seite qi-blanco.com (curl 2026-07-20,
 * read-only) — NICHT woertlich uebersetzt (mp6 Kap. 3: Claims neu
 * legitimiert; "coherent water" NIE als Tatsachenbehauptung, stets
 * "designed to/supports the formation ... which many users perceive").
 *
 * BEWUSSTE Abweichungen vom DACH-Traeger (belegt):
 * - Finanzierungsbanner (Klarna 0 %) entfaellt — Raten-Botschaft ist
 *   bewusst "nur EUR" (M3c, Konzept 1a Kap. 2.5).
 * - Superhuman-Videokurs-Sektion entfaellt — Kursmaterial existiert nur
 *   deutsch, eine leere EN-Kurs-Route waere ein leeres Versprechen
 *   (Konzept 1a Kap. 3 ii, Kurs-Funnel v1 zurueckgestellt).
 * - GoogleReviews (deutsche Zitate) ersetzt durch EN-Nutzerstimmen von der
 *   Live-US-Seite; YouTube-Testimonials = die EN-Embeds der Live-US-Seite.
 * - Produkt-CTAs verlinken NUR auf existierende /en-us-Routen (Zweiblock-/
 *   Leak-Disziplin D-053): QiBracelet/QiHome erscheinen ohne Kauf-Link.
 */
export function UsHomeSections() {
  return (
    <div className="home">
      <UsHero dataSection="hero" />
      <UsCellDiagrams dataSection="zell-diagramme" />

      <LogoBar dataSection="logo-bar" />

      <Richtext
        dataSection="nutzer-statistik"
        alignment="center"
        text={
          <h2>
            “87% of users report positive changes in their
            <br /> well-being with Qi Blanco® products.”
          </h2>
        }
      />

      <UsUserVoices dataSection="us-user-voices" />

      <YoutubeIframe
        dataSection="youtube-testimonial-1"
        link="https://www.youtube.com/embed/omlr-AUlStc?controls=0" />
      <YoutubeIframe
        dataSection="youtube-testimonial-2"
        link="https://www.youtube.com/embed/pyrpeSmdI2o?controls=0" />
      <YoutubeIframe
        dataSection="youtube-testimonial-3"
        link="https://www.youtube.com/embed/UaSOrAR6MgQ?controls=0" />

      <UsPeerReviewStudies />

      <UsStudies dataSection="studien" headline="Effect confirmed in human cell studies" />

      <div className="NormalSectionSize text-center" data-section="chip-design">
        <h2>
          Thanks to innovative chip design: <br />
          QiOne® 2 Pro and QiBracelet® — now 8x stronger!
        </h2>
        <p style={{marginBottom: '50px'}}>
          <b>
            Personal growth, reduced exposure concerns around everyday
            electronics, and a stronger sense of connection
          </b>
        </p>
      </div>
      <ScrollScrubVideo
        dataSection="gitterchip-video"
        srcDesktop="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-desktop-16x9.mp4?v=1784313940"
        srcMobile="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-mobile-9x16.mp4?v=1784313946"
        overlayStart={{
          titel: 'The GitterChip™ in action',
          text: 'Scroll: a look inside the QiOne® 2 Pro.',
        }}
        overlayEnd={[
          {
            titel: 'Ordered structure',
            text: 'The GitterChip™ is designed to support water molecules in transitioning toward an ordered, coherent state.',
          },
        ]}
      />
      <div className="text-center mt-2" data-section="chip-cta">
        <Link className="btn--primary m-center" to="/en-us/pages/qione-2-pro">
          Get your QiOne® 2 Pro now
        </Link>
      </div>

      <UsFeaturedProduct
        dataSection="featured-qione-2-pro"
        title="QiOne® 2 Pro"
        label="Compact. Innovative. Powerful."
        shopLink="/en-us/pages/qione-2-pro"
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_02_transparent_1.webp?v=1666591442"
      />
      <UsFeaturedProduct
        dataSection="featured-qibracelet"
        title="The QiBracelet®"
        label="Elegance & protection — your support."
        note="Coming to this store soon"
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/02_2048px-Alpha_1.webp?v=1667284591"
      />
      <UsFeaturedProduct
        dataSection="featured-qihome-air"
        title="The QiHome® Air"
        label="Healthy home, productive environment."
        note="Coming to this store soon"
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome_side_alpha2-800x868-1_1.png?v=1667284770"
      />

      <CallToAction
        dataSection="cta-kohaerentes-wasser"
        text={
          <>
            <h2>
              QiOne® 2 Pro — designed to support coherent water structuring,
              wherever you are
            </h2>
            <p className="CallToActionBenefits">
              <strong>✅ 100% engineered and made in Germany</strong>
            </p>
            <p className="CallToActionBenefits">
              <strong>✅ Free, fully insured shipping to the U.S.</strong>
            </p>
            <p className="CallToActionBenefits">
              <strong>✅ No surprises — all duties and taxes included</strong>
            </p>
          </>
        }
        link={'/en-us/pages/qione-2-pro'}
        linkStyle={'primary'}
        linkText={'Experience the difference now'}
        img={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ezgif-5-b78604ff40.webp?v=1682415134'}
      />
    </div>
  );
}

/*
 * EN-Variante der HerobannerFeatured (DOM/Klassen identisch zum DACH-
 * Traeger, Inhalt = Live-US-Hero + US-Trust-Signale: free & insured
 * shipping from Germany, duties/taxes included).
 */
function UsHero({dataSection}) {
  return (
    <div className="HerobannerFeatured NormalSectionSize" data-section={dataSection}>
      <h1 className="text-center">
        Wearable high-tech <br /> with measurable effects at the cellular level
      </h1>
      <div className="herobanner-seperator g-10p flex-container flex-row small--flex-column flex-align-start flex-justify-space-between">
        <div className="text-content">
          <div className="hide-desktop">
            <LazyImage
              compressedLink={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db_small.webp?v=1673788196'}
              highQualityLink={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196'}
            />
          </div>
          <h2>QiOne® 2 Pro</h2>
          <p className="color-accent-main">
            <strong>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{textDecoration: 'none'}}
                aria-label="4.7 out of 5 stars — see Google reviews for Qi Blanco"
              >
                4.7 <StarRating value={4.7} />
              </a>
            </strong>
          </p>
          <p>
            <strong>Over 14,000 active users</strong>
          </p>
          <p className="mt-1">
            <strong>
              Discover the benefits of coherent water structuring — as
              experienced by our users
            </strong>
          </p>
          <p className="mt-1">
            <img
              width="17"
              height="17"
              className="inline-image"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647"
              alt="Personal growth"
            />
            &nbsp; Personal growth
          </p>
          <p>
            <img
              width="17"
              height="17"
              className="inline-image"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860"
              alt="More restful nights"
            />
            &nbsp; More energy. Deeper sleep.
          </p>
          <p>
            <img
              width="17"
              height="17"
              className="inline-image"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033"
              alt="A stronger sense of connection"
            />
            &nbsp; A stronger sense of connection
          </p>
          <p className="mt-1 cellstudies-checkmark">
            <img
              width="17"
              height="17"
              className="inline-image"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
              alt="Effect confirmed in cell studies"
            />
            <strong>&nbsp; Effect confirmed in cell studies</strong>
          </p>
          <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-start g-10p mt-2">
            <Link prefetch="intent" to="/en-us/pages/qione-2-pro" className="btn--primary">
              Shop now
            </Link>
            <Link prefetch="intent" to="/en-us/pages/qione-2-pro" className="btn--secondary">
              Learn more
            </Link>
          </div>
          <p className="micro-text mt-1">
            <strong>
              ✓ Free shipping — directly from Germany&ensp;
              ✓ Fully insured &amp; trackable delivery&ensp;
              ✓ No extra costs — all duties and taxes included
            </strong>
          </p>
        </div>
        <div className="featured-image hide-mobile">
          <LazyImage
            compressedLink={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db_small.webp?v=1673788196'}
            highQualityLink={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196'}
          />
        </div>
      </div>
    </div>
  );
}

/* EN-Variante der ZellDiagramme (identische Diagramm-Assets, EN-Beschriftung
   von der Live-US-Seite). */
function UsCellDiagrams({dataSection}) {
  return (
    <div className="ZellDiagramme NormalSectionSize" data-section={dataSection}>
      <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p">
        <div className="ZellDiagramm text-center">
          <h3>
            Cell regeneration
            <br />
            under EMF stress
          </h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_1.webp?v=1741513920"
            alt="Cell diagram"
          />
          <p className="micro-text text-left">
            Study on QiOne® 2 Pro with intestinal epithelial cells. <br />
            “Protective Effect of QiOne® 2 Pro on Cultured Intestinal <br />
            Epithelial Cells after Mobile Phone Radiation.”
          </p>
        </div>
        <div className="ZellDiagramm text-center">
          <h3>
            Cell barrier function
            <br />
            under EMF stress
          </h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_2.webp?v=1741513920"
            alt="Cell diagram"
          />
          <p className="micro-text text-left">
            Study on QiOne® 2 Pro with intestinal epithelial cells. <br />
            “Protective Effect of QiOne® 2 Pro on Cultured Intestinal <br />
            Epithelial Cells after Mobile Phone Radiation.”
          </p>
        </div>
        <div className="ZellDiagramm text-center">
          <h3>
            Cell viability
            <br />
            under oxidative stress
          </h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_3.webp?v=1741513921"
            alt="Cell diagram"
          />
          <p className="micro-text text-left">
            Study on QiBracelet® with liver cells. <br />
            “Protective Effect of the QiBracelet® Against Oxidative Stress.”
          </p>
        </div>
      </div>
    </div>
  );
}

/* EN-Nutzerstimmen — Zitate 1:1 von der LIVE US-Startseite (dort
   veroeffentlichte Kundenstimmen; gekuerzt, kein neuer Claim erfunden). */
function UsUserVoices({dataSection}) {
  return (
    <div className="NormalSectionSize" data-section={dataSection}>
      <h2 className="text-center">Over 14,000 satisfied users</h2>
      <p className="text-center">
        <strong>
          4.7 <StarRating value={4.7} />
        </strong>
      </p>
      <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p mt-3">
        <div className="text-left">
          <p>
            “I am very satisfied with the effect of the QiOne. I sleep much
            better, am more rested and less stressed during the day. […] My
            husband also sleeps much more peacefully since he started wearing
            the QiOne.”
          </p>
          <p className="micro-text mt-1">
            <strong>Sandra J.</strong>
          </p>
        </div>
        <div className="text-left">
          <p>
            “The QiOne looks beautiful. […] I sleep incredibly deeply and feel
            noticeably calm after waking up. And even if it were just a nice
            necklace, I wouldn’t want to take it off again.”
          </p>
          <p className="micro-text mt-1">
            <strong>Melanie M.</strong>
          </p>
        </div>
        <div className="text-left">
          <p>
            “One of the few chains you really need in life. Brings increased
            balance, restful sleep and more energy after just a few days.
            Everyone in my family wears one.”
          </p>
          <p className="micro-text mt-1">
            <strong>Marla W.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

/* EN-Variante der PeerReviewStudies-Sektion (Zahlen identisch zum DACH-
   Traeger — dieselben publizierten Zellstudien). */
function UsPeerReviewStudies() {
  return (
    <div className="PeerReviewStudies NormalSectionSize text-center" data-section="peer-review-studien">
      <h2 className="text-center">6 years of research</h2>
      <p>
        <b>Results of our peer-reviewed, controlled cell studies</b>
      </p>
      <div className="PeerReviewResults">
        <div className="PeerReviewResult">
          <h3>75.0% reduction</h3>
          <p>in cell strain caused by oxidative stress.</p>
        </div>
        <div className="PeerReviewResult">
          <h3>10-fold improvement</h3>
          <p>of the cell barrier function (TEER value).</p>
        </div>
        <div className="PeerReviewResult">
          <h3>87.1% less</h3>
          <p>
            cell damage and destruction caused by
            <br />
            electromagnetic radiation.
          </p>
        </div>
      </div>
    </div>
  );
}

/* EN-Variante der Studien-Sektion — identische Publikations-PDFs, EN-
   Beschriftung von der Live-US-Seite; Direktlinks statt /pages/studien
   (keine EN-Studien-Route in der Vorabversion). */
function UsStudies({headline, dataSection}) {
  return (
    <div className="Studien NormalSectionSize" data-section={dataSection}>
      <h2 className="text-center">{headline}</h2>
      <div className="FlexContainer text-center">
        <div className="Row mt-3">
          <div className="Column">
            <h3>Scientific publication on immune cells</h3>
            <p>published in the Japan Journal of Medicine on April 30, 2021</p>
            <a
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510"
                alt="Study preview"
              />
            </a>
          </div>
          <div className="Column">
            <h3>Scientific publication on intestinal cells</h3>
            <p>published in the Applied Cell Biology Journal, 2021</p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143"
                alt="Study preview"
              />
            </a>
          </div>
        </div>
        <div className="Row mt-3">
          <div className="Column">
            <h3>Scientific publication on oxidative stress</h3>
            <p>published in the Applied Cell Biology Journal on January 12, 2024</p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell_Biology_Cover_Remake_Seite_3.png?v=1710540229"
                alt="Study preview"
              />
            </a>
          </div>
          <div className="Column">
            <h3>Research article on user experience</h3>
            <p>
              published in Advances in Bioengineering &amp; Biomedical Science
              Research on May 10, 2024
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell-Biology-Cover-Remake-Seite-4.webp?v=1717500844"
                alt="Study preview"
              />
            </a>
          </div>
        </div>
      </div>
      <p className="text-center mt-2 mb-2">
        <strong>
          Scientifically tested and confirmed in international peer-reviewed
          publications.
        </strong>
      </p>
    </div>
  );
}

/* EN-Variante der FeaturedProduct-Karte: CTAs NUR auf existierende
   /en-us-Routen; ohne shopLink erscheint eine neutrale Notiz statt Link. */
function UsFeaturedProduct({title, label, shopLink, note, bildLinks, bildRechts, dataSection}) {
  return (
    <div className="FeaturedProduct" data-section={dataSection}>
      <h2>{title}</h2>
      <h3>{label}</h3>
      <div className="FeaturedProduct_Links">
        {shopLink ? (
          <>
            <Link prefetch="intent" to={shopLink}>
              Learn more
            </Link>
            <Link prefetch="intent" to={shopLink}>
              Shop now
            </Link>
          </>
        ) : (
          <span>{note}</span>
        )}
      </div>
      <div className="FeaturedProduct_ImageWrapper">
        <img src={bildLinks} alt={title} />
        <img src={bildRechts} alt={title} />
      </div>
    </div>
  );
}
