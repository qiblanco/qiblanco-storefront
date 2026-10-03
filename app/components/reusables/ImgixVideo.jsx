import {useEffect, useRef, useState} from 'react';
import Hls from 'hls.js';
import {videoQuellen} from '~/data/video-quellen';
import {hatHoerbarenTon} from '~/lib/video-ton';
import {Ersatzbild, bevorzugtRuhe, useErsatzbild} from '~/components/reusables/video360-ersatzbild';

/*
 * ImgixVideo — Sound-Toggle (Job bl-20260803T232952Z-b702ec, 2026-08-03),
 * seit 2026-08-15 nur noch bei Videos MIT hörbarem Ton.
 *
 * Browser-Autoplay-Policy erlaubt Video-Autoplay NUR stummgeschaltet, darum
 * bleibt das `muted`-HTML-ATTRIBUT unten hart gesetzt (das ist es, was der
 * Browser VOR jedem JS für die Autoplay-Erlaubnis prueft). Der sichtbare
 * Button togglet danach NUR die `.muted`-DOM-PROPERTY per Klick (= die
 * geforderte User-Geste) — kein Versuch, gegen die Policy anzuautoplayen.
 * Konzept + Abgrenzung: homepage-bauer/SKILL-VIDEO-SOUND-TOGGLE.md.
 *
 * AENDERUNG 2026-08-15 (Christian, Screenshot-Befund): der Toggle war
 * BEDINGUNGSLOS eingebaut, also bekamen ihn auch stumme Hintergrund- und
 * 360-Grad-Produktvideos — ein Audio-Umschalter an einem Video ohne Ton.
 * Ob ein Video hörbaren Ton trägt, beantwortet jetzt ausschließlich das
 * gemessene Manifest `app/lib/video-ton.js`; ohne Eintrag wird KEINE
 * Audio-UI gerendert. Bewusst NICHT über Browser-Feature-Detection
 * gelöst: die stummen 360-Grad-Videos besitzen eine AAC-Spur (digitale
 * Stille, -91 dB), jede Existenzprüfung meldet dort faelschlich "hat Ton".
 */

const SOUND_STORAGE_PREFIX = 'qb-video-sound:';

/*
 * LADEN ERST IN SICHTWEITE, MIT BEGRENZTEM VORLAUF (Elina EL-20260929-5a09bac3,
 * imgix-Kontingent: 1 GB Auslieferung = 1 Credit).
 *
 * Gemessen am 29.09.2026 (Chromium, 1440x900): `new Hls()` ohne Konfiguration
 * lud auf /pages/qione-2-pro-details in den ersten 3 Sekunden das GANZE
 * 54-s-Video, 37,4 MB, in der Stufe 1440x1440 für einen 450 px breiten Spieler.
 * hls.js übergeht `preload="metadata"` und wählt ohne Deckel auf schneller
 * Leitung die höchste Stufe.
 *
 * - `maxBufferLength` 10 s / `maxMaxBufferLength` 20 s: Vorlauf statt ganzes
 *   Video. hls.js rechnet den Vorlauf zusätzlich aus `maxBufferSize` hoch
 *   (8 × Bytes / Bitrate). Mit der Vorgabe 60 MB wären das bei der
 *   1440er-Stufe wieder 20 s. 8 MB ergeben dort 10 s. Der Rückpuffer bleibt unbegrenzt (hls.js-Vorgabe), damit `loop`
 *   aus dem Puffer weiterspielt und nichts zweimal geholt wird.
 * - Die imgix-URL bleibt unverändert: jede neue Parameterkombination löst bei
 *   imgix eine neue, bezahlte Kodierung aus.
 *
 * NOCH NICHT DRIN: `capLevelToPlayerSize` (Stufe nach Spielergröße). Seit dem
 * 29.09.2026 ist das imgix-Kontingent gekappt. imgix liefert dann nur Segmente,
 * die schon einmal erzeugt wurden, und antwortet sonst mit HTTP 402
 * (plan_credits_depleted_payment_required). Die großen Stufen liegen fertig vor,
 * die kleinen nur lückenhaft: mit dem Deckel blieb das Video nach dem ersten
 * Segment stehen. Der Deckel folgt, sobald imgix wieder erzeugt (Folgeauftrag
 * 20260929-imgix-dach-videospieler-stufendeckel-nach-kontingent).
 */
const HLS_KONFIG = {
  maxBufferLength: 10,
  maxMaxBufferLength: 20,
  maxBufferSize: 8 * 1000 * 1000,
};

// Vorlauf vor dem sichtbaren Bereich: knapp ein Handy-Bildschirm, damit das
// erste Bild beim normalen Scrollen schon da ist.
const SICHTWEITE = '600px 0px';

function anfangsZustandStumm(videoPath) {
  // SSR/kein sessionStorage -> Default stumm (Policy-konform). Pro
  // videoPath geschluesselt: zwei verschiedene Videos auf einer Seite
  // entstummen sich nicht gegenseitig.
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(SOUND_STORAGE_PREFIX + videoPath) !== 'an';
  } catch {
    return true;
  }
}

/*
 * ERSATZBILD (Christian 01.10.2026, Job 20261001-bau-360-video-ersatzbild-aus-
 * dem-video-dach-und-us): mit `ersatz` (ein Eintrag aus ERSATZBILD_360 in
 * app/components/reusables/video360-ersatzbild.jsx) liegt über dem Video ein vollwertiges Bild
 * aus dem Video, solange es nicht nachweislich läuft — auch nach einem Fehler
 * oder Stocken. Das Bild ist dann auch das poster, die Hülle trägt
 * data-qb-360 / data-qb-360-zustand (Messmerkmale des Vertrags), das <video>
 * aria-hidden (das Bild trägt die Beschreibung). Unter
 * prefers-reduced-motion wird das Video gar nicht erst geladen.
 * OHNE `ersatz` rendert und lädt ImgixVideo genau wie bisher (es gibt
 * Aufrufer ohne Drehung, z. B. das 60-s-Video der QiOne-Detailseite).
 */
export function ImgixVideo({videoPath, fallbackImage, className = '', ersatz = null}) {
  const videoRef = useRef(null);
  const {zustand, zuBild} = useErsatzbild(videoRef, Boolean(ersatz));
  // Die Effekte unten lesen zuBild über den Ref: ein neuer Effekt-Lauf je
  // Render würde hls.js neu aufsetzen.
  const zuBildRef = useRef(zuBild);
  zuBildRef.current = zuBild;
  const mitErsatz = Boolean(ersatz);
  // DOMAIN-WECHSEL 2026-09-18 (Vorgang EL-20260814-9a7f9a50, Elina).
  // imgix führt die Video-Auslieferung auf imgix.net zusammen; die eigene
  // Anleitung sagt wörtlich, .imgix.video-URLs hören nach dem Sunset auf
  // aufzulösen. Ein Abschaltdatum nennt imgix nirgends — deshalb jetzt.
  // Pfad und Parameter bleiben identisch, fm=hls ist auf .net voll
  // unterstützt (gemessen: 3 bis 5 Bitraten-Stufen je Asset). Der Weg über
  // .net liefert außerdem OHNE Redirect und aus Frankfurt statt aus
  // us-east1 — ein Grund mehr, hls.js und den Sound-Toggle unangetastet zu
  // lassen: dieser Wechsel ist ein Domaintausch, kein Formatwechsel.
  //
  // KONTINGENT-KAPPUNG 2026-10-03 (Regelkreis video-spielbarkeit, Arm BREIT):
  // imgix antwortet auf nicht gecachte Segmente mit HTTP 402, das Video
  // bleibt stehen. Die Quelle kommt deshalb aus app/data/video-quellen.js:
  // dasselbe Video als Shopify-Video, Rückweg dort per VIDEO_QUELLE.
  const {hls: hlsUrl, mp4: mp4Url, quelle} = videoQuellen(videoPath);

  // Gemessene Ton-Wahrheit (SSoT app/lib/video-ton.js). Konstant je
  // videoPath, daher kein State und kein Effekt — das Video rendert
  // sofort im richtigen Zustand, der Button flackert nie auf.
  const zeigtTonSteuerung = hatHoerbarenTon(videoPath);

  const [stumm, setStumm] = useState(() => anfangsZustandStumm(videoPath));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls = null;
    let beobachter = null;

    // Ruhe gewünscht: die Drehung gar nicht laden, das Ersatzbild bleibt
    // stehen. Spart nebenbei imgix-Kontingent. Nur mit Ersatzbild — ohne
    // bliebe sonst ein leerer Kasten.
    if (mitErsatz && bevorzugtRuhe()) return;

    function laden() {
      if (Hls.isSupported()) {
        hls = new Hls(HLS_KONFIG);
        if (mitErsatz) {
          // Fataler Fehler (Netz, Manifest, Medien): hls.js gibt auf, das
          // <video> selbst meldet dann nicht zwingend etwas.
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data && data.fatal) zuBildRef.current();
          });
        }
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari: natives HLS, dieselbe URL, erst in Sichtweite gesetzt.
        video.src = hlsUrl;
      } else {
        // Rückfall mp4
        video.src = mp4Url;
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      laden();
    } else {
      beobachter = new IntersectionObserver(
        (eintraege) => {
          if (!eintraege.some((e) => e.isIntersecting)) return;
          beobachter.disconnect();
          beobachter = null;
          laden();
        },
        {rootMargin: SICHTWEITE},
      );
      beobachter.observe(video);
    }

    return () => {
      if (beobachter) beobachter.disconnect();
      if (hls) hls.destroy();
    };
  }, [hlsUrl, mp4Url, mitErsatz]);

  // Ton-Zustand ans DOM-Element durchreichen (Property, nicht Attribut —
  // das Attribut bleibt für die Autoplay-Erlaubnis unveraendert `muted`).
  // Ohne Ton-Steuerung bleibt das Video HART stumm: ein Besucher kann aus
  // einer frueheren Sitzung noch ein `an` im sessionStorage für diesen
  // Pfad stehen haben (der Toggle war bis 2026-08-15 auch hier sichtbar) —
  // das darf ein stummes Video nicht entstummen.
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = zeigtTonSteuerung ? stumm : true;
  }, [stumm, zeigtTonSteuerung]);

  function toggleTon() {
    setStumm((vorher) => {
      const nachher = !vorher;
      try {
        window.sessionStorage.setItem(
          SOUND_STORAGE_PREFIX + videoPath,
          nachher ? 'aus' : 'an',
        );
      } catch {
        /* sessionStorage nicht verfuegbar (privat/blockiert) -> nur In-Memory-State */
      }
      // Safety-Net iOS/Safari: das Un-Muten geschieht IM Klick-Handler
      // (= die User-Geste) — falls das Video zwischenzeitlich pausiert
      // wurde, hier direkt weiterspielen lassen.
      const video = videoRef.current;
      if (video && !nachher) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => zuBildRef.current());
      }
      return nachher;
    });
  }

  return (
    <div
      className={`${className} ImgixVideo-wrap`}
      data-qb-360={mitErsatz ? ersatz.drehung : undefined}
      data-qb-360-zustand={mitErsatz ? zustand : undefined}
    >
      {/* ANKER für die Medien-Erfassung (Grossjob 20260903-tracking-
          videowatchtime, s04). Ohne sie leitet der Pixel den Namen aus einer
          blob:-URL bzw. dem poster ab (hls.js hängt die Quelle nachtraeglich
          an, video.src ist dann bedeutungslos) und meldet die Herkunft als
          Notbehelf. `data-video-ton` kommt aus dem GEMESSENEN Manifest
          app/lib/video-ton.js, nicht aus einer Browser-Erkennung: die
          360-Grad-Videos tragen eine AAC-Spur mit digitaler Stille, auf die
          jede Feature-Detection hereinfaellt. Reine Attribute, kein Verhalten,
          keine Ladezeit. */}
      <video
        ref={videoRef}
        data-video={videoPath}
        data-video-familie="imgix"
        data-video-quelle={quelle}
        data-video-ton={zeigtTonSteuerung ? 'hoerbar' : 'stumm'}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        poster={mitErsatz ? ersatz.bild : fallbackImage}
        aria-hidden={mitErsatz ? 'true' : undefined}
      />
      {mitErsatz && <Ersatzbild ersatz={ersatz} zustand={zustand} />}
      {zeigtTonSteuerung && (
      <button
        type="button"
        className="ImgixVideo-sound-toggle"
        onClick={toggleTon}
        aria-pressed={!stumm}
        aria-label={stumm ? 'Ton einschalten' : 'Ton ausschalten'}
      >
        {stumm ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="4,9 8,9 12,5 12,19 8,15 4,15" fill="currentColor" stroke="none" />
            <line x1="16" y1="9" x2="22" y2="15" />
            <line x1="22" y1="9" x2="16" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="4,9 8,9 12,5 12,19 8,15 4,15" fill="currentColor" stroke="none" />
            <path d="M16 8a5 5 0 0 1 0 8" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        )}
      </button>
      )}
    </div>
  );
}
