import {ZellDiagramme} from '~/components/index-components/ZellDiagramme';
import {Bewertungsblock} from '~/components/reusables/Bewertungsblock';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {LogoBar} from '~/components/reusables/LogoBar';
import {Richtext} from '~/components/reusables/Richtext';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {FeaturedProduct} from '~/components/index-components/FeaturedProduct';
import {ExterneStimmen} from '~/components/reusables/ExterneStimmen';
import {RookieKopf} from './RookieKopf';
import {StickyKaufknopf} from './StickyKaufknopf';

/*
 * ROOKIE-STARTSEITE /pages/start-b — Variante B der Startseite / (Experiment
 * start-e1-gs081, Hypothese GS-081 = ein Paket aus GS-064, GS-061, GS-062,
 * GS-063 und H-360; Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-
 * startseite, KONZEPT Abschnitt 3b).
 *
 * Dieselben Bausteine wie A (components/homepage/HomepageSections.jsx), andere
 * Auswahl und Reihenfolge. A bleibt unverändert.
 *
 * AUSWAHL nach der Abschnitt-Sicht von A (messung/ist-20261006.json,
 * 14 Tage bis 06.10.): was weniger als jeder zehnte Besucher sieht, steht in B
 * nicht. Ausnahme ist, was das Paket ausdrücklich nach vorn holt: die drei
 * Produktkarten (GS-062) und ein Kaufknopf nach den Zell-Diagrammen (GS-061).
 * Nicht in B (Sicht in A): Peer-Review 8,7 %, Studien 9,1 %, Mikroskop-Video
 * 8,3 %, Finanzierung 1,7 %, Chip-Design 1,9 %, GitterChip-Video 4,1 %,
 * Chip-Vergleich 2,1 %, Chip-Knopf 2,1 %, „kohärentes Wasser“ 1,4 %,
 * Video-Kurs-Banner und -Karte 1,4/1,7 %, Upsell-Reihe 1,9 %. A und die
 * Detailseiten behalten sie.
 *
 * MESSANKER: gleiche data-section-Namen wie A für gleiche Blöcke, damit der
 * Heatmap-Manager je Block vergleicht. Neu sind nur „zell-cta“ (der Knopf nach
 * den Zell-Diagrammen; in A gibt es diesen Ort nicht, chip-cta steht dort an
 * anderer Stelle) und „start-b-sticky-kaufknopf“.
 *
 * Der Rahmen trägt die Klasse „home“ wie A: startseite.css (Token-Schicht der
 * Startseite, auf .home gescoped) setzt B damit genau wie A.
 */
const ZIEL = '/products/qione-2-pro';

export function StartRookie() {
  return (
    <div className="home qb-rookie-start">
      <RookieKopf dataSection="hero" />
      <ZellDiagramme dataSection="zell-diagramme" />

      {/* GS-061: der erste Kaufknopf nach dem Kopf, dort, wo A noch ein
          Drittel der Besucher hat (Zell-Diagramme 35 %). Bauform und Ziel wie
          der Chip-Knopf von A, Wortlaut wie der Kopf-Knopf („Jetzt kaufen“):
          ein Ziel trägt auf dieser Seite eine Beschriftung (design-rubrik,
          CTA-Einstimmigkeit; der Branch-Build mit „Hole dir jetzt deinen
          QiOne® 2 Pro“ hier meldete zwei Wortlaute für /products/qione-2-pro). */}
      <div className="text-center qb-rs-zell-cta" data-section="zell-cta">
        <a className="btn--primary m-center" href={ZIEL}>Jetzt kaufen</a>
      </div>

      <LogoBar dataSection="logo-bar" />

      <Richtext
        dataSection="nutzer-statistik"
        alignment="center"
        text={<h2>"87 % der Nutzer berichten von positiven <br /> Veränderungen in ihrem Wohlbefinden nach der <br /> Anwendung der Qi Blanco® Produkte."</h2>} />

      {/* GS-062: die Produktauswahl direkt hinter der Nutzer-Statistik (A: bei
          69-73 % der Seite, Sicht 1,4-1,7 %). Props wörtlich wie in A. */}
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

      <InfoSlider dataSection="info-slider" />

      {/* Bewertungsblock wie in A: Anker google-reviews und reputon-reviews. */}
      <Bewertungsblock />

      {/* Drei Erfahrungsberichte als Vorschaubild, Player erst beim Klick
          (Props wörtlich wie in A, Begründung dort). */}
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

      <ExterneStimmen dataSection="externe-stimmen" />

      <StickyKaufknopf
        kopfSelektor=".qb-rookie-start [data-section='hero']"
        kaufknopfSelektor=".qb-rookie-start [data-section='zell-cta']"
      />
    </div>
  );
}
