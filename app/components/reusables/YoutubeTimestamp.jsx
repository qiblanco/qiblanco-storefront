import {useState} from 'react';

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
 * Props:
 *   videoId       Pflicht — YouTube-Video-ID (z.B. 'BQxzbXqREWE')
 *   startSeconds  Startpunkt in Sekunden (default 0 = Anfang)
 *   titel         Pflicht — a11y (iframe-title + aria-label des Posters)
 *   thumbnail     optionale eigene Poster-URL (default: YouTube hqdefault)
 *   dataSection   optionaler Watch-/Heatmap-Anker
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

export function YoutubeTimestamp({
  videoId,
  startSeconds = 0,
  titel,
  thumbnail,
  dataSection,
}) {
  const [laueft, setLaueft] = useState(false);
  const start = Math.max(0, Math.floor(startSeconds || 0));
  if (laueft) {
    return (
      <div
        className="YoutubeTimestamp"
        data-section={dataSection || undefined}
        style={FRAME_STYLE}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&autoplay=1`}
          title={titel}
          style={{...FILL_STYLE, border: 0}}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      className="YoutubeTimestamp"
      data-section={dataSection || undefined}
      onClick={() => setLaueft(true)}
      aria-label={`Video abspielen: ${titel}`}
      style={FRAME_STYLE}
    >
      <img
        src={thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        style={FILL_STYLE}
      />
      <span className="YoutubeTimestamp__play" aria-hidden="true" style={PLAY_STYLE}>
        <span style={PLAY_BADGE_STYLE}>▶</span>
      </span>
    </button>
  );
}
