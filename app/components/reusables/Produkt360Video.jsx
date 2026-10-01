import {useEffect, useRef} from 'react';
import {
  ERSATZBILD_360,
  ERSATZBILD_KANTE,
  Ersatzbild,
  useErsatzbild,
} from '~/components/reusables/video360-ersatzbild';

/*
 * Die Adresse der 360-Grad-Produktdrehung des QiOne(R) 2 Pro steht GENAU
 * hier — in dem einen Baustein, der sie ausliefert.
 *
 * WARUM HIER UND NICHT IN EINER EIGENEN ADRESS-DATEI: die Drehung steht
 * seit dem 19.09.2026 an zwei Orten (Startseite und
 * /pages/schlaf-zellen-schutz), beide binden diesen Baustein ein. Zwei
 * Literale an den Einbindungen wären zwei Stellen, die denselben Zustand
 * fuehren — beim nächsten Austausch gewinnt still die falsche. Eine dritte
 * Datei für zwei Konstanten mit genau EINEM Leser wäre die andere Haelfte
 * desselben Fehlers: eine zweite Stelle ohne zweiten Zweck (P10).
 *
 * WARUM SHOPIFY-CDN UND NICHT IMGIX: die drei Schwester-Drehungen
 * (360-QiHome-1x1.mov, new-360-QiBracelet-1x1.mov) laufen über
 * qiblanco-video.imgix.*, das ist der aeltere Hausweg. für diese Datei ist
 * er baulich verschlossen: der imgix-Origin liegt in einem anderen
 * Cloudflare-Konto als unser Speicherzugang (medien-hosting D-008/D-009),
 * `360-QiOne-1x1.mov` antwortet dort mit HTTP 404, und ein Upload in unser
 * eigenes Konto wäre für keinen Kunden sichtbar. Also der Hausstandard
 * GL-PRO-0015: Shopify-CDN — dieselbe Herkunft, aus der die Startseite
 * ohnehin jedes Bild holt, und bereits in der `mediaSrc`-Richtlinie
 * (app/entry.server.jsx) erlaubt.
 *
 * WARUM MP4 UND KEIN WEBM: gemessen am 19.09.2026 an genau dieser Quelle —
 * VP9/WebM (crf 34) 768.704 B gegen H.264/MP4 819.015 B. 6,1 % Ersparnis
 * tragen kein zweites Asset und keine zweite Pflegestelle.
 *
 * Herkunft: 360-QiOne-1x1.mov (Christian, 19.09.2026), HEVC 1080x1080,
 * 24 fps, 12,5 s. Ausgeliefert wird H.264 high/4.0, yuv420p, CRF 26,
 * +faststart, OHNE Tonspur — die Quelle trug eine PCM-Stereospur mit
 * digitaler Stille (volumedetect mean = max = -91,0 dB), die allein 2,4 MB
 * der 6,3 MiB ausmachte. Ergebnis 819.015 B, 87,7 % kleiner als die
 * Quelle, SSIM 0,992 gegen sie.
 */

const QIONE_360_VIDEO =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  'qb-hero--360-qione-1x1--aad20f3d037e.mp4?v=1789844356';

/*
 * Poster und Ersatzbild = Bild 0 der Drehung, die Frontansicht, in voller
 * Größe (1080 px) aus app/lib/video360-ersatzbild.js (Christian
 * 01.10.2026: steht das Video, soll ein vollwertiges Bild aus dem Video
 * stehen). Bis zum 01.10.2026 war das Poster derselbe Frame als stark
 * komprimiertes WebP (qb-hero--360-qione-1x1-poster--ab845898916e.webp,
 * 4.622 B) — es bleibt unverändert auf dem CDN liegen.
 *
 * Warum ein Bild aus dem Video und kein Produktfoto: die Drehung zeigt den
 * QiOne(R) 2 Pro auf SCHWARZEM Grund, das Hero-Foto ihn auf WEISSEM. Ein
 * weisses Bild hätte bei jedem Seitenaufruf einen Weiss-nach-Schwarz-Sprung
 * ergeben, sobald das erste Videobild kommt.
 */
const QIONE_ERSATZ = ERSATZBILD_360.qione;

/* Native Kantenlaenge, 1:1. Als width/height am <video>, damit der Kasten
   seine Hoehe VOR dem ersten Byte kennt (keine Layout-Verschiebung). */
const QIONE_360_KANTE = ERSATZBILD_KANTE;

/*
 * Produkt360Video — die 360-Grad-Produktdrehung an der Stelle, an der
 * vorher ein Produktfoto stand (Christian, 19.09.2026: Startseite und
 * /pages/schlaf-zellen-schutz).
 *
 * ABGRENZUNG ZU <ImgixVideo> (P10, Bestand vor Neubau): jener Baustein ist
 * der richtige für alles, was über qiblanco-video.imgix.* läuft — er
 * bringt hls.js, die adaptive Bitratenleiter und den Ton-Umschalter mit.
 * Hier trägt nichts davon: die Quelle liegt auf dem Shopify-CDN (der
 * imgix-Weg ist für diese Datei kontoseitig verschlossen, Begründung im
 * Kopf dieser Datei), es gibt genau eine Fassung, und das Video hat
 * ueberhaupt keine Tonspur. hls.js dafür zu laden wäre teurer als das
 * Video selbst.
 *
 * WARUM DIE QUELLE SERVERSEITIG IM MARKUP STEHT und nicht erst bei
 * Sichtkontakt angehaengt wird: beide Einbindungen stehen über dem Falz.
 * Ein Beobachter würde dort im selben Moment feuern, in dem die Seite
 * erscheint — er kaeme also nie zu frueh, sondern nur eine Hydration zu
 * spaet. Was das Laden begrenzt, ist `preload="metadata"`: der Browser
 * holt den Kopf der Datei, nicht ihren Körper.
 *
 * RUECKSICHT AUF `prefers-reduced-motion`: eine dauerhaft drehende Ansicht
 * ist für manche Menschen eine Belastung; genau dafür gibt es die
 * Einstellung. Die Bremse steht bewusst im Effekt und nicht in der
 * Attributwahl — ein Server weiss nicht, was am Gerät eingestellt ist,
 * und ein serverseitig weggelassenes `autoplay` wäre für ALLE weg. Der
 * Effekt läuft direkt nach der Hydration, also lange bevor bei
 * `preload="metadata"` genug Daten für das erste bewegte Bild da sind:
 * sichtbar bleibt das Standbild, und das ist derselbe Frame wie das
 * Poster.
 *
 * KEINE LAYOUTVERSCHIEBUNG: width/height stehen am Element (1080x1080),
 * die Breite kommt aus dem Kasten. Damit kennt der Browser das
 * Seitenverhaeltnis vor dem ersten Byte — das vorherige <img> tat das an
 * beiden Stellen NICHT.
 */
/*
 * ERSATZBILD (01.10.2026): das <video> steckt in einer Hülle
 * (data-qb-360="qione"), darüber liegt das Bild, bis das Video nachweislich
 * läuft — und es kommt nach Fehler, Pause oder Stocken zurück. Logik in
 * useErsatzbild (dieselbe wie in <ImgixVideo>). Der Alt-Text kommt seitdem
 * vom Bild (ERSATZBILD_360), das Video ist aria-hidden: sonst liest ein
 * Screenreader dasselbe Produkt zweimal. `alt` der Aufrufer wird deshalb
 * nicht mehr gelesen; die Hülle nimmt Größe und Ausrichtung, die bisher
 * das <video> trug (startseite.css).
 */
export function Produkt360Video({className}) {
  const ref = useRef(null);
  const {zustand, zuBild} = useErsatzbild(ref);
  const zuBildRef = useRef(zuBild);
  zuBildRef.current = zuBild;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const ruhe = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!ruhe) return;

    const anwenden = () => {
      if (ruhe.matches) {
        video.autoplay = false;
        video.pause();
        // Auf den ersten Frame zuruecksetzen: er ist identisch mit dem
        // Poster, der Uebergang bleibt damit unsichtbar.
        try {
          video.currentTime = 0;
        } catch {
          /* vor den Metadaten wirft Safari — dann steht ohnehin das Poster */
        }
      } else {
        video.autoplay = true;
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => zuBildRef.current());
      }
    };

    anwenden();
    // Die Einstellung kann waehrend der Sitzung umgestellt werden.
    ruhe.addEventListener?.('change', anwenden);
    return () => ruhe.removeEventListener?.('change', anwenden);
  }, []);

  return (
    <div
      className="qb-360-huelle"
      data-qb-360={QIONE_ERSATZ.drehung}
      data-qb-360-zustand={zustand}
      style={{position: 'relative'}}
    >
    <video
      ref={ref}
      className={className || undefined}
      src={QIONE_360_VIDEO}
      poster={QIONE_ERSATZ.bild}
      width={QIONE_360_KANTE}
      height={QIONE_360_KANTE}
      aria-hidden="true"
      data-video="360-qione-1x1"
      data-video-familie="shopify-cdn"
      data-video-ton="stumm"
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
    />
    <Ersatzbild ersatz={QIONE_ERSATZ} zustand={zustand} />
    </div>
  );
}
