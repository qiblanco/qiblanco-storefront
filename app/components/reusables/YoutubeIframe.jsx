import {mitJsApi} from '~/lib/video-watchtime';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ÄNDERUNG 2026-09-11 (Job 20260911-BAU-videoumschaltung-seite-bricht-beim-
 * play-klick-zusammen, Christian): DIESER BAUSTEIN LÄDT NICHTS MEHR UNGEFRAGT.
 *
 * Christian: „Hier auch nochmal auf den ganzen Seiten optimieren" und „Die
 * Ladeweise bleibt schlank. Keine vorgeladenen Player."
 *
 * WAS ER VORHER WAR: die eager ladende Einbettung — ein `<iframe>` im SSR, das
 * auf JEDEM Seitenaufruf rund 400 kB Player-Infrastruktur zog, auch von den
 * über 90 %, die nie klicken. Er war damit der letzte Ort im Baum, der die
 * Regel aus homepage-bauer/SKILL-VIDEO-LADESTRATEGIE.md verletzte — dort steht
 * er seit dem 2026-09-03 ausdrücklich als „in NEUEM Code verboten", durfte im
 * Bestand aber stehenbleiben. 21 Einsatzstellen standen noch auf ihm.
 *
 * WAS ER JETZT IST: eine dünne Hülle um `YoutubeTimestamp` — dieselbe Fassade,
 * die die Startseite seit dem 2026-09-03 benutzt, mit exakt derselben
 * CSS-Klasse (`YoutubeIframe YoutubeIframe--facade`). Die 21 Einsatzstellen
 * bleiben unverändert; sie bekommen das reparierte Umblenden mit, ohne dass
 * eine einzige von ihnen angefasst werden musste.
 *
 * WARUM DIE HÜLLE UND NICHT 21 EINZELÄNDERUNGEN: „Fünf Einbettungen mit fünf
 * Verhaltensweisen sind die eigentliche Ursache dafür, dass so etwas überhaupt
 * entsteht" (Christian). Eine Umschreibung an 21 Stellen hätte 21 Gelegenheiten
 * geschaffen, wieder auseinanderzulaufen. Gepflegt wird EINE Stelle.
 *
 * WAS BLEIBT: `link` und `dataSection` sind unverändert die Schnittstelle, der
 * Watchtime-Anker (`videoAnker`) ist derselbe, und die Messung hängt weiter am
 * selben `objekt`. Ist die Kennung aus dem Link nicht lesbar, fällt der
 * Baustein auf die alte Einbettung zurück — fail-soft in Richtung „der
 * Besucher sieht das Video", nie in Richtung leere Fläche.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Zerlegt eine YouTube-Einbettungs-URL in Kennung und Startsekunde.
 *
 * Die Startzeit steht in unserem Bestand als `start=` (Sekunden) oder `t=`
 * (Sekunden, teils mit angehängtem `s`) — beide Schreibweisen kommen vor und
 * beide müssen erhalten bleiben: ein Einsatzort wie
 * `.../embed/mH0vaUEeFqg?start=3463` zeigt bewusst auf Minute 57, nicht auf
 * den Anfang. Wer sie verliert, spielt ein anderes Video ab als vorher.
 */
export function ausLink(link) {
    const text = String(link || '');
    const kennung = text.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
    const zeit = text.match(/[?&](?:start|t)=(\d+)/);
    /* Alles, was NICHT Kennung oder Startzeit ist, gehoert dem Einsatzort und
     * wird mitgenommen -- `controls=0` etwa ist eine Gestaltungsentscheidung
     * der jeweiligen Seite. `si=` faellt raus: das ist der Sitzungs-Zeiger aus
     * dem YouTube-Teilen-Dialog, er gehoert einer fremden Sitzung und hat auf
     * unseren Seiten nichts zu suchen. */
    const frage = text.indexOf('?');
    const rest = frage < 0
        ? []
        : text.slice(frage + 1).split('&').filter((teil) => {
            const name = teil.split('=')[0];
            return teil && !['start', 't', 'si', 'autoplay', 'enablejsapi'].includes(name);
        });
    return {
        videoId: kennung ? kennung[1] : '',
        start: zeit ? parseInt(zeit[1], 10) : 0,
        zusatz: rest.join('&'),
    };
}

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

export function YoutubeIframe({link, dataSection, titel}) {
    const {objekt} = videoAnker(link, dataSection);
    const {videoId, start, zusatz} = ausLink(link);
    if (!videoId) {
        /* Ohne lesbare Kennung gibt es keine Vorschau und damit keine Fassade.
         * Dann lieber die alte, eager ladende Einbettung als gar kein Video --
         * fail-soft in Richtung "der Besucher sieht das Video". */
        return (
            <div className="YoutubeIframe" data-section={dataSection}
                 data-video={objekt || undefined} data-video-familie="youtube">
                <iframe ref={null} width="560" src={mitJsApi(link)}
                        title={titel || 'YouTube video player'} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
        );
    }
    return (
        <YoutubeTimestamp
            videoId={videoId}
            startSeconds={start}
            titel={titel || 'Video'}
            dataSection={dataSection}
            className="YoutubeIframe YoutubeIframe--facade"
            playClassName="YoutubeIframe--facade__play"
            sizes="(min-width: 860px) 800px, 94vw"
            zusatzParameter={zusatz}
            noscriptFallback
        />
    );
}
