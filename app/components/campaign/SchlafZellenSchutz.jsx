import {createContext, useContext} from 'react';
import {Bewertungsblock} from '~/components/reusables/Bewertungsblock';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {InfoSlider} from '~/components/index-components/InfoSlider';
import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {ReviewCount} from '~/components/reusables/ReviewCount';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {PeerReviewStudies} from '~/components/reusables/PeerReviewStudies';
import {DreiThemenBand} from '~/components/redesign/DreiThemenBand';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {Produkt360Video} from '~/components/reusables/Produkt360Video';
import {ExterneStimmen} from '~/components/reusables/ExterneStimmen';
import {WasserstrukturErklaerung} from '~/components/reusables/WasserstrukturErklaerung';
import {CdnBild} from '~/components/reusables/CdnBild';
import {bildQuelle, bildSrcSet} from '~/components/reusables/shopifyBildQuellen';
import {THEMEN} from '~/lib/redesign3themen';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {useLpPreis, waehrungVon} from '~/lib/lp-preis';

/* ───────── EINE Beschriftung je Ziel — SSoT ─────────
   Job 20260916-zwoelf-kaufknoepfe-und-neun-sagen-dasselbe, Segment s03.

   ANLASS, wörtlich von Christian: zwölf Handlungsknöpfe, und neun davon
   zeigten auf dasselbe Ziel /pages/qione-2-pro — in FÜNF Formulierungen
   („QiOne® 2 Pro ansehen", „20 Nächte risikofrei testen", „Jetzt 20 Nächte
   risikofrei testen", „Jetzt risikofrei testen", „Jetzt QiOne® 2 Pro
   sichern"). Ein Ziel, fünf Versprechen: das liest sich als Drängeln, nicht
   als Einladung.

   WARUM „Jetzt kaufen“ — UND WARUM DAS DIE BEGRÜNDUNG VOM 16.09. ABLÖST.
   Christian, 21.09.2026, wörtlich: „Statt ‚QiOne 2 Pro ansehen‘ ganz klar
   sagen, worum es geht: ‚Jetzt kaufen‘, fertig. Das darf auf einer LP stehen.“
   Das ist eine Entscheidung, keine Auslegungsfrage — sie ersetzt die Abwägung,
   die hier bis dahin stand, und gilt als Regel für Landeseiten: Zurückhaltung
   im Knopftext ist dort kein Takt, sondern verschenkte Klarheit.

   WAS DIE ALTE BEGRÜNDUNG RICHTIG SAH, und was davon bleibt: das Ziel
   /pages/qione-2-pro ist die LANDINGPAGE-Fassung, nicht die Kaufseite
   /products/qione-2-pro (blockLinks.jsx, BLOCK_LP) — der Klick führt auf eine
   weitere Seite und nicht in die Kasse. Deshalb hiess der Knopf am 16.09.
   bewusst „ansehen“. Christians Entscheidung sticht diese Abwägung; das ZIEL
   bleibt unberührt und wird hier NICHT mitgeändert. Wer den Trichter enger
   führen will, ändert QIONE_ZIEL — das ist ein eigener Eingriff mit eigener
   Messung (Tracking-Kette BLOCK_LP), keine Nebenwirkung dieser Umbenennung.
   Die 20-Tage-Zusage ist nicht verschwunden: sie steht in der Hero-Subline,
   seit dem 21.09. zusätzlich als Vertrauenszeile direkt unter diesem Knopf,
   im Garantieblock und im Kleingedruckten des Preisblocks.

   WER DIESEN WERT ÄNDERT, ändert ihn hier einmal — jeder Knopf auf
   /pages/qione-2-pro liest ihn. Genau das ist der Punkt: die fünf
   Formulierungen konnten nur entstehen, weil der Text an fünf Stellen getrennt
   stand. Bewacht von
   homepage-bauer/pruefungen/probe_lp_cta_einstimmig.py --formulierungen
   (rt-Task lp-cta-einstimmig, täglich). */
const QIONE_ZIEL = produktLink('qione-2-pro', BLOCK_LP, 'kauf');
const QIONE_CTA = 'Jetzt kaufen';

/*
 * Landingpage /pages/schlaf-zellen-schutz — ALLROUNDER, Hero „Ruhe auf Zellebene"
 * (Kopfbereich seit 2026-09-19 nach Christians Vorlage; davor „Wirkt auf drei Ebenen").
 *
 * LP A der 4-LP-A/B/C/D-Struktur (Konzept landingpage-4lp-abcd-konzept, Kap. 3.3 A):
 * breiter/generischer Erst-Kontakt, Perspektiven-Einstieg fuer die spaetere
 * Rotation. Dramaturgie: Hero (Ruhe auf Zellebene, drei Zustaende) -> DreiThemenBand
 * (Struktur-Anker, aus dem Bestand) -> je Ebene ein Mechanismus-Block
 * (Zelle / Feld / Schlaf) mit Evidenz-Kachel + Anker-Link auf die Themen-LP ->
 * gemeinsamer Wissenschafts-Block -> Social Proof quer -> Garantie -> Pricing ->
 * Final CTA (die QB-Signatur „Unsere Sichtweise“ ist seit dem 19.09.2026 auf
 * Christians Anweisung ersatzlos gestrichen).
 *
 * DESIGN: eigenes Token-System (styles/schlaf-zellen-schutz.css, Scope .lp-a3),
 * abgeleitet aus dem 93/100-Rezept der Tiefschlaf-v3 (Design-Meister-Pfad:
 * web-brief -> Token-Bau -> design-rubrik >= 80). EIN Gold-Akzent (#c9a14b),
 * warmes Neutral-Kontinuum, ruhige Akte, kein Scroll-Jacking.
 *
 * TRACKING: Der Loader fragt NUR Produktdaten ab, KEINEN zusaetzlichen Pixel —
 * die R1/R2/R3-Kette haengt pfad-agnostisch im root-Layout (D-006, keine
 * Doppelzaehlung).
 *
 * CLAIM-DISZIPLIN: Zellstudien-Zahlen sind in-vitro gelabelt; Erfahrungs-
 * berichte deskriptiv (kein Kausal-Claim); Geld-zurueck an Zeitraum +
 * Ueberzeugung gebunden, NIE ans Spueren (Spuer-Regel #7). Beweis-Zahlen und
 * Mechanismus-Texte stammen aus dem Bestand (THEMEN in redesign3themen.js +
 * Tiefschlaf-ScienceSection) — hier wird NICHTS Neues erfunden.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;
const themaById = (id) => THEMEN.find((t) => t.id === id);

// M3 (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft): Preise im
// Markt-Kontext des Loaders (@inContext-Query) — EUR = netto*(1+Satz)
// (Warenkorb-Kanon), andere Waehrungen = Markets-Endbetrag. Satz/Rundung/
// Format kommen aus markt-pricing (die EINE Stelle, kein Doppelbau).
// Der Helferblock, der bis zum 2026-09-13 hier und in sieben Schwesterdateien
// byte-identisch stand, liegt jetzt in lib/lp-preis.js -- Begründung dort.
// `useLpPreis()` bindet ihn an das aufgeloeste Markt-Land (AT: 20 statt 19 %).

const QIONE_FALLBACK_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const KLARNA_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816';
const PAYPAL_IMG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082';

/*
 * BILD-LEITERN (Job 20260906-lp-erzeugt-den-…-prio20, s02).
 *
 * Je Bild aus der GEMESSENEN Anzeigegroesse am gerenderten DOM abgeleitet,
 * plus eine Stufe DPR-2-Reserve. KEIN pauschaler Wert: derselbe Wert über
 * alle Bilder macht die kleinen größer (s01: `width=600` trieb das
 * Klarna-Badge von 17 auf 28 KB).
 *
 * GEMESSEN WIRD ÜBER DIE GANZE FORMAT-MATRIX, NICHT ÜBER ZWEI VIEWPORTS —
 * und das ist hier teuer gelernt: die erste Fassung leitete die Leitern aus
 * 390 und 1440 px ab und deckelte den Hero bei 800. Das Alle-Formate-Gate
 * (hb-formate, Gate 12) fand darauf prompt Upscaling im Format `mobil-600`.
 * Grund: die Seite ist bis 767 px EINSPALTIG, der Hero waechst dort MIT dem
 * Viewport und erreicht bei 600 px Breite 552 CSS-px — mehr als auf jedem
 * Desktop (423). Das Maximum liegt also MITTEN in der Matrix, nicht an ihren
 * Raendern; wer nur Telefon und Desktop misst, sieht es baulich nie.
 *
 * Anzeigebreiten, über 11 Formate von 360 bis 1440 px gemessen (Maximum):
 *   Hero/Final-CTA  552 px (bei vp 600)  -> 400/600/800/900/1200
 *   Mechanismus     550 px (bei vp 600)  -> 340/680/1100
 *   Produktkarten   200 px               -> 200/400
 *   Klarna-Badge     48 px               -> 100/150
 *   PayPal-Badge     52 px               -> 110/160
 *
 * Gemessene Wirkung je Datei (Original -> 1x-Stufe): QiBracelet1 6.266.409 ->
 * 50.342 B, QiOne1 4.650.395 -> 175.547 B, QiHome1 734.866 -> 6.795 B,
 * paypal 75.518 -> 5.176 B, klarna 17.675 -> 4.866 B.
 *
 * Die oberen Stufen kosten und werden nur dort geholt, wo sie nötig sind:
 * QiOne1 900 -> 891.880 B, 1200 -> 1.628.653 B. Ein Telefon mit 390 px holt
 * weiterhin die 800er-Stufe; die 1200er trifft allein den 2x-Schirm bei rund
 * 600 px Breite, der sonst sichtbar unscharf wäre.
 *
 * `sizes` MUSS die Layoutbreite ehrlich nennen und darf sie nie
 * UNTERschaetzen: eine zu kleine Angabe lässt den Browser eine zu kleine
 * Stufe wählen, und genau das ist der Unschaerfe-Befund oben. Zu große
 * Angaben kosten nur Bytes. Die Formeln bilden deshalb die einspaltige
 * Phase (bis 767 px) und die zweispaltige darueber getrennt ab.
 */
const LEITER_HERO = [400, 600, 800, 900, 1200];
const LEITER_KARTE = [200, 400];
const LEITER_KLARNA = [100, 150];
const LEITER_PAYPAL = [110, 160];
/* `sizes` gehört an die Aufrufstelle: nur sie kennt die Layoutbreite. */
const SIZES_HERO =
  '(max-width: 767px) calc(100vw - 48px), min(40vw, 423px)';

/* ───────── Kopfzeilen-Gimmicks: drei kleine Bewegtbilder ─────────
   Christian, 20.09.2026: „Tiefer schlafen. / Starker Fokus. / Innere Ruhe.
   Gimmicks entwickeln und hochladen." Jede der drei Zeilen bekommt links vor
   dem Text ein eigenes, ruhiges Bewegtbild in Zeilenhöhe.

   WARUM INLINE-SVG UND NICHT GIF/VIDEO/LOTTIE — die Auflage war „so leicht wie
   möglich", und die teuerste Eigenschaft über dem ersten Bildschirm ist nicht
   das Gewicht, sondern die ZAHL DER LADEVORGÄNGE. Drei Bilddateien wären drei
   zusätzliche Anfragen genau dort, wo der Kunde als Erstes hinsieht; inline im
   SSR-HTML sind es NULL. GEMESSEN am 20.09.2026, Produktionsbau gegen
   Produktionsbau — dieselbe Seite einmal mit und einmal ohne die drei Bilder:
     HTML     393.105 -> 394.516 B   (+1.411 B brutto, +183 B gzip)
     CSS-Datei    493 ->   2.343 B   (+1.850 B brutto, +437 B gzip)
     zusammen                        +3.261 B brutto, +620 B gzip
     zusätzliche Anfragen           0
   Das Gewichtsbudget ist die 360-Grad-Drehung im selben Kopfbereich: 819.015 B
   (Content-Length live am CDN gemessen, 20.09.2026). Alle drei Bilder zusammen
   wiegen davon 0,4 % brutto und 0,08 % übertragen — Faktor 251 bzw. 1321.
   Ein GIF scheidet zusätzlich fachlich aus: es lässt sich bei
   `prefers-reduced-motion` nicht anhalten (das Standbild wäre nur über ein
   zweites Asset zu haben), es skaliert nicht mit der Schriftgröße mit, und es
   kann `currentColor` nicht tragen — jede Farbanpassung wäre eine neue Datei.
   Lottie schied aus, weil seine Laufzeitbibliothek allein ein Vielfaches aller
   drei Bewegtbilder wiegt.

   FARBE: ausschließlich `currentColor`. Die drei Zeilen tragen die Gold-Tinte
   (`--a-akzent-tinte`) aus dem Kit — die Bewegtbilder erben sie und bringen
   damit KEINEN zweiten Goldton in die Seite (Rubrik-Hue-Bin bleibt 1).

   KEINE AUSSAGE ÜBER WIRKUNG: die drei Bilder zeigen den Zustand, den die Zeile
   nennt (absinken, sammeln, gleichmäßig schlagen) — keinen Körper, kein Organ,
   keinen Vorher-Nachher-Verlauf, keine Messkurve. Sie behaupten nichts, was das
   Produkt täte.

   Die Bewegung selbst steht in `app/styles/schlaf-zellen-schutz-seite.css`
   (Block „Kopfzeilen-Gimmicks") — dort auch das Standbild für
   `prefers-reduced-motion`. Bewacht von
   worker-pool/pruefungen/probe_drei_gimmicks_dreizeiler__20260920.py. */
function HeroGimmick({art}) {
  return (
    <svg
      className={`lp-a-hero__gimmick lp-a-hero__gimmick--${art}`}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {art === 'schlaf' && (
        /* Absinken zur Ruhe: eine Welle verliert ihren Ausschlag und legt
           sich auf die Ruhelinie. */
        <>
          <path className="lp-a-hero__gimmick-linie" d="M3 17h18" />
          <path className="lp-a-hero__gimmick-welle" d="M3 11q3-6 6 0t6 0t6 0" />
        </>
      )}
      {art === 'fokus' && (
        /* Sammlung und Ausrichtung: vier Ecken ziehen sich um einen Kern
           zusammen, der Kern wird dabei schärfer. */
        <>
          <g className="lp-a-hero__gimmick-rahmen">
            <path d="M5 9V5h4" />
            <path d="M15 5h4v4" />
            <path d="M19 15v4h-4" />
            <path d="M9 19H5v-4" />
          </g>
          <circle
            className="lp-a-hero__gimmick-kern"
            cx="12"
            cy="12"
            r="1.7"
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
      {art === 'ruhe' && (
        /* Ausgleich und gleichmäßiger Puls: zwei Ringe laufen im halben
           Takt versetzt nach außen, die Mitte bleibt stehen. */
        <>
          <circle className="lp-a-hero__gimmick-ring1" cx="12" cy="12" r="9" />
          <circle className="lp-a-hero__gimmick-ring2" cx="12" cy="12" r="9" />
          <circle
            className="lp-a-hero__gimmick-kern"
            cx="12"
            cy="12"
            r="1.7"
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
    </svg>
  );
}

/* ───────── Hero (Drei-Ebenen-Versprechen) ───────── */
function Hero() {
  const {preisWert, preisLabelVon, compareLabelVon} = useLpPreis();
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const fallback = priceAmount ? null : fallbackPreis('qione-2-pro');
  const waehrung = waehrungVon(product);
  const priceNum = priceAmount ? preisWert(product) : fallback.bruttoWert;
  const priceLabel = priceAmount ? preisLabelVon(product) : fallback.label;
  const compareLabel = compareLabelVon(product);
  const monthly = Math.ceil(priceNum / 12);
  // Wortlaut Christian, 19.09.2026 (Job 20260919-schlaf-zellen-schutz-neuer-
  // kopfbereich-nach-christians-vorlage): Reihenfolge, Satzbau und Stil sind
  // seine, korrigiert wurde allein die Rechtschreibung. Bewacht von
  // worker-pool/pruefungen/probe_schlaf_zellen_schutz_neuer_kopf__20260919.py.
  // Zweite Fassung des Kopfabsatzes, Christian 20.09.2026 (Job 20260920-kopfabsatz-
  // zweite-fassung-pure-physik): Studien-Satz und Schlusszeile sind seine,
  // Zeichensetzung eingeschlossen. Bewacht von
  // worker-pool/pruefungen/probe_kopfabsatz_zweite_fassung__20260920.py.
  //
  // DER VIERZEILER („Kein Akku. / Kein Strom. / Kein Abo. / Pure Physik.") IST AM
  // 20.09.2026 ERSATZLOS GESTRICHEN — Christian im selben Zug, in dem er den
  // Bewertungsblock an die Startseite angleicht. Seine neue Anweisung sticht seine
  // alte vom selben Tag. An seine Stelle tritt die grüne Hakenzeile der Startseite
  // (siehe unten): ÜBERNOMMEN aus index-components/HerobannerFeatured.jsx — gleiche
  // CDN-Grafik, gleiche Klasse `cellstudies-checkmark`, gleicher Wortlaut. Keine
  // zweite Bauform, kein zweiter Grünton.
  // Beide Kopf-Proben sind im selben Commit nachgezogen (der Vierzeiler wandert dort
  // von NEU/BLEIBT nach ALT, damit ein Merge-Rückfall ein Befund bleibt).
  const dreizeiler = ['Tiefer schlafen.', 'Starker Fokus.', 'Innere Ruhe.'];
  // Index = Zeile: jede der drei Zeilen trägt ihr eigenes Bewegtbild
  // (Christian, 20.09.2026). Beschreibung und Begründung am Baustein
  // HeroGimmick weiter oben; Wortlaut und Reihenfolge der Zeilen bleiben
  // davon unberührt.
  const gimmickArt = ['schlaf', 'fokus', 'ruhe'];
  // ARM D (Christian, 21.09.2026): der Vierer-Merkmalskasten „14.000+ aktive
  // Nutzer / 100 % Geld-zurück-Garantie / Made in Germany / 20 Tage nach
  // Erhalt in Ruhe testen“ ist ERSATZLOS gestrichen — „das kommt nicht
  // rüber“. Hier kommt nichts Neues hin; die Stelle bleibt leer.
  // Kein Widerspruch dazu, dass „14.000+ aktive Nutzer“ weiter oben im
  // Startseiten-Block (Arm E) wieder auftaucht: gestrichen ist der KASTEN,
  // nicht die Zahl. Ebenso kehren „100 % Geld-zurück-Garantie“ und die
  // 20-Tage-Zusage in der Vertrauenszeile unter dem Knopf zurück (Arm C),
  // dort tragen sie den Abschluss statt eine Merkmalsliste.
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-a-hero-title"
      data-section="lp-a-hero"
    >
      {/* Christian, 20.09.2026: in der Mobilansicht steht das 360-Grad-Video
          direkt nach „Innere Ruhe.“ und über dem Absatz „Der QiOne® 2 Pro strukturiert …“.
          Der Textblock ist deshalb in KOPF (Eyebrow, Titel, Dreizeiler) und
          SCHLUSS (Absätze, Kaufknopf, Preis, Merkmale) geteilt, das Video steht
          im Markup dazwischen — so misst es die Einsteller-Probe an der
          Reihenfolge des ausgelieferten HTML. Eine reine Sortierregel (order)
          reichte nicht: das Video war Geschwister des GANZEN Textblocks, nicht
          der drei Zeilen, und die Stylesheets sind extern. Der Desktop behält
          seine Anordnung (Text links, Video rechts) über benannte Rasterbereiche
          des Modifiers `--video-zwischen` in schlaf-zellen-schutz-seite.css; die
          beiden Textteile stehen dort ohne Zeilenabstand untereinander. Bewacht
          von worker-pool/pruefungen/probe_video_mobil_nach_innere_ruhe__20260920.py. */}
      <div className="lp-a-hero__inner lp-a-hero__inner--video-zwischen">
        <div className="lp-a-hero__copy lp-a-hero__copy--kopf">
          <span className="lp-a-hero__eyebrow">
            Tragbares Hightech mit messbaren Effekten auf Zellebene
          </span>
          <h1 id="lp-a-hero-title" className="lp-a-hero__title">
            Ruhe auf Zellebene
          </h1>
          {/* ARM E (Christian, 21.09.2026): „Dafür oben, unterhalb von ‚Ruhe auf
              Zellebene‘, muss 1:1 das kommen, was auf der Frontseite ist:
              QiOne® 2 Pro / 4.8 / Mehr als 14.000+ aktive Nutzer / Erfahre
              jetzt die Vorteile der kohärenten Wasserstruktur.“

              ÜBERNOMMEN, NICHT NACHGEBAUT: dieselben vier Bausteine in
              derselben Reihenfolge wie in index-components/HerobannerFeatured
              .jsx, mit denselben globalen Klassen (`color-accent-main`,
              `mt-1`) aus app.css. Die Bewertungsdarstellung ist der bereits
              hinterlegte Standard-Baustein <ReviewCount /> — er wird benutzt
              und NICHT neu geschrieben (Auftrags-Verbot „keine neuen
              Bausteine, wo ein Standard existiert“). Die 4.8 kommt von dort
              zur Laufzeit aus der Bewertungs-API; sie steht bewusst nicht als
              Zahl im Markup, sonst gäbe es zwei Wahrheiten über dieselbe Note.

              Der Block steht ZWISCHEN H1 und Dreizeiler — das ist „unterhalb
              von ‚Ruhe auf Zellebene‘“ und hält zugleich die Reihenfolge, die
              probe_video_mobil_nach_innere_ruhe__20260920.py bewacht: das
              360-Grad-Video bleibt direkt hinter „Innere Ruhe.“. */}
          <div className="lp-a-hero__startseiten-block">
            <h2>QiOne® 2 Pro</h2>
            <p className="color-accent-main">
              <strong>
                <ReviewCount />
              </strong>
            </p>
            <p>
              <strong>Mehr als 14.000+ aktive Nutzer</strong>
            </p>
            {/* Zweite Ausspielung desselben Erklär-Knopfes — derselbe
                Baustein wie im Kopf der Startseite, damit die Erklärung nicht
                an zwei Stellen gepflegt werden muss. Die Wendung bleibt ein
                zusammenhängender Textknoten mit echten Umlauten. */}
            <p className="mt-1">
              <strong>Erfahre jetzt die Vorteile der <WasserstrukturErklaerung /></strong>
            </p>
          </div>
          <ul className="lp-a-hero__dreizeiler" aria-hidden="false">
            {dreizeiler.map((z, i) => (
              <li key={z}>
                <HeroGimmick art={gimmickArt[i]} />
                <span>{z}</span>
              </li>
            ))}
          </ul>
        </div>
        <figure className="lp-a-hero__visual">
          {/* Seit 2026-09-19 die 360-Grad-Drehung statt des Standbilds
              (Christian). Poster, Groesse und Ladeverhalten hängen am
              Baustein; der Radius kommt weiter aus dem Bild-Token der Seite
              (--a-r1), damit im Kopfbereich nicht zwei Formensprachen
              nebeneinander stehen. */}
          <Produkt360Video alt="QiOne® 2 Pro in der 360-Grad-Ansicht" />
          <figcaption>
            QiOne<sup>®</sup>&nbsp;2 Pro
          </figcaption>
        </figure>
        <div className="lp-a-hero__copy lp-a-hero__copy--schluss">
          {/* Christian, 21.09.2026 (Job 20260921-ratenzeile-kuerzen-und-absatz-neu-
              fassen): der Absatz in seiner Fassung, Stil unverändert, Grammatik
              geglättet — Zahlwort ausgeschrieben und nach „seinen“ gebeugt,
              „Peer-Review-Studien“ als Fachbegriff, die doppelte Steigerung
              „best untersuchteste“ zu „am besten untersuchte“, „Energieprodukt“
              als Kompositum. Der Doppelpunkt vor „In deinen Zellen“ und die
              Großschreibung danach sind seine Setzung. Ersetzt sind der Einstieg
              mit der Nutzerzahl und der Schluss mit dem Studien-Vergleich aus der
              Fassung vom 20.09. (PR #538) — die alten Sätze stehen hier bewusst
              nicht im Wortlaut, damit keine Quelltext-Probe sie noch findet.
              Keine Fußnote, keine Quelle, kein Einschub. */}
          <p className="lp-a-hero__subline">
            Der QiOne<sup>®</sup>&nbsp;2 Pro strukturiert dort Wasser, wo es darauf
            ankommt: In deinen Zellen. Mit seinen fünf international publizierten
            Peer-Review-Studien ist es das am besten untersuchte Energieprodukt der
            Welt.
          </p>
          {/* Die grüne Hakenzeile der Startseite, 1:1 übernommen statt nachgebaut:
              dieselbe CDN-Grafik (Green_Checkmark.webp), dieselbe Klasse
              `cellstudies-checkmark` (app.css:2256, global und ungescopet) und
              derselbe Wortlaut wie in index-components/HerobannerFeatured.jsx.
              `lp-a-hero__subline` bleibt daneben stehen, damit die Zeile in der
              Typo-Skala DIESER Seite sitzt — die Bauform ist geerbt, die
              Schriftgröße gehört der Seite. */}
          <p className="lp-a-hero__subline mt-1 cellstudies-checkmark">
            <CdnBild
              className="inline-image"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
              alt=""
              breite={17}
              hoehe={17}
              anzeigeBreite={17}
            />
            <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
          </p>
          <p className="lp-a-hero__subline">Erfahre es jetzt selbst.</p>
          <div className="lp-a-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href={QIONE_ZIEL}>
              {QIONE_CTA}
            </a>
            <span className="lp-a-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel}
              {/* Christian, 21.09.2026: die Ratenzeile endet nach dem Betrag. Der
                  Finanzierungs-Zusatz hinter dem Betrag ist weg — er stand zwei
                  Zeilen tiefer in der Vertrauenszeile unter den Klarna-/PayPal-
                  Logos ein zweites Mal, und dort bleibt er. Die übrigen Nennungen
                  auf der Seite (Vertrauenszeile, Zahlungsabschnitt, Produkt-
                  übersicht, Preisblock) sind unangetastet. */}
              {waehrung === 'EUR' && <> · oder 12 Raten à {monthly}&nbsp;€</>}
            </span>
          </div>
          {/* ARM C (Christian, 21.09.2026): „Unterhalb des Buttons muss ‚Jetzt
              20 Tage nach Erhalt testen – mit 0 % Finanzierung & Käuferschutz –
              100 % Geld-zurück-Garantie‘ stehen, plus die zwei Logos von Klarna
              und PayPal, das schafft Vertrauen.“ Die Zeile steht deshalb DIREKT
              unter dem Knopf und nicht irgendwo auf der Seite — gemessen wird
              die Nähe zum Knopf, nicht das blosse Vorkommen.

              1:1 von der Startseite übernommen statt nachgebaut: derselbe
              `micro-text`-Absatz und dieselben zwei CdnBild-Aufrufe wie in
              index-components/HerobannerFeatured.jsx — gleiche CDN-Quellen,
              gleiche 75-px-Anzeigebreite, gleicher Abstand. Keine neuen
              Dateien, keine anderen Grössen (Auftrags-Verbot).
              Die Logos tragen ihren Markennamen als alt-Text: der Begleittext
              nennt nur „0 % Finanzierung“, WELCHE Zahlungsart gemeint ist,
              steht sonst nirgends — sie sind der einzige Träger der Auskunft. */}
          <p className="micro-text mt-1 lp-a-hero__vertrauen">
            <strong>
              {' '}
              Jetzt 20 Tage nach Erhalt testen – mit 0&nbsp;% Finanzierung &amp;
              Käuferschutz – 100&nbsp;% Geld-zurück-Garantie{' '}
            </strong>
          </p>
          <p className="lp-a-hero__zahlarten">
            <CdnBild
              style={{margin: '20px 20px 20px 0'}}
              breite={75}
              hoehe={42}
              loading="lazy"
              anzeigeBreite={75}
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816"
              alt="Klarna"
            />
            <CdnBild
              style={{margin: '20px 20px 20px 0'}}
              breite={75}
              hoehe={38}
              loading="lazy"
              anzeigeBreite={75}
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"
              alt="PayPal"
            />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── Wirkprinzip ─────────
   Christian, 19.09.2026: der Abschnitt bekommt seinen Wortlaut. Übernommen ist
   sein Satzbau; korrigiert wurde ausschließlich die Rechtschreibung. Der alte
   Absatz („Kein Wunder. Ein Prinzip mit drei Wirkungen.“) weicht ersatzlos, und
   mit ihm seine beiden Gedankenstriche — der Trennstrich vor „mit deutlich mehr
   Elektronenvolt“ ist Christians eigener und bleibt.

   Christian, 20.09.2026: der Einordnungsabsatz unter dem Wirkprinzip (Quelle
   „Bionisches Wasser“, ihr eigener Vorbehalt zur Forschungslage, „unsere
   eigenen Angaben“) fällt ersatzlos weg — kein neuer Text. Der Absatz war am
   19.09. entstanden, weil die Auflage eine Quelle nur dort erlaubte, wo sie
   die Aussage trägt (die Blutplättchen-Angabe war in der Quelle nicht
   belegt); Christian hat entschieden, dass diese Einordnung nicht auf die
   Seite gehört. Auf der Seite steht seitdem keine Quellenangabe zu diesem
   Abschnitt.

   Christian, 20.09.2026 (zweiter Auftrag desselben Tages): der Absatz selbst
   bekommt seine neue Fassung — als Ganzes ersetzt, nicht Satz für Satz
   geflickt. Der Wortlaut ist seiner, Rechtschreibung und Zeichensetzung
   waren bereits sauber; der Gedankenstrich nach „überzugehen“ ist seiner und
   bleibt (die Regel gegen Gedankenstriche gilt den Antworten von AI Anna,
   nicht seinem Seitentext). Die Überschrift blieb, keine Quellenangabe kam
   hinzu (GL-SPR-0008). Die Scroll-Animation stand damals darunter; seit dem
   21.09.2026 steht sie DARÜBER — dieser Abschnitt ist unter sie gewandert,
   auf Christians Anweisung. Der Wortlaut unten ist davon unberührt. */
function IntroSection() {
  return (
    <section className="lp-vp-section" data-section="lp-a-intro">
      <h2>Wirkprinzip</h2>
      <p className="lp-vp-section__lede">
        Der GitterChip™ ermöglicht es den umliegenden Wassermolekülen, in den kohärenten
        Zustand überzugehen – den Superzustand des Wassers. Aus normalem Wasser wird
        energetisch hoch aufgeladenes Wasser, mit deutlich mehr Elektronenvolt. Das ist die
        Grundlage für Zellprozesse im Körper: Sie verfügen über mehr Energie, etwa für die
        Verformung der roten Blutkörperchen, die sich falten müssen, um die engen Kapillaren
        zu passieren.
      </p>
    </section>
  );
}

/* ───────── Mechanismus-Blöcke: Zelle / Feld / Schlaf ─────────
   Nordstern: konkret ERKLAEREN, WO und WIE kohärentes Wasser je Ebene wirkt.
   Inhalt (mechanismusText, beweisZahl/Label, bild) aus dem Bestand (THEMEN),
   Anker-Link je Ebene auf die Themen-LP (Konzept 3.3 A). E-Smog-LP existiert
   noch nicht (s04 baut sie VOR dem Router) — Link wird trotzdem gesetzt. */
function MechanismSection() {
  const ebenen = [
    {
      thema: themaById('zellen'),
      ebene: 'Ebene 1 · Zelle',
      link: '/pages/zell-schutz',
    },
    {
      thema: themaById('esmog'),
      ebene: 'Ebene 2 · Feld',
      link: '/pages/E-Smog-Schutz',
    },
    {
      thema: themaById('schlaf'),
      ebene: 'Ebene 3 · Schlaf',
      link: '/pages/tiefer-schlaf',
    },
  ].filter((e) => e.thema);
  return (
    <section
      className="lp-vp-section lp-a-mechs-section"
      data-section="lp-a-mechanismus"
    >
      {/* Christian, 19.09.2026: Eyebrow, Überschrift und Absatz weichen der einen
          Zeile. Die drei Ebenen darunter bleiben unverändert. */}
      <h2>3 Wirkebenen</h2>
      <div className="lp-a-mechs">
        {ebenen.map(({thema, ebene, link}) => (
          <article className="lp-a-mech" key={thema.id}>
            <figure className="lp-a-mech__media">
              {/* sizes bildet die ECHTE Kachelbreite ab (schlaf-zellen-schutz.css):
                  <=767px eine Spalte, section-padding 2x24px; darueber drei
                  Spalten in max 1080px mit 2x24px Gap, also (min(1080,100vw-48)
                  -48)/3 — ab 1128px konstant 344px. NICHT frei waehlbar: der
                  Wert wird von bin/probe_mech_sizes_naht.py aus genau diesen
                  CSS-Tokens hergeleitet und faerbt sich rot, sobald Geometrie
                  und Abschrift auseinanderlaufen. Wortgleich zur zweiten
                  Instanz Partner.jsx, die dieselbe Sektion rendert. */}
              <img
                src={thema.bild}
                srcSet={bildSrcSet(thema.bild)}
                sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1127px) calc((100vw - 96px) / 3), 344px"
                alt={thema.alt}
                loading="lazy"
              />
            </figure>
            <div className="lp-a-mech__body">
              <span className="lp-a-mech__ebene">{ebene}</span>
              <h3 className="lp-a-mech__title">{thema.titel}</h3>
              <p className="lp-a-mech__text">{thema.mechanismusText}</p>
              <div className="lp-a-mech__evidenz">
                <span className="lp-a-mech__evidenz-zahl">{thema.beweisZahl}</span>
                <span className="lp-a-mech__evidenz-label">{thema.beweisLabel}</span>
              </div>
              <a className="lp-a-mech__link" href={link}>
                Tiefer eintauchen: {thema.titel} →
              </a>
            </div>
          </article>
        ))}
      </div>
      {/* Christian, 19.09.2026: der Grenzforschungs-Hinweis unter den drei Ebenen
          ist ersatzlos gestrichen; die In-vitro-Einordnung steht weiter im
          Wissenschafts-Abschnitt. */}
    </section>
  );
}

/* ───────── Wissenschaft ─────────
   Christian, 19.09.2026: der Block „Nicht nur gefühlt — an Zellen gemessen"
   (Eyebrow, H2, Lede, drei Kacheln 84,7 % / 10× / 5 / 5) ist GELÖSCHT und durch
   den Startseiten-Block „6 Jahre Forschung" ersetzt — übernommen, nicht
   nachgebaut (reusables/PeerReviewStudies, eine Definition für beide Seiten).
   Zum Block gehört der Studienslider mit seiner Überschrift „Wirkung an
   menschlichen Zellen bestätigt!", der Schlusszeile und dem Knopf
   „Zelluntersuchungen ansehen" — exakt wie auf der Startseite.

   DER SLIDER STEHT DESHALB NUR NOCH HIER. Bis zu diesem Tag hing er als
   `<LpStudien headline="" />` am ENDE dieser Sektion, unter dem Mikroskop-
   Video; Christian: „Wichtig, dass dann der Studienslider weiter unten auf der
   Seite verschwindet, sonst wäre er doppelt." Die untere Fassung ist entfernt,
   nicht beide — entdoppeln heißt nicht löschen.

   REIHENFOLGE SEIT DEM 21.09.2026 (Christian, Job 20260921-forschungsblock-
   unter-die-zweite-scrollanimation): Video → „6 Jahre Forschung" → Studien-
   slider → Knopf. Die Animation eröffnet den Themenblock, die Erklärung folgt
   darunter. Das ist EINE Sektion geblieben, nur anders geordnet — der Slider
   steht weiterhin genau einmal auf der Seite. */
function ScienceSection() {
  return (
    <section className="lp-vp-section" data-section="lp-a-wissenschaft">
      {/* Mikroskop-Beweis als Scroll-Scrub-Video (ersetzt die typografische
          Karte, gleiche Botschaften — Job 20260716-bauer-scroll-down-
          animationen-capability; SHOW IT statt Behauptung).

          ER STEHT SEIT DEM 21.09.2026 AN DER SPITZE DIESER SEKTION, nicht mehr
          an ihrem Ende — Christian: „Die Scrollanimation leitet den neuen
          Themenblock ein, und erst dann erfolgt die schriftliche Erklärung."
          Erst die Zellen zeigen, dann sagen, was sechs Jahre Forschung daran
          gemessen haben. Die Regel gilt über diese Stelle hinaus und liegt als
          Standard in SKILL-SCROLL-ANIMATIONEN.md, Kapitel 7. */}
      <ScrollScrubVideo
        dataSection="lp-a-mikroskop-video"
        srcDesktop="https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov"
        srcMobile="https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov"
        overlayStart={{
          titel: 'Zellbiologisch geprüft',
          text: 'Entdecke die Effekte auf Zellebene.',
        }}
        overlayEnd={[
          {
            titel: 'Ohne GitterChip™',
            text: 'Zellen unter Mobilfunk-Stress zeigen eine geschwächte Barriere und mehr oxidative Belastung.',
          },
          {
            titel: 'Mit GitterChip™',
            text: 'Dieselben Zellen halten ihre Barrierefunktion messbar besser aufrecht (TEER-Messung, in vitro).',
          },
        ]}
        fussnote="Gegenüberstellung aus den in-vitro-Zellstudien — kein Erfahrungsbericht, keine Heilaussage."
      />
      {/* DIE SCHRIFTLICHE ERKLÄRUNG ZUM BLOCK, den das Video darueber eröffnet:
          „6 Jahre Forschung" (PeerReviewStudies, von der Startseite übernommen)
          und der Studienslider „Wirkung an menschlichen Zellen bestätigt!".
          Wortlaut unverändert — bewegt wurde die Reihenfolge, nicht der Text. */}
      <PeerReviewStudies dataSection="lp-a-peer-review-studien" />
      <LpStudien
        dataSection="lp-a-studien"
        headline="Wirkung an menschlichen Zellen bestätigt!"
      />
      {/* Der Knopf bleibt direkt unter den Studienzahlen — dort, wo der Beweis
          frisch ist. Er ist mit dem Block gewandert, nicht stehengeblieben:
          hätte er seinen Platz behalten, stünde er nun als erstes Element der
          Sektion über dem Video und hätte nichts mehr, worauf er sich beruft.
          Sein Text ist unangetastet. */}
      <WeiterCta nr={6} imBlock />
      {/* lp-a-weiter-5 stand hier bis zum 2026-09-16 (Job 20260916-zwoelf-
          kaufknoepfe-und-neun-sagen-dasselbe, s03) und ist ENTFERNT: er war der
          ZWEITE Knopf derselben Sektion — der Wissenschafts-Block trägt seinen
          Weg zum Produkt schon oberhalb des Videos (lp-a-weiter-6, direkt unter
          den Studienzahlen, wo der Beweis frisch ist). Höchstens EIN Hauptknopf
          je Abschnitt. Was er gekostet hat, steht im RESULT und ist gemessen,
          nicht geschätzt: 13 von 471 Weiter-Klicks. */}
    </section>
  );
}

/* ───────── Social Proof (quer durch alle Themen) ─────────
   Stilles YouTube-Poster: seit YT-THUMB-MAXRES (2026-07-21, GL-DES-0009) der
   gemeinsame Baustein YoutubeTimestamp im Seiten-Kleid lp-a-yt (maxres-Kette). */

/*
 * CONTENT-MATCH (Christian-Regel 2026-07-11, F-003): Tag/Titel/Zitat MÜSSEN
 * das tatsächlich Gesagte im Video treffen (Transkript-belegt). Diese drei
 * Videos + Zitate sind wortgleich aus der bestehenden Tiefschlaf-LP übernommen
 * (dort content-match-geprüft) — keine erfundenen Themen.
 */
function VideoSection() {
  const videos = [
    {
      tag: 'Deutscher Leichtathletik-Meister',
      title: 'Constantin Preis — getrackter Tiefschlaf',
      quote: 'Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.',
      id: 'jyLyXZqHxaw',
    },
    {
      tag: 'Nada & Kurt Tepperwein',
      title: 'Spürbar stabiler im Alltag',
      quote: 'So wie ich es trage und erlebe: Es stabilisiert.',
      id: 'aG36zJKxDzg',
    },
    {
      tag: 'Erste Tage mit dem QiOne®',
      title: 'Michelle Christin Guse — „wie ein kleines Wunder"',
      quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
      id: 'zIfDQ1N60fI',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-a-videos">
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Erfahrungen.</h2>
      <p className="lp-vp-section__lede">
        Drei Träger, drei Geschichten — vom getrackten Tiefschlaf des Leistungssportlers
        bis zur spürbaren Veränderung im Alltag. Berichte einzelner Nutzer, deskriptiv.
      </p>
      <div className="lp-vp-videos-grid">
        {videos.map((v) => (
          <article className="lp-vp-video" key={v.id}>
            <YoutubeTimestamp videoId={v.id} titel={v.title} className="lp-a-yt" />
            <span className="lp-vp-video__tag">{v.tag}</span>
            <h3 className="lp-vp-video__title">{v.title}</h3>
            <p className="lp-vp-video__quote">{v.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Garantie ─────────
   T2 (Konzept „Shopseite nach LP"): per reinem `export` freigegeben, damit die
   Campaign-PDP /pages/qione-2-pro dieselbe Garantie-Sektion reusen kann
   (Scent-Kontinuität LP↔Shopseite). GuaranteeSection ist self-contained (keine
   Props/Context) — NULL Markup-/Verhaltens-Delta für LP A durch den Export. */
export function GuaranteeSection() {
  const items = [
    {
      title: 'Teste ihn 20 Tage lang',
      body: 'Trage den QiOne® 2 Pro 20 Tage und Nächte in deinem echten Alltag. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
    {
      title: 'Zahle jetzt bequem in 0% Raten',
      body: 'Über Klarna oder PayPal in bequemen Monatsraten — 0 % Finanzierung. Du entscheidest, wie du zahlst.',
    },
    {
      title: 'Made in Germany',
      body: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand innerhalb Deutschlands.',
    },
  ];
  return (
    <section className="lp-vp-section" data-section="lp-a-garantie">
      {/* Christian, 19.09.2026: Eyebrow „Dein Risiko: keins", H2 „Überzeugt es
          dich — oder du bekommst dein Geld zurück." und der Lede-Absatz
          („… 20 Nächte, dann entscheidest du.") sind auf diese EINE Zeile
          gekürzt — in seiner Schreibweise, nicht normalisiert. */}
      <h2>100% Geld zurück Garantie</h2>
      <div className="lp-vp-benefits-grid">
        {items.map((b) => (
          <article className="lp-a-benefit" key={b.title}>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
            <p className="lp-vp-benefit__body">{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Pricing (Live-Preise, QiOne 2 Pro als Held) ───────── */
function PricingSection() {
  const {preisLabelVon, compareLabelVon} = useLpPreis();
  const {data} = useLp();
  const bracelet = findLp(data, 'qibracelet');
  const qione = findLp(data, 'qione-2-pro');
  const qihome = findLp(data, 'qihome-air');
  const priceOf = (p) => preisLabelVon(p);
  const qioneCompare = compareLabelVon(qione);
  const cards = [
    {
      p: bracelet,
      name: 'QiBracelet®',
      handle: 'qibracelet',
      tagline: 'Eleganz & Schutz für unterwegs',
      features: ['Eleganter GitterChip™ integriert', 'E-Smog- & 5G-Puffer', 'Ruhe für unterwegs'],
      featured: false,
    },
    {
      p: qione,
      name: 'QiOne® 2 Pro',
      handle: 'qione-2-pro',
      tagline: 'Der Allrounder — Tag und Nacht',
      features: [
        'Wirkt auf allen drei Ebenen',
        'Tragbar als Anhänger',
        'Kohärente Wasserstruktur',
        'Unser Bestseller',
      ],
      featured: true,
    },
    {
      p: qihome,
      name: 'QiHome® Air',
      handle: 'qihome-air',
      tagline: 'Kohärentes Wasser für den ganzen Raum',
      features: ['E-Smog- & 5G-Raumschutz', 'Kohärentes Wasser im Raum', 'Ideal fürs Schlafzimmer'],
      featured: false,
    },
  ];
  return (
    <section className="lp-a-pricing" aria-labelledby="lp-a-pricing-title" data-section="lp-a-pricing">
      <span className="eyebrow">Unsere Produkte</span>
      <h2 id="lp-a-pricing-title">Kohärentes Wasser. Für Deine Zellen.</h2>
      <div className="lp-a-pricing-grid">
        {cards.map((c) => (
          <article
            className={`lp-a-product${c.featured ? ' lp-a-product--featured' : ''}`}
            key={c.handle}
          >
            {c.featured && <span className="lp-a-product__badge">Bestseller</span>}
            <div className="lp-a-product__image">
              {c.p?.featuredImage?.url ? (
                <img
                  {...bildQuelle(c.p.featuredImage.url, LEITER_KARTE)}
                  sizes="200px"
                  alt={c.name}
                  loading="lazy"
                />
              ) : (
                <span className="lp-a-product__ph">{c.name}</span>
              )}
            </div>
            <h3 className="lp-a-product__name">{c.name}</h3>
            <p className="lp-a-product__tagline">{c.tagline}</p>
            <div className="lp-a-product__price-row">
              <span className="lp-a-product__price">{priceOf(c.p) || '—'}</span>
              {c.featured && qioneCompare && (
                <sup className="lp-a-product__compare">{qioneCompare}</sup>
              )}
            </div>
            <ul className="lp-a-product__features">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              className={`lp-vp-btn ${c.featured ? 'lp-vp-btn--primary' : 'lp-vp-btn--secondary'} lp-a-product__cta`}
              href={produktLink(c.handle, BLOCK_LP, c.featured ? 'kauf' : 'detail')}
            >
              {c.featured ? QIONE_CTA : 'Mehr erfahren'}
            </a>
          </article>
        ))}
      </div>
      <p className="lp-vp-pricing__fineprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna und PayPal ·
        kostenloser Versand innerhalb Deutschlands · Käuferschutz
      </p>
    </section>
  );
}

/* ───────── Final CTA ───────── */
function FinalCTA() {
  const {preisLabelVon, compareLabelVon} = useLpPreis();
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const price = preisLabelVon(product);
  const compare = compareLabelVon(product);
  const image = product?.featuredImage?.url || QIONE_FALLBACK_IMG;
  return (
    <section className="lp-vp-final-cta" data-section="lp-a-final">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          <img
            {...bildQuelle(image, LEITER_HERO)}
            sizes={SIZES_HERO}
            alt="QiOne® 2 Pro"
            loading="lazy"
          />
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-a-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-a-cta-arc" startOffset="0">
                  20 NÄCHTE RISIKOFREI · GELD ZURÜCK ·{' '}
                </textPath>
              </text>
            </svg>
            <div className="lp-vp-final-cta__stamp-core">
              <span className="lp-vp-final-cta__stamp-num">20</span>
              <span className="lp-vp-final-cta__stamp-unit">Nächte</span>
            </div>
          </div>
        </div>
        <div className="lp-vp-final-cta__body">
          <span className="eyebrow">Bereit für alle drei Ebenen?</span>
          {/* Zweizeilig auf Christians Anweisung vom 21.09.2026: „Teste jetzt den
              QiOne® 2 Pro. / 20 Tage ohne Risiko.“ Die zweite Zeile ist keine
              Fortsetzung des Satzes, sondern ein eigener — zwei Zeilen, zwei Punkte.
              Die alte Fassung stellte das Produkt zwischen Verb und Angebot und machte
              aus der Aufforderung einen Nebensatz; jetzt steht zuerst, was zu tun ist,
              und die Bedingung daneben statt hinein.
              BAUFORM ist der vorhandene Haus-Zweizeiler — <br /> im Heading, wie in
              QiOneZellschutz.jsx (h1) und TieferSchlaf.jsx (h1). Bewusst KEINE zweite
              Schriftgröße und keine neue Klasse: diese Seite hält genau EINEN H2-Stil
              (--a-fs-h2, styles/schlaf-zellen-schutz.css). Das ruhigere Setzen der
              zweiten Zeile gehört dem Bausatz-Auftrag, nicht diesem hier.
              Der erklärende Satz darunter bleibt unberührt. */}
          <h2>
            Teste jetzt den QiOne® 2 Pro.
            <br />
            20 Tage ohne Risiko.
          </h2>
          <p className="lp-vp-final-cta__lede">
            Trage den QiOne® 2 Pro 20 Nächte lang. Bist du danach nicht überzeugt, erstatten
            wir dir den vollen Kaufpreis. Ohne Wenn und Aber.
          </p>
          {price && (
            <div className="lp-vp-final-cta__price">
              <span className="lp-vp-final-cta__users">+ 14.000 aktive Nutzer</span>
              <div className="lp-vp-final-cta__price-row">
                <span className="lp-vp-final-cta__price-value">{price}</span>
                {compare && <sup className="lp-vp-final-cta__compare">{compare}</sup>}
              </div>
              <span className="lp-vp-final-cta__price-meta">einmalig · inkl. MwSt.</span>
              <div className="lp-vp-final-cta__pay">
                <img
                  {...bildQuelle(KLARNA_IMG, LEITER_KLARNA)}
                  sizes="48px"
                  alt="Klarna"
                />
                <img
                  {...bildQuelle(PAYPAL_IMG, LEITER_PAYPAL)}
                  sizes="52px"
                  alt="PayPal"
                />
              </div>
            </div>
          )}
          <a className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg" href={QIONE_ZIEL}>
            {QIONE_CTA}
          </a>
          <ul className="lp-vp-final-cta__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand innerhalb Deutschlands</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Weiter-Knopf (schließt die Knopf-Luecke) ─────────
   Job 20260906-lp-erzeugt-den-…-prio20, Segment s02.

   GEMESSEN, NICHT VERMUTET (2026-09-06, Hit-Test am gerenderten DOM,
   bin/lp-falz-hittest.py): zwischen dem Hero-CTA bei Falz 0,71 und dem
   nächsten klickbaren Kaufweg-Knopf bei Falz 18,70 lagen 15.181 px = 18,0
   Falzen mobil (12.625 px = 14,0 desktop) OHNE einen einzigen Weg zum
   Produkt. Wer Mechanismus, Wissenschaft, Bewertungen und Video liest, hatte
   dazwischen keinen nächsten Klick.

   Diese Landingpage wird am NÄCHSTEN KLICK gemessen, nicht an der Bestellung
   (Kanon „Die Landingpage verkauft nicht — sie erzeugt den nächsten Klick",
   brain/Marketing/landingpage-trichter-und-messregel-2026-08-26.md). Deshalb
   steht hier ein KNOPF und kein neuer Fliesstext: die Luecke war das Problem,
   nicht die Textmenge.

   BEWUSST NICHTS NEUES: Ziel, Klassen und Farbe kommen aus dem Bestand
   (`lp-vp-btn lp-vp-btn--primary` -> /pages/qione-2-pro, derselbe Knopf wie im
   Hero). Kein zweiter Gold-Ton, keine neue Schriftgroesse, kein Preis. Auch
   der ABSTAND ist geerbt: die 96 px Sektions-Polsterung ober- und unterhalb
   tragen den Knopf, er bringt keinen eigenen Rhythmus mit. */
function WeiterCta({nr, imBlock = false}) {
  return (
    <div
      className={`lp-a-weiter${imBlock ? ' lp-a-weiter--im-block' : ''}`}
      data-section={`lp-a-weiter-${nr}`}
    >
      <a className="lp-vp-btn lp-vp-btn--primary" href={QIONE_ZIEL}>
        {QIONE_CTA}
      </a>
    </div>
  );
}

/* ───────── Root ───────── */
export function SchlafZellenSchutz({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-a3">
        <Hero />
        <DreiThemenBand dataSection="lp-a-drei-themen" block="lp" />
        {/* Christian, 19.09.2026: „danach unsere Scroll-down-Animation einfügen“.
            Derselbe Baustein, den Startseite, /products/qione-2-pro,
            /pages/tiefer-schlaf und /pages/E-Smog-Schutz schon tragen — EINE
            Definition (GitterchipMoleculesScrub), gleiches Video, gleiche
            Overlay-Texte. Bewusst nicht nachgebaut: Text-Drift zwischen den
            Seiten wäre sonst baulich möglich.
            HÖHE 300/250vh statt der Vorgabe 500/400 — Begründung im RESULT.
            Sie hängt an DIESER Seite: sie trägt im Wissenschafts-Block bereits
            eine zweite Scroll-Strecke (lp-a-mikroskop-video). Zweimal fünf
            Bildschirmhöhen Scroll-Weg, die erste davon vor dem ersten
            Argument, zerreißen den Lesefluss.

            REIHENFOLGE, Christian 21.09.2026: „der Bereich Wirkprinzip muss
            unterhalb der ersten Scrollanimation“. Bis zu diesem Tag stand
            <IntroSection /> DARÜBER — so hatte es seine Anweisung vom 19.09.
            („danach unsere Scroll-down-Animation einfügen“) ergeben. Die
            jüngere Anweisung sticht: erst zeigen, dann erklären. Die
            Animation blieb stehen, der Abschnitt ist gewandert — als ein
            Stück, unverändert im Wortlaut und nur an EINER Stelle. */}
        <GitterchipMoleculesScrub
          dataSection="lp-a-gitterchip-video"
          heightVhDesktop={300}
          heightVhMobile={250}
        />
        <IntroSection />
        <MechanismSection />
        {/* <WeiterCta nr={1} /> ERSATZLOS GESTRICHEN — Christian, 20.09.2026:
            der Knopf unter „3 Wirkebenen". Eindeutig benannt, keine Auslegung. */}
        <ScienceSection />
        {/* <WeiterCta nr={2} /> ERSATZLOS GESTRICHEN — Christians zweiter Streich,
            20.09.2026. Die Bildbelege lagen weder s01 noch s02 vor; die Wahl
            zwischen nr=2 und nr=6 ist deshalb GEMESSEN statt geraten, und sie fiel
            gegen die Vorab-Empfehlung aus:

            verhaltens-schicht/data/verhalten.db, sektion_daily, gleiche Grundmenge
            (url_path=/pages/schlaf-zellen-schutz, in_dom=1, pv=4031, 08.–20.09.):
              lp-a-weiter-6   842 Sichtungen   211 Klicks   25,1 % je Sichtung
              lp-a-weiter-2   128 Sichtungen    17 Klicks   13,3 % je Sichtung
            nr=2 ist auf BEIDEN Achsen der schwächere Knopf, in jedem Segment.

            Der Kommentar, der hier stand, begründete nr=2 geometrisch: er halbiere
            die Strecke zwischen w6 (Falz 7,71) und Preisblock (19,50). Das galt,
            SOLANGE nr=1 stand. nr=1 ist Christians erster Streich, und damit dreht
            sich die Rechnung um: ohne nr=2 bleiben w6 und Preisblock mit 11,8
            Falzen Abstand, ohne nr=6 bliebe ab dem Hero eine Strecke von rund 12,3
            Falzen ohne Knopf. Die kleinere Wunde ist nr=2 — und sie kostet 17
            Klicks statt 211. Die dort genannten 18,0 Falzen sind der Zustand VOR
            dem Bau vom 06.09., eine andere Seite und keine Vorhersage für heute.

            nr=6 behält seine Nummer: `data-section` ist der Schlüssel in
            verhalten.db, eine Umnummerierung hängte seine Historie an einen neuen
            Namen. Annahme, die Christian in einem Satz umstoßen kann — begründet
            im RESULT des Segments. */}

        {/* ── Bewertungsblock, 1:1 die Bauform der Startseite ───────────────────
            ÜBERNOMMEN aus homepage/HomepageSections.jsx:43-49, nicht nachgebaut:
            GoogleReviews mit `dataSection`-Prop (statt in ein nacktes <div>
            gewickelt), danach die NormalSectionSize-Hälfte mit dem <h2> „Alle
            Google Bewertungen" und dem ReputonWidget. Das h2 fehlte hier ganz —
            einer von Christians drei Bildbefunden.

            WARUM DER WRAPPER: gemessen am Live-DOM liefen die beiden Hälften in
            ZWEI Breitensystemen (obere Kartenspur 1032, untere 1248 — 108 px
            Überhang je Seite, Christians „untere Reihe schwebt außerhalb"). Die
            drei LP-Sonderregeln in schlaf-zellen-schutz.css erfassten nur die
            OBERE Hälfte: sie tönten und polsterten sie allein, daher auch der
            „schmale weiße Kasten". Tönung, Polsterung und Breite sitzen jetzt EINMAL
            auf `.lp-a-bewertungen` und gelten für beide Hälften — ein Block, eine
            Breite, ein Abstand. Die Tönung --a-flaeche ist ein geplanter Farbakt
            dieser Seite und liegt jetzt auf dem ganzen Block statt auf einer Hälfte.
            Der Wrapper trägt bewusst KEIN `data-section`: das wäre ein neuer Anker
            in verhalten.db ohne Historie und ohne Registry-Eintrag.

            KEINE Bewertung ist verändert, ausgewählt oder weggelassen — 4,8 und die
            440 Bewertungen kommen unverändert aus denselben zwei Widgets. */}
        {/* Derselbe Block, jetzt aus dem Baustein statt von Hand. Der gerenderte
            DOM ist unverändert — Wrapper, Hälften, Überschrift und beide
            data-section-Anker sind dieselben. Diese Seite war der erste Nutzer
            des Standards und trug ihn bis hier als letzte Abschrift. */}
        <Bewertungsblock praefix="lp-a-" wrapperKlasse="lp-a-bewertungen" />
        {/* Externe Stimmen — mit dem Vorbildblock übernommen (Startseite Z.102).
            Derselbe geteilte Baustein, dieselbe Reihenfolge MAXIM → BRAINEFFECT →
            Geldhelden. Erst dadurch haben Christians MAXIM-/Andi-Lew-Textwechsel
            auf dieser Seite überhaupt einen Gegenstand. */}
        <ExterneStimmen dataSection="lp-a-externe-stimmen" />
        <VideoSection />
        {/* Kachelreihe NACH den Video-Testimonials (Christian, 2026-09-19):
            „Beeindruckende Kundenerfahrungen / alle Google-Bewertungen / und
            dann die 4,8 Sterne klickbar" ist EIN Bereich zusammen. Bis heute
            stand der InfoSlider zwischen LpGoogleReviews (Textberichte) und
            dem ReputonWidget (Google-Zusammenfassung + Sternebalken) und
            zerschnitt ihn: der Leser bekam Erfahrungsberichte, dann
            Werbekacheln, dann wieder Erfahrungsberichte. Verschoben, nicht
            umgebaut — dieselben fünf Kacheln, dieselbe Bedienung. */}
        <InfoSlider dataSection="lp-a-info-slider" />
        <GuaranteeSection />
        <PricingSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
