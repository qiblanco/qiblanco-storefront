import {useCallback, useEffect, useRef, useState} from 'react';
import {youtubeWatchtimeAnbinden, mitJsApi} from '~/lib/video-watchtime';

/*
 * YoutubeTimestamp — das wiederverwendbare Muster „YouTube-Video als
 * Thumbnail, Klick-zu-Play, Start ab Zeitstempel" (Job 20260718-lp-gesamt-
 * relaunch; Skill-Doc: homepage-bauer/SKILL-VIDEO-LADESTRATEGIE.md — der
 * früher hier genannte Pfad SKILL-YOUTUBE-EMBED.md hat nie existiert).
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

/*
 * VORAUSSCHAUENDES LADEN (Job 20260903-BAU-vorausschauendes-laden-...).
 * Skill-Doc mit der Entscheidungsregel: homepage-bauer/SKILL-VIDEO-LADESTRATEGIE.md
 *
 * Was beim Klick Zeit kostet, ist meist NICHT das Video, sondern alles davor:
 * DNS-Auflösung, TCP-Verbindung, TLS-Aushandlung. Auf einer Mobilverbindung
 * mit 150 ms Latenz sind das leicht drei Rundreisen (~450 ms), BEVOR das erste
 * Byte des Players unterwegs ist. Genau diese drei Rundreisen lassen sich
 * vorbereiten, während der Besucher noch liest — ohne ein einziges Byte Video.
 *
 * WANN: erst auf ein ABSICHTSSIGNAL (Zeiger berührt die Kachel, Finger tippt
 * an, Element bekommt Tastaturfokus), nie beim Seitenaufbau und nie für alle
 * Videos zugleich. Das ist die halbe Sekunde zwischen "will klicken" und "hat
 * geklickt".
 *
 * WAS NICHT: der Player wird NIE vor dem Klick geladen, die Videodaten
 * ebenfalls nicht. Vorgewärmt wird ausschließlich die VERBINDUNG.
 *
 * NUR EINE ORIGIN: www.youtube-nocookie.com trägt das Player-Dokument und die
 * Player-Konfiguration, also den kritischen Pfad. i.ytimg.com ist durch das
 * Poster ohnehin schon warm; die Mediendaten liegen auf einem pro Abruf
 * gewürfelten googlevideo-Host, der sich nicht vorwaermen lässt.
 *
 * ---------------------------------------------------------------------------
 * GEMESSEN WIRKUNGSLOS — DESHALB STEHT `vorwaermen` AUF false
 * (Job 20260905-MESSEN-wirkt-preconnect-wirklich-messgeraet-ist-blind-prio25,
 * 2026-09-03; Belege in dessen belege/, Werkzeuge in dessen build/)
 *
 * Der Gedanke oben stimmt für ein <img> oder ein <script>. Er stimmt NICHT für
 * eine KREUZ-SEITIGE IFRAME-NAVIGATION, und genau die ist unser Klick.
 *
 * Chrome trennt seine Verbindungen nach NetworkAnonymizationKey. Das preconnect
 * aus dem ELTERN-Dokument (Site qiblanco.com) landet in einer anderen Partition
 * als die Navigation des IFRAMES (Site youtube-nocookie.com). Der vorgewärmte
 * Socket ist da, er ist fertig ausgehandelt — und der Player benutzt ihn nicht.
 *
 * Gezählt auf der GEGENSEITE, nicht im Browser erfragt (3/3 Läufe je Zeile):
 *   kreuz-seitig, preconnect + <img>     -> 1 Verbindung, 2473 ms alt  WARM
 *   kreuz-seitig, preconnect + <iframe>  -> 2 Verbindungen, 4 ms alt   KALT
 *   gleich-seitig, preconnect + <iframe> -> 1 Verbindung, 2472 ms alt  WARM
 * Echtfall Startseite gegen das echte www.youtube-nocookie.com, mit-Arm 3/3:
 *   ein Tunnel beim Absichtssignal (2058-2122 B, reiner TLS-Handschlag, nie
 *   benutzt) und ein ZWEITER beim Klick, der die 25 kB Player trägt.
 *
 * Es bleibt ein PROP statt gelöscht: der Mechanismus ist für gleich-seitige
 * Ziele gemessen wirksam. Wer ein Ziel auf UNSERER Site vorwärmt, schaltet ihn
 * bewusst mit `vorwaermen` ein. Für YouTube ist er es nicht.
 * ---------------------------------------------------------------------------
 */
const VORWAERM_ORIGIN = 'https://www.youtube-nocookie.com';

/*
 * Ein Besucher mit knappem Datentarif hat kein Interesse an unserem Vorsprung.
 * `saveData` ist eine ausdrueckliche Willensaeusserung und wird respektiert,
 * nicht abgewogen; 2g/slow-2g trägt es schlicht nicht.
 *
 * FAIL-SAFE-RICHTUNG: kennt der Browser die API nicht (Firefox, Safari), wird
 * vorgewärmt. Ein preconnect kostet dort ~0 Bytes, und die Alternative wäre,
 * die Faehigkeit für die Mehrheit der Browser abzuschalten.
 */
function willSparen() {
  const v =
    typeof navigator !== 'undefined' &&
    (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
  if (!v) return false;
  return (
    v.saveData === true || v.effectiveType === '2g' || v.effectiveType === 'slow-2g'
  );
}

export function YoutubeTimestamp({
  videoId,
  startSeconds = 0,
  titel,
  thumbnail,
  dataSection,
  sizes = '100vw',
  className,
  playClassName,
  vorwaermen = false, // gemessen wirkungslos fuer kreuz-seitige iframes, s.o.
  noscriptFallback = false,
}) {
  const [laueft, setLaueft] = useState(false);
  const [posterStufe, setPosterStufe] = useState(0);
  const rahmen = useRef(null);
  const schonGewaermt = useRef(false);
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

  /*
   * FEHLERFALL-ZUSAGE: Das Vorwärmen ist ein HINWEIS an den Browser, kein
   * Schritt in der Klickkette. Faellt es aus, ist es wirkungslos — nicht
   * schädlich. Der try/catch ist deshalb kein Schmuck: er stellt sicher, dass
   * eine Ausnahme hier NIE den Klick-Handler erreicht. Ein Beschleuniger, der
   * im Fehlerfall den normalen Weg kaputt macht, ist schlimmer als keiner.
   */
  const waermeVor = useCallback(() => {
    if (!vorwaermen || schonGewaermt.current) return;
    schonGewaermt.current = true;
    try {
      if (willSparen()) return;
      if (typeof document === 'undefined') return;
      if (document.querySelector(`link[data-qb-vorwaerm="${VORWAERM_ORIGIN}"]`)) return;
      const l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = VORWAERM_ORIGIN;
      l.setAttribute('data-qb-vorwaerm', VORWAERM_ORIGIN);
      document.head.appendChild(l);
    } catch {
      /* bewusst stumm: ohne Vorsprung klicken ist der Normalfall von gestern */
    }
  }, [vorwaermen]);

  const absichtsSignale = {
    onPointerEnter: waermeVor,
    onTouchStart: waermeVor,
    onFocus: waermeVor,
  };
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
  const knopf = (
    <button
      type="button"
      className={eigenesKleid ? className : 'YoutubeTimestamp'}
      data-section={dataSection || undefined}
      onClick={() => setLaueft(true)}
      {...absichtsSignale}
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

  if (!noscriptFallback) return knopf;

  /*
   * OHNE AKTIVES SKRIPT (Christians ausdrueckliche Bedingung).
   * Das abgeloeste <iframe> funktionierte ohne JavaScript; ein <button> tut das
   * nicht — ohne Skript passiert beim Klick NICHTS. Das wäre eine echte neue
   * Schwäche, und sie wird hier geschlossen statt verschwiegen:
   *
   *   - Das Vorschaubild ist ohnehin da (SSR, reines <img>).
   *   - <noscript> trägt einen ECHTEN Link auf die YouTube-Seite des Videos,
   *     inklusive Startzeit. Ohne Skript führt der Klick also zum Video,
   *     nur auf YouTube statt eingebettet.
   *
   * Warum als GESCHWISTER und nicht im Knopf: ein <a> darf nicht in einem
   * <button> stehen (interaktiver Inhalt in interaktivem Inhalt).
   * Warum `display: contents`: der Wrapper verschwindet aus dem Layout, die
   * Geometrie bleibt exakt die des Knopfes — kein Eingriff ins CSS der Seite.
   * Warum dangerouslySetInnerHTML: React würde die Kinder eines <noscript>
   * sonst hydrieren wollen; hier ist der Inhalt bewusst ein reiner
   * Server-Text und wird als solcher gesetzt (Inhalt ist eigener,
   * nicht-nutzergesteuerter Code, keine Fremdeingabe).
   */
  const watchUrl =
    `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` +
    (start > 0 ? `&t=${start}s` : '');
  const posterUrl =
    thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  const titelText = String(titel || '').replace(/[<>&"]/g, (c) =>
    ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c]),
  );

  return (
    <span style={{display: 'contents'}} data-qb-video-fallback="">
      {/*
        Ohne diese Regel stuenden ohne Skript ZWEI Poster untereinander: der
        (tote) Knopf und der Ersatzlink. <noscript> greift nur, wenn wirklich
        kein Skript läuft — mit Skript ist die Regel nicht im Dokument und
        der Knopf bleibt unberuehrt.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            '<style>[data-qb-video-fallback] > button{display:none !important}</style>',
        }}
      />
      {knopf}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            `<a class="${eigenesKleid ? className : 'YoutubeTimestamp'}" ` +
            `href="${watchUrl}" target="_blank" rel="noopener noreferrer" ` +
            `aria-label="Video auf YouTube ansehen: ${titelText}">` +
            `<img src="${posterUrl}" alt="" width="480" height="360" ` +
            `style="width:100%;height:100%;object-fit:cover" /></a>`,
        }}
      />
    </span>
  );
}
