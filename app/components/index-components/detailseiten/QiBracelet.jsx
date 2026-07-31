import {Link} from 'react-router';
import {LogoBar} from '~/components/reusables/LogoBar';
import {ScrollMikroskopVideo} from '../ScrollMikroskopVideo';
import {CallToAction} from '../CallToAction';
import {HeroBannerParallax} from '~/components/reusables/HeroBannerParallaxButton';
import {ZellDiagramme} from '../ZellDiagramme';
import {UpsellLineUp} from '~/components/UpsellLineUp';
import { ReviewCount } from '~/components/reusables/ReviewCount';
import { Studien } from '~/components/reusables/Studien';
import { YoutubeIframe } from '~/components/reusables/YoutubeIframe';
import { HeroBanner } from '~/components/reusables/HeroBannerParallax';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
export function QiBracelet() {
  return (
    <div className="Detailseite">
      <HerobannerBracelet />
      <LogoBar />
      <Expertenmeinungen />
      <LeistungsstarkeUnterstutzung />
      <Studien headline={"Wirkung an menschlichen Zellen bestätigt!"} />
      <ScrollMikroskopVideo />
      <h2 className="text-center">Zelluntersuchungen</h2>
      <ZellDiagramme />
      <LeistungsstarkeUnterstutzungReverse />
      <Superzustand />
      <CallToAction
        img={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha-1024x1024.png_1.webp?v=1670806857'
        }
        link={'/products/qibracelet'}
        linkStyle={'secondary'}
        linkText={"Hol' dir jetzt deinen QiBracelet®"}
        text={
          <>
            <h2>
              Lass dein QiBracelet® kohärentes Wasser für dich produzieren
            </h2>
            <p className="mt-2">
              <b>
                ✅ 100% deutsche Produktion <br />
                ✅ Hochwertigste Materialien <br />
                ✅ Weltweiter Versand
              </b>
            </p>
          </>
        }
      />
      <TechnologieQiBlanco />
      <BraceletYT />
      <div className="Stretched" style={{marginTop: "150px"}}>
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
      {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
          Live-Reputon + Überschrift + Anker für den 4,8-Banner-Klick. */}
      <GoogleRezensionenBereich />
      <UpsellLineUp />
    </div>
  );
}

function Expertenmeinungen() {
  return (
    <>
      <h2 className="text-center">Expertenmeinungen</h2>
      <div className="NormalSectionSize mt-2">
        <div className="Expertenmeinung">
          <div className="Expertenmeinung-Bild">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/85M0173-new_63389798-effc-45f5-abd5-d2eb0ea2484d.jpg?v=1674072788"
              alt=""
            />
          </div>
          <div className="Expertenmeinung-Text">

            <ul>
              <li>Mental Trainer vom aktuellen deutschen Olympia-Leichtathletik-Team</li>
              <li>Gründer von PRO MIND ATHLETE</li>
            </ul>
            <p></p>
            <p>
              "Nachdem ich inzwischen schon seit fast zwei Jahren den QiOne® 2 Pro trage, war das QiBracelet® nochmal ein unglaublich kraftvolles Upgrade für mich. Nicht nur in meinen Meditationen, sondern auch im Arbeitsalltag spüre ich die verbesserte Verbindung zu meinem Körper und den gestiegenen Fokus ganz deutlich."
            </p>
            <p>
              <strong>– Patrick Thiele  –</strong>
            </p>
          </div>
        </div>
        <div className="Expertenmeinung">
          <div className="Expertenmeinung-Bild">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/image1_1.jpg?v=1707860985"
              alt=""
            />
          </div>
          <div className="Expertenmeinung-Text">
            <p>
              <strong>Dr. Andreas Kramer &amp; Mindy Sahagun</strong>
            </p>
            <ul>
              <li>Serial Entrepreneurs</li>
              <li>Business Owners</li>
              <li>Real Estate Professionals</li>
            </ul>
            <p></p>
            <p>
              „In unserem hektischen Alltag ist es oft schwer, das Gleichgewicht
              zwischen dem Drang, voranzukommen, und der Zeit zu finden, uns zu
              zentrieren und zu reflektieren. Qi Blanco hilft uns, dieses
              Gleichgewicht zu finden. Wir nutzen die gesamte Palette der Qi
              Blanco-Produkte bereits seit mehreren Jahren, und Qi Blanco ist
              ein fester Bestandteil unseres Lebens geworden. Es hilft uns, die
              erforderliche Energie abzurufen, um auf höchstem Niveau zu
              agieren, während es gleichzeitig ein allgemeines Wohlbefinden
              sowie ein Gefühl von Zufriedenheit und Komfort vermittelt.”
            </p>
            <p>
              <strong>– Dr. Andreas Kramer –</strong>
            </p>
            <p>
              "Qi Blanco hat unsere Lebensqualität verbessert, indem es eine
              bestimmte Klarheit und Intuition bereitstellt, die uns in unserer
              täglichen Interaktion mit Menschen unterstützt. Der Schutz vor
              elektromagnetischer Strahlung (EMF) ist ein zusätzlicher Bonus, da
              wir ständig am Telefon oder Computer sind.”
            </p>
            <p>
              <strong>– Mindy Sahagun –</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TechnologieQiBlanco() {
  return (
    <div className="DasHerzDesQiOne reverse NormalSectionSize">

      <div className="Flex-Content mt-2">
        <p></p>
        <h2>Das Herz des QiBracelet®</h2>
        <h3>Gitterchip™ aus eigens entwickelter Goldlegierung</h3>
        <p className='mt-2'>
          Der revolutionäre Gitterchip™ des QiBracelet® prägt ein statisches Feld
          aus, das Wassermoleküle dazu anregt, in den kohärenten Zustand – den
          Superzustand – überzugehen.
        </p>
        <p className='mt-2'>
          Das QiBracelet® erhöht deutlich die kohärente Struktur des Wassers. Dies
          lässt sich leicht an der erhöhten Oberflächenspannung des Wassers
          erkennen. Erhöht sich der Anteil an kohärentem Wasser, maximieren sich
          folgende Effekte:
        </p>

        <p className='mt-2'>
          <img
            alt=""
            style={{
              float: 'left',
              height: '40px',
              width: '40px',
              margin: '5px',
            }}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/KohaerentesWasser_cd3b0e48-323b-46f5-b537-b6aae9eb2bc9.png?v=1701116490"
          />
          <b>1. Kohärentes Energiefeld</b>
          <br />
          Frequenzen können sich optimal im kohärenten Wasser ausbreiten
        </p>

        <p className='mt-1'>
          <img
            alt=""
            style={{
              float: 'left',
              height: '40px',
              width: '40px',
              margin: '5px',
            }}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/E-Smog_fe53a4d3-a271-4027-873e-74f815e4ff84.png?v=1701114521"
          />
          <b>2. Molekularer E-Smog Schutz</b>
          <br />
          13% der Elektronen des kohärenten Wassers werden als eigenständige
          Elektronenhülle ausgelagert
        </p>

        <p className='mt-1'>
          <img
            alt="Bild Zelle Zellschutz"
            style={{
              float: 'left',
              height: '40px',
              width: '40px',
              margin: '5px',
            }}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-icon-zellschutz-3.png_1-1.webp?v=1676976963"
          />
          <b>3. Anbindung an das Quantenfeld</b>
          <br />
          Stabilisiert die Verbindung zum Quantenfeld
        </p>

        <p></p>
        <p className='mt-2'>
          Maßgeblich für die Funktion ist der eigens entwickelte Gitterchip™.
          Dieser prägt durch sein statisches Feld, das maßgeblich durch die
          spezifische Atompositionierung von Goldatomen erreicht wird, die
          Wassermoleküle. Somit steigt die Wahrscheinlichkeit an, dass Wasser
          Wasserstoffbrücken ausbaut. Dieser Zustand wird als kohärente
          Wasserstruktur bezeichnet und ist auch unter dem Begriff EZ-Water
          (extended zone) bekannt.
          <br />
          Der kohärente Zustand des Wassers ist selbstvermehrend.
        </p>
        <p></p>
      </div>
            <div className="Flex-Image mt-2">
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-e1668521164461_1_21efb1fc-4b64-469f-96d2-33dcf70d6506.jpg?v=1670809038"
          alt=""
        />
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px.jpg_1_f94bd190-0e41-40bc-aa0c-e94cf253f975.webp?v=1670809046"
          alt=""
        />
      </div>
    </div>
  );
}

function HerobannerBracelet(){
    return(
        <div className="HerobannerFeatured NormalSectionSize">
            <h1 className="text-center">Tragbares Hightech <br /> mit messbaren Effekten auf Zellebene</h1>
            <div className="herobanner-seperator g-10p flex-container flex-row small--flex-column flex-align-start flex-justify-space-between">
                <div className="text-content">
                    <h2>QiBracelet®</h2>
                    <p className="color-accent-main"><strong><ReviewCount /></strong></p>
                    <p className="color-accent-main"><strong>Mehr als 14.000 zufriedene Kunden</strong></p>
                    <p class="mt-1"><strong>Erfahre jetzt die Vorteile der kohärenten Wasserstruktur auf Zellebene</strong></p>
                    <p class="mt-1">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647" alt="Persönliches Wachstum" />
                        &nbsp; Persönliches Wachstum
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860" alt="Persönliches Wachstum" />
                        &nbsp; Schutz vor E-Smog & 5G
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033" alt="Persönliches Wachstum" />
                        &nbsp; Gesteigerte Anbindung zum Quantenfeld
                    </p>
                    <p class="mt-1 cellstudies-checkmark">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861" alt="Persönliches Wachstum" />
                        <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
                    </p>
                    <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-start g-10p mt-2">
                        <Link prefetch="intent" to="/products/qibracelet" className="btn--primary">Jetzt kaufen</Link>
                    </div>
                    <p className="micro-text mt-1"><strong>20 Tage testen · Gratis Versand · 0 % Raten mit PayPal und Klarna</strong></p>
                </div>
                <div className="featured-image">
                    <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiBracelet_mit_Siegel_1a200b5e-85ca-4b6f-a176-42af66701b6f.webp?v=1673884874" alt="QiOne 2 Pro" />
                </div>
            </div>
        </div>
    )

}

function LeistungsstarkeUnterstutzung(){
  return(
    <div className="LeistungsstarkeUnterstutzung NormalSectionSize">
      <div>
        <h3>Leistungsstarke Unterstützung. <br />
Edel & dezent für jede Situation</h3>
<img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010752-min-1024x683.jpg_1_e739e5cc-e928-44d4-ad81-09dc74e31110.webp?v=1670807064" alt="" />
      </div>
      <div>
        <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010743-min-1025x1536.jpg_1_2f956128-37b9-4c16-a535-dd4c9eabe6d4.webp?v=1670807053" alt="" />
      </div>
    </div>
  )
}
function LeistungsstarkeUnterstutzungReverse(){
  return(
    <div className="LeistungsstarkeUnterstutzung reverse NormalSectionSize">
      <div>
      <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010701-min-1-973x1024.jpg_1_9996827d-05d7-4796-884d-6d651e7214b0.webp?v=1670807590" alt="" />
      </div>
      <div>
        <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010711-min-819x1024.jpg_1_967270d0-a41c-4da4-8539-498fdbb832a6.webp?v=1670807595" alt="" />
      </div>
    </div>
  )
}

function Superzustand() {
  return (
  <div className='SuperzustandWrapper'>
    <h2 className="text-center">
      Der Superzustand des Wassers 
    </h2>
    <div className="NormalSectionSize">
      <div className="Superzustand">
        <div className='mt-2 mb-2'><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/InkohaerentesWasser-2_transparent.png?v=1670949073" alt="" /></div>
        <div className="text-content"><h3>Inkohärentes Wasser</h3>
        <p>Die Wassermoleküle stoßen gelegentlich aneinander und erzeugen ein thermisches Rauschen. Das Rauschen sind Störfrequenzen, da sie die positiven Frequenzen überlagern und damit die Kommunikation beeinflussen.</p>
        </div>
      </div>
      <div className="Superzustand">
        <div className='mt-2 mb-2'><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/KohaerentesWasser-2_transparent.png?v=1670949081" alt="" /></div>
        <div className="text-content"><h3>Kohärentes Wasser</h3>
        <p>Zusätzliche Wasserstoffbrücken führen dazu, dass sich die Wassermoleküle in einer kristallinen Struktur anordnen und sich stoßfrei zueinander bewegen. Somit kommen alle Signale optimal bei dir an.</p>
        </div>
      </div>
    </div>
  </div>
  )
}

function BraceletYT() {
  return (
    <div className="NormalSectionSize text-center">
      <h2 className="text-center">Die Kraft des QiBracelet® <br /> Der erprobte Gitterchip™</h2>
      <h3 className="mt-2">- Yann Sura -</h3>
      <h4>Mental Coach</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/EjXTIldVrk4'} />

      <h3 className="mt-2">- Julie Christin Boeng -</h3>
      <h4>Holistic Detox Coach</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/V2mKebzHwCM'} />

      <h3 className="mt-2">- Frank Delventhal -</h3>
      <h4>Dreifacher Weltrekordhalter</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/ugzSE3UXno4'} />
    </div>
  );
}