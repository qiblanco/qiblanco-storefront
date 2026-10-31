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
 *    Bild-ab/Leertaste/Pfeil-ab/Ende) und nur an der Halte-Stelle. Zurück
 *    geht immer, und von dort wieder vor bis zur Halte-Stelle.
 *  - Frei, sobald das Video SEKUNDEN Laufzeit hinter sich hat (gezählt wird
 *    abgespielte Videozeit, nicht die Wanduhr). Notausgänge: läuft das Video
 *    STILL_MS lang nicht weiter, obwohl es spielen sollte, oder ist DECKEL_MS
 *    Wanduhr um, wird ebenfalls freigegeben. Gehalten wird nie ohne Video.
 *  - Einmal je Video und Besuch (sessionStorage). Auch zurück und wieder
 *    hin in derselben Sitzung hält nichts mehr.
 *  - Ohne Bewegung (prefers-reduced-motion, ?film=still) kein Stopper.
 * NICHT ÜBERSPRINGBAR (Christian 31.10.2026: „im video sieht man, dass man
 * das video sehr einfach übersprigen kann“; Job 20261031-prio2-qi-alpha-lp-
 * ueberlappung-beheben-scrollstopper-robust). Gemessen live: am Desktop stand
 * das Video nur 8 px Scrollweg allein im Bild, und gehalten wurde nur, wenn
 * es in genau diesem Moment schon lief. In der Szenen-Kette trägt die Figur
 * jetzt ihr FENSTER (figur.tapFenster aus useTapFilm, Scroll-Pixel): von =
 * die Bühne davor weicht, bis = die Bühne danach steht. Erreicht oder
 * überquert der erste Durchlauf das Fenster von oben, hält die Seite darin,
 * nach der Lage, nicht nach der Zeit:
 *  - Mausrad, Trackpad und Tasten, die über den Anfang des Fensters gingen,
 *    werden abgefangen und enden im Fenster (kein Bild dahinter blitzt auf).
 *  - Was trotzdem darüber hinausschießt (Daumen-Schwung, Bildlaufleiste,
 *    Sprung), springt sofort zurück in die Mitte des Fensters.
 *  - Gehalten wird auch, wenn das Video gerade erst lädt; es startet wie
 *    immer, sobald es erscheint (TheAlphaTon.jsx, hier nicht angefasst).
 *    Startet es nicht (Browser lehnt ab: ABGELEHNT_MS, lädt zu lange:
 *    START_MS), wird freigegeben.
 * Ohne Fenster (Fassung ohne Kette) gilt die Mitte-Regel wie bisher.
 * Der Stand steht für Prüfer an der Figur: data-tap-stopper-stand =
 * wartet | hält | frei, und warum frei: data-tap-stopper-grund =
 * video (3 s gelaufen) | stockt (Video kommt nicht weiter) | deckel.
 */

export const STOPPER_SEKUNDEN = 3;
export const MITTE_MAX = 0.55;
export const MITTE_MIN = 0.3;
export const MITTE_ZURUECK = 0.42;
export const STILL_MS = 2000;
// Gehalten, aber das Video läuft noch nicht: so lange darf es laden bzw.
// (vom Browser abgelehnt, etwa iOS-Stromsparmodus) auf einen Tipp warten.
export const START_MS = 4000;
export const ABGELEHNT_MS = 1200;
export const DECKEL_MS = 10000;
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

/** Szenen-Kette: wo die Seite hält, wenn der erste Durchlauf das Fenster
 * [von, bis] des Videos erreicht. `vorher` = kleinste Lage dieses Durchlaufs
 * (nur wer von oben kommt, wird gehalten; nach einem Neuladen weiter unten
 * nicht). Im Fenster: wo man ist, höchstens bis zur Mitte; darüber hinaus:
 * zurück in die Mitte. null = nicht halten. */
export function fensterHalt({y, von, bis, vorher}) {
  if (!(bis > von) || vorher === null || !(vorher < von) || y < von) return null;
  const mitte = Math.round((von + bis) / 2);
  return Math.min(Math.round(y), mitte);
}

/** Wie weit trägt ein Rad- oder Tastenschritt die Seite nach unten (px)? */
export function schrittWeite(e, bild) {
  if (e.type === 'wheel') return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? bild : 1);
  if (e.type === 'keydown') {
    if (e.key === 'End') return Infinity;
    if (e.key === 'ArrowDown') return 40;
    return bild * 0.9;
  }
  return 0;
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
  let vorigJetzt = 0;
  let amHaltMs = 0;
  let takt = 0;
  let touchY0 = null;
  // Kleinste Lage dieses Durchlaufs (fensterHalt: nur wer von oben kommt).
  let vorher = f.scrollY;
  const html = d.documentElement;
  const grob = () => Boolean(f.matchMedia?.('(pointer: coarse)').matches);

  const lage = () => {
    const r = video.getBoundingClientRect();
    return {mitte: (r.top + r.bottom) / 2, hoehe: r.height, bild: f.innerHeight};
  };
  const fenster = () => (typeof figur.tapFenster === 'function' ? figur.tapFenster() : null);
  const spielt = () => !video.paused && !video.ended && video.readyState >= 2;
  // Zu sehen (nicht wartend hinter der Szene davor, schon eingeblendet).
  const gezeigt = () =>
    !figur.classList.contains('tap-wartet') &&
    (!figur.hasAttribute('data-tap-ein') || figur.classList.contains('tap-sichtbar'));

  // Laufenden Schwung anhalten (nur Touch, iOS/Android): einen Augenblick
  // kein Überlauf, dann wieder frei für den Weg zurück. Am Desktop nicht,
  // dort fiele die Bildlaufleiste kurz weg und die Seite zuckte.
  let schwungAus = 0;
  const schwungStopp = () => {
    if (!grob() || schwungAus) return;
    const vor = html.style.overflow;
    html.style.overflow = 'hidden';
    schwungAus = f.setTimeout(() => {
      html.style.overflow = vor;
      schwungAus = 0;
    }, 120);
  };

  const sperre = (e) => {
    if (e.type === 'touchstart') {
      touchY0 = e.touches?.[0]?.clientY ?? null;
      return;
    }
    if (stand === 'wartet') {
      // Rad, Trackpad, Tasten: ein Schritt über den Anfang des Fensters
      // endet im Fenster, statt dahinter.
      if (e.type === 'touchmove' || !istVorwaerts(e, touchY0) || !e.cancelable) return;
      const fe = fenster();
      const y = f.scrollY;
      if (!fe || y >= fe.von || y + schrittWeite(e, f.innerHeight) < fe.von) return;
      e.preventDefault();
      halten(fe.von);
      return;
    }
    if (stand !== 'hält') return;
    // Vorwärts gesperrt nur AN der Halte-Stelle; wer zurück ist, darf bis
    // zu ihr wieder vor (darüber hinaus fängt klemme ab).
    if (!istVorwaerts(e, touchY0) || !e.cancelable) return;
    const y = f.scrollY;
    if (y >= haltY - 1) {
      e.preventDefault();
      return;
    }
    // Rad und Tasten knapp darüber: ein Schritt über die Halte-Stelle endet
    // an ihr, statt erst dahinter und dann zurück (Probe-Lauf ruck WebKit).
    if (e.type !== 'touchmove' && y + schrittWeite(e, f.innerHeight) > haltY + 1) {
      e.preventDefault();
      f.scrollTo(0, haltY);
    }
  };
  // Was trotzdem nach unten durchrutscht (Schwung nach dem Loslassen,
  // Bildlaufleiste, ein nicht abbrechbarer Touch, ein Sprung): sofort zurück
  // auf die Halte-Stelle. Nur gegen eine Bewegung nach unten.
  let vorigY = f.scrollY;
  const klemme = () => {
    const y = f.scrollY;
    if (stand === 'wartet') {
      const fe = fenster();
      const ziel = fe ? fensterHalt({y, ...fe, vorher}) : null;
      vorher = Math.min(vorher, y);
      if (ziel !== null) halten(ziel);
    } else if (stand === 'hält' && y > haltY + 1 && y > vorigY) {
      schwungStopp();
      f.scrollTo(0, haltY);
    }
    vorigY = Math.min(y, f.scrollY);
  };

  const loesen = (grund) => {
    if (stand !== 'hält') return;
    stand = 'frei';
    figur.dataset.tapStopperStand = stand;
    figur.dataset.tapStopperGrund = grund;
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
    // Wer zurückgescrollt ist (Video pausiert oder wartet hinter der Szene
    // davor), lässt es nicht hängen.
    const amHalt = f.scrollY >= haltY - 2 && gezeigt();
    if (!amHalt) seitFortschritt = jetzt;
    // Der Deckel zählt nur Zeit AM Halt: wer hin und her scrollt, wartet
    // nicht das Video weg (Probe-Lauf ruck: frei nach 1,7 s Video).
    if (amHalt) amHaltMs += jetzt - vorigJetzt;
    vorigJetzt = jetzt;
    const frist = spielt()
      ? STILL_MS
      : video.dataset.tapWartetGeste
        ? ABGELEHNT_MS
        : gespielt > 0
          ? STILL_MS
          : START_MS;
    const grund =
      gespielt >= STOPPER_SEKUNDEN
        ? 'video'
        : jetzt - seitFortschritt > frist
          ? 'stockt'
          : amHaltMs > DECKEL_MS
            ? 'deckel'
            : '';
    if (grund) {
      loesen(grund);
      return;
    }
    takt = f.requestAnimationFrame(zählen);
  };

  function halten(ziel) {
    stand = 'hält';
    figur.dataset.tapStopperStand = stand;
    haltY = ziel;
    gespielt = 0;
    letzteZeit = video.currentTime;
    beginn = f.performance.now();
    seitFortschritt = beginn;
    vorigJetzt = beginn;
    amHaltMs = 0;
    schwungStopp();
    if (Math.abs(f.scrollY - haltY) > 1) f.scrollTo(0, haltY);
    vorigY = f.scrollY;
    takt = f.requestAnimationFrame(zählen);
  }

  // Ohne Fenster (Fassung ohne Kette): halten, wenn das laufende Video mittig
  // steht; nach einem schnellen Wisch sanft zurück zur Mitte.
  const pruefe = () => {
    if (stand !== 'wartet' || fenster()) return;
    const l = lage();
    if (!sollHalten({...l, spielt: spielt(), verbraucht: false})) return;
    const ziel = haltePunkt({y: f.scrollY, ...l});
    const weit = f.scrollY - ziel > 80;
    halten(f.scrollY);
    haltY = ziel;
    if (f.scrollY > haltY + 1) f.scrollTo({top: haltY, behavior: weit ? 'smooth' : 'auto'});
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
    f.clearTimeout(schwungAus);
    abbauen();
  };
}
