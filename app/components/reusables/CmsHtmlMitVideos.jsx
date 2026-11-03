import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {PLATZHALTER_ATTR} from '~/lib/youtube-einbettung';

/*
 * CMS-HTML MIT VIDEO-FASSADE (Auftrag einwilligung-scanner-20261023T144303Z-s02,
 * 2026-11-03).
 *
 * Rendert Seitentext aus dem Shopify-Admin, in dem `cmsYoutubeUmwandeln`
 * (app/lib/youtube-einbettung.js) jedes rohe YouTube-iframe schon durch
 * einen Platzhalter ersetzt hat. Im Server-HTML zeigt der Platzhalter das
 * Vorschaubild gleicher Herkunft und einen echten Link auf das Video. Ohne
 * Skript führt der Klick zum Video auf YouTube.
 *
 * Nach dem Hydrieren hängt diese Komponente in jeden Platzhalter die
 * Fassade `YoutubeTimestamp` (per Portal). Erst ein Tipp lädt dann
 * youtube-nocookie mit autoplay. Es gibt nur eine Fassade und damit nur ein
 * Verhalten, keine zweite Bauweise für CMS-Videos.
 *
 * Der Text selbst bleibt `dangerouslySetInnerHTML`: React fasst ihn nach dem
 * ersten Rendern nicht mehr an, solange `html` gleich bleibt. Die Portale
 * leben deshalb stabil in den Platzhaltern.
 */
export function CmsHtmlMitVideos({html, className, ...rest}) {
  const wurzel = useRef(null);
  const [ziele, setZiele] = useState([]);

  useEffect(() => {
    const knoten = wurzel.current
      ? Array.from(wurzel.current.querySelectorAll(`[${PLATZHALTER_ATTR}]`))
      : [];
    setZiele(
      knoten.map((k, i) => {
        /* Die Vorab-Form (Bild + Link) räumt der Fassade den Platz. */
        k.querySelector('.qb-yt-cms__vorab')?.remove();
        return {
          schluessel: `${i}-${k.getAttribute(PLATZHALTER_ATTR)}`,
          knoten: k,
          videoId: k.getAttribute(PLATZHALTER_ATTR) || '',
          start: parseInt(k.getAttribute('data-start') || '0', 10) || 0,
          zusatz: k.getAttribute('data-zusatz') || '',
          titel: k.getAttribute('data-titel') || 'Video',
        };
      }),
    );
  }, [html]);

  return (
    <>
      <div
        ref={wurzel}
        className={className}
        {...rest}
        dangerouslySetInnerHTML={{__html: html}}
      />
      {ziele.map((z) =>
        createPortal(
          <YoutubeTimestamp
            videoId={z.videoId}
            startSeconds={z.start}
            titel={z.titel}
            zusatzParameter={z.zusatz}
            sizes="(min-width: 860px) 800px, 94vw"
          />,
          z.knoten,
          z.schluessel,
        ),
      )}
    </>
  );
}
