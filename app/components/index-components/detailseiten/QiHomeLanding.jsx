import {Link} from 'react-router';
import {LogoBar} from '~/components/reusables/LogoBar';
import {CallToAction} from '../CallToAction';
import {HeroBannerParallax} from '~/components/reusables/HeroBannerParallaxButton';
import {Studien} from '~/components/reusables/Studien';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {UpsellLineUp} from '~/components/UpsellLineUp';
import {ProductFAQ} from '~/components/ProductFAQ';
import {FAQ_QIHOME_AIR} from '~/data/product-faqs';
import { ScrollMikroskopVideo } from '../ScrollMikroskopVideo';
import { ReputonWidget } from '../ReputonWidget';

export function QiHomeLanding() {
  return (
    <div className="QiHomeLanding">
      <HeroBannerWithHRV />
      <LogoBar />
      <Expertenmeinungen />
      <h2 className="text-center mt-3">
        Matthias Cebula – Dr. Klinghardt Therapeut <br /> spricht über das QiHome® und
        die Vorteile für Kinder
      </h2>
      <YoutubeIframe link="https://www.youtube.com/embed/mH0vaUEeFqg?start=3463" />
      <ImgixVideo
        className="w-full QiHomeVideo my-[150px]!"
        videoPath="240417_QIHome_Wohlfuehloase_16x9_EN.mov"
        fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/wohlfuehl-preview.webp?v=1739746356"
      />
      <div className="NormalSectionSize">
        <ReputonWidget />
      </div>
      <Studien headline="Wirkung an menschlichen Zellen bestätigt!" />
      <ScrollMikroskopVideo />
      <HeroBannerParallax
        backgroundImage="Anna_Vers2_QiHome-1024x587.jpg_1.webp?v=1670796013"
        headline=""
        subheadline=""
        parallax={true}
      />
      <h1 className="text-center mt-3">Erschaffe dir deine Wohlfühloase</h1>
      <YoutubeIframe link="https://www.youtube.com/embed/9BmJ_pjlFMQ" />
      <TechnologieSection />
      <ImageTextBlocks />
      <GeopathogeneStrahlung />
      <CallToAction
        link="/products/qihome-air"
        linkText="Hol dir jetzt dein QiHome® Air"
        linkStyle="primary"
        img="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QIHome_82a49997-785a-4958-b924-a5e83517682a.webp?v=1736352632"
        text={
          <>
            <h2>
              Lass dein QiHome® Air kohärentes Wasser für dich produzieren
            </h2>
            <p>
              <b>
                ✅ Schutz vor E-Smog & 5G
                <br />
                ✅ Wohlfühlatmosphäre
                <br />
                ✅ Gesteigerte Anbindung zum Quantenfeld
              </b>
            </p>
          </>
        }
      />
      <SuperhumanBanner />
      <UpsellLineUp />
      <HeroBannerParallax
        backgroundImage="QiHome_inhands.webp?v=1675208300"
        headline=""
        subheadline=""
        parallax={true}
      />
      <ProductFAQ items={FAQ_QIHOME_AIR} />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="QiHomeHero">
      <div className="QiHomeHero__text">
        <h2>QiHome® Air</h2>
        <h3>
          Fördere die Gesundheit deines Zuhauses,
          <br />
          schaffe ein produktives Zuhause.
        </h3>
      </div>
      <div className="QiHomeHero__video">
        <iframe
          src="https://player.vimeo.com/video/761185626?h=6bb6547b79&background=1&autopause=0&title=0&byline=0&controls=0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function HeroBannerWithHRV() {
  return (
    <section className="QiHomeHeroBanner NormalSectionSize">
      <div className="QiHomeHeroBanner__grid">
        <div className="QiHomeHeroBanner__content">
          <h2>QiHome® Air</h2>
          <h3 style={{fontWeight: 600}}>
            4.7 <span className="qb-sterne">★★★★★</span>
          </h3>
          <h3>Mehr als 14.000+ aktive Nutzer</h3>
          <p>
            <b>Der ultimative Schutz für dich & dein gesamtes Zuhause!</b>
          </p>
          <ul className="QiHomeFeatureList">
            <li>
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647"
                className="inline-image"
                width="20"
                alt=""
              />
              Persönliches Wachstum
            </li>
            <li>
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860"
                className="inline-image"
                width="20"
                alt=""
              />
              Schutz vor E-Smog & 5G
            </li>
            <li>
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033"
                className="inline-image"
                width="20"
                alt=""
              />
              Gesteigerte Anbindung zum Quantenfeld
            </li>
          </ul>
          <p style={{color: '#396e25', marginTop: '20px'}}>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
              className="inline-image"
              style={{width: '20px', height: 'auto', marginRight: '5px'}}
              alt=""
            />
            Wirkung in Zellstudien bestätigt
          </p>
          <Link
            className="btn--primary mt-3"
            to="/products/qihome-air"
          >
            Jetzt kaufen
          </Link>
        </div>
        <div className="QiHomeHeroBanner__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qihomeaie_2.webp?v=1736352995"
            alt="QiHome Air"
            style={{width: '100%'}}
          />
        </div>
      </div>
      <div className="QiHomeHRV">
        <div className="QiHomeHRV__item">
          <h3>Normal</h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-Diagramm_Normal_OhneWlan-1.png_1.webp?v=1668151880"
            alt="HRV Normal"
          />
          <p style={{marginTop: '10px'}}>
            biol. HRV-Alter (Kurzzeit-HRV): <b>56 Jahre</b>
          </p>
        </div>
        <div className="QiHomeHRV__item">
          <h3>WLAN</h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-Diagramm_MitWlan_ESmog-1.png_1.webp?v=1668151905"
            alt="HRV WLAN"
          />
          <p style={{marginTop: '10px'}}>
            biol. HRV-Alter (Kurzzeit-HRV): <b>61 Jahre</b>
          </p>
        </div>
        <div className="QiHomeHRV__item">
          <h3>Mit QiOne®</h3>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-Diagramm_Mit_QiOne-1.png_1.webp?v=1668151931"
            alt="HRV QiOne"
          />
          <p style={{marginTop: '14px'}}>
            biol. HRV-Alter (Kurzzeit-HRV): <b>47 Jahre</b>
          </p>
        </div>
      </div>
    </section>
  );
}

function IconFeatures() {
  const features = [
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-10.jpg?v=1659033559',
      label: '5G Schutz',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-11.jpg?v=1659033547',
      label: 'Starkes Pflanzenwachstum',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-2.jpg?v=1659033527',
      label: 'Wohlfühlatmosphäre',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-1.jpg?v=1659033527',
      label: 'Ideal zum Reisen',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter.jpg?v=1659033527',
      label: 'Weicher Kalk',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-6.jpg?v=1659033527',
      label: 'Länger haltbare Lebensmittel',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-8.jpg?v=1659033527',
      label: 'Entspannte Haustiere',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-3.jpg?v=1659033526',
      label: 'Schutz vor geopathogener Strahlung',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-4.jpg?v=1659033526',
      label: 'Besucher fühlen sich wohl',
    },
    {
      img: '//cdn.shopify.com/s/files/1/0279/3095/1750/files/lighter-9.jpg?v=1659033526',
      label: 'Kohärentes Wasser',
    },
  ];

  return (
    <div className="QiHomeIconFeatures NormalSectionSize">
      <div className="QiHomeIconFeatures__grid">
        {features.map((f) => (
          <div key={f.label} className="QiHomeIconFeatures__item">
            <img src={f.img} alt={f.label} style={{width: '60%'}} />
            <h3>{f.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function Expertenmeinungen() {
  return (
    <div className="NormalSectionSize">
      <h2 className="text-center">Expertenmeinung</h2>

      <div className="QiHomeExperten__block">
        <div className="QiHomeExperten__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/image1_1.webp?v=1736354146"
            alt="Dr. Andreas Kramer & Mindy Sahagun"
            style={{borderRadius: '20px'}}
          />
        </div>
        <div className="QiHomeExperten__text">
          <p>
            <strong>Dr. Andreas Kramer & Mindy Sahagun</strong>
          </p>
          <ul>
            <li>Serial Entrepreneurs</li>
            <li>Business Owners</li>
            <li>Real Estate Professionals</li>
          </ul>
          <p className="mt-2">
            „In unserem hektischen Alltag ist es oft schwer, das Gleichgewicht
            zwischen dem Drang, voranzukommen, und der Zeit zu finden, uns zu
            zentrieren und zu reflektieren. Qi Blanco hilft uns, dieses
            Gleichgewicht zu finden. Wir nutzen die gesamte Palette der Qi
            Blanco-Produkte bereits seit mehreren Jahren, und Qi Blanco ist ein
            fester Bestandteil unseres Lebens geworden."
          </p>
          <p className="mt-2">
            <strong>– Dr. Andreas Kramer –</strong>
          </p>
          <p className="mt-2">
            "Qi Blanco hat unsere Lebensqualität verbessert, indem es eine
            bestimmte Klarheit und Intuition bereitstellt, die uns in unserer
            täglichen Interaktion mit Menschen unterstützt. Der Schutz vor
            elektromagnetischer Strahlung (EMF) ist ein zusätzlicher Bonus, da
            wir ständig am Telefon oder Computer sind."
          </p>
          <p>
            <strong>– Mindy Sahagun –</strong>
          </p>
        </div>
      </div>

      <div className="QiHomeExperten__block">
        <div className="QiHomeExperten__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Screenshot_2024-02-19_at_12.32.50.webp?v=1736366546"
            alt="Patrick Thiele"
            style={{borderRadius: '20px'}}
          />
        </div>
        <div className="QiHomeExperten__text">
          <p>
            <strong>Patrick Thiele</strong>
          </p>
          <ul>
            <li>Mentaltraining für Spitzensportler</li>
            <li>Buchautor</li>
          </ul>
          <p className="mt-2">
            „Qi Blanco ist eine herausragende Technologie, die mein Leben
            bereichert. Ich trage QiOne® 2 Pro jetzt schon seit fast 5 Jahren
            und will ihn auch nicht mehr missen. Ich hab damit vom ersten Tag an
            eine Veränderung gespürt. Ich bin weniger stressanfällig, generell
            gelassener und vor allem schlafe viel besser, was auch meine
            Schlafdaten belegen."
          </p>
          <p className="mt-2">
            <strong>– Patrick Thiele –</strong>
            <br />
            <em>World & Olympic Champion's Mental Trainer</em>
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewSection() {
  return (
    <section className="NormalSectionSize text-center">
      <h2>Mehr als 14.000 zufriedene Kunden</h2>
      <div className="mt-2">
        <h3>Deutscher Leichtathlet-Meister erleichtert</h3>
        <YoutubeIframe link="https://www.youtube.com/embed/jyLyXZqHxaw" />
      </div>
    </section>
  );
}

function ZellstudienVideo() {
  return (
    <div className="NormalSectionSize text-center">
      <h2>
        Kann man den Effekt unter dem Mikroskop sehen? Ja!
      </h2>
      <div className="mt-2">
        <ImgixVideo
          className="QiHomeZellstudienVideo"
          videoPath="230413_cellstudy_comparison_1x1_DE.mp4"
          fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/6za23iyl.webp?v=1747928138"
        />
      </div>
      <h5 className="mt-1">
        Mikroskopaufnahmen der Zellstudienveröffentlichung
        <br />
        <a
          style={{textDecoration: 'underline'}}
          href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"
          target="_blank"
          rel="noreferrer"
        >
          "Applied Cell Biology - USA - 2021"
        </a>
      </h5>
      <h5 className="mt-1">
        Video oben - ohne Schutz: abnehmende Zellregeneration.
      </h5>
      <h5 className="mt-1">
        Video unten - mit QiOne 2 Pro: normale Zellregeneration.
      </h5>
    </div>
  );
}

function TechnologieSection() {
  return (
    <div className="QiHomeTechnologie NormalSectionSize">
      <h2 className="text-center">Die Technologie hinter Qi Blanco®</h2>
      <div className="QiHomeTechnologie__grid">
        <div className="QiHomeTechnologie__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome_Chip.jpg_1.webp?v=1670805865"
            alt="QiHome Chip"
            style={{borderRadius: '20px'}}
          />
        </div>
        <div className="QiHomeTechnologie__text">
          <p>
            <strong>Für dein gesamtes Zuhause</strong>
          </p>
          <p className="mt-2">
            Der Gitterchip™ des QiHome® Air wurde dafür entwickelt, dein
            gesamtes Zuhause mit der kohärenten Struktur zu versorgen. Dafür
            sorgt ein eigens entwickelter Quarzoszillator, der den Wirkungsbereich
            des QiHome® Air um ein vielfaches verstärkt.
          </p>
          <p className="mt-2">
            Das QiHome® Air erhöht deutlich die kohärente Struktur des Wassers.
            Dies lässt sich leicht an der erhöhten Oberflächenspannung des Wassers
            erkennen. Erhöht sich der Anteil an kohärentem Wasser, maximieren sich
            folgende Effekte:
          </p>
          <p className="mt-2">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/KohaerentesWasser_cd3b0e48-323b-46f5-b537-b6aae9eb2bc9.png?v=1701116490"
              alt=""
              className="inline-image"
              style={{float: 'left', height: '40px', width: '40px', margin: '5px'}}
            />
            <b>1. Kohärentes Energiefeld</b>
            <br />
            Frequenzen können sich optimal im kohärenten Wasser ausbreiten
          </p>
          <p className="mt-2" style={{clear: 'left'}}>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/E-Smog_fe53a4d3-a271-4027-873e-74f815e4ff84.png?v=1701114521"
              alt=""
              className="inline-image"
              style={{float: 'left', height: '40px', width: '40px', margin: '5px'}}
            />
            <b>2. Molekularer E-Smog Schutz</b>
            <br />
            13% der Elektronen des kohärenten Wassers werden als eigenständige
            Elektronenhülle ausgelagert
          </p>
          <p className="mt-2" style={{clear: 'left'}}>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-icon-zellschutz-3.png_1-1.webp?v=1676976963"
              alt=""
              className="inline-image"
              style={{float: 'left', height: '40px', width: '40px', margin: '5px'}}
            />
            <b>3. Anbindung zum Quantenfeld</b>
            <br />
            Stabilisiert die Verbindung zum Quantenfeld
          </p>
          <p className="mt-2" style={{clear: 'left'}}>
            Der QiHome® Air enthält keinerlei elektronische Bauteile.
            Maßgeblich für die Funktion ist der eigens entwickelte Gitterchip™.
            Dieser prägt durch sein statisches Feld, das maßgeblich durch die
            spezifische Atompositionierung von Goldatomen erreicht wird, die
            Wassermoleküle. Somit steigt die Wahrscheinlichkeit an, dass Wasser
            Wasserstoffbrücken ausbaut. Dieser Zustand wird als kohärente
            Wasserstruktur bezeichnet und ist auch unter dem Begriff EZ-Water
            (extended zone) bekannt.
          </p>
          <p className="mt-2">
            Der kohärente Zustand des Wassers ist selbstvermehrend.
          </p>
        </div>
      </div>
    </div>
  );
}

function ImageTextBlocks() {
  return (
    <div className="QiHomeImageTextBlocks">
      <div className="QiHomeImageTextBlock">
        <div
          className="QiHomeImageTextBlock__img"
          style={{
            backgroundImage:
              'url(https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qihome-detailseite-wasser.png?v=1661927880)',
          }}
        />
        <div className="QiHomeImageTextBlock__content" style={{textAlign: 'right'}}>
          <h2>
            Unbegrenzt
            <br />
            Kohärentes Wasser
          </h2>
          <p>
            Das QiHome® Air gibt dir unbegrenzt kostenloses kohärentes
            Trinkwasser!
          </p>
          <p className="mt-2">
            Quellwasser hat von Natur aus einen hohen Anteil kohärenter
            Strukturen. Jetzt gleicht dein Leitungswasser Quellwasser – ohne
            Aufpreis!
          </p>
          <p className="mt-2">
            Unterstütze dein Wohlbefinden mit stimmigem Trinkwasser bequem von
            zu Hause aus.
          </p>
        </div>
      </div>

      <div className="QiHomeImageTextBlock QiHomeImageTextBlock--reverse">
        <div className="QiHomeImageTextBlock__content">
          <h2>
            Stärkere
            <br />
            Gesunde Pflanzen
          </h2>
          <p>
            Studien zeigen, dass Zellkulturen ca. 23 % schneller in einer
            Petrischale mit kohärentem Wasser wachsen. Mit dem QiHome® Air kannst
            du diesen Effekt jetzt auch zu Hause erleben.
          </p>
          <p className="mt-2">
            Ob der Kirschbaum in Ihrem Garten, die Geranien auf dem Balkon oder
            unsere geliebten Zimmerpflanzen - Deine Pflanzen werden durch ihre
            neue kohärente Wasserstruktur ein besseres, stärkeres Wachstum und
            eine schöne Blütenpracht erleben.
          </p>
        </div>
        <div
          className="QiHomeImageTextBlock__img"
          style={{
            backgroundImage:
              'url(https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qihome-detailseite-pflanze_55f1ac48-69ed-4e54-9469-f4a40e0bee80.png?v=1661927541)',
            backgroundPosition: 'right',
          }}
        />
      </div>

      <div className="QiHomeImageTextBlock">
        <div
          className="QiHomeImageTextBlock__img"
          style={{
            backgroundImage:
              'url(https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qihome-detailseite-orange.png?v=1661928388)',
          }}
        />
        <div className="QiHomeImageTextBlock__content" style={{textAlign: 'right'}}>
          <h2>
            Länger
            <br />
            haltbare Lebensmittel
          </h2>
          <p>
            Auch in deinem Kühlschrank baut sich eine kohärente Struktur auf.
            Beispielsweise befindet sich das Wasser in einer Bananenschale in
            einem erhöhten kohärenten Zustand. Dies verlangsamt den
            Fermentationsprozess erheblich.
          </p>
          <p className="mt-2">
            Ein weiterer Vorteil ist, dass Sie weniger Lebensmittel wegwerfen und
            mehr sparen.
          </p>
        </div>
      </div>
    </div>
  );
}

function GeopathogeneStrahlung() {
  return (
    <div className="QiHomeGeopathogen NormalSectionSize">
      <h2>Dein Schutz vor geopathogener Strahlung</h2>
      <div className="QiHomeGeopathogen__grid">
        <div className="QiHomeGeopathogen__text">
          <p>
            Geopathogene Strahlung hat viele Namen: Erdstrahlen, Wasseradern,
            Gitternetze, Gesteinsbrüche und -verwerfungen. Sie tragen ihr
            individuelles Frequenzsprektrum und können bei Menschen mit hoher
            Sensibilität Befindlichkeitstörungen hervorrufen.
          </p>
          <p className="mt-2">
            <b>
              Das QiHome® Air ist unser stärkstes und bestes System zur
              Bekämpfung der Stressoren geopathogener Strahlung.
            </b>
          </p>
        </div>
        <div className="QiHomeGeopathogen__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome.webp?v=1675207582"
            alt="QiHome Air"
            style={{borderRadius: '20px', width: '100%'}}
          />
        </div>
      </div>
    </div>
  );
}

function SuperhumanBanner() {
  return (
    <div className="QiHomeSuperhumanBanner NormalSectionSize">
      <div className="QiHomeSuperhumanBanner__grid">
        <div className="QiHomeSuperhumanBanner__image">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-masterclass-showcase-app-526x296.webp?v=1736371126"
            alt="Superhuman Masterclass"
            style={{borderRadius: '20px', width: '100%'}}
          />
        </div>
        <div className="QiHomeSuperhumanBanner__content">
          <h2>DER KOSTENLOSE VIDEO KURS VON CHRISTIAN BERND BAUER</h2>
          <p>✅ Molekularer E-Smog Schutz</p>
          <p>✅ Belastete Lebensmittel</p>
          <p>✅ Mentale Stärke</p>
          <Link to="/pages/superhuman" className="btn--secondary mt-2">
            Jetzt anmelden
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QiHomeLanding;
