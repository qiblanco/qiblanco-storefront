import {CallToAction} from '../index-components/CallToAction';
import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {LogoBar} from '../reusables/LogoBar';
import {RatenzahlungHerobanner} from '../reusables/RatenzahlungHerobanner';
import {SingleImage} from '../reusables/SingleImage';
import {Studien} from '../reusables/Studien';
import {YoutubeIframe} from '../reusables/YoutubeIframe';
import { UpsellLineUp } from '../UpsellLineUp';
import {ProductFAQ} from '../ProductFAQ';
import {FAQ_QIBRACELET} from '~/data/product-faqs';


export function QiBracelet({block = undefined}) {
  return (
    <div className="ProductPageQiBracelet">
      <LogoBar />
      <EinmalInvestieren />
      <SingleImage
        size={'fullscreen'}
        link={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2025-05-qiblanco-canggu-06482.jpg?v=1752531662'
        }
      />
      <MainFeatures />
      <PerfektePassform />
      <HeroBannerParallax
        backgroundImage={'qibracelet-herobanner-new.webp?v=1752524482'}
        link={'#product'}
        linkStyling={'primary'}
        linkText={"Hol' dir jetzt dein QiBracelet®"}
        headline={
          <>
            Spüre die Freiheit <br /> deines wahren Selbst.
          </>
        }
        parallax={true}
      />
      <RisikofreiErleben />
      <Gitterchip />
      <Studien headline={'Wirkung an menschlichen Zellen bestätigt!'} />
      <RatenzahlungHerobanner
        text={
          <>
            <h2>
              Dein Wunsch. Deine Freiheit. <br /> Jetzt mit 0% Finanzierung.²
            </h2>
          </>
        }
        link={'#product'}
        linkText={"Hol' dir jetzt dein QiBracelet®"}
        paypal={true}
        klarna={true}
        img={'2025-05-qiblanco-canggu-1054882.jpg?v=1752527126'}
      />
      <StressfreiBezahlen />
      <h2 className="text-center">Gründerinterview zum QiBracelet®</h2>
      <YoutubeIframe link={'https://www.youtube.com/embed/9BmJ_pjlFMQ'} />
      <MassgeschneiderteTechnologie />
      <BraceletYT />
      <ImageDivider />
      <GeophatogeneStrahlung />
      <CallToAction
        text={
          <>
            <h2>
              Lass dein QiBracelet® kohärentes Wasser für dich produzieren
            </h2>
            <p>
              <b>
                ✅ 100% deutsche Produktion <br />
                ✅ Hochwertigste Materialien <br />✅ Weltweiter Versand
              </b>
            </p>
          </>
        }
        link={"#product"}
        linkText={"Hol' dir jetzt dein QiBracelet®"}
        linkStyle={'primary'}
        img={'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha.webp?v=1732220427'}
      />
      <UpsellLineUp block={block} />
      <ProductFAQ items={FAQ_QIBRACELET} />
    </div>
  );
}

function EinmalInvestieren() {
  return (
    <div className="NormalSectionSize" style={{marginBottom: '100px'}}>
      <h2>Einmal investieren - exklusiv genießen:</h2>
      <p>
        Das <b>QiBracelet®</b> vereint revolutionäre Technologie mit edlem
        Design und hebt dein Umfeld auf ein neues Niveau – für alle, die
        Innovation und Stil in einem Accessoire schätzen.
      </p>
      <p className="mt 2">
        <b>✔ Höchste Qualität:</b> Präzisionsgefertigt mit langlebigen,
        hochwertigen Materialien. <br />
        <b>✔ Zeitloses Design:</b> Ein stilvolles Statement für dein Handgelenk
        – elegant, dezent und kraftvoll zugleich. <br />
        <b>
          ✔ Innovative <b>GitterChip™</b>-Technologie:
        </b>{' '}
        Entwickelt, um die molekulare Struktur von Wasser gezielt zu
        beeinflussen und deine Umgebung zu optimieren.
      </p>
      <p className="mt-2">
        <b>1. Technologie, die Maßstäbe setzt</b>
      </p>
      <p className="mt-1">
        Das <b>QiBracelet®</b> basiert auf der <b>GitterChip™</b>-Technologie,
        einem wegweisenden Ansatz, der entwickelt wurde, um Wassermoleküle in
        einen kohärenten Zustand zu überführen. Diese innovative Technologie
        trägt dazu bei, dein Umfeld zu strukturieren und eine Umgebung zu
        schaffen, die dich in deinem aktiven Lebensstil unterstützt – sei es bei
        der Arbeit, beim Sport oder in der Freizeit.
      </p>
      <p className="mt-2">
        <b>2. Wissenschaftlich inspiriert – fundiert geprüft</b>
      </p>
      <p className="mt-1">
        Das <b>QiBracelet®</b> ist nicht nur ein ästhetisches Accessoire,
        sondern basiert auf wissenschaftlich geprüften Prinzipien. Studien
        belegen den Einfluss der <b>GitterChip™</b>-Technologie auf molekulare
        Strukturen und Umweltfaktoren. Ein Produkt, das nicht nur begeistert,
        sondern mit Innovation überzeugt.
      </p>
      <p className="mt-2">
        <b>3. Erfahrungen, die den Unterschied machen</b>
      </p>
      <p className="mt-1">
        Viele Nutzer berichten, dass das QiBracelet® ihre Wahrnehmung im Alltag
        verändert hat – von einer bewussteren Lebensweise über einen
        angenehmeren Schlaf bis hin zur Fähigkeit, sich klarer auf ihre Ziele zu
        fokussieren. Diese Kombination aus Technologie und Design macht das
        QiBracelet® zu einem einzigartigen Begleiter für alle, die Wert auf
        Stil und Wohlbefinden legen.
      </p>
      <p className="mt-2">
        <b>Zusätzliche Services</b>
      </p>
      <p className="mt-2">
        <b>✔ Premium-Kundenservice:</b> 7 Tage die Woche für dich da – für eine
        mühelose Integration in deinen Alltag.
      </p>
      <p className="mt-2">
        <b>Erlebe das QiBracelet® – Technologie in ihrer schönsten Form.</b>
      </p>
    </div>
  );
}
function MainFeatures() {
  return (
    <div className="MainFeaturesWrapper">
      <h2 className="text-center">Main Features</h2>
      <div className="MainFeatures NormalSectionSize">
        <img
          width={350}
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023_Siegel.png?v=1732616406"
          alt=""
        />
        <div className="MainFeaturesColumn">
          <h3>Noch mehr POWER. Noch mehr FOCUS. Und noch mehr KOHÄRENZ.</h3>
          <p>
            Das QiBracelet®: Der ultimative Schutz vor Mobilfunkstrahlung –
            jetzt mit der revolutionären Gitterchip™ -Technologie der dritten
            Generation und 10-facher Stärke. Perfekt für alle, die den nächsten
            Schritt gehen wollen.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>
            Das QiBracelet® jetzt 10x stärker – für spürbare Verbesserungen auf
            allen Ebenen.
          </h3>
          <p>
            Erlebe mit unserem neuesten Gitterchip™ eine klarere Intuition,
            eine intensivere Verbindung zwischen Körper und Geist und eine
            tiefere Resonanz mit dem Quantenfeld.
          </p>
        </div>
      </div>
    </div>
  );
}


function PerfektePassform() {
  return (
    <>
      <div className="NormalSectionSize">
        <h2 className="text-center">
          Finde die perfekte Passform für dein QiBracelet®
        </h2>
      </div>
      <div className="PerfektePassform NormalSectionSize">
        <p>
          Miss die <b>Breite deines Handgelenks</b> mit einem Lineal aus. Nimm
          das Lineal und lege es an der{' '}
          <b>breitesten Stelle deines Handgelenks</b> an - das ist normalerweise
          dort, wo du knorrige Knochen an beiden Seiten des Armes fühlen kannst.{' '}
          <b>Schließe dann ein Auge</b> und <b>lies die Zahl vom Lineal</b> ab.
        </p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/massband-bracelet.webp?v=1760784243"
          alt=""
        />
        <p>
          Natürlich kann das QiBracelet® <b>gedehnt</b> oder <b>verengt</b>{' '}
          werden, um eine ideale Passform zu gewährleisten. Sollte dein
          Handgelenk ca. 7 cm betragen, dann kannst du L <b>dehnen</b> und
          erhältst somit einen{' '}
          <b>
            <i>Tight Fit.</i>
          </b>{' '}
        </p>
      </div>
      <div className="NormalSectionSize">
        <div class="bracelet-table-wrapper">
          <div class="bracelet-table">
            <div class="bracelet-row bracelet-header">
              <div></div>
              <div>
                <h3>Loose Fit</h3>
              </div>
              <div>
                <h3>Tight Fit</h3>
              </div>
            </div>

            <div class="bracelet-row bracelet-subheader">
              <div>
                <span>
                  Deine Handge-
                  <br />
                  lenks
                </span>
                <b>breite</b>
              </div>
              <div>
                <span>QiBracelet® </span>
                <b>bewegt sich</b>
              </div>
              <div>
                <span>QiBracelet® </span>
                <b>liegt an</b>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <b>4,5 cm</b>
              </div>
              <div>
                <strong>S</strong>
              </div>
              <div></div>
            </div>

            <div class="bracelet-row">
              <div>
                <b>5 cm</b>
              </div>
              <div>
                <b>S</b>
              </div>
              <div>
                <strong>S - verengt -</strong>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <strong>5,5 cm</strong>
              </div>
              <div>
                <strong>M</strong>
              </div>
              <div>
                <strong>S</strong>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <strong>6 cm</strong>
              </div>
              <div>
                <strong>M</strong>
              </div>
              <div>
                <strong>M - verengt</strong>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <strong>6,5 cm</strong>
              </div>
              <div>
                <strong>L</strong>
              </div>
              <div>
                <strong>M</strong>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <strong>7 cm</strong>
              </div>
              <div>
                <strong>L</strong>
              </div>
              <div>
                <strong>L - verengt -</strong>
              </div>
            </div>

            <div class="bracelet-row">
              <div>
                <strong>7,5 cm</strong>
              </div>
              <div>
                <strong>L - gedehnt -</strong>
              </div>
              <div>
                <strong>L</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Gitterchip() {
  return (
    <div className="Gitterchip NormalSectionSize">
      <h2 className="text-center">Der revolutionäre Gitterchip™ 2.2</h2>
      <div className="GitterchipImageWrapper mt-2">
        <img
          width={300}
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-e1668521164461_1_21efb1fc-4b64-469f-96d2-33dcf70d6506.jpg?v=1670809038"
          alt=""
        />
        <img
          width={300}
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px.jpg_1_f94bd190-0e41-40bc-aa0c-e94cf253f975.webp?v=1670809046"
          alt=""
        />
      </div>
      <div className="mb-3 mt-2 text-center">
        <small>
          <strong>27,71 mm³ Leistungsvolumen</strong>
        </small>
      </div>
      <h3>Garantierter Familienbesitz</h3>
      <p>
        Das QiBracelet® durchläuft den hochwertigsten Herstellungsprozess
        überhaupt. Technische Entwicklung und Produktion in Deutschland
        garantiert einen Prozess, der seinesgleichen sucht. Deshalb können wir
        mit ruhigem Gewissen eine jahrzehntelange Lebensdauer aussprechen. Das
        QiBracelet® wird Teil des Familienbesitzes und erzeugt immerwährende
        Freude.
      </p>
      <h3 className="mt-3">Ein Schatz voller Erfahrungen</h3>
      <p>
        Das QiBracelet® beinhaltet die geballte Kundenerfahrungen des QiOne® 1
        und QiOne® 2 Pro. Aus über 4 Jahren gesammeltem Wissen, wurden alle
        Eventualitäten abgedeckt. Das QiBracelet® ist nahezu unzerstörbar und
        für jeden Einsatzort geeignet – kombiniert mit dem außergewöhnlich
        ansprechenden Design, ist es der ideale Begleiter.
      </p>
      <h3 className="mt-3">Ideales Design-Leistungs-Verhältnis</h3>
      <p>
        Das Design des QiBracelet® ist inspiriert durch die führenden
        Mode-Labels der ganzen Welt. Klassik trifft Eleganz. Leistung trifft
        Optik. Das QiBracelet® kann durchaus mit jedem Kleidungsstück und
        Accessoire kombiniert werden. Das Zusammentreffen von Leistung und
        Style, macht es zum idealen Begleiter schlechthin. Edle Leistung für
        jeden Moment!
      </p>
    </div>
  );
}

function StressfreiBezahlen() {
  return (
    <div className="NormalSectionSize" style={{margin: '50px auto 100px auto'}}>
      <h2>
        Hole dir jetzt dein QiBracelet® - flexibel und stressfrei bezahlen!
      </h2>
      <p>
        Mit unserer Ratenzahlung kannst du dein QiBracelet® bequem in kleinen
        Beträgen abbezahlen – einfach, flexibel und unkompliziert.
      </p>
      <p className="mt-3">
        <strong>So funktioniert's:</strong>
      </p>
      <ol className="mt-1">
        <li>Wähle an der Kasse PayPal oder Klarna als Zahlungsmethode.</li>
        <li>Entscheide dich für die Ratenzahlungsoption.</li>
        <li>Erhalte dein QiBracelet® sofort und zahle in deinem Tempo.</li>
      </ol>
      <p className="mt-1">
        <strong>Deine Vorteile:</strong>
      </p>
      <p>
        ✔ Flexibel: Passe die Zahlungen an. <br />
        ✔ Schnell & einfach: Alles online, ohne komplizierten Papierkram.
        <br />✔ Sofortiger Versand: Dein QiBracelet® macht sich sofort auf den
        Weg zu dir.
      </p>
      <p className="mt-3">
        <strong>
          Mach es dir leicht - sichere dir deinen QiBracelet® und zahle bequem
          in Raten.
        </strong>
      </p>
    </div>
  );
}

function MassgeschneiderteTechnologie() {
  return (
    <div className="MassgeschneiderteTechnologie NormalSectionSize">
      <h2 className="text-center">
        Maßgeschneiderte Technologie. Herstellung in Deutschland.
      </h2>
      <div className="MassgeschneidertWrapper">
        <div className="Column">
          <h3 className="mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"
              ></path>
            </svg>{' '}
            Einzigartige Seriennummer
          </h3>
          <p>Jedes QiBracelet® ist mit einer eigenen Seriennummer versehen</p>

          <h3 className="mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
              ></path>
            </svg>{' '}
            100% in Bayern entwickelt & gefertigt
          </h3>
          <p>
            Hochpräzise Technik und Produktion, ausschließlich in Deutschland
            hergestellt
          </p>
        </div>
        <div className="Column">
          <h3 className="mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"
              ></path>
            </svg>{' '}
            Ethisch erzeugtes und zertifiziertes Gold
          </h3>
          <p>Wir beziehen nur RJC-zertifiziertes Gold mit höchstem Standard</p>

          <h3 className="mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"
              ></path>
            </svg>{' '}
            Material höchster Qualität
          </h3>
          <p>Für unsere Produkte werden nur die besten Materialien verwendet</p>
        </div>
        <div className="Column">
          <img
            width={400}
            style={{borderRadius: '20px'}}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010739_1.webp?v=1676979374"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

function BraceletYT() {
  return (
    <div className="NormalSectionSize text-center">
      <h2 className="text-center">Die Kraft des QiBracelet®</h2>
      <h3 className="mt-2">- Dr. Andreas Kramer -</h3>
      <h4>Los Angeles Real Estate</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/tLETuX9bJoU'} />

      <h3 className="mt-2">- Julie Christin Boeng -</h3>
      <h4>Holistic Detox Coach</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/V2mKebzHwCM'} />

      <h3 className="mt-2">- Scott Schwenk -</h3>
      <h4>Meditation Master</h4>
      <YoutubeIframe link={'https://www.youtube.com/embed/I-4r69GwmZ8'} />
    </div>
  );
}

function RisikofreiErleben() {
  return (
    <div className="RisikofreiErleben NormalSectionSize">
      <h2>
        QiBracelet® – 20 Tage erleben. Ohne Risiko, mit vollem Tragekomfort!
      </h2>
      <p>
        Das <b>QiBracelet®</b> vereint modernes Design mit innovativer{' '}
        <b>GitterChip™-Technologie</b> – stilvoll, tragbar und immer an deiner
        Seite. Egal ob im Alltag, beim Sport oder auf Reisen – es passt sich
        perfekt deinem Lebensstil an. Erlebe es selbst und integriere das
        QiBracelet® <b>20 Tage lang mühelos in deine Routine</b>.
      </p>
      <p className="mt-2">
        <b>So einfach geht's</b> <br />
        <b>✅ Trage das QiBracelet® täglich</b> und lasse es zu einem
        natürlichen Teil deines Lebens werden. <br />
        <b>✅ Erlebe, wie es sich perfekt mit deinem Stil verbindet </b>und dich
        überall begleitet. <br />
        <b>✅ Solltest du wider Erwarten nicht überzeugt sein</b>, kannst du es
        innerhalb von 20 Tagen unkompliziert zurückgeben und erhältst den vollen
        Kaufpreis zurück.
      </p>
      <p className="mt-2">
        <b>
          Deine Vorteile <br />
        </b>
        <b>✔ 20 Tage erleben:</b> Finde heraus, wie sich das QiBracelet® in
        deinen Alltag integriert. <br />
        <b>✔ Sicherheit durch Erfahrung:</b> Probiere es aus und entscheide
        selbst, ob es dein täglicher Begleiter wird. <br />
        <b>✔ Kein Risiko, nur Mehrwert:</b> Sollte es nicht das Richtige für
        dich sein, bekommst du dein Geld zurück – einfach & fair.
      </p>
      <p className="mt-2">
        <b>
          Mach den ersten Schritt – erlebe das QiBracelet® und verstehe, warum
          es für so viele zum unverzichtbaren Accessoire geworden ist!
        </b>
      </p>
    </div>
  );
}

function ImageDivider() {
  return (
    <div className="ImageDivider NormalSectionSize">
      <img
        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010701-min-1-973x1024.jpg_1_3131118a-00d4-466e-9c63-dd69cd0d005b.webp?v=1704278162"
        alt=""
      />
      <img
        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-11-02-qiblanco-bracelet-L1010711-min-819x1024.jpg_1_967270d0-a41c-4da4-8539-498fdbb832a6.webp?v=1670807595"
        alt=""
      />
    </div>
  );
}

function GeophatogeneStrahlung(){
  return (
    <div className="NormalSectionSize text-center" style={{marginBottom: "100px"}}>
      <h2>Die Qi Blanco® Technologie und geopathogene Strahlung</h2>
      <p>Geopathogene Strahlung hat viele Namen: Erdstrahlen, Wasseradern, Gitternetze, Gesteinsbrüche und -verwerfungen. Über unterirdischen Wasserläufen und Erdverwerfungslinien treten messbare Abweichungen des Erdmagnetfeldes auf. Dieses Phänomen verursacht bei Menschen mit einem hohen Körperempfinden z.B. Schlafstörungen oder allgemeine Befindlichkeitsstörungen.</p>
      <p className="mt-2">Durch die unterschiedlichen Erdbedingungen bekommen diese geopathogene Strahlungen ihr individuelles Frequenzspektrum. Abhängig von der persönlichen körperlichen Verfassung empfinden das vor allem sensible Menschen als äußerst unangenehm</p>
      <p className="mt-2">Hier ist es wichtig zu verstehen, dass es sich bei all diesen geopathogenen Strahlungen am Ende auch „nur“ um elektromagnetische Strahlung handelt. Es ist also eine zusätzliche Strahlenbelastung zu den technisch erzeugten, wie Handy- oder Funkstrahlung.</p>
      <p className="mt-2"><b>Die Erhöhung kohärenter Wasserstrukturen ist die ideale Lösung, um dem Stress, der durch geopathogene Strahlung verursacht wird, entgegenzuwirken.</b></p>
    </div>
  )
}