import {HeroBannerParallax} from '../reusables/HeroBannerParallaxButton';
import {GoogleRezensionenBereich} from '../reusables/GoogleRezensionenBereich';
import {UpsellLineUp} from '../UpsellLineUp';
import {ProductFAQ} from '../ProductFAQ';
import {FAQ_QI_MASTER} from '~/data/product-faqs';
import {StudienCards} from './StudienCards';
import {QIMASTER_SYMBOL_PFADE} from '~/lib/qi-master-symbole.generated';
import {
  QIMASTER_DIAMANTBILDER,
  QIMASTER_DIAMANTBILDER_TITEL,
} from '~/data/qi-master-diamantbilder';
import {QIMASTER_LITERATURBILDER} from '~/data/qi-master-literaturbilder';
import {QIMASTER_GUETEZEICHEN} from '~/data/qi-master-guetezeichen';
import {
  QIMASTER_DIAMANT,
  QIMASTER_SECHS_G,
  QIMASTER_PERSOENLICHKEIT,
} from '~/data/qi-master-texte';

/*
 * QiMaster — der Seiteninhalt unterhalb der Buy-Box von /products/qi-master
 * (Job 20260910-BAU-qi-master-produkt-und-shopseite-diamant-6g-und-
 * persoenlichkeitsentwicklung, Christian-Auftrag CW-20260910-0e45045b).
 *
 * BAUFORM: derselbe Aufbau wie product-pages/QiOne2Pro.jsx —
 * Investment-Block, Main Features, Google-Rezensionen, 20-Tage-
 * Block, Parallax-Hero, Studien, Technologie/Fertigung, Upsell,
 * FAQ — dieselben Sektionsklassen aus app.css, damit Abstaende und Bausteine
 * mit der QiOne-2-Pro-Seite identisch bleiben. NEU sind allein die drei
 * Inhalts-Bausteine des QiMaster (Diamant, 6G, Persoenlichkeitsentwicklung);
 * ihre Texte leben in app/data/qi-master-texte.js, weil dort jede Aussage
 * ihre Quelle trägt und der Text ohne Markup pruefbar bleibt.
 *
 * WAS BEWUSST FEHLT (jede Auslassung eine Entscheidung, kein Vergessen):
 *  - Der Gitterchip-Abschnitt ("Der Gitterchip™ im Qi Master®", "Ohne
 *    Elektronik", "Für jeden Einsatzort") samt der Chip-Aufnahme aus dem
 *    QiOne® 2 Pro: ersatzlos gestrichen (Christian 2026-09-17, Auftrag
 *    20260917-gitterchip-block-samt-bild-ersatzlos-streichen, "inklusive
 *    Bild"). NICHT NEU BAUEN. Die Angaben leben weiter, nur woanders:
 *    Beständigkeit gegen Sauna/Chlor/Salzwasser/Schweiß steht in der
 *    Fragenliste (app/data/product-faqs.js), die 750er Goldlegierung samt
 *    "ohne Elektronik" im Abschnitt "Das technische Fundament". EINE Angabe
 *    ist mit dem Block wirklich weg: "keine Batterie". Sie wurde bewusst
 *    NICHT woandershin gerettet — das entscheidet Christian, nicht der Bau.
 *    Gemessen: pruefungen/probe_gitterchip_block_gestrichen.py.
 *  - Ratenzahlungs-Bausteine (RatenzahlungHerobanner, „0 % Finanzierung",
 *    Klarna/PayPal-Raten): die Ratenangebote der Zahlungsdienste sind
 *    betragsgedeckelt (PayPal-Ratenzahlung bis 5.000 EUR); für 10.639 EUR
 *    ist die Zusage nicht belegt -> offene Flanke an Christian, nicht auf
 *    die Seite.
 *  - Sternzeile/„Über 14.000 Nutzer"/„Bestseller": Bestandszahlen des
 *    QiOne 2 Pro, die dieses Produkt nicht hat.
 *  - „8x stärker", „22,61 mm³", „100 % in Bayern gefertigt", „RJC-Gold":
 *    Angaben des QiOne 2 Pro, für den QiMaster nicht bestaetigt.
 *  - DIE VERTRAUENSLEISTE (`reusables/LogoBar.jsx`, die vier fremden
 *    Wortmarken BRAINEFFECT / MAXIM / „find your flow!" / DNX): am
 *    2026-09-17 von Christian ersatzlos gestrichen — „Ersatzlos streichen."
 *    NUR für DIESE Seite. Die Komponente bleibt und trägt unverändert die
 *    Startseite sowie die Produkt- und Detailseiten von QiOne 2 Pro,
 *    QiBracelet und QiHome Air; die geteilte Geometrie-Regel in app.css
 *    (D-2712) wird deshalb NICHT angefasst. Wer die Leiste hier
 *    wieder einbaut, hebt eine Christian-Entscheidung auf.
 *  - Produktbilder: es gibt noch keine. Die Buy-Box zieht sie aus Shopify,
 *    sobald sie dort liegen — hier wird kein QiOne-Bild als QiMaster gezeigt.
 *
 * CTA-Ziel: #qm-buybox — die Buy-Box dieser Seite, seit 2026-09-16 wirklich.
 *
 * DIESER SATZ WAR BIS DAHIN FALSCH, UND ZWAR IN BEIDE RICHTUNGEN: er nannte
 * '#qm-buybox' "ein echtes Ziel" (die Id existierte in KEINER Datei des Ladens,
 * der Knopf tat beim Klick nichts) und '#product' der QiOne-PDP "tot" (dort war
 * er es tatsaechlich, auf qibracelet/qihome-air/zeremonie-kakao dagegen nie).
 * Ein Kommentar, der das Gegenteil dessen behauptet, was der Fall ist, ist
 * teurer als gar keiner: er beantwortet die Frage, bevor jemand sie stellt.
 * Beide Ziele hängen jetzt an der Buy-Box ihrer Route (`ankerId`), beide
 * gemessen am ausgelieferten DOM.
 */
export default function QiMaster({block = undefined}) {
  return (
    <div className="ProductPageQiMaster">
      <MainFeatures />
      <Guetezeichen />
      <DiamantBilder />
      <DiamantAbschnitt />
      <SechsGAbschnitt />
      <PersoenlichkeitAbschnitt />
      <HeroBannerParallax
        backgroundImage={
          '/2023-03-01-qiblanco-milva-martin-1020791_1.webp?v=1680003385'
        }
        headline={<>Dein Qi Master® begleitet dich<br />Tag und Nacht.</>}
        subheadline={'Ein Stück, das du nicht ablegen musst.'}
        parallax={true}
        size={850}
        link={'#qm-buybox'}
        linkStyling={'primary'}
        linkText={'Hole dir deinen Qi Master®'}
      />
      {/* Die Überschrift sagt, WAS die Studien sind — veröffentlicht —, statt
          vorwegzunehmen, woran sie gemessen wurden (Christian 2026-09-16,
          Auftrag 20260916-publizierte-zellstudien-und-eine-mittige-zeile).
          Bis dahin: "Die Zellstudien zum Gitterchip – durchgeführt am
          QiOne® 2 Pro".

          DER GERÄTE-HINWEIS IST NICHT WEG, ER STEHT NUR WOANDERS: in den
          Studientexten dieser Seite (6G-Abschnitt, Diamant-Abschnitt, FAQ)
          bleibt "QiOne® 2 Pro" samt Dartsch-Quellen und "in vitro" stehen —
          dort gehört er hin. Gemessen:
          pruefungen/probe_publizierte_zellstudien.py, Arm `ueberschrift`
          prüft die Überschrift, ausdrücklich nicht die Seite. */}
      <StudienCards headline="Publizierte Zellstudien zum Gitterchip™" />
      <Fertigung />
      {/* Der Google-Bewertungsbereich steht hier unten, unmittelbar oberhalb
          des Upsell-Blocks (Christian 2026-09-16, Auftrag 20260916-
          bewertungsblock-wandert-ans-ende: "Diesen Bereich ganz nach unten
          schieben, oberhalb von 'Über 300 neue Nutzer jeden Monat'").
          Bis dahin stand er zwischen dem Fünf-Karten-Karussell (seit dem
          2026-09-16 ersatzlos gestrichen) und dem 20-Tage-Block.

          ES IST EIN UMZUG, KEIN UMBAU: die Komponente ist unverändert, also
          auch ihre Überschrift, die KI-Zusammenfassung, alle Karten, der
          Schieberegler und das Abzeichen mit der Bewertungszahl. Es sind
          fremde Aussagen über uns — sie werden bewegt, nicht bearbeitet.

          DER ANKER ZIEHT MIT: `#google-rezensionen` hängt an der Sektion
          selbst (GoogleRezensionenBereich.jsx), nicht an dieser Stelle. Der
          4,8-Klick im Kopf-Banner fährt über findeRezensionsZiel() auf
          genau diese Id und findet sie weiterhin — nur eben weiter unten.
          Gemessen nach dem Bau: `pruefungen/probe_bewertungsblock_position.py`,
          Arm `anker` (kein NEU toter Anker; `#qm-buybox` bleibt der bekannte,
          von diesem Bau unberührte Bestandsbefund).

          WARUM DIE STELLE INHALTLICH TRÄGT: sozialer Beweis zieht
          Aufmerksamkeit, entscheidet aber nicht allein den Kauf — er steht
          jetzt am Ende der Argumentationskette und direkt vor dem Upsell,
          statt den Lesefluss nach dem zweiten Abschnitt zu unterbrechen. */}
      <GoogleRezensionenBereich />
      <UpsellLineUp block={block} />
      <ProductFAQ items={FAQ_QI_MASTER} />
    </div>
  );
}

/* ─────────────────── Rohdiamant und Brillant ───────────────────
 * Zwei Bilder, zwei Unterschriften — an der Stelle, an der bis zum 2026-09-16
 * das Fünf-Karten-Karussell stand.
 *
 * WAS HIER WEG IST UND WARUM (Christian, 2026-09-16): „Diesen Bereich hier
 * ersatzlos streichen." Der Bereich war der geteilte `InfoSlider` mit fünf
 * Karten — Erholsame Nächte, Starkes Wohlbefinden, Klarer Kopf, Klarer Fokus,
 * Mehr Energie. KEINER dieser fünf Texte sprach vom Qi Master®: alle fünf
 * verkaufen den QiOne® 2 Pro oder das QiBracelet®, auf der Kaufseite eines
 * Stücks für 10.639 €. Es war übernommenes Material anderer Produktseiten.
 * Die Texte wandern deshalb NIRGENDWOHIN — sie stehen auf den Seiten, zu
 * denen sie gehören, ohnehin bereits.
 *
 * DIE GETEILTE VORLAGE BLEIBT UNBERÜHRT. `InfoSlider` trägt dieselben fünf
 * Karten auf sieben weiteren Flächen (Startseite, /products/qione-2-pro,
 * /pages/exclusive-solutions und vier Kampagnenseiten). Entfernt ist allein
 * die VERWENDUNG auf dieser Seite; an der Vorlage ist keine Zeile geändert.
 * Die Hausfalle dazu ist gemessen und benannt („eine geteilte Vorlage kann
 * keine Teilmenge liefern", areas.yaml/ads, 2026-07-29): wer an der Vorlage
 * schneidet, schneidet für alle. Gemessen wird die Nachbarschaft von
 * homepage-bauer/pruefungen/probe_infoslider_nachbarflaechen.py.
 *
 * DIE ÜBERSCHRIFT „The One Eye" STEHT SEIT DEM 2026-09-17 HIER, und dieser
 * Absatz sagte bis dahin das Gegenteil: „der Auftrag sagt ‚zwei Bilder, zwei
 * Zeilen‘ und nichts von einer Überschrift; eine zu erfinden wäre neuer
 * Inhalt". Das war richtig — für den Auftrag vom 2026-09-16. Christian hat am
 * 2026-09-17 eine bestellt und gesagt, welche: die des Abschnitts darunter,
 * ohne ihren Zusatz („The One Eye - Ein Diamant" -> „The One Eye"). Erfunden
 * ist daran nichts; verschoben ist eine Zeile. Gemessen von
 * homepage-bauer/pruefungen/probe_one_eye_ueber_bildern.py.
 *
 * SIE STEHT IN DIESER SEKTION UND NICHT ZWISCHEN DEN SEKTIONEN: eine
 * Überschrift gehört an das, was sie überschreibt. Der Gütezeichen-Block
 * darüber ist nicht gemeint — stünde er zwischen ihr und den Bildern, titelte
 * sie ins Leere. Reihenfolge deshalb: Gütezeichen, „The One Eye", Bildpaar.
 *
 * WARUM DAS PAAR SCHMALER IST ALS DIE SEKTION: die Hülle trägt
 * `NormalSectionSize` und damit exakt die Breite und Mitte der Nachbar-
 * abschnitte („dieselbe Breite, mittig"). Das Bildpaar selbst ist auf 960 px
 * gedeckelt — bei 1350 px wären zwei Steine je 660 px breit und würden die
 * Seite beherrschen, und aus einer 1024-px-Quelle käme dabei weniger als
 * doppelte Pixeldichte. So sitzt jedes Bild bei rund 464 px, also über dem
 * Doppelten seiner Anzeigekante.
 *
 * DIE SEITIGKEIT IST VORGEGEBEN: links Rohdiamant, rechts Brillantschliff.
 * Auf dem Telefon wird daraus die Leserichtung von oben nach unten, in
 * derselben Reihenfolge.
 *
 * FIGURE/FIGCAPTION IST DIE RICHTIGE FORM, nicht eine <p> unter einem <img>:
 * die Unterschrift GEHÖRT zum Bild, und ein Screenreader liest sie dann als
 * dessen Beschriftung statt als losen Absatz.
 */
function DiamantBilder() {
  return (
    <section
      className="qm-diamantbilder NormalSectionSize"
      data-section="qm-diamantbilder"
    >
      <h2>{QIMASTER_DIAMANTBILDER_TITEL}</h2>
      <div className="qm-diamantbilder__paar">
        {QIMASTER_DIAMANTBILDER.map((bild) => (
          <figure className="qm-diamantbild" key={bild.id}>
            <img
              className="qm-diamantbild__bild"
              src={bild.src}
              width={bild.breite}
              height={bild.hoehe}
              alt={bild.alt}
              data-herkunft={bild.herkunft}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="qm-diamantbild__unterschrift">
              {bild.unterschrift}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/**
 * Nutzenliste der Buy-Box — markup-identisch zur QiOneBenefitList (dieselben
 * vier Icons, dieselbe .BenefitList), mit den Zeilen, die für den QiMaster
 * belegt sind. „In 2-3 Tagen bei Dir" und „Inklusive Baumwollband" der
 * QiOne-Liste sind hier bewusst NICHT uebernommen: Lieferzeit eines
 * nummerierten Einzelstuecks und Lieferumfang (Goldkette statt Band) sind
 * andere Tatsachen.
 *
 * `zusatzPunkt` hängt einen WEITEREN <li> ans Ende — dieselbe Naht wie bei
 * QiOneBenefitList (QiOneBuyBox.jsx:195). Er trägt den Gewährleistungs-
 * Listenpunkt, und der Knoten MUSS ein <li> sein, weil er direkt im <ul>
 * landet.
 *
 * WARUM DIESE LISTE IHN BRAUCHT UND ES BIS ZUM 2026-09-12 NICHT TAT: die
 * Hausregel (ProductForm.jsx, `gewaehrleistungsHinweis`, Elina
 * EL-20260909-8c4001d1) lautet „Fläche MIT Nutzen-Liste hängt den Punkt in
 * ihre Liste, Fläche OHNE behält den eigenständigen Block". Der Default
 * ist der Block und fail-closed TRUE — richtig so, denn die meisten
 * Kaufflächen laufen über den Catch-all products.$handle und können gar
 * nichts abschalten. Der Preis dieses Defaults ist, dass eine NEUE Seite mit
 * eigener Liste ihn aktiv abschalten muss; vergisst man das, steht das Siegel
 * angeklebt über der Liste statt in ihr. Genau das war hier der Fall, vom
 * ersten Tag der Seite an (e3560a1) bis zu diesem Commit.
 */
export function QiMasterBenefitList({zusatzPunkt = null}) {
  return (
    <div className="BenefitList">
      <ul>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.23em" height="1em" viewBox="0 0 1728 1408">
            <path fill="currentColor" d="M576 1152q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M192 640h384V384H418q-13 0-22 9L201 588q-9 9-9 22zm1280 512q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M1728 64v1024q0 15-4 26.5t-13.5 18.5t-16.5 11.5t-23.5 6t-22.5 2t-25.5 0t-22.5-.5q0 106-75 181t-181 75t-181-75t-75-181H704q0 106-75 181t-181 75t-181-75t-75-181h-64q-3 0-22.5.5t-25.5 0t-22.5-2t-23.5-6t-16.5-11.5T4 1114.5T0 1088q0-26 19-45t45-19V704q0-8-.5-35t0-38t2.5-34.5t6.5-37t14-30.5t22.5-30l198-198q19-19 50.5-32t58.5-13h160V64q0-26 19-45t45-19h1024q26 0 45 19t19 45"></path>
          </svg>
          Weltweit <b>Kostenloser Versand</b>
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.15em" height="1em" viewBox="0 0 2048 1792">
            <path fill="currentColor" d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"></path>
          </svg>
          <b>100% Versicherter Versand</b>
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path>
          </svg>
          <b>Nummeriertes Einzelstück</b> mit eigener Seriennummer
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1728 1728">
            <path fill="currentColor" d="M1728 864q0 176-68.5 336t-184 275.5t-275.5 184t-336 68.5t-336-68.5t-275.5-184t-184-275.5T0 864q0-213 97-398.5T362 160T736 9v228q-221 45-366.5 221T224 864q0 130 51 248.5t136.5 204t204 136.5t248.5 51t248.5-51t204-136.5t136.5-204t51-248.5q0-230-145.5-406T992 237V9q206 31 374 151t265 305.5t97 398.5"></path>
          </svg>
          <b>20 Tage volles Rückgaberecht</b> nach Erhalt der Ware
        </li>
        {zusatzPunkt}
        {/* SECHSTE ZEILE, Christian am 2026-09-16 woertlich: „Und bei denen noch
            eins einfuegen: 0% Finanzierung (in Fett) mit PayPal und Klarna
            (Gimmick davor kreieren), als letzten Punkt."

            SIE STEHT HINTER {zusatzPunkt} und damit hinter der Gewaehrleistung --
            „als letzten Punkt" ist wortwoertlich zu nehmen, und die Gewaehrleistung
            kommt über den Slot von aussen herein.

            Fett ist NUR „0% Finanzierung", wie bei den fünf Zeilen darueber auch.
            Schriftgroesse und Auszeichnung sind dieselben: genau das war Christians
            urspruengliche Beanstandung an diesem Block, und sie gilt für die neue
            Zeile genauso -- kein Element ist wichtiger als seine Nachbarn.

            KEINE Konditionen, keine Laufzeit, keine Beispielrechnung. Das ist eine
            Zeile, kein Finanzierungsrechner. Ob die Finanzierung im Einzelfall
            gewaehrt wird, entscheidet das Institut und nicht wir (Christians eigene
            Sprachregelung für AI Anna vom selben Tag) -- die Zeile behauptet
            deshalb ein ANGEBOT, keine Zusage.

            Das Symbol ist selbst gezeichnet wie die vier des Kopfblocks:
            app/assets/qi-master-symbole/finanzierung-null.svg, Herkunft in
            HERKUNFT.md daneben. Kartenrahmen mit drei gleich großen Feldern --
            die Teilung, nicht das Geld. */}
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d={QIMASTER_SYMBOL_PFADE['finanzierung-null']} />
          </svg>
          <b>0% Finanzierung</b> mit PayPal und Klarna
        </li>
      </ul>
    </div>
  );
}

function MainFeatures() {
  return (
    <div className="MainFeaturesWrapper">
      {/* Christians Fassung vom 2026-09-16, Wort für Wort (Job
          20260916-was-den-qimaster-ausmacht-wird-eine-bisher-unerreichte-liga).
          Übernommen ist die Schreibweise, die er selbst tippte: gerade
          Anführungszeichen um "The One Eye" und schlichte Bindestriche - genau
          so trägt der Kopf derselben Seite seine Fassung bereits. Korrigiert
          wurde nur Eindeutiges (Rechtschreibung, ® und ™), Ton und Aussage
          blieben unberührt. Das König-Zitat steht hier ohne Fußnote; seine
          ausführliche Quelle trägt der Diamant-Abschnitt weiter unten
          (app/data/qi-master-texte.js, QIMASTER_DIAMANT) - die wird nie
          angetastet. Der Abschnitt wird hier bewusst NICHT mehr bei seiner
          Überschrift genannt: er hiess „Warum ein Diamant", dann „The One Eye
          - Ein Diamant", und seit dem 2026-09-17 trägt er gar keine mehr (sie
          steht jetzt über dem Bildpaar). Ein Verweis auf eine Prosa-Zeile
          altert mit ihr. */}
      <h2 className="text-center">Qi Master® - Eine bisher unerreichte Liga</h2>
      <div className="MainFeatures NormalSectionSize">
        <div className="MainFeaturesColumn">
          <h3>Der Gitterchip™ der ultimativen Generation</h3>
          <p>
            Der Kern des Qi Master® ist ein zweiteiliger Gitterchip™, definiert
            durch die über ein Jahrzehnt andauernde Forschung am QiOne®. Das
            Ergebnis ist die außergewöhnlichste Erscheinung: Eine Goldlegierung,
            deren Atome in einer einmalig definierten Ordnung stehen. Kohärent
            wirkend und ihre Umgebung aktiv prägend.
          </p>
        </div>
        <div className="MainFeaturesColumn">
          <h3>"The One Eye" - Hochreiner Natur Diamant</h3>
          <p>
            Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede
            Zelle deines Körpers gebaut ist. Alles Leben, so wie wir es auf der
            Erde kennen, basiert auf Kohlenstoff. „Die Kohlenstoffatome im
            Diamanten senden also auf den richtigen Frequenzen, die die
            Kohlenstoffatome in biologischem Material empfangen können.“ -
            Dr. Michael König
          </p>
        </div>
        {/* Christians Fassung vom 2026-09-17, Wort für Wort (Job
            20260917-pure-leistung-pure-entspannung). Drei Änderungen in einem
            Block, und keine davon ist Redaktion:

            ÜBERSCHRIFT: die alte kündigte an ("vorbereitet auf das, was
            kommt"), die neue nennt zwei Zustände, die der Kunde bekommt.

            SCHREIBWEISE: der Markenname stand gebeugt mit dem Zeichen hinter
            dem Wortstamm und einem zweiten am Ende - ein Artefakt der
            hausweiten ™-Regel, die die gebeugte Form nicht erkannt hat.
            Richtig ist das Zeichen hinter dem VOLLSTÄNDIGEN gebeugten Wort.
            Nachgemessen über vier Seiten beider Shops war es ein Einzelfall
            und kein Muster - deshalb hier mitrepariert statt als eigener
            Auftrag. Die bestehende Schreibwache
            pruefungen/probe_qimaster_schreibweise_naht.py findet diesen Fall
            baulich NICHT: ihr OHNE_TM fragt nach "Gitterchip ohne
            Markenzeichen", und das Zeichen war ja da - nur an der falschen
            Stelle. Die Lücke ist gemessen, nicht vermutet. Seit heute misst
            sie pruefungen/probe_pure_leistung.py, Arm `schreibweise`, als
            MUSTER (Markenname + Zeichen + Buchstabe) und nicht als der eine
            kaputte String - ein Arm auf die Instanz wäre beim nächsten
            gebeugten Fall wieder blind. Der Absatz zitiert die falsche Form
            deshalb auch nicht: ein Kommentar, der sie wörtlich trägt, zwingt
            jede künftige Rohtext-Probe zu einer Ausnahme.

            AUFZÄHLUNG: die genannte Mobilfunkgeneration ist jetzt die
            nächste echte, nicht eine erfundene - eine erfundene Zahl macht
            die echten Punkte daneben unglaubwürdiger. "Schicksalsschläge"
            weitet die Aussage vom Technischen ins Persönliche; das ist eine
            Herstellerangabe über die Reichweite des eigenen Produkts
            (GL-SPR-0008) und steht ohne Distanzformel.

            NICHT ANGETASTET: der 6G-Abschnitt weiter unten und die FAQ-Frage
            "Schützt der Qi Master® vor 6G?" - über beide ist nichts
            entschieden. Die geraden Anführungszeichen um "The One Eye"
            bleiben, wie Christian sie setzt. */}
        <div className="MainFeaturesColumn">
          <h3>Pure Leistung. Pure Entspannung.</h3>
          <p>
            Durch dieses einmalige Duett des Gitterchips™ und "The One Eye" ist
            der Qi Master® auf jegliche erdenkbare Zukunft vorbereitet. Egal ob
            sie 6G, Umweltgifte oder Schicksalsschläge lautet. Der Qi Master®
            leistet auf jeder Ebene das erdenkliche Maximum.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Die drei Gütezeichen über den Diamantbildern (Christian am 2026-09-17:
 * „Optisch grösser machen — also 3 zentrale Qualitätselemente, wieder goldene
 * Gimmicks dazu entwerfen. Und oberhalb der Diamantenbilder anbringen.").
 *
 * VORGESCHICHTE IN EINEM SATZ, weil sonst niemand versteht, warum hier eine
 * Funktion verschwunden ist: bis zum 2026-09-17 stand an dieser Stelle
 * `RisikofreiErleben` mit vier mittigen Zeilen UNTER dem Bildpaar, angeführt
 * von der Überschrift „Lass dich vom Qi Master® tragen." Christian hat die
 * Überschrift gestrichen und die drei Zusagen nach oben geholt.
 *
 * WAS DIE SCHWESTERSEITEN WEITER TRAGEN: QiOne2Pro, QiBracelet und QiHome
 * haben in ihrer `.RisikofreiErleben` unverändert den erzählenden Block mit
 * Rückgabeweg. Diese Seite hat ihn seit dem 2026-09-16 nicht mehr, und die
 * Klasse ist jetzt ganz weg — der Abschnitt ist keine Erzählung mehr, sondern
 * ein Zeichenblock. Der Sektionstakt kommt deshalb aus `NormalSectionSize`,
 * genau wie beim Bildpaar direkt darunter.
 *
 * DER RÜCKGABEWEG IST NICHT VERSCHWUNDEN: er steht weiter unten im
 * Gewährleistungstext (Weg, Adresse info@qiblanco.com, volle Erstattung).
 * Dieser Block nennt die Zusage, jener das Verfahren.
 *
 * EINE LISTE, KEINE DREI ABSÄTZE: die drei Zeilen sind gleichrangige Zusagen,
 * und ein Screenreader soll sie als solche ansagen („Liste mit 3 Einträgen").
 * Die Symbole tragen `aria-hidden` — ihre Bedeutung steht als Text unmittelbar
 * daneben, ein erfundener Alternativtext wäre schlechter als keiner (dieselbe
 * Entscheidung wie bei den Kopfsymbolen, qi-master-kopfsymbole.js).
 *
 * KEIN <h2>: der Block hat keine Überschrift mehr, weil Christian sie
 * gestrichen hat. Eine erfundene Ersatz-Überschrift wäre genau der Text, den er
 * nicht wollte — und die Dokument-Gliederung der Seite trägt weiter über die
 * H2 der Abschnitte darunter. Die nächste davon ist seit dem 2026-09-17
 * „The One Eye" über dem Bildpaar; sie folgt unmittelbar auf diesen Block und
 * gehört den Bildern, nicht ihm.
 */
function Guetezeichen() {
  return (
    <section className="qm-guete NormalSectionSize" data-section="qm-guete">
      <ul className="qm-guete__liste">
        {QIMASTER_GUETEZEICHEN.map((zeichen) => (
          <li className="qm-guete__punkt" key={zeichen.id}>
            <svg
              className="qm-guete__symbol"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {zeichen.pfade.map((d) => (
                <path d={d} key={d} />
              ))}
            </svg>
            <span className="qm-guete__text">{zeichen.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────────────────── Diamant ───────────────────────── */
function DiamantAbschnitt() {
  const t = QIMASTER_DIAMANT;
  return (
    <section className="qm-sektion" id="diamant" data-section="qm-diamant">
      <div className="qm-sektion__inner">
        {/* „Literatur" — Christians Auftrag vom 2026-09-17, abends. Die <h2>
            ist ZURÜCK, aber sie ist nicht dieselbe: „The One Eye" ist mittags
            hinauf über das Bildpaar gewandert und bleibt dort (DiamantBilder,
            qi-master-diamantbilder.js). „Literatur" füllt die Stelle, die der
            Umzug hier frei gelassen hat.

            SIE ERÖFFNET DIE HERLEITUNG, sie etikettiert nicht den ersten
            Absatz: Kohlenstoff-Einstieg, Königs Zitat, Kristallgitter,
            Kohärenz, Popp und Pollack stehen alle unter ihr. Deshalb <h2> wie
            die übrigen Abschnittsüberschriften der Seite (SechsGAbschnitt,
            PersoenlichkeitAbschnitt) und keine kleine Zwischenzeile — und
            deshalb KEIN eigenes CSS: `.ProductPageQiMaster h2` ist der eine
            h2-Stil dieser Seite, die Überschrift erbt ihn.

            DIE GLIEDERUNG WIRD DAMIT WIEDER GERADE: die vier h3 dieses
            Abschnitts hingen seit dem Umzug an einer h2 eine Sektionsgrenze
            weiter oben. Jetzt hängen sie wieder an der h2 ihrer eigenen
            Sektion.

            NICHT ZU VERWECHSELN mit dem Label „In der Literatur" weiter
            unten, das die Blöcke beim Bau dieser Zeile noch tragen. Es ist
            am selben Abend zum Streichen bestellt (Auftrag
            20260917-in-der-literatur-raus-…) — diese Überschrift macht es
            ohnehin überflüssig. Der Wortstamm stand also schon auf der
            Seite, bevor es diese h2 gab; das ist der Grund, warum die Probe
            sie auf Gleichheit vergleicht und nicht auf Enthaltensein. */}
        <h2>{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        {/* DIE NUMMERN 1 BIS 4 — Christians Auftrag vom 2026-09-17: „Und
            jedem einen Aufzählungspunkt geben, also von 1. bis 4."

            SIE ENTSTEHEN AUS DER REIHENFOLGE, SIE STEHEN NICHT IM TEXT. Eine
            Nummer, die in `titel` mitgeschrieben wäre, ist eine zweite
            Buchführung derselben Reihenfolge: wer einen Block umstellt oder
            einfügt, müsste zwei Stellen nachziehen, und die falsche gewinnt
            still. Hier gibt es nur eine Quelle — die Position in
            `befunde[]`.

            DIE NUMMER GEHÖRT IN DIE ÜBERSCHRIFT, nicht daneben: sie ist Teil
            dessen, was der Leser als Überschrift liest, und ein Screenreader
            liest sie dann mit. Ein eigenes Element davor wäre eine zweite
            Zeile und eine lose Ziffer.

            ES IST EINE REIHENFOLGE, KEINE RANGFOLGE (Auftrag). Sie folgt dem
            Aufbau der Herleitung: Kohlenstoff, Gitter, Kohärenz, Zelle. */}
        {t.befunde.map((b, i) => (
          <div key={b.id}>
            <h3>{`${i + 1}. ${b.titel}`}</h3>
            {/* label: null heißt KEINE Zwischenüberschrift, nicht eine leere.
                Christian hat sie am 2026-09-17 über dem Kohlenstoff-Block
                gestrichen; ohne diese Bedingung bliebe eine leere Hülle mit
                ihrem Abstand stehen. Die übrigen Blöcke tragen ihr Label
                weiter - das entscheidet allein das Datenmodul. */}
            {b.label ? (
              <span className={`qm-label${b.beleg ? ' qm-label--beleg' : ''}`}>
                {b.label}
              </span>
            ) : null}
            {b.absaetze.map((abs) => (
              <p key={abs.slice(0, 40)}>{abs}</p>
            ))}
            {b.zitat ? (
              <blockquote className="qm-zitat">
                <p>{b.zitat}</p>
                <span className="qm-quelle">{b.quelle}</span>
              </blockquote>
            ) : b.quelle ? (
              <span className="qm-quelle">{b.quelle}</span>
            ) : null}
            {/* DIE ILLUSTRATION ZU DIESEM BLOCK — steht UNTER dem Zitat und
                seiner Quelle, nicht dazwischen. Der Grund ist derselbe, aus
                dem diese Bilder Zeichnungen sind: ein erzeugtes Bild
                unmittelbar neben einer echten Quellenangabe liest sich als
                deren Abbildung. Unter der abgeschlossenen Quelle ist es, was
                es ist — eine Illustration zum Gedanken.

                KEINE UNTERSCHRIFT, und das ist der Unterschied zum Bildpaar
                weiter oben: dort benennt die figcaption den Steintyp, hier
                steht die Überschrift des Blocks schon darüber. Eine
                Bildunterschrift wäre an dieser Stelle genau die Form, die
                der Auftrag ausschließt („Bildunterschriften im Stil einer
                Abbildungslegende"). Was das Bild zeigt, sagt das
                alt-Attribut — dem, der es braucht.

                `bild` FEHLT NICHT STILL: ohne Eintrag rendert der Block wie
                zuvor. Ein Block ohne Bild ist damit ein sichtbarer Zustand
                und kein Absturz — die Probe misst, dass es vier sind. */}
            {QIMASTER_LITERATURBILDER[b.id] ? (
              <img
                className="qm-literaturbild"
                src={QIMASTER_LITERATURBILDER[b.id].src}
                width={QIMASTER_LITERATURBILDER[b.id].breite}
                height={QIMASTER_LITERATURBILDER[b.id].hoehe}
                alt={QIMASTER_LITERATURBILDER[b.id].alt}
                data-herkunft={QIMASTER_LITERATURBILDER[b.id].herkunft}
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        ))}
        {/* Der Schluss des Abschnitts — Christian am 2026-09-17: drei Zeilen
            Aussage statt zwei Absaetzen „Unsere Deutung" und dem
            siebenzeiligen Quellenblock, der hier stand.

            DIE UEBERSCHRIFT „Unsere Deutung" FAELLT MIT WEG, aber nur DIESE:
            der Abschnitt „Persoenlichkeitsentwicklung" trägt eine zweite
            gleichen Namens, und die bleibt, solange Christian nichts anderes
            sagt. Deshalb steht hier ein eigener Block und kein geaenderter
            qm-deutung — .qm-deutung wird von der anderen Stelle weiter
            gebraucht.

            Ausrichtung und Groesse kommen aus qi-master.css (.qm-schluss);
            die Groesse teilt sich das Token --qm-fs-guete mit den drei
            Guetezeilen, damit beide Bloecke auch dann gleich bleiben, wenn
            einer spaeter geaendert wird. */}
        <div className="qm-schluss">
          {t.schluss.map((zeile) => (
            <p key={zeile}>{zeile}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 6G ───────────────────────── */
function SechsGAbschnitt() {
  const t = QIMASTER_SECHS_G;
  return (
    <section className="qm-sektion qm-sektion--flaeche" id="sechs-g" data-section="qm-6g">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        {/* Das Quellenverzeichnis. KEIN eigenes CSS und kein Kasten: .qm-quellen
            steht seit dem Diamant-Abschnitt in qi-master.css und trägt genau
            die Optik des Literaturbereichs — --qm-fs-xs, --qm-muted, Hängeeinzug
            für die Ziffer. Christians Vorgabe war ausdrücklich optisch, deshalb
            wird die Größe geerbt und nicht nachgebaut.

            <ol> wäre hier falsch: die Ziffern stehen als [1]..[9] IM Text, weil
            sie dieselben Marken sind wie oben in den Absätzen. Eine
            Browser-Nummerierung liefe daneben, sobald ein Eintrag wegfällt. */}
        <ul className="qm-quellen">
          {t.quellen.map((q) => (
            <li key={q.slice(0, 3)}>{q}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────── Persoenlichkeitsentwicklung ───────────────── */
function PersoenlichkeitAbschnitt() {
  const t = QIMASTER_PERSOENLICHKEIT;
  return (
    <section className="qm-sektion" id="persoenlichkeitsentwicklung" data-section="qm-persoenlichkeit">
      <div className="qm-sektion__inner">
        <h2>{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
      </div>
      <div className="qm-zweispalt">
        <div className="qm-spalte">
          <span className="qm-label">{t.ueberlieferung.label}</span>
          <h3>{t.ueberlieferung.titel}</h3>
          {t.ueberlieferung.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
          {t.ueberlieferung.zitate.map((z) => (
            <blockquote className="qm-zitat" key={z.quelle}>
              <p>{z.text}</p>
              <span className="qm-quelle">{z.quelle}</span>
            </blockquote>
          ))}
        </div>
        <div className="qm-spalte">
          <span className="qm-label qm-label--beleg">{t.fundament.label}</span>
          <h3>{t.fundament.titel}</h3>
          {t.fundament.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
          {/* KEINE QUELLENZEILE. Christian am 2026-09-17: der ganze
              Fundament-Block wird „Zeitgenössisch interpretiert“, samt der
              Quellenzeile darunter. Der Block trägt keine fremde Angabe mehr,
              die zu belegen wäre — ein leerer <span className="qm-quelle">
              wäre ein Rest mit Abstand, kein Bau. Das Feld `quelle` ist in
              app/data/qi-master-texte.js entfallen; bliebe der span stehen,
              renderte er `undefined` als leeres Element. */}
        </div>
      </div>
      <div className="qm-sektion__inner">
        <div className="qm-deutung">
          <span className="qm-label">Unsere Deutung</span>
          {t.deutung.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fertigung() {
  return (
    <div className="MassgeschneiderteTechnologie NormalSectionSize">
      <h2 className="text-center">Ein Stück, kein Serienteil.</h2>
      <div className="MassgeschneidertWrapper">
        <div className="Column">
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path></svg>{' '}
            Eigene Seriennummer
          </h3>
          <p>Jeder Qi Master® ist nummeriert – ein Stück, das es nur einmal gibt.</p>
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"></path></svg>{' '}
            750er Gold
          </h3>
          <p>Kette und Verschluss aus 750er Gold, beide mit Qi-Blanco-Logo.</p>
        </div>
        <div className="Column">
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"></path></svg>{' '}
            Diamanten
          </h3>
          <p>Echte Diamanten – reiner Kohlenstoff, gefasst am Gitterchip™.</p>
          <h3 className="mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-8a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path></svg>{' '}
            Die Iris: 108 Striche
          </h3>
          <p>
            Rund um das Auge des Qi Master® laufen 108 Striche – die Zahl, die in
            der Yoga-Überlieferung für Vollständigkeit steht.
          </p>
        </div>
      </div>
    </div>
  );
}
