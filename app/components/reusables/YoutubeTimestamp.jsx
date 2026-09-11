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
 *   posterAlt     Optional, Vorgabe '' — Alternativtext des Vorschaubildes.
 *                 VORGABE IST BEWUSST DIE LEERE ZEICHENKETTE und aendert für
 *                 alle bisherigen Aufrufer NICHTS: das Poster steckt in einem
 *                 Knopf, der bereits `aria-label="Video abspielen: <titel>"`
 *                 trägt — ein zweiter Text daneben ist für den Screenreader
 *                 Doppelung, nicht Gewinn (das `aria-label` des Knopfes sticht
 *                 den Bildtext ohnehin). Wer ihn SETZT, tut das für die
 *                 BILDERSUCHE: dort ist das Standbild eine eigene Ressource mit
 *                 eigenem Text. Gesetzt wird er deshalb dort, wo das Motiv
 *                 etwas aussagt (ein Mensch mit Namen), nicht pauschal.
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
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ÄNDERUNG 2026-09-11 (Job 20260911-BAU-videoumschaltung-seite-bricht-beim-
 * play-klick-zusammen, Christian): DIE UMSCHALTUNG IST EIN ÜBERBLENDEN
 * GEWORDEN, KEIN ELEMENT-TAUSCH MEHR.
 *
 * Christian: „wenn man auf Play drückt, verschwindet zuerst alles Sichtbare,
 * dann kommt was Schwarzes, und dann wird das Video geladen. Das war nicht die
 * Idee hinter Fast Loading."
 *
 * WAS VORHER GESCHAH — und warum es wie ein Ladeproblem aussah, aber keins war:
 * Der Zustandswechsel gab einen KOMPLETT ANDEREN Teilbaum zurück
 * (`if (laueft) return <div><iframe/></div>`). React hat damit den `<button>`
 * mitsamt Vorschau-`<img>` ausgehängt und im selben Bildaufbau ein leeres
 * `<iframe>` eingehängt. Die Vorschau war weg, BEVOR der Ersatz Bild hatte —
 * sichtbar blieb der schwarze Hintergrund des Rahmens. Nicht das Video war
 * langsam, die Vorschau war zu früh weg.
 *
 * GEMESSEN VOR DEM UMBAU (bin/mess_videoumschaltung.py, live, 2026-09-11):
 *   qiblanco.com Startseite   vorschau_sichtbar_ms = 0, schwarz 3937 ms
 *   /pages/tiefer-schlaf      vorschau_sichtbar_ms = 0, schwarz 3460 ms
 *   crystal-cacao.com         vorschau_sichtbar_ms = 0, schwarz  195 ms
 *
 * WIE ES JETZT GEBAUT IST (dasselbe Muster wie lite-youtube-embed von Paul
 * Irish, der De-facto-Standard für Facade-Einbettungen): die Vorschau wird
 * NICHT MEHR ENTFERNT. Sie bleibt als unterste Schicht liegen, der Player legt
 * sich darüber und wird erst SICHTBAR GEBLENDET, wenn er wirklich zeigt.
 * Zwischen Klick und Bild sieht der Besucher durchgehend die Vorschau — plus
 * ein Ladezeichen, damit erkennbar ist, dass etwas passiert.
 *
 * „WENN ER WIRKLICH ZEIGT" — die Auskunft, die ein iframe von aussen nicht gibt:
 * `onLoad` feuert, sobald das Player-DOKUMENT geladen ist, und sagt NICHTS
 * darüber, ob Bild da ist. Gefragt wird deshalb der Player selbst über das
 * `postMessage`-Protokoll der YouTube-IFrame-API (`playerState === 1`). Diese
 * Verbindung besteht in diesem Haus bereits für die Watchtime-Erfassung und
 * wird DURCHGEREICHT (`onSpielt` in app/lib/video-watchtime.js) — kein zweiter
 * Handshake, kein zweites Skript, null zusätzliche Bytes.
 *
 * FEHLERRICHTUNG, und sie ist der wichtigste Teil: bliebe die Vorschau liegen,
 * WEIL die Auskunft nie kommt (Einwilligung fehlt, Player meldet nichts,
 * Netzfehler), stünde ein Standbild über einem laufenden Video — schlimmer als
 * der Zustand, der hier behoben wird. Es gibt deshalb DREI Auslöser, und der
 * letzte kann nicht ausfallen:
 *   1. der Player meldet „spielt"            (der richtige Fall)
 *   2. `onLoad` + GNADENFRIST_MS             (Player da, Auskunft blieb aus)
 *   3. HARTE_FRIST_MS nach dem Klick         (kann nicht ausfallen)
 * Im schlechtesten Fall ist das Verhalten das von vorher — nie ein schlechteres.
 *
 * DER STAPEL (`STAPEL_STYLE`) — warum es ihn geben MUSS und er nicht dem
 * Seiten-CSS überlassen wird: im Baum existierten ZWEI Stapel-Regime. Die
 * meisten Scopes (.ExterneStimmen__yt, .lp-ts3-yt, .YoutubeIframe--facade)
 * positionieren Poster und Player absolut übereinander. Zwei Scopes (.v2-yt,
 * .v3-yt) hatten dafür ÜBERHAUPT KEINE Regeln: dort stand das Play-Abzeichen
 * als Zeile UNTER dem Video, und sein Verschwinden beim Klick hat die Seite um
 * gemessene 26,4 px nach oben gerissen (CLS 0,00315 auf
 * /pages/schlaf-zellen-schutz-v2-18ef, 2026-09-11). Genau das ist Christians
 * „fünf Einbettungen mit fünf Verhaltensweisen". Der Stapel gehört deshalb
 * jetzt der Komponente: EIN in sich stehender 16:9-Kasten, in dem Poster,
 * Player und Abzeichen übereinanderliegen. Das Seiten-CSS behält, was ihm
 * zusteht (Radius, Schatten, Farbe, Filter) — die GEOMETRIE nicht mehr.
 * ═══════════════════════════════════════════════════════════════════════════
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
/*
 * DER STAPEL: ein 16:9-Kasten, in dem Poster, Player und Abzeichen
 * uebereinanderliegen. In der Flussrichtung (kein `position: absolute`), damit
 * er in BEIDEN Stapel-Regimen des Baums dieselbe Hoehe ergibt -- in einem
 * absolut gefuellten Container (.ExterneStimmen__yt) genauso wie in einem
 * voellig ungestylten <button> (.v2-yt). Gemessen ergibt er dort exakt die
 * Hoehe, die das Poster vorher hatte (760 x 427,5 statt 760 x 453,9).
 */
const STAPEL_STYLE = {
  position: 'relative',
  display: 'block',
  width: '100%',
  /*
   * `max-width: none` ist KEINE Vorsichtsmassnahme, sondern ein gemessener
   * Befund: die V2-Seite trägt eine Typografie-Regel
   * `.lp-v2 span, .lp-v2 dd { max-width: var(--v2-mass) }` -- eine
   * Zeilenlaengen-Begrenzung (65ch) für LESBAREN TEXT. Sie trifft JEDES
   * <span> der Seite und damit auch diesen Stapel: gemessen am 2026-09-11
   * schrumpfte die Kachel dadurch von 760 auf 585 px Breite, das Video wurde
   * also KLEINER als vorher.
   *
   * Der Stapel ist ein Layout-Kasten, kein Fliesstext. Er nimmt deshalb
   * ausdrücklich keine Zeilenlaengen-Vorgabe an -- und genau das ist die
   * Trennung, um die es in diesem Job geht: die GEOMETRIE gehört der
   * Komponente, das AUSSEHEN dem Seiten-CSS.
   */
  maxWidth: 'none',
  overflow: 'hidden',
};
/* Die Schichten sitzen deckungsgleich aufeinander -- das ist der ganze Trick. */
const SCHICHT_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  border: 0,
  margin: 0,
  display: 'block',
};
/*
 * Wie lange nach `onLoad` noch auf die Auskunft des Players gewartet wird,
 * bevor ohne sie umgeblendet wird. Kurz genug, dass niemand ein Standbild
 * über einem laufenden Video sieht; lang genug, dass die Auskunft im
 * Normalfall zuerst da ist.
 */
const GNADENFRIST_MS = 900;
/*
 * Die Frist, die NICHT ausfallen kann. Nach ihr wird umgeblendet, egal was der
 * Player gemeldet hat -- notfalls ist das Ergebnis das Verhalten von vorher.
 * Ein Beschleuniger, der im Fehlerfall den normalen Weg kaputt macht, ist
 * schlimmer als keiner.
 */
const HARTE_FRIST_MS = 4000;

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
  posterAlt = '',
  thumbnail,
  dataSection,
  sizes = '100vw',
  className,
  playClassName,
  vorwaermen = false, // gemessen wirkungslos für kreuz-seitige iframes, s.o.
  noscriptFallback = false,
  seitenverhaeltnis = '16 / 9',
  /*
   * Zusaetzliche Player-Parameter des Einsatzortes, z.B. `controls=0`.
   * Sie stehen NICHT zur Disposition: `controls=0` ist eine Gestaltungs-
   * entscheidung der jeweiligen Seite (TenYearsDealPage zeigt vier Videos
   * bewusst ohne Bedienleiste). Wer beim Umbau die Einbettungs-URL neu baut
   * und diese Parameter dabei verliert, aendert stillschweigend das Aussehen
   * einer Seite, die er gar nicht anfassen wollte.
   */
  zusatzParameter = '',
}) {
  const [laueft, setLaueft] = useState(false);
  /* `zeigt` ist NICHT „der Player existiert", sondern „der Player hat Bild".
   * Der Unterschied zwischen den beiden ist genau das Schwarz, um das es
   * in diesem Job geht. */
  const [zeigt, setZeigt] = useState(false);
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
    return youtubeWatchtimeAnbinden(rahmen.current, {
      objekt,
      objektQuelle,
      onSpielt: () => setZeigt(true),
    });
  }, [laueft, objekt, objektQuelle]);

  /*
   * DIE FRIST, DIE NICHT AUSFALLEN KANN.
   * Sie hängt ausdrücklich NICHT an `objekt`: ohne Anker gibt es keine
   * Watchtime-Anbindung und damit auch kein `onSpielt` -- genau dort wäre
   * eine Vorschau sonst für immer liegengeblieben.
   */
  useEffect(() => {
    if (!laueft || zeigt) return undefined;
    const t = setTimeout(() => setZeigt(true), HARTE_FRIST_MS);
    return () => clearTimeout(t);
  }, [laueft, zeigt]);

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
  /* Die Poster-Stufen werden in BEIDEN Zustaenden gebraucht: die Vorschau
   * bleibt nach dem Klick als unterste Schicht liegen. */
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

  /*
   * DER STAPEL — ein einziger Bauplan für beide Zustaende.
   *
   * Vorher gab es hier ZWEI Teilbaeume, und der Wechsel zwischen ihnen WAR der
   * Defekt. Jetzt gibt es einen: dieselben Schichten, in derselben Reihenfolge,
   * vor und nach dem Klick. Was sich aendert, ist ausschließlich die
   * Deckkraft des Players und das Zeichen in der Mitte.
   */
  const stapel = (
    <span style={{...STAPEL_STYLE, aspectRatio: seitenverhaeltnis}}>
      {/* SCHICHT 1 — die Vorschau. Sie wird NIE entfernt.
          Sie bleibt auch nach dem Umblenden liegen: ein Player, der spaeter
          Vollbild verlaesst oder neu puffert, faellt damit auf ein Bild
          zurueck statt auf Schwarz. Sie kostet nichts, sie ist laengst da. */}
      <img
        {...posterProps}
        alt={posterAlt}
        loading="lazy"
        /* Sobald der Player läuft, ist die Vorschau nur noch UNTERLAGE und
         * trägt keine eigene Aussage mehr -- für die Vorlesehilfe wäre sie
         * dann ein zweiter Text neben einem laufenden Video. */
        aria-hidden={laueft ? 'true' : undefined}
        style={SCHICHT_STYLE}
      />

      {/* SCHICHT 2 — der Player. Erst ab dem Klick im Dokument (das ist die
          Ladeweise, die bleibt), und sichtbar erst, wenn er Bild hat. */}
      {laueft ? (
        <iframe
          ref={rahmen}
          src={mitJsApi(
            `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&autoplay=1` +
              (zusatzParameter ? `&${zusatzParameter}` : ''),
          )}
          title={titel}
          style={{
            ...SCHICHT_STYLE,
            opacity: zeigt ? 1 : 0,
            /* Die Blende ist kurz und läuft nur in EINE Richtung. Wer
               `prefers-reduced-motion` gesetzt hat, bekommt sie nicht --
               eine Deckkraft-Animation ist Bewegung im Sinne der Einstellung. */
            transition: 'opacity 240ms ease-out',
          }}
          onLoad={() => {
            /* Der Player ist DA. Ob er ZEIGT, weiss nur er selbst — deshalb
               noch eine Gnadenfrist auf seine Auskunft, dann ohne sie. */
            setTimeout(() => setZeigt(true), GNADENFRIST_MS);
          }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : null}

      {/* SCHICHT 3 — das Zeichen. Vor dem Klick das Play-Symbol, waehrend des
          Ladens ein Ladezeichen: „Wer klickt und eine Sekunde nichts sieht,
          klickt nochmal" (Christian). Nach dem Umblenden ist es weg. */}
      {zeigt ? null : (
        <span
          className={
            eigenesKleid
              ? playClassName || `${className}__play`
              : 'YoutubeTimestamp__play'
          }
          aria-hidden="true"
          style={PLAY_STYLE}
        >
          <span style={PLAY_BADGE_STYLE}>
            {laueft ? <span className="qb-video-spinner" /> : '\u25B6'}
          </span>
        </span>
      )}
    </span>
  );

  /*
   * DIE HUELLE. Vor dem Klick ein <button> (bedienbar, fokussierbar), danach
   * ein <div> — ein <iframe> ist interaktiver Inhalt und darf baulich nicht in
   * einem <button> stehen. Das ist der EINZIGE verbliebene Element-Wechsel,
   * und er ist jetzt folgenlos: Klasse, Stil und Inhalt sind in beiden
   * Zustaenden dieselben, die Geometrie kommt aus dem Stapel darin.
   */
  const huellenProps = {
    className: eigenesKleid ? className : 'YoutubeTimestamp',
    /*
     * DIE ZWEI EIGENSCHAFTEN, DIE DIE HUELLE IMMER BRAUCHT.
     *
     * Ein <button> ist von Haus aus `inline-block` und schrumpft auf seinen
     * Inhalt. Der Stapel darin hat `width: 100%` -- das ergibt in einem
     * schrumpfenden Elternteil eine Breite von NULL, und die Kachel
     * verschwindet. Gemessen beim Bau am 2026-09-11 auf
     * /pages/schlaf-zellen-schutz-v2-18ef: "Kasten hat keine messbare Größe".
     *
     * Es steht hier und nicht im Seiten-CSS, weil GENAU DAS der Fehler war,
     * den dieser Job aufloest: sechs der acht Scopes deklarieren
     * `display: block; width: 100%` selbst, zwei (.v2-yt, .v3-yt) haben
     * überhaupt keine Regel. Die sechs bekommen hier BYTEGLEICH, was sie
     * ohnehin sagen -- nachgemessen, nicht vermutet; für die zwei ist es der
     * Unterschied zwischen Kachel und Nichts. Alles Weitere (Radius, Schatten,
     * Farbe, Filter) bleibt beim Seiten-CSS.
     */
    'data-section': dataSection || undefined,
    'data-video': objekt || undefined,
    'data-video-familie': 'youtube',
    'data-qb-video-zustand': laueft ? (zeigt ? 'spielt' : 'wartet') : 'vorschau',
    style: eigenesKleid
      ? {display: 'block', width: '100%'}
      : FRAME_STYLE,
  };

  if (laueft) {
    return <div {...huellenProps}>{stapel}</div>;
  }

  const knopf = (
    <button type="button" {...huellenProps} onClick={() => setLaueft(true)} {...absichtsSignale}
      aria-label={`Video abspielen: ${titel}`}
    >
      {stapel}
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
  const escape = (wert) =>
    String(wert || '').replace(/[<>&"]/g, (c) =>
      ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c]),
    );
  const titelText = escape(titel);
  // Derselbe Alternativtext wie am Knopf-Poster. Ginge er hier verloren, haette
  // die Seite OHNE Skript wieder ein Bild ohne Beschreibung — und genau diese
  // Fassung ist die, die ein Crawler ohne JavaScript sieht.
  const posterAltText = escape(posterAlt);

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
            `<img src="${posterUrl}" alt="${posterAltText}" width="480" height="360" ` +
            `style="width:100%;height:100%;object-fit:cover" /></a>`,
        }}
      />
    </span>
  );
}
