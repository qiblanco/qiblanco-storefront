/*
 * EINRASTEN AN JEDER EINHEIT (Qi Alpha A, Szenen-Kette). Christian 01.11.2026
 * (Job 20261101-prio1-qi-alpha-lp-sanfte-stopper-jede-einheit-scroll-snap),
 * wörtlich: „Stopper meine ich eben nicht wie beim Video, dass es wirklich
 * nicht weitergeht … dass man mit einer schnellen Wischbewegung nicht drüber
 * hinweg wischen kann“, „wenn ich jetzt einen ganz langen Wisch mache, dass er
 * auf jeden Fall da anhält und ich einen neuen Wisch ansetzen muss“.
 *
 * GEMESSEN VORHER (live 01.11., Chromium 412 x 915, echter Daumen-Schwung):
 * zwei Wische tragen über die ganze Seite, der erste bis zum Video (Titel,
 * Definition, Google AI überflogen), der zweite bis zum Schluss (alle drei
 * Kapitel samt Bildern und das Seitenband überflogen).
 *
 * WAS ES TUT: jede Einheit hat EINE Raststelle, dort, wo sie ganz dasteht
 * (alle Schritte ihrer Bühne an, die Bühne weicht noch nicht; Mitte dieses
 * Fensters). Die Definition und die Quellzeile „Google AI“ sind zwei Einheiten
 * ([data-tap-rast] am Schritt). Ein Wisch (ein Finger-Zug samt Schwung, eine
 * Folge von Rad-/Trackpad-Ereignissen ohne Pause, ein Tastendruck) kommt
 * höchstens bis zur nächsten Raststelle vor ihm; was er darüber hinaus trüge,
 * wird an der Raststelle angehalten. Der nächste Wisch geht frei bis zur
 * nächsten. Gehalten wird also nicht nach Zeit, sondern bis zum neuen Wisch.
 *  - Nur vorwärts. Zurück geht immer frei.
 *  - Zwischen zwei Raststellen ist alles frei, auch langsames Lesen.
 *  - Das Video hat keine Raststelle: dort hält wie bisher der Video-Stopper
 *    (the-alpha-stopper.js, unverändert). Solange er hält, tut dieses Modul
 *    nichts; es bremst nur Ereignisse, die er nicht schon abgefangen hat.
 *  - Ende/Pos1 springen ohne Halt (ausdrücklicher Sprung).
 *  - Ohne Bewegung (prefers-reduced-motion, ?film=still) gibt es keine Kette
 *    und kein Einrasten; ?rast=aus schaltet es für Prüfer ab (Gegenprobe).
 * SCHWUNG ANHALTEN wie beim Video-Stopper: am Touch-Gerät einen Augenblick
 * kein Überlauf (Attribut data-tap-rast-halt an <html>, CSS), dann wieder
 * frei. Bewusst ein eigenes Attribut statt des Inline-Stils „overflow“: der
 * Video-Stopper merkt sich den Inline-Wert und stellt ihn zurück; zwei
 * Schreiber am selben Feld könnten die Seite auf „hidden“ stehen lassen.
 * WARUM NICHT CSS scroll-snap (Recherche im Jobordner, recherche.md): Snap am
 * Seiten-Scroller rastet auf iOS beim Ein-/Ausblenden der Adressleiste neu
 * ein und bricht Scrolls ab (WebKit-Bug 245722), Chrome rastet auch
 * programmatische Sprünge ein (das träfe den Video-Stopper), und ob
 * scroll-snap-stop: always mit proximity überhaupt greift, ist nirgends
 * belegt. Apple selbst rastet auf den Produktseiten nur waagrechte Galerien
 * ein, die senkrechte Geschichte nie.
 */

const PAUSE_MS = 200;
const RUHE_MS = 400;
const HALT_MS = 120;
const VOR = new Set(['ArrowDown', 'PageDown', ' ', 'Spacebar']);

/** Erste Raststelle VOR der Lage y (abwärts), sonst null. */
export function naechsteRast(stellen, y) {
  for (const s of stellen) if (s > y + 2) return s;
  return null;
}

/** Raststellen einer Bühne der Szenen-Kette (Scroll-Pixel). `oben` = Lage der
 * Bühne im Dokument, `px` = ihr Scroll-Schritt, `schritte` = Zahl ihrer
 * Schritte, `start` = wie viele beim Stillstand schon da sind, `extra` =
 * Schritt-Nummern, die eine eigene Einheit sind (Raststelle davor). Gleiche
 * Rechnung wie useTapFilm: n = start + floor((1 - (oben - y)) / px). */
export function bühnenRast({oben, px, schritte, start, extra = [], max = Infinity}) {
  const offen = Math.max(0, schritte - start);
  const aus = [];
  for (const i of extra) {
    if (i >= start && i < schritte) aus.push(Math.round(oben - 1 + (i - start + 0.5) * px));
  }
  aus.push(Math.round(oben - 1 + (offen + 0.5) * px));
  return aus.map((s) => Math.min(s, max)).filter((s) => s > 0);
}

/** Beginnt mit diesem Rad-Ereignis ein neuer Wisch? Pause seit dem letzten. */
export function neuerRadWisch(jetzt, letztes) {
  return letztes === null || jetzt - letztes > PAUSE_MS;
}

/** Wie weit trägt ein Rad- oder Tastenschritt die Seite nach unten (px)? */
export function schritt(e, bild) {
  if (e.type === 'wheel') return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? bild : 1);
  if (e.key === 'ArrowDown') return 40;
  return bild * 0.9;
}

/** Bindet das Einrasten an die Seite. `stellen()` liefert die Raststellen
 * aufsteigend. Gibt die Aufräum-Funktion zurück. */
export function tapEinrasten(stellen, f = window) {
  const d = f.document;
  const html = d.documentElement;
  const grob = () => Boolean(f.matchMedia?.('(pointer: coarse)').matches);
  // Der Video-Stopper hält gerade: dann regelt er allein.
  const videoHaelt = () => Boolean(d.querySelector('[data-tap-stopper-stand="hält"]'));
  let geste = null;
  let finger = false;
  let letztesRad = null;
  let haltAus = 0;

  const neu = (art) => {
    geste = {art, rast: naechsteRast(stellen(), f.scrollY), zuletzt: f.performance.now(), gehalten: false};
    html.dataset.tapRastZiel = geste.rast === null ? '' : String(geste.rast);
  };
  const schwungStopp = () => {
    if (!grob() || haltAus) return;
    html.setAttribute('data-tap-rast-halt', '');
    haltAus = f.setTimeout(() => {
      html.removeAttribute('data-tap-rast-halt');
      haltAus = 0;
    }, HALT_MS);
  };
  const anhalten = () => {
    geste.gehalten = true;
    html.dataset.tapRastStand = String(geste.rast);
    schwungStopp();
    f.scrollTo(0, geste.rast);
  };
  // Ist der Wisch noch im Gang? Finger drauf, oder Bewegung/Eingabe vor kurzem.
  const lebt = () => geste && (finger || f.performance.now() - geste.zuletzt <= RUHE_MS);

  const beiTouchStart = () => {
    finger = true;
    neu('touch');
  };
  const beiTouchEnde = () => {
    finger = false;
    if (geste) geste.zuletzt = f.performance.now();
  };
  const beiTouchMove = (e) => {
    if (!geste || geste.rast === null || !e.cancelable || e.defaultPrevented) return;
    if (geste.gehalten && f.scrollY >= geste.rast - 1) e.preventDefault();
  };
  const beiRad = (e) => {
    const jetzt = f.performance.now();
    if (!geste || geste.art !== 'rad' || neuerRadWisch(jetzt, letztesRad)) neu('rad');
    letztesRad = jetzt;
    geste.zuletzt = jetzt;
    bremse(e);
  };
  const beiTaste = (e) => {
    if (e.key === 'End' || e.key === 'Home') {
      geste = null;
      return;
    }
    if (!VOR.has(e.key) || (e.key === ' ' && e.shiftKey)) return;
    const ziel = e.target;
    if (ziel && (ziel.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(ziel.tagName || ''))) return;
    if (!e.repeat || !geste || geste.art !== 'taste') neu('taste');
    geste.zuletzt = f.performance.now();
    bremse(e);
  };
  // Rad und Tasten: ein Schritt über die Raststelle endet an ihr.
  function bremse(e) {
    if (e.defaultPrevented || !e.cancelable || geste.rast === null || videoHaelt()) return;
    const w = schritt(e, f.innerHeight);
    if (!(w > 0)) return;
    const y = f.scrollY;
    if (y >= geste.rast - 1) {
      e.preventDefault();
      if (y > geste.rast + 1) f.scrollTo(0, geste.rast);
      return;
    }
    if (y + w > geste.rast + 1) {
      e.preventDefault();
      anhalten();
    }
  }
  // Was trotzdem darüber hinaus trägt (Daumen-Schwung, nicht abbrechbare
  // Ereignisse): zurück auf die Raststelle, solange derselbe Wisch läuft.
  const beiScroll = () => {
    if (!geste) return;
    if (!lebt()) {
      geste = null;
      return;
    }
    geste.zuletzt = f.performance.now();
    if (geste.rast === null || videoHaelt()) return;
    if (f.scrollY > geste.rast + 1) anhalten();
  };

  const ereignisse = [
    [f, 'touchstart', beiTouchStart, {passive: true, capture: true}],
    [f, 'touchend', beiTouchEnde, {passive: true, capture: true}],
    [f, 'touchcancel', beiTouchEnde, {passive: true, capture: true}],
    [f, 'touchmove', beiTouchMove, {passive: false, capture: true}],
    [f, 'wheel', beiRad, {passive: false, capture: true}],
    [f, 'keydown', beiTaste, {capture: true}],
    [f, 'scroll', beiScroll, {passive: true}],
  ];
  ereignisse.forEach(([z, t, h, o]) => z.addEventListener(t, h, o));
  html.dataset.tapRast = 'an';
  return () => {
    ereignisse.forEach(([z, t, h, o]) => z.removeEventListener(t, h, o));
    f.clearTimeout(haltAus);
    html.removeAttribute('data-tap-rast-halt');
    delete html.dataset.tapRast;
    delete html.dataset.tapRastZiel;
    delete html.dataset.tapRastStand;
  };
}
