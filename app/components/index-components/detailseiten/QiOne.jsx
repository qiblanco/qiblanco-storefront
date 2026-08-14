import {Link} from 'react-router';
import {LogoBar} from '~/components/reusables/LogoBar';
import {ScrollMikroskopVideo} from '../ScrollMikroskopVideo';
import {CallToAction} from '../CallToAction';
import {HeroBannerParallax} from '~/components/reusables/HeroBannerParallaxButton';
import {ZellDiagramme} from '../ZellDiagramme';
import {UpsellLineUp} from '~/components/UpsellLineUp';
import { ImgixVideo } from '~/components/reusables/ImgixVideo';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
export function QiOne() {
  return (
    <div className="Detailseite">
      <div className="QiOne-Herobanner-Detailseite mt-[-75px]!">
        <div className='max-w-[450px]! flex flex-col items-start justify-start gap-3 py-[85px]! px-[10px]! md:px-0!'>
          <h2 className='mb-0!'>Der QiOne® 2 Pro</h2>
          <h3 className='mt-0!'>Messbare Effekte auf Zellebene</h3>
            <ImgixVideo className='w-full overflow-hidden rounded-2xl' videoPath="VIDEO-QiOne60s-DE-2021.mov" fallbackImage="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/fallback-image-qione-detail.webp?v=1747735933" />

          <Link className="btn--secondary w-full! max-w-full!" to={'/products/qione-2-pro'}>
            Hol dir jetzt deinen QiOne® 2 Pro
          </Link>
        </div>
      </div>

      <LogoBar />
      <Expertenmeinungen />
      <ScrollMikroskopVideo />
      <h2 className="text-center">Zelluntersuchungen</h2>
      <ZellDiagramme />
      <CallToAction
        img={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476'
        }
        link={'/products/qione-2-pro'}
        linkStyle={'secondary'}
        linkText={"Hol' dir jetzt deinen QiOne® 2 pro"}
        text={
          <>
            <h2>
              Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren
            </h2>
            <p className="mt-2">
              <b>
                ✅ 100% deutsche Produktion <br />
                ✅ Hochwertigste Materialien <br />✅ Weltweiter Versand{' '}
              </b>
            </p>
          </>
        }
      />
      <HerzQiOne />
      <HeroBannerParallax
        backgroundImage={
          '/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'
        }
        headline={'Dein QiOne® 2 Pro sorgt für dich Tag und Nacht.'}
        subheadline={"Navigiere klar und ruhig durch's Leben."}
        parallax={true}
        size={850}
        link={'/products/qione-2-pro'}
        linkStyling={'primary'}
        linkText={'Hole dir jetzt deinen QiOne® 2 Pro'}
      />
      <CallToAction
        img={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476'
        }
        link={'/products/qione-2-pro'}
        linkStyle={'secondary'}
        linkText={"Hol' dir jetzt deinen QiOne® 2 pro"}
        text={
          <>
            <h2>
              Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren
            </h2>
            <p className="mt-2">
              <b>
                ✅ 100% deutsche Produktion <br />
                ✅ Hochwertigste Materialien <br />✅ Weltweiter Versand{' '}
              </b>
            </p>
          </>
        }
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
      <div className="NormalSectionSize">
        <div className="Expertenmeinung">
          <div className="Expertenmeinung-Bild">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Design-ohne-Titel_1.webp?v=1669011413"
              alt=""
            />
          </div>
          <div className="Expertenmeinung-Text">
            <p>
              <strong>Kurt Tepperwein &amp; Nada Breidenbach</strong>
            </p>
            <ul>
              <li>Buchautoren</li>
              <li>Lebens Coaches</li>
            </ul>
            <p></p>
            <p>
              „Ich habe das Gefühl, der QiOne® ist wie ein kleiner Seelenturbo.
              Er hilft der Seele, den Seelenplan wiederzufinden – der Plug-In
              ins Divine.“
            </p>
            <p>
              <strong>– Nada Breidenbach –</strong>
            </p>
            <p>
              „Er unterstützt bzw. initiiert praktisch die Verbindung mit sich
              Selbst, unserem wahren Sein. Das wird spürbar in der Praxis, das
              ist ganz wunderbar – und dafür bin ich dankbar!“
            </p>
            <p>
              <strong>– Kurt Tepperwein –</strong>
            </p>
          </div>
        </div>
        <div className="Expertenmeinung">
          <div className="Expertenmeinung-Bild">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cebula.webp?v=1675246618"
              alt=""
            />
          </div>
          <div className="Expertenmeinung-Text">
            <p>
              <strong>Matthias und Daniela Cebula</strong>
            </p>
            <ul>
              <li>Dipl. Ernährungspädagoge</li>
              <li>Heilpraktiker &amp; Dr. Klinghardt Therapeut</li>
              <li>MFT Mentalfeld-Therapie</li>
              <li>Systematische Aufstellungsarbeit</li>
            </ul>
            <p></p>
            <p>
              „Gefühlt schickt mir jede Woche jemand ein anderes Produkt, das
              ich testen soll. Handy-Chips, Magnete, Anti-E-Smog und
              informierende Systeme: alle sprechen von Schutz und Heilung.
            </p>
            <p>Der QiOne® spielte von Anfang an in einer anderen Liga.</p>
            <p>
              Ich nutze den QiOne® und das QiHome® täglich in meiner Praxis
              und kann mir ein Leben ohne nicht mehr vorstellen. Das hat mich
              beeindruckt.
            </p>
            <p>
              Selbst nach einem Jahr lege ich den QiOne® nicht mal zum Duschen
              ab. Mit diesen Fähigkeiten ist der QiOne® für mich ein wertvoller
              Begleiter geworden.”
            </p>
            <p>
              <strong>– Matthias Cebula –</strong>
            </p>
            <p>
              "Der QiOne gibt mir gerade in Gebäuden, in denen ich mich nicht
              vor Elektrosmogbelastung oder Fremdenergien schützen kann, das
              Gefühl der maximalen Sicherheit.”
            </p>
            <p>
              <strong>– Daniela Cebula –</strong>
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
        <div className="Expertenmeinung">
          <div className="Expertenmeinung-Bild">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Screenshot_2024-02-19_at_12.32.50.webp?v=1736366546"
              alt=""
            />
          </div>
          <div className="Expertenmeinung-Text">
            <p>
              <strong>Patrick Thiele</strong>
            </p>
            <ul>
              <li>Mentaltraining für Spitzensportler</li>
              <li>Buchautor</li>
            </ul>
            <p></p>
            <p>
              „Qi Blanco ist eine herausragende Technologie, die mein Leben
              bereichert.
              <br />
              Ich trage QiOne® 2 Pro jetzt schon seit fast 5 Jahren und will
              ihn auch nicht mehr missen. Ich hab damit vom ersten Tag an eine
              Veränderung gespürt. Ich bin weniger stressanfällig, generell
              gelassener und vor <br />
              allem schlafe viel besser, was auch meine Schlafdaten belegen. Ich
              weiß persönlich wie viel Leidenschaft und Liebe zum Detail hinter
              der Arbeit von Qi Blanco steckt und die neusten Studien der
              letzten Jahre waren für
              <br /> mich einfach nochmal eine Bestätigung dessen, wie wertvoll
              diese Technologie für mein Leben ist. Inzwischen tragen nicht nur
              ich und meine Frau auch noch zusätzlich das QiBracelet® (auch
              weil es einfach stylisch ist), sondern ich hab mit der Geburt
              unserer Tochter auch noch den QiHome® Air ergänzt, um auch die
              kleinsten Familienmitglieder zu schützen und von Qi Blanco
              profitieren zu lassen. Im Laufe der Zeit habe ich die Produkte
              auch immer öfter an die Spitzensportler weiterempfohlen, mit denen
              ich arbeite und jeder einzelne ist bis heute begeistert davon.
              Fazit: Für mich ist Qi Blanco ein unglaublich wertvoller Teil
              meines Lebens geworden, weil ich tagtäglich den positiven
              Unterschied spüre.”
            </p>
            <p>
              <strong>
                – Patrick Thiele –<br />
              </strong>
              <em>World &amp; Olympic Champion's Mental Trainer</em>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function HerzQiOne() {
  return (
    <div className="DasHerzDesQiOne NormalSectionSize">
      <div className="Flex-Image mt-2">
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-e1668521164461_1_21efb1fc-4b64-469f-96d2-33dcf70d6506.jpg?v=1670809038"
          alt=""
        />
      </div>
      <div className="Flex-Content mt-2">
        <p></p>
        <h2>Das Herz des QiOne® 2 Pro</h2>
        <h3>Gitterchip™ aus eigens entwickelter Goldlegierung</h3>
        <p className='mt-2'>
          Der revolutionäre Gitterchip™ des QiOne® prägt ein statisches Feld
          aus, das Wassermoleküle dazu anregt, in den kohärenten Zustand – den
          Superzustand – überzugehen.
        </p>
        <p className='mt-2'>
          Der QiOne® erhöht deutlich die kohärente Struktur des Wassers. Dies
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
    </div>
  );
}
