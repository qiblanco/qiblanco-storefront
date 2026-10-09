import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Hls from 'hls.js';
import {
  aktiveVideos,
  produktName,
  videoMarke,
  BEDIENUNG,
  WIE_FUNKTIONIERT_LINK,
  WIE_FUNKTIONIERT_PFAD,
  WIE_FUNKTIONIERT_TEXT,
} from '~/data/produkt-videos';

/*
 * PRODUKT-VIDEOS IM VORSCHAUSTREIFEN DER GALERIE (Amazon-Muster).
 * Maßnahme „Produktseite, die verkauft“, Grossjob growth-m-lp-produktseite-
 * verkauft (Christian 26.09.2026, Leitplanke Folien 11 und 15). Daten und
 * jeder angezeigte Satz: app/data/produkt-videos.js.
 *
 * WARUM IM STREIFEN: die Galerie ist der eine Ort, den jeder Besucher sieht.
 * Die Kachel ERSETZT dort eine Bild-Kachel (ProductImageList zeigt dann drei
 * statt vier Bilder vor „+N“), der Streifen bleibt gleich hoch und die
 * Kaufbox rückt nicht (design-qa Q2-buybox-fold).
 *
 * WARUM KEIN `ImageSeeMore` AN DER KACHEL, obwohl sie genauso aussehen soll:
 * homepage-bauer/bin/probe_overlay_schliesskreuz.py klickt
 * `button.ImageSeeMore` und erwartet das Bilder-Popup. Eine zweite Trägerin
 * derselben Klasse VOR dem „+N“-Knopf würde diese Wache still auf unseren
 * Dialog umlenken. Die Maße stehen deshalb eigens in produkt-videos.css.
 *
 * DER DIALOG FOLGT DEM HAUSMUSTER DES BILDER-POPUPS (ProductImageList
 * ImageGalleryModal): Portal an <body> (der Streifen sitzt in einem
 * sticky-Kasten, der einen eigenen Stapelkontext öffnet), Ebene
 * var(--z-dialog), Scroll-Sperre, Escape. Solange er offen ist, wird das
 * Chat-Widget NICHT dargestellt (Leitsatz overlay_ordnung: nichts darf
 * sichtbar und zugleich nicht treffbar sein).
 *
 * ZWISCHENSTAND, BEWUSST SEITENLOKAL: der Hausweg dafür ist ein Eintrag in
 * components/DialogSignal.jsx DIALOG_SELEKTOREN. Diese Datei hängt an jeder
 * Seite; ihre Änderung verlangt Alle-Formate-Belege für 53 Seiten, von denen
 * sechs an vorbestehender Bildschuld blocken, die kein Beleg heilt (gemessen
 * 2026-09-26). Bis der Eintrag nachgezogen ist, setzt der Dialog selbst die
 * Klasse `qb-pv-offen` am <html>, und produkt-videos.css (nur auf den zwei
 * Kaufseiten geladen) blendet das Widget aus — dieselbe Wirkung, dieselbe
 * Regel wie app.css `html[data-dialog-offen] #qiblanco-salesbot-widget-frame`.
 * Der Folgeauftrag nimmt diese Klasse zurück, wenn der Eintrag steht.
 * Die Rand-Probe misst die Wirkung (Arm W), nicht den Mechanismus.
 *
 * Das Element ist ein
 * `<dialog open>` ohne showModal(): die Semantik (Rolle dialog) kommt vom
 * Element, die Schicht von der Hausleiter, und alte Browser ohne
 * Dialog-Unterstützung zeigen es trotzdem, weil die Lage aus dem CSS kommt.
 *
 * MESSUNG: jedes <video> trägt data-video="galerie:<id>" (videoMarke) — der
 * Pixel (qpx medObserve, MutationObserver) findet es im Dialog und bucht
 * video_start/video_quartil unter diesem Namen. Kein data-section: die
 * Kaufseiten sind bewusst anker-frei (Design-Rubrik-Collector).
 */

/** Ein Video: HLS über hls.js, Safari nativ, sonst mp4. */
function Spieler({video, autoStart}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let hls = null;
    if (video.hls && Hls.isSupported()) {
      hls = new Hls({capLevelToPlayerSize: true});
      hls.loadSource(video.hls);
      hls.attachMedia(el);
    } else if (video.hls && el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = video.hls;
    } else {
      el.src = video.mp4;
    }
    if (autoStart) {
      // Stumme Videos starten sofort (Autoplay-Policy erlaubt stumm). Ein
      // Video MIT Ton startet mit Ton, weil der Besucher es gerade selbst
      // gewählt hat; lehnt der Browser das ab, bleibt es stehen und die
      // eingebaute Steuerung startet es beim ersten Tippen.
      el.muted = !video.ton;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return () => {
      if (hls) hls.destroy();
      el.pause();
    };
  }, [video, autoStart]);

  return (
    // Keine <track>-Datei: die Zell- und Animationsfilme tragen keine Sprache
    // (ohne Tonspur), und der Schnitt mit Sprache (Daniela Cebula) trägt seine
    // Untertitel IM BILD — vom Testimonial-Gate gemessen in 99,75 % der
    // Sprech-Frames (Freigabe-Akte im Postausgang, 25.09.2026).
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      className={`qb-pv-video qb-pv-video--${video.format}`}
      data-qb-produktvideo=""
      data-video={videoMarke(video)}
      data-video-familie={video.familie || undefined}
      data-video-ton={video.ton ? 'hoerbar' : 'stumm'}
      // Quelle lesbar am Element (hls.js hängt eine blob:-Adresse an; die
      // Rand-Probe prüft damit Manifest und Rückfall, Arm Q).
      data-hls={video.hls || undefined}
      data-mp4={video.mp4}
      poster={video.poster}
      controls
      playsInline
      loop={video.schleife}
      muted={!video.ton}
      preload="auto"
    />
  );
}

function ProduktVideoDialog({handle, videos, produkt, onClose}) {
  const [aktiv, setAktiv] = useState(0);
  const dialogRef = useRef(null);
  const zuRef = useRef(null);
  const titelId = useId();

  // Scroll-Sperre wie das Bilder-Popup; der vorige Wert kommt zurück. Dazu
  // die Klasse, an der das Chat-Widget ausgeblendet wird (siehe Kopf).
  useEffect(() => {
    const vorher = document.body.style.overflow;
    const wurzel = document.documentElement;
    document.body.style.overflow = 'hidden';
    wurzel.classList.add('qb-pv-offen');
    return () => {
      document.body.style.overflow = vorher;
      wurzel.classList.remove('qb-pv-offen');
    };
  }, []);

  // Fokus in den Dialog, Escape schließt, Tab bleibt im Dialog.
  useEffect(() => {
    zuRef.current?.focus({preventScroll: true});
    function taste(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const ziele = [
        ...dialogRef.current.querySelectorAll('button, a[href], video[controls]'),
      ].filter((el) => !el.disabled && el.getClientRects().length > 0);
      if (!ziele.length) return;
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    }
    document.addEventListener('keydown', taste);
    return () => document.removeEventListener('keydown', taste);
  }, [onClose]);

  const video = videos[aktiv] || videos[0];
  const zeigeWieFunktioniert =
    WIE_FUNKTIONIERT_LINK && handle === 'qione-2-pro' && video.art === 'zellen';

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      open
      ref={dialogRef}
      className="qb-pv-overlay"
      data-qb-produktvideos={handle}
      aria-modal="true"
      aria-labelledby={titelId}
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="qb-pv-panel" onClick={(e) => e.stopPropagation()}>
        <div className="qb-pv-kopf">
          <h2 id={titelId} className="qb-pv-titel">
            {BEDIENUNG.dialogTitel(produkt)}
          </h2>
          <button
            ref={zuRef}
            type="button"
            className="qb-pv-zu"
            aria-label={BEDIENUNG.zumachen}
            data-qb-produktvideo-zu=""
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div className={`qb-pv-buehne qb-pv-buehne--${video.format}`}>
          <Spieler key={video.id} video={video} autoStart />
        </div>
        <div className="qb-pv-text">
          <h3 className="qb-pv-videotitel">{video.titel}</h3>
          {video.text ? <p>{video.text}</p> : null}
          {video.quelle || video.link ? (
            <p className="qb-pv-quelle">
              {video.quelle}
              {video.link ? (
                <>
                  {video.quelle ? ' ' : null}
                  <a href={video.link.href}>{video.link.text}</a>
                </>
              ) : null}
            </p>
          ) : null}
          {zeigeWieFunktioniert ? (
            <p className="qb-pv-weiter">
              <a href={WIE_FUNKTIONIERT_PFAD}>{WIE_FUNKTIONIERT_TEXT}</a>
            </p>
          ) : null}
        </div>
        {videos.length > 1 ? (
          <div className="qb-pv-auswahl" role="group" aria-label={BEDIENUNG.auswahl}>
            {videos.map((v, i) => (
              <button
                key={v.id}
                type="button"
                className={`qb-pv-wahl${i === aktiv ? ' is-aktiv' : ''}`}
                aria-pressed={i === aktiv}
                data-qb-produktvideo-wahl={videoMarke(v)}
                onClick={() => setAktiv(i)}
              >
                <img src={v.vorschau} alt="" loading="lazy" width="240" height="240" />
                <span>{v.titel}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </dialog>,
    document.body,
  );
}

/**
 * Die Video-Kachel für den Vorschaustreifen. Ohne aktive Videos für den
 * Handle rendert sie NICHTS — dann bleibt der Streifen, wie er war
 * (ProductImageList zeigt vier Bilder, wenn keine Kachel kommt).
 *
 * @param {{handle: string}} props
 */
export function ProduktVideoKachel({handle}) {
  const videos = aktiveVideos(handle);
  const [offen, setOffen] = useState(false);
  const knopfRef = useRef(null);

  const zumachen = useCallback(() => {
    setOffen(false);
    // Fokus zurück an den Auslöser (WCAG 2.4.3 Fokus-Reihenfolge).
    window.requestAnimationFrame(() => knopfRef.current?.focus({preventScroll: true}));
  }, []);

  if (!videos.length) return null;
  const produkt = produktName(handle);

  return (
    <>
      <button
        ref={knopfRef}
        type="button"
        className="qb-pv-kachel"
        data-qb-produktvideo-kachel={handle}
        aria-haspopup="dialog"
        aria-label={BEDIENUNG.kachelLabel(produkt, videos.length)}
        onClick={() => setOffen(true)}
      >
        <img src={videos[0].vorschau} alt="" role="presentation" loading="lazy" width="240" height="240" />
        <span className="qb-pv-kachel__schleier" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path fill="currentColor" d="M10 8.2v7.6L16 12z" />
          </svg>
          <span>{BEDIENUNG.kachel(videos.length)}</span>
        </span>
      </button>
      {offen ? (
        <ProduktVideoDialog
          handle={handle}
          videos={videos}
          produkt={produkt}
          onClose={zumachen}
        />
      ) : null}
    </>
  );
}
