import {useEffect, useRef, useState} from 'react';
import {StarRating} from '~/components/reusables/StarRating';
import {useGoogleRating, useGoogleReviews, bildThumbUrl} from '~/lib/googleRating';
import {zufriedenheitJsonLdString} from '~/lib/zufriedenheit-schema';
import {useDragSwipe} from '~/components/reusables/useDragSwipe';

/**
 * ReputonWidget — Google-Rezensions-Carousel + Gesamtbewertungs-Badge.
 *
 * Seit 2026-07-31 (Repair-Job „gecachte Bewertungszahl veraltet"): rendert
 * die NEUESTEN 5-Sterne-Google-Rezensionen aus dem server-gecachten
 * root-Loader (useGoogleReviews, Reputon-Feed, 6-h-Refresh) statt des
 * Reputon-Drittscripts.
 *
 * Repair 2026-08-01 (Christian, vier Regressionen nach dem Update):
 *  (1) Die KI-/AI-Zusammenfassung von Google (business.summary aus dem Feed)
 *      steht wieder ganz oben — als erstes Element im Widget.
 *  (2) Das Carousel ist wieder mit der Maus greif- und ziehbar (Klick-Halten-
 *      Ziehen) und auf Touch nativ wischbar — via gemeinsamem useDragSwipe-
 *      Hook (Baustandard GL-DES-0012, mode 'scroll').
 *  (3) Unter jeder Rezension klappt „weiterlesen" den vollständigen Text
 *      INLINE im Widget auf (statt des externen „Auf Google lesen"-Links);
 *      alle Bewertungen bleiben zusätzlich über das Profil (Badge) erreichbar.
 *  (4) Der Badge-/Profil-Link öffnet Google nach HÖCHSTER Bewertung sortiert
 *      (sortby=ratingHigh in googleRating.js / StarRating.js).
 *
 * Der RAHMEN bleibt (Christian): nur 5-Sterne-Rezensionen im Carousel,
 * alle Bewertungen per Klick über das vollständige Google-Profil (Badge).
 * Komponentenname + Call-Sites (16 Seiten) bleiben unverändert.
 */
export function ReputonWidget() {
  const {reviews, aiSummary} = useGoogleReviews();
  return (
    <>
      <ReviewsSlider
        reviews={reviews}
        aiSummary={aiSummary}
        label="Neueste Google-Rezensionen von Qi Blanco"
      />
      <GoogleRatingBadge />
    </>
  );
}

/**
 * relativeVonDatum — rendert eine ISO-Datumsangabe (kuratierte Karten) LIVE
 * als deutsche Relativzeit („vor 3 Monaten"), self-updating (nie eingefroren).
 */
function relativeVonDatum(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const tage = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (tage < 7) return tage <= 1 ? 'vor 1 Tag' : `vor ${tage} Tagen`;
  if (tage < 30) {
    const w = Math.round(tage / 7);
    return w <= 1 ? 'vor 1 Woche' : `vor ${w} Wochen`;
  }
  if (tage < 365) {
    const m = Math.max(1, Math.round(tage / 30));
    return m === 1 ? 'vor 1 Monat' : `vor ${m} Monaten`;
  }
  const j = Math.max(1, Math.floor(tage / 365));
  return j === 1 ? 'vor 1 Jahr' : `vor ${j} Jahren`;
}

const AUTOSCROLL_MS = 4000; // Takt pro Karte (Christian: 3–4 s; ruhiger 4 s,
// gibt Lesezeit — WCAG: >5 s bewegte Inhalte brauchen Pause, hier zusätzlich
// Pause bei Hover/Drag)
const START_VERZOEGERUNG_MS = 3000; // erst 3 s nach Sichtbarkeit loslaufen,
// damit die AI-Zusammenfassung (erste Karte) in Ruhe gelesen werden kann
const SICHTBAR_SCHWELLE = 0.4; // Widget gilt ab 40 % im Viewport als „angekommen"
const KARTEN_LUECKE_PX = 20;
const CLAMP_ZEILEN = 6; // eingeklappte Höhe (wie zuvor)
// Kundenfotos je Karte: mehr als 3 Thumbnails sprengen die Kartenbreite
// (3 × 56 px + 2 × 8 px Lücke = 184 px), der Rest wird als „+n" gezählt.
const MAX_BILDER = 3;

// Responsive-Repair 2026-08-04 (Job bl-20260804T022554Z-a0de0e, Christian:
// „beim Lesen springt die Bewertung weg" — MOBIL).
// Die bisherige Pause hing allein an hoverRef (onPointerEnter/Leave) und
// dragRef (isDragging aus useDragSwipe). BEIDE sind auf Touch baulich
// wirkungslos:
//   • useDragSwipe.js:145 steigt im mode 'scroll' für jeden pointerType
//     außer 'mouse' sofort aus (Touch scrollt nativ) -> isDragging bleibt
//     auf dem Handy IMMER false.
//   • pointerleave feuert auf Touch bereits beim Finger-Heben -> hoverRef
//     ist Sekundenbruchteile nach dem Wisch wieder false.
// Gemessen (vorher_live.json): Autoscroll läuft nach echter Touch-Geste
// weiter @360/390/414/768, nur @1440 (Maus) stand er still.
// Deshalb zusätzlich ein geräte-unabhängiger Interaktions-Riegel
// (`uebernommen`): jede echte Nutzer-Geste legt ihn um, und der Takt ruht,
// solange er liegt.
//
// WIEDERANLAUF (Christian 2026-09-21, Job 20260921-google-bewertungen-
// autolauf-und-sichtbarer-wischhinweis): „Er hält an, sobald der Besucher
// eingreift — beim Berühren, beim Ziehen, beim Tastaturfokus. Und er läuft
// danach wieder an, nicht sofort, sondern nach einem Moment Ruhe."
// Bis dahin löste sich der Riegel NUR, wenn der Slider den Viewport verließ —
// das war die Antwort auf „springt beim Lesen weg", und sie hat den Autolauf
// in der Praxis abgeschafft: `wheel` zählte auch das senkrechte Seiten-
// Scrollen mit dem Mausrad über dem Karussell, `touchstart` den Finger, der
// nur die Seite schiebt. Christian sah deshalb auf keiner Seite einen
// Autolauf. Jetzt gilt: der Riegel fällt bei jeder echten Geste und löst sich
// WIEDERANLAUF_MS nach der LETZTEN Geste von selbst; der erste Schritt kommt
// dann einen Takt später (zusammen ~10 s Ruhe). Drei Rücksichten bleiben,
// damit „springt beim Lesen weg" nicht zurückkommt: (1) Maus über dem
// Karussell = keine Bewegung (hoverRef, wie bisher); (2) Tastaturfokus im
// Karussell = keine Bewegung, solange er drin ist; (3) eine per „weiterlesen"
// AUFGEKLAPPTE Karte ist der eine Lese-Beweis, den es gibt — solange eine
// offen ist, bewegt sich nichts. Senkrechtes Mausrad-Scrollen gilt nicht mehr
// als Geste am Karussell (nur waagerechtes: |deltaX| > |deltaY|).
// Ein programmatischer scrollTo({behavior:'smooth'}) löst selbst scroll-
// Events aus. Innerhalb dieses Fensters gelten sie NICHT als Nutzer-Geste,
// sonst würde der Autoscroll sich mit dem ersten Schritt selbst abschalten.
const PROGRAMMATISCH_FENSTER_MS = 1500;
const WIEDERANLAUF_MS = 6000; // Ruhe nach der letzten Geste, bevor der Takt neu ansetzt
// Fortschrittsbalken: der gefüllte Anteil ist (scrollLeft + Sichtbreite) /
// Gesamtbreite. Auf dem Handy sind das bei 38 Karten anfangs ~3 % — zu
// wenig, um als Position lesbar zu sein. Ein Boden hält die Marke sichtbar.
const FORTSCHRITT_MIN_PROZENT = 8;

/**
 * Fix (1): AI-Zusammenfassung von Google — die von Google mit KI aus den
 * Rezensionen destillierten Kernthemen (business.summary.items im Reputon-
 * Feed, server-gecacht). Wird — wie zuvor — als eigene „Bewertungs"-Karte
 * IM Carousel gerendert und als ERSTE Karte in den Track gesetzt (gleicher
 * Kartenstil wie die Rezensions-Karten). Fehlt sie im Feed, greift der
 * statische Fallback aus googleReviewsFallback.js.
 */
function AiSummaryKarte({aiSummary}) {
  if (!Array.isArray(aiSummary) || aiSummary.length === 0) return null;

  return (
    <div
      className="snap-start flex-shrink-0 w-[85vw] sm:w-[340px] p-4! bg-[#f3f6f9] rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
      style={{minHeight: 220}}
      aria-label="Mit KI zusammengefasste Google-Rezensionen von Qi Blanco"
    >
      {/* Kopfzeile im Karten-Stil: Titel links, Google-Logo rechts */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SparkleIcon />
          <span className="text-sm font-medium text-gray-700 truncate">
            Zusammenfassung von Google
          </span>
        </div>
        <GoogleIcon />
      </div>
      <ul className="flex flex-col gap-1.5 m-0! p-0! list-none">
        {aiSummary.map((thema) => (
          <li
            key={thema}
            className="flex items-start gap-2 text-sm! text-gray-700 leading-relaxed"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4285f4] flex-shrink-0"
            />
            <span>{thema}</span>
          </li>
        ))}
      </ul>
      <span className="text-xs text-gray-400 mt-auto">Mit KI zusammengefasst</span>
    </div>
  );
}

/**
 * ReviewsSlider — der EINE geteilte Rezensions-Slider (Design + Verhalten).
 * Wird von BEIDEN Widgets genutzt: dem oberen „Beeindruckende Kundenerfahrungen"
 * (12 kuratierte Karten, ohne AI-Summary) und dem unteren „Alle Google
 * Bewertungen" (Live-Feed + AI-Summary als erste Karte). Gleiches Kartendesign,
 * gleiches Drag-/Autoscroll-/„weiterlesen"-Verhalten — kein zweites Layout.
 *
 * SICHTBARER WISCHHINWEIS (Christian 2026-09-21: „in der responsiven Ansicht,
 * dass man klar erkennen kann, dass man die Bewertungen scrollen kann").
 * Gemessen am 21.09.2026 auf Start- und Schlafseite: snap-x, overflow-x,
 * cursor-grab und scrollbar-width:thin waren da — und NICHTS davon ist auf
 * dem Handy zu sehen: `thin` rendert dort in der Regel gar keine Leiste, und
 * einen Mauszeiger gibt es nicht. Man konnte wischen, aber nichts zeigte es.
 * Jetzt trägt der Slider unter der Kartenreihe dieselbe Bedienleiste wie der
 * InfoSlider (Bestand, app.css: .ProgressWrapper/.ProgressTracker und
 * .SliderButtonWrapper/.SliderButton) — Fortschrittsbalken als Position,
 * zwei Pfeile zum Antippen. Kein zweites Bedienmuster, dieselben Tokens
 * (--color-dark, Radius 1000px, 35-px-Knopf), dieselbe Pfeil-Grafik.
 *
 * DOM-REIHENFOLGE: die Leiste steht im Markup VOR der Kartenreihe und wird
 * per Flex-`order` darunter gezeigt. Grund: das Karussell trägt bis zu 38
 * Karten; eine Leiste dahinter läge im ausgelieferten HTML zehntausende
 * Zeichen hinter der Überschrift, und die Kundenrand-Probe (worker-pool/
 * pruefungen/probe_google_bewertungen_laufen_und_zeigen_sich__20260921.py)
 * liest den Block um die Überschrift. Tab-Reihenfolge: erst die Pfeile,
 * dann die Karten — für die Tastatur ist das die gewohnte Ordnung.
 *
 * `data-autolauf` auf der Kartenreihe nennt den Zustand des Takts —
 * bereit | aktiv | pause | aus — und ist zugleich der SSR-Marker, den die
 * Probe liest; im Browser wird er aus dem Takt heraus fortgeschrieben.
 * @param {{reviews:Array, aiSummary?:Array, label?:string}} props
 */
export function ReviewsSlider({reviews, aiSummary, label = 'Google-Rezensionen von Qi Blanco'}) {
  const trackRef = useRef(null);
  const hoverRef = useRef(false);
  const dragRef = useRef(false);
  const fortschrittRef = useRef(null);
  // Die Pfeile liegen AUSSERHALB der Kartenreihe; ihre Sprünge und die
  // Gesten-Buchung wohnen im Effekt unten. Der Ref reicht sie herüber.
  const steuerungRef = useRef(null);

  // Fix (2): Maus-Drag (Klick-Halten-Ziehen) + Touch-Swipe über den
  // gemeinsamen Slider-Hook. mode 'scroll' steuert genau so einen
  // overflow-x-Container: Maus setzt scrollLeft, Touch scrollt nativ.
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef});

  useEffect(() => {
    dragRef.current = isDragging;
  }, [isDragging]);

  // Sanfter Autoscroll: pro Karte (4 s) eine weiter, am Ende zurück zum
  // Anfang; pausiert bei Hover/Drag/Fokus/aufgeklappter Karte und respektiert
  // prefers-reduced-motion (dann gar kein Takt — Pfeile und Wischen bleiben).
  // NEU (Christian): NICHT sofort loslaufen — erst wenn das Widget wirklich
  // im Viewport sichtbar ist (IntersectionObserver) UND dann noch 3 s
  // warten, damit die AI-Zusammenfassung (erste Karte) in Ruhe gelesen
  // werden kann. Verlässt das Widget den Viewport vor Ablauf, wird der
  // Start-Timer zurückgesetzt (nur bei echtem „Ankommen" starten).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const reduziert =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setzeZustand = (z) => {
      track.dataset.autolauf = z;
    };

    let gestartet = false;
    let startTimer = 0;
    let intervall = 0;
    let ruheTimer = 0;
    let uebernommen = false; // Nutzer hat die Steuerung uebernommen
    let fokusImTrack = false;
    let sichtbar = false;
    let programmatischBis = 0;
    let anzeigeFrame = 0;

    // Fortschrittsbalken direkt am DOM fortschreiben — ein React-State je
    // scroll-Event würde bis zu 38 Karten bei jedem Bildschirmbild neu rendern.
    const aktualisiereAnzeige = () => {
      anzeigeFrame = 0;
      const balken = fortschrittRef.current;
      if (!balken) return;
      const gesamt = track.scrollWidth || 1;
      const anteil = ((track.scrollLeft + track.clientWidth) / gesamt) * 100;
      balken.style.width = `${Math.min(100, Math.max(FORTSCHRITT_MIN_PROZENT, anteil))}%`;
    };
    const planeAnzeige = () => {
      if (!anzeigeFrame) anzeigeFrame = window.requestAnimationFrame(aktualisiereAnzeige);
    };

    const schrittweite = () => {
      const karte = track.firstElementChild;
      return karte ? karte.getBoundingClientRect().width + KARTEN_LUECKE_PX : 0;
    };
    const springe = (ziel) => {
      programmatischBis = Date.now() + PROGRAMMATISCH_FENSTER_MS;
      track.scrollTo({left: ziel, behavior: reduziert ? 'auto' : 'smooth'});
    };

    const stoppeTakt = () => {
      if (intervall) {
        window.clearInterval(intervall);
        intervall = 0;
      }
      if (startTimer) {
        window.clearTimeout(startTimer);
        startTimer = 0;
      }
      gestartet = false;
    };

    const einenSchritt = () => {
      if (hoverRef.current || dragRef.current || !track.isConnected) return;
      if (uebernommen || fokusImTrack) return; // Nutzer ist dran — nicht wegspringen
      // Eine aufgeklappte Karte ist der einzige Beweis, dass gerade gelesen wird.
      if (track.querySelector('[aria-expanded="true"]')) return;
      const schritt = schrittweite();
      if (!schritt) return;
      const amEnde =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      springe(amEnde ? 0 : track.scrollLeft + schritt);
    };

    const starteAutoscroll = () => {
      if (gestartet || reduziert) return;
      gestartet = true;
      setzeZustand('aktiv');
      intervall = window.setInterval(einenSchritt, AUTOSCROLL_MS);
    };

    // Wiederanlauf: WIEDERANLAUF_MS nach der LETZTEN Geste löst sich der
    // Riegel von selbst; jede weitere Geste setzt die Uhr zurück.
    const planeWiederanlauf = () => {
      if (ruheTimer) window.clearTimeout(ruheTimer);
      ruheTimer = window.setTimeout(() => {
        ruheTimer = 0;
        uebernommen = false;
        if (sichtbar && !fokusImTrack) starteAutoscroll();
        else if (!reduziert) setzeZustand('bereit');
      }, WIEDERANLAUF_MS);
    };

    const merkeInteraktion = () => {
      if (!uebernommen) {
        uebernommen = true;
        stoppeTakt();
        if (!reduziert) setzeZustand('pause');
      }
      planeWiederanlauf();
    };

    // Senkrechtes Scrollen der SEITE mit dem Mausrad über dem Karussell ist
    // keine Geste AM Karussell — nur die waagerechte Achse zählt.
    const onGeste = (event) => {
      if (event.type === 'wheel' && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      merkeInteraktion();
    };

    // Eigener Scroll-Zaehler: auf Touch ist das native Wischen die einzige
    // Spur der Nutzer-Geste (kein isDragging, kein bleibendes Hover).
    const onTrackScroll = () => {
      planeAnzeige();
      if (Date.now() < programmatischBis) return; // eigener smooth-Scroll
      merkeInteraktion();
    };

    // Tastaturfokus im Karussell (Tab auf „weiterlesen", ein Kundenfoto):
    // solange er drin ist, bewegt sich nichts; beim Verlassen läuft die Ruhe-Uhr.
    const onFocusIn = () => {
      fokusImTrack = true;
      merkeInteraktion();
    };
    const onFocusOut = (event) => {
      if (event.relatedTarget && track.contains(event.relatedTarget)) return;
      fokusImTrack = false;
      planeWiederanlauf();
    };

    // Passive Listener: sie duerfen das native Wischen/Ziehen NICHT
    // beeinflussen (Baustandard GL-DES-0012 drag+swipe bleibt unberuehrt).
    const gesten = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'dragstart', 'wheel', 'keydown'];
    for (const typ of gesten) {
      track.addEventListener(typ, onGeste, {passive: true});
    }
    track.addEventListener('scroll', onTrackScroll, {passive: true});
    track.addEventListener('focusin', onFocusIn);
    track.addEventListener('focusout', onFocusOut);
    window.addEventListener('resize', planeAnzeige);
    aktualisiereAnzeige();

    // Pfeile: ein Kartenschritt in die Richtung, an den Enden umlaufend —
    // und eine Geste wie jede andere (Takt aus, Ruhe-Uhr neu).
    steuerungRef.current = {
      next: () => {
        merkeInteraktion();
        const schritt = schrittweite();
        const amEnde = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
        springe(amEnde ? 0 : track.scrollLeft + schritt);
      },
      prev: () => {
        merkeInteraktion();
        const schritt = schrittweite();
        const amAnfang = track.scrollLeft <= 8;
        springe(amAnfang ? track.scrollWidth - track.clientWidth : track.scrollLeft - schritt);
      },
    };

    const loeseListenerAb = () => {
      for (const typ of gesten) track.removeEventListener(typ, onGeste);
      track.removeEventListener('scroll', onTrackScroll);
      track.removeEventListener('focusin', onFocusIn);
      track.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('resize', planeAnzeige);
      if (anzeigeFrame) window.cancelAnimationFrame(anzeigeFrame);
      if (ruheTimer) window.clearTimeout(ruheTimer);
      steuerungRef.current = null;
    };

    if (reduziert) {
      // „Weniger Bewegung" im Gerät: kein Takt. Pfeile, Wischen und
      // Fortschrittsbalken bleiben — die Bedienung ist keine Bewegung.
      setzeZustand('aus');
      return loeseListenerAb;
    }

    // Ohne IntersectionObserver (sehr alte Browser): konservativ sofort mit
    // der Lese-Verzögerung starten statt gar nicht.
    if (typeof IntersectionObserver === 'undefined') {
      sichtbar = true;
      startTimer = window.setTimeout(starteAutoscroll, START_VERZOEGERUNG_MS);
      return () => {
        loeseListenerAb();
        stoppeTakt();
      };
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        sichtbar = eintraege.some((e) => e.isIntersecting);
        if (sichtbar) {
          if (!uebernommen && !gestartet && !startTimer) {
            startTimer = window.setTimeout(() => {
              startTimer = 0;
              if (sichtbar && !uebernommen) starteAutoscroll();
            }, START_VERZOEGERUNG_MS);
          }
        } else {
          // Widget ist aus dem Blick: nichts läuft im Hintergrund weiter,
          // und beim nächsten „Ankommen" beginnt es wieder mit der
          // Lese-Verzögerung — ohne Rest einer alten Ruhe-Uhr.
          uebernommen = false;
          if (ruheTimer) {
            window.clearTimeout(ruheTimer);
            ruheTimer = 0;
          }
          stoppeTakt();
          setzeZustand('bereit');
        }
      },
      {threshold: SICHTBAR_SCHWELLE},
    );
    beobachter.observe(track);

    return () => {
      beobachter.disconnect();
      loeseListenerAb();
      stoppeTakt();
    };
  }, [reviews.length]);

  if (!reviews.length) return null;

  return (
    <div className="ReviewsSlider flex flex-col">
      {/* Bedienleiste — im DOM vor der Kartenreihe, sichtbar darunter (order).
          Klassen und Pfeil-Grafik sind die des InfoSlider (Bestand). */}
      <div className="ReviewsSlider__scroll-hinweis" style={{order: 2}}>
        <div className="ProgressWrapper" aria-hidden="true">
          <div
            ref={fortschrittRef}
            className="ProgressTracker"
            style={{width: `${FORTSCHRITT_MIN_PROZENT}%`}}
          />
        </div>
        <div className="SliderButtonWrapper">
          <button
            type="button"
            className="ButtonPrev SliderButton"
            aria-label="Vorherige Bewertung"
            onClick={() => steuerungRef.current?.prev()}
          >
            <PfeilIcon />
          </button>
          <button
            type="button"
            className="ButtonNext SliderButton"
            aria-label="Nächste Bewertung"
            onClick={() => steuerungRef.current?.next()}
          >
            <PfeilIcon />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        {...handlers}
        onPointerEnter={() => {
          hoverRef.current = true;
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
        }}
        className={`flex items-start overflow-x-auto pb-4 snap-x snap-mandatory select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{gap: KARTEN_LUECKE_PX, scrollbarWidth: 'thin', order: 1}}
        role="region"
        aria-label={label}
        data-autolauf="bereit"
      >
        <AiSummaryKarte aiSummary={aiSummary} />
        {reviews.map((review) => (
          <ReviewKarte key={review.id || review.name} review={review} />
        ))}
      </div>
    </div>
  );
}

/** Dieselbe Pfeil-Grafik wie im InfoSlider; die Richtung kommt aus
 *  .ButtonPrev/.ButtonNext (rotate ∓90°) in app.css. */
function PfeilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <path
        fill="currentColor"
        d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  );
}

function ReviewKarte({review}) {
  const [offen, setOffen] = useState(false);
  const [ueberlaeuft, setUeberlaeuft] = useState(false);
  // TOTE KUNDENFOTOS AUSBLENDEN statt sie kaputt zu zeigen.
  //
  // Gemessen 2026-09-05 (Repair-Job „ein Bild lädt nie fertig, Seite
  // unmessbar"): die von Google GEPOSTETEN Kundenfotos liegen als absolute
  // lh3.googleusercontent.com-URLs im Bestand — und Google gibt diese IDs neu
  // aus. Das Foto zur Rezension von Therin Moreland antwortete mit HTTP 403
  // (text/html + `x-content-type-options: nosniff`, also von Chrome per ORB
  // blockiert), während DASSELBE Foto im Live-Feed unter einer NEUEN ID mit
  // 200 auslieferte. Es ist also kein gelöschtes Foto, sondern eine rotierte
  // Adresse — die Klasse trifft jede fest hinterlegte Google-Bild-URL und
  // kommt wieder.
  //
  // WAS DER KUNDE OHNE DIESE ZEILE SIEHT: das <img> trägt width/height 56 und
  // `w-14 h-14`, aber ein fehlgeschlagenes Bild ignoriert beides — Chrome
  // rendert stattdessen den deutschen alt-Text als Inline-Kasten. Gemessen:
  // 379x26 px statt 56x56, der Satz „Kundenfoto zur Rezension von Therin Mo…"
  // läuft aus der Karte heraus. Genau im sozialen Beweis, wo Ruhe und
  // Glaubwürdigkeit die ganze Wirkung sind.
  //
  // KEIN PLATZHALTER, SONDERN WEG: ein Ersatzbild wäre eine Behauptung über
  // ein Foto, das es nicht gibt. Die Zeile entfällt ersatzlos — genau so, wie
  // sie bei den 34 von 37 Rezensionen ohne Foto ohnehin entfällt.
  //
  // DAS VERSTECKT KEINEN BEFUND: das Verrotten wird getrennt gemessen
  // (homepage-bauer/pruefungen/probe_rezensionsbilder_erreichbar.py, täglich)
  // — hier wird nur verhindert, dass der Kunde die Verrottung ausbaden muss.
  const [totesBild, setTotesBild] = useState({});
  const textRef = useRef(null);
  const text = review.text || '';
  // Defensiv: ältere/fremde Review-Quellen kennen `bilder` nicht — die Zeile
  // darf daran nicht scheitern (der Bestand liefert es überall mit).
  const bilder = Array.isArray(review.bilder) ? review.bilder : [];
  // Erst deckeln, DANN die toten aussortieren: die Reihenfolge hält den
  // „+N"-Zähler unten an der ungefilterten Menge — er zählt weiterhin die
  // Fotos, die es gibt, nicht die, die geladen haben.
  const sichtbareBilder = bilder
    .slice(0, MAX_BILDER)
    .filter((b) => !totesBild[b.url]);
  // Live-Feed-Karten liefern zeitText („vor 3 Tagen"); kuratierte Karten
  // liefern ein ISO-datum, das hier LIVE zur Relativzeit gerendert wird.
  const datum = review.zeitText || relativeVonDatum(review.datum);

  // „weiterlesen" nur zeigen, wenn der geklammerte Text WIRKLICH überläuft
  // (im eingeklappten Zustand gemessen — robust gegen Kartenbreite/Zeilenhöhe,
  // statt einer Zeichenschwelle, die auf schmalen Karten daneben liegt).
  useEffect(() => {
    const messen = () => {
      const el = textRef.current;
      if (!el || offen) return;
      setUeberlaeuft(el.scrollHeight > el.clientHeight + 4);
    };
    messen();
    window.addEventListener('resize', messen);
    return () => window.removeEventListener('resize', messen);
  }, [text, offen]);

  return (
    <div
      className="snap-start flex-shrink-0 w-[85vw] sm:w-[340px] p-4! bg-[#f3f6f9] rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
      style={{minHeight: 220}}
    >
      {/* Kopfzeile: Avatar + Name + Zeit, Google-Logo rechts */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {review.foto ? (
            <img
              src={review.foto}
              alt=""
              width="36"
              height="36"
              loading="lazy"
              referrerPolicy="no-referrer"
              draggable="false"
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-[#4285f4] flex items-center justify-center text-white font-medium text-sm">
              {(review.name || 'G').charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{review.name}</div>
            {datum ? (
              <div className="text-xs text-gray-500">{datum}</div>
            ) : null}
          </div>
        </div>
        <GoogleIcon />
      </div>

      {/* Sterne + Verifiziert-Haken.
          KLASSE D: die Sterne EINER Bewertungskarte sind rein darstellend.
          Am TRAEGER deklariert, NICHT über Container-Zugehoerigkeit — die
          Startseite trägt zwei Karussells und nur eines hat eine id; eine
          Herleitung „steht im Bewertungsbereich, also darstellend" würde die
          Karten des zweiten Karussells als Fehlstelle zählen. */}
      <div className="flex items-center gap-1.5">
        <StarRating value={review.rating} size={16} qb="d" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" aria-hidden="true">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </div>

      {/* Fix (3): Review-Text — eingeklappt geklammert, „weiterlesen" klappt
          den GANZEN Text inline auf (kein externer Google-Link mehr). */}
      <p
        ref={textRef}
        className="text-sm! text-gray-700 leading-relaxed whitespace-pre-line"
        style={
          offen
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: CLAMP_ZEILEN,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {text}
      </p>

      {/* Kundenfotos: die vom Kunden bei Google GEPOSTETEN Bilder (Feed-Feld
          `images` → `bilder`) — nicht der Avatar (`foto`) in der Kopfzeile.
          Nur 3 der 37 Rezensionen tragen welche; bei allen anderen entfällt
          die Zeile ersatzlos. Feste width/height + w-14/h-14 halten die
          Kartenhöhe stabil (kein Layout-Shift beim Nachladen). Der Klick auf
          ein Bild öffnet es groß in einem neuen Tab — nach einer echten
          Zieh-Geste fängt useDragSwipe (onClickCapture) ihn ab, es braucht
          also kein eigenes Popup und keinen eigenen Drag-Schutz. */}
      {sichtbareBilder.length ? (
        <div className="flex items-center gap-2">
          {sichtbareBilder.map((bild) => (
            <a
              key={bild.url}
              href={bild.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <img
                src={bildThumbUrl(bild.thumb)}
                alt={`Kundenfoto zur Rezension von ${review.name}`}
                width="56"
                height="56"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable="false"
                className="w-14 h-14 rounded-2xl object-cover"
                onError={() =>
                  setTotesBild((v) =>
                    v[bild.url] ? v : {...v, [bild.url]: true},
                  )
                }
              />
            </a>
          ))}
          {bilder.length > MAX_BILDER ? (
            <span className="text-xs text-gray-500">
              +{bilder.length - MAX_BILDER}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Google-Blau, aber AA-fest: #1a73e8 liegt als 12px-Text unter WCAG AA
          (4.28:1 auf #faf9f5, 4.15:1 auf der Karte #f3f6f9). #1565c0 ist
          derselbe Blauton eine Stufe dunkler -> 5.45:1 bzw. 5.30:1. */}
      {ueberlaeuft || offen ? (
        <button
          type="button"
          className="self-start text-xs font-medium text-[#1565c0] hover:underline mt-auto bg-transparent border-0 p-0! cursor-pointer"
          aria-expanded={offen}
          onClick={(event) => {
            event.stopPropagation();
            setOffen((v) => !v);
          }}
        >
          {offen ? 'weniger anzeigen' : 'weiterlesen'}
        </button>
      ) : null}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#4285f4"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zM19 14l.95 2.55L22.5 17.5l-2.55.95L19 21l-.95-2.55L15.5 17.5l2.55-.95L19 14z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GoogleRatingBadge() {
  const g = useGoogleRating();
  /*
   * DIE MASCHINENLESBARE HÄLFTE DESSELBEN SATZES (Job 20260912-GROSSJOB-
   * googles-ki-antwort-raet-vom-kauf-ab, Segment s04).
   *
   * Bis hierher stand die Zufriedenheit NUR sichtbar da: live gemessen trugen
   * die fünf DACH-Produktseiten vier ld+json-Bloecke und darin keine einzige
   * Bewertungsangabe, waehrend daneben „4,8 aus 440 Google-Rezensionen von Qi
   * Blanco" zu lesen war. Der Knoten daneben sagt einer Maschine dasselbe.
   *
   * WARUM GENAU HIER UND NIRGENDWO SONST — das ist der ganze Punkt der
   * Platzierung: der ausgezeichnete Wert MUSS dem angezeigten entsprechen,
   * sonst ist er ein Richtlinienverstoss. Hier entstehen beide aus derselben
   * Variablen `g`, es gibt also nur EINEN Wert und damit nichts, was
   * auseinanderlaufen könnte. Eine Emission über den meta-Export haette
   * denselben Wert ein zweites Mal beschaffen müssen — und genau dort wäre
   * die Naht.
   *
   * DER AUSSCHLUSS FOLGT AUS DER SICHTBARKEIT, NICHT AUS EINER LISTE: Seiten
   * ohne dieses Badge — die Kakao-Seiten etwa, deren 4,9 eine redaktionelle
   * Angabe ohne zaehlbare Grundlage ist — bekommen dadurch von selbst kein
   * Markup. Es gibt keine Handle-Liste, die veralten könnte.
   *
   * SUBJEKT UND GATTUNG: der Knoten ist eine `Organization`, nie ein
   * `Product`. Begründung ausfuehrlich im Kopf von
   * app/lib/zufriedenheit-schema.js — dort steht auch, was er ehrlicherweise
   * NICHT bringt (keine Sternchen im Suchergebnis, und das ist erwartet).
   */
  const zufriedenheitLd = zufriedenheitJsonLdString(g);
  /*
   * KLASSE G — die AUSNAHME vom Standard, und sie gilt nur als Paar mit ihm:
   * die GESAMTbewertung INNERHALB des Bewertungsbereichs verlinkt auf Google,
   * weil ein Sprung dorthin, wo man schon steht, sinnlos wäre. Erwartet wird
   * GENAU EINE solche Ansicht je Seite mit Bewertungsbereich — 0 ist ebenso
   * ein Fehler wie 2.
   *
   * DER MARKER GEHÖRT AN DAS <a>, NICHT AN DIE STARRATING DARIN: die
   * Enumeration zählt den AEUSSERSTEN Treffer, und `google-rating-badge`
   * steht selbst auf der Klassenliste. Gezaehlt wird also dieses <a>, und die
   * Klassenzuordnung läuft über closest() — ein nur innen gesetzter Marker
   * wäre von hier aus unerreichbar und die Ansicht fiele als Fehlstelle auf.
   */
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noopener noreferrer"
      className="google-rating-badge"
      data-qb-rating="g"
      aria-label={`${g.komma} von 5 Sternen aus ${g.total} Google-Rezensionen von Qi Blanco ansehen`}
    >
      {zufriedenheitLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: zufriedenheitLd}}
        />
      ) : null}
      <img
        className="google-rating-badge__logo"
        src="https://lh3.googleusercontent.com/a-/ALV-UjXLeredYrnnfrvaFQ0ffKGgx-Ardf6CLqWTy4t4Tt7pn50g4MI"
        alt="Qi Blanco"
        width="48"
        height="48"
      />
      <div className="google-rating-badge__content">
        <div className="google-rating-badge__score">
          <span className="google-rating-badge__number">{g.komma}</span>
          <span className="google-rating-badge__stars">
            <StarRating value={g.value} size={20} qb="g" />
          </span>
        </div>
        <div className="google-rating-badge__powered">
          {g.total} Bewertungen · <strong>Google</strong>
        </div>
      </div>
    </a>
  );
}
