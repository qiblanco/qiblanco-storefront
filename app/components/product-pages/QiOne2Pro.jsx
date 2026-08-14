import {LogoBar} from '../reusables/LogoBar';
import {Richtext} from '../reusables/Richtext';
import {InfoSlider} from '../index-components/InfoSlider';
import {SingleImage} from '../reusables/SingleImage';
import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {Studien} from '../reusables/Studien';
import {ScrollMikroskopVideo} from '../index-components/ScrollMikroskopVideo';
import {CallToAction} from '../index-components/CallToAction';
import {UpsellLineUp} from '../UpsellLineUp';
import {ProductFAQ} from '../ProductFAQ';
import {FAQ_QIONE_2_PRO} from '~/data/product-faqs';
import {YoutubeIframe} from '../reusables/YoutubeIframe';
import {Gitterchip} from '../reusables/Gitterchip';
import { RatenzahlungHerobanner } from '../reusables/RatenzahlungHerobanner';
import {StudienCards} from './StudienCards';

/*
 * Kompletter PDP-Inhalt unterhalb der Buy-Box. Seit 2026-07-16 auch von der
 * Campaign-PDP /pages/qione-2-pro wiederverwendet (Job qione-shopniveau:
 * Shop-Niveau per Komponenten-REUSE statt Nachbau). Die CTA-Ziele sind als
 * Props parametrisiert; die DEFAULTS sind byte-identisch zum PDP-Bestand
 * (organische PDP rendert unverändert — Markup-Identitäts-Vertrag wie
 * QiOneBuyBox). Die Campaign-PDP übergibt '#shopq-buybox' (eine Kauflogik
 * auf der Seite, kein Funnel-Bounce zur SEO-PDP). Hinweis Vorbestand:
 * '#product' existiert als id auf der PDP nicht (toter Anker) — bleibt dort
 * unverändert (Byte-Identität), nur die Campaign-Seite bekommt ein echtes Ziel.
 * gitterchipAnimation (Default null = organische PDP unverändert): optionaler
 * Scroll-Scrub-Block direkt nach dem Gitterchip-Erklärblock — die Campaign-PDP
 * übergibt hier die GitterChip-Molecules-Animation (ScrollScrubVideo).
 * trustVorSlider/trustNachSlider (Default null = organische PDP unverändert):
 * optionale Trust-Slots um den BESTEHENDEN InfoSlider — die Campaign-PDP
 * übergibt die 3 Google-Einzel-Bewertungen davor und das Reputon-Widget
 * danach (Startseiten-Trust 1:1; Slider-REUSE statt Zweitinstanz, D-045).
 */
export default function QiOne2Pro({
  block = undefined,
  ctaHref = '/products/qione-2-pro',
  ctaAnchor = '#product',
  gitterchipAnimation = null,
  trustVorSlider = null,
  trustNachSlider = null,
}) {
  return (
    <div className="ProductPageQiOne">
      <style>{`.ProductPageQiOne .LogoBar{margin-top:30px;}`}</style>
      <LogoBar />
      <OneTimeInvestment />
      <MainFeatures />
      {trustVorSlider}
      <InfoSlider />
      {trustNachSlider}
      <RisikofreiErleben />
      <SingleImage
        size={'fullscreen'}
        link={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/taje__1.webp?v=1710262080'
        }
      />
      <Gitterchip />
      {gitterchipAnimation}
      <HeroBannerParallax
        backgroundImage={
          '/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'
        }
        headline={<>Dein QiOne® 2 Pro sorgt für dich<br />Tag und Nacht.</>}
        subheadline={"Navigiere klar und ruhig durch's Leben."}
        parallax={true}
        size={850}
        link={ctaHref}
        linkStyling={'primary'}
        linkText={'Hole dir jetzt deinen QiOne® 2 Pro'}
      />
		<StressfreiBezahlen />
    <RatenzahlungHerobanner
     link={ctaAnchor}
     linkText={"Hole dir jetzt deinen QiOne® 2 Pro"}
     img={"ratenzahlungs-banner.webp?v=1752531325"}
     text={
     <>
      <h2>Dein Wunsch. Deine Freiheit <br />
      Jetzt mit 0% Finanzierung.²
      </h2>
     </>}
     paypal={true}
     klarna={true}
     />
		<div className="NormalSectionSize" style={{marginTop: "100px", marginBottom: "100px"}}>
      <h2 className="text-center">Gründerinterview zum QiOne® 2 Pro</h2>
      <YoutubeIframe link={"https://www.youtube.com/embed/LLmNflDFcus"} />
    </div>
      <StudienCards />
      <ScrollMikroskopVideo />
      <div className="NormalSectionSize text-center">
        <h2>
          Dank innovativem Chip-Design: <br />
          QiOne® 2 Pro und QiBracelet® - Jetzt 8x stärker!
        </h2>
        <p style={{marginBottom: '50px'}}>
          <b>
            Persönliches Wachstum, Schutz vor 5G & E-Smog, Gesteigerte Anbindung
            zum Quantenfeld
          </b>
        </p>
      </div>
      <SingleImage
        link={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/GitterChips_Vergleich-min.webp?v=1699381065'
        }
        size={'normal'}
      />
      <div style={{marginBottom: '50px'}} className="text-center mt-2 NormalSectionSize">
        <a className="btn--primary m-center" href={ctaHref}>
          Hole dir jetzt deinen QiOne® 2 Pro
        </a>
      </div>
      <MassgeschneiderteTechnologie />
      <CallToAction
        img={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/New_Project_1.webp?v=1733928571'
        }
        text={
          <>
            <h2>
              Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren
            </h2>
            <p>
              <b>
                ✅ 100% deutsche Produktion
                <br />
                ✅ Hochwertigste Materialien
                <br />✅ Weltweiter Versand{' '}
              </b>
            </p>
          </>
        }
        link={ctaAnchor}
        linkText={'Hole dir jetzt deinen QiOne® 2 Pro'}
        linkStyle={'primary'}
      />


      <div className="geopathogen text-center NormalSectionSize">
        <h2>Der QiOne® 2 Pro und geopathogene Strahlung</h2>
        <p>
          Geopathogene Strahlung hat viele Namen: Erdstrahlen, Wasseradern,
          Gitternetze, Gesteinsbrüche und -verwerfungen.
          <br /> Über unterirdischen Wasserläufen und Erdverwerfungslinien
          treten messbare Abweichungen des Erdmagnetfeldes auf.
          <br /> Dieses Phänomen verursacht bei Menschen mit einem hohen
          Körperempfinden z.B. Schlafstörungen oder allgemeine
          <br />
          Befindlichkeitsstörungen.
        </p>
        <p>&nbsp;</p>
        <p>
          Durch die unterschiedlichen Erdbedingungen bekommen diese geopathogene
          Strahlungen ihr individuelles Frequenzspektrum. Abhängig
          <br /> von der persönlichen körperlichen Verfassung empfinden das vor
          allem sensible Menschen als äußerst unangenehm.
        </p>
        <p>&nbsp;</p>
        <p>
          Hier ist es wichtig zu verstehen, dass es sich bei all diesen
          geopathogenen Strahlungen am Ende auch “nur” um elektromagnetische
          <br /> Strahlung handelt. Es ist also eine zusätzliche
          Strahlenbelastung zu den technisch
          <br />
          erzeugten, wie Handy- oder Funkstrahlung.
        </p>
        <p>&nbsp;</p>
        <p>
          <strong>
            Die Erhöhung kohärenter Wasserstrukturen ist die ideale Lösung, um
            dem Stress, der
            <br />
            durch geopathogene Strahlung verursacht wird, entgegenzuwirken.
          </strong>
        </p>
      </div>
      <div className="NormalSectionSize">
        <h2 className="text-center">
          Dreifacher Weltrekordhalter
          <br /> Frank Delventhal sagt Danke
        </h2>
        <YoutubeIframe link={'https://www.youtube.com/embed/ugzSE3UXno4'} />
      </div>
      <UpsellLineUp block={block} />
      <ProductFAQ items={FAQ_QIONE_2_PRO} />
    </div>
  );
}

function OneTimeInvestment() {
  return (
    <div className="OneTimeInvestment NormalSectionSize">
      <h2>Einmal investieren - exklusiv genießen:</h2>

      <ul>
        <li>Hoher Mehrwert: Ein Investment, das sich auszahlt.</li>
        <li>Zeitloses Design: Eleganz, die beeindruckt.</li>
        <li>Höchste Qualität: Langlebig und verlässlich.</li>
      </ul>

      <ol>
        <li>
          <strong>Revolutionäre Technologie:</strong> Der QiOne® 2 Pro setzt
          auf die wegweisende GitterChip™-Technologie, die entwickelt wurde, um
          dein Umfeld auf ein neues Niveau zu heben, indem sie die Struktur von
          Wassermolekülen in deiner Umgebung optimiert.
        </li>
        <li>
          <strong>Wissenschaftlich validiert:</strong> Basierend auf fundierten
          Studien nutzt der QiOne® 2 Pro die fortschrittliche
          GitterChip™-Technologie, die entwickelt wurde, um molekulare
          Strukturen gezielt zu beeinflussen. Durch präzise abgestimmte Prozesse
          wird die Umgebung optimiert und die Effekte elektromagnetischer
          Strahlung reduziert – ein technologischer Meilenstein für deinen
          Alltag.
        </li>
        <li>
          <strong>Einzigartige Erfahrungen:</strong> Viele Nutzer berichten,
          dass der QiOne® 2 Pro ihren Alltag spürbar bereichert. Er hilft
          ihnen, nach einem langen Tag leichter abzuschalten und entspannt zur
          Ruhe zu kommen. Tagsüber empfinden sie ihn als unterstützend, um
          fokussierter und strukturierter ihre Ziele zu verfolgen.
        </li>
      </ol>
      <h3>Zusätzliche Services:</h3>
      <p>
        ✔ Premium-Kundenservice: Wir stehen dir 7 Tage die Woche per E-Mail zur
        Seite, damit du den QiOne® 2 Pro mühelos in deinen Alltag integrieren
        kannst.
      </p>
      <p className="mt-1">
        <strong>
          Erlebe den QiOne® 2 Pro - für ein Umfeld, das inspiriert.
        </strong>
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
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Siegel_2021.png?v=1732616616"
          alt=""
        />
        <div className="MainFeaturesColumn">
          <h3>Noch mehr POWER. Noch mehr FOCUS. Und noch mehr KOHÄRENZ.</h3>
          <p>
            Der QiOne® 2 Pro: Dein täglicher Begleiter für effektiven Schutz
            vor Mobilfunkstrahlung – ausgestattet mit der fortschrittlichen
            Gitterchip™ -Technologie der zweiten Generation und 8-facher
            Stärke. Perfekt für eine Welt, die nie stillsteht.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>
            Der QiOne® 2 Pro jetzt noch leistungsstärker – spürbare
            Unterstützung für deinen Alltag!
          </h3>
          <p>
            Erlebe dank des optimierten Gitterchip™ eine bessere Balance, eine
            verbesserte Körper-Geist-Verbindung und einen klaren Zugang zu
            deinem inneren Potenzial.
          </p>
        </div>
      </div>
    </div>
  );
}

function RisikofreiErleben() {
  return (
    <div className="RisikofreiErleben NormalSectionSize">
      <h2>Erlebe den QiOne® 2 Pro - 20 Tage risikofrei!</h2>
      <p>
        Wir sind überzeugt von unserer Technologie – und möchten, dass du es
        auch bist. Deshalb kannst du den QiOne® 2 Pro 20 Tage lang entspannt in
        deinen Alltag integrieren und dich selbst von seinem Mehrwert
        überzeugen.
      </p>
      <p className="mt-1">
        So einfach geht's: <br />✅ Bestelle deinen QiOne® 2 Pro und integriere
        ihn in deinen Alltag. <br />✅ Erlebe, wie er dein Umfeld optimiert und
        dich täglich begleitet. <br />✅ Solltest du ihn wider Erwarten doch
        nicht behalten wollen, kannst du ihn innerhalb von 20 Tagen
        unkompliziert zurückgeben – und erhältst den vollen Kaufpreis zurück.
      </p>
      <p className="mt-1">
        Deine Vorteile: <br />✔ In Ruhe erleben: Erfahre den QiOne® 2 Pro in
        deinem eigenen Tempo. <br />
        ✔ Maximale Sicherheit: Wir stehen hinter unserer Technologie und geben
        dir die Zeit, dich selbst davon zu überzeugen. <br />✔ Sorgenfrei
        entscheiden: Sollte es doch nicht das Richtige für dich sein, bekommst
        du dein Geld zurück – ohne Risiko.
      </p>
      <p className="mt-1">
        <strong>
          Mach den ersten Schritt – spüre selbst, warum so viele den QiOne® 2
          Pro seit Jahren an ihrer Seite haben und nicht mehr hergeben wollen!
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
          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path></svg> Einzigartige Seriennummer</h3>
          <p>Jeder QiOne® 2 Pro ist mit einer eigenen Seriennummer versehen</p>

          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"></path></svg> 100% in Bayern entwickelt & gefertigt</h3>
          <p>
            Hochpräzise Technik und Produktion, ausschließlich in Deutschland
            hergestellt
          </p>
        </div>
        <div className="Column">
          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"></path></svg> Ethisch erzeugtes und zertifiziertes Gold</h3>
          <p>Wir beziehen nur RJC-zertifiziertes Gold mit höchstem Standard</p>

          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"></path></svg> Material höchster Qualität</h3>
          <p>Für unsere Produkte werden nur die besten Materialien verwendet</p>
        </div>
        <div className="Column">
          <img
            width={400}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_03_transparent_1.webp?v=1676978032"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

function StressfreiBezahlen(){
    return (
        <div className="NormalSectionSize" style={{margin: "100px auto 100px auto"}}>
            <h2>Hole dir jetzt deinen QiOne® 2 Pro - flexibel und stressfrei bezahlen!</h2>
            <p>Mit unserer Ratenzahlung kannst du deinen QiOne® 2 Pro bequem in kleinen Beträgen abbezahlen – einfach, flexibel und unkompliziert.</p>
            <p className="mt-3">
                <strong>So funktioniert's:</strong>
            </p>
            <ol className='mt-1'> 
                <li>Wähle an der Kasse PayPal oder Klarna als Zahlungsmethode.</li>
                <li>Entscheide dich für die Ratenzahlungsoption.</li>
                <li>Erhalte deinen QiOne® 2 Pro sofort und zahle in deinem Tempo.</li>
            </ol>
            <p className="mt-1">
                <strong>Deine Vorteile:</strong>
            </p>
				<p>
					✔ Flexibel: Passe die Zahlungen an. <br />
					✔ Schnell & einfach: Alles online, ohne komplizierten Papierkram.<br />
					✔ Sofortiger Versand: Dein QiOne® 2 Pro macht sich sofort auf den Weg zu dir.
				</p>
				<p className='mt-3'><strong>Mach es dir leicht - sichere dir deinen QiOne® 2 Pro und zahle bequem in Raten.</strong></p>
        </div>
    )
}