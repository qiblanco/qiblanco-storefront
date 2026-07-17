import { CallToAction } from '../index-components/CallToAction';
import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {LogoBar} from '../reusables/LogoBar';
import {RatenzahlungHerobanner} from '../reusables/RatenzahlungHerobanner';
import { Studien } from '../reusables/Studien';
import { YoutubeIframe } from '../reusables/YoutubeIframe';
import { UpsellLineUp } from '../UpsellLineUp';
import {ProductFAQ} from '../ProductFAQ';
import {FAQ_QIHOME_AIR} from '~/data/product-faqs';


export function QiHome({block = undefined}) {
  return (
    <div className="ProductPageQiHome">
      <LogoBar />
      <DasQiHome />
      <MainFeatures />
      <YoutubeIframe link={"https://www.youtube.com/embed/gr2KTESB3JM"} />
      <YoutubeIframe link={"https://www.youtube.com/embed/gcml34L0TF0"} />
      <RisikofreiErleben />
      <HeroBannerParallax
        headline={
          'Entspannt zurücklehnen und deine QiHome® Atmosphäre genießen.'
        }
        subheadline={'Deine Wellness-Oase ganz einfach für Zuhause'}
        link={'#product'}
        linkStyling={'primary'}
        linkText={"Hol' dir jetzt dein QiHome® Air"}
        parallax={true}
        reverse={true}
        backgroundImage={'QIHome.png?v=1711624632'}
      />
      <RatenzahlungHerobanner
        text={
          <>
            <h2>
              Zahle jetzt bequem mit 0% Finanzierung.² <br />
              Einfach und günstig. <br />
              Für Dich.
            </h2>
          </>
        }
        link={'#product'}
        linkText={"Hol' dir jetzt dein QiHome® Air"}
        paypal={true}
        img={'2025-05-qiblanco-canggu-1054882.jpg?v=1752527126'}
      />
      <h2 className="mt-3 text-center">
        Gründerinterview zum QiHome®
      </h2>
      <YoutubeIframe link={"https://www.youtube.com/embed/9BmJ_pjlFMQ"}/>
      <h2 className='mt-3 text-center'>
        "QiHome® und die Vorteile für Kinder"
      </h2>
      <YoutubeIframe link={"https://www.youtube.com/embed/mH0vaUEeFqg"} />
      <Studien headline={"Wirkung an menschlichen Zellen bestätigt!"} />
      <SchutzVorGeopathogenerStrahlung />
      <MassgeschneiderteTechnologie />
      <CallToAction 
        link={"#product"}
        linkText={"Hol' dir jetzt dein QiHome® Air"}
        linkStyle={"primary"}
        img={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_a9b8e70e-d183-48e9-96cd-81b9a5efed82.webp?v=1732708229"}
        text={
        <>
            <h2>Fördere die Gesundheit deines Zuhauses mit dem QiHome® Air.</h2>
            <p><b>
                ✅ Schutz vor E-Smog & 5G <br />
                ✅ Wohlfühlatmosphäre <br /> 
                ✅ Gesteigerte Anbindung zum Quantenfeld
            </b></p>
        </>
        }
      />
      <UpsellLineUp block={block} />
      <ProductFAQ items={FAQ_QIHOME_AIR} />
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
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/597208a9-7cd9-41d3-897b-42cf60daa7f2.png?v=1732617145"
          alt=""
        />
        <div className="MainFeaturesColumn">
          <h3>Noch mehr POWER. Noch mehr FOCUS. Und noch mehr KOHÄRENZ.</h3>
          <p>
            Der ultimative Schutz vor elektromagnetischer Strahlung – jetzt mit
            der 100-fachen Stärke des QiHome® Air dank unserer revolutionären
            Gitterchip™ - Technologie der dritten Generation. Für alle, die
            ihre Lebensqualität auf ein völlig neues Level bringen möchten.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>
            100x stärker für maximalen Schutz und nachhaltiges Wohlbefinden.
          </h3>
          <p>
            Erfahre eine tiefere Intuition, eine verbesserte Kommunikation
            zwischen Körper und Geist und eine intensivere Verbindung zum
            Quantenfeld.
          </p>
        </div>
      </div>
    </div>
  );
}

function DasQiHome() {
  return (
    <div className="DasQiHome NormalSectionSize">
      <h2>
        QiHome® Air – Die Zukunft für ein intelligentes Raumklima in
        Unternehmen & Zuhause
      </h2>
      <p>
        Das <b>QiHome® Air</b> wurde entwickelt, um dein Umfeld auf ein neues
        Niveau zu heben – ideal für Unternehmen, Home-Offices und Wohnräume.
        Während der QiOne® als kompakter Begleiter für den persönlichen
        Gebrauch dient, optimiert das <b>QiHome® Air</b> deine gesamte Umgebung
        – zuverlässig, ganzheitlich und ohne zusätzlichen Aufwand.
      </p>
      <h3 className="mt-2">Technologie, die dein Raumklima revolutioniert</h3>
      <p>
        Mit der weiterentwickelten Gitterchip™-Technologie unterstützt das{' '}
        <b>QiHome® Air</b> die molekulare Struktur von Wassermolekülen in der
        Luft. Das Ergebnis? Ein Umfeld, das viele Anwender als angenehmer und
        produktiver erleben – sei es zu Hause oder im Unternehmen.
      </p>
      <h3 className="mt-2">
        Maximale Wirkung – für spürbare Veränderung in größeren Räumen
      </h3>
      <ul>
        <li>
          <b>Erweitertes Wirkungsfeld:</b> Während der QiOne® dein
          unmittelbares Umfeld beeinflusst, entfaltet das QiHome® Air seine
          Wirkung großflächig – ein System reicht für ein Einfamilienhaus oder
          bis zu 300m² Büro- bzw. Produktionsfläche.
        </li>
        <li>
          <b>Perfekt für Unternehmen & Teams:</b> Unterstützt eine angenehme
          Arbeitsatmosphäre, die Konzentration, Effizienz und Zusammenarbeit
          fördert.
        </li>
        <li>
          <b>Für dein Zuhause: </b>Eine langfristige Lösung für ein angenehmes
          Wohnklima – ohne tägliche Wartung oder zusätzlichen Aufwand.
        </li>
      </ul>
      <h3>Ein Investment, das sich auszahlt</h3>
      <ul>
        <li>
          <b>Hoher Mehrwert:</b> Einmalige Investition für eine langfristige
          Raumoptimierung.
        </li>
        <li>
          <b>Zeitloses Design:</b> Stilvolle Ästhetik, die sich nahtlos in jedes
          Ambiente integriert.
        </li>
        <li>
          <b>Höchste Qualität:</b> Langlebig, wartungsfrei und mit innovativer
          Technologie ausgestattet.
        </li>
      </ul>
      <h3>Zusätzliche Services:</h3>
      <p className="mt-2">
        <b>✔ Individuelle Beratung:</b> Unser Team unterstützt dich bei der
        optimalen Integration des QiHome® Air in deine Räume.
        <br />
        <b>✔ Premium-Kundenservice:</b> Wir sind 7 Tage die Woche für dich da.
      </p>
      <p className="mt-2">
        <b>
          Erlebe mit QiHome® Air eine neue Dimension von Raumqualität – für
          produktives Arbeiten und entspanntes Wohnen.
        </b>
      </p>
    </div>
  );
}

function RisikofreiErleben() {
  return (
    <div className="RisikofreiErleben NormalSectionSize">
      <h2>QiHome® Air – 30 Tage erleben. Ohne Risiko, mit vollem Mehrwert!</h2>
      <p className="mt-2">
        Das <b>QiHome® Air</b> wurde entwickelt, um Wohn- und Arbeitsräume auf ein
        neues Level zu heben - und wir möchten, dass du es selbst erlebst.
        Deshalb kannst du das <b> QiHome® Air 30 Tage lang in deinem Zuhause oder Unternehmen integrieren
        </b> und herausfinden, welchen Unterschied es für dich macht.
      </p>
      <p className="mt-2">
        <b>So einfach geht's:</b> <br />
        <b>✅ Stelle das QiHome® Air in deinem Wohn- oder Arbeitsbereich auf</b> und lass es wirken. <br />
        <b>✅ Erfahre, wie es deine Umgebung optimiert</b> und sich mühelos in dein Leben einfügt. <br />
        <b>✅ Solltest du wider Erwarten nicht überzeugt sein</b>, kannst du es innerhalb von 30 Tagen unkompliziert zurückgeben und erhältst den vollen Kaufpreis zurück.
      </p>
      <p className="mt-2">
        <b>Deine Vorteile:</b> <br />
        <b>✔ 30 Tage erleben: </b>Integriere das QiHome® Air in deinen Alltag und spüre den Unterschied in deiner Umgebung. <br />
        <b>✔ Sicherheit durch Erfahrung:</b> Erlebe selbst, warum bereits über 500 Haushalte und Unternehmen darauf setzen. <br />
        <b>✔ Kein Risiko, nur Mehrwert: </b>Sollte es nicht das Richtige für dich sein, bekommst du dein Geld zurück – einfach & fair.
      </p>
      <p className="mt-2">
        <b>Erlebe das QiHome® Air und entdecke, warum es bereits in über 500 Häusern und Unternehmen geschätzt wird.</b>
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
          <p>Jedes QiHome® Air ist mit einer eigenen Seriennummer versehen</p>

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
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1000782-min-scaled-e1666038171750-1024x1024_1.jpg?v=1670800892"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

function SchutzVorGeopathogenerStrahlung(){
  return (
    <div className='NormalSectionSize' style={{margin: "100px auto"}}>
    <div className="SchutzGeopathogeneStrahlung">
      <div className="TextContent">
        <h2>Schutz vor geopathogener Strahlung</h2>
        <p>Geopathogene Strahlung hat viele Namen: Erdstrahlen, Wasseradern, Gitternetze, Gesteinsbrüche und -verwerfungen. Über unterirdischen Wasserläufen und Erdverwerfungslinien treten messbare Abweichungen des Erdmagnetfeldes auf. Dieses Phänomen verursacht bei Menschen mit einem hohen Körperempfinden z.B. Schlafstörungen oder allgemeine Befindlichkeitsstörungen.</p>
        <p className='mt-2'>Durch die unterschiedlichen Erdbedingungen bekommen diese geopathogene Strahlungen ihr individuelles Frequenzspektrum. Abhängig von der persönlichen körperlichen Verfassung, empfinden das vor allem sensible Menschen als äußerst unangenehm.</p>
      </div>
      <div>
      <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome_Air.webp?v=1675434206" alt="" />
      </div>
    </div>
    <p>Hier ist es wichtig zu verstehen, dass es sich bei all diesen geopathogenen Strahlungen am Ende auch „nur“ um elektromagnetische Strahlung handelt. Es ist also eine zusätzliche Strahlenbelastung zu den technisch erzeugten, wie Handy- oder Funkstrahlung.</p>
    <p className="mt-2">
      Die Erweiterung kohärenter Wasserstrukturen in deinem Zuhause ist die ideale Lösung, um dem Stress, der durch geopathogene Strahlung verursacht wird, entgegenzuwirken.
    </p>
    <p className="mt-2">
      <b>Das QiHome® Air ist unser stärkstes und bestes System zur Bekämpfung geopathogener Strahlung.</b>
    </p>
  </div>
  )
}