import {useState} from 'react';
import {VIDEOS, THEMEN} from '~/lib/redesign3themen';

/** Titel des Themas fuer den Chip unter dem Clip. */
const themaTitel = (id) => THEMEN.find((t) => t.id === id)?.titel || '';

/**
 * Ein einzelner Podcast-Clip mit Klick-Poster-Overlay (Play-Symbol via CSS).
 * Kein Autoplay, kein Ton ungefragt (WCAG 1.4.2), preload="none".
 *
 * FAIL-SOFT (Medien-Hosting GL-PRO-0015): ist `src` (noch) null — das Video
 * wartet auf den Shopify-CDN-Upload (write_files-Scope = Christian) — rendert
 * die Karte das ECHTE Standbild + das wortlaut-belegte Zitat statt eines
 * toten Players. Sobald finalize-podcast-clips die CDN-URL eintraegt, wird
 * daraus automatisch der Click-to-play-Player.
 */
function Clip({clip}) {
  const [gestartet, setGestartet] = useState(false);
  const spielbar = Boolean(clip.src);
  return (
    <article className="rd3-podcast__clip">
      <div
        className={`rd3-podcast__frame${
          gestartet ? ' rd3-podcast__frame--playing' : ''
        }`}
      >
        {spielbar ? (
          <>
            {/* Untertitel-VTT (WCAG 1.2.2) folgt mit dem Wortlaut-Manifest —
                bis dahin kein Track-Asset vorhanden. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              className="rd3-podcast__video"
              preload="none"
              controls
              poster={clip.poster || undefined}
              playsInline
              onPlay={() => setGestartet(true)}
            >
              <source src={clip.src} type="video/mp4" />
            </video>
            {!gestartet && (
              <span className="rd3-podcast__play" aria-hidden="true" />
            )}
          </>
        ) : (
          clip.poster && (
            <img
              className="rd3-podcast__video"
              src={clip.poster}
              alt={`${clip.titel} — Standbild aus dem Gespräch`}
              loading="lazy"
            />
          )
        )}
      </div>
      {clip.zitat && (
        <blockquote className="rd3-podcast__zitat">
          <p>„{clip.zitat}“</p>
          {clip.quelle && <cite>{clip.quelle}</cite>}
        </blockquote>
      )}
      <h3 className="rd3-podcast__titel">{clip.titel}</h3>
      <span className="rd3-podcast__chip">{themaTitel(clip.thema)}</span>
    </article>
  );
}

/**
 * PodcastStimmen (Konzept B3, Pos 8): „Christian im Gespräch" — 1–3 Clips,
 * click-to-play mit Poster-first. Default: alle drei Clips aus dem Datenmodul.
 *
 * @param {{dataSection?: string, clips?: Array}} props
 *   `clips` erlaubt der LP, nur einen thematisch passenden Clip zu zeigen.
 */
export function PodcastStimmen({dataSection, clips}) {
  const liste = clips && clips.length ? clips : VIDEOS;
  return (
    <section className="rd3-podcast NormalSectionSize" data-section={dataSection}>
      <div className="rd3-podcast__head">
        <span className="rd3-podcast__eyebrow">Christian im Gespräch</span>
        <h2 className="rd3-podcast__h2">
          Der Gründer, ungeschnitten — aus dem Podcast.
        </h2>
      </div>
      <div
        className={`rd3-podcast__grid rd3-podcast__grid--${liste.length}`}
      >
        {liste.map((clip) => (
          <Clip clip={clip} key={clip.id} />
        ))}
      </div>
    </section>
  );
}
