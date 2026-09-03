import {useEffect, useRef, useState} from 'react';
import {youtubeWatchtimeAnbinden, mitJsApi} from '~/lib/video-watchtime';

/*
 * YoutubeTimestamp — das wiederverwendbare Muster „YouTube-Video als
 * Thumbnail, Klick-zu-Play, Start ab Zeitstempel" (Job 20260718-lp-gesamt-
 * relaunch; Skill-Doc: homepage-bauer/SKILL-YOUTUBE-EMBED.md).
 *
 * Verhält sich wie die Testimonial-Poster (LiteYt-Muster der Campaign-LPs):
 * SSR rendert NUR ein Thumbnail + Play-Symbol — kein Iframe-Chrome, kein
 * Autoplay ungefragt (WCAG 1.4.2). Erst der Klick lädt den youtube-nocookie-
 * Player mit `start=<startSeconds>` und Autoplay.
 *
 * Poster-Kette (GL-DES-0009, Job YT-THUMB-MAXRES 2026-07-21): maxresdefault
 * (1280x720) mit echtem Fallback sddefault (640x480) → hqdefault (480x360).
 * srcset + width/height geben dem Browser die echten Bildgrößen — kein
 * CSS-Upscaling kleiner Varianten. Fehlt eine Stufe (404), stuft der
 * onError-Handler genau eine Stufe ab (idempotent, hqdefault existiert immer);
 * hqdefault ist 4:3, object-fit: cover verhindert Balkenränder.
 *
 * Props:
 *   videoId       Pflicht — YouTube-Video-ID (z.B. 'BQxzbXqREWE')
 *   startSeconds  Startpunkt in Sekunden, PRO EINSATZORT (default 0 = Anfang)
 *   titel         Pflicht — a11y (iframe-title + aria-label des Posters)
 *   thumbnail     optionale eigene Poster-URL, PRO EINSATZORT — ersetzt die
 *                 YouTube-Kette komplett (kein srcset/kein Abstieg)
 *   dataSection   optionaler Watch-/Heatmap-Anker
 *   sizes         srcset-sizes der Poster-Kette (default '100vw' — wählt im
 *                 Zweifel die größere Variante, hochskaliert wird nie)
 *   className     Seiten-eigener CSS-Scope (LiteYt-Erbe der Campaign-LPs):
 *                 ersetzt Standard-Klasse UND Inline-Styles komplett, das
 *                 Aussehen kommt dann ausschließlich aus dem Seiten-CSS
 *                 (.lp-*-yt). DOM bleibt deckungsgleich zum alten LiteYt.
 *   playClassName Klasse des Play-Overlays im className-Modus
 *                 (default `${className}__play`)
 *
 * ÄNDERUNG 2026-09-03 (Grossjob 20260903-tracking-videowatchtime, s04):
 * Der beim Klick erzeugte Player bekommt `enablejsapi=1` und meldet seine
 * Watchtime an die Medien-Erfassung des Pixels (`app/lib/video-watchtime.js`).
 * Das Facade-Muster ist dafür der billigste Ort, den es gibt: der Player
 * entsteht erst beim Klick, und ein Klick IST der Abspielbeginn — die Messung
 * kostet hier null Vorablast. Vor dem Klick wird NICHTS angebunden und NICHTS
 * gemessen; das Poster bleibt ein `<img>`.
 *
 * Selbsttragend: 16:9-Rahmen über Inline-aspect-ratio, funktioniert damit auf
 * jeder Route ohne seitenspezifisches CSS; Feinschliff je Seite über die
 * .YoutubeTimestamp-Klasse im jeweiligen Token-Scope.
 */
const FRAME_STYLE = {
  position: 'relative',
  display: 'block',
  width: '100%',
  aspectRatio: '16 / 9',
  padding: 0,
  border: 0,
  borderRadius: '12px',
  overflow: 'hidden',
  background: '#000',
  cursor: 'pointer',
};
const FILL_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};
const PLAY_STYLE = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
};
const PLAY_BADGE_STYLE = {
  display: 'grid',
  placeItems: 'center',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.55)',
  color: '#fff',
  fontSize: '1.6rem',
  paddingLeft: '5px',
};

/* Aufsteigend abzusteigende Poster-Stufen: [Datei, Breite, Höhe]. */
const POSTER_STUFEN = [
  ['maxresdefault', 1280, 720],
  ['sddefault', 640, 480],
  ['hqdefault', 480, 360],
];

export function YoutubeTimestamp({
  videoId,
  startSeconds = 0,
  titel,
  thumbnail,
  dataSection,
  sizes = '100vw',
  className,
  playClassName,
}) {
  const [laueft, setLaueft] = useState(false);
  const [posterStufe, setPosterStufe] = useState(0);
  const rahmen = useRef(null);
  const start = Math.max(0, Math.floor(startSeconds || 0));
  const eigenesKleid = Boolean(className);
  /* Anker: der vom Menschen vergebene Sektions-Anker, sonst die
   * YouTube-Kennung. Die Herkunft wird mitgemeldet. */
  const objekt = dataSection || (videoId ? 'yt-' + String(videoId).toLowerCase() : '');
  const objektQuelle = dataSection ? 'anker' : 'quelle';
  useEffect(() => {
    if (!laueft || !rahmen.current || !objekt) return undefined;
    return youtubeWatchtimeAnbinden(rahmen.current, {objekt, objektQuelle});
  }, [laueft, objekt, objektQuelle]);
  if (laueft) {
    return (
      <div
        className={eigenesKleid ? className : 'YoutubeTimestamp'}
        data-section={dataSection || undefined}
        data-video={objekt || undefined}
        data-video-familie="youtube"
        style={eigenesKleid ? undefined : FRAME_STYLE}
      >
        <iframe
          ref={rahmen}
          src={mitJsApi(
            `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&autoplay=1`,
          )}
          title={titel}
          style={eigenesKleid ? undefined : {...FILL_STYLE, border: 0}}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  const [stufenDatei, stufenBreite, stufenHoehe] = POSTER_STUFEN[posterStufe];
  const posterProps = thumbnail
    ? {src: thumbnail, width: 1280, height: 720}
    : {
        src: `https://i.ytimg.com/vi/${videoId}/${stufenDatei}.jpg`,
        srcSet: POSTER_STUFEN.slice(posterStufe)
          .map(([datei, breite]) => `https://i.ytimg.com/vi/${videoId}/${datei}.jpg ${breite}w`)
          .join(', '),
        sizes,
        width: stufenBreite,
        height: stufenHoehe,
        onError: () =>
          setPosterStufe((s) => Math.min(s + 1, POSTER_STUFEN.length - 1)),
      };
  return (
    <button
      type="button"
      className={eigenesKleid ? className : 'YoutubeTimestamp'}
      data-section={dataSection || undefined}
      onClick={() => setLaueft(true)}
      aria-label={`Video abspielen: ${titel}`}
      style={eigenesKleid ? undefined : FRAME_STYLE}
    >
      <img
        {...posterProps}
        alt=""
        loading="lazy"
        style={eigenesKleid ? undefined : FILL_STYLE}
      />
      <span
        className={
          eigenesKleid
            ? playClassName || `${className}__play`
            : 'YoutubeTimestamp__play'
        }
        aria-hidden="true"
        style={eigenesKleid ? undefined : PLAY_STYLE}
      >
        <span style={eigenesKleid ? undefined : PLAY_BADGE_STYLE}>▶</span>
      </span>
    </button>
  );
}
