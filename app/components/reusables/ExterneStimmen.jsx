import {Maxim} from '~/components/small-components/Maxim';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';

/*
 * ExterneStimmen — „andere über uns" als EINE Reihe auf der Startseite.
 * Job 20260903-BAU-externe-stimmen-startseite-maxim-und-zwei-podcasts-vor-der-
 * folge-morgen-prio4 (Christian, 2026-09-03).
 *
 * WARUM ES DEN ABSCHNITT GIBT: die drei Fremdbelege lagen bisher entweder
 * verstreut (Maxim allein unterhalb der eigenen Studien) oder gar nicht auf der
 * Startseite (die beiden Podcast-Auftritte). Wer über eine fremde Podcast-Folge
 * herkommt, sucht genau diese Belege — und Fremdbeleg wirkt vor Eigenbeleg
 * (NN/g, Stanford Web Credibility: Menschen trauen externen Quellen mehr als der
 * Selbstauskunft der Seite). Deshalb steht der Block direkt unter den drei
 * Testimonial-Videos und VOR den eigenen Studien.
 *
 * DIE GENAUIGKEIT DER ZUSCHREIBUNG IST HIER DER GANZE WERT (Auftrag wörtlich).
 * Gemessen am 2026-09-03 über YouTube-oEmbed: BEIDE Videos liegen auf unserem
 * EIGENEN Kanal („Qi Blanco", @QiBlanco) — es sind Spiegelungen von
 * Gastauftritten, keine Uploads der fremden Kanäle. Deshalb steht hier
 * „Zu Gast bei …" (wahr: Christian war dort Gast) und NICHT „BRAINEFFECT über
 * QiOne" (das wäre ein Urteil, das dort niemand gefällt hat). Kein Zitat, das
 * dort nicht fällt; Titel wörtlich wie auf YouTube; Kanalname in der Schreibung
 * der Marke (BRAINEFFECT, Versalien, mit C).
 *
 * LADEZEIT: die beiden Videos benutzen YoutubeTimestamp (Facade-Muster,
 * vgl. lite-youtube-embed) — SSR rendert NUR das Vorschaubild, der Player wird
 * erst beim Klick geladen. Die Startseite trägt dadurch trotz zweier neuer
 * Videos weiterhin genau 3 YouTube-Player beim Seitenaufbau (die drei
 * bestehenden <YoutubeIframe>-Testimonials, die ungefragt laden). Baseline und
 * Nachmessung im RESULT des Jobs.
 *
 * MAXIM WIRD EINGEORDNET, NICHT NEU GEBAUT: <Maxim /> ist unverändert dieselbe
 * Komponente mit demselben Text und demselben Bild (die Datei liegt bewusst
 * außerhalb der Deploy-Allowlist — die Nicht-Änderung ist maschinell erzwungen).
 * Ihr Aussehen wird ausschließlich über den CSS-Scope .ExterneStimmen an die
 * Kachelform angeglichen.
 */

/* Startzeit des Geldhelden-Videos: 817 s = 13:37, das Kopfkissen-Experiment.
   ÜBERNOMMEN, nicht neu gewählt — Quelle ist der Code-Wert HERO_VIDEO.startSeconds
   in app/components/campaign/ExclusiveSolutions.jsx (/pages/exclusive-solutions),
   dieselbe Zahl steht in TieferSchlaf.jsx und SchlafZellenSchutzV3.jsx. */
const GELDHELDEN_START_S = 817;

const PODCASTS = [
  {
    quelle: 'Zu Gast bei BRAINEFFECT',
    videoId: 'zL0QIxthr7s',
    startSeconds: 0,
    // Titel wörtlich wie auf YouTube (oEmbed, 2026-09-03).
    titel:
      'So schützt du dich mit moderner Technologie vor EMF und Elektrosmog - Christian Bauer',
    text:
      'Wie sich Elektrosmog im Alltag bemerkbar macht — und was zwischen Router, Handy und Schlafplatz wirklich hilft.',
  },
  {
    quelle: 'Zu Gast bei Geldhelden',
    videoId: 'BQxzbXqREWE',
    startSeconds: GELDHELDEN_START_S,
    titel:
      'Elektrosmog: Wie WLAN deine Zellen stresst – und was hilft | Die Geschichte hinter Qi Blanco',
    text:
      'Das Kopfkissen-Experiment: Was dein Handy nachts mit deinem Schlaf zu tun hat. Das Video startet direkt an der Stelle.',
  },
];

export function ExterneStimmen({dataSection}) {
  return (
    <section
      className="ExterneStimmen NormalSectionSize"
      data-section={dataSection}
      aria-labelledby="externe-stimmen-titel"
    >
      <h2 className="ExterneStimmen__titel" id="externe-stimmen-titel">
        Externe Stimmen
      </h2>

      <div className="ExterneStimmen__raster">
        {/* 1. Maxim — der Artikel, unverändert eingeordnet. */}
        <article className="ExterneStimmen__karte">
          <div className="ExterneStimmen__medium ExterneStimmen__medium--bild">
            <Maxim />
          </div>
          <div className="ExterneStimmen__text">
            <p className="ExterneStimmen__quelle">Maxim</p>
            <h3 className="ExterneStimmen__karteTitel">
              Ausgezeichnet von Maxim: Das beste EMF-Tool – QiOne® 2 Pro
            </h3>
            <p className="ExterneStimmen__lede">
              Die Lifestyle-Expertin und Autorin Andi Lew erklärt das QiOne® 2 Pro
              zu ihrem Favoriten beim Schutz vor elektromagnetischer Strahlung.
            </p>
          </div>
        </article>

        {/* 2. BRAINEFFECT, 3. Geldhelden — Reihenfolge aus dem Auftrag. */}
        {PODCASTS.map((p) => (
          <article className="ExterneStimmen__karte" key={p.videoId}>
            <div className="ExterneStimmen__medium">
              <YoutubeTimestamp
                videoId={p.videoId}
                startSeconds={p.startSeconds}
                titel={`${p.titel} (${p.quelle})`}
                className="ExterneStimmen__yt"
                sizes="(min-width: 1200px) 380px, (min-width: 600px) 45vw, 92vw"
              />
            </div>
            <div className="ExterneStimmen__text">
              <p className="ExterneStimmen__quelle">{p.quelle}</p>
              <h3 className="ExterneStimmen__karteTitel">{p.titel}</h3>
              <p className="ExterneStimmen__lede">{p.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
