import {HerobannerFeatured} from '~/components/index-components/HerobannerFeatured';
import {ZellDiagramme} from '~/components/index-components/ZellDiagramme';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {LogoBar} from '~/components/reusables/LogoBar';
import {Richtext} from '~/components/reusables/Richtext';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';
import {Studien} from '~/components/reusables/Studien';
import {FeaturedProduct} from '~/components/index-components/FeaturedProduct';
import {UpsellLineUp} from '~/components/UpsellLineUp';
import {ExterneStimmen} from '~/components/reusables/ExterneStimmen';
import {Finanzierungsbanner} from '~/components/index-components/Finanzierungsbanner';
import {SingleImage} from '~/components/reusables/SingleImage';
import {CallToAction} from '~/components/index-components/CallToAction';
import {HeroBanner} from '~/components/reusables/HeroBannerParallax';
import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';

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
      <HerobannerFeatured dataSection="hero" />
      <ZellDiagramme dataSection="zell-diagramme"/>

      <LogoBar dataSection="logo-bar"/>

      <Richtext
        dataSection="nutzer-statistik"
        alignment="center"
        text={<h2>"87 % der Nutzer berichten von positiven <br /> Veränderungen in ihrem Wohlbefinden nach der <br /> Anwendung der Qi Blanco® Produkte."</h2>} />
      <InfoSlider dataSection="info-slider" />
    <GoogleReviews dataSection="google-reviews" />
    <div className="NormalSectionSize" data-section="reputon-reviews">
      <h2 className="text-[1.6rem] sm:text-4xl font-semibold text-center mb-6 mt-2">
        Alle Google Bewertungen
      </h2>
      <ReputonWidget />
    </div>
      {/* VORAUSSCHAUENDES LADEN (Job 20260903-BAU-vorausschauendes-laden-...,
          Christian 2026-09-03). Diese drei Testimonials luden bis heute je
          einen ECHTEN YouTube-Player beim Seitenaufbau — gemessen 3 Player und
          1,18 MB Video-Infrastruktur, BEVOR irgendjemand geklickt hat, auf
          jedem Seitenaufruf und für die große Mehrheit vergeblich.

          Jetzt: Facade-Muster über den BESTANDS-Baustein YoutubeTimestamp
          (seit Juli auf acht Seiten live, P10 — nichts Neues erfunden).
          SSR rendert nur das Vorschaubild; der Player kommt beim Klick.
          `vorwaermen` bereitet auf ein Absichtssignal hin nur die VERBINDUNG
          vor (kein Player, keine Videodaten, nichts bei Save-Data/2G).
          `noscriptFallback` hält den Klickweg ohne JavaScript offen — das
          abgeloeste <iframe> konnte das, ein <button> kann es sonst nicht.

          Poster je Video vorab gemessen: alle drei tragen ein echtes
          maxresdefault 1280x720 (kein Hochskalieren, keine Verschlechterung).
          Klasse .YoutubeIframe bleibt bewusst als Kleid stehen: identische
          Geometrie (max-width 800, 16:9, margin 50px auto) wie vorher. */}
      <YoutubeTimestamp
        dataSection="youtube-testimonial-preis"
        videoId="jyLyXZqHxaw"
        titel="Erfahrungsbericht von Constantin Preis"
        className="YoutubeIframe YoutubeIframe--facade"
        playClassName="YoutubeIframe--facade__play"
        sizes="(max-width: 840px) 100vw, 800px"
        noscriptFallback />
      <YoutubeTimestamp
        dataSection="youtube-testimonial-tepperwein"
        videoId="aG36zJKxDzg"
        titel="Erfahrungsbericht von Nada und Kurt Tepperwein"
        className="YoutubeIframe YoutubeIframe--facade"
        playClassName="YoutubeIframe--facade__play"
        sizes="(max-width: 840px) 100vw, 800px"
        noscriptFallback />
      <YoutubeTimestamp
        dataSection="youtube-testimonial-guse"
        videoId="zIfDQ1N60fI"
        titel="Erfahrungsbericht von Michelle Christin Guse"
        className="YoutubeIframe YoutubeIframe--facade"
        playClassName="YoutubeIframe--facade__play"
        sizes="(max-width: 840px) 100vw, 800px"
        noscriptFallback />

      {/* Externe Stimmen (Job 20260903-BAU-externe-stimmen-startseite-...):
          Fremdbelege als EINE Reihe, direkt unter den drei Testimonial-Videos
          und VOR den eigenen Studien - Fremdbeleg wirkt vor Eigenbeleg.
          Maxim ist hierher UMGEZOGEN (vorher unterhalb des Mikroskop-Videos);
          die Komponente selbst ist unveraendert. */}
      <ExterneStimmen dataSection="externe-stimmen" />

      <PeerReviewStudies />

      <Studien dataSection="studien" headline="Wirkung an menschlichen Zellen bestätigt!" />

      <ScrollMikroskopVideo dataSection="mikroskop-video" />

      <Finanzierungsbanner dataSection="finanzierung" />

      <div className='NormalSectionSize text-center' data-section="chip-design">
      <h2>
        Dank innovativem Chip-Design: <br />
        QiOne® 2 Pro und QiBracelet® - Jetzt 8x stärker!
      </h2>
      <p style={{marginBottom: "50px"}}><b>Persönliches Wachstum, Schutz vor 5G & E-Smog,
        Gesteigerte Anbindung zum Quantenfeld</b></p>
      </div>
      {/* Produkt-Demo direkt nach dem Chip-Design-Erklaerblock (erklaeren ->
          zeigen, GL-DES-0009 SHOW IT): GitterChip-Molecules-Scrub, Quellen/
          Overlays zentral im Wrapper. Die Startseite ist voll anker-
          instrumentiert -> dataSection hier korrekt (kein Collector-Kapern). */}
      <GitterchipMoleculesScrub dataSection="gitterchip-video" />
      <SingleImage dataSection="chip-vergleich" link={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/GitterChips_Vergleich-min.webp?v=1699381065"} size={"normal"}/>
      <div className="text-center mt-2" data-section="chip-cta">
        <a className="btn--primary m-center" href="/products/qione-2-pro">Hole dir jetzt deinen QiOne® 2 Pro</a>
      </div>
      <FeaturedProduct
        dataSection="featured-qione-2-pro"
        linkKaufseite="/products/qione-2-pro"
        linkDetailseite="/pages/qione-2-pro-details"
        title="QiOne® 2 Pro"
        label="Kompakt. Innovativ. Stark."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_02_transparent_1.webp?v=1666591442" />
      <FeaturedProduct
        dataSection="featured-qibracelet"
        linkKaufseite="/products/qibracelet"
        linkDetailseite="/pages/qibracelet-details"
        title="Das QiBracelet®"
        label="Eleganz und Schutz - dein Support."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/01_2048px-Alpha_1.webp?v=1667284638"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/02_2048px-Alpha_1.webp?v=1667284591" />
      <FeaturedProduct
        dataSection="featured-qihome-air"
        linkKaufseite="/products/qihome-air"
        linkDetailseite="/pages/qihome-details"
        title="Das QiHome® Air"
        label="Gesundes Zuhause, produktives Umfeld."
        bildRechts="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329"
        bildLinks="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome_side_alpha2-800x868-1_1.png?v=1667284770" />

      <CallToAction dataSection="cta-kohaerentes-wasser" text={
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
      <div className="Stretched mt-[100px]!" data-section="superhuman-banner">
      <HeroBanner
        backgroundImage={"qiblanco-com-in-5-stufen-zum-superhuman-hintergrund.png?v=1645178965"}
        headline="Der Qi Blanco® Video-Kurs:"
        subheadline="In 5 Stufen zum Superhuman"
        height={300}
        parallax={true}/>
      </div>
        <CallToAction
          dataSection="cta-videokurs"
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
      <UpsellLineUp dataSection="upsell-lineup" />
      <WeiterlesenHubs />
    </div>
  );
}

/**
 * Drei Wege von der Startseite tiefer in die Domain.
 *
 * WARUM ES DIESEN BLOCK GIBT (s04 hat den Link-Graphen über 79 DACH-Seiten
 * gecrawlt, das sind keine Schätzwerte): `/pages/technologie` hatte NULL
 * eingehende interne Links — nicht nur keinen von der Startseite, sondern von
 * nirgends. `/pages/crystal-cacao` hatte zwei, beide von Produktseiten,
 * keinen von `/`. Eine Seite, auf die nichts zeigt, ist für einen Crawler
 * kaum vorhanden, egal wie gut sie ist. Backlog-Posten B-12.
 *
 * WARUM GENAU DIESE DREI UND NICHT MEHR: die beiden Hubs sind der beschlossene
 * Posten. Die Über-uns-Seite kommt dazu, weil sie in diesem Segment neu
 * entsteht und sonst denselben Fehler von Tag eins an hätte.
 *
 * WARUM HIER UNTEN: die Startseite verkauft oben. Wer bis hierher gelesen hat,
 * sucht Tiefe — genau die beiden Fragen, die der Kaufüberzeugungs-Kanon als
 * stärkste Neugier-Themen für DACH führt („Wie wirkt das überhaupt", 9,8 %)
 * und als stärksten Einwand („Wirkt das überhaupt?"). Weiter oben wäre es ein
 * Ausgang aus dem Kaufweg, hier ist es die Fortsetzung.
 *
 * WARUM KEINE EIGENEN DESIGN-TOKEN: der Block benutzt ausschließlich das
 * Vokabular, das die Startseite schon trägt (`NormalSectionSize`, `text-center`
 * und die vorhandenen Utilities). Eine neue Kachel-Optik auf der wichtigsten
 * Seite der Domain wäre ein Design-Risiko ohne Gegenwert — der Posten ist eine
 * Verlinkungs-, keine Gestaltungsaufgabe.
 */
function WeiterlesenHubs() {
  return (
    <div
      className="NormalSectionSize text-center"
      data-section="weiterlesen-hubs"
    >
      <h2 className="text-center">Wenn du es genauer wissen willst</h2>
      <div className="PeerReviewResults">
        <div className="PeerReviewResult">
          <h3>
            <a href="/pages/technologie">Die Technologie dahinter</a>
          </h3>
          <p>
            Kohärentes Wasser, Frequenzkommunikation und das Leiternetzwerk des
            Körpers — erklärt statt behauptet.
          </p>
        </div>
        <div className="PeerReviewResult">
          <h3>
            <a href="/pages/crystal-cacao">Crystal Cacao®</a>
          </h3>
          <p>
            Wach, klar, mineralisiert: 100 % reiner Premium-Naturkakao aus
            Peru.
          </p>
        </div>
        <div className="PeerReviewResult">
          <h3>
            <a href="/pages/über-uns">Wer hinter Qi Blanco steht</a>
          </h3>
          <p>
            Name, Anschrift, Handelsregister — und das Institut, das unsere
            Produkte zellbiologisch untersucht hat.
          </p>
        </div>
      </div>
    </div>
  );
}

function PeerReviewStudies(){
  return (
    <div className='PeerReviewStudies NormalSectionSize text-center' data-section="peer-review-studien">
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
