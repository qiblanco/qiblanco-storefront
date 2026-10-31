/*
 * SCROLLSTOPPER AM FILM (Qi Alpha A, Diamant-Video „The One Eye“).
 * Christian 30.10.2026 (Job 20261030-update-qi-alpha-seite-scrollstopper-
 * video-schwarzraum-kuerzen-r2), wörtlich:
 *  Z1: „man neigt dazu, das zu überscrollen“
 *  Z4: „wenn das Video dann richtig so zentrisch, mittisch platziert ist …
 *       dass kurz dann ein Stopper ist … man scrollt und dann geht es einfach
 *       nicht weiter. Und dann läuft das Video und dann erst nach 3 Sekunden,
 *       wenn das Video 3 Sekunden abgelaufen ist, dann kann man erst weiter
 *       scrollen“
 *  Z5: „das ist nur beim ersten Mal … wenn das Video dann ein zweites Mal
 *       läuft, dann nicht mehr“
 *  Z7: „das Video soll nicht früher starten. Das passt schon, wie es
 *       gestartet ist.“
 *
 * WARUM MAN DRÜBERWISCHT (gemessen 30.10., Bildhelligkeit des Videos):
 * die ersten 1,5 s sind fast schwarz (mittlere Helligkeit 1–12 von 255),
 * hell ist es erst ab ~3 s. Wer weiterwischt, sieht nur Schwarz.
 *
 * WAS DER STOPPER TUT:
 *  - Er greift erst, wenn das Video LÄUFT und seine Mitte höchstens bei
 *    MITTE_MAX der Bildhöhe steht. Der Start des Videos bleibt, wie er war
 *    (TheAlphaTon.jsx binde_videos, hier nicht angefasst). Läuft es nicht
 *    (iOS-Stromsparmodus ohne Tipp), wird nichts gehalten.
 *  - Gehalten wird an der Stelle, an der man gerade ist, kein Sprung. Nur
 *    wenn ein schneller Wisch die Mitte schon über MITTE_MIN hinaus getragen
 *    hat, gleitet die Seite sanft zurück, bis die Mitte bei MITTE_ZURUECK
 *    steht.
 *  - Gesperrt ist nur VORWÄRTS (Mausrad nach unten, Finger nach oben,
 *    Bild-ab/Leertaste/Pfeil-ab/Ende). Zurück geht immer.
 *  - Frei, sobald das Video SEKUNDEN Laufzeit hinter sich hat (gezählt wird
 *    abgespielte Videozeit, nicht die Wanduhr). Notausgänge: läuft das Video
 *    STILL_MS lang nicht weiter, obwohl es spielen sollte, oder ist DECKEL_MS
 *    Wanduhr um, wird ebenfalls freigegeben. Gehalten wird nie ohne Video.
 *  - Einmal je Video und Besuch (sessionStorage). Auch zurück und wieder
 *    hin in derselben Sitzung hält nichts mehr.
 *  - Ohne Bewegung (prefers-reduced-motion, ?film=still) kein Stopper.
 * Der Stand steht für Prüfer an der Figur: data-tap-stopper-stand =
 * wartet | hält | frei.
 */

export const STOPPER_SEKUNDEN = 3;
export const MITTE_MAX = 0.55;
export const MITTE_MIN = 0.3;
export const MITTE_ZURUECK = 0.42;
export const STILL_MS = 2000;
export const DECKEL_MS = 8000;
const SPEICHER = 'tap-stopper:';
const TASTEN_VOR = new Set(['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar']);

/** Soll jetzt gehalten werden? `mitte` = Mitte des Videos über der
 * Oberkante des Bildes (px), `hoehe` = Videohöhe. */
export function sollHalten({mitte, hoehe, bild, spielt, verbraucht}) {
  if (verbraucht || !spielt || !(bild > 0)) return false;
  // Ein Video, das schon fast ganz oben aus dem Bild ist, wird nicht mehr
  // zurückgeholt (Sprung an eine Stelle, die man längst verlassen hat).
  if (mitte + hoehe / 2 < bild * 0.25) return false;
  return mitte <= bild * MITTE_MAX;
}

/** Wohin die Seite beim Halten steht: wo sie ist, oder (nach einem
 * schnellen Wisch über MITTE_MIN hinaus) zurück auf MITTE_ZURUECK. */
export function haltePunkt({y, mitte, bild}) {
  if (mitte >= bild * MITTE_MIN) return Math.round(y);
  return Math.max(0, Math.round(y - (bild * MITTE_ZURUECK - mitte)));
}

/** Abgespielte Videozeit fortschreiben: nur kleine Vorwärtsschritte zählen
 * (ein Sprung zurück ist die Schleife, ein großer Sprung ein Suchen). */
export function weiterGezaehlt(gespielt, vorher, jetzt) {
  const d = jetzt - vorher;
  return d > 0 && d < 1 ? gespielt + d : gespielt;
}

/** Ist dieses Ereignis ein Schritt nach unten? */
export function istVorwaerts(e, touchY0 = null) {
  if (e.type === 'wheel') return e.deltaY > 0;
  if (e.type === 'touchmove') {
    const t = e.touches && e.touches[0];
    return Boolean(t) && touchY0 !== null && touchY0 - t.clientY > 0;
  }
  if (e.type === 'keydown') {
    if (e.key === ' ' && e.shiftKey) return false;
    const ziel = e.target;
    if (ziel && (ziel.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName || ''))) {
      return false;
    }
    return TASTEN_VOR.has(e.key);
  }
  return false;
}

function speicherSchluessel(video) {
  const quelle = video.querySelector('source[type="video/mp4"]')?.getAttribute('src') || video.currentSrc || '';
  return SPEICHER + (quelle.split('/').pop() || 'film');
}

function liesSpeicher(f, k) {
  try {
    return f.sessionStorage.getItem(k) === '1';
  } catch {
    return false;
  }
}

function merkeSpeicher(f, k) {
  try {
    f.sessionStorage.setItem(k, '1');
  } catch {
    // privates Fenster ohne Speicher: dann gilt es nur bis zum Neuladen
  }
}

/** Bindet den Stopper an eine Film-Figur. Gibt die Aufräum-Funktion zurück. */
export function tapStopper(figur, video, f = window) {
  if (!figur || !video) return () => {};
  const still =
    f.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(f.location.search).get('film') === 'still';
  if (still) return () => {};
  const d = f.document;
  const schluessel = speicherSchluessel(video);
  let stand = liesSpeicher(f, schluessel) ? 'frei' : 'wartet';
  figur.dataset.tapStopperStand = stand;
  if (stand === 'frei') return () => {};

  let haltY = 0;
  let gespielt = 0;
  let letzteZeit = 0;
  let seitFortschritt = 0;
  let beginn = 0;
  let takt = 0;
  let touchY0 = null;
  const html = d.documentElement;

  const lage = () => {
    const r = video.getBoundingClientRect();
    return {mitte: (r.top + r.bottom) / 2, hoehe: r.height, bild: f.innerHeight};
  };
  const spielt = () => !video.paused && !video.ended && video.readyState >= 2;

  const sperre = (e) => {
    if (stand !== 'hält') return;
    if (e.type === 'touchstart') {
      touchY0 = e.touches?.[0]?.clientY ?? null;
      return;
    }
    if (istVorwaerts(e, touchY0) && e.cancelable) e.preventDefault();
  };
  // Was trotzdem nach unten durchrutscht (Schwung nach dem Loslassen,
  // Bildlaufleiste, ein nicht abbrechbarer Touch): zurück auf die
  // Halte-Stelle. Nur gegen eine Bewegung nach unten, das sanfte Zurück-
  // gleiten (haltePunkt) läuft ungestört.
  let vorigY = 0;
  const klemme = () => {
    const y = f.scrollY;
    if (stand === 'hält' && y > haltY + 1 && y > vorigY) f.scrollTo(0, haltY);
    vorigY = Math.min(y, f.scrollY);
  };

  const loesen = () => {
    if (stand !== 'hält') return;
    stand = 'frei';
    figur.dataset.tapStopperStand = stand;
    merkeSpeicher(f, schluessel);
    f.cancelAnimationFrame(takt);
    abbauen();
  };

  const zählen = (jetzt) => {
    if (stand !== 'hält') return;
    const t = video.currentTime;
    const neu = weiterGezaehlt(gespielt, letzteZeit, t);
    if (neu > gespielt) seitFortschritt = jetzt;
    gespielt = neu;
    letzteZeit = t;
    figur.dataset.tapStopperGespielt = gespielt.toFixed(2);
    // Ein pausiertes Video (man ist zurückgescrollt) zählt nicht als Hänger.
    if (video.paused) seitFortschritt = jetzt;
    if (
      gespielt >= STOPPER_SEKUNDEN ||
      jetzt - seitFortschritt > STILL_MS ||
      jetzt - beginn > DECKEL_MS
    ) {
      loesen();
      return;
    }
    takt = f.requestAnimationFrame(zählen);
  };

  const halten = () => {
    const l = lage();
    stand = 'hält';
    figur.dataset.tapStopperStand = stand;
    haltY = haltePunkt({y: f.scrollY, ...l});
    gespielt = 0;
    letzteZeit = video.currentTime;
    beginn = f.performance.now();
    seitFortschritt = beginn;
    vorigY = f.scrollY;
    // Laufenden Schwung anhalten (nur Touch, iOS/Android): einen Augenblick
    // kein Überlauf, dann wieder frei für den Weg zurück. Am Desktop nicht,
    // dort fiele die Bildlaufleiste kurz weg und die Seite zuckte.
    if (f.matchMedia?.('(pointer: coarse)').matches) {
      const vorher = html.style.overflow;
      html.style.overflow = 'hidden';
      f.setTimeout(() => {
        html.style.overflow = vorher;
      }, 120);
    }
    if (f.scrollY > haltY + 1) {
      const weit = f.scrollY - haltY > 80;
      f.scrollTo({top: haltY, behavior: weit ? 'smooth' : 'auto'});
    }
    takt = f.requestAnimationFrame(zählen);
  };

  const pruefe = () => {
    if (stand !== 'wartet') return;
    const l = lage();
    if (sollHalten({...l, spielt: spielt(), verbraucht: false})) halten();
  };

  const ereignisse = [
    [f, 'wheel', sperre, {passive: false, capture: true}],
    [f, 'touchstart', sperre, {passive: true, capture: true}],
    [f, 'touchmove', sperre, {passive: false, capture: true}],
    [f, 'keydown', sperre, {capture: true}],
    [f, 'scroll', klemme, {passive: true}],
    [f, 'scroll', pruefe, {passive: true}],
    [video, 'playing', pruefe, undefined],
    [video, 'timeupdate', pruefe, undefined],
  ];
  ereignisse.forEach(([z, t, h, o]) => z.addEventListener(t, h, o));
  function abbauen() {
    ereignisse.forEach(([z, t, h, o]) => z.removeEventListener(t, h, o));
  }
  return () => {
    f.cancelAnimationFrame(takt);
    abbauen();
  };
}
