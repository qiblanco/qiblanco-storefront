import {useEffect, useRef} from 'react';
import {videoQuellen} from '~/data/video-quellen';
import {
  ERSATZBILD_360,
  ERSATZBILD_KANTE,
  Ersatzbild,
  useErsatzbild,
} from '~/components/reusables/video360-ersatzbild';
import {useNaeheLaden} from '~/components/reusables/useNaeheLaden';

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
 * DIE ZWEI SCHWESTER-DREHUNGEN ALS MP4 (Grossjob 20261030-prio1-homepage-
 * gesamt-pruefen-alpha-befunde-alle-seiten-geraete-maerkte, s02; Christian
 * 30.10.2026: „sollten das wahrscheinlich 360 Grad Animationen sein, die sich
 * drehen … es muss überall auf der Homepage jetzt nochmal kontrolliert
 * werden“). Die Apple-Seiten (Startseite, *-details, LPs) zeigten seit #1099/
 * #1104 nur das Ersatzbild. Hier kommt die Drehung zurück, als dieselbe
 * mp4-Fassung vom Shopify-CDN, die auch <ImgixVideo> als Rückfall nimmt
 * (app/data/video-quellen.js, 720p, ohne hls.js): iOS spielt mp4 nativ, der
 * hls.js-Zweig blieb im Messlauf 30.10. in WebKit bei readyState 1 stehen
 * (Falle s03). Schalter VIDEO_QUELLE gilt mit.
 */
const DREHUNG_VIDEO = {
  qione: {src: QIONE_360_VIDEO, name: '360-qione-1x1'},
  qibracelet: {src: videoQuellen('new-360-QiBracelet-1x1.mov').mp4, name: 'new-360-QiBracelet-1x1.mov'},
  qihome: {src: videoQuellen('360-QiHome-1x1.mov').mp4, name: '360-QiHome-1x1.mov'},
};

/* Berührungen, in deren Rahmen iOS ein abgelehntes play() erlaubt (Qi-Alpha-
   Fix 30.10.2026, TheAlphaTon nachholen). touchstart zählt dort nicht als
   Geste, touchend und click schon. */
const GESTEN = ['touchend', 'pointerup', 'click', 'keydown'];

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
 *
 * `anzeige` (optional, 10.10.2026): {anzeigeBreite, sizes} der Fläche,
 * durchgereicht an <Ersatzbild> (srcset-Leiter statt 1080er-Master). Dann
 * entfällt das `poster`: es liegt immer UNTER dem Bild, sichtbar wird es
 * nie (das Bild weicht erst, wenn das Video nachweislich läuft, und dann
 * malt das Video seine Bilder). Bliebe es der Master, lüde der Browser
 * dieselbe Datei zweimal — gemessen am CDN: 490er-Sprosse 8 120 B plus
 * Master 17 654 B statt 8 120 B am Desktop. Ohne `anzeige` (Zellschutz-
 * Seite) bleibt alles wie bisher, Poster eingeschlossen.
 */
/*
 * ERWEITERUNG 30.10.2026 (s02, alle Props optional, ohne Angabe bleibt alles
 * wie vorher):
 *   drehung      'qione' (Vorgabe) | 'qibracelet' | 'qihome'
 *   alt          Alt-Text des Ersatzbilds (sonst der aus ERSATZBILD_360)
 *   sofort       true (Vorgabe): Quelle im Server-HTML, preload metadata —
 *                für den ersten Bildschirm. false: preload none, die Quelle
 *                kommt erst in Sichtweite (useNaeheLaden, derselbe Maßstab
 *                wie der Videostandard), damit Bänder und Gerätereihe weiter
 *                unten beim Seitenaufruf nichts laden.
 *   huelleKlasse zusätzliche Klasse an der Hülle (Größe kommt vom Aufrufer)
 * NACHHOLEN: lehnt der Browser play() ab (iOS Stromsparmodus), bleibt das
 * Ersatzbild stehen, und die nächste Berührung irgendwo auf der Seite startet
 * die Drehung im Rahmen dieser Geste. Unter prefers-reduced-motion nie.
 */
export function Produkt360Video({
  className,
  anzeige = null,
  drehung = 'qione',
  alt = null,
  sofort = true,
  huelleKlasse = '',
}) {
  const ref = useRef(null);
  const {zustand, zuBild} = useErsatzbild(ref);
  const zuBildRef = useRef(zuBild);
  zuBildRef.current = zuBild;
  const nah = useNaeheLaden(ref, {sofort});
  const video = DREHUNG_VIDEO[drehung] ?? DREHUNG_VIDEO.qione;
  const basis = ERSATZBILD_360[drehung] ?? QIONE_ERSATZ;
  const ersatz = alt ? {...basis, alt} : basis;

  useEffect(() => {
    const el = ref.current;
    if (!el || !nah) return;
    const ruhe = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let wartet = false;

    const nachholen = () => {
      if (!wartet) return;
      wartet = false;
      geste(false);
      if (ruhe?.matches) return;
      starte();
    };
    const geste = (an) =>
      GESTEN.forEach((t) =>
        an
          ? document.addEventListener(t, nachholen, {capture: true, passive: true})
          : document.removeEventListener(t, nachholen, {capture: true}),
      );
    const abgelehnt = () => {
      zuBildRef.current();
      if (wartet) return;
      wartet = true;
      geste(true);
    };
    function starte() {
      el.autoplay = true;
      let p;
      try {
        p = el.play();
      } catch {
        // Manche iOS-Fassungen werfen hier, statt abzulehnen (WebKit-Bug 216887).
        abgelehnt();
        return;
      }
      if (p && typeof p.catch === 'function') p.catch(abgelehnt);
    }

    const anwenden = () => {
      if (ruhe?.matches) {
        el.autoplay = false;
        el.pause();
        // Auf den ersten Frame zuruecksetzen: er ist identisch mit dem
        // Poster, der Uebergang bleibt damit unsichtbar.
        try {
          el.currentTime = 0;
        } catch {
          /* vor den Metadaten wirft Safari — dann steht ohnehin das Poster */
        }
      } else {
        starte();
      }
    };

    anwenden();
    // Die Einstellung kann waehrend der Sitzung umgestellt werden.
    ruhe?.addEventListener?.('change', anwenden);
    return () => {
      ruhe?.removeEventListener?.('change', anwenden);
      geste(false);
    };
  }, [nah]);

  return (
    <div
      className={`qb-360-huelle${huelleKlasse ? ` ${huelleKlasse}` : ''}`}
      data-qb-360={ersatz.drehung}
      data-qb-360-zustand={zustand}
      style={{position: 'relative'}}
    >
    <video
      ref={ref}
      className={className || undefined}
      src={nah ? video.src : undefined}
      poster={anzeige ? undefined : ersatz.bild}
      width={QIONE_360_KANTE}
      height={QIONE_360_KANTE}
      aria-hidden="true"
      data-video={video.name}
      data-video-familie="shopify-cdn"
      data-video-ton="stumm"
      muted
      playsInline
      loop
      autoPlay
      preload={sofort ? 'metadata' : 'none'}
    />
    <Ersatzbild ersatz={ersatz} zustand={zustand} anzeige={anzeige} />
    </div>
  );
}
