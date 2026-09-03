import {useEffect, useRef} from 'react';
import {youtubeWatchtimeAnbinden, mitJsApi} from '~/lib/video-watchtime';

/*
 * YoutubeIframe — die eager ladende YouTube-Einbettung (23 Einsatzstellen,
 * darunter die drei Startseiten-Testimonials).
 *
 * ÄNDERUNG 2026-09-03 (Grossjob 20260903-tracking-videowatchtime, s04):
 * Die Einbettung bekommt `enablejsapi=1` und meldet ihre Watchtime an die
 * Medien-Erfassung des Pixels. Vorher war sie strukturell unmessbar — ein
 * `<iframe>` ohne API sagt von aussen nicht, ob es überhaupt läuft; gemessen
 * wurde nur die Verweildauer der umgebenden Sektion, und das ist etwas
 * anderes.
 *
 * WAS DIESE ÄNDERUNG NICHT TUT: sie lädt nichts nach. Kein
 * `youtube.com/iframe_api`, kein zweites Skript, kein zusätzlicher Request —
 * die Verständigung läuft über `postMessage` mit dem Player, der ohnehin
 * schon geladen wird. Begründung und ehrliche Grenze stehen im Kopf von
 * `app/lib/video-watchtime.js`.
 *
 * ANKER (`data-video`, `data-video-familie`): der Pixel leitet den Namen eines
 * Videos sonst aus `poster`/`src`/`data-section` ab und meldet die Herkunft
 * als Notbehelf mit. Hier wird der Name vergeben, nicht geraten — für die
 * Startseiten-Testimonials ist das der bestehende `data-section`-Anker
 * (`youtube-testimonial-guse|-preis|-tepperwein`), kein zweites Ankersystem.
 *
 * LADEZEIT: unverändert. Das iframe lädt wie bisher; `enablejsapi=1` ist ein
 * Query-Parameter an einer URL, die ohnehin abgerufen wird.
 */

/* Der stabile Name des Videos: der vom Menschen vergebene Sektions-Anker,
 * sonst die YouTube-Kennung aus der Einbettungs-URL. Die Herkunft wird
 * mitgemeldet — ein Anker und ein Notbehelf dürfen in der Auswertung nicht
 * gleich viel wiegen. */
export function videoAnker(link, dataSection) {
  if (dataSection) return {objekt: dataSection, objektQuelle: 'anker'};
  const treffer = String(link || '').match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  if (treffer) return {objekt: 'yt-' + treffer[1].toLowerCase(), objektQuelle: 'quelle'};
  return {objekt: '', objektQuelle: ''};
}

export function YoutubeIframe({link, dataSection}){
    const rahmen = useRef(null);
    const {objekt, objektQuelle} = videoAnker(link, dataSection);
    useEffect(() => {
        if (!rahmen.current || !objekt) return undefined;
        return youtubeWatchtimeAnbinden(rahmen.current, {objekt, objektQuelle});
    }, [objekt, objektQuelle]);
    return (
        <div className="YoutubeIframe" data-section={dataSection} data-video={objekt || undefined} data-video-familie="youtube">
            <iframe ref={rahmen} width="560" src={mitJsApi(link)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
    )
}
