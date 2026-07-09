import {HerobannerFeatured} from '~/components/index-components/HerobannerFeatured';
import {ZellDiagramme} from '~/components/index-components/ZellDiagramme';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {LogoBar} from '~/components/reusables/LogoBar';
import {Richtext} from '~/components/reusables/Richtext';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {Studien} from '~/components/reusables/Studien';
import {FeaturedProduct} from '~/components/index-components/FeaturedProduct';
import {UpsellLineUp} from '~/components/UpsellLineUp';
import {Maxim} from '~/components/small-components/Maxim';
import {Finanzierungsbanner} from '~/components/index-components/Finanzierungsbanner';
import {SingleImage} from '~/components/reusables/SingleImage';
import {CallToAction} from '~/components/index-components/CallToAction';
import {HeroBanner} from '~/components/reusables/HeroBannerParallax';
import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';

/**
 * Reine Praesentationskomponente: exakt das Sektions-JSX der Startseite.
 * Kein useLoaderData — der gerenderte DOM ist byte-identisch zur Startseite.
 *
 * @param {{overrides?: object}} props
 *   `overrides` ist ein Stufe-2-Hook (LP-spezifische Anpassung von Sektionen)
 *   und wird JETZT bewusst NICHT ausgewertet. Vorhanden, damit eine neue LP
 *   spaeter nur einen Registry-Eintrag + eine Duennroute braucht.
 */
export function HomepageSections({overrides = {}}) {
  return (
    <div className="home">
      <HerobannerFeatured />
      <ZellDiagramme/>

      <LogoBar/>

      <Richtext
        alignment="center"
        text={<h2>"87 % der Nutzer berichten von positiven <br /> Veränderungen in ihrem Wohlbefinden nach der <br /> Anwendung der Qi Blanco® Produkte."</h2>} />
      <InfoSlider />
    <GoogleReviews />
    <div className="NormalSectionSize">
      <ReputonWidget />
    </div>
      <YoutubeIframe
        link="https://www.youtube.com/embed/jyLyXZqHxaw?si=2ZVH9xtaSaEMmfTQ&amp;controls=0" />
      <YoutubeIframe
        link="https://www.youtube.com/embed/aG36zJKxDzg?si=cF6ATzVJfU8kpZUd&amp;controls=0" />
      <YoutubeIframe
        link="https://www.youtube.com/embed/zIfDQ1N60fI?si=2ZVH9xtaSaEMmfTQ&amp;controls=0" />

      <PeerReviewStudies />

      <Studien headline="Wirkung an menschlichen Zellen bestätigt!" />

      <ScrollMikroskopVideo />

      <Maxim />

      <Finanzierungsbanner />

      <div className='NormalSectionSize text-center'>
      <h2>
        Dank innovativem Chip-Design: <br />
        QiOne® 2 Pro und QiBracelet® - Jetzt 8x stärker!
      </h2>
      <p style={{marginBottom: "50px"}}><b>Persönliches Wachstum, Schutz vor 5G & E-Smog,
        Gesteigerte Anbindung zum Quantenfeld</b></p>
      </div>
      <SingleImage link={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/GitterChips_Vergleich-min.webp?v=1699381065"} size={"normal"}/>
      <div className="text-center mt-2">
        <a className="btn--primary m-center" href="/products/qione-2-pro">Hole dir jetzt deinen QiOne® 2 Pro</a>
      </div>
      <FeaturedProduct
        linkKaufseite="/products/qione-2-pro"
        linkDetailseite="/pages/qione"
        title="QiOne® 2 Pro"
        label="Kompakt. Innovativ. Stark."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_02_transparent_1.webp?v=1666591442" />
      <FeaturedProduct
        linkKaufseite="/products/qibracelet"
        linkDetailseite="/pages/qibracelet"
        title="Das QiBracelet®"
        label="Eleganz und Schutz - dein Support."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/02_2048px-Alpha_1.webp?v=1667284591" />
      <FeaturedProduct
        linkKaufseite="/products/qihome-air"
        linkDetailseite="/pages/qihome"
        title="Das QiHome® Air"
        label="Gesundes Zuhause, produktives Umfeld."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome_side_alpha2-800x868-1_1.png?v=1667284770" />

      <CallToAction text={
        <>
        <h2>Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren</h2>
        <p className="CallToActionBenefits">
          <strong>✅ 100% deutsche Produktion</strong>
        </p>
        <p className="CallToActionBenefits">
          <strong>✅ Hochwertigste Materialien</strong>
        </p>
        <p className="CallToActionBenefits">
          <strong>✅ Weltweiter Versand</strong>
        </p>
      </>
      }
      link={"/products/qione-2-pro"}
      linkStyle={"primary"}
      linkText={"Erlebe jetzt den Unterschied"}
      img={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ezgif-5-b78604ff40.webp?v=1682415134"} />
      <div className="Stretched mt-[100px]!">
      <HeroBanner
        backgroundImage={"qiblanco-com-in-5-stufen-zum-superhuman-hintergrund.png?v=1645178965"}
        headline="Der Qi Blanco® Video-Kurs:"
        subheadline="In 5 Stufen zum Superhuman"
        height={300}
        parallax={true}/>
      </div>
        <CallToAction
          img={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-masterclass-showcase-app-526x296.png?v=1645756351"}
          text={
          <>
            <h2>DER KOSTENLOSE VIDEO-KURS</h2>
            <p><strong>Erfahre, wie du in 5 einfachen Schritten:</strong></p>
            <p className='mt-2'><strong>✅ Deinen Körper von Umweltgiften befreist</strong></p>
            <p><strong>✅ Deine mentale Stärke aufbaust</strong></p>
            <p><strong>✅ Dich effektiv gegen E-Smog und 5G schützt</strong></p>
          </>
          }
          link={"/pages/superhuman"}
          linkStyle={"secondary"}
          linkText={"Jetzt kostenlos starten"}
        />
      <UpsellLineUp />
    </div>
  );
}

function PeerReviewStudies(){
  return (
    <div className='PeerReviewStudies NormalSectionSize text-center'>
      <h2 className='text-center'>
        6 Jahre Forschung
      </h2>
      <p><b>Ergebnisse unserer Peer-Review kontrollierten Zellstudien</b></p>
      <div className="PeerReviewResults">
        <div className="PeerReviewResult">
          <h3>75,0 % Reduktion</h3>
          <p>der Zellbelastung durch oxidativen Stress.</p>
        </div>
        <div className="PeerReviewResult">
          <h3>10-fache Verbesserung</h3>
          <p>der Zell-Barrierefunktion (TEER-Wert).</p>
        </div>
        <div className="PeerReviewResult">
          <h3>87,1 % geringere</h3>
          <p>Zellschädigung und -zerstörung durch<br/>elektromagnetische Strahlung.</p>
        </div>
      </div>
    </div>
  )
}
